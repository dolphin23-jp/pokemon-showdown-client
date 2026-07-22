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

const TEAMBUILDER_SCOPE_SELECTOR = [
	'.teameditor',
	'.teampane',
	'.folderpane',
	'.team-focus-editor',
].join(', ');
const TEAMBUILDER_INPUT_SELECTOR = [
	'input.set-field[name="pokemon"]',
	'input.set-field[name="move"]',
	'input.set-field[name="ability"]',
	'input.set-field[name="item"]',
].join(', ');
const TEAMBUILDER_ENTRY_SELECTOR = [
	'a[data-entry^="pokemon|"]',
	'a[data-entry^="move|"]',
	'a[data-entry^="ability|"]',
	'a[data-entry^="item|"]',
].join(', ');
const TEAMBUILDER_FIXED_SELECTOR = [
	'.teameditor .tabbar button',
	'.teameditor button[name="addpokemon"]',
	'.teameditor button[name="import"]',
	'.teameditor button[name="delete"]',
	'.teameditor button[name="details"]',
	'.teameditor button[name="stats"]',
	'.teameditor button.closesearch',
	'.teameditor button.option',
	'.teameditor label.label',
	'.teameditor .detailcell label',
	'.teameditor .infobox button',
	'.teampane > p > button',
	'.teampane h2',
	'.teampane button.option',
	'.folderpane button.selectFolder',
	'.folderpane h3',
	'a.button[href="teambuilder"]',
	'label.teamname',
	'button[data-href^="teamstorage-"]',
	'button.formatselect[data-selecttype="teambuilder"]',
].join(', ');

const TEAMBUILDER_TEXT: Readonly<Record<string, string>> = Object.freeze({
	'Teambuilder': 'チームビルダー',
	'Team': 'チーム',
	'Teams': 'チーム一覧',
	'Form': 'フォーム',
	'Import/Export': 'インポート／エクスポート',
	'Import': 'インポート',
	'Export': 'エクスポート',
	'Details': '詳細',
	'Stats': '能力値',
	'Pokemon': 'ポケモン',
	'Pokémon': 'ポケモン',
	'Moves': '技',
	'Ability': '特性',
	'Item': '持ち物',
	'Nickname': 'ニックネーム',
	'Level': 'レベル',
	'Shiny': '色違い',
	'Tera': 'テラスタイプ',
	'Gender': '性別',
	'Add Pokémon': 'ポケモンを追加',
	'Add Pokemon': 'ポケモンを追加',
	'New': '新規',
	'New team': '新しいチーム',
	'New box': '新しいボックス',
	'team': 'チーム',
	'team in folder': 'フォルダ内のチーム',
	'box': 'ボックス',
	'All Teams': 'すべてのチーム',
	'Folders': 'フォルダ',
	'Back': '戻る',
	'List': '一覧',
	'Close': '閉じる',
	'Copy': 'コピー',
	'Copied!': 'コピーしました',
	'Copy/Move': 'コピー／移動',
	'Add to clipboard': 'クリップボードに追加',
	'Deselect': '選択解除',
	'Delete': '削除',
	'Undo delete': '削除を取り消す',
	'Paste copy here': 'ここにコピーを貼り付け',
	'Move here': 'ここへ移動',
	'Backup': 'バックアップ',
	'folder': 'フォルダ',
	'search results': '検索結果',
	'Rename': '名前を変更',
	'Remove': '削除',
	'Save changes': '変更を保存',
	'Validate': '検証',
	'Team name:': 'チーム名:',
	'Local': 'ローカル',
	'Public': '公開',
	'Upload changes': '変更をアップロード',
	'Revert to uploaded version': 'アップロード版に戻す',
	'Compare': '比較',
	'(all)': '（すべて）',
	'(add folder)': '（フォルダを追加）',
	'(add format folder)': '（フォーマットを追加）',
	'(uncategorized)': '（未分類）',
	'(no ability)': '（特性なし）',
	'(choose ability)': '（特性を選択）',
	'(no item)': '（持ち物なし）',
});

const TEAMBUILDER_ATTRIBUTES: Readonly<Record<string, string>> = Object.freeze({
	'Search teams': 'チームを検索',
	'Search species or filter by type, learnable moves, ability, or egg group': 'ポケモン名、タイプ、習得技、特性、タマゴグループで検索',
	'Search abilities': '特性を検索',
	'Search items': '持ち物を検索',
	'Search moves or filter by type or category': '技名、タイプ、分類で検索',
	'Add Pokemon': 'ポケモンを追加',
	'Copy/move': 'コピー／移動',
	' Paste exported teams, pokepaste URLs, or JSON here': ' エクスポートしたチーム、Pokepaste URL、JSONをここに貼り付け',
});

