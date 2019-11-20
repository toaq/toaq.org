	/*
 * CAMXES.JS POSTPROCESSOR
 * Created by Ilmen (ilmen.pokebip <at> gmail.com) on 2013-08-16.
 * Last change: 2014-01-26.
 * 
 * Entry point: camxes_postprocessing(text, mode)
 * Arguments:
 *    -- text:  [string] camxes' raw output
 *    -- mode:  [uint] output mode flag
 *         0 = Raw output (no change)
 *         1 = Condensed
 *         2 = Prettified
 *         3 = Prettified + selma'o
 *         4 = Prettified + selma'o + bridi parts
 *         5 = Prettified - famyma'o
 *         6 = Prettified - famyma'o + selma'o
 *         7 = Prettified - famyma'o + selma'o + bridi parts
 * Return value:
 *       [string] postprocessed version of camxes' output
 */

/*
 * Function list:
 *   -- camxes_postprocessing(text, mode)
 *   -- erase_elided_terminators(str)
 *   -- delete_superfluous_brackets(str)
 *   -- prettify_brackets(str)
 *   -- is_string(v)
 *   -- str_print_uint(val, charset)
 *   -- str_replace(str, pos, len, sub)
 *   -- chr_check(chr, list)
 *   -- dbg_bracket_count(str)
 */

var tone_marks =    "/\\^\-~V?";
var plain_vowels =  "aeiou";
var acute_vowels =  "áéíóú";
var grave_vowels =  "àèìòù";
var circum_vowels = "âêîôû";
var macron_vowels = "āēīōū";
var tilde_vowels =  "ãẽĩõũ";
var breve_vowels =  "ǎěǐǒǔ";
var hooked_vowels = "ảẻỉỏủ";
 
