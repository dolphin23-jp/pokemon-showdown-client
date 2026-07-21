# Japanese display-name API

This fork exposes a display-only boundary for localized Pokémon names.

The browser global `window.PSDisplayNames` provides:

- `displaySpeciesName(...)`
- `displayMoveName(...)`
- `displayAbilityName(...)`
- `displayItemName(...)`

Each helper resolves its input through the client `Dex`, looks up an optional Japanese string by the normalized ID, and returns the canonical English name when no translation is registered.

Generated data will be supplied later through `window.BattleJapaneseDisplayNames` with four optional maps: `species`, `moves`, `abilities`, and `items`.

These helpers are intentionally one-way display functions. They must not be used to construct WebSocket messages, `/choose`, `/team`, team Import/Export text, foul-play input, or Rust `poke-engine` input. The normalized ID and the original Dex object remain unchanged.
