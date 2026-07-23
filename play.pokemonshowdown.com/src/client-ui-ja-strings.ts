/**
 * Japanese strings for static battle and Teambuilder UI chrome.
 *
 * These values are intended for direct JSX/property substitution. They must
 * never be used to rewrite protocol payloads, IDs, data-cmd, or data-tooltip.
 * The paired English source literals keep this module mechanically aligned
 * with the Phase 3 UI chrome inventory until T3-05/T3-06/T3-07 apply them.
 */

type ChromeSource = readonly [english: string, japanese: string];
type ChromeSourceTable = Readonly<Record<string, ChromeSource>>;
type ChromeJapaneseTable<T extends ChromeSourceTable> = {
	readonly [Key in keyof T]: T[Key][1];
};

function defineChromeStrings<const T extends ChromeSourceTable>(sources: T): ChromeJapaneseTable<T> {
	const strings: Record<string, string> = {};
	for (const key of Object.keys(sources) as (keyof T)[]) {
		strings[String(key)] = sources[key][1];
	}
	return Object.freeze(strings) as ChromeJapaneseTable<T>;
}

function indexChromeStrings(groups: readonly ChromeSourceTable[]): Readonly<Record<string, string>> {
	const strings: Record<string, string> = {};
	for (const group of groups) {
		for (const [english, japanese] of Object.values(group)) {
			if (strings[english] !== undefined) {
				throw new Error(`Duplicate UI chrome source string: ${english}`);
			}
			strings[english] = japanese;
		}
	}
	return Object.freeze(strings);
}

const SharedChromeSources = {
	close: ['Close', '閉じる'],
	back: ['Back', '戻る'],
	cancel: ['Cancel', 'キャンセル'],
	loading: ['Loading...', '読み込み中…'],
	formatLabel: ['Format:', 'フォーマット：'],
	delete: ['Delete', '削除'],
	deselect: ['Deselect', '選択解除'],
	undoDelete: ['Undo delete', '削除を取り消す'],
	pasteCopyHere: ['Paste copy here', 'ここにコピーを貼り付け'],
	moveHere: ['Move here', 'ここへ移動'],
	all: ['(all)', '（すべて）'],
	uncategorized: ['(uncategorized)', '（未分類）'],
	teamsNotInAnyFolders: ['Teams not in any folders', 'どのフォルダにも属していないチーム'],
	gigantamax: ['Gigantamax', 'キョダイマックス'],
	tera: ['Tera', 'テラスタル'],
} as const;

export const SharedChromeJA = defineChromeStrings(SharedChromeSources);

