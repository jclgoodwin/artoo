// Author: Paul Andrews
//
// Copyright 2013 University of York
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


// This will hold the general svg graph tool code
// SVG shapes containing an html div as a foreign object connected by arrows

function SVGGraph(width, height) {
    this.nodes = new Object();
    this.connections = new Array();

    this.offset = 10;
    this.parallelogramSkew = 50;
    this.roundRectangleEdgeRadius = 30;

    this.dragNodes = new Array();

    this.zoomLevel = 1.0;
    this.zoomIncrement = 0.1;
    this.minZoom = 0.25;
    this.maxZoom = 1.55;


    // Reference to this SVGGraph object so I can pass to event handlers
    var me = this;

    this.nodeRightClickHandler = function(e) { collapse(e, me) };
    this.canvasRightClickHandler = function(e) { };

    this.nodeExpandHandler = function(e) { expand(e, me) };

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);

    this.canvas = createSVGRectangle(0, 0, width, height, 0);
    this.canvas.setAttribute("id", "canvas");
    this.canvas.setAttribute("style", "stroke-width: 0px; opacity: 1.0; fill:white");

    this.canvas.addEventListener("mousedown", function(e) {startDragCanvas(e, me)}, true);
    this.canvas.addEventListener("contextmenu", this.canvasRightClickHandler, false);
    this.svg.appendChild(this.canvas);    

    this.graphSvg = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.graphSvg.setAttribute("transform", "scale(1) translate(0,0)");
    this.svg.appendChild(this.graphSvg);

}

SVGGraph.prototype.clear = function() {
    for (var n in this.nodes) {
        if (this.nodes.hasOwnProperty(n)) {
            this.graphSvg.removeChild(this.nodes[n]);
        }
    }

    for (var c = 0 ; c < this.connections.length ; c++) {
        this.graphSvg.removeChild(this.connections[c]);
    }

    this.nodes = new Object();
    this.connections = new Array();
}

SVGGraph.prototype.getNodeCoords = function(id) {
    return getTransformCoords(this.svg.getElementById(id).getAttribute("transform"));
}

SVGGraph.prototype.zoomIn = function() {
    if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel += this.zoomIncrement;
        this.centreGraph();
    }
}

SVGGraph.prototype.zoomOut = function() {
    if (this.zoomLevel > this.minZoom) {
        this.zoomLevel -= this.zoomIncrement;
        this.centreGraph();
    }
}

SVGGraph.prototype.centreGraph = function() {
    var svgCoords = this.graphSvg.getBBox();
    var centreX = svgCoords.x + (svgCoords.width/2.0);  
    var centreY = svgCoords.y + (svgCoords.height/2.0);   
    var width = parseFloat(this.svg.getAttribute("width"));
    var height = parseFloat(this.svg.getAttribute("height"));  
    var tranX = ((width / this.zoomLevel) / 2.0) - centreX;
    var tranY = ((height / this.zoomLevel) / 2.0) - centreY;

    this.graphSvg.setAttribute("transform", "scale(" + this.zoomLevel + ") translate(" + tranX + "," + tranY + ")");
}

SVGGraph.prototype.zoomToFit = function() {
    this.centreGraph();
    var zoomingOut = true;
    var bbox = this.graphSvg.getBBox();
    var width = this.svg.getAttribute("width");
    var height = this.svg.getAttribute("height");

    while (zoomingOut) {        
        if (((bbox.height*this.zoomLevel) > height) || ((bbox.width*this.zoomLevel) > width)) {
            this.zoomOut();
        }
        else {
            zoomingOut = false;
        }
    }
}

