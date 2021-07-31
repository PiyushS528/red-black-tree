
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

var dimCanvas = {	// Dimensions of canvas
	width: 0,
	height: 0
};

function drawNodes() {		// Draws tree.nodes[] on canvas
	var p = {x: dimCanvas.width / 2, y: 40};
	var nodeDist;

	c.textAlign = "center";
	c.textBaseline = "middle";
	c.font = "14px arial narrow";
	c.strokeStyle = "#ffffff";

	c.clearRect(0, 0, dimCanvas.width, dimCanvas.height);

	lastNode = 0;

	for (var i = 0; i < tree.nodes.length; ++i) {
		if (tree.nodes[i]) {
			c.beginPath();
			c.moveTo(p.x + 6, p.y);
			c.arc(p.x, p.y, 12, 0, 2 * Math.PI);
			c.fillStyle = "#000000";
			c.fill();
			c.closePath();
			c.fillStyle = "#ffffff";
			c.fillText(tree.nodes[i].value, p.x, p.y);
		}
		if (i === lastNode) {
			lastNode = lastNode*2 + 2;
			nodeDist = (dimCanvas.width - 30 - p.x);
			p.y += 40;
			p.x = 30 + nodeDist/2;
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
	tree.rotateRight(parseInt(document.getElementById("nodeValue").value));
	drawNodes();
}
function button3() {
	tree.rotateLeft(parseInt(document.getElementById("nodeValue").value));
	drawNodes();
}
function button4() {
	drawNodes();
}

window.onload = function initCanvas() {
	var canv = document.getElementById("canvasArea");
	c = canv.getContext("2d");

	dimCanvas.width = parseInt(canv.width);
	dimCanvas.height = parseInt(canv.height);

	printlog(0, 0, true);
}