const BattleChromeSources = {
	versus: ['vs.', '対'],
	refresh: ['Refresh', '更新'],
	meloettaMascotTitle: ['Meloetta is PS\'s mascot! The Pirouette forme is Fighting-type, and represents our battles.', 'メロエッタはPokémon Showdownのマスコットです！ かくごのすがたはかくとうタイプで、対戦を象徴しています。'],
	allFormatsPlaceholder: ['(All formats)', '（すべてのフォーマット）'],
	minimumEloLabel: ['Minimum Elo:', '最低レート：'],
	none: ['None', 'なし'],
	usernamePrefixPlaceholder: ['Username prefix', 'ユーザー名（前方一致）'],
	search: ['Search', '検索'],
	noBattlesAreGoingOn: ['No battles are going on', '現在進行中の対戦はありません'],
	battleSingular: ['battle', '件の対戦'],
	battlePlural: ['battles', '件の対戦'],
	yourMoveNotifyTitle: ['Your move!', '技を選んでください'],
	moveNotifyBody: ['Move in your battle', '対戦で技を選択してください'],
	yourSwitchNotifyTitle: ['Your switch!', '交代してください'],
	switchNotifyBody: ['Switch in your battle', '交代するポケモンを選択してください'],
	teamPreviewNotifyTitle: ['Team preview!', '選出してください'],
	teamPreviewNotifyBody: ['Choose your team order in your battle', '対戦開始時の選出順を決めてください'],
	opponentLabel: ['Opponent:', '対戦相手：'],
	play: ['Play', '再生'],
	pause: ['Pause', '一時停止'],
	firstTurn: ['First turn', '最初のターン'],
	prevTurn: ['Prev turn', '前のターン'],
	skipTurn: ['Skip turn', '次のターンへ'],
	skipToEnd: ['Skip to end', '最後まで進む'],
	switchViewpoint: ['Switch viewpoint', '視点を切り替える'],
	goToTurn: ['Go to turn', 'ターンへ移動'],
	emptySlot: ['(empty slot)', '（空き）'],
	maybeDisabledWarning: ['have some moves disabled, so you won\'t be able to cancel an attack!', '一部の技を使えず、攻撃をキャンセルできない'],
	might: ['might', '可能性があります'],
	you: ['You', 'あなたのポケモンは'],
	maybeLockedWarning: ['be locked into a move.', '技が固定されている'],
	tryFightButton: ['Try Fight button', '「たたかう」を試す'],
	lockedSwitchWarning: ['(prevents switching if you\'re locked)', '（技が固定されている場合は交代できません）'],
	dynamax: ['Dynamax', 'ダイマックス'],
	megaEvolution: ['Mega Evolution', 'メガシンカ'],
	megaEvolutionX: ['Mega Evolution X', 'メガシンカX'],
	megaEvolutionY: ['Mega Evolution Y', 'メガシンカY'],
	ultraBurst: ['Ultra Burst', 'ウルトラバースト'],
	zPower: ['Z-Power', 'Zパワー'],
	maxedWithNoMaxMoves: ['Maxed with no max moves', 'ダイマックス技がありません'],
	noZMoves: ['No Z moves', 'Zワザがありません'],
	maybeTrappedWarning: ['be trapped, so you won\'t be able to cancel a switch!', '交代できず、交代をキャンセルできない'],
	cannotSwitchWarning: ['and cannot switch!', 'ため、交代できません！'],
	trapped: ['trapped', '交代できない状態の'],
	youAre: ['You\'re', 'あなたのポケモンは'],
	chooseRevive: ['Choose a pokemon to revive!', '復活させるポケモンを選んでください！'],
	teamTab: ['Team', 'チーム'],
	mega: ['Mega', 'メガ'],
	ultra: ['Ultra', 'ウルトラ'],
	shiftAction: ['shift', '中央へ移動'],
	skip: ['Skip', 'スキップ'],
	skipAnimation: ['Skip animation', 'アニメーションをスキップ'],
	battleTab: ['Battle', '対戦'],
	switchTab: ['Switch', '交代'],
	atWhere: ['at where?', 'をどこに使う？'],
	shouldUse: ['should use', 'は'],
	do: ['do?', 'はどうする？'],
	whatWill: ['What will', '次に'],
	moveToCenter: ['Move to center', '中央へ移動'],
	shiftHeading: ['Shift', '中央移動'],
	whoWillReplace: ['Who will replace', 'の代わりに出すポケモンは？'],
	choose: ['Choose', 'を選択'],
	leadSlot: ['lead', '先発'],
	// eslint-disable-next-line no-template-curly-in-string
	numberedSlot: ['slot ${…}', '第${…}匹'],
	teamSoFar: ['Team so far', '現在の選出'],
	downloadReplay: ['Download replay', 'リプレイをダウンロード'],
	uploadAndShareReplay: ['Upload and share replay', 'リプレイをアップロードして共有'],
	replay: ['Replay', 'リプレイ'],
	closesThisBattle: ['(closes this battle)', '（この対戦を閉じます）'],
	mainMenu: ['Main menu', 'メインメニュー'],
	rematch: ['Rematch', '再戦'],
} as const;

export const BattleChromeJA = defineChromeStrings(BattleChromeSources);

const ForfeitDialogSources = {
	confirm: ['Forfeiting makes you lose the battle. Are you sure?', '対戦を降参すると負けになります。よろしいですか？'],
	forfeitAndClose: ['Forfeit and close', '降参して閉じる'],
	justForfeit: ['Just forfeit', '降参する'],
	replacePlayer: ['Replace player', 'プレイヤーを交代'],
	replacementPlayerNameLabel: ['Replacement player\'s name:', '交代するプレイヤー名：'],
	replace: ['Replace', '交代する'],
} as const;

