Four new balls for gen1recomp, each one written to demonstrate a
**different mod-API pattern** -- so it works as a playable ball pack and as
a template you can copy.

| Ball | Pattern it demonstrates |
| ---- | ----------------------- |
| Premier | Reacting to a `shop.purchased` event; free when you buy 10+ of a ball at once. No catch code at all. |
| Nest | A catch-rate multiplier computed from live battle state. |
| Moon | Querying the engine's species data. |
| Heal | Handling the `pokemon.caught` event. |

## Requires

**Shop Events** must be installed and enabled -- Premier's behaviour is
built on it.

Optional: **Pokeball Colors** and Custom Poke Balls. When Pokeball Colors
is installed, all four balls register their canon colors automatically;
neither mod requires it.

> Development preview -- in active development. Bug reports and ideas are
> welcome in the repo's Issues; say which mod, include the version from
> your load log, and list your other mods.

## Note on releases

Example Balls and shop_events share one repository and release together,
so **both are retagged and re-zipped to the same version** even when only
one of them changed.
