'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const INDEX = fs.readFileSync(path.join(ROOT, 'play.pokemonshowdown.com/index-new.html'), 'utf8');
const ENDLOAD = fs.readFileSync(path.join(ROOT, 'play.pokemonshowdown.com/src/client-endload.ts'), 'utf8');

function position(fragment) {
	const index = INDEX.indexOf(fragment);
	assert.notEqual(index, -1, `missing runtime script: ${fragment}`);
	return index;
}

test('loads the forfeit localization adapter after its dependencies', () => {
	const strings = position('/js/client-ui-ja-strings.js?');
	const popups = position('/js/panel-popups.js?');
	const adapter = position('/js/forfeit-dialog-ja.js?');
	const endload = position('/js/client-endload.js?');
	assert.ok(adapter > strings);
	assert.ok(adapter > popups);
	assert.ok(adapter < endload);
	assert.equal(INDEX.match(/\/js\/forfeit-dialog-ja\.js\?/g)?.length, 1);
});

test('does not rely on a non-bundled TypeScript side-effect import', () => {
	assert.doesNotMatch(ENDLOAD, /forfeit-dialog-ja/);
	assert.match(ENDLOAD, /PS\.libsLoaded\.loaded\(\)/);
});
