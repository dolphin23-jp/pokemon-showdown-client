'use strict';

(() => {
	const ENGLISH_EXPORT = [
		'Pikachu @ Light Ball',
		'Ability: Static',
		'- Thunderbolt',
		'- Protect',
	].join('\n');

	function addPokemon() {
		const list = document.getElementById('set-list');
		if (!list) throw new Error('set list missing');
		list.insertAdjacentHTML('beforeend', `
			<div class="set-form" data-set-index="0">
				<div style="text-align:right">
					<button class="option">Import/Export</button>
					<button class="option">Delete</button>
				</div>
				<table>
					<tr>
						<td class="set-pokemon"><label class="label"><span>Pokemon</span>
							<input class="textbox set-field" name="pokemon" data-focus="set-0-pokemon" value="Pikachu" />
						</label></td>
						<td class="set-details"><label class="label">Details
							<button class="textbox" name="details" value="set-0-details">Level 50</button>
						</label></td>
						<td class="set-moves"><label class="label">Moves</label>
							<input class="textbox set-field" name="move" data-focus="set-0-move-0" value="Thunderbolt" />
							<input class="textbox set-field" name="move" data-focus="set-0-move-1" value="Protect" />
						</td>
					</tr>
					<tr>
						<td class="set-ability"><label class="label">Ability
							<input class="textbox set-field" name="ability" data-focus="set-0-ability" value="Static" />
						</label></td>
						<td class="set-item"><label class="label">Item
							<input class="textbox set-field" name="item" data-focus="set-0-item" value="Light Ball" />
						</label></td>
						<td class="set-stats"><label class="label">Stats</label></td>
					</tr>
				</table>
				<div class="set-nickname"><label class="label"><span>Nickname</span>
					<input class="textbox set-field" name="nickname" value="" placeholder="Pikachu" />
				</label></div>
			</div>
		`);
	}

	function requireEqual(actual, expected, label) {
		if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
	}

	function verify() {
		const fields = {
			pokemon: document.querySelector('input[name="pokemon"]'),
			move: document.querySelector('input[name="move"]'),
			ability: document.querySelector('input[name="ability"]'),
			item: document.querySelector('input[name="item"]'),
		};
		requireEqual(fields.pokemon?.value, 'ピカチュウ', 'species display');
		requireEqual(fields.move?.value, '10まんボルト', 'move display');
		requireEqual(fields.ability?.value, 'せいでんき', 'ability display');
		requireEqual(fields.item?.value, 'でんきだま', 'item display');
		requireEqual(fields.pokemon?.dataset.psCanonicalName, 'Pikachu', 'species canonical cache');
		requireEqual(fields.pokemon?.getAttribute('data-focus'), 'set-0-pokemon', 'internal focus id');

		const searchEntry = document.querySelector('a[data-entry]');
		requireEqual(searchEntry?.getAttribute('data-entry'), 'move|Thunderbolt', 'search selection data');
		requireEqual(searchEntry?.querySelector('.movenamecol')?.textContent, '10まんボルト', 'search list display');

		const textarea = document.getElementById('export-text');
		requireEqual(textarea?.value, ENGLISH_EXPORT, 'Import/Export text');
		if (/[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/.test(textarea.value)) {
			throw new Error('Import/Export text contains Japanese');
		}

		const visibleText = document.getElementById('room-team-smoke')?.textContent || '';
		for (const expected of ['チームビルダー', 'インポート／エクスポート', '詳細', '技', '特性', '持ち物']) {
			if (!visibleText.includes(expected)) throw new Error(`missing fixed UI translation: ${expected}`);
		}

		document.documentElement.dataset.verified = 'true';
		const report = document.getElementById('smoke-report');
		if (report) {
			report.textContent = '検証成功: 1匹追加済み／表示名は日本語／Import・Export本文は英語のまま';
		}
	}

	window.addEventListener('DOMContentLoaded', () => {
		document.getElementById('add-pokemon')?.addEventListener('click', addPokemon, { once: true });
		document.getElementById('add-pokemon')?.click();
		setTimeout(() => {
			try {
				verify();
			} catch (error) {
				document.documentElement.dataset.verified = 'false';
				const report = document.getElementById('smoke-report');
				if (report) report.textContent = `検証失敗: ${error.message}`;
				throw error;
			}
		}, 250);
	});
})();
