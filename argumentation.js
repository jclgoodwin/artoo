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

var graph = null;
var visibleDialog = null;
var editNodeId = null;

var nodeMenuNodeId = null;

var compliantFirefoxVersion = 20.0;
var compliantChromeVersion = 23.0;

var spacer = "<p class=spacer>&nbsp;</p>";


// Initialise the user interface when HTML document is loaded and ready
$(function() {
    var browser = BrowserDetect.browser.toLowerCase();
    var version = BrowserDetect.version;

    if (browser === "chrome") {
        if (version < compliantChromeVersion) {
            $("body").append("<p>You are running version " + version + " of Chrome.")
                     .append("<p>Unfortunately only Chrome version " + compliantChromeVersion 
                            + " and above is supported by this tool.</p>")
                     .append("<p>Please use either Chrome version " + compliantChromeVersion 
                            + " or above, or Firefox version " + compliantFirefoxVersion + " or above.</p>");    
            return;
        }
    }
    else if (browser === "firefox") {
        if (version < compliantFirefoxVersion) {
            $("body").append("<p>You are running version " + version + " of Firefox.")
                     .append("<p>Unfortunately only Firefox version " + compliantFirefoxVersion 
                            + " and above is supported by this tool.</p>")
                     .append("<p>Please use either Chrome version " + compliantChromeVersion 
                            + " or above, or Firefox version " + compliantFirefoxVersion + " or above.</p>");    
            return;
        }
    }
    else {
        $("body").append("<p>Unfortunately " + BrowserDetect.browser + " is not supported by this tool.</p>")
                 .append("Please use either Chrome version " + compliantChromeVersion 
                        + " or above, or Firefox version " + compliantFirefoxVersion + " or above.");
        return;
    }

    // Force confirmation before navigate away
    window.onbeforeunload = function() {
        return "Warning: unsaved changes will be lost if you leave this page.";
    };

    // Disable default right mouse button behaviour so I can use it for menus
    window.oncontextmenu = function() { return false; }

    // Create a div to act as a dim screen background
    $("body").append("<div id=dimScreenDiv>&nbsp;</div>");

    // Main body div
    $("body").append("<div id=topDiv></div>");

    // Create a banner at the top
    $("#topDiv").append("<div id=bannerDiv></div>");
    $("#bannerDiv").append("<p id=pBanner>The <span id=sBanner>Artoo</span> Argumentation Tool</p>");
    
    // Create a div and unordered list to hold the application menus
    $("#topDiv").append("<div id=menuDiv></div>");
    $("#menuDiv").append("<ul id=applicationMenu></ul>")
                 
	// Create the File menu and forms to enable to load, save and export
	createFileMenu();

    // Create the Build menu and forms to build th argumentation structures
    createBuildMenu();

    // Create the View menu to zoom and centre the structure
    createViewMenu();

    // Create other menu items
    createOtherMenus();

    // Add the Graph
    graph = new GSNGraph(0, 0);
    graph.setNodeRightClickHandler(rightClick);
    $("body").append("<div id=svgDiv></div>");  
    $("#svgDiv").append(graph.getMainSVG());

    window.onresize = function(event) {     
        resizeGraph();
    }
});

$(window).load(resizeGraph);

function resizeGraph() {
    var newWidth = window.innerWidth-24;        
    var newHeight = window.innerHeight-21-$("#topDiv").height();
    graph.resize(newWidth, newHeight);

    var widthMinus = 18;
    $("#bannerDiv").css("width", window.innerWidth-widthMinus);
    $("#menuDiv").css("width", window.innerWidth-widthMinus);

    if (visibleDialog) {
        showDialog(visibleDialog);
    }
}

function createOtherMenus() {
    $("#applicationMenu").append("<li class=menuLi id=aboutInfo>About</li>");
    $("#applicationMenu").append("<li class=menuLi id=helpInfo>Help</li>");

    buildDialog("showAbout", "Done", function() {}, false);
    $("#showAboutTitle").text("About Artoo");
    $("#showAboutText").text("Background about the tool can be found in Alden et al 2013 (in submission).");
        
    $("#showAboutFormDiv").append("<p>Please refer to the help page for details on how to use the tool.</p>")
                          .append("This tool is distributed under the <a href=http://www.gnu.org/licenses/gpl.txt target=_blank>GNU GPL3</a> licence.")
                          .append("<p>For any further details contact: <a href=mailto:ims-group@york.ac.uk target=_blank>ims-group@york.ac.uk</a></p>");
                       

    $("#aboutInfo").on("click", function() {
        showDialog($("#showAboutDiv"));
    });    

    $("#helpInfo").on("click", function() {
        window.open("help.html");
    });
}

