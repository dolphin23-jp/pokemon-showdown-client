'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const scriptPath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/src/teambuilder-ja.js'
);
const source = fs.readFileSync(scriptPath, 'utf8');

function buildContext() {
	const displayNames = {
		displaySpeciesName(name) {
			return name === 'Pikachu' ? 'ピカチュウ' : name;
		},
		displayMoveName(name) {
			return name === 'Thunderbolt' ? '10まんボルト' : name;
		},
		displayAbilityName(name) {
			return name === 'Static' ? 'せいでんき' : name;
		},
		displayItemName(name) {
			return name === 'Light Ball' ? 'でんきだま' : name;
		},
	};
	const window = { PSDisplayNames: displayNames };
	const context = vm.createContext({
		globalThis: window,
		Object,
		window,
	});
	vm.runInContext(source, context);
	return window.PSTeambuilderJapanese;
}

function fakeInput(name, value) {
	return {
		name,
		value,
		dataset: {},
	};
}

test('uses the existing display-name API for all four Teambuilder categories', () => {
	const api = buildContext();
	assert.equal(api.displayFieldName('pokemon', 'Pikachu'), 'ピカチュウ');
	assert.equal(api.displayFieldName('move', 'Thunderbolt'), '10まんボルト');
	assert.equal(api.displayFieldName('ability', 'Static'), 'せいでんき');
	assert.equal(api.displayFieldName('item', 'Light Ball'), 'でんきだま');
	assert.equal(api.displayFieldName('pokemon', 'MissingNo.'), 'MissingNo.');
});

test('shows Japanese in an unfocused field while retaining the canonical English value', () => {
	const api = buildContext();
	const input = fakeInput('pokemon', 'Pikachu');

	assert.equal(api.localizeFieldInput(input), true);
	assert.equal(input.value, 'ピカチュウ');
	assert.equal(input.dataset.psCanonicalName, 'Pikachu');

	assert.equal(api.restoreCanonicalFieldInput(input), true);
	assert.equal(input.value, 'Pikachu');
	assert.equal(input.dataset.psCanonicalName, 'Pikachu');
});

test('localizes fixed Teambuilder controls without translating user or storage data generically', () => {
	const api = buildContext();
	assert.equal(api.translateFixedText('New team'), '新しいチーム');
	assert.equal(api.translateFixedText('Import/Export'), 'インポート／エクスポート');
	assert.equal(api.translateFixedText('Details'), '詳細');
	assert.equal(api.translateFixedText('My English Team'), 'My English Team');
});

test('keeps search selection metadata canonical while changing only the visible name', () => {
	const api = buildContext();
	const nameElement = { textContent: 'Thunderbolt' };
	const anchor = {
		getAttribute(name) {
			return name === 'data-entry' ? 'move|Thunderbolt' : null;
		},
		querySelector(selector) {
			return selector === '.movenamecol' ? nameElement : null;
		},
	};

	assert.equal(api.localizeSearchEntry(anchor), true);
	assert.equal(nameElement.textContent, '10まんボルト');
	assert.equal(anchor.getAttribute('data-entry'), 'move|Thunderbolt');
});

test('the localization layer does not access team serialization or persistent storage', () => {
	for (const forbidden of [
		'packedTeam', 'localStorage', 'Teams.import', 'Teams.export', 'showdown_teams',
	]) {
		assert.equal(source.includes(forbidden), false, forbidden);
	}
	assert.match(source, /textarea, script, style/);
});

test('the production entry page loads Teambuilder localization after editor code and before endload', () => {
	const index = fs.readFileSync(
		path.resolve(__dirname, '../play.pokemonshowdown.com/index-new.html'),
		'utf8'
	);
	const editorPosition = index.indexOf('/js/panel-teambuilder-team.js?');
	const japanesePosition = index.indexOf('/src/teambuilder-ja.js?');
	const endloadPosition = index.indexOf('/js/client-endload.js?');
	assert.ok(editorPosition >= 0);
	assert.ok(editorPosition < japanesePosition);
	assert.ok(japanesePosition < endloadPosition);
});
