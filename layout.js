var layout = [];

layout.doArborLayout = function (graph) {
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

layout.doLayout = function (graph) {
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

    // automatic layout button

    $("#applicationMenu").append("<li class=menuLi id=layOut>Lay out (springy.js)</li>");
    $("#applicationMenu").append("<li class=menuLi id=ArborLayOut>Lay out (arbor.js)</li>");

    $("#layOut").click(function () {
        layout.doLayout(graph);
    });
    $("#ArborLayOut").click(function () {
        layout.doArborLayout(graph);
    });
});