SVGGraph.prototype.getSVGForExport = function() {
    // Create a new SVG then clone the graphSVG g and put inside
    var newSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // get the sizes from this.graphSVG, plus a bit of a border
    var bbox = this.graphSvg.getBBox();
    var border = 5;
    var width = (bbox.width + 2*border);
    var height = (bbox.height+ 2*border);
    newSVG.setAttribute("width", width);
    newSVG.setAttribute("height", height);

    var newCanvas = createSVGRectangle(0, 0, width, height, 0);
    newCanvas.setAttribute("id", "canvas");
    newCanvas.setAttribute("style", "stroke-width: 0px; opacity: 1.0; fill:white");

    var newGraph = this.graphSvg.cloneNode(true);
    newGraph.setAttribute("transform", "scale(1.0) translate(0.0, 0.0)");      
    newGraph.setAttribute("style", "fill-opacity: 1.0; fill: white; stroke: black; stroke-width: 2px;"); 
    
    newSVG.appendChild(newCanvas);
    newSVG.appendChild(newGraph);

    gNodes = newSVG.getElementsByClassName("_graphLibNode");
    gConns = newSVG.getElementsByClassName("_graphLibConnection");
    filled = newSVG.getElementsByClassName("_graphLibFilled");

    for (var i = 0 ; i < gNodes.length ; i++) {
        coords = getTransformCoords(gNodes[i].getAttribute("transform"));
        var x = coords[0] - parseFloat(bbox.x) + border;
        var y = coords[1] - parseFloat(bbox.y) + border;          
        gNodes[i].setAttribute("transform", "translate(" + x + "," + y + ")");
    }


    for (var i = 0 ; i < gConns.length ; i++) {
        var x = 0.0 - parseFloat(bbox.x) + border;
        var y = 0.0 - parseFloat(bbox.y) + border;          
        gConns[i].setAttribute("transform", "translate(" + x + "," + y + ")");
    }
    
    for (var i = 0 ; i < filled.length ; i++) {
        filled[i].setAttribute("style", "fill: black;"); 
    }
    
    return newSVG;
}

SVGGraph.prototype.addLetterToShape = function(id, letter) {
    var txt = createSVGLetter(letter, 20);
    var node = this.svg.getElementById(id);
    var bbox = node.getBBox();

    node.appendChild(txt);
    var width = bbox.x + bbox.width - txt.getBBox().width;
    var height = bbox.y + bbox.height;
    
    txt.setAttribute("x", node.shape.getAttribute("x") + width);
    txt.setAttribute("y", node.shape.getAttribute("y") + height);    
}

SVGGraph.prototype.placeDiamond = function(id) {
    var node = this.nodes[id];

    if (node.hasOwnProperty("diamond")) {
        var parent = null;
        
        for (var c = 0 ; c < this.connections.length ; c++) {
            if (this.connections[c].toId === id) {
                parent = this.nodes[this.connections[c].fromId];
                break;
            }
        }

        var bbox = node.shape.getBBox();    
        var parentBelow = false;
        var tranX = (bbox.width/2.0) + bbox.x;
        var tranY = 0.0;
        var style = window.getComputedStyle(node.shape);
        var w = style.getPropertyValue("stroke-width");

        if (parent != null) {
            var parentBBox = getActualCoords(parent);
            var childBBox = getActualCoords(node)

            if (parentBBox.top > childBBox.top) {
                parentBelow = true;
            }
        }

        if (parentBelow) {
            tranY = bbox.y - node.diamond.getBBox().height - parseInt(w.substring(0, w.length - 2));
        }
        else {
            tranY = bbox.height + bbox.y + parseInt(w.substring(0, w.length - 2));
        }
        
        node.diamond.setAttribute("transform",  "translate(" + tranX + "," + tranY + ")");    
    }   
}

SVGGraph.prototype.removeDiamondFromShape = function(id) {
    var node = this.nodes[id];
    node.removeChild(node.diamond);
}

SVGGraph.prototype.addDiamondToShape = function(id) {
    var diamond = createSVGDiamond(20, false);
    var node = this.svg.getElementById(id);
    
    diamond.parent = node;
    node.diamond = diamond;
    node.appendChild(diamond);        

    this.placeDiamond(id);
}

SVGGraph.prototype.getMainSVG = function() {
    return this.svg;
}

SVGGraph.prototype.resize = function(width, height) {
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);   

    this.canvas.setAttribute("width", width);
    this.canvas.setAttribute("height", height);   
}

SVGGraph.prototype.setCanvasRightClickHandler = function(handler) {
    this.canvas.removeEventListener("contextmenu", this.canvasRightClickHandler, false);
    this.canvasRightClickHandler = handler;
    this.canvas.addEventListener("contextmenu", this.canvasRightClickHandler, false);
}

SVGGraph.prototype.setNodeRightClickHandler = function(handler) {
    for (var n in this.nodes) {
        if (this.nodes.hasOwnProperty(n)) {
            this.nodes[n].removeEventListener("contextmenu", this.nodeRightClickHandler, false);
            this.nodes[n].addEventListener("contextmenu", handler, false);    
        }        
    }

    this.nodeRightClickHandler = handler;
}

