/* **** TO DO ****

- SEARCH FUNCTION WITH ANIMATION
- IMPLEMENT INSERTION AND DELETION FUNCTIONS WITHOUT GENERATORS
- BETTER WAY TO IMPLEMENT CHANGES[] ARRAY FOR ANIMATION

 **************** */


/* ***************************
Dependencies from treeObj.js:

function Node (val = 0, col = 0, x = -1, y = -1, cvalue = "#000000");		// Node class

var tree = {
	nodes: []	// Stores all nodes in array binary tree form
	height: 0	// Stores height of tree
	
	at (strPos, initIndex)		// takes a string of 'l's and 'r's for successive left or right child elements respectively and returns its index number in nodes (tree) array.
	levelOf (pos)
	nodeExists (pos)
	setNode: function setNode (pos, node, checkParent = true)
	deleteNode (pos, updateHeight = true)
	searchNode (val)
	copyNode (from, to)
	getNodes()
	randomize (numNodes = 16, maxDiff = 6, minDiff = 3)

	insertNode (val, col = 1)
	rotate (index, direc = 0)		// Performs rotation of the tree; direc = 0 for left, 1 for right rotation
}

******************************* */

var c;		// = canvas.getContext("2d")
var animInterval;
var changes = [];		// keeps a record of indices and coordinates for nodes that are moved during certain tree operations
var chGenerator = null;
var progress = [];
var clipboard = {
	nodes: [],
	height: 0,
	operation: 0,
	value: 0
}

var dimCanvas = {	// Dimensions of canvas
	width: 0,
	height: 0
};

var treeProp = {		// properties of tree as drawn in canvas
	marginX: 60,
	marginY: 60,
	ySpacing: 80,
	nodeRadius: 24,

	red: "rgb(180, 16, 16)",
	black: "#000000",
	stroke: "rgb(172, 224, 114)",

	font: "28px arial narrow",
	fColor: "#ffffff"
};

function clearCanvas() {
	c.clearRect(0, 0, dimCanvas.width, dimCanvas.height);
}

function drawNode (val = 0, x, y, col = 0) {
	if (col === -2 || col === -3) {
		c.beginPath();
		c.moveTo(x + treeProp.nodeRadius + 6, y);
		c.arc(x, y, treeProp.nodeRadius + 6, 0, 2 * Math.PI);
		c.strokeStyle = (col === -2) ? "#4fbfff" : "#ff0000";
		c.stroke();
		c.strokeStyle = treeProp.stroke;
		c.closePath();
		return;
	}
	c.beginPath();
	c.moveTo(x + treeProp.nodeRadius, y);
	c.arc(x, y, treeProp.nodeRadius, 0, 2 * Math.PI);
	if (col !== 0 && col !== 1 && col !== -1)
		c.fillStyle = col;
	else
		c.fillStyle = (col === 1) ? treeProp.red : treeProp.black;
	c.fill();
	// c.strokeStyle = treeProp.stroke;
	if (col === -1) {
		c.strokeStyle = treeProp.black;
		c.stroke();
		c.closePath();

		c.beginPath();
		c.moveTo(x + treeProp.nodeRadius + 6, y);
		c.arc(x, y, treeProp.nodeRadius + 6, 0, 2 * Math.PI);
		c.lineWidth = 4;
		c.stroke();
		c.strokeStyle = treeProp.stroke;
		c.lineWidth = 2;
	}
	else c.stroke();
	c.closePath();

	c.beginPath();		// For printing node values
	c.fillStyle = treeProp.fColor;
	c.fillText(val, x, y);
	c.closePath();
}

function drawLine (x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var len = Math.sqrt(dx*dx + dy*dy);

	x1 += treeProp.nodeRadius * dx / len;
	x2 -= treeProp.nodeRadius * dx / len;
	y1 += treeProp.nodeRadius * dy / len;
	y2 -= treeProp.nodeRadius * dy / len;

	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	// c.strokeStyle = treeProp.stroke;
	c.stroke();
	c.closePath();
}