export const ForfeitDialogJA = defineChromeStrings(ForfeitDialogSources);

const TeambuilderChromeSources = {
	noMoves: ['(No moves)', '（技なし）'],
	clipboard: ['Clipboard', 'クリップボード'],
	resist: ['resist', '半減'],
	weak: ['weak', '弱点'],
	defensiveCoverage: ['Defensive coverage', '防御タイプ相性'],
	seeAll: ['See all', 'すべて見る'],
	form: ['Form', 'フォルム'],
	importExport: ['Import/Export', 'インポート／エクスポート'],
	level: ['Level', 'レベル'],
	shiny: ['Shiny', '色違い'],
	yes: ['Yes', 'はい'],
	hiddenPowerShort: ['H. Power', 'めざめるパワー'],
	gender: ['Gender', '性別'],
	copied: ['Copied!', 'コピーしました！'],
	copy: ['Copy', 'コピー'],
	importExportPlaceholder: ['Paste exported teams, pokepaste URLs, or JSON here', 'エクスポートしたチーム、PokepasteのURL、またはJSONをここに貼り付け'],
	addPokemon: ['Add Pok&eacute;mon', 'ポケモンを追加'],
	esc: ['Esc', 'Esc'],
	fetchingPaste: ['Fetching Paste...', '貼り付けデータを取得中…'],
	import: ['Import', 'インポート'],
	pokemon: ['Pokemon', 'ポケモン'],
	addToClipboard: ['Add to clipboard', 'クリップボードに追加'],
	copyMove: ['Copy/Move', 'コピー／移動'],
	details: ['Details', '詳細'],
	hiddenPowerAbbreviation: ['H.P.', 'めざパ'],
	moves: ['Moves', '技'],
	stats: ['Stats', '能力値'],
	ability: ['Ability', '特性'],
	item: ['Item', '持ち物'],
	nickname: ['Nickname', 'ニックネーム'],
	sampleSets: ['Sample sets', 'サンプル構築'],
	boxSets: ['Box sets', 'ボックス内の構築'],
	no: ['No', 'いいえ'],
	setsFoundInBoxes: ['sets found in boxes', 'ボックス内に構築が見つかりません'],
	importExportSet: ['Import/Export Set', '構築をインポート／エクスポート'],
	revert: ['Revert', '元に戻す'],
	ivSpreads: ['IV spreads', '個体値配分'],
	auto: ['Auto (', '自動（'],
	hiddenPower: ['Hidden Power', 'めざめるパワー'],
	ivs: ['IVs', '個体値'],
	smogonAnalysis: ['Smogon&nbsp;analysis', 'Smogonの分析'],
	guessedSpreadLabel: ['Guessed spread:', '推定配分：'],
	chooseFourMovesForGuessedSpread: ['(Please choose 4 moves to get a guessed spread)', '（推定配分を表示するには技を4つ選んでください）'],
	protipLabel: ['Protip:', 'ヒント：'],
	useADifferentNatureTo: ['Use a different nature to', '別の性格にすると'],
	// eslint-disable-next-line no-template-curly-in-string
	saveValueEvs: ['save ${…} EVs', '努力値を${…}節約できます'],
	getHigherStats: ['get higher stats', 'より高い能力値になります'],
	evsIvsAndNature: ['EVs, IVs, and Nature', '努力値・個体値・性格'],
	base: ['Base', '種族値'],
	avs: ['AVs', '覚醒値'],
	evs: ['EVs', '努力値'],
	points: ['Points', 'ポイント'],
	dvs: ['DVs', '個体値'],
	remainingLabel: ['Remaining:', '残り：'],
	natureLabel: ['Nature:', '性格：'],
	and: ['and', 'または'],
	inTheEvBox: ['in the EV box.', 'と努力値欄に入力して性格も設定できます。'],
	youCanAlsoSetNaturesByTyping: ['You can also set natures by typing', '性格は'],
	nicknameLabel: ['Nickname:', 'ニックネーム：'],
	levelLabel: ['Level:', 'レベル：'],
	preferFormatLevelHint: ['(You probably want to change the team\'s levels by changing the format, not here)', '（レベルはここではなく、フォーマット設定で変更することをおすすめします）'],
	shinyLabel: ['Shiny:', '色違い：'],
	genderLabel: ['Gender:', '性別：'],
	random: ['Random', 'ランダム'],
	happinessLabel: ['Happiness:', 'なつき度：'],
	dynamaxLevelLabel: ['Dynamax Level:', 'ダイマックスレベル：'],
	hiddenPowerTypeLabel: ['Hidden Power Type:', 'めざめるパワーのタイプ：'],
	teraTypeTitle: ['Tera Type', 'テラスタイプ'],
	teraTypeLabel: ['Tera Type:', 'テラスタイプ：'],
	formLabel: ['Form:', 'フォルム：'],
} as const;