SVGGraph.prototype.removeNode = function(id) {
    var node = this.svg.getElementById(id);

    this.graphSvg.removeChild(node);
    delete this.nodes[id];
    
    // Remove associated connections
    var toRemove = [];

    for (var c = 0 ; c < this.connections.length ; c++) {
        if ((this.connections[c].fromId === id) || (this.connections[c].toId === id)) {
            toRemove.push(this.connections[c]);
        }
    }    

    for (var r = 0 ; r < toRemove.length ; r++) {
        this.connections.splice(this.connections.indexOf(toRemove[r]), 1);
        this.graphSvg.removeChild(toRemove[r]);
    }
}

SVGGraph.prototype.editNode = function(id, shapeSVG, textSVG) {
    var node = this.svg.getElementById(id);
    
    // Remove the shape and text SVGs
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }

    node.appendChild(shapeSVG);
    node.appendChild(textSVG);
    node.shape = shapeSVG;

    // Redraw connections as size of node may have changed
    for (var c = 0 ; c < this.connections.length ; c++) {
        drawLine(this, this.connections[c]);    
    }
}

SVGGraph.prototype.addNode = function(id, x, y, shapeSVG, textSVG) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "_graphLibNode");
    g.setAttribute("id", id);
    g.setAttribute("transform", "translate(" + x + "," + y + ")");
    g.hidden = false;

    // Reference to this SVGGraph object so I can pass to event handler
    var me = this;
    g.addEventListener("mousedown", function(e) {startDrag(e, me)}, true);
    g.addEventListener("contextmenu", this.nodeRightClickHandler, false);

    g.shape = shapeSVG;

    g.appendChild(shapeSVG);
    g.appendChild(textSVG);

    this.graphSvg.appendChild(g);
    this.nodes[id] = g;
}

SVGGraph.prototype.addRectangle = function(id, x, y, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGRectangle(size[0], size[1], this.offset);
    shape.type = "rectangle";

    this.addNode(id, x, y, shape, text);
}

SVGGraph.prototype.editRectangle = function(id, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGRectangle(size[0], size[1], this.offset);

    this.editNode(id, shape, text);
}

SVGGraph.prototype.addRoundRectangle = function(id, x, y, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGRoundRectangle(size[0], size[1], this.roundRectangleEdgeRadius, this.offset);
    shape.type = "roundrectangle";

    this.addNode(id, x, y, shape, text);
}

SVGGraph.prototype.editRoundRectangle = function(id, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGRoundRectangle(size[0], size[1], this.roundRectangleEdgeRadius, this.offset);

    this.editNode(id, shape, text);
}

SVGGraph.prototype.addParallelogram = function(id, x, y, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGParallelogram(size[0], size[1], this.parallelogramSkew, this.offset);
    shape.type = "parallelogram";

    this.addNode(id, x, y, shape, text);
}

SVGGraph.prototype.editParallelogram = function(id, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGParallelogram(size[0], size[1], this.parallelogramSkew, this.offset);
    shape.type = "parallelogram";

    this.editNode(id, shape, text);
}

SVGGraph.prototype.addCircle = function(id, x, y, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGCircle(size[0], size[1], this.offset);
    shape.type = "circle";

    this.addNode(id, x, y, shape, text);
}

SVGGraph.prototype.editCircle = function(id, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGCircle(size[0], size[1], this.offset);

    this.editNode(id, shape, text);
}

SVGGraph.prototype.addEllipse = function(id, x, y, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGEllipse(size[0], size[1], this.offset);
    shape.type = "ellipse";

    this.addNode(id, x, y, shape, text);
}

SVGGraph.prototype.editEllipse = function(id, htmlDiv) {
    var size = getDivSize(htmlDiv);
    var text = createSVGText(size[0], size[1], this.offset, htmlDiv);
    var shape = createSVGEllipse(size[0], size[1], this.offset);

    this.editNode(id, shape, text);
}

SVGGraph.prototype.removeConnection = function(fromId, toId) {
    var index = -1;

    for (var c = 0 ; c < this.connections.length ; c++) {
        if ((this.connections[c].fromId === fromId) && (this.connections[c].toId === toId)) {
            this.graphSvg.removeChild(this.connections[c]);
            index = c;
            break;
        }
    }     

    this.connections.splice(index, 1);
}

