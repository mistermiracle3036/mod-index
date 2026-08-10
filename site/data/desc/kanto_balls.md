Seven new Poke Balls for Kanto, sold across the region's marts.

This mod is also meant to be **read**. Each ball is one self-contained
pattern, commented with the engine file and line it was verified against,
so it can be copied into your own mod and changed.

| Ball | Where it comes from | What it does |
| ---- | ------------------- | ------------ |
| Premier | Free — buy 10+ balls in one purchase at any mart | Catches like a Poke Ball. The clerk announces it in their own text box. |
| Nest | Ball marts | Better against low-level Pokemon; the bonus fades as they level. |
| Moon | Pewter Mart, before Mt. Moon | Better against anything that evolves by Moon Stone. |
| Heal | Ball marts | The Pokemon you catch arrives fully healed — HP, status and PP. |
| Fast | Ball marts | 4x against fast Pokemon (base speed 100 or more). |
| Mirror | Ball marts | 4x when the wild Pokemon is the same species as your active one. |
| Silph | Saffron Mart | Silph Co's abandoned first pass at the Master Ball. When it works it *is* a Master Ball. One throw in two, it simply breaks. |

## Requires

**Shop Events** must be installed and enabled — the Premier Ball's bonus
is built on it.

Optional: **Pokeball Colors**, which gives each ball its own colour during
the throw. Nothing here requires it.

## For mod authors

The seven balls deliberately cover seven different techniques: no catch
code at all, reacting to another mod's event, multiplying the rate from
battle state, querying species data, reading your own side of the battle,
reading base stats, and replacing the catch roll outright. Between them
they demonstrate most of what the ball API can do.

## Note on the name

This mod was called **Example Balls** (`example_balls`) until 0.2.0. A mod
id cannot be redirected, so the old listing remains separately and is
frozen at its final version. If you have Example Balls installed, remove
it before installing this — they register overlapping balls, and the
launcher will warn you.

> Development preview -- in active development. Bug reports and ideas are
> welcome in the repo's Issues; say which mod, include the version from
> your load log, and list your other mods.
