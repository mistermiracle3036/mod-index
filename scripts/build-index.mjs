// Build site/data/index.json from mods/<Author>@<id>/meta.json.
//
// The output contract is not ours to invent: it is whatever
// src/mods/ModIndex.lua in the engine parses.  Every field emitted below is
// one that ModIndex.parseEntry / parseLatest actually reads, and
// schema_version is a hard gate on the consumer side -- an unknown version is
// refused outright rather than parsed hopefully, so it stays pinned to 1
// until the engine's ModIndex.SCHEMA_VERSION moves.
//
// Usage:
//   node scripts/build-index.mjs             # metadata only, no network
//   node scripts/build-index.mjs --releases  # also resolve each repo's latest release
//
// With --releases, GITHUB_TOKEN lifts the 60/hour anonymous rate limit.
// Release lookup failures are recorded per-entry in `update_check` rather
// than failing the build: one repo being unreachable must not empty the feed.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODS_DIR = join(ROOT, 'mods');
const SITE_DATA = join(ROOT, 'site', 'data');
const SCHEMA_VERSION = 1;

const withReleases = process.argv.includes('--releases');

// Category vocabulary the launcher's filter row renders.  Feed order is the
// order the filter chips appear in; ModIndex.categoriesIn drops any that no
// entry actually uses, so listing all of them here is safe.
const CATEGORY_ORDER = [
  'GAMEPLAY', 'CONTENT', 'BALANCE', 'ART', 'AUDIO', 'UI', 'QOL',
  'TRANSLATION', 'TOTAL_CONVERSION', 'LIBRARY', 'TOOL', 'OTHER',
];

// ---------- release resolution