function createFileMenu() {
    // Add the command menu option to the application menu
    $("#applicationMenu").append("<li class=menuLi id=commandMenuMain>File...</li>");
    
    // Create the command popup menu    
    $("#commandMenuMain").append("<ul class=ulMenu id=commandMenu></ul>");                        
    $("#commandMenu").append("<li><a id=openFile>Open File...</a></li>")
                     .append("<li><a id=saveFile>Save File...</a></li>")
                     .append("<li><a id=exportPNG>Export as PNG...</a></li>");                   

    // Assign functions to open diaglogs when open, save and export are clicked                
    $("#openFile").click(function() {
        // Force a link click to get the system open dialog to open
        document.getElementById("openFileInput").click();
    });

    // Assign the functions to run when clicking on save and export menu items
    $("#saveFile").click(doSaveFile);
    $("#exportPNG").click(doExportPNG);
    
    // Build the open file dialog
    $("body").append("<div id=openFileDiv></div>");
    $("#openFileDiv").append("<form id=openFileForm></form>")
                     .attr("class", "dialogDiv");
    $("#openFileForm").append("<input type=file id=openFileInput /><br/>")
                      .append("<ul id=openFileFormMenu></ul>");                              

    $("#openFileInput").change(function() {
        var filename = $(this).val();

        if (filename.length > 0) {
            readFile();    
        }
    });



    $("#openFileFormMenu").append("<li><a id=openFileOK>Open</a></li>")
                          .append("<li><a id=openFileCancel>Cancel</a></li>");
  
    // Assign the click on OK to the readFile function, and hide thd dialog on clicking cancel
    $("#openFileOK").click(readFile);
    $("#openFileCancel").click(function() {hideDialog($("#openFileDiv"));});


    // Build the save file dialog
    $("body").append("<div id=saveFileDiv></div>");
    $("#saveFileDiv").append("<form id=saveFileForm></form>")
                     .attr("class", "dialogDiv");
    $("#saveFileForm").append("Filename: <input type=text id=saveFileInput />.xml<br/>")
                      .append("<ul id=saveFileFormMenu></ul>");                              

    $("#saveFileFormMenu").append("<li><a id=saveFileOK>Save</a></li>")
                          .append("<li><a id=saveFileCancel>Cancel</a></li>");


    $("#saveFileCancel").click(function() {hideDialog($("#saveFileDiv"));});
}

// Solution provided at: http://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

// Solution provided at: http://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas
createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

