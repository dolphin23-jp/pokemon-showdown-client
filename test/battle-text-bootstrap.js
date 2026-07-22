'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const bootstrapPath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/src/battle-text-ja-bootstrap.js'
);
const bootstrap = fs.readFileSync(bootstrapPath, 'utf8');

test('creates a global BattleText table when the English data file is absent', () => {
	const context = vm.createContext({ window: {} });
	vm.runInContext(bootstrap, context);
	assert.ok(context.BattleText);
	assert.equal(context.window.BattleText, context.BattleText);
});

test('preserves an existing BattleText table', () => {
	const existing = { default: { move: '[POKEMON] used [MOVE]!' } };
	const context = vm.createContext({ BattleText: existing, window: {} });
	vm.runInContext(bootstrap, context);
	assert.equal(context.BattleText, existing);
	assert.equal(context.window.BattleText, existing);
	assert.equal(context.BattleText.default.move, '[POKEMON] used [MOVE]!');
});

test('loads the bootstrap between optional English text and Japanese templates', () => {
	const index = fs.readFileSync(
		path.resolve(__dirname, '../play.pokemonshowdown.com/index-new.html'),
		'utf8'
	);
	const smoke = fs.readFileSync(
		path.resolve(__dirname, '../play.pokemonshowdown.com/battle-text-ja-smoke.html'),
		'utf8'
	);
	for (const html of [index, smoke]) {
		const englishPosition = html.indexOf('/data/text.js?');
		const bootstrapPosition = html.indexOf('/src/battle-text-ja-bootstrap.js?');
		const japanesePosition = html.indexOf('/src/battle-text-ja.js?');
		assert.ok(englishPosition >= 0);
		assert.ok(englishPosition < bootstrapPosition);
		assert.ok(bootstrapPosition < japanesePosition);
	}
});
