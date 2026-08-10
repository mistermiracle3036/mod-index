// Assert site/data/index.json against the gates the engine's consumer applies.
//
// This mirrors src/mods/ModIndex.lua (engine 0.1.75) deliberately and by hand:
// every check below cites the function it comes from, so when the engine's
// ModIndex changes this file is the thing to re-read against it.  It is a
// mirror, not the parser itself -- the authoritative test is still installing
// from the feed in the launcher.
//
//   node scripts/check-feed.mjs
//
// Exits non-zero with a list of problems, so CI can gate a deploy on it.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEED = join(ROOT, 'site', 'data', 'index.json');

// ModIndex.SCHEMA_VERSION.  A hard gate on the consumer side: a feed whose
// schema_version is anything else is refused outright, not parsed hopefully.
const SCHEMA_VERSION = 1;

// The enum the index site and upstream schema agree on.
const CATEGORIES = new Set([
  'GAMEPLAY', 'CONTENT', 'BALANCE', 'ART', 'AUDIO', 'UI', 'QOL',
  'TRANSLATION', 'TOTAL_CONVERSION', 'LIBRARY', 'TOOL', 'OTHER',
]);

const problems = [];
const note = (m) => problems.push(m);

let doc;
try {
  doc = JSON.parse(readFileSync(FEED, 'utf8'));
} catch (err) {
  console.error(`index.json is not readable JSON: ${err.message}`);
  process.exit(1);
}

// --- ModIndex.parse
if (typeof doc.schema_version !== 'number') {
  note('schema_version is missing or not a number (ModIndex.parse refuses the feed)');
} else if (doc.schema_version !== SCHEMA_VERSION) {
  note(`schema_version is ${doc.schema_version}; the engine reads ${SCHEMA_VERSION}`);
}
if (!Array.isArray(doc.mods)) {
  note('mods is not an array (ModIndex.parse refuses the feed)');
  console.error(problems.join('\n'));
  process.exit(1);
}

const seen = new Set();
for (const m of doc.mods) {
  const where = m.id || m.folder || '<unnamed>';

  // parseEntry drops any entry without a string id -- silently, so a typo
  // here is a mod that simply never appears in the browser.
  if (typeof m.id !== 'string' || m.id === '') {
    note(`${where}: id must be a non-empty string, or parseEntry drops the entry entirely`);
    continue;
  }
  if (seen.has(m.id)) note(`${m.id}: listed more than once`);
  seen.add(m.id);

  // ModIndex.installUrl: what makes an entry actually installable.
  const installable =
    (m.update_check === 'ok' && m.latest && m.latest.zip && typeof m.latest.zip.url === 'string') ||
    (typeof m.downloadURL === 'string' && m.downloadURL !== '');
  if (!installable) {
    note(`${m.id}: nothing installable - update_check="${m.update_check}" and no downloadURL`);
  }

  // The failure this feed exists to avoid: an entry pointing at another mod's
  // zip.  shop_events and example_balls share a repo, so every release carries
  // both archives and a mismatched pick installs the wrong mod.
  if (m.latest?.zip?.name && !m.latest.zip.name.startsWith(m.id)) {
    note(`${m.id}: release asset "${m.latest.zip.name}" does not belong to this mod`);
  }

  // compatIssues reads these; a wrong type is a warning that never fires.
  if (m.api !== undefined && typeof m.api !== 'number') {
    note(`${m.id}: api must be a number`);
  }
  if (m.permissions !== undefined && !Array.isArray(m.permissions)) {
    note(`${m.id}: permissions must be an array`);
  }
  for (const c of m.categories || []) {
    if (!CATEGORIES.has(c)) note(`${m.id}: unknown category "${c}"`);
  }

  // joinUrl resolves these against the Pages root; an absolute URL is fine,
  // a leading slash is not what it expects.
  for (const field of ['thumbnail', 'description_url']) {
    const v = m[field];
    if (v !== undefined && (typeof v !== 'string' || v.startsWith('/'))) {
      note(`${m.id}: ${field} must be a relative path or an absolute http(s) URL`);
    }
  }
}

if (problems.length) {
  console.error(`index.json has ${problems.length} problem(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`index.json OK - ${doc.mods.length} mod(s), schema ${doc.schema_version}, all installable`);
