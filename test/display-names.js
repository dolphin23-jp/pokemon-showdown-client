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

function fakeButton(kind, text, tooltip) {
	const textNode = { nodeType: 3, nodeValue: text, parentElement: null };
	const button = {
		childNodes: [textNode, { nodeType: 1, nodeValue: null }],
		dataCmd: kind === 'move' ? '/move 1' : '/switch 1',
		dataTooltip: tooltip,
		matches(selector) {
			if (selector === 'button.movebutton') return kind === 'move';
			if (selector.includes('switchpokemon|') || selector.includes('allypokemon|') || selector.includes('activepokemon|')) {
				return kind === 'species';
			}
			return false;
		},
		querySelectorAll() {
			return [];
		},
	};
	textNode.parentElement = button;
	return { button, textNode };
}

function buildContext({ withBattleControls = false } = {}) {
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
		window,
	};
	let controls = null;
	const observers = [];
	if (withBattleControls) {
		controls = {
			move: fakeButton('move', 'Thunderbolt', 'move|Thunderbolt|0'),
			species: fakeButton('species', 'Pikachu', 'switchpokemon|0'),
			nickname: fakeButton('species', 'Sparky', 'switchpokemon|1'),
		};
		const buttons = Object.values(controls).map(control => control.button);
		const root = {
			matches() {
				return false;
			},
			querySelectorAll() {
				return buttons;
			},
		};
		contextValues.document = { body: root, documentElement: root };
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
	return { api: window.PSDisplayNames, calls, controls, entries, observers, window };
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
