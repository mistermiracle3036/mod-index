A tiny dev tool for gen1recomp **mod authors**. Talk to any NPC and it
shows the two strings you need to take over their dialogue: the map id and
the `TEXT_` constant. Press A and the NPC then says whatever they normally
say, completely untouched.

> This is a development tool, not a gameplay mod. Install it while you are
> building something, then toggle it off (or uninstall) to play normally.

## Why you want this

In gen1recomp there is no NPC registry -- the way you add dialogue is to
take over an existing NPC's `TEXT_` constant on their map:

```lua
mod.content.map_scripts:register("PEWTER_NIDORAN_HOUSE", {
  talk = { TEXT_PEWTERNIDORANHOUSE_MIDDLE_AGED_MAN = MY_SCRIPT },
  priority = 500,
})
```

Those constants are extracted from the ROM at load time, so they are not
greppable in the engine repo. Only the handful of maps with hand-ported
scripts name them in source at all.

Worse, guessing them from the pokered disassembly fails in the way that
hurts most: some objects are renamed between Red/Blue and Yellow. The
Celadon Game Corner coin-giver is `TEXT_GAMECORNER_CLERK2` in Red/Blue but
`TEXT_GAMECORNER_MIDDLE_AGED_MAN2` in Yellow. Register the wrong one and
your mod does nothing at all -- no error, no warning, just vanilla
dialogue.

## Options

**Show NPC ids** (default on) switches the overlay off without
uninstalling.
