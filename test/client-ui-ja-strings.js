'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const FRAMEWORK_PATH = path.join(
	ROOT,
	'play.pokemonshowdown.com/src/client-ui-ja-strings.ts'
);
const TARGETS = [
	{
		file: 'play.pokemonshowdown.com/src/panel-battle.tsx',
		appliedGroups: ['BattleChromeSources', 'SharedChromeSources'],
	},
	{
		file: 'play.pokemonshowdown.com/src/panel-popups.tsx',
		classes: ['BattleForfeitPanel', 'ReplacePlayerPanel'],
	},
	{
		file: 'play.pokemonshowdown.com/src/battle-team-editor.tsx',
		appliedGroups: ["SharedChromeSources","TeambuilderChromeSources"],
	},
	{
		file: 'play.pokemonshowdown.com/src/panel-teambuilder.tsx',
		appliedGroups: ["SharedChromeSources","TeambuilderListChromeSources"],
	},
	{
		file: 'play.pokemonshowdown.com/src/panel-teambuilder-team.tsx',
		appliedGroups: ["SharedChromeSources","TeambuilderTeamChromeSources"],
	},
	{
		file: 'play.pokemonshowdown.com/src/panel-teamdropdown.tsx',
		appliedGroups: ["SharedChromeSources","TeamDropdownChromeSources"],
	},
];

