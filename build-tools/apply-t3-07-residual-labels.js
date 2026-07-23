'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const FRAMEWORK = path.join(ROOT, 'play.pokemonshowdown.com/src/client-ui-ja-strings.ts');
const TARGETS = [
	'play.pokemonshowdown.com/src/battle-team-editor.tsx',
	'play.pokemonshowdown.com/src/panel-teambuilder.tsx',
	'play.pokemonshowdown.com/src/panel-teambuilder-team.tsx',
	'play.pokemonshowdown.com/src/panel-teamdropdown.tsx',
];
const GROUP_EXPORTS = {
	SharedChromeSources: 'SharedChromeJA',
	TeambuilderChromeSources: 'TeambuilderChromeJA',
	TeambuilderListChromeSources: 'TeambuilderListChromeJA',
	TeambuilderTeamChromeSources: 'TeambuilderTeamChromeJA',
	TeamDropdownChromeSources: 'TeamDropdownChromeJA',
};
const PROTECTED_MARKERS = new Set([
	'Import/Export',
	'Paste exported teams, pokepaste URLs, or JSON here',
	'Fetching Paste...',
	'Import',
	'Import/Export Set',
]);

function normalize(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function unwrap(node) {
	while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node))) node = node.expression;
	return node;
}

function frameworkMap() {
	const source = fs.readFileSync(FRAMEWORK, 'utf8');
	const sourceFile = ts.createSourceFile(FRAMEWORK, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const map = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name)) continue;
			const group = declaration.name.text;
			const exportName = GROUP_EXPORTS[group];
			if (!exportName) continue;
			const object = unwrap(declaration.initializer);
			assert.ok(object && ts.isObjectLiteralExpression(object));
			for (const property of object.properties) {
				if (!ts.isPropertyAssignment(property) || !ts.isArrayLiteralExpression(property.initializer)) continue;
				const english = property.initializer.elements[0];
				if (!ts.isStringLiteral(english)) continue;
				const key = property.name.getText(sourceFile).replace(/^['"]|['"]$/g, '');
				map.set(english.text, { group, exportName, key });
			}
		}
	}
	return map;
}

function staticText(node) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (ts.isTemplateExpression(node)) {
		let text = node.head.text;
		for (const span of node.templateSpans) text += '$' + '{…}' + span.literal.text;
		return text;
	}
	return null;
}

function declarationName(node, sourceFile) {
	if (
		ts.isClassDeclaration(node) || ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) ||
		ts.isPropertyDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)
	) return node.name?.getText(sourceFile) || '';
	if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) return node.name.text;
	return '';
}

function protectedRanges(sourceFile, source) {
	const ranges = [];
	function declarations(node) {
		const name = declarationName(node, sourceFile);
		if (name && /(?:import|export|paste)/i.test(name)) {
			ranges.push([node.getFullStart(), node.getEnd(), source.slice(node.getFullStart(), node.getEnd())]);
			return;
		}
		ts.forEachChild(node, declarations);
	}
	declarations(sourceFile);

	function containsMarker(node) {
		if (ts.isJsxText(node) && PROTECTED_MARKERS.has(normalize(node.getText(sourceFile)))) return true;
		const text = staticText(node);
		if (text !== null && PROTECTED_MARKERS.has(normalize(text))) return true;
		let found = false;
		ts.forEachChild(node, child => {
			if (!found && containsMarker(child)) found = true;
		});
		return found;
	}
	function containsTextarea(node) {
		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			if (/^(?:textarea|PSTextarea|TeamTextbox)$/i.test(node.tagName.getText(sourceFile))) return true;
		}
		let found = false;
		ts.forEachChild(node, child => {
			if (!found && containsTextarea(child)) found = true;
		});
		return found;
	}
	function jsx(node) {
		if ((ts.isJsxElement(node) || ts.isJsxFragment(node)) && containsMarker(node) && containsTextarea(node)) {
			ranges.push([node.getFullStart(), node.getEnd(), source.slice(node.getFullStart(), node.getEnd())]);
			return;
		}
		ts.forEachChild(node, jsx);
	}
	jsx(sourceFile);
	return ranges;
}

