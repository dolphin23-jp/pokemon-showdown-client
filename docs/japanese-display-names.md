# Japanese display-name API

This fork exposes a display-only boundary for localized Pokémon names.

The browser global `window.PSDisplayNames` provides:

- `displaySpeciesName(...)`
- `displayMoveName(...)`
- `displayAbilityName(...)`
- `displayItemName(...)`

Each helper resolves its input through the client `Dex`, looks up a Japanese string by the normalized ID, and returns the canonical English name when no translation is registered.

## Generated name maps

`npm run build` compiles the display-name API and then runs `build-tools/generate-japanese-display-names.js`. The generator reads the Japanese names from the immutable PokeAPI data revision `PokeAPI/pokeapi@227b573712414a86ba299d322fa398fbb2893edc`, using language ID 11. It joins each localized name to the matching English source identifier, normalizes that identifier with the same lowercase alphanumeric ID rule used by the client, and embeds four frozen maps into the compiled `battle-display-names.js` bundle:

- `species`
- `moves`
- `abilities`
- `items`

The generated metadata is written beside the bundle as `battle-display-names.meta.json`. Generation fails if any table drops below its recorded minimum size, if two source identifiers collide after normalization with different Japanese strings, or if the fixed source cannot be fetched.

The generated maps are build artifacts and are not edited by hand. To update them, pin a new full source commit in both the generator and `config/japanese-display-name-api.json`, rebuild, review the count changes, and run the complete test suite.

These helpers and generated maps are intentionally one-way display functions. They must not be used to construct WebSocket messages, `/choose`, `/team`, team Import/Export text, foul-play input, or Rust `poke-engine` input. The normalized ID and the original Dex object remain unchanged. Species forms or other entries absent from the generated source continue to fall back to the canonical English Dex name.
