var layout = [];

layout.doLayout = function(svgGraph) {

    // 

    var springyGraph = new Springy.Graph();
    var springyNodes = [];

    for (var node in svgGraph.nodes) {
        if (svgGraph.nodes.hasOwnProperty(node)) {
            // console.log(node);
            springyNodes[node.id] = springyGraph.newNode({svgId: node});
        }
    }
    for (var connection in svgGraph.nodes) {
        if (svgGraph.nodes.hasOwnProperty(node)) {
            springyGraph.newEdge(springyNodes[connection.fromid], springyNodes[connection.fromid]);
        }
    }

    // console.log(springyGraph);

    var springyLayout = new Springy.Layout.ForceDirected(
        springyGraph,
        400.0, // Spring stiffness
        200.0, // Node repulsion
        0.5 // Damping
    );

    var springyRenderer = new Springy.Renderer(
        springyLayout,
        function clear() {
            // code to clear screen
        },
        function drawEdge(edge, p1, p2) {
            // draw an edge
        },
        function drawNode(node, p) {
            // console.log(node);
            graph.graph.nodes[node.data.svgId].setAttribute("transform", "translate(" + p.x * 50 + ", " + p.y * 50 + ")");

            for (var c = 0; c < svgGraph.connections.length; c++) {
                drawLine(svgGraph, svgGraph.connections[c]);
            }
        
            // Re-draw diamonds
            for (var n in svgGraph.nodes) {
                if (svgGraph.nodes.hasOwnProperty(n)) {
                    svgGraph.placeDiamond(n);
                }
            }

            graph.graph.centreGraph();
        }
    );

    springyRenderer.start();

    // var bounds = svgGraph.canvas.getBBox();
    // console.log(bounds);

    // var x = 0,
    //     y = 0;

    // // Move the nodes
    // for (var node in svgGraph.nodes) {
    //     if (svgGraph.nodes.hasOwnProperty(node)) {
    //         svgGraph.nodes[node].setAttribute("transform", "translate(" + x + ", " + y + ")");
    //         y += svgGraph.nodes[node].getBBox().height + 20;
    //         x += svgGraph.nodes[node].getBBox().width + 20;
    //         // window.alert(svgGraph.nodes[node].width);
    //     }
    // }
}

$(document).ready(function () {

    // disable annoying (to me) "unsaved changes will be lost" dialog
    // $(window).off("onbeforeunload");

    var examples = [
        '1-kieran-thesis.xml',
        '2-kieran-thesis.xml',
        '3-kieran-thesis.xml',
        '4-kieran-thesis.xml',
        'example2.xml'
        ];

    for (var i = 0; i < examples.length; i += 1) {
        $("#applicationMenu").append("<li class=menuLi id=loadExample" + i + ">" + examples[i] + "</li>");
        $("#loadExample" + i).click(function() {
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
    }

    $("#applicationMenu").append("<li class=menuLi>Lay out</li>");

    $("#applicationMenu").click(function () {
        layout.doLayout(graph.graph);
    });
});