function doExportPNG() {
    var filename = "argument.png";

    // Create a hidden canvas to render the svg as an image
    $("#tempCanvas").remove();
    var newSvg = graph.getSVGForExport();

    var width = newSvg.getAttribute("width");
    var height = newSvg.getAttribute("height");

    var myCanvas = createHiDPICanvas(width, height);
    myCanvas.setAttribute("id", "tempCanvas");

    var context = myCanvas.getContext('2d');
    
    for (var n in graph.nodes) {
        var svgG = newSvg.getElementById(n);
        svgG.setAttribute("style", "fill-opacity: 1.0; fill: white; stroke: black; stroke-width: 2px;");
    }

    // Canvg doesn't work with SVG foreignObject. Need to remove and draw text on natively
    var foreignObjects = newSvg.getElementsByTagName("foreignObject");
    var toRemove = [];
    
    for (var i=0 ; i < foreignObjects.length ; i++) {
        if (foreignObjects[i].tagName == "foreignObject") {
            toRemove.push(foreignObjects[i]);
        }
    }

    for (var i=0 ; i < toRemove.length ; i++) {
        toRemove[i].parentNode.removeChild(toRemove[i]);
    }

    var svgString = (new window.XMLSerializer()).serializeToString(newSvg);    
    context.drawSvg(svgString, 0 , 0 , width, height);

    for (var n in graph.nodes) {
        var svgG = newSvg.getElementById(n);

        if (svgG.getAttribute("visibility") === "hidden") {
            continue;
        }

        var moveCoords = getTransformCoords(svgG.getAttribute("transform"));
        var startX = moveCoords[0] + graph.graph.offset;
        var startY = moveCoords[1] + 17 + graph.graph.offset;
        
        // Draw title text
        if (graph.nodes[n].title !== "") {
            context.fillStyle = "black";
            context.font = "bold 20px sans-serif";
            context.fillText(graph.nodes[n].title, startX, startY);
            startY += 26;    
        }
        

        var text = graph.nodes[n].text;
        var html = $.parseHTML(text);
        context.font = "18px sans-serif";
        context.strokeStyle = "blue";

        var defaultFont = "18px sans-serif";

        function processChildNodes(childNodes, col, it, bo, ul) {
            for (var i = 0 ; i < childNodes.length ; i++) {
                var child = childNodes[i];
                var newIt = it;
                var newBo = bo;               
                var newCol = col;
                var newUL = ul;

                switch (child.nodeName.toLowerCase()) {
                    case "span":
                        newCol = $(child).css("color");
                        break;
                    case "em":
                        newIt = true;
                        break;
                    case "strong":
                        newBo = true;
                        break;
                    case "a":
                        newUL = true;
                    case "#text":
                        // Ignore for the moment, will deal with printing text nodes below                        
                        break;
                    default:
                        console.log("doExportPNG: error, unhandled tag " + child.nodeName.toLowerCase());
                        return;
                }
                
                if (child.childNodes.length > 0) {                    
                    processChildNodes(child.childNodes, newCol, newIt, newBo, newUL);                    
                }
                else { 
                    var text = $(child).text();

                    context.fillStyle = col;
                    context.font = defaultFont;

                    if (it) {
                        context.font = "italic " + context.font;
                    }

                    if (bo) {
                        context.font = "bold " + context.font;    
                    }

                    if (ul) {
                        context.fillStyle = "blue";
                    }

                    context.fillText(text, startX, startY);

                    var x = startX;
                    var w = context.measureText(text).width;
                    startX += w;             

                    if (ul) {
                        context.beginPath();
                        context.moveTo(x, startY+2);
                        context.lineTo(x+w, startY+2);
                        context.stroke();
                    }       
                }
                
            }
        }

        $(html).each(function() {
            // Make sure it is a <p> node. Sometimes text nodes can creep in
            if (this.nodeName.toLowerCase() === "p") {             
                startX = moveCoords[0] + graph.graph.offset;
                var colour = "black"
                processChildNodes(this.childNodes, colour, false, false, false);
                startY += 21;
            }            
        });

    }

    // Create the image on the canvas and assign a download filename that will force a save dialog
    // Then generate a click on the link which will open the system save dialog
    // When finished, remove the link
    $("body").append('<a id=qqqLink href=' + myCanvas.toDataURL("image/png") + " download=" + filename + ">BLAH</a>");
    document.getElementById("qqqLink").click();
    $("#qqqLink").remove();
}

function doSaveFile() {
    var filename = "argument.xml";
    
    // Create a blob of the XML string
    var blob = new Blob([graph.getXMLString()], { type: "text/plain" });
    
    // Create a link to download the blob, the download attribute will cause a save dialog to appear
    // when clicked. Force a click, then remove link when done.
    $("body").append('<a id=qqqLink href=' + window.URL.createObjectURL(blob) + " download=" + filename + "></a>");
    document.getElementById("qqqLink").click();
    $("#qqqLink").remove();
}

