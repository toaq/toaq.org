const diacritic_to_tone_mark = {
  "\u0300": "\\",
  "\u0301": "/",
  "\u0302": "^",
  "\u0303": "~",
  "\u0304": "", // old t1
  "\u0305": "", // old t1
  "\u0306": "V",
  "\u0308": "V",
  "\u0309": "?",
  "\u030c": "V",
};

function camxes_preprocessing(input) {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /([\u0300-\u036f])([a-z']*)/g,
        (m, dia, vq) => vq + diacritic_to_tone_mark[dia]
      )
  );
}
