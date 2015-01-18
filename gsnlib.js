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


function GSNGraph(width, height) {
	this.graph = new SVGGraph(width, height);
	this.defaultX = 100;
	this.defaultY = 100;

	this.nodes = new Object();
	this.connections = new Array();

	this.ids = new Array();
	this.nextId = -1;

	this.graph.setCanvasRightClickHandler(showCanvasMenu);
}

GSNGraph.prototype.setNodeRightClickHandler = function(action) {
	this.graph.setNodeRightClickHandler(action);
}

GSNGraph.prototype.collapseNode = function(id) {
	if (this.nodes[id].collapsed) {
		this.nodes[id].collapsed = false;
		this.graph.expandNode(id);	
	}
	else {
		this.nodes[id].collapsed = true;
		this.graph.collapseNode(id);	
	}
	
}

GSNGraph.prototype.markNodeUndeveloped = function(id) {
	if (!this.nodes[id].undeveloped) {
		this.nodes[id].undeveloped = true;
		this.graph.addDiamondToShape(id);
	}
}

GSNGraph.prototype.clear = function() {
	this.nodes = new Object();
	this.connections = new Array();
	this.graph.clear();
	this.ids = new Array();
	this.nextId = -1;
}

GSNGraph.prototype.getXMLString = function() {
	var argStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<argument>\n";
    var xmlIndent = "  ";

    for (var n in this.nodes) {
    	var node = this.nodes[n];
    	var coords = this.graph.getNodeCoords(n);
		var nodeStr = xmlIndent + "<node id=\"" + n + "\" nodetype=\"" + 
        	node.type + "\" x=\"" + coords[0] + "\" y=\"" + coords[1] + "\" collapsed=\"" + 
        	node.collapsed.toString() + "\" undeveloped=\"" + node.undeveloped.toString() + "\">\n";

    	nodeStr += xmlIndent + xmlIndent + "<name>" + node.title + "</name>\n";
    	nodeStr += xmlIndent + xmlIndent + "<description><![CDATA[";
    	// Remove any linebreaks from text saved to file
    	nodeStr += node.text.replace(/(\r\n|\n|\r)/gm,"") + "]]></description>\n";
    	argStr += nodeStr + xmlIndent + "</node>\n";
    }
    
    for (var c = 0 ; c < this.connections.length ; c++) {
    	var conn = this.connections[c];
    	argStr += xmlIndent + "<connection parentid=\"" + conn.fromId 
    			  + "\" childid=\"" + conn.toId+ "\"/>\n";
    }
    
    return argStr + "</argument>\n"; 
}


GSNGraph.prototype.zoomToFit = function() {
	this.graph.zoomToFit();
}

function showCanvasMenu(evt) {
	console.log("Canvas clicked");
}

GSNGraph.prototype.getSVGForExport = function() {
	return this.graph.getSVGForExport();
}

GSNGraph.prototype.zoomIn = function() {
	this.graph.zoomIn();
}

GSNGraph.prototype.zoomOut = function() {
	this.graph.zoomOut();
}

GSNGraph.prototype.centreGraph = function() {
	this.graph.centreGraph();
}

GSNGraph.prototype.getMainSVG = function() {
	return this.graph.svg;
}

GSNGraph.prototype.resize = function(width, height) {
	this.graph.resize(width, height);
}

GSNGraph.prototype.getNodes = function() {
	return this.nodes;
}

GSNGraph.prototype.getNode = function(id) {
	return this.nodes[id];
}

GSNGraph.prototype.getConnections = function() {
	return this.connections;
}

GSNGraph.prototype.removeConnection = function(fromId, toId) {
	this.graph.removeConnection(fromId, toId);

	var index = -1;

	for (var c = 0; this.connections.length ; c++) {		
		if ((this.connections[c].fromId === fromId) && (this.connections[c].toId === toId)) {
			index = c;
			break;
		}
	}

	this.connections.splice(index, 1);
}

GSNGraph.prototype.removeNode = function(id) {
	this.graph.removeNode(id);
	delete this.nodes[id];

	var toRemove = [];

    for (var c = 0 ; c < this.connections.length ; c++) {
        if ((this.connections[c].fromId === id) || (this.connections[c].toId === id)) {
            toRemove.push(this.connections[c]);
        }
    }    

    for (var r = 0 ; r < toRemove.length ; r++) {
        this.connections.splice(this.connections.indexOf(toRemove[r]), 1);        
    }
}

GSNGraph.prototype.editNode = function(id, title, text) {
	this.nodes[id].title = title;
	this.nodes[id].text = text;
	var htmlDiv = getDiv(title, text);

	switch (this.nodes[id].type) {
		case "goal":
			this.graph.editRectangle(id, htmlDiv);
			break;
		case "context":
			this.graph.editRoundRectangle(id, htmlDiv);
			break;
		case "strategy":
			this.graph.editParallelogram(id, htmlDiv);
			break;
		case "solution":
			this.graph.editCircle(id, htmlDiv);
			break;
		case "justification":
			this.graph.editEllipse(id, htmlDiv);
			this.graph.addLetterToShape(id, "J");
			break;
		case "assumption":
			this.graph.editEllipse(id, htmlDiv);
			this.graph.addLetterToShape(id, "A");
			break;
	}
	
}