function createBuildMenu() {
    // We use tinyMCE for entering text for nodes as it allows us to have formatting
    tinyMCE.init({
        selector: "textarea",
        menubar: false,
        statusbar: false,
        nowrap: true,
        width: 500,
        height: 300,        
        convert_urls: false,
        relative_urls: false,
        content_css : "argumentation.css",
        toolbar: "bold italic forecolor | link unlink",
        plugins: ["textcolor link"],
        valid_elements: "p,a[href|target],span[style],em,strong",
        target_list: [ ]
    });

    buildCreateNodeDialog();
    buildDeleteNodeDialog();
    buildEditNodeDialog();
    buildEditNodeSelectDialog();
    buildCreateConnectionDialog();
    buildDeleteConnectionDialog();

    buildNodeMenu();

    // buildConfirmPopUp();
    buildInfoPopUp();

    // Add the command menu option to the application menu
    $("#applicationMenu").append("<li class=menuLi id=argumentMenuMain>Build...</li>");

    // Create the menu to build the argument    
    $("#argumentMenuMain").append("<ul class=ulMenu id=argumentMenu></ul>");
    $("#argumentMenu").append("<li><a id=createNode>Create Node...</a></li>")
                      .append("<li><a id=editNode>Edit Node...</a></li>")
                      .append("<li><a id=deleteNode>Delete Node...</a></li>")
                      .append("<li><a id=createConnection>Create Connection...</a></li>")
                      .append("<li><a id=deleteConnection>Delete Connection...</a></li>");
                          
    $("#createNode").click(function() {
        showDialog($("#createNodeDiv"));
        
    });
    $("#editNode").click(function() {
        populateEditNodeSelectDialog();
        showDialog($("#editNodeSelectDiv"));             
    });
    $("#deleteNode").click(function() {
        populateDeleteNodeSelectDialog();
        showDialog($("#deleteNodeDiv"));    
    });
    $("#createConnection").click(function() {
        populateCreateConnectionDialog(true, true);
        showDialog($("#createConnectionDiv"));  
    });
    $("#deleteConnection").click(function(e) {
        populateDeleteConnectionDialog(true);
        showDialog($("#deleteConnectionDiv"));  
    });
}

function buildNodeMenu() {
    $("body").append("<div id=nodeMenuDiv></div>");
    $("#nodeMenuDiv").append("<ul class=ulMenu id=nodeMenu></ul>");
    $("#nodeMenu").append("<li id=editSelectedNode>Edit Node...</li>")
                  .append("<li id=deleteSelectedNode>Delete Node...</li>")
                  .append("<li id=connectSelectedNodeAsParent>Connect As Parent...</li>")
                  .append("<li id=connectSelectedNodeAsChild>Connect As Child...</li>")
                  .append("<li id=deleteSelectedNodeConnection>Delete Connection...</li>")
                  .append("<li id=markUndeveloped>Mark Undeveloped</li>")
                  .append("<li id=collapseNode>Collapse</li>");
                  

    buildDialog("deleteConfirm", "Delete", function() { graph.removeNode(nodeMenuNodeId); }, true);
    $("#deleteConfirmTitle").text("Delete Node");
    $("#deleteConfirmText").text("Confirm node delete")

    $("#editSelectedNode").on("click", editSelectedNode);

    $("#connectSelectedNodeAsParent").on("click", function() {
        populateCreateConnectionDialog(false, true);
        $("#nodeMenuDiv").css("display", "none");         
        showDialog($("#createConnectionDiv"));  
    });
    $("#connectSelectedNodeAsChild").on("click", function() {
        populateCreateConnectionDialog(true, false);
        $("#nodeMenuDiv").css("display", "none");         
        showDialog($("#createConnectionDiv"));  
    });
    $("#deleteSelectedNode").on("click", function() {
        $("#nodeMenuDiv").css("display", "none");         
        showDialog($("#deleteConfirmDiv"));
    });
    $("#collapseNode").on("click", function() {
        graph.collapseNode(nodeMenuNodeId);
        $("#nodeMenuDiv").css("display", "none");
    });

    $("#deleteSelectedNodeConnection").on("click", function() {
        populateDeleteConnectionDialog(false);
        $("#nodeMenuDiv").css("display", "none");         
        showDialog($("#deleteConnectionDiv"));  
    });
    
    $("#markUndeveloped").on("click", function() {
        graph.markNodeUndeveloped(nodeMenuNodeId);
        $("#nodeMenuDiv").css("display", "none");
    });
}

