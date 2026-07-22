# Japanese battle log localization

`play.pokemonshowdown.com/src/battle-text-ja.js` localizes the rendered battle narration without changing the battle protocol or simulator state.

## Display path

The client continues to receive canonical protocol commands such as:

```text
|move|p1a: Pikachu|Thunderbolt|p2a: Charizard
|-supereffective|p2a: Charizard
|-crit|p2a: Charizard
|-status|p2a: Charizard|brn
```

`BattleTextParser` parses those commands exactly as before. After `/data/text.js` has loaded, the Japanese display script replaces presentation templates in the client-side `BattleText` table and wraps `parseArgsInner` only to translate names already present in the rendered string.

## Template inventory

The first Japanese narration pass covers the common templates used by the following command families:

| Category | Representative protocol commands or templates |
| --- | --- |
| Battle flow | `start`, `turn`, `win`, `tie` |
| Switching and fainting | `switch`, `switchout`, `drag`, `faint`, `swap` |
| Move narration | `move`, `cant`, `fail`, hit count, miss, immunity |
| Damage results | `-supereffective`, `-resisted`, `-crit`, one-hit KO |
| Status conditions | burn, freeze, paralysis, poison, toxic poison, sleep, confusion, flinch |
| Weather | sun, rain, sandstorm, hail, snow and primal weather |
| Terrain and rooms | Electric, Grassy, Misty and Psychic Terrain; Trick, Magic and Wonder Room |
| Stat changes | boosts, drops, copying, swapping, clearing and inversion |
| Resources | damage, percentage damage, healing, recoil, items and ability activation |
| Transformations | Mega Evolution, Primal Reversion, Z-Power, Dynamax and Terastallization |

The runtime exposes `window.PSJapaneseBattleText` with the installed namespace and template counts for diagnostics.

## Display names

Rendered species, move, ability and item names are translated through the existing `window.PSDisplayNames` API. Unknown names and nicknames fall back to their original text.

## Numeric invariants

The Japanese templates retain the original placeholders, including:

- `[NUMBER]` for turn and hit counts
- `[PERCENTAGE]` for percentage damage

The parser supplies the original numeric strings unchanged.

## Protected boundaries

This work does not change:

- server `data/` or `sim/`
- normalized IDs
- `|move|`, `|-supereffective|`, `|-crit|`, `|-status|` or any other protocol command
- `/choose`, `/team` or Team Import/Export
- request JSON, move indexes or switch indexes
- foul-play input
- Rust `poke-engine` input or state

`parseArgsInner` receives the original `args` and `kwArgs`. The wrapper reads them and transforms only the returned display string.

## Validation

`test/battle-text-japanese.js` verifies representative Japanese output for move use, super-effective damage, critical hits, burn, rain, switching, fainting and turn numbering. It also verifies that protocol arguments and numeric fields are not mutated.