function drawTree (nodes, deletedLines = true) {
	if (!nodes) nodes = tree.nodes;
	clearCanvas();

	var cIndex = 0;

	for (var i = 0; i < nodes.length; ++i) {
		if (nodes[i]) {
			drawNode (nodes[i].value, nodes[i].x, nodes[i].y, (nodes[i].color !== -1) ? nodes[i].cvalue : -1);

			if (i !== 0 && deletedLines) {
				if (changes && cIndex < changes.length && i === changes[cIndex].node && changes[cIndex].from && changes[cIndex].from === -2) {
					++cIndex;
					continue;
				}
				drawLine(nodes[i].x, nodes[i].y, nodes[((i-1)/2)|0].x, nodes[((i-1)/2)|0].y);
			}
		}
	}
}

function calcChanges (nodes) {
	if (!nodes) nodes = tree.nodes;
	if (changes.length === 0) return false;

	var treeWidth = dimCanvas.width - 2 * treeProp.marginX;

	changes.sort(function(a, b) {return a.node - b.node});

	if (!changes[0]) return;

	if (changes[0].from !== undefined) {
		for (var i = 0; i < changes.length; ++i) {
			if (changes[i].from === -1) {
				changes[i].x1 = dimCanvas.width / 2;
				changes[i].y1 = dimCanvas.height + treeProp.nodeRadius + 2;
			}
			else if (changes[i].from >= 0) {
				l1 = tree.levelOf(changes[i].from, true) / 2;
				l2 = l1 - 1;
				changes[i].x1 = treeProp.marginX + (changes[i].from - l2 + 0.5) * treeWidth / l1;
				changes[i].y1 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].from);
			}
			if (changes[i].from === -2) {
				l1 = tree.levelOf(changes[i].node, true) / 2;
				l2 = l1 - 1;
				changes[i].x1 = treeProp.marginX + (changes[i].node - l2 + 0.5) * treeWidth / l1;
				changes[i].y1 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].node);

				changes[i].x2 = changes[i].x1;
				changes[i].y2 = dimCanvas.height + treeProp.nodeRadius + 2;
			}
			else {
				l1 = tree.levelOf(changes[i].node, true) / 2;
				l2 = l1 - 1;
				changes[i].x2 = treeProp.marginX + (changes[i].node - l2 + 0.5) * treeWidth / l1;
				changes[i].y2 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].node);
			}

			if (nodes[changes[i].node] === null) continue;

			nodes[changes[i].node].x = changes[i].x1;
			nodes[changes[i].node].y = changes[i].y1;
			nodes[changes[i].node].cvalue = (nodes[changes[i].node].color !== -1) ? (nodes[changes[i].node].color === 0) ? treeProp.black : treeProp.red : -1;
		}
	}
	else if (changes[0].color !== undefined) {
		for (var i = 0; i < changes.length; ++i) {
			l1 = tree.levelOf(changes[i].node, true) / 2;
			l2 = l1 - 1;
			changes[i].x = treeProp.marginX + (changes[i].node - l2 + 0.5) * treeWidth / l1;
			changes[i].y = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].node);

			if (nodes[changes[i].node] === null) continue;

			nodes[changes[i].node].x = changes[i].x;
			nodes[changes[i].node].y = changes[i].y;
			nodes[changes[i].node].cvalue = (nodes[changes[i].node].color === 0) ? treeProp.red : treeProp.black;		// the colors are toggled here as we need them to transition from one to the other
		}
	}
	else if (changes[0].srchfrom !== undefined) {
		l1 = tree.levelOf(changes[0].srchfrom, true) / 2;
		l2 = l1 - 1;
		changes[0].x1 = treeProp.marginX + (changes[0].srchfrom - l2 + 0.5) * treeWidth / l1;
		changes[0].y1 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[0].srchfrom);

		l1 = tree.levelOf(changes[0].node, true) / 2;
		l2 = l1 - 1;
		changes[0].x2 = treeProp.marginX + (changes[0].node - l2 + 0.5) * treeWidth / l1;
		changes[0].y2 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[0].node);
	}
	else if (changes[0].nextfrom !== undefined) {
		l1 = tree.levelOf(changes[0].nextfrom, true) / 2;
		l2 = l1 - 1;
		changes[0].x1 = treeProp.marginX + (changes[0].nextfrom - l2 + 0.5) * treeWidth / l1;
		changes[0].y1 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[0].nextfrom);

		l1 = tree.levelOf(changes[0].node, true) / 2;
		l2 = l1 - 1;
		changes[0].x2 = treeProp.marginX + (changes[0].node - l2 + 0.5) * treeWidth / l1;
		changes[0].y2 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[0].node);
	}
}

