'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const compiledPath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/js/battle-display-names.js'
);

function namedEntry(id, name) {
	return Object.freeze({ id, name });
}

class FakeText {
	constructor(value) {
		this.nodeType = 3;
		this.nodeValue = value;
		this.parentElement = null;
		this.childNodes = [];
	}
	get textContent() {
		return this.nodeValue || '';
	}
	set textContent(value) {
		this.nodeValue = value;
	}
}

class FakeElement {
	constructor(tagName = 'div', selectors = [], attributes = {}) {
		this.nodeType = 1;
		this.tagName = tagName.toUpperCase();
		this.selectors = selectors;
		this.attributes = { ...attributes };
		this.childNodes = [];
		this.parentElement = null;
		this.value = '';
		this.name = attributes.name || '';
	}
	append(...children) {
		for (const child of children) {
			child.parentElement = this;
			this.childNodes.push(child);
		}
		return this;
	}
	matches(selector) {
		const parts = selector.split(',').map(part => part.trim());
		return parts.some(part => this.selectors.some(token => part === token || part.includes(token)));
	}
	closest(selector) {
		for (let element = this; element; element = element.parentElement) {
			if (element.matches(selector)) return element;
		}
		return null;
	}
	querySelectorAll(selector) {
		const results = [];
		const visit = node => {
			for (const child of node.childNodes || []) {
				if (child.nodeType === 1) {
					if (child.matches(selector)) results.push(child);
					visit(child);
				}
			}
		};
		visit(this);
		return results;
	}
	querySelector(selector) {
		return this.querySelectorAll(selector)[0] || null;
	}
	getAttribute(name) {
		return this.attributes[name] ?? null;
	}
	setAttribute(name, value) {
		this.attributes[name] = value;
	}
	get textContent() {
		return this.childNodes.map(child => child.textContent || '').join('');
	}
	set textContent(value) {
		this.childNodes = [];
		this.append(new FakeText(value));
	}
}

function fakeButton(kind, text, tooltip) {
	const textNode = new FakeText(text);
	const selector = kind === 'move' ? 'button.movebutton' : 'button[data-tooltip^="switchpokemon|"]';
	const button = new FakeElement('button', [selector]).append(textNode);
	button.dataCmd = kind === 'move' ? '/move 1' : '/switch 1';
	button.dataTooltip = tooltip;
	return { button, textNode };
}

function fakeInput(scope, type, value) {
	const input = new FakeElement('input', [`input.set-field[name="${type}"]`], { name: type });
	input.name = type;
	input.value = value;
	scope.append(input);
	return input;
}

function fakeSearchEntry(scope, type, name, nameSelector) {
	const entry = new FakeElement('a', [`a[data-entry^="${type}|"]`], { 'data-entry': `${type}|${name}` });
	const nameElement = new FakeElement('span', [nameSelector]).append(new FakeText(name));
	entry.append(nameElement);
	scope.append(entry);
	return { entry, nameElement };
}

