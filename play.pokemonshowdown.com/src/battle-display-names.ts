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

const MOVE_BUTTON_SELECTOR = 'button.movebutton';
const SPECIES_BUTTON_SELECTOR = [
	'button[data-tooltip^="switchpokemon|"]',
	'button[data-tooltip^="allypokemon|"]',
	'button[data-tooltip^="activepokemon|"]',
].join(', ');
const BATTLE_CONTROL_SELECTOR = `${MOVE_BUTTON_SELECTOR}, ${SPECIES_BUTTON_SELECTOR}`;

type DisplayNameWindow = Window & {
	BattleJapaneseDisplayNames?: JapaneseDisplayNameTables,
	PSDisplayNames?: DisplayNameAPI,
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

function directTextNode(element: Element): Text | null {
	for (const node of Array.from(element.childNodes)) {
		if (node.nodeType === 3 && node.nodeValue?.trim()) return node as Text;
	}
	return null;
}

/**
 * Replaces only the visible direct text node of a battle choice button.
 * Command and tooltip attributes remain canonical English protocol data.
 */
export function localizeBattleControlButton(button: Element): boolean {
	let translate: ((name: string) => string) | null = null;
	if (button.matches(MOVE_BUTTON_SELECTOR)) {
		translate = displayMoveName;
	} else if (button.matches(SPECIES_BUTTON_SELECTOR)) {
		translate = displaySpeciesName;
	} else {
		return false;
	}

	const textNode = directTextNode(button);
	if (!textNode) return false;
	const rawName = textNode.nodeValue || '';
	const name = rawName.trim();
	if (!name || name === '(empty slot)') return false;

	const translatedName = translate(name);
	if (!translatedName || translatedName === name) return false;
	textNode.nodeValue = rawName.replace(name, translatedName);
	return true;
}

export function localizeBattleControls(root: ParentNode): number {
	const buttons = new Set<Element>();
	const rootElement = root as Element;
	if (typeof rootElement.matches === 'function' && rootElement.matches(BATTLE_CONTROL_SELECTOR)) {
		buttons.add(rootElement);
	}
	for (const button of Array.from(root.querySelectorAll(BATTLE_CONTROL_SELECTOR))) {
		buttons.add(button);
	}

	let changed = 0;
	for (const button of buttons) {
		if (localizeBattleControlButton(button)) changed++;
	}
	return changed;
}

function installBattleControlLocalization() {
	if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
	const root = document.body || document.documentElement;
	if (!root) return;

	localizeBattleControls(root);
	const observer = new MutationObserver(records => {
		for (const record of records) {
			if (record.type === 'characterData' && record.target.parentElement) {
				localizeBattleControlButton(record.target.parentElement);
			}
			for (const node of Array.from(record.addedNodes)) {
				const candidate = node as ParentNode;
				if (typeof candidate.querySelectorAll === 'function') localizeBattleControls(candidate);
			}
		}
	});
	observer.observe(root, { childList: true, subtree: true, characterData: true });
}

export const PSDisplayNames: DisplayNameAPI = Object.freeze({
	displaySpeciesName,
	displayMoveName,
	displayAbilityName,
	displayItemName,
});

displayNameWindow.PSDisplayNames = PSDisplayNames;
installBattleControlLocalization();
