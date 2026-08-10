A **library mod** for other mod authors. It emits a `shop.purchased`
event whenever the player buys something at a mart -- the engine has no
purchase event of its own.

By itself it does nothing visible. Install it because something else needs
it, or because you are writing a mod that wants to react to purchases.

## Why it exists

Mart purchases are handled inside the shop menu with no hook for mods. A
mod that wants to react to buying -- a loyalty bonus, a quest trigger, a
bulk discount -- otherwise has to wrap the shop flow itself, and two mods
doing that at once conflict. shop_events does the wrapping once so
everyone else can subscribe.

**Example Balls** is the reference consumer: its Premier Ball is handed
over free when you buy ten or more of a ball at once, driven entirely by
this event.

> Development preview -- in active development. Bug reports and ideas are
> welcome in the repo's Issues; say which mod, include the version from
> your load log, and list your other mods.

## Note on releases

shop_events and Example Balls share one repository and release together,
so **both are retagged and re-zipped to the same version** even when only
one of them changed.
