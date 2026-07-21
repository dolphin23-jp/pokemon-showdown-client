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

## Battle choice controls

Phase 1 T1-09 applies the generated names to the visible text of battle choice buttons:

- ordinary, Z-Move, Max Move, and G-Max move buttons use Japanese move names when available
- switch, team-preview, ally, and active-target buttons use Japanese species names when the visible text is a canonical species name
- nicknames and names absent from the generated source remain unchanged

The integration observes the battle controls after Preact renders them and replaces only the direct visible text node. It does not change `data-cmd`, `data-tooltip`, request JSON, move indexes, switch indexes, or any other attribute used to construct a choice. Re-renders and dynamically inserted controls are covered by a narrowly scoped `MutationObserver`.

These helpers, generated maps, and battle-control substitutions are intentionally one-way display functions. They must not be used to construct WebSocket messages, `/choose`, `/team`, team Import/Export text, foul-play input, or Rust `poke-engine` input. The normalized ID and the original Dex object remain unchanged. Species forms or other entries absent from the generated source continue to fall back to the canonical English Dex name.
