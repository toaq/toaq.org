	

    // ======================= //
    //    Toaq preprocessor    //
    // ======================= //
     
    // Written by Ilmen (ilmen.pokebip <at> gmail.com)
    // Last change: 2014-04-30
     
    // ======================================================================= //
     
    var tone_marks =    "/\\^-~\"V?";
    var plain_vowels =  "aeiou";
    var acute_vowels =  "áéíóú";
    var grave_vowels =  "àèìòù";
    var circum_vowels = "âêîôû";
    var macron_vowels = "āēīōū";
    var tilde_vowels =  "ãẽĩõũ";
    var breve_vowels =  "ǎěǐǒǔ";
    var hooked_vowels = "ảẻỉỏủ";
     
    // ======================================================================= //
     
    function camxes_preprocessing(input) {
            if (!(typeof input.valueOf() === 'string'))
                    return "ERROR: Wrong input type.";
            input = toaq_diacritics_to_tone_marks(input);
            return input;
    }
     
    module.exports.preprocessing = camxes_preprocessing;
     
    // ======================================================================= //
     
    function check_for_diacritic_vowel(chr) {
            var i;
            for (i = 0; i < 5; i++)
                    if (acute_vowels[i] == chr) return [plain_vowels[i], "/"];
            for (i = 0; i < 5; i++)
                    if (grave_vowels[i] == chr) return [plain_vowels[i], "\\"];
            for (i = 0; i < 5; i++)
                    if (circum_vowels[i] == chr) return [plain_vowels[i], "^"];
            for (i = 0; i < 5; i++)
                    if (macron_vowels[i] == chr) return [plain_vowels[i], "-"];
            for (i = 0; i < 5; i++)
                    if (tilde_vowels[i] == chr) return [plain_vowels[i], "~"];
            for (i = 0; i < 5; i++)
                    if (breve_vowels[i] == chr) return [plain_vowels[i], "V"];
            for (i = 0; i < 5; i++)
                    if (hooked_vowels[i] == chr) return [plain_vowels[i], "?"];
            return 0;
    }
     
    function make_diacritic_vowel(vowel, tone) {
            var n = 0;
            while (plain_vowels[n] != vowel && n < 5) n++;
            if (n == 5) return "•";  // Unknown vowel
            switch (tone) {
                    case "/":   return acute_vowels[n];
                    case "\\":  return grave_vowels[n];
                    case "^":   return circum_vowels[n];
                    case "-":   return macron_vowels[n];
                    case "~":   return tilde_vowels[n];
                    case "V":   return breve_vowels[n];
                    case "?":   return hooked_vowels[n];
                    default:    return "•";  // Unknown tone
            }
    }
     
    function toaq_diacritics_to_tone_marks(toaq) {
            if (!is_string(toaq)) return -1;
            for (var i = 0; i < toaq.length; i++) {
                    var res = check_for_diacritic_vowel(toaq[i]);
                    if (res != 0) {
                            toaq = str_replace(toaq, i, 1, res[0]);
                            do i++;
                            while (i < toaq.length && chr_check(toaq[i], plain_vowels + "q"));
                            toaq = str_replace(toaq, i, 0, res[1]);
                            i++;
                    }
            }
            return toaq;
    }
     
    function toaq_tone_marks_to_diacritics(toaq) {
            if (!is_string(toaq)) return -1;
            for (var i = 0; i < toaq.length; i++) {
                    i = toaq.search(/[aeiou]+q?[\/\\\^\-~\"V\?]/);
                    if (i < 0) break;
                    var j = i;
                    while (!chr_check(toaq[i], tone_marks)) {
                            i++;
                            if (i == toaq.length) break;
                    }
                    for (var k = 0; k < 8; k++) if (toaq[i] == tone_marks[k]) break;
                    if (k == 8) continue;
                    toaq = str_replace(toaq, j, 1, make_diacritic_vowel(toaq[j], tone_marks[k]));
                    toaq = str_replace(toaq, i, 1, "");
            }
            return toaq;
    }
     
    // ======================================================================= //
     
    function is_string(v) {
        return typeof v.valueOf() === 'string';
    }
     
    function str_replace(str, pos, len, sub) {
            if (pos <= str.length) {
                    if (pos + len >= str.length) len -= pos + len - str.length;
                    return str.substring(0, pos) + sub + str.substring(pos + len);
            } else return str;
    }
     
    function chr_check(chr, list) {
            var i = 0;
            if (!is_string(list)) return false;
            do if (chr == list[i]) return true; while (i++ < list.length);
            return false;
    }


