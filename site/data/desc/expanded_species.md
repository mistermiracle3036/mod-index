**Pokemon GOLD only.** This mod does not load on Red, Blue or Yellow — it is
skipped silently on those games.

**It adds no Pokemon by itself.** Expanded Species is the framework that species
packs are built on. Install it, then install a pack that declares it as a
dependency — the pack supplies the Pokemon. If you install this on its own and
nothing appears to happen, that is working correctly.

Gold's species table stops at #255. Expanded Species goes past it, and brings
the rest of the game along with it.

## What packs built on it can do

- **Custom species above #255** with their own sprites, icons, cries, palettes
  and Pokedex entries.
- **Wild encounters that add to a route instead of replacing it** — grass,
  surfing, all three fishing rods, swarm-only rows, and the Bug-Catching
  Contest. A route's vanilla species and its base encounter rate are left alone.
- **Custom Pokemon inside existing Gold trainers**, without disturbing that
  trainer's NPC, dialogue, defeated flag, rematches, music or rewards.
- **Gifts, stationary encounters, custom trainers and NPC trades** — all
  one-time and save-aware.
- **Per-individual named forms** that survive evolution, trading, egg hatching
  and save/reload.

## If a species pack goes missing

This is the part worth knowing about. If a pack is disabled, removed, or fails
to load, the Pokemon that came from it are **not lost and do not corrupt your
save**. They are moved into private framework storage — invisible and
uneditable — and restored to their original party, box, Day-Care or pending-egg
slot when the pack comes back.

If your party is full when a Pokemon is restored, it goes to a PC box rather
than displacing anything. Party MAIL is preserved and waits for a free party
slot, because Gold has no legal way to box a Pokemon holding MAIL.

## Compatibility

Requires gen1recomp **0.1.94 or newer**. Two independent packs can add to the
same trainer without conflicting, and a genuine conflict is reported as a
diagnostic rather than silently resolved by load order.

## For mod authors

`AUTHOR_API.md` in the repo documents the full provider API, every capability
name, and a pack testing checklist. Request features by **capability** rather
than by version number — the exported `api_version` stays `1` for the whole
current contract, and new features arrive as named capabilities.
