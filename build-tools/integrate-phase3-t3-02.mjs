#!/usr/bin/env node

import fs from 'node:fs';
import ts from 'typescript';

const targetPath = process.argv[2] || 'play.pokemonshowdown.com/src/battle-text-ja.js';
const fragmentPath = process.argv[3] || 'build-tools/phase3-t3-02-battle-text.fragment.js';

function parse(filePath) {
	const text = fs.readFileSync(filePath, 'utf8');
	const file = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	if (file.parseDiagnostics.length) {
		throw new Error(`Syntax error in ${filePath}: ${file.parseDiagnostics[0].messageText}`);
	}
	return {text, file};
}

function findObject(sourceFile, variableName) {
	let found = null;
	function visit(node) {
		if (found) return;
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === variableName) {
			if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) {
				throw new Error(`${variableName} is not an object literal`);
			}
			found = node.initializer;
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	if (!found) throw new Error(`Missing ${variableName}`);
	return found;
}

function propertyName(name, sourceFile) {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) {
		return name.text;
	}
	throw new Error(`Unsupported property name: ${name.getText(sourceFile)}`);
}

function properties(object, sourceFile) {
	const result = new Map();
	for (const property of object.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		result.set(propertyName(property.name, sourceFile), property);
	}
	return result;
}

function trimComma(text) {
	return text.replace(/,\s*$/, '');
}

const target = parse(targetPath);
const fragment = parse(fragmentPath);
const mainObject = findObject(target.file, 'JAPANESE_BATTLE_TEXT');
const additionsObject = findObject(fragment.file, 'PHASE3_T3_02_BATTLE_TEXT');
const existingNamespaces = properties(mainObject, target.file);
const edits = [];
const newNamespaces = [];
let count = 0;

for (const namespaceProperty of additionsObject.properties) {
	if (!ts.isPropertyAssignment(namespaceProperty)) continue;
	const namespace = propertyName(namespaceProperty.name, fragment.file);
	if (!ts.isObjectLiteralExpression(namespaceProperty.initializer)) {
		throw new Error(`${namespace} is not an object literal`);
	}
	const existingNamespace = existingNamespaces.get(namespace);
	if (!existingNamespace) {
		newNamespaces.push(trimComma(namespaceProperty.getText(fragment.file)));
		count += namespaceProperty.initializer.properties.length;
		continue;
	}
	if (!ts.isObjectLiteralExpression(existingNamespace.initializer)) {
		throw new Error(`Existing namespace ${namespace} is not an object literal`);
	}
	const existingKeys = properties(existingNamespace.initializer, target.file);
	const additions = [];
	for (const property of namespaceProperty.initializer.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		const key = propertyName(property.name, fragment.file);
		if (existingKeys.has(key)) throw new Error(`T3-02 would overwrite ${namespace}.${key}`);
		additions.push(trimComma(property.getText(fragment.file)));
		count++;
	}
	if (!additions.length) continue;
	const object = existingNamespace.initializer;
	const multiline = object.getText(target.file).includes('\n');
	const insertion = multiline ?
		additions.map(text => `\n\t\t\t${text},`).join('') :
		`${object.properties.length ? ', ' : ''}${additions.join(', ')}`;
	edits.push({position: object.end - 1, text: insertion});
}

if (newNamespaces.length) {
	edits.push({
		position: mainObject.end - 1,
		text: newNamespaces.map(text => `\n\t\t${text},`).join('') + '\n\t',
	});
}

edits.sort((a, b) => b.position - a.position);
let output = target.text;
for (const edit of edits) output = output.slice(0, edit.position) + edit.text + output.slice(edit.position);
const check = ts.createSourceFile(targetPath, output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
if (check.parseDiagnostics.length) {
	throw new Error(`Integrated output has syntax errors: ${check.parseDiagnostics[0].messageText}`);
}
fs.writeFileSync(targetPath, output);
console.log(`Integrated ${count} T3-02 move templates.`);
