'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const {
	GENERATED_END,
	GENERATED_START,
	JAPANESE_LANGUAGE_ID,
	SOURCE_COMMIT,
	SOURCE_REPOSITORY,
	TABLE_SPECS,
	buildDisplayTable,
	parseCsv,
	renderDataset,
	stripGeneratedDataset,
	toID,
} = require('../build-tools/generate-japanese-display-names');

const compiledPath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/js/battle-display-names.js'
);
const metadataPath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/js/battle-display-names.meta.json'
);

test('parses quoted CSV fields and escaped quotes', () => {
	const rows = parseCsv('id,name,description\r\n1,"A, B","say ""hi"""\r\n');
	assert.deepEqual(rows, [{ id: '1', name: 'A, B', description: 'say "hi"' }]);
});

test('normalizes source identifiers without changing the display string', () => {
	assert.equal(toID('Mr-Mime'), 'mrmime');
	assert.equal(toID('Nidoran-F'), 'nidoranf');

	const identifiers = 'id,identifier\n1,mr-mime\n2,pikachu\n';
	const names = [
		'pokemon_species_id,local_language_id,name,genus',
		'1,9,Mr. Mime,Barrier Pokémon',
		`1,${JAPANESE_LANGUAGE_ID},バリヤード,バリアーポケモン`,
		`2,${JAPANESE_LANGUAGE_ID},ピカチュウ,ねずみポケモン`,
		'',
	].join('\n');
	const table = buildDisplayTable(identifiers, names, TABLE_SPECS.species);
	assert.deepEqual(table, { mrmime: 'バリヤード', pikachu: 'ピカチュウ' });
});

test('renders frozen display-only tables and can replace an earlier generated block', () => {
	const generated = renderDataset({
		species: { pikachu: 'ピカチュウ' },
		moves: {},
		abilities: {},
		items: {},
	});
	const window = {};
	vm.runInNewContext(generated, { Object, window });
	assert.equal(window.BattleJapaneseDisplayNames.species.pikachu, 'ピカチュウ');
	assert.equal(Object.isFrozen(window.BattleJapaneseDisplayNames), true);
	assert.equal(Object.isFrozen(window.BattleJapaneseDisplayNames.species), true);

	const compiledApi = `${generated}\nconsole.log('compiled API');\n`;
	assert.equal(stripGeneratedDataset(compiledApi), "console.log('compiled API');\n");
	assert.equal(stripGeneratedDataset("console.log('plain');\n"), "console.log('plain');\n");
});

test('the built client contains the pinned generated maps and metadata', () => {
	const compiled = fs.readFileSync(compiledPath, 'utf8');
	const generatedEnd = compiled.indexOf(GENERATED_END);
	assert.ok(compiled.startsWith(GENERATED_START));
	assert.ok(generatedEnd > 0);

	const generated = compiled.slice(0, generatedEnd + GENERATED_END.length);
	const window = {};
	vm.runInNewContext(generated, { Object, window });
	const tables = window.BattleJapaneseDisplayNames;
	assert.ok(tables);
	for (const [name, spec] of Object.entries(TABLE_SPECS)) {
		assert.ok(Object.keys(tables[name]).length >= spec.minimumCount, name);
	}
	assert.match(tables.species.pikachu, /[^\x00-\x7F]/);
	assert.match(tables.moves.thunderbolt, /[^\x00-\x7F]/);
	assert.match(tables.abilities.static, /[^\x00-\x7F]/);
	assert.match(tables.items.leftovers, /[^\x00-\x7F]/);

	const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
	assert.equal(metadata.source_repository, SOURCE_REPOSITORY);
	assert.equal(metadata.source_commit, SOURCE_COMMIT);
	assert.equal(metadata.language_id, Number(JAPANESE_LANGUAGE_ID));
	assert.equal(metadata.mutates_ids, false);
	assert.equal(metadata.protocol_safe, true);
});