type DisplayNameWindow = Window & {
	BattleJapaneseDisplayNames?: JapaneseDisplayNameTables,
	PSDisplayNames?: DisplayNameAPI,
};

const displayNameWindow = window as DisplayNameWindow;
const TEAMBUILDER_CANONICAL_ATTRIBUTE = 'data-ps-canonical-value';

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
	const buttons: Element[] = [];
	const rootElement = root as Element;
	if (typeof rootElement.matches === 'function' && rootElement.matches(BATTLE_CONTROL_SELECTOR)) {
		buttons.push(rootElement);
	}
	for (const button of Array.from(root.querySelectorAll(BATTLE_CONTROL_SELECTOR))) {
		if (!buttons.includes(button)) buttons.push(button);
	}

	let changed = 0;
	for (const button of buttons) {
		if (localizeBattleControlButton(button)) changed++;
	}
	return changed;
}

function isTeambuilderElement(element: Element): boolean {
	if (typeof element.matches === 'function' && element.matches(TEAMBUILDER_SCOPE_SELECTOR)) return true;
	return !!element.closest?.(TEAMBUILDER_SCOPE_SELECTOR);
}

function teambuilderInputTranslator(input: HTMLInputElement): ((name: string) => string) | null {
	switch (input.name) {
	case 'pokemon': return displaySpeciesName;
	case 'move': return displayMoveName;
	case 'ability': return displayAbilityName;
	case 'item': return displayItemName;
	default: return null;
	}
}

/** Restores the canonical English field value before Teambuilder handles editing. */
export function restoreTeambuilderInput(input: HTMLInputElement): boolean {
	if (!input.matches(TEAMBUILDER_INPUT_SELECTOR) || !isTeambuilderElement(input)) return false;
	const translate = teambuilderInputTranslator(input);
	const canonical = input.getAttribute(TEAMBUILDER_CANONICAL_ATTRIBUTE);
	if (!translate || canonical === null) return false;
	if (input.value !== translate(canonical)) {
		input.setAttribute(TEAMBUILDER_CANONICAL_ATTRIBUTE, input.value);
		return false;
	}
	input.value = canonical;
	return true;
}

/**
 * Shows Japanese in an unfocused Teambuilder field while retaining the
 * canonical English value in a temporary DOM attribute for editing.
 */
export function localizeTeambuilderInput(input: HTMLInputElement): boolean {
	if (!input.matches(TEAMBUILDER_INPUT_SELECTOR) || !isTeambuilderElement(input)) return false;
	if (typeof document !== 'undefined' && document.activeElement === input) return false;
	const translate = teambuilderInputTranslator(input);
	if (!translate) return false;

	let canonical = input.getAttribute(TEAMBUILDER_CANONICAL_ATTRIBUTE);
	if (canonical === null) {
		canonical = input.value;
	} else {
		const previousDisplay = translate(canonical);
		if (input.value !== canonical && input.value !== previousDisplay) canonical = input.value;
	}
	input.setAttribute(TEAMBUILDER_CANONICAL_ATTRIBUTE, canonical);

	const translated = translate(canonical);
	if (!translated || translated === input.value) return false;
	input.value = translated;
	return true;
}

function translateTextNode(node: Text, translate: (name: string) => string): boolean {
	const raw = node.nodeValue || '';
	const name = raw.trim();
	if (!name) return false;
	const translated = translate(name);
	if (!translated || translated === name) return false;
	node.nodeValue = raw.replace(name, translated);
	return true;
}

function translateDescendantText(element: Element, translate: (name: string) => string): number {
	let changed = 0;
	const visit = (node: Node) => {
		if (node.nodeType === 3) {
			if (translateTextNode(node as Text, translate)) changed++;
			return;
		}
		for (const child of Array.from(node.childNodes)) visit(child);
	};
	visit(element);
	return changed;
}

