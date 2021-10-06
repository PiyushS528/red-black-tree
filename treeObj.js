
/*
	- Comments added (in progress)
*/
function Node (val, col, x, y, cvalue) {		// Node class
	this.value = (val === undefined) ? 0 : val;
	this.color = (col === undefined) ? 0 : col;	   // 0=> black;  1=> red;  -1=> double black
	this.x = (x === undefined) ? -100 : x;
	this.y = (y === undefined) ? -100 : y;
	this.cvalue = (cvalue === undefined) ? "#000000" : cvalue;
}

var tree = {
	nodes: [],	// Stores all nodes in array binary tree form
	height: 0,	// Stores height of tree

	/*
	record: function (){},
	setRecorder: function setRecorder (rec) {
		if (rec) this.record = function (a, b, c) {rec.call(window, a, b, c);}
		else this.record = function (){};
	},
	*/

	at: function at (strPos, initIndex) {		// takes a string of 'l's and 'r's or 'p's for successive left or right child or parent elements respectively and returns its index number in nodes (tree) array.
		var index = initIndex || 0;
		for (var i = 0; i < strPos.length; ++i) {
			if (strPos[i] === 'p' || strPos[i] === 'P')
				index = ((index-1)/2) |0;
			else {
				index *= 2;
				index += (strPos[i] === 'l' || strPos[i] === 'L') ? 1 : 2;
			}
		}
		return index;
	},
	levelOf: function levelOf (pos, return2power) {
		if (return2power === undefined) return2power = false;

		var level = 0, exponent = 2;
		while (pos > exponent - 2) {
			++level;
			exponent *= 2;
		}
		if (!return2power) return level;
		else return exponent;
	},
	nodeExists: function nodeExists (pos) {	// returns false if node does not exist at given index
		if (!this.nodes[pos]) {
			return false;
		}
		else return true;
	},
	/*
	calcHeight: function calcHeight() {
		var ind = 0, ht = 0, stack = [];
		while (stack.length > 0 || ind === 0) {
			if (nodeExists)
		}
	},
	*/
	copyNode: function copyNode (from, to) {
		if (this.nodeExists(from))
			this.setNode(to, this.nodes[from], false);
		else
			this.setNode(to, null, false);
	},
	setNode: function setNode (pos, node, checkParent) {	// adds a Node object at given position
		// if checkParent is true, node will not be added if there's no parent for given position in nodes array

		if (checkParent === undefined) checkParent = true;

		if (pos !== 0 && checkParent && !this.nodeExists (Math.floor((pos - 1) / 2))) {	// Check if parent exists for node at given position
			console.log(new Error("Parent Node does not exist at given position: " + pos));
			return;
		}
		var currLevel = this.levelOf(pos);
		if (currLevel > this.height) {		// If the current level is accessed for the first time, initialize current level with null values
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
	eraseNode: function eraseNode (pos, updateHeight) {		// Deletes node at pos
		// if updateHeight is true, the height variable will be updated (decreased) if current level is empty after deletion, and nodes array trimmed

		if (updateHeight === undefined) updateHeight = true;
		this.nodes[pos] = null;

		if (updateHeight) {
			var currLevel = this.levelOf(pos);
			var begin = Math.pow(2, currLevel) - 1;
			var end = 2 * begin;

			while (begin <= end) {
				if (this.nodeExists(begin)) return;	// if current level is not empty, then height remains the same
				++begin;
			}
			this.height = currLevel - 1;
			if (this.height < 0) this.height = 0;
			this.nodes = this.nodes.slice(0, end/2);
		}
	},
	searchNode: function searchNode (record, val) {	// performs binary search for val
		// record is a function (recordChanges() from rb-tree-script.js) that will record changes/transitions for animation purposes

		if (!record) record = function(){}
		var curr = 0, ind = -1, prev = -1, changes = [];

		while (true) {
			if (this.nodeExists(curr)) {
				if (prev !== -1) changes.push({from: prev, node: curr});	// The blue search ring moves from position of 'prev' node to 'curr' node
				prev = curr;

				if (val === this.nodes[curr].value) {
					ind = curr;
					break;
				}
				else if (val < this.nodes[curr].value) curr = curr * 2 + 1;
				else if (val > this.nodes[curr].value) curr = curr * 2 + 2;
			}
			else break;
		}
		var i = -1;
		while (changes[++i]) record(this.nodes, 4, [changes[i]]);	// Search ring moves through each successive node
		if (ind !== -1) record(this.nodes, 6, [{node: ind}]);	// and blinks if the data is found
		return ind;
	},
	getSuccessor: function getSuccessor (record, index) {
		// finds the inorder successor (or predecessor if there's no right child) and records movements of red search ring like searchNode function
		if (!record) record = function(){}

		var prev = index;
		var changes = [];

		if (this.nodeExists(index * 2 + 2)) {
			index = index * 2 + 2;
			changes.push({from: prev, node: index});
			while (this.nodeExists(index * 2 + 1)) {
				prev = index;
				index = index * 2 + 1;
				changes.push({from: prev, node: index});
			}
		}
		else if (this.nodeExists(index * 2 + 1)) {
			index = index * 2 + 1;
			changes.push({from: prev, node: index});
			while (this.nodeExists(index * 2 + 2)) {
				prev = index;
				index = index * 2 + 2;
				changes.push({from: prev, node: index});
			}
		}
		var i = -1;
		while (changes[++i]) record(this.nodes, 5, [changes[i]]);
		return index;
	},
	getNodes: function getNodes() {	// not in use anymore
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
	randomize: function randomize(record, numNodes, maxDiff, minDiff) {
		if (numNodes === undefined) numNodes = 16;
		if (maxDiff === undefined) maxDiff = 6;
		if (minDiff === undefined) minDiff = 3;
		if (!record) record = function(){}

		var changes = [];
		var nodeValues = [];

		this.erase(record);

		var currNum = 0;

		for (var i = 0; i <= numNodes; ++i) {
			currNum += minDiff + ((Math.random() * (maxDiff - minDiff + 1)) | 0);
			nodeValues.push(currNum);
		}
		for (i = 0; i <= numNodes; ++i) {
			var iRand = (Math.random() * (numNodes - i)) | 0;
			this.insertNode(null, nodeValues[iRand]);
			nodeValues.splice(iRand, 1);
		}
		for (i = 0; i < this.nodes.length; ++i) {
			if (this.nodeExists(i)) {
				changes.push({node: i});
			}
		}
		record (this.nodes, 1, changes);
	},
	erase: function erase(record) {
		if (!record) record = function(){}

		var changes = [];

		for (var i = 0; i < this.nodes.length; ++i) {
			if (this.nodeExists(i))
				changes.push({node: i});
		}

		this.nodes = [];
		this.height = 0;

		record(this.nodes, 2, changes);
	}
};

tree.deleteNode = function deleteNode (record, val) {
	if (!record) record = function(){}

	var index = this.searchNode(record, val), changes = [];

	if (index === -1) return -1;

	var nextn;

	nextn = this.getSuccessor(record, index);

	record (this.nodes, 7, [{node: nextn}]);

	var newColor = null, oldColor = this.nodes[nextn].color;

	if (oldColor !== this.nodes[index].color) newColor = this.nodes[index].color;

	this.nodes[index] = null;
	record (this.nodes, 2, [{node: index}]);
	if (index === 0 && nextn === index) {
		this.eraseNode(index);
		return;
	}

	this.copyNode(nextn, index);
	this.eraseNode(nextn);

	if (newColor !== null) {
		this.nodes[index].color = newColor;
		record(this.nodes, 8, [{node: index, from: nextn, color: newColor}]);
	}
	else if (nextn !== index) record(this.nodes, 0, [{from: nextn, node: index}]);

	if (this.nodeExists(nextn * 2 + 1)) {
		this.copyNode (nextn * 2 + 1, nextn);
		this.eraseNode (nextn * 2 + 1);
		record(this.nodes, 0, [{from: nextn * 2 + 1, node: nextn}]);
	}
	else if (this.nodeExists(nextn * 2 + 2)) {
		this.copyNode (nextn * 2 + 2, nextn);
		this.eraseNode (nextn * 2 + 2);
		record(this.nodes, 0, [{from: nextn * 2 + 2, node: nextn}]);
	}

	if (oldColor === 1) return;

	if (this.nodeExists(nextn)) {
		if (this.nodes[nextn].color === 1) {
			this.nodes[nextn].color = 0;
			record (this.nodes, 3, [{node: nextn, color: 0}]);
			return;
		}
	}
	else this.nodes[nextn] = new Node(null, -1);	// Double black null node
	record(this.nodes, 9, [{node: nextn}]);

	var sibling = nextn + ((nextn % 2 === 1) ? +1 : -1);
	var parent = ((nextn - 1) / 2) | 0;
	var lnephew = sibling * 2 + 1;
	var rnephew = lnephew + 1;

	while (true) {
		if (this.nodes[sibling].color === 0) {
			if (sibling > nextn) {
				if (this.nodeExists(rnephew) && this.nodes[rnephew].color === 1) {
					this.rotate(record, parent, 0);

					this.nodes[sibling].color = 0;
					changes.push ({node: sibling, color: 0});

					if (this.nodes[nextn].color === 1) {		// In case parent was red, the new parent (after rotation) should be recolored to red, and nextn to black
						this.nodes[nextn].color = 0;
						this.nodes[parent].color = 1;
						changes.push ({node: nextn, color: 0});
						changes.push ({node: parent, color: 1});
					}
					record(this.nodes, 3, changes);
					changes = [];

					if (this.nodes[nextn * 2 + 1].value === null) {
						this.eraseNode (nextn * 2 + 1);
						record(this.nodes, 2, [{node: nextn * 2 + 1}]);
					}
					else {
						this.nodes[nextn * 2 + 1].color = 0;
						record(this.nodes, 9, [{node: nextn * 2 + 1}]);
					}

					return;
				}
				else if (this.nodeExists(lnephew) && this.nodes[lnephew].color === 1) {
					this.rotate(record, sibling, 1);
					this.rotate(record, parent, 0);

					if (this.nodes[nextn].color === 1) {		// If parent was red, it is now replaced by the old red nephew (no change of color), but the new nextn position should be recolored to black
						this.nodes[nextn].color = 0;
						record (this.nodes, 3, [{node: nextn, color: 0}]);
					}
					else {		// Otherwise, parent was black, so recolor it to black		
						this.nodes[parent].color = 0;
						record (this.nodes, 3, [{node: parent, color: 0}]);
					}

					if (this.nodes[nextn * 2 + 1].value === null) {
						this.eraseNode (nextn * 2 + 1);
						record(this.nodes, 2, [{node: nextn * 2 + 1}]);
					}
					else {
						this.nodes[nextn * 2 + 1].color = 0;
						record(this.nodes, 9, [{node: nextn * 2 + 1}]);
					}

					return;
				}
			}
			else {
				if (this.nodeExists(lnephew) && this.nodes[lnephew].color === 1) {
					this.rotate(record, parent, 1);

					this.nodes[sibling].color = 0;
					changes.push ({node: sibling, color: 0});

					if (this.nodes[nextn].color === 1) {		// In case parent was red, the new parent (after rotation) should be recolored to red, and nextn to black
						this.nodes[nextn].color = 0;
						this.nodes[parent].color = 1;
						changes.push ({node: nextn, color: 0});
						changes.push ({node: parent, color: 1});
					}
					record(this.nodes, 3, changes);
					changes = [];

					if (this.nodes[nextn * 2 + 2].value === null) {
						this.eraseNode (nextn * 2 + 2);
						record(this.nodes, 2, [{node: nextn * 2 + 2}]);
					}
					else {
						this.nodes[nextn * 2 + 2].color = 0;
						record(this.nodes, 9, [{node: nextn * 2 + 2}]);
					}

					return;
				}
				else if (this.nodeExists(rnephew) && this.nodes[rnephew].color === 1) {
					this.rotate(record, sibling, 0);
					this.rotate(record, parent, 1);

					if (this.nodes[nextn].color === 1) {		// If parent was red, it is now replaced by the old red nephew (no change of color), but the new nextn position should be recolored to black
						this.nodes[nextn].color = 0;
						record (this.nodes, 3, [{node: nextn, color: 0}]);
					}
					else {		// Otherwise, parent was black, so recolor it to black		
						this.nodes[parent].color = 0;
						record (this.nodes, 3, [{node: parent, color: 0}]);
					}


					if (this.nodes[nextn * 2 + 2].value === null) {
						this.eraseNode (nextn * 2 + 2);
						record(this.nodes, 2, [{node: nextn * 2 + 2}]);
					}
					else {
						this.nodes[nextn * 2 + 2].color = 0;
						record(this.nodes, 9, [{node: nextn * 2 + 2}]);
					}

					return;
				}
			}
			this.nodes[sibling].color = 1;		// At this point none of the above conditions are true, which means both the sibling and its children are black
			record(this.nodes, 3, [{node: sibling, color: 1}]);

			if (this.nodes[nextn].value === null) {
				this.eraseNode (nextn);
				record(this.nodes, 2, [{node: nextn}]);
			}
			else {
				this.nodes[nextn].color = 0;
				record(this.nodes, 9, [{node: nextn}]);
			}

			if (this.nodes[parent].color === 1) {
				this.nodes[parent].color = 0;
				record(this.nodes, 3, [{node: parent, color: 0}]);
				return;
			}
			this.nodes[parent].color = -1;
			record(this.nodes, 9, [{node: parent}]);

			nextn = parent;		// recur
			if (nextn === 0) {		// if the new parent (which is now double black) is root node, recolor it to black
				this.nodes[nextn].color = 0;
				record(this.nodes, 9, [{node: nextn}]);
				return;
			}
			sibling = nextn + ((nextn % 2 === 1) ? +1 : -1);
			parent = ((nextn - 1) / 2) | 0;
			lnephew = sibling * 2 + 1;
			rnephew = lnephew + 1;

			continue;
		}
		else {		// sibling is red
			if (sibling > nextn) {
				tree.rotate(record, parent, 0);

				this.nodes[parent].color = 0;
				this.nodes[nextn].color = 1;
				record(this.nodes, 3, [{node: parent, color: 0}, {node: nextn, color: 1}]);

				parent = nextn;
				nextn = nextn * 2 + 1;
				sibling = nextn + 1;
				lnephew = sibling * 2 + 1;
				rnephew = lnephew + 1;
			}
			else {
				tree.rotate(record, parent, 1);

				this.nodes[parent].color = 0;
				this.nodes[nextn].color = 1;
				record(this.nodes, 3, [{node: parent, color: 0}, {node: nextn, color: 1}]);

				parent = nextn;
				nextn = nextn * 2 + 2;
				sibling = nextn - 1;
				lnephew = sibling * 2 + 1;
				rnephew = lnephew + 1;
			}
		}
	}
}

tree.insertNode = function insertNode (record, val, col) {
	if (col === undefined) col = 1;
	if (!record) record = function(){}

	var currNode = 0;
	var changes = [];

	if (!this.nodeExists(0)) {
		col = 0;
	}
	else {
		var prev = -1;
		while (this.nodeExists(currNode)) {
			prev = currNode;

			if (val < this.nodes[currNode].value)
				currNode = currNode * 2 + 1;
			else
				currNode = currNode * 2 + 2;
			changes.push ({from: prev, node: currNode});
		}
		var i = -1;
		while (changes[++i]) record(this.nodes, 4, [changes[i]]);
	}
	record(this.nodes, 6, [{node: currNode}]);
	changes = [];

	this.setNode(currNode, new Node(val, col));
	changes.push({node: currNode});
	record(this.nodes, 1, changes);

	if (currNode <= 2) return;

	var parent = ((currNode - 1) / 2) | 0;
	var grand = ((parent - 1) / 2) | 0;
	var uncle = parent + ((parent%2 === 1) ? +1 : -1);

	while (this.nodes[currNode].color === 1 && this.nodes[parent].color === 1) {
		changes = [];
		if (this.nodes[uncle] && this.nodes[uncle].color === 1) {			// If uncle node is also red.
			this.nodes[parent].color = 0;
			this.nodes[grand].color = 1;
			this.nodes[uncle].color = 0;

			changes.push({node: parent, color: 0});
			changes.push({node: grand, color: 1});
			changes.push({node: uncle, color: 0});

			record(this.nodes, 3, changes);
		}
		else {
			if (parent%2 === 1) {		// parent is a left child of grandparent
				if (currNode%2 === 1) {		// current node is a left child of parent
					this.rotate(record, grand, 1);

					this.nodes[grand].color = 0;		// after rotation of tree, the variable 'grand' refers to parent of current child and 'uncle' refers to sibling (previously grandparent)
					this.nodes[uncle].color = 1;
					changes.push({node: grand, color: 0});
					changes.push({node: uncle, color: 1});
					record(this.nodes, 3, changes);
					break;
				}
				else {			// current is a right child of parent
					this.rotate(record, parent, 0);
					this.rotate(record, grand, 1);

					this.nodes[grand].color = 0;
					this.nodes[uncle].color = 1;
					changes.push({node: grand, color: 0});
					changes.push({node: uncle, color: 1});
					record(this.nodes, 3, changes);
					break;
				}
			}
			else {		// parent is a right child of grandparent
				if (currNode%2 === 0) {
					this.rotate(record, grand, 0);

					this.nodes[grand].color = 0;
					this.nodes[uncle].color = 1;
					changes.push({node: grand, color: 0});
					changes.push({node: uncle, color: 1});
					record(this.nodes, 3, changes);
					break;
				}
				else {
					this.rotate(record, parent, 1);
					this.rotate(record, grand, 0);

					changes = [];
					this.nodes[grand].color = 0;
					this.nodes[uncle].color = 1;
					changes.push({node: grand, color: 0});
					changes.push({node: uncle, color: 1});
					record(this.nodes, 3, changes);
					break;
				}
			}
		}
		currNode = grand;
		if (currNode <= 2) break;
		parent = ((currNode - 1) / 2) | 0;
		grand = ((parent - 1) / 2) | 0;
		uncle = parent + ((parent%2 === 1) ? +1 : -1);
	}
	if (this.nodes[0].color === 1) {
		this.nodes[0].color = 0;
		changes = [];
		changes.push({node: 0, color: 0});
		record(this.nodes, 3, changes);
	}
}
tree.rotate = function rotate (record, index, direc) {		// Performs rotation of the tree; direc = 0 for left, 1 for right rotation
	if (direc === undefined) direc = 0;

	if (direc === 0 && !this.nodeExists(index*2 + 2)) return;
	if (direc === 1 && !this.nodeExists(index*2 + 1)) return;

	if (!record) record = function(){}

	var changes = [];	// Records the before and after indices of nodes that are moved during rotation

	var backupNodes = [];
	var firstCopy = 2 * index + ((direc === 0) ? 1 : 2);
	var firstPaste = 2 * firstCopy + ((direc === 0) ? 1 : 2);

	backupNodes.push(this.nodes[firstPaste]);

	var doStep1 = false;

	if (this.nodeExists(firstCopy)) {
		this.copyNode(firstCopy, firstPaste);
		changes.push({from: firstCopy, node: firstPaste});
		doStep1 = true;
	}

	this.copyNode(index, firstCopy);
	changes.push({from: index, node: firstCopy});

	var i = 1;

	if (doStep1) {
		if (direc === 0) while (1) {
			firstCopy = firstCopy * 2 + 1;
			firstPaste = firstPaste * 2 + 1;

			var emptyRow = true;

			for (var j = 0; j < i; ++j) {
				if (backupNodes[0]) emptyRow = false;

				if (this.nodeExists(firstPaste + j))
					backupNodes.push(this.nodes[firstPaste + j]);
				else backupNodes.push(null);

				var tempNode = backupNodes.shift();

				if (tempNode !== null) {
					this.setNode(firstPaste + j, tempNode, false);
					changes.push({from: firstCopy + j, node: firstPaste + j});
				}
				else
					this.eraseNode(firstPaste + j, false);
			}
			for (var j = 0; j < i; ++j) {
				if (this.nodeExists(firstPaste + j + i))
					backupNodes.push(this.nodes[firstPaste + j + i]);
				else backupNodes.push(null);

				if (this.nodeExists(firstCopy + j + i)) {
					this.copyNode(firstCopy + j + i, firstPaste + j + i);
					changes.push({from: firstCopy + j + i, node: firstPaste + j + i});
					emptyRow = false;
					this.eraseNode(firstCopy + j + i, false);
				}
				else
					this.eraseNode(firstPaste + j + i, false);
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

				if (this.nodeExists(firstCopy + j)) {
					this.copyNode(firstCopy + j, firstPaste + j);
					changes.push({from: firstCopy + j, node: firstPaste + j});
					emptyRow = false;
					this.eraseNode(firstCopy + j, false);
				}
				else
					this.eraseNode(firstPaste + j, false);
			}
			for (var j = 0; j < i; ++j) {
				if (backupNodes[0])
					emptyRow = false;

				if (this.nodeExists(firstPaste + j + i))
					backupNodes.push(this.nodes[firstPaste + j + i]);
				else backupNodes.push(null);

				var tempNode = backupNodes.shift();

				if (tempNode !== null) {
					this.setNode(firstPaste + i + j, tempNode, false);
					changes.push({from: firstCopy + j + i, node: firstPaste + j + i});
				}
				else
					this.eraseNode(firstPaste + j + i, false);
			}
			i *= 2;
			if (emptyRow)
				break;
		}
	}

	firstCopy = (direc === 0) ? this.at('rl', index) : this.at('lr', index);
	firstPaste = firstCopy + ((direc === 0) ? -1 : +1);
	i = 1;

	while (2) {
		var emptyRow = true;
		for (var j = 0; j < i; ++j) {
			if (this.nodeExists(firstCopy + j)) {
				this.copyNode(firstCopy + j, firstPaste + j);
				changes.push({from: firstCopy + j, node: firstPaste + j});
				emptyRow = false;
				this.eraseNode(firstCopy + j, false);
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
	changes.push({from: firstPaste, node: index});

	while (3) {
		var emptyRow = true;

		for (j = 0; j < i; ++j) {
			if (this.nodeExists(firstCopy + j)) {
				this.copyNode(firstCopy + j, firstPaste + j);
				changes.push({from: firstCopy + j, node: firstPaste + j});
				emptyRow = false;
				this.eraseNode(firstCopy + j, false);	// We don't want eraseNode to recalculate the height since there could be more child nodes left that we need to move up
			}
		}

		if (emptyRow) {
			this.eraseNode(firstPaste + j - 1);
			break;
		}

		i *= 2;
		firstCopy = 2 * firstCopy + 1;
		firstPaste = 2 * firstPaste + 1;
	}

	record(this.nodes, 0, changes);
}
