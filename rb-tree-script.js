
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
var animFrame;
var progress = [];
var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelRequestAnimationFrame;

var clipboard = {
	operation: 0,
	value: 0
}
var canvasProp = {	// Dimensions of canvas
	width: 0,
	height: 0,
	stepDuration: 500,
	stepDelay: 0.4
};
var treeProp = {		// properties of tree as drawn in canvas
	marginX: 60,
	marginY: 60,
	xSpacing: 50,
	ySpacing: 100,
	nodeRadius: 35,

	red: "rgb(180, 16, 16)",
	black: "#000000",
	stroke: "rgb(172, 224, 114)",

	font: "40px arial narrow",
	fColor: "#ffffff"
};
var transition = {
	animtype: [], 		// [0, ...],
	state: [], 		//[[Node(), Node(), ...], [...], ...];
	steps: [], 		//[[{node: 10, from: 21}, {..., ...}], [{...}, {...}, ...]],
	other: [],
	tempState: [],

	reset: function reset() {
		this.animtype = [];
		this.state = [];
		this.steps = [];
		this.other = [];
		this.tempState = [];
	}
};

function clearCanvas() {
	c.clearRect(0, 0, canvasProp.width, canvasProp.height);
}

function drawNode (val, x, y, col) {
	if (val === undefined) val = 0;
	if (col === undefined) col = 0;

	if (col === -2 || col === -3) {
		c.beginPath();
		c.moveTo(x + treeProp.nodeRadius + 6, y);
		c.arc(x, y, treeProp.nodeRadius + 6, 0, 2 * Math.PI);

		c.strokeStyle = (col === -2) ? "#4fbfff" : "#ff0000";
		c.lineWidth = 4;
		c.stroke();
		c.strokeStyle = treeProp.stroke;
		c.lineWidth = 2;
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

function drawTree (nodes, other, skipnodes) {
	if (other === undefined) other = [];
	if (skipnodes === undefined) skipnodes = [];

	if (!nodes) nodes = tree.nodes;
	clearCanvas();

	var skipIndex = 0;

	for (var i = 0; i < nodes.length; ++i) {
		if (nodes[i]) {
			if (skipnodes && i === skipnodes[skipIndex]) {
				++skipIndex;
			}
			else drawNode (nodes[i].value, nodes[i].x, nodes[i].y, (nodes[i].color !== -1) ? nodes[i].cvalue : -1);

			if (i !== 0 && nodes[((i-1)/2)|0])
				drawLine(nodes[i].x, nodes[i].y, nodes[((i-1)/2)|0].x, nodes[((i-1)/2)|0].y);
		}
	}
	for (i = 0; i < other.length; ++i) {
		var col = other[i].color;
		if (col !== -1 && col !== -2 && col !== -3) col = other[i].cvalue;
		drawNode (other[i].value, other[i].x, other[i].y, col);
	}
}

function calcNodePositions (nodes) {
	if (nodes === undefined) nodes = tree.nodes;
	if (!nodes[0]) return;

	var q = [];
	var curr = 0;
	var xcurr = treeProp.marginX;

	while (q.length !== 0 || curr === 0) {
		if (nodes[curr]) {
			q.push (curr);
			curr = curr * 2 + 1;
		}
		else {
			curr = q.pop();
			nodes[curr].x = xcurr;
			xcurr += treeProp.xSpacing;
			nodes[curr].y = treeProp.marginY + treeProp.ySpacing * tree.levelOf(curr);

			curr = curr * 2 + 2;
			if (nodes[curr]) {
				q.push (curr);
				curr = curr * 2 + 1;
			}
		}
	}

	curr = ((curr - 1) / 2) | 0;

	var lastOffset = (nodes[curr].x) - (canvasProp.width - treeProp.marginX);
	var newOffsetx;

	if (lastOffset <= 0) {		// Offset all nodes by certain amount
		newOffsetx = (-lastOffset / 2) | 0;
		for (var i = 0; i < nodes.length; ++i)
			if (nodes[i] && (nodes[((i - 1) / 2) | 0] || i === 0)) nodes[i].x += newOffsetx;
		newOffsetx = 1;
	}
	else {		// Squeeze to fit
		newOffsetx = (canvasProp.width - 2 * treeProp.marginX) / (canvasProp.width - 2 * treeProp.marginX + lastOffset);
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i] && (nodes[((i - 1) / 2) | 0] || i === 0)) {
				nodes[i].x -= treeProp.marginX;
				nodes[i].x = (nodes[i].x * newOffsetx) | 0;
				nodes[i].x += treeProp.marginX;
			}
		}
	}
	return treeProp.xSpacing * newOffsetx;
}

