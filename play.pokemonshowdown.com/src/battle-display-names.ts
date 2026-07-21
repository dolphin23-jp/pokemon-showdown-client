import { Dex } from './battle-dex';
import type { Ability, Item, Move, Species } from './battle-dex-data';

export interface JapaneseDisplayNameTables {
	readonly species?: Readonly<Record<string, string>>;
	readonly moves?: Readonly<Record<string, string>>;
	readonly abilities?: Readonly<Record<string, string>>;
	readonly items?: Readonly<Record<string, string>>;
}

export interface DisplayNameAPI {
	displaySpeciesName(nameOrSpecies: string | Species | null | undefined): string;
	displayMoveName(nameOrMove: string | Move | null | undefined): string;
	displayAbilityName(nameOrAbility: string | Ability | null | undefined): string;
	displayItemName(nameOrItem: string | Item | null | undefined): string;
}

type NamedDexEntry = Readonly<{ id: string, name: string }>;
type DisplayNameTableKey = keyof JapaneseDisplayNameTables;

type DisplayNameWindow = Window & {
	BattleJapaneseDisplayNames?: JapaneseDisplayNameTables;
	PSDisplayNames?: DisplayNameAPI;
};

const displayNameWindow = window as DisplayNameWindow;

function displayName(entry: NamedDexEntry, tableKey: DisplayNameTableKey): string {
	const translatedName = displayNameWindow.BattleJapaneseDisplayNames?.[tableKey]?.[entry.id];
	return translatedName || entry.name;
}

/**
 * Returns a display-only species name.
 *
 * The argument is resolved through Dex to recover the canonical English name,
 * then an optional Japanese display map is consulted by normalized ID. Neither
 * the input nor the resolved Dex object is modified.
 */
export function displaySpeciesName(nameOrSpecies: string | Species | null | undefined): string {
	return displayName(Dex.species.get(nameOrSpecies), 'species');
}

/** Display-only equivalent of Dex.moves.get(...).name. */
export function displayMoveName(nameOrMove: string | Move | null | undefined): string {
	return displayName(Dex.moves.get(nameOrMove), 'moves');
}

/** Display-only equivalent of Dex.abilities.get(...).name. */
export function displayAbilityName(nameOrAbility: string | Ability | null | undefined): string {
	return displayName(Dex.abilities.get(nameOrAbility), 'abilities');
}

/** Display-only equivalent of Dex.items.get(...).name. */
export function displayItemName(nameOrItem: string | Item | null | undefined): string {
	return displayName(Dex.items.get(nameOrItem), 'items');
}

export const PSDisplayNames: DisplayNameAPI = Object.freeze({
	displaySpeciesName,
	displayMoveName,
	displayAbilityName,
	displayItemName,
});

displayNameWindow.PSDisplayNames = PSDisplayNames;
