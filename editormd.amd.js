;(function(factory) {
    "use strict";

    // Polyfill: guard against "test is not defined" / "test.mode is not a function" from third-party scripts
    if (typeof window !== "undefined" && typeof test === "undefined") {
        try {
            var testPolyfill = function() {};
            testPolyfill.mode = function() {};
            testPolyfill.formatString = function() {};
            testPolyfill.addOption = function() {};
            testPolyfill.show = function() {};
            window.test = testPolyfill;
        } catch(e) {}
    }
    
	// CommonJS/Node.js
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    { 
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD/CMD/Sea.js
	{
        if (define.amd) // for Require.js
        {
            var cmModePath  = "codemirror/mode/";
            var cmAddonPath = "codemirror/addon/";

            var codeMirrorModules = [
                "jquery", "marked", "prettify",
                "katex", "raphael", "underscore", "flowchart",  "jqueryflowchart",  "sequenceDiagram",

                "codemirror/lib/codemirror",
                cmModePath + "css/css",
                cmModePath + "sass/sass",
                cmModePath + "shell/shell",
                cmModePath + "sql/sql",
                cmModePath + "clike/clike",
                cmModePath + "php/php",
                cmModePath + "xml/xml",
                cmModePath + "markdown/markdown",
                cmModePath + "javascript/javascript",
                cmModePath + "htmlmixed/htmlmixed",
                cmModePath + "gfm/gfm",
                cmModePath + "http/http",
                cmModePath + "go/go",
                cmModePath + "dart/dart",
                cmModePath + "coffeescript/coffeescript",
                cmModePath + "nginx/nginx",
                cmModePath + "python/python",
                cmModePath + "perl/perl",
                cmModePath + "lua/lua",
                cmModePath + "r/r", 
                cmModePath + "ruby/ruby", 
                cmModePath + "rst/rst",
                cmModePath + "smartymixed/smartymixed",
                cmModePath + "vb/vb",
                cmModePath + "vbscript/vbscript",
                cmModePath + "velocity/velocity",
                cmModePath + "xquery/xquery",
                cmModePath + "yaml/yaml",
                cmModePath + "erlang/erlang",
                cmModePath + "jade/jade",

                cmAddonPath + "edit/trailingspace", 
                cmAddonPath + "dialog/dialog", 
                cmAddonPath + "search/searchcursor", 
                cmAddonPath + "search/search", 
                cmAddonPath + "scroll/annotatescrollbar", 
                cmAddonPath + "search/matchesonscrollbar", 
                cmAddonPath + "display/placeholder", 
                cmAddonPath + "edit/closetag", 
                cmAddonPath + "fold/foldcode",
                cmAddonPath + "fold/foldgutter",
                cmAddonPath + "fold/indent-fold",
                cmAddonPath + "fold/brace-fold",
                cmAddonPath + "fold/xml-fold", 
                cmAddonPath + "fold/markdown-fold",
                cmAddonPath + "fold/comment-fold", 
                cmAddonPath + "mode/overlay", 
                cmAddonPath + "selection/active-line", 
                cmAddonPath + "edit/closebrackets", 
                cmAddonPath + "display/fullscreen",
                cmAddonPath + "search/match-highlighter"
            ];

            define(codeMirrorModules, factory);
        } 
        else 
        {
		    define(["jquery"], factory);  // for Sea.js
        }
	} 
	else
	{ 
        window.editormd = factory();
	}
    
}(function() {    

    if (typeof define == "function" && define.amd) {
       $          = arguments[0];
       marked     = arguments[1];
       prettify   = arguments[2];
       katex      = arguments[3];
       Raphael    = arguments[4];
       _          = arguments[5];
       flowchart  = arguments[6];
       CodeMirror = arguments[9];
   }
    
    "use strict";
    
    var $ = (typeof (jQuery) !== "undefined") ? jQuery : Zepto;

	if (typeof ($) === "undefined") {
		return ;
	}
    
    /**
     * editormd
     * 
     * @param   {String} id           编辑器的ID
     * @param   {Object} options      配置选项 Key/Value
     * @returns {Object} editormd     返回editormd对象
     */
    
    var editormd         = function (id, options) {
        return new editormd.fn.init(id, options);
    };
    
    editormd.title        = editormd.$name = "Editor.md";
    editormd.version      = "1.7.0";
    editormd.homePage     = "https://pandao.github.io/editor.md/";
    editormd.classPrefix  = "editormd-";
    
    editormd.toolbarModes = {
        full : [
            "undo", "redo", "|", 
            "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", 
            { "h1" : ["h1", "h2", "h3", "h4", "h5", "h6"] },
            "|", 
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "video", "file", "|",
            { "insert" : ["code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak"] },
            "|",
            { "align" : ["align-left", "align-center", "align-right", "align-justify"] },
            "|",
            "pinyin",
            "|",
            { "chart" : ["echarts-bar", "echarts-line", "echarts-pie", "echarts-radar", "echarts-funnel"] },
            "|",
            "tabs", "columns", "tooltip", "|",
            "color", "bg-color", "|",
            "goto-line", "watch", "preview", "fullscreen", "clear", "search", "|",
            "help", "info"
        ],
        simple : [
            "undo", "redo", "|", 
            "bold", "del", "italic", "quote", "uppercase", "lowercase", "|", 
            { "h1" : ["h1", "h2", "h3", "h4", "h5", "h6"] },
            "|", 
            "list-ul", "list-ol", "hr", "|",
            "watch", "preview", "fullscreen", "|",
            "help", "info"
        ],
        mini : [
            "undo", "redo", "|",
            "watch", "preview", "|",
            "help", "info"
        ]
    };
    
    editormd.defaults     = {
        mode                 : "gfm",          //gfm or markdown
        name                 : "",             // Form element name
        value                : "",             // value for CodeMirror, if mode not gfm/markdown
        theme                : "",             // Editor.md self themes, before v1.5.0 is CodeMirror theme, default empty
        editorTheme          : "default",      // Editor area, this is CodeMirror theme at v1.5.0
        previewTheme         : "",             // Preview area theme, default empty
        markdown             : "",             // Markdown source code
        appendMarkdown       : "",             // if in init textarea value not empty, append markdown to textarea
        width                : "100%",
        height               : "100%",
        path                 : "./lib/",       // Dependents module file directory
        pluginPath           : "",             // If this empty, default use settings.path + "../plugins/"
        delay                : 300,            // Delay parse markdown to html, Uint : ms
        autoLoadModules      : true,           // Automatic load dependent module files
        watch                : true,
        placeholder          : "Enjoy Markdown! coding now...",
        gotoLine             : true,
        codeFold             : false,
        autoHeight           : false,
		autoFocus            : true,
        autoCloseTags        : true,
        searchReplace        : true,
        syncScrolling        : true,           // true | false | "single", default true
        readOnly             : false,
        tabSize              : 4,
		indentUnit           : 4,
        lineNumbers          : true,
		lineWrapping         : true,
		autoCloseBrackets    : true,
		showTrailingSpace    : true,
		matchBrackets        : true,
		indentWithTabs       : true,
		styleSelectedText    : true,
        matchWordHighlight   : true,           // options: true, false, "onselected"
        styleActiveLine      : true,           // Highlight the current line
        dialogLockScreen     : true,
        dialogShowMask       : true,
        dialogDraggable      : true,
        dialogMaskBgColor    : "#fff",
        dialogMaskOpacity    : 0.1,
        fontSize             : "13px",
        saveHTMLToTextarea   : false,
        disabledKeyMaps      : [],
        
        onload               : function() {},
        onresize             : function() {},
        onchange             : function() {},
        onwatch              : null,
        onunwatch            : null,
        onpreviewing         : function() {},
        onpreviewed          : function() {},
        onfullscreen         : function() {},
        onfullscreenExit     : function() {},
        onscroll             : function() {},
        onpreviewscroll      : function() {},
        onbeforesave         : function() {},
        onaftersave          : function() {},
        oninsert             : function() {},
        ontablechange        : function() {},
        onimagechange        : function() {},
        onkeydown            : function() {},
        onkeyup              : function() {},
        onmouseup            : function() {},
        onmousedown          : function() {},
        onpaste              : function() {},
        ondrop               : function() {},
        oncopy               : function() {},
        oncut                : function() {},
        onfocus              : function() {},
        onblur               : function() {},
        oncursoractivity     : function() {},
        
        imageUpload          : false,
        imageFormats         : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        imageUploadURL       : "",
        crossDomainUpload    : false,
        uploadCallbackURL    : "",
        imageResize          : true,           // Enable image width/height edit
        
        fileUpload           : false,
        fileFormats          : ["doc", "docx", "pdf", "txt", "zip", "rar", "xls", "xlsx", "ppt", "pptx", "mp4", "mp3"],
        fileUploadURL        : "",
        
        videoUpload          : false,
        videoFormats         : ["mp4", "webm", "ogv", "mov"],
        videoUploadURL       : "",
        
        toc                  : true,           // Table of contents
        tocm                 : false,           // Using [TOCM], auto create ToC dropdown menu
        tocTitle             : "",             // for ToC dropdown menu btn
        tocDropdown          : false,
        tocContainer         : "",
        tocStartLevel        : 1,              // Said from H1 to create ToC
        htmlDecode           : false,          // Open the HTML tag identification 
        pageBreak            : true,           // Enable parse page break [========]
        atLink               : true,           // for @link
        emailLink            : true,           // for email address auto link
        taskList             : false,          // Enable Github Flavored Markdown task lists
        tex                  : false,          // TeX(LaTeX), based on KaTeX
        flowChart            : false,          // flowChart.js only support IE9+
        sequenceDiagram      : false,          // sequenceDiagram.js only support IE9+
        previewCodeHighlight : true,
        pinyin               : false,          // Enable pinyin display syntax {text | pinyin}
        textAlign            : true,           // Enable text align syntax
        tableEdit            : true,           // Enable table row/col insert/delete
        toolbarDropdown      : true,           // Enable toolbar dropdown groups
        echarts              : false,          // Enable Apache ECharts support
        tabs                 : true,           // Enable tabs syntax
        columns              : true,           // Enable multi-column layout syntax
        tooltip              : true,           // Enable tooltip/popover syntax
        draftAutoSave        : false,          // Enable browser draft auto-save
        draftInterval        : 30,             // Draft auto-save interval in seconds
        draftMaxDays         : 30,             // Maximum days to keep drafts (auto cleanup older)

        toolbar              : true,           // show/hide toolbar
        toolbarAutoFixed     : true,           // on window scroll auto fixed position
        toolbarIcons         : "full",
        toolbarTitles        : {},
        toolbarHandlers      : {
            ucwords : function() {
                return editormd.toolbarHandlers.ucwords;
            },
            lowercase : function() {
                return editormd.toolbarHandlers.lowercase;
            }
        },
        toolbarCustomIcons   : {               // using html tag create toolbar icon, unused default <a> tag.
            lowercase        : "<a href=\"javascript:;\" title=\"Lowercase\" unselectable=\"on\"><i class=\"fa\" name=\"lowercase\" style=\"font-size:24px;margin-top: -10px;\">a</i></a>",
            "ucwords"        : "<a href=\"javascript:;\" title=\"ucwords\" unselectable=\"on\"><i class=\"fa\" name=\"ucwords\" style=\"font-size:20px;margin-top: -3px;\">Aa</i></a>"
        }, 
        toolbarIconsClass    : {
            undo             : "fa-undo",
            redo             : "fa-repeat",
            bold             : "fa-bold",
            del              : "fa-strikethrough",
            italic           : "fa-italic",
            quote            : "fa-quote-left",
            uppercase        : "fa-font",
            h1               : editormd.classPrefix + "bold",
            h2               : editormd.classPrefix + "bold",
            h3               : editormd.classPrefix + "bold",
            h4               : editormd.classPrefix + "bold",
            h5               : editormd.classPrefix + "bold",
            h6               : editormd.classPrefix + "bold",
            "list-ul"        : "fa-list-ul",
            "list-ol"        : "fa-list-ol",
            hr               : "fa-minus",
            link             : "fa-link",
            "reference-link" : "fa-anchor",
            image            : "fa-picture-o",
            video            : "fa-video-camera",
            file             : "fa-paperclip",
            code             : "fa-code",
            "preformatted-text" : "fa-file-code-o",
            "code-block"     : "fa-file-code-o",
            table            : "fa-table",
            datetime         : "fa-clock-o",
            "html-entities"  : "fa-copyright",
            pagebreak        : "fa-newspaper-o",
            "goto-line"      : "fa-terminal", // fa-crosshairs
            watch            : "fa-eye-slash",
            unwatch          : "fa-eye",
            preview          : "fa-desktop",
            search           : "fa-search",
            fullscreen       : "fa-arrows-alt",
            clear            : "fa-eraser",
            help             : "fa-question-circle",
            info             : "fa-info-circle",
            "align-left"     : "fa-align-left",
            "align-center"   : "fa-align-center",
            "align-right"    : "fa-align-right",
            "align-justify"  : "fa-align-justify",
            "table-edit"     : "fa-table",
            "insert"         : "fa-plus",
            "pinyin"         : "fa-language",
            "image-resize"   : "fa-arrows-alt",
            "echarts-bar"    : "fa-bar-chart",
            "echarts-line"   : "fa-line-chart",
            "echarts-pie"    : "fa-pie-chart",
            "echarts-radar"  : "fa-bullseye",
            "echarts-funnel" : "fa-filter",
            "chart"          : "fa-area-chart",
            "tabs"           : "fa-folder-o",
            "columns"        : "fa-newspaper-o",
            "tooltip"        : "fa-comment-o",
            "color"          : "fa-font",
            "bg-color"       : "fa-paint-brush"
        },        
        toolbarIconTexts     : {},
        
        lang : {
            name        : "zh-cn",
            description : "开源在线Markdown编辑器<br/>Open source online Markdown editor.",
            tocTitle    : "目录",
            toolbar     : {
                undo             : "撤销（Ctrl+Z）",
                redo             : "重做（Ctrl+Y）",
                bold             : "粗体",
                del              : "删除线",
                italic           : "斜体",
                quote            : "引用",
                ucwords          : "将每个单词首字母转成大写",
                uppercase        : "将所选转换成大写",
                lowercase        : "将所选转换成小写",
                h1               : "标题1",
                h2               : "标题2",
                h3               : "标题3",
                h4               : "标题4",
                h5               : "标题5",
                h6               : "标题6",
                "list-ul"        : "无序列表",
                "list-ol"        : "有序列表",
                hr               : "横线",
                link             : "链接",
                "reference-link" : "引用链接",
                image            : "添加图片",
                file             : "上传文件",
                code             : "行内代码",
                "preformatted-text" : "预格式文本 / 代码块（缩进风格）",
                "code-block"     : "代码块（多语言风格）",
                table            : "添加表格",
                datetime         : "日期时间",
                "html-entities"  : "HTML实体字符",
                pagebreak        : "插入分页符",
                "goto-line"      : "跳转到行",
                watch            : "关闭实时预览",
                unwatch          : "开启实时预览",
                preview          : "全窗口预览HTML（按 Shift + ESC还原）",
                fullscreen       : "全屏（按ESC还原）",
                clear            : "清空",
                search           : "搜索",
                help             : "使用帮助",
                info             : "关于" + editormd.title,
                "align-left"     : "左对齐",
                "align-center"   : "居中对齐",
                "align-right"    : "右对齐",
                "align-justify"  : "两端对齐",
                "table-edit"     : "表格编辑",
                insert           : "插入",
                pinyin           : "拼音标注",
                "image-resize"   : "图片尺寸",
                "echarts-bar"    : "柱状图",
                "echarts-line"   : "折线图",
                "echarts-pie"    : "饼图",
                "echarts-radar"  : "雷达图",
                "echarts-funnel" : "漏斗图",
                chart            : "图表",
                tabs             : "标签页",
                columns          : "多栏排版",
                tooltip          : "悬浮提示",
                color            : "文字颜色",
                "bg-color"       : "背景颜色"
            },
            buttons : {
                enter  : "确定",
                cancel : "取消",
                close  : "关闭"
            },
            dialog : {
                link : {
                    title    : "添加链接",
                    url      : "链接地址",
                    urlTitle : "链接标题",
                    urlEmpty : "错误：请填写链接地址。"
                },
                referenceLink : {
                    title    : "添加引用链接",
                    name     : "引用名称",
                    url      : "链接地址",
                    urlId    : "链接ID",
                    urlTitle : "链接标题",
                    nameEmpty: "错误：引用链接的名称不能为空。",
                    idEmpty  : "错误：请填写引用链接的ID。",
                    urlEmpty : "错误：请填写引用链接的URL地址。"
                },
                image : {
                    title    : "添加图片",
                    url      : "图片地址",
                    link     : "图片链接",
                    alt      : "图片描述",
                    uploadButton     : "本地上传",
                    imageURLEmpty    : "错误：图片地址不能为空。",
                    uploadFileEmpty  : "错误：上传的图片不能为空。",
                    formatNotAllowed : "错误：只允许上传图片文件，允许上传的图片文件格式有："
                },
                file : {
                    title    : "上传文件",
                    url      : "文件地址",
                    alt      : "文件名称",
                    uploadButton     : "本地上传",
                    fileURLEmpty     : "错误：文件地址不能为空。",
                    uploadFileEmpty  : "错误：上传的文件不能为空。",
                    formatNotAllowed : "错误：只允许上传指定格式的文件，允许上传的文件格式有：",
                    uploadError      : "上传出错，请检查接口返回格式是否正确。"
                },
                video : {
                    title         : "添加视频",
                    url           : "视频地址",
                    alt           : "视频描述",
                    uploadButton  : "本地上传",
                    size          : "尺寸 (宽x高)",
                    align         : "对齐方式",
                    alignLeft     : "左对齐",
                    alignCenter   : "居中",
                    alignRight    : "右对齐",
                    videoURLEmpty : "错误：视频地址不能为空。",
                    uploadFileEmpty : "错误：上传的视频不能为空。",
                    formatNotAllowed : "错误：只允许上传视频文件，允许上传的视频文件格式有：",
                    uploadError   : "上传出错"
                },
                preformattedText : {
                    title             : "添加预格式文本或代码块", 
                    emptyAlert        : "错误：请填写预格式文本或代码的内容。"
                },
                codeBlock : {
                    title             : "添加代码块",                    
                    selectLabel       : "代码语言：",
                    selectDefaultText : "请选择代码语言",
                    otherLanguage     : "其他语言",
                    unselectedLanguageAlert : "错误：请选择代码所属的语言类型。",
                    codeEmptyAlert    : "错误：请填写代码内容。"
                },
                htmlEntities : {
                    title : "HTML 实体字符"
                },
                help : {
                    title : "使用帮助"
                }
            }
        }
    };
    
    editormd.classNames  = {
        tex : editormd.classPrefix + "tex"
    };

    editormd.dialogZindex = 99999;
    
    editormd.$katex       = null;
    editormd.$marked      = null;
    editormd.$CodeMirror  = null;
    editormd.$prettyPrint = null;
    
    var timer, flowchartTimer;

    editormd.prototype    = editormd.fn = {
        state : {
            watching   : false,
            loaded     : false,
            preview    : false,
            fullscreen : false
        },
        
        /**
         * 构造函数/实例初始化
         * Constructor / instance initialization
         * 
         * @param   {String}   id            编辑器的ID
         * @param   {Object}   [options={}]  配置选项 Key/Value
         * @returns {editormd}               返回editormd的实例对象
         */
        
        init : function (id, options) {
            
            options              = options || {};
            
            if (typeof id === "object")
            {
                options = id;
            }
            
            var _this            = this;
            var classPrefix      = this.classPrefix  = editormd.classPrefix; 
            var settings         = this.settings     = $.extend(true, {}, editormd.defaults, options);
            
            id                   = (typeof id === "object") ? settings.id : id;
            
            var editor           = this.editor       = $("#" + id);
            
            this.id              = id;
            this.lang            = settings.lang;
            
            var classNames       = this.classNames   = {
                textarea : {
                    html     : classPrefix + "html-textarea",
                    markdown : classPrefix + "markdown-textarea"
                }
            };
            
            settings.pluginPath = (settings.pluginPath === "") ? settings.path + "../plugins/" : settings.pluginPath; 
            
            this.state.watching = (settings.watch) ? true : false;
            
            if ( !editor.hasClass("editormd") ) {
                editor.addClass("editormd");
            }
            
            editor.css({
                width  : (typeof settings.width  === "number") ? settings.width  + "px" : settings.width,
                height : (typeof settings.height === "number") ? settings.height + "px" : settings.height
            });
            
            if (settings.autoHeight)
            {
                editor.css("height", "auto");
            }
                        
            var markdownTextarea = this.markdownTextarea = editor.children("textarea");
            
            if (markdownTextarea.length < 1)
            {
                editor.append("<textarea></textarea>");
                markdownTextarea = this.markdownTextarea = editor.children("textarea");
            }
            
            markdownTextarea.addClass(classNames.textarea.markdown).attr("placeholder", settings.placeholder);
            
            if (typeof markdownTextarea.attr("name") === "undefined" || markdownTextarea.attr("name") === "")
            {
                markdownTextarea.attr("name", (settings.name !== "") ? settings.name : id + "-markdown-doc");
            }
            
            var appendElements = [
                (!settings.readOnly) ? "<a href=\"javascript:;\" class=\"fa fa-close " + classPrefix + "preview-close-btn\"></a>" : "",
                ( (settings.saveHTMLToTextarea) ? "<textarea class=\"" + classNames.textarea.html + "\" name=\"" + id + "-html-code\"></textarea>" : "" ),
                "<div class=\"" + classPrefix + "preview\"><div class=\"markdown-body " + classPrefix + "preview-container\"></div></div>",
                "<div class=\"" + classPrefix + "container-mask\" style=\"display:block;\"></div>",
                "<div class=\"" + classPrefix + "mask\"></div>"
            ].join("\n");
            
            editor.append(appendElements).addClass(classPrefix + "vertical");
            
            if (settings.theme !== "") 
            {
                editor.addClass(classPrefix + "theme-" + settings.theme);
            }
            
            this.mask          = editor.children("." + classPrefix + "mask");    
            this.containerMask = editor.children("." + classPrefix  + "container-mask");
            
            if (settings.markdown !== "")
            {
                markdownTextarea.val(settings.markdown);
            }
            
            if (settings.appendMarkdown !== "")
            {
                markdownTextarea.val(markdownTextarea.val() + settings.appendMarkdown);
            }
            
            this.htmlTextarea     = editor.children("." + classNames.textarea.html);            
            this.preview          = editor.children("." + classPrefix + "preview");
            this.previewContainer = this.preview.children("." + classPrefix + "preview-container");
            
            if (settings.previewTheme !== "") 
            {
                this.preview.addClass(classPrefix + "preview-theme-" + settings.previewTheme);
            }
            
            if (typeof define === "function" && define.amd)
            {
                if (typeof katex !== "undefined") 
                {
                    editormd.$katex = katex;
                }
                
                if (settings.searchReplace && !settings.readOnly) 
                {
                    editormd.loadCSS(settings.path + "codemirror/addon/dialog/dialog");
                    editormd.loadCSS(settings.path + "codemirror/addon/search/matchesonscrollbar");
                }
            }
            
            if ((typeof define === "function" && define.amd) || !settings.autoLoadModules)
            {
                if (typeof CodeMirror !== "undefined") {
                    editormd.$CodeMirror = CodeMirror;
                }
                
                if (typeof marked     !== "undefined") {
                    editormd.$marked     = marked;
                }
                
                this.setCodeMirror().setToolbar().loadedDisplay();
            } 
            else
            {
                this.loadQueues();
            }

            // Setup draft auto-save and recovery
            if (settings.draftAutoSave)
            {
                var draftIntervalMs = Math.max(5, settings.draftInterval || 30) * 1000;
                this.draftTimer = setInterval(function() {
                    _this.saveDraft();
                }, draftIntervalMs);

                // Check for existing drafts on init
                setTimeout(function() {
                    _this.showDraftRecovery();
                }, 500);
            }

            return this;
        },
        
        /**
         * 所需组件加载队列
         * Required components loading queue
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        loadQueues : function() {
            var _this        = this;
            var settings     = this.settings;
            var loadPath     = settings.path;
                                
            var onEditorReady = function() {
                if (editormd.isIE8) 
                {
                    _this.loadedDisplay();
                    return ;
                }
                _this.loadedDisplay();
            };

            editormd.loadCSS(loadPath + "codemirror/codemirror.min");
            
            if (settings.searchReplace && !settings.readOnly)
            {
                editormd.loadCSS(loadPath + "codemirror/addon/dialog/dialog");
                editormd.loadCSS(loadPath + "codemirror/addon/search/matchesonscrollbar");
            }
            
            if (settings.codeFold)
            {
                editormd.loadCSS(loadPath + "codemirror/addon/fold/foldgutter");            
            }
            
            editormd.loadScript(loadPath + "codemirror/codemirror.min", function() {
                editormd.$CodeMirror = CodeMirror;
                
                editormd.loadScript(loadPath + "diff_match_patch", function() {
                    
                editormd.loadScript(loadPath + "codemirror/modes.min", function() {
                    
                    editormd.loadScript(loadPath + "codemirror/addons.min", function() {
                        
                        _this.setCodeMirror();
                        
                        if (settings.mode !== "gfm" && settings.mode !== "markdown") 
                        {
                            _this.loadedDisplay();
                            
                            return false;
                        }
                        
                        _this.setToolbar();

                        editormd.loadScript(loadPath + "marked.min", function() {

                            editormd.$marked = marked;
                                
                            if (settings.previewCodeHighlight) 
                            {
                                editormd.loadScript(loadPath + "prettify.min", function() {
                                    onEditorReady();
                                });
                            } 
                            else
                            {                  
                                onEditorReady();
                            }
                        });
                        
                    });
                    
                });
                
                });
                
            });

            return this;
        },
        
        /**
         * 设置 Editor.md 的整体主题，主要是工具栏
         * Setting Editor.md theme
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setTheme : function(theme) {
            var editor      = this.editor;
            var oldTheme    = this.settings.theme;
            var themePrefix = this.classPrefix + "theme-";
            
            editor.removeClass(themePrefix + oldTheme).addClass(themePrefix + theme);
            
            this.settings.theme = theme;
            
            return this;
        },
        
        /**
         * 设置 CodeMirror（编辑区）的主题
         * Setting CodeMirror (Editor area) theme
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setEditorTheme : function(theme) {  
            var settings   = this.settings;  
            settings.editorTheme = theme;  
            
            if (theme !== "default")
            {
                editormd.loadCSS(settings.path + "codemirror/theme/" + settings.editorTheme);
            }
            
            this.cm.setOption("theme", theme);
            
            return this;
        },
        
        /**
         * setEditorTheme() 的别名
         * setEditorTheme() alias
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setCodeMirrorTheme : function (theme) {            
            this.setEditorTheme(theme);
            
            return this;
        },
        
        /**
         * 设置 Editor.md 的主题
         * Setting Editor.md theme
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setPreviewTheme : function(theme) {  
            var preview     = this.preview;
            var oldTheme    = this.settings.previewTheme;
            var themePrefix = this.classPrefix + "preview-theme-";
            
            preview.removeClass(themePrefix + oldTheme).addClass(themePrefix + theme);
            
            this.settings.previewTheme = theme;
            
            return this;
        },
        
        /**
         * 配置和初始化CodeMirror组件
         * CodeMirror initialization
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setCodeMirror : function() { 
            var settings         = this.settings;
            var editor           = this.editor;
            
            if (settings.editorTheme !== "default")
            {
                editormd.loadCSS(settings.path + "codemirror/theme/" + settings.editorTheme);
            }
            
            var codeMirrorConfig = {
                mode                      : settings.mode,
                theme                     : settings.editorTheme,
                tabSize                   : settings.tabSize,
                dragDrop                  : false,
                autofocus                 : settings.autoFocus,
                autoCloseTags             : settings.autoCloseTags,
                readOnly                  : (settings.readOnly) ? "nocursor" : false,
                indentUnit                : settings.indentUnit,
                lineNumbers               : settings.lineNumbers,
                lineWrapping              : settings.lineWrapping,
                extraKeys                 : {
                                                "Ctrl-Q": function(cm) { 
                                                    cm.foldCode(cm.getCursor()); 
                                                }
                                            },
                foldGutter                : settings.codeFold,
                gutters                   : ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                matchBrackets             : settings.matchBrackets,
                indentWithTabs            : settings.indentWithTabs,
                styleActiveLine           : settings.styleActiveLine,
                styleSelectedText         : settings.styleSelectedText,
                autoCloseBrackets         : settings.autoCloseBrackets,
                showTrailingSpace         : settings.showTrailingSpace,
                highlightSelectionMatches : ( (!settings.matchWordHighlight) ? false : { showToken: (settings.matchWordHighlight === "onselected") ? false : /\w/ } )
            };
            
            this.codeEditor = this.cm        = editormd.$CodeMirror.fromTextArea(this.markdownTextarea[0], codeMirrorConfig);
            this.codeMirror = this.cmElement = editor.children(".CodeMirror");
            
            if (settings.value !== "")
            {
                this.cm.setValue(settings.value);
            }

            this.codeMirror.css({
                fontSize : settings.fontSize,
                width    : (!settings.watch) ? "100%" : "50%"
            });
            
            if (settings.autoHeight)
            {
                this.codeMirror.css("height", "auto");
                this.cm.setOption("viewportMargin", Infinity);
            }
            
            if (!settings.lineNumbers)
            {
                this.codeMirror.find(".CodeMirror-gutters").css("border-right", "none");
            }

            return this;
        },
        
        /**
         * 获取CodeMirror的配置选项
         * Get CodeMirror setting options
         * 
         * @returns {Mixed}                  return CodeMirror setting option value
         */
        
        getCodeMirrorOption : function(key) {            
            return this.cm.getOption(key);
        },
        
        /**
         * 配置和重配置CodeMirror的选项
         * CodeMirror setting options / resettings
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setCodeMirrorOption : function(key, value) {
            
            this.cm.setOption(key, value);
            
            return this;
        },
        
        /**
         * 添加 CodeMirror 键盘快捷键
         * Add CodeMirror keyboard shortcuts key map
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        addKeyMap : function(map, bottom) {
            this.cm.addKeyMap(map, bottom);
            
            return this;
        },
        
        /**
         * 移除 CodeMirror 键盘快捷键
         * Remove CodeMirror keyboard shortcuts key map
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        removeKeyMap : function(map) {
            this.cm.removeKeyMap(map);
            
            return this;
        },
        
        /**
         * 跳转到指定的行
         * Goto CodeMirror line
         * 
         * @param   {String|Intiger}   line      line number or "first"|"last"
         * @returns {editormd}                   返回editormd的实例对象
         */
        
        gotoLine : function (line) {
            
            var settings = this.settings;
            
            if (!settings.gotoLine)
            {
                return this;
            }
            
            var cm       = this.cm;
            var editor   = this.editor;
            var count    = cm.lineCount();
            var preview  = this.preview;
            
            if (typeof line === "string")
            {
                if(line === "last")
                {
                    line = count;
                }
            
                if (line === "first")
                {
                    line = 1;
                }
            }
            
            if (typeof line !== "number") 
            {  
                alert("Error: The line number must be an integer.");
                return this;
            }
            
            line  = parseInt(line) - 1;
            
            if (line > count)
            {
                alert("Error: The line number range 1-" + count);
                
                return this;
            }
            
            cm.setCursor( {line : line, ch : 0} );
            
            var scrollInfo   = cm.getScrollInfo();
            var clientHeight = scrollInfo.clientHeight; 
            var coords       = cm.charCoords({line : line, ch : 0}, "local");
            
            cm.scrollTo(null, (coords.top + coords.bottom - clientHeight) / 2);
            
            if (settings.watch)
            {            
                var cmScroll  = this.codeMirror.find(".CodeMirror-scroll")[0];
                var height    = $(cmScroll).height(); 
                var scrollTop = cmScroll.scrollTop;
                var totalLines = cm.lineCount();
                var topLine   = cm.lineAtHeight(scrollTop, "local");
                var linePercent = totalLines > 1 ? (topLine / (totalLines - 1)) : 0;

                if (scrollTop === 0)
                {
                    preview.scrollTop(0);
                } 
                else if (scrollTop + height >= cmScroll.scrollHeight - 16)
                { 
                    preview.scrollTop(preview[0].scrollHeight);                    
                } 
                else
                {                    
                    preview.scrollTop(preview[0].scrollHeight * linePercent);
                }
            }

            cm.focus();
            
            return this;
        },
        
        /**
         * 扩展当前实例对象，可同时设置多个或者只设置一个
         * Extend editormd instance object, can mutil setting.
         * 
         * @returns {editormd}                  this(editormd instance object.)
         */
        
        extend : function() {
            if (typeof arguments[1] !== "undefined")
            {
                if (typeof arguments[1] === "function")
                {
                    arguments[1] = $.proxy(arguments[1], this);
                }

                this[arguments[0]] = arguments[1];
            }
            
            if (typeof arguments[0] === "object" && typeof arguments[0].length === "undefined")
            {
                $.extend(true, this, arguments[0]);
            }

            return this;
        },
        
        /**
         * 设置或扩展当前实例对象，单个设置
         * Extend editormd instance object, one by one
         * 
         * @param   {String|Object}   key       option key
         * @param   {String|Object}   value     option value
         * @returns {editormd}                  this(editormd instance object.)
         */
        
        set : function (key, value) {
            
            if (typeof value !== "undefined" && typeof value === "function")
            {
                value = $.proxy(value, this);
            }
            
            this[key] = value;

            return this;
        },
        
        /**
         * 重新配置
         * Resetting editor options
         * 
         * @param   {String|Object}   key       option key
         * @param   {String|Object}   value     option value
         * @returns {editormd}                  this(editormd instance object.)
         */
        
        config : function(key, value) {
            var settings = this.settings;
            
            if (typeof key === "object")
            {
                settings = $.extend(true, settings, key);
            }
            
            if (typeof key === "string")
            {
                settings[key] = value;
            }
            
            this.settings = settings;
            this.recreate();
            
            return this;
        },
        
        /**
         * 注册事件处理方法
         * Bind editor event handle
         * 
         * @param   {String}     eventType      event type
         * @param   {Function}   callback       回调函数
         * @returns {editormd}                  this(editormd instance object.)
         */
        
        on : function(eventType, callback) {
            var settings = this.settings;
            
            if (typeof settings["on" + eventType] !== "undefined") 
            {                
                settings["on" + eventType] = $.proxy(callback, this);      
            }

            return this;
        },
        
        /**
         * 解除事件处理方法
         * Unbind editor event handle
         * 
         * @param   {String}   eventType          event type
         * @returns {editormd}                    this(editormd instance object.)
         */
        
        off : function(eventType) {
            var settings = this.settings;
            
            if (typeof settings["on" + eventType] !== "undefined") 
            {
                settings["on" + eventType] = function(){};
            }
            
            return this;
        },
        
        /**
         * 显示工具栏
         * Display toolbar
         * 
         * @param   {Function} [callback=function(){}] 回调函数
         * @returns {editormd}  返回editormd的实例对象
         */
        
        showToolbar : function(callback) {
            var settings = this.settings;
            
            if(settings.readOnly) {
                return this;
            }
            
            if (settings.toolbar && (this.toolbar.length < 1 || this.toolbar.find("." + this.classPrefix + "menu").html() === "") )
            {
                this.setToolbar();
            }
            
            settings.toolbar = true; 
            
            this.toolbar.show();
            this.resize();
            
            $.proxy(callback || function(){}, this)();

            return this;
        },
        
        /**
         * 隐藏工具栏
         * Hide toolbar
         * 
         * @param   {Function} [callback=function(){}] 回调函数
         * @returns {editormd}                         this(editormd instance object.)
         */
        
        hideToolbar : function(callback) { 
            var settings = this.settings;
            
            settings.toolbar = false;  
            this.toolbar.hide();
            this.resize();
            
            $.proxy(callback || function(){}, this)();

            return this;
        },
        
        /**
         * 页面滚动时工具栏的固定定位
         * Set toolbar in window scroll auto fixed position
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setToolbarAutoFixed : function(fixed) {
            
            var state    = this.state;
            var editor   = this.editor;
            var toolbar  = this.toolbar;
            var settings = this.settings;
            
            if (typeof fixed !== "undefined")
            {
                settings.toolbarAutoFixed = fixed;
            }
            
            var autoFixedHandle = function(){
                var $window = $(window);
                var top     = $window.scrollTop();
                
                if (!settings.toolbarAutoFixed)
                {
                    return false;
                }

                if (top - editor.offset().top > 10 && top < editor.height())
                {
                    toolbar.css({
                        position : "fixed",
                        width    : editor.width() + "px",
                        left     : ($window.width() - editor.width()) / 2 + "px"
                    });
                }
                else
                {
                    toolbar.css({
                        position : "absolute",
                        width    : "100%",
                        left     : 0
                    });
                }
            };
            
            if (!state.fullscreen && !state.preview && settings.toolbar && settings.toolbarAutoFixed)
            {
                $(window).bind("scroll", autoFixedHandle);
            }

            return this;
        },
        
        /**
         * 配置和初始化工具栏
         * Set toolbar and Initialization
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setToolbar : function() {
            var settings    = this.settings;  
            
            if(settings.readOnly) {
                return this;
            }
            
            var editor      = this.editor;
            var preview     = this.preview;
            var classPrefix = this.classPrefix;
            
            var toolbar     = this.toolbar = editor.children("." + classPrefix + "toolbar");
            
            if (settings.toolbar && toolbar.length < 1)
            {            
                var toolbarHTML = "<div class=\"" + classPrefix + "toolbar\"><div class=\"" + classPrefix + "toolbar-container\"><ul class=\"" + classPrefix + "menu\"></ul></div></div>";
                
                editor.append(toolbarHTML);
                toolbar = this.toolbar = editor.children("." + classPrefix + "toolbar");
            }
            
            if (!settings.toolbar) 
            {
                toolbar.hide();
                
                return this;
            }
            
            toolbar.show();
            
            var icons       = (typeof settings.toolbarIcons === "function") ? settings.toolbarIcons() 
                            : ((typeof settings.toolbarIcons === "string")  ? editormd.toolbarModes[settings.toolbarIcons] : settings.toolbarIcons);
            
            var toolbarMenu = toolbar.find("." + this.classPrefix + "menu"), menu = "";
            var pullRight   = false;
            
            for (var i = 0, len = icons.length; i < len; i++)
            {
                var name = icons[i];
                var isDropdown = (typeof name === "object" && name !== null && settings.toolbarDropdown);
                var dropdownName = isDropdown ? Object.keys(name)[0] : name;
                var dropdownItems = isDropdown ? name[dropdownName] : null;

                if (!isDropdown && name === "||") 
                { 
                    pullRight = true;
                } 
                else if (!isDropdown && name === "|")
                {
                    menu += "<li class=\"divider\" unselectable=\"on\">|</li>";
                }
                else if (isDropdown && Array.isArray(dropdownItems))
                {
                    var dTitle = settings.lang.toolbar[dropdownName] || dropdownName;
                    var dIconClass = settings.toolbarIconsClass[dropdownName] || settings.toolbarIconsClass[dropdownItems[0]] || "";
                    var dIconTexts = settings.toolbarIconTexts[dropdownName] || "";
                    var dIsHeader = (/h(\d)/.test(dropdownName));

                    var dropdownHTML = pullRight ? "<li class=\"pull-right editormd-toolbar-dropdown\">" : "<li class=\"editormd-toolbar-dropdown\">";
                    dropdownHTML += "<a href=\"javascript:;\" title=\"" + dTitle + "\" unselectable=\"on\" class=\"editormd-dropdown-toggle\">";
                    dropdownHTML += "<i class=\"fa " + dIconClass + "\" name=\""+dropdownName+"\" unselectable=\"on\">"+((dIsHeader) ? dropdownName.toUpperCase() : ( (dIconClass === "") ? dIconTexts : "") ) + "</i>";
                    dropdownHTML += " <span class=\"fa fa-caret-down\"></span>";
                    dropdownHTML += "</a>";
                    dropdownHTML += "<ul class=\"editormd-dropdown-menu\">";
                    
                    for (var d = 0, dLen = dropdownItems.length; d < dLen; d++)
                    {
                        var subName = dropdownItems[d];
                        var subIsHeader = (/h(\d)/.test(subName));
                        var subIndex = subName;
                        if (subName === "watch" && !settings.watch) {
                            subIndex = "unwatch";
                        }
                        var subTitle = settings.lang.toolbar[subIndex] || "";
                        var subIconClass = settings.toolbarIconsClass[subIndex] || "";
                        var subIconTexts = settings.toolbarIconTexts[subIndex] || "";
                        
                        dropdownHTML += "<li>";
                        if (typeof settings.toolbarCustomIcons[subName] !== "undefined" && typeof settings.toolbarCustomIcons[subName] !== "function")
                        {
                            dropdownHTML += settings.toolbarCustomIcons[subName];
                        }
                        else
                        {
                            dropdownHTML += "<a href=\"javascript:;\" title=\"" + subTitle + "\" unselectable=\"on\">";
                            dropdownHTML += "<i class=\"fa " + subIconClass + "\" name=\""+subName+"\" unselectable=\"on\">"+((subIsHeader) ? subName.toUpperCase() : ( (subIconClass === "") ? subIconTexts : "") ) + "</i>";
                            dropdownHTML += "</a>";
                        }
                        dropdownHTML += "</li>";
                    }
                    
                    dropdownHTML += "</ul></li>";
                    menu = pullRight ? dropdownHTML + menu : menu + dropdownHTML;
                }
                else
                {
                    var isHeader = (/h(\d)/.test(name));
                    var index    = name;
                    
                    if (name === "watch" && !settings.watch) {
                        index = "unwatch";
                    }
                    
                    var title     = settings.lang.toolbar[index];
                    var iconTexts = settings.toolbarIconTexts[index];
                    var iconClass = settings.toolbarIconsClass[index];
                    
                    title     = (typeof title     === "undefined") ? "" : title;
                    iconTexts = (typeof iconTexts === "undefined") ? "" : iconTexts;
                    iconClass = (typeof iconClass === "undefined") ? "" : iconClass;

                    var menuItem = pullRight ? "<li class=\"pull-right\">" : "<li>";
                    
                    if (typeof settings.toolbarCustomIcons[name] !== "undefined" && typeof settings.toolbarCustomIcons[name] !== "function")
                    {
                        menuItem += settings.toolbarCustomIcons[name];
                    }
                    else 
                    {
                        menuItem += "<a href=\"javascript:;\" title=\"" + title + "\" unselectable=\"on\">";
                        menuItem += "<i class=\"fa " + iconClass + "\" name=\""+name+"\" unselectable=\"on\">"+((isHeader) ? name.toUpperCase() : ( (iconClass === "") ? iconTexts : "") ) + "</i>";
                        menuItem += "</a>";
                    }

                    menuItem += "</li>";

                    menu = pullRight ? menuItem + menu : menu + menuItem;
                }
            }

            toolbarMenu.html(menu);
            
            toolbarMenu.find("[title=\"Lowercase\"]").attr("title", settings.lang.toolbar.lowercase);
            toolbarMenu.find("[title=\"ucwords\"]").attr("title", settings.lang.toolbar.ucwords);
            
            this.setToolbarHandler();
            this.setToolbarAutoFixed();

            return this;
        },
        
        /**
         * 工具栏图标事件处理对象序列
         * Get toolbar icons event handlers
         * 
         * @param   {Object}   cm    CodeMirror的实例对象
         * @param   {String}   name  要获取的事件处理器名称
         * @returns {Object}         返回处理对象序列
         */
            
        dialogLockScreen : function() {
            $.proxy(editormd.dialogLockScreen, this)();
            
            return this;
        },

        dialogShowMask : function(dialog) {
            $.proxy(editormd.dialogShowMask, this)(dialog);
            
            return this;
        },
        
        getToolbarHandles : function(name) {  
            var toolbarHandlers = this.toolbarHandlers = editormd.toolbarHandlers;
            
            return (name && typeof toolbarIconHandlers[name] !== "undefined") ? toolbarHandlers[name] : toolbarHandlers;
        },
        
        /**
         * 工具栏图标事件处理器
         * Bind toolbar icons event handle
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setToolbarHandler : function() {
            var _this               = this;
            var settings            = this.settings;
            
            if (!settings.toolbar || settings.readOnly) {
                return this;
            }
            
            var toolbar             = this.toolbar;
            var cm                  = this.cm;
            var classPrefix         = this.classPrefix;           
            var toolbarIcons        = this.toolbarIcons = toolbar.find("." + classPrefix + "menu > li > a");  
            var toolbarIconHandlers = this.getToolbarHandles();  
            
            // Dropdown toggle handler
            toolbar.find("." + classPrefix + "toolbar-dropdown > ." + classPrefix + "dropdown-toggle").bind(editormd.mouseOrTouch("click", "touchend"), function(event) {
                var $this = $(this);
                var $dropdown = $this.parent();
                var $menu = $dropdown.children("." + classPrefix + "dropdown-menu");
                
                // Close other open dropdowns
                toolbar.find("." + classPrefix + "toolbar-dropdown.open").not($dropdown).removeClass("open");
                
                $dropdown.toggleClass("open");
                
                var closeDropdown = function(e) {
                    if (!$(e.target).closest($dropdown).length) {
                        $dropdown.removeClass("open");
                        $(document).off("click", closeDropdown);
                    }
                };
                
                if ($dropdown.hasClass("open")) {
                    $(document).on("click", closeDropdown);
                }
                
                return false;
            });
                
            toolbarIcons.bind(editormd.mouseOrTouch("click", "touchend"), function(event) {

                var icon                = $(this).children(".fa").first();
                var name                = icon.attr("name");
                var cursor              = cm.getCursor();
                var selection           = cm.getSelection();

                if (name === "" || typeof name === "undefined") {
                    return ;
                }
                
                _this.activeIcon = icon;

                if (typeof toolbarIconHandlers[name] !== "undefined") 
                {
                    $.proxy(toolbarIconHandlers[name], _this)(cm);
                }
                else 
                {
                    if (typeof settings.toolbarHandlers[name] !== "undefined") 
                    {
                        $.proxy(settings.toolbarHandlers[name], _this)(cm, icon, cursor, selection);
                    }
                }
                
                if (name !== "link" && name !== "reference-link" && name !== "image" && name !== "code-block" && 
                    name !== "preformatted-text" && name !== "watch" && name !== "preview" && name !== "search" && name !== "fullscreen" && name !== "info") 
                {
                    cm.focus();
                }

                return false;

            });
            
            // Dropdown menu item click handler
            toolbar.find("." + classPrefix + "dropdown-menu > li > a").bind(editormd.mouseOrTouch("click", "touchend"), function(event) {
                var icon      = $(this).children(".fa").first();
                var name      = icon.attr("name");
                var cursor    = cm.getCursor();
                var selection = cm.getSelection();
                
                if (name === "" || typeof name === "undefined") {
                    return false;
                }
                
                // Close dropdown
                $(this).closest("." + classPrefix + "toolbar-dropdown").removeClass("open");
                
                _this.activeIcon = icon;
                
                if (typeof toolbarIconHandlers[name] !== "undefined") 
                {
                    $.proxy(toolbarIconHandlers[name], _this)(cm);
                }
                else 
                {
                    if (typeof settings.toolbarHandlers[name] !== "undefined") 
                    {
                        $.proxy(settings.toolbarHandlers[name], _this)(cm, icon, cursor, selection);
                    }
                }
                
                if (name !== "link" && name !== "reference-link" && name !== "image" && name !== "code-block" && 
                    name !== "preformatted-text" && name !== "watch" && name !== "preview" && name !== "search" && name !== "fullscreen" && name !== "info") 
                {
                    cm.focus();
                }
                
                return false;
            });

            return this;
        },
        
        /**
         * 动态创建对话框
         * Creating custom dialogs
         * 
         * @param   {Object} options  配置项键值对 Key/Value
         * @returns {dialog}          返回创建的dialog的jQuery实例对象
         */
        
        createDialog : function(options) {            
            return $.proxy(editormd.createDialog, this)(options);
        },
        
        /**
         * 创建关于Editor.md的对话框
         * Create about Editor.md dialog
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        createInfoDialog : function() {
            var _this        = this;
			var editor       = this.editor;
            var classPrefix  = this.classPrefix;  
            
            var infoDialogHTML = [
                "<div class=\"" + classPrefix + "dialog " + classPrefix + "dialog-info\" style=\"\">",
                "<div class=\"" + classPrefix + "dialog-container\">",
                "<h1><i class=\"editormd-logo editormd-logo-lg editormd-logo-color\"></i> " + editormd.title + "<small>v" + editormd.version + "</small></h1>",
                "<p>" + this.lang.description + "</p>",
                "<p style=\"margin: 10px 0 20px 0;\"><a href=\"" + editormd.homePage + "\" target=\"_blank\">" + editormd.homePage + " <i class=\"fa fa-external-link\"></i></a></p>",
                "<p style=\"font-size: 0.85em;\">Copyright &copy; 2015 <a href=\"https://github.com/pandao\" target=\"_blank\" class=\"hover-link\">Pandao</a>, The <a href=\"https://github.com/pandao/editor.md/blob/master/LICENSE\" target=\"_blank\" class=\"hover-link\">MIT</a> License.</p>",
                "</div>",
                "<a href=\"javascript:;\" class=\"fa fa-close " + classPrefix + "dialog-close\"></a>",
                "</div>"
            ].join("\n");

            editor.append(infoDialogHTML);
            
            var infoDialog  = this.infoDialog = editor.children("." + classPrefix + "dialog-info");

            infoDialog.find("." + classPrefix + "dialog-close").bind(editormd.mouseOrTouch("click", "touchend"), function() {
                _this.hideInfoDialog();
            });
            
            infoDialog.css("border", (editormd.isIE8) ? "1px solid #ddd" : "").css("z-index", editormd.dialogZindex).show();
            
            this.infoDialogPosition();

            return this;
        },
        
        /**
         * 关于Editor.md对话居中定位
         * Editor.md dialog position handle
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        infoDialogPosition : function() {
            var infoDialog = this.infoDialog;
            
			var _infoDialogPosition = function() {
				infoDialog.css({
					top  : ($(window).height() - infoDialog.height()) / 2 + "px",
					left : ($(window).width()  - infoDialog.width()) / 2  + "px"
				});
			};

			_infoDialogPosition();

			$(window).resize(_infoDialogPosition);
            
            return this;
        },
        
        /**
         * 显示关于Editor.md
         * Display about Editor.md dialog
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        showInfoDialog : function() {

            $("html,body").css("overflow-x", "hidden");
            
            var _this       = this;
			var editor      = this.editor;
            var settings    = this.settings;         
			var infoDialog  = this.infoDialog = editor.children("." + this.classPrefix + "dialog-info");
            
            if (infoDialog.length < 1)
            {
                this.createInfoDialog();
            }
            
            this.lockScreen(true);
            
            this.mask.css({
						opacity         : settings.dialogMaskOpacity,
						backgroundColor : settings.dialogMaskBgColor
					}).show();

			infoDialog.css("z-index", editormd.dialogZindex).show();

			this.infoDialogPosition();

            return this;
        },
        
        /**
         * 隐藏关于Editor.md
         * Hide about Editor.md dialog
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        hideInfoDialog : function() {            
            $("html,body").css("overflow-x", "");
            this.infoDialog.hide();
            this.mask.hide();
            this.lockScreen(false);

            return this;
        },
        
        /**
         * 锁屏
         * lock screen
         * 
         * @param   {Boolean}    lock    Boolean 布尔值，是否锁屏
         * @returns {editormd}           返回editormd的实例对象
         */
        
        lockScreen : function(lock) {
            editormd.lockScreen(lock);
            this.resize();

            return this;
        },
        
        /**
         * 编辑器界面重建，用于动态语言包或模块加载等
         * Recreate editor
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        recreate : function() {
            var _this            = this;
            var editor           = this.editor;
            var settings         = this.settings;
            
            this.codeMirror.remove();
            
            this.setCodeMirror();

            if (!settings.readOnly) 
            {
                if (editor.find(".editormd-dialog").length > 0) {
                    editor.find(".editormd-dialog").remove();
                }
                
                if (settings.toolbar) 
                {  
                    this.getToolbarHandles();                  
                    this.setToolbar();
                }
            }
            
            this.loadedDisplay(true);

            return this;
        },
        
        /**
         * 高亮预览HTML的pre代码部分
         * highlight of preview codes
         * 
         * @returns {editormd}             返回editormd的实例对象
         */
        
        previewCodeHighlight : function() {    
            var settings         = this.settings;
            var previewContainer = this.previewContainer;
            
            if (settings.previewCodeHighlight) 
            {
                previewContainer.find("pre").addClass("prettyprint linenums");
                
                if (typeof prettyPrint !== "undefined")
                {                    
                    prettyPrint();
                }
            }

            return this;
        },
        
        /**
         * 解析TeX(KaTeX)科学公式
         * TeX(KaTeX) Renderer
         * 
         * @returns {editormd}             返回editormd的实例对象
         */
        
        katexRender : function() {
            
            if (timer === null)
            {
                return this;
            }
            
            var _this = this;
            this.previewContainer.find("." + editormd.classNames.tex).each(function(){
                var tex  = $(this);
                var texCode = tex.text().trim();
                editormd.$katex.render(texCode, tex[0]);
                
                tex.find(".katex").css("font-size", "1.6em");
                
                // Double click to edit formula in source
                tex.attr("title", "双击编辑公式").css("cursor", "pointer");
                tex.off("dblclick.editormd-tex").on("dblclick.editormd-tex", function() {
                    var cm = _this.cm;
                    var markdown = cm.getValue();
                    var searchPattern = texCode.indexOf("\n") >= 0 ? 
                        "$$" + texCode + "$$" : 
                        "$$" + texCode + "$$";
                    var idx = markdown.indexOf(searchPattern);
                    if (idx >= 0) {
                        var line = markdown.substr(0, idx).split("\n").length - 1;
                        var ch = idx - markdown.lastIndexOf("\n", idx) - 1;
                        cm.setCursor({line: line, ch: ch});
                        cm.focus();
                    }
                });
            });   

            return this;
        },
        
        /**
         * 解析和渲染流程图及时序图
         * FlowChart and SequenceDiagram Renderer
         * 
         * @returns {editormd}             返回editormd的实例对象
         */
        
        flowChartAndSequenceDiagramRender : function() {
            var $this            = this;
            var settings         = this.settings;
            var previewContainer = this.previewContainer;
            
            if (editormd.isIE8) {
                return this;
            }

            if (settings.flowChart) {
                if (flowchartTimer === null) {
                    return this;
                }
                
                previewContainer.find(".flowchart").flowChart(); 
            }

            if (settings.sequenceDiagram) {
                previewContainer.find(".sequence-diagram").sequenceDiagram({theme: "simple"});
            }
                    
            var preview    = $this.preview;
            var codeMirror = $this.codeMirror;
            var codeView   = codeMirror.find(".CodeMirror-scroll");

            var height    = codeView.height();
            var scrollTop = codeView.scrollTop();                    
            var percent   = (scrollTop / codeView[0].scrollHeight);
            var tocHeight = 0;

            preview.find(".markdown-toc-list").each(function(){
                tocHeight += $(this).height();
            });

            var tocMenuHeight = preview.find(".editormd-toc-menu").height(); 
            tocMenuHeight = (!tocMenuHeight) ? 0 : tocMenuHeight;

            if (scrollTop === 0) 
            {
                preview.scrollTop(0);
            } 
            else if (scrollTop + height >= codeView[0].scrollHeight - 16)
            { 
                preview.scrollTop(preview[0].scrollHeight);                        
            } 
            else
            {                  
                preview.scrollTop((preview[0].scrollHeight + tocHeight + tocMenuHeight) * percent);
            }

            return this;
        },
        
        /**
         * 注册键盘快捷键处理
         * Register CodeMirror keyMaps (keyboard shortcuts).
         * 
         * @param   {Object}    keyMap      KeyMap key/value {"(Ctrl/Shift/Alt)-Key" : function(){}}
         * @returns {editormd}              return this
         */
        
        registerKeyMaps : function(keyMap) {
            
            var _this           = this;
            var cm              = this.cm;
            var settings        = this.settings;
            var toolbarHandlers = editormd.toolbarHandlers;
            var disabledKeyMaps = settings.disabledKeyMaps;
            
            keyMap              = keyMap || null;
            
            if (keyMap)
            {
                for (var i in keyMap)
                {
                    if ($.inArray(i, disabledKeyMaps) < 0)
                    {
                        var map = {};
                        map[i]  = keyMap[i];

                        cm.addKeyMap(keyMap);
                    }
                }
            }
            else
            {
                for (var k in editormd.keyMaps)
                {
                    var _keyMap = editormd.keyMaps[k];
                    var handle = (typeof _keyMap === "string") ? $.proxy(toolbarHandlers[_keyMap], _this) : $.proxy(_keyMap, _this);
                    
                    if ($.inArray(k, ["F9", "F10", "F11"]) < 0 && $.inArray(k, disabledKeyMaps) < 0)
                    {
                        var _map = {};
                        _map[k] = handle;

                        cm.addKeyMap(_map);
                    }
                }
                
                $(window).keydown(function(event) {
                    
                    var keymaps = {
                        "120" : "F9",
                        "121" : "F10",
                        "122" : "F11"
                    };
                    
                    if ( $.inArray(keymaps[event.keyCode], disabledKeyMaps) < 0 )
                    {
                        switch (event.keyCode)
                        {
                            case 120:
                                    $.proxy(toolbarHandlers["watch"], _this)();
                                    return false;
                                break;
                                
                            case 121:
                                    $.proxy(toolbarHandlers["preview"], _this)();
                                    return false;
                                break;
                                
                            case 122:
                                    $.proxy(toolbarHandlers["fullscreen"], _this)();                        
                                    return false;
                                break;
                                
                            default:
                                break;
                        }
                    }
                });
            }

            return this;
        },
        
        /**
         * 绑定同步滚动
         * 
         * @returns {editormd} return this
         */
        
        bindScrollEvent : function() {
            
            var _this            = this;
            var preview          = this.preview;
            var settings         = this.settings;
            var codeMirror       = this.codeMirror;
            var mouseOrTouch     = editormd.mouseOrTouch;
            
            if (!settings.syncScrolling) {
                return this;
            }
                
            var cmBindScroll = function() {    
                codeMirror.find(".CodeMirror-scroll").bind(mouseOrTouch("scroll", "touchmove"), function(event) {
                    var height    = $(this).height();
                    var scrollTop = $(this).scrollTop();
                    var cm        = _this.cm;
                    var totalLines = cm.lineCount();
                    var topLine   = cm.lineAtHeight(scrollTop, "local");
                    var linePercent = totalLines > 1 ? (topLine / (totalLines - 1)) : 0;
                    
                    var tocHeight = 0;
                    
                    preview.find(".markdown-toc-list").each(function(){
                        tocHeight += $(this).height();
                    });
                    
                    var tocMenuHeight = preview.find(".editormd-toc-menu").height();
                    tocMenuHeight = (!tocMenuHeight) ? 0 : tocMenuHeight;

                    if (scrollTop === 0) 
                    {
                        preview.scrollTop(0);
                    } 
                    else if (scrollTop + height >= $(this)[0].scrollHeight - 16)
                    { 
                        preview.scrollTop(preview[0].scrollHeight);                        
                    } 
                    else
                    {
                        preview.scrollTop((preview[0].scrollHeight + tocHeight + tocMenuHeight) * linePercent);
                    }
                    
                    $.proxy(settings.onscroll, _this)(event);
                });
            };

            var cmUnbindScroll = function() {
                codeMirror.find(".CodeMirror-scroll").unbind(mouseOrTouch("scroll", "touchmove"));
            };

            var previewBindScroll = function() {
                
                preview.bind(mouseOrTouch("scroll", "touchmove"), function(event) {
                    var height    = $(this).height();
                    var scrollTop = $(this).scrollTop();         
                    var codeView  = codeMirror.find(".CodeMirror-scroll");
                    var cm        = _this.cm;
                    var totalLines = cm.lineCount();
                    var previewHeight = $(this)[0].scrollHeight;
                    var linePercent = previewHeight > 0 ? (scrollTop / previewHeight) : 0;
                    var targetLine  = Math.min(totalLines - 1, Math.floor(linePercent * totalLines));
                    var targetY     = cm.charCoords({line: targetLine, ch: 0}, "local").top;

                    if(scrollTop === 0) 
                    {
                        codeView.scrollTop(0);
                    }
                    else if (scrollTop + height >= previewHeight)
                    {
                        codeView.scrollTop(codeView[0].scrollHeight);                        
                    }
                    else 
                    {
                        codeView.scrollTop(targetY);
                    }
                    
                    $.proxy(settings.onpreviewscroll, _this)(event);
                });

            };

            var previewUnbindScroll = function() {
                preview.unbind(mouseOrTouch("scroll", "touchmove"));
            }; 

			codeMirror.bind({
				mouseover  : cmBindScroll,
				mouseout   : cmUnbindScroll,
				touchstart : cmBindScroll,
				touchend   : cmUnbindScroll
			});
            
            if (settings.syncScrolling === "single") {
                return this;
            }
            
			preview.bind({
				mouseover  : previewBindScroll,
				mouseout   : previewUnbindScroll,
				touchstart : previewBindScroll,
				touchend   : previewUnbindScroll
			});

            return this;
        },
        
        bindChangeEvent : function() {
            
            var _this            = this;
            var cm               = this.cm;
            var settings         = this.settings;
            var editor           = this.editor;
            
            if (!settings.syncScrolling) {
                return this;
            }
            
            cm.on("change", function(_cm, changeObj) {
                
                if (settings.watch)
                {
                    _this.previewContainer.css("padding", settings.autoHeight ? "20px 20px 50px 40px" : "20px");
                }
                
                timer = setTimeout(function() {
                    clearTimeout(timer);
                    _this.save();
                    timer = null;
                }, settings.delay);
            });
            
            // Enhanced event handling
            cm.on("keydown", function(_cm, e) {
                $.proxy(settings.onkeydown, _this)(_cm, e);
            });
            
            cm.on("keyup", function(_cm, e) {
                $.proxy(settings.onkeyup, _this)(_cm, e);
            });
            
            cm.on("mouseup", function(_cm, e) {
                $.proxy(settings.onmouseup, _this)(_cm, e);
            });
            
            cm.on("mousedown", function(_cm, e) {
                $.proxy(settings.onmousedown, _this)(_cm, e);
            });
            
            cm.on("paste", function(_cm, e) {
                $.proxy(settings.onpaste, _this)(_cm, e);
            });
            
            cm.on("drop", function(_cm, e) {
                $.proxy(settings.ondrop, _this)(_cm, e);
            });
            
            cm.on("copy", function(_cm, e) {
                $.proxy(settings.oncopy, _this)(_cm, e);
            });
            
            cm.on("cut", function(_cm, e) {
                $.proxy(settings.oncut, _this)(_cm, e);
            });
            
            cm.on("focus", function(_cm, e) {
                editor.addClass("editormd-focus");
                $.proxy(settings.onfocus, _this)(_cm, e);
            });
            
            cm.on("blur", function(_cm, e) {
                editor.removeClass("editormd-focus");
                $.proxy(settings.onblur, _this)(_cm, e);
            });
            
            cm.on("cursorActivity", function(_cm) {
                $.proxy(settings.oncursoractivity, _this)(_cm);
            });

            return this;
        },
        
        /**
         * 加载队列完成之后的显示处理
         * Display handle of the module queues loaded after.
         * 
         * @param   {Boolean}   recreate   是否为重建编辑器
         * @returns {editormd}             返回editormd的实例对象
         */
        
        loadedDisplay : function(recreate) {
            
            recreate             = recreate || false;
            
            var _this            = this;
            var editor           = this.editor;
            var preview          = this.preview;
            var settings         = this.settings;
            
            this.containerMask.hide();
            
            this.save();
            
            if (settings.watch) {
                preview.show();
            }
            
            editor.data("oldWidth", editor.width()).data("oldHeight", editor.height()); // 为了兼容Zepto
            
            this.resize();
            this.registerKeyMaps();
            
            $(window).resize(function(){
                _this.resize();
            });
            
            this.bindScrollEvent().bindChangeEvent();
            
            if (!recreate)
            {
                $.proxy(settings.onload, this)();
            }
            
            this.state.loaded = true;

            return this;
        },
        
        /**
         * 设置编辑器的宽度
         * Set editor width
         * 
         * @param   {Number|String} width  编辑器宽度值
         * @returns {editormd}             返回editormd的实例对象
         */
        
        width : function(width) {
                
            this.editor.css("width", (typeof width === "number") ? width  + "px" : width);            
            this.resize();
            
            return this;
        },
        
        /**
         * 设置编辑器的高度
         * Set editor height
         * 
         * @param   {Number|String} height  编辑器高度值
         * @returns {editormd}              返回editormd的实例对象
         */
        
        height : function(height) {
                
            this.editor.css("height", (typeof height === "number")  ? height  + "px" : height);            
            this.resize();
            
            return this;
        },
        
        /**
         * 调整编辑器的尺寸和布局
         * Resize editor layout
         * 
         * @param   {Number|String} [width=null]  编辑器宽度值
         * @param   {Number|String} [height=null] 编辑器高度值
         * @returns {editormd}                    返回editormd的实例对象
         */
        
        resize : function(width, height) {
            
            width  = width  || null;
            height = height || null;
            
            var state      = this.state;
            var editor     = this.editor;
            var preview    = this.preview;
            var toolbar    = this.toolbar;
            var settings   = this.settings;
            var codeMirror = this.codeMirror;
            
            if (width)
            {
                editor.css("width", (typeof width  === "number") ? width  + "px" : width);
            }
            
            if (settings.autoHeight && !state.fullscreen && !state.preview)
            {
                editor.css("height", "auto");
                codeMirror.css("height", "auto");
            } 
            else 
            {
                if (height) 
                {
                    editor.css("height", (typeof height === "number") ? height + "px" : height);
                }
                
                if (state.fullscreen)
                {
                    editor.height($(window).height());
                }

                if (settings.toolbar && !settings.readOnly) 
                {
                    codeMirror.css("margin-top", toolbar.height() + 1).height(editor.height() - toolbar.height());
                } 
                else
                {
                    codeMirror.css("margin-top", 0).height(editor.height());
                }
            }
            
            if(settings.watch) 
            {
                codeMirror.width(editor.width() / 2);
                preview.width((!state.preview) ? editor.width() / 2 : editor.width());
                
                this.previewContainer.css("padding", settings.autoHeight ? "20px 20px 50px 40px" : "20px");
                
                if (settings.toolbar && !settings.readOnly) 
                {
                    preview.css("top", toolbar.height() + 1);
                } 
                else 
                {
                    preview.css("top", 0);
                }
                
                if (settings.autoHeight && !state.fullscreen && !state.preview)
                {
                    preview.height("");
                }
                else
                {                
                    var previewHeight = (settings.toolbar && !settings.readOnly) ? editor.height() - toolbar.height() : editor.height();
                    
                    preview.height(previewHeight);
                }
            } 
            else 
            {
                codeMirror.width(editor.width());
                preview.hide();
            }
            
            if (state.loaded) 
            {
                $.proxy(settings.onresize, this)();
            }

            return this;
        },
        
        /**
         * 解析和保存Markdown代码
         * Parse & Saving Markdown source code
         * 
         * @returns {editormd}     返回editormd的实例对象
         */
        
        save : function() {
            
            var _this            = this;
            var state            = this.state;
            var settings         = this.settings;

            if (timer === null && !(!settings.watch && state.preview))
            {
                return this;
            }
            
            $.proxy(settings.onbeforesave, this)();
            
            var cm               = this.cm;            
            var cmValue          = cm.getValue();
            var previewContainer = this.previewContainer;

            if (settings.mode !== "gfm" && settings.mode !== "markdown") 
            {
                this.markdownTextarea.val(cmValue);
                $.proxy(settings.onaftersave, this)();
                return this;
            }
            
            var marked          = editormd.$marked;
            var markdownToC     = this.markdownToC = [];            
            var rendererOptions = this.markedRendererOptions = {  
                toc                  : settings.toc,
                tocm                 : settings.tocm,
                tocStartLevel        : settings.tocStartLevel,
                pageBreak            : settings.pageBreak,
                taskList             : settings.taskList,
                tex                  : settings.tex,
                atLink               : settings.atLink,           // for @link
                emailLink            : settings.emailLink,        // for mail address auto link
                flowChart            : settings.flowChart,
                sequenceDiagram      : settings.sequenceDiagram,
                previewCodeHighlight : settings.previewCodeHighlight,
                pinyin               : settings.pinyin,
                textAlign            : settings.textAlign,
                imageResize          : settings.imageResize,
                echarts              : settings.echarts,
                tabs                 : settings.tabs,
                columns              : settings.columns,
                tooltip              : settings.tooltip
            };
            
            var markedOptions = this.markedOptions = {
                renderer    : editormd.markedRenderer(markdownToC, rendererOptions),
                gfm         : true,
                tables      : true,
                breaks      : true,
                pedantic    : false,
                sanitize    : (settings.htmlDecode) ? false : true,  // 关闭忽略HTML标签，即开启识别HTML标签，默认为false
                smartLists  : true,
                smartypants : true
            };
            
            marked.setOptions(markedOptions);

            // Preprocess custom block syntax (tabs, columns, align) before marked parsing
            var preprocessResult = editormd.preprocessMarkdownBlocks(cmValue, rendererOptions);
            var newMarkdownDoc = editormd.$marked(preprocessResult.markdown, markedOptions);
            newMarkdownDoc = editormd.restorePlaceholders(newMarkdownDoc, preprocessResult.placeholders);

            //console.info("cmValue", cmValue, newMarkdownDoc);

            newMarkdownDoc = editormd.filterHTMLTags(newMarkdownDoc, settings.htmlDecode);
            
            //console.error("cmValue", cmValue, newMarkdownDoc);
            
            this.markdownTextarea.text(cmValue);
            
            cm.save();
            
            if (settings.saveHTMLToTextarea) 
            {
                this.htmlTextarea.text(newMarkdownDoc);
            }
            
            if(settings.watch || (!settings.watch && state.preview))
            {
                previewContainer.html(newMarkdownDoc);

                this.previewCodeHighlight();
                
                if (settings.toc) 
                {
                    var tocContainer = (settings.tocContainer === "") ? previewContainer : $(settings.tocContainer);
                    var tocMenu      = tocContainer.find("." + this.classPrefix + "toc-menu");
                    
                    tocContainer.attr("previewContainer", (settings.tocContainer === "") ? "true" : "false");
                    
                    if (settings.tocContainer !== "" && tocMenu.length > 0)
                    {
                        tocMenu.remove();
                    }
                    
                    editormd.markdownToCRenderer(markdownToC, tocContainer, settings.tocDropdown, settings.tocStartLevel);
            
                    if (settings.tocDropdown || tocContainer.find("." + this.classPrefix + "toc-menu").length > 0)
                    {
                        editormd.tocDropdownMenu(tocContainer, (settings.tocTitle !== "") ? settings.tocTitle : this.lang.tocTitle);
                    }
            
                    if (settings.tocContainer !== "")
                    {
                        previewContainer.find(".markdown-toc").css("border", "none");
                    }
                }
                
                if (settings.tex)
                {
                    if (!editormd.kaTeXLoaded && settings.autoLoadModules) 
                    {
                        editormd.loadKaTeX(function() {
                            editormd.$katex = katex;
                            editormd.kaTeXLoaded = true;
                            _this.katexRender();
                        });
                    } 
                    else 
                    {
                        editormd.$katex = katex;
                        this.katexRender();
                    }
                }                
                
                // Lazy load flowchart / sequence-diagram if preview contains corresponding elements
                if (settings.flowChart || settings.sequenceDiagram)
                {
                    var hasFlowChart = previewContainer.find(".flowchart").length > 0;
                    var hasSequence  = previewContainer.find(".sequence-diagram").length > 0;
                    if (hasFlowChart || hasSequence) {
                        var renderFs = function() {
                            _this.flowChartAndSequenceDiagramRender();
                        };
                        var needRaphael = (hasFlowChart && typeof flowchart === "undefined") || 
                                          (hasSequence && typeof Diagram === "undefined");
                        if (needRaphael) {
                            editormd.loadScript(settings.path + "raphael.min", function() {
                                editormd.loadScript(settings.path + "underscore.min", function() {
                                    var pending = 0;
                                    var checkDone = function() {
                                        pending--;
                                        if (pending <= 0) renderFs();
                                    };
                                    if (hasFlowChart && typeof flowchart === "undefined") {
                                        pending++;
                                        editormd.loadScript(settings.path + "flowchart.min", function() {
                                            editormd.loadScript(settings.path + "jquery.flowchart.min", checkDone);
                                        });
                                    }
                                    if (hasSequence && typeof Diagram === "undefined") {
                                        pending++;
                                        editormd.loadScript(settings.path + "sequence-diagram.min", checkDone);
                                    }
                                    if (pending === 0) renderFs();
                                });
                            });
                        } else {
                            renderFs();
                        }
                    }
                }

                if (state.loaded) 
                {
                    $.proxy(settings.onchange, this)();
                }
                
                // Initialize table editing and image resize in preview
                if (settings.tableEdit) {
                    _this.initTableEdit();
                }
                if (settings.imageResize) {
                    _this.initImageResize();
                }
                if (settings.echarts) {
                    var echartsElements = previewContainer.find(".editormd-echarts");
                    if (echartsElements.length > 0) {
                        if (typeof echarts === "undefined") {
                            editormd.loadScript(settings.path + "echarts.min", function() {
                                _this.initECharts();
                            });
                        } else {
                            _this.initECharts();
                        }
                    }
                }
                if (settings.tabs) {
                    _this.initTabs();
                }
                if (settings.columns) {
                    _this.initColumns();
                }
                if (settings.tooltip) {
                    _this.initTooltips();
                }
                
                // Add copy buttons to all <pre> code blocks
                _this.initCopyButton();
            }
            
            $.proxy(settings.onaftersave, this)();

            // Auto-save draft after successful save
            if (settings.draftAutoSave) {
                this.saveDraft();
            }

            return this;
        },
        
        /**
         * Initialize table editing in preview area
         */
        initTableEdit : function() {
            var _this = this;
            var previewContainer = this.previewContainer;
            var cm = this.cm;
            var markdown = cm.getValue();
            var lines = markdown.split("\n");
            
            // Find all table blocks in markdown source
            var allTableBlocks = [];
            var i = 0;
            while (i < lines.length) {
                if (/^\|/.test(lines[i])) {
                    var blockStart = i;
                    i++;
                    while (i < lines.length && (/^\|/.test(lines[i]) || lines[i].trim() === "")) {
                        if (lines[i].trim() === "") {
                            // blank line inside table - skip but don't break (some tables have blank lines)
                            i++;
                            continue;
                        }
                        i++;
                    }
                    allTableBlocks.push({ start: blockStart, end: i - 1 });
                } else {
                    i++;
                }
            }
            
            var tableBlockIndex = 0;
            
            previewContainer.find("table").each(function() {
                var $table = $(this);
                if ($table.hasClass("editormd-table-editable")) {
                    return;
                }
                $table.addClass("editormd-table-editable");
                
                var $wrapper = $('<div class="editormd-table-wrapper"></div>');
                $table.wrap($wrapper);
                $wrapper = $table.parent();
                
                // Store table block reference
                var currentBlock = (tableBlockIndex < allTableBlocks.length) ? allTableBlocks[tableBlockIndex] : null;
                if (currentBlock) {
                    $wrapper.data("table-start", currentBlock.start);
                    $wrapper.data("table-end", currentBlock.end);
                    // Also store first column header text for re-identification after modifications
                    var firstHeaderCell = lines[currentBlock.start].split("|");
                    var headerText = (firstHeaderCell[1] || "").trim();
                    $wrapper.data("table-identifier", headerText);
                }
                tableBlockIndex++;
                
                // Add column controls (positioned above selected column)
                var colControls = [
                    '<div class="editormd-table-col-controls">',
                    '<a class="editormd-table-btn" data-action="add-col-before" title="左侧插入列">+</a>',
                    '<a class="editormd-table-btn" data-action="del-col" title="删除列">-</a>',
                    '<a class="editormd-table-btn" data-action="add-col-after" title="右侧插入列">+</a>',
                    '</div>'
                ].join("");
                
                // Add row controls (positioned to the left of selected row)
                var rowControls = [
                    '<div class="editormd-table-row-controls">',
                    '<a class="editormd-table-btn" data-action="add-row-before" title="上方插入行">+</a>',
                    '<a class="editormd-table-btn" data-action="del-row" title="删除行">-</a>',
                    '<a class="editormd-table-btn" data-action="add-row-after" title="下方插入行">+</a>',
                    '</div>'
                ].join("");
                
                $wrapper.prepend(colControls + rowControls);
                
                // Track current cell
                var currentCell = null;
                $table.on("click", "th, td", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    currentCell = $(this);
                    // Use wrapper-relative offset to handle scrolling properly
                    var wrapperOffset = $wrapper.offset();
                    var cellOffset = currentCell.offset();
                    var relTop = cellOffset.top - wrapperOffset.top;
                    var relLeft = cellOffset.left - wrapperOffset.left;
                    previewContainer.find(".editormd-table-col-controls, .editormd-table-row-controls").hide();
                    $wrapper.find(".editormd-table-col-controls").css({
                        top: relTop - 28,
                        left: relLeft,
                        width: currentCell.outerWidth(),
                        display: "flex"
                    });
                    $wrapper.find(".editormd-table-row-controls").css({
                        top: relTop,
                        left: relLeft - 32,
                        height: Math.max(currentCell.outerHeight(), 60),
                        display: "flex"
                    });
                });
                
                $wrapper.find(".editormd-table-btn").on("click", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!currentCell) return;
                    
                    var action = $(this).data("action");
                    var row = currentCell.parent();
                    var colIndex = row.children().index(currentCell);
                    var rowIndex = row.parent().children().index(row);
                    var isThead = row.parent().is("thead");
                    var tableStart = $wrapper.data("table-start");
                    
                    if (typeof tableStart === "undefined" || tableStart < 0) return;
                    
                    _this.modifyTableInMarkdown(action, rowIndex, colIndex, isThead, tableStart, $wrapper);
                });
            });
            
            // Hide controls when clicking outside
            $(document).off("click.editormd-table").on("click.editormd-table", function(e) {
                if (!$(e.target).closest(".editormd-table-wrapper").length) {
                    previewContainer.find(".editormd-table-col-controls, .editormd-table-row-controls").hide();
                }
            });
        },
        
        /**
         * Modify table markdown source based on preview action
         */
        modifyTableInMarkdown : function(action, rowIndex, colIndex, isThead, tableStart, $wrapper) {
            var cm = this.cm;
            var markdown = cm.getValue();
            var lines = markdown.split("\n");
            var tableEnd = -1;
            
            // Verify tableStart is still valid and re-find the table boundaries
            if (tableStart < 0 || tableStart >= lines.length || !/^\|/.test(lines[tableStart])) {
                // Table position changed - re-find by identifier
                var identifier = $wrapper ? $wrapper.data("table-identifier") : "";
                tableStart = -1;
                for (var fi = 0; fi < lines.length; fi++) {
                    if (/^\|/.test(lines[fi])) {
                        var cells = lines[fi].split("|");
                        var first = (cells[1] || "").trim();
                        if (first && identifier && (first.indexOf(identifier) !== -1 || identifier.indexOf(first) !== -1)) {
                            tableStart = fi;
                            break;
                        }
                    }
                }
                // Fallback: find any table starting at or near expected position
                if (tableStart < 0) {
                    for (var fi2 = 0; fi2 < lines.length; fi2++) {
                        if (/^\|/.test(lines[fi2])) { tableStart = fi2; break; }
                    }
                }
            }
            
            if (tableStart < 0) return;
            
            // Find table end
            for (var j = tableStart; j < lines.length; j++) {
                if (j === tableStart) continue;
                if (!/^\|/.test(lines[j]) && lines[j].trim() !== "") {
                    tableEnd = j - 1;
                    break;
                }
                if (j === lines.length - 1) {
                    tableEnd = j;
                }
            }
            
            if (tableEnd < 0 || tableEnd < tableStart || tableEnd - tableStart < 1) return;
            
            var tableLines = lines.slice(tableStart, tableEnd + 1);
            if (tableLines.length < 2) return;
            
            var headerLine = tableLines[0];
            var alignLine = tableLines[1];
            var bodyLines = tableLines.slice(2);
            var cols = headerLine.split("|").filter(function(c) { return c.trim() !== ""; });
            var colCount = cols.length;
            if (colCount < 1) colCount = 1;
            
            // Ensure minimum rows: header + separator + at least 1 data row
            var totalRows = tableLines.length;

            // Make sure rowIndex is valid
            if (!isThead) {
                rowIndex = Math.max(0, Math.min(rowIndex, bodyLines.length - 1));
            }

            switch(action) {
                case "add-row-before":
                    var newRow = "| " + new Array(colCount + 1).join(" | ");
                    // thead: insert before header. body: insert at tableStart + 2 + rowIndex
                    var insertIndex = isThead ? tableStart : tableStart + 2 + rowIndex;
                    if (!isThead && insertIndex < tableStart + 2) insertIndex = tableStart + 2;
                    lines.splice(insertIndex, 0, newRow);
                    break;
                case "add-row-after":
                    var newRow2 = "| " + new Array(colCount + 1).join(" | ");
                    // thead: insert as first data row. body: insert after current row
                    var insertIndex2 = isThead ? tableStart + 2 : tableStart + 2 + rowIndex + 1;
                    lines.splice(insertIndex2, 0, newRow2);
                    break;
                case "add-col-before":
                    for (var k = 0; k < tableLines.length; k++) {
                        var targetLine = tableStart + k;
                        if (targetLine >= lines.length) break;
                        var cells = lines[targetLine].split("|");
                        var cellContent = (k === 1) ? " --- " : "   ";
                        cells.splice(colIndex + 1, 0, cellContent);
                        lines[targetLine] = cells.join("|");
                    }
                    break;
                case "add-col-after":
                    for (var k2 = 0; k2 < tableLines.length; k2++) {
                        var targetLine2 = tableStart + k2;
                        if (targetLine2 >= lines.length) break;
                        var cells2 = lines[targetLine2].split("|");
                        var cellContent2 = (k2 === 1) ? " --- " : "   ";
                        cells2.splice(colIndex + 2, 0, cellContent2);
                        lines[targetLine2] = cells2.join("|");
                    }
                    break;
                case "del-row":
                    // Prevent deleting if only header + separator remain
                    if (totalRows <= 2 && !isThead) return;
                    if (isThead && totalRows <= 2) return;
                    var delIndex = isThead ? tableStart : tableStart + 2 + rowIndex;
                    if (!isThead && delIndex < tableStart + 2) delIndex = tableStart + 2;
                    if (!isThead && delIndex > tableEnd) delIndex = tableEnd;
                    lines.splice(delIndex, 1);
                    break;
                case "del-col":
                    if (colCount <= 1) return;
                    for (var k3 = 0; k3 < tableLines.length; k3++) {
                        var targetLine3 = tableStart + k3;
                        if (targetLine3 >= lines.length) break;
                        var cells3 = lines[targetLine3].split("|");
                        if (colIndex + 1 < cells3.length) {
                            cells3.splice(colIndex + 1, 1);
                        }
                        lines[targetLine3] = cells3.join("|");
                    }
                    break;
            }
            
            // Update table position reference on wrapper
            if ($wrapper) {
                $wrapper.data("table-start", tableStart);
                $wrapper.data("table-end", tableStart + tableLines.length - 1);
            }
            
            var cursor = cm.getCursor();
            var editorScroll = cm.getScrollInfo();
            var previewScroll = this.preview.scrollTop();
            cm.setValue(lines.join("\n"));
            cm.setCursor(Math.min(cursor.line, lines.length - 1), cursor.ch);
            cm.scrollTo(editorScroll.left, editorScroll.top);
            timer = 0;
            this.save();
            this.preview.scrollTop(previewScroll);
            
            $.proxy(this.settings.ontablechange, this)(action, rowIndex, colIndex);
        },
        
        /**
         * Initialize image resize in preview area
         */
        initImageResize : function() {
            var _this = this;
            var previewContainer = this.previewContainer;
            var cm = this.cm;
            
            previewContainer.find("img").each(function() {
                var $img = $(this);
                if ($img.hasClass("editormd-img-resizable")) {
                    return;
                }
                $img.addClass("editormd-img-resizable");
                
                var $wrapper = $('<div class="editormd-img-wrapper" style="display:inline-block;position:relative;"></div>');
                $img.wrap($wrapper);
                $wrapper = $img.parent();
                
                // Add resize handle
                var handle = $('<div class="editormd-img-resize-handle" title="拖拽调整尺寸"></div>');
                $wrapper.append(handle);
                
                var isResizing = false;
                var startX, startY, startWidth, startHeight;
                
                handle.on("mousedown", function(e) {
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = $img.width();
                    startHeight = $img.height();
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                $(document).on("mousemove.editormd-img", function(e) {
                    if (!isResizing) return;
                    var newWidth = startWidth + (e.clientX - startX);
                    var newHeight = startHeight + (e.clientY - startY);
                    var ratio = startWidth / startHeight;
                    
                    // Shift key to maintain aspect ratio
                    if (e.shiftKey) {
                        newHeight = newWidth / ratio;
                    }
                    
                    if (newWidth > 20) $img.css("width", newWidth + "px");
                    if (newHeight > 20) $img.css("height", newHeight + "px");
                });
                
                $(document).on("mouseup.editormd-img", function(e) {
                    if (!isResizing) return;
                    isResizing = false;
                    
                    var finalWidth = Math.round($img.width());
                    var finalHeight = Math.round($img.height());
                    
                    _this.modifyImageSizeInMarkdown($img.attr("src"), $img.attr("alt"), finalWidth, finalHeight);
                });
                
                // Double click to edit size
                $img.on("dblclick", function(e) {
                    e.stopPropagation();
                    var currentWidth = $img.width();
                    var currentHeight = $img.height();
                    var newWidth = prompt("输入宽度 (px):", currentWidth);
                    var newHeight = prompt("输入高度 (px):", currentHeight);
                    if (newWidth !== null && newHeight !== null) {
                        _this.modifyImageSizeInMarkdown($img.attr("src"), $img.attr("alt"), parseInt(newWidth) || currentWidth, parseInt(newHeight) || currentHeight);
                    }
                });
            });
        },
        
        /**
         * Modify image size in markdown source
         */
        modifyImageSizeInMarkdown : function(src, alt, width, height) {
            var cm = this.cm;
            var markdown = cm.getValue();
            var sizeStr = "<" + width + "," + height + ">";

            // Find and replace image markdown with new <width,height> syntax
            var imgRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:<(\d+),\s*(\d+)>)?/g;
            var newMarkdown = markdown.replace(imgRegex, function(match, mAlt, mSrc, mW, mH) {
                var mUrl = mSrc.replace(/\s*=\s*\d+x\d+/, "").trim();
                if (mUrl === src || mUrl === src.replace(/\s*=\s*\d+x\d+/, "").trim()) {
                    return "![" + (alt || mAlt) + "](" + mUrl + ")" + sizeStr;
                }
                return match;
            });

            if (newMarkdown !== markdown) {
                var editorScroll = cm.getScrollInfo();
                var previewScroll = this.preview.scrollTop();
                cm.setValue(newMarkdown);
                cm.scrollTo(editorScroll.left, editorScroll.top);
                timer = 0;
                this.save();
                this.preview.scrollTop(previewScroll);
                $.proxy(this.settings.onimagechange, this)(src, width, height);
            }
        },
        
        /**
         * Initialize ECharts in preview area
         */
        initECharts : function() {
            var previewContainer = this.previewContainer;

            previewContainer.find(".editormd-echarts").each(function() {
                var $chart = $(this);
                if ($chart.attr("data-initialized") === "true") {
                    return;
                }

                if ($chart.is(":hidden") || $chart.width() === 0 || $chart.height() === 0) {
                    return;
                }

                var config = {};
                try {
                    config = JSON.parse($chart.attr("data-config"));
                } catch(e) {
                    return;
                }

                if (typeof echarts !== "undefined") {
                    var chartInstance = echarts.init(this);
                    var option = {
                        title: config.title || {},
                        tooltip: config.tooltip || {},
                        legend: config.legend || {},
                        radar: config.radar || {},
                        series: config.series || []
                    };

                    var chartType = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                    var noAxisTypes = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst"];
                    if ($.inArray(chartType, noAxisTypes) === -1) {
                        option.xAxis = config.xAxis || {};
                        option.yAxis = config.yAxis || {};
                    }

                    if (config.tooltip === undefined) {
                        option.tooltip = { trigger: "axis" };
                    }
                    chartInstance.setOption(option);
                    $chart.attr("data-initialized", "true");

                    $(window).on("resize.editormd-echarts", function() {
                        chartInstance.resize();
                    });
                }
            });
        },
        
        /**
         * Initialize Tabs in preview area
         */
        initTabs : function() {
            var previewContainer = this.previewContainer;
            
            previewContainer.find(".editormd-tabs").each(function() {
                var $tabs = $(this);
                if ($tabs.attr("data-initialized") === "true") {
                    return;
                }
                
                var $nav = $tabs.find(".editormd-tab-nav");
                var $body = $tabs.find(".editormd-tab-body");
                
                $nav.on("click", "li", function() {
                    var $li = $(this);
                    var index = $li.attr("data-index");
                    
                    $nav.find("li").removeClass("active");
                    $li.addClass("active");
                    
                    $body.find(".editormd-tab-panel").removeClass("active");
                    $body.find('.editormd-tab-panel[data-index="' + index + '"]').addClass("active");
                });
                
                $tabs.attr("data-initialized", "true");
            });
        },
        
        /**
         * Initialize multi-column layout dividers in preview area
         */
        initColumns : function() {
            var previewContainer = this.previewContainer;

            previewContainer.find(".editormd-columns").each(function() {
                var $cols = $(this);
                if ($cols.attr("data-initialized") === "true") {
                    return;
                }

                var count = parseInt($cols.attr("data-count"), 10) || 2;
                $cols.find(".editormd-column-divider").remove();
                $cols.css("position", "relative");

                for (var i = 1; i < count; i++) {
                    var $divider = $('<div class="editormd-column-divider"><span class="editormd-column-divider-icon">&#166;</span></div>');
                    $divider.css({
                        position: "absolute",
                        left: (i / count * 100) + "%",
                        top: "8px",
                        bottom: "8px",
                        width: "0",
                        transform: "translateX(-50%)",
                        borderLeft: "1px dashed #bbb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: 1
                    });
                    $cols.append($divider);
                }

                $cols.attr("data-initialized", "true");
            });
        },

        /**
         * Initialize Tooltips in preview area
         */
        initTooltips : function() {
            var previewContainer = this.previewContainer;
            
            previewContainer.find(".editormd-tooltip-trigger").each(function() {
                var $trigger = $(this);
                if ($trigger.attr("data-tooltip-initialized") === "true") {
                    return;
                }
                
                var tooltipContent = $trigger.attr("data-tooltip");
                var tooltipType = $trigger.attr("data-tooltip-type") || "text";
                if (!tooltipContent) return;
                
                var tooltipHtml = '';
                if (tooltipType === "image") {
                    tooltipHtml = '<img src="' + tooltipContent + '" alt="" />';
                } else if (tooltipType === "iframe") {
                    tooltipHtml = '<iframe src="' + tooltipContent + '" frameborder="0"></iframe>';
                } else {
                    tooltipHtml = tooltipContent;
                }
                var $tooltip = $('<div class="editormd-tooltip-popup editormd-tooltip-' + tooltipType + '">' + tooltipHtml + '</div>');
                $("body").append($tooltip);
                
                var showTooltip = function(e) {
                    clearTimeout($trigger.data("tooltip-timer"));
                    var offset = $trigger.offset();
                    $tooltip.css({
                        left: offset.left + ($trigger.outerWidth() / 2) - ($tooltip.outerWidth() / 2),
                        top: offset.top - $tooltip.outerHeight() - 8,
                        display: "block"
                    }).addClass("show");
                };

                var hideTooltip = function() {
                    $trigger.data("tooltip-timer", setTimeout(function() {
                        $tooltip.removeClass("show");
                    }, 200));
                };

                $trigger.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
                $tooltip.on("mouseenter", function() {
                    clearTimeout($trigger.data("tooltip-timer"));
                }).on("mouseleave", function() {
                    $tooltip.removeClass("show");
                });
                $trigger.on("focus", showTooltip).on("blur", hideTooltip);

                $trigger.attr("data-tooltip-initialized", "true");
            });
        },
        
        /**
         * Initialize copy buttons on all <pre> tags in preview area
         */
        initCopyButton : function() {
            var previewContainer = this.previewContainer;
            
            previewContainer.find("pre").each(function() {
                var $pre = $(this);
                
                // Skip if already has copy button
                if ($pre.children(".editormd-copy-btn").length > 0) return;
                
                // Skip empty pre blocks
                var codeText = ($pre.text() || "").trim();
                if (!codeText) return;
                
                var $copyBtn = $('<button class="editormd-copy-btn" title="复制代码">复制</button>');
                
                $copyBtn.on("click", function(e) {
                    e.stopPropagation();
                    var $btn = $(this);
                    var $p = $btn.closest("pre");
                    var text = ($p.text() || "").trim();
                    
                    var copySucceeded = false;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text).then(function() {
                            $btn.addClass("copied").text("已复制！");
                            setTimeout(function() { $btn.removeClass("copied").text("复制"); }, 2000);
                        }).catch(function() {
                            $btn.addClass("copy-error").text("失败");
                            setTimeout(function() { $btn.removeClass("copy-error").text("复制"); }, 2000);
                        });
                    } else {
                        // Fallback for older browsers
                        try {
                            var textarea = document.createElement("textarea");
                            textarea.value = text;
                            textarea.style.position = "fixed";
                            textarea.style.opacity = "0";
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand("copy");
                            document.body.removeChild(textarea);
                            $btn.addClass("copied").text("已复制！");
                            setTimeout(function() { $btn.removeClass("copied").text("复制"); }, 2000);
                        } catch(err) {
                            $btn.addClass("copy-error").text("失败");
                            setTimeout(function() { $btn.removeClass("copy-error").text("复制"); }, 2000);
                        }
                    }
                });
                
                $pre.addClass("has-copy-btn").prepend($copyBtn);
            });
        },
        
        /**
         * 聚焦光标位置
         * Focusing the cursor position
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        focus : function() {
            this.cm.focus();

            return this;
        },
        
        /**
         * 设置光标的位置
         * Set cursor position
         * 
         * @param   {Object}    cursor 要设置的光标位置键值对象，例：{line:1, ch:0}
         * @returns {editormd}         返回editormd的实例对象
         */
        
        setCursor : function(cursor) {
            this.cm.setCursor(cursor);

            return this;
        },
        
        /**
         * 获取当前光标的位置
         * Get the current position of the cursor
         * 
         * @returns {Cursor}         返回一个光标Cursor对象
         */
        
        getCursor : function() {
            return this.cm.getCursor();
        },
        
        /**
         * 设置光标选中的范围
         * Set cursor selected ranges
         * 
         * @param   {Object}    from   开始位置的光标键值对象，例：{line:1, ch:0}
         * @param   {Object}    to     结束位置的光标键值对象，例：{line:1, ch:0}
         * @returns {editormd}         返回editormd的实例对象
         */
        
        setSelection : function(from, to) {
        
            this.cm.setSelection(from, to);
        
            return this;
        },
        
        /**
         * 获取光标选中的文本
         * Get the texts from cursor selected
         * 
         * @returns {String}         返回选中文本的字符串形式
         */
        
        getSelection : function() {
            return this.cm.getSelection();
        },

        /**
         * 获取字数统计
         * Get word count of editor content
         *
         * @returns {Object}         返回 { text: 总字符数, word: 中文词数/英文单词数 }
         */

        getWordCount : function() {
            var text = this.cm.getValue();
            var totalChars = text.length;
            // Count Chinese characters
            var cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
            // Count English words (sequences of letters)
            var enWords = (text.match(/[a-zA-Z]+/g) || []).length;
            return {
                text   : totalChars,
                word   : cnChars + enWords,
                cn     : cnChars,
                en     : enWords
            };
        },

        /**
         * 获取光标位置
         * Get cursor position
         *
         * @returns {Object}         返回 { line: 行号, ch: 列号 }
         */

        getCursorPosition : function() {
            var cursor = this.cm.getCursor();
            return { line: cursor.line + 1, ch: cursor.ch };
        },

        /**
         * 导出文件
         * Export editor content as file
         *
         * @param   {String}    filename    文件名，不含扩展名
         * @param   {String}    format      格式：md, html, txt，默认 md
         * @returns {editormd}             返回editormd的实例对象
         */

        exportFile : function(filename, format) {
            format = format || "md";
            filename = filename || ("editormd-export-" + editormd.dateFormat());
            var content = "";

            if (format === "html") {
                content = this.previewContainer.html();
            } else if (format === "txt") {
                content = this.cm.getValue().replace(/\n/g, "\r\n");
            } else {
                content = this.cm.getValue();
            }

            var blob = new Blob([content], { type: "text/" + format + ";charset=utf-8" });
            var url = URL.createObjectURL(blob);
            var a = document.createElement("a");
            a.href = url;
            a.download = filename + "." + format;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return this;
        },

        /**
         * 设置光标选中的文本范围
         * Set the cursor selection ranges
         * 
         * @param   {Array}    ranges  cursor selection ranges array
         * @returns {Array}            return this
         */
        
        setSelections : function(ranges) {
            this.cm.setSelections(ranges);
            
            return this;
        },
        
        /**
         * 获取光标选中的文本范围
         * Get the cursor selection ranges
         * 
         * @returns {Array}         return selection ranges array
         */
        
        getSelections : function() {
            return this.cm.getSelections();
        },
        
        /**
         * 替换当前光标选中的文本或在当前光标处插入新字符
         * Replace the text at the current cursor selected or insert a new character at the current cursor position
         * 
         * @param   {String}    value  要插入的字符值
         * @returns {editormd}         返回editormd的实例对象
         */
        
        replaceSelection : function(value) {
            this.cm.replaceSelection(value);

            return this;
        },
        
        /**
         * 在当前光标处插入新字符
         * Insert a new character at the current cursor position
         *
         * 同replaceSelection()方法
         * With the replaceSelection() method
         * 
         * @param   {String}    value  要插入的字符值
         * @returns {editormd}         返回editormd的实例对象
         */
        
        insertValue : function(value) {
            this.replaceSelection(value);

            return this;
        },
        
        /**
         * 追加markdown
         * append Markdown to editor
         * 
         * @param   {String}    md     要追加的markdown源文档
         * @returns {editormd}         返回editormd的实例对象
         */
        
        appendMarkdown : function(md) {
            var settings = this.settings;
            var cm       = this.cm;
            
            cm.setValue(cm.getValue() + md);
            
            return this;
        },
        
        /**
         * 设置和传入编辑器的markdown源文档
         * Set Markdown source document
         * 
         * @param   {String}    md     要传入的markdown源文档
         * @returns {editormd}         返回editormd的实例对象
         */
        
        setMarkdown : function(md) {
            this.cm.setValue(md || this.settings.markdown);
            
            return this;
        },
        
        /**
         * 获取编辑器的markdown源文档
         * Set Editor.md markdown/CodeMirror value
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        getMarkdown : function() {
            return this.cm.getValue();
        },
        
        /**
         * 获取编辑器的源文档
         * Get CodeMirror value
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        getValue : function() {
            return this.cm.getValue();
        },
        
        /**
         * 设置编辑器的源文档
         * Set CodeMirror value
         * 
         * @param   {String}     value   set code/value/string/text
         * @returns {editormd}           返回editormd的实例对象
         */
        
        setValue : function(value) {
            this.cm.setValue(value);
            
            return this;
        },
        
        /**
         * 清空编辑器
         * Empty CodeMirror editor container
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        clear : function() {
            this.cm.setValue("");

            return this;
        },

        /**
         * 保存草稿到浏览器本地存储
         * Save draft to browser localStorage
         *
         * @returns {editormd}         返回editormd的实例对象
         */

        saveDraft : function() {
            if (!this.settings.draftAutoSave || this.settings.readOnly) return this;

            var cmValue = this.cm.getValue();
            if (!cmValue || cmValue.trim() === "") return this;

            var draftKey = "editormd-draft-" + (this.id || "default");
            var drafts = [];
            try {
                var stored = localStorage.getItem(draftKey);
                if (stored) drafts = JSON.parse(stored);
            } catch(e) {}

            var now = new Date().getTime();
            var maxDays = this.settings.draftMaxDays || 30;
            var maxAge = maxDays * 24 * 60 * 60 * 1000;

            // Remove expired drafts
            drafts = drafts.filter(function(d) {
                return (now - d.time) < maxAge;
            });

            // Remove duplicates (same content), keep only the latest
            for (var i = drafts.length - 1; i >= 0; i--) {
                if (drafts[i].content === cmValue) {
                    drafts.splice(i, 1);
                }
            }

            // In the same editing session (within 10 minutes), replace the latest draft
            // to avoid accumulating multiple drafts from auto-save intervals
            var sessionThreshold = 10 * 60 * 1000;
            if (drafts.length > 0 && (now - drafts[0].time) < sessionThreshold) {
                drafts[0] = {
                    time: now,
                    preview: cmValue.substring(0, 200),
                    content: cmValue
                };
            } else {
                drafts.unshift({
                    time: now,
                    preview: cmValue.substring(0, 200),
                    content: cmValue
                });
            }

            // Keep only last 20 drafts
            if (drafts.length > 20) drafts = drafts.slice(0, 20);

            try {
                localStorage.setItem(draftKey, JSON.stringify(drafts));
            } catch(e) {}

            return this;
        },

        /**
         * 清除浏览器草稿
         * Clear browser drafts
         *
         * @returns {editormd}         返回editormd的实例对象
         */

        clearDraft : function() {
            var draftKey = "editormd-draft-" + (this.id || "default");
            try {
                localStorage.removeItem(draftKey);
            } catch(e) {}
            return this;
        },

        /**
         * 显示草稿恢复对话框
         * Show draft recovery dialog
         *
         * @returns {editormd}         返回editormd的实例对象
         */

        showDraftRecovery : function() {
            if (!this.settings.draftAutoSave || this.settings.readOnly) return this;

            var draftKey = "editormd-draft-" + (this.id || "default");
            var drafts = [];
            try {
                var stored = localStorage.getItem(draftKey);
                if (stored) drafts = JSON.parse(stored);
            } catch(e) {}

            var now = new Date().getTime();
            var maxDays = this.settings.draftMaxDays || 30;
            var maxAge = maxDays * 24 * 60 * 60 * 1000;
            var originalLength = drafts.length;
            drafts = drafts.filter(function(d) {
                return (now - d.time) < maxAge;
            });
            if (drafts.length !== originalLength) {
                try {
                    localStorage.setItem(draftKey, JSON.stringify(drafts));
                } catch(e) {}
            }

            if (!drafts || drafts.length === 0) return this;

            var _this = this;
            var dialogId = "editormd-draft-recovery-" + this.id;
            var maskId = dialogId + "-mask";

            $("#" + maskId).remove();
            if ($("#" + dialogId).length > 0) {
                $("#" + dialogId).remove();
            }

            var listHtml = "";
            for (var i = 0; i < drafts.length; i++) {
                var d = drafts[i];
                var date = new Date(d.time);
                var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() + ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
                var previewText = (d.preview || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");
                if (previewText.length > 80) previewText = previewText.substring(0, 80) + "...";
                listHtml += '<div class="editormd-draft-item" data-index="' + i + '">' +
                    '<span class="editormd-draft-time">' + dateStr + '</span>' +
                    '<span class="editormd-draft-preview">' + previewText + '</span>' +
                    '</div>';
            }

            var $mask = $('<div id="' + maskId + '" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.3);z-index:99998;"></div>');
            $("body").append($mask);

            var dialogHtml = '<div id="' + dialogId + '" class="editormd-dialog editormd-draft-dialog">' +
                '<div class="editormd-dialog-header" style="cursor: move;">' +
                '<strong class="editormd-dialog-title">恢复草稿</strong>' +
                '<a href="javascript:;" class="editormd-dialog-close">&times;</a>' +
                '</div>' +
                '<div class="editormd-dialog-content">' +
                '<p class="editormd-draft-tip">检测到以下自动保存的草稿，点击可恢复到编辑器：</p>' +
                '<div class="editormd-draft-list">' + listHtml + '</div>' +
                '</div>' +
                '<div class="editormd-dialog-footer">' +
                '<button class="editormd-draft-clear editormd-btn">清除所有草稿</button>' +
                '<button class="editormd-draft-cancel editormd-btn">取消</button>' +
                '</div>' +
                '</div>';

            var $dialog = $(dialogHtml);
            $("body").append($dialog);

            $dialog.css({
                display: "block",
                position: "fixed",
                top: "20%",
                left: "50%",
                width: 480,
                marginLeft: -240,
                zIndex: 99999,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
            });

            var closeDialog = function() {
                $dialog.remove();
                $mask.remove();
                $(document).off("keydown.editormdDraft");
            };

            $dialog.find(".editormd-dialog-close, .editormd-draft-cancel").on("click", closeDialog);

            $dialog.find(".editormd-draft-clear").on("click", function() {
                _this.clearDraft();
                closeDialog();
            });

            $dialog.find(".editormd-draft-item").on("click", function() {
                var idx = parseInt($(this).data("index"), 10);
                if (drafts[idx] && drafts[idx].content) {
                    var editorScroll = _this.cm.getScrollInfo();
                    var previewScroll = _this.preview.scrollTop();
                    _this.cm.setValue(drafts[idx].content);
                    _this.cm.scrollTo(editorScroll.left, editorScroll.top);
                    timer = 0;
                    _this.save();
                    _this.preview.scrollTop(previewScroll);
                }
                closeDialog();
            });

            $mask.on("click", closeDialog);

            $(document).on("keydown.editormdDraft", function(e) {
                if (e.keyCode === 27) {
                    closeDialog();
                }
            });

            return this;
        },

        /**
         * 获取解析后存放在Textarea的HTML源码
         * Get parsed html code from Textarea
         *
         * @returns {String}               返回HTML源码
         */

        getHTML : function() {
            if (!this.settings.saveHTMLToTextarea)
            {
                alert("Error: settings.saveHTMLToTextarea == false");

                return false;
            }
            
            return this.htmlTextarea.val();
        },
        
        /**
         * getHTML()的别名
         * getHTML (alias)
         * 
         * @returns {String}           Return html code 返回HTML源码
         */
        
        getTextareaSavedHTML : function() {
            return this.getHTML();
        },
        
        /**
         * 获取预览窗口的HTML源码
         * Get html from preview container
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        getPreviewedHTML : function() {
            if (!this.settings.watch)
            {
                alert("Error: settings.watch == false");

                return false;
            }
            
            return this.previewContainer.html();
        },
        
        /**
         * 开启实时预览
         * Enable real-time watching
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        watch : function(callback) {     
            var settings        = this.settings;
            
            if ($.inArray(settings.mode, ["gfm", "markdown"]) < 0)
            {
                return this;
            }
            
            this.state.watching = settings.watch = true;
            this.preview.show();
            
            if (this.toolbar)
            {
                var watchIcon   = settings.toolbarIconsClass.watch;
                var unWatchIcon = settings.toolbarIconsClass.unwatch;
                
                var icon        = this.toolbar.find(".fa[name=watch]");
                icon.parent().attr("title", settings.lang.toolbar.watch);
                icon.removeClass(unWatchIcon).addClass(watchIcon);
            }
            
            this.codeMirror.css("border-right", "1px solid #ddd").width(this.editor.width() / 2); 
            
            timer = 0;
            
            this.save().resize();
            
            if (!settings.onwatch)
            {
                settings.onwatch = callback || function() {};
            }
            
            $.proxy(settings.onwatch, this)();
            
            return this;
        },
        
        /**
         * 关闭实时预览
         * Disable real-time watching
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        unwatch : function(callback) {
            var settings        = this.settings;
            this.state.watching = settings.watch = false;
            this.preview.hide();
            
            if (this.toolbar) 
            {
                var watchIcon   = settings.toolbarIconsClass.watch;
                var unWatchIcon = settings.toolbarIconsClass.unwatch;
                
                var icon    = this.toolbar.find(".fa[name=watch]");
                icon.parent().attr("title", settings.lang.toolbar.unwatch);
                icon.removeClass(watchIcon).addClass(unWatchIcon);
            }
            
            this.codeMirror.css("border-right", "none").width(this.editor.width());
            
            this.resize();
            
            if (!settings.onunwatch)
            {
                settings.onunwatch = callback || function() {};
            }
            
            $.proxy(settings.onunwatch, this)();
            
            return this;
        },
        
        /**
         * 显示编辑器
         * Show editor
         * 
         * @param   {Function} [callback=function()] 回调函数
         * @returns {editormd}                       返回editormd的实例对象
         */
        
        show : function(callback) {
            callback  = callback || function() {};
            
            var _this = this;
            this.editor.show(0, function() {
                $.proxy(callback, _this)();
            });
            
            return this;
        },
        
        /**
         * 隐藏编辑器
         * Hide editor
         * 
         * @param   {Function} [callback=function()] 回调函数
         * @returns {editormd}                       返回editormd的实例对象
         */
        
        hide : function(callback) {
            callback  = callback || function() {};
            
            var _this = this;
            this.editor.hide(0, function() {
                $.proxy(callback, _this)();
            });
            
            return this;
        },
        
        /**
         * 隐藏编辑器部分，只预览HTML
         * Enter preview html state
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        previewing : function() {
            
            var _this            = this;
            var editor           = this.editor;
            var preview          = this.preview;
            var toolbar          = this.toolbar;
            var settings         = this.settings;
            var codeMirror       = this.codeMirror;
            var previewContainer = this.previewContainer;
            
            if ($.inArray(settings.mode, ["gfm", "markdown"]) < 0) {
                return this;
            }
            
            if (settings.toolbar && toolbar) {
                toolbar.toggle();
                toolbar.find(".fa[name=preview]").toggleClass("active");
            }
            
            codeMirror.toggle();
            
            var escHandle = function(event) {
                if (event.shiftKey && event.keyCode === 27) {
                    _this.previewed();
                }
            };

            if (codeMirror.css("display") === "none") // 为了兼容Zepto，而不使用codeMirror.is(":hidden")
            {
                this.state.preview = true;

                if (this.state.fullscreen) {
                    preview.css("background", "#fff");
                }
                
                editor.find("." + this.classPrefix + "preview-close-btn").show().bind(editormd.mouseOrTouch("click", "touchend"), function(){
                    _this.previewed();
                });
            
                if (!settings.watch)
                {
                    this.save();
                } 
                else 
                {
                    previewContainer.css("padding", "");
                }
                
                previewContainer.addClass(this.classPrefix + "preview-active");

                preview.show().css({
                    position  : "",
                    top       : 0,
                    width     : editor.width(),
                    height    : (settings.autoHeight && !this.state.fullscreen) ? "auto" : editor.height()
                });
                
                if (this.state.loaded)
                {
                    $.proxy(settings.onpreviewing, this)();
                }

                $(window).bind("keyup", escHandle);
            } 
            else 
            {
                $(window).unbind("keyup", escHandle);
                this.previewed();
            }
        },
        
        /**
         * 显示编辑器部分，退出只预览HTML
         * Exit preview html state
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        previewed : function() {
            
            var editor           = this.editor;
            var preview          = this.preview;
            var toolbar          = this.toolbar;
            var settings         = this.settings;
            var previewContainer = this.previewContainer;
            var previewCloseBtn  = editor.find("." + this.classPrefix + "preview-close-btn");

            this.state.preview   = false;
            
            this.codeMirror.show();
            
            if (settings.toolbar) {
                toolbar.show();
            }
            
            preview[(settings.watch) ? "show" : "hide"]();
            
            previewCloseBtn.hide().unbind(editormd.mouseOrTouch("click", "touchend"));
                
            previewContainer.removeClass(this.classPrefix + "preview-active");
                
            if (settings.watch)
            {
                previewContainer.css("padding", "20px");
            }
            
            preview.css({ 
                background : null,
                position   : "absolute",
                width      : editor.width() / 2,
                height     : (settings.autoHeight && !this.state.fullscreen) ? "auto" : editor.height() - toolbar.height(),
                top        : (settings.toolbar)    ? toolbar.height() : 0
            });

            if (this.state.loaded)
            {
                $.proxy(settings.onpreviewed, this)();
            }
            
            return this;
        },
        
        /**
         * 编辑器全屏显示
         * Fullscreen show
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        fullscreen : function() {
            
            var _this            = this;
            var state            = this.state;
            var editor           = this.editor;
            var preview          = this.preview;
            var toolbar          = this.toolbar;
            var settings         = this.settings;
            var fullscreenClass  = this.classPrefix + "fullscreen";
            
            if (toolbar) {
                toolbar.find(".fa[name=fullscreen]").parent().toggleClass("active"); 
            }
            
            var escHandle = function(event) {
                if (!event.shiftKey && event.keyCode === 27) 
                {
                    if (state.fullscreen)
                    {
                        _this.fullscreenExit();
                    }
                }
            };

            if (!editor.hasClass(fullscreenClass)) 
            {
                state.fullscreen = true;

                $("html,body").css("overflow", "hidden");
                
                editor.css({
                    width    : $(window).width(),
                    height   : $(window).height()
                }).addClass(fullscreenClass);

                this.resize();
    
                $.proxy(settings.onfullscreen, this)();

                $(window).bind("keyup", escHandle);
            }
            else
            {           
                $(window).unbind("keyup", escHandle); 
                this.fullscreenExit();
            }

            return this;
        },
        
        /**
         * 编辑器退出全屏显示
         * Exit fullscreen state
         * 
         * @returns {editormd}         返回editormd的实例对象
         */
        
        fullscreenExit : function() {
            
            var editor            = this.editor;
            var settings          = this.settings;
            var toolbar           = this.toolbar;
            var fullscreenClass   = this.classPrefix + "fullscreen";  
            
            this.state.fullscreen = false;
            
            if (toolbar) {
                toolbar.find(".fa[name=fullscreen]").parent().removeClass("active"); 
            }

            $("html,body").css("overflow", "");

            editor.css({
                width    : editor.data("oldWidth"),
                height   : editor.data("oldHeight")
            }).removeClass(fullscreenClass);

            this.resize();
            
            $.proxy(settings.onfullscreenExit, this)();

            return this;
        },
        
        /**
         * 加载并执行插件
         * Load and execute the plugin
         * 
         * @param   {String}     name    plugin name / function name
         * @param   {String}     path    plugin load path
         * @returns {editormd}           返回editormd的实例对象
         */
        
        executePlugin : function(name, path) {
            
            var _this    = this;
            var cm       = this.cm;
            var settings = this.settings;
            
            path = settings.pluginPath + path;
            
            if (typeof define === "function") 
            {            
                if (typeof this[name] === "undefined")
                {
                    alert("Error: " + name + " plugin is not found, you are not load this plugin.");
                    
                    return this;
                }
                
                this[name](cm);
                
                return this;
            }
            
            if ($.inArray(path, editormd.loadFiles.plugin) < 0)
            {
                editormd.loadPlugin(path, function() {
                    editormd.loadPlugins[name] = _this[name];
                    _this[name](cm);
                });
            }
            else
            {
                $.proxy(editormd.loadPlugins[name], this)(cm);
            }
            
            return this;
        },
                
        /**
         * 搜索替换
         * Search & replace
         * 
         * @param   {String}     command    CodeMirror serach commands, "find, fintNext, fintPrev, clearSearch, replace, replaceAll"
         * @returns {editormd}              return this
         */
        
        search : function(command) {
            var settings = this.settings;
            
            if (!settings.searchReplace)
            {
                alert("Error: settings.searchReplace == false");
                return this;
            }
            
            if (!settings.readOnly)
            {
                this.cm.execCommand(command || "find");
            }
            
            return this;
        },
        
        searchReplace : function() {            
            this.search("replace");
            
            return this;
        },
        
        searchReplaceAll : function() {          
            this.search("replaceAll");
            
            return this;
        },
        
        /**
         * Show color picker panel for text color or background color
         */
        showColorPicker : function(type) {
            var _this = this;
            var toolbar = this.toolbar;
            
            // Remove any existing picker
            $(".editormd-color-picker-panel").remove();
            $(document).off("mousedown.editormd-colorpicker");
            
            // Common document colors: 2 rows x 4 cols, first 7 are colors, 8th is custom picker
            var commonColors = [
                "#000000", "#E74C3C", "#E67E22", "#F1C40F",
                "#2ECC71", "#3498DB", "#9B59B6"
            ];
            
            var typeLabel = (type === "color") ? "文字颜色" : "背景颜色";
            
            var panelHTML = [
                '<div class="editormd-color-picker-panel">',
                '<div class="editormd-color-picker-title">' + typeLabel + '</div>',
                '<div class="editormd-color-picker-grid">'
            ];
            
            for (var i = 0; i < commonColors.length; i++) {
                panelHTML.push(
                    '<div class="editormd-color-picker-swatch" ' +
                    'data-color="' + commonColors[i] + '" ' +
                    'style="background-color:' + commonColors[i] + '" ' +
                    'title="' + commonColors[i] + '"></div>'
                );
            }
            
            // 8th custom color square
            panelHTML.push(
                '<div class="editormd-color-picker-swatch editormd-color-picker-custom" title="自定义颜色">',
                '<div class="editormd-color-picker-plus-bg"></div>',
                '<span class="editormd-color-picker-plus">+</span>',
                '</div>'
            );
            
            panelHTML.push('</div>');
            
            // Hidden custom area
            panelHTML.push('<div class="editormd-color-picker-custom-area" style="display:none;">');
            panelHTML.push('<button class="editormd-color-picker-back">&larr; 返回</button>');
            panelHTML.push('<input type="color" class="editormd-color-picker-native" value="#ff0000" style="display:none;">');
            panelHTML.push('<div class="editormd-color-picker-hex-row">');
            panelHTML.push('<input type="text" class="editormd-color-picker-hex-input" maxlength="7" placeholder="#000000">');
            panelHTML.push('<button class="editormd-color-picker-confirm">确认</button>');
            panelHTML.push('</div>');
            panelHTML.push('</div>');
            
            panelHTML.push('</div>');
            
            var $panel = $(panelHTML.join(""));
            
            // Position relative to toolbar button
            if (this.activeIcon && this.activeIcon.length) {
                var iconOffset = this.activeIcon.offset();
                var iconHeight = this.activeIcon.outerHeight();
                $panel.css({
                    position: "absolute",
                    top: iconOffset.top + iconHeight + 4,
                    left: Math.min(iconOffset.left, $(window).width() - 310)
                });
            }
            
            $("body").append($panel);
            
            // Save context for apply
            this._colorPickerSelection = this.cm.getSelection();
            this._colorPickerType = type;
            
            // Swatch click
            $panel.on("click", ".editormd-color-picker-swatch:not(.editormd-color-picker-custom)", function() {
                var color = $(this).data("color");
                _this.applyColor(color);
                $panel.remove();
                $(document).off("mousedown.editormd-colorpicker");
            });
            
            // Custom picker click
            $panel.on("click", ".editormd-color-picker-custom", function() {
                $panel.find(".editormd-color-picker-grid").hide();
                $panel.find(".editormd-color-picker-title").hide();
                $panel.find(".editormd-color-picker-custom-area").show();
                $panel.find(".editormd-color-picker-native").trigger("click");
            });
            
            // Back button
            $panel.on("click", ".editormd-color-picker-back", function() {
                $panel.find(".editormd-color-picker-grid").show();
                $panel.find(".editormd-color-picker-title").show();
                $panel.find(".editormd-color-picker-custom-area").hide();
            });
            
            // Native color input change
            $panel.on("input change", ".editormd-color-picker-native", function() {
                var val = $(this).val();
                $panel.find(".editormd-color-picker-hex-input").val(val);
            });
            
            // Hex input validate
            $panel.on("input", ".editormd-color-picker-hex-input", function() {
                var input = $(this);
                var val = input.val();
                if (val && val.charAt(0) !== "#") {
                    val = "#" + val;
                }
                val = val.replace(/[^#0-9a-fA-F]/g, "").substring(0, 7);
                input.val(val);
            });
            
            // Confirm button
            $panel.on("click", ".editormd-color-picker-confirm", function() {
                var hexVal = $panel.find(".editormd-color-picker-hex-input").val();
                if (!hexVal) return;
                if (hexVal.charAt(0) !== "#") hexVal = "#" + hexVal;
                if (hexVal.length === 4 || hexVal.length === 7) {
                    _this.applyColor(hexVal);
                    $panel.remove();
                    $(document).off("mousedown.editormd-colorpicker");
                }
            });
            
            // Close when clicking outside
            setTimeout(function() {
                $(document).on("mousedown.editormd-colorpicker", function(e) {
                    if (!$(e.target).closest(".editormd-color-picker-panel").length &&
                        !$(e.target).closest("." + _this.classPrefix + "menu > li > a").length) {
                        $panel.remove();
                        $(document).off("mousedown.editormd-colorpicker");
                    }
                });
            }, 50);
        },

        /**
         * Apply color to editor selection
         */
        applyColor : function(colorVal) {
            var cm = this.cm;
            var selection = this._colorPickerSelection || cm.getSelection();
            var styleAttr = (this._colorPickerType === "color") ? "color" : "background-color";
            cm.replaceSelection('<span style="' + styleAttr + ':' + colorVal + '">' + (selection || "文字") + '</span>');
            this._colorPickerSelection = null;
            cm.focus();
        }
    };
    
    editormd.fn.init.prototype = editormd.fn; 
   
    /**
     * 锁屏
     * lock screen when dialog opening
     * 
     * @returns {void}
     */

    editormd.dialogLockScreen = function() {
        var settings = this.settings || {dialogLockScreen : true};
        
        if (settings.dialogLockScreen) 
        {            
            $("html,body").css("overflow", "hidden");
            this.resize();
        }
    };
   
    /**
     * 显示透明背景层
     * Display mask layer when dialog opening
     * 
     * @param   {Object}     dialog    dialog jQuery object
     * @returns {void}
     */
    
    editormd.dialogShowMask = function(dialog) {
        var editor   = this.editor;
        var settings = this.settings || {dialogShowMask : true};
        
        dialog.css({
            top  : ($(window).height() - dialog.height()) / 2 + "px",
            left : ($(window).width()  - dialog.width())  / 2 + "px"
        });

        if (settings.dialogShowMask) {
            editor.children("." + this.classPrefix + "mask").css("z-index", parseInt(dialog.css("z-index")) - 1).show();
        }
    };

    editormd.toolbarHandlers = {
        undo : function() {
            this.cm.undo();
        },
        
        redo : function() {
            this.cm.redo();
        },
        
        bold : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection("**" + selection + "**");

            if(selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 2);
            }
        },
        
        del : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection("~~" + selection + "~~");

            if(selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 2);
            }
        },

        italic : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection("*" + selection + "*");

            if(selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 1);
            }
        },

        quote : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("> " + selection);
                cm.setCursor(cursor.line, cursor.ch + 2);
            }
            else
            {
                cm.replaceSelection("> " + selection);
            }

            //cm.replaceSelection("> " + selection);
            //cm.setCursor(cursor.line, (selection === "") ? cursor.ch + 2 : cursor.ch + selection.length + 2);
        },
        
        ucfirst : function() {
            var cm         = this.cm;
            var selection  = cm.getSelection();
            var selections = cm.listSelections();

            cm.replaceSelection(editormd.firstUpperCase(selection));
            cm.setSelections(selections);
        },
        
        ucwords : function() {
            var cm         = this.cm;
            var selection  = cm.getSelection();
            var selections = cm.listSelections();

            cm.replaceSelection(editormd.wordsFirstUpperCase(selection));
            cm.setSelections(selections);
        },
        
        uppercase : function() {
            var cm         = this.cm;
            var selection  = cm.getSelection();
            var selections = cm.listSelections();

            cm.replaceSelection(selection.toUpperCase());
            cm.setSelections(selections);
        },
        
        lowercase : function() {
            var cm         = this.cm;
            var cursor     = cm.getCursor();
            var selection  = cm.getSelection();
            var selections = cm.listSelections();
            
            cm.replaceSelection(selection.toLowerCase());
            cm.setSelections(selections);
        },

        h1 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("# " + selection);
                cm.setCursor(cursor.line, cursor.ch + 2);
            }
            else
            {
                cm.replaceSelection("# " + selection);
            }
        },

        h2 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("## " + selection);
                cm.setCursor(cursor.line, cursor.ch + 3);
            }
            else
            {
                cm.replaceSelection("## " + selection);
            }
        },

        h3 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("### " + selection);
                cm.setCursor(cursor.line, cursor.ch + 4);
            }
            else
            {
                cm.replaceSelection("### " + selection);
            }
        },

        h4 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("#### " + selection);
                cm.setCursor(cursor.line, cursor.ch + 5);
            }
            else
            {
                cm.replaceSelection("#### " + selection);
            }
        },

        h5 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("##### " + selection);
                cm.setCursor(cursor.line, cursor.ch + 6);
            }
            else
            {
                cm.replaceSelection("##### " + selection);
            }
        },

        h6 : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (cursor.ch !== 0)
            {
                cm.setCursor(cursor.line, 0);
                cm.replaceSelection("###### " + selection);
                cm.setCursor(cursor.line, cursor.ch + 7);
            }
            else
            {
                cm.replaceSelection("###### " + selection);
            }
        },

        "list-ul" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") 
            {
                cm.replaceSelection("- " + selection);
            } 
            else 
            {
                var selectionText = selection.split("\n");

                for (var i = 0, len = selectionText.length; i < len; i++) 
                {
                    selectionText[i] = (selectionText[i] === "") ? "" : "- " + selectionText[i];
                }

                cm.replaceSelection(selectionText.join("\n"));
            }
        },

        "list-ol" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if(selection === "") 
            {
                cm.replaceSelection("1. " + selection);
            }
            else
            {
                var selectionText = selection.split("\n");

                for (var i = 0, len = selectionText.length; i < len; i++) 
                {
                    selectionText[i] = (selectionText[i] === "") ? "" : (i+1) + ". " + selectionText[i];
                }

                cm.replaceSelection(selectionText.join("\n"));
            }
        },

        hr : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection(((cursor.ch !== 0) ? "\n\n" : "\n") + "------------\n\n");
        },

        tex : function() {
            if (!this.settings.tex)
            {
                alert("settings.tex === false");
                return this;
            }
            
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection("$$" + selection + "$$");

            if(selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 2);
            }
        },

        link : function() {
            this.executePlugin("linkDialog", "link-dialog/link-dialog");
        },

        "reference-link" : function() {
            this.executePlugin("referenceLinkDialog", "reference-link-dialog/reference-link-dialog");
        },

        pagebreak : function() {
            if (!this.settings.pageBreak)
            {
                alert("settings.pageBreak === false");
                return this;
            }
            
            var cm        = this.cm;
            var selection = cm.getSelection();

            cm.replaceSelection("\r\n[========]\r\n");
        },

        image : function() {
            this.executePlugin("imageDialog", "image-dialog/image-dialog");
        },
        
        video : function() {
            this.executePlugin("videoDialog", "video-dialog/video-dialog");
        },
        
        file : function() {
            this.executePlugin("fileDialog", "file-dialog/file-dialog");
        },
        
        code : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            cm.replaceSelection("`" + selection + "`");

            if (selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 1);
            }
        },

        "code-block" : function() {
            this.executePlugin("codeBlockDialog", "code-block-dialog/code-block-dialog");            
        },

        "preformatted-text" : function() {
            this.executePlugin("preformattedTextDialog", "preformatted-text-dialog/preformatted-text-dialog");
        },
        
        table : function() {
            this.executePlugin("tableDialog", "table-dialog/table-dialog");         
        },
        
        datetime : function() {
            var cm        = this.cm;
            var selection = cm.getSelection();
            var date      = new Date();
            var langName  = this.settings.lang.name;
            var datefmt   = editormd.dateFormat() + " " + editormd.dateFormat((langName === "zh-cn" || langName === "zh-tw") ? "cn-week-day" : "week-day");

            cm.replaceSelection(datefmt);
        },
        
                
        "html-entities" : function() {
            this.executePlugin("htmlEntitiesDialog", "html-entities-dialog/html-entities-dialog");
        },
                
        "goto-line" : function() {
            this.executePlugin("gotoLineDialog", "goto-line-dialog/goto-line-dialog");
        },

        watch : function() {    
            this[this.settings.watch ? "unwatch" : "watch"]();
        },

        preview : function() {
            this.previewing();
        },

        fullscreen : function() {
            this.fullscreen();
        },

        clear : function() {
            this.clear();
        },
        
        search : function() {
            this.search();
        },

        help : function() {
            this.executePlugin("helpDialog", "help-dialog/help-dialog");
        },

        info : function() {
            this.showInfoDialog();
        },
        
        "align-left" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") {
                cm.replaceSelection("⁑⁖左对齐内容⁖⁑");
                cm.setCursor(cursor.line, cursor.ch + 3);
            } else {
                cm.replaceSelection("⁑⁖" + selection + "⁖⁑");
            }
        },

        "align-center" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") {
                cm.replaceSelection("⁑⁑居中对齐内容⁑⁑");
                cm.setCursor(cursor.line, cursor.ch + 3);
            } else {
                cm.replaceSelection("⁑⁑" + selection + "⁑⁑");
            }
        },

        "align-right" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") {
                cm.replaceSelection("⁑⠕右对齐内容⠕⁑");
                cm.setCursor(cursor.line, cursor.ch + 3);
            } else {
                cm.replaceSelection("⁑⠕" + selection + "⠕⁑");
            }
        },

        "align-justify" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") {
                cm.replaceSelection("⁑⁛两端对齐内容⁛⁑");
                cm.setCursor(cursor.line, cursor.ch + 3);
            } else {
                cm.replaceSelection("⁑⁛" + selection + "⁛⁑");
            }
        },
        
        pinyin : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();
            
            if (selection === "") {
                cm.replaceSelection("{  |  }");
                cm.setCursor(cursor.line, cursor.ch + 2);
            } else {
                cm.replaceSelection("{" + selection + " | }");
                cm.setCursor(cursor.line, cursor.ch + selection.length + 4);
            }
        },

        "echarts-bar" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"bar\",\n  \"title\": {\"text\": \"柱状图\"},\n  \"xAxis\": {\"data\": [\"A\", \"B\", \"C\"]},\n  \"yAxis\": {},\n  \"series\": [{\"type\": \"bar\", \"data\": [5, 20, 36]}]\n}\n```\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        "echarts-line" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"line\",\n  \"title\": {\"text\": \"折线图\"},\n  \"xAxis\": {\"type\": \"category\", \"data\": [\"Mon\", \"Tue\", \"Wed\"]},\n  \"yAxis\": {\"type\": \"value\"},\n  \"series\": [{\"type\": \"line\", \"data\": [150, 230, 224]}]\n}\n```\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        "echarts-pie" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"pie\",\n  \"title\": {\"text\": \"饼图\"},\n  \"series\": [{\n    \"type\": \"pie\",\n    \"data\": [\n      {\"value\": 1048, \"name\": \"A\"},\n      {\"value\": 735, \"name\": \"B\"},\n      {\"value\": 580, \"name\": \"C\"}\n    ]\n  }]\n}\n```\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        "echarts-radar" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"radar\",\n  \"title\": {\"text\": \"雷达图\"},\n  \"radar\": {\"indicator\": [{\"name\": \"A\", \"max\": 100}, {\"name\": \"B\", \"max\": 100}, {\"name\": \"C\", \"max\": 100}]},\n  \"series\": [{\"type\": \"radar\", \"data\": [{\"value\": [80, 90, 70], \"name\": \"Data\"}]}]\n}\n```\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        "echarts-funnel" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"funnel\",\n  \"title\": {\"text\": \"漏斗图\"},\n  \"series\": [{\n    \"type\": \"funnel\",\n    \"data\": [\n      {\"value\": 60, \"name\": \"A\"},\n      {\"value\": 40, \"name\": \"B\"},\n      {\"value\": 20, \"name\": \"C\"}\n    ]\n  }]\n}\n```\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        tabs : function() {
            var cm = this.cm;
            var selection = cm.getSelection();
            var tabsContent = selection || "标签页1内容\n\n标签页2内容";
            var lines = tabsContent.split("\n\n");
            var result = "\n[[tabs]]\n";
            for (var i = 0; i < lines.length; i++) {
                result += "[[tab:标签" + (i + 1) + "]]\n" + lines[i] + "\n[[/tab]]\n";
            }
            result += "[[/tabs]]\n";
            cm.replaceSelection(result);
        },

        columns : function() {
            var cm = this.cm;
            var selection = cm.getSelection();
            var content = selection || "在此输入多栏排版内容...";
            cm.replaceSelection("\n[[columns:3]]\n" + content + "\n[[/columns]]\n");
        },

        tooltip : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var selection = cm.getSelection();
            if (selection === "") {
                cm.replaceSelection("[悬浮文本](tooltip:这里是悬浮提示内容)");
                cm.setCursor(cursor.line, cursor.ch + 6);
            } else {
                cm.replaceSelection("[" + selection + "](tooltip:请在这里输入提示内容)");
            }
        },

        color : function() {
            this.showColorPicker("color");
        },

        "bg-color" : function() {
            this.showColorPicker("bg-color");
        }
    };

    editormd.keyMaps = {
        "Ctrl-1"       : "h1",
        "Ctrl-2"       : "h2",
        "Ctrl-3"       : "h3",
        "Ctrl-4"       : "h4",
        "Ctrl-5"       : "h5",
        "Ctrl-6"       : "h6",
        "Ctrl-B"       : "bold",  // if this is string ==  editormd.toolbarHandlers.xxxx
        "Ctrl-D"       : "datetime",
        "Ctrl-Alt-G"   : "goto-line",
        "Ctrl-H"       : "hr",
        "Ctrl-I"       : "italic",
        "Ctrl-K"       : "code",
        
        "Ctrl-L"        : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();
            
            var title = (selection === "") ? "" : " \""+selection+"\"";

            cm.replaceSelection("[" + selection + "]("+title+")");

            if (selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 1);
            }
        },
        "Ctrl-U"         : "list-ul",
        
        "Shift-Ctrl-A"   : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();
            
            if (!this.settings.atLink)
            {
                alert("Error: settings.atLink == false");
                return ;
            }

            cm.replaceSelection("@" + selection);

            if (selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 1);
            }
        },
        
        "Shift-Ctrl-C"     : "code",
        "Shift-Ctrl-Q"     : "quote",
        "Shift-Ctrl-S"     : "del",
        "Shift-Ctrl-K"     : "tex",  // KaTeX
        
        "Shift-Alt-C"      : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();
            
            cm.replaceSelection(["```", selection, "```"].join("\n"));

            if (selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 3);
            } 
        },
        
        "Shift-Ctrl-Alt-C" : "code-block",
        "Shift-Ctrl-H"     : "html-entities",
        "Shift-Alt-H"      : "help",
        "Shift-Ctrl-U"     : "uppercase",
        "Shift-Alt-U"      : "ucwords",
        "Shift-Ctrl-Alt-U" : "ucfirst",
        "Shift-Alt-L"      : "lowercase",
        
        "Shift-Ctrl-I"     : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();
            
            var title = (selection === "") ? "" : " \""+selection+"\"";

            cm.replaceSelection("![" + selection + "]("+title+")");

            if (selection === "") {
                cm.setCursor(cursor.line, cursor.ch + 4);
            }
        },
        
        "Shift-Ctrl-Alt-I" : "image",
        "Shift-Ctrl-L"     : "link",
        "Shift-Ctrl-O"     : "list-ol",
        "Shift-Ctrl-P"     : "preformatted-text",
        "Shift-Ctrl-T"     : "table",
        "Shift-Alt-P"      : "pagebreak",
        "F9"               : "watch",
        "F10"              : "preview",
        "F11"              : "fullscreen",
    };
    
    /**
     * 清除字符串两边的空格
     * Clear the space of strings both sides.
     * 
     * @param   {String}    str            string
     * @returns {String}                   trimed string    
     */
    
    var trim = function(str) {
        return (!String.prototype.trim) ? str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") : str.trim();
    };
    
    editormd.trim = trim;
    
    /**
     * 所有单词首字母大写
     * Words first to uppercase
     * 
     * @param   {String}    str            string
     * @returns {String}                   string
     */
    
    var ucwords = function (str) {
        return str.toLowerCase().replace(/\b(\w)|\s(\w)/g, function($1) {  
            return $1.toUpperCase();
        });
    };
    
    editormd.ucwords = editormd.wordsFirstUpperCase = ucwords;
    
    /**
     * 字符串首字母大写
     * Only string first char to uppercase
     * 
     * @param   {String}    str            string
     * @returns {String}                   string
     */
    
    var firstUpperCase = function(str) {        
        return str.toLowerCase().replace(/\b(\w)/, function($1){
            return $1.toUpperCase();
        });
    };
    
    var ucfirst = firstUpperCase;
    
    editormd.firstUpperCase = editormd.ucfirst = firstUpperCase;
    
    editormd.urls = {
        atLinkBase : "https://github.com/"
    };
    
    editormd.regexs = {
        atLink        : /@(\w+)/g,
        email         : /(\w+)@(\w+)\.(\w+)\.?(\w+)?/g,
        emailLink     : /(mailto:)?([\w\.\_]+)@(\w+)\.(\w+)\.?(\w+)?/g,

        pageBreak     : /^\[[=]{8,}\]$/,
        pinyin        : /\{([^|{}]+)\s*\|\s*([^|{}]+)\}/g,
        unicodeAlignCenter : /⁑⁑([\s\S]*?)⁑⁑/g,
        unicodeAlignLeft   : /⁑⁖([\s\S]*?)⁖⁑/g,
        unicodeAlignRight  : /⁑⠕([\s\S]*?)⠕⁑/g,
        unicodeAlignJustify: /⁑⁛([\s\S]*?)⁛⁑/g,
        imageSizeNew    : /!\[([^\]]*)\]\(([^)]+)\)<(\d+),\s*(\d+)>/g,
        tabs            : /\[\[tabs\]\]([\s\S]*?)\[\[\/tabs\]\]/g,
        tabItem       : /\[\[tab:([^\]]+)\]\]([\s\S]*?)\[\[\/tab\]\]/g,
        columns       : /\[\[columns:(\d+)\]\]([\s\S]*?)\[\[\/columns\]\]/g,
        videoBlock    : /\[\[video\]\]\s*\n?([\s\S]*?)\n?\s*\[\[\/video\]\]/g,
        fileBlock     : /\[\[file\]\]\s*\n?([\s\S]*?)\n?\s*\[\[\/file\]\]/g,
        tooltipLink   : /\[([^\]]+)\]\(tooltip:([^)]+)\)/g,
        tooltipImg    : /\{tooltip:([^}]+)\}/g
    };

    /**
     * Preprocess markdown to extract custom block-level syntax (tabs, columns, align)
     * before passing to marked. This prevents conflicts with fenced code blocks.
     */
    editormd.preprocessMarkdownBlocks = function(markdown, options) {
        var placeholders = [];
        var placeholderId = 0;

        function addPlaceholder(html) {
            var id = "editormd-ph-" + (++placeholderId);
            placeholders.push({ id: id, html: html });
            return "<!--" + id + "-->";
        }

        function createMarkedOptions(opts, disableBlocks) {
            var ro = {
                toc: false, tocm: false, tocStartLevel: 1,
                taskList: opts.taskList,
                tex: opts.tex, pageBreak: opts.pageBreak,
                atLink: opts.atLink, emailLink: opts.emailLink,
                flowChart: opts.flowChart, sequenceDiagram: opts.sequenceDiagram,
                previewCodeHighlight: opts.previewCodeHighlight,
                pinyin: opts.pinyin,
                imageResize: opts.imageResize,
                echarts: opts.echarts,
                tabs: disableBlocks ? false : opts.tabs,
                columns: disableBlocks ? false : opts.columns,
                tooltip: opts.tooltip
            };
            return {
                renderer: editormd.markedRenderer([], ro),
                gfm: true, tables: true, breaks: true,
                pedantic: false, sanitize: false,
                smartLists: true, smartypants: true
            };
        }

        // Convert new image/video size syntax to inline HTML for renderer compatibility
        if (options.imageResize !== false) {
            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            markdown = markdown.replace(editormd.regexs.imageSizeNew, function(match, alt, url, w, h) {
                var style = "";
                if (w) style += "width:" + w + "px;";
                if (h) style += "height:" + h + "px;";
                var styleAttr = style ? ' style="' + style + '"' : "";
                if (videoExts.test(url)) {
                    return '<video src="' + url + '" controls preload="metadata"' + styleAttr + '>' + alt + '</video>';
                }
                return '<img src="' + url + '" alt="' + alt + '"' + styleAttr + '>';
            });
        }

        // Process tabs blocks: [[tabs]]...[[/tabs]]
        if (options.tabs !== false) {
            markdown = markdown.replace(editormd.regexs.tabs, function(match, content) {
                var tabHtml = '<div class="editormd-tabs">';
                var tabHeaders = '<ul class="editormd-tab-nav">';
                var tabBodies = '<div class="editormd-tab-body">';
                var tabIndex = 0;
                var tabRegex = editormd.regexs.tabItem;
                var tabMatch;
                var hasTabs = false;
                var tabMarkedOptions = createMarkedOptions(options, true);

                while ((tabMatch = tabRegex.exec(content)) !== null) {
                    hasTabs = true;
                    var tabTitle = tabMatch[1].trim();
                    var tabContent = tabMatch[2].trim();
                    var preprocessed = editormd.preprocessMarkdownBlocks(tabContent, options);
                    var tabContentHtml = editormd.$marked(preprocessed.markdown, tabMarkedOptions);
                    tabContentHtml = editormd.restorePlaceholders(tabContentHtml, preprocessed.placeholders);

                    var activeClass = (tabIndex === 0) ? ' class="active"' : '';
                    var activeBodyClass = (tabIndex === 0) ? ' class="editormd-tab-panel active"' : ' class="editormd-tab-panel"';
                    tabHeaders += '<li' + activeClass + ' data-index="' + tabIndex + '">' + tabTitle + '</li>';
                    tabBodies += '<div' + activeBodyClass + ' data-index="' + tabIndex + '">' + tabContentHtml + '</div>';
                    tabIndex++;
                }

                if (!hasTabs) {
                    var preprocessed2 = editormd.preprocessMarkdownBlocks(content.trim(), options);
                    var defaultHtml = editormd.$marked(preprocessed2.markdown, tabMarkedOptions);
                    defaultHtml = editormd.restorePlaceholders(defaultHtml, preprocessed2.placeholders);
                    tabHeaders += '<li class="active" data-index="0">Tab1</li>';
                    tabBodies += '<div class="editormd-tab-panel active" data-index="0">' + defaultHtml + '</div>';
                }

                tabHeaders += '</ul>';
                tabBodies += '</div>';
                tabHtml += tabHeaders + tabBodies + '</div>';
                return addPlaceholder(tabHtml);
            });
        }

        // Process columns blocks: [[columns:N]]...[[/columns]]
        if (options.columns !== false) {
            markdown = markdown.replace(editormd.regexs.columns, function(match, count, content) {
                var colCount = parseInt(count, 10) || 3;
                var colMarkedOptions = createMarkedOptions(options, true);
                var preprocessed = editormd.preprocessMarkdownBlocks(content.trim(), options);
                var colContentHtml = editormd.$marked(preprocessed.markdown, colMarkedOptions);
                colContentHtml = editormd.restorePlaceholders(colContentHtml, preprocessed.placeholders);
                var colHtml = '<div class="editormd-columns" data-count="' + colCount + '" style="-webkit-column-count:' + colCount + ';-moz-column-count:' + colCount + ';column-count:' + colCount + ';">' + colContentHtml + '</div>';
                return addPlaceholder(colHtml);
            });
        }

        // Process video blocks: [[video]]...[[/video]]
        markdown = markdown.replace(editormd.regexs.videoBlock, function(match, content) {
            var lines = content.trim().split("\n");
            var resultHtml = "";
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;
                var parts = line.split("|");
                var url = parts[0].trim();
                var title = parts[1] ? parts[1].trim() : "";
                resultHtml += '<video src="' + url + '" controls preload="metadata" class="editormd-video-player">' + (title || "Video") + '</video>';
            }
            return addPlaceholder(resultHtml);
        });

        // Process file blocks: [[file]]...[[/file]]
        markdown = markdown.replace(editormd.regexs.fileBlock, function(match, content) {
            var lines = content.trim().split("\n");
            var resultHtml = '<div class="editormd-file-list">';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;
                var parts = line.split("|");
                var url = parts[0].trim();
                var name = parts[1] ? parts[1].trim() : url.split("/").pop();
                var ext = url.split(".").pop().toLowerCase();
                resultHtml += '<a href="' + url + '" download class="editormd-attachment-link" data-ext="' + ext + '">' + name + '</a>';
            }
            resultHtml += '</div>';
            return addPlaceholder(resultHtml);
        });

        return { markdown: markdown, placeholders: placeholders };
    };

    editormd.restorePlaceholders = function(html, placeholders) {
        if (!placeholders || placeholders.length === 0) return html;
        for (var i = 0; i < placeholders.length; i++) {
            var ph = placeholders[i];
            html = html.split("<!--" + ph.id + "-->").join(ph.html);
        }
        return html;
    };



    /**
     * 自定义marked的解析器
     * Custom Marked renderer rules
     * 
     * @param   {Array}    markdownToC     传入用于接收TOC的数组
     * @returns {Renderer} markedRenderer  返回marked的Renderer自定义对象
     */

    editormd.markedRenderer = function(markdownToC, options) {
        var defaults = {
            toc                  : true,           // Table of contents
            tocm                 : false,
            tocStartLevel        : 1,              // Said from H1 to create ToC  
            pageBreak            : true,
            atLink               : true,           // for @link
            emailLink            : true,           // for mail address auto link
            taskList             : false,          // Enable Github Flavored Markdown task lists

            tex                  : false,          // TeX(LaTeX), based on KaTeX
            flowChart            : false,          // flowChart.js only support IE9+
            sequenceDiagram      : false,          // sequenceDiagram.js only support IE9+
            pinyin               : false,          // Enable pinyin syntax {text | pinyin}
            textAlign            : true,           // Enable text align syntax
            imageResize          : true,           // Enable image width/height syntax
            echarts              : false,          // Enable Apache ECharts
            tabs                 : true,           // Enable tabs syntax
            columns              : true,           // Enable multi-column layout
            tooltip              : true            // Enable tooltip syntax
        };
        
        var settings        = $.extend(defaults, options || {});    
        var marked          = editormd.$marked;
        var markedRenderer  = new marked.Renderer();
        markdownToC         = markdownToC || [];        
            
        var regexs          = editormd.regexs;
        var atLinkReg       = regexs.atLink;
        var emailReg        = regexs.email;
        var emailLinkReg    = regexs.emailLink;
        var pageBreakReg    = regexs.pageBreak;

        markedRenderer.atLink = function(text) {

            if (atLinkReg.test(text))
            { 
                if (settings.atLink) 
                {
                    text = text.replace(emailReg, function($1, $2, $3, $4) {
                        return $1.replace(/@/g, "_#_&#64;_#_");
                    });

                    text = text.replace(atLinkReg, function($1, $2) {
                        return "<a href=\"" + editormd.urls.atLinkBase + "" + $2 + "\" title=\"&#64;" + $2 + "\" class=\"at-link\">" + $1 + "</a>";
                    }).replace(/_#_&#64;_#_/g, "@");
                }
                
                if (settings.emailLink)
                {
                    text = text.replace(emailLinkReg, function($1, $2, $3, $4, $5) {
                        return (!$2 && $.inArray($5, "jpg|jpeg|png|gif|webp|ico|icon|pdf".split("|")) < 0) ? "<a href=\"mailto:" + $1 + "\">"+$1+"</a>" : $1;
                    });
                }

                return text;
            }

            return text;
        };
        
        markedRenderer.pinyin = function(text) {
            if (!settings.pinyin) {
                return text;
            }
            
            var pinyinReg = editormd.regexs.pinyin;
            
            text = text.replace(pinyinReg, function($1, $2, $3) {
                var baseText = $2.trim();
                var pyText = $3.trim();
                return '<ruby class="editormd-pinyin"><rb>' + baseText + '</rb><rt>' + pyText + '</rt></ruby>';
            });
            
            return text;
        };
        
        markedRenderer.postProcessInline = function(text) {
            if (!text) {
                return text;
            }
            
            text = this.pinyin(text);
            
            if (settings.textAlign) {
                text = text.replace(editormd.regexs.unicodeAlignCenter, function($0, $1) {
                    return '<span class="editormd-text-align editormd-text-align-center" style="display:inline-block;width:100%;text-align:center;">' + $1 + '</span>';
                });
                text = text.replace(editormd.regexs.unicodeAlignLeft, function($0, $1) {
                    return '<span class="editormd-text-align editormd-text-align-left" style="display:inline-block;width:100%;text-align:left;">' + $1 + '</span>';
                });
                text = text.replace(editormd.regexs.unicodeAlignRight, function($0, $1) {
                    return '<span class="editormd-text-align editormd-text-align-right" style="display:inline-block;width:100%;text-align:right;">' + $1 + '</span>';
                });
                text = text.replace(editormd.regexs.unicodeAlignJustify, function($0, $1) {
                    return '<span class="editormd-text-align editormd-text-align-justify" style="display:inline-block;width:100%;text-align:justify;">' + $1 + '</span>';
                });
            }
            
            return text;
        };
        
        markedRenderer.link = function (href, title, text) {

            if (this.options.sanitize) {
                try {
                    var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g,"").toLowerCase();
                } catch(e) {
                    return "";
                }

                if (prot.indexOf("javascript:") === 0) {
                    return "";
                }
            }

            // Tooltip link syntax: [text](tooltip:content) / [text](tooltip:image:url) / [text](tooltip:iframe:url)
            if (settings.tooltip && href.indexOf("tooltip:") === 0) {
                var tooltipBody = href.substring(8);
                var tooltipType = "text";
                var tooltipContent = tooltipBody;
                var typeMatch = tooltipBody.match(/^(image|iframe):/);
                if (typeMatch) {
                    tooltipType = typeMatch[1];
                    tooltipContent = tooltipBody.substring(typeMatch[0].length);
                }
                return '<span class="editormd-tooltip-trigger" data-tooltip="' + tooltipContent + '" data-tooltip-type="' + tooltipType + '" tabindex="0">' + text + '</span>';
            }

            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            var imageExts = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
            
            if (videoExts.test(href)) {
                var videoOut = '<video src="' + href + '" controls preload="metadata" class="editormd-video-player">';
                if (title) videoOut += ' title="' + title + '"';
                videoOut += text + '</video>';
                return videoOut;
            }
            
            var out = "<a href=\"" + href + "\"";
            
            if (!imageExts.test(href)) {
                out += ' download class="editormd-attachment-link"';
            }
            
            if (atLinkReg.test(title) || atLinkReg.test(text))
            {
                if (title)
                {
                    out += " title=\"" + title.replace(/@/g, "&#64;");
                }
                
                return out + "\">" + text.replace(/@/g, "&#64;") + "</a>";
            }

            if (title) {
                out += " title=\"" + title + "\"";
            }

            out += " target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";

            return out;
        };
        
        markedRenderer.image = function(href, title, text) {
            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            if (videoExts.test(href)) {
                var videoOut = "<video src=\"" + href + "\" controls preload=\"metadata\"";
                if (title) {
                    videoOut += " title=\"" + title + "\"";
                }
                videoOut += ">" + text + "</video>";
                return videoOut;
            }
            
            var out = "<img src=\"" + href + "\" alt=\"" + text + "\"";
            var style = "";
            var tooltipAttr = "";
            
            // Image tooltip syntax: ![alt](url){tooltip:content} / {tooltip:image:url} / {tooltip:iframe:url}
            if (settings.tooltip && title && title.indexOf("tooltip:") === 0) {
                var imgTooltipBody = title.substring(8);
                var imgTooltipType = "text";
                var imgTooltipContent = imgTooltipBody;
                var imgTypeMatch = imgTooltipBody.match(/^(image|iframe):/);
                if (imgTypeMatch) {
                    imgTooltipType = imgTypeMatch[1];
                    imgTooltipContent = imgTooltipBody.substring(imgTypeMatch[0].length);
                }
                tooltipAttr = ' data-tooltip="' + imgTooltipContent + '" data-tooltip-type="' + imgTooltipType + '" class="editormd-tooltip-trigger"';
                out = "<img src=\"" + href + "\" alt=\"" + text + "\"" + tooltipAttr;
                title = "";
            }
            
            if (title) {
                out += " title=\"" + title + "\"";
            }
            
            if (style) {
                out += " style=\"" + style + "\"";
            }
            
            out += " />";
            return out;
        };
        
        markedRenderer.heading = function(text, level, raw) {
                    
            var linkText       = text;
            var hasLinkReg     = /\s*\<a\s*href\=\"(.*)\"\s*([^\>]*)\>(.*)\<\/a\>\s*/;
            var getLinkTextReg = /\s*\<a\s*([^\>]+)\>([^\>]*)\<\/a\>\s*/g;

            if (hasLinkReg.test(text)) 
            {
                var tempText = [];
                text         = text.split(/\<a\s*([^\>]+)\>([^\>]*)\<\/a\>/);

                for (var i = 0, len = text.length; i < len; i++)
                {
                    tempText.push(text[i].replace(/\s*href\=\"(.*)\"\s*/g, ""));
                }

                text = tempText.join(" ");
            }
            
            text = trim(text);
            
            var escapedText    = text.toLowerCase().replace(/[^\w]+/g, "-");
            var toc = {
                text  : text,
                level : level,
                slug  : escapedText
            };
            
            var isChinese = /^[\u4e00-\u9fa5]+$/.test(text);
            var id        = (isChinese) ? escape(text).replace(/\%/g, "") : text.toLowerCase().replace(/[^\w]+/g, "-");

            markdownToC.push(toc);
            
            var headingHTML = "<h" + level + " id=\"h"+ level + "-" + this.options.headerPrefix + id +"\">";
            
            headingHTML    += "<a name=\"" + text + "\" class=\"reference-link\"></a>";
            headingHTML    += "<span class=\"header-link octicon octicon-link\"></span>";
            var displayText = (hasLinkReg) ? this.atLink(linkText) : this.atLink(text);
            headingHTML    += this.postProcessInline(displayText);
            headingHTML    += "</h" + level + ">";

            return headingHTML;
        };
        
        markedRenderer.pageBreak = function(text) {
            if (pageBreakReg.test(text) && settings.pageBreak)
            {
                text = "<hr style=\"page-break-after:always;\" class=\"page-break editormd-page-break\" />";
            }
            
            return text;
        };

        markedRenderer.paragraph = function(text) {
            var isTeXInline     = /\$\$(.*)\$\$/g.test(text);
            var isTeXLine       = /^\$\$(.*)\$\$$/.test(text);
            var isTeXAddClass   = (isTeXLine)     ? " class=\"" + editormd.classNames.tex + "\"" : "";
            var isToC           = (settings.tocm) ? /^(\[TOC\]|\[TOCM\])$/.test(text) : /^\[TOC\]$/.test(text);
            var isToCMenu       = /^\[TOCM\]$/.test(text);
            
            if (!isTeXLine && isTeXInline) 
            {
                text = text.replace(/(\$\$([^\$]*)\$\$)+/g, function($1, $2) {
                    return "<span class=\"" + editormd.classNames.tex + "\">" + $2.replace(/\$/g, "") + "</span>";
                });
            } 
            else 
            {
                text = (isTeXLine) ? text.replace(/\$/g, "") : text;
            }
            
            var tocHTML = "<div class=\"markdown-toc editormd-markdown-toc\">" + text + "</div>";
            
            text = this.postProcessInline(text);
            
            return (isToC) ? ( (isToCMenu) ? "<div class=\"editormd-toc-menu\">" + tocHTML + "</div><br/>" : tocHTML )
                           : ( (pageBreakReg.test(text)) ? this.pageBreak(text) : "<p" + isTeXAddClass + ">" + this.atLink(text) + "</p>\n" );
        };

        markedRenderer.code = function (code, lang, escaped) { 

            if (lang === "seq" || lang === "sequence")
            {
                return "<div class=\"sequence-diagram\">" + code + "</div>";
            } 
            else if ( lang === "flow")
            {
                return "<div class=\"flowchart\">" + code + "</div>";
            } 
            else if ( lang === "math" || lang === "latex" || lang === "katex")
            {
                return "<p class=\"" + editormd.classNames.tex + "\">" + code + "</p>";
            }
            else if (lang === "echarts" && settings.echarts)
            {
                var chartId = "editormd-echarts-" + Math.random().toString(36).substr(2, 9);
                var config = {};
                try {
                    config = JSON.parse(code);
                } catch(e) {
                    config = { type: "bar", title: { text: "ECharts 配置错误" }, xAxis: { data: ["A"] }, yAxis: {}, series: [{ type: "bar", data: [0] }] };
                }
                return '<div id="' + chartId + '" class="editormd-echarts" data-config=\'' + JSON.stringify(config) + '\' style="width:100%;height:400px;"></div>';
            }
            else 
            {

                return marked.Renderer.prototype.code.apply(this, arguments);
            }
        };

        markedRenderer.tablecell = function(content, flags) {
            var type = (flags.header) ? "th" : "td";
            var tag  = (flags.align)  ? "<" + type +" style=\"text-align:" + flags.align + "\">" : "<" + type + ">";
            
            return tag + this.postProcessInline(this.atLink(content)) + "</" + type + ">\n";
        };

        markedRenderer.listitem = function(text) {
            if (settings.taskList && /^\s*\[[x\s]\]\s*/.test(text)) 
            {
                text = text.replace(/^\s*\[\s\]\s*/, "<input type=\"checkbox\" class=\"task-list-item-checkbox\" /> ")
                           .replace(/^\s*\[x\]\s*/,  "<input type=\"checkbox\" class=\"task-list-item-checkbox\" checked disabled /> ");

                return "<li style=\"list-style: none;\">" + this.postProcessInline(this.atLink(text)) + "</li>";
            }
            else 
            {
                return "<li>" + this.postProcessInline(this.atLink(text)) + "</li>";
            }
        };
        
        return markedRenderer;
    };
    
    /**
     *
     * 生成TOC(Table of Contents)
     * Creating ToC (Table of Contents)
     * 
     * @param   {Array}    toc             从marked获取的TOC数组列表
     * @param   {Element}  container       插入TOC的容器元素
     * @param   {Integer}  startLevel      Hx 起始层级
     * @returns {Object}   tocContainer    返回ToC列表容器层的jQuery对象元素
     */
    
    editormd.markdownToCRenderer = function(toc, container, tocDropdown, startLevel) {
        
        var html        = "";    
        var lastLevel   = 0;
        var classPrefix = this.classPrefix;
        
        startLevel      = startLevel  || 1;
        
        for (var i = 0, len = toc.length; i < len; i++) 
        {
            var text  = toc[i].text;
            var level = toc[i].level;
            
            if (level < startLevel) {
                continue;
            }
            
            if (level > lastLevel) 
            {
                html += "";
            }
            else if (level < lastLevel) 
            {
                html += (new Array(lastLevel - level + 2)).join("</ul></li>");
            } 
            else 
            {
                html += "</ul></li>";
            }

            html += "<li><a class=\"toc-level-" + level + "\" href=\"#" + text + "\" level=\"" + level + "\">" + text + "</a><ul>";
            lastLevel = level;
        }
        
        var tocContainer = container.find(".markdown-toc");
        
        if ((tocContainer.length < 1 && container.attr("previewContainer") === "false"))
        {
            var tocHTML = "<div class=\"markdown-toc " + classPrefix + "markdown-toc\"></div>";
            
            tocHTML = (tocDropdown) ? "<div class=\"" + classPrefix + "toc-menu\">" + tocHTML + "</div>" : tocHTML;
            
            container.html(tocHTML);
            
            tocContainer = container.find(".markdown-toc");
        }
        
        if (tocDropdown)
        {
            tocContainer.wrap("<div class=\"" + classPrefix + "toc-menu\"></div><br/>");
        }
        
        tocContainer.html("<ul class=\"markdown-toc-list\"></ul>").children(".markdown-toc-list").html(html.replace(/\r?\n?\<ul\>\<\/ul\>/g, ""));
        
        return tocContainer;
    };
    
    /**
     *
     * 生成TOC下拉菜单
     * Creating ToC dropdown menu
     * 
     * @param   {Object}   container       插入TOC的容器jQuery对象元素
     * @param   {String}   tocTitle        ToC title
     * @returns {Object}                   return toc-menu object
     */
    
    editormd.tocDropdownMenu = function(container, tocTitle) {
        
        tocTitle      = tocTitle || "Table of Contents";
        
        var zindex    = 400;
        var tocMenus  = container.find("." + this.classPrefix + "toc-menu");

        tocMenus.each(function() {
            var $this  = $(this);
            var toc    = $this.children(".markdown-toc");
            var icon   = "<i class=\"fa fa-angle-down\"></i>";
            var btn    = "<a href=\"javascript:;\" class=\"toc-menu-btn\">" + icon + tocTitle + "</a>";
            var menu   = toc.children("ul");            
            var list   = menu.find("li");
            
            toc.append(btn);
            
            list.first().before("<li><h1>" + tocTitle + " " + icon + "</h1></li>");
            
            $this.mouseover(function(){
                menu.show();

                list.each(function(){
                    var li = $(this);
                    var ul = li.children("ul");

                    if (ul.html() === "")
                    {
                        ul.remove();
                    }

                    if (ul.length > 0 && ul.html() !== "")
                    {
                        var firstA = li.children("a").first();

                        if (firstA.children(".fa").length < 1)
                        {
                            firstA.append( $(icon).css({ float:"right", paddingTop:"4px" }) );
                        }
                    }

                    li.mouseover(function(){
                        ul.css("z-index", zindex).show();
                        zindex += 1;
                    }).mouseleave(function(){
                        ul.hide();
                    });
                });
            }).mouseleave(function(){
                menu.hide();
            }); 
        });       
        
        return tocMenus;
    };
    
    /**
     * 简单地过滤指定的HTML标签
     * Filter custom html tags
     * 
     * @param   {String}   html          要过滤HTML
     * @param   {String}   filters       要过滤的标签
     * @returns {String}   html          返回过滤的HTML
     */
    
    editormd.filterHTMLTags = function(html, filters) {
        
        if (typeof html !== "string") {
            html = new String(html);
        }
            
        if (typeof filters !== "string") {
            return html;
        }

        var expression = filters.split("|");
        var filterTags = expression[0].split(",");
        var attrs      = expression[1];

        for (var i = 0, len = filterTags.length; i < len; i++)
        {
            var tag = filterTags[i];

            html = html.replace(new RegExp("\<\s*" + tag + "\s*([^\>]*)\>([^\>]*)\<\s*\/" + tag + "\s*\>", "igm"), "");
        }
        
        // Enhanced XSS protection with whitelist approach
        var xssWhitelist = {
            allowedTags: ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'img', 'a', 'b', 'i', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'ruby', 'rb', 'rt', 'rp', 'input', 'del', 'ins', 'mark', 'small'],
            allowedAttributes: {
                '*': ['class', 'id', 'style', 'title'],
                'a': ['href', 'target', 'rel'],
                'img': ['src', 'alt', 'width', 'height', 'title'],
                'table': ['border', 'cellpadding', 'cellspacing'],
                'th': ['colspan', 'rowspan', 'align'],
                'td': ['colspan', 'rowspan', 'align'],
                'input': ['type', 'checked', 'disabled', 'class'],
                'code': ['class', 'data-lang'],
                'pre': ['class', 'data-lang']
            },
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
            dangerousAttributes: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseenter', 'onmouseleave', 'ontouchstart', 'ontouchend', 'ontouchmove', 'onscroll', 'onresize', 'onselect', 'onreset', 'onformchange', 'onforminput', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onabort', 'oncanplay', 'oncanplaythrough', 'oncontextmenu', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'oninput', 'oninvalid', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreadystatechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 'onwheel'],
            dangerousTags: ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'base', 'basefont', 'link', 'meta', 'noscript', 'template', 'canvas', 'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup', 'datalist', 'fieldset', 'label', 'legend', 'meter', 'output', 'progress', 'audio', 'video', 'source', 'track']
        };
        
        // Remove dangerous tags completely
        for (var dt = 0; dt < xssWhitelist.dangerousTags.length; dt++) {
            var dTag = xssWhitelist.dangerousTags[dt];
            var dTagReg = new RegExp("<\\s*" + dTag + "[^>]*>[\\s\\S]*?<\\s*\\/\\s*" + dTag + "\\s*>", "gi");
            html = html.replace(dTagReg, "");
            // Also handle self-closing dangerous tags
            var dTagSelfReg = new RegExp("<\\s*" + dTag + "[^>]*\\/?\\s*>", "gi");
            html = html.replace(dTagSelfReg, "");
        }
        
        // Sanitize href and src attributes to prevent javascript: protocol
        html = html.replace(/(href|src)\s*=\s*["']?([^"'>\s]*)["']?/gi, function(match, attr, url) {
            var sanitizedUrl = url.replace(/[\x00-\x20\x7f]+/g, "").toLowerCase();
            if (sanitizedUrl.indexOf("javascript:") === 0 || 
                sanitizedUrl.indexOf("vbscript:") === 0 || 
                sanitizedUrl.indexOf("data:text/html") === 0 ||
                sanitizedUrl.indexOf("data:image/svg") === 0 ||
                sanitizedUrl.indexOf("mocha:") === 0 ||
                sanitizedUrl.indexOf("livescript:") === 0 ||
                sanitizedUrl.indexOf("&#") === 0) {
                return attr + '="javascript:void(0);"';
            }
            return attr + '="' + url + '"';
        });
        
        // Remove dangerous event attributes
        for (var da = 0; da < xssWhitelist.dangerousAttributes.length; da++) {
            var dAttr = xssWhitelist.dangerousAttributes[da];
            var dAttrReg = new RegExp("\\s+" + dAttr + "\\s*=\\s*['\"][^'\"]*['\"]", "gi");
            html = html.replace(dAttrReg, "");
            // Handle without quotes
            var dAttrReg2 = new RegExp("\\s+" + dAttr + "\\s*=\\s*[^\\s>]*", "gi");
            html = html.replace(dAttrReg2, "");
        }
        
        // Remove expression and behavior in style attributes (IE-specific XSS vectors)
        html = html.replace(/style\s*=\s*["'][^"']*["']/gi, function(match) {
            var sanitized = match.replace(/expression\s*\(/gi, "expr-invalid(");
            sanitized = sanitized.replace(/behavior\s*:/gi, "behavior-invalid:");
            sanitized = sanitized.replace(/javascript\s*:/gi, "javascript-invalid:");
            sanitized = sanitized.replace(/vbscript\s*:/gi, "vbscript-invalid:");
            return sanitized;
        });

        if (typeof attrs !== "undefined")
        {
            var htmlTagRegex = /\<(\w+)\s*([^\>]*)\>([^\>]*)\<\/(\w+)\>/ig;

            if (attrs === "*")
            {
                html = html.replace(htmlTagRegex, function($1, $2, $3, $4, $5) {
                    return "<" + $2 + ">" + $4 + "</" + $5 + ">";
                });         
            }
            else if (attrs === "on*")
            {
                html = html.replace(htmlTagRegex, function($1, $2, $3, $4, $5) {
                    var el = $("<" + $2 + ">" + $4 + "</" + $5 + ">");
                    var _attrs = $($1)[0].attributes;
                    var $attrs = {};
                    
                    $.each(_attrs, function(i, e) {
                        if (e.nodeName !== '"') $attrs[e.nodeName] = e.nodeValue;
                    });
                    
                    $.each($attrs, function(i) {                        
                        if (i.indexOf("on") === 0) {
                            delete $attrs[i];
                        }
                    });
                    
                    el.attr($attrs);
                    
                    var text = (typeof el[1] !== "undefined") ? $(el[1]).text() : "";

                    return el[0].outerHTML + text;
                });
            }
            else
            {
                html = html.replace(htmlTagRegex, function($1, $2, $3, $4) {
                    var filterAttrs = attrs.split(",");
                    var el = $($1);
                    el.html($4);

                    $.each(filterAttrs, function(i) {
                        el.attr(filterAttrs[i], null);
                    });

                    return el[0].outerHTML;
                });
            }
        }
        
        return html;
    };
    
    /**
     * 将Markdown文档解析为HTML用于前台显示
     * Parse Markdown to HTML for Font-end preview.
     * 
     * @param   {String}   id            用于显示HTML的对象ID
     * @param   {Object}   [options={}]  配置选项，可选
     * @returns {Object}   div           返回jQuery对象元素
     */
    
    editormd.markdownToHTML = function(id, options) {
        var defaults = {
            gfm                  : true,
            toc                  : true,
            tocm                 : false,
            tocStartLevel        : 1,
            tocTitle             : "目录",
            tocDropdown          : false,
            tocContainer         : "",
            markdown             : "",
            markdownSourceCode   : false,
            htmlDecode           : false,
            autoLoadKaTeX        : true,
            pageBreak            : true,
            atLink               : true,    // for @link
            emailLink            : true,    // for mail address auto link
            tex                  : false,
            taskList             : false,   // Github Flavored Markdown task lists
            flowChart            : false,
            sequenceDiagram      : false,
            previewCodeHighlight : true,
            echarts              : false,
            tabs                 : true,
            columns              : true,
            tooltip              : true
        };
        
        editormd.$marked  = marked;

        var div           = $("#" + id);
        var settings      = div.settings = $.extend(true, defaults, options || {});
        var saveTo        = div.find("textarea");
        
        if (saveTo.length < 1)
        {
            div.append("<textarea></textarea>");
            saveTo        = div.find("textarea");
        }        
        
        var markdownDoc   = (settings.markdown === "") ? saveTo.val() : settings.markdown; 
        var markdownToC   = [];

        var rendererOptions = {  
            toc                  : settings.toc,
            tocm                 : settings.tocm,
            tocStartLevel        : settings.tocStartLevel,
            taskList             : settings.taskList,
            tex                  : settings.tex,
            pageBreak            : settings.pageBreak,
            atLink               : settings.atLink,           // for @link
            emailLink            : settings.emailLink,        // for mail address auto link
            flowChart            : settings.flowChart,
            sequenceDiagram      : settings.sequenceDiagram,
            previewCodeHighlight : settings.previewCodeHighlight,
            pinyin               : settings.pinyin,
            imageResize          : settings.imageResize,
            echarts              : settings.echarts,
            tabs                 : settings.tabs,
            columns              : settings.columns,
            tooltip              : settings.tooltip
        };

        var markedOptions = {
            renderer    : editormd.markedRenderer(markdownToC, rendererOptions),
            gfm         : settings.gfm,
            tables      : true,
            breaks      : true,
            pedantic    : false,
            sanitize    : (settings.htmlDecode) ? false : true, // 是否忽略HTML标签，即是否开启HTML标签解析，为了安全性，默认不开启
            smartLists  : true,
            smartypants : true
        };
        
		markdownDoc = new String(markdownDoc);

        // Preprocess custom block syntax before marked parsing
        var mdPreprocess = editormd.preprocessMarkdownBlocks(markdownDoc, rendererOptions);
        var markdownParsed = marked(mdPreprocess.markdown, markedOptions);
        markdownParsed = editormd.restorePlaceholders(markdownParsed, mdPreprocess.placeholders);

        markdownParsed = editormd.filterHTMLTags(markdownParsed, settings.htmlDecode);
        
        if (settings.markdownSourceCode) {
            saveTo.text(markdownDoc);
        } else {
            saveTo.remove();
        }
        
        div.addClass("markdown-body " + this.classPrefix + "html-preview").append(markdownParsed);
        
        var tocContainer = (settings.tocContainer !== "") ? $(settings.tocContainer) : div;
        
        if (settings.tocContainer !== "")
        {
            tocContainer.attr("previewContainer", false);
        }
         
        if (settings.toc) 
        {
            div.tocContainer = this.markdownToCRenderer(markdownToC, tocContainer, settings.tocDropdown, settings.tocStartLevel);
            
            if (settings.tocDropdown || div.find("." + this.classPrefix + "toc-menu").length > 0)
            {
                this.tocDropdownMenu(div, settings.tocTitle);
            }
            
            if (settings.tocContainer !== "")
            {
                div.find(".editormd-toc-menu, .editormd-markdown-toc").remove();
            }
        }
            
        if (settings.previewCodeHighlight) 
        {
            div.find("pre").addClass("prettyprint linenums");
            prettyPrint();
        }
        
        if (!editormd.isIE8) 
        {
            var mdHasFlowChart = div.find(".flowchart").length > 0;
            var mdHasSequence  = div.find(".sequence-diagram").length > 0;
            if (mdHasFlowChart || mdHasSequence) {
                var mdRenderFs = function() {
                    if (settings.flowChart && mdHasFlowChart) {
                        div.find(".flowchart").flowChart(); 
                    }
                    if (settings.sequenceDiagram && mdHasSequence) {
                        div.find(".sequence-diagram").sequenceDiagram({theme: "simple"});
                    }
                };
                var mdNeedRaphael = (mdHasFlowChart && typeof flowchart === "undefined") || 
                                    (mdHasSequence && typeof Diagram === "undefined");
                if (mdNeedRaphael) {
                    editormd.loadScript(editormd.defaults.path + "raphael.min", function() {
                        editormd.loadScript(editormd.defaults.path + "underscore.min", function() {
                            var mdPending = 0;
                            var mdCheckDone = function() {
                                mdPending--;
                                if (mdPending <= 0) mdRenderFs();
                            };
                            if (mdHasFlowChart && typeof flowchart === "undefined") {
                                mdPending++;
                                editormd.loadScript(editormd.defaults.path + "flowchart.min", function() {
                                    editormd.loadScript(editormd.defaults.path + "jquery.flowchart.min", mdCheckDone);
                                });
                            }
                            if (mdHasSequence && typeof Diagram === "undefined") {
                                mdPending++;
                                editormd.loadScript(editormd.defaults.path + "sequence-diagram.min", mdCheckDone);
                            }
                            if (mdPending === 0) mdRenderFs();
                        });
                    });
                } else {
                    mdRenderFs();
                }
            }
        }

        if (settings.tex)
        {
            var katexHandle = function() {
                div.find("." + editormd.classNames.tex).each(function(){
                    var tex  = $(this);                    
                    katex.render(tex.html().replace(/&lt;/g, "<").replace(/&gt;/g, ">"), tex[0]);                    
                    tex.find(".katex").css("font-size", "1.6em");
                });
            };
            
            if (settings.autoLoadKaTeX && !editormd.$katex && !editormd.kaTeXLoaded)
            {
                this.loadKaTeX(function() {
                    editormd.$katex      = katex;
                    editormd.kaTeXLoaded = true;
                    katexHandle();
                });
            }
            else
            {
                katexHandle();
            }
        }
        
        if (settings.echarts)
        {
            var initMdECharts = function() {
                div.find(".editormd-echarts").each(function() {
                    var $chart = $(this);
                    if ($chart.attr("data-initialized") === "true") return;
                    if ($chart.is(":hidden") || $chart.width() === 0 || $chart.height() === 0) return;

                    var config = {};
                    try {
                        config = JSON.parse($chart.attr("data-config"));
                    } catch(e) { return; }

                    var chartInstance = echarts.init(this);
                    var option = {
                        title: config.title || {},
                        tooltip: config.tooltip || { trigger: "axis" },
                        legend: config.legend || {},
                        radar: config.radar || {},
                        series: config.series || []
                    };

                    var chartType = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                    var noAxisTypes = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst"];
                    if ($.inArray(chartType, noAxisTypes) === -1) {
                        option.xAxis = config.xAxis || {};
                        option.yAxis = config.yAxis || {};
                    }

                    chartInstance.setOption(option);
                    $chart.attr("data-initialized", "true");
                    $(window).on("resize.editormd-echarts-md", function() { chartInstance.resize(); });
                });
            };

            if (typeof echarts === "undefined") {
                editormd.loadScript(editormd.defaults.path + "echarts.min", function() {
                    initMdECharts();
                });
            } else {
                initMdECharts();
            }
        }
        
        if (settings.tabs)
        {
            div.find(".editormd-tabs").each(function() {
                var $tabs = $(this);
                if ($tabs.attr("data-initialized") === "true") {
                    return;
                }
                var $nav = $tabs.find("> .editormd-tab-nav");
                var $body = $tabs.find("> .editormd-tab-body");
                $nav.on("click", "> li", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $li = $(this);
                    var index = $li.attr("data-index");
                    $nav.find("> li").removeClass("active");
                    $li.addClass("active");
                    $body.find("> .editormd-tab-panel").removeClass("active");
                    $body.find('> .editormd-tab-panel[data-index="' + index + '"]').addClass("active");
                });
                $tabs.attr("data-initialized", "true");
            });
        }

        if (settings.columns)
        {
            div.find(".editormd-columns").each(function() {
                var $cols = $(this);
                if ($cols.attr("data-initialized") === "true") {
                    return;
                }
                var count = parseInt($cols.attr("data-count"), 10) || 2;
                $cols.find(".editormd-column-divider").remove();
                $cols.css("position", "relative");
                for (var i = 1; i < count; i++) {
                    var $divider = $('<div class="editormd-column-divider"><span class="editormd-column-divider-icon">&#166;</span></div>');
                    $divider.css({
                        position: "absolute",
                        left: (i / count * 100) + "%",
                        top: "8px",
                        bottom: "8px",
                        width: "0",
                        transform: "translateX(-50%)",
                        borderLeft: "1px dashed #bbb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: 1
                    });
                    $cols.append($divider);
                }
                $cols.attr("data-initialized", "true");
            });
        }
        
        if (settings.tooltip)
        {
            div.find(".editormd-tooltip-trigger").each(function() {
                var $trigger = $(this);
                var tooltipContent = $trigger.attr("data-tooltip");
                var tooltipType = $trigger.attr("data-tooltip-type") || "text";
                if (!tooltipContent) return;
                var tooltipHtml = '';
                if (tooltipType === "image") {
                    tooltipHtml = '<img src="' + tooltipContent + '" alt="" />';
                } else if (tooltipType === "iframe") {
                    tooltipHtml = '<iframe src="' + tooltipContent + '" frameborder="0"></iframe>';
                } else {
                    tooltipHtml = tooltipContent;
                }
                var $tooltip = $('<div class="editormd-tooltip-popup editormd-tooltip-' + tooltipType + '">' + tooltipHtml + '</div>');
                $("body").append($tooltip);
                var showTooltip = function(e) {
                    clearTimeout($trigger.data("tooltip-timer"));
                    var offset = $trigger.offset();
                    $tooltip.css({
                        left: offset.left + ($trigger.outerWidth() / 2) - ($tooltip.outerWidth() / 2),
                        top: offset.top - $tooltip.outerHeight() - 8,
                        display: "block"
                    }).addClass("show");
                };
                var hideTooltip = function() {
                    $trigger.data("tooltip-timer", setTimeout(function() {
                        $tooltip.removeClass("show");
                    }, 200));
                };
                $trigger.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
                $tooltip.on("mouseenter", function() {
                    clearTimeout($trigger.data("tooltip-timer"));
                }).on("mouseleave", function() {
                    $tooltip.removeClass("show");
                });
                $trigger.on("focus", showTooltip).on("blur", hideTooltip);
            });
        }
        
        div.getMarkdown = function() {            
            return saveTo.val();
        };
        
        return div;
    };
    
    // Editor.md themes, change toolbar themes etc.
    // added @1.5.0
    editormd.themes        = ["default", "dark"];
    
    // Preview area themes
    // added @1.5.0
    editormd.previewThemes = ["default", "dark"];
    
    // CodeMirror / editor area themes
    // @1.5.0 rename -> editorThemes, old version -> themes
    editormd.editorThemes = [
        "default", "3024-day", "3024-night",
        "ambiance", "ambiance-mobile",
        "base16-dark", "base16-light", "blackboard",
        "cobalt",
        "eclipse", "elegant", "erlang-dark",
        "lesser-dark",
        "mbo", "mdn-like", "midnight", "monokai",
        "neat", "neo", "night",
        "paraiso-dark", "paraiso-light", "pastel-on-dark",
        "rubyblue",
        "solarized",
        "the-matrix", "tomorrow-night-eighties", "twilight",
        "vibrant-ink",
        "xq-dark", "xq-light"
    ];

    editormd.loadPlugins = {};
    
    editormd.loadFiles = {
        js     : [],
        css    : [],
        plugin : []
    };
    
    /**
     * 动态加载Editor.md插件，但不立即执行
     * Load editor.md plugins
     * 
     * @param {String}   fileName              插件文件路径
     * @param {Function} [callback=function()] 加载成功后执行的回调函数
     * @param {String}   [into="head"]         嵌入页面的位置
     */
    
    editormd.loadPlugin = function(fileName, callback, into) {
        callback   = callback || function() {};
        
        this.loadScript(fileName, function() {
            editormd.loadFiles.plugin.push(fileName);
            callback();
        }, into);
    };
    
    /**
     * 动态加载CSS文件的方法
     * Load css file method
     * 
     * @param {String}   fileName              CSS文件名
     * @param {Function} [callback=function()] 加载成功后执行的回调函数
     * @param {String}   [into="head"]         嵌入页面的位置
     */
    
    editormd.loadCSS   = function(fileName, callback, into) {
        into       = into     || "head";        
        callback   = callback || function() {};
        
        if ($.inArray(fileName, editormd.loadFiles.css) >= 0) {
            callback();
            return;
        }
        
        var css    = document.createElement("link");
        css.type   = "text/css";
        css.rel    = "stylesheet";
        css.onload = css.onreadystatechange = function() {
            editormd.loadFiles.css.push(fileName);
            callback();
        };

        css.href   = fileName + ".css";

        if(into === "head") {
            document.getElementsByTagName("head")[0].appendChild(css);
        } else {
            document.body.appendChild(css);
        }
    };
    
    editormd.isIE    = (navigator.appName == "Microsoft Internet Explorer");
    editormd.isIE8   = (editormd.isIE && navigator.appVersion.match(/8./i) == "8.");

    /**
     * 动态加载JS文件的方法
     * Load javascript file method
     * 
     * @param {String}   fileName              JS文件名
     * @param {Function} [callback=function()] 加载成功后执行的回调函数
     * @param {String}   [into="head"]         嵌入页面的位置
     */

    editormd.loadScript = function(fileName, callback, into) {
        
        into          = into     || "head";
        callback      = callback || function() {};
        
        if ($.inArray(fileName, editormd.loadFiles.js) >= 0) {
            callback();
            return;
        }
        
        var script    = null; 
        script        = document.createElement("script");
        script.id     = fileName.replace(/[\./]+/g, "-");
        script.type   = "text/javascript";        
        script.src    = fileName + ".js";
        
        if (editormd.isIE8) 
        {            
            script.onreadystatechange = function() {
                if(script.readyState) 
                {
                    if (script.readyState === "loaded" || script.readyState === "complete") 
                    {
                        script.onreadystatechange = null; 
                        editormd.loadFiles.js.push(fileName);
                        callback();
                    }
                } 
            };
        }
        else
        {
            script.onload = function() {
                editormd.loadFiles.js.push(fileName);
                callback();
            };
        }

        if (into === "head") {
            document.getElementsByTagName("head")[0].appendChild(script);
        } else {
            document.body.appendChild(script);
        }
    };
    
    // 使用国外的CDN，加载速度有时会很慢，或者自定义URL
    // You can custom KaTeX load url.
    editormd.katexURL  = {
        css : "lib/katex/katex.min",
        js  : "lib/katex/katex.min"
    };
    
    editormd.kaTeXLoaded = false;
    
    /**
     * 加载KaTeX文件
     * load KaTeX files
     * 
     * @param {Function} [callback=function()]  加载成功后执行的回调函数
     */
    
    editormd.loadKaTeX = function (callback) {
        editormd.loadCSS(editormd.katexURL.css, function(){
            editormd.loadScript(editormd.katexURL.js, callback || function(){});
        });
    };
        
    /**
     * 锁屏
     * lock screen
     * 
     * @param   {Boolean}   lock   Boolean 布尔值，是否锁屏
     * @returns {void}
     */
    
    editormd.lockScreen = function(lock) {
        $("html,body").css("overflow", (lock) ? "hidden" : "");
    };
        
    /**
     * 动态创建对话框
     * Creating custom dialogs
     * 
     * @param   {Object} options 配置项键值对 Key/Value
     * @returns {dialog} 返回创建的dialog的jQuery实例对象
     */

    editormd.createDialog = function(options) {
        var defaults = {
            name : "",
            width : 420,
            height: 240,
            title : "",
            drag  : true,
            closed : true,
            content : "",
            mask : true,
            maskStyle : {
                backgroundColor : "#fff",
                opacity : 0.1
            },
            lockScreen : true,
            footer : true,
            buttons : false
        };

        options          = $.extend(true, defaults, options);
        
        var $this        = this;
        var editor       = this.editor;
        var classPrefix  = editormd.classPrefix;
        var guid         = (new Date()).getTime();
        var dialogName   = ( (options.name === "") ? classPrefix + "dialog-" + guid : options.name);
        var mouseOrTouch = editormd.mouseOrTouch;

        var html         = "<div class=\"" + classPrefix + "dialog " + dialogName + "\">";

        if (options.title !== "")
        {
            html += "<div class=\"" + classPrefix + "dialog-header\"" + ( (options.drag) ? " style=\"cursor: move;\"" : "" ) + ">";
            html += "<strong class=\"" + classPrefix + "dialog-title\">" + options.title + "</strong>";
            html += "</div>";
        }

        if (options.closed)
        {
            html += "<a href=\"javascript:;\" class=\"fa fa-close " + classPrefix + "dialog-close\"></a>";
        }

        html += "<div class=\"" + classPrefix + "dialog-container\">" + options.content;                    

        if (options.footer || typeof options.footer === "string") 
        {
            html += "<div class=\"" + classPrefix + "dialog-footer\">" + ( (typeof options.footer === "boolean") ? "" : options.footer) + "</div>";
        }

        html += "</div>";

        html += "<div class=\"" + classPrefix + "dialog-mask " + classPrefix + "dialog-mask-bg\"></div>";
        html += "<div class=\"" + classPrefix + "dialog-mask " + classPrefix + "dialog-mask-con\"></div>";
        html += "</div>";

        editor.append(html);

        var dialog = editor.find("." + dialogName);

        dialog.lockScreen = function(lock) {
            if (options.lockScreen)
            {                
                $("html,body").css("overflow", (lock) ? "hidden" : "");
                $this.resize();
            }

            return dialog;
        };

        dialog.showMask = function() {
            if (options.mask)
            {
                editor.find("." + classPrefix + "mask").css(options.maskStyle).css("z-index", editormd.dialogZindex - 1).show();
            }
            return dialog;
        };

        dialog.hideMask = function() {
            if (options.mask)
            {
                editor.find("." + classPrefix + "mask").hide();
            }

            return dialog;
        };

        dialog.loading = function(show) {                        
            var loading = dialog.find("." + classPrefix + "dialog-mask");
            loading[(show) ? "show" : "hide"]();

            return dialog;
        };

        dialog.lockScreen(true).showMask();

        dialog.show().css({
            zIndex : editormd.dialogZindex,
            border : (editormd.isIE8) ? "1px solid #ddd" : "",
            width  : (typeof options.width  === "number") ? options.width + "px"  : options.width,
            height : (typeof options.height === "number") ? options.height + "px" : options.height
        });

        var dialogPosition = function(){
            dialog.css({
                top    : ($(window).height() - dialog.height()) / 2 + "px",
                left   : ($(window).width() - dialog.width()) / 2 + "px"
            });
        };

        dialogPosition();

        $(window).resize(dialogPosition);

        dialog.children("." + classPrefix + "dialog-close").bind(mouseOrTouch("click", "touchend"), function() {
            dialog.hide().lockScreen(false).hideMask();
        });

        if (typeof options.buttons === "object")
        {
            var footer = dialog.footer = dialog.find("." + classPrefix + "dialog-footer");

            for (var key in options.buttons)
            {
                var btn = options.buttons[key];
                var btnClassName = classPrefix + key + "-btn";

                footer.append("<button class=\"" + classPrefix + "btn " + btnClassName + "\">" + btn[0] + "</button>");
                btn[1] = $.proxy(btn[1], dialog);
                footer.children("." + btnClassName).bind(mouseOrTouch("click", "touchend"), btn[1]);
            }
        }

        if (options.title !== "" && options.drag)
        {                        
            var posX, posY;
            var dialogHeader = dialog.children("." + classPrefix + "dialog-header");

            if (!options.mask) {
                dialogHeader.bind(mouseOrTouch("click", "touchend"), function(){
                    editormd.dialogZindex += 2;
                    dialog.css("z-index", editormd.dialogZindex);
                });
            }

            dialogHeader.mousedown(function(e) {
                e = e || window.event;  //IE
                posX = e.clientX - parseInt(dialog[0].style.left);
                posY = e.clientY - parseInt(dialog[0].style.top);

                document.onmousemove = moveAction;                   
            });

            var userCanSelect = function (obj) {
                obj.removeClass(classPrefix + "user-unselect").off("selectstart");
            };

            var userUnselect = function (obj) {
                obj.addClass(classPrefix + "user-unselect").on("selectstart", function(event) { // selectstart for IE                        
                    return false;
                });
            };

            var moveAction = function (e) {
                e = e || window.event;  //IE

                var left, top, nowLeft = parseInt(dialog[0].style.left), nowTop = parseInt(dialog[0].style.top);

                if( nowLeft >= 0 ) {
                    if( nowLeft + dialog.width() <= $(window).width()) {
                        left = e.clientX - posX;
                    } else {	
                        left = $(window).width() - dialog.width();
                        document.onmousemove = null;
                    }
                } else {
                    left = 0;
                    document.onmousemove = null;
                }

                if( nowTop >= 0 ) {
                    top = e.clientY - posY;
                } else {
                    top = 0;
                    document.onmousemove = null;
                }


                document.onselectstart = function() {
                    return false;
                };

                userUnselect($("body"));
                userUnselect(dialog);
                dialog[0].style.left = left + "px";
                dialog[0].style.top  = top + "px";
            };

            document.onmouseup = function() {                            
                userCanSelect($("body"));
                userCanSelect(dialog);

                document.onselectstart = null;         
                document.onmousemove = null;
            };

            dialogHeader.touchDraggable = function() {
                var offset = null;
                var start  = function(e) {
                    var orig = e.originalEvent; 
                    var pos  = $(this).parent().position();

                    offset = {
                        x : orig.changedTouches[0].pageX - pos.left,
                        y : orig.changedTouches[0].pageY - pos.top
                    };
                };

                var move = function(e) {
                    e.preventDefault();
                    var orig = e.originalEvent;

                    $(this).parent().css({
                        top  : orig.changedTouches[0].pageY - offset.y,
                        left : orig.changedTouches[0].pageX - offset.x
                    });
                };

                this.bind("touchstart", start).bind("touchmove", move);
            };

            dialogHeader.touchDraggable();
        }

        editormd.dialogZindex += 2;

        return dialog;
    };
    
    /**
     * 鼠标和触摸事件的判断/选择方法
     * MouseEvent or TouchEvent type switch
     * 
     * @param   {String} [mouseEventType="click"]    供选择的鼠标事件
     * @param   {String} [touchEventType="touchend"] 供选择的触摸事件
     * @returns {String} EventType                   返回事件类型名称
     */
    
    editormd.mouseOrTouch = function(mouseEventType, touchEventType) {
        mouseEventType = mouseEventType || "click";
        touchEventType = touchEventType || "touchend";
        
        var eventType  = mouseEventType;

        try {
            document.createEvent("TouchEvent");
            eventType = touchEventType;
        } catch(e) {}

        return eventType;
    };
    
    /**
     * 日期时间的格式化方法
     * Datetime format method
     * 
     * @param   {String}   [format=""]  日期时间的格式，类似PHP的格式
     * @returns {String}   datefmt      返回格式化后的日期时间字符串
     */
    
    editormd.dateFormat = function(format) {                
        format      = format || "";

        var addZero = function(d) {
            return (d < 10) ? "0" + d : d;
        };

        var date    = new Date(); 
        var year    = date.getFullYear();
        var year2   = year.toString().slice(2, 4);
        var month   = addZero(date.getMonth() + 1);
        var day     = addZero(date.getDate());
        var weekDay = date.getDay();
        var hour    = addZero(date.getHours());
        var min     = addZero(date.getMinutes());
        var second  = addZero(date.getSeconds());
        var ms      = addZero(date.getMilliseconds()); 
        var datefmt = "";

        var ymd     = year2 + "-" + month + "-" + day;
        var fymd    = year  + "-" + month + "-" + day;
        var hms     = hour  + ":" + min   + ":" + second;

        switch (format) 
        {
            case "UNIX Time" :
                    datefmt = date.getTime();
                break;

            case "UTC" :
                    datefmt = date.toUTCString();
                break;	

            case "yy" :
                    datefmt = year2;
                break;	

            case "year" :
            case "yyyy" :
                    datefmt = year;
                break;

            case "month" :
            case "mm" :
                    datefmt = month;
                break;                        

            case "cn-week-day" :
            case "cn-wd" :
                    var cnWeekDays = ["日", "一", "二", "三", "四", "五", "六"];
                    datefmt = "星期" + cnWeekDays[weekDay];
                break;

            case "week-day" :
            case "wd" :
                    var weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    datefmt = weekDays[weekDay];
                break;

            case "day" :
            case "dd" :
                    datefmt = day;
                break;

            case "hour" :
            case "hh" :
                    datefmt = hour;
                break;

            case "min" :
            case "ii" :
                    datefmt = min;
                break;

            case "second" :
            case "ss" :
                    datefmt = second;
                break;

            case "ms" :
                    datefmt = ms;
                break;

            case "yy-mm-dd" :
                    datefmt = ymd;
                break;

            case "yyyy-mm-dd" :
                    datefmt = fymd;
                break;

            case "yyyy-mm-dd h:i:s ms" :
            case "full + ms" : 
                    datefmt = fymd + " " + hms + " " + ms;
                break;

            case "full" :
            case "yyyy-mm-dd h:i:s" :
                default:
                    datefmt = fymd + " " + hms;
                break;
        }

        return datefmt;
    };

    return editormd;

}));
