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
	
		healreplacement: { activate: '  [POKEMON]はZパワーで交代先のHPを回復する！' },
		aftermath: { damage: '  [POKEMON]はダメージを受けた！' },
		airlock: { start: '  天気の影響がなくなった。' },
		angerpoint: { boost: '  [POKEMON]の攻撃が最大まで上がった！' },
		anticipation: { activate: '  [POKEMON]は身震いした！' },
		armortail: { block: '  [SOURCE]は[MOVE]を使えない！' },
		aromaveil: { block: '  [POKEMON]はアロマのベールに守られている！' },
		asone: { start: '  [POKEMON]は2つの特性を持っている！' },
		aurabreak: { start: '  [POKEMON]はすべてのオーラを反転させた！' },
		baddreams: { damage: '  [POKEMON]はうなされている！' },
		battlebond: {
			activate: '  [POKEMON]はトレーナーとの絆で力がみなぎった！',
			transform: '[POKEMON]はサトシゲッコウガになった！',
		},
		beadsofruin: { start: '  [POKEMON]のわざわいのたまで周りのポケモンの特防が弱まった！' },
		cloudnine: { start: '  天気の影響がなくなった。' },
		comatose: { start: '  [POKEMON]はまどろんでいる！' },
		commander: { activate: '  [POKEMON]は[TARGET]に飲み込まれ、[TARGET]の司令塔になった！' },
		damp: { block: '  [SOURCE]は[MOVE]を使えない！' },
		darkaura: { start: '  [POKEMON]は闇のオーラを放っている！' },
		dazzling: { block: '  [SOURCE]は[MOVE]を使えない！' },
		disguise: {
			block: '  ばけのかわが身代わりになった！',
			transform: '[POKEMON]のばけのかわが剥がれた！',
		},
		dryskin: { damage: '  （[POKEMON]はかんそうはだでダメージを受けた！）' },
		electromorphosis: { start: '  [MOVE]を受けて[POKEMON]に電気がたまった！' },
		embodyaspectcornerstone: { boost: '  [POKEMON]のいしずえのめんが輝き、[POKEMON]の防御が上がった！' },
		embodyaspecthearthflame: { boost: '  [POKEMON]のかまどのめんが輝き、[POKEMON]の攻撃が上がった！' },
		embodyaspectteal: { boost: '  [POKEMON]のみどりのめんが輝き、[POKEMON]の素早さが上がった！' },
		embodyaspectwellspring: { boost: '  [POKEMON]のいどのめんが輝き、[POKEMON]の特防が上がった！' },
		fairyaura: { start: '  [POKEMON]はフェアリーのオーラを放っている！' },
		flashfire: { start: '  [POKEMON]の炎タイプの技の威力が上がった！' },
		flowerveil: { block: '  [POKEMON]は花びらのベールに包まれた！' },
		forewarn: {
			activate: '  [TARGET]の[MOVE]を見破った！',
			activateNoTarget: '  [POKEMON]のよちむが[MOVE]を察知した！',
		},
		frisk: {
			activate: '  [POKEMON]は[TARGET]をお見通しして[ITEM]を見つけた！',
			activateNoTarget: '  [POKEMON]は相手をお見通しして[ITEM]を見つけた！',
		},
		hadronengine: {
			activate: '  [POKEMON]はエレキフィールドで未来のエンジンを躍動させた！',
			start: '  [POKEMON]は足元をエレキフィールドにし、未来のエンジンを躍動させた！',
		},
		harvest: { addItem: '  [POKEMON]は[ITEM]を収穫した！' },
		hospitality: { heal: '  [POKEMON]は[SOURCE]がたてた抹茶を飲み干した！' },
		illusion: { end: '  [POKEMON]のイリュージョンが解けた！' },
		innardsout: { damage: '  [POKEMON]はダメージを受けた！' },
		ironbarbs: { damage: '  [POKEMON]はダメージを受けた！' },
		lightningrod: { activate: '  [POKEMON]が攻撃を引き寄せた！' },
		lingeringaroma: { changeAbility: '  [TARGET]に取れないにおいが染みついた！' },
		liquidooze: { damage: '  [POKEMON]はヘドロえきを吸い取ってしまった！' },
		magicbounce: { move: '[POKEMON]は[MOVE]を跳ね返した！' },
		mimicry: { activate: '  [POKEMON]は元のタイプに戻った！' },
		moldbreaker: { start: '  [POKEMON]はかたやぶりだ！' },
		mummy: { changeAbility: '  [TARGET]の特性がミイラになった！' },
		naturalcure: { activate: '  （[POKEMON]はしぜんかいふくで状態異常が治った！）' },
		neutralizinggas: {
			end: '  かがくへんかガスの効果がなくなった！',
			start: '  かがくへんかガスが辺りに充満した！',
		},
		orichalcumpulse: {
			activate: '  [POKEMON]は日差しを浴び、古代の鼓動をたぎらせた！',
			start: '  [POKEMON]は日差しを強くし、古代の鼓動をたぎらせた！',
		},
		perishbody: { start: '  両方のポケモンは3ターン後に倒れる！' },
		persistent: { activate: '  [POKEMON]は[MOVE]の効果を2ターン延長した！' },
		pickup: { addItem: '  [POKEMON]は[ITEM]を拾った！' },
		powerconstruct: {
			activate: '  たくさんの気配を感じる！',
			transform: '[POKEMON]はパーフェクトフォルムに変化した！',
		},
		powerofalchemy: { changeAbility: '  [SOURCE]の[ABILITY]を受け継いだ！' },
		pressure: { start: '  [POKEMON]はプレッシャーを放っている！' },
		protosynthesis: {
			activate: '  強い日差しで[POKEMON]のこだいかっせいが発動した！',
			activateFromItem: '  [POKEMON]はブーストエナジーでこだいかっせいを発動した！',
			end: '  [POKEMON]のこだいかっせいの効果が切れた！',
			start: '  [POKEMON]の[STAT]が高まった！',
		},
		quarkdrive: {
			activate: '  エレキフィールドで[POKEMON]のクォークチャージが発動した！',
			activateFromItem: '  [POKEMON]はブーストエナジーでクォークチャージを発動した！',
			end: '  [POKEMON]のクォークチャージの効果が切れた！',
			start: '  [POKEMON]の[STAT]が高まった！',
		},
		queenlymajesty: { block: '  [SOURCE]は[MOVE]を使えない！' },
		quickdraw: { activate: '  クイックドロウで[POKEMON]の行動が速くなった！' },
		rebound: { move: '[POKEMON]は[MOVE]を跳ね返した！' },
		receiver: { changeAbility: '  [SOURCE]の[ABILITY]を受け継いだ！' },
		roughskin: { damage: '  [POKEMON]はダメージを受けた！' },
		schooling: {
			transform: '[POKEMON]は群れを作った！',
			transformEnd: '[POKEMON]は群れを解いた！',
		},
		shieldsdown: {
			transform: 'リミットシールドが解除された！\n（[POKEMON]は身を守った！）',
			transformEnd: 'リミットシールドが発動した！\n（[POKEMON]は身を守るのをやめた！）',
		},
		slowstart: {
			end: '  [POKEMON]はようやく調子を取り戻した！',
			start: '  [POKEMON]はまだ本調子ではない！',
		},
		stancechange: {
			transform: 'ブレードフォルムになった！',
			transformEnd: 'シールドフォルムになった！',
		},
		stickyhold: { block: '  [POKEMON]の持ち物は取れない！' },
		stormdrain: { activate: '  [POKEMON]が攻撃を引き寄せた！' },
		sturdy: { activate: '  [POKEMON]は攻撃を耐えた！' },
		suctioncups: { block: '  [POKEMON]は吸盤で地面に張りついている！' },
		supersweetsyrup: { start: '  [POKEMON]を覆う蜜から甘ったるい香りが漂っている！' },
		supremeoverlord: { activate: '  [POKEMON]は倒れた仲間の力を受け取った！' },
		sweetveil: { block: '  [POKEMON]は甘いベールで眠らない！' },
		swordofruin: { start: '  [POKEMON]のわざわいのつるぎで周りのポケモンの防御が弱まった！' },
		symbiosis: { activate: '  [POKEMON]は[ITEM]を[TARGET]に渡した！' },
		tabletsofruin: { start: '  [POKEMON]のわざわいのおふだで周りのポケモンの攻撃が弱まった！' },
		telepathy: { block: '  [POKEMON]は味方の攻撃を受けない！' },
		terashell: { activate: '  [POKEMON]の甲羅が輝き、タイプ相性を歪めている！' },
		terashift: { transform: '[POKEMON]は姿を変えた！' },
		teravolt: { start: '  [POKEMON]ははじけるオーラを放っている！' },
		trace: { changeAbility: '  [POKEMON]は[SOURCE]の[ABILITY]をトレースした！' },
		truant: { cant: '[POKEMON]はなまけている！' },
		turboblaze: { start: '  [POKEMON]は燃え盛るオーラを放っている！' },
		unnerve: { start: '  [TEAM]は緊張してきのみを食べられない！' },
		vesselofruin: { start: '  [POKEMON]のわざわいのうつわで周りのポケモンの特攻が弱まった！' },
		wanderingspirit: { activate: '  [POKEMON]は相手と特性を入れ替えた！' },
		windpower: { start: '  [MOVE]を受けて[POKEMON]に電気がたまった！' },
		zenmode: {
			transform: 'ダルマモードになった！',
			transformEnd: 'ダルマモードが解除された！',
		},
		zerotohero: { activate: '  [POKEMON]はヒーローへと変身した！' },
		abilityshield: { block: '  [POKEMON]の特性はとくせいガードに守られている！' },
		airballoon: {
			end: '  [POKEMON]のふうせんが割れた！',
			start: '  [POKEMON]はふうせんで宙に浮いている！',
		},
		blacksludge: { heal: '  [POKEMON]はくろいヘドロで少しHPを回復した！' },
		clearamulet: { block: '  [POKEMON]のクリアチャームで能力を下げられない！' },
		custapberry: { activate: '  [POKEMON]はイバンのみでいつもより早く動ける！' },
		ejectbutton: { end: '  [POKEMON]はだっしゅつボタンで交代する！' },
		ejectpack: { end: '  [POKEMON]はだっしゅつパックで交代する！' },
		focusband: { activate: '  [POKEMON]はきあいのハチマキで持ちこたえた！' },
		focussash: { end: '  [POKEMON]はきあいのタスキで持ちこたえた！' },
		leftovers: { heal: '  [POKEMON]はたべのこしで少しHPを回復した！' },
		leppaberry: { activate: '  [POKEMON]はヒメリのみで[MOVE]のPPを回復した！' },
		lifeorb: { damage: '  [POKEMON]はHPを少し失った！' },
		mirrorherb: { activate: '  [POKEMON]はものまねハーブで相手の能力変化をまねした！' },
		mysteryberry: { activate: '  [POKEMON]はふしぎなきのみで[MOVE]のPPを回復した！' },
		powerherb: { end: '  [POKEMON]はパワフルハーブで力がみなぎった！' },
		protectivepads: { block: '  [POKEMON]はぼうごパットで身を守った！' },
		quickclaw: { activate: '  [POKEMON]はせんせいのツメでいつもより早く動ける！' },
		redcard: { end: '  [POKEMON]は[TARGET]にレッドカードを突きつけた！' },
		rockyhelmet: { damage: '  [POKEMON]はゴツゴツメットでダメージを受けた！' },
		safetygoggles: { block: '  [POKEMON]はぼうじんゴーグルで[MOVE]の影響を受けない！' },
		shellbell: { heal: '  [POKEMON]はかいがらのすずで少しHPを回復した！' },
		ultranecroziumz: {
			activate: '[POKEMON]はウルトラバーストで真の力を取り戻した！',
			transform: '  [POKEMON]からまばゆい光があふれ出そうとしている！',
		},
		whiteherb: { end: '  [POKEMON]はしろいハーブで能力変化を元に戻した！' },
		afteryou: { activate: '  [TARGET]はお言葉に甘えた！' },
		aquaring: {
		heal: '  水のベールが[POKEMON]のHPを回復した！',
		start: '  [POKEMON]は水のベールをまとった！',
	},
		aromatherapy: { activate: '  心地よい香りがあたりに広がった！' },
		attract: {
		activate: '  [POKEMON]は[TARGET]にメロメロだ！',
		cant: '[POKEMON]はメロメロで技が出せない！',
		end: '  [POKEMON]のメロメロ状態が治った！',
		endFromItem: '  [POKEMON]は[ITEM]でメロメロ状態を治した！',
		start: '  [POKEMON]はメロメロになった！',
		startFromItem: '  [POKEMON]は[ITEM]のせいでメロメロになった！',
	},
		auroraveil: {
		end: '  [TEAM]を覆っていた光の幕が消えた！',
		start: '  光の幕が[TEAM]を物理攻撃と特殊攻撃から守る！',
	},
		autotomize: { start: '  [POKEMON]は身軽になった！' },
		axekick: { damage: '  [POKEMON]は勢い余って地面にぶつかった！' },
		beakblast: { start: '  [POKEMON]はくちばしを熱し始めた！' },
		beatup: { activate: '  [NAME]の攻撃！' },
		bellydrum: { boost: '  [POKEMON]はHPを削って攻撃を最大まで上げた！' },
		bestow: { takeItem: '  [SOURCE]は[POKEMON]に[ITEM]を渡した！' },
		bide: {
		activate: '  [POKEMON]は力をためている！',
		end: '  [POKEMON]はためた力を解き放った！',
		start: '  [POKEMON]は力をためている！',
	},
		bind: {
		move: '[POKEMON]の攻撃は続いている！',
		start: '  [POKEMON]は[SOURCE]に締めつけられた！',
	},
		bounce: { prepare: '[POKEMON]は高く跳び上がった！' },
		brickbreak: { activate: '  [POKEMON]は[TEAM]を守る壁を壊した！' },
		bugbite: { removeItem: '  [SOURCE]は相手の[ITEM]を奪って食べた！' },
		burnup: { typeChange: '  [POKEMON]は炎を燃やし尽くした！' },
		celebrate: { activate: '  おめでとう [TRAINER]！' },
		charge: { start: '  [POKEMON]は電気をため始めた！' },
		chillyreception: { prepare: '  [POKEMON]は寒いギャグを言おうとしている！' },
		clamp: {
		move: '[POKEMON]の攻撃は続いている！',
		start: '  [SOURCE]は[POKEMON]を殻で挟み込んだ！',
	},
		conversion: { typeChange: '  タイプが[SOURCE]と同じになった！' },
		corrosivegas: {
		fail: '  しかし[POKEMON]には効果がなかった！',
		removeItem: '  [SOURCE]は[POKEMON]の[ITEM]を腐食させた！',
	},
		courtchange: { activate: '  [POKEMON]は互いの場の効果を入れ替えた！' },
		craftyshield: {
		block: '  変化技を防ぐ盾が[POKEMON]を守った！',
		start: '  変化技を防ぐ盾が[TEAM]を守った！',
	},
		curse: {
		damage: '  [POKEMON]は呪いに苦しんでいる！',
		start: '  [SOURCE]はHPを削って[POKEMON]に呪いをかけた！',
	},
		darkvoid: {
		fail: 'しかし[POKEMON]にはこの技を使えない！',
		failWrongForme: 'しかし今の[POKEMON]には使えない！',
	},
		destinybond: {
		activate: '[POKEMON]は攻撃した相手を道連れにした！',
		start: '  [POKEMON]は相手を道連れにしようとしている！',
	},
		dig: { prepare: '[POKEMON]は地面の中へ潜った！' },
		disable: {
		cant: '[POKEMON]の[MOVE]は封じられている！',
		end: '  [POKEMON]の技を封じる効果が切れた！',
		start: '  [POKEMON]の[MOVE]を封じた！',
	},
		dive: { prepare: '[POKEMON]は水中に身を隠した！' },
		doomdesire: {
		activate: '  未来からの攻撃が[TARGET]を襲った！',
		start: '  [POKEMON]は未来に攻撃を託した！',
	},
		doubleshock: { typeChange: '  [POKEMON]はすべての電気を使い切った！' },
		dragonascent: { megaNoItem: '  [TRAINER]の熱い願いが[POKEMON]に届いた！' },
		dragoncheer: { start: '  [POKEMON]は気合が入った！' },
		eeriespell: { activate: '  [TARGET]の[MOVE]のPPを[NUMBER]減らした！' },
		electrify: { start: '  [POKEMON]の技が電気を帯びた！' },
		electroshot: { prepare: '[POKEMON]は電気を吸収した！' },
		embargo: {
		end: '  [POKEMON]は再び道具を使えるようになった！',
		start: '  [POKEMON]は道具を使えなくなった！',
	},
		encore: {
		end: '  [POKEMON]へのアンコールが終わった！',
		start: '  [POKEMON]は同じ技を繰り返すことになった！',
	},
		endure: {
		activate: '  [POKEMON]は攻撃を耐えた！',
		start: '  [POKEMON]はこらえる体勢に入った！',
	},
		fairylock: { activate: '  次のターンは誰も逃げられない！' },
		feint: { activate: '  [TARGET]はフェイントに引っかかった！' },
		ficklebeam: { activate: '  [POKEMON]は全力で攻撃する！' },
		firepledge: {
		activate: '  [POKEMON]は[TARGET]の技を待っている……',
		damage: '  [POKEMON]は炎の海でダメージを受けた！',
		end: '  [TEAM]を包んでいた炎の海が消えた！',
		start: '  炎の海が[TEAM]を包み込んだ！',
	},
		firespin: {
		move: '[POKEMON]の攻撃は続いている！',
		start: '  [POKEMON]は炎の渦に閉じ込められた！',
	},
		flameburst: { damage: '  はじけた炎が[POKEMON]に当たった！' },
		fling: { removeItem: '  [POKEMON]は[ITEM]を投げつけた！' },
		flipturn: { switchOut: '[POKEMON]は[TRAINER]のもとへ戻っていく！' },
		fly: { prepare: '[POKEMON]は空高く飛び上がった！' },
		focusenergy: {
		start: '  [POKEMON]は気合が入った！',
		startFromItem: '  [POKEMON]は[ITEM]を使って気合を入れた！',
		startFromZEffect: '  [POKEMON]はZパワーで急所に当たりやすくなった！',
	},
		focuspunch: {
		cant: '[POKEMON]は集中が途切れて動けなかった！',
		start: '  [POKEMON]は集中力を高めている！',
	},
		followme: {
		start: '  [POKEMON]は注目の的になった！',
		startFromZEffect: '  [POKEMON]は注目の的になった！',
	},
		foresight: { start: '  [POKEMON]の正体を見破った！' },
		freezeshock: { prepare: '  [POKEMON]は凍える光をまとった！' },
		futuresight: {
		activate: '  未来からの攻撃が[TARGET]を襲った！',
		start: '  [POKEMON]は未来の攻撃を予知した！',
	},
		gastroacid: { start: '  [POKEMON]の特性の効果が消えた！' },
		geomancy: { prepare: '[POKEMON]は力を吸収している！' },
		gmaxcannonade: {
		damage: '  [POKEMON]は激しい水流でダメージを受けた！',
		start: '  [PARTY]は激しい水流に巻き込まれた！',
	},
		gmaxchistrike: { start: '  [POKEMON]は気合が入った！' },
		gmaxdepletion: { activate: '  [TARGET]のPPが減った！' },
		gmaxsteelsurge: {
		damage: '  鋭い鋼が[POKEMON]に食い込んだ！',
		end: '  [PARTY]の周りに浮かんでいた鋼が消えた！',
		start: '  鋭い鋼が[PARTY]の周りに浮かび始めた！',
	},
		gmaxvinelash: {
		damage: '  [POKEMON]は激しく打ちつける蔓でダメージを受けた！',
		start: '  [PARTY]は蔓に閉じ込められた！',
	},
		gmaxvolcalith: {
		damage: '  [POKEMON]は飛び散る岩でダメージを受けた！',
		start: '  [PARTY]は岩に取り囲まれた！',
	},
		gmaxwildfire: {
		damage: '  [POKEMON]は燃え盛る炎でダメージを受けた！',
		start: '  [PARTY]は炎に取り囲まれた！',
	},
		grasspledge: {
		activate: '  [POKEMON]は[TARGET]の技を待っている……',
		end: '  [TEAM]を覆っていた湿地が消えた！',
		start: '  湿地が[TEAM]を包み込んだ！',
	},
		grudge: {
		activate: '  恨みで[POKEMON]の[MOVE]のPPがすべてなくなった！',
		start: '[POKEMON]は相手に恨みを残そうとしている！',
	},
		guardsplit: { activate: '  [POKEMON]は相手と守りの力を分け合った！' },
		happyhour: { activate: '  みんなが幸せな雰囲気に包まれた！' },
		haze: { activate: '  すべての能力変化が元に戻った！' },
		healbell: { activate: '  鈴の音が響き渡った！' },
		healblock: {
		cant: '[POKEMON]は回復を封じられているため[MOVE]を使えない！',
		cantGen8: '[POKEMON]は回復を封じられているため[MOVE]を使えない！',
		end: '  [POKEMON]の回復を封じる効果が切れた！',
		endGen8: '  [POKEMON]の回復を封じる効果が切れた！',
		fail: '  しかし[POKEMON]には効果がなかった！',
		start: '  [POKEMON]は回復できなくなった！',
	},
		healingwish: { heal: '  癒やしの願いが[POKEMON]に届いた！' },
		helpinghand: { start: '  [SOURCE]は[POKEMON]を手助けする構えだ！' },
		highjumpkick: { damage: '  [POKEMON]は勢い余って地面にぶつかった！' },
		hyperspacefury: {
		activate: '  [TARGET]の守りを打ち破った！',
		fail: 'しかし[POKEMON]にはこの技を使えない！',
	},
		hyperspacehole: { activate: '  [TARGET]の守りを打ち破った！' },
		iceburn: { prepare: '  [POKEMON]は凍える空気をまとった！' },
		imprison: {
		cant: '[POKEMON]は封じられた[MOVE]を使えない！',
		start: '  [POKEMON]は相手と共通する技を封じた！',
	},
		incinerate: { removeItem: '  [POKEMON]の[ITEM]は焼けてなくなった！' },
		infestation: { start: '  [POKEMON]は[SOURCE]の群れにまとわりつかれた！' },
		ingrain: {
		block: '  [POKEMON]は根を張って動かない！',
		heal: '  [POKEMON]は根から養分を吸収した！',
		start: '  [POKEMON]は根を張った！',
	},
		instruct: { activate: '  [TARGET]は[POKEMON]の指示に従った！' },
		iondeluge: { activate: '  イオンの雨が戦場に降り注ぐ！' },
		jumpkick: { damage: '  [POKEMON]は勢い余って地面にぶつかった！' },
		knockoff: { removeItem: '  [SOURCE]は[POKEMON]の[ITEM]を叩き落とした！' },
		laserfocus: { start: '  [POKEMON]は精神を研ぎ澄ませた！' },
		leechseed: {
		damage: '  [POKEMON]は植えつけられた種にHPを吸い取られた！',
		end: '  [POKEMON]から植えつけられた種がなくなった！',
		start: '  [POKEMON]に種を植えつけた！',
	},
		lightscreen: {
		end: '  [TEAM]を守っていた光の壁が消えた！',
		start: '  光の壁が[TEAM]を特殊攻撃から守る！',
		startGen1: '  [POKEMON]は特殊攻撃に強くなった！',
	},
		lockon: { start: '  [SOURCE]は[POKEMON]に狙いを定めた！' },
		luckychant: {
		end: '  [TEAM]を急所から守る効果が切れた！',
		start: '  不思議な力が[TEAM]を急所から守る！',
	},
		lunardance: { heal: '  [POKEMON]は神秘的な月の光に包まれた！' },
		magiccoat: {
		move: '[POKEMON]は[MOVE]を跳ね返した！',
		start: '  [POKEMON]は技を跳ね返す膜をまとった！',
	},
		magmastorm: { start: '  [POKEMON]は渦巻くマグマに閉じ込められた！' },
		magnetrise: {
		end: '  [POKEMON]の電磁力が切れた！',
		start: '  [POKEMON]は電磁力で宙に浮いた！',
	},
		magnitude: { activate: '  威力は[NUMBER]！' },
		makeitrain: { activate: '  あたり一面にコインが散らばった！' },
		matblock: {
		block: '  跳ね上げた畳が[MOVE]を防いだ！',
		start: '  [POKEMON]は畳を跳ね上げて攻撃を防ぐ構えだ！',
	},
		maxguard: { activate: '  [POKEMON]は身を守った！' },
		memento: { heal: '  [POKEMON]はZパワーでHPを回復した！' },
		meteorbeam: { prepare: '[POKEMON]は宇宙の力で満ちあふれている！' },
		metronome: { move: '指を振ったら[MOVE]が出た！' },
		mimic: { start: '  [POKEMON]は[MOVE]を覚えた！' },
		mindblown: { damage: '  （[POKEMON]は技の力を高めるためにHPを削った！）' },
		mindreader: { start: '  [SOURCE]は[POKEMON]に狙いを定めた！' },
		miracleeye: { start: '  [POKEMON]の正体を見破った！' },
		mist: {
		block: '  [POKEMON]は白い霧に守られている！',
		blockGen1: '  しかし失敗した！',
		blockGen2: '  [POKEMON]は白い霧に守られている！',
		end: '  [TEAM]を守っていた白い霧が消えた！',
		start: '  [TEAM]は白い霧に包まれた！',
		startGen1: '  [POKEMON]は白い霧に包まれた！',
		startGen2: '  [POKEMON]は白い霧に包まれた！',
	},
		naturepower: { move: '自然の力が[MOVE]になった！' },
		nightmare: {
		damage: '  [POKEMON]は悪夢にうなされている！',
		start: '  [POKEMON]は悪夢を見始めた！',
	},
		noretreat: { start: '  [POKEMON]は退路を断ち、もう逃げられない！' },
		octolock: { start: '  [POKEMON]は締めつけられて逃げられない！' },
		painsplit: { activate: '  両者は痛みを分け合った！' },
		partingshot: {
		heal: '  [POKEMON]はZパワーでHPを回復した！',
		switchOut: '[POKEMON]は[TRAINER]のもとへ戻っていく！',
	},
		payday: { activate: '  あたり一面にコインが散らばった！' },
		perishsong: {
		activate: '  [POKEMON]の滅びのカウントが[NUMBER]になった。',
		start: '  歌を聞いたポケモンは3ターン後に倒れる！',
	},
		phantomforce: {
		activate: '  [TARGET]の守りを打ち破った！',
		prepare: '[POKEMON]は一瞬で姿を消した！',
	},
		pluck: { removeItem: '  [SOURCE]は相手の[ITEM]を奪って食べた！' },
		poltergeist: { activate: '  [POKEMON]の[ITEM]が襲いかかろうとしている！' },
		powder: {
		activate: '  炎が粉に触れ、ポケモンの周りで爆発した！',
		start: '  [POKEMON]は粉まみれになった！',
	},
		powershift: {
		end: '  [POKEMON]は攻撃の能力と防御の能力を入れ替えた！',
		start: '  [POKEMON]は攻撃の能力と防御の能力を入れ替えた！',
	},
		powersplit: { activate: '  [POKEMON]は相手と攻撃の力を分け合った！' },
		powertrick: {
		end: '  [POKEMON]は攻撃と防御を入れ替えた！',
		start: '  [POKEMON]は攻撃と防御を入れ替えた！',
	},
		protect: {
		block: '  [POKEMON]は攻撃から身を守った！',
		start: '  [POKEMON]は身を守った！',
	},
		pursuit: { activate: '  （[TARGET]は交代しようとしている……）' },
		quash: { activate: '  [TARGET]の行動を後回しにした！' },
		quickguard: {
		block: '  素早い攻撃を防ぐ守りが[POKEMON]を守った！',
		start: '  素早い攻撃を防ぐ守りが[TEAM]を守った！',
	},
		ragepowder: {
		start: '  [POKEMON]は注目の的になった！',
		startFromZEffect: '  [POKEMON]は注目の的になった！',
	},
		ragingbull: { activate: '  [POKEMON]は[TEAM]を守る壁を壊した！' },
		razorwind: { prepare: '  [POKEMON]は風の渦を巻き起こした！' },
		recycle: { addItem: '  [POKEMON]は[ITEM]を再利用した！' },
		reflect: {
		end: '  [TEAM]を守っていた反射の壁が消えた！',
		start: '  反射の壁が[TEAM]を物理攻撃から守る！',
		startGen1: '  [POKEMON]は物理攻撃に強くなった！',
	},
		reflecttype: { typeChange: '  [POKEMON]のタイプが[SOURCE]と同じになった！' },
		revivalblessing: { heal: '  [POKEMON]は復活し、再び戦えるようになった！' },
		roleplay: { changeAbility: '  [POKEMON]は[SOURCE]の特性[ABILITY]をコピーした！' },
		roost: { start: '  （[POKEMON]はこのターン、ひこうタイプではなくなる。）' },
		safeguard: {
		block: '  [POKEMON]は神秘的なベールに守られている！',
		end: '  [TEAM]を守っていた神秘的なベールが消えた！',
		start: '  [TEAM]は神秘的なベールに包まれた！',
	},
		saltcure: {
		damage: '  [POKEMON]は塩で清められてダメージを受けた！',
		start: '  [POKEMON]は塩漬けにされた！',
	},
		sandtomb: { start: '  [POKEMON]は流砂に閉じ込められた！' },
		shadowforce: {
		activate: '  [TARGET]の守りを打ち破った！',
		prepare: '[POKEMON]は一瞬で姿を消した！',
	},
		shedtail: {
		alreadyStarted: '  [POKEMON]にはすでに身代わりがある！',
		fail: '  しかし身代わりを作るにはHPが足りない！',
		start: '  [POKEMON]はしっぽを切り離して身代わりを作った！',
	},
		shelltrap: {
		cant: '[POKEMON]の仕掛けた罠は不発に終わった！',
		prepare: '  [POKEMON]は殻に罠を仕掛けた！',
		start: '  [POKEMON]は殻に罠を仕掛けた！',
	},
		sketch: { activate: '  [POKEMON]は[MOVE]を写し取った！' },
		skillswap: { activate: '  [POKEMON]は相手と特性を入れ替えた！' },
		skullbash: { prepare: '[POKEMON]は頭を引っ込めた！' },
		skyattack: { prepare: '[POKEMON]は激しい光をまとった！' },
		skydrop: {
		end: '  [POKEMON]は空中から解放された！',
		failSelect: '[POKEMON]は空中に捕らえられている！',
		failTooHeavy: '  [POKEMON]は重すぎて持ち上げられない！',
		prepare: '[POKEMON]は[TARGET]を空へ連れ去った！',
	},
		smackdown: { start: '  [POKEMON]は真っ逆さまに落ちた！' },
		snaptrap: { start: '  [POKEMON]は罠に挟まれた！' },
		snatch: {
		activate: '  [POKEMON]は[TARGET]の技を横取りした！',
		start: '  [POKEMON]は相手が技を使うのを待ち構えている！',
	},
		solarbeam: { prepare: '  [POKEMON]は光を吸収した！' },
		solarblade: { prepare: '  [POKEMON]は光を吸収した！' },
		spectralthief: { clearBoost: '  [SOURCE]は相手の上がった能力を盗んだ！' },
		speedswap: { activate: '  [POKEMON]は相手と素早さを入れ替えた！' },
		spikes: {
		damage: '  [POKEMON]はまきびしを踏んでダメージを受けた！',
		end: '  [TEAM]の周りのまきびしが消えた！',
		start: '  [TEAM]の周りにまきびしがまかれた！',
	},
		spikyshield: { damage: '  [POKEMON]はダメージを受けた！' },
		spite: { activate: '  [TARGET]の[MOVE]のPPを[NUMBER]減らした！' },
		splash: { activate: '  しかし何も起こらなかった！' },
		spotlight: {
		start: '  [POKEMON]は注目の的になった！',
		startFromZEffect: '  [POKEMON]は注目の的になった！',
	},
		stealthrock: {
		damage: '  尖った岩が[POKEMON]に食い込んだ！',
		end: '  [TEAM]の周りの尖った岩が消えた！',
		start: '  [TEAM]の周りに尖った岩が浮かび始めた！',
	},
		steelbeam: { damage: '  （[POKEMON]は技の力を高めるためにHPを削った！）' },
		stickyweb: {
		activate: '  [POKEMON]はねばねばしたネットに捕まった！',
		end: '  [TEAM]の周りのねばねばしたネットが消えた！',
		start: '  [TEAM]の周りにねばねばしたネットが張り巡らされた！',
	},
		stockpile: {
		end: '  [POKEMON]の蓄えていた効果がなくなった！',
		start: '  [POKEMON]は[NUMBER]回蓄えた！',
	},
		substitute: {
		activate: '  身代わりが[POKEMON]の代わりに攻撃を受けた！',
		alreadyStarted: '  [POKEMON]にはすでに身代わりがある！',
		end: '  [POKEMON]の身代わりは消えてしまった！',
		fail: '  しかし身代わりを作るにはHPが足りない！',
		start: '  [POKEMON]は身代わりを作った！',
	},
		supercellslam: { damage: '  [POKEMON]は勢い余って地面にぶつかった！' },
		switcheroo: { activate: '  [POKEMON]は相手と持ち物を入れ替えた！' },
		syrupbomb: { start: '  [POKEMON]はべたべたの飴の蜜に覆われた！' },
		tailwind: {
		end: '  [TEAM]の追い風が止んだ！',
		start: '  [TEAM]の背後から追い風が吹いた！',
	},
		tarshot: { start: '  [POKEMON]は炎に弱くなった！' },
		taunt: {
		cant: '[POKEMON]は挑発されて[MOVE]を使えない！',
		end: '  [POKEMON]は挑発から解放された！',
		start: '  [POKEMON]は挑発に乗ってしまった！',
	},
		teatime: {
		activate: '  お茶の時間だ！ みんながきのみを食べ始めた！',
		fail: '  しかし何も起こらなかった！',
	},
		telekinesis: {
		end: '  [POKEMON]は念力から解放された！',
		start: '  [POKEMON]は空中へ投げ上げられた！',
	},
		throatchop: { cant: '喉への攻撃の影響で[POKEMON]は音の技を使えない！' },
		thundercage: { start: '  [SOURCE]は[POKEMON]を電気の檻に閉じ込めた！' },
		tidyup: { activate: '  きれいさっぱり片づいた！' },
		torment: {
		end: '  [POKEMON]への苦しめる効果が切れた！',
		start: '  [POKEMON]は苦しめられている！',
	},
		toxicspikes: {
		end: '  [TEAM]の周りの毒びしが消えた！',
		start: '  [TEAM]の周りに毒びしがまかれた！',
	},
		transform: { transform: '[POKEMON]は[SPECIES]に変身した！' },
		trick: { activate: '  [POKEMON]は相手と持ち物を入れ替えた！' },
		uproar: {
		block: '  しかし騒音で[POKEMON]は眠れなかった！',
		blockSelf: '  [POKEMON]は騒音の中では眠れない！',
		end: '  [POKEMON]はおとなしくなった。',
		start: '  [POKEMON]は騒ぎ始めた！',
		upkeep: '  [POKEMON]は騒いでいる！',
	},
		uturn: { switchOut: '[POKEMON]は[TRAINER]のもとへ戻っていく！' },
		voltswitch: { switchOut: '[POKEMON]は[TRAINER]のもとへ戻っていく！' },
		waterpledge: {
		activate: '  [POKEMON]は[TARGET]の技を待っている……',
		end: '  [TEAM]の空にかかっていた虹が消えた！',
		start: '  [TEAM]の空に虹がかかった！',
	},
		weatherball: { move: '天気の影響で技が[MOVE]に変わった！' },
		whirlpool: { start: '  [POKEMON]は水の渦に閉じ込められた！' },
		wideguard: {
		block: '  広範囲の攻撃を防ぐ守りが[POKEMON]を守った！',
		start: '  広範囲の攻撃を防ぐ守りが[TEAM]を守った！',
	},
		wish: { heal: '  [NICKNAME]の願いがかなった！' },
		wrap: {
		move: '[POKEMON]の攻撃は続いている！',
		start: '  [POKEMON]は[SOURCE]に巻きつかれた！',
	},
		yawn: { start: '  [POKEMON]は眠気を誘われた！' },
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