function normalizeText(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function hasEnglish(value) {
	return /[A-Za-z]/.test(value.replace(/&(?:[A-Za-z][A-Za-z0-9]+|#\d+|#x[0-9A-Fa-f]+);/g, ''));
}

function staticText(node) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	if (ts.isTemplateExpression(node)) {
		let result = node.head.text;
		for (const span of node.templateSpans) result += '${…}' + span.literal.text;
		return result;
	}
	return null;
}

function renderedExpressionStrings(expression) {
	const results = [];
	function collect(node) {
		const text = staticText(node);
		if (text !== null) {
			results.push(text);
			return;
		}
		if (
			ts.isParenthesizedExpression(node) || ts.isAsExpression(node) ||
			ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)
		) {
			collect(node.expression);
			return;
		}
		if (ts.isConditionalExpression(node)) {
			collect(node.whenTrue);
			collect(node.whenFalse);
			return;
		}
		if (ts.isArrayLiteralExpression(node)) {
			for (const element of node.elements) collect(element);
			return;
		}
		if (ts.isBinaryExpression(node) && (
			node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
			node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
		)) {
			collect(node.right);
		}
	}
	collect(expression);
	return results;
}

function jsxAttributeName(attribute) {
	return attribute.name.getText();
}

function openingElementHasDataTooltip(openingElement) {
	return openingElement.attributes.properties.some(attribute => (
		ts.isJsxAttribute(attribute) && jsxAttributeName(attribute) === 'data-tooltip'
	));
}

function collectNotify(call, addText) {
	if (!ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== 'notify') return;
	const receiver = call.expression.expression.getText();
	if (!/(?:^|\.)room$|\.room\b/.test(receiver)) return;
	const [first, second] = call.arguments;
	if (first && ts.isObjectLiteralExpression(first)) {
		for (const property of first.properties) {
			if (!ts.isPropertyAssignment(property)) continue;
			const key = property.name.getText().replace(/^['"]|['"]$/g, '');
			if (!['title', 'body'].includes(key)) continue;
			const text = staticText(property.initializer);
			if (text !== null) addText(text);
		}
		return;
	}
	for (const argument of [first, second]) {
		if (!argument) continue;
		const text = staticText(argument);
		if (text !== null) addText(text);
	}
}

function targetRoots(sourceFile, target) {
	if (!target.classes) return [sourceFile];
	const roots = [];
	const found = new Set();
	for (const statement of sourceFile.statements) {
		if (!ts.isClassDeclaration(statement) || !statement.name) continue;
		if (!target.classes.includes(statement.name.text)) continue;
		roots.push(statement);
		found.add(statement.name.text);
	}
	assert.deepEqual(
		[...found].sort(),
		[...target.classes].sort(),
		`${target.file}: scoped popup classes changed`
	);
	return roots;
}

function scanInventorySource(groups) {
	const entries = [];
	for (const target of TARGETS) {
		const filePath = path.join(ROOT, target.file);
		const sourceFile = ts.createSourceFile(
			filePath,
			fs.readFileSync(filePath, 'utf8'),
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);
		function addText(rawText) {
			const text = normalizeText(rawText);
			if (text && hasEnglish(text)) entries.push(text);
		}
		function addAppliedReference(node) {
			if (!target.appliedGroups || !ts.isPropertyAccessExpression(node) || !ts.isIdentifier(node.expression)) {
				return;
			}
			const groupName = node.expression.text.replace(/JA$/, 'Sources');
			if (!target.appliedGroups.includes(groupName)) return;
			const group = groups.get(groupName);
			assert.ok(group, `${target.file}: missing ${groupName}`);
			const entry = group.find(candidate => candidate.key === node.name.text);
			assert.ok(entry, `${target.file}: unknown ${node.expression.text}.${node.name.text}`);
			entries.push(entry.english);
		}
		function visit(node) {
			if (ts.isJsxText(node)) {
				addText(node.getText(sourceFile));
			} else if (
				ts.isJsxExpression(node) && node.expression &&
				(ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
			) {
				for (const text of renderedExpressionStrings(node.expression)) addText(text);
			} else if (ts.isJsxAttribute(node)) {
				const name = jsxAttributeName(node);
				if (name === 'placeholder' || name === 'title') {
					const openingElement = node.parent.parent;
					if (name === 'title' && openingElementHasDataTooltip(openingElement)) {
						ts.forEachChild(node, visit);
						return;
					}
					if (node.initializer && ts.isStringLiteral(node.initializer)) {
						addText(node.initializer.text);
					} else if (
						node.initializer && ts.isJsxExpression(node.initializer) &&
						node.initializer.expression
					) {
						const text = staticText(node.initializer.expression);
						if (text !== null) addText(text);
					}
				}
			} else if (ts.isCallExpression(node)) {
				collectNotify(node, addText);
			}
			addAppliedReference(node);
			ts.forEachChild(node, visit);
		}
		for (const root of targetRoots(sourceFile, target)) visit(root);
	}
	return entries;
}

function readFrameworkSources() {
	const source = fs.readFileSync(FRAMEWORK_PATH, 'utf8');
	const sourceFile = ts.createSourceFile(
		FRAMEWORK_PATH,
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS
	);
	const groups = new Map();
	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) continue;
		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || !declaration.name.text.endsWith('Sources')) continue;
			let initializer = declaration.initializer;
			if (initializer && ts.isAsExpression(initializer)) initializer = initializer.expression;
			assert.ok(
				initializer && ts.isObjectLiteralExpression(initializer),
				`${declaration.name.text} must be an object literal`
			);
			const entries = [];
			for (const property of initializer.properties) {
				assert.ok(ts.isPropertyAssignment(property), `${declaration.name.text} must use property assignments`);
				assert.ok(ts.isArrayLiteralExpression(property.initializer), `${property.name.getText()} must be a tuple`);
				assert.equal(property.initializer.elements.length, 2, `${property.name.getText()} must contain English and Japanese`);
				const [englishNode, japaneseNode] = property.initializer.elements;
				assert.ok(ts.isStringLiteral(englishNode), `${property.name.getText()} English source must be a string`);
				assert.ok(ts.isStringLiteral(japaneseNode), `${property.name.getText()} Japanese value must be a string`);
				entries.push({
					key: property.name.getText(sourceFile),
					english: englishNode.text,
					japanese: japaneseNode.text,
				});
			}
			groups.set(declaration.name.text, entries);
		}
	}
	return { source, groups };
}

test('covers every Phase 3 UI chrome inventory string exactly once', () => {
	const { source, groups } = readFrameworkSources();
	const inventoryEntries = scanInventorySource(groups);
	const inventoryStrings = new Set(inventoryEntries);
	assert.equal(inventoryEntries.length, 325);
	assert.equal(inventoryStrings.size, 233);
	assert.deepEqual(
		[...groups.keys()].sort(),
		[
			'BattleChromeSources',
			'ForfeitDialogSources',
			'SharedChromeSources',
			'TeamDropdownChromeSources',
			'TeambuilderChromeSources',
			'TeambuilderListChromeSources',
			'TeambuilderTeamChromeSources',
		].sort()
	);

	const frameworkEntries = [...groups.values()].flat();
	const frameworkStrings = new Set(frameworkEntries.map(entry => entry.english));
	assert.equal(frameworkEntries.length, 233);
	assert.equal(frameworkStrings.size, 233, 'an English source string is assigned to more than one key');
	assert.deepEqual(
		[...frameworkStrings].sort(),
		[...inventoryStrings].sort()
	);
	for (const entry of frameworkEntries) {
		assert.ok(entry.key, `${entry.english}: missing semantic key`);
		assert.ok(entry.japanese, `${entry.english}: missing Japanese value`);
		if (entry.english !== 'Esc') {
			assert.notEqual(entry.japanese, entry.english, `${entry.english}: untranslated value`);
		}
	}
	assert.match(source, /export const BattleChromeJA/);
	assert.match(source, /export const ForfeitDialogJA/);
	assert.match(source, /export const TeambuilderChromeJA/);
	assert.match(source, /export const UIChromeJAByEnglish/);
});
