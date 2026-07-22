'use strict';

/* global BattleText, BattleTextParser */

(() => {
	const JAPANESE_BATTLE_TEXT = {
		default: {
			startBattle: '[TRAINER]と[TRAINER]の対戦が始まった！',
			winBattle: '**[TRAINER]**の勝利！',
			tieBattle: '[TRAINER]と[TRAINER]の勝負は引き分けに終わった！',
			pokemon: '[NICKNAME]',
			opposingPokemon: '相手の[NICKNAME]',
			team: 'こちらのチーム',
			opposingTeam: '相手のチーム',
			party: '味方のポケモン',
			opposingParty: '相手のポケモン',
			turn: '== ターン [NUMBER] ==',
			switchIn: '[TRAINER]は[FULLNAME]を繰り出した！',
			switchInOwn: 'ゆけっ！ [FULLNAME]！',
			switchOut: '[TRAINER]は[NICKNAME]を引っ込めた！',
			switchOutOwn: '[NICKNAME]、戻れ！',
			drag: '[FULLNAME]が戦闘に引きずり出された！',
			faint: '[POKEMON]は倒れた！',
			swap: '[POKEMON]と[TARGET]は場所を入れ替えた！',
			swapCenter: '[POKEMON]は中央へ移動した！',
			canDynamax: '  [TRAINER]はダイマックスできるようになった！',
			canDynamaxOwn: '  [TRAINER]の周りにダイマックスのエネルギーが集まった！',
			zEffect: '  [POKEMON]は全力のZワザを放った！',
			move: '[POKEMON]の **[MOVE]**！',
			abilityActivation: '[[POKEMON]の[ABILITY]]',
			mega: '  [POKEMON]の[ITEM]がキーストーンに反応した！',
			megaNoItem: '  [POKEMON]が[TRAINER]のキーストーンに反応した！',
			megaGen6: '  [POKEMON]の[ITEM]が[TRAINER]のメガバングルに反応した！',
			transformMega: '[POKEMON]はメガ[SPECIES]にメガシンカした！',
			primal: '[POKEMON]のゲンシカイキ！ 本来の姿を取り戻した！',
			zPower: '  [POKEMON]はZパワーを身にまとった！',
			zBroken: '  [POKEMON]は守りきれずにダメージを受けた！',
			terastallize: '  [POKEMON]はテラスタルして[TYPE]タイプになった！',
			cant: '[POKEMON]は[MOVE]を使えない！',
			cantNoMove: '[POKEMON]は動けない！',
			fail: '  しかし、うまく決まらなかった！',
			transform: '[POKEMON]は姿を変えた！',
			typeChange: '  [POKEMON]は[TYPE]タイプになった！',
			typeChangeFromEffect: '  [POKEMON]は[EFFECT]によって[TYPE]タイプになった！',
			typeAdd: '  [POKEMON]に[TYPE]タイプが追加された！',
			start: '  （[POKEMON]に[EFFECT]の効果がかかった！）',
			end: '  [POKEMON]は[EFFECT]から解放された！',
			activate: '  （[EFFECT]が発動した！）',
			startTeamEffect: '  （[TEAM]に[EFFECT]の効果がかかった！）',
			endTeamEffect: '  （[TEAM]への[EFFECT]の効果が切れた！）',
			startFieldEffect: '  （[EFFECT]が始まった！）',
			endFieldEffect: '  （[EFFECT]が終わった！）',
			changeAbility: '  [POKEMON]の特性が[ABILITY]になった！',
			addItem: '  [POKEMON]は[ITEM]を手に入れた。',
			takeItem: '  [POKEMON]は[SOURCE]の[ITEM]を奪った！',
			eatItem: '  （[POKEMON]は[ITEM]を食べた！）',
			useGem: '  [ITEM]が[POKEMON]の力を強めた！',
			eatItemWeaken: '  [ITEM]が[POKEMON]へのダメージを弱めた！',
			removeItem: '  [POKEMON]は[ITEM]を失った！',
			activateItem: '  （[POKEMON]は[ITEM]を使った！）',
			activateWeaken: '  [ITEM]が[POKEMON]へのダメージを弱めた！',
			damage: '  （[POKEMON]はダメージを受けた！）',
			damagePercentage: '  （[POKEMON]は体力の[PERCENTAGE]を失った！）',
			damageFromPokemon: '  [POKEMON]は[SOURCE]の[ITEM]でダメージを受けた！',
			damageFromItem: '  [POKEMON]は[ITEM]でダメージを受けた！',
			damageFromPartialTrapping: '  [POKEMON]は[MOVE]で締めつけられている！',
			heal: '  [POKEMON]のHPが回復した。',
			healFromZEffect: '  [POKEMON]はZパワーでHPを回復した！',
			healFromEffect: '  [POKEMON]は[EFFECT]でHPを回復した！',
			boost: '  [POKEMON]の[STAT]が上がった！',
			boost2: '  [POKEMON]の[STAT]がぐーんと上がった！',
			boost3: '  [POKEMON]の[STAT]がぐぐーんと上がった！',
			boost0: '  [POKEMON]の[STAT]はこれ以上上がらない！',
			boostFromItem: '  [ITEM]で[POKEMON]の[STAT]が上がった！',
			boost2FromItem: '  [ITEM]で[POKEMON]の[STAT]がぐーんと上がった！',
			boost3FromItem: '  [ITEM]で[POKEMON]の[STAT]がぐぐーんと上がった！',
			boostFromZEffect: '  [POKEMON]はZパワーで[STAT]を上げた！',
			boost2FromZEffect: '  [POKEMON]はZパワーで[STAT]をぐーんと上げた！',
			boost3FromZEffect: '  [POKEMON]はZパワーで[STAT]をぐぐーんと上げた！',
			boostMultipleFromZEffect: '  [POKEMON]はZパワーで能力を上げた！',
			unboost: '  [POKEMON]の[STAT]が下がった！',
			unboost2: '  [POKEMON]の[STAT]ががくっと下がった！',
			unboost3: '  [POKEMON]の[STAT]ががくーんと下がった！',
			unboost0: '  [POKEMON]の[STAT]はこれ以上下がらない！',
			unboostFromItem: '  [ITEM]で[POKEMON]の[STAT]が下がった！',
			unboost2FromItem: '  [ITEM]で[POKEMON]の[STAT]ががくっと下がった！',
			unboost3FromItem: '  [ITEM]で[POKEMON]の[STAT]ががくーんと下がった！',
			swapBoost: '  [POKEMON]は相手と能力変化を入れ替えた！',
			swapOffensiveBoost: '  [POKEMON]は相手と攻撃・特攻の能力変化を入れ替えた！',
			swapDefensiveBoost: '  [POKEMON]は相手と防御・特防の能力変化を入れ替えた！',
			copyBoost: '  [POKEMON]は[TARGET]の能力変化をコピーした！',
			clearBoost: '  [POKEMON]の能力変化が元に戻った！',
			clearBoostFromZEffect: '  [POKEMON]はZパワーで下がった能力を元に戻した！',
			invertBoost: '  [POKEMON]の能力変化が逆になった！',
			clearAllBoost: '  すべての能力変化が元に戻った！',
			superEffective: '  効果はばつぐんだ！',
			superEffectiveSpread: '  [POKEMON]には効果はばつぐんだ！',
			resisted: '  効果はいまひとつのようだ……',
			resistedSpread: '  [POKEMON]には効果はいまひとつのようだ……',
			extremelyEffective: '  効果はものすごくばつぐんだ！',
			extremelyEffectiveSpread: '  [POKEMON]には効果はものすごくばつぐんだ！',
			mostlyIneffective: '  効果はほとんどないようだ……',
			mostlyIneffectiveSpread: '  [POKEMON]には効果はほとんどないようだ……',
			crit: '  急所に当たった！',
			critSpread: '  [POKEMON]の急所に当たった！',
			immune: '  [POKEMON]には効果がないようだ……',
			immuneNoPokemon: '  効果がないようだ……',
			immuneOHKO: '  [POKEMON]には効かなかった！',
			miss: '  [POKEMON]は攻撃をかわした！',
			missNoPokemon: '  [SOURCE]の攻撃は外れた！',
			center: '  自動的に中央へ移動した！',
			noTarget: '  しかし、攻撃する相手がいなかった……',
			ohko: '  一撃必殺！',
			combine: '  2つの技が1つになった！ 合体技だ！',
			hitCount: '  [NUMBER]回当たった！',
			hitCountSingular: '  1回当たった！',
		},
		hp: { statName: 'HP', statShortName: 'HP' },
		atk: { statName: '攻撃', statShortName: '攻撃' },
		def: { statName: '防御', statShortName: '防御' },
		spa: { statName: '特攻', statShortName: '特攻' },
		spd: { statName: '特防', statShortName: '特防' },
		spe: { statName: '素早さ', statShortName: '素早さ' },
		accuracy: { statName: '命中率' },
		evasion: { statName: '回避率' },
		spc: { statName: '特殊', statShortName: '特殊' },
		stats: { statName: '能力' },
		brn: {
			start: '  [POKEMON]はやけどを負った！',
			startFromItem: '  [POKEMON]は[ITEM]でやけどを負った！',
			alreadyStarted: '  [POKEMON]はすでにやけどしている！',
			end: '  [POKEMON]のやけどが治った！',
			endFromItem: '  [POKEMON]の[ITEM]がやけどを治した！',
			damage: '  [POKEMON]はやけどのダメージを受けた！',
		},
		frz: {
			start: '  [POKEMON]は凍りついた！',
			alreadyStarted: '  [POKEMON]はすでに凍っている！',
			end: '  [POKEMON]の氷が溶けた！',
			endFromItem: '  [POKEMON]の[ITEM]が氷を溶かした！',
			endFromMove: '  [POKEMON]は[MOVE]で氷を溶かした！',
			cant: '[POKEMON]は凍っていて動けない！',
		},
		par: {
			start: '  [POKEMON]はまひして技が出にくくなった！',
			alreadyStarted: '  [POKEMON]はすでにまひしている！',
			end: '  [POKEMON]のまひが治った！',
			endFromItem: '  [POKEMON]の[ITEM]がまひを治した！',
			cant: '[POKEMON]はまひして動けない！',
		},
		psn: {
			start: '  [POKEMON]は毒を浴びた！',
			alreadyStarted: '  [POKEMON]はすでに毒状態だ！',
			end: '  [POKEMON]の毒が消えた！',
			endFromItem: '  [POKEMON]の[ITEM]が毒を治した！',
			damage: '  [POKEMON]は毒のダメージを受けた！',
		},
		tox: {
			start: '  [POKEMON]は猛毒を浴びた！',
			startFromItem: '  [POKEMON]は[ITEM]で猛毒を浴びた！',
			end: '#psn',
			endFromItem: '#psn',
			alreadyStarted: '#psn',
			damage: '#psn',
		},
		slp: {
			start: '  [POKEMON]は眠ってしまった！',
			startFromRest: '  [POKEMON]は眠って体力を回復した！',
			alreadyStarted: '  [POKEMON]はすでに眠っている！',
			end: '  [POKEMON]は目を覚ました！',
			endFromItem: '  [POKEMON]の[ITEM]が眠りから起こした！',
			cant: '[POKEMON]はぐうぐう眠っている。',
		},
		confusion: {
			start: '  [POKEMON]は混乱した！',
			startFromFatigue: '  [POKEMON]は疲れ果てて混乱した！',
			end: '  [POKEMON]の混乱が解けた！',
			endFromItem: '  [POKEMON]の[ITEM]が混乱を解いた！',
			alreadyStarted: '  [POKEMON]はすでに混乱している！',
			activate: '  [POKEMON]は混乱している！',
			damage: 'わけも分からず自分を攻撃した！',
		},
		drain: { heal: '  [SOURCE]から体力を吸い取った！' },
		flinch: { cant: '[POKEMON]はひるんで動けない！' },
		heal: { fail: '  [POKEMON]のHPは満タンだ！' },
		nopp: { cant: '[POKEMON]は[MOVE]を使った！\n  しかし、技のPPが残っていなかった！' },
		recharge: { cant: '[POKEMON]は反動で動けない！' },
		recoil: { damage: '  [POKEMON]は反動のダメージを受けた！' },
		unboost: {
			fail: '  [POKEMON]の能力は下がらなかった！',
			failSingular: '  [POKEMON]の[STAT]は下がらなかった！',
		},
		struggle: { activate: '  [POKEMON]は出せる技がない！' },
		trapped: { start: '  [POKEMON]はもう逃げられない！' },
		dynamax: {
			start: '  （[POKEMON]のダイマックス！）',
			end: '  （[POKEMON]は元の姿に戻った！）',
			block: '  技はダイマックスの力に防がれた！',
			fail: '  [POKEMON]は首を横に振った。この技は使えないようだ……',
		},
		sandstorm: {
			weatherName: 'すなあらし',
			start: '  砂嵐が吹き始めた！',
			end: '  砂嵐が収まった。',
			upkeep: '  （砂嵐が吹き荒れている。）',
			damage: '  [POKEMON]は砂嵐のダメージを受けた！',
		},
		sunnyday: {
			weatherName: '晴れ',
			start: '  日差しが強くなった！',
			end: '  強い日差しが収まった。',
			upkeep: '  （日差しが強い。）',
		},
		raindance: {
			weatherName: '雨',
			start: '  雨が降り始めた！',
			end: '  雨がやんだ。',
			upkeep: '  （雨が降り続いている。）',
		},
		hail: {
			weatherName: 'あられ',
			start: '  あられが降り始めた！',
			end: '  あられがやんだ。',
			upkeep: '  （あられが降り続いている。）',
			damage: '  [POKEMON]はあられのダメージを受けた！',
		},
		snowscape: {
			weatherName: '雪',
			start: '  雪が降り始めた！',
			end: '  雪がやんだ。',
			upkeep: '  （雪が降り続いている。）',
		},
		desolateland: {
			weatherName: '強い日差し',
			start: '  日差しがとても強くなった！',
			end: '  とても強い日差しが収まった。',
			block: '  とても強い日差しは弱まらない！',
			blockMove: '  水タイプの攻撃は強い日差しで蒸発した！',
		},
		primordialsea: {
			weatherName: '強い雨',
			start: '  激しい雨が降り始めた！',
			end: '  激しい雨がやんだ！',
			block: '  激しい雨はやまない！',
			blockMove: '  炎タイプの攻撃は激しい雨で消えた！',
		},
		deltastream: {
			weatherName: '乱気流',
			start: '  謎の乱気流が飛行タイプのポケモンを守っている！',
			end: '  謎の乱気流が消え去った！',
			activate: '  謎の乱気流が攻撃を弱めた！',
			block: '  謎の乱気流は止まらない！',
		},
		electricterrain: {
			start: '  足元に電気が駆け巡った！',
			end: '  足元の電気が消え去った。',
			block: '  [POKEMON]はエレキフィールドに守られている！',
		},
		grassyterrain: {
			start: '  足元に草が生い茂った！',
			end: '  足元の草が消え去った。',
			heal: '  [POKEMON]のHPが回復した。',
		},
		mistyterrain: {
			start: '  足元に霧が立ち込めた！',
			end: '  足元の霧が消え去った。',
			block: '  [POKEMON]はミストフィールドに守られている！',
		},
		psychicterrain: {
			start: '  足元が不思議な感じになった！',
			end: '  足元の不思議な感じが消え去った！',
			block: '  [POKEMON]はサイコフィールドに守られている！',
		},
		gravity: {
			start: '  重力が強くなった！',
			end: '  重力が元に戻った！',
			cant: '[POKEMON]は重力のため[MOVE]を使えない！',
			activate: '[POKEMON]は重力に引かれて地面に落ちた！',
		},
		magicroom: {
			start: '  持ち物の効果がなくなる不思議な空間ができた！',
			end: '  マジックルームが解除され、持ち物の効果が元に戻った！',
		},
		mudsport: {
			start: '  電気の威力が弱まった！',
			end: '  どろあそびの効果が切れた。',
		},
		trickroom: {
			start: '  [POKEMON]は時空を歪めた！',
			end: '  歪んだ時空が元に戻った！',
		},
		watersport: {
			start: '  炎の威力が弱まった！',
			end: '  みずあそびの効果が切れた。',
		},
		wonderroom: {
			start: '  防御と特防が入れ替わる不思議な空間ができた！',
			end: '  ワンダールームが解除され、防御と特防が元に戻った！',
		},
		crash: { damage: '  [POKEMON]は勢い余って地面にぶつかった！' },
	};

	const DIRECT_NAME_FIELDS = {
		move: [[2, 'move']],
		cant: [[3, 'move']],
		'-block': [[3, 'move']],
		'-mega': [[2, 'species'], [3, 'item']],
		'-terastallize': [],
		'-ability': [[2, 'ability'], [3, 'ability']],
		'-endability': [[2, 'ability']],
		'-item': [[2, 'item']],
		'-enditem': [[2, 'item']],
		detailschange: [[2, 'details']],
		'-transform': [[3, 'species']],
		'-formechange': [[2, 'species']],
		switch: [[2, 'details']],
		drag: [[2, 'details']],
	};

	function countTemplates() {
		let count = 0;
		for (const templates of Object.values(JAPANESE_BATTLE_TEXT)) count += Object.keys(templates).length;
		return count;
	}

	function displayAPI() {
		return window.PSDisplayNames || null;
	}

	function displayName(kind, name) {
		if (!name) return name;
		const api = displayAPI();
		if (!api) return name;
		if (kind === 'species') return api.displaySpeciesName(name);
		if (kind === 'move') return api.displayMoveName(name);
		if (kind === 'ability') return api.displayAbilityName(name);
		if (kind === 'item') return api.displayItemName(name);
		return name;
	}

	function replaceName(output, kind, name) {
		if (!output || !name) return output;
		const translated = displayName(kind, name);
		if (!translated || translated === name) return output;
		return output.split(name).join(translated);
	}

	function pokemonName(pokemon) {
		if (typeof pokemon !== 'string') return '';
		const colon = pokemon.indexOf(':');
		if (colon < 0) return '';
		return pokemon.slice(colon + 1).trim();
	}

	function detailsSpecies(details) {
		if (typeof details !== 'string') return '';
		return details.split(',')[0].trim();
	}

	function explicitEffectName(effect, prefix) {
		if (typeof effect !== 'string' || !effect.startsWith(prefix)) return '';
		return effect.slice(prefix.length).trim();
	}

	function localizeRenderedNames(output, args, kwArgs) {
		if (!output) return output;
		let localized = output;
		for (const arg of args) {
			localized = replaceName(localized, 'species', pokemonName(arg));
		}

		const fields = DIRECT_NAME_FIELDS[args[0]] || [];
		for (const [index, kind] of fields) {
			const value = args[index];
			if (kind === 'details') localized = replaceName(localized, 'species', detailsSpecies(value));
			else localized = replaceName(localized, kind, value);
		}

		localized = replaceName(localized, 'move', kwArgs.move);
		localized = replaceName(localized, 'item', kwArgs.item);
		localized = replaceName(localized, 'ability', kwArgs.ability);
		localized = replaceName(localized, 'ability', kwArgs.ability2);

		const effects = [args[2], kwArgs.from];
		for (const effect of effects) {
			localized = replaceName(localized, 'move', explicitEffectName(effect, 'move:'));
			localized = replaceName(localized, 'ability', explicitEffectName(effect, 'ability:'));
			localized = replaceName(localized, 'item', explicitEffectName(effect, 'item:'));
		}
		return localized;
	}

	function installJapaneseBattleText() {
		if (typeof BattleText === 'undefined' || typeof BattleTextParser === 'undefined') return false;
		for (const [namespace, templates] of Object.entries(JAPANESE_BATTLE_TEXT)) {
			if (!BattleText[namespace]) BattleText[namespace] = {};
			Object.assign(BattleText[namespace], templates);
		}

		const prototype = BattleTextParser.prototype;
		if (!prototype.japaneseBattleTextInstalled) {
			const originalParseArgsInner = prototype.parseArgsInner;
			prototype.parseArgsInner = function (args, kwArgs) {
				const output = originalParseArgsInner.call(this, args, kwArgs);
				return localizeRenderedNames(output, args, kwArgs);
			};
			Object.defineProperty(prototype, 'japaneseBattleTextInstalled', {
				configurable: false,
				enumerable: false,
				value: true,
				writable: false,
			});
		}

		window.PSJapaneseBattleText = Object.freeze({
			installed: true,
			namespaces: Object.keys(JAPANESE_BATTLE_TEXT).length,
			templates: countTemplates(),
		});
		return true;
	}

	installJapaneseBattleText();
})();