function buildContext({ withBattleControls = false, withTeambuilder = false } = {}) {
	const entries = {
		species: {
			pikachu: namedEntry('pikachu', 'Pikachu'),
			charizard: namedEntry('charizard', 'Charizard'),
		},
		moves: {
			thunderbolt: namedEntry('thunderbolt', 'Thunderbolt'),
			protect: namedEntry('protect', 'Protect'),
		},
		abilities: {
			static: namedEntry('static', 'Static'),
			blaze: namedEntry('blaze', 'Blaze'),
		},
		items: {
			lightball: namedEntry('lightball', 'Light Ball'),
			leftovers: namedEntry('leftovers', 'Leftovers'),
		},
	};
	const calls = [];
	const makeTable = table => ({
		get(value) {
			calls.push({ table, value });
			if (value && typeof value !== 'string') return value;
			const name = value || '';
			const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
			return entries[table][id] || namedEntry(id, name);
		},
	});
	const window = {
		BattleJapaneseDisplayNames: {
			species: { pikachu: 'ピカチュウ' },
			moves: { thunderbolt: '10まんボルト' },
			abilities: { static: 'せいでんき' },
			items: { lightball: 'でんきだま' },
		},
	};
	const contextValues = {
		Dex: {
			species: makeTable('species'),
			moves: makeTable('moves'),
			abilities: makeTable('abilities'),
			items: makeTable('items'),
		},
		Object,
		Set,
		WeakMap,
		window,
		setTimeout(callback) {
			callback();
			return 1;
		},
	};
	let controls = null;
	let teambuilder = null;
	const observers = [];
	const listeners = {};
	if (withBattleControls || withTeambuilder) {
		const root = new FakeElement('div', ['body']);
		if (withBattleControls) {
			controls = {
				move: fakeButton('move', 'Thunderbolt', 'move|Thunderbolt|0'),
				species: fakeButton('species', 'Pikachu', 'switchpokemon|0'),
				nickname: fakeButton('species', 'Sparky', 'switchpokemon|1'),
			};
			root.append(...Object.values(controls).map(control => control.button));
		}
		if (withTeambuilder) {
			const scope = new FakeElement('div', ['.teameditor']);
			const speciesInput = fakeInput(scope, 'pokemon', 'Pikachu');
			const moveInput = fakeInput(scope, 'move', 'Thunderbolt');
			const abilityInput = fakeInput(scope, 'ability', 'Static');
			const itemInput = fakeInput(scope, 'item', 'Light Ball');

			const speciesResult = fakeSearchEntry(scope, 'pokemon', 'Pikachu', '.pokemonnamecol');
			const abilityColumn = new FakeElement('span', ['.abilitycol']).append(new FakeText('Static'));
			speciesResult.entry.append(abilityColumn);
			const moveResult = fakeSearchEntry(scope, 'move', 'Thunderbolt', '.movenamecol');
			const abilityResult = fakeSearchEntry(scope, 'ability', 'Static', '.namecol');
			const itemResult = fakeSearchEntry(scope, 'item', 'Light Ball', '.namecol');

			const addButton = new FakeElement('button', ['.teameditor button[name="addpokemon"]'])
				.append(new FakeText('Add Pokémon'));
			const importButton = new FakeElement('button', ['.teameditor button[name="import"]'])
				.append(new FakeText('Import/Export'));
			const detailsLabel = new FakeElement('label', ['.teameditor label.label'])
				.append(new FakeText('Details'));
			const searchInput = new FakeElement('input', ['[placeholder]'], { placeholder: 'Search abilities' });
			const importExport = new FakeElement('textarea', ['textarea.teamtextbox']);
			importExport.value = 'Pikachu @ Light Ball\nAbility: Static\n- Thunderbolt';
			scope.append(addButton, importButton, detailsLabel, searchInput, importExport);
			root.append(scope);
			teambuilder = {
				scope,
				inputs: { speciesInput, moveInput, abilityInput, itemInput },
				results: { speciesResult, moveResult, abilityResult, itemResult, abilityColumn },
				addButton,
				importButton,
				detailsLabel,
				searchInput,
				importExport,
			};
		}
		const document = {
			body: root,
			documentElement: root,
			activeElement: null,
			addEventListener(type, callback) {
				(listeners[type] ||= []).push(callback);
			},
		};
		contextValues.document = document;
		contextValues.MutationObserver = class MutationObserver {
			constructor(callback) {
				this.callback = callback;
				observers.push(this);
			}
			observe(target, options) {
				this.target = target;
				this.options = options;
			}
		};
	}
	const context = vm.createContext(contextValues);
	vm.runInContext(fs.readFileSync(compiledPath, 'utf8'), context);
	return { api: window.PSDisplayNames, calls, controls, entries, listeners, observers, teambuilder, window, context };
}

test('exposes the four display-only helpers', () => {
	const { api } = buildContext();
	assert.ok(api);
	assert.equal(typeof api.displaySpeciesName, 'function');
	assert.equal(typeof api.displayMoveName, 'function');
	assert.equal(typeof api.displayAbilityName, 'function');
	assert.equal(typeof api.displayItemName, 'function');
	assert.equal(Object.isFrozen(api), true);
});

test('returns registered Japanese display names', () => {
	const { api } = buildContext();
	assert.equal(api.displaySpeciesName('pikachu'), 'ピカチュウ');
	assert.equal(api.displayMoveName('thunderbolt'), '10まんボルト');
	assert.equal(api.displayAbilityName('static'), 'せいでんき');
	assert.equal(api.displayItemName('lightball'), 'でんきだま');
});

test('falls back to canonical English names when a translation is absent', () => {
	const { api } = buildContext();
	assert.equal(api.displaySpeciesName('charizard'), 'Charizard');
	assert.equal(api.displayMoveName('protect'), 'Protect');
	assert.equal(api.displayAbilityName('blaze'), 'Blaze');
	assert.equal(api.displayItemName('leftovers'), 'Leftovers');
});

