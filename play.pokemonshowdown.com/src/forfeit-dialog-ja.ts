import { ForfeitDialogJA } from "./client-ui-ja-strings";

const FORFEIT_AND_CLOSE_CMD = '/closeand /inopener /closeand /forfeit';
const JUST_FORFEIT_CMD = '/closeand /inopener /forfeit';

function setButtonLabel(button: HTMLButtonElement, label: string) {
	const strong = button.querySelector('strong');
	if (strong) {
		strong.textContent = label;
		return;
	}
	const textNode = Array.from(button.childNodes).find(node =>
		node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
	);
	if (textNode) {
		textNode.textContent = label;
	} else {
		button.append(document.createTextNode(label));
	}
}

function localizeForfeitDialog() {
	const forfeitAndClose = document.querySelector<HTMLButtonElement>(
		`button[data-cmd="${FORFEIT_AND_CLOSE_CMD}"]`
	);
	const justForfeit = document.querySelector<HTMLButtonElement>(
		`button[data-cmd="${JUST_FORFEIT_CMD}"]`
	);
	if (!forfeitAndClose || !justForfeit) return;

	const container = forfeitAndClose.closest('.pad');
	if (!container || !container.contains(justForfeit)) return;

	const prompt = container.querySelector('p');
	if (prompt) prompt.textContent = ForfeitDialogJA.confirm;
	setButtonLabel(forfeitAndClose, ForfeitDialogJA.forfeitAndClose);
	setButtonLabel(justForfeit, ForfeitDialogJA.justForfeit);
}

localizeForfeitDialog();

const observerRoot = document.getElementById('ps-frame') || document.body;
new MutationObserver(localizeForfeitDialog).observe(observerRoot, {
	childList: true,
	subtree: true,
});
