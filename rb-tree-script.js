
/* ***************************
Dependencies from treeObj.js:

function Node (val = 0, col = -1, x = -1, y = -1, cvalue = "#000000");		// Node class

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
	stroke: "#ffffff",

	font: "28px arial narrow",
	fColor: "#ffffff"
};

function clearCanvas() {
	c.clearRect(0, 0, dimCanvas.width, dimCanvas.height);
}

function drawNode (val = 0, x, y, col = 1) {
	c.beginPath();
	c.moveTo(x + treeProp.nodeRadius, y);
	c.arc(x, y, treeProp.nodeRadius, 0, 2 * Math.PI);
	if (col !== 0 && col !== 1)
		c.fillStyle = col;
	else
		c.fillStyle = (col === 0) ? treeProp.black : treeProp.red;
	c.fill();
	// c.strokeStyle = treeProp.stroke;
	c.stroke();
	c.closePath();
	c.fillStyle = treeProp.fColor;
	c.fillText(val, x, y);
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

/*	OLD TREE DRAWING FUNCTION
function drawTree (skipChanges = false) {		// Draws the complete tree on canvas
	var p = {x: dimCanvas.width / 2, y: treeProp.marginY};
	var nodeDist;

	clearCanvas();

	var lastNode = 0, cIndex = 0;

	for (var i = 0; i < tree.nodes.length; ++i) {
		var skipdraw = false;
		if (skipChanges && changes && changes[cIndex] && i === changes[cIndex].node) {
			skipdraw = true;
			++cIndex;
		}
		if (tree.nodes[i]) {
			if (!skipdraw) drawNode(tree.nodes[i].value, p.x, p.y, tree.nodes[i].color);
			if (i !== 0) {
				if (i % 2 === 1) drawLine(p.x + nodeDist/2, p.y - treeProp.ySpacing, p.x, p.y);
				else drawLine(p.x - nodeDist/2, p.y - treeProp.ySpacing, p.x, p.y);
			}
		}
		if (i === lastNode) {
			lastNode = lastNode*2 + 2;
			nodeDist = (dimCanvas.width - treeProp.marginX - p.x);
			p.y += treeProp.ySpacing;
			p.x = treeProp.marginX + nodeDist/2;
			continue;
		}
		p.x += nodeDist;
	}
}
*/

function drawTree() {
	clearCanvas();

	var cIndex = 0;

	for (var i = 0; i < tree.nodes.length; ++i) {
		if (tree.nodes[i]) {
			drawNode (tree.nodes[i].value, tree.nodes[i].x, tree.nodes[i].y, tree.nodes[i].cvalue);

			if (i !== 0)
				drawLine(tree.nodes[i].x, tree.nodes[i].y, tree.nodes[((i-1)/2)|0].x, tree.nodes[((i-1)/2)|0].y);
		}
	}
}

function printlog(id, data, init = false) {
	/**
	if (init) {
		document.getElementById("log").style.border = "1px solid #000000";
		document.getElementById("log").style.fontWeight = "bold";
		document.getElementById("log").style.fontFamily = "courier new";
		document.getElementById("log").style.fontSize = "11px";
		document.getElementById("log").style.maxHeight = "90%";
		document.getElementById("log").style.overflow = "scroll";
		document.getElementById("log").style.position = "fixed";
		document.getElementById("log").style.right = "10px";
		document.getElementById("log").style.top = "10px";
		document.getElementById("log").style.whiteSpace = "pre";
		//document.getElementById("log").style.width = "300px";
		return;
	}
	document.getElementById("log").innerHTML += id + ':\n      <span style="color: #cf3f3f; display: inline-block">' + data + '</span>\n';
	//*/
}

function calcChanges() {
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
			else {
				l1 = tree.levelOf(changes[i].from, true) / 2;
				l2 = l1 - 1;
				changes[i].x1 = treeProp.marginX + (changes[i].from - l2 + 0.5) * treeWidth / l1;
				changes[i].y1 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].from);
			}

			l1 = tree.levelOf(changes[i].node, true) / 2;
			l2 = l1 - 1;
			changes[i].x2 = treeProp.marginX + (changes[i].node - l2 + 0.5) * treeWidth / l1;
			changes[i].y2 = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].node);

			if (tree.nodes[changes[i].node] === null) continue;

			tree.nodes[changes[i].node].x = changes[i].x1;
			tree.nodes[changes[i].node].y = changes[i].y1;
			tree.nodes[changes[i].node].cvalue = (tree.nodes[changes[i].node].color === 0) ? treeProp.black : treeProp.red;
		}
	}
	else if (changes[0].color !== undefined) {
		for (var i = 0; i < changes.length; ++i) {
			l1 = tree.levelOf(changes[i].node, true) / 2;
			l2 = l1 - 1;
			changes[i].x = treeProp.marginX + (changes[i].node - l2 + 0.5) * treeWidth / l1;
			changes[i].y = treeProp.marginY + treeProp.ySpacing * tree.levelOf(changes[i].node);

			if (tree.nodes[changes[i].node] === null) continue;

			tree.nodes[changes[i].node].x = changes[i].x;
			tree.nodes[changes[i].node].y = changes[i].y;
			tree.nodes[changes[i].node].cvalue = (tree.nodes[changes[i].node].color === 0) ? treeProp.red : treeProp.black;		// the colors are toggled here as we need them to transition from one to the other
		}
	}
}

