/**
 * xfEditor 英文语言包
 * 
 * @file        en.js
 * @description English language pack
 * @version     1.0.0
 * @license     MIT License
 * @updateTime  2026-06-04
 */

(function(){
    var factory = function (exports) {
        var lang = {
            name : "en",
            description : "Open source online Markdown editor.",
            tocTitle    : "Table of Contents",
            placeholder : "Write something...",

            toolbar : {
                undo             : "Undo (Ctrl+Z)",
                redo             : "Redo (Ctrl+Y)",
                bold             : "Bold",
                del              : "Strikethrough",
                italic           : "Italic",
                quote            : "Block quote",
                ucwords          : "Capitalize first letter of each word",
                uppercase        : "Convert to uppercase",
                lowercase        : "Convert to lowercase",
                h1               : "Heading 1",
                h2               : "Heading 2",
                h3               : "Heading 3",
                h4               : "Heading 4",
                h5               : "Heading 5",
                h6               : "Heading 6",
                "list-ul"        : "Unordered list",
                "list-ol"        : "Ordered list",
                hr               : "Horizontal rule",
                link             : "Link",
                "reference-link" : "Reference link",
                image            : "Image",
                file             : "Upload File",
                code             : "Code inline",
                "preformatted-text" : "Preformatted text / Code block (Tab indent)",
                "code-block"     : "Code block (Multi-languages)",
                table            : "Tables",
                datetime         : "Datetime",
                "html-entities"  : "HTML Entities",
                pagebreak        : "Page break",
                "goto-line"      : "Go to line",
                watch            : "Close live preview",
                unwatch          : "Enable live preview",
                preview          : "HTML Preview (Press Shift + ESC to exit)",
                fullscreen       : "Fullscreen (Press ESC to exit)",
                clear            : "Clear",
                search           : "Search",
                help             : "Help",
                info             : "About " + exports.title,
                "align-left"     : "Align Left",
                "align-center"   : "Align Center",
                "align-right"    : "Align Right",
                "align-justify"  : "Justify",
                "table-edit"     : "Table Edit",
                insert           : "Insert",
                pinyin           : "Pinyin",
                "image-resize"   : "Image Size",
                "echarts-bar"    : "Bar Chart",
                "echarts-line"   : "Line Chart",
                "echarts-pie"    : "Pie Chart",
                "echarts-radar"  : "Radar Chart",
                "echarts-funnel" : "Funnel Chart",
                chart            : "Chart",
                tabs             : "Tabs",
                columns          : "Multi-column",
                tooltip          : "Tooltip",
                color            : "Text Color",
                "bg-color"       : "Background Color",
                draft            : "Draft",
                restoreDraft     : "Restore Draft",
                clearDraft       : "Clear All Drafts",
                draftRestoreTip  : "Found auto-saved drafts. Click any item to restore:",
                draftClearBtn    : "Clear All",
                draftCancelBtn   : "Not Now"
            },

            buttons : {
                enter   : "Enter",
                cancel  : "Cancel",
                close   : "Close",
                confirm : "Confirm"
            },

            dialog : {
                link : {
                    title    : "Link",
                    url      : "Address",
                    urlTitle : "Title",
                    urlEmpty : "Error: Please fill in the link address."
                },
                referenceLink : {
                    title    : "Reference link",
                    name     : "Name",
                    url      : "Address",
                    urlId    : "ID",
                    urlTitle : "Title",
                    nameEmpty: "Error: Reference name cannot be empty.",
                    idEmpty  : "Error: Please fill in reference link id.",
                    urlEmpty : "Error: Please fill in reference link url address."
                },
                image : {
                    title    : "Image",
                    url      : "Address",
                    link     : "Link",
                    alt      : "Title",
                    uploadButton     : "Upload",
                    imageURLEmpty    : "Error: Image url address cannot be empty.",
                    uploadFileEmpty  : "Error: Upload image cannot be empty!",
                    formatNotAllowed : "Error: Only image files are allowed. Allowed formats:"
                },
                file : {
                    title    : "Upload File",
                    url      : "File URL",
                    alt      : "File Name",
                    uploadButton     : "Upload",
                    fileURLEmpty     : "Error: File URL cannot be empty.",
                    uploadFileEmpty  : "Error: Upload file cannot be empty.",
                    formatNotAllowed : "Error: Only specified file formats are allowed. Allowed formats:",
                    uploadError      : "Upload error, please check API response format."
                },
                video : {
                    title         : "Video",
                    url           : "Address",
                    alt           : "Title",
                    uploadButton  : "Upload",
                    size          : "Size (Width x Height)",
                    align         : "Align",
                    alignLeft     : "Left",
                    alignCenter   : "Center",
                    alignRight    : "Right",
                    videoURLEmpty : "Error: Video url address cannot be empty.",
                    uploadFileEmpty : "Error: Upload video cannot be empty!",
                    formatNotAllowed : "Error: Only video files are allowed. Allowed formats:",
                    uploadError   : "Upload error"
                },
                preformattedText : {
                    title             : "Preformatted text / Codes", 
                    emptyAlert        : "Error: Please fill in the preformatted text or code content.",
                    placeholder       : "coding now...."
                },
                codeBlock : {
                    title             : "Code block",         
                    selectLabel       : "Languages: ",
                    selectDefaultText : "Select a code language...",
                    otherLanguage     : "Other languages",
                    unselectedLanguageAlert : "Error: Please select the code language.",
                    codeEmptyAlert    : "Error: Please fill in the code content.",
                    placeholder       : "coding now...."
                },
                htmlEntities : {
                    title : "HTML Entities"
                },
                help : {
                    title : "Help"
                }
            }
        };
        
        exports.defaults.lang = lang;
        // 同时注册到语言包注册表，使 editormd.getLang("en") 可获取
        exports.langs = exports.langs || {};
        exports.langs[lang.name] = lang;
    };
    
    // CommonJS/Node.js
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    { 
        module.exports = factory;
    }
    else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
        if (define.amd) { // for Require.js
            define(["editormd"], function(editormd) {
                factory(editormd);
            });
        } else { // for Sea.js
            define(function(require) {
                var editormd = require("../editormd");
                factory(editormd);
            });
        }
    } 
    else
    {
        factory(window.editormd);
    }
    
})();