async function gh(path) {
  const headers = {
    'accept': 'application/vnd.github+json',
    'user-agent': 'mistermiracle3036-mod-index',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
}

// Pick the .zip that belongs to THIS mod.
//
// Load-bearing for shop_events / example_balls: they share one repository, so
// every release carries two zips.  Handing an entry the first .zip it finds
// would install the other mod under this mod's name -- the installer would
// then reject it for an id mismatch, which reads to a player as "the index is
// broken".  Match on the release-asset naming the mods actually use
// (<id>-<version>.zip), and refuse to guess when nothing matches.
export function pickAsset(assets, id) {
  const zips = (assets || []).filter((a) => a.name.toLowerCase().endsWith('.zip'));
  if (zips.length === 0) return null;

  const exact = zips.find((a) => a.name === `${id}.zip`);
  if (exact) return exact;

  const prefixed = zips.filter((a) => a.name.startsWith(`${id}-`));
  if (prefixed.length === 1) return prefixed[0];
  if (prefixed.length > 1) {
    // Deterministic tie-break; should not happen with one zip per id.
    return [...prefixed].sort((a, b) => a.name.localeCompare(b.name)).pop();
  }

  // A single-mod repo may name its zip anything at all.  A multi-zip release
  // with no id match is ambiguous, and guessing is exactly the failure this
  // function exists to prevent.
  return zips.length === 1 ? zips[0] : null;
}

// Newest usable release: drafts never count, and a prerelease is only chosen
// when there is no stable release at all (it is flagged so the card can say
// so).  fixed_release_tag pins the entry instead of tracking.
function pickRelease(releases, meta) {
  const usable = (releases || []).filter((r) => !r.draft);
  if (meta.fixed_release_tag) {
    return usable.find((r) => r.tag_name === meta.fixed_release_tag) || null;
  }
  return usable.find((r) => !r.prerelease) || usable[0] || null;
}

async function resolveReleases(meta, entry) {
  if (!meta.github) {
    entry.update_check = meta.downloadURL ? 'off' : 'no github repo';
    return;
  }
  if (meta.automatic_version_check === false && !meta.fixed_release_tag) {
    entry.update_check = 'off';
    return;
  }

  let releases;
  try {
    releases = await gh(`/repos/${meta.github}/releases?per_page=100`);
  } catch (err) {
    // Recorded, not thrown: ModIndex.installUrl surfaces an "error..." string
    // to the player and still falls back to downloadURL when one is listed.
    entry.update_check = `error: ${err.message}`;
    return;
  }

  const release = pickRelease(releases, meta);
  if (!release) {
    entry.update_check = 'no installable release';
    return;
  }

  const asset = pickAsset(release.assets, meta.id);
  if (!asset) {
    entry.update_check = 'no installable release';
    return;
  }

  entry.latest = {
    version: (release.tag_name || '').replace(/^v/, '') || meta.version,
    tag: release.tag_name,
    name: release.name || release.tag_name,
    prerelease: release.prerelease === true,
    published_at: release.published_at,
    zip: {
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
    },
  };
  entry.update_check = 'ok';

  // Stats count only THIS mod's asset, so the shared Shop-Tools repo does not
  // report each mod's downloads as the sum of both.
  const mine = releases
    .filter((r) => !r.draft)
    .map((r) => ({ r, a: pickAsset(r.assets, meta.id) }))
    .filter((x) => x.a);
  if (mine.length) {
    entry.downloads = mine.reduce((n, x) => n + (x.a.download_count || 0), 0);
    const dates = mine.map((x) => x.r.published_at).filter(Boolean).sort();
    entry.first_release = dates[0];
    entry.last_release = dates[dates.length - 1];
  }
}

// ---------- entry assembly

function buildEntry(folder) {
  const dir = join(MODS_DIR, folder);
  const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));

  const entry = {
    folder,
    id: meta.id,
    title: meta.title || meta.id,
    author: meta.author,
    version: meta.version,
    summary: meta.summary || '',
    categories: meta.categories || [],
    tags: meta.tags || [],
    repo: meta.repo,
    github: meta.github,
    api: meta.api,
    game_version: meta.game_version,
    profile: meta.profile,
    affects_link: meta.affects_link === true,
    experimental: meta.experimental === true,
    permissions: meta.permissions || [],
    dependencies: meta.dependencies || [],
    conflicts: meta.conflicts || [],
    update_check: 'pending',
  };
  if (meta.license) entry.license = meta.license;
  if (meta.downloadURL) entry.downloadURL = meta.downloadURL;

  // Description and thumbnail are copied into the Pages artifact and
  // referenced by paths relative to the Pages root, which is what
  // ModIndex.joinUrl resolves them against.
  if (existsSync(join(dir, 'description.md'))) {
    mkdirSync(join(SITE_DATA, 'desc'), { recursive: true });
    copyFileSync(join(dir, 'description.md'), join(SITE_DATA, 'desc', `${meta.id}.md`));
    entry.description_url = `data/desc/${meta.id}.md`;
  }
  for (const ext of ['png', 'jpg']) {
    const thumb = join(dir, `thumbnail.${ext}`);
    if (existsSync(thumb)) {
      mkdirSync(join(SITE_DATA, 'thumb'), { recursive: true });
      copyFileSync(thumb, join(SITE_DATA, 'thumb', `${meta.id}.${ext}`));
      entry.thumbnail = `data/thumb/${meta.id}.${ext}`;
      break;
    }
  }

  return entry;
}

async function main() {
  const folders = readdirSync(MODS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  // Rebuilt rather than merged: a mod folder that goes away must take its
  // copied description with it instead of lingering in the artifact.
  for (const sub of ['desc', 'thumb']) {
    rmSync(join(SITE_DATA, sub), { recursive: true, force: true });
  }
  mkdirSync(SITE_DATA, { recursive: true });

  const mods = folders.map(buildEntry);

  if (withReleases) {
    for (const entry of mods) {
      const meta = JSON.parse(readFileSync(join(MODS_DIR, entry.folder, 'meta.json'), 'utf8'));
      await resolveReleases(meta, entry);
      console.log(`  ${entry.id.padEnd(16)} ${entry.update_check}${entry.latest ? ` ${entry.latest.version} (${entry.latest.zip.name})` : ''}`);
    }
  }

  // Sorted by title: the launcher preserves feed order inside a filter, so
  // the feed is where the ordering decision belongs.
  mods.sort((a, b) => a.title.localeCompare(b.title));

  const used = new Set(mods.flatMap((m) => m.categories));
  const doc = {
    schema_version: SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    count: mods.length,
    categories: CATEGORY_ORDER.filter((c) => used.has(c)),
    mods,
  };

  writeFileSync(join(SITE_DATA, 'index.json'), JSON.stringify(doc, null, 2) + '\n');
  console.log(`\nwrote site/data/index.json - ${mods.length} mod(s)`);
}

if (process.argv[1] && process.argv[1].endsWith('build-index.mjs')) {
  await main();
}
