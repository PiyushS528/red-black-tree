var c;
function Node (val, col) {		// new node factory
	var value = val || 0;
	var color = col || -1;	   // 0=> black;  1=> red;  -1 or any other value=> Node does not exist
	
	var getv = function getv() { return value; }		// get value
	var getc = function getc() { return color; }	  // get color
	var setv = function setv(val) {
		value = val;
	}
	var changeCol = function changeCol (col) {	 // set the color or toggle between red and black
		if (col === 0 || col === 1) {
			color = col;
			return;
		}
		color = (color === 0) ? 1 : 0;
	}
	var reset = function reset() {
		color = -1;
		value = 0;
	}
	
	return {
		getv: getv,
		getc: getc,
		setv: setv,
		changeCol: changeCol,
		reset: reset
	};
}

var tree = {
	nodes: [],	// Stores all nodes in array binary tree form
	height: 0,	// Stores height of tree

	at: function at (pos) {
		var index = 0;
		for (var i = 0; i < pos.length; ++i) {
			index *= 2;
			index += (pos[i] === 'l' || pos[i] === 'L') ? 1 : 2;
		}
		return index;
	},
	levelOf: function levelOf (pos) {
		var level = 0, exponent = 2;
		while (pos > exponent - 2) {
			++level;
			exponent *= 2;
		}
		return level;
	},
	nodeExists: function nodeExists (pos) {
		if (!nodes[pos] || nodes[pos].getc() === -1) {
			return false;
		}
		else return true;
	},
	newNode: function newNode (val, pos, color) {
		if(!nodeExists (Math.floor((pos - 1) / 2))) {
			throw new Error("Parent Node does not exist at given position: " + pos);
			return;
		}
		var currLevel = levelOf(pos);
		if (currLevel > height) {		// If the current level is reached for the first time, initialize
			var begin = Math.pow(2, currLevel) - 1;
			var end = 2 * begin;
			while (begin <= end) {
				if (!nodes[begin])
					nodes[begin] = Node();
				++begin;
			}
		}
		nodes[pos].setv(val);
		nodes[pos].changeCol(0);
	},
	deleteNode: function deleteNode (pos) {
		if (!nodeExists(pos)) {
			throw new Error("Node does not exist at given position: " + pos);
			return;
		}
		nodes[pos].reset();

		var currLevel = levelOf(pos);
		var begin = Math.pow(2, currLevel) - 1;
		var end = 2 * begin;

		while (begin <= end) {
			if (nodes[begin].getc() !== -1)
				return;
		}
		--height;
		if (height < 0) height = 0;
	},
	searchNode: function searchNode (val) {
		ine end = Math.pow(2, height) - 2;
		for (i = 0; i <= end; ++i) {
			if (nodes[i].getv() === val)
				return i;
		}
		return -1;
	}
};

function reDraw (val, operation) {
	c.strokeStyle = "#000000";
	c.fillStyle = "#000000";
	
	if (operation === 1) {	  // Insert Operation
		
		c.fillRect(20, 30, 100, 150);
	}
}

function updateTree() {
	var operation;
	if (document.getElementById("insert").checked)
		operation = 1;
	else if (document.getElementById("delete").checked)
		operation = 2;
	else if (document.getElementById("search").checked)
		operation = 3;
	
	reDraw(parseInt(document.getElementById("nodeValue").value), operation);
}

window.onload = function initCanvas() {
	var canv = document.getElementById("canvasArea");
	c = canv.getContext("2d");
}
