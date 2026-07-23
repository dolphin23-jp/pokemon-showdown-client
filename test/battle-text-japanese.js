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

function toID(value) {
	return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function buildContext() {
	const BattleText = {
		default: {
			pokemon: '[NICKNAME]',
			opposingPokemon: 'the opposing [NICKNAME]',
			move: '[POKEMON] used **[MOVE]**!',
			abilityActivation: '[[POKEMON]’s [ABILITY]]',
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
		constructor(perspective = 'p1') {
			this.perspective = perspective;
		}
		static parseBattleLine(line) {
			const args = line.slice(1).split('|');
			const kwArgs = {};
			while (args.length > 1) {
				const lastArg = args[args.length - 1];
				if (!lastArg.startsWith('[')) break;
				const bracketPos = lastArg.indexOf(']');
				if (bracketPos <= 0) break;
				kwArgs[lastArg.slice(1, bracketPos)] = lastArg.slice(bracketPos + 1).trim() || '.';
				args.pop();
			}
			return { args, kwArgs };
		}
		static effectId(effect) {
			if (!effect) return '';
			if (effect.startsWith('item:') || effect.startsWith('move:')) effect = effect.slice(5);
			else if (effect.startsWith('ability:')) effect = effect.slice(8);
			return toID(effect);
		}
		pokemonName(pokemon) {
			const colon = pokemon.indexOf(':');
			return colon < 0 ? pokemon : pokemon.slice(colon + 1).trim();
		}
		pokemon(pokemon) {
			if (!pokemon) return '';
			const nickname = this.pokemonName(pokemon);
			const template = pokemon.startsWith(this.perspective) ? BattleText.default.pokemon : BattleText.default.opposingPokemon;
			return template.replace('[NICKNAME]', nickname);
		}
		effect(effect) {
			if (!effect) return '';
			if (effect.startsWith('item:') || effect.startsWith('move:')) effect = effect.slice(5);
			else if (effect.startsWith('ability:')) effect = effect.slice(8);
			return effect.trim();
		}
		template(type, ...namespaces) {
			for (const namespace of namespaces) {
				if (!namespace) continue;
				if (namespace === 'NODEFAULT') return '';
				const id = BattleTextParser.effectId(namespace);
				if (BattleText[id]?.[type]) return BattleText[id][type] + '\n';
			}
			return BattleText.default[type] ? BattleText.default[type] + '\n' : '';
		}
		ability(name, holder) {
			return BattleText.default.abilityActivation
				.replace('[POKEMON]', this.pokemon(holder))
				.replace('[ABILITY]', this.effect(name)) + '\n';
		}
		maybeAbility(effect, holder) {
			if (!effect?.startsWith('ability:')) return '';
			return this.ability(effect.slice(8).trim(), holder);
		}
		parseArgsInner(args, kwArgs) {
			switch (args[0]) {
			case 'move':
				return replace(BattleText.default.move, {
					POKEMON: this.pokemonName(args[1]),
					MOVE: args[2],
				});
			case '-supereffective': return BattleText.default.superEffective + '\n';
			case '-crit': return BattleText.default.crit + '\n';
			case '-status': return replace(BattleText[args[2]].start, {
				POKEMON: this.pokemonName(args[1]),
			});
			case '-weather': return BattleText[args[1]].start + '\n';
			case 'switch': return replace(BattleText.default.switchIn, {
				TRAINER: 'Alice', FULLNAME: `**${args[2].split(',')[0]}**`,
			});
			case 'faint': return replace(BattleText.default.faint, {
				POKEMON: this.pokemonName(args[1]),
			});
			case 'turn': return replace(BattleText.default.turn, { NUMBER: args[1] });
			case '-heal': {
				const [, pokemon] = args;
				const template = this.template('heal', kwArgs.from, 'NODEFAULT') || this.template('heal');
				return template.replace('[POKEMON]', this.pokemon(pokemon))
					.replace('[SOURCE]', this.pokemon(kwArgs.of)).replace('[NICKNAME]', kwArgs.wisher);
			}
			case '-block': {
				const [, pokemon, effect, move, attacker] = args;
				const line1 = this.maybeAbility(effect, kwArgs.of || pokemon);
				const template = this.template('block', effect);
				return line1 + template.replace('[POKEMON]', this.pokemon(pokemon))
					.replace('[SOURCE]', this.pokemon(attacker || kwArgs.of)).replace('[MOVE]', move);
			}
			case 'detailschange': {
				const [, pokemon, details] = args;
				const id = BattleTextParser.effectId(details.split(',')[0]) === 'mimikyubusted' ? 'disguise' : '';
				const template = this.template('transform', id, 'NODEFAULT');
				return template.replace('[POKEMON]', this.pokemon(pokemon));
			}
			case '-start': {
				const [, pokemon, effect, move] = args;
				let templateId = 'start';
				if (kwArgs.from?.startsWith('item:')) templateId = 'startFromItem';
				const template = this.template(templateId, kwArgs.from, effect);
				return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect))
					.replace('[MOVE]', move).replace('[SOURCE]', this.pokemon(kwArgs.of))
					.replace('[ITEM]', this.effect(kwArgs.from));
			}
			case 'cant': {
				const [, pokemon, effect, move] = args;
				const template = this.template('cant', effect, 'NODEFAULT') || this.template(move ? 'cant' : 'cantNoMove');
				return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[MOVE]', move);
			}
			case '-end': {
				const [, pokemon, effect] = args;
				const template = this.template('end', effect);
				return template.replace('[POKEMON]', this.pokemon(pokemon)).replace('[EFFECT]', this.effect(effect));
			}
			default: return '';
			}
		}
	}
	const window = {
		PSDisplayNames: {
			displaySpeciesName(name) {
				return {
					Pikachu: 'ピカチュウ', Charizard: 'リザードン', Slowbro: 'ヤドラン',
					Mimikyu: 'ミミッキュ', 'Mimikyu-Busted': 'ミミッキュ（ばれたすがた）',
				}[name] || name;
			},
			displayMoveName(name) {
				return { Thunderbolt: '10まんボルト', Attract: 'メロメロ', Bide: 'がまん' }[name] || name;
			},
			displayAbilityName(name) {
				return { Static: 'せいでんき', Disguise: 'ばけのかわ' }[name] || name;
			},
			displayItemName(name) {
				return { 'Light Ball': 'でんきだま', Leftovers: 'たべのこし' }[name] || name;
			},
		},
	};
	const context = vm.createContext({ BattleText, BattleTextParser, Object, window });
	vm.runInContext(source, context);
	return { BattleText, BattleTextParser, window };
}

