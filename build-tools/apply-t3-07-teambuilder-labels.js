'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const FRAMEWORK_PATH = path.join(ROOT, 'play.pokemonshowdown.com/src/client-ui-ja-strings.ts');
const TEST_PATH = path.join(ROOT, 'test/client-ui-ja-strings.js');

const GROUP_EXPORTS = {
	SharedChromeSources: 'SharedChromeJA',
	TeambuilderChromeSources: 'TeambuilderChromeJA',
	TeambuilderListChromeSources: 'TeambuilderListChromeJA',
	TeambuilderTeamChromeSources: 'TeambuilderTeamChromeJA',
	TeamDropdownChromeSources: 'TeamDropdownChromeJA',
};

const TARGETS = [
	'play.pokemonshowdown.com/src/battle-team-editor.tsx',
	'play.pokemonshowdown.com/src/panel-teambuilder.tsx',
	'play.pokemonshowdown.com/src/panel-teambuilder-team.tsx',
	'play.pokemonshowdown.com/src/panel-teamdropdown.tsx',
];

const IMPORT_EXPORT_MARKERS = new Set([
	'Import/Export',
	'Paste exported teams, pokepaste URLs, or JSON here',
	'Fetching Paste...',
	'Import',
	'Import/Export Set',
]);

function normalizeText(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function unwrapObject(initializer) {
	while (initializer && (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer))) {
		initializer = initializer.expression;
	}
	return initializer;
}

function readFrameworkMap() {
	const source = fs.readFileSync(FRAMEWORK_PATH, 'utf8');
	const sourceFile = ts.createSourceFile(FRAMEWORK_PATH, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const map = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name)) continue;
			const group = declaration.name.text;
			const exportName = GROUP_EXPORTS[group];
			if (!exportName) continue;
			const initializer = unwrapObject(declaration.initializer);
			assert.ok(initializer && ts.isObjectLiteralExpression(initializer), `${group} must remain an object literal`);
			for (const property of initializer.properties) {
				assert.ok(ts.isPropertyAssignment(property), `${group} entries must remain property assignments`);
				assert.ok(ts.isArrayLiteralExpression(property.initializer), `${group}.${property.name.getText()} must remain a tuple`);
				const [englishNode] = property.initializer.elements;
				assert.ok(ts.isStringLiteral(englishNode), `${group}.${property.name.getText()} English source must remain a string`);
				const key = property.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
				const english = englishNode.text;
				assert.ok(!map.has(english), `duplicate Teambuilder English source: ${english}`);
				map.set(english, { group, exportName, key });
			}
		}
	}
	return map;
}

function staticText(node) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (ts.isTemplateExpression(node)) {
		let value = node.head.text;
		for (const span of node.templateSpans) value += '${…}' + span.literal.text;
		return value;
	}
	return null;
}

function declarationName(node, sourceFile) {
	if (
		ts.isClassDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) ||
		ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)
	) {
		return node.name?.getText(sourceFile) || '';
	}
	if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) return node.name.text;
	return '';
}

function collectProtectedRanges(sourceFile, source) {
	const ranges = [];
	function visit(node) {
		const name = declarationName(node, sourceFile);
		if (name && /(?:import|export|paste)/i.test(name)) {
			ranges.push({ start: node.getFullStart(), end: node.getEnd(), text: source.slice(node.getFullStart(), node.getEnd()) });
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);

	function findMarker(node) {
		const text = staticText(node);
		if (text !== null && IMPORT_EXPORT_MARKERS.has(normalizeText(text))) return true;
		if (ts.isJsxText(node) && IMPORT_EXPORT_MARKERS.has(normalizeText(node.getText(sourceFile)))) return true;
		let found = false;
		ts.forEachChild(node, child => {
			if (!found && findMarker(child)) found = true;
		});
		return found;
	}

	function findTextarea(node) {
		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			const tag = node.tagName.getText(sourceFile);
			if (/^(?:textarea|PSTextarea|TeamTextbox)$/i.test(tag)) return true;
		}
		let found = false;
		ts.forEachChild(node, child => {
			if (!found && findTextarea(child)) found = true;
		});
		return found;
	}

	function protectImportExportJsx(node) {
		if ((ts.isJsxElement(node) || ts.isJsxFragment(node)) && findMarker(node) && findTextarea(node)) {
			const parent = node.parent;
			if (!(parent && (ts.isJsxElement(parent) || ts.isJsxFragment(parent)) && findMarker(parent) && findTextarea(parent))) {
				ranges.push({ start: node.getFullStart(), end: node.getEnd(), text: source.slice(node.getFullStart(), node.getEnd()) });
				return;
			}
		}
		ts.forEachChild(node, protectImportExportJsx);
	}
	protectImportExportJsx(sourceFile);
	return ranges;
}

