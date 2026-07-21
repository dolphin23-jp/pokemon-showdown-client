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

function buildContext() {
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
			return entries[table][value] || namedEntry(value || '', value || '');
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
	const context = vm.createContext({
		Dex: {
			species: makeTable('species'),
			moves: makeTable('moves'),
			abilities: makeTable('abilities'),
			items: makeTable('items'),
		},
		Object,
		window,
	});
	vm.runInContext(fs.readFileSync(compiledPath, 'utf8'), context);
	return { api: window.PSDisplayNames, calls, entries, window };
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