export const TeambuilderChromeJA = defineChromeStrings(TeambuilderChromeSources);

const TeambuilderListChromeSources = {
	addFolder: ['(add folder)', '（フォルダを追加）'],
	convertToPrefix: ['Convert to prefix', '接頭辞フォルダに変換'],
	addFormatFolder: ['(add format folder)', '（フォーマットフォルダを追加）'],
	folders: ['Folders', 'フォルダ'],
	gen: ['Gen', '世代'],
	allTeams: ['All teams', 'すべてのチーム'],
	saveNotAllowedForPartialExports: ['Save (not allowed for partial exports)', '保存（部分エクスポートでは使用できません）'],
	saveChanges: ['Save changes', '変更を保存'],
	rename: ['Rename', '名前を変更'],
	remove: ['Remove', '削除'],
	allTeamsTitle: ['All Teams', 'すべてのチーム'],
	new: ['New', '新規'],
	newBox: ['New box', '新しいボックス'],
	searchTeamsPlaceholder: ['Search teams', 'チームを検索'],
	youHaveNoTeamsLol: ['you have no teams lol', 'チームがありません'],
	youHaveNoTeamsMatching: ['you have no teams matching', '一致するチームがありません：'],
	youHaveNoTeamsInThisFolder: ['you have no teams in this folder', 'このフォルダにはチームがありません'],
	clipboard: ['+ Clipboard', '＋クリップボード'],
	copyMoveTitle: ['Copy/move', 'コピー／移動'],
	backup: ['Backup', 'バックアップ'],
	folder: ['folder', 'フォルダ'],
	searchResults: ['search results', '検索結果'],
} as const;

export const TeambuilderListChromeJA = defineChromeStrings(TeambuilderListChromeSources);

