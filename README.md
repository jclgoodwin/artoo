---
csl: ieee-with-url.csl
fontfamily: mathpple
geometry: a4paper
geometry: margin=2.5cm
references:
- id: alden
  title: Simulation and Statistical Techniques to Explore Lymphoid Tissue Organogenesis
  author:
  - family: Alden
    given: Kieran
  URL: 'http://etheses.whiterose.ac.uk/3220/'
  type: thesis
  issued:
    year: 2012
- id: gsn
  title: GSN Community Standard
  URL: 'http://www.goalstructuringnotation.info/documents/GSN_Standard.pdf'
  version: 1
  issued: 
    year: 2011
  publisher: Origin Consulting (York) Limited

---

# Files and directories in this archive

Original parts of Artoo, written by Paul Andrews:

*   `argumentation.css`
*   `argumentation.js`
*   `gsnlib.js`
*   `help.css`
*   `help.html`
*   `svggraphlib.js`

Third-party code added to Artoo by Paul Andrews:

*   `browserdetect.js`
*   `canvg.js`
*   `jquery-1.10.1.min.js`
*   `rgbcolor.js`
*   `StackBlur.js`
*   `tinymce/*`

Part of Artoo, written by Paul Andrews, amended by Joshua Goodwin to load automatic layout code. Open this file in a web browser to use Artoo:

*   `argumentation.html`

Automatic layout integration code, written by Joshua Goodwin:

*   `layout.js`

Third-party automatic layout code, added by Joshua Goodwin:

*   `arbor/*`
*   `dagre/*`
*   `springy-2.6.1.js`

Example XML files representing arguments from [@alden]:

*   `examples/*-kieran-thesis.xml`

Example XML files representing arguments from [@gsn]:

*   `examples/example*.xml`

# Known issues

- The **Load Example...** menu (added by Joshua Goodwin for more convenient testing) does not work in Mozilla Firefox when using the `file` protocol. Either use the `http` protocol (there is working copy of these files [hosted online](http://www-users.york.ac.uk/~jclg500/argumentation/argumentation.html) for convenience), use Artoo's **File...** menu, or use a different browser.

* * *
