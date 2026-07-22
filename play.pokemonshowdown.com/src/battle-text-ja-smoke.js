'use strict';

/* global BattleTextParser */

(async () => {
	const logElement = document.getElementById('battle-log');
	const metadataElement = document.getElementById('metadata');
	const requiredMarkers = [
		'やまあらし',
		'効果はばつぐんだ！',
		'急所に当たった！',
		'ほっぺすりすり',
		'まひして技が出にくくなった！',
		'== ターン 2 ==',
	];

	function appendLine(line) {
		const element = document.createElement('div');
		element.textContent = line.replaceAll('**', '');
		if (line.startsWith('== ')) element.className = 'major';
		else if (line.startsWith('  ')) element.className = 'result';
		logElement.appendChild(element);
	}

	try {
		const [protocolResponse, reportResponse] = await Promise.all([
			fetch('/battle-log-smoke.txt', { cache: 'no-store' }),
			fetch('/battle-log-smoke.json', { cache: 'no-store' }),
		]);
		if (!protocolResponse.ok) throw new Error(`Protocol HTTP ${protocolResponse.status}`);
		if (!reportResponse.ok) throw new Error(`Report HTTP ${reportResponse.status}`);

		const protocol = await protocolResponse.text();
		const report = await reportResponse.json();
		const parser = new BattleTextParser('p1');
		const rendered = parser.extractMessage(protocol);
		const missingMarkers = requiredMarkers.filter(marker => !rendered.includes(marker));
		if (missingMarkers.length) {
			throw new Error(`Missing Japanese markers: ${missingMarkers.join(', ')}`);
		}

		for (const line of rendered.split('\n')) {
			if (line.trim()) appendLine(line);
		}
		metadataElement.textContent =
			`${report.battle_room}・実プロトコル ${report.protocol_line_count}行・` +
			`ターン1完了・表示テンプレート ${window.PSJapaneseBattleText.templates}件`;
		document.body.dataset.ready = 'true';
		document.body.dataset.verified = 'true';
	} catch (error) {
		const element = document.createElement('div');
		element.className = 'error';
		element.textContent = `日本語対戦ログの描画に失敗しました: ${error.message}`;
		logElement.appendChild(element);
		metadataElement.textContent = '検証失敗';
		document.body.dataset.ready = 'true';
		document.body.dataset.verified = 'false';
	}
})();