function animChange(args = {}) {
	if (args.delay === undefined) args.delay = 12;
	if (args.delete === undefined) args.delete = false;
	if (args.lagFrames === undefined) args.lagFrames = 20;
	if (args.nodes === undefined) args.nodes = tree.nodes;

	if (animInterval) {
		return;
	}
	if (!changes) {
		drawTree();
		return;
	}
	if (chGenerator) {
		var nextVal = chGenerator.next();
		if (nextVal.done) {
			chGenerator = null;
			return;
		}
		else while (nextVal.value[0] === undefined) nextVal = chGenerator.next();
		changes = nextVal.value;
	}
	console.log('changes:', changes);

	var len = changes.length;
	var k = 0;

	calcChanges(args.nodes);

	if (changes[0].from !== undefined) {
		animInterval = setInterval( function() {
			if (args.lagFrames > 0) --args.lagFrames;
			else {
				for (var i = 0; i < len; ++i) {
					var ci = changes[i];
					if (args.nodes[ci.node] === null) continue;

					args.nodes[ci.node].x = ci.x1 + (ci.x2 - ci.x1) * progress[k];
					args.nodes[ci.node].y = ci.y1 + (ci.y2 - ci.y1) * progress[k];
					// drawNode(v, x, y, col);
				}
				++k;
			}

			drawTree(args.nodes);

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 15});
				else return;
			}
		}, args.delay);
	}
	else if (changes[0].color !== undefined) {
		animInterval = setInterval( function() {
			if (args.lagFrames > 0) --args.lagFrames;
			else {
				for (var i = 0; i < len; ++i) {
					if (args.nodes[changes[i].node] === null) continue;

					var r, g, b;
					if (changes[i].color === 0) {
						r = (treeProp.r1 + (treeProp.r0 - treeProp.r1) * progress[k]);
						g = (treeProp.g1 + (treeProp.g0 - treeProp.g1) * progress[k]);
						b = (treeProp.b1 + (treeProp.b0 - treeProp.b1) * progress[k]);
					}
					else {
						r = (treeProp.r0 + (treeProp.r1 - treeProp.r0) * progress[k]);
						g = (treeProp.g0 + (treeProp.g1 - treeProp.g0) * progress[k]);
						b = (treeProp.b0 + (treeProp.b1 - treeProp.b0) * progress[k]);
					}
					args.nodes[changes[i].node].cvalue = 'rgb(' + r + ',' + g + ',' + b + ')';
					// drawNode(v, x, y, col);
				}
				++k;
			}

			drawTree(args.nodes);

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 15});
				else return;
			}
		}, args.delay);
	}
	else if (changes[0].srchfrom !== undefined) {
		animInterval = setInterval( function() {
			drawTree(args.nodes);

			if (args.lagFrames > 0) --args.lagFrames;
			else {
				var ci = changes[0];
				drawNode(null, ci.x1 + (ci.x2 - ci.x1) * progress[k], ci.y1 + (ci.y2 - ci.y1) * progress[k], -2);
				++k;
			}

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 15});
				else return;
			}
		}, args.delay);
	}
	else if (changes[0].nextfrom !== undefined) {
		animInterval = setInterval( function() {
			drawTree(args.nodes);

			if (args.lagFrames > 0) --args.lagFrames;
			else {
				var ci = changes[0];
				drawNode(null, ci.x1 + (ci.x2 - ci.x1) * progress[k], ci.y1 + (ci.y2 - ci.y1) * progress[k], -3);
				++k;
			}

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 15});
				else return;
			}
		}, args.delay);
	}
}

function nodeCpy (src) {
	var dest = [];
	for (var i = 0; i < src.length; ++i) {
		if (src[i] === null || src[i] === undefined) dest[i] = null;
		else dest[i] = new Node(src[i].value, src[i].color, src[i].x, src[i].y, src[i].cvalue);
	}
	return dest;
}

