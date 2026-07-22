'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const sourcePath = path.resolve(
	__dirname,
	'../play.pokemonshowdown.com/src/battle-text-ja.js'
);
const source = fs.readFileSync(sourcePath, 'utf8');

function replace(template, replacements) {
	let output = template;
	for (const [key, value] of Object.entries(replacements)) output = output.replaceAll(`[${key}]`, value || '');
	return output + '\n';
}

function buildContext() {
	const BattleText = {
		default: {
			move: '[POKEMON] used **[MOVE]**!',
			superEffective: "  It's super effective!",
			crit: '  A critical hit!',
			turn: '== Turn [NUMBER] ==',
			switchIn: '[TRAINER] sent out [FULLNAME]!',
			faint: '[POKEMON] fainted!',
		},
		brn: { start: '  [POKEMON] was burned!' },
		raindance: { start: '  It started to rain!' },
	};
	class BattleTextParser {
		parseArgsInner(args) {
			switch (args[0]) {
			case 'move':
				return replace(BattleText.default.move, {
					POKEMON: args[1].slice(args[1].indexOf(':') + 1).trim(),
					MOVE: args[2],
				});
			case '-supereffective': return BattleText.default.superEffective + '\n';
			case '-crit': return BattleText.default.crit + '\n';
			case '-status': return replace(BattleText[args[2]].start, {
				POKEMON: args[1].slice(args[1].indexOf(':') + 1).trim(),
			});
			case '-weather': return BattleText[args[1]].start + '\n';
			case 'switch': return replace(BattleText.default.switchIn, {
				TRAINER: 'Alice', FULLNAME: `**${args[2].split(',')[0]}**`,
			});
			case 'faint': return replace(BattleText.default.faint, {
				POKEMON: args[1].slice(args[1].indexOf(':') + 1).trim(),
			});
			case 'turn': return replace(BattleText.default.turn, { NUMBER: args[1] });
			default: return '';
			}
		}
	}
	const window = {
		PSDisplayNames: {
			displaySpeciesName(name) {
				return { Pikachu: 'ピカチュウ', Charizard: 'リザードン' }[name] || name;
			},
			displayMoveName(name) {
				return { Thunderbolt: '10まんボルト' }[name] || name;
			},
			displayAbilityName(name) {
				return { Static: 'せいでんき' }[name] || name;
			},
			displayItemName(name) {
				return { 'Light Ball': 'でんきだま' }[name] || name;
			},
		},
	};
	const context = vm.createContext({ BattleText, BattleTextParser, Object, window });
	vm.runInContext(source, context);
	return { BattleText, BattleTextParser, window };
}

test('installs Japanese fixed battle templates with numeric placeholders intact', () => {
	const { BattleText, window } = buildContext();
	assert.equal(BattleText.default.superEffective, '  効果はばつぐんだ！');
	assert.equal(BattleText.default.crit, '  急所に当たった！');
	assert.equal(BattleText.brn.start, '  [POKEMON]はやけどを負った！');
	assert.equal(BattleText.raindance.start, '  雨が降り始めた！');
	assert.match(BattleText.default.turn, /\[NUMBER\]/);
	assert.match(BattleText.default.damagePercentage, /\[PERCENTAGE\]/);
	assert.equal(window.PSJapaneseBattleText.installed, true);
	assert.ok(window.PSJapaneseBattleText.templates > 100);
});

test('renders representative Japanese battle log messages and display names', () => {
	const { BattleTextParser } = buildContext();
	const parser = new BattleTextParser();
	assert.equal(parser.parseArgsInner(['move', 'p1a: Pikachu', 'Thunderbolt'], {}), 'ピカチュウの **10まんボルト**！\n');
	assert.equal(parser.parseArgsInner(['-supereffective', 'p2a: Charizard'], {}), '  効果はばつぐんだ！\n');
	assert.equal(parser.parseArgsInner(['-crit', 'p2a: Charizard'], {}), '  急所に当たった！\n');
	assert.equal(parser.parseArgsInner(['-status', 'p2a: Pikachu', 'brn'], {}), '  ピカチュウはやけどを負った！\n');
	assert.equal(parser.parseArgsInner(['-weather', 'raindance'], {}), '  雨が降り始めた！\n');
	assert.equal(parser.parseArgsInner(['switch', 'p1a: Sparky', 'Pikachu, L50'], {}), 'Aliceは**ピカチュウ**を繰り出した！\n');
	assert.equal(parser.parseArgsInner(['faint', 'p2a: Charizard'], {}), 'リザードンは倒れた！\n');
	assert.equal(parser.parseArgsInner(['turn', '12'], {}), '== ターン 12 ==\n');
});

test('does not mutate protocol arguments or numeric fields', () => {
	const { BattleTextParser } = buildContext();
	const parser = new BattleTextParser();
	const args = ['move', 'p1a: Pikachu', 'Thunderbolt'];
	const kwArgs = { number: '3', from: 'ability: Static', item: 'Light Ball' };
	const argsBefore = [...args];
	const kwArgsBefore = { ...kwArgs };
	parser.parseArgsInner(args, kwArgs);
	assert.deepEqual(args, argsBefore);
	assert.deepEqual(kwArgs, kwArgsBefore);
});
