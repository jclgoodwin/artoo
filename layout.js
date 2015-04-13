var layout = {};

layout.layoutStrategies = {};

layout.layoutStrategies.dagre = function (graph) {
    "use strict";

    // create a new directed graph 
    var g = new dagre.graphlib.Graph();

    // declare useful variables
    var i,
        bbox;

    g.setGraph({});
    g.setDefaultEdgeLabel(function () { return {}; });

    // Add nodes to the graph.
    for (i = 0; i < graph.ids.length; i += 1) {
        if (graph.graph.nodes[i]) {
            bbox = graph.graph.nodes[i].getBBox();
            g.setNode(graph.ids[i], { width: bbox.width, height: bbox.height });
        }
    }

    // make edges
    for (i = 0; i < graph.graph.connections.length; i += 1) {
        g.setEdge(graph.graph.connections[i].fromId, graph.graph.connections[i].toId);
    }

    dagre.layout(g);

    g.nodes().forEach(function (v) {
        var node = g.node(v);
        if (typeof node !== "undefined") {
            window.graph.graph.nodes[v].setAttribute("transform", "translate(" + parseInt(node.x) + ", " + parseInt(node.y) + ")");
        }
    });

    for (i = 0; i < graph.graph.connections.length; i++) {
        drawLine(graph.graph, graph.graph.connections[i]);
    }

    // Re-draw diamonds
    for (i in graph.graph.nodes) {
        if (graph.graph.nodes.hasOwnProperty(i)) {
            graph.graph.placeDiamond(i);
        }
    }

    graph.graph.centreGraph();
};

layout.layoutStrategies.dagreNovel1 = function (graph) {
    "use strict";

    function getParent(id) {
        for (var i = 0; i < graph.connections.length; i += 1) {
            if (graph.connections[i].toId === id) {
                return graph.connections[i].fromId;
            }
        }
        return null; // node has no parent (is the top-level one)
    }

    function setHorizontalEdge(g, fromId, toId) {
        var parent = getParent(fromId);
        if (parent === null) {
            // create a dummy parent node
            parent = "-" + fromId;
            g.setNode(parent);
            g.setEdge(parent, graph.graph.connections[i].fromId);
        }
        g.setEdge(parent, graph.graph.connections[i].toId);
    }

    // create a new directed graph 
    var g = new dagre.graphlib.Graph();

    // declare useful variables
    var i,
        bbox;

    // Set an object for the graph label
    g.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () { return {}; });

    // Add nodes to the graph.
    for (i = 0; i < graph.ids.length; i += 1) {
        if (graph.graph.nodes[i]) {
            bbox = graph.graph.nodes[i].getBBox();
            g.setNode(graph.ids[i], { width: bbox.width, height: bbox.height });
        } else {
            console.log(not);
        }
    }

    // make edges
    for (i = 0; i < graph.graph.connections.length; i += 1) {
        if (graph.graph.connections[i].vertical) {
            g.setEdge(graph.graph.connections[i].fromId, graph.graph.connections[i].toId);
        } else { // special case for InContextOf connections
            setHorizontalEdge(g, graph.graph.connections[i].fromId, graph.graph.connections[i].toId);
        }
    }

    dagre.layout(g);

    g.nodes().forEach(function (v) {
        var node = g.node(v);
        if (typeof node !== "undefined" && typeof window.graph.graph.nodes[v] !== "undefined") {
            // if (!isDummyNode(v)) {
                window.graph.graph.nodes[v].setAttribute("transform", "translate(" + parseInt(node.x) + ", " + parseInt(node.y) + ")");
            // }
        } else {
            console.log(v + " was undefined");
        }
    });

    for (i = 0; i < graph.graph.connections.length; i++) {
        drawLine(graph.graph, graph.graph.connections[i]);
    }

    // Re-draw diamonds
    for (i in graph.graph.nodes) {
        if (graph.graph.nodes.hasOwnProperty(i)) {
            graph.graph.placeDiamond(i);
        }
    }

    graph.graph.centreGraph();
};

layout.layoutStrategies.dagreNovel2 = function (graph) {
    "use strict";

    function getParent(id) {
        for (var i = 0; i < graph.connections.length; i += 1) {
            if (graph.connections[i].toId === id) {
                return graph.connections[i].fromId;
            }
        }
        return null; // node has no parent (is the top-level one)
    }

    function setHorizontalEdge(g, fromId, toId) {
        // create a dummy parent node
        parent = "-" + fromId;
        g.setNode(parent);
        g.setEdge(parent, graph.graph.connections[i].fromId);
        g.setEdge(parent, graph.graph.connections[i].toId);
    }

    // create a new directed graph 
    var g = new dagre.graphlib.Graph();

    // declare useful variables
    var i,
        bbox;

    // Set an object for the graph label
    g.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () { return {}; });

    // Add nodes to the graph.
    for (i = 0; i < graph.ids.length; i += 1) {
        if (graph.graph.nodes[i]) {
            bbox = graph.graph.nodes[i].getBBox();
            g.setNode(graph.ids[i], { width: bbox.width, height: bbox.height });
        } else {
            console.log(not);
        }
    }

    // make edges
    for (i = 0; i < graph.graph.connections.length; i += 1) {
        if (graph.graph.connections[i].vertical) {
            g.setEdge(graph.graph.connections[i].fromId, graph.graph.connections[i].toId);
        } else { // special case for InContextOf connections
            setHorizontalEdge(g, graph.graph.connections[i].fromId, graph.graph.connections[i].toId);
        }
    }

    dagre.layout(g);

    g.nodes().forEach(function (v) {
        var node = g.node(v);
        if (typeof node !== "undefined" && typeof window.graph.graph.nodes[v] !== "undefined") {
            // if (!isDummyNode(v)) {
                window.graph.graph.nodes[v].setAttribute("transform", "translate(" + parseInt(node.x) + ", " + parseInt(node.y) + ")");
            // }
        } else {
            console.log(v + " was undefined");
        }
    });

    for (i = 0; i < graph.graph.connections.length; i++) {
        drawLine(graph.graph, graph.graph.connections[i]);
    }

    // Re-draw diamonds
    for (i in graph.graph.nodes) {
        if (graph.graph.nodes.hasOwnProperty(i)) {
            graph.graph.placeDiamond(i);
        }
    }

    graph.graph.centreGraph();
}