SVGGraph.prototype.addConnection = function(fromId, toId, vertical) {
    var fromG = this.nodes[fromId];
    var toG = this.nodes[toId];

    if (!fromG) {
        console.log("No node with id " + fromId + ", no connection created");   
        return;
    }

    if (!toG) {
        console.log("No node with id " + toId + ", no connection created");   
        return;
    }

    var line = document.createElementNS("http://www.w3.org/2000/svg", "path");  
    line.setAttribute("class", "line");  
    
    var lineEnd = document.createElementNS("http://www.w3.org/2000/svg", "path");    
    lineEnd.setAttribute("class", "end");
    
    // FIXME: to css?
    line.setAttribute("style", "fill: none; stroke: black; stroke-width: 2;");

    if (vertical) {
        lineEnd.setAttribute("style", "fill: black; stroke: black; stroke-width: 2;");    
    }
    else {
        lineEnd.setAttribute("style", "fill: none; stroke: black; stroke-width: 2;");       
    }
    

    var lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    lineGroup.setAttribute("class", "_graphLibConnection");
    lineGroup.appendChild(line);
    lineGroup.appendChild(lineEnd);
    lineGroup.vertical = vertical;
    lineGroup.fromId = fromId;
    lineGroup.toId = toId;

    this.graphSvg.appendChild(lineGroup); 
    this.connections.push(lineGroup);
    
    drawLine(this, lineGroup);
}

function hideNodes(svgGraph, node) {
    var id = node.getAttribute("id");
    node.setAttribute("visibility", "hidden");  
    node.hidden = true;     

    for (var c = 0 ; c < svgGraph.connections.length ; c++) {
        if (id === svgGraph.connections[c].fromId) {
            svgGraph.connections[c].setAttribute("visibility", "hidden");  
            hideNodes(svgGraph, svgGraph.nodes[svgGraph.connections[c].toId]);        
        }                    
    }
}



function collapse(evt, svgGraph) {
    evt.preventDefault(); 
    evt.stopPropagation();

    var node = getParentG(evt.target);
    var id = node.getAttribute("id");
    svgGraph.collapseNode(id);

    node.removeEventListener("contextmenu", svgGraph.nodeRightClickHandler, false);
    node.addEventListener("contextmenu", svgGraph.nodeExpandHandler, false);
}


SVGGraph.prototype.collapseNode = function(id) {
    // Hide the immediate vertically connected children of the clicked node
    for (var c = 0 ; c < this.connections.length ; c++) {
        if ((id === this.connections[c].fromId) && this.connections[c].vertical) {
            this.connections[c].setAttribute("visibility", "hidden");  
            hideNodes(this, this.nodes[this.connections[c].toId]);        
        }                    
    }

    // Add a filled diamond to denote collapsed sub-tree   
    var node = this.nodes[id]; 
    var bbox = node.shape.getBBox();
    var diamond = createSVGDiamond(20, true);
    diamond.parent = node;
    node.diamond = diamond;
    node.appendChild(diamond);        
    this.placeDiamond(id);
}

SVGGraph.prototype.expandNode = function(id) {
    var node = this.nodes[id];

    for (var c = 0 ; c < this.connections.length ; c++) {        
        if ((id === this.connections[c].fromId) && this.connections[c].vertical) {
            this.connections[c].setAttribute("visibility", "visible");  
            unhideNodes(this, this.nodes[this.connections[c].toId]);        
        }                    
    }

    node.removeChild(node.diamond);
    delete node.diamond;
}

function unhideNodes(svgGraph, node) {
    var id = node.getAttribute("id");
    
    node.setAttribute("visibility", "visible");  
    node.hidden = false;     

    for (var c = 0 ; c < svgGraph.connections.length ; c++) {
        if (id === svgGraph.connections[c].fromId) {
            // Don't unhide hidden sub-trees
            // Vertical connections from nodes with diamonds shouldn't be unhidden
            if (!(node.diamond && svgGraph.connections[c].vertical)) {
                svgGraph.connections[c].setAttribute("visibility", "visible");  
                unhideNodes(svgGraph, svgGraph.nodes[svgGraph.connections[c].toId]);
            }
        }                    
    }    
}

function expand(evt, svgGraph) {
    evt.preventDefault(); 
    evt.stopPropagation();

    var node = getParentG(evt.target);
    var id = node.getAttribute("id");

    svgGraph.expandNode(id);

    node.removeEventListener("contextmenu", svgGraph.nodeExpandHandler, false);
    node.addEventListener("contextmenu", svgGraph.nodeRightClickHandler, false);
}

