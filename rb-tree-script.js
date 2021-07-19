var c;

function Node (val, isred) {        // new node factory
    var value = val || 0;
    var red = isred || false;       // if 'red' is true => node is red in color, otherwise it is black
    
    var getv = function getv() { return value; }        // get value
    var getc = function getc() { return red; }      // get color
    var togglec = function togglec () {     // toggle between red and black
        red = (red === true) ? false : true;
    }
    
    return {
        getv: getv,
        getc: getc,
        togglec: togglec
    };
}

function redraw (val, operation) {
    if (operation === 1) {      // Insert Operation
        var n = Node(val, true);
    }
}

function updateTree() {
    var operation;
    if (document.getElementById("insert").checked)
        operation = 1;
    if (document.getElementById("delete").checked)
        operation = 2;
    if (document.getElementById("search").checked)
        operation = 3;
    
    redraw(parseInt(document.getElementById("nodeVal").value), operation);
}

(function initCanvas() {
    var canv = document.getElementById("canvasArea");
    c = canv.getContext("2d");
})();
