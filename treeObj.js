
function Node (val = 0, col = -1) {		// Node class
	this.value = val;
	this.color = col;	   // 0=> black;  1=> red;  -1 or any other value=> Node does not exist

	this.changeCol = function changeCol (col) {	 // set the color or toggle between red and black
		if (col) {
			this.color = col;
			return;
		}
		this.color = (this.color === 0) ? 1 : 0;
	}
	this.reset = function reset() {
		this.color = -1;
		this.value = 0;
	}
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
	levelOf: function levelOf (pos, return2power = false) {
		var level = 0, exponent = 2;
		while (pos > exponent - 2) {
			++level;
			exponent *= 2;
		}
		if (!return2power) return level;
		else return exponent;
	},
	nodeExists: function nodeExists (pos) {
		if (!this.nodes[pos] || this.nodes[pos].color === -1) {
			return false;
		}
		else return true;
	},
	setNode: function setNode (pos, node, checkParent = true) {
		if(pos !== 0 && checkParent && !this.nodeExists (Math.floor((pos - 1) / 2))) {	// Check if parent exists for node at given position
			console.log(new Error("Parent Node does not exist at given position: " + pos));
			return;
		}
		var currLevel = this.levelOf(pos);
		if (currLevel > this.height) {		// If the current level is accessed for the first time, initialize current level
			var begin = Math.pow(2, currLevel) - 1;
			var end = 2 * begin;
			while (begin <= end) {
				if (!this.nodeExists(begin))
					this.nodes[begin] = null;
				++begin;
			}
			if (node)
				this.height = currLevel;
		}
		this.nodes[pos] = node;
	},
	deleteNode: function deleteNode (pos, updateHeight = true) {		// Deletes node at pos()
		this.nodes[pos] = null;

		if (updateHeight) {
			var currLevel = this.levelOf(pos);
			var begin = Math.pow(2, currLevel) - 1;
			var end = 2 * begin;

			while (begin <= end) {
				if (this.nodeExists(begin)) { console.log('not empty level', pos);
					return;
				}
				++begin;
			}
			this.height = currLevel - 1;
			if (this.height < 0) this.height = 0;
		}
	},
	insertNode: function insertNode (val, col = 0) {
		var currNode = 0;

		if (!this.nodeExists(currNode))
			this.setNode(currNode, new Node(val, col));
		else {
			while (this.nodeExists(currNode)) {
				if (val <= this.nodes[currNode].value)
					currNode = currNode * 2 + 1;
				else
					currNode = currNode * 2 + 2;
			}
		}
		this.setNode(currNode, new Node(val, col));
	},
	searchNode: function searchNode (val) {
		var end = Math.pow(2, height) - 2;
		for (i = 0; i <= end; ++i) {
			if (this.nodes[i].value === val)
				return i;
		}
		return -1;
	},
	copyNode: function copyNode (from, to) {
		if (this.nodeExists(from))
			this.setNode(to, this.nodes[from], false);
		else
			this.setNode(to, null, false);
	},
	getNodes: function getNodes() {
		var strNodes = "";
		var lastLevelNode = 0;

		for (var i = 0; i < this.nodes.length; ++i) {
			strNodes += (this.nodeExists(i)) ? this.nodes[i].value.toString() : 'X';
			if (i == lastLevelNode) {
				strNodes += '\n';
				lastLevelNode = 2 * lastLevelNode + 2;
			}
			else
				strNodes += ' ';
		}
	},
	randomize: function randomize (pos, num = 100) {
		var currLevel = this.levelOf(pos);
		if (currLevel > this.height) this.height = currLevel;

		var lastNode = Math.pow(2, currLevel + 1) - 2;

		for (var i = 0; i <= pos; ++i) {
			if (!this.nodeExists(i))
				this.nodes[i] = new Node(0, 0);
			this.nodes[i].value = Math.random() * (num + 1) | 0;
		}
		for(; i <= lastNode; ++i)
			this.nodes[i] = null;

		return this;
	}
};