const TeambuilderTeamChromeSources = {
	teambuildingResourcesFor: ['Teambuilding resources for', 'チーム構築資料：'],
	find: ['Find', '探す'],
	more: ['more', 'さらに'],
	helpfulResourcesFor: ['helpful resources for', '役立つ資料：'],
	on: ['on', '掲載先：'],
	theSmogonDex: ['the Smogon Dex', 'Smogon Dex'],
	list: ['List', '一覧'],
	teamDoesNotExist: ['Team doesn\'t exist', 'チームが存在しません'],
	teamWasDeleted: ['Team was deleted', 'チームは削除されました'],
	teams: ['Teams', 'チーム一覧'],
	publicMarker: ['(public)', '（公開）'],
	account: ['Account', 'アカウント'],
	uploadChanges: ['Upload changes', '変更をアップロード'],
	disconnectedWrongAccount: ['Disconnected (wrong account?)', '接続解除（別のアカウント？）'],
	local: ['Local', 'ローカル'],
	teamNameLabel: ['Team name:', 'チーム名：'],
	validate: ['Validate', '検証'],
	uploading: ['Uploading...', 'アップロード中…'],
	shareUrlLabel: ['Share URL:', '共有URL：'],
	revertToUploadedVersion: ['Revert to uploaded version', 'アップロード版に戻す'],
	compare: ['Compare', '比較'],
	publicStorage: ['Public', '公開'],
	uploadFor: ['Upload for', 'アップロード：'],
	shareableUrl: ['shareable URL', '共有可能なURL'],
	shareableSearchableUrl: ['shareable/searchable URL', '共有・検索可能なURL'],
	disconnectedTeamExplanation: ['This is a disconnected team. This could be because you uploaded it on a different account, or because you deleted or un-uploaded it on a different computer. For safety, you can\'t edit this team. You can, however, delete it, or make a copy (which will be editable).', 'このチームはアカウントとの接続が解除されています。別のアカウントでアップロードしたか、別の端末で削除またはアップロード解除した可能性があります。安全のため編集できませんが、削除またはコピーして編集可能な新しいチームを作成できます。'],
	untitledTeam: ['Untitled team', '無題のチーム'],
	uploadedByLabel: ['Uploaded by:', 'アップロードしたユーザー：'],
	viewsLabel: ['Views:', '閲覧数：'],
	edit: ['Edit', '編集'],
	disconnected: ['Disconnected', '接続解除'],
	disconnectedNotFoundDescription: ['Not found in the Teams database. Maybe you uploaded it on a different account?', 'チームデータベースに見つかりません。別のアカウントでアップロードした可能性があります。'],
	localStorageDescription: ['Stored in cookies on your computer. Warning: Your browser might delete these. Make sure to use backups.', 'この端末のCookieに保存されています。ブラウザによって削除される可能性があるため、必ずバックアップしてください。'],
	accountStorageDescription: ['Uploaded to the Teams database. You can share with the URL.', 'チームデータベースにアップロードされています。URLで共有できます。'],
	accountPublic: ['Account (public)', 'アカウント（公開）'],
	publicStorageDescription: ['Uploaded to the Teams database publicly. Share with the URL or people can find it by searching.', 'チームデータベースに公開状態でアップロードされています。URLで共有でき、検索からも見つけられます。'],
} as const;

export const TeambuilderTeamChromeJA = defineChromeStrings(TeambuilderTeamChromeSources);

const TeamDropdownChromeSources = {
	empty: ['(empty', '（空の'],
	box: ['box', 'ボックス'],
	team: ['team', 'チーム'],
	selectATeam: ['Select a team', 'チームを選択'],
	teamSelectorUnavailable: ['This team selector is no longer available (the challenge was cancelled or something).', 'このチーム選択画面は利用できません（対戦申請がキャンセルされた可能性があります）。'],
	otherGens: ['Other gens', 'その他の世代'],
	noTeamsFound: ['No teams found', 'チームが見つかりません'],
	formatSelectorUnavailable: ['This format selector is no longer available.', 'このフォーマット選択画面は利用できません。'],
	searchFormatsPlaceholder: ['Search formats', 'フォーマットを検索'],
	gen9: ['Gen 9', '第9世代'],
	found: ['found', '件見つかりました'],
	// eslint-disable-next-line no-template-curly-in-string
	matchingValue: ['matching "${…}"', '「${…}」に一致する'],
	noFormats: ['No formats', 'フォーマットがありません'],
} as const;

export const TeamDropdownChromeJA = defineChromeStrings(TeamDropdownChromeSources);

export const UIChromeJAByEnglish = indexChromeStrings([
	SharedChromeSources,
	BattleChromeSources,
	ForfeitDialogSources,
	TeambuilderChromeSources,
	TeambuilderListChromeSources,
	TeambuilderTeamChromeSources,
	TeamDropdownChromeSources,
]);

export const UIChromeJAGroups = Object.freeze({
	shared: SharedChromeJA,
	battle: BattleChromeJA,
	forfeitDialog: ForfeitDialogJA,
	teambuilder: TeambuilderChromeJA,
	teambuilderList: TeambuilderListChromeJA,
	teambuilderTeam: TeambuilderTeamChromeJA,
	teamDropdown: TeamDropdownChromeJA,
});

export type UIChromeEnglish = keyof typeof UIChromeJAByEnglish;