function inProtectedRange(node, ranges) {
	const start = node.getStart();
	const end = node.getEnd();
	return ranges.some(range => start >= range.start && end <= range.end);
}

function openingElementHasDataTooltip(attribute) {
	const openingElement = attribute.parent.parent;
	return openingElement.attributes.properties.some(candidate => (
		ts.isJsxAttribute(candidate) && candidate.name.getText() === 'data-tooltip'
	));
}

function renderReference(entry) {
	return `${entry.exportName}.${entry.key}`;
}

function applyTarget(file, frameworkMap) {
	const filePath = path.join(ROOT, file);
	const source = fs.readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const protectedRanges = collectProtectedRanges(sourceFile, source);
	const protectedSnapshots = protectedRanges.map(range => range.text);
	const displayNameSnapshot = source.split('\n').filter(line => /PSDisplayNames|display(?:Species|Move|Ability|Item)Name/.test(line));
	const commandSnapshot = source.match(/data-(?:cmd|tooltip)=(?:"[^"]*"|'[^']*'|\{[^}]*\})/g) || [];
	const replacements = [];
	const usedExports = new Set();
	const usedGroups = new Set();

	function addReplacement(node, text, mode) {
		const normalized = normalizeText(text);
		const entry = frameworkMap.get(normalized);
		if (!entry || IMPORT_EXPORT_MARKERS.has(normalized) || inProtectedRange(node, protectedRanges)) return;
		usedExports.add(entry.exportName);
		usedGroups.add(entry.group);
		let replacement;
		if (mode === 'jsx-text') {
			const raw = node.getText(sourceFile);
			const leading = raw.match(/^\s*/)?.[0] || '';
			const trailing = raw.match(/\s*$/)?.[0] || '';
			replacement = `${leading}{${renderReference(entry)}}${trailing}`;
		} else if (mode === 'jsx-attribute') {
			replacement = `{${renderReference(entry)}}`;
		} else if (ts.isTemplateExpression(node)) {
			assert.equal(node.templateSpans.length, 1, `${file}: unsupported multi-placeholder chrome string ${normalized}`);
			const expression = node.templateSpans[0].expression.getText(sourceFile);
			replacement = `${renderReference(entry)}.replace('${'${…}'}', String(${expression}))`;
		} else {
			replacement = renderReference(entry);
		}
		replacements.push({ start: node.getStart(sourceFile), end: node.getEnd(), replacement, source: normalized });
	}

	function collectRendered(node) {
		const text = staticText(node);
		if (text !== null) {
			addReplacement(node, text, 'expression');
			return;
		}
		if (
			ts.isParenthesizedExpression(node) || ts.isAsExpression(node) ||
			ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)
		) {
			collectRendered(node.expression);
			return;
		}
		if (ts.isConditionalExpression(node)) {
			collectRendered(node.whenTrue);
			collectRendered(node.whenFalse);
			return;
		}
		if (ts.isArrayLiteralExpression(node)) {
			for (const element of node.elements) collectRendered(element);
			return;
		}
		if (ts.isBinaryExpression(node) && [
			ts.SyntaxKind.AmpersandAmpersandToken,
			ts.SyntaxKind.BarBarToken,
			ts.SyntaxKind.QuestionQuestionToken,
		].includes(node.operatorToken.kind)) {
			collectRendered(node.right);
		}
	}

	function visit(node) {
		if (ts.isJsxText(node)) {
			addReplacement(node, node.getText(sourceFile), 'jsx-text');
			return;
		}
		if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
			collectRendered(node.expression);
			return;
		}
		if (ts.isJsxAttribute(node)) {
			const name = node.name.getText(sourceFile);
			if ((name === 'placeholder' || name === 'title') && !(name === 'title' && openingElementHasDataTooltip(node))) {
				if (node.initializer && ts.isStringLiteral(node.initializer)) {
					addReplacement(node.initializer, node.initializer.text, 'jsx-attribute');
				} else if (node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) {
					collectRendered(node.initializer.expression);
				}
			}
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);

	const unique = new Map();
	for (const replacement of replacements) {
		const key = `${replacement.start}:${replacement.end}`;
		const previous = unique.get(key);
		assert.ok(!previous || previous.replacement === replacement.replacement, `${file}: conflicting replacements at ${key}`);
		unique.set(key, replacement);
	}
	const ordered = [...unique.values()].sort((a, b) => b.start - a.start);
	assert.ok(ordered.length, `${file}: no Teambuilder chrome replacements found`);
	let output = source;
	for (const replacement of ordered) {
		output = output.slice(0, replacement.start) + replacement.replacement + output.slice(replacement.end);
	}

	const reparsed = ts.createSourceFile(filePath, output, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const existingImport = reparsed.statements.find(statement => (
		ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) &&
		statement.moduleSpecifier.text === './client-ui-ja-strings'
	));
	const imports = [...usedExports].sort();
	if (existingImport) {
		const clause = existingImport.importClause;
		assert.ok(clause?.namedBindings && ts.isNamedImports(clause.namedBindings), `${file}: chrome import must use named imports`);
		const existing = clause.namedBindings.elements.map(element => element.name.text);
		const merged = [...new Set([...existing, ...imports])].sort();
		output = output.slice(0, existingImport.getStart(reparsed)) +
			`import { ${merged.join(', ')} } from "./client-ui-ja-strings";` +
			output.slice(existingImport.getEnd());
	} else {
		const importsInFile = reparsed.statements.filter(ts.isImportDeclaration);
		const insertAt = importsInFile.at(-1)?.getEnd() || 0;
		output = output.slice(0, insertAt) + `\nimport { ${imports.join(', ')} } from "./client-ui-ja-strings";` + output.slice(insertAt);
	}

	for (const snapshot of protectedSnapshots) {
		assert.ok(output.includes(snapshot), `${file}: Team Import/Export region changed`);
	}
	assert.deepEqual(
		output.split('\n').filter(line => /PSDisplayNames|display(?:Species|Move|Ability|Item)Name/.test(line)),
		displayNameSnapshot,
		`${file}: existing display-name integration changed`
	);
	assert.deepEqual(
		output.match(/data-(?:cmd|tooltip)=(?:"[^"]*"|'[^']*'|\{[^}]*\})/g) || [],
		commandSnapshot,
		`${file}: data-cmd/data-tooltip changed`
	);
	fs.writeFileSync(filePath, output);
	return { file, replacements: ordered.length, groups: [...usedGroups].sort(), exports: imports };
}

function updateInventoryTargets(results) {
	let source = fs.readFileSync(TEST_PATH, 'utf8');
	for (const result of results) {
		const oneLine = `{ file: '${result.file}' },`;
		const replacement = `{\n\t\tfile: '${result.file}',\n\t\tappliedGroups: ${JSON.stringify(result.groups)},\n\t},`;
		assert.equal(source.split(oneLine).length - 1, 1, `${result.file}: inventory target shape changed`);
		source = source.replace(oneLine, replacement);
	}
	fs.writeFileSync(TEST_PATH, source);
}

function writeRegressionTest(results) {
	const testPath = path.join(ROOT, 'test/teambuilder-ja-chrome.js');
	const references = results.flatMap(result => result.exports.map(exportName => [result.file, exportName]));
	const content = `'use strict';\n\n` +
		`const assert = require('node:assert/strict');\n` +
		`const fs = require('node:fs');\n` +
		`const path = require('node:path');\n` +
		`const test = require('node:test');\n\n` +
		`const ROOT = path.resolve(__dirname, '..');\n` +
		`const TARGETS = ${JSON.stringify(TARGETS, null, 2)};\n\n` +
		`test('applies typed Japanese chrome to every Teambuilder target', () => {\n` +
		`\tconst sources = new Map(TARGETS.map(file => [file, fs.readFileSync(path.join(ROOT, file), 'utf8')]));\n` +
		references.map(([file, exportName]) => `\tassert.match(sources.get(${JSON.stringify(file)}), /${exportName}\\./);`).join('\n') + `\n` +
		`});\n\n` +
		`test('keeps Team Import/Export UI in English', () => {\n` +
		`\tconst source = TARGETS.map(file => fs.readFileSync(path.join(ROOT, file), 'utf8')).join('\\n');\n` +
		`\tassert.match(source, /Import\\/Export/);\n` +
		`\tassert.match(source, /Paste exported teams, pokepaste URLs, or JSON here/);\n` +
		`});\n`;
	fs.writeFileSync(testPath, content);
}

const frameworkMap = readFrameworkMap();
const results = TARGETS.map(file => applyTarget(file, frameworkMap));
updateInventoryTargets(results);
writeRegressionTest(results);
console.log(JSON.stringify(results, null, 2));