function addDragObject(svgGraph, cliX, cliY, target, moveMe) {
    var dragObject = new Object();
    dragObject.group = target;
    dragObject.moveMe = moveMe;

    var transform = getTransformCoords(target.getAttribute("transform"))
    dragObject.offsetX = (cliX / svgGraph.zoomLevel) - transform[0];
    dragObject.offsetY = (cliY / svgGraph.zoomLevel) - transform[1];  
    
    svgGraph.dragNodes.push(dragObject);
}

function addDragHandlers(svgGraph) {
    // Reference to the event handlers so I can remove them later
    svgGraph.moveNodeFunction = function(e) {move(e, svgGraph)};
    svgGraph.endMoveNodeFunction = function(e) {endMove(e, svgGraph)};

    // Add move and endMove listeners to the dragged node
    for (var n = 0 ; n < svgGraph.dragNodes.length ; n++) {
        svgGraph.dragNodes[n].group.addEventListener("mouseup", svgGraph.endMoveNodeFunction, false);
        svgGraph.dragNodes[n].group.addEventListener("mousemove", svgGraph.moveNodeFunction, false);        
    }
    
    // Add to canvas in case the mouse escapes the shape during move
    svgGraph.canvas.addEventListener("mouseup", svgGraph.endMoveNodeFunction, false);
    svgGraph.canvas.addEventListener("mousemove", svgGraph.moveNodeFunction, false);

    // If we go outside of the canvas, end the dragging
    window.addEventListener("mouseup", svgGraph.endMoveNodeFunction, false);
    window.addEventListener("mousemove", svgGraph.endMoveNodeFunction, false);
}

// Move nodes 
function startDrag(evt, svgGraph) {
    // Only proceed if not right mouse button pressed
    if (evt.button == 2) {        
        return;
    }

    evt.preventDefault(); 
    evt.stopPropagation();

    var nodeGroup = getParentG(evt.target);
    addDragObject(svgGraph, evt.clientX, evt.clientY, nodeGroup, true);
   
    for (var n in svgGraph.nodes) {
        if (svgGraph.nodes.hasOwnProperty(n) && !(svgGraph.nodes[n] === nodeGroup)) {
            addDragObject(svgGraph, evt.clientX, evt.clientY, svgGraph.nodes[n], false);
        }
    }

    addDragHandlers(svgGraph);

    // Bring the group to the foreground    
    svgGraph.graphSvg.appendChild(nodeGroup);
}

function startDragCanvas(evt, svgGraph) {
    if (evt.button == 2) {        
        return;
    }
        
    evt.preventDefault(); 
    evt.stopPropagation();
    
    for (var n in svgGraph.nodes) {
        if (svgGraph.nodes.hasOwnProperty(n)) {
            addDragObject(svgGraph, evt.clientX, evt.clientY, svgGraph.nodes[n], true);
        }
    }  

    addDragHandlers(svgGraph);
}


function move(evt, svgGraph) {
    evt.preventDefault(); 
    evt.stopPropagation();

    var cliX = evt.clientX / svgGraph.zoomLevel;
    var cliY = evt.clientY / svgGraph.zoomLevel; 
    var moveX;
    var moveY;
    
    // Move the nodes
    for (var n = 0 ; n < svgGraph.dragNodes.length ; n++) {     
        if (svgGraph.dragNodes[n].moveMe) {
            moveX = cliX - svgGraph.dragNodes[n].offsetX;
            moveY = cliY - svgGraph.dragNodes[n].offsetY;
            // console.log(moveX + ', ' + moveY);
            svgGraph.dragNodes[n].group.setAttribute("transform", "translate(" + moveX + "," + moveY + ")"); 
        }           
    }

    // Re-draw the connections
    for (var c = 0 ; c < svgGraph.connections.length ; c++) {
        drawLine(svgGraph, svgGraph.connections[c]);    
    }

    // Re-draw diamonds
    for (var n in svgGraph.nodes) {
        if (svgGraph.nodes.hasOwnProperty(n)) {
            svgGraph.placeDiamond(n);   
        }
    }
}