tree.rotate = function rotate (index, direc = 0) {		// Performs rotation of the tree; direc = 0 for left, 1 for right rotation
	if (direc === 0 && !this.nodeExists(index*2 + 2)) return;
	if (direc === 1 && !this.nodeExists(index*2 + 1)) return;

	var changes = [];	// Records the before and after indices of nodes that are moved during rotation

	var backupNodes = [];
	var firstCopy = 2 * index + ((direc === 0) ? 1 : 2);
	var firstPaste = 2 * firstCopy + ((direc === 0) ? 1 : 2);

	backupNodes.push(this.nodes[firstPaste]);

	this.copyNode(firstCopy, firstPaste);
	this.copyNode(index, firstCopy);
	changes.push({from: firstCopy, to: firstPaste});
	changes.push({from: index, to: firstCopy});

	var i = 1;

	if (direc === 0) while (1) {
		firstCopy = firstCopy * 2 + 1;
		firstPaste = firstPaste * 2 + 1;

		var emptyRow = true;

		for (var j = 0; j < i; ++j) {
			if (backupNodes[0] && backupNodes[0].color !== -1)
				emptyRow = false;

			if (this.nodeExists(firstPaste + j))
				backupNodes.push(this.nodes[firstPaste + j]);
			else backupNodes.push(null);

			var tempNode = backupNodes.shift();
			this.setNode(firstPaste + j, tempNode, false);
			changes.push({from: firstCopy + j, to: firstPaste + j});
		}
		for (var j = 0; j < i; ++j) {
			if (this.nodeExists(firstPaste + j + i))
				backupNodes.push(this.nodes[firstPaste + j + i]);
			else backupNodes.push(null);

			this.copyNode(firstCopy + j + i, firstPaste + j + i);
			changes.push({from: firstCopy + j + i, to: firstPaste + j + i});

			if (this.nodeExists(firstCopy + j + i)) {
				emptyRow = false;
				this.deleteNode(firstCopy + j + i, false);
			}
		}
		i *= 2;
		if (emptyRow)
			break;
	}
	else while (1) {
		firstCopy = firstCopy * 2 + 1;
		firstPaste = firstPaste * 2 + 1;

		var emptyRow = true;

		for (var j = 0; j < i; ++j) {
			if (this.nodeExists(firstPaste + j))
				backupNodes.push(this.nodes[firstPaste + j]);
			else backupNodes.push(null);

			this.copyNode(firstCopy + j, firstPaste + j);
			changes.push({from: firstCopy + j, to: firstPaste + j});

			if (this.nodeExists(firstCopy + j)) {
				emptyRow = false;
				this.deleteNode(firstCopy + j, false);
			}
		}
		for (var j = 0; j < i; ++j) {
			if (backupNodes[0] && backupNodes[0].color !== -1)
				emptyRow = false;

			if (this.nodeExists(firstPaste + j + i))
				backupNodes.push(this.nodes[firstPaste + j + i]);
			else backupNodes.push(null);

			var tempNode = backupNodes.shift();
			this.setNode(firstPaste + i + j, tempNode, false);
			changes.push({from: firstCopy + j + i, to: firstPaste + j + i});
		}
		i *= 2;
		if (emptyRow)
			break;
	}

	firstCopy = (direc === 0) ? this.at('rl', index) : this.at('lr', index);
	firstPaste = firstCopy + ((direc === 0) ? -1 : +1);
	i = 1;

	while (2) {
		var emptyRow = true;
		for (var j = 0; j < i; ++j) {
			this.copyNode(firstCopy + j, firstPaste + j);
			changes.push({from: firstCopy + j, to: firstPaste + j});

			if (this.nodeExists(firstCopy + j)) {
				emptyRow = false;
				this.deleteNode(firstCopy + j, false);
			}
		}

		if (emptyRow) break;
		firstCopy = 2 * firstCopy + 1;
		firstPaste = 2 * firstPaste + 1;
		i *= 2;
	}
	
	firstPaste = 2 * index + ((direc === 0) ? 2 : 1);
	firstCopy = 2 * firstPaste + ((direc === 0) ? 2 : 1);
	i = 1;

	this.copyNode(firstPaste, index);
	changes.push({from: firstPaste, to: index});

	while (3) {
		var emptyRow = true;

		for (j = 0; j < i; ++j) {
			this.copyNode(firstCopy + j, firstPaste + j);
			changes.push({from: firstCopy + j, to: firstPaste + j});

			if (this.nodeExists(firstCopy + j)) {
				emptyRow = false;
				this.deleteNode(firstCopy + j, false);	// We don't want deleteNode to recalculate the height since there could be more child nodes left that we need to move up
			}
		}

		if (emptyRow) {
			this.deleteNode(firstPaste + j - 1);
			break;
		}

		i *= 2;
		firstCopy = 2 * firstCopy + 1;
		firstPaste = 2 * firstPaste + 1;
	}
	return changes;
}