function camxes_postprocessing(text, mode) {
	
	mode = 1;
	if (!is_string(text)) return "ERROR: Wrong input type.";
	text = text.replace(/\\\\/gm, "\\");
	if (text.charAt(0) != '[') return text;
	/** Condensation **/
	text = text.replace(/ +/gm, "");
	text = text.replace(/\r\n|\n|\r/gm, "");
	text = text.replace(/\[\]/gm, "");
	if (mode == 1) 
	    
		text = text.replace(/[\"]+/gm, "");
		text = text.replace(/,/gm, " ");
		text = text.replace(/\]\[/g, "] [");
		text = text.replace(/\[ +/g, "[");
		text = text.replace(/ +\]/g, "]");
		text = text.replace(/ +/gm, " ");
		text = text.replace(/^ +/, "");
		text = text.replace(/[\"|,]+/gm, " ");
		text = delete_superfluous_brackets(text);
		text = text.replace(/[\"]+/gm, "");
		text = text.replace(/,/gm, " ");
		text = text.replace(/\]\[/g, "] [");
		text = text.replace(/\[ +/g, "[");
		text = text.replace(/ +\]/g, "]");
		text = text.replace(/ +/gm, " ");
		text = text.replace(/^ +/, "");
		text = text.replace(/[\"|,]+/gm, " ");
		text = toaq_tone_marks_to_diacritics(text);
		
	    
		text = text.replace(/ /gm, ",");
        //text = text.replace(/\"/gm, "");
        text = text.replace(/([A-Za-z0-9_]+),([A-Za-z_'áéíóúàèìòùâêîôûāēīōūãẽĩõũǎěǐǒǔảẻỉỏủØ()]+)/g, "$1:$2");
        text = text.replace(/,/gm, "");
        
        //alert(text);
        text = erase_unary_node_names(text);
		
		
		
        //alert(text);
        //text = text.replace(/ /gm, "");
		text = text.replace(/ +/gm, "");
		
        //alert(text);
        text = delete_superfluous_brackets(text);
		
		
        text = text.replace(/([A-Za-z0-9_]+):([A-Za-z0-9_'áéíóúàèìòùâêîôûāēīōūãẽĩõũǎěǐǒǔảẻỉỏủØ()]+) /g, "[$1:$2]");
        text = text.replace(/\[/g, " [");
        text = text.replace(/\]/g, "] ");
        text = text.replace(/\[ +/g, "[");
        text = text.replace(/ +\]/g, "]");
        text = text.replace(/ +/g, " ");
        text = text.replace(/:/g, " ");
		
		text = text.replace(/!/g, "-");

        return text;
		
		
		
}

function erase_unary_node_names(str) {
        if (0) return str;
        var i = 0;
        var parachute = 3000;
        var dbg = 8;
        while (i++ < str.length && parachute--) {
                var n = str.substring(i).search(/[A-Za-z0-9'_]+\[/);
                if (n < 0) break;
                else i += n;
                //if (dbg-- >= 0) alert("# "+is_unary_node(str.substring(i))+"\n"+str.substring(i));
                if (is_unary_node(str.substring(i))) {
                        while (str[i].search(/[A-Za-z0-9'_]/) == 0 && i < str.length) {
                                str = str_replace(str, i, 1, " ");
                                i++;
                        }
                } else while (str[i].search(/[A-Za-z0-9'_]/) == 0 && i < str.length) i++;
        }
        return str;
}
 
function is_unary_node(str) {
        var i = 0;
        while (str[i] != '[') i++;
        i++;
        var floor = 1;
        while (floor != 0 && i < str.length) {
                if (str[i] == '[') floor++;
                else if (str[i] == ']') floor--;
                i++;
        }
        if (floor == 0) return (str[i] != '[');
        else return true;
}

function erase_elided_terminators(str) {
	var i, j;
	var parachute = 400;
	do {
		i = str.search(/\[[A-Za-z0-9_']+\]/);
		if (i < 0) break;
		j = i + str.substr(i).indexOf("]");
		while (i-- > 0 && ++j < str.length)
			if (str[i] != '[' || str[j] != ']') break;
		i++;
		j--;
		//alert("DEL "+str.substr(i,j-i+1));
		str = str_replace(str, i, j-i+1, "");
	} while (parachute--);
	return str;
}

function delete_superfluous_brackets(string) {
	/* RATIONALE:
	 * Here is done the dirty work of removing all those superfluous brackets
	 * left after our earlier intense session of regexp replacements.
	 * Admittedly not quite easy to read, but it does the job. :)
	 */
	str = string.split("");
	var i = 0;
	var parachute = 4000; // Against evil infinite loops.
	if (str.length < 1) {
		alert("ERROR: (str.length < 1) @delete_superfluous_brackets");
		return str;
	}
	// We reach the first word
	while (str[i] == "[") {
		if (i >= str.length) return; // No word found.
		i++;
	}
	/**
		### FIRST CLEANUP: BRACKETS SURROUNDING SINGLE WORD ###
	**/
	do {
		/** erase_surrounding_brackets **/
		var j = i;
		while (str[i].search(/[A-Za-z0-9_':~\-\^\"\?\\\/!°áéíóúàèìòùâêîôûāēīōūãẽĩõũǎěǐǒǔảẻỉỏủØ()]/) == 0 && i < str.length) i++;
		while (str[i] == ']') {
			if (j <= 0) {
				alert("ERROR: right bracket found without left counterpart.");
				break;
			}
			j--;
			while (str[j] == ' ') j--;
			if (str[j] == '[') {
				str[j] = ' ';
				str[i++] = ' ';
			} else break;
		}
		/** reach_next_word **/
		while (str[i] == '[' || str[i] == ']' || str[i] == ' ' && i < str.length)
			i++;
	} while (i < str.length && --parachute > 0);
	if (parachute <= 0)
		alert("@delete_superfluous_brackets #1: INFINITE LOOP\ni = " + i
		    + "\nstr from i:\n" + str.slice(i));
	/**
		### SECOND CLEANUP: BRACKETS SURROUNDING GROUPS OF WORDS ETC. ###
	**/
	i = 0;
	parachute = 4000;
	while (i < str.length && parachute-- > 0) {
		var so, eo, j;
		// FIRST STEP: reaching the next '['.
		while (i < str.length && str[i] != '[') i++;
		so = i;
		while (i < str.length && str[i] == '[') i++;
		eo = i;
		if (i >= str.length) break;
		if (i - so < 2) continue;
		j = i;
		i -= 2;
		do {
			var floor;
			// Now we'll reach the ']' closing the aformentioned '['.
			floor = 1;
			while (j < str.length && floor > 0) {
				if (str[j] == '[') floor++;
				else if (str[j] == ']') floor--;
				j++;
			}
			// We now erase superfluous brackets
			while (str[j] == ']' && i >= so) {
				str[i--] = ' ';
				str[j++] = ' ';
			}
		} while (i >= so && j < str.length && parachute-- > 0);
		i = eo;
	}
	if (parachute <= 0)
		alert("@delete_superfluous_brackets #2: INFINITE LOOP\ni = " + i
		    + "\nstr from i:\n" + str.slice(i));
	return str.join("");
}

function prettify_brackets(str) {
	var open_brackets = ["(", "[", "{", "<"];
	var close_brackets = [")", "]", "}", ">"];
	var brackets_number = 4;
//	var numset = ['0','1','2','3','4','5','6','7','8','9'];
	var numset = ['\u2070','\u00b9','\u00b2','\u00b3','\u2074',
	              '\u2075','\u2076','\u2077','\u2078','\u2079'];
	var i = 0;
	var floor = 0;
	while (i < str.length) {
		if (str[i] == '[') {
			var n = floor % brackets_number;
			var num = (floor && !n) ?
				str_print_uint(floor / brackets_number, numset) : "";
			str = str_replace(str, i, 1, open_brackets[n] + num);
			floor++;
		} else if (str[i] == ']') {
			floor--;
			var n = floor % brackets_number;
			var num = (floor && !n) ?
				str_print_uint(floor / brackets_number, numset) : "";
			str = str_replace(str, i, 1, num + close_brackets[n]);
		}
		i++;
	}
	return str;
}


/* ================== */
/* ===  Routines  === */
/* ================== */

function is_string(v) {
    return typeof v.valueOf() === 'string';
}

function str_print_uint(val, charset) {
	// 'charset' must be a character array.
	var radix = charset.length;
	var str = "";
	val -= val % 1;  // No float allowed
	while (val >= 1) {
		str = charset[val % radix] + str;
		val /= radix;
		val -= val % 1;
	}
	return str;
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

function dbg_bracket_count(str) {
	var i = 0;
	var x = 0;
	var y = 0;
	while (i < str.length) {
		if (str[i] == '[') x++;
		else if (str[i] == ']') y++;
		i++;
	}
	alert("Bracket count: open = " + x + ", close = " + y);
}

function toaq_tone_marks_to_diacritics(toaq) {
	if (!is_string(toaq)) return -1;
	toaq = toaq.replace(/\\\\/gm, "\\");
	for (var i = 0; i < toaq.length; i++) {
		i = toaq.search(/[aeiou]+[q]?[V\/\\\^\-~\"\?1-7]/);
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

function make_diacritic_vowel(vowel, tone) {
	var n = 0;
	while (plain_vowels[n] != vowel && n < 5) n++;
	if (n == 5) return "•";  // Unknown vowel
	switch (tone) {
		case "/" || "2" :   return acute_vowels[n];
		case "\\" || "6" :  return grave_vowels[n];
		case "^" || "5" :   return circum_vowels[n];
		case "-" || "1" :   return macron_vowels[n];
		case "~" || "7" :   return tilde_vowels[n];
		case "V" || "3" :   return breve_vowels[n];
		case "?" || "4" :   return hooked_vowels[n];
		default:    return vowel;  // Unknown tone
	}
}

module.exports.postprocessing = camxes_postprocessing;

