Ruby/Sapphire-style Pokemon Contests, rebuilt for Kanto on gen1recomp.

Talk to the little girl in **Celadon City** and she'll show you the way to
the new Contest Hall. Inside, the judge runs a COOL contest: you have five
appeals to fill his meter, and every move is scored on its **contest
category** rather than its damage.

> **ALPHA / proof of concept.** One contest type, one hall, one judge. It
> is playable and it is stable, but it is a fraction of what Contests
> should be, and things will change between versions. Feedback and bug
> reports are the point of releasing it this early -- especially "that
> move is in the wrong category".

## How a contest works

Each of your POKeMON's moves has a contest category -- COOL, BEAUTY,
CUTE, SMART or TOUGH -- shown in place of the type when you pick a move.

- **Matches the contest** -- a perfect appeal, fills a quarter of the meter.
- **Neither matching nor clashing** -- still works, fills a tenth.
- **One of the contest's two clashing categories** -- nothing, and the
  judge frowns.

Fill the meter within five appeals to win. Run out and the judge shakes
his head: no blackout, no penalty. RUN withdraws you from the stage at any
time.

It is a performance, not a fight -- no accuracy rolls, no type chart, no
side effects (GROWL lowers nothing), no EXP, and no switching or items
mid-routine. One POKeMON, one routine.

## What is not in yet

Only the COOL contest. No PokeSnacks, no condition, no ranks, and the
contest HUD is drawn for the classic battle layout only.

## With Kanto Ribbons

Optional. With **Kanto Ribbons 0.18.0+** installed, a COOL win earns that
POKeMON a **Cool Ribbon**. Without it, contests play exactly the same and
the judge never mentions ribbons.

The win is recorded on the POKeMON itself either way, so installing Kanto
Ribbons later still awards ribbons for contests you have already won.
