const fs = require('fs');

const src = fs.readFileSync('src/editormd.js', 'utf8');

// Replacement 1: Require.js define replace
const replaceText1 = [
    'var cmModePath  = "codemirror/mode/";',
    '            var cmAddonPath = "codemirror/addon/";',
    '',
    '            var codeMirrorModules = [',
    '                "jquery", "marked", "prettify",',
    '                "katex", "raphael", "underscore", "flowchart",  "jqueryflowchart",  "sequenceDiagram",',
    '',
    '                "codemirror/lib/codemirror",',
    '                cmModePath + "css/css",',
    '                cmModePath + "sass/sass",',
    '                cmModePath + "shell/shell",',
    '                cmModePath + "sql/sql",',
    '                cmModePath + "clike/clike",',
    '                cmModePath + "php/php",',
    '                cmModePath + "xml/xml",',
    '                cmModePath + "markdown/markdown",',
    '                cmModePath + "javascript/javascript",',
    '                cmModePath + "htmlmixed/htmlmixed",',
    '                cmModePath + "gfm/gfm",',
    '                cmModePath + "http/http",',
    '                cmModePath + "go/go",',
    '                cmModePath + "dart/dart",',
    '                cmModePath + "coffeescript/coffeescript",',
    '                cmModePath + "nginx/nginx",',
    '                cmModePath + "python/python",',
    '                cmModePath + "perl/perl",',
    '                cmModePath + "lua/lua",',
    '                cmModePath + "r/r", ',
    '                cmModePath + "ruby/ruby", ',
    '                cmModePath + "rst/rst",',
    '                cmModePath + "smartymixed/smartymixed",',
    '                cmModePath + "vb/vb",',
    '                cmModePath + "vbscript/vbscript",',
    '                cmModePath + "velocity/velocity",',
    '                cmModePath + "xquery/xquery",',
    '                cmModePath + "yaml/yaml",',
    '                cmModePath + "erlang/erlang",',
    '                cmModePath + "jade/jade",',
    '',
    '                cmAddonPath + "edit/trailingspace", ',
    '                cmAddonPath + "dialog/dialog", ',
    '                cmAddonPath + "search/searchcursor", ',
    '                cmAddonPath + "search/search", ',
    '                cmAddonPath + "scroll/annotatescrollbar", ',
    '                cmAddonPath + "search/matchesonscrollbar", ',
    '                cmAddonPath + "display/placeholder", ',
    '                cmAddonPath + "edit/closetag", ',
    '                cmAddonPath + "fold/foldcode",',
    '                cmAddonPath + "fold/foldgutter",',
    '                cmAddonPath + "fold/indent-fold",',
    '                cmAddonPath + "fold/brace-fold",',
    '                cmAddonPath + "fold/xml-fold", ',
    '                cmAddonPath + "fold/markdown-fold",',
    '                cmAddonPath + "fold/comment-fold", ',
    '                cmAddonPath + "mode/overlay", ',
    '                cmAddonPath + "selection/active-line", ',
    '                cmAddonPath + "edit/closebrackets", ',
    '                cmAddonPath + "display/fullscreen",',
    '                cmAddonPath + "search/match-highlighter"',
    '            ];',
    '',
    '            define(codeMirrorModules, factory);'
].join('\r\n');

// Replacement 2: Require.js assignment replace
const replaceText2 = [
    "if (typeof define == \"function\" && define.amd) {",
    "       $          = arguments[0];",
    "       marked     = arguments[1];",
    "       prettify   = arguments[2];",
    "       katex      = arguments[3];",
    "       Raphael    = arguments[4];",
    "       _          = arguments[5];",
    "       flowchart  = arguments[6];",
    "       CodeMirror = arguments[9];",
    "   }"
].join('\r\n');

let amd = src.replace('/* Require.js define replace */', replaceText1);
amd = amd.replace('/* Require.js assignment replace */', replaceText2);

fs.writeFileSync('editormd.js', src, 'utf8');
fs.writeFileSync('editormd.amd.js', amd, 'utf8');
console.log('Build complete: editormd.js and editormd.amd.js updated.');
