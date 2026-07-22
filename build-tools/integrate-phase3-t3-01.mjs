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

const target = parse(targetPath);
if (!target.text.includes('const PHASE3_T3_01_BATTLE_TEXT = {')) {
	console.log('T3-01 translations are already integrated directly.');
	process.exit(0);
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
		newNamespaceTexts.push(additionNamespace.getText(fragment.file));
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
		additions.push(additionProperty.getText(fragment.file));
		integratedKeys++;
	}
	if (!additions.length) continue;
	const initializer = existingNamespace.initializer;
	const multiline = initializer.getText(target.file).includes('\n');
	const insertion = multiline ?
		additions.map(text => `\n\t\t\t${text}`).join('') :
		`${initializer.properties.length ? ', ' : ''}${additions.join(', ')}`;
	edits.push({position: initializer.end - 1, text: insertion});
}

if (newNamespaceTexts.length) {
	const insertion = newNamespaceTexts.map(text => `\n\t\t${text}`).join('');
	edits.push({position: mainObject.end - 1, text: insertion});
}

let phaseStatement = null;
let mergeStatement = null;
for (const statement of target.file.statements) {
	if (!ts.isExpressionStatement(statement) || !ts.isCallExpression(statement.expression)) continue;
	const expression = statement.expression.expression;
	if (!ts.isParenthesizedExpression(expression) || !ts.isArrowFunction(expression.expression)) continue;
	const body = expression.expression.body;
	if (!ts.isBlock(body)) continue;
	for (const inner of body.statements) {
		if (ts.isVariableStatement(inner)) {
			for (const declaration of inner.declarationList.declarations) {
				if (ts.isIdentifier(declaration.name) && declaration.name.text === 'PHASE3_T3_01_BATTLE_TEXT') {
					phaseStatement = inner;
				}
			}
		}
		if (phaseStatement && ts.isForOfStatement(inner) && inner.pos > phaseStatement.pos &&
			inner.getText(target.file).includes('PHASE3_T3_01_BATTLE_TEXT')) {
			mergeStatement = inner;
			break;
		}
	}
}
if (!phaseStatement || !mergeStatement) throw new Error('Temporary T3-01 merge block was not found');
let removalEnd = mergeStatement.end;
while (removalEnd < target.text.length && (target.text[removalEnd] === '\n' || target.text[removalEnd] === '\r')) {
	removalEnd++;
}
edits.push({position: phaseStatement.getFullStart(), end: removalEnd, text: ''});

edits.sort((a, b) => b.position - a.position);
let output = target.text;
for (const edit of edits) {
	output = output.slice(0, edit.position) + edit.text + output.slice(edit.end ?? edit.position);
}
if (output.includes('PHASE3_T3_01_BATTLE_TEXT')) {
	throw new Error('Temporary T3-01 merge object remains after integration');
}
fs.writeFileSync(targetPath, output);
console.log(`Integrated ${integratedKeys} T3-01 keys directly into JAPANESE_BATTLE_TEXT.`);
