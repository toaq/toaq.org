const tone_mark_to_diacritic = {
  "1": "\u0304", "-": "\u0304",
  "2": "\u0301", "/": "\u0301",
  "3": "\u0308", "\"": "\u0308", "V": "\u0308",
  "4": "\u0309", "?": "\u0309",
  "5": "\u0302", "^": "\u0302",
  "6": "\u0300", "\\": "\u0300",
  "7": "\u0303", "~": "\u0303",
};

function restore_diacritics(text) {
  return text.replace(/([aeiouy])([aeiouy]*q?)([/\\^\-~V?1-7])/g, (m, v, vq, tm) => (v + tone_mark_to_diacritic[tm] + vq).normalize("NFC")).replace(/i/gm, "ı");
}

function to_syntree(node) {
  if (typeof node === "string") return restore_diacritics(node);
  if (node.length === 2 && Array.isArray(node[1])) return to_syntree(node[1]);
  return "[" + node[0] + " " + node.slice(1).map(to_syntree).join(" ") + "]";
}

function camxes_postprocessing(tree) {
  return to_syntree(tree);
}