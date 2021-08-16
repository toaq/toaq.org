const diacritic_to_tone_mark = {
  "\u0300": "\\",
  "\u0301": "/",
  "\u0302": "^",
  "\u0303": "~",
  "\u0304": "-",
  "\u0305": "-",
  "\u0306": "V",
  "\u0308": "V",
  "\u0309": "?",
  "\u030c": "V"
};

function camxes_preprocessing(input) {
  return input.normalize("NFD").replace(/([\u0300-\u036f])([aeiouy]*q?)/g, (m, dia, vq) => vq + diacritic_to_tone_mark[dia]);
}

module.exports.preprocessing = camxes_preprocessing;