function recordChanges (nodes, animtype, changes, init) {
	/* animtypes:
		0 - move
		1 - add node
		2 - remove node
		3 - recolor
		4 - search
		5 - successor search
		6 - search blink
		7 - successor search blink
		8 - move and toggle color
		9 - blink nodes (for color changing to/from double black)
	*/

	if (init === undefined) init = false;
	if (init) {
		transition.reset();
		calcNodePositions (tree.nodes);
		transition.state[0] = nodeCpy(tree.nodes);
		return;
	}

	var nodeSpacingX;

	changes.sort(function(a, b) {return a.node - b.node});

	if (animtype !== 2) nodeSpacingX = calcNodePositions (nodes);

	if (animtype === 0 || animtype === 8) {		// move / move and toggle color
		for (var i = 0; i < changes.length; ++i) {
			if (!nodes[changes[i].node]) continue;
			changes[i].x1 = transition.state[transition.state.length - 1][changes[i].from].x;
			changes[i].y1 = transition.state[transition.state.length - 1][changes[i].from].y;

			changes[i].x2 = nodes[changes[i].node].x;
			changes[i].y2 = nodes[changes[i].node].y;

			if (animtype === 8)
				nodes[changes[i].node].cvalue = (changes[i].color === 0) ? treeProp.black : treeProp.red;
		}
	}

	else if (animtype === 1) {		// add node
		for (var i = 0; i < changes.length; ++i) {
			changes[i].x1 = canvasProp.width / 2;
			changes[i].y1 = canvasProp.height + treeProp.nodeRadius + 2;

			changes[i].x2 = nodes[changes[i].node].x;
			changes[i].y2 = nodes[changes[i].node].y;
			nodes[changes[i].node].cvalue = (nodes[changes[i].node].color === 0) ? treeProp.black : treeProp.red;
		}
	}
	else if (animtype === 2) {		// remove node
		for (var i = 0; i < changes.length; ++i) {
			changes[i].x1 = transition.state[transition.state.length - 1][changes[i].node].x;
			changes[i].y1 = transition.state[transition.state.length - 1][changes[i].node].y;

			changes[i].x2 = canvasProp.width / 2;
			changes[i].y2 = canvasProp.height + treeProp.nodeRadius + 2;
		}
	}
	else if (animtype === 3) {		// recolor
		for (var i = 0; i < changes.length; ++i) {
			nodes[changes[i].node].cvalue = (changes[i].color === 0) ? treeProp.black : treeProp.red;
		}
	}
	else if (animtype === 4 || animtype === 5) {		// search
		changes[0].x1 = nodes[changes[0].from].x;
		changes[0].y1 = nodes[changes[0].from].y;


		if (!nodes[changes[0].node]) {	// in case it's a new node to be inserted, the circle will move to the empty spot where the new node is to be inserted
			changes[0].y2 = changes[0].y1 + treeProp.ySpacing;
			if (changes[0].node % 2 === 1) changes[0].x2 = changes[0].x1 - nodeSpacingX;
			else  changes[0].x2 = changes[0].x1 + nodeSpacingX;
		}
		else {
			changes[0].x2 = nodes[changes[0].node].x;
			changes[0].y2 = nodes[changes[0].node].y;
		}
	}
	else if (animtype === 6 || animtype === 7) {		// search blink
		if (!nodes[0]) {
			changes[0].x = canvasProp.width / 2;
			changes[0].y = treeProp.marginY;
		}
		else if (nodes[changes[0].node]) {
			changes[0].x = nodes[changes[0].node].x;
			changes[0].y = nodes[changes[0].node].y;
		}
		else {		// in case it's a new node to be inserted, the circle will blink at the empty spot where the new node is to be inserted
			changes[0].x = transition.steps[transition.steps.length - 1][0].x2;
			changes[0].y = transition.steps[transition.steps.length - 1][0].y2;
		}
	}
	else if (animtype === 9) {		// blink nodes
	}

	transition.animtype.push (animtype);
	transition.steps.push (changes);
	transition.state.push (nodeCpy(nodes));
}