function rightClick(evt) {    
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

    nodeMenuNodeId = getParentG(evt.target).getAttribute("id");

    if (graph.getNode(nodeMenuNodeId).collapsed) {
        $("#collapseNode").text("Expand");
    }
    else {
        $("#collapseNode").text("Collapse");
    }

    if (graph.getNode(nodeMenuNodeId).type === "goal") {
        // Only show option if goal has no child elements and not undeveloped already

        if (graph.getNode(nodeMenuNodeId).undeveloped) {
            $("#markUndeveloped").css("display", "none");    
        }
        else if (graph.hasVerticalChildren(nodeMenuNodeId)) {
            $("#markUndeveloped").css("display", "none");       
        }
        else {
            $("#markUndeveloped").css("display", "block");    
        }
    }
    else {
        $("#markUndeveloped").css("display", "none");
    }

    $("#nodeMenuDiv").css("display", "inline-block")
                     .css("top", evt.clientY-10 + "px")
                     .css("left", evt.clientX-10 + "px")
                     .mouseleave(function() {                        
                        $("#nodeMenuDiv").css("display", "none");
                     });
}

function editSelectedNode() {   
    editNodeId = nodeMenuNodeId;

    var details = graph.getNode(editNodeId);
    
    $("#editNodeTitle").val(details.title);
    tinyMCE.get("editNodeText").setContent(details.text);

    showDialog($("#editNodeDiv"));   
    $("#nodeMenuDiv").css("display", "none");         
}

function createNode() {
    var type = $("#createNodeType").val();
    var title = $("#createNodeTitle").val();
    var text = tinyMCE.get("createNodeText").getContent();

    graph.addNode(graph.getNextId(), type, title, text);

    hideDialog($("#createNodeDiv"));

    // Reset the form fields
    $("#createNodeType").val("goal");
    $("#createNodeTitle").val("");
    tinyMCE.get("createNodeText").setContent("");
}

function editNode() {
    var title = $("#editNodeTitle").val();
    var text = tinyMCE.get("editNodeText").getContent();

    graph.editNode(editNodeId, title, text);
    editNodeId = null;
    hideDialog($("#editNodeDiv"));
}

function populateCreateConnectionDialog(showParent, showChild) {
    $("#createConnectionParentList option").remove();
    $("#createConnectionChildList option").remove();

    var nodes = this.graph.getNodes();

    function displayList(div, show) {        
        if (show) {
            div.css("display", "inline");
        }
        else {
            div.css("display", "none");        
        }
    }

    displayList($("#createConnectionParentDiv"), showParent);
    displayList($("#createConnectionChildDiv"), showChild);

    for (var n in nodes) {
        var name = nodes[n].title;

        if (name == "") {
            name = "Unnamed " + nodes[n].type + " node";
        }

        if (showParent) {
            $("#createConnectionParentList").append("<option value=" + n + ">" + name + "</option>");    
        }
        
        if (showChild) {
            $("#createConnectionChildList").append("<option value=" + n + ">" + name + "</option>");    
        }        
    }

    if (!showParent) {
        $("#createConnectionParentList").append("<option value=" + nodeMenuNodeId + "></option>");  
        $("#createConnectionParentList").val(nodeMenuNodeId);  
    }

    if (!showChild) {
        $("#createConnectionChildList").append("<option value=" + nodeMenuNodeId + "></option>");    
        $("#createConnectionChildList").val(nodeMenuNodeId);
    }
}

function populateDeleteConnectionDialog(showAll) {
    // Clear the select drop down
    $("#deleteConnectionList option").remove();

    var connections = this.graph.getConnections();

    for (var c = 0 ; c < connections.length ; c++) {
        var id = connections[c].fromId + ";;" + connections[c].toId;
        var nameFrom = graph.getNode(connections[c].fromId).title 
        var nameTo = graph.getNode(connections[c].toId).title;

        if (nameFrom == "") {
            nameFrom = "Unnamed " + graph.getNode(connections[c].fromId).type  + " node";
        }

        if (nameTo == "") {
            nameTo = "Unnamed " + graph.getNode(connections[c].toId).type  + " node";
        }

        if (showAll) {
            $("#deleteConnectionList").append("<option value=" + id + ">" + nameFrom + " -> " + nameTo + "</option>");    
        }
        else if ((connections[c].fromId === nodeMenuNodeId) || (connections[c].toId === nodeMenuNodeId)) {
            $("#deleteConnectionList").append("<option value=" + id + ">" + nameFrom + " -> " + nameTo + "</option>");       
        }
        
    }
}

