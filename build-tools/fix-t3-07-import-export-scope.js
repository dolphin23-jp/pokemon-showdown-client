'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PANEL_PATH = path.join(ROOT, 'play.pokemonshowdown.com/src/panel-teambuilder.tsx');
const TEST_PATH = path.join(ROOT, 'test/teambuilder-ja-chrome.js');

let panel = fs.readFileSync(PANEL_PATH, 'utf8');
const replacements = [
	[
		'<i class="fa fa-caret-left" aria-hidden></i> {SharedChromeJA.back}',
		'<i class="fa fa-caret-left" aria-hidden></i> Back',
	],
	[
		'<i class="fa fa-save" aria-hidden></i> {TeambuilderListChromeJA.saveNotAllowedForPartialExports}',
		'<i class="fa fa-save" aria-hidden></i> Save (not allowed for partial exports)',
	],
	[
		'<i class="fa fa-save" aria-hidden></i> {TeambuilderListChromeJA.saveChanges}',
		'<i class="fa fa-save" aria-hidden></i> Save changes',
	],
	[
		'<i class="fa fa-file-code-o" aria-hidden></i> {TeambuilderListChromeJA.backup}',
		'<i class="fa fa-file-code-o" aria-hidden></i> Backup',
	],
	[
		"{room.searchTerms.length ? TeambuilderListChromeJA.searchResults : room.curFolder ? TeambuilderListChromeJA.folder : ''}",
		"{room.searchTerms.length ? ' search results' : room.curFolder ? ' folder' : ''}",
	],
];
for (const [oldText, newText] of replacements) panel = panel.split(oldText).join(newText);
for (const [oldText, newText] of replacements) {
	assert.ok(!panel.includes(oldText), `protected Import/Export reference remains: ${oldText}`);
	assert.ok(panel.includes(newText), `protected English Import/Export text missing: ${newText}`);
}
fs.writeFileSync(PANEL_PATH, panel);

let testSource = fs.readFileSync(TEST_PATH, 'utf8');
const regressionName = "test('keeps all Team Import/Export controls in English'";
if (!testSource.includes(regressionName)) {
	testSource += `\n\ntest('keeps all Team Import/Export controls in English', () => {\n\tconst source = TARGETS.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\\n');\n\tconst panel = fs.readFileSync(\n\t\tpath.join(ROOT, 'play.pokemonshowdown.com/src/panel-teambuilder.tsx'),\n\t\t'utf8'\n\t);\n\tassert.match(source, /Import\\/Export/);\n\tassert.match(source, /Paste exported teams, pokepaste URLs, or JSON here/);\n\tassert.match(panel, /> Back/);\n\tassert.match(panel, /Save \\(not allowed for partial exports\\)/);\n\tassert.match(panel, /> Save changes/);\n\tassert.match(panel, /> Backup/);\n\tassert.match(panel, /' search results'/);\n\tassert.match(panel, /' folder'/);\n});\n`;
}
fs.writeFileSync(TEST_PATH, testSource);