function endMove(evt, svgGraph) {
    evt.preventDefault(); 
    evt.stopPropagation();

    for (var n = 0 ; n < svgGraph.dragNodes.length ; n++) {
        svgGraph.dragNodes[n].group.removeEventListener("mouseup", svgGraph.endMoveNodeFunction, false);
        svgGraph.dragNodes[n].group.removeEventListener("mousemove", svgGraph.moveNodeFunction, false);            
    }

    svgGraph.canvas.removeEventListener("mouseup", svgGraph.endMoveNodeFunction, false);
    svgGraph.canvas.removeEventListener("mousemove", svgGraph.moveNodeFunction, false);   
    window.removeEventListener("mouseup", svgGraph.endMoveNodeFunction, false);    
    window.removeEventListener("mousemove", svgGraph.endMoveNodeFunction, false);    

    svgGraph.dragNodes = []; 
}


// ===== Lines ===== //

function setHorizontalLine(line, parentBBox, childBBox, skew) {
    
    var arrowheadOffset = 20;
    var parentToLeft = false;    
    var parentAbove = false;
    var overlapping = false;
    
    if (parentBBox.centreX <= childBBox.centreX) {        
        parentToLeft = true;

        if ((parentBBox.right + arrowheadOffset) > childBBox.left) {
            overlapping = true;            
        }        
    }
    else {
        if ((parentBBox.left - arrowheadOffset) < (childBBox.right)) {
            overlapping = true;            
        }
    }
     
    if (parentBBox.centreY <= childBBox.centreY) {
        parentAbove = true;
    }

    var parentConnectX, parentConnectY;
    var childConnectX, childConnectY;
    
    if (parentToLeft) {
        parentConnectX = parentBBox.right - skew;        

        if (overlapping) {
            childConnectX = childBBox.right;                  
        }
        else {
            childConnectX = childBBox.left;    
        }
        
        // FIXME TODO

        // if (c.parent.type == "strategy") {
        //     parentConnectX -= parallelogramSkew/2.0;
        // }
    }
    else {
        parentConnectX = parentBBox.left + skew;

        if (overlapping) {
            childConnectX = childBBox.left;
        }
        else {
            childConnectX = childBBox.right;    
        }
        
            // if (c.parent.type == "strategy") {
            //     parentConnectX += parallelogramSkew/2.0;
            // }
    }
        
    parentConnectY = parentBBox.centreY;
    childConnectY = childBBox.centreY;

    var halfX, halfY, midX, midY, endX, endY;
    
    halfY = Math.abs(childConnectY - parentConnectY) / 2.0;
    halfX = (Math.abs(childConnectX - parentConnectX) / 2.0) - (arrowheadOffset / 2.0);
        
    if (overlapping) {
        if (parentToLeft) {                
            endX = childConnectX + arrowheadOffset;
            midX = endX + (0.5 * childBBox.width);
        }
        else {                
            endX = childConnectX - arrowheadOffset;
            midX = endX - (0.5 * childBBox.width);
        }
    }
    else {
        if (parentToLeft) {
            midX = parentConnectX + halfX;
            endX = childConnectX - arrowheadOffset;
        }
        else {
            midX = parentConnectX - halfX;
            endX = childConnectX + arrowheadOffset;                
        }            
    }
    
    endY = childConnectY;        

    if (parentAbove) {
        midY = parentConnectY + halfY;
    }
    else {
        midY = parentConnectY - halfY;        
    }        
    
    var d = "M " + parentConnectX + " " + parentConnectY + 
        " Q " + midX + " " + parentConnectY + 
        ", " + midX + " " + midY +            
        " T " + endX + " " + endY; 
    
    for (var c = 0 ; c < line.childNodes.length ; c++) {
        if (line.childNodes[c].getAttribute("class") === "line") {
            line.childNodes[c].setAttribute("d", d);
        }
    }



    var endArrowX;

    if (parentToLeft) {
        if (overlapping) {
            endArrowX = endX - 18;    
        }
        else {
            endArrowX = endX + 18;    
        }        
    }
    else {
        if (overlapping) {
            endArrowX = endX + 18;    
        }
        else {
            endArrowX = endX - 18;    
        }        
    }

    var d2 = "M " + (endX+1) + " " + (endY-7) + 
             " L " + endArrowX + " " + endY + 
             " L " + (endX+1) + " " + (endY+7) + " Z";


    for (var c = 0 ; c < line.childNodes.length ; c++) {
        if (line.childNodes[c].getAttribute("class") === "end") {
            line.childNodes[c].setAttribute("d", d2);    
        }
    }
}