function populateEditNodeSelectDialog() {
    // Clear the select drop down
    $("#editNodeSelectList option").remove();

    var nodes = this.graph.getNodes();

    for (var n in nodes) {
        var name = nodes[n].title;

        if (name == "") {
            name = "Unnamed " + nodes[n].type + " node";
        }

        $("#editNodeSelectList").append("<option value=" + n + ">" + name + "</option>");
    }
}

function populateDeleteNodeSelectDialog() {
    // Clear the select drop down
    $("#deleteNodeList option").remove();


    var nodes = this.graph.getNodes();

    for (var n in nodes) {
        var name = nodes[n].title;

        if (name == "") {
            name = "Unnamed " + nodes[n].type + " node";
        }

        $("#deleteNodeList").append("<option value=" + n + ">" + name + "</option>");
    }

                
}

function configureConfirmPopUp(text, action) {
    $("#confirmPopUpText").text(text);

    $("#confirmPopUpOK").off("click").on("click", function() {
        action();
        hideDialog($("#confirmPopUpDiv"));
    });
}


function buildDialog(id, btnOKText, btnOKAction, includeCancel) {
    $("body").append("<div id=" + id + "Div></div>");

    $("#" + id + "Div").append("<form id=" + id + "Form></form>")
                       .attr("class", "dialogDiv");

    $("#" + id + "Form").append("<div id=" + id + "FormDiv></div>")
                        .append(spacer)
                        .append("<ul id=" + id + "FormMenu>");

    $("#" + id + "FormDiv").append("<p class=dialogH id=" + id + "Title></p>")
                           .append(spacer)
                           .append("<p id=" + id + "Text></p>");
                        
    $("#" + id + "FormMenu").append("<li><a id=" + id + "OK>" + btnOKText + "</a></li>");

    $("#" + id + "OK").on("click", function() {
        btnOKAction();
        hideDialog($("#" + id + "Div"));
    });     

    if (includeCancel) {
        $("#" + id + "FormMenu").append("<li><a id=" + id + "Cancel>Cancel</a></li>");
        $("#" + id + "Cancel").on("click", function() {hideDialog($("#" + id + "Div"))}); 
    }  
}

function buildInfoPopUp() {
    buildDialog("infoPopUp", "OK", function() {}, false);
}

function buildConfirmPopUp() {
    buildDialog("confirmPopUp", "OK", function() {}, true);
    $("#confirmPopUpForm").prepend("<strong id=confirmPopUpText>Default Text</strong>");
}

function buildDeleteConnectionDialog() {
    $("body").append("<div id=deleteConnectionDiv></div>");
    
    $("#deleteConnectionDiv").append("<form id=deleteConnectionForm></form>")
                             .attr("class", "dialogDiv");

    $("#deleteConnectionForm").append("<p class=dialogH>Delete Connection</p>")
                              .append(spacer)
                              .append("<strong>Select connection : </strong>")
                              .append("<select id=deleteConnectionList></select>")
                              .append(spacer)
                              .append("<ul id=deleteConnectionFormMenu>");

    $("#deleteConnectionFormMenu").append("<li><a id=deleteConnectionOK>Delete</a></li>")
                                  .append("<li><a id=deleteConnectionCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#deleteConnectionOK").click(function() {
        var id = $("#deleteConnectionList").val().split(";;");
        graph.removeConnection(id[0], id[1]);
        hideDialog($("#deleteConnectionDiv"));
    });     
    $("#deleteConnectionCancel").click(function() {hideDialog($("#deleteConnectionDiv"))});    
}


function buildEditNodeSelectDialog() {
    $("body").append("<div id=editNodeSelectDiv></div>");
    
    $("#editNodeSelectDiv").append("<form id=editNodeSelectForm></form>")
                       .attr("class", "dialogDiv");

    $("#editNodeSelectForm").append("<strong>Select node to edit : </strong>")
                        .append("<select id=editNodeSelectList></select></br>")
                        .append("<ul id=editNodeSelectFormMenu>");

    $("#editNodeSelectFormMenu").append("<li><a id=editNodeSelectOK>Select</a></li>")
                            .append("<li><a id=editNodeSelectCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#editNodeSelectOK").click(function(e) {
        hideDialog($("#editNodeSelectDiv"));
        editNodeId = $("#editNodeSelectList").val();

        var details = graph.getNode(editNodeId);
    
        $("#editNodeTitle").val(details.title);
        tinyMCE.get("editNodeText").setContent(details.text);

        showDialog($("#editNodeDiv"));            
    });
    $("#editNodeSelectCancel").click(function() {hideDialog($("#editNodeSelectDiv"))});    
}

