# Japanese Teambuilder display

The Teambuilder uses the existing `PSDisplayNames` helpers for display-only Japanese names.

## Localized display surfaces

- Species, move, ability, and item fields while they are not being edited
- Species, move, ability, and item names in Teambuilder search results
- Fixed Teambuilder buttons, labels, menu text, placeholders, and accessibility labels

## Protected boundaries

The localization layer does not change:

- normalized IDs
- `Dex` entries
- `data-entry` values used by search selection
- packed teams or local team storage
- the team Import/Export textarea value or its English text format

Form inputs keep their canonical English value outside the visible presentation layer. The English value is restored before the Teambuilder handles focus, editing, validation, or saving, then the Japanese display name is reapplied after focus leaves.

## Verification

`test/display-names.js` verifies that:

- the four display-name helpers still fall back to canonical English
- battle controls retain their commands and tooltips
- Teambuilder fields and search-result labels display Japanese
- search-result `data-entry` values stay canonical English
- the Import/Export textarea stays canonical English
- focus restores English before editing and Japanese after editing

The server integration workflow adds one Pokémon through the real client TeamEditor, captures the Japanese form, opens Import/Export, and confirms the exported text remains English.
