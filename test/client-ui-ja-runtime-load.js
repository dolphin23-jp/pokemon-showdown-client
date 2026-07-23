'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const indexPath = path.join(ROOT, 'play.pokemonshowdown.com/index-new.html');

test('loads Japanese UI chrome before every localized panel consumer', () => {
	const source = fs.readFileSync(indexPath, 'utf8');
	const framework = source.indexOf('/js/client-ui-ja-strings.js?');
	const battlePanel = source.indexOf('/js/panel-battle.js?');
	const popupPanel = source.indexOf('/js/panel-popups.js?');
	const teambuilderPanel = source.indexOf('/js/panel-teambuilder.js?');

	assert.notEqual(framework, -1, 'index-new.html must load client-ui-ja-strings.js');
	assert.notEqual(battlePanel, -1, 'index-new.html must load panel-battle.js');
	assert.ok(framework < battlePanel, 'Japanese UI chrome must load before panel-battle.js');
	assert.ok(framework < popupPanel, 'Japanese UI chrome must load before panel-popups.js');
	assert.ok(framework < teambuilderPanel, 'Japanese UI chrome must load before panel-teambuilder.js');
});