function buildCreateNodeDialog() {  
    $("body").append("<div id=createNodeDiv></div>");
    
    $("#createNodeDiv").append("<form id=createNodeForm></form>")
                       .attr("class", "dialogDiv");
    
    $("#createNodeForm").append("<p class=dialogH>Create Node</p>")
                        .append(spacer)                        
                        .append("<strong>Type: </strong>")
                        .append("<select id=createNodeType></select>")
                        .append(spacer)
                        .append("<strong>Title: </strong>")
                        .append("<input type=text id=createNodeTitle />")
                        .append(spacer)
                        .append("<strong>Content: </strong>")
                        .append(spacer)
                        .append("<textarea id=createNodeText rows=8 cols=35></textarea><br/>")
                        .append(spacer)
                        .append("<ul id=createNodeFormMenu>");
    
    $("#createNodeType").append("<option value=goal>Goal</option>")
                        .append("<option value=strategy>Strategy</option>")
                        .append("<option value=solution>Solution</option>")
                        .append("<option value=context>Context</option>")
                        .append("<option value=assumption>Assumption</option>")
                        .append("<option value=justification>Justification</option>");
    
    $("#createNodeFormMenu").append("<li><a id=createNodeOK>Create</a></li>")
                            .append("<li><a id=createNodeCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#createNodeOK").click(createNode);
    $("#createNodeCancel").click(function() {hideDialog($("#createNodeDiv"))});
}

function buildDeleteNodeDialog() {
    $("body").append("<div id=deleteNodeDiv></div>");
    
    $("#deleteNodeDiv").append("<form id=deleteNodeForm></form>")
                       .attr("class", "dialogDiv");

    $("#deleteNodeForm").append("<p class=dialogH>Delete Node</p>")
                        .append(spacer)
                        .append("<strong>Select node : </strong>")
                        .append("<select id=deleteNodeList></select></br>")
                        .append(spacer)
                        .append("<ul id=deleteNodeFormMenu>");

    $("#deleteNodeFormMenu").append("<li><a id=deleteNodeOK>Delete</a></li>")
                            .append("<li><a id=deleteNodeCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#deleteNodeOK").click(function(e) {
        hideDialog($("#deleteNodeDiv"));
        deleteNodeId = $("#deleteNodeList").val();
        graph.removeNode(deleteNodeId);
    });
    $("#deleteNodeCancel").click(function() {hideDialog($("#deleteNodeDiv"))});
}

function buildEditNodeDialog() {
    $("body").append("<div id=editNodeDiv></div>");
    
    $("#editNodeDiv").append("<form id=editNodeForm></form>")
                       .attr("class", "dialogDiv");
    
    $("#editNodeForm").append("<p class=dialogH>Edit Node</p>")
                      .append(spacer)
                      .append("<strong>Title: </strong>")
                      .append("<input type=text id=editNodeTitle />")
                      .append(spacer)
                      .append("<strong>Content: </strong>")
                      .append(spacer)
                      .append("<textarea id=editNodeText rows=8 cols=35></textarea>")
                      .append(spacer)
                      .append("<ul id=editNodeFormMenu></ul>");
        
    $("#editNodeFormMenu").append("<li><a id=editNodeOK>Save</a></li>")
                            .append("<li><a id=editNodeCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#editNodeOK").click(editNode);
    $("#editNodeCancel").click(function() {hideDialog($("#editNodeDiv"))});    
}