function reDraw (val, operation) {
	if (animInterval) return;
	if (operation % 100 === 1) {			// Insert Operation
		if (operation > 100) {
			tree.nodes = nodeCpy(clipboard.nodes);
			tree.height = clipboard.height;
		}
		chGenerator = tree.insertNode(val);
		animChange();
	}
	else if (operation % 100 === 2) {			// Delete Operation
		chGenerator = tree.deleteNode(val);
		animChange();
	}
	else if (operation % 100 === 3) {			// Search Operation
		chGenerator = tree.searchNode(val);
		animChange();
	}
	else if (operation % 100 === 4) {		// Randomize
		if (operation < 100) changes = tree.randomize(20);
		animChange();
	}
	else if (operation % 100 === 5) {		// erase the tree
		if (operation < 100) changes = tree.erase();
		var tempNodes = nodeCpy(clipboard.nodes);
		animChange({nodes: tempNodes});
	}
	else if (operation % 100 === 6) {		// left rotate at value given in input box
		if (operation < 100) changes = tree.rotate(val, 0);
		animChange();
	}
	else if (operation % 100 === 7) {		// right rotate at value given in input box
		if (operation < 100) changes = tree.rotate(val, 1);
		animChange();
	}
	else if (operation % 100 === 8) {		// re-do last operation
		drawTree(clipboard.nodes, false);
		setTimeout(function() {reDraw(clipboard.value, clipboard.operation + 100);}, 1000);
	}
}

function updateTree (operation) {
	clipboard.nodes = nodeCpy(tree.nodes);
	clipboard.height = tree.height;
	clipboard.operation = operation;
	clipboard.value = parseInt(document.getElementById("nodeValue").value);
	
	reDraw(clipboard.value, operation);
}

function parseColors() {
	var black = treeProp.black;
	if (black[0] === '#') {
		black = black.split('#')[1];
		if (black.length === 6) {
			treeProp.r0 = parseInt(black.substr(0, 2), 16);
			treeProp.g0 = parseInt(black.substr(2, 2), 16);
			treeProp.b0 = parseInt(black.substr(4, 2), 16);
		}
		else if (black.length === 3) {
			treeProp.r0 = parseInt(black.substr(0, 1) + black.substr(0, 1), 16);
			treeProp.g0 = parseInt(black.substr(1, 1) + black.substr(1, 1), 16);
			treeProp.b0 = parseInt(black.substr(2, 1) + black.substr(2, 1), 16);
		}
	}
	else if (black.search(/rgb/i) >= 0) {
		black = black.split('(')[1].split(',');
		treeProp.r0 = parseInt(black[0]);
		treeProp.g0 = parseInt(black[1]);
		treeProp.b0 = parseInt(black[2]);
	}
	var red = treeProp.red;
	if (red[0] === '#') {
		red = red.split('#')[1];
		if (red.length === 6) {
			treeProp.r1 = parseInt(red.substr(0, 2), 16);
			treeProp.g1 = parseInt(red.substr(2, 2), 16);
			treeProp.b1 = parseInt(red.substr(4, 2), 16);
		}
		else if (red.length === 3) {
			treeProp.r1 = parseInt(red.substr(0, 1) + red.substr(0, 1), 16);
			treeProp.g1 = parseInt(red.substr(1, 1) + red.substr(1, 1), 16);
			treeProp.b1 = parseInt(red.substr(2, 1) + red.substr(2, 1), 16);
		}
	}
	else if (red.search(/rgb/i) >= 0) {
		red = red.split('(')[1].split(',');
		treeProp.r1 = parseInt(red[0]);
		treeProp.g1 = parseInt(red[1]);
		treeProp.b1 = parseInt(red[2]);
	}
}

window.onload = function initCanvas() {
	var canv = document.getElementById("canvasArea");
	c = canv.getContext("2d");

	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = treeProp.font;
	c.strokeStyle = treeProp.stroke;
	c.lineWidth = 2;

	dimCanvas.width = parseInt(canv.width);
	dimCanvas.height = parseInt(canv.height);

	var k = 0;
	while (true) {
		//p = (1 - Math.cos(Math.PI * k)) / 2;
		p = k * (2 - k);
		progress.push(p);
		k += 0.02;

		if (k > 1.0) break;
	}

	parseColors();
}
