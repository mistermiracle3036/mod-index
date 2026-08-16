# Mister Miracle's gen1recomp mod index

A [mod index](https://github.com/bryanthaboi/gen1recomp) feed for
**gen1recomp** listing my mods. Add it once in the launcher and every mod
below is installable from **Find Mods**, and updates as I tag releases.

**Browse:** <https://mistermiracle3036.github.io/mod-index/>

## Add it in the game

1. Open the mod manager and go to **Find Mods**.
2. Choose **Add index**.
3. Paste `mistermiracle3036/mod-index`

The launcher accepts any of these and resolves them to the same feed: the
`owner/repo` above, the browse URL, or the feed URL itself.

| | |
| --- | --- |
| Feed | `https://mistermiracle3036.github.io/mod-index/data/index.json` |
| Fallback | `https://raw.githubusercontent.com/mistermiracle3036/mod-index/main/site/data/index.json` |

Adding an index is a deliberate act of trust — the launcher ships with
none and asks. A listing here buys a mod no privilege it would not have
from **Import mod .zip**: every install goes through the same path and the
same manifest checks.

## What's listed

| Mod | What it does |
| --- | --- |
| **Pokemon Snag** | Steal Pokemon from trainers with the Snag Ball. Requires Quest System. |
| **Ribbons** | Eighteen per-Pokemon ribbons, awarded automatically, shown in the status screen. Red/Blue/Yellow and Gold. |
| **Kanto Contests** | *Alpha.* Ruby/Sapphire-style Contests in Celadon, scored on each move's contest category. |
| **Pokeball Colors** | Per-ball colors for the battle ball toss under ADVANCED color mode. |
| **Shop Events** | Library mod: emits `shop.purchased` at marts. |
| **Kanto Balls** | Seven new Poke Balls, each written as a readable template for your own. Requires Shop Events. |
| **NPC Inspector** | Dev tool: shows the map id and `TEXT_` constant of any NPC you talk to. |
| **Example Balls** | *Superseded by Kanto Balls.* Listed and frozen at 0.1.5 so existing installs still resolve. |

## How the feed is built

`mods/<Author>@<id>/meta.json` is the source of truth. A GitHub Action
runs [`scripts/build-index.mjs`](scripts/build-index.mjs) on every push and
nightly, which reads each mod repo's Releases and writes
`site/data/index.json`.

**Version bumps need no edit here.** Tag a release in the mod's own repo
and the nightly job picks it up. Edit `meta.json` only to change the
listing itself — summary, categories, tags, a moved repo.

```sh
node scripts/build-index.mjs --releases   # build the feed (GITHUB_TOKEN lifts the rate limit)
node scripts/check-feed.mjs               # assert it against the engine's contract
```

`check-feed.mjs` mirrors the gates in the engine's `src/mods/ModIndex.lua`
by hand — including the one that matters most here: **shop_events and
example_balls share one repository**, so every release carries two zips,
and an entry must resolve to its own archive rather than whichever zip
came first.

## Schema

`schema_version` is `1`, matching `ModIndex.SCHEMA_VERSION` in the engine.
The consumer treats it as a hard gate: an unrecognised version is refused
outright rather than parsed hopefully, so it moves only when the engine's
does.

Entry fields follow the same vocabulary as the
[official index](https://github.com/bryanthaboi/gen1recomp-mod-index), so
an entry here can be submitted there unchanged.
