#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const serverRoot = path.resolve(process.argv[2] || '../server');
const outputPath = path.resolve(process.argv[3] || 'phase-3-t3-02-targets.json');
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
	if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name)) return name.text;
	if (ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) {
		return name.text;
	}
	if (ts.isComputedPropertyName(name) &&
		(ts.isStringLiteral(name.expression) || ts.isNoSubstitutionTemplateLiteral(name.expression))) {
		return name.expression.text;
	}
	throw new Error(`Unsupported key: ${name.getText(sourceFile)}`);
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
			if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) fields.set(key, value.text);
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
					if (ts.isStringLiteral(modValue) || ts.isNoSubstitutionTemplateLiteral(modValue)) {
						fields.set(`${modKey}Gen${key.charAt(3)}`, modValue.text);
					}
				}
			} else if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
				fields.set(key, value.text);
			}
		}
		result.set(namespace, fields);
	}
	return result;
}

function mergeTables(tables) {
	const result = new Map();
	for (const table of tables) {
		for (const [namespace, fields] of table) {
			const merged = result.get(namespace) || new Map();
			for (const [key, value] of fields) merged.set(key, value);
			result.set(namespace, merged);
		}
	}
	return result;
}

function resolveTemplate(table, namespace, key, seen = []) {
	const marker = `${namespace}.${key}`;
	if (seen.includes(marker)) throw new Error(`Alias cycle: ${[...seen, marker].join(' -> ')}`);
	const raw = table.get(namespace)?.get(key);
	if (raw === undefined) throw new Error(`Missing template: ${marker}`);
	if (!raw.startsWith('#')) return {resolvedEnglish: raw, aliasChain: seen};
	const [aliasNamespace, aliasKey = key] = raw.slice(1).split('.');
	return resolveTemplate(table, aliasNamespace, aliasKey, [...seen, marker]);
}

const defaultTable = loadDefault();
const movesTable = loadAssigned('data/text/moves.ts', 'MovesText');
const abilitiesTable = loadAssigned('data/text/abilities.ts', 'AbilitiesText');
const itemsTable = loadAssigned('data/text/items.ts', 'ItemsText');
const allEnglish = mergeTables([defaultTable, movesTable, abilitiesTable, itemsTable]);
const targets = [];
const unmatched = [];
for (const [namespace, keys] of Object.entries(inventory.byNamespace)) {
	for (const key of keys) {
		const rawEnglish = movesTable.get(namespace)?.get(key);
		if (rawEnglish === undefined) {
			unmatched.push({namespace, key});
			continue;
		}
		const {resolvedEnglish, aliasChain} = resolveTemplate(allEnglish, namespace, key);
		targets.push({
			namespace,
			key,
			rawEnglish,
			resolvedEnglish,
			aliasChain,
			placeholders: resolvedEnglish.match(PLACEHOLDER) || [],
		});
	}
}
targets.sort((a, b) => a.namespace.localeCompare(b.namespace) || a.key.localeCompare(b.key));
const byNamespace = {};
for (const target of targets) (byNamespace[target.namespace] ||= []).push(target.key);
const result = {
	serverInventorySha: inventory.generatedFromServerSha,
	clientBaselineSha: inventory.generatedFromClientSha,
	totalTargets: targets.length,
	targetNamespaces: Object.keys(byNamespace).length,
	byNamespace,
	targets,
	unmatchedCount: unmatched.length,
	unmatched,
};
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${outputPath}: ${targets.length} move keys across ${Object.keys(byNamespace).length} namespaces`);
console.log(`Unmatched inventory keys: ${unmatched.length}`);
