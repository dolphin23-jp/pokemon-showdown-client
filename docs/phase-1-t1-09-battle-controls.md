# Phase 1 T1-09: Japanese battle choice controls

T1-09 is the first task that applies the generated Japanese display-name maps to interactive client UI.

## Scope

The compiled `battle-display-names.js` bundle localizes the visible direct text node of:

- `button.movebutton`
- switch buttons identified by `switchpokemon|` tooltips
- ally buttons identified by `allypokemon|` tooltips
- active target buttons identified by `activepokemon|` tooltips

Move buttons use `displayMoveName(...)`. Pokémon buttons use `displaySpeciesName(...)` when their visible label resolves to a canonical species. Nicknames and unknown labels remain unchanged.

The observer covers controls rendered after initial page load and controls whose text is replaced during a Preact update.

## Deliberately unchanged

Only rendered text nodes are modified.

- `data-cmd` remains `/move <index>`, `/switch <index>`, or the existing target command
- `data-tooltip` remains canonical English
- request JSON remains unchanged
- move and switch indexes remain unchanged
- normalized IDs remain unchanged
- WebSocket output remains unchanged
- `/choose`, `/team`, and Team Import/Export remain unchanged
- foul-play and Rust `poke-engine` inputs remain unchanged

The generated tables remain under `window.BattleJapaneseDisplayNames`, and `window.PSDisplayNames` remains the four-function display API introduced by T1-07.

## Fallback behavior

A missing generated entry returns the canonical English Dex name. A nickname that does not resolve as a species remains exactly as entered. Empty battle slots are not translated.

## Validation

The dedicated display-name test verifies that:

- a move button changes `Thunderbolt` to `10まんボルト`
- a species button changes `Pikachu` to `ピカチュウ`
- a nickname remains unchanged
- `data-cmd` and `data-tooltip` remain unchanged
- the observer is installed with child-list, subtree, and character-data coverage

The complete client test suite, TypeScript check, ESLint, generated-map verification, and entry-page bundle checks remain mandatory.