function setVerticalLine(line, parentBBox, childBBox) {
    var arrowheadOffset = 20;
    var parentToLeft = false;    
    var parentAbove = false;
    var overlapping = false;
    
    if (parentBBox.centreX <= childBBox.centreX) {        
        parentToLeft = true;
    }
     
    if (parentBBox.centreY <= childBBox.centreY) {
        parentAbove = true;

        if ((parentBBox.bottom + arrowheadOffset) > childBBox.top) {
            overlapping = true;            
        }   
    }
    else {
        if ((parentBBox.top - arrowheadOffset) < (childBBox.bottom)) {
            overlapping = true;            
        }
    }

    var parentConnectX, parentConnectY;
    var childConnectX, childConnectY;
    
    if (parentAbove) {
        parentConnectY = parentBBox.bottom;

        if (overlapping) {
            childConnectY = childBBox.bottom;                  
        }
        else {
            childConnectY = childBBox.top;    
        }
    }
    else {
        parentConnectY = parentBBox.top;

        if (overlapping) {
            childConnectY = childBBox.top;
        }
        else {
            childConnectY = childBBox.bottom;    
        }        
    }
        
    parentConnectX = parentBBox.centreX;
    childConnectX = childBBox.centreX;

    var halfX, halfY, midX, midY, endX, endY;
    

    halfY = (Math.abs(childConnectY - parentConnectY) / 2.0) - (arrowheadOffset / 2.0);
    halfX = Math.abs(childConnectX - parentConnectX) / 2.0;        
        
    if (overlapping) {
        if (parentAbove) {                
            endY = childConnectY + arrowheadOffset;
            midY = endY + (0.5 * childBBox.height);
        }
        else {                
            endY = childConnectY - arrowheadOffset;
            midY = endY - (0.5 * childBBox.height);
        }
    }
    else {
        if (parentAbove) {
            midY = parentConnectY + halfY;
            endY = childConnectY - arrowheadOffset;
        }
        else {
            midY = parentConnectY - halfY;
            endY = childConnectY + arrowheadOffset;                
        }            
    }
    
    endX = childConnectX;        

    if (parentToLeft) {
        midX = parentConnectX + halfX;
    }
    else {
        midX = parentConnectX - halfX;        
    }    

    var d = "M " + parentConnectX + " " + parentConnectY + 
        " Q " + parentConnectX + " " + midY + 
        ", " + midX + " " + midY +            
        " T " + endX + " " + endY;


    for (var c = 0 ; c < line.childNodes.length ; c++) {
        if (line.childNodes[c].getAttribute("class") === "line") {
            line.childNodes[c].setAttribute("d", d);
        }
    }

    var endArrowY;

    if (parentAbove) {
        if (overlapping) {
            endArrowY = endY - 18;    
        }
        else {
            endArrowY = endY + 18;    
        }        
    }
    else {
        if (overlapping) {
            endArrowY = endY + 18;    
        }
        else {
            endArrowY = endY - 18;    
        }        
    }

    var d2 = "M " + (endX-7) + " " + (endY+1) + 
             " L " + endX + " " + endArrowY + 
             " L " + (endX+7) + " " + (endY+1) + " Z";

    for (var c = 0 ; c < line.childNodes.length ; c++) {
        if (line.childNodes[c].getAttribute("class") === "end") {
            line.childNodes[c].setAttribute("d", d2);    
        }
    }

    
}

function drawLine(svgGraph, lineGroup) {
    var fromNode = svgGraph.nodes[lineGroup.fromId];
    var toNode = svgGraph.nodes[lineGroup.toId];

    // Get the bounding box of nodes on the ends of the line
    var parentBBox = getActualCoords(fromNode);
    var childBBox = getActualCoords(toNode);

    if (lineGroup.vertical) {
        setVerticalLine(lineGroup, parentBBox, childBBox);    
    }
    else {
        if (fromNode.shape.type === "parallelogram") {
            var skew = svgGraph.parallelogramSkew / 2.0;
            setHorizontalLine(lineGroup, parentBBox, childBBox, skew);        
        }
        else {
            setHorizontalLine(lineGroup, parentBBox, childBBox, 0.0);    
        }
    }
    
}

// ====== HELPER FUNCTIONS ======= //

function getParentG(element) {
    if (!element.parentNode) {
        return null;
    }

    if (element.parentNode.tagName.toLowerCase() == "g") {
        return element.parentNode;
    }
    else {
        return getParentG(element.parentNode);
    }
}


