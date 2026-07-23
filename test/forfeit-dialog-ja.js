'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const SOURCE = fs.readFileSync(
	path.resolve(__dirname, '../play.pokemonshowdown.com/src/forfeit-dialog-ja.ts'),
	'utf8'
);

test('localizes every visible forfeit dialog control without changing commands', () => {
	assert.match(SOURCE, /const FORFEIT_AND_CLOSE_CMD = '\/closeand \/inopener \/closeand \/forfeit';/);
	assert.match(SOURCE, /const JUST_FORFEIT_CMD = '\/closeand \/inopener \/forfeit';/);
	assert.match(SOURCE, /const CANCEL_CMD = '\/close';/);
	assert.match(SOURCE, /ForfeitDialogJA\.confirm/);
	assert.match(SOURCE, /ForfeitDialogJA\.forfeitAndClose/);
	assert.match(SOURCE, /ForfeitDialogJA\.justForfeit/);
	assert.match(SOURCE, /SharedChromeJA\.cancel/);
	assert.match(SOURCE, /container\.querySelector<HTMLButtonElement>/);
});
