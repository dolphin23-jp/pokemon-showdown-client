#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const serverRoot = path.resolve(process.argv[2] || '../server');
const outputPath = path.resolve(process.argv[3] || 'phase-3-t3-01-targets.json');
const inventory = JSON.parse(fs.readFileSync(
	path.join(serverRoot, 'docs/localization/phase-3-battle-text-inventory.json'), 'utf8'
));
const PLACEHOLDER = /\[[A-Z][A-Z0-9]*\]/g;

function parseSource(relativePath, variableName) {
	const filePath = path.join(serverRoot, relativePath);
	const sourceText = fs.readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	let object = null;
	function visit(node) {
		if (object) return;
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
			if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) {
				throw new Error(`${variableName} is not an object literal`);
			}
			object = node.initializer;
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	if (!object) throw new Error(`Missing ${variableName} in ${relativePath}`);
	return {sourceFile, object};
}

function keyName(name, sourceFile) {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ||
		ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
	throw new Error(`Unsupported key: ${name.getText(sourceFile)}`);
}

function stringValue(node, sourceFile) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	throw new Error(`Expected static string, got: ${node.getText(sourceFile)}`);
}

function objectEntries(node, sourceFile) {
	const result = new Map();
	for (const property of node.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		result.set(keyName(property.name, sourceFile), property.initializer);
	}
	return result;
}

function loadDefault() {
	const {sourceFile, object} = parseSource('data/text/default.ts', 'DefaultText');
	const result = new Map();
	for (const [namespace, initializer] of objectEntries(object, sourceFile)) {
		if (!ts.isObjectLiteralExpression(initializer)) continue;
		const fields = new Map();
		for (const [key, value] of objectEntries(initializer, sourceFile)) {
			if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
				fields.set(key, stringValue(value, sourceFile));
			}
		}
		result.set(namespace, fields);
	}
	return result;
}

function loadAssigned(relativePath, variableName) {
	const {sourceFile, object} = parseSource(relativePath, variableName);
	const result = new Map();
	for (const [namespace, initializer] of objectEntries(object, sourceFile)) {
		if (!ts.isObjectLiteralExpression(initializer)) continue;
		const fields = new Map();
		for (const [key, value] of objectEntries(initializer, sourceFile)) {
			if (['name', 'desc', 'shortDesc'].includes(key)) continue;
			if (key.startsWith('gen')) {
				if (!ts.isObjectLiteralExpression(value)) throw new Error(`${namespace}.${key} is not an object`);
				for (const [modKey, modValue] of objectEntries(value, sourceFile)) {
					if (['desc', 'shortDesc'].includes(key)) continue;
					if (ts.isStringLiteral(modValue) || ts.isNoSubstitutionTemplateLiteral(modValue)) {
						fields.set(`${modKey}Gen${key.charAt(3)}`, stringValue(modValue, sourceFile));
					}
				}
			} else if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
				fields.set(key, stringValue(value, sourceFile));
			}
		}
		result.set(namespace, fields);
	}
	return result;
}

const sources = [
	['default', loadDefault()],
	['abilities', loadAssigned('data/text/abilities.ts', 'AbilitiesText')],
	['items', loadAssigned('data/text/items.ts', 'ItemsText')],
];
const targets = [];
const unmatched = [];
for (const [namespace, keys] of Object.entries(inventory.byNamespace)) {
	for (const key of keys) {
		let matched = false;
		for (const [source, table] of sources) {
			const english = table.get(namespace)?.get(key);
			if (english === undefined) continue;
			targets.push({
				source,
				namespace,
				key,
				english,
				placeholders: english.match(PLACEHOLDER) || [],
			});
			matched = true;
		}
		if (!matched) unmatched.push({namespace, key});
	}
}
targets.sort((a, b) =>
	sources.findIndex(([name]) => name === a.source) - sources.findIndex(([name]) => name === b.source) ||
	a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key)
);
const bySource = Object.fromEntries(sources.map(([source]) => [source, targets.filter(x => x.source === source).length]));
const byNamespace = {};
for (const target of targets) {
	(byNamespace[target.namespace] ||= []).push(target.key);
}
const result = {
	serverInventorySha: inventory.generatedFromServerSha,
	clientBaselineSha: inventory.generatedFromClientSha,
	totalTargets: targets.length,
	targetNamespaces: Object.keys(byNamespace).length,
	bySource,
	byNamespace,
	targets,
	unmatchedCount: unmatched.length,
	unmatched,
};
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${outputPath}: ${targets.length} keys across ${Object.keys(byNamespace).length} namespaces`);
console.log(JSON.stringify(bySource));
