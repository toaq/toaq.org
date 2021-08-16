const tone_mark_to_diacritic = {
	"\\": "\u0300",
	"/": "\u0301",
	"^": "\u0302",
	"~": "\u0303",
	"-": "\u0304",
	"V": "\u0308",
	"?": "\u0309",
};

function restore_diacritics(text) {
	return text.replace(/([aeiouy])([aeiouy]*q?)([/\\^\-~V?])/g, (m, v, vq, tm) => (v + tone_mark_to_diacritic[tm] + vq).normalize("NFC"));
}

function to_syntree(node) {
	if (typeof node === "string") return restore_diacritics(node);
	if (node.length === 2 && Array.isArray(node[1])) return to_syntree(node[1]);
	return "[" + node[0] + " " + node.slice(1).map(to_syntree).join(" ") + "]";
}

function camxes_postprocessing(tree) {
	return to_syntree(tree);
}