/** Localizes visible search-result names while preserving data-entry. */
export function localizeTeambuilderSearchEntry(entry: Element): number {
	if (!isTeambuilderElement(entry)) return 0;
	const rawEntry = entry.getAttribute('data-entry') || '';
	const [type, canonicalName] = rawEntry.split('|');
	if (!canonicalName) return 0;

	let selector = '';
	let translate: ((name: string) => string) | null = null;
	switch (type) {
	case 'pokemon':
		selector = '.pokemonnamecol';
		translate = displaySpeciesName;
		break;
	case 'move':
		selector = '.movenamecol';
		translate = displayMoveName;
		break;
	case 'ability':
		selector = '.namecol';
		translate = displayAbilityName;
		break;
	case 'item':
		selector = '.namecol';
		translate = displayItemName;
		break;
	default:
		return 0;
	}

	let changed = 0;
	const nameElement = entry.querySelector(selector);
	if (nameElement) {
		const translated = translate(canonicalName);
		if (translated && nameElement.textContent !== translated) {
			nameElement.textContent = translated;
			changed++;
		}
	}
	if (type === 'pokemon') {
		for (const abilityElement of Array.from(entry.querySelectorAll('.abilitycol, .twoabilitycol'))) {
			changed += translateDescendantText(abilityElement, displayAbilityName);
		}
	}
	return changed;
}

function translateFixedTeambuilderText(text: string): string {
	return TEAMBUILDER_TEXT[text] || text;
}

function localizeFixedElement(element: Element): number {
	let changed = 0;
	const visit = (node: Node) => {
		if (node.nodeType === 3) {
			if (translateTextNode(node as Text, translateFixedTeambuilderText)) changed++;
			return;
		}
		const childElement = node as Element;
		if (childElement.tagName === 'INPUT' || childElement.tagName === 'TEXTAREA' ||
			childElement.tagName === 'SCRIPT' || childElement.tagName === 'STYLE' || childElement.tagName === 'CODE') {
			return;
		}
		for (const child of Array.from(node.childNodes)) visit(child);
	};
	visit(element);
	return changed;
}

function localizeTeambuilderAttributes(element: Element): number {
	let changed = 0;
	for (const attribute of ['placeholder', 'aria-label', 'title']) {
		const value = element.getAttribute(attribute);
		if (!value) continue;
		const translated = TEAMBUILDER_ATTRIBUTES[value];
		if (!translated || translated === value) continue;
		element.setAttribute(attribute, translated);
		changed++;
	}
	return changed;
}

function collectElements(root: ParentNode, selector: string): Element[] {
	const elements: Element[] = [];
	const rootElement = root as Element;
	if (typeof rootElement.matches === 'function' && rootElement.matches(selector)) elements.push(rootElement);
	for (const element of Array.from(root.querySelectorAll(selector))) {
		if (!elements.includes(element)) elements.push(element);
	}
	return elements;
}

/** Applies display-only Teambuilder localization without touching team data. */
export function localizeTeambuilder(root: ParentNode): number {
	let changed = 0;
	for (const input of collectElements(root, TEAMBUILDER_INPUT_SELECTOR)) {
		changed += localizeTeambuilderInput(input as HTMLInputElement) ? 1 : 0;
	}
	for (const entry of collectElements(root, TEAMBUILDER_ENTRY_SELECTOR)) {
		changed += localizeTeambuilderSearchEntry(entry);
	}
	for (const element of collectElements(root, TEAMBUILDER_FIXED_SELECTOR)) {
		changed += localizeFixedElement(element);
	}
	for (const scope of collectElements(root, TEAMBUILDER_SCOPE_SELECTOR)) {
		for (const element of Array.from(scope.querySelectorAll('[placeholder], [aria-label], [title]'))) {
			changed += localizeTeambuilderAttributes(element);
		}
	}
	return changed;
}

function installDisplayLocalization() {
	if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
	const root = document.body || document.documentElement;
	if (!root) return;

	localizeBattleControls(root);
	localizeTeambuilder(root);

	document.addEventListener('focus', event => {
		const target = event.target as HTMLInputElement | null;
		if (target?.matches?.(TEAMBUILDER_INPUT_SELECTOR)) restoreTeambuilderInput(target);
	}, true);
	document.addEventListener('focusout', event => {
		const target = event.target as HTMLInputElement | null;
		if (!target?.matches?.(TEAMBUILDER_INPUT_SELECTOR)) return;
		target.setAttribute(TEAMBUILDER_CANONICAL_ATTRIBUTE, target.value);
		setTimeout(() => localizeTeambuilderInput(target), 0);
	}, true);

	const observer = new MutationObserver(records => {
		for (const record of records) {
			if (record.type === 'characterData' && record.target.parentElement) {
				localizeBattleControlButton(record.target.parentElement);
				localizeTeambuilder(record.target.parentElement);
			}
			for (const node of Array.from(record.addedNodes)) {
				const candidate = (node.nodeType === 3 ? node.parentElement : node) as ParentNode | null;
				if (candidate && typeof candidate.querySelectorAll === 'function') {
					localizeBattleControls(candidate);
					localizeTeambuilder(candidate);
				}
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
installDisplayLocalization();
