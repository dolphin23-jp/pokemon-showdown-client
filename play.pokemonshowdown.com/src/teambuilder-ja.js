'use strict';

(() => {
	const root = typeof window === 'undefined' ? globalThis : window;
	const ROOM_SELECTOR = '#room-teambuilder, [id^="room-team-"], #room-viewteam, [id^="room-teamstorage-"]';
	const FIELD_SELECTOR = 'input.set-field[name="pokemon"], input.set-field[name="move"], ' +
		'input.set-field[name="ability"], input.set-field[name="item"]';
	const SEARCH_ENTRY_SELECTOR = 'a[data-entry^="pokemon|"], a[data-entry^="move|"], ' +
		'a[data-entry^="ability|"], a[data-entry^="item|"]';
	const TEXT_CONTAINER_SELECTOR = [
		'button', 'label', 'summary', 'h1', 'h2', 'h3', 'em', 'small', 'option', 'optgroup',
		'.teambuilder-folder-title', '.mainmessage', '.error', '.infobox', '.details-preview',
	].join(', ');

	const DISPLAY_METHODS = Object.freeze({
		pokemon: 'displaySpeciesName',
		move: 'displayMoveName',
		ability: 'displayAbilityName',
		item: 'displayItemName',
	});

	const FIXED_TEXT = Object.freeze({
		'Teambuilder': 'チームビルダー',
		'Form': 'フォーム',
		'Import/Export': 'インポート／エクスポート',
		'Import': 'インポート',
		'New team': '新しいチーム',
		'New box': '新しいボックス',
		'Add Pokémon': 'ポケモンを追加',
		'Add Pokemon': 'ポケモンを追加',
		'Pokemon': 'ポケモン',
		'Details': '詳細',
		'Moves': '技',
		'Stats': '能力値',
		'Ability': '特性',
		'Item': '持ち物',
		'Nickname': 'ニックネーム',
		'Level': 'レベル',
		'Shiny': '色違い',
		'Gender': '性別',
		'Male': 'オス',
		'Female': 'メス',
		'Yes': 'はい',
		'Back': '戻る',
		'Close': '閉じる',
		'Teams': 'チーム一覧',
		'List': '一覧',
		'Team name:': 'チーム名:',
		'Validate': '使用可否を確認',
		'Backup': 'バックアップ',
		'All Teams': 'すべてのチーム',
		'Folders': 'フォルダー',
		'Rename': '名前変更',
		'Remove': '削除',
		'Delete': '削除',
		'Undo delete': '削除を取り消す',
		'Copy': 'コピー',
		'Copied!': 'コピーしました',
		'Copy/Move': 'コピー／移動',
		'Add to clipboard': 'クリップボードに追加',
		'Deselect': '選択解除',
		'Clipboard': 'クリップボード',
		'Cancel': 'キャンセル',
		'Paste copy here': 'ここにコピーを貼り付け',
		'Move here': 'ここへ移動',
		'Save changes': '変更を保存',
		'Save (not allowed for partial exports)': '保存（部分エクスポートでは使用不可）',
		'Defensive coverage': '防御相性',
		'See all': 'すべて表示',
		'Sample sets': 'サンプルセット',
		'Box sets': 'ボックス内のセット',
		'Loading...': '読み込み中...',
		'Fetching Paste...': '貼り付けデータを取得中...',
		'(all)': '（すべて）',
		'(add folder)': '（フォルダーを追加）',
		'(add format folder)': '（ルール別フォルダーを追加）',
		'(uncategorized)': '（未分類）',
		'Teams not in any folders': 'フォルダー未所属のチーム',
		'All teams': 'すべてのチーム',
		'you have no teams lol': 'チームがありません',
		'you have no teams in this folder': 'このフォルダーにチームはありません',
	});

	const ATTRIBUTE_TEXT = Object.freeze({
		'Search teams': 'チームを検索',
		'Search species or filter by type, learnable moves, ability, or egg group':
			'ポケモン名、タイプ、習得技、特性、タマゴグループで検索',
		'Search abilities': '特性を検索',
		'Search items': '持ち物を検索',
		'Search moves or filter by type or category': '技名、タイプ、分類で検索',
		' Paste exported teams, pokepaste URLs, or JSON here':
			' エクスポートした英語形式のチーム、Pokepaste URL、JSONをここに貼り付け',
		'(no ability)': '（特性なし）',
		'(choose ability)': '（特性を選択）',
		'(no item)': '（持ち物なし）',
		'Add Pokemon': 'ポケモンを追加',
		'Copy/move': 'コピー／移動',
		'Details': '詳細',
		'Stats': '能力値',
		'Import/Export': 'インポート／エクスポート',
	});

	function displayFieldName(type, canonicalName) {
		if (!canonicalName) return canonicalName || '';
		const methodName = DISPLAY_METHODS[type];
		const api = root.PSDisplayNames;
		const method = methodName && api?.[methodName];
		return typeof method === 'function' ? method(canonicalName) : canonicalName;
	}

	function translateFixedText(text) {
		const exact = FIXED_TEXT[text];
		if (exact) return exact;
		let match = /^All Teams \((\d+)\)$/.exec(text);
		if (match) return `すべてのチーム (${match[1]})`;
		match = /^you have no teams matching (.+)$/.exec(text);
		if (match) return `${match[1]} に一致するチームはありません`;
		match = /^New (.+) team$/.exec(text);
		if (match) return `新しい ${match[1]} チーム`;
		if (text === 'New team in folder') return 'フォルダー内に新しいチーム';
		if (text === 'Backup folder') return 'フォルダーをバックアップ';
		if (text === 'Backup search results') return '検索結果をバックアップ';
		return text;
	}

	function fieldType(input) {
		return input?.name && DISPLAY_METHODS[input.name] ? input.name : '';
	}

	function localizeFieldInput(input) {
		const type = fieldType(input);
		if (!type || !input.dataset) return false;
		if (typeof document !== 'undefined' && document.activeElement === input) return false;

		let canonicalName = input.dataset.psCanonicalName || input.value || '';
		if (!canonicalName) return false;
		const displayName = displayFieldName(type, canonicalName);
		if (!displayName || displayName === canonicalName) {
			delete input.dataset.psCanonicalName;
			return false;
		}
		input.dataset.psCanonicalName = canonicalName;
		if (input.value === displayName) return false;
		input.value = displayName;
		return true;
	}

	function restoreCanonicalFieldInput(input) {
		if (!fieldType(input) || !input.dataset?.psCanonicalName) return false;
		const canonicalName = input.dataset.psCanonicalName;
		if (input.value === canonicalName) return false;
		input.value = canonicalName;
		return true;
	}

	function localizeSearchEntry(anchor) {
		const entry = anchor.getAttribute?.('data-entry') || '';
		const separator = entry.indexOf('|');
		if (separator < 0) return false;
		const type = entry.slice(0, separator);
		const canonicalName = entry.slice(separator + 1).split('|')[0];
		if (!DISPLAY_METHODS[type] || !canonicalName) return false;

		const selector = type === 'pokemon' ? '.pokemonnamecol' :
			type === 'move' ? '.movenamecol' : '.namecol';
		const nameElement = anchor.querySelector?.(selector);
		if (!nameElement) return false;
		const displayName = displayFieldName(type, canonicalName);
		if (!displayName || nameElement.textContent === displayName) return false;
		nameElement.textContent = displayName;
		return true;
	}

	function localizePokemonRowAbilities(anchor) {
		let changed = 0;
		for (const abilityCell of anchor.querySelectorAll?.('.abilitycol, .twoabilitycol') || []) {
			for (const node of abilityCell.childNodes || []) {
				if (node.nodeType !== 3 || !node.nodeValue?.trim()) continue;
				const raw = node.nodeValue;
				const canonicalName = raw.trim();
				const displayName = displayFieldName('ability', canonicalName);
				if (displayName && displayName !== canonicalName) {
					node.nodeValue = raw.replace(canonicalName, displayName);
					changed++;
				}
			}
		}
		return changed;
	}

	function skipFixedTextNode(node) {
		const parent = node.parentElement;
		if (!parent) return true;
		if (parent.closest?.('textarea, script, style, [contenteditable="true"]')) return true;
		if (parent.closest?.('a.team strong')) return true;
		if (parent.closest?.('.pokemonnamecol, .movenamecol, .namecol, .abilitycol, .twoabilitycol')) return true;
		return false;
	}

	function localizeFixedTextNode(node) {
		if (node.nodeType !== 3 || !node.nodeValue?.trim() || skipFixedTextNode(node)) return false;
		const raw = node.nodeValue;
		const text = raw.trim();
		const translated = translateFixedText(text);
		if (!translated || translated === text) return false;
		node.nodeValue = raw.replace(text, translated);
		return true;
	}

	function localizeAttributes(element) {
		let changed = 0;
		for (const attribute of ['placeholder', 'aria-label', 'title']) {
			const value = element.getAttribute?.(attribute);
			const translated = value && ATTRIBUTE_TEXT[value];
			if (translated && translated !== value) {
				element.setAttribute(attribute, translated);
				changed++;
			}
		}
		return changed;
	}

	function roomRoots(rootNode) {
		const rooms = [];
		const element = rootNode;
		if (element?.matches?.(ROOM_SELECTOR)) rooms.push(element);
		const closest = element?.closest?.(ROOM_SELECTOR);
		if (closest && !rooms.includes(closest)) rooms.push(closest);
		for (const room of rootNode?.querySelectorAll?.(ROOM_SELECTOR) || []) {
			if (!rooms.includes(room)) rooms.push(room);
		}
		return rooms;
	}

	function localizeRoom(room) {
		let changed = 0;
		for (const input of room.querySelectorAll?.(FIELD_SELECTOR) || []) {
			if (localizeFieldInput(input)) changed++;
		}
		for (const anchor of room.querySelectorAll?.(SEARCH_ENTRY_SELECTOR) || []) {
			if (localizeSearchEntry(anchor)) changed++;
			if ((anchor.getAttribute?.('data-entry') || '').startsWith('pokemon|')) {
				changed += localizePokemonRowAbilities(anchor);
			}
		}

		const textContainers = [];
		if (room.matches?.(TEXT_CONTAINER_SELECTOR)) textContainers.push(room);
		for (const element of room.querySelectorAll?.(TEXT_CONTAINER_SELECTOR) || []) textContainers.push(element);
		for (const element of textContainers) {
			changed += localizeAttributes(element);
			for (const node of element.childNodes || []) {
				if (localizeFixedTextNode(node)) changed++;
			}
		}
		for (const element of room.querySelectorAll?.('[placeholder], [aria-label], [title]') || []) {
			changed += localizeAttributes(element);
		}
		return changed;
	}

	function localizeRoot(rootNode) {
		let changed = 0;
		for (const room of roomRoots(rootNode)) changed += localizeRoom(room);
		return changed;
	}

	function install() {
		if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
		const documentRoot = document.documentElement;
		if (!documentRoot) return;

		localizeRoot(documentRoot);
		document.addEventListener('focusin', event => {
			restoreCanonicalFieldInput(event.target);
		}, true);
		document.addEventListener('input', event => {
			const input = event.target;
			if (fieldType(input) && input.dataset) delete input.dataset.psCanonicalName;
		}, true);
		document.addEventListener('focusout', event => {
			const input = event.target;
			if (!fieldType(input)) return;
			setTimeout(() => localizeFieldInput(input), 0);
		});

		const observer = new MutationObserver(records => {
			for (const record of records) {
				if (record.type === 'characterData' && record.target.parentElement) {
					localizeRoot(record.target.parentElement);
				}
				for (const node of record.addedNodes || []) {
					if (node.nodeType === 1) localizeRoot(node);
				}
			}
		});
		observer.observe(documentRoot, { childList: true, subtree: true, characterData: true });
	}

	root.PSTeambuilderJapanese = Object.freeze({
		displayFieldName,
		translateFixedText,
		localizeFieldInput,
		restoreCanonicalFieldInput,
		localizeSearchEntry,
		localizeRoot,
	});
	install();
})();
