var c;		// = canvas.getContext("2d")

function Node (val, col) {		// new node factory
	var value = (val) ? val : 0;
	var color = (col) ? col : -1;	   // 0=> black;  1=> red;  -1 or any other value=> Node does not exist
	
	var getv = function getv() { return value; }		// get value
	var getc = function getc() { return color; }	  // get color
	var setv = function setv(val) { value = val; }
	var changeCol = function changeCol (col) {	 // set the color or toggle between red and black
		if (col) {
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

	at: function at (strPos, initIndex) {		// takes a string of 'l's and 'r's for successive left or right child elements respectively and returns its index number in nodes (tree) array.
		var index = initIndex || 0;
		for (var i = 0; i < strPos.length; ++i) {
			index *= 2;
			index += (strPos[i] === 'l' || strPos[i] === 'L') ? 1 : 2;
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
		if (!this.nodes[pos] || this.nodes[pos].getc() === -1) {
			return false;
		}
		else return true;
	},
	setNode: function setNode (pos, val, col = 0, checkParent = true) {
		if(checkParent && !this.nodeExists (Math.floor((pos - 1) / 2))) {
			throw new Error("Parent Node does not exist at given position: " + pos);
			return;
		}
		var currLevel = this.levelOf(pos);
		if (currLevel > height) {		// If the current level is accessed for the first time, initialize current level
			var begin = Math.pow(2, currLevel) - 1;
			var end = 2 * begin;
			while (begin <= end) {
				if (!nodes[begin])
					nodes[begin] = Node();
				++begin;
			}
		}
		nodes[pos].setv(val);
		nodes[pos].changeCol(col);
	},
	deleteNode: function deleteNode (pos) {		// Deletes node at pos()
		if (!nodeExists(pos)) {
			throw new Error("Node does not exist at given position: " + pos);
			return;
		}
		nodes[pos].reset();

		var currLevel = levelOf(pos);
		var begin = Math.pow(2, currLevel) - 1;
		var end = 2 * begin;

		while (begin <= end) {
			if (nodeExists(begin))
				return;
		}
		--height;
		if (height < 0) height = 0;
	},
	insertNode: function insertNode (val, col = 0) {
		var currNode = 0;

		if (!nodeExists(currNode))
			setNode(currNode, val, col);
		if (val < nodes[currNode].getv())
			currNode = currNode * 2 + 1;
		else
			currNode = currNode * 2 + 2;
	},
	searchNode: function searchNode (val) {
		var end = Math.pow(2, height) - 2;
		for (i = 0; i <= end; ++i) {
			if (nodes[i].getv() === val)
				return i;
		}
		return -1;
	},
	copyNode: function copyNode (from, to) {
		if (nodeExists(from))
			tree.setNode(to, nodes[from].getv(), nodes[from].getc(), false);
		else
			tree.setNode(to, 0, -1, false);
	},
	rotateRight: function rotateRight (index) {		// Right rotate at nodes[index]
		var backupNodes = [];
		var firstCopy = 2 * index + 2;
		var firstPaste = 2 * firstCopy + 2;

		backupNodes.push(nodes[firstPaste + i - 1]);

		copyNode(firstCopy, firstPaste);

		var i = 1;

		while (1) {
			firstCopy = firstCopy * 2 + 1;
			firstPaste = firstPaste * 2 + 1;

			var isEmpty = true;

			for (var j = 0; j < i; ++j) {
				if (nodeExists(firstCopy))
					isEmpty = false;

				if (nodeExists(firstPaste + j))
					backupNodes.push(nodes[firstPaste + j]);
				else backupNodes.push(Node());

				copyNode(firstCopy + j, firstPaste + j);
				deleteNode(firstCopy + j);
			}
			for (var j = 0; j < i; ++j) {
				if (backupNodes[0] && backupNodes[0].getc() !== -1)
					isEmpty = false;

				if (nodeExists(firstPaste + j + i))
					backupNodes.push(nodes[firstPaste + j + i]);
				else backupNodes.push(Node());

				var tempNode = backupNodes.shift();
				setNode(firstPaste + i + j, tempNode.getv(), tempNode.getc());
			}
			i *= 2;
			if (isEmpty)
				break;
		}

		firstCopy = at("lr", index);
		firstPaste = firstCopy + 1;
		i = 1;

		while (2) {
			var isEmpty = true;
			for (var j = 0; j < i; ++j) {
				if (nodeExists(firstCopy + j))
					isEmpty = false;
				copyNode(firstCopy + j, firstPaste + j);
				deleteNode(firstCopy + j);
			}

			if (isEmpty) break;
			firstCopy = 2 * firstCopy + 1;
			firstPaste = 2 * firstPaste + 1;
			i *= 2;
		}
		
		firstPaste = 2 * index + 1;
		firstCopy = 2 * firstPaste + 1;
		i = 1;
		
		while (3) {
			var isEmpty = true;

			for (j = 0; j < i; ++j) {
				if (nodeExists(firstCopy + j))
					isEmpty = false;

				copyNode(firstCopy + j, firstPaste + j);
			}

			if (isEmpty)
				break;

			i *= 2;
			firstCopy = 2 * firstCopy + 1;
			firstPaste = 2 * firstPaste + 1;
		}
	},
	getNodes: function getNodes() {
		var strNodes = "";
		var lastLevelNode = 0;

		for (var i = 0; i < this.nodes.length; ++i) {
			strNodes += (nodes[i] && nodes[i].getc() !== -1) ? nodes[i].getv().toString() : '/';
			if (i == lastLevelNode) {
				strNodes += '\n';
				lastLevelNode = 2 * lastLevelNode + 2;
			}
			else
				strNodes += ' ';
		}
	}
};

function printlog(id, data, init = false) {
	if (init) {
		document.getElementById("log").style.border = "1px solid #000000";
		document.getElementById("log").style.fontWeight = "bold";
		document.getElementById("log").style.fontFamily = "courier new";
		document.getElementById("log").style.fontSize = "18px";
		document.getElementById("log").style.whiteSpace = "pre";
		return;
	}
	document.getElementById("log").innerHTML += id + ':\n      <span style="color: #3fcf3f; display: inline-block">' + data + '</span>\n';
}

function reDraw (val, operation) {
	c.strokeStyle = "#000000";
	c.fillStyle = "#000000";
	
	if (operation === 1) {	  // Insert Operation
		tree.insertNode(val);
	}

	printlog(0, 0, true);

	printlog('Routine Log: ', tree.getNodes());
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

	console.log(tree.at('lr'));
}
