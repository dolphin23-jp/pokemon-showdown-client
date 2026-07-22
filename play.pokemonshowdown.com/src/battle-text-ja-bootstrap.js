'use strict';

(() => {
	const root = typeof globalThis === 'undefined' ? window : globalThis;
	const battleText = root.BattleText || {};
	root.BattleText = battleText;
	if (typeof window !== 'undefined') window.BattleText = battleText;
})();