function getTransformCoords(transform) {    
    // Assume there is only a single translate in the transform.
    // Split on the comma, then x is the string after the '(' in the first substring
    // and y is the string before the ')' in the second substring     
    var bits = transform.split(",");
    var tranX = parseInt(bits[0].split("(")[1]);
    var tranY = parseInt(bits[1].split(")")[0]);
    return [tranX, tranY];
}

function getActualCoords(group) {
    var bbox = group.shape.getBBox();
    var transform = getTransformCoords(group.getAttribute("transform"));

    var coords = new Object();
    coords.left = bbox.x + transform[0];
    coords.top = bbox.y + transform[1];
    coords.height = bbox.height;
    coords.width = bbox.width; 
    coords.right = coords.left + coords.width;
    coords.bottom = coords.top + coords.height;
    coords.centreX = coords.left + (coords.width/2.0);
    coords.centreY = coords.top + (coords.height/2.0);

    return coords;
}

function getDivSize(htmlDiv) {
    // Add the div to the document so I can get it's size, then remove
    htmlDiv.setAttribute("style", "display: inline-block;");
    document.body.appendChild(htmlDiv);
    // Firefox doesn't render properly without an extra pixel
    var width = htmlDiv.clientWidth+1;
    var height = htmlDiv.clientHeight;
    document.body.removeChild(htmlDiv);

    return [width, height];
}

function createSVGText(width, height, offset, htmlDiv) {
    var text = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    text.setAttribute("width", width);
    text.setAttribute("height", height);
    text.setAttribute("transform", "translate(" + offset + "," + offset + ")");
    text.appendChild(htmlDiv);
    return text;
}

function createSVGRectangle(width, height, offset) {
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("width", width+(2*offset));
    r.setAttribute("height", height+(2*offset));    
    return r;
}

function createSVGParallelogram(width, height, skew, offset) {
    var p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    
    var x = 0;
    var y = 0;
    var widthNew = parseInt(width+(2*offset))+skew;
    var heightNew = parseInt(height+(2*offset));    

    var points = x + "," + y + " " + (x+widthNew) + "," + y;
    points += " " + (x+widthNew-skew) + "," + (y+heightNew);
    points += " " + (x-skew) + "," + (y+heightNew);        
    p.setAttribute("points", points);
    
    return p;
}

function createSVGEllipse(width, height, offset) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    
    // Calculate the radius of a circle containg the rectangle
    // Work out the x and y radius based on the ratio between the height and width
    // of the rectangle  
    var radOffset = offset/5.0;  
    var radius = Math.sqrt(Math.pow(((0.5 * width) + radOffset),2) 
                + Math.pow(((0.5 * height) + radOffset),2));
    var xRatio = width / (width+height);
    var yRatio = height / (width+height);
    var xRadius = 2 * radius * xRatio;
    var yRadius = 2 * radius * yRatio;
    
    e.setAttribute("cx", (width*0.5)+offset);
    e.setAttribute("cy", (height*0.5)+offset);
    e.setAttribute("rx", xRadius);
    e.setAttribute("ry", yRadius);
        
    return e;    
}

function createSVGRoundRectangle(width, height, edgeRadius, offset) {
    var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", (-1.0*offset));
    r.setAttribute("rx", edgeRadius);
    r.setAttribute("ry", height);
    r.setAttribute("width", width+(4*offset));
    r.setAttribute("height", height+(2*offset));        
    return r;
}

function createSVGCircle(width, height, offset) {    
    var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    
    var radOffset = offset/2.0;  
    var radius = Math.sqrt(Math.pow(((0.5 * width) + radOffset),2) 
                + Math.pow(((0.5 * height) + radOffset),2));    
    
    c.setAttribute("cx", (width*0.5)+offset);
    c.setAttribute("cy", (height*0.5)+offset);
    c.setAttribute("r", radius);
    
    return c;    
}

function createSVGDiamond(size, filled) {
    var p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    
    var x = 0;
    var y = 0;
    var half = size / 2.0;

    var points = x + "," + y + " " + (x-half) + "," + (y+half);
    points += " " + x + "," + (size);
    points += " " + (x+half) + "," + (y+half);        
    p.setAttribute("points", points);

    if (filled) {
        p.setAttribute("class", "_graphLibFilled");    
    }
    
    return p;    
}

function createSVGLetter(letter, fontSize) {
    var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("style", "font-size:" + fontSize + "px; fill: black");
    txt.appendChild(document.createTextNode(letter));

    return txt;
}