function animChange(args = {delay: 10, delete: false, lagFrames: 0}) {
	if (args.delay === undefined) args.delay = 10;
	if (args.delete === undefined) args.delete = false;
	if (args.lagFrames === undefined) args.lagFrames = 0;

	console.log(args);
	if (animInterval) {
		return;
	}
	if (!changes) {
		drawTree();
		return;
	}
	if (chGenerator) {
		var nextVal = chGenerator.next();
		if (!nextVal.value) {
			chGenerator = null;
			return;
		}
		changes = nextVal.value;
		console.log('changes:', changes);
	}

	var len = changes.length;
	var k = 0;

	calcChanges();

	if (changes[0].from !== undefined) {
		animInterval = setInterval( function() {
			if (args.lagFrames > 0) --args.lagFrames;
			else {
				for (var i = 0; i < len; ++i) {
					var ci = changes[i];
					if (tree.nodes[ci.node] === null) continue;

					tree.nodes[ci.node].x = ci.x1 + (ci.x2 - ci.x1) * progress[k];
					tree.nodes[ci.node].y = ci.y1 + (ci.y2 - ci.y1) * progress[k];
					// drawNode(v, x, y, col);
				}
				++k;
			}

			drawTree();

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 20});
				else return;
			}
		}, args.delay);
	}
	else if (changes[0].color !== undefined) {
		animInterval = setInterval( function() {
			if (args.lagFrames > 0) --args.lagFrames;
			else {
				for (var i = 0; i < len; ++i) {
					if (tree.nodes[changes[i].node] === null) continue;

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
					tree.nodes[changes[i].node].cvalue = 'rgb(' + r + ',' + g + ',' + b + ')';
					// drawNode(v, x, y, col);
				}
				++k;
			}

			drawTree();

			if (k >= progress.length) {
				clearInterval(animInterval);
				if (args.delete) changes = [];
				animInterval = null;
				if (chGenerator) animChange({delay: args.delay, delete: args.delete, lagFrames: 20});
				else return;
			}
		}, args.delay);
	}
}

function nodeCpy (src) {
	var dest = [];
	for (var i = 0; i < src.length; ++i) {
		if (src[i] === null) dest[i] = null;
		else dest[i] = new Node(src[i].value, src[i].color, src[i].x, src[i].y, src[i].cvalue);
	}
	return dest;
}

function reDraw (val, operation) {
	if (animInterval) return;
	if (operation % 100 === 1) {			// Insert Operation
		if (operation < 100) {
			chGenerator = tree.insertNode(val);
			animChange();
		}
		else {
			tree.nodes = nodeCpy(clipboard.nodes);
			tree.height = clipboard.height;
			chGenerator = tree.insertNode(val);
			animChange({lagFrames: 100});
		}
	}
	else if (operation % 100 === 4) {		// Randomize
		if (operation < 100) {
			changes = tree.randomize(20);
			animChange();
		}
		else animChange({lagFrames: 100});
	}
	else if (operation % 100 === 5) {		// erase the tree
		tree.erase();
		drawTree();
	}
	else if (operation % 100 === 6) {		// left rotate at value given in input box
		if (operation < 100) {
			changes = tree.rotate(val, 0);
			animChange();
		}
		else animChange({lagFrames: 100});
	}
	else if (operation % 100 === 7) {		// right rotate at value given in input box
		if (operation < 100) {
			changes = tree.rotate(val, 1)
			animChange();
		}
		else animChange({lagFrames: 100});
	}
	else if (operation % 100 === 8) {		// re-do last operation
		reDraw(clipboard.value, clipboard.operation + 100);
	}

	// printlog('Routine Log', tree.getNodes());
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
	// printlog(0, 0, true);
}
