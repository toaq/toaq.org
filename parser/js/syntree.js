// By Miles Shang <mail@mshang.ca>
// MIT license

function normalize(toa) {
	return toa.normalize('NFD').toLowerCase().trim()
			  .replace(/i/g, 'ı')
			  .replace(/[\u0300-\u030f]/g, '')
			  .replace(/[^0-9A-Za-zı'_\-]+/g, ' ')
			  .replace(/ +/g, ' ');
}

var glosses = {};
var parts = new RegExp();
fetch("https://raw.githubusercontent.com/toaq/dictionary/master/dictionary.json").then(async (response) => {
	for (const entry of await response.json()) {
		glosses[normalize(entry.toaq)] = entry.gloss;
	}
	parts = new RegExp(Object.getOwnPropertyNames(glosses).sort((a,b) => b.length-a.length).join("|"), "g");
});

function get_gloss(toa) {
	const n = normalize(toa);
	const g = glosses[n];
	if (g === "ASS") return ".";
	if (g) return g;
	let l = 0, gs = [];
	for (const p of n.matchAll(parts)) {
		console.log(p)
		l += p[0].length;
		gs.push(glosses[p[0]]);
	}
	console.log(l, n.length);
	if (l === n.length) return gs.join("-");
	return undefined;
}

var show_gloss = true;
var gloss_font = "9pt 'Georgia', serif";

var debug = true;
var margin = 15; // Number of pixels from tree to edge on each side.
var padding_above_text = 6; // Lines will end this many pixels above text.
var padding_below_text = 6;

function Node() {
	this.value = null;
	this.gloss = null;
	this.step = null; // Horizontal distance between children.
	this.draw_triangle = null;
	this.label = null; // Head of movement.
	this.tail = null; // Tail of movement.
	this.max_y = null; // Distance of the descendent of this node that is farthest from root.
	this.children = new Array();
	this.has_children;
	this.first = null;
	this.last = null;
	this.parent = null;
	this.next = null;
	this.previous = null;
	this.x = null; // Where the node will eventually be drawn.
	this.y = null;
	this.head_chain = null;
	this.tail_chain = null;
	this.starred = null;
}

Node.prototype.set_gloss = function() {
	if (this.gloss === null) {
		this.gloss = get_gloss(this.value) ?? "?";
	}
}

Node.prototype.set_siblings = function(parent) {
	for (var i = 0; i < this.children.length; i++)
		this.children[i].set_siblings(this);
	
	this.has_children = (this.children.length > 0);
	this.parent = parent;
	
	if (this.has_children) {
		this.first = this.children[0];
		this.last = this.children[this.children.length - 1];
	}
	
	for (var i = 0; i < this.children.length - 1; i++)
		this.children[i].next = this.children[i+1];
	
	for (var i = 1; i < this.children.length; i++)
		this.children[i].previous = this.children[i-1];
}

Node.prototype.check_triangle = function() {
	this.draw_triangle = 0;
	if ((!this.has_children) && this.parent && this.parent.starred)
		this.draw_triangle = 1;

	for (var child = this.first; child != null; child = child.next)
		child.check_triangle();
}

Node.prototype.set_width = function(ctx, vert_space, hor_space, term_font, nonterm_font) {
	ctx.font = term_font;
	if (this.has_children)
		ctx.font = nonterm_font;

	var val_width = ctx.measureText(this.value).width;
	if (show_gloss && !this.has_children) {
		this.set_gloss();
		ctx.font = gloss_font;
		val_width = Math.max(val_width, ctx.measureText(this.gloss).width);
	}

	for (var child = this.first; child != null; child = child.next)
		child.set_width(ctx, vert_space, hor_space, term_font, nonterm_font);
	
	if (!this.has_children) {
		this.left_width = val_width / 2;
		this.right_width = val_width / 2;
		return;
	}
	
	// Figure out how wide apart the children should be placed.
	// The spacing between them should be equal.
	this.step = 0;
	for (var child = this.first; (child != null) && (child.next != null); child = child.next) {
		var space = child.right_width + hor_space + child.next.left_width;
		this.step = Math.max(this.step, space);
	}
	
	this.left_width = 0.0;
	this.right_width = 0.0;
	
	if (this.has_children) {
		var sub = ((this.children.length - 1) / 2) * this.step;
		this.left_width = sub + this.first.left_width;
		this.right_width = sub + this.last.right_width;
	}
	
	this.left_width = Math.max(this.left_width, val_width / 2);
	this.right_width = Math.max(this.right_width, val_width / 2);

}

Node.prototype.find_height = function() {
	this.max_y = this.y;
	for (var child = this.first; child != null; child = child.next)
		this.max_y = Math.max(this.max_y, child.find_height());
	return this.max_y;
}

Node.prototype.assign_location = function(x, y, font_size, term_lines, vert_space) {
	// floor + 0.5 for antialiasing
	this.x = (Math.floor(x * 2) + 0.5) / 2;
	this.y = (Math.floor(y * 2) + 0.5) / 2;
	
	if (this.has_children) {
		var left_start = x - (this.step)*((this.children.length-1)/2);
		for (var i = 0; i < this.children.length; i++)
			this.children[i].assign_location(left_start + i*(this.step), y + vert_space, font_size, term_lines, vert_space);
	} else {
		if ((this.parent) && (!term_lines) && (this.parent.children.length == 1) && (!this.draw_triangle))
			this.y = this.parent.y + padding_above_text + padding_below_text + font_size;
	}
}

Node.prototype.draw = function(ctx, font_size, term_font, nonterm_font, color, term_lines) {
	ctx.font = term_font;
	if (this.has_children)
		ctx.font = nonterm_font;
		
	ctx.fillStyle = "black";
	if (color) {
		ctx.fillStyle = "#ee33dd";
		if (this.has_children)
			ctx.fillStyle = "#3385ff";
	}
	
	ctx.fillText(this.value, this.x, this.y);
	if (!this.has_children && show_gloss) {
		this.set_gloss();
		ctx.fillStyle = "#666666";
		ctx.font = gloss_font;
		ctx.fillText(this.gloss, this.x, this.y + 16);
	}
	for (var child = this.first; child != null; child = child.next)
		child.draw(ctx, font_size, term_font, nonterm_font, color, term_lines);
	
	if (!this.parent) return;
	
	if (this.draw_triangle) {
		ctx.moveTo(this.parent.x, this.parent.y + padding_below_text);
		ctx.lineTo(this.x - this.left_width, this.y - font_size - padding_above_text);
		ctx.lineTo(this.x + this.right_width, this.y - font_size - padding_above_text);
		ctx.lineTo(this.parent.x, this.parent.y + padding_below_text);
		ctx.stroke();
		return;
	}
	
	if ((!this.has_children) && (!term_lines) && (this.parent.children.length == 1)) return;
	
	ctx.moveTo(this.parent.x, this.parent.y + padding_below_text);
	ctx.lineTo(this.x, this.y - font_size - padding_above_text);
	ctx.stroke();
}

Node.prototype.find_head = function(label) {
	for (var child = this.first; child != null; child = child.next) {
		var res = child.find_head(label);
		if (res != null) return res;
	}
	
	if (this.label == label) return this;
	return null;
}

Node.prototype.find_movement = function(mlarr, root) {
	for (var child = this.first; child != null; child = child.next)
		child.find_movement(mlarr, root);
	
	if (this.tail != null) {
		var m = new MovementLine;
		m.tail = this;
		m.head = root.find_head(this.tail);
		mlarr.push(m);
	}
}

Node.prototype.reset_chains = function() {
	this.head_chain = null;
	this.tail_chain = null;
	
	for (var child = this.first; child != null; child = child.next)
		child.reset_chains();
}

Node.prototype.find_intervening_height = function(leftwards) {
	var max_y = this.y;
	
	var n = this;
	while (true) {
		if (leftwards) {n = n.previous;} else {n = n.next;}
		if (!n) break;
		if ((n.head_chain) || (n.tail_chain)) return max_y;
		max_y = Math.max(max_y, n.max_y);
	}
	
	max_y = Math.max(max_y, 
		this.parent.find_intervening_height(leftwards));
	return max_y;
}

function MovementLine() {
	this.head = null;
	this.tail = null;
	this.lca = null;
	this.dest_x = null;
	this.dest_y = null;
	this.bottom_y = null;
	this.max_y = null;
	this.should_draw = null;
	this.leftwards = null;
}

MovementLine.prototype.set_up = function() {
	this.should_draw = 0;
	if ((this.tail == null) || (this.head == null)) return;
	
	// Check to see if head is parent of tail,
	if (!this.check_head()) return;
	
	// Find the last common ancestor.
	this.find_lca();
	if (this.lca == null) return;
	
	// Find out the greatest intervening height.
	this.find_intervening_height();
	
	this.dest_x = this.head.x;
	this.dest_y = this.head.max_y;
	this.bottom_y = this.max_y + vert_space;
	this.should_draw = 1;
	return;
}

MovementLine.prototype.check_head = function() {
	var n = this.tail;
	n.tail_chain = 1;
	while (n.parent != null) {
		n = n.parent;
		if (n == this.head) return 0;
		n.tail_chain = 1;
	}
	return 1;
}

MovementLine.prototype.find_lca = function() {
	var n = this.head;
	n.head_chain = 1;
	this.lca = null;
	while (n.parent != null) {
		n = n.parent;
		n.head_chain = 1;
		if (n.tail_chain) {
			this.lca = n;
			break;
		}
	}
}

MovementLine.prototype.find_intervening_height = function() {
	for (var child = this.lca.first; child != null; child = child.next) {
		if ((child.head_chain) || (child.tail_chain)) {
			this.leftwards = false;
			if (child.head_chain) this.leftwards = true;
			break;
		}
	}
	
	this.max_y = Math.max(this.tail.find_intervening_height( this.leftwards), 
	                      this.head.find_intervening_height(!this.leftwards),
						  this.head.max_y);
}

MovementLine.prototype.draw = function(ctx) {
	var tail_x = this.tail.x + 3;
	this.dest_x -= 3;
	if (this.leftwards) {
		tail_x -= 6;
		this.dest_x += 6;
	}
	
	ctx.moveTo(tail_x, this.tail.y + padding_below_text);
	ctx.quadraticCurveTo(tail_x, this.bottom_y, (tail_x + this.dest_x) / 2, this.bottom_y);
	ctx.quadraticCurveTo(this.dest_x, this.bottom_y, this.dest_x, this.dest_y + padding_below_text);
	ctx.stroke();
	// Arrowhead
	ctx.beginPath();
	ctx.lineTo(this.dest_x + 3, this.dest_y + padding_below_text + 10);
	ctx.lineTo(this.dest_x - 3, this.dest_y + padding_below_text + 10);
	ctx.lineTo(this.dest_x, this.dest_y + padding_below_text);
	ctx.closePath();
	ctx.fillStyle = "#000000";
	ctx.fill();
}

function go(canvas, str, font_size, term_font, nonterm_font, vert_space, hor_space, color, term_lines) {	
	// Clean up the string
	str = str.replace(/^\s+/, "");
	var open = 0;
	for (var i = 0; i < str.length; i++) {
		if (str[i] == "[") open++;
		if (str[i] == "]") open--;
	}
	while (open < 0) {
		str = "[" + str;
		open++;
	}
	while (open > 0) {
		str = str + "]";
		open--;
	}
	
	var root = parse(str);
	root.set_siblings(null);
	root.check_triangle();
	
	var ctx = canvas.getContext('2d');

	// Find out dimensions of the tree.
	root.set_width(ctx, vert_space, hor_space, term_font, nonterm_font);
	root.assign_location(0, 0, font_size, term_lines, vert_space);
	root.find_height();
	
	var movement_lines = new Array();
	root.find_movement(movement_lines, root);
	for (var i = 0; i < movement_lines.length; i++) {
		root.reset_chains();
		movement_lines[i].set_up();
	}
	
	// Set up the canvas.
	var width = root.left_width + root.right_width + 2 * margin;
	var height = root.max_y + 2 * font_size + 2 * margin;
	// Problem: movement lines may protrude from bottom.
	for (var i = 0; i < movement_lines.length; i++)
		if (movement_lines[i].max_y == root.max_y) {
			height += vert_space; break;
		}
	
	canvas.width = width * 2;
	canvas.height = height * 2;
	ctx.scale(2, 2);
	ctx.lineCap = "round";
	canvas.style.width = width;
	canvas.style.height = height;
	ctx.strokeStyle = "rgb(32, 32, 32)";
	ctx.fillStyle = "rgb(255, 255, 255)";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.textAlign = "center";
	var x_shift = Math.floor(root.left_width + margin);
	var y_shift = Math.floor(font_size + margin);
	ctx.translate(x_shift, y_shift);
	
	root.draw(ctx, font_size, term_font, nonterm_font, color, term_lines);
	for (var i = 0; i < movement_lines.length; i++)
		if (movement_lines[i].should_draw) movement_lines[i].draw(ctx);
}

function subscriptify(in_str) {
	var out_str = "";
	for (var i = 0; i < in_str.length; ++i) {
		switch (in_str[i]) {
		case "0": out_str = out_str + "₀"; break;
		case "1": out_str = out_str + "₁"; break;
		case "2": out_str = out_str + "₂"; break;
		case "3": out_str = out_str + "₃"; break;
		case "4": out_str = out_str + "₄"; break;
		case "5": out_str = out_str + "₅"; break;
		case "6": out_str = out_str + "₆"; break;
		case "7": out_str = out_str + "₇"; break;
		case "8": out_str = out_str + "₈"; break;
		case "9": out_str = out_str + "₉"; break;
		}
	}
	return out_str;
}

function parse(str) {
	var n = new Node();
	
	if (str[0] != "[") { // Text node
		// Get any movement information.
		// Make sure to collapse any spaces around <X> to one space, even if there is no space.	
		str = str.replace(/\s*<(\w+)>\s*/, 
			function(match, tail) {
				n.tail = tail;
				return " ";
			});
		str = str.replace(/^\s+/, "");
		str = str.replace(/\s+$/, "");
		n.value = str;
		return n;
	}

	var i = 1;
	while ((str[i] != " ") && (str[i] != "[") && (str[i] != "]")) i++;
	n.value = str.substr(1, i-1)
	n.value = n.value.replace(/\^/, 
		function () {
			n.starred = true;
			return "";
		});
	n.value = n.value.replace(/_(\w+)$/,
		function(match, label) {
			n.label = label;
			if (n.label.search(/^\d+$/) != -1)
				return subscriptify(n.label);
			return "";
		});
	
	while (str[i] == " ") i++;
	if (str[i] != "]") {
		var level = 1;
		var start = i;
		for (; i < str.length; i++) {
			var temp = level;
			if (str[i] == "[") level++;
			if (str[i] == "]") level--;
			if (((temp == 1) && (level == 2)) || ((temp == 1) && (level == 0))) {
				if (str.substring(start, i).search(/[^\s]/) > -1)
					n.children.push(parse(str.substring(start, i)));
				start = i;
			}
			if ((temp == 2) && (level == 1)) {
				n.children.push(parse(str.substring(start, i+1)));
				start = i+1;
			}
		}
	}
	return n;
}