function inside(node, ranges) {
	const start = node.getStart();
	const end = node.getEnd();
	return ranges.some(([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd);
}

function renderedContext(node, sourceFile) {
	let current = node.parent;
	while (current && !ts.isSourceFile(current)) {
		if (ts.isJsxAttribute(current)) {
			const name = current.name.getText(sourceFile);
			if (name !== 'placeholder' && name !== 'title') return false;
			if (name === 'title') {
				const opening = current.parent.parent;
				if (opening.attributes.properties.some(attribute => (
					ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'data-tooltip'
				))) return false;
			}
			return true;
		}
		if (ts.isJsxExpression(current)) return true;
		if (
			ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) || ts.isArrowFunction(current) ||
			ts.isMethodDeclaration(current) || ts.isClassDeclaration(current)
		) return false;
		current = current.parent;
	}
	return false;
}

function addImport(source, filePath, exports) {
	if (!exports.size) return source;
	const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const existing = sourceFile.statements.find(statement => (
		ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) &&
		statement.moduleSpecifier.text === './client-ui-ja-strings'
	));
	if (existing) {
		const bindings = existing.importClause?.namedBindings;
		assert.ok(bindings && ts.isNamedImports(bindings));
		const names = bindings.elements.map(element => element.name.text);
		const merged = [...new Set([...names, ...exports])].sort();
		return source.slice(0, existing.getStart(sourceFile)) +
			`import { ${merged.join(', ')} } from "./client-ui-ja-strings";` + source.slice(existing.getEnd());
	}
	const imports = sourceFile.statements.filter(ts.isImportDeclaration);
	const at = imports.at(-1)?.getEnd() || 0;
	return source.slice(0, at) + `\nimport { ${[...exports].sort().join(', ')} } from "./client-ui-ja-strings";` + source.slice(at);
}

function restoreProtectedBackupUi(file, source) {
	if (!file.endsWith('/panel-teambuilder.tsx')) return source;
	return source
		.replace('<i class="fa fa-caret-left" aria-hidden></i> {SharedChromeJA.back}', '<i class="fa fa-caret-left" aria-hidden></i> Back')
		.replace('<i class="fa fa-file-code-o" aria-hidden></i> {TeambuilderListChromeJA.backup}', '<i class="fa fa-file-code-o" aria-hidden></i> Backup')
		.replace("{room.searchTerms.length ? TeambuilderListChromeJA.searchResults : room.curFolder ? TeambuilderListChromeJA.folder : ''}", "{room.searchTerms.length ? ' search results' : room.curFolder ? ' folder' : ''}");
}

function transform(file, map) {
	const filePath = path.join(ROOT, file);
	let source = restoreProtectedBackupUi(file, fs.readFileSync(filePath, 'utf8'));
	let sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const ranges = protectedRanges(sourceFile, source);
	const snapshots = ranges.map(range => range[2]);
	const replacements = [];
	const exports = new Set();

	function add(node, text, jsxText = false) {
		const normalized = normalize(text);
		const entry = map.get(normalized);
		if (!entry || PROTECTED_MARKERS.has(normalized) || inside(node, ranges)) return;
		let replacement;
		if (jsxText) {
			const raw = node.getText(sourceFile);
			const leading = raw.match(/^\s*/)?.[0] || '';
			const trailing = raw.match(/\s*$/)?.[0] || '';
			replacement = `${leading}{${entry.exportName}.${entry.key}}${trailing}`;
		} else if (ts.isTemplateExpression(node)) {
			assert.equal(node.templateSpans.length, 1, `${file}: multi-placeholder string ${normalized}`);
			const expression = node.templateSpans[0].expression.getText(sourceFile);
			replacement = `${entry.exportName}.${entry.key}.replace('$' + '{…}', String(${expression}))`;
		} else if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent.parent)) {
			replacement = `{${entry.exportName}.${entry.key}}`;
		} else {
			replacement = `${entry.exportName}.${entry.key}`;
		}
		exports.add(entry.exportName);
		replacements.push([node.getStart(sourceFile), node.getEnd(), replacement, normalized]);
	}

	function visit(node) {
		if (ts.isJsxText(node)) add(node, node.getText(sourceFile), true);
		if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) && renderedContext(node, sourceFile)) {
			add(node, staticText(node));
			if (ts.isTemplateExpression(node)) return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);

	const unique = new Map();
	for (const replacement of replacements) unique.set(`${replacement[0]}:${replacement[1]}`, replacement);
	for (const [start, end, replacement] of [...unique.values()].sort((a, b) => b[0] - a[0])) {
		source = source.slice(0, start) + replacement + source.slice(end);
	}
	source = addImport(source, filePath, exports);
	for (const snapshot of snapshots) assert.ok(source.includes(snapshot), `${file}: Import/Export changed`);
	fs.writeFileSync(filePath, source);

	sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const afterRanges = protectedRanges(sourceFile, source);
	const remaining = [];
	function scan(node) {
		if (ts.isJsxText(node)) {
			const text = normalize(node.getText(sourceFile));
			if (map.has(text) && !PROTECTED_MARKERS.has(text) && !inside(node, afterRanges)) remaining.push(text);
		}
		if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) && renderedContext(node, sourceFile)) {
			const text = normalize(staticText(node));
			if (map.has(text) && !PROTECTED_MARKERS.has(text) && !inside(node, afterRanges)) remaining.push(text);
			if (ts.isTemplateExpression(node)) return;
		}
		ts.forEachChild(node, scan);
	}
	scan(sourceFile);
	assert.deepEqual(remaining, [], `${file}: eligible English chrome remains`);
	return { file, replacements: unique.size };
}

const map = frameworkMap();
const results = TARGETS.map(file => transform(file, map));
console.log(JSON.stringify(results, null, 2));