function buildCreateConnectionDialog() {
    $("body").append("<div id=createConnectionDiv></div>");
    
    $("#createConnectionDiv").append("<form id=createConnectionForm></form>")
                             .attr("class", "dialogDiv");

    $("#createConnectionForm").append("<p class=dialogH>Create Connection</p>")
                              .append("<div id=createConnectionParentDiv></div")
                              .append("<div id=createConnectionChildDiv></div>")
                              .append(spacer)
                              .append("<ul id=createConnectionFormMenu></ul>");  

    $("#createConnectionParentDiv").append(spacer)
                                   .append("<strong>Select parent node : </strong>")
                                   .append("<select id=createConnectionParentList></select>");
        
    $("#createConnectionChildDiv").append(spacer)
                                  .append("<strong>Select child node : </strong>")
                                  .append("<select id=createConnectionChildList></select>");
                                                          

    $("#createConnectionFormMenu").append("<li><a id=createConnectionOK>Create</a></li>")
                                  .append("<li><a id=createConnectionCancel>Cancel</a></li>");

    // Add the mouse click listeners to the buttons                   
    $("#createConnectionOK").click(function(e) {
        var parent = $("#createConnectionParentList").val();
        var child = $("#createConnectionChildList").val();
        
        var response = graph.addConnection(parent, child);

        hideDialog($("#createConnectionDiv"));

        if (response[0] == false) {
            $("#infoPopUpText").text(response[1])   
            $("#infoPopUpTitle").text("Error")            
            showDialog($("#infoPopUpDiv"));   
        }
    });
    $("#createConnectionCancel").click(function() {hideDialog($("#createConnectionDiv"))});                                 
}

function createViewMenu() {
    $("#applicationMenu").append("<li class=menuLi id=viewMenuMain>View...</li>");
    $("#viewMenuMain").append("<ul class=ulMenu id=viewMenu></ul>");
    $("#viewMenu").append("<li id=zoomIn>Zoom In</li>")
                  .append("<li id=zoomOut>Zoom Out</li>")
                  .append("<li id=centre>Centre</li>");

    $("#zoomIn").click(function() {
        graph.zoomIn();
    });

    $("#zoomOut").click(function() {
        graph.zoomOut();
    });

    $("#centre").click(function() {
        graph.centreGraph();
    });
}

function showDialog(dialog) {  
    var left = (window.innerWidth - 24 - dialog.width())/2.0;
    var top = (window.innerHeight - 24 - dialog.height())/2.0;

    if (left < 0.0) {
        left = 0.0;
    }

    if (top < 0.0) {
        top = 0.0;
    }

    $("#dimScreenDiv").css("display", "block");
    dialog.css("top", top + "px");
    dialog.css("left", left + "px");
    dialog.css("display", "block");
    visibleDialog = dialog;
}

function hideDialog(dialog) {
    $("#dimScreenDiv").css("display", "none");
    dialog.css("display", "none");  
    visibleDialog = null;
}

function readFile() {
    graph.clear();

    var reader = new FileReader();
    reader.onload = processFileResult;
    reader.readAsText($("#openFileInput").prop("files")[0]);
    hideDialog($("#openFileDiv"));
}

function processFileResult(evt) {
    var xmlStr = evt.target.result;
    var xml = $.parseXML(xmlStr);
    processXMLFile(xml);
}
    
function processXMLFile(xml) {
    $xml = $(xml);
    
    $nodes = $xml.find("node");
    $connections = $xml.find("connection");

    // Mark nodes hidden or undeveloped after have loaded them all, as
    // they require all nodes to be present for their behavioural logic to work as intended
    var hideNodes = [];
    var undevelopedNodes = [];

    $nodes.each(function(i) {
        var n = $(this);
        var id = n.attr("id");
        var type = n.attr("nodetype");
        var x = n.attr("x");
        var y = n.attr("y");
        var collapsed = n.attr("collapsed").toLowerCase();
        var undeveloped = n.attr("undeveloped").toLowerCase();
        var title = n.find("name").text();
        var htmlText = n.find("description").text();        
        
        graph.addNodeXY(id, type, title, htmlText, x, y);

        if (collapsed === "true") {
            hideNodes.push(id);
        }

        if (undeveloped === "true") {
            undevelopedNodes.push(id);
        }
    });

    $connections.each(function(i) {
        var fromId = $(this).attr("parentid");
        var toId = $(this).attr("childid");
        graph.addConnection(fromId, toId);
    });
 
    for (var i = 0 ; i < hideNodes.length ; i++) {
        graph.collapseNode(hideNodes[i]);
    }

    for (var i = 0 ; i < undevelopedNodes.length ; i++) {
        graph.markNodeUndeveloped(undevelopedNodes[i]);
    }

    graph.zoomToFit();
}
