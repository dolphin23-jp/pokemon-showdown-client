'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function replaceOne(relativePath, before, after) {
	const filePath = path.join(ROOT, relativePath);
	const source = fs.readFileSync(filePath, 'utf8');
	assert.equal(source.split(before).length - 1, 1, `${relativePath}: expected one occurrence`);
	fs.writeFileSync(filePath, source.replace(before, after));
}

replaceOne(
	'play.pokemonshowdown.com/src/client-ui-ja-strings.ts',
	"\topponentLabel: ['Opponent:', '対戦相手：'],\n\tplay: ['Play', '再生'],",
	"\topponentLabel: ['Opponent:', '対戦相手：'],\n\ttimer: ['Timer', 'タイマー'],\n\tplay: ['Play', '再生'],"
);
replaceOne(
	'play.pokemonshowdown.com/src/panel-battle.tsx',
	"\t\tlet time = 'Timer';",
	"\t\tlet time = BattleChromeJA.timer;"
);
replaceOne('test/client-ui-ja-strings.js', 'assert.equal(inventoryEntries.length, 325);', 'assert.equal(inventoryEntries.length, 326);');
replaceOne('test/client-ui-ja-strings.js', 'assert.equal(inventoryStrings.size, 233);', 'assert.equal(inventoryStrings.size, 234);');
replaceOne('test/client-ui-ja-strings.js', 'assert.equal(frameworkEntries.length, 233);', 'assert.equal(frameworkEntries.length, 234);');
replaceOne(
	'test/client-ui-ja-strings.js',
	"assert.equal(frameworkStrings.size, 233, 'an English source string is assigned to more than one key');",
	"assert.equal(frameworkStrings.size, 234, 'an English source string is assigned to more than one key');"
);