GSNGraph.prototype.getNextId = function() {
	var nonUniqueId = true;

	while (nonUniqueId) {
		this.nextId += 1;
		nonUniqueId = false;

		for (var i = 0 ; i < this.ids.length ; i++) {
			if (this.nextId.toString() === this.ids[i]) {
				nonUniqueId = true;
				break;
			}
		}
	}

	return this.nextId.toString();
}

GSNGraph.prototype.setGoalUndeveloped = function(id) {
	if (this.nodes[id].type !== "goal") {
		console.log("gsnlib.setGoalUndeveloped: Error, node type is " + this.nodes[id].type + " not goal");
		return;
	}

	for (var c = 0 ; c < this.connections.length ; c++) {
		if (this.connections[c].fromId === id) {
			console.log("gsnlib.setGoalUndeveloped: Error, node has child connection/s");
			return;		
		}
	}

	this.graph.addDiamondToShape(id);
}

GSNGraph.prototype.addNode = function(id, type, title, text) {
	this.addNodeXY(id, type, title, text, this.defaultX, this.defaultY);
}

GSNGraph.prototype.addNodeXY = function(id, type, title, text, x, y) {
	var htmlDiv = getDiv(title, text);
	var id = id.toString();

	// Make sure the supplied id is unique
	for (var i = 0 ; i < this.ids.length ; i++) {
		if (this.ids[i] === id) {
			console.log("gsnlib.addNodeXY: Error, non-unique id " + id + ", node not created");
			return;
		}
	}
	
	var node = createNodeObject(type, title, text, false, false);
	this.nodes[id] = node;
	this.ids.push(id);

	switch (type) {
		case "goal":
			this.graph.addRectangle(id, x, y, htmlDiv);
			break;
		case "context":
			this.graph.addRoundRectangle(id, x, y, htmlDiv);
			break;
		case "strategy":
			this.graph.addParallelogram(id, x, y, htmlDiv);
			break;
		case "solution":
			this.graph.addCircle(id, x, y, htmlDiv);
			break;
		case "justification":
			this.graph.addEllipse(id, x, y, htmlDiv);
			this.graph.addLetterToShape(id, "J");
			break;
		case "assumption":
			this.graph.addEllipse(id, x, y, htmlDiv);
			this.graph.addLetterToShape(id, "A");
			break;
		default:
			console.log("gsnlib.addNodeXY: Error, node type " + type + " unknown");
	}
}

function createNodeObject(type, title, text, collapsed, undeveloped) {
	var node = new Object();
	node.type = type;
	node.title = title;
	node.text = text;
	node.collapsed = collapsed;
	node.undeveloped = undeveloped;

	return node;
}

function getDiv(title, text) {
	var div = document.createElement("div");
    $(div).append("<h3>" + title + "</h3>")
    	  .append(text)
    	  .attr("class", "_no_select");

  	return div;
}

function isInContext(type) {
	if ((type === "context") || (type === "assumption") || (type === "justification")) {
		return true;
	}

	return false;
} 

function isEndNode(type) {
	if ((type === "context") || (type === "assumption") 
		|| (type === "justification") || (type === "solution")) {
		return true;
	}

	return false;	
}

GSNGraph.prototype.addConnection = function(fromId, toId) {
	var fromType = this.nodes[fromId].type;
	var toType = this.nodes[toId].type;
	var created = false;

	if (isInContext(toType)) {
		if (!isInContext(fromType)) {
			created = true;
			this.graph.addConnection(fromId, toId, false);
		}
	} 
	else {
		if (!(isEndNode(fromType))) {
			created = true;
			this.graph.addConnection(fromId, toId, true);	
		}
	}

	if (created) {
		var connection = Object();
		connection.fromId = fromId;
		connection.toId = toId;
		this.connections.push(connection);	

		if (this.nodes[fromId].undeveloped && !isInContext(toType)) {
			this.nodes[fromId].undeveloped = false;
			this.graph.removeDiamondFromShape(fromId);
		}

		return [true, "Created connection from " + fromType + " node to " + toType + " node"];
	}
	else {
		return [false, "Cannot create connection from " + fromType + " node to " + toType + " node"];
	}
	
}

GSNGraph.prototype.hasVerticalChildren = function(id) {
	for (var c = 0 ; c < this.connections.length ; c++) {
		if (this.connections[c].fromId === id) {
			if (!isInContext(this.nodes[this.connections[c].toId].type)) {
				return true;
			}
		}
	}

	return false;
}

GSNGraph.prototype.addSolvedBy = function(fromId, toId) {
	this.graph.addConnection(fromId, toId, true);
	var connection = Object();
	connection.fromId = fromId;
	connection.toId = toId;
	this.connections.push(connection);
}

GSNGraph.prototype.addInContextOf = function(fromId, toId) {
	this.graph.addConnection(fromId, toId, false);
	var connection = Object();
	connection.fromId = fromId;
	connection.toId = toId;
	this.connections.push(connection);
}