layout.layoutStrategies.arbor = function (graph) {
    'use strict';

    var system = arbor.ParticleSystem(),
        i;

    system.renderer = {
        init: function(system) {
            return null;
        },
        redraw: function() {
            system.eachNode(function(node, p) {
                // console.log(node);
                // console.log(pt);
                if (graph.graph.nodes[node.name] === undefined) {
                    return false;
                }
                graph.graph.nodes[node.name].setAttribute("transform", "translate(" + parseInt(p.x * 70) + ", " + parseInt(p.y * 45) + ")");

                for (var c = 0; c < graph.graph.connections.length; c++) {
                    drawLine(graph.graph, graph.graph.connections[c]);
                }

                // Re-draw diamonds
                for (var n in graph.graph.nodes) {
                    if (graph.graph.nodes.hasOwnProperty(n)) {
                        graph.graph.placeDiamond(n);
                    }
                }

                graph.graph.centreGraph();
            });
        },   
    };

    // make nodes
    for (i = 0; i < graph.ids.length; i += 1) {
        system.addNode(graph.ids[i]);
    }

    // make edges
    for (i = 0; i < graph.connections.length; i += 1) {
        system.addEdge(graph.connections[i].fromId, graph.connections[i].toId);
    }

}

layout.layoutStrategies.springy = function (graph) {
    'use strict';

    var springyGraph = new Springy.Graph(),
        springyNodes = {},
        i;

    // make nodes
    for (i = 0; i < graph.ids.length; i += 1) {
        springyNodes[graph.ids[i]] = springyGraph.newNode({svgId: graph.ids[i]});
    }

    // make edges
    for (i = 0; i < graph.connections.length; i += 1) {
        springyGraph.newEdge(springyNodes[graph.connections[i].fromId], springyNodes[graph.connections[i].toId]);
    }

    var springyLayout = new Springy.Layout.ForceDirected(
        springyGraph,
        200.0, // Spring stiffness
        1600.0, // Node repulsion
        .5 // Damping
    );

    var springyRenderer = new Springy.Renderer(
        springyLayout,
        function clear() {
            // code to clear screen
        },
        function drawEdge(edge, p1, p2) {
            for (var c = 0; c < graph.graph.connections.length; c++) {
                drawLine(graph.graph, graph.graph.connections[c]);
            }
            // Re-draw diamonds
            for (var n in graph.graph.nodes) {
                if (graph.graph.nodes.hasOwnProperty(n)) {
                    graph.graph.placeDiamond(n);
                }
            }
            graph.graph.centreGraph();
        },
        function drawNode(node, p) {
            if (graph.graph.nodes[node.data.svgId] === undefined) {
                return false;
            }
            graph.graph.nodes[node.data.svgId].setAttribute("transform", "translate(" + parseInt(p.x * 70) + ", " + parseInt(p.y * 45) + ")");
        }
    );

    springyRenderer.start();
}

$(document).ready(function () {

    // useful "load example" menu
    $("#applicationMenu").append("<li class=menuLi id=loadExampleMenuMain>Load example...</li>");
    $("#loadExampleMenuMain").append("<ul class=ulMenu id=loadExampleMenu></ul>");
    for (var i = 1; i <= 4; i += 1) {
        $("#loadExampleMenu").append("<li>" + i + "-kieran-thesis.xml</li>");
    }
    $("#loadExampleMenu li").click(function() {
        graph.clear();

        $.ajax({
            type: "GET",
            url: "examples/" + $(this).text(),
            dataType: "xml",
            success: function(xml) {
                processXMLFile(xml);
            }
        });
    });

    // automatic layout menu

    $("#applicationMenu").append("<li class=menuLi id=layOutMenuMain>Lay out...</li>");
    $("#layOutMenuMain").append("<ul class=ulMenu id=layOutMenu></ul>");
    $("#layOutMenu").append("<li class=menuLi>springy</li>");
    $("#layOutMenu").append("<li class=menuLi>dagre</li>");
    $("#layOutMenu").append("<li class=menuLi>dagreNovel1</li>");
    $("#layOutMenu").append("<li class=menuLi>dagreNovel2</li>");

    $("#layOutMenu li").click(function () {
        layout.layoutStrategies[this.textContent].call(this, graph);
    });

});
