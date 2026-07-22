#!/usr/bin/env node

import fs from 'node:fs';
import ts from 'typescript';

const targetPath = process.argv[2] || 'play.pokemonshowdown.com/src/battle-text-ja.js';
const fragmentPath = process.argv[3] || 'build-tools/phase3-t3-01-battle-text.fragment.js';

function parse(filePath, kind = ts.ScriptKind.JS) {
	const text = fs.readFileSync(filePath, 'utf8');
	return {
		text,
		file: ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, kind),
	};
}

function findVariableObject(sourceFile, name) {
	let declaration = null;
	function visit(node) {
		if (declaration) return;
		if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
			if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) {
				throw new Error(`${name} is not initialized with an object literal`);
			}
			declaration = node;
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	if (!declaration) throw new Error(`Could not find ${name}`);
	return declaration;
}

function propertyName(node, sourceFile) {
	if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	throw new Error(`Unsupported property name: ${node.getText(sourceFile)}`);
}

function propertyMap(object, sourceFile) {
	const result = new Map();
	for (const property of object.properties) {
		if (!ts.isPropertyAssignment(property)) continue;
		result.set(propertyName(property.name, sourceFile), property);
	}
	return result;
}

function withoutTrailingComma(text) {
	return text.replace(/,\s*$/, '');
}

const target = parse(targetPath);
if (target.file.parseDiagnostics.length) {
	throw new Error(`Input has syntax errors: ${target.file.parseDiagnostics[0].messageText}`);
}
const fragment = parse(fragmentPath);
const mainDeclaration = findVariableObject(target.file, 'JAPANESE_BATTLE_TEXT');
const additionDeclaration = findVariableObject(fragment.file, 'PHASE3_T3_01_BATTLE_TEXT');
const mainObject = mainDeclaration.initializer;
const additionObject = additionDeclaration.initializer;
const mainNamespaces = propertyMap(mainObject, target.file);
const edits = [];
const newNamespaceTexts = [];
let integratedKeys = 0;

for (const additionNamespace of additionObject.properties) {
	if (!ts.isPropertyAssignment(additionNamespace)) continue;
	const namespace = propertyName(additionNamespace.name, fragment.file);
	if (!ts.isObjectLiteralExpression(additionNamespace.initializer)) {
		throw new Error(`Addition namespace ${namespace} is not an object literal`);
	}
	const existingNamespace = mainNamespaces.get(namespace);
	if (!existingNamespace) {
		newNamespaceTexts.push(withoutTrailingComma(additionNamespace.getText(fragment.file)));
		integratedKeys += additionNamespace.initializer.properties.length;
		continue;
	}
	if (!ts.isObjectLiteralExpression(existingNamespace.initializer)) {
		throw new Error(`Existing namespace ${namespace} is not an object literal`);
	}
	const existingKeys = propertyMap(existingNamespace.initializer, target.file);
	const additions = [];
	for (const additionProperty of additionNamespace.initializer.properties) {
		if (!ts.isPropertyAssignment(additionProperty)) continue;
		const key = propertyName(additionProperty.name, fragment.file);
		if (existingKeys.has(key)) throw new Error(`T3-01 would overwrite ${namespace}.${key}`);
		additions.push(withoutTrailingComma(additionProperty.getText(fragment.file)));
		integratedKeys++;
	}
	if (!additions.length) continue;
	const initializer = existingNamespace.initializer;
	const multiline = initializer.getText(target.file).includes('\n');
	const insertion = multiline ?
		additions.map(text => `\n\t\t\t${text},`).join('') :
		`${initializer.properties.length ? ', ' : ''}${additions.join(', ')}`;
	edits.push({position: initializer.end - 1, text: insertion});
}

if (newNamespaceTexts.length) {
	const insertion = newNamespaceTexts.map(text => `\n\t\t${text},`).join('');
	edits.push({position: mainObject.end - 1, text: insertion});
}

edits.sort((a, b) => b.position - a.position);
let output = target.text;
for (const edit of edits) {
	output = output.slice(0, edit.position) + edit.text + output.slice(edit.position);
}
const parsedOutput = ts.createSourceFile(targetPath, output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
if (parsedOutput.parseDiagnostics.length) {
	throw new Error(`Integrated output has syntax errors: ${parsedOutput.parseDiagnostics[0].messageText}`);
}
fs.writeFileSync(targetPath, output);
console.log(`Integrated ${integratedKeys} T3-01 keys directly into JAPANESE_BATTLE_TEXT.`);
