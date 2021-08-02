
/* ***************************
Dependencies from treeObj.js:

function Node (val = 0, col = -1);		// Node class

var tree = {
	nodes: []	// Stores all nodes in array binary tree form
	height: 0	// Stores height of tree
	
	at (strPos, initIndex)		// takes a string of 'l's and 'r's for successive left or right child elements respectively and returns its index number in nodes (tree) array.
	levelOf (pos)
	nodeExists (pos)
	setNode: function setNode (pos, node, checkParent = true)
	deleteNode (pos, updateHeight = true)
	insertNode (val, col)
	searchNode (val)
	copyNode (from, to)
	getNodes()
	randomize (pos, num = 100)
	rotateRight (index)		// Right rotate at nodes[index]
	rotateLeft (index)		// Left rotate at nodes[index]
}

******************************* */

var c;		// = canvas.getContext("2d")
var animInterval;
var changes = [];		// keeps a record of indices and coordinates for nodes that are moved during certain tree operations

var dimCanvas = {	// Dimensions of canvas
	width: 0,
	height: 0
};

var dimTree = {		// margins and spacing of tree
	marginX: 30,
	marginY: 30,
	ySpacing: 40,
	nodeRadius: 12
};

function clearCanvas() {
	c.clearRect(0, 0, dimCanvas.width, dimCanvas.height);
}

function drawNode (val = 0, x, y, col = 1) {
	c.beginPath();
	c.moveTo(x + dimTree.nodeRadius, y);
	c.arc(x, y, dimTree.nodeRadius, 0, 2 * Math.PI);
	c.fillStyle = (col === 0) ? "#000000" : "#af2d2f";
	c.fill();
	c.stroke();
	c.closePath();
	c.fillStyle = "#ffffff";
	c.fillText(val, x, y);
}

function drawLine (x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var len = Math.sqrt(dx*dx + dy*dy);

	x1 += dimTree.nodeRadius * dx / len;
	x2 -= dimTree.nodeRadius * dx / len;
	y1 += dimTree.nodeRadius * dy / len;
	y2 -= dimTree.nodeRadius * dy / len;

	c.beginPath();
	c.moveTo(x1, y1);
	c.lineTo(x2, y2);
	c.strokeStyle = "#000000";
	c.stroke();
	c.closePath();
}

function drawTree(skipChanges = false) {		// Draws the complete tree on canvas
	var p = {x: dimCanvas.width / 2, y: dimTree.marginY};
	var nodeDist;

	clearCanvas();

	var lastNode = 0, cIndex = 0;

	for (var i = 0; i < tree.nodes.length; ++i) {
		var skipdraw = false;
		if (skipChanges && changes && changes[cIndex] && i === changes[cIndex].to) {
			skipdraw = true;
			++cIndex;
		}
		if (tree.nodes[i]) {
			if (!skipdraw) drawNode(tree.nodes[i].value, p.x, p.y);
			if (i !== 0) {
				if (i % 2 === 1) drawLine(p.x + nodeDist/2, p.y - dimTree.ySpacing, p.x, p.y);
				else drawLine(p.x - nodeDist/2, p.y - dimTree.ySpacing, p.x, p.y);
			}
		}
		if (i === lastNode) {
			lastNode = lastNode*2 + 2;
			nodeDist = (dimCanvas.width - dimTree.marginX - p.x);
			p.y += dimTree.ySpacing;
			p.x = dimTree.marginX + nodeDist/2;
			continue;
		}
		p.x += nodeDist;
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

function reDraw (val, operation) {
	c.strokeStyle = "#000000";
	c.fillStyle = "#000000";
	
	if (operation === 1) {	  // Insert Operation
		tree.insertNode(val);
	}

	printlog('Routine Log', tree.getNodes());
}

function calcChanges() {
	if (changes.length === 0) return false;

	var treeWidth = dimCanvas.width - 2 * dimTree.marginX;

	changes.sort(function(a, b) {return a.to - b.to});

	for (var i = 0; i < changes.length; ++i) {
		l1 = tree.levelOf(changes[i].from, true) / 2;
		l2 = l1 - 1;
		changes[i].x1 = dimTree.marginX + (changes[i].from - l2 + 0.5) * treeWidth / l1;
		l1 = tree.levelOf(changes[i].to, true) / 2;
		l2 = l1 - 1;
		changes[i].x2 = dimTree.marginX + (changes[i].to - l2 + 0.5) * treeWidth / l1;
		changes[i].y1 = dimTree.marginY + dimTree.ySpacing * tree.levelOf(changes[i].from);
		changes[i].y2 = dimTree.marginY + dimTree.ySpacing * tree.levelOf(changes[i].to);
	}
}

function animChange() {
	if (!changes) {
		clearInterval(animInterval);
		drawTree();
		return;
	}
	if (animInterval) {
		clearInterval(animInterval);
	}

	var len = changes.length;
	var progress = 0.0;

	calcChanges();

	animInterval = setInterval( function() {
		progress += 0.02;
		drawTree(true);

		for (var i = 0; i < len; ++i) {
			if (tree.nodes[changes[i].to] === null) continue;

			var v = tree.nodes[changes[i].to].value;
			var x = changes[i].x1 + (changes[i].x2 - changes[i].x1) * progress;
			var y = changes[i].y1 + (changes[i].y2 - changes[i].y1) * progress;
			drawNode(v, x, y);
		}

		if (progress >= 1.0) {
			clearInterval(animInterval);
			animInterval = null;
			return;
		}
	}, 10);
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

function button1() {
	tree.randomize(14);
	printlog("Randomized", tree.randomize(30).getNodes());
}
function button2() {
	changes = tree.rotate(parseInt(document.getElementById("nodeValue").value), 1);
	console.log(tree.height);
	animChange();
}
function button3() {
	changes = tree.rotate(parseInt(document.getElementById("nodeValue").value), 0);
	console.log(tree.height);
	animChange();
}
function button4() {
	drawTree();
}

window.onload = function initCanvas() {
	var canv = document.getElementById("canvasArea");
	c = canv.getContext("2d");

	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = "14px arial narrow";
	c.strokeStyle = "#000000";

	dimCanvas.width = parseInt(canv.width);
	dimCanvas.height = parseInt(canv.height);

	printlog(0, 0, true);
}