function animate (args) {
	if (args === undefined) args = {};
	if (animFrame) return;
	if (args.stepNumber === undefined) args.stepNumber = 0;

	if (args.stepNumber >= transition.steps.length) {
		calcNodePositions (transition.state[args.stepNumber + 1]);
		calcNodePositions (tree.nodes);
		drawTree(tree.nodes);
		return;
	}

	var nodes = [], othernodes = [], skipnodes = [], tSkipnodes = [];
	var updatenodes = function (){}, postAnimation = function (){};

	if (transition.animtype[args.stepNumber] === 0 || transition.animtype[args.stepNumber] === 1) { // move / add node
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		transition.tempState = nodeCpy (nodes);

		updatenodes = function updatenodes (p) {
			var highlightedNode = 0;
			var currstep = transition.steps[args.stepNumber];
			for (var i = 0; i < nodes.length; ++i) {
				if (!nodes[i]) continue;
				if (highlightedNode < currstep.length && i === currstep[highlightedNode].node) {
					var ci = currstep[highlightedNode];
					nodes[i].x = ci.x1 + (ci.x2 - ci.x1) * p;
					nodes[i].y = ci.y1 + (ci.y2 - ci.y1) * p;
					++highlightedNode;
					continue;
				}
				nodes[i].x = transition.state[args.stepNumber][i].x + (transition.tempState[i].x - transition.state[args.stepNumber][i].x) * p;
				nodes[i].y = transition.state[args.stepNumber][i].y + (transition.tempState[i].y - transition.state[args.stepNumber][i].y) * p;
			}
		}
		postAnimation = function postAnimation () {
			transition.tempState = [];
		}
	}
	else if (transition.animtype[args.stepNumber] === 2) {		// remove
		nodes = nodeCpy(transition.state[args.stepNumber]);
		for (var i = 0; i < transition.steps[args.stepNumber].length; ++i) {
			skipnodes[i] = transition.steps[args.stepNumber][i].node;
			othernodes[i] = nodeCpy([nodes[skipnodes[i]]])[0];
		}
		updatenodes = function updatenodes(p) {
			for (i = 0; i < transition.steps[args.stepNumber].length; ++i) {
				var ci = transition.steps[args.stepNumber][i];

				othernodes[i].x = ci.x1 + (ci.x2 - ci.x1) * p;
				othernodes[i].y = ci.y1 + (ci.y2 - ci.y1) * p;
			}
		}
	}
	else if (transition.animtype[args.stepNumber] === 3) {		// recolor
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		updatenodes = function updatenodes(p) {
			for (var i = 0; i < transition.steps[args.stepNumber].length; ++i) {
				var r, g, b;
				if (transition.steps[args.stepNumber][i].color === 0) {
					r = (treeProp.r1 + (treeProp.r0 - treeProp.r1) * p);
					g = (treeProp.g1 + (treeProp.g0 - treeProp.g1) * p);
					b = (treeProp.b1 + (treeProp.b0 - treeProp.b1) * p);
				}
				else {
					r = (treeProp.r0 + (treeProp.r1 - treeProp.r0) * p);
					g = (treeProp.g0 + (treeProp.g1 - treeProp.g0) * p);
					b = (treeProp.b0 + (treeProp.b1 - treeProp.b0) * p);
				}
				nodes[transition.steps[args.stepNumber][i].node].cvalue = 'rgb(' + (r|0) + ',' + (g|0) + ',' + (b|0) + ')';
			}
		}
	}
	else if (transition.animtype[args.stepNumber] === 4) {		// search
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		othernodes[0] = new Node(null, -2);
		updatenodes = function updatenodes (p) {
			var ci = transition.steps[args.stepNumber][0];
			othernodes[0].x = ci.x1 + (ci.x2 - ci.x1) * p;
			othernodes[0].y = ci.y1 + (ci.y2 - ci.y1) * p;
		}
	}
	else if (transition.animtype[args.stepNumber] === 5) {		// successor search
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		othernodes[0] = new Node(null, -3);
		updatenodes = function updatenodes (p) {
			var ci = transition.steps[args.stepNumber][0];
			othernodes[0].x = ci.x1 + (ci.x2 - ci.x1) * p;
			othernodes[0].y = ci.y1 + (ci.y2 - ci.y1) * p;
		}
	}
	else if (transition.animtype[args.stepNumber] === 6) {		// search blink
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		updatenodes = function updatenodes (p) {
			if ((p * 8) % 2 > 1) othernodes = [];
			else {
				var ci = transition.steps[args.stepNumber][0];
				othernodes[0] = new Node(null, -2);
				othernodes[0].x = ci.x;
				othernodes[0].y = ci.y;
			}
		}
	}
	else if (transition.animtype[args.stepNumber] === 7) {		// successor search blink
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		updatenodes = function updatenodes (p) {
			if ((p * 8) % 2 > 1) othernodes = [];
			else {
				var ci = transition.steps[args.stepNumber][0];
				othernodes[0] = new Node(null, -3);
				othernodes[0].x = ci.x;
				othernodes[0].y = ci.y;
			}
		}
	}
	else if (transition.animtype[args.stepNumber] === 8) {		// move and toggle
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		transition.tempState = nodeCpy (nodes);

		updatenodes = function updatenodes (p) {
			var highlightedNode = 0;
			var currstep = transition.steps[args.stepNumber];
			for (var i = 0; i < nodes.length; ++i) {
				if (nodes[i] === null || nodes[i] === undefined) continue;
				if (highlightedNode < currstep.length && i === currstep[highlightedNode].node) {
					var ci = currstep[highlightedNode];
					nodes[i].x = ci.x1 + (ci.x2 - ci.x1) * p;
					nodes[i].y = ci.y1 + (ci.y2 - ci.y1) * p;

					var r, g, b;
					if (ci.color === 0) {
						r = (treeProp.r1 + (treeProp.r0 - treeProp.r1) * p);
						g = (treeProp.g1 + (treeProp.g0 - treeProp.g1) * p);
						b = (treeProp.b1 + (treeProp.b0 - treeProp.b1) * p);
					}
					else {
						r = (treeProp.r0 + (treeProp.r1 - treeProp.r0) * p);
						g = (treeProp.g0 + (treeProp.g1 - treeProp.g0) * p);
						b = (treeProp.b0 + (treeProp.b1 - treeProp.b0) * p);
					}
					nodes[ci.node].cvalue = 'rgb(' + (r|0) + ',' + (g|0) + ',' + (b|0) + ')';

					++highlightedNode;
				}
				else {
					nodes[i].x = transition.state[args.stepNumber][i].x + (transition.tempState[i].x - transition.state[args.stepNumber][i].x) * p;
					nodes[i].y = transition.state[args.stepNumber][i].y + (transition.tempState[i].y - transition.state[args.stepNumber][i].y) * p;
				}
			}
		}
		postAnimation = function postAnimation () {
			transition.tempState = [];
		}
	}
	else if (transition.animtype[args.stepNumber] === 9) {		// blink node
		nodes = nodeCpy(transition.state[args.stepNumber + 1]);
		transition.tempState = nodeCpy (nodes);

		for (var i = 0; i < transition.steps[args.stepNumber].length; ++i) {
			skipnodes.push(transition.steps[args.stepNumber][i].node);
		}
		tSkipnodes = skipnodes.slice();
		updatenodes = function updatenodes (p) {
			if ((p * 8) % 2 > 1) skipnodes = [];
			else skipnodes = tSkipnodes.slice();
			for (var i = 0; i < nodes.length; ++i) {
				if (!transition.state[args.stepNumber][i]) continue;
				nodes[i].x = transition.state[args.stepNumber][i].x + (transition.tempState[i].x - transition.state[args.stepNumber][i].x) * p;
				nodes[i].y = transition.state[args.stepNumber][i].y + (transition.tempState[i].y - transition.state[args.stepNumber][i].y) * p;
			}
		}
		postAnimation = function postAnimation () {
			transition.tempState = [];
		}
	}

	updatenodes (0);
	drawTree (nodes, othernodes, skipnodes);

	var totalIntervals = progress.length;
	var animStart, animStop;

	function mainAnimation (t) {
		if (animStart === undefined) {
			animStart = t + canvasProp.stepDuration * canvasProp.stepDelay;
			animStop = animStart + canvasProp.stepDuration;
		}
		if (t >= animStart) {
			var prog = progress[(totalIntervals * (t - animStart) / (animStop - animStart)) | 0];
			updatenodes (prog);
			drawTree (nodes, othernodes, skipnodes);
		}

		if (t >= animStop) {
			cancelAnimationFrame (animFrame);
			animFrame = null;

			postAnimation();

			animate({stepNumber: args.stepNumber + 1});
		}
		else {
			animFrame = requestAnimationFrame(mainAnimation);
		}
	}
	animFrame = requestAnimationFrame(mainAnimation);
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
	if (animFrame) return;
	if (operation % 100 === 1) {			// Insert Operation
		if (operation < 100) tree.insertNode(recordChanges, val);
		animate();
	}
	else if (operation % 100 === 2) {			// Delete Operation
		if (operation < 100) tree.deleteNode(recordChanges, val);
		animate();
	}
	else if (operation % 100 === 3) {			// Search Operation
		if (operation < 100) tree.searchNode(recordChanges, val);
		animate();
	}
	else if (operation % 100 === 4) {		// Randomize
		if (operation < 100) tree.randomize(recordChanges, 20);
		animate();
	}
	else if (operation % 100 === 5) {		// erase the tree
		if (operation < 100) tree.erase(recordChanges);
		animate();
	}
	else if (operation % 100 === 6) {		// left rotate at value given in input box
		if (operation < 100) tree.rotate(recordChanges, val, 0);
		animate();
	}
	else if (operation % 100 === 7) {		// right rotate at value given in input box
		if (operation < 100) tree.rotate(recordChanges, val, 1);
		animate();
	}
	else if (operation % 100 === 8) {		// re-do last operation
		drawTree(transition.state[0]);

		canvasProp.stepDuration = 60000 / (parseInt(document.getElementById("speed").value) * (1 + canvasProp.stepDelay));
		setTimeout(function() {reDraw(clipboard.value, clipboard.operation + 100);}, 1000);
	}
}

function updateTree (operation) {
	if (animFrame) return;
	clipboard.operation = operation;
	clipboard.value = parseInt(document.getElementById("nodeValue").value);

	canvasProp.stepDuration = 60000 / (parseInt(document.getElementById("speed").value) * (1 + canvasProp.stepDelay));
	
	recordChanges (null, null, null, true);
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

	canvasProp.width = parseInt(canv.width);
	canvasProp.height = parseInt(canv.height);

	var k = 0;
	while (true) {
		//p = (1 - Math.cos(Math.PI * k)) / 2;
		p = k * (2 - k);
		progress.push(p);
		k += 0.02;

		if (k > 1.0) break;
	}

	parseColors();

	tree.setRecorder (recordChanges);
}