function renderFrozenProtocolLine(parser, BattleTextParser, line) {
	const { args, kwArgs } = BattleTextParser.parseBattleLine(line);
	const argsBefore = [...args];
	const kwArgsBefore = { ...kwArgs };
	Object.freeze(args);
	Object.freeze(kwArgs);
	const output = parser.parseArgsInner(args, kwArgs);
	assert.deepEqual(args, argsBefore, `${line}: args changed`);
	assert.deepEqual(kwArgs, kwArgsBefore, `${line}: kwArgs changed`);
	return output;
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

test('keeps T3-01 and T3-02 protocol inputs immutable while rendering Japanese templates', () => {
	const { BattleTextParser } = buildContext();
	const parser = new BattleTextParser();
	const cases = [
		{
			line: '|-heal|p1a: Lunchbox|100/100|[from] item: Leftovers',
			expected: '  Lunchboxはたべのこしで少しHPを回復した！\n',
		},
		{
			line: '|-block|p1a: Mimi|ability: Disguise',
			expected: '[Mimiのばけのかわ]\n  ばけのかわが身代わりになった！\n',
		},
		{
			line: '|detailschange|p1a: Mimi|Mimikyu-Busted, L50|[from] ability: Disguise',
			expected: 'Mimiのばけのかわが剥がれた！\n',
		},
		{
			line: '|-start|p1a: Sweetheart|move: Attract',
			expected: '  Sweetheartはメロメロになった！\n',
		},
		{
			line: '|cant|p1a: Sweetheart|Attract',
			expected: 'Sweetheartはメロメロで技が出せない！\n',
		},
		{
			line: '|-start|p1a: Tank|move: Bide',
			expected: '  Tankは力をためている！\n',
		},
		{
			line: '|-end|p1a: Tank|move: Bide',
			expected: '  Tankはためた力を解き放った！\n',
		},
	];
	for (const { line, expected } of cases) {
		const output = renderFrozenProtocolLine(parser, BattleTextParser, line);
		assert.equal(output, expected, line);
	}
	assert.match(renderFrozenProtocolLine(
		parser,
		BattleTextParser,
		'|-heal|p1a: Nickname-Not-A-Species|100/100|[from] item: Leftovers'
	), /Nickname-Not-A-Species/);
});