test('does not mutate IDs, Dex entries, or caller input', () => {
	const { api, calls, entries } = buildContext();
	const input = entries.species.pikachu;
	const original = { ...input };

	assert.equal(api.displaySpeciesName(input), 'ピカチュウ');
	assert.deepEqual(input, original);
	assert.equal(input.id, 'pikachu');
	assert.equal(calls.at(-1).value, input);

	const protocolID = 'thunderbolt';
	assert.equal(api.displayMoveName(protocolID), '10まんボルト');
	assert.equal(protocolID, 'thunderbolt');
	assert.equal(calls.at(-1).value, protocolID);
});

test('supports generated maps being installed after the API loads', () => {
	const { api, window } = buildContext();
	window.BattleJapaneseDisplayNames = undefined;
	assert.equal(api.displaySpeciesName('pikachu'), 'Pikachu');

	window.BattleJapaneseDisplayNames = {
		species: { pikachu: 'ピカチュウ' },
	};
	assert.equal(api.displaySpeciesName('pikachu'), 'ピカチュウ');
});

test('localizes battle move and species button text without changing commands or tooltips', () => {
	const { controls, observers } = buildContext({ withBattleControls: true });
	assert.equal(controls.move.textNode.nodeValue, '10まんボルト');
	assert.equal(controls.species.textNode.nodeValue, 'ピカチュウ');
	assert.equal(controls.nickname.textNode.nodeValue, 'Sparky');
	assert.equal(controls.move.button.dataCmd, '/move 1');
	assert.equal(controls.move.button.dataTooltip, 'move|Thunderbolt|0');
	assert.equal(controls.species.button.dataCmd, '/switch 1');
	assert.equal(controls.species.button.dataTooltip, 'switchpokemon|0');
	assert.equal(observers.length, 1);
	assert.equal(observers[0].options.childList, true);
	assert.equal(observers[0].options.subtree, true);
	assert.equal(observers[0].options.characterData, true);
});

test('localizes Teambuilder display fields, result rows, and fixed labels only', () => {
	const { teambuilder } = buildContext({ withTeambuilder: true });
	assert.equal(teambuilder.inputs.speciesInput.value, 'ピカチュウ');
	assert.equal(teambuilder.inputs.moveInput.value, '10まんボルト');
	assert.equal(teambuilder.inputs.abilityInput.value, 'せいでんき');
	assert.equal(teambuilder.inputs.itemInput.value, 'でんきだま');
	assert.equal(teambuilder.results.speciesResult.nameElement.textContent, 'ピカチュウ');
	assert.equal(teambuilder.results.moveResult.nameElement.textContent, '10まんボルト');
	assert.equal(teambuilder.results.abilityResult.nameElement.textContent, 'せいでんき');
	assert.equal(teambuilder.results.itemResult.nameElement.textContent, 'でんきだま');
	assert.equal(teambuilder.results.abilityColumn.textContent, 'せいでんき');
	assert.equal(teambuilder.results.speciesResult.entry.getAttribute('data-entry'), 'pokemon|Pikachu');
	assert.equal(teambuilder.results.moveResult.entry.getAttribute('data-entry'), 'move|Thunderbolt');
	assert.equal(teambuilder.addButton.textContent, 'ポケモンを追加');
	assert.equal(teambuilder.importButton.textContent, 'インポート／エクスポート');
	assert.equal(teambuilder.detailsLabel.textContent, '詳細');
	assert.equal(teambuilder.searchInput.getAttribute('placeholder'), '特性を検索');
	assert.equal(
		teambuilder.importExport.value,
		'Pikachu @ Light Ball\nAbility: Static\n- Thunderbolt'
	);
});

test('restores canonical English before editing and relocalizes after focus leaves', () => {
	const { teambuilder, listeners, context } = buildContext({ withTeambuilder: true });
	const input = teambuilder.inputs.speciesInput;
	assert.equal(input.value, 'ピカチュウ');

	context.document.activeElement = input;
	listeners.focus[0]({ target: input });
	assert.equal(input.value, 'Pikachu');

	context.document.activeElement = null;
	listeners.focusout[0]({ target: input });
	assert.equal(input.value, 'ピカチュウ');
});
