'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  "play.pokemonshowdown.com/src/battle-team-editor.tsx",
  "play.pokemonshowdown.com/src/panel-teambuilder.tsx",
  "play.pokemonshowdown.com/src/panel-teambuilder-team.tsx",
  "play.pokemonshowdown.com/src/panel-teamdropdown.tsx"
];

test('applies typed Japanese chrome to every Teambuilder target', () => {
	const sources = new Map(TARGETS.map(file => [file, fs.readFileSync(path.join(ROOT, file), 'utf8')]));
	assert.match(sources.get("play.pokemonshowdown.com/src/battle-team-editor.tsx"), /SharedChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/battle-team-editor.tsx"), /TeambuilderChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teambuilder.tsx"), /SharedChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teambuilder.tsx"), /TeambuilderListChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teambuilder-team.tsx"), /SharedChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teambuilder-team.tsx"), /TeambuilderTeamChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teamdropdown.tsx"), /SharedChromeJA\./);
	assert.match(sources.get("play.pokemonshowdown.com/src/panel-teamdropdown.tsx"), /TeamDropdownChromeJA\./);
});

test('keeps Team Import/Export UI in English', () => {
	const source = TARGETS.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
	assert.match(source, /Import\/Export/);
	assert.match(source, /Paste exported teams, pokepaste URLs, or JSON here/);
});


test('keeps all Team Import/Export controls in English', () => {
	const source = TARGETS.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\n');
	const panel = fs.readFileSync(
		path.join(ROOT, 'play.pokemonshowdown.com/src/panel-teambuilder.tsx'),
		'utf8'
	);
	assert.match(source, /Import\/Export/);
	assert.match(source, /Paste exported teams, pokepaste URLs, or JSON here/);
	assert.match(panel, /> Back/);
	assert.match(panel, /Save \(not allowed for partial exports\)/);
	assert.match(panel, /> Save changes/);
	assert.match(panel, /> Backup/);
	assert.match(panel, /' search results'/);
	assert.match(panel, /' folder'/);
});
