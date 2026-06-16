;(function(factory) {
    "use strict";

    // Polyfill：始终覆盖 window.test，防止浏览器报 "test is not defined" / "test.mode is not a function" 错误
    if (typeof window !== "undefined") {
        try {
            var _testPolyfill = function() {};
            _testPolyfill.mode       = function() {};
            _testPolyfill.formatString = function() { return ""; };
            _testPolyfill.addOption  = function() {};
            _testPolyfill.show       = function() {};
            _testPolyfill.init       = function() {};
            _testPolyfill.run        = function() {};
            _testPolyfill.destroy    = function() {};
            window.test = _testPolyfill;
        } catch(e) {
            // 静默失败：test polyfill 非关键功能
        }
    }
    
	// CommonJS / Node.js 模块加载
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    { 
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD / CMD / Sea.js 模块加载
	{
        if (define.amd) // Require.js AMD 加载
        {
            /* Require.js define replace */
        } 
        else 
        {
		    define(["jquery"], factory);  // Sea.js CMD 加载
        }
	} 
	else
	{ 
        window.editormd = factory();
	}
    
}(function() {    

    /* Require.js assignment replace */
    
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
    
    editormd.title        = editormd.$name = "xfEditor";
    editormd.version      = "1.10.0";
    editormd.homePage     = "https://github.com/zhaoxianfang/editor";
    editormd.classPrefix  = "editormd-";
    
    /**
     * HTML 实体转义工具函数
     * 将特殊字符转义为 HTML 实体，防止 XSS 攻击
     */
    editormd.escapeHtml = function(str) {
        if (str == null || typeof str !== "string") return "";
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;");
    };
    
    /**
     * HTML 属性值转义（仅转义引号相关，保留 &<> 供 link href 等场景使用）
     */
    editormd.escapeAttr = function(str) {
        if (str == null || typeof str !== "string") return "";
        return str.replace(/&/g, "&amp;")
                  .replace(/"/g, "&quot;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
    };
    
    /**
     * Base64 编码（UTF-8 安全），用于在 HTML 属性中存储含特殊字符的内容
     */
    editormd.base64Encode = function(str) {
        if (str == null) return "";
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch(e) {
            return "";
        }
    };

    /**
     * Base64 解码（UTF-8 安全）
     */
    editormd.base64Decode = function(b64) {
        if (!b64) return "";
        try {
            return decodeURIComponent(escape(atob(b64)));
        } catch(e) {
            return "";
        }
    };
    
    editormd.toolbarModes = {
        full : [
            "undo", "redo", "|", 
            "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", 
            { "h1" : ["h1", "h2", "h3", "h4", "h5", "h6"] },
            "|", 
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "video", "file", "|",
            { "insert" : ["code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "insert-flowchart", "insert-sequence"] },
            "|",
            { "page" : ["page-a3", "page-a4", "page-a5"] },
            "|",
            { "align" : ["align-left", "align-center", "align-right", "align-justify"] },
            "|",
            "pinyin",
            "|",
            { "chart" : ["echarts-bar", "echarts-line", "echarts-pie", "echarts-radar", "echarts-funnel"] },
            "|",
            { "copybook" : ["copybook-tian", "copybook-mi", "copybook-pinyin"] },
            "|",
            "tabs", "columns", "tooltip", "formula", "|",
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
        mode                 : "gfm",          // 编辑器模式：gfm 或 markdown
        name                 : "",             // 表单元素 name 属性值
        value                : "",             // CodeMirror 初始值（当 mode 不是 gfm/markdown 时使用）
        theme                : "",             // xfEditor 编辑器主题（v1.5.0 之前为 CodeMirror 主题）
        editorTheme          : "default",      // 编辑区主题，即 CodeMirror 主题（v1.5.0 起）
        previewTheme         : "",             // 预览区主题
        markdown             : "",             // Markdown 源内容
        appendMarkdown       : "",             // 追加 Markdown 内容（初始化时 textarea 已有值则追加）
        width                : "100%",
        height               : "100%",
        path                 : "./lib/",       // 依赖模块文件目录
        pluginPath           : "",             // 插件目录（空则默认使用 settings.path + "../plugins/"）
        delay                : 300,            // Markdown 解析延迟，单位：毫秒
        autoLoadModules      : true,           // 是否自动加载依赖模块文件
        watch                : true,
        placeholder          : "写点什么吧~",
        gotoLine             : true,
        codeFold             : false,
        autoHeight           : false,
		autoFocus            : true,
        autoCloseTags        : true,
        searchReplace        : true,
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
        matchWordHighlight   : true,           // 单词匹配高亮：true | false | "onselected"
        styleActiveLine      : true,           // 高亮当前行
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
        // 新增事件回调
        onEditorLoad         : function() {},  // 编辑器加载完成（包括 CodeMirror 初始化）
        onPageLoad           : function() {},  // 当前网页加载完成
        onAllAsyncLoad       : function() {},  // 编辑器中的所有异步加载完成（KaTeX、FlowChart、SequenceDiagram、ECharts 等）
        onPageAllLoad        : function() {},  // 网页所有异步加载完成
        
        imageUpload          : false,
        imageFormats         : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        imageUploadURL       : "",
        crossDomainUpload    : false,
        uploadCallbackURL    : "",
        imageResize          : true,           // 启用图片宽高编辑
        
        fileUpload           : false,
        fileFormats          : ["doc", "docx", "pdf", "txt", "zip", "rar", "xls", "xlsx", "ppt", "pptx", "mp4", "mp3"],
        fileUploadURL        : "",
        
        videoUpload          : false,
        videoFormats         : ["mp4", "webm", "ogv", "mov"],
        videoUploadURL       : "",
        
        toc                  : true,           // 启用目录生成
        tocm                 : false,          // 使用 [TOCM] 自动创建目录下拉菜单
        tocTitle             : "",             // 目录下拉菜单按钮文本
        tocDropdown          : false,          // 自动创建目录下拉菜单
        tocContainer         : "",             // 目录容器选择器
        tocStartLevel        : 1,              // 目录起始标题级别（从H1开始）
        htmlDecode           : false,          // 开启 HTML 标签识别解析，XSS 安全过滤始终生效
        pageBreak            : true,           // 启用分页符解析 [========]
        atLink               : true,           // 启用 @link 语法
        emailLink            : true,           // 启用邮件地址自动链接
        taskList             : true,           // 启用 GitHub Flavored Markdown 任务列表
        tex                  : false,          // 启用 TeX/LaTeX 数学公式（基于 KaTeX）
        flowChart            : false,          // 启用流程图（仅支持 IE9+）
        sequenceDiagram      : false,          // 启用时序图（仅支持 IE9+）
        previewCodeHighlight : true,           // 启用预览区代码高亮
        pinyin               : false,          // 启用拼音标注语法 {text | pinyin}
        textAlign            : true,           // 启用文本对齐语法
        tableEdit            : true,           // 启用表格行列插入/删除
        toolbarDropdown      : true,           // 启用工具栏下拉分组
        echarts              : false,          // 启用 Apache ECharts 图表支持
        tabs                 : true,           // 启用标签页语法 [[tabs]]
        columns              : true,           // 启用多栏布局语法 [[columns:N]]
        pageBlock            : true,           // 启用纸张页面语法 [[page:A4]] / [[page:A5]]
        tooltip              : true,           // 启用悬浮提示语法 [text](tooltip:tip)
        previewOnly          : false,          // 纯预览模式（禁用表格编辑、图片缩放等交互功能）
        draftAutoSave        : false,          // 启用浏览器草稿自动保存
        draftInterval        : 30,             // 草稿自动保存间隔（秒）
        draftMaxDays         : 30,             // 草稿最大保留天数（过期自动清理）

        toolbar              : true,           // 显示/隐藏工具栏
        toolbarAutoFixed     : true,           // 窗口滚动时工具栏自动固定位置
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
        toolbarCustomIcons   : {               // 使用 HTML 标签创建工具栏图标（不使用默认的 <a> 标签）
            lowercase        : "<a href=\"javascript:;\" title=\"\" unselectable=\"on\"><i class=\"fa\" name=\"lowercase\" style=\"font-size:24px;margin-top: -10px;\">a</i></a>",
            "ucwords"        : "<a href=\"javascript:;\" title=\"\" unselectable=\"on\"><i class=\"fa\" name=\"ucwords\" style=\"font-size:20px;margin-top: -3px;\">Aa</i></a>",
            "formula"         : "<a href=\"javascript:;\" title=\"\" unselectable=\"on\"><i class=\"fa\" name=\"formula\" style=\"font-size:20px;font-weight:bold;line-height:20px;\">∑</i></a>"
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
            "goto-line"      : "fa-terminal", // 跳转到行（备选图标：fa-crosshairs）
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
            "bg-color"       : "fa-paint-brush",
            "formula"         : "",
            "copybook"       : "editormd-icon-copybook",
            "copybook-tian"  : "editormd-icon-tian",
            "copybook-mi"    : "editormd-icon-mi",
            "copybook-pinyin": "editormd-icon-pinyin",
            "page-a3"        : "fa-file-o",
            "page-a4"        : "fa-file-text-o",
            "page-a5"        : "fa-file-o",
            "page"           : "fa-file-o",
            "insert-flowchart" : "fa-sitemap",
            "insert-sequence"  : "fa-exchange"
        },        
        toolbarIconTexts     : {},
        
        lang : {
            name        : "zh-cn",
            description : "开源在线Markdown编辑器<br/>Open source online Markdown editor.",
            tocTitle    : "目录",
            placeholder : "写点什么吧~",
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
                "bg-color"       : "背景颜色",
                formula          : "插入公式",
                copybook         : "字帖",
                "copybook-tian"  : "田字格",
                "copybook-mi"    : "米字格",
                "copybook-pinyin": "拼音格",
                "page-a3"        : "插入A3页面",
                "page-a4"        : "插入A4页面",
                "page-a5"        : "插入A5页面",
                "insert-flowchart" : "插入流程图",
                "insert-sequence"  : "插入时序图",
                "page"             : "页面尺寸",
                "page-a3"          : "插入A3页面",
                "page-a4"          : "插入A4页面",
                "page-a5"          : "插入A5页面"
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

    /**
     * 语言包注册表
     * Language pack registry
     * 外部语言文件通过 editormd.langs["en"] = {...} 注册
     */
    editormd.langs = {};

    /**
     * 注册语言包
     * Register a language pack
     * 
     * @param   {String} name    语言名称标识符，如 "en", "zh-cn", "zh-tw"
     * @param   {Object} langObj 语言包对象
     * @returns {void}
     */
    editormd.registerLang = function(name, langObj) {
        editormd.langs[name] = langObj;
    };

    /**
     * 获取已注册的语言包
     * Get a registered language pack
     * 
     * @param   {String} name  语言名称标识符
     * @returns {Object|null}  语言包对象，未注册则返回 null
     */
    editormd.getLang = function(name) {
        return editormd.langs[name] || null;
    };

    /**
     * 将内置默认语言注册到语言包注册表
     * 确保 editormd.getLang("zh-cn") 无需加载外部文件即可获取
     */
    editormd.langs[editormd.defaults.lang.name] = editormd.defaults.lang;

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
            this.timer           = null;
            this.flowchartTimer  = null;
            this._asyncLoadCount  = 0;        // 异步加载计数器
            this._allAsyncLoaded = false;    // onAllAsyncLoad 是否已触发
            
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
            
            markdownTextarea.addClass(classNames.textarea.markdown).attr("placeholder", settings.lang.placeholder || settings.placeholder);
            
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

            // 设置草稿自动保存与恢复
            if (settings.draftAutoSave)
            {
                var draftIntervalMs = Math.max(5, settings.draftInterval || 30) * 1000;
                this.draftTimer = setInterval(function() {
                    _this.saveDraft();
                }, draftIntervalMs);

                // 初始化时检查是否存在旧草稿
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
                    
                editormd.loadScript(loadPath + "codemirror/addons.min", function() {
                    
                    editormd.loadScript(loadPath + "codemirror/modes.min", function() {
                        
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
         * 设置 xfEditor 的整体主题，主要是工具栏
         * Setting xfEditor theme
         * 
         * @returns {editormd}  返回editormd的实例对象
         */
        
        setTheme : function(theme) {
            var editor      = this.editor;
            var oldTheme    = this.settings.theme;
            var themePrefix = this.classPrefix + "theme-";
            
            // 移除旧主题类（忽略 default 主题）
            if (oldTheme && oldTheme !== "default") {
                editor.removeClass(themePrefix + oldTheme);
            }
            
            // 应用新主题类（default 主题不添加 class，保持默认样式）
            if (theme && theme !== "default") {
                editor.addClass(themePrefix + theme);
            }
            
            this.settings.theme = theme;
            
            // 对于已知的主题映射，同时设置 CodeMirror 编辑区主题
            var themeToEditorTheme = {
                "dark": "monokai"
                // 可扩展更多映射
            };
            if (themeToEditorTheme[theme]) {
                this.setEditorTheme(themeToEditorTheme[theme]);
            }
            
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
         * 设置 xfEditor 的主题
         * Setting xfEditor theme
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
                highlightSelectionMatches : ( (!settings.matchWordHighlight) ? false : { showToken: (settings.matchWordHighlight === "onselected") ? false : /\w/ } ),
                // ★★★ 禁用自动滚动到光标位置，防止编辑区滚动位置被意外改变
                scrollIntoView           : false
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
            var previewContainer = this.previewContainer;
            
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
                editormd.notify("行号必须是一个整数", "warning");
                return this;
            }
            
            line  = parseInt(line) - 1;
            
            if (line > count)
            {
                editormd.notify("行号超出范围：1-" + count, "warning");
                
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
                var topLine   = cm.lineAtHeight(scrollTop, "local");
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
                    // ★ 使用 data-source-line 映射进行精确定位
                    var previewH = preview.height();
                    var targetPreviewTop = null;
                    previewContainer.find('[data-source-line]').each(function() {
                        var sl = parseInt($(this).attr('data-source-line'), 10);
                        if (!isNaN(sl) && sl <= topLine) {
                            var elTop = $(this).offset().top - preview.offset().top + preview.scrollTop();
                            targetPreviewTop = elTop;
                        }
                    });
                    if (targetPreviewTop !== null) {
                        preview.scrollTop(Math.max(0, targetPreviewTop - previewH / 3));
                    } else {
                        // fallback: 百分比滚动
                        var totalLines = cm.lineCount();
                        var linePercent = totalLines > 1 ? (topLine / (totalLines - 1)) : 0;
                        preview.scrollTop(preview[0].scrollHeight * linePercent);
                    }
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
                    arguments[1] = arguments[1].bind(this);
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
                value = value.bind(this);
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
                settings["on" + eventType] = callback.bind(this);      
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
            
            callback || function(){}.call(this);

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
            
            callback || function(){}.call(this);

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
                $(window).on("scroll.editormd-autofixed", autoFixedHandle);
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
                            var displayText = subIsHeader ? subName.toUpperCase() : subTitle;
                            dropdownHTML += "<a href=\"javascript:;\" title=\"" + subTitle + "\" unselectable=\"on\">";
                            dropdownHTML += "<i class=\"fa " + subIconClass + "\" name=\""+subName+"\" unselectable=\"on\"></i> " + displayText;
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
            
            toolbarMenu.find(".fa[name=lowercase]").closest("a").attr("title", settings.lang.toolbar.lowercase);
            toolbarMenu.find(".fa[name=ucwords]").closest("a").attr("title", settings.lang.toolbar.ucwords);
            
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
            editormd.dialogLockScreen.call(this);
            
            return this;
        },

        dialogShowMask : function(dialog) {
            editormd.dialogShowMask.call(this, dialog);
            
            return this;
        },
        
        getToolbarHandlers : function(name) {
            var toolbarHandlers = this.toolbarHandlers = editormd.toolbarHandlers;

            return (name && typeof toolbarHandlers[name] !== "undefined") ? toolbarHandlers[name] : toolbarHandlers;
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
            var toolbarIconHandlers = this.getToolbarHandlers();  
            
            // 下拉菜单切换事件处理器 — 四方向溢出自动适配
            toolbar.find("." + classPrefix + "toolbar-dropdown > ." + classPrefix + "dropdown-toggle").on(editormd.mouseOrTouch("click", "touchend"), function(event) {
                var $this = $(this);
                var $dropdown = $this.parent();
                var $menu = $dropdown.children("." + classPrefix + "dropdown-menu");
                
                // 关闭其他已打开的下拉菜单
                toolbar.find("." + classPrefix + "toolbar-dropdown.open").not($dropdown).removeClass("open");
                
                $dropdown.toggleClass("open");
                
                // 全方向溢出自动检测
                if ($dropdown.hasClass("open") && $menu.length) {
                    // 先重置所有位置类
                    $menu.css({ right: "", left: "", "max-height": "", top: "", bottom: "" })
                         .removeClass(classPrefix + "dropdown-menu-right")
                         .removeClass(classPrefix + "dropdown-menu-up");
                    
                    requestAnimationFrame(function() {
                        var rect = $menu[0].getBoundingClientRect();
                        var vpW = window.innerWidth || document.documentElement.clientWidth;
                        var vpH = window.innerHeight || document.documentElement.clientHeight;
                        
                        // 右边缘溢出 → 右对齐
                        if (rect.right > vpW - 8) {
                            $menu.addClass(classPrefix + "dropdown-menu-right");
                        }
                        
                        // 重新测量（切换右对齐后位置变了）
                        requestAnimationFrame(function() {
                            var rect2 = $menu[0].getBoundingClientRect();
                            
                            // 底部溢出 → 向上展开
                            if (rect2.bottom > vpH - 8) {
                                $menu.addClass(classPrefix + "dropdown-menu-up");
                            }
                            
                            // 最终高度限制（防止极端小屏）
                            var finalTop = $menu[0].getBoundingClientRect().top;
                            var availH = vpH - finalTop - 16;
                            if (availH < rect2.height) {
                                $menu.css("max-height", Math.max(100, availH) + "px");
                            }
                        });
                    });
                }
                
                var closeDropdown = function(e) {
                    if (!$(e.target).closest($dropdown).length) {
                        $dropdown.removeClass("open");
                        // 清理所有内联样式和位置类
                        $menu.css({ right: "", left: "", "max-height": "", top: "", bottom: "" })
                             .removeClass(classPrefix + "dropdown-menu-right")
                             .removeClass(classPrefix + "dropdown-menu-up");
                        $(document).off("click.editormd-dropdown", closeDropdown);
                    }
                };
                
                if ($dropdown.hasClass("open")) {
                    $(document).on("click.editormd-dropdown", closeDropdown);
                }
                
                return false;
            });
                
            toolbarIcons.on(editormd.mouseOrTouch("click", "touchend"), function(event) {

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
                    toolbarIconHandlers[name].call(_this, cm);
                }
                else 
                {
                    if (typeof settings.toolbarHandlers[name] !== "undefined") 
                    {
                        settings.toolbarHandlers[name].call(_this, cm, icon, cursor, selection);
                    }
                }
                
                if (name !== "link" && name !== "reference-link" && name !== "image" && name !== "code-block" && 
                    name !== "preformatted-text" && name !== "watch" && name !== "preview" && name !== "search" && name !== "fullscreen" && name !== "info") 
                {
                    cm.focus();
                }

                return false;

            });
            
            // 下拉菜单项点击事件处理器
            toolbar.find("." + classPrefix + "dropdown-menu > li > a").on(editormd.mouseOrTouch("click", "touchend"), function(event) {
                var icon      = $(this).children(".fa").first();
                var name      = icon.attr("name");
                var cursor    = cm.getCursor();
                var selection = cm.getSelection();
                
                if (name === "" || typeof name === "undefined") {
                    return false;
                }
                
                // 关闭下拉菜单
                $(this).closest("." + classPrefix + "toolbar-dropdown").removeClass("open");
                
                _this.activeIcon = icon;
                
                if (typeof toolbarIconHandlers[name] !== "undefined") 
                {
                    toolbarIconHandlers[name].call(_this, cm);
                }
                else 
                {
                    if (typeof settings.toolbarHandlers[name] !== "undefined") 
                    {
                        settings.toolbarHandlers[name].call(_this, cm, icon, cursor, selection);
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
            return editormd.createDialog.call(this, options);
        },
        
        /**
         * 创建关于xfEditor的对话框
         * Create about xfEditor dialog
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
                "<p style=\"margin: 10px 0 20px 0;\">仓库地址：<a href=\"" + editormd.homePage + "\" target=\"_blank\">" + editormd.homePage + " <i class=\"fa fa-external-link\"></i></a></p>",
                "<div style=\"background:#f6f8fa;border-radius:6px;padding:12px 16px;margin:12px 0;font-size:13px;line-height:1.7;\">",
                "<strong>声明</strong><br>",
                "本编辑器基于开源项目 <a href=\"https://github.com/pandao/editor.md\" target=\"_blank\" class=\"hover-link\">Editor.md</a> 改编而来，感谢原作者 Pandao 的杰出贡献。",
                "</div>",
                "<p style=\"font-size: 0.85em;\">Copyright &copy; 2015-2026 <a href=\"https://github.com/zhaoxianfang\" target=\"_blank\" class=\"hover-link\">zhaoxianfang</a>, The <a href=\"https://github.com/zhaoxianfang/editor/blob/master/LICENSE\" target=\"_blank\" class=\"hover-link\">MIT</a> License.</p>",
                "<p style=\"font-size: 0.75em;color:#8b949e;margin-top:8px;\">Powered by CodeMirror, marked.js, KaTeX, ECharts, Flowchart.js, js-sequence-diagrams</p>",
                "</div>",
                "<a href=\"javascript:;\" class=\"fa fa-close " + classPrefix + "dialog-close\"></a>",
                "</div>"
            ].join("\n");

            editor.append(infoDialogHTML);
            
            var infoDialog  = this.infoDialog = editor.children("." + classPrefix + "dialog-info");

            infoDialog.find("." + classPrefix + "dialog-close").on(editormd.mouseOrTouch("click", "touchend"), function() {
                _this.hideInfoDialog();
            });
            
            infoDialog.css("border", (editormd.isIE8) ? "1px solid #ddd" : "").css("z-index", editormd.dialogZindex).show();
            
            this.infoDialogPosition();

            return this;
        },
        
        /**
         * 关于xfEditor对话居中定位
         * xfEditor dialog position handle
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
         * 显示关于xfEditor
         * Display about xfEditor dialog
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
         * 隐藏关于xfEditor
         * Hide about xfEditor dialog
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
                    this.getToolbarHandlers();                  
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
                // Store original code text BEFORE prettyPrint modifies the DOM,
                // so copy buttons can access the unmodified source
                previewContainer.find("pre").each(function() {
                    var $pre = $(this);
                    var $code = $pre.find("code");
                    if ($code.length > 0 && $pre.data("_originalCode") === undefined) {
                        $pre.data("_originalCode", $code.text());
                    }
                });
                
                previewContainer.find("pre").addClass("prettyprint linenums");
                
                if (typeof prettyPrint !== "undefined")
                {                    
                    prettyPrint();
                }
            }

            // 向所有 pre 代码块注入复制按钮
            this.initCodeCopy(previewContainer);

            return this;
        },
        
        /**
         * Inject a "Copy" button into the top-right corner of every <pre> block
         * in the given container.
         *
         * @param   {jQuery} $container  The container to search for <pre> blocks
         * @returns {editormd}
         */
        initCodeCopy : function($container) {
            var classPrefix = this.classPrefix;
            var copyText    = "复制";
            var copiedText  = "已复制";
            var failedText  = "复制失败";

            $container.find("pre").each(function() {
                var $pre = $(this);

                // 避免重复创建
                if ($pre.data("_copyBtnReady")) return;
                $pre.data("_copyBtnReady", true);

                // 确保 pre 元素为 relative 定位
                if ($pre.css("position") === "static") {
                    $pre.css("position", "relative");
                }

                var $btn = $("<span>")
                    .addClass(classPrefix + "code-copy-btn")
                    .text(copyText)
                    .attr("title", copyText);

                $btn.on("click", function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    if ($btn.hasClass("copied") || $btn.hasClass("failed")) return;

                    // Use stored original code text (set before prettyPrint), fallback to live extraction
                    var code = $pre.data("_originalCode");
                    if (!code) {
                        var $code = $pre.find("code");
                        code = $code.length > 0
                            ? $code.text()
                            : $pre.clone().find("." + classPrefix + "code-copy-btn").remove().end().text();
                    }

                    var done = function(success) {
                        $btn.removeClass("copied failed")
                            .addClass(success ? "copied" : "failed")
                            .text(success ? copiedText : failedText);
                        clearTimeout($btn.data("_timer"));
                        $btn.data("_timer", setTimeout(function() {
                            $btn.removeClass("copied failed").text(copyText);
                        }, 2500));
                    };

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(code).then(function() {
                            done(true);
                        }).catch(function() { done(false); });
                    } else {
                        var textarea = document.createElement("textarea");
                        textarea.value = code;
                        textarea.style.position = "fixed";
                        textarea.style.left = "-9999px";
                        textarea.style.top = "-9999px";
                        document.body.appendChild(textarea);
                        textarea.focus();
                        textarea.select();
                        try {
                            var ok = document.execCommand("copy");
                            done(ok);
                        } catch (ex) { done(false); }
                        document.body.removeChild(textarea);
                    }
                });

                $pre.append($btn);
            });

            return this;
        },
        
        /**
         * 解析TeX(KaTeX)科学公式
         * TeX(KaTeX) Renderer
         * 
         * @returns {editormd}             返回editormd的实例对象
         */
        
        katexRender : function() {
            
            // 仅在编辑器实例尚未初始化完成且非异步回调时跳过
            // 异步加载回调中 timer 可能尚未赋值，这种情况下应继续渲染
            if (this.timer === null && typeof editormd.$katex === "undefined")
            {
                return this;
            }
            
            var _this = this;
            this.previewContainer.find("." + editormd.classNames.tex).each(function(){
                var tex  = $(this);
                var texCode = tex.text().trim();
                // 自动检测 displayMode：公式含 \begin{...}（矩阵、行列式等）使用块级模式
                var isBlock = /^\\begin\{/.test(texCode);
                editormd.$katex.render(texCode, tex[0], { throwOnError: false, displayMode: isBlock });
                
                tex.find(".katex").css("font-size", "1.6em");
                
                // 双击公式可定位到源码中进行编辑
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
                if (this.flowchartTimer === null) {
                    // 异步加载尚未完成，跳过流程图渲染
                } else {
                    previewContainer.find(".flowchart").flowChart();
                }
            }

            if (settings.sequenceDiagram) {
                // 时序图只依赖 raphael + sequence-diagram，不依赖 flowchartTimer
                // 如果 flowchartTimer 为 null 但 flowchart 未开启，不会进入上面分支
                // 时序图库可能已通过其他方式加载，尝试渲染
                if (typeof Diagram !== "undefined" || (this.flowchartTimer !== null)) {
                    previewContainer.find(".sequence-diagram").sequenceDiagram({theme: "simple"});
                }
            }
                    
            // ★ 流程图/时序图渲染后预览区内容高度可能变化，重新定位预览区滚动
            // 使用行映射进行精确定位，而非简单百分比
            var preview    = $this.preview;
            var codeMirror = $this.codeMirror;
            var codeView   = codeMirror.find(".CodeMirror-scroll");
            var cm         = $this.cm;
            var previewContainer = $this.previewContainer;

            var height    = codeView.height();
            var scrollTop = codeView.scrollTop();
            var scrollHeight = codeView[0].scrollHeight;

            if (scrollTop === 0) 
            {
                preview.scrollTop(0);
            } 
            else if (scrollTop + height >= scrollHeight - 16)
            { 
                preview.scrollTop(preview[0].scrollHeight);                        
            } 
            else
            {                  
                // 使用行映射精确定位
                var maxScroll = Math.max(1, scrollHeight - height);
                var cursorLine = cm.lineAtHeight ? cm.lineAtHeight(scrollTop, "local") : 0;
                cursorLine = Math.max(0, Math.min(cm.lineCount() - 1, cursorLine));
                var previewH = preview.height();

                // 在预览中查找与光标行最匹配的元素
                var $bestEl = null;
                previewContainer.find('[data-source-line]').each(function() {
                    var sl = parseInt($(this).attr('data-source-line'), 10);
                    if (!isNaN(sl) && sl <= cursorLine) {
                        $bestEl = $(this);
                    }
                });

                if ($bestEl && $bestEl.length) {
                    var targetTop = $bestEl.offset().top - preview.offset().top + preview.scrollTop();
                    preview.scrollTop(Math.max(0, targetTop - previewH / 3));
                } else {
                    // fallback: 基于可用高度计算
                    var tocHeight = 0;
                    preview.find(".markdown-toc-list").each(function(){
                        tocHeight += $(this).height();
                    });
                    var tocMenuHeight = preview.find(".editormd-toc-menu").height();
                    tocMenuHeight = (!tocMenuHeight) ? 0 : tocMenuHeight;
                    var scrollPct = Math.max(0, Math.min(1, scrollTop / Math.max(1, scrollHeight - height)));
                    preview.scrollTop(Math.max(0, (preview[0].scrollHeight + tocHeight + tocMenuHeight) * scrollPct));
                }
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
                    var handle = (typeof _keyMap === "string") ? toolbarHandlers[_keyMap].bind(_this) : _keyMap.bind(_this);
                    
                    if ($.inArray(k, ["F9", "F10", "F11"]) < 0 && $.inArray(k, disabledKeyMaps) < 0)
                    {
                        var _map = {};
                        _map[k] = handle;

                        cm.addKeyMap(_map);
                    }
                }
                
                $(window).on("keydown.editormd-fkeys", function(event) {
                    
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
                                    toolbarHandlers["watch"].call(_this);
                                    return false;
                                break;
                                
                            case 121:
                                    toolbarHandlers["preview"].call(_this);
                                    return false;
                                break;
                                
                            case 122:
                                    toolbarHandlers["fullscreen"].call(_this);                        
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
        
        bindChangeEvent : function() {
            
            var _this            = this;
            var cm               = this.cm;
            var settings         = this.settings;
            var editor           = this.editor;
            
            cm.on("change", function(_cm, changeObj) {
                
                if (settings.watch)
                {
                    _this.previewContainer.css("padding", settings.autoHeight ? "20px 20px 50px 40px" : "20px");
                }
                
                _this.timer = setTimeout(function() {
                    clearTimeout(_this.timer);
                    
                    _this.save();
                    
                    _this.timer = null;
                }, settings.delay);
            });
            
            // 增强的事件处理（keydown/keyup/mouseup/mousedown/paste/drop/copy/cut/focus/blur）
            cm.on("keydown", function(_cm, e) {
                settings.onkeydown.call(_this, _cm, e);
            });
            
            cm.on("keyup", function(_cm, e) {
                settings.onkeyup.call(_this, _cm, e);
            });
            
            cm.on("mouseup", function(_cm, e) {
                settings.onmouseup.call(_this, _cm, e);
            });
            
            cm.on("mousedown", function(_cm, e) {
                settings.onmousedown.call(_this, _cm, e);
            });
            
            cm.on("paste", function(_cm, e) {
                settings.onpaste.call(_this, _cm, e);
            });
            
            cm.on("drop", function(_cm, e) {
                settings.ondrop.call(_this, _cm, e);
            });
            
            cm.on("copy", function(_cm, e) {
                settings.oncopy.call(_this, _cm, e);
            });
            
            cm.on("cut", function(_cm, e) {
                settings.oncut.call(_this, _cm, e);
            });
            
            cm.on("focus", function(_cm, e) {
                editor.addClass("editormd-focus");
                settings.onfocus.call(_this, _cm, e);
            });
            
            cm.on("blur", function(_cm, e) {
                editor.removeClass("editormd-focus");
                settings.onblur.call(_this, _cm, e);
            });
            
            cm.on("cursorActivity", function(_cm) {
                settings.oncursoractivity.call(_this, _cm);
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
            
            // 设置 timer 为非 null 值，确保 save() 守卫允许首次渲染
            // 修复：编辑器初始化时有内容但不会自动渲染到预览区的问题
            this.timer = 0;
            this.save();
            
            if (settings.watch) {
                preview.show();
            }
            
            editor.data("oldWidth", editor.width()).data("oldHeight", editor.height()); // 缓存编辑器原始宽高（兼容 Zepto）
            
            this.resize();
            this.registerKeyMaps();
            
            $(window).resize(function(){
                _this.resize();
            });
            
            this.bindChangeEvent();
            
            if (!recreate)
            {
                settings.onload.call(this);
            }
            
            // 触发 onEditorLoad 事件（编辑器加载完成）
            settings.onEditorLoad.call(this);
            
            // 触发 onPageLoad 事件（当前网页 DOM 加载完成）
            $(function() {
                settings.onPageLoad.call(_this);
            });
            
            // 绑定 onPageAllLoad 事件（网页所有资源加载完成，包括图片、iframe 等）
            $(window).on("load", function() {
                settings.onPageAllLoad.call(_this);
            });
            
            this.state.loaded = true;

            return this;
        },
        
        /**
         * 检查所有异步模块是否加载完成，触发 onAllAsyncLoad 事件
         * Check if all async modules loaded and fire onAllAsyncLoad event
         */
        
        _checkAllAsyncLoaded : function() {
            if (this._allAsyncLoaded) return;
            if (this._asyncLoadCount <= 0) 
            {
                this._allAsyncLoaded = true;
                
                this.settings.onAllAsyncLoad.call(this);
            }
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
                    // CSS 中 .editormd-fullscreen 已通过 !important 控制尺寸
                    // 无需手动设置 width/height，CSS width:100%!important 自适配
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
                settings.onresize.call(this);
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

            if (this.timer === null && !(!settings.watch && state.preview))
            {
                return this;
            }
            
            settings.onbeforesave.call(this);
            
            var cm               = this.cm;            
            var cmValue          = cm.getValue();
            var previewContainer = this.previewContainer;

            if (settings.mode !== "gfm" && settings.mode !== "markdown") 
            {
                this.markdownTextarea.val(cmValue);
                settings.onaftersave.call(this);
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
                atLink               : settings.atLink,           // 是否解析 @用户名 链接
                emailLink            : settings.emailLink,        // 是否解析邮箱地址自动链接
                flowChart            : settings.flowChart,
                sequenceDiagram      : settings.sequenceDiagram,
                previewCodeHighlight : settings.previewCodeHighlight,
                pinyin               : settings.pinyin,
                textAlign            : settings.textAlign,
                imageResize          : settings.imageResize,
                echarts              : settings.echarts,
                tabs                 : settings.tabs,
                columns              : settings.columns,
                tooltip              : settings.tooltip,
                copybook             : settings.copybook
            };
            
            var markedOptions = this.markedOptions = {
                renderer    : editormd.markedRenderer(markdownToC, rendererOptions),
                gfm         : true,
                tables      : true,
                breaks      : true,
                pedantic    : false,
                sanitize    : false,  // 关闭 sanitize 以确保 HTML 注释占位符不被转义，占位符用于 tabs/columns 等自定义语法
                smartLists  : true,
                smartypants : true
            };
            
            marked.setOptions(markedOptions);

            // 在 marked 解析之前预处理自定义块级语法（标签页、多栏、对齐）
            // 先保护 LaTeX 反斜杠，防止 marked.js 将其当作 Markdown 转义吃掉
            var markdownProtected = editormd.protectTeXSyntax(cmValue);
            var preprocessResult = editormd.preprocessMarkdownBlocks(markdownProtected, rendererOptions);
            var newMarkdownDoc = editormd.$marked(preprocessResult.markdown, markedOptions);
            newMarkdownDoc = editormd.restorePlaceholders(newMarkdownDoc, preprocessResult.placeholders);
            newMarkdownDoc = editormd.restoreTeXSyntax(newMarkdownDoc);
            newMarkdownDoc = editormd.fixSmartypantsHTML(newMarkdownDoc);
            if (settings.taskList) newMarkdownDoc = editormd.postProcessTaskLists(newMarkdownDoc);

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
                        // 传入 settings.path 作为前缀，解决 examples 子目录下 KaTeX 资源 404 问题
                        _this._asyncLoadCount++;
                        editormd.loadKaTeX(settings.path, function() {
                            if (typeof katex !== "undefined") {
                                editormd.$katex = katex;
                                editormd.kaTeXLoaded = true;
                            }
                            _this.katexRender();
                            _this._asyncLoadCount--;
                            _this._checkAllAsyncLoaded();
                        });
                    } 
                    else 
                    {
                        if (typeof katex !== "undefined") {
                            editormd.$katex = katex;
                        }
                        this.katexRender();
                    }
                }                
                
                // 预览区包含对应元素时延迟加载流程图 / 时序图
                if (settings.flowChart || settings.sequenceDiagram)
                {
                    var hasFlowChart = previewContainer.find(".flowchart").length > 0;
                    var hasSequence  = previewContainer.find(".sequence-diagram").length > 0;
                    if (hasFlowChart || hasSequence) {
                        // 设置 flowchartTimer 为非 null，确保渲染守卫通过
                        // 修复：流程图/时序图始终无法渲染的问题
                        _this.flowchartTimer = 0;
                        var renderFs = function() {
                            _this.flowChartAndSequenceDiagramRender();
                        };
                        var needRaphael = (hasFlowChart && typeof flowchart === "undefined") || 
                                          (hasSequence && typeof Diagram === "undefined");
                        if (needRaphael) {
                            _this._asyncLoadCount++;
                            editormd.loadScript(settings.path + "raphael.min", function() {
                                editormd.loadScript(settings.path + "underscore.min", function() {
                                    var pending = 0;
                                    var checkDone = function() {
                                        pending--;
                                        if (pending <= 0) {
                                            renderFs();
                                            _this._asyncLoadCount--;
                                            _this._checkAllAsyncLoaded();
                                        }
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
                                    if (pending === 0) {
                                        renderFs();
                                        _this._asyncLoadCount--;
                                        _this._checkAllAsyncLoaded();
                                    }
                                });
                            });
                        } else {
                            renderFs();
                        }
                    }
                }

                if (state.loaded) 
                {
                    settings.onchange.call(this);
                }
                
                // 初始化预览区中的页面分页、表格编辑和图片缩放功能
                // 注意：initPages 必须在 initTableEdit 之前执行，
                // 因为 initPages 会拆分页面并重建 DOM，之后 initTableEdit
                // 才能正确设置表格编辑的事件处理器
                
                // 检测是否为纯预览模式（无编辑器，仅渲染预览）
                // 当 watch=false 且 toolbar=false 时，视为纯预览模式
                // 纯预览模式下禁用表格编辑、图片缩放等交互功能
                var isPreviewOnly = settings.previewOnly || (!settings.watch && !settings.toolbar);
                
                if (settings.pageBlock) {
                    _this.initPages();
                }
                // 纯预览模式下跳过表格编辑和图片缩放初始化
                if (settings.tableEdit && !isPreviewOnly) {
                    _this.initTableEdit();
                }
                if (settings.imageResize && !isPreviewOnly) {
                    _this.initImageResize();
                }
                if (settings.echarts) {
                    var echartsElements = previewContainer.find(".editormd-echarts");
                    if (echartsElements.length > 0) {
                        if (typeof echarts === "undefined") {
                            _this._asyncLoadCount++;
                            editormd.loadScript(settings.path + "echarts.min", function() {
                                _this.initECharts();
                                _this._asyncLoadCount--;
                                _this._checkAllAsyncLoaded();
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
            }
            
            settings.onaftersave.call(this);

            // 检查是否所有异步加载已完成（处理无异步模块需要加载的情况）
            this._checkAllAsyncLoaded();

            // 保存成功后自动保存草稿
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
            
            // 在 Markdown 源中查找所有表格块
            var allTableBlocks = [];
            var i = 0;
            while (i < lines.length) {
                if (/^\|/.test(lines[i])) {
                    var blockStart = i;
                    i++;
                    while (i < lines.length && (/^\|/.test(lines[i]) || lines[i].trim() === "")) {
                        if (lines[i].trim() === "") {
                            // 表格内部空行 — 跳过但不中断扫描（某些表格含有空行）
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
                
                // 存储表格块引用信息
                var currentBlock = (tableBlockIndex < allTableBlocks.length) ? allTableBlocks[tableBlockIndex] : null;
                if (currentBlock) {
                    $wrapper.data("table-start", currentBlock.start);
                    $wrapper.data("table-end", currentBlock.end);
                    // 同时存储首列表头文本，供表格被修改后重新识别
                    var firstHeaderCell = lines[currentBlock.start].split("|");
                    var headerText = (firstHeaderCell[1] || "").trim();
                    $wrapper.data("table-identifier", headerText);
                }
                tableBlockIndex++;
                
                // 添加列控制按钮（定位在选中列上方）
                var colControls = [
                    '<div class="editormd-table-col-controls">',
                    '<a class="editormd-table-btn" data-action="add-col-before" title="左侧插入列">+</a>',
                    '<a class="editormd-table-btn" data-action="del-col" title="删除列">-</a>',
                    '<a class="editormd-table-btn" data-action="add-col-after" title="右侧插入列">+</a>',
                    '</div>'
                ].join("");
                
                // 添加行控制按钮（定位在选中行左侧）
                var rowControls = [
                    '<div class="editormd-table-row-controls">',
                    '<a class="editormd-table-btn" data-action="add-row-before" title="上方插入行">+</a>',
                    '<a class="editormd-table-btn" data-action="del-row" title="删除行">-</a>',
                    '<a class="editormd-table-btn" data-action="add-row-after" title="下方插入行">+</a>',
                    '</div>'
                ].join("");
                
                $wrapper.prepend(colControls + rowControls);
                
                // 跟踪当前选中的单元格
                var currentCell = null;
                $table.on("click", "th, td", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    currentCell = $(this);
                    // 使用相对于包装容器的偏移来正确处理滚动
                    var wrapperOffset = $wrapper.offset();
                    var cellOffset = currentCell.offset();
                    var relTop = cellOffset.top - wrapperOffset.top;
                    var relLeft = cellOffset.left - wrapperOffset.left;
                    
                    // 先隐藏所有控件，再显示当前表格的控件
                    previewContainer.find(".editormd-table-col-controls, .editormd-table-row-controls").hide();
                    
                    // 计算列控件位置（显示在选中列上方）
                    var colTop = relTop - 28;
                    var colLeft = relLeft;
                    var colWidth = currentCell.outerWidth();
                    
                    // 计算行控件位置（显示在选中行左侧）
                    var rowTop = relTop;
                    var rowLeft = relLeft - 32;
                    var rowHeight = Math.max(currentCell.outerHeight(), 60);
                    
                    // 列控件：显示在单元格上方
                    $wrapper.find(".editormd-table-col-controls").css({
                        top: Math.max(colTop, -28),   // 防止过度偏移
                        left: colLeft,
                        width: colWidth,
                        display: "flex"
                    });
                    // 行控件：显示在单元格左侧
                    $wrapper.find(".editormd-table-row-controls").css({
                        top: rowTop,
                        left: Math.max(rowLeft, -32), // 防止过度偏移
                        height: rowHeight,
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
            
            // 点击表格外部时隐藏控制按钮
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
            
            // 验证 tableStart 是否仍然有效，必要时重新查找表格边界
            if (tableStart < 0 || tableStart >= lines.length || !/^\|/.test(lines[tableStart])) {
                // 表格位置已变化 — 通过标识文本重新查找
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
                // 降级方案：查找任意表格作为备选
                if (tableStart < 0) {
                    for (var fi2 = 0; fi2 < lines.length; fi2++) {
                        if (/^\|/.test(lines[fi2])) { tableStart = fi2; break; }
                    }
                }
            }
            
            if (tableStart < 0) return;
            
            // 查找表格结束位置
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
            
            // 确保最小行数：表头 + 分隔行 + 至少 1 行数据
            var totalRows = tableLines.length;

            // 确保 rowIndex 在有效范围内
            if (!isThead) {
                rowIndex = Math.max(0, Math.min(rowIndex, bodyLines.length - 1));
            }

            switch(action) {
                case "add-row-before":
                    var newRow = "| " + new Array(colCount + 1).join(" | ");
                    // 表头区域：在表头之前插入。表体：在 tableStart + 2 + rowIndex 处插入
                    var insertIndex = isThead ? tableStart : tableStart + 2 + rowIndex;
                    if (!isThead && insertIndex < tableStart + 2) insertIndex = tableStart + 2;
                    lines.splice(insertIndex, 0, newRow);
                    break;
                case "add-row-after":
                    var newRow2 = "| " + new Array(colCount + 1).join(" | ");
                    // 表头区域：作为第一行数据插入。表体：在当前行之后插入
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
                    // 仅剩表头和分隔行时阻止删除操作
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
            
            // 更新包装容器上的表格位置引用
            if ($wrapper) {
                $wrapper.data("table-start", tableStart);
                $wrapper.data("table-end", tableStart + tableLines.length - 1);
            }
            
            // ★ 先清除旧的防抖定时器，防止 cm.setValue() 触发的 change 事件在 delay 后再次 save() 导致滚动位置二次丢失
            if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
            
            var cursor = cm.getCursor();
            var editorScroll = cm.getScrollInfo();
            var previewScroll = this.preview.scrollTop();
            
            cm.setValue(lines.join("\n"));
            
            // ★ setValue() 会同步触发 change 事件→change handler 会设置新的 timer，立即再次清除
            if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
            
            cm.setCursor(Math.min(cursor.line, lines.length - 1), cursor.ch);
            
            cm.scrollTo(editorScroll.left, editorScroll.top);
            this.timer = 0;
            
            this.save();
            
            this.preview.scrollTop(previewScroll);
            this.timer = null; // ★ 恢复正常状态，下个用户输入可以正常触发防抖
            
            this.settings.ontablechange.call(this, action, rowIndex, colIndex);
        },
        
        /**
         * Initialize image resize in preview area
         */
        initImageResize : function() {
            var _this = this;
            var previewContainer = this.previewContainer;
            var cm = this.cm;
            
            // ★ 建立 src 出现次数计数，用于区分同名图片的多次出现
            var srcOccurrenceCounter = {};
            
            previewContainer.find("img").each(function() {
                var $img = $(this);
                if ($img.hasClass("editormd-img-resizable")) {
                    return;
                }
                $img.addClass("editormd-img-resizable");
                
                // ★ 计算该 src 的第几次出现（1-based），用于精准定位 Markdown 源中对应的图片语法
                var imgSrc = $img.attr("src") || "";
                var cleanSrc = imgSrc.replace(/\s*=\s*\d+x\d+/, "").trim();
                var srcKey = cleanSrc;
                srcOccurrenceCounter[srcKey] = (srcOccurrenceCounter[srcKey] || 0) + 1;
                var occurrence = srcOccurrenceCounter[srcKey];
                
                var $wrapper = $('<div class="editormd-img-wrapper" style="display:inline-block;position:relative;"></div>');
                $img.wrap($wrapper);
                $wrapper = $img.parent();
                // ★ 在 wrapper 上记录出现序号，供事件回调精确使用
                $wrapper.attr("data-image-occurrence", occurrence);
                $wrapper.attr("data-image-src", srcKey);
                
                // 添加缩放拖拽手柄
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
                    
                    // 按 Shift 键保持宽高比
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
                    
                    // ★ 从 wrapper 上读取出现序号和 srcKey，精准定位
                    var occIdx = parseInt($wrapper.attr("data-image-occurrence"), 10) || 1;
                    _this.modifyImageSizeInMarkdown(imgSrc, $img.attr("alt"), finalWidth, finalHeight, occIdx);
                    

                });
                
                // 双击图片可编辑尺寸
                $img.on("dblclick", function(e) {
                    e.stopPropagation();
                    var currentWidth = $img.width();
                    var currentHeight = $img.height();
                    var newWidth = prompt("输入宽度 (px):", currentWidth);
                    var newHeight = prompt("输入高度 (px):", currentHeight);
                    if (newWidth !== null && newHeight !== null) {
                        var occIdx2 = parseInt($wrapper.attr("data-image-occurrence"), 10) || 1;
                        _this.modifyImageSizeInMarkdown(imgSrc, $img.attr("alt"), parseInt(newWidth) || currentWidth, parseInt(newHeight) || currentHeight, occIdx2);
                    }
                });
            });
        },
        
        /**
         * Modify image size in markdown source
         * @param {string} src        - 图片 URL
         * @param {string} alt        - 图片 alt 文本
         * @param {number} width      - 目标宽度 (px)
         * @param {number} height     - 目标高度 (px)
         * @param {number} occurrence - 该 src 的第几次出现（1-based），用于精确匹配同名多图
         */
        modifyImageSizeInMarkdown : function(src, alt, width, height, occurrence) {
            
            var cm = this.cm;
            var markdown = cm.getValue();
            var sizeStr = "<" + width + "," + height + ">";
            occurrence = occurrence || 1;  // 默认第一次出现，向后兼容

            // ★ 使用 matchCount 追踪当前匹配到第几次，仅替换第 occurrence 次
            // 正则说明：匹配 ![alt](url "title")<W,H> 或 ![alt](url)<W,H> 或 ![alt](url)
            // - [^\]]* 匹配 alt 文本
            // - ([^)\s]+) 匹配 URL（不含空格和右括号）
            // - (?:\s+"[^"]*")? 可选匹配标题部分
            // - (?:<(\d+),\s*(\d+)>)? 可选匹配尺寸后缀
            
            // ★ URL 匹配辅助函数：处理相对路径、绝对路径、浏览器解析后的 URL
            var urlMatches = function(mUrl, srcUrl) {
                // 去除尺寸后缀和查询参数
                var clean1 = mUrl.replace(/\s*=\s*\d+x\d+/, "").replace(/\?.*$/, "").trim();
                var clean2 = srcUrl.replace(/\s*=\s*\d+x\d+/, "").replace(/\?.*$/, "").trim();
                
                // 1. 完全匹配
                if (clean1 === clean2) return true;
                
                // 2. 路径后缀匹配（处理 ../ 相对路径）
                if (clean1.endsWith(clean2) || clean2.endsWith(clean1)) return true;
                
                // 3. 文件名匹配（最后手段，可能有误匹配风险）
                var file1 = clean1.split('/').pop();
                var file2 = clean2.split('/').pop();
                if (file1 && file2 && file1 === file2) return true;
                
                return false;
            };
            
            var matchCount = 0;
            var newMarkdown = markdown.replace(
                /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)(?:<(\d+),\s*(\d+)>)?/g,
                function(match, mAlt, mUrl, mW, mH) {
                    // ★ 使用 URL 匹配函数
                    if (urlMatches(mUrl, src)) {
                        matchCount++;
                        if (matchCount === occurrence) {
                            return "![" + (alt || mAlt) + "](" + mUrl + ")" + sizeStr;
                        }
                    }
                    return match;
                }
            );

            if (newMarkdown !== markdown) {
                // ★ 先清除旧的防抖定时器，防止 cm.setValue() 触发的 change 事件在 delay 后再次 save() 导致滚动位置二次丢失
                if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
                
                var editorScroll = cm.getScrollInfo();
                var previewScroll = this.preview.scrollTop();
                
                cm.setValue(newMarkdown);
                
                // ★ setValue() 会同步触发 change 事件→change handler 会设置新的 timer，立即再次清除
                if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
                
                cm.scrollTo(editorScroll.left, editorScroll.top);
                this.timer = 0;
                
                this.save();
                
                this.preview.scrollTop(previewScroll);
                this.timer = null; // ★ 恢复正常状态，下个用户输入可以正常触发防抖
                
                this.settings.onimagechange.call(this, src, width, height);
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
                    if (noAxisTypes.indexOf(chartType) === -1) {
                        option.xAxis = config.xAxis || {};
                        option.yAxis = config.yAxis || {};
                    }

                    if (config.tooltip === undefined) {
                        option.tooltip = { trigger: "axis" };
                    }
                    chartInstance.setOption(option);
                    $chart.attr("data-initialized", "true");

                    // 使用命名空间+debounce避免累积大量 resize handler
                    // 每个 chart instance 只绑定一次 resize
                    if (!$chart.attr("data-resize-bound")) {
                        $chart.attr("data-resize-bound", "true");
                        var resizeTimer = null;
                        // 使用 chart id 作为命名空间后缀，便于清理（destroy 时统一解绑）
                        var ecNsId = $chart.attr("id") || ("ec-" + Date.now());
                        $(window).on("resize.editormd-echarts." + ecNsId, function() {
                            if (resizeTimer) clearTimeout(resizeTimer);
                            resizeTimer = setTimeout(function() {
                                chartInstance.resize();
                            }, 150);
                        });
                    }
                }
            });
        },
        
        /**
         * Initialize Tabs in preview area
         */
        initTabs : function() {
            var _this       = this;
            var previewContainer = this.previewContainer;
            
            // 边界检查：确保预览容器存在
            if (!previewContainer || !previewContainer.length) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] initTabs: Preview container not found");
                }
                return;
            }
            
            /**
             * 当标签页面板变为可见时，重新初始化之前因 display:none
             * 而被跳过的 ECharts 图表。
             */
            function reInitHiddenContent($panel) {
                // 边界检查：确保面板有效
                if (!$panel || !$panel.length) return;
                
                // 重新初始化 ECharts
                $panel.find(".editormd-echarts").each(function() {
                    var $chart = $(this);
                    // 已经初始化过的跳过
                    if ($chart.attr("data-initialized") === "true") return;
                    // 仍然隐藏或零尺寸的跳过
                    if ($chart.is(":hidden") || $chart.width() === 0 || $chart.height() === 0) return;

                    var config = {};
                    try {
                        config = JSON.parse($chart.attr("data-config"));
                    } catch(e) { return; }

                    if (typeof echarts !== "undefined") {
                        var chartInstance2 = echarts.init(this);
                        var option2 = {
                            title: config.title || {},
                            tooltip: config.tooltip || {},
                            legend: config.legend || {},
                            radar: config.radar || {},
                            series: config.series || []
                        };
                        var chartType2 = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                        var noAxisTypes2 = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst"];
                        if (noAxisTypes2.indexOf(chartType2) === -1) {
                            option2.xAxis = config.xAxis || {};
                            option2.yAxis = config.yAxis || {};
                        }
                        if (config.tooltip === undefined) {
                            option2.tooltip = { trigger: "axis" };
                        }
                        chartInstance2.setOption(option2);
                        $chart.attr("data-initialized", "true");
                        if (!$chart.attr("data-resize-bound")) {
                            $chart.attr("data-resize-bound", "true");
                            var resizeTimer2 = null;
                            var ecNsId2 = $chart.attr("id") || ("ec2-" + Date.now());
                            $(window).on("resize.editormd-echarts." + ecNsId2, function() {
                                if (resizeTimer2) clearTimeout(resizeTimer2);
                                resizeTimer2 = setTimeout(function() {
                                    chartInstance2.resize();
                                }, 150);
                            });
                        }
                    }
                });

                // 重新渲染 KaTeX 公式（虽然 KaTeX 在隐藏元素中也能正常渲染，
                // 但有些浏览器可能在元素变为可见时需要重新布局）
                if (_this.settings.tex && typeof editormd.$katex !== "undefined") {
                    $panel.find(".editormd-tex").each(function() {
                        var $tex = $(this);
                        if ($tex.attr("data-initialized") === "true") return;
                        $tex.attr("data-initialized", "true");
                        // KaTeX 已在首次渲染时处理，此处确保字体大小
                        $tex.find(".katex").css("font-size", "1.6em");
                    });
                }

                // 重新渲染流程图和时序图（在隐藏面板中 SVG 尺寸为零）
                if (_this.settings.flowChart) {
                    $panel.find(".flowchart").each(function() {
                        var $fc = $(this);
                        if ($fc.attr("data-fc-initialized") === "true") return;
                        // 确保元素可见且容器有尺寸
                        if ($fc.is(":hidden") || $fc.width() === 0) return;
                        try {
                            $fc.flowChart();
                            $fc.attr("data-fc-initialized", "true");
                        } catch(e) {
                            if (typeof console !== "undefined" && console.warn) console.warn("[xfEditor] FlowChart re-render failed:", e);
                        }
                    });
                }
                if (_this.settings.sequenceDiagram) {
                    $panel.find(".sequence-diagram").each(function() {
                        var $sd = $(this);
                        if ($sd.attr("data-sd-initialized") === "true") return;
                        if ($sd.is(":hidden") || $sd.width() === 0) return;
                        try {
                            $sd.sequenceDiagram({theme: "simple"});
                            $sd.attr("data-sd-initialized", "true");
                        } catch(e) {
                            if (typeof console !== "undefined" && console.warn) console.warn("[xfEditor] SequenceDiagram re-render failed:", e);
                        }
                    });
                }

                // 重新高亮代码（prettify 在隐藏元素中可能不完整）
                if (_this.settings.previewCodeHighlight && typeof prettyPrint !== "undefined") {
                    $panel.find("pre.prettyprint").each(function() {
                        var $pre = $(this);
                        // 跳过已经包含 linenums 处理过的
                        if ($pre.find("li").length > 0) return;
                        prettyPrint();
                    });
                }

                // 重新计算多栏布局分隔线（隐藏元素中尺寸可能为零）
                if (_this.settings.columns) {
                    $panel.find(".editormd-columns").each(function() {
                        var $cols = $(this);
                        if ($cols.attr("data-initialized") === "true") return;
                        var count = parseInt($cols.attr("data-count"), 10) || 2;
                        $cols.find(".editormd-column-divider").remove();
                        for (var ci = 1; ci < count; ci++) {
                            $cols.append('<div class="editormd-column-divider" style="position:absolute;top:8px;bottom:8px;width:0;transform:translateX(-50%);border-left:1px dashed #bbb;pointer-events:none;z-index:1"></div>');
                        }
                        $cols.attr("data-initialized", "true");
                    });
                }
            }
            
            previewContainer.find(".editormd-tabs").each(function() {
                var $tabs = $(this);
                if ($tabs.attr("data-initialized") === "true") {
                    return;
                }
                
                var $nav = $tabs.find(".editormd-tab-nav");
                var $body = $tabs.find(".editormd-tab-body");
                
                // 初次初始化时，对第一个（默认激活的）面板中的内容进行渲染
                var $firstPanel = $body.find(".editormd-tab-panel.active");
                if ($firstPanel.length > 0) {
                    setTimeout(function() {
                        reInitHiddenContent($firstPanel);
                    }, 50);
                }
                
                $nav.off("click", "li").on("click", "li", function() {
                    var $li = $(this);
                    var index = $li.attr("data-index");
                    
                    $nav.find("li").removeClass("active");
                    $li.addClass("active");
                    
                    $body.find(".editormd-tab-panel").removeClass("active");
                    var $panel = $body.find('.editormd-tab-panel[data-index="' + index + '"]');
                    $panel.addClass("active");

                    // 面板变为可见后，初始化其中被跳过的图表等内容
                    setTimeout(function() {
                        reInitHiddenContent($panel);
                    }, 50);
                });
                
                $tabs.attr("data-initialized", "true");
            });
        },
        
        /**
         * Initialize multi-column layout dividers in preview area
         */
        initColumns : function() {
            var previewContainer = this.previewContainer;
            
            // 边界检查：确保预览容器存在
            if (!previewContainer || !previewContainer.length) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] initColumns: Preview container not found");
                }
                return;
            }

            previewContainer.find(".editormd-columns").each(function() {
                var $cols = $(this);
                if ($cols.attr("data-initialized") === "true") {
                    return;
                }
                
                // 边界检查：确保列数有效
                var count = parseInt($cols.attr("data-count"), 10) || 2;
                if (count < 1 || count > 12) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Invalid column count: " + count + ", using default 2");
                    }
                    count = 2;
                }

                $cols.find(".editormd-column-divider").remove();
                $cols.css("position", "relative");

                for (var i = 1; i < count; i++) {
                    var $divider = $('<div class="editormd-column-divider"></div>');
                    $divider.css({
                        position: "absolute",
                        left: (i / count * 100) + "%",
                        top: "8px",
                        bottom: "8px",
                        width: "0",
                        transform: "translateX(-50%)",
                        borderLeft: "1px dashed #bbb",
                        pointerEvents: "none",
                        zIndex: 1
                    });
                    $cols.append($divider);
                }

                $cols.attr("data-initialized", "true");
            });
        },

        /**
         * Initialize Page blocks in preview area
         * Splits page content into multiple paper pages if content exceeds one page height.
         * Also sets up resize handler for responsive page splitting.
         */
        initPages : function() {
            var previewContainer = this.previewContainer;
            
            // 边界检查：确保预览容器存在
            if (!previewContainer || !previewContainer.length) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] initPages: Preview container not found");
                }
                return;
            }

            var pagePaperSizes = {
                "A0": { w: 3179, h: 4494 },
                "A1": { w: 2245, h: 3179 },
                "A2": { w: 1587, h: 2245 },
                "A3": { w: 1123, h: 1587 },
                "A4": { w: 794,  h: 1123 },
                "A5": { w: 559,  h: 794  },
                "A6": { w: 397,  h: 559  },
                "A7": { w: 280,  h: 397  },
                "A8": { w: 198,  h: 280  },
                "AN": { w: 794, h: 1123 },      // AN 纸张（等同于 A4）
                "LETTER": { w: 816, h: 1056 },
                "LEGAL":  { w: 816, h: 1344 }
            };

            /**
             * Split overflowing page content into multiple pages
             * @param {jQuery} $pageBlock - The .editormd-page-block element
             */
            /**
             * Process page footer template - replace {page}, {total} placeholders
             * @param {string} template - Footer template string
             * @param {number} pageNum - Current page number
             * @param {number} totalPages - Total page count
             * @returns {string} Processed footer text
             */
            function processFooterTemplate(template, pageNum, totalPages) {
                if (!template) return "";
                return template
                    .replace(/\{page\}/gi, pageNum)
                    .replace(/\{total\}/gi, totalPages);
            }

            /**
             * Split overflowing page content into multiple pages
             * @param {jQuery} $pageBlock - The .editormd-page-block element
             */
            function splitPageContent($pageBlock) {
                // 边界检查：确保元素有效
                if (!$pageBlock || !$pageBlock.length) return;
                
                // Skip already split pages
                if ($pageBlock.attr("data-split") === "true") return;

                var paperKey = $pageBlock.attr("data-paper") || "A4";
                
                // 验证纸张类型
                if (!pagePaperSizes[paperKey.toUpperCase()]) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Unknown paper size: " + paperKey + ", using A4");
                    }
                    paperKey = "A4";
                }
                
                var paperSize = pagePaperSizes[paperKey.toUpperCase()] || pagePaperSizes["A4"];
                var pageContent = $pageBlock.find(".editormd-page-content");
                
                // 边界检查：确保内容区域存在
                if (!pageContent.length) return;
                
                var watermark = $pageBlock.find(".editormd-page-watermark").detach();
                var headerEl = $pageBlock.find(".editormd-page-header");
                var footerEl = $pageBlock.find(".editormd-page-footer");
                var headerText = headerEl.length ? headerEl.text() : "";
                var footerTemplate = footerEl.length ? footerEl.attr("data-footer-template") || "" : "";

                if (pageContent.length === 0) return;

                // Calculate header/footer heights for content area adjustment
                var headerHeight = headerEl.length ? headerEl.outerHeight(true) : 0;
                var footerHeight = footerEl.length ? 32 : 0; // Estimated footer height

                var contentHeight = pageContent[0].scrollHeight;
                var pageHeight = paperSize.h;

                // Adjust available height for header/footer
                var pageInnerPadding = 96 + headerHeight + footerHeight; // top(48) + bottom(48) + header + footer

                // If content fits in one page, just ensure proper sizing and set page number
                if (contentHeight <= pageHeight - pageInnerPadding + 5) {
                    $pageBlock.attr("data-split", "true");
                    $pageBlock.attr("data-page", "1");
                    $pageBlock.attr("data-total", "1");
                    // Set footer text for single page
                    if (footerEl.length && footerTemplate) {
                        footerEl.text(processFooterTemplate(footerTemplate, 1, 1));
                    }
                    return;
                }

                // Content overflows - need to split
                var pageMargin = 4; // margin between pages
                var containerWidth = paperSize.w;
                var availableHeight = pageHeight - pageInnerPadding;

                // Create a temporary measure container
                var $measure = $('<div class="editormd-page-content" style="position:absolute;visibility:hidden;width:' + containerWidth + 'px;left:-9999px;"></div>');
                $("body").append($measure);

                // Clone child nodes into measure container one by one
                var $clone = pageContent.clone();
                $measure.append($clone);

                var pages = [];
                var currentPage = [];
                var currentHeight = 0;

                // Split child elements into pages
                $clone.children().each(function() {
                    var $child = $(this);
                    var childHeight = $child.outerHeight(true) || 0;

                    if (currentHeight + childHeight > availableHeight && currentPage.length > 0) {
                        // Start a new page
                        pages.push(currentPage);
                        currentPage = [];
                        currentHeight = 0;
                    }

                    currentPage.push(this.outerHTML);
                    currentHeight += childHeight;
                });

                if (currentPage.length > 0) {
                    pages.push(currentPage);
                }

                // Clean up measure container
                $measure.remove();

                var totalPages = pages.length;

                // Build page wrappers
                if (totalPages <= 1) {
                    $pageBlock.attr("data-split", "true");
                    $pageBlock.attr("data-page", "1");
                    $pageBlock.attr("data-total", "1");
                    if (footerEl.length && footerTemplate) {
                        footerEl.text(processFooterTemplate(footerTemplate, 1, 1));
                    }
                    return;
                }

                var resultHtml = "";
                for (var i = 0; i < totalPages; i++) {
                    var pageNum = i + 1;
                    resultHtml += '<div class="editormd-page-block editormd-page-split" data-paper="' + paperKey + '" data-page="' + pageNum + '" data-total="' + totalPages + '" style="width:' + containerWidth + 'px;min-height:' + pageHeight + 'px;margin-bottom:' + pageMargin + 'px;">';
                    
                    // Add header to each page
                    if (headerText) {
                        resultHtml += '<div class="editormd-page-header">' + headerText + '</div>';
                    }
                    
                    resultHtml += '<div class="editormd-page-content">' + pages[i].join("") + '</div>';
                    
                    // Add footer to each page with page number
                    if (footerTemplate) {
                        resultHtml += '<div class="editormd-page-footer">' + processFooterTemplate(footerTemplate, pageNum, totalPages) + '</div>';
                    }
                    
                    // Add watermark to last page only
                    if (i === totalPages - 1 && watermark.length) {
                        resultHtml += '<div class="editormd-page-watermark">' + paperKey + '</div>';
                    }
                    resultHtml += '</div>';
                }

                // Replace original with split pages
                var $newBlocks = $(resultHtml);
                $pageBlock.replaceWith($newBlocks);

                // Mark all new blocks as split
                $newBlocks.attr("data-split", "true");
            }

            // Process all page blocks
            previewContainer.find(".editormd-page-block").each(function() {
                splitPageContent($(this));
            });
        },

        /**
         * Initialize Tooltips in preview area (instance method)
         */
        initTooltips : function() {
            editormd.initTooltips(this.previewContainer);
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
            // 统计中文字符数
            var cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
            // 统计英文单词数（字母序列）
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
         * Set xfEditor markdown/CodeMirror value
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
            } catch(e) {
                console.warn("xfEditor: 草稿数据解析失败，已重置", e);
                drafts = [];
            }

            var now = new Date().getTime();
            var maxDays = this.settings.draftMaxDays || 30;
            var maxAge = maxDays * 24 * 60 * 60 * 1000;

            // 移除过期的草稿
            drafts = drafts.filter(function(d) {
                return (now - d.time) < maxAge;
            });

            // 移除内容重复的草稿，仅保留最新的
            for (var i = drafts.length - 1; i >= 0; i--) {
                if (drafts[i].content === cmValue) {
                    drafts.splice(i, 1);
                }
            }

            // 同一编辑会话中（10分钟内）替换最新草稿，避免自动保存产生多个重复草稿
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

            // 最多保留 20 条草稿
            if (drafts.length > 20) drafts = drafts.slice(0, 20);

            try {
                localStorage.setItem(draftKey, JSON.stringify(drafts));
            } catch(e) {
                console.warn("xfEditor: 草稿保存失败，可能已超出 localStorage 配额", e);
            }

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
            } catch(e) {
                console.warn("xfEditor: 草稿清除失败", e);
            }
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
            } catch(e) {
                console.warn("xfEditor: 草稿数据解析失败", e);
                drafts = [];
            }

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
                } catch(e) {
                    console.warn("xfEditor: 草稿更新失败", e);
                }
            }

            if (!drafts || drafts.length === 0) return this;

            var _this = this;
            var dialogId = "editormd-draft-recovery-" + this.id;
            var maskId = dialogId + "-mask";

            $("#" + maskId).remove();
            if ($("#" + dialogId).length > 0) {
                $("#" + dialogId).remove();
            }

            // 格式化草稿列表HTML
            var listHtml = "";
            var draftCount = drafts.length;
            for (var i = 0; i < drafts.length; i++) {
                var d = drafts[i];
                var date = new Date(d.time);
                // 格式化日期为更友好的显示
                var now = new Date();
                var diffMs = now - date;
                var diffMins = Math.floor(diffMs / 60000);
                var diffHours = Math.floor(diffMs / 3600000);
                var diffDays = Math.floor(diffMs / 86400000);
                
                var timeLabel;
                if (diffMins < 1) {
                    timeLabel = "刚刚";
                } else if (diffMins < 60) {
                    timeLabel = diffMins + "分钟前";
                } else if (diffHours < 24) {
                    timeLabel = diffHours + "小时前";
                } else if (diffDays < 7) {
                    timeLabel = diffDays + "天前";
                } else {
                    timeLabel = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
                }
                
                var dateStr = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0') + " " + 
                             String(date.getHours()).padStart(2, '0') + ":" + String(date.getMinutes()).padStart(2, '0');
                var previewText = (d.preview || "").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ").trim();
                if (previewText.length === 0) previewText = "(空白草稿)";
                if (previewText.length > 100) previewText = previewText.substring(0, 100) + "...";
                
                listHtml += '<div class="editormd-draft-item" data-index="' + i + '" title="点击恢复此版本 (' + dateStr + ')">' +
                    '<span class="editormd-draft-time" title="' + dateStr + '">' + timeLabel + '</span>' +
                    '<span class="editormd-draft-preview">' + previewText + '</span>' +
                    '</div>';
            }

            // 创建遮罩层
            var $mask = $('<div id="' + maskId + '" class="editormd-draft-mask" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99998;opacity:0;transition:opacity 300ms ease;"></div>');
            $("body").append($mask);

            var lang = _this.settings.lang;
            var dialogHtml = '<div id="' + dialogId + '" class="editormd-dialog editormd-draft-dialog" style="display:block;opacity:0;transform:scale(0.9) translate(-50%, -50%);transition:all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);">' +
                '<div class="editormd-dialog-header">' +
                '<strong class="editormd-dialog-title">' + (lang.toolbar.restoreDraft || "恢复草稿") + ' <span style="font-size:12px;font-weight:normal;opacity:0.8;">(' + draftCount + ')</span></strong>' +
                '<a href="javascript:;" class="editormd-dialog-close" title="关闭">&times;</a>' +
                '</div>' +
                '<div class="editormd-dialog-content">' +
                '<p class="editormd-draft-tip">' + (lang.toolbar.draftRestoreTip || "检测到以下自动保存的草稿，点击任意草稿可恢复到编辑器：") + '</p>' +
                '<div class="editormd-draft-list">' + listHtml + '</div>' +
                '</div>' +
                '<div class="editormd-dialog-footer">' +
                '<button type="button" class="editormd-draft-clear" title="清除所有保存的草稿">' + (lang.toolbar.draftClearBtn || "清除所有") + '</button>' +
                '<button type="button" class="editormd-draft-cancel" title="关闭此对话框">' + (lang.toolbar.draftCancelBtn || "暂不恢复") + '</button>' +
                '</div>' +
                '</div>';

            var $dialog = $(dialogHtml);
            $("body").append($dialog);

            // 计算居中位置
            var dialogWidth = 520;
            var dialogHeight = $dialog.outerHeight() || 400;
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var left = Math.max(20, (windowWidth - dialogWidth) / 2);
            var top = Math.max(40, (windowHeight - dialogHeight) / 2);

            $dialog.css({
                position: "fixed",
                left: left + "px",
                top: top + "px",
                width: dialogWidth,
                maxWidth: "calc(100vw - 40px)",
                maxHeight: "calc(100vh - 80px)",
                zIndex: 99999,
                transform: "none"
            });

            // 动画显示
            setTimeout(function() {
                $mask.css("opacity", "1");
                $dialog.css({
                    opacity: "1",
                    transform: "scale(1)"
                });
            }, 10);

            // 关闭弹窗动画
            var closeDialog = function(animate) {
                animate = animate !== false; // 默认启用动画
                
                if (animate) {
                    $mask.css("opacity", "0");
                    $dialog.css({
                        opacity: "0",
                        transform: "scale(0.95)"
                    });
                    setTimeout(function() {
                        $dialog.remove();
                        $mask.remove();
                    }, 250);
                } else {
                    $dialog.remove();
                    $mask.remove();
                }
                $(document).off("keydown.editormdDraft");
                $(window).off("resize.editormdDraft");
            };

            $dialog.find(".editormd-dialog-close, .editormd-draft-cancel").on("click", function() {
                closeDialog(true);
            });

            $dialog.find(".editormd-draft-clear").on("click", function() {
                // 添加确认提示
                if (draftCount > 0 && !confirm("确定要清除所有 " + draftCount + " 个草稿吗？此操作不可恢复。")) {
                    return;
                }
                _this.clearDraft();
                closeDialog(true);
            });

            $dialog.find(".editormd-draft-item").on("click", function() {
                var $item = $(this);
                var idx = parseInt($item.data("index"), 10);
                
                // 添加选中效果
                $item.css({
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff"
                });
                $item.find(".editormd-draft-time").css({
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff"
                });
                $item.find(".editormd-draft-preview").css("color", "#fff");
                
                // 延迟恢复，让用户看到选中效果
                setTimeout(function() {
                    if (drafts[idx] && drafts[idx].content) {
                        var editorScroll = _this.cm.getScrollInfo();
                        var previewScroll = _this.preview.scrollTop();
                        _this.cm.setValue(drafts[idx].content);
                        _this.cm.scrollTo(editorScroll.left, editorScroll.top);
                        _this.timer = 0;
                        _this.save();
                        _this.preview.scrollTop(previewScroll);
                    }
                    closeDialog(true);
                }, 200);
            });

            $mask.on("click", function() {
                closeDialog(true);
            });

            $(document).on("keydown.editormdDraft", function(e) {
                if (e.keyCode === 27) {
                    closeDialog(true);
                }
            });

            // 窗口大小改变时重新居中
            $(window).on("resize.editormdDraft", function() {
                var newWindowWidth = $(window).width();
                var newWindowHeight = $(window).height();
                var newLeft = Math.max(20, (newWindowWidth - dialogWidth) / 2);
                var newTop = Math.max(40, (newWindowHeight - ($dialog.outerHeight() || 400)) / 2);
                $dialog.css({
                    left: newLeft + "px",
                    top: newTop + "px"
                });
            });

            return this;
        },

        /**
         * 获取完整的独立可展示 HTML 代码（可直接脱离编辑器在任何页面渲染最终效果）
         * 
         * 返回包含完整 CSS 样式、脚本和渲染后 HTML 内容的完整页面代码。
         * 该 HTML 可直接保存为 .html 文件或嵌入到其他页面中独立展示。
         * 
         * 返回结构：
         *   1. 必要的 CSS 样式（内联，从 editormd.css / editormd.preview.css 中提取）
         *   2. 渲染后的 Markdown HTML 内容
         *   3. 必要的 JavaScript 初始化脚本（tooltip / tabs / columns 交互等）
         * 
         * @param {Object}  [options={}]         可选配置
         * @param {Boolean} [options.wrap=true]  是否包裹完整 HTML 文档结构（<html><head>...</head><body>...</body></html>）
         * @param {Boolean} [options.includeStyles=true]  是否包含内联 CSS 样式
         * @param {Boolean} [options.includeScripts=true] 是否包含交互脚本
         * @param {String}  [options.title=""]   HTML 页面标题（仅在 wrap=true 时有效）
         * @param {String}  [options.lang="zh"]  HTML 语言属性
         * @returns {String}                      完整的 HTML 代码字符串
         */

        /**
         * 获取完整的独立 HTML 文档（含 DOCTYPE、head、body）
         * 与 getPreviewedHTML() 不同，此方法生成可直接独立打开的完整 HTML 页面，
         * 包含 HTML 骨架、DOCTYPE 声明、meta 标签、title、样式和脚本。
         *
         * @param {Object} [options={}] 选项
         * @param {Boolean} [options.includeStyles=true] 是否包含内联样式
         * @param {Boolean} [options.includeScripts=true] 是否包含交互脚本
         * @param {String}  [options.title="xfEditor Preview"] 页面标题
         * @param {String}  [options.description=""] 页面描述（meta description）
         * @param {String}  [options.author=""] 页面作者（meta author）
         * @param {String}  [options.keywords=""] 页面关键词（meta keywords）
         * @param {Array}   [options.externalStyles=[]] 外部样式表链接数组
         * @param {Array}   [options.externalScripts=[]] 外部脚本链接数组
         * @param {Object}  [options.customMeta={}] 自定义 meta 标签
         * @param {String}  [options.lang="zh-CN"] HTML lang 属性
         * @param {String}  [options.charset="UTF-8"] 字符编码
         * @param {Boolean} [options.minify=false] 是否压缩输出
         * @returns {String} 完整 HTML 文档字符串
         */
        getHTML : function(options) {
            var opts = $.extend({
                includeStyles    : true,
                includeScripts   : true,
                title            : "xfEditor Preview",
                description      : "",
                author           : "",
                keywords         : "",
                externalStyles   : [],
                externalScripts  : [],
                customMeta       : {},
                lang             : "zh-CN",
                charset          : "UTF-8",
                minify           : false
            }, options || {});
            
            var _this    = this;
            var settings = this.settings;
            
            // ★ 获取预览 HTML 内容，始终从 markdown 重渲染保证干净独立
            var previewOptions = $.extend({}, options, {
                includeStyles : false,
                includeScripts: false
            });
            var contentHTML = this.getPreviewedHTML(previewOptions);
            
            // 如果没有内容，尝试从 Markdown 渲染
            if (!contentHTML || contentHTML === '<div class="markdown-body editormd-html-preview">\n  \n</div>') {
                var markdownText = this.getMarkdown();
                if (markdownText) {
                    var rendererOptions = this._buildRendererOptions(settings, {toc: false, tocm: false});
                    var markedOptions = {
                        renderer: editormd.markedRenderer([], rendererOptions),
                        gfm: settings.gfm, tables: true, breaks: true,
                        pedantic: false, sanitize: false,
                        smartLists: true, smartypants: true
                    };
                    var markdownProtected2 = editormd.protectTeXSyntax(markdownText);
                    var mdPreprocess = editormd.preprocessMarkdownBlocks(markdownProtected2, rendererOptions);
                    var previewHTML = editormd.$marked(mdPreprocess.markdown, markedOptions);
                    previewHTML = editormd.restorePlaceholders(previewHTML, mdPreprocess.placeholders);
                    previewHTML = editormd.restoreTeXSyntax(previewHTML);
                    previewHTML = editormd.fixSmartypantsHTML(previewHTML);
                    if (settings.taskList) previewHTML = editormd.postProcessTaskLists(previewHTML);
                    previewHTML = editormd.filterHTMLTags(previewHTML, settings.htmlDecode);
                    contentHTML = '<div class="markdown-body editormd-html-preview">\n  ' + previewHTML + '\n</div>';
                }
            }
            
            // 构建内联样式和脚本
            var inlineStyles = "";
            var inlineScripts = "";
            if (opts.includeStyles) {
                inlineStyles = this._getCoreStyles();
            }
            if (opts.includeScripts) {
                inlineScripts = this._getInitScripts();
            }
            
            // ★ 生成完整的独立 HTML 文档，包含完整样式和交互脚本
            var html = '<!DOCTYPE html>\n';
            html += '<html lang="' + opts.lang + '">\n';
            html += '<head>\n';
            html += '  <meta charset="' + opts.charset + '">\n';
            html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
            html += '  <meta name="generator" content="xfEditor v1.12.0">\n';
            
            // ★ 添加 SEO meta 标签
            if (opts.description) {
                html += '  <meta name="description" content="' + editormd.escapeAttr(opts.description) + '">\n';
            }
            if (opts.author) {
                html += '  <meta name="author" content="' + editormd.escapeAttr(opts.author) + '">\n';
            }
            if (opts.keywords) {
                html += '  <meta name="keywords" content="' + editormd.escapeAttr(opts.keywords) + '">\n';
            }
            
            // ★ 添加自定义 meta 标签
            if (opts.customMeta && typeof opts.customMeta === 'object') {
                for (var metaName in opts.customMeta) {
                    if (opts.customMeta.hasOwnProperty(metaName)) {
                        html += '  <meta name="' + metaName + '" content="' + editormd.escapeAttr(opts.customMeta[metaName]) + '">\n';
                    }
                }
            }
            
            html += '  <title>' + editormd.escapeHTML(opts.title) + '</title>\n';
            
            // ★ 添加外部样式表
            if (Array.isArray(opts.externalStyles)) {
                opts.externalStyles.forEach(function(styleUrl) {
                    if (styleUrl && typeof styleUrl === 'string') {
                        html += '  <link rel="stylesheet" href="' + editormd.escapeAttr(styleUrl) + '">\n';
                    }
                });
            }
            
            // ★ 添加内联样式
            if (opts.includeStyles && inlineStyles) {
                html += '  <style>\n' + inlineStyles + '\n  </style>\n';
            }
            
            html += '</head>\n';
            html += '<body>\n';
            html += contentHTML + '\n';
            
            // ★ 添加外部脚本
            if (Array.isArray(opts.externalScripts)) {
                opts.externalScripts.forEach(function(scriptUrl) {
                    if (scriptUrl && typeof scriptUrl === 'string') {
                        html += '<script src="' + editormd.escapeAttr(scriptUrl) + '"><\/script>\n';
                    }
                });
            }
            
            // ★ 添加内联脚本
            if (opts.includeScripts && inlineScripts) {
                html += '<script>\n' + inlineScripts + '\n<\/script>\n';
            }
            
            html += '</body>\n';
            html += '</html>';
            
            // ★ 压缩输出（移除多余空白）
            if (opts.minify) {
                html = html.replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n');
            }
            
            return html;
        },
        
        /**
         * 构建渲染选项（统一所有 rendererOptions 创建点，避免遗漏配置项）
         * @private
         * @param {Object} settings 编辑器设置
         * @param {Object} [overrides={}] 覆盖项
         * @returns {Object}
         */
        _buildRendererOptions : function(settings, overrides) {
            return $.extend({
                toc           : false,
                tocm          : false,
                tocStartLevel : 1,
                taskList      : settings.taskList,
                tex           : settings.tex,
                pageBreak     : settings.pageBreak,
                atLink        : settings.atLink,
                emailLink     : settings.emailLink,
                flowChart     : settings.flowChart,
                sequenceDiagram : settings.sequenceDiagram,
                previewCodeHighlight : settings.previewCodeHighlight,
                pinyin             : settings.pinyin,
                textAlign          : settings.textAlign,
                imageResize        : settings.imageResize,
                echarts            : settings.echarts,
                tabs               : settings.tabs,
                columns            : settings.columns,
                pageBlock          : settings.pageBlock,
                tooltip            : settings.tooltip,
                copybook           : settings.copybook,
                video              : settings.video,
                fileList           : settings.fileList
            }, overrides || {});
        },

        /**
         * 获取核心 CSS 样式（内联版本，用于 getHTML() 输出独立页面）
         * @private
         * @returns {String}
         */
        _getCoreStyles : function() {
            var css = [];
            
            // ──── 组合上下标：<<下标>^<上标>> 垂直堆叠 ────
            css.push('.editormd-supsub{display:inline-block;vertical-align:text-bottom;font-size:50%;line-height:1.05;text-align:left;}');
            css.push('.editormd-supsub sup,.editormd-supsub sub{display:block;position:relative;line-height:1.05;font-size:1em;}');
            css.push('.editormd-supsub sup{bottom:0.1em;}');
            css.push('.editormd-supsub sub{top:0.12em;}');
            
            // Pinyin ruby annotation
            css.push('.editormd-pinyin{display:ruby;ruby-align:center;line-height:2.2;}');
            css.push('.editormd-pinyin rb{display:ruby-base;}');
            css.push('.editormd-pinyin rt{display:ruby-text;font-size:0.65em;color:#666;line-height:1;}');
            css.push('.editormd-pinyin rp{display:none;}');
            
            // Tooltip / Popover — 黑色背景、padding/margin 为 0
            css.push('.editormd-tooltip-trigger{border-bottom:1px dashed #2C7EEA;color:#2C7EEA;cursor:help;position:relative;display:inline;}');
            css.push('.editormd-tooltip-trigger:focus{outline:2px solid #2C7EEA;outline-offset:2px;border-radius:2px;}');
            css.push('.editormd-tooltip-popup{position:fixed;z-index:99999;background:#000;color:#fff;padding:0;margin:0;border-radius:8px;font-size:13px;line-height:1.5;max-width:320px;word-wrap:break-word;display:none;opacity:0;transition:opacity 0.2s;pointer-events:auto;box-shadow:0 4px 20px rgba(0,0,0,0.35);}');
            css.push('.editormd-tooltip-popup.show{opacity:1;}');
            css.push('.editormd-tooltip-text-content{white-space:pre-wrap;background:#000;color:#fff;padding:10px 16px;border-radius:8px;display:inline-block;}');
            // Arrow styles
            css.push('.editormd-tooltip-arrow{position:absolute;left:50%;margin-left:-8px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;z-index:10000;}');
            css.push('.editormd-tooltip-arrow-bottom .editormd-tooltip-arrow{top:100%;border-top:7px solid #000;}');
            css.push('.editormd-tooltip-arrow-top .editormd-tooltip-arrow{bottom:100%;border-bottom:7px solid #000;}');
            // Image/iframe popup
            css.push('.editormd-tooltip-popup.editormd-tooltip-image,.editormd-tooltip-popup.editormd-tooltip-iframe{padding:0;margin:0;max-width:90vw;background:#000;border:none;pointer-events:auto;min-width:100px;min-height:60px;}');
            css.push('.editormd-tooltip-popup.editormd-tooltip-image img{display:block;max-width:340px;max-height:220px;width:auto;height:auto;border-radius:4px;object-fit:contain;}');
            css.push('.editormd-tooltip-popup.editormd-tooltip-iframe iframe{display:block;width:340px;height:210px;border-radius:4px;}');
            css.push('.editormd-tooltip-arrow-top.editormd-tooltip-image .editormd-tooltip-arrow,.editormd-tooltip-arrow-top.editormd-tooltip-iframe .editormd-tooltip-arrow{border-bottom-color:#000;}');
            css.push('.editormd-tooltip-arrow-bottom.editormd-tooltip-image .editormd-tooltip-arrow,.editormd-tooltip-arrow-bottom.editormd-tooltip-iframe .editormd-tooltip-arrow{border-top-color:#000;}');
            // HTML content tooltip
            css.push('.editormd-tooltip-popup.editormd-tooltip-html,.editormd-tooltip-popup.editormd-tooltip-html-selector{max-width:420px;max-height:360px;overflow-y:auto;overflow-x:hidden;background:#000;color:#fff;padding:0;margin:0;pointer-events:auto;}');
            css.push('.editormd-tooltip-html-content{overflow-wrap:break-word;background:#000;color:#fff;padding:0;margin:0;}');
            css.push('.editormd-tooltip-html-content img{max-width:100%;height:auto;}');
            css.push('.editormd-tooltip-html-content table{font-size:12px;border-collapse:collapse;width:100%;}');
            css.push('.editormd-tooltip-html-content table th,.editormd-tooltip-html-content table td{border:1px solid rgba(255,255,255,0.25);padding:4px 8px;}');
            css.push('.editormd-tooltip-html-content table th{background:rgba(255,255,255,0.08);}');
            css.push('.editormd-tooltip-html-content a{color:#58a6ff;}');
            css.push('.editormd-tooltip-html-content code{background:rgba(255,255,255,0.12);padding:1px 5px;border-radius:3px;font-size:12px;color:#ffa657;}');
            css.push('.editormd-tooltip-html-content pre{background:rgba(255,255,255,0.08);padding:8px;border-radius:4px;overflow-x:auto;font-size:12px;}');
            css.push('.editormd-tooltip-html-content ul,.editormd-tooltip-html-content ol{padding-left:20px;}');
            css.push('.editormd-tooltip-html-content hr{border-color:rgba(255,255,255,0.2);}');
            css.push('.editormd-tooltip-html-content blockquote{border-left:3px solid rgba(255,255,255,0.3);padding-left:10px;margin:4px 0;color:rgba(255,255,255,0.75);}');
            // Loading state
            css.push('.editormd-tooltip-loading{display:flex;align-items:center;justify-content:center;padding:20px;color:#999;font-size:12px;}');
            
            // Tabs
            css.push('.editormd-tabs{margin:15px 0;border:1px solid #ddd;border-radius:4px;overflow:hidden;background:#fff;}');
            css.push('.editormd-tab-nav{list-style:none;margin:0;padding:0;display:flex;background:#f8f9fa;border-bottom:1px solid #ddd;}');
            css.push('.editormd-tab-nav li{padding:10px 18px;cursor:pointer;border-right:1px solid #eee;font-size:14px;color:#666;transition:all 200ms ease;user-select:none;}');
            css.push('.editormd-tab-nav li:hover{background:#fff;color:#333;}');
            css.push('.editormd-tab-nav li.active{background:#fff;color:#2C7EEA;font-weight:600;border-bottom:2px solid #2C7EEA;margin-bottom:-1px;}');
            css.push('.editormd-tab-body{padding:16px;min-height:60px;}');
            css.push('.editormd-tab-panel{display:none;}');
            css.push('.editormd-tab-panel.active{display:block;}');
            css.push('.editormd-tab-panel>:first-child{margin-top:0;}');
            
            // Columns
            css.push('.editormd-columns{margin:15px 0;padding:15px;border:1px dashed #ddd;border-radius:4px;column-gap:30px;-webkit-column-gap:30px;-moz-column-gap:30px;column-rule:1px solid #ccc;-webkit-column-rule:1px solid #ccc;-moz-column-rule:1px solid #ccc;}');
            
            // Video
            css.push('.editormd-video-player{display:block;max-width:100%;border-radius:4px;background:#000;margin:10px 0;}');
            
            // File list
            css.push('.editormd-file-list{margin:10px 0;}');
            css.push('.editormd-file-list a{display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border:1px solid #ddd;border-radius:3px;text-decoration:none;color:#333;font-size:13px;}');
            css.push('.editormd-file-list a:hover{background:#f0f0f0;}');
            
            // Text align
            css.push('.editormd-text-align{display:block;margin:0.5em 0;}');
            css.push('.editormd-text-align-center{text-align:center!important;}');
            css.push('.editormd-text-align-left{text-align:left!important;}');
            css.push('.editormd-text-align-right{text-align:right!important;}');
            css.push('.editormd-text-align-justify{text-align:justify!important;}');
            
            // ECharts
            css.push('.editormd-echarts{margin:15px 0;border:1px solid #eee;border-radius:4px;}');
            
            // Preview container
            css.push('.editormd-html-preview{text-align:left;font-size:16px;line-height:1.6;padding:20px;overflow:auto;width:100%;background-color:#fff;color:#333;word-wrap:break-word;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";}');
            css.push('.editormd-html-preview *{box-sizing:border-box;}');
            css.push('.editormd-html-preview p{margin-top:0;margin-bottom:10px;}');
            css.push('.editormd-html-preview strong{font-weight:600;}');
            css.push('.editormd-html-preview em{font-style:italic;}');
            css.push('.editormd-html-preview del{text-decoration:line-through;}');
            css.push('.editormd-html-preview blockquote{padding:0 1em;color:#6a737d;border-left:0.25em solid #dfe2e5;margin:0 0 16px 0;}');
            css.push('.editormd-html-preview blockquote>:first-child{margin-top:0;}');
            css.push('.editormd-html-preview blockquote>:last-child{margin-bottom:0;}');
            css.push('.editormd-html-preview pre{position:relative;border:1px solid #e1e4e8;background:#f6f8fa;padding:16px;margin-bottom:16px;overflow:auto;line-height:1.6;font-size:13px;font-family:"SF Mono","Fira Code",Consolas,"Liberation Mono",Menlo,monospace;color:#24292e;word-wrap:normal;border-radius:6px;}');
            css.push('.editormd-html-preview pre code{border:none;background:transparent;padding:0;font-size:13px;line-height:1.6;color:inherit;white-space:pre;word-break:normal;font-family:inherit;}');
            css.push('.editormd-html-preview code{font-family:"SF Mono","Fira Code",Consolas,"Liberation Mono",Menlo,monospace;}');
            css.push('.editormd-html-preview code:not(pre code){color:#c7254e;background:#f9f2f4;border:1px solid #f0d0d8;padding:2px 6px;border-radius:3px;font-size:85%;white-space:nowrap;}');
            css.push('.editormd-html-preview img{max-width:100%;}');
            css.push('.editormd-html-preview table{border-collapse:collapse;border-spacing:0;width:100%;margin-bottom:16px;display:block;overflow:auto;}');
            css.push('.editormd-html-preview table th,.editormd-html-preview table td{padding:6px 13px;border:1px solid #dfe2e5;}');
            css.push('.editormd-html-preview table th{font-weight:600;background:#f6f8fa;}');
            css.push('.editormd-html-preview table tr{background:#fff;border-top:1px solid #c6cbd1;}');
            css.push('.editormd-html-preview table tr:nth-child(2n){background:#f6f8fa;}');
            css.push('.editormd-html-preview hr{height:0.25em;padding:0;margin:24px 0;background-color:#e1e4e8;border:0;overflow:hidden;}');
            css.push('.editormd-html-preview hr.editormd-page-break{border:1px dotted #ccc;font-size:0;height:2px;margin:10px 0;padding:0;background:transparent;}');
            css.push('.editormd-html-preview h1,.editormd-html-preview h2,.editormd-html-preview h3,.editormd-html-preview h4,.editormd-html-preview h5,.editormd-html-preview h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}');
            css.push('.editormd-html-preview h1{font-size:2em;border-bottom:1px solid #eee;padding-bottom:0.3em;}');
            css.push('.editormd-html-preview h2{font-size:1.5em;border-bottom:1px solid #eee;padding-bottom:0.3em;}');
            css.push('.editormd-html-preview h3{font-size:1.25em;}');
            css.push('.editormd-html-preview h4{font-size:1em;}');
            css.push('.editormd-html-preview h5{font-size:0.875em;}');
            css.push('.editormd-html-preview h6{font-size:0.85em;color:#6a737d;}');
            css.push('.editormd-html-preview a{color:#0366d6;text-decoration:none;}');
            css.push('.editormd-html-preview a:hover{text-decoration:underline;}');
            css.push('.editormd-html-preview ul,.editormd-html-preview ol{padding-left:2em;margin-top:0;margin-bottom:16px;}');
            css.push('.editormd-html-preview ul ul,.editormd-html-preview ul ol,.editormd-html-preview ol ol,.editormd-html-preview ol ul{margin-top:0;margin-bottom:0;}');
            css.push('.editormd-html-preview li{word-wrap:break-all;}');
            css.push('.editormd-html-preview li>p{margin-top:16px;}');
            css.push('.editormd-html-preview li+li{margin-top:0.25em;}');
            
            // Code copy button (floating at top-right inside pre)
            css.push('.editormd-code-copy-btn{position:absolute;top:6px;right:6px;z-index:10;display:inline-flex;align-items:center;padding:4px 8px;font-size:11px;line-height:1.3;color:#57606a;background:#fff;border:1px solid #d0d7de;border-radius:5px;cursor:pointer;user-select:none;-webkit-user-select:none;transition:all 0.15s ease;opacity:0;box-shadow:0 1px 2px rgba(0,0,0,0.04);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}');
            css.push('pre:hover .editormd-code-copy-btn{opacity:1;}');
            css.push('.editormd-code-copy-btn:hover{color:#0969da;border-color:#0969da;background:#f6f8fe;opacity:1;}');
            css.push('.editormd-code-copy-btn.copied{color:#1a7f37;border-color:#1a7f37;background:#dafbe1;cursor:default;pointer-events:none;opacity:1;}');
            css.push('.editormd-code-copy-btn.failed{color:#cf222e;border-color:#cf222e;background:#ffebe9;cursor:default;pointer-events:none;opacity:1;}');
            // Task list styling for standalone HTML preview
            css.push('.editormd-html-preview li.task-list-item{list-style:none;}');
            css.push('.editormd-html-preview li.task-list-item+li.task-list-item{margin-top:3px;}');
            css.push('.editormd-html-preview .task-list-item-checkbox{float:left;margin:0.35em 0 0.25em -1.6em;vertical-align:middle;}');
            
            // Flow chart & sequence
            css.push('.editormd-html-preview .flowchart,.editormd-html-preview .sequence-diagram{margin:0 auto;text-align:center;}');
            css.push('.editormd-html-preview .flowchart svg,.editormd-html-preview .sequence-diagram svg{margin:0 auto;}');
            css.push('.editormd-html-preview .flowchart text,.editormd-html-preview .sequence-diagram text{font-size:15px!important;}');
            
            // KaTeX - embed full KaTeX CSS (non-font-face rules) for standalone rendering
            // The @font-face rules reference font files; we load those dynamically
            css.push('.katex-display{display:block;margin:1em 0;text-align:center;}');
            css.push('.katex-display>.katex{display:inline-block;}');
            css.push('.katex{font:400 1.21em KaTeX_Main;line-height:1.2;white-space:nowrap;}');
            css.push('.katex .katex-html{display:inline-block;}');
            css.push('.katex .katex-mathml{position:absolute;clip:rect(1px,1px,1px,1px);padding:0;border:0;height:1px;width:1px;overflow:hidden;}');
            css.push('.katex .base,.katex .strut{display:inline-block;}');
            css.push('.katex .mathit{font-family:KaTeX_Math;font-style:italic;}');
            css.push('.katex .amsrm{font-family:KaTeX_AMS;}');
            css.push('.katex .textstyle>.mord+.mop{margin-left:.16667em;}');
            css.push('.katex .textstyle>.mord+.mbin{margin-left:.22222em;}');
            css.push('.katex .textstyle>.mord+.mrel{margin-left:.27778em;}');
            css.push('.katex .textstyle>.mop+.mop,.katex .textstyle>.mop+.mord,.katex .textstyle>.mord+.minner{margin-left:.16667em;}');
            css.push('.katex .textstyle>.mop+.mrel{margin-left:.27778em;}');
            css.push('.katex .textstyle>.mop+.minner{margin-left:.16667em;}');
            css.push('.katex .textstyle>.mbin+.minner,.katex .textstyle>.mbin+.mop,.katex .textstyle>.mbin+.mopen,.katex .textstyle>.mbin+.mord{margin-left:.22222em;}');
            css.push('.katex .textstyle>.mrel+.minner,.katex .textstyle>.mrel+.mop,.katex .textstyle>.mrel+.mopen,.katex .textstyle>.mrel+.mord{margin-left:.27778em;}');
            css.push('.katex .textstyle>.mclose+.mop{margin-left:.16667em;}');
            css.push('.katex .textstyle>.mclose+.mbin{margin-left:.22222em;}');
            css.push('.katex .textstyle>.mclose+.mrel{margin-left:.27778em;}');
            css.push('.katex .textstyle>.mclose+.minner,.katex .textstyle>.minner+.mop,.katex .textstyle>.minner+.mord,.katex .textstyle>.mpunct+.mclose,.katex .textstyle>.mpunct+.minner,.katex .textstyle>.mpunct+.mop,.katex .textstyle>.mpunct+.mopen,.katex .textstyle>.mpunct+.mord,.katex .textstyle>.mpunct+.mpunct,.katex .textstyle>.mpunct+.mrel{margin-left:.16667em;}');
            css.push('.katex .textstyle>.minner+.mbin{margin-left:.22222em;}');
            css.push('.katex .textstyle>.minner+.mrel{margin-left:.27778em;}');
            css.push('.katex .mclose+.mop,.katex .minner+.mop,.katex .mop+.mop,.katex .mop+.mord,.katex .mord+.mop,.katex .textstyle>.minner+.minner,.katex .textstyle>.minner+.mopen,.katex .textstyle>.minner+.mpunct{margin-left:.16667em;}');
            css.push('.katex .reset-textstyle.textstyle{font-size:1em;}');
            css.push('.katex .reset-textstyle.scriptstyle{font-size:.7em;}');
            css.push('.katex .reset-textstyle.scriptscriptstyle{font-size:.5em;}');
            css.push('.katex .reset-scriptstyle.textstyle{font-size:1.42857em;}');
            css.push('.katex .reset-scriptstyle.scriptstyle{font-size:1em;}');
            css.push('.katex .reset-scriptstyle.scriptscriptstyle{font-size:.71429em;}');
            css.push('.katex .reset-scriptscriptstyle.textstyle{font-size:2em;}');
            css.push('.katex .reset-scriptscriptstyle.scriptstyle{font-size:1.4em;}');
            css.push('.katex .reset-scriptscriptstyle.scriptscriptstyle{font-size:1em;}');
            css.push('.katex .style-wrap{position:relative;}');
            css.push('.katex .vlist{display:inline-block;}');
            css.push('.katex .vlist>span{display:block;height:0;position:relative;}');
            css.push('.katex .vlist>span>span{display:inline-block;}');
            css.push('.katex .vlist .baseline-fix{display:inline-table;table-layout:fixed;}');
            css.push('.katex .msupsub{text-align:left;}');
            css.push('.katex .mfrac>span>span{text-align:center;}');
            css.push('.katex .mfrac .frac-line{width:100%;}');
            css.push('.katex .mfrac .frac-line:before{border-bottom-style:solid;border-bottom-width:1px;content:"";display:block;}');
            css.push('.katex .mfrac .frac-line:after{border-bottom-style:solid;border-bottom-width:.04em;content:"";display:block;margin-top:-1px;}');
            css.push('.katex .mspace{display:inline-block;}');
            css.push('.katex .mspace.negativethinspace{margin-left:-.16667em;}');
            css.push('.katex .mspace.thinspace{width:.16667em;}');
            css.push('.katex .mspace.mediumspace{width:.22222em;}');
            css.push('.katex .mspace.thickspace{width:.27778em;}');
            css.push('.katex .mspace.enspace{width:.5em;}');
            css.push('.katex .mspace.quad{width:1em;}');
            css.push('.katex .mspace.qquad{width:2em;}');
            css.push('.katex .llap,.katex .rlap{width:0;position:relative;}');
            css.push('.katex .llap>.inner,.katex .rlap>.inner{position:absolute;}');
            css.push('.katex .llap>.fix,.katex .rlap>.fix{display:inline-block;}');
            css.push('.katex .llap>.inner{right:0;}');
            css.push('.katex .rlap>.inner{left:0;}');
            css.push('.katex .katex-logo .a{font-size:.75em;margin-left:-.32em;position:relative;top:-.2em;}');
            css.push('.katex .katex-logo .t{margin-left:-.23em;}');
            css.push('.katex .katex-logo .e{margin-left:-.1667em;position:relative;top:.2155em;}');
            css.push('.katex .katex-logo .x{margin-left:-.125em;}');
            css.push('.katex .rule{display:inline-block;border-style:solid;position:relative;}');
            css.push('.katex .overline .overline-line{width:100%;}');
            css.push('.katex .overline .overline-line:before{border-bottom-style:solid;border-bottom-width:1px;content:"";display:block;}');
            css.push('.katex .overline .overline-line:after{border-bottom-style:solid;border-bottom-width:.04em;content:"";display:block;margin-top:-1px;}');
            css.push('.katex .sqrt>.sqrt-sign{position:relative;}');
            css.push('.katex .sqrt .sqrt-line{width:100%;}');
            css.push('.katex .sqrt .sqrt-line:before{border-bottom-style:solid;border-bottom-width:1px;content:"";display:block;}');
            css.push('.katex .sqrt .sqrt-line:after{border-bottom-style:solid;border-bottom-width:.04em;content:"";display:block;margin-top:-1px;}');
            css.push('.katex .fontsize-ensurer,.katex .sizing{display:inline-block;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.4em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.6em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.8em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:2em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2.4em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.88em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:3.46em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:4.14em;}');
            css.push('.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.98em;}');
            css.push('.katex .delimsizing.size1{font-family:KaTeX_Size1;}');
            css.push('.katex .delimsizing.size2{font-family:KaTeX_Size2;}');
            css.push('.katex .delimsizing.size3{font-family:KaTeX_Size3;}');
            css.push('.katex .delimsizing.size4{font-family:KaTeX_Size4;}');
            css.push('.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1;}');
            css.push('.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4;}');
            css.push('.katex .nulldelimiter{display:inline-block;width:.12em;}');
            css.push('.katex .op-symbol{position:relative;}');
            css.push('.katex .op-symbol.small-op{font-family:KaTeX_Size1;}');
            css.push('.katex .op-symbol.large-op{font-family:KaTeX_Size2;}');
            css.push('.katex .accent>.vlist>span,.katex .op-limits>.vlist>span{text-align:center;}');
            css.push('.katex .accent .accent-body>span{width:0;}');
            css.push('.katex .accent .accent-body.accent-vec>span{position:relative;left:.326em;}');
            css.push('.editormd-html-preview .katex{font-size:1.4em;}');
            css.push('.editormd-html-preview p.editormd-tex{text-align:center;}');
            css.push('.editormd-html-preview span.editormd-tex{margin:0 5px;}');
            
            // Prettify / code highlighting CSS
            css.push('.prettyprint .pln{color:#24292e;}');
            css.push('.prettyprint .str,.prettyprint .atv{color:#032f62;}');
            css.push('.prettyprint .kwd,.prettyprint .tag{color:#d73a49;}');
            css.push('.prettyprint .com{color:#6a737d;font-style:italic;}');
            css.push('.prettyprint .typ,.prettyprint .atn,.prettyprint .dec,.prettyprint .var{color:#005cc5;}');
            css.push('.prettyprint .lit,.prettyprint .pun{color:#005cc5;}');
            css.push('.prettyprint .opn,.prettyprint .clo{color:#d73a49;}');
            css.push('.prettyprint .fun{color:#6f42c1;}');
            css.push('pre.prettyprint{position:relative !important;padding:16px !important;overflow:auto !important;}');
            css.push('ol.linenums{margin:0 !important;padding:0 0 0 3.5em !important;color:#8b949e;}');
            css.push('ol.linenums li{list-style-type:decimal !important;padding-left:6px;min-height:1.5em;line-height:1.6;}');
            css.push('ol.linenums li.L0,ol.linenums li.L1,ol.linenums li.L2,ol.linenums li.L3,ol.linenums li.L4,ol.linenums li.L5,ol.linenums li.L6,ol.linenums li.L7,ol.linenums li.L8,ol.linenums li.L9{list-style-type:decimal !important;}');
            css.push('ol.linenums li:nth-child(odd){background:#fafbfc;}');
            
            // ═══════════════ 自定义工具栏图标：字帖系列 ═══════════════
            css.push('.fa.editormd-icon-copybook,.fa.editormd-icon-tian,.fa.editormd-icon-mi,.fa.editormd-icon-pinyin{width:15px;height:15px;vertical-align:middle;position:relative;font-family:inherit!important;overflow:visible;margin-top:-1px;}');
            // 字帖 - 文档/笔记本
            css.push('.fa.editormd-icon-copybook{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Cpath d=%27M2 1h7l3 3v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cpath d=%27M9 1v3h3%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cline x1=%274%27 y1=%276%27 x2=%2710%27 y2=%276%27 stroke=%27%23999%27 stroke-width=%270.6%27/%3E%3Cline x1=%274%27 y1=%278%27 x2=%279%27 y2=%278%27 stroke=%27%23999%27 stroke-width=%270.5%27/%3E%3Cline x1=%274%27 y1=%2710%27 x2=%278%27 y2=%2710%27 stroke=%27%23999%27 stroke-width=%270.5%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
            // 田字格 - 四等分网格
            css.push('.fa.editormd-icon-tian{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Crect x=%270.5%27 y=%270.5%27 width=%2713%27 height=%2713%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.5%27 rx=%271.5%27/%3E%3Cline x1=%270.5%27 y1=%277%27 x2=%2713.5%27 y2=%277%27 stroke=%27%23555%27 stroke-width=%271%27/%3E%3Cline x1=%277%27 y1=%270.5%27 x2=%277%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%271%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
            // 米字格 - 四等分+对角线
            css.push('.fa.editormd-icon-mi{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Crect x=%270.5%27 y=%270.5%27 width=%2713%27 height=%2713%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.5%27 rx=%271.5%27/%3E%3Cline x1=%270.5%27 y1=%277%27 x2=%2713.5%27 y2=%277%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%277%27 y1=%270.5%27 x2=%277%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%270.5%27 y1=%270.5%27 x2=%2713.5%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%2713.5%27 y1=%270.5%27 x2=%270.5%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
            // 拼音格 - 四线格
            css.push('.fa.editormd-icon-pinyin{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Cline x1=%271%27 y1=%272%27 x2=%2713%27 y2=%272%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%271%27 y1=%276%27 x2=%2713%27 y2=%276%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cline x1=%271%27 y1=%2710%27 x2=%2713%27 y2=%2710%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%271%27 y1=%2712%27 x2=%2713%27 y2=%2712%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
            
            // ═══════════════ ToC 目录样式 ═══════════════
            css.push('.markdown-toc.editormd-markdown-toc{padding:16px 20px;margin:16px 0;background:#f8f9fb;border:1px solid #e1e4e8;border-radius:8px;font-size:14px;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list{margin:0;padding:0 0 0 4px;list-style:none;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list ul{padding-left:18px;list-style:none;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list li{margin:4px 0;position:relative;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a{color:#0366d6;text-decoration:none;font-size:13px;line-height:1.6;display:inline-block;padding:2px 0;transition:all 150ms ease;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a:hover{color:#005cc5;text-decoration:underline;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-1{font-weight:600;font-size:14px;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-2{font-weight:500;font-size:13px;padding-left:4px;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-3{font-weight:400;font-size:12.5px;padding-left:8px;color:#586069;}');
            css.push('.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-4,.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-5,.markdown-toc.editormd-markdown-toc .markdown-toc-list a.toc-level-6{font-size:12px;padding-left:12px;color:#6a737d;}');
            // ToC dropdown menu
            css.push('.editormd-toc-menu{position:relative;display:inline-block;margin:8px 0;}');
            css.push('.editormd-toc-menu .toc-menu-btn{display:inline-block;padding:6px 14px;background:#f6f8fa;border:1px solid #d1d5da;border-radius:6px;font-size:13px;color:#24292e;cursor:pointer;text-decoration:none!important;transition:all 200ms ease;}');
            css.push('.editormd-toc-menu .toc-menu-btn:hover{background:#e1e4e8;border-color:#c6cbd1;}');
            css.push('.editormd-toc-menu .toc-menu-btn .fa{margin-right:5px;font-size:12px;}');
            css.push('.editormd-toc-menu .markdown-toc-list{display:none;position:absolute;top:100%;left:0;min-width:220px;max-height:460px;overflow-y:auto;background:#fff;border:1px solid #d1d5da;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:400;margin-top:4px;padding:8px 0;}');
            css.push('.editormd-toc-menu .markdown-toc-list li{padding:0;}');
            css.push('.editormd-toc-menu .markdown-toc-list a{display:block;padding:5px 16px;color:#24292e;font-size:13px;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background 150ms ease;}');
            css.push('.editormd-toc-menu .markdown-toc-list a:hover{background:#f1f8ff;color:#0366d6;}');
            css.push('.editormd-toc-menu .markdown-toc-list a.toc-level-1{font-weight:600;}');
            css.push('.editormd-toc-menu .markdown-toc-list a.toc-level-2{padding-left:24px;font-weight:500;}');
            css.push('.editormd-toc-menu .markdown-toc-list a.toc-level-3{padding-left:32px;font-size:12.5px;}');
            
            // ──── 脚注样式 ────
            css.push('.editormd-footnotes-section{margin-top:24px;padding-top:12px;border-top:1px solid #d1d5db;}');
            css.push('.editormd-footnote-sep{display:none;}');
            css.push('.editormd-footnote-title{font-size:14px;font-weight:700;color:#1f2937;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}');
            css.push('.editormd-footnote-list{padding:0;margin:0;list-style:none;counter-reset:editormd-fn-counter;}');
            css.push('.editormd-footnote-item{position:relative;margin-bottom:6px;padding:8px 10px 8px 32px;font-size:13px;line-height:1.5;color:#4b5563;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;transition:all 0.25s ease;}');
            css.push('.editormd-footnote-item::before{counter-increment:editormd-fn-counter;content:counter(editormd-fn-counter);position:absolute;left:8px;top:8px;font-size:11px;font-weight:700;color:#6b7280;min-width:18px;text-align:center;}');
            css.push('.editormd-footnote-content{display:block;}');
            css.push('.editormd-footnote-content p{margin:0 0 6px;}');
            css.push('.editormd-footnote-backref{display:none;}');
            css.push('.editormd-footnote-ref-wrapper{display:inline;margin:0 1px;font-size:75%;line-height:0;position:relative;bottom:0.5em;}');
            css.push('.editormd-footnote-ref-wrapper a{text-decoration:none;color:#2563eb;font-weight:600;}');
            css.push('.editormd-footnote-ref-wrapper a:hover{color:#1d4ed8;text-decoration:underline;}');
            
            // ──── 字帖样式（Copybook Grid）────────────────
            css.push('.editormd-copybook{display:block;margin:1em 0;padding:12px 8px;background:#fef7e9;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow-x:auto;}');
            css.push('.editormd-copybook-row{display:flex;justify-content:center;gap:4px;margin-bottom:6px;}');
            css.push('.editormd-copybook-row:last-child{margin-bottom:0;}');
            css.push('.editormd-copybook-cell{position:relative;flex-shrink:0;}');
            css.push('.editormd-copybook-grid-cell{width:52px;height:52px;background:#fff;border:1px solid #d4c296;box-shadow:0 1px 2px rgba(0,0,0,0.02);}');
            css.push('.editormd-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;}');
            css.push('.editormd-copybook-hanzi-text{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-family:"KaiTi","楷体","华文楷书",serif;color:#3e2a1a;line-height:1;z-index:3;}');
            css.push('.editormd-copybook-pinyin-cell{display:flex;flex-direction:column;align-items:center;width:52px;}');
            css.push('.editormd-copybook-pinyin-top{position:relative;width:100%;height:28px;background:#fffef8;border:none;}');
            css.push('.editormd-copybook-pinyin-top .editormd-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;}');
            css.push('.editormd-copybook-pinyin-text{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#3a7d44;font-family:"KaiTi","楷体",serif;z-index:3;}');
            css.push('.editormd-copybook-pinyin-bottom{position:relative;width:100%;height:52px;background:#fff;border:1px solid #d4c296;border-top:none;margin-top:2px;}');
            css.push('.editormd-copybook-pinyin-bottom .editormd-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;}');
            css.push('.editormd-copybook-pinyin-bottom .editormd-copybook-hanzi-text{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-family:"KaiTi","楷体",serif;color:#3e2a1a;line-height:1;z-index:3;}');
            
            return css.join('\n');
        },
        
        /**
         * 获取独立页面所需的交互初始化脚本（用于 getHTML() 输出）
         * @private
         * @returns {String}
         */
        _getInitScripts : function() {
            var scripts = [];
            
            // DOM 加载完毕后初始化交互组件
            scripts.push('(function(){');
            
            // 自动检测 editormd.js 基路径，用于加载 KaTeX/ECharts 等资源
            scripts.push('  function detectBasePath(){');
            scripts.push('    var scripts=document.getElementsByTagName("script");');
            scripts.push('    for(var i=scripts.length-1;i>=0;i--){');
            scripts.push('      var s=scripts[i];');
            scripts.push('      if(s.src&&s.src.indexOf("editormd")!==-1){');
            scripts.push('        var m=s.src.match(/^(.*\\/)editormd/);');
            scripts.push('        if(m) return m[1];');
            scripts.push('      }');
            scripts.push('    }');
            // 回退：从当前页面 URL 推断
            scripts.push('    var loc=window.location.href;');
            scripts.push('    if(loc.indexOf("/examples/")!==-1) return loc.replace(/\\/examples\\/.*$/,"/lib/");');
            scripts.push('    return "./lib/";');
            scripts.push('  }');
            
            // 动态加载 CSS
            scripts.push('  function loadCSS(url){');
            scripts.push('    if(!document.querySelector(\'link[href="\'+url+\'"]\')){');
            scripts.push('      var l=document.createElement("link");');
            scripts.push('      l.rel="stylesheet";l.href=url;');
            scripts.push('      document.head.appendChild(l);');
            scripts.push('    }');
            scripts.push('  }');
            
            // 动态加载 JS 脚本
            scripts.push('  function loadScript(url,cb){');
            scripts.push('    if(!document.querySelector(\'script[src="\'+url+\'"]\')){');
            scripts.push('      var s=document.createElement("script");');
            scripts.push('      s.src=url;s.onload=cb||function(){};s.onerror=cb||function(){};');
            scripts.push('      document.head.appendChild(s);');
            scripts.push('    }else if(cb){cb();}');
            scripts.push('  }');
            
            // 加载 KaTeX CSS（用于独立 HTML 中的公式渲染）
            scripts.push('  function loadKaTeXForStandalone(){');
            scripts.push('    var bp=detectBasePath();');
            // 已经在页面中通过 link 标签加载过吗？
            scripts.push('    if(document.querySelector(\'link[href*="katex.min.css"]\')) return;');
            // 尝试从 editormd.js 所在目录的 lib/katex/ 加载
            scripts.push('    loadCSS(bp+"lib/katex/katex.min.css");');
            scripts.push('  }');
            
            // ECharts 初始化
            scripts.push('  function initECharts(container,callback){');
            scripts.push('    if(!container||container.length===0){if(callback)callback();return;}');
            scripts.push('    var $charts=container.find(".editormd-echarts");');
            scripts.push('    if($charts.length===0){if(callback)callback();return;}');
            // 重置 data-initialized 标记（HTML 来自编辑器已初始化过的预览）
            scripts.push('    $charts.removeAttr("data-initialized");');
            scripts.push('    function doInit(){');
            scripts.push('      $charts.each(function(){');
            scripts.push('        var $c=$(this);');
            scripts.push('        if($c.attr("data-initialized")==="true") return;');
            scripts.push('        if($c.is(":hidden")||$c.width()===0||$c.height()===0) return;');
            scripts.push('        var config={};');
            scripts.push('        try{config=JSON.parse($c.attr("data-config"));}catch(e){return;}');
            scripts.push('        var ch=echarts.init(this);');
            scripts.push('        var opt={title:config.title||{},tooltip:config.tooltip||{trigger:"axis"},legend:config.legend||{},radar:config.radar||{},series:config.series||[]};');
            scripts.push('        var t=config.type||(config.series&&config.series[0]&&config.series[0].type)||"";');
            scripts.push('        var noAxis=["pie","funnel","gauge","graph","treemap","sunburst"];');
            scripts.push('        if(noAxis.indexOf(t)===-1){opt.xAxis=config.xAxis||{};opt.yAxis=config.yAxis||{};}');
            scripts.push('        ch.setOption(opt);');
            scripts.push('        $c.attr("data-initialized","true");');
            scripts.push('        $(window).on("resize.echarts-standalone",function(){ch.resize();});');
            scripts.push('      });');
            scripts.push('    }');
            scripts.push('    if(typeof echarts==="undefined"){');
            scripts.push('      var bp=detectBasePath();');
            scripts.push('      loadScript(bp+"lib/echarts.min.js",function(){setTimeout(doInit,100);if(callback)callback();});');
            scripts.push('    }else{doInit();if(callback)callback();}');
            scripts.push('  }');
            
            scripts.push('  function getViewport(){var d=document,e=d.documentElement;return{w:Math.max(e.clientWidth,window.innerWidth||0),h:Math.max(e.clientHeight,window.innerHeight||0),sl:window.pageXOffset||e.scrollLeft||0,st:window.pageYOffset||e.scrollTop||0};}');
            scripts.push('  function initTooltips(container){');
            scripts.push('    if(!container||container.length===0) return;');
            // 清理旧的 popup，避免 DOM 碎片累积
            scripts.push('    $(".editormd-tooltip-popup").not(":has(+ script)").remove();');
            // 重置 tooltip 初始化标记
            scripts.push('    container.find(".editormd-tooltip-trigger").removeAttr("data-tooltip-init");');
            scripts.push('    container.find(".editormd-tooltip-trigger").each(function(){');
            scripts.push('      var $t=$(this);');
            scripts.push('      if($t.attr("data-tooltip-init")==="1") return;');
            scripts.push('      var c=$t.attr("data-tooltip");');
            scripts.push('      var ty=$t.attr("data-tooltip-type")||"text";');
            scripts.push('      var w=$t.attr("data-tooltip-width")||"";');
            scripts.push('      var h=$t.attr("data-tooltip-height")||"";');
            scripts.push('      if(!c) return;');
            scripts.push('      var html="";');
            scripts.push('      if(ty==="image"){');
            scripts.push('        var imgStyle="display:none;";');
            scripts.push('        if(w) imgStyle+="width:"+w+"px;max-width:"+w+"px;";else imgStyle+="max-width:340px;";');
            scripts.push('        if(h) imgStyle+="height:"+h+"px;max-height:"+h+"px;";else imgStyle+="max-height:220px;";');
            scripts.push('        if(w||h) imgStyle+="object-fit:contain;";');
            scripts.push('        html=\'<div class="editormd-tooltip-loading"><span>加载中...</span></div><img src="\'+c+\'" alt="" onload="$(this).prev().hide();$(this).show();" onerror="$(this).prev().html(\\\'<span>图片加载失败</span>\\\');" style="\'+imgStyle+\'">\';');
            scripts.push('      }');
            scripts.push('      else if(ty==="iframe"){');
            scripts.push('        var iframeStyle="display:none;";');
            scripts.push('        if(w) iframeStyle+="width:"+w+"px;max-width:"+w+"px;";else iframeStyle+="width:340px;";');
            scripts.push('        if(h) iframeStyle+="height:"+h+"px;max-height:"+h+"px;";else iframeStyle+="height:210px;";');
            scripts.push('        html=\'<div class="editormd-tooltip-loading"><span>加载中...</span></div><iframe src="\'+c+\'" frameborder="0" onload="$(this).prev().hide();$(this).show();" style="\'+iframeStyle+\'"></iframe>\';');
            scripts.push('      }');
            scripts.push('      else if(ty==="html"||ty==="html-selector"){');
            scripts.push('        var sel=c;');
            scripts.push('        var $el=$(sel);');
            scripts.push('        if($el.length){');
            scripts.push('          var $c=$el.clone();');
            scripts.push('          $c.css({display:"block",visibility:"visible",opacity:"1",position:"relative",maxWidth:"100%",maxHeight:"300px",overflow:"auto"});');
            scripts.push('          html=\'<div class="editormd-tooltip-html-content">\'+$c[0].outerHTML+\'</div>\';');
            scripts.push('        }else{');
            scripts.push('          html=\'<div class="editormd-tooltip-html-content" style="color:#ff6b6b;padding:10px;font-size:12px;">未找到元素: <code>\'+sel+\'</code></div>\';');
            scripts.push('        }');
            scripts.push('      }');
            scripts.push('      else html=\'<div class="editormd-tooltip-text-content">\'+c+\'</div>\';');
            scripts.push('      var arrow=\'<div class="editormd-tooltip-arrow"></div>\';');
            scripts.push('      var $p=$(\'<div class="editormd-tooltip-popup editormd-tooltip-\'+ty+\'" role="tooltip" aria-hidden="true">\'+html+arrow+\'</div>\');');
            // ★★★ 应用可选的宽度和高度（同时覆盖 max-width/max-height 防止 CSS 限制）
            scripts.push('      if(w){$p.css({width:w+"px","max-width":w+"px"});$p.find("img,iframe,div.editormd-tooltip-text-content,div.editormd-tooltip-html-content").css("max-width",w+"px");}');
            scripts.push('      if(h){$p.css({height:h+"px","max-height":h+"px"});$p.find("img,iframe,div.editormd-tooltip-text-content,div.editormd-tooltip-html-content").css("max-height",h+"px");}');
            scripts.push('      $("body").append($p);');
            scripts.push('      var showTimer=null,hideTimer=null;');
            scripts.push('      var show=function(){clearTimeout(hideTimer);clearTimeout(showTimer);');
            scripts.push('        showTimer=setTimeout(function(){');
            scripts.push('          $p.css({display:"block",visibility:"hidden"});');
            scripts.push('          var pw=$p.outerWidth();var ph=$p.outerHeight();');
            scripts.push('          var tw=$t.outerWidth();var th=$t.outerHeight();');
            // 使用 getBoundingClientRect 获取视口相对坐标（适配 position:fixed）
            scripts.push('          var r=$t[0].getBoundingClientRect();');
            scripts.push('          var l=r.left+(tw/2)-(pw/2);');
            scripts.push('          var tp=r.top-ph-10;');
            scripts.push('          var vp=getViewport();');
            scripts.push('          var arrowPos="bottom";');
            scripts.push('          if(tp<10){tp=r.bottom+10;arrowPos="top";if(tp+ph>vp.h-10) tp=vp.h-ph-10;}');
            scripts.push('          if(l<10) l=10;');
            scripts.push('          if(l+pw>vp.w-10) l=vp.w-pw-10;');
            scripts.push('          $p.removeClass("editormd-tooltip-arrow-top editormd-tooltip-arrow-bottom");');
            scripts.push('          $p.addClass("editormd-tooltip-arrow-"+arrowPos);');
            scripts.push('          $p.css({left:l + "px",top:tp + "px",display:"block",visibility:"visible"}).addClass("show").attr("aria-hidden","false");');
            scripts.push('        },150);');
            scripts.push('      };');
            scripts.push('      var hide=function(){clearTimeout(showTimer);clearTimeout(hideTimer);');
            scripts.push('        hideTimer=setTimeout(function(){');
            scripts.push('          $p.removeClass("show").attr("aria-hidden","true");');
            scripts.push('          setTimeout(function(){if(!$p.hasClass("show")) $p.css({display:"none"});},220);');
            scripts.push('        },200);');
            scripts.push('      };');
            scripts.push('      $t.on("mouseenter",show).on("mouseleave",hide);');
            scripts.push('      $t.on("focus",show).on("blur",hide);');
            scripts.push('      $p.on("mouseenter",function(){clearTimeout(hideTimer);clearTimeout(showTimer);}).on("mouseleave",function(){hide();});');
            scripts.push('      $t.on("click",function(e){if("ontouchstart" in window||navigator.maxTouchPoints){e.preventDefault();$p.hasClass("show")?hide():show();}});');
            scripts.push('      $(document).on("click.tooltip",function(e){if(!$(e.target).closest(".editormd-tooltip-trigger, .editormd-tooltip-popup").length) hide();});');
            scripts.push('      $(document).on("keydown.tooltip",function(e){if(e.key==="Escape"&&$p.hasClass("show")){e.preventDefault();hide();}});');
            scripts.push('      $t.attr("data-tooltip-init","1");');
            scripts.push('    });');
            scripts.push('  }');
            
            // 修复：重置 data-initialized 标记后初始化 Tabs
            scripts.push('  function initTabs(container){');
            scripts.push('    container.find(".editormd-tabs").each(function(){');
            scripts.push('      var $tb=$(this);');
            // 重要：重置 data-initialized 标记（编辑器预览输出时已标记为 true）
            scripts.push('      $tb.removeAttr("data-initialized");');
            scripts.push('      if($tb.attr("data-initialized")==="true") return;');
            scripts.push('      var $n=$tb.find(">.editormd-tab-nav");');
            scripts.push('      var $b=$tb.find(">.editormd-tab-body");');
            // 移除旧的点击事件（防止重复绑定）
            scripts.push('      $n.off("click",">li");');
            scripts.push('      $n.on("click",">li",function(e){e.preventDefault();e.stopPropagation();');
            scripts.push('        var $li=$(this),idx=$li.attr("data-index");');
            scripts.push('        $n.find(">li").removeClass("active");$li.addClass("active");');
            scripts.push('        $b.find(">.editormd-tab-panel").removeClass("active");');
            scripts.push('        $b.find(\'>.editormd-tab-panel[data-index="\'+idx+\'"]\').addClass("active");');
            scripts.push('      });');
            scripts.push('      $tb.attr("data-initialized","true");');
            scripts.push('    });');
            scripts.push('  }');
            
            // 初始化多栏布局分隔线（Columns）
            scripts.push('  function initColumns(container){');
            scripts.push('    if(!container||container.length===0) return;');
            scripts.push('    container.find(".editormd-columns").each(function(){');
            scripts.push('      var $c=$(this);');
            scripts.push('      if($c.attr("data-initialized")==="true") return;');
            scripts.push('      var count=parseInt($c.attr("data-count"),10)||2;');
            scripts.push('      $c.find(".editormd-column-divider").remove();');
            scripts.push('      $c.css("position","relative");');
            scripts.push('      for(var i=1;i<count;i++){');
            scripts.push('        $c.append(\'<div class="editormd-column-divider" style="position:absolute;top:8px;bottom:8px;width:0;transform:translateX(-50%);border-left:1px dashed #bbb;pointer-events:none;z-index:1;" data-colidx="\'+i+\'"></div>\');');
            scripts.push('      }');
            scripts.push('      $c.attr("data-initialized","true");');
            scripts.push('    });');
            scripts.push('  }');
            
            scripts.push('  function initCodeCopy(container){');
            scripts.push('    if(!container||container.length===0) return;');
            scripts.push('    container.find("pre").each(function(){');
            scripts.push('      var $pre=$(this);');
            scripts.push('      if($pre.data("_copyBtnReady")) return;');
            scripts.push('      $pre.data("_copyBtnReady",true);');
            scripts.push('      if($pre.css("position")==="static") $pre.css("position","relative");');
            // Store original code text at creation time for reliable copy
            scripts.push('      if($pre.data("_originalCode")===undefined){var $c=$pre.find("code");if($c.length) $pre.data("_originalCode",$c.text());}');
            scripts.push('      var $btn=$("<span>").addClass("editormd-code-copy-btn").text("复制").attr("title","复制");');
            scripts.push('      $btn.on("click",function(e){');
            scripts.push('        e.stopPropagation();e.preventDefault();');
            scripts.push('        if($btn.hasClass("copied")||$btn.hasClass("failed")) return;');
            scripts.push('        var code=$pre.data("_originalCode");if(!code){var $c=$pre.find("code");code=$c.length?$c.text():$pre.clone().find(".editormd-code-copy-btn").remove().end().text();}');
            scripts.push('        var done=function(s){');
            scripts.push('          $btn.removeClass("copied failed").addClass(s?"copied":"failed").text(s?"已复制":"复制失败");');
            scripts.push('          clearTimeout($btn.data("_timer"));');
            scripts.push('          $btn.data("_timer",setTimeout(function(){$btn.removeClass("copied failed").text("复制");},2500));};');
            scripts.push('        if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(code).then(function(){done(true);}).catch(function(){done(false);});}');
            scripts.push('        else{var t=document.createElement("textarea");t.value=code;t.style.position="fixed";t.style.left="-9999px";document.body.appendChild(t);t.select();try{done(document.execCommand("copy"));}catch(e){done(false);}document.body.removeChild(t);}');
            scripts.push('      });');
            scripts.push('      $pre.append($btn);');
            scripts.push('    });');
            scripts.push('  }');
            
            // DOM Ready — 按顺序初始化所有交互组件
            scripts.push('  $(function(){');
            scripts.push('    var $c=$(".editormd-html-preview");');
            scripts.push('    if($c.length){');
            // 加载 KaTeX CSS（用于公式渲染）
            scripts.push('      loadKaTeXForStandalone();');
            // 初始化不需要外部库的组件
            scripts.push('      initTooltips($c);');
            scripts.push('      initTabs($c);');
            scripts.push('      initColumns($c);');
            scripts.push('      initCodeCopy($c);');
            // ECharts 异步加载（需要外部 echarts.min.js）
            scripts.push('      initECharts($c);');
            scripts.push('    }');
            scripts.push('  });');
            scripts.push('})();');
            
            return scripts.join('\n');
        },
        
        /**
         * getHTML()的别名，向后兼容
         * 
         * @returns {String} 返回HTML源码
         */
        
        getTextareaSavedHTML : function() {
            return this.getHTML();
        },
        
        /**
         * 获取预览窗口的 HTML 源码
         * 支持 options.wrap 参数决定是否包裹为完整 HTML 文档
         * Get previewed HTML from preview container
         * 
         * @param   {Object}  [options={}]  配置选项
         * @param   {Boolean} options.wrap           是否包裹为完整 HTML（默认 false）
         * @param   {Boolean} options.includeStyles  是否内联样式（默认 true，仅 wrap=true 时生效）
         * @param   {Boolean} options.includeScripts 是否内联脚本（默认 true，仅 wrap=true 时生效）
         * @param   {String}  options.title          页面标题
         * @param   {String}  options.lang           语言（默认 "zh"）
         * @returns {String}                返回预览区 HTML 源码
         */
        /**
         * 获取预览区渲染后的 HTML 内容
         * 支持多种输出模式：内容片段、完整页面、原始 Markdown
         *
         * @param {Object}   [options={}]
         * @param {Boolean}  [options.includeStyles=true]  是否内联核心样式
         * @param {Boolean}  [options.includeScripts=true] 是否内联交互脚本
         * @param {Boolean}  [options.fullPage=false]       是否输出完整 HTML 页面（含 DOCTYPE/head/body）
         * @param {Boolean}  [options.rawMarkdown=false]   是否返回原始 Markdown 而非渲染后的 HTML
         * @param {String}   [options.title="Preview"]   fullPage 模式下的页面标题
         * @param {String}   [options.description=""] 页面描述（fullPage 模式）
         * @param {String}   [options.author=""] 页面作者（fullPage 模式）
         * @param {String}   [options.keywords=""] 页面关键词（fullPage 模式）
         * @param {Array}    [options.externalStyles=[]] 外部样式表链接数组
         * @param {Array}    [options.externalScripts=[]] 外部脚本链接数组
         * @param {String}   [options.lang="zh-CN"] HTML lang 属性（fullPage 模式）
         * @param {Boolean}  [options.minify=false] 是否压缩输出
         * @param {Boolean}  [options.includeTOC=false] 是否包含目录
         * @param {Boolean}  [options.includeLineNumbers=false] 是否包含行号（用于调试）
         * @returns {String} HTML 字符串
         */
        getPreviewedHTML : function(options) {
            var opts = $.extend({
                includeStyles      : true,
                includeScripts     : true,
                fullPage           : false,
                rawMarkdown        : false,
                title              : "Preview",
                description        : "",
                author             : "",
                keywords           : "",
                externalStyles     : [],
                externalScripts    : [],
                lang               : "zh-CN",
                minify             : false,
                includeTOC         : false,
                includeLineNumbers : false
            }, options || {});

            // 如果只需要原始 Markdown，直接返回
            if (opts.rawMarkdown) {
                return this.getMarkdown();
            }

            var rawHTML = "";
            var markdownText = this.getMarkdown();
            var settings = this.settings;
            
            // ★ 策略：当需要内联样式/脚本时，始终从 Markdown 完整重渲染，
            // 确保输出是干净的、不依赖外部 CSS/JS 的独立 HTML。
            // 纯内容片段（不含样式脚本）则使用预览区缓存以提升性能。
            var forceRender = opts.includeStyles || opts.includeScripts || opts.fullPage || opts.includeTOC;
            
            if (this.previewContainer && !forceRender) {
                // 快速路径：直接从预览区取内容（不含样式/脚本的模式）
                rawHTML = this.previewContainer.html();
            } else if (markdownText) {
                // 完整渲染管线：从 Markdown 出发经过全部处理步骤
                var rendererOptions = this._buildRendererOptions(settings, {
                    toc: opts.includeTOC, 
                    tocm: opts.includeTOC
                });
                var markedOptions = {
                    renderer: editormd.markedRenderer([], rendererOptions),
                    gfm: settings.gfm, tables: true, breaks: true,
                    pedantic: false, sanitize: false,
                    smartLists: true, smartypants: true
                };
                var markdownProtected3 = editormd.protectTeXSyntax(markdownText);
                var mdPreprocess = editormd.preprocessMarkdownBlocks(markdownProtected3, rendererOptions);
                rawHTML = editormd.$marked(mdPreprocess.markdown, markedOptions);
                rawHTML = editormd.restorePlaceholders(rawHTML, mdPreprocess.placeholders);
                rawHTML = editormd.restoreTeXSyntax(rawHTML);
                rawHTML = editormd.fixSmartypantsHTML(rawHTML);
                if (settings.taskList) rawHTML = editormd.postProcessTaskLists(rawHTML);
                rawHTML = editormd.filterHTMLTags(rawHTML, settings.htmlDecode);
            }

            // 构建内联样式和脚本
            var inlineStyles = "";
            var inlineScripts = "";
            if (opts.includeStyles) {
                inlineStyles = this._getCoreStyles();
            }
            if (opts.includeScripts) {
                inlineScripts = this._getInitScripts();
            }

            // 内容片段
            var contentHTML = "";
            if (opts.includeStyles && inlineStyles) {
                contentHTML += '<style>\n' + inlineStyles + '\n</style>\n';
            }
            
            // ★ 添加外部样式表
            if (Array.isArray(opts.externalStyles)) {
                opts.externalStyles.forEach(function(styleUrl) {
                    if (styleUrl && typeof styleUrl === 'string') {
                        contentHTML += '<link rel="stylesheet" href="' + editormd.escapeAttr(styleUrl) + '">\n';
                    }
                });
            }
            
            contentHTML += '<div class="markdown-body editormd-html-preview">\n';
            contentHTML += '  ' + (rawHTML || "") + '\n';
            contentHTML += '</div>';
            
            // ★ 添加外部脚本
            if (Array.isArray(opts.externalScripts)) {
                opts.externalScripts.forEach(function(scriptUrl) {
                    if (scriptUrl && typeof scriptUrl === 'string') {
                        contentHTML += '\n<script src="' + editormd.escapeAttr(scriptUrl) + '"><\/script>';
                    }
                });
            }
            
            if (opts.includeScripts && inlineScripts) {
                contentHTML += '\n<script>\n' + inlineScripts + '\n<\/script>';
            }

            // 如果要求完整页面，包裹 DOCTYPE/html/head/body
            if (opts.fullPage) {
                var fullHTML = '<!DOCTYPE html>\n';
                fullHTML += '<html lang="' + opts.lang + '">\n';
                fullHTML += '<head>\n';
                fullHTML += '  <meta charset="UTF-8">\n';
                fullHTML += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
                
                // ★ 添加 SEO meta 标签
                if (opts.description) {
                    fullHTML += '  <meta name="description" content="' + editormd.escapeAttr(opts.description) + '">\n';
                }
                if (opts.author) {
                    fullHTML += '  <meta name="author" content="' + editormd.escapeAttr(opts.author) + '">\n';
                }
                if (opts.keywords) {
                    fullHTML += '  <meta name="keywords" content="' + editormd.escapeAttr(opts.keywords) + '">\n';
                }
                
                fullHTML += '  <title>' + editormd.escapeHTML(opts.title) + '</title>\n';
                fullHTML += '</head>\n';
                fullHTML += '<body>\n';
                fullHTML += contentHTML + '\n';
                fullHTML += '</body>\n';
                fullHTML += '</html>';
                
                // ★ 压缩输出
                if (opts.minify) {
                    fullHTML = fullHTML.replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n');
                }
                
                return fullHTML;
            }

            // ★ 压缩输出
            if (opts.minify) {
                contentHTML = contentHTML.replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n');
            }

            return contentHTML;
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
            
            this.timer = 0;
            
            this.save().resize();
            
            if (!settings.onwatch)
            {
                settings.onwatch = callback || function() {};
            }
            
            settings.onwatch.call(this);
            
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
            
            settings.onunwatch.call(this);
            
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
                callback.call(_this);
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
                callback.call(_this);
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
            
            if (codeMirror.css("display") === "none") // 使用 css("display") 替代 is(":hidden") 以兼容 Zepto
            {
                this.state.preview = true;

                if (this.state.fullscreen) {
                    preview.css("background", "#fff");
                }
                
                editor.find("." + this.classPrefix + "preview-close-btn").show().on(editormd.mouseOrTouch("click", "touchend"), function(){
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
                    settings.onpreviewing.call(this);
                }

                // 使用命名空间绑定 ESC 事件（Shift+ESC 退出预览模式）
                $(document).on("keyup.editormd-preview", function(event) {
                    if (event.shiftKey && event.keyCode === 27) {
                        _this.previewed();
                    }
                });
            } 
            else 
            {
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

            // 移除 ESC 键监听（使用命名空间精确解绑）
            $(document).off("keyup.editormd-preview");
            
            this.codeMirror.show();
            
            if (settings.toolbar) {
                toolbar.show();
            }
            
            preview[(settings.watch) ? "show" : "hide"]();
            
            previewCloseBtn.hide().off(editormd.mouseOrTouch("click", "touchend"));
                
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
                settings.onpreviewed.call(this);
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

            if (!editor.hasClass(fullscreenClass)) 
            {
                state.fullscreen = true;

                // 保存当前尺寸，用于退出时恢复
                editor.data("oldWidth", editor.width()).data("oldHeight", editor.height());

                $("html,body").css("overflow", "hidden");
                
                // 添加 fullscreen CSS class（CSS 中已用 !important 控制尺寸）
                editor.addClass(fullscreenClass);

                this.resize();
    
                settings.onfullscreen.call(this);

                // 使用命名空间绑定 ESC 事件，便于精确解绑
                $(document).on("keyup.editormd-fs", function(event) {
                    if (!event.shiftKey && event.keyCode === 27) 
                    {
                        if (_this.state.fullscreen)
                        {
                            _this.fullscreenExit();
                        }
                    }
                });
            }
            else
            {           
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
            
            // 移除 ESC 键监听（使用命名空间精确解绑）
            $(document).off("keyup.editormd-fs");
            
            if (toolbar) {
                toolbar.find(".fa[name=fullscreen]").parent().removeClass("active"); 
            }

            $("html,body").css("overflow", "");

            // 恢复保存的原始尺寸
            var oldWidth = editor.data("oldWidth");
            var oldHeight = editor.data("oldHeight");
            if (oldWidth || oldHeight) {
                editor.css({
                    width    : oldWidth || "",
                    height   : oldHeight || ""
                });
            } else {
                editor.css({
                    width    : "",
                    height   : ""
                });
            }
            editor.removeClass(fullscreenClass);

            this.resize();
            
            settings.onfullscreenExit.call(this);

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
                    editormd.notify("插件未找到：" + name + "，请确认已加载此插件", "error");
                    
                    return this;
                }
                
                try {
                    this[name](cm);
                } catch(e) {
                    editormd.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                    if (typeof console !== "undefined" && console.error) {
                        console.error("[xfEditor] Plugin error:", name, e);
                    }
                }
                
                return this;
            }
            
            if ($.inArray(path, editormd.loadFiles.plugin) < 0)
            {
                editormd.loadPlugin(path, function() {
                    if (typeof _this[name] !== "function") {
                        editormd.notify("插件加载失败：" + name + "，请检查插件路径", "error");
                        return;
                    }
                    editormd.loadPlugins[name] = _this[name];
                    try {
                        _this[name](cm);
                    } catch(e) {
                        editormd.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                        if (typeof console !== "undefined" && console.error) {
                            console.error("[xfEditor] Plugin error:", name, e);
                        }
                    }
                });
            }
            else
            {
                if (typeof editormd.loadPlugins[name] !== "function") {
                    editormd.notify("插件未就绪：" + name + "，请检查插件文件", "error");
                    return this;
                }
                try {
                    editormd.loadPlugins[name].call(this, cm);
                } catch(e) {
                    editormd.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                    if (typeof console !== "undefined" && console.error) {
                        console.error("[xfEditor] Plugin error:", name, e);
                    }
                }
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
                editormd.notify("请启用搜索替换功能：settings.searchReplace = true", "warning");
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
            
            // 移除已存在的颜色选择面板
            $(".editormd-color-picker-panel").remove();
            $(document).off("mousedown.editormd-colorpicker");
            
            // 常用颜色：2行×4列，前7个为预设颜色，第8个为自定义选择器
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
            
            // 第8个为自定义颜色方块
            panelHTML.push(
                '<div class="editormd-color-picker-swatch editormd-color-picker-custom" title="自定义颜色">',
                '<div class="editormd-color-picker-plus-bg"></div>',
                '<span class="editormd-color-picker-plus">+</span>',
                '</div>'
            );
            
            panelHTML.push('</div>');
            
            // 隐藏的自定义颜色区域
            var lang = _this.settings.lang;
            panelHTML.push('<div class="editormd-color-picker-custom-area" style="display:none;">');
            panelHTML.push('<button type="button" class="editormd-color-picker-back">&larr; ' + (lang.buttons.close || "返回") + '</button>');
            panelHTML.push('<input type="color" class="editormd-color-picker-native" value="#ff0000" style="display:none;">');
            panelHTML.push('<div class="editormd-color-picker-hex-row">');
            panelHTML.push('<input type="text" class="editormd-color-picker-hex-input" maxlength="7" placeholder="#000000">');
            panelHTML.push('<button class="editormd-color-picker-confirm">' + (lang.buttons.confirm || "确认") + '</button>');
            panelHTML.push('</div>');
            panelHTML.push('</div>');
            
            panelHTML.push('</div>');
            
            var $panel = $(panelHTML.join(""));
            
            // 相对于工具栏按钮定位
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
            
            // 保存上下文信息用于应用颜色
            this._colorPickerSelection = this.cm.getSelection();
            this._colorPickerType = type;
            
            // 预设颜色块点击
            $panel.on("click", ".editormd-color-picker-swatch:not(.editormd-color-picker-custom)", function() {
                var color = $(this).data("color");
                _this.applyColor(color);
                $panel.remove();
                $(document).off("mousedown.editormd-colorpicker");
            });
            
            // 自定义颜色选择器点击
            $panel.on("click", ".editormd-color-picker-custom", function() {
                $panel.find(".editormd-color-picker-grid").hide();
                $panel.find(".editormd-color-picker-title").hide();
                $panel.find(".editormd-color-picker-custom-area").show();
                $panel.find(".editormd-color-picker-native").trigger("click");
            });
            
            // 返回按钮
            $panel.on("click", ".editormd-color-picker-back", function() {
                $panel.find(".editormd-color-picker-grid").show();
                $panel.find(".editormd-color-picker-title").show();
                $panel.find(".editormd-color-picker-custom-area").hide();
            });
            
            // 原生颜色选择器值变化
            $panel.on("input change", ".editormd-color-picker-native", function() {
                var val = $(this).val();
                $panel.find(".editormd-color-picker-hex-input").val(val);
            });
            
            // 16进制颜色值输入校验
            $panel.on("input", ".editormd-color-picker-hex-input", function() {
                var input = $(this);
                var val = input.val();
                if (val && val.charAt(0) !== "#") {
                    val = "#" + val;
                }
                val = val.replace(/[^#0-9a-fA-F]/g, "").substring(0, 7);
                input.val(val);
            });
            
            // 确认按钮
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
            
            // 点击面板外部时关闭
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
            // 校验颜色值安全（仅允许 hex 或 rgb/rgba 格式）
            var safeColor = /^(#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\()/i.test(colorVal || "") ? colorVal.replace(/[^#0-9a-fA-Frgbahsl(),.% ]/g, "") : "#000000";
            // 对选中内容做 HTML 转义，防止破坏标签结构
            var safeSelection = (selection || "文字").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            cm.replaceSelection('<span style="' + styleAttr + ':' + safeColor + '">' + safeSelection + '</span>');
            this._colorPickerSelection = null;
            cm.focus();
        },

        /**
         * 销毁编辑器实例，清理所有资源
         * Destroy editor instance and clean up all resources
         * 
         * @returns {editormd} 返回editormd实例对象
         */
        destroy : function() {
            var editor    = this.editor;
            var settings  = this.settings;
            var classPrefix = this.classPrefix;

            // 1. 清除所有定时器
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            if (this.flowchartTimer) {
                clearTimeout(this.flowchartTimer);
                this.flowchartTimer = null;
            }
            if (this.draftTimer) {
                clearInterval(this.draftTimer);
                this.draftTimer = null;
            }

            // 2. 解绑所有文档级事件（editormd 命名空间）
            $(document).off("click.editormd-table");
            $(document).off("mousemove.editormd-img mouseup.editormd-img");
            $(document).off("keydown.editormdDraft");
            $(document).off("mousedown.editormd-colorpicker");
            $(document).off("keyup.editormd-fs keyup.editormd-preview");

            // 3. 解绑所有窗口 resize 事件（命名空间）
            $(window).off("resize.editormd-echarts");
            $(window).off("resize.editormd-echarts-md");
            $(window).off("resize.editormdDraft");
            $(window).off("scroll.editormd-autofixed");
            $(window).off("keydown.editormd-fkeys");
            $(window).off("resize.editormd-dialog");
            // 解绑通用 resize（可能影响其他实例， 
            // 但对于匿名处理器这是最优解）
            $(window).off("resize");

            // 解绑未命名空间的全局文档事件
            $(document).off("click.editormd-dropdown");
            $(document).off("click.tooltip keydown.tooltip");
            
            // 解绑同步滚动事件（始终绑定的 scroll 事件）
            if (this.codeMirror) {
                this.codeMirror.find(".CodeMirror-scroll").off(".editormd-sync");
            }
            if (this.preview) {
                this.preview.off(".editormd-sync");
            }
            
            
            // 4. 如果处于全屏状态则退出全屏
            if (this.state.fullscreen) {
                this.fullscreenExit();
            }

            // 5. 销毁 CodeMirror 并恢复原始 textarea
            if (this.cm) {
                var cmElement = $(this.cm.getWrapperElement());
                this.cm.toTextArea();
                cmElement.remove();
                this.cm = null;
                this.codeEditor = null;
                this.codeMirrorElement = null;
            }

            // 6. 移除 editormd 相关的 DOM 元素
            editor.find("." + classPrefix + "preview-close-btn").remove();
            editor.find("." + classPrefix + "html-textarea").remove();
            editor.find("." + classPrefix + "preview").remove();
            editor.find("." + classPrefix + "container-mask").remove();
            editor.find("." + classPrefix + "mask").remove();
            editor.find("." + classPrefix + "toolbar").remove();

            // 恢复原始 textarea 的可见性
            this.markdownTextarea.show().removeAttr("style");

            // 7. 移除 editormd 相关的 CSS 类名
            editor.removeClass("editormd " + classPrefix + "vertical");
            if (settings.theme) {
                editor.removeClass(classPrefix + "theme-" + settings.theme);
            }

            // 8. 重置编辑器状态
            this.state.watching    = false;
            this.state.loaded      = false;
            this.state.preview     = false;
            this.state.fullscreen  = false;

            // 9. 清除引用以辅助垃圾回收
            this.toolbar         = null;
            this.preview         = null;
            this.previewContainer = null;
            this.mask            = null;
            this.containerMask   = null;
            this.htmlTextarea    = null;

            return this;
        },

        /**
         * 动态切换编辑器语言（运行时）
         * Dynamically switch editor language at runtime
         * 
         * @param   {Object|String} langObj  语言对象 或 语言名称 (如 "en", "zh-cn", "zh-tw")
         * @param   {Boolean}       [recreateToolbar=true]  是否重建工具栏以刷新 tooltip
         * @returns {editormd}                返回 editormd 实例对象
         * 
         * 使用示例：
         *   editor.setLang("en");                    // 切换到内置英文
         *   editor.setLang({name: "fr", toolbar: {...}, ...});  // 使用自定义语言包
         */
        setLang : function(langObj, recreateToolbar) {
            var settings = this.settings;
            
            // 如果传入字符串（语言名称），则尝试从 editormd.langs 获取
            if (typeof langObj === "string") {
                var langName = langObj;
                if (editormd.langs && editormd.langs[langName]) {
                    langObj = editormd.langs[langName];
                } else {
                    // 仅切换内置语言名称，工具栏等文本不改变
                    settings.lang.name = langName;
                    return this;
                }
            }
            
            // 合并语言包到当前设置
            if (langObj && typeof langObj === "object") {
                $.extend(true, settings.lang, langObj);
            }
            
            // 确保 this.lang 和 settings.lang 指向同一对象
            this.lang = settings.lang;
            
            // 重新构建工具栏以刷新 tooltip 文本
            if (recreateToolbar !== false && settings.toolbar && this.toolbar) {
                this.setToolbar();
            }
            
            return this;
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
                editormd.notify("请启用 TeX 公式支持：settings.tex = true", "warning");
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
                editormd.notify("请启用分页符功能：settings.pageBreak = true", "warning");
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
                cm.replaceSelection("[悬浮文本](tooltip:text:这里是悬浮提示内容)<100,50>");
                cm.setCursor(cursor.line, cursor.ch + 6);
            } else {
                cm.replaceSelection("[" + selection + "](tooltip:text:请在这里输入提示内容)");
            }
        },

        color : function() {
            this.showColorPicker("color");
        },

        "bg-color" : function() {
            this.showColorPicker("bg-color");
        },

        /**
         * 插入公式：弹出公式示例面板，用户点击后插入对应 LaTeX 公式
         */
        formula : function() {
            var _this       = this;
            var cm          = this.cm;
            var settings     = this.settings;
            var lang        = settings.lang;
            var cursor      = cm.getCursor();
            var classPrefix = this.classPrefix;

            // ★ 如果 KaTeX 未加载，先自动加载再打开弹窗
            if (!editormd.kaTeXLoaded) {
                if (settings.autoLoadModules) {
                    editormd.loadKaTeX(settings.path, function() {
                        if (typeof katex !== "undefined") {
                            editormd.$katex = katex;
                            editormd.kaTeXLoaded = true;
                        }
                        // 递归调用自己，此时 KaTeX 已就绪
                        editormd.toolbarHandlers.formula.call(_this);
                    });
                }
                return;
            }

            // 公式分类和示例（涵盖各种复杂场景）
            var katexAvail = (typeof editormd.$katex !== "undefined" && editormd.$katex !== null);
            var formulaCategories = [
                {
                    name: "基础运算",
                    icon: "fa-asterisk",
                    formulas: [
                        { name: "分式", latex: "\\frac{a}{b}" },
                        { name: "连分数", latex: "\\cfrac{1}{a_1 + \\cfrac{1}{a_2 + \\cfrac{1}{a_3}}}" },
                        { name: "上标", latex: "x^{n}" },
                        { name: "下标", latex: "x_{i}" },
                        { name: "上下标", latex: "x_{i}^{n}" },
                        { name: "平方根", latex: "\\sqrt{x}" },
                        { name: "立方根", latex: "\\sqrt[3]{x}" },
                        { name: "嵌套根", latex: "\\sqrt{x^{2}+y^{2}}" },
                        { name: "求和", latex: "\\sum_{i=1}^{n} x_i" },
                        { name: "无穷求和", latex: "\\sum\\limits_{i=1}^{\\infty} a_i" },
                        { name: "乘积", latex: "\\prod_{i=1}^{n} x_i" },
                        { name: "并积", latex: "\\coprod_{i=1}^{n} x_i" },
                        { name: "二项式系数", latex: "\\binom{n}{k}" },
                        { name: "绝对值", latex: "|x|" },
                        { name: "范数", latex: "\\lVert x \\rVert" }
                    ]
                },
                {
                    name: "微积分",
                    icon: "fa-calculator",
                    formulas: [
                        { name: "定积分", latex: "\\int_{a}^{b} f(x) \\, dx" },
                        { name: "不定积分", latex: "\\int f(x) \\, dx" },
                        { name: "二重积分", latex: "\\iint_{D} f(x,y) \\, dA" },
                        { name: "三重积分", latex: "\\iiint_{E} f(x,y,z) \\, dV" },
                        { name: "环路积分", latex: "\\oint_{C} F \\cdot dr" },
                        { name: "偏导数", latex: "\\frac{\\partial f}{\\partial x}" },
                        { name: "混合偏导", latex: "\\frac{\\partial^2 f}{\\partial x \\partial y}" },
                        { name: "极限", latex: "\\lim_{x \\to \\infty} f(x)" },
                        { name: "导数定义", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}" },
                        { name: "梯度", latex: "\\nabla f(x,y)" },
                        { name: "拉普拉斯", latex: "\\nabla^2 f = \\frac{\\partial^2}{\\partial x^2} + \\frac{\\partial^2}{\\partial y^2}" }
                    ]
                },
                {
                    name: "线性代数",
                    icon: "fa-table",
                    formulas: [
                        { name: "2x2矩阵", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", block: true },
                        { name: "3x3矩阵", latex: "\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}", block: true },
                        { name: "行列式", latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}", block: true },
                        { name: "向量", latex: "\\vec{v} = (x, y, z)" },
                        { name: "单位向量", latex: "\\hat{v}" },
                        { name: "点积", latex: "\\vec{a} \\cdot \\vec{b}" },
                        { name: "叉积", latex: "\\vec{a} \\times \\vec{b}" },
                        { name: "特征值方程", latex: "A\\vec{v} = \\lambda \\vec{v}" },
                        { name: "逆矩阵", latex: "A^{-1}" },
                        { name: "迹", latex: "\\operatorname{Tr}(A) = \\sum_{i} a_{ii}" }
                    ]
                },
                {
                    name: "三角函数",
                    icon: "fa-circle-o",
                    formulas: [
                        { name: "正弦", latex: "\\sin \\theta" },
                        { name: "余弦", latex: "\\cos \\theta" },
                        { name: "正切", latex: "\\tan \\theta" },
                        { name: "反正弦", latex: "\\arcsin x" },
                        { name: "反余弦", latex: "\\arccos x" },
                        { name: "反正切", latex: "\\arctan x" },
                        { name: "双曲正弦", latex: "\\sinh x" },
                        { name: "双曲余弦", latex: "\\cosh x" },
                        { name: "恒等式", latex: "\\sin^2 \\theta + \\cos^2 \\theta = 1" },
                        { name: "和角公式", latex: "\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta" },
                        { name: "倍角公式", latex: "\\sin 2\\theta = 2\\sin\\theta\\cos\\theta" }
                    ]
                },
                {
                    name: "概率统计",
                    icon: "fa-bar-chart",
                    formulas: [
                        { name: "期望值", latex: "E[X] = \\sum_{i} x_i P(x_i)" },
                        { name: "连续期望", latex: "E[X] = \\int_{-\\infty}^{\\infty} x f(x) dx" },
                        { name: "方差", latex: "\\operatorname{Var}(X) = E[(X-\\mu)^2]" },
                        { name: "标准差", latex: "\\sigma" },
                        { name: "正态分布", latex: "f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}" },
                        { name: "协方差", latex: "\\operatorname{Cov}(X,Y)=E[(X-\\mu_X)(Y-\\mu_Y)]" },
                        { name: "条件概率", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}" },
                        { name: "贝叶斯定理", latex: "P(A|B)=\\frac{P(B|A)P(A)}{P(B)}" },
                        { name: "二项分布", latex: "P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}" },
                        { name: "泊松分布", latex: "P(X=k)=\\frac{\\lambda^k e^{-\\lambda}}{k!}" }
                    ]
                },
                {
                    name: "集合论",
                    icon: "fa-th",
                    formulas: [
                        { name: "属于", latex: "x \\in A" },
                        { name: "不属于", latex: "x \\notin A" },
                        { name: "子集", latex: "A \\subset B" },
                        { name: "真子集", latex: "A \\subsetneq B" },
                        { name: "超集", latex: "A \\supset B" },
                        { name: "交集", latex: "A \\cap B" },
                        { name: "并集", latex: "A \\cup B" },
                        { name: "空集", latex: "\\emptyset" },
                        { name: "全集", latex: "\\mathbb{U}" },
                        { name: "补集", latex: "A^{c}" },
                        { name: "差集", latex: "A \\setminus B" },
                        { name: "笛卡尔积", latex: "A \\times B" }
                    ]
                },
                {
                    name: "逻辑推理",
                    icon: "fa-code-fork",
                    formulas: [
                        { name: "蕴含", latex: "P \\Rightarrow Q" },
                        { name: "等价", latex: "P \\Leftrightarrow Q" },
                        { name: "全称量词", latex: "\\forall x \\in \\mathbb{R}" },
                        { name: "存在量词", latex: "\\exists x" },
                        { name: "唯一存在", latex: "\\exists! x" },
                        { name: "合取", latex: "P \\land Q" },
                        { name: "析取", latex: "P \\lor Q" },
                        { name: "否定", latex: "\\neg P" },
                        { name: "因此", latex: "\\therefore" },
                        { name: "因为", latex: "\\because" }
                    ]
                },
                {
                    name: "希腊字母",
                    icon: "fa-font",
                    formulas: [
                        { name: "α Alpha", latex: "\\alpha" },
                        { name: "β Beta", latex: "\\beta" },
                        { name: "γ Gamma", latex: "\\gamma" },
                        { name: "Γ 大写Gamma", latex: "\\Gamma" },
                        { name: "δ Delta", latex: "\\delta" },
                        { name: "Δ 大写Delta", latex: "\\Delta" },
                        { name: "ε Epsilon", latex: "\\epsilon" },
                        { name: "ζ Zeta", latex: "\\zeta" },
                        { name: "η Eta", latex: "\\eta" },
                        { name: "θ Theta", latex: "\\theta" },
                        { name: "Θ 大写Theta", latex: "\\Theta" },
                        { name: "λ Lambda", latex: "\\lambda" },
                        { name: "Λ 大写Lambda", latex: "\\Lambda" },
                        { name: "μ Mu", latex: "\\mu" },
                        { name: "π Pi", latex: "\\pi" },
                        { name: "Π 大写Pi", latex: "\\Pi" },
                        { name: "ρ Rho", latex: "\\rho" },
                        { name: "σ Sigma", latex: "\\sigma" },
                        { name: "Σ 大写Sigma", latex: "\\Sigma" },
                        { name: "τ Tau", latex: "\\tau" },
                        { name: "φ Phi", latex: "\\phi" },
                        { name: "Φ 大写Phi", latex: "\\Phi" },
                        { name: "ω Omega", latex: "\\omega" },
                        { name: "Ω 大写Omega", latex: "\\Omega" }
                    ]
                },
                {
                    name: "箭头与关系",
                    icon: "fa-arrows-h",
                    formulas: [
                        { name: "右箭头", latex: "\\rightarrow" },
                        { name: "左箭头", latex: "\\leftarrow" },
                        { name: "双向箭头", latex: "\\leftrightarrow" },
                        { name: "长右箭头", latex: "\\longrightarrow" },
                        { name: "映射", latex: "f: X \\mapsto Y" },
                        { name: "大于等于", latex: "x \\geq y" },
                        { name: "小于等于", latex: "x \\leq y" },
                        { name: "不等于", latex: "x \\neq y" },
                        { name: "约等于", latex: "x \\approx y" },
                        { name: "正比于", latex: "F \\propto x" },
                        { name: "偏序", latex: "a \\preceq b" }
                    ]
                },
                {
                    name: "括号与分隔符",
                    icon: "fa-code",
                    formulas: [
                        { name: "圆括号(自适应)", latex: "\\left( \\frac{a}{b} \\right)" },
                        { name: "方括号(自适应)", latex: "\\left[ \\frac{a}{b} \\right]" },
                        { name: "花括号(自适应)", latex: "\\left\\{ \\frac{a}{b} \\right\\}" },
                        { name: "角括号", latex: "\\langle x \\rangle" },
                        { name: "上取整", latex: "\\lceil x \\rceil" },
                        { name: "下取整", latex: "\\lfloor x \\rfloor" },
                        { name: "分段函数", latex: "f(x)=\\begin{cases} x^2 & x>0 \\\\ 0 & x=0 \\\\ -x^2 & x<0 \\end{cases}", block: true },
                        { name: "方程组", latex: "\\left\\{\\begin{aligned} x+y &= 5 \\\\ x-y &= 1 \\end{aligned}\\right.", block: true }
                    ]
                },
                {
                    name: "数论与特殊函数",
                    icon: "fa-signal",
                    formulas: [
                        { name: "自然对数", latex: "\\ln x" },
                        { name: "以2为底对数", latex: "\\log_2 x" },
                        { name: "常用对数", latex: "\\lg x" },
                        { name: "指数函数", latex: "e^{i\\theta}" },
                        { name: "欧拉公式", latex: "e^{i\\pi} + 1 = 0" },
                        { name: "自然常数", latex: "\\mathbb{e}" },
                        { name: "虚数单位", latex: "\\mathbb{i}" },
                        { name: "实数集", latex: "\\mathbb{R}" },
                        { name: "自然数集", latex: "\\mathbb{N}" },
                        { name: "整数集", latex: "\\mathbb{Z}" },
                        { name: "复数集", latex: "\\mathbb{C}" },
                        { name: "有理数集", latex: "\\mathbb{Q}" },
                        { name: "阶乘", latex: "n!" },
                        { name: "同余", latex: "a \\equiv b \\pmod{n}" }
                    ]
                }
            ];

            // 创建弹窗HTML（Tab导航 + 分类面板 + 自定义输入）
            var dialogHTML = '<div class="' + classPrefix + 'formula-dialog">';
            
            // Tab 导航栏
            dialogHTML += '<div class="' + classPrefix + 'formula-tabs">';
            for (var ci = 0; ci < formulaCategories.length; ci++) {
                var cat = formulaCategories[ci];
                var actCls = (ci === 0) ? ' active' : '';
                dialogHTML += '<span class="' + classPrefix + 'formula-tab' + actCls + '" data-cat="' + ci + '">';
                dialogHTML += '<i class="fa ' + cat.icon + '"></i>' + cat.name + '</span>';
            }
            dialogHTML += '</div>';

            // 分类内容面板
            dialogHTML += '<div class="' + classPrefix + 'formula-content">';
            for (var ci2 = 0; ci2 < formulaCategories.length; ci2++) {
                var cat2 = formulaCategories[ci2];
                var panelStyle = (ci2 === 0) ? ' style="display:block;"' : ' style="display:none;"';
                dialogHTML += '<div class="' + classPrefix + 'formula-category-panel" data-cat="' + ci2 + '"' + panelStyle + '>';
                dialogHTML += '<div class="' + classPrefix + 'formula-grid">';
                for (var fi = 0; fi < cat2.formulas.length; fi++) {
                    var f = cat2.formulas[fi];
                    // HTML 属性 + KaTeX 容器统一使用完整 HTML 实体转义
                    // jQuery .text() / DOM textContent 会自动解码回原始字符，KaTeX 得到正确的 LaTeX
                    var escLatex = f.latex.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    var blockAttr = f.block ? ' data-block="1"' : '';
                    dialogHTML += '<div class="' + classPrefix + 'formula-item" data-latex="' + escLatex + '"' + blockAttr + ' title="' + escLatex + '">';
                    dialogHTML += '<div class="' + classPrefix + 'formula-katex-container">' + escLatex + '</div>';
                    dialogHTML += '<div class="' + classPrefix + 'formula-name">' + f.name + '</div>';
                    dialogHTML += '</div>';
                }
                dialogHTML += '</div></div>';
            }
            dialogHTML += '</div>'; // .formula-content

            // 底部：模式切换 + 自定义公式
            dialogHTML += '<div class="' + classPrefix + 'formula-footer">';
            dialogHTML += '<div class="' + classPrefix + 'formula-mode-toggle">';
            dialogHTML += '<label class="' + classPrefix + 'formula-radio">';
            dialogHTML += '<input type="radio" name="' + classPrefix + 'formulaMode" value="inline" checked /> 行内($)</label>';
            dialogHTML += '<label class="' + classPrefix + 'formula-radio">';
            dialogHTML += '<input type="radio" name="' + classPrefix + 'formulaMode" value="block" /> 块级($$)</label>';
            dialogHTML += '</div>';
            dialogHTML += '<div class="' + classPrefix + 'formula-custom">';
            dialogHTML += '<input type="text" class="' + classPrefix + 'formula-custom-input" placeholder="输入 LaTeX 公式..." />';
            dialogHTML += '<button type="button" class="' + classPrefix + 'formula-custom-btn">插入</button>';
            dialogHTML += '</div>';
            dialogHTML += '</div>';
            dialogHTML += '</div>'; // .formula-dialog

            // ===== 确保每次打开公式弹窗都是全新状态 =====
            // createDialog 每次 append 新 HTML，不会删除旧 DOM。
            // 若不清理，第二次打开时选择器会拿到旧的已渲染 DOM，导致公式预览显示为 KaTeX HTML 而不是 LaTeX。
            var dialogName = classPrefix + "formula-dialog";
            _this.editor.find("." + dialogName).remove();
            
            // 创建对话框（捕获返回的 dialog 对象，它附带了 lockScreen/hideMask 等方法）
            var $dialog = editormd.createDialog.call(_this, {
                name       : dialogName,
                title      : lang.toolbar.formula || "插入公式",
                width      : 900,
                height     : 600,
                content    : dialogHTML,
                lockScreen : true,
                mask       : true,
                drag       : true,
                buttons    : false,
                overlay    : {
                    show        : true,
                    color       : "#fff",
                    opacity     : 0.1
                }
            });
            var $formulaItems = $dialog.find("." + classPrefix + "formula-item");
            var $customInput = $dialog.find("." + classPrefix + "formula-custom-input");
            var $customBtn = $dialog.find("." + classPrefix + "formula-custom-btn");
            var $tabs = $dialog.find("." + classPrefix + "formula-tab");
            var $panels = $dialog.find("." + classPrefix + "formula-category-panel");
            var $katexContainers = $dialog.find("." + classPrefix + "formula-katex-container");

            // ===== 延迟 + 按需渲染 KaTeX 预览 =====
            // 仅初始渲染第一个（当前激活）Tab 的公式，其他 Tab 在切换时按需渲染
            var renderedTabs = {};
            
            function renderPanelFormulas(panel) {
                var $p = $(panel);
                var catIdx = $p.data("cat");
                if (renderedTabs[catIdx]) return;
                renderedTabs[catIdx] = true;
                // 使用 requestAnimationFrame 批量渲染，避免阻塞 UI
                var $containers = $p.find("." + classPrefix + "formula-katex-container");
                var i = 0;
                function renderBatch() {
                    var batchEnd = Math.min(i + 6, $containers.length);
                    for (; i < batchEnd; i++) {
                        var $el = $containers.eq(i);
                        var latexText = $el.text();
                        if (!latexText) continue;
                        // 根据公式的 block 属性决定 displayMode，块级公式（矩阵、行列式等）需要 displayMode: true
                        var $item = $el.closest("." + classPrefix + "formula-item");
                        var isBlock = $item.length && $item.data("block") == "1";
                        try {
                            editormd.$katex.render(latexText, $el[0], { throwOnError: false, displayMode: isBlock });
                        } catch(e) {
                            if (window.console) console.error("KaTeX render error:", e);
                        }
                    }
                    if (i < $containers.length) {
                        requestAnimationFrame(renderBatch);
                    }
                }
                requestAnimationFrame(renderBatch);
            }
            
            // 延迟 30ms 后开始渲染首屏公式（让弹窗先显示出来）
            if (katexAvail) {
                setTimeout(function() {
                    var firstPanel = $panels.filter(":visible").first();
                    if (firstPanel.length) renderPanelFormulas(firstPanel[0]);
                }, 30);
            }

            // Tab 切换 — 按需渲染
            $tabs.off("click").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var catIdx = $(this).data("cat");
                $tabs.removeClass("active");
                $(this).addClass("active");
                $panels.hide();
                var $targetPanel = $dialog.find('.' + classPrefix + 'formula-category-panel[data-cat="' + catIdx + '"]').show();
                // 切换 Tab 时按需渲染该面板的公式
                if (katexAvail && $targetPanel.length) {
                    setTimeout(function() { renderPanelFormulas($targetPanel[0]); }, 20);
                }
            });

            // 获取当前插入模式
            function getFormulaMode() {
                return $dialog.find('input[name="' + classPrefix + 'formulaMode"]:checked').val() || "inline";
            }

            // 点击公式项 → 插入并自动关闭弹窗
            $formulaItems.off("click").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                var latex = $(this).data("latex"); // data() 自动解码 HTML 实体
                var isBlockMode = getFormulaMode() === "block";
                var hasBlockData = $(this).data("block") == "1";
                var useBlock = isBlockMode || hasBlockData;
                var isBlockSyntax = latex && (latex.indexOf("\\begin") !== -1 || latex.indexOf("\\end") !== -1);
                var toInsert;
                if (useBlock || isBlockSyntax) {
                    toInsert = isBlockSyntax ? "\n$$\n" + latex + "\n$$\n" : "$$" + latex + "$$";
                } else {
                    toInsert = "$" + latex + "$";
                }
                cm.replaceSelection(toInsert);
                // 插入后先聚焦编辑器，再关闭弹窗防止卡死
                cm.focus();
                if (settings.watch) { _this.save.call(_this); }
                if ($dialog && typeof $dialog.lockScreen === "function") {
                    $dialog.hide().lockScreen(false).hideMask();
                } else {
                    // 降级方案：直接操作
                    $dialog.hide();
                    editormd.lockScreen(false);
                    _this.mask.hide();
                }
            });

            // 自定义公式插入
            function insertCustom() {
                var customLatex = $customInput.val().trim();
                if (!customLatex) { editormd.notify("请输入 LaTeX 公式", "warning"); return; }
                var isBlockMode = getFormulaMode() === "block";
                var isBlockSyntax = customLatex.indexOf("\\begin") !== -1 || customLatex.indexOf("\\end") !== -1;
                var toInsert = (isBlockMode || isBlockSyntax) ? 
                    (isBlockSyntax ? "\n$$\n" + customLatex + "\n$$\n" : "$$" + customLatex + "$$") :
                    "$" + customLatex + "$";
                cm.replaceSelection(toInsert);
                cm.focus();
                if (settings.watch) { _this.save.call(_this); }
                $customInput.val("");
                // 插入后自动关闭弹窗
                if ($dialog && typeof $dialog.lockScreen === "function") {
                    $dialog.hide().lockScreen(false).hideMask();
                } else {
                    $dialog.hide();
                    editormd.lockScreen(false);
                    _this.mask.hide();
                }
            }
            $customBtn.off("click").on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                insertCustom();
            });
            $customInput.off("keydown").on("keydown", function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    insertCustom();
                }
            });
        },

        /**
         * 插入田字格字帖语法
         */
        "copybook-tian" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n[[copybookTian]]\n(春眠不觉晓)(处处闻啼鸟)\n(夜来风雨声)(花落知多少)\n[[/copybookTian]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入米字格字帖语法
         */
        "copybook-mi" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n[[copybookMi]]\n(春眠不觉晓)(处处闻啼鸟)\n(夜来风雨声)(花落知多少)\n[[/copybookMi]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入拼音格字帖语法（上方四线三格+下方米字格）
         */
        "copybook-pinyin" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n[[copybookPinyin]]\n(春眠不觉晓| chūn mián bù jué xiǎo)(处处闻啼鸟| chù chù wén tí niǎo)\n(夜来风雨声| yè lái fēng yǔ shēng)(花落知多少| huā luò zhī duō shǎo)\n[[/copybookPinyin]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入A3页面语法
         */
        "page-a3" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var selection = cm.getSelection() || "在这里输入A3页面内容";
            cm.replaceSelection("\n[[page:A3]]\n" + selection + "\n[[/page]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入A4页面语法
         */
        "page-a4" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var selection = cm.getSelection() || "在这里输入A4页面内容";
            cm.replaceSelection("\n[[page:A4]]\n" + selection + "\n[[/page]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入A5页面语法
         */
        "page-a5" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var selection = cm.getSelection() || "在这里输入A5页面内容";
            cm.replaceSelection("\n[[page:A5]]\n" + selection + "\n[[/page]]\n");
            cm.setCursor(cursor.line + 2, 0);
        },

        /**
         * 插入流程图语法
         */
        "insert-flowchart" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var flowchartTemplate = '\n```flow\nst=>start: 开始\ne=>end: 结束\nop1=>operation: 操作步骤1\nop2=>operation: 操作步骤2\ncond=>condition: 条件判断?\n\nst->op1->cond\ncond(yes)->op2->e\ncond(no)->op1\n```\n';
            cm.replaceSelection(flowchartTemplate);
            cm.setCursor(cursor.line + 3, 0);
        },

        /**
         * 插入时序图语法
         */
        "insert-sequence" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var sequenceTemplate = '\n```sequence\nAlice->Bob: 你好 Bob\nBob-->Alice: 你好 Alice\nNote right of Bob: 这是备注\nAlice->Bob: 再见\n```\n';
            cm.replaceSelection(sequenceTemplate);
            cm.setCursor(cursor.line + 3, 0);
        },

        /**
         * 插入页面语法（通用）
         */
        "page" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            var selection = cm.getSelection() || "在这里输入页面内容";
            cm.replaceSelection("\n[[page:A4]]\n" + selection + "\n[[/page]]\n");
            cm.setCursor(cursor.line + 2, 0);
        }
    };

    editormd.keyMaps = {
        "Ctrl-1"       : "h1",
        "Ctrl-2"       : "h2",
        "Ctrl-3"       : "h3",
        "Ctrl-4"       : "h4",
        "Ctrl-5"       : "h5",
        "Ctrl-6"       : "h6",
        "Ctrl-B"       : "bold",  // 如果值为字符串，则对应 editormd.toolbarHandlers 中的方法
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
                editormd.notify("请启用 @链接功能：settings.atLink = true", "warning");
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
        
        // 对齐快捷键
        "Ctrl-Alt-L"       : "align-left",      // 左对齐
        "Ctrl-Alt-C"       : "align-center",    // 居中对齐
        "Ctrl-Alt-R"       : "align-right",     // 右对齐
        "Ctrl-Alt-J"       : "align-justify",   // 两端对齐
        
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
        atLink        : /@([\w\-]+)/g,
        email         : /([\w\.\+\-]+)@([\w\-]+)\.([\w\-]{2,})\.?(\w+)?/g,
        emailLink     : /(mailto:)?([\w\.\+\-]+)@([\w\-]+)\.([\w\-]{2,})\.?(\w+)?/g,

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
        copybookTian   : /\[\[copybookTian\]\]/g,
        copybookMi     : /\[\[copybookMi\]\]/g,
        copybookPinyin : /\[\[copybookPinyin\]\]/g,
        copybookTianEnd   : /\[\[\/copybookTian\]\]/g,
        copybookMiEnd     : /\[\[\/copybookMi\]\]/g,
        copybookPinyinEnd : /\[\[\/copybookPinyin\]\]/g,
        videoBlock    : /\[\[video\]\]\s*\n?([\s\S]*?)\n?\s*\[\[\/video\]\]/g,
        fileBlock     : /\[\[file\]\]\s*\n?([\s\S]*?)\n?\s*\[\[\/file\]\]/g,
        tooltipLink   : /\[([^\]]+)\]\(tooltip:([^)]+)\)/gi,
        tooltipImg    : /\{tooltip:([^}]+)\}/gi,
        pageOpen      : /\[\[page:(A\d+|AN|LETTER|LEGAL)(?:\s[^\]]*)?\]\]/gi,
        pageClose     : /\[\[\/page\]\]/gi,
        
        // 上标和下标语法：^文本^ 表示上标，^^文本^^ 表示下标
        // 限制不跨行（[^^\n]）防止贪婪匹配跨越整个文档
        superscript   : /\^([^^\n]+)\^/g,
        subscript     : /\^\^([^^\n]+)\^\^/g,

        // 组合上下标语法：<<下标>^<上标>> 同时显示上标和下标
        // 例如 X<<2>^<3>> 表示 X 的右下角下标 2，右上角上标 3
        supsub        : /<<([^>\n]+)>\^<([^>\n]+)>>/g,
        
        // 字体大小语法：!数字 文本! 表示指定字号，例如 !32 特大号!
        fontSize      : /!(\d+)\s+([^!\n]+)!/g,
        
        // 脚注引用：[^脚注名称]
        footnoteRef   : /\[\^([^\]]+)\]/g,
        // 脚注定义标记：[^脚注名称]:  -- 用于按行定位定义位置
        footnoteDefAnchor : /^\[\^([^\]]+)\]:/gm
    };

    /**
     * Protect LaTeX backslashes inside $...$ and $$...$$ from marked.js escape processing.
     * marked.js treats `\\` as escaped backslash, `\{` as escaped brace, etc.,
     * which corrupts LaTeX commands that rely on these sequences.
     */
    var TEX_BSLASH_PLACEHOLDER = "EDITORMDBSLHPLACEHOLDER7F3A";

    editormd.protectTeXSyntax = function(markdown) {
        if (!markdown) return markdown;

        // Protect $$...$$ blocks first (handles inner $ not being double-matched)
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, function(match, tex) {
            return "$$" + tex.replace(/\\/g, TEX_BSLASH_PLACEHOLDER) + "$$";
        });

        // Protect remaining $...$ inline formulas
        // 只匹配包含 TeX 命令（以反斜杠开头）或 TeX 特殊字符（^、_、{、}等）的内容
        // 避免误匹配货币符号（如 $5.00 或 Cost: $100）
        markdown = markdown.replace(/\$(?=[^$\n\r]{1,200}\$)([^$\n\r]+?)\$/g, function(match, tex) {
            // 只有当内容包含 LaTeX 特征时才保护（反斜杠命令、花括号、下划线、上标等）
            if (/[\\{}_^]/.test(tex)) {
                return "$" + tex.replace(/\\/g, TEX_BSLASH_PLACEHOLDER) + "$";
            }
            return match;
        });

        return markdown;
    };

    editormd.restoreTeXSyntax = function(html) {
        if (!html) return html;
        // Use split/join for better performance than regex on long strings
        return html.split(TEX_BSLASH_PLACEHOLDER).join("\\");
    };

    /**
     * 修复 marked.js smartypants 导致的 HTML 标签引号弯化问题
     * smartypants 会把 ASCII 双引号 " 转为弯引号 "（U+201C/U+201D），
     * 单引号 ' 转为弯引号 '（U+2018/U+2019），这会破坏 HTML 属性值。
     * 此函数在所有 HTML 标签内将弯引号还原为 ASCII 直引号。
     *
     * @param {string} html  marked.js 渲染后的 HTML 字符串
     * @returns {string}     修复后的 HTML 字符串
     */
    editormd.fixSmartypantsHTML = function(html) {
        if (!html) return html;
        return html.replace(/<[^>]+>/g, function(tag) {
            return tag.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
        });
    };

    /**
     * Post-process HTML to convert task list markers ([ ] / [x]) into proper
     * checkbox HTML.  This runs after marked has finished rendering, so it is
     * immune to any inline transformations marked may have applied.
     *
     * @param {string} html  marked.js 渲染后的 HTML 字符串
     * @returns {string}     转换后的 HTML 字符串
     */
    editormd.postProcessTaskLists = function(html) {
        if (!html) return html;

        // Pattern 1: <li>[ ] rest     → task-list-item with unchecked checkbox
        html = html.replace(
            /<li>\s*\[\s\]\s+/g,
            '<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" /> '
        );

        // Pattern 2: <li>[x] rest     → task-list-item with checked checkbox
        html = html.replace(
            /<li>\s*\[x\]\s+/gi,
            '<li class="task-list-item"><input type="checkbox" class="task-list-item-checkbox" checked disabled /> '
        );

        // Pattern 3: <li><p>[ ] rest  → task-list-item with <p> and unchecked checkbox
        html = html.replace(
            /<li>\s*<p>\s*\[\s\]\s+/g,
            '<li class="task-list-item"><p><input type="checkbox" class="task-list-item-checkbox" /> '
        );

        // Pattern 4: <li><p>[x] rest  → task-list-item with <p> and checked checkbox
        html = html.replace(
            /<li>\s*<p>\s*\[x\]\s+/gi,
            '<li class="task-list-item"><p><input type="checkbox" class="task-list-item-checkbox" checked disabled /> '
        );

        return html;
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
                pageBlock: disableBlocks ? false : opts.pageBlock,
                tooltip: opts.tooltip,
                copybook: opts.copybook
            };
            return {
                renderer: editormd.markedRenderer([], ro),
                gfm: true, tables: true, breaks: true,
                pedantic: false, sanitize: false,
                smartLists: true, smartypants: true
            };
        }

        /**
         * 保护代码区域：将围栏代码块和行内代码替换为占位符，
         * 防止 [[columns]] / [[tabs]] / [[video]] / [[file]] 等语法
         * 在代码块内被错误解析。
         */
        function protectCodeBlocks(text) {
            var codePlaceholders = [];
            var cid = 0;

            /**
             * 保护围栏代码块：支持 ``` 和 ~~~，支持任意数量的反引号/波浪号作为分隔符
             * 规则：开标签是 3 个或更多 ` 或 ~，闭标签必须与开标签相同数量的相同字符
             * 支持代码块内包含任意内容（包括嵌套的 [[tabs]]、[[columns]] 等）
             */
            // 匹配围栏代码块：开标签(3+个 ` 或 ~), 可选语言名, 内容, 闭标签(同类型且 >= 开标签数量)
            // 支持 CommonMark 规范：闭合围栏可以多于开启围栏（如 4 个反引号开启、6 个闭合）
            // 使用回调验证闭合围栏与开启围栏类型相同且数量足够
            // 使用 lookahead 确保闭合围栏在独立行上（后跟空白和换行或文档结束）
            text = text.replace(/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n(`{3,}|~{3,})(?=\s*(?:\n|$))/g, function(match, openFence, lang, content, closeFence) {
                // 闭合围栏必须与开启围栏类型相同，且数量 >= 开启围栏数量
                if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) {
                    return match; // 不是有效的闭合围栏，保持原样
                }
                var id = "editormd-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "<!--" + id + "-->";
            });

            /**
             * 保护行内代码：支持单反引号 `code` 和多反引号 ``code``
             * 规则：开标签是 1 个或多个 `，闭标签必须是相同数量的 `
             * 行内代码不能跨行（Markdown 规范）
             */
            // 先处理多反引号行内代码（2+ 个反引号），再处理单反引号
            // 多反引号：``code`` 或 ```code```
            text = text.replace(/(`{2,})([\s\S]*?)\1/g, function(match, fence, content) {
                // 确保不是围栏代码块（围栏代码块已经处理了，这里只处理真正的行内代码）
                // 行内代码不能包含换行符
                if (content.indexOf('\n') !== -1) return match;
                var id = "editormd-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "<!--" + id + "-->";
            });
            // 单反引号行内代码：`code`（不能跨行，不能包含 `）
            text = text.replace(/`([^`\n]+)`/g, function(match, content) {
                var id = "editormd-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "<!--" + id + "-->";
            });

            return { text: text, placeholders: codePlaceholders };
        }

        function restoreCodeBlocks(text, codePlaceholders) {
            for (var i = 0; i < codePlaceholders.length; i++) {
                var cp = codePlaceholders[i];
                text = text.split("<!--" + cp.id + "-->").join(cp.html);
            }
            return text;
        }

        // 在处理块级语法之前先保护代码区域
        var codeProtection = protectCodeBlocks(markdown);
        markdown = codeProtection.text;

        /**
         * 在文本中查找所有平衡块（支持嵌套）
         * 从指定位置开始查找开标签，然后计数嵌套深度来找到匹配的闭标签。
         *
         * @param {string} text       搜索文本
         * @param {RegExp} openRegex  开标签正则（如 /\[\[tabs\]\]/g）
         * @param {RegExp} closeRegex 闭标签正则（如 /\[\[\/tabs\]\]/g）
         * @returns {Array<{start:number, end:number, content:string}>}
         */
        function findBalancedBlocks(text, openRegex, closeRegex) {
            var blocks = [];
            var i = 0;
            var openMatch, closeMatch;

            // 边界检查：确保参数有效
            if (!text || typeof text !== 'string') {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] findBalancedBlocks: Invalid text parameter");
                }
                return blocks;
            }
            if (!openRegex || !closeRegex) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] findBalancedBlocks: Missing regex parameters");
                }
                return blocks;
            }

            // 克隆正则以保证 lastIndex 独立
            try {
                var openRe = new RegExp(openRegex.source, openRegex.flags.replace('g', '') + 'g');
                var closeRe = new RegExp(closeRegex.source, closeRegex.flags.replace('g', '') + 'g');
            } catch(e) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] findBalancedBlocks: Invalid regex:", e);
                }
                return blocks;
            }

            // 辅助函数：判断从指定位置开始是否真的存在匹配的闭标签对
            // 用于验证嵌套语法是否有效（避免将普通文本中的 [[columns:3]] 误判为嵌套）
            // 添加 recursionDepth 参数防止无限递归（限制最大嵌套层数为 20）
            function hasMatchingPair(fromPos, recursionDepth) {
                if (recursionDepth === undefined) recursionDepth = 0;
                if (recursionDepth > 20) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Maximum nesting depth (20) exceeded");
                    }
                    return false; // 防止过多嵌套导致栈溢出
                }
                
                var tmpOpen = new RegExp(openRegex.source, openRegex.flags.replace('g', '') + 'g');
                var tmpClose = new RegExp(closeRegex.source, closeRegex.flags.replace('g', '') + 'g');
                var tmpDepth = 1;
                var tmpPos = fromPos;
                tmpOpen.lastIndex = tmpPos;
                tmpClose.lastIndex = tmpPos;
                var tmpCloseMatch;
                while (tmpDepth > 0 && (tmpCloseMatch = tmpClose.exec(text)) !== null) {
                    tmpOpen.lastIndex = tmpPos;
                    var tmpOpenMatch;
                    while ((tmpOpenMatch = tmpOpen.exec(text)) !== null && tmpOpenMatch.index < tmpCloseMatch.index) {
                        // 对每个嵌套的开标签，验证它是否有对应的闭标签
                        if (hasMatchingPair(tmpOpen.lastIndex, recursionDepth + 1)) {
                            tmpDepth++;
                            tmpPos = tmpOpen.lastIndex;
                            tmpOpen.lastIndex = tmpPos;
                        } else {
                            // 这个伪嵌套开标签没有对应闭标签，不增加 depth
                            // 将 tmpOpen.lastIndex 设置为 tmpOpenMatch 之后，跳过它
                            tmpPos = tmpOpenMatch.index + 1;
                            tmpOpen.lastIndex = tmpPos;
                        }
                    }
                    tmpDepth--;
                    if (tmpDepth > 0) {
                        tmpPos = tmpClose.lastIndex;
                        tmpClose.lastIndex = tmpPos;
                    }
                }
                return tmpDepth === 0;
            }

            // 安全检查：限制最大处理长度，防止超长文本导致性能问题
            var maxProcessLength = 1000000; // 100万字符上限
            if (text.length > maxProcessLength) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] Text length exceeds safety limit, truncating");
                }
                text = text.substring(0, maxProcessLength);
            }

            while (i < text.length) {
                openRe.lastIndex = i;
                try {
                    openMatch = openRe.exec(text);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Regex execution error:", e);
                    }
                    break;
                }
                if (!openMatch) break;

                var openEnd = openRe.lastIndex;

                // 预检查：从当前位置开始是否真的能匹配对应的闭标签
                // 避免孤立开标签（如普通文本中的 [[columns:3]] 没有对应 [[/columns]]）
                if (!hasMatchingPair(openEnd)) {
                    i = openEnd;
                    continue;
                }

                var depth = 1;
                var searchPos = openEnd;

                // 查找匹配的闭标签
                closeRe.lastIndex = searchPos;
                while (depth > 0 && (closeMatch = closeRe.exec(text)) !== null) {
                    // 检查在闭标签之前是否有嵌套的开标签
                    openRe.lastIndex = searchPos;
                    var nestedOpen;
                    while ((nestedOpen = openRe.exec(text)) !== null && nestedOpen.index < closeMatch.index) {
                        // 验证这个嵌套开标签是否有对应的闭标签
                        if (hasMatchingPair(openRe.lastIndex, 0)) {
                            depth++;
                            searchPos = openRe.lastIndex;
                            openRe.lastIndex = searchPos;
                        } else {
                            // 伪嵌套：这个 [[columns:N]] 或 [[tabs]] 没有对应的闭标签
                            // 不增加 depth，直接跳过
                            searchPos = nestedOpen.index + 1;
                            openRe.lastIndex = searchPos;
                        }
                    }
                    depth--;
                    if (depth > 0) {
                        searchPos = closeRe.lastIndex;
                        closeRe.lastIndex = searchPos;
                    }
                }

                if (depth === 0) {
                    // 找到匹配的闭标签
                    var content = text.substring(openEnd, closeMatch.index);
                    blocks.push({
                        start: openMatch.index,
                        end: closeRe.lastIndex,
                        content: content,
                        fullMatch: text.substring(openMatch.index, closeRe.lastIndex)
                    });
                    i = closeRe.lastIndex;
                } else {
                    // 未找到匹配的闭标签，跳过此开标签
                    i = openEnd;
                }
            }

            return blocks;
        }

        // 将新的图片/视频尺寸语法转换为内联 HTML 以兼容 marked 渲染器
        if (options.imageResize !== false) {
            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            try {
                markdown = markdown.replace(editormd.regexs.imageSizeNew, function(match, alt, url, w, h) {
                    // 边界检查：确保参数有效
                    if (!url) return match;
                    
                    var style = "";
                    // 验证尺寸参数
                    if (w && !isNaN(parseInt(w, 10)) && parseInt(w, 10) > 0) {
                        style += "width:" + parseInt(w, 10) + "px;";
                    }
                    if (h && !isNaN(parseInt(h, 10)) && parseInt(h, 10) > 0) {
                        style += "height:" + parseInt(h, 10) + "px;";
                    }
                    var styleAttr = style ? ' style="' + style + '"' : "";
                    
                    // XSS 防护：转义特殊字符
                    var safeAlt = (alt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
                    var safeUrl = editormd.escapeAttr(url);
                    
                    if (videoExts.test(safeUrl)) {
                        return '<video src="' + safeUrl + '" controls preload="metadata"' + styleAttr + '>' + safeAlt + '</video>';
                    }
                    return '<img src="' + safeUrl + '" alt="' + safeAlt + '"' + styleAttr + '>';
                });
            } catch(e) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] Image resize processing error:", e);
                }
            }
        }

        // 处理转义语法：\[\[ 和 \]\] → 用占位符保护，防止被 tabs/columns 解析
        // 例如 \[\[columns:3\]\] 将显示为普通文本 [[columns:3]]
        var escapePlaceholders = [];
        var escId = 0;
        markdown = markdown.replace(/\\(\[\[|\]\])/g, function(match) {
            var id = "editormd-esc-" + (++escId);
            escapePlaceholders.push({ id: id, html: match.substring(1) }); // 去掉反斜杠
            return "<!--" + id + "-->";
        });

        // 处理标签页语法：[[tabs]]...[[/tabs]]（支持嵌套）
        // 注意：必须逆序处理（从后往前），否则前面的 block 被替换后，
        // 后续 block 的位置（基于原始文本）会错误地偏移
        if (options.tabs !== false) {
            var tabBlocks = findBalancedBlocks(markdown, /\[\[tabs\]\]/g, /\[\[\/tabs\]\]/g);
            for (var bi = tabBlocks.length - 1; bi >= 0; bi--) {
                var block = tabBlocks[bi];
                
                // 边界检查：确保块数据有效
                if (!block || !block.content) continue;
                
                var content = block.content;
                var originalEnd = block.end;
                var tabHtml = '<div class="editormd-tabs">';
                var tabHeaders = '<ul class="editormd-tab-nav">';
                var tabBodies = '<div class="editormd-tab-body">';
                var tabIndex = 0;
                var tabRegex = editormd.regexs.tabItem;
                var tabMatch;
                var hasTabs = false;
                var tabMarkedOptions = createMarkedOptions(options, true);

                try {
                    // 重置 regex lastIndex
                    tabRegex.lastIndex = 0;
                    while ((tabMatch = tabRegex.exec(content)) !== null) {
                        hasTabs = true;
                        var tabTitle = tabMatch[1].trim().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
                        var tabContent = tabMatch[2].trim();
                        // 在递归处理前，先恢复上层保护的代码块占位符，避免 marked 渲染时丢失
                        var tabContentRestored = restoreCodeBlocks(tabContent, codeProtection.placeholders);
                        var preprocessed = editormd.preprocessMarkdownBlocks(tabContentRestored, options);
                        var tabContentHtml = editormd.$marked(preprocessed.markdown, tabMarkedOptions);
                        tabContentHtml = editormd.restorePlaceholders(tabContentHtml, preprocessed.placeholders);

                        var activeClass = (tabIndex === 0) ? ' class="active"' : '';
                        var activeBodyClass = (tabIndex === 0) ? ' class="editormd-tab-panel active"' : ' class="editormd-tab-panel"';
                        tabHeaders += '<li' + activeClass + ' data-index="' + tabIndex + '">' + tabTitle + '</li>';
                        tabBodies += '<div' + activeBodyClass + ' data-index="' + tabIndex + '">' + tabContentHtml + '</div>';
                        tabIndex++;
                        
                        // 安全限制：最多支持 50 个标签页
                        if (tabIndex > 50) {
                            if (typeof console !== "undefined" && console.warn) {
                                console.warn("[xfEditor] Maximum tabs limit (50) exceeded");
                            }
                            break;
                        }
                    }

                    if (!hasTabs) {
                        // 在递归处理前，先恢复上层保护的代码块占位符
                        var contentRestored = restoreCodeBlocks(content.trim(), codeProtection.placeholders);
                        var preprocessed2 = editormd.preprocessMarkdownBlocks(contentRestored, options);
                        var defaultHtml = editormd.$marked(preprocessed2.markdown, tabMarkedOptions);
                        defaultHtml = editormd.restorePlaceholders(defaultHtml, preprocessed2.placeholders);
                        tabHeaders += '<li class="active" data-index="0">Tab1</li>';
                        tabBodies += '<div class="editormd-tab-panel active" data-index="0">' + defaultHtml + '</div>';
                    }

                    tabHeaders += '</ul>';
                    tabBodies += '</div>';
                    tabHtml += tabHeaders + tabBodies + '</div>';

                    var placeholder = addPlaceholder(tabHtml);
                    markdown = markdown.substring(0, block.start) + placeholder + markdown.substring(originalEnd);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Tabs processing error:", e);
                    }
                }
            }
        }

        // 处理多栏布局语法：[[columns:N]]...[[/columns]]（支持嵌套）
        // 注意：同样逆序处理，避免位置偏移问题
        if (options.columns !== false) {
            var colBlocks = findBalancedBlocks(markdown, /\[\[columns:(\d+)\]\]/g, /\[\[\/columns\]\]/g);
            for (var ci = colBlocks.length - 1; ci >= 0; ci--) {
                var colBlock = colBlocks[ci];
                
                // 边界检查：确保块数据有效
                if (!colBlock || !colBlock.fullMatch) continue;
                
                var colMatch = colBlock.fullMatch.match(/\[\[columns:(\d+)\]\]/);
                var colCount = colMatch ? parseInt(colMatch[1], 10) || 3 : 3;
                
                // 验证列数范围
                if (colCount < 1 || colCount > 12) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Invalid column count: " + colCount + ", using default 3");
                    }
                    colCount = Math.max(1, Math.min(12, colCount || 3));
                }
                
                var colContent = colBlock.content;
                var colOriginalEnd = colBlock.end;
                var colMarkedOptions = createMarkedOptions(options, true);
                
                try {
                    // 在递归处理前，先恢复上层保护的代码块占位符，避免 marked 渲染时丢失
                    var colContentRestored = restoreCodeBlocks(colContent.trim(), codeProtection.placeholders);
                    var preprocessed = editormd.preprocessMarkdownBlocks(colContentRestored, options);
                    var colContentHtml = editormd.$marked(preprocessed.markdown, colMarkedOptions);
                    colContentHtml = editormd.restorePlaceholders(colContentHtml, preprocessed.placeholders);
                    var colHtml = '<div class="editormd-columns" data-count="' + colCount + '" style="-webkit-column-count:' + colCount + ';-moz-column-count:' + colCount + ';column-count:' + colCount + ';">' + colContentHtml + '</div>';
                    var colPlaceholder = addPlaceholder(colHtml);
                    markdown = markdown.substring(0, colBlock.start) + colPlaceholder + markdown.substring(colOriginalEnd);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Columns processing error:", e);
                    }
                }
            }
        }

        /**
         * 渲染字帖网格 HTML
         * @param {string} type    字帖类型：tian / mi / pinyin
         * @param {string} content 字帖内容（含括号分组）
         * @returns {string} 渲染后的 HTML
         */
        function renderCopybookGrid(type, content) {
            var lines = content.trim().split('\n');
            var html = '<div class="editormd-copybook editormd-copybook-' + type + '">';
            var isMi = (type === 'mi');
            var isPinyin = (type === 'pinyin');

            for (var li = 0; li < lines.length; li++) {
                var line = lines[li].trim();
                if (!line) continue;

                // 匹配所有 (内容) 分组
                var groups = [];
                var groupRegex = /\(([^)]*)\)/g;
                var gm;
                while ((gm = groupRegex.exec(line)) !== null) {
                    groups.push(gm[1]);
                }
                if (groups.length === 0) continue;

                html += '<div class="editormd-copybook-row">';

                for (var gi = 0; gi < groups.length; gi++) {
                    var groupContent = groups[gi].trim();
                    if (!groupContent) continue;

                    if (isPinyin) {
                        // 拼音格：汉字|拼音 → 上方四线三格 + 下方米字格
                        var parts = groupContent.split('|');
                        var chars = (parts[0] || '').split('');
                        var pinyins = (parts[1] || '').trim().split(/\s+/);

                        for (var ci = 0; ci < chars.length; ci++) {
                            var ch = chars[ci];
                            var py = pinyins[ci] || '';
                            html += '<div class="editormd-copybook-cell editormd-copybook-pinyin-cell">';
                            // 上方拼音四线三格
                            html += '<div class="editormd-copybook-pinyin-top">';
                            html += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="editormd-copybook-svg">';
                            html += '<line x1="2" y1="0" x2="98" y2="0" stroke="#2f7d4a" stroke-width="1.2" opacity="0.9"/>';
                            html += '<line x1="2" y1="30" x2="98" y2="30" stroke="#2f7d4a" stroke-width="1" opacity="0.85"/>';
                            html += '<line x1="2" y1="63" x2="98" y2="63" stroke="#2f7d4a" stroke-width="1" opacity="0.85"/>';
                            html += '<line x1="2" y1="100" x2="98" y2="100" stroke="#2f7d4a" stroke-width="1.2" opacity="0.9"/>';
                            html += '</svg>';
                            html += '<span class="editormd-copybook-pinyin-text">' + py + '</span>';
                            html += '</div>';
                            // 下方米字格汉字
                            html += '<div class="editormd-copybook-pinyin-bottom">';
                            html += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="editormd-copybook-svg">';
                            html += '<line x1="1" y1="1" x2="99" y2="99" stroke="#b8823a" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>';
                            html += '<line x1="99" y1="1" x2="1" y2="99" stroke="#b8823a" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>';
                            html += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c69654" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.6"/>';
                            html += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c69654" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.6"/>';
                            html += '<rect x="1" y="1" width="98" height="98" fill="none" stroke="#a57a42" stroke-width="0.5" opacity="0.5"/>';
                            html += '</svg>';
                            html += '<span class="editormd-copybook-hanzi-text">' + ch + '</span>';
                            html += '</div>';
                            html += '</div>';
                        }
                    } else {
                        // 田字格 / 米字格
                        var chars = groupContent.split('');
                        for (var cj = 0; cj < chars.length; cj++) {
                            var ch2 = chars[cj];
                            html += '<div class="editormd-copybook-cell editormd-copybook-grid-cell">';
                            html += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="editormd-copybook-svg">';
                            if (isMi) {
                                // 米字格：横+竖+两条对角线
                                html += '<line x1="1" y1="1" x2="99" y2="99" stroke="#b8823a" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.65"/>';
                                html += '<line x1="99" y1="1" x2="1" y2="99" stroke="#b8823a" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.65"/>';
                                html += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c69654" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>';
                                html += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c69654" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>';
                                html += '<rect x="1" y="1" width="98" height="98" fill="none" stroke="#a57a42" stroke-width="0.7" opacity="0.55"/>';
                            } else {
                                // 田字格：横+竖
                                html += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c2995b" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.75"/>';
                                html += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c2995b" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.75"/>';
                                html += '<rect x="1" y="1" width="98" height="98" fill="none" stroke="#b58f53" stroke-width="0.7" opacity="0.55"/>';
                            }
                            html += '</svg>';
                            html += '<span class="editormd-copybook-hanzi-text">' + ch2 + '</span>';
                            html += '</div>';
                        }
                    }
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        }

        /**
         * 处理单个字帖块（通用）
         * @param {Array} blocks findBalancedBlocks 返回的块列表
         * @param {string} type   字帖类型
         */
        function processCopybookBlocks(blocks, type) {
            // 边界检查：确保参数有效
            if (!blocks || !blocks.length) return;
            if (!type || !['tian', 'mi', 'pinyin'].includes(type)) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] Invalid copybook type: " + type);
                }
                return;
            }
            
            for (var bi = blocks.length - 1; bi >= 0; bi--) {
                var block = blocks[bi];
                
                // 边界检查：确保块数据有效
                if (!block || !block.content) continue;
                
                try {
                    var html = renderCopybookGrid(type, block.content);
                    var placeholder = addPlaceholder(html);
                    markdown = markdown.substring(0, block.start) + placeholder + markdown.substring(block.end);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Copybook processing error:", e);
                    }
                }
            }
        }

        // 处理字帖语法：[[copybookTian]]...[[/copybookTian]]、[[copybookMi]]...[[/copybookMi]]、[[copybookPinyin]]...[[/copybookPinyin]]
        // 各种字帖类型可以彼此嵌套，也可以嵌套在 tabs/columns 内使用
        if (options.copybook !== false) {
            try {
                processCopybookBlocks(findBalancedBlocks(markdown, editormd.regexs.copybookTian, editormd.regexs.copybookTianEnd), 'tian');
                processCopybookBlocks(findBalancedBlocks(markdown, editormd.regexs.copybookMi, editormd.regexs.copybookMiEnd), 'mi');
                processCopybookBlocks(findBalancedBlocks(markdown, editormd.regexs.copybookPinyin, editormd.regexs.copybookPinyinEnd), 'pinyin');
            } catch(e) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] Copybook blocks processing error:", e);
                }
            }
        }

        // 处理纸张页面语法：[[page:A4]]...[[/page]]、[[page:A5]]...[[/page]]
        // 支持嵌套在 tabs/columns 内，也可以在 page 内嵌套 tabs/columns
        // 纸张尺寸定义（px @ 96dpi）：A4 = 794×1123, A5 = 559×794
        if (options.pageBlock !== false) {
            var pagePaperSizes = {
                "A0": { w: 3179, h: 4494 },
                "A1": { w: 2245, h: 3179 },
                "A2": { w: 1587, h: 2245 },
                "A3": { w: 1123, h: 1587 },
                "A4": { w: 794,  h: 1123 },
                "A5": { w: 559,  h: 794  },
                "A6": { w: 397,  h: 559  },
                "A7": { w: 280,  h: 397  },
                "A8": { w: 198,  h: 280  },
                "AN": { w: 794, h: 1123 },      // AN 纸张（等同于 A4）
                "LETTER": { w: 816, h: 1056 },
                "LEGAL":  { w: 816, h: 1344 }
            };

            var pageBlocks = findBalancedBlocks(markdown, editormd.regexs.pageOpen, editormd.regexs.pageClose);
            for (var pi = pageBlocks.length - 1; pi >= 0; pi--) {
                var pb = pageBlocks[pi];
                
                // 边界检查：确保块数据有效
                if (!pb || !pb.fullMatch) continue;
                
                try {
                    // 支持扩展属性：[[page:A4 header="标题" footer="第 {page} 页 / 共 {total} 页"]]
                    var pageMatch = pb.fullMatch.match(/\[\[page:(A\d+|AN|LETTER|LEGAL)(?:\s+header="([^"]*)")?(?:\s+footer="([^"]*)")?\s*\]\]/i);
                    var paperKey = pageMatch ? pageMatch[1].toUpperCase() : "A4";
                    
                    // 验证纸张类型
                    if (!pagePaperSizes[paperKey]) {
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] Unknown paper size: " + paperKey + ", using A4");
                        }
                        paperKey = "A4";
                    }
                    
                    var pageHeader = pageMatch && pageMatch[2] ? pageMatch[2] : "";
                    var pageFooter = pageMatch && pageMatch[3] ? pageMatch[3] : "";
                    var paperSize = pagePaperSizes[paperKey] || pagePaperSizes["A4"];
                    var pageContent = pb.content;

                    // 递归处理嵌套内容（支持 page 内嵌套 tabs/columns/copybook 等）
                    var pageRestored = restoreCodeBlocks(pageContent, codeProtection.placeholders);
                    var pagePreprocessed = editormd.preprocessMarkdownBlocks(pageRestored, options);
                    var pageMarkedOptions = createMarkedOptions(options, true);
                    var pageContentHtml = editormd.$marked(pagePreprocessed.markdown, pageMarkedOptions);
                    pageContentHtml = editormd.restorePlaceholders(pageContentHtml, pagePreprocessed.placeholders);

                    // 构建页面HTML，包含页头、页脚区域
                    var headerHtml = pageHeader ? '<div class="editormd-page-header">' + pageHeader.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</div>' : '';
                    var footerHtml = pageFooter ? '<div class="editormd-page-footer" data-footer-template="' + pageFooter.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '"></div>' : '';

                    var pageHtml = '<div class="editormd-page-block" data-paper="' + paperKey + '" data-width="' + paperSize.w + '" data-height="' + paperSize.h + '" style="width:' + paperSize.w + 'px;min-height:' + paperSize.h + 'px;">' +
                        headerHtml +
                        '<div class="editormd-page-content">' + pageContentHtml + '</div>' +
                        footerHtml +
                        '<div class="editormd-page-watermark">' + paperKey + '</div>' +
                        '</div>';

                    var pagePlaceholder = addPlaceholder(pageHtml);
                    markdown = markdown.substring(0, pb.start) + pagePlaceholder + markdown.substring(pb.end);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Page block processing error:", e);
                    }
                }
            }
        }

        // 处理视频列表语法：[[video]]...[[/video]]
        try {
            markdown = markdown.replace(editormd.regexs.videoBlock, function(match, content) {
                // 边界检查：确保内容有效
                if (!content || typeof content !== 'string') return match;
                
                var lines = content.trim().split("\n");
                var resultHtml = "";
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    var parts = line.split("|");
                    var url = parts[0].trim();
                    
                    // XSS 防护：验证 URL
                    if (!url || url.length > 2000) continue;
                    
                    var title = parts[1] ? parts[1].trim() : "";
                    resultHtml += '<video src="' + editormd.escapeAttr(url) + '" controls preload="metadata" class="editormd-video-player">' + editormd.escapeHtml(title || "Video") + '</video>';
                    
                    // 安全限制：最多支持 50 个视频
                    if (i >= 49) {
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] Maximum videos limit (50) exceeded");
                        }
                        break;
                    }
                }
                return addPlaceholder(resultHtml);
            });
        } catch(e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] Video block processing error:", e);
            }
        }

        // 处理文件列表语法：[[file]]...[[/file]]
        try {
            markdown = markdown.replace(editormd.regexs.fileBlock, function(match, content) {
                // 边界检查：确保内容有效
                if (!content || typeof content !== 'string') return match;
                
                var lines = content.trim().split("\n");
                var resultHtml = '<div class="editormd-file-list">';
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (!line) continue;
                    var parts = line.split("|");
                    var url = parts[0].trim();
                    
                    // XSS 防护：验证 URL
                    if (!url || url.length > 2000) continue;
                    
                    var name = parts[1] ? parts[1].trim() : url.split("/").pop();
                    var ext = url.split(".").pop().toLowerCase();
                    resultHtml += '<a href="' + url.replace(/"/g, "&quot;") + '" download class="editormd-attachment-link" data-ext="' + ext + '">' + name.replace(/</g,"&lt;").replace(/>/g,"&gt;") + '</a>';
                    
                    // 安全限制：最多支持 100 个文件
                    if (i >= 99) {
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] Maximum files limit (100) exceeded");
                        }
                        break;
                    }
                }
                resultHtml += '</div>';
                return addPlaceholder(resultHtml);
            });
        } catch(e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] File block processing error:", e);
            }
        }


        // ========== 脚注处理（必须在上标/下标之前，避免 [^name] 中的 ^ 被上标正则误匹配）==========
        // 收集脚注定义，然后替换脚注引用
        var footnotes = {};
        var footnoteOrder = [];
        var footnoteIndex = 0;

        try {
            // 第一步：在 markdown 文本中解析脚注定义
            // 定义格式：[^name]: content\n 内容持续到空行（\n\n）或下一个定义或文档结束
            // 此时代码块已被保护为占位符，不会误匹配
            var fnDefRegex = editormd.regexs.footnoteDefAnchor;
            fnDefRegex.lastIndex = 0;
            var defMatches = [];
            var defMatch;

            // 收集所有定义锚点的位置
            while ((defMatch = fnDefRegex.exec(markdown)) !== null) {
                var name = defMatch[1].trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
                if (name && name.length <= 50) {
                    defMatches.push({
                        name: name,
                        start: defMatch.index,
                        anchorEnd: defMatch.index + defMatch[0].length
                    });
                }
            }

            if (defMatches.length > 0) {
                // 第二步：为每个定义计算内容结束位置
                // 内容结束于：下一个 \n\n（空行）、下一个定义起始处、或文档末尾
                for (var di = 0; di < defMatches.length; di++) {
                    var dm = defMatches[di];
                    var contentStart = dm.anchorEnd;

                    // 跳过锚点行后的空白字符（空格、单个换行，但不超过一个换行）
                    var afterAnchor = markdown.substring(contentStart);
                    var leadingWs = afterAnchor.match(/^[ \t]*\n?/);
                    if (leadingWs) {
                        contentStart += leadingWs[0].length;
                    }

                    // 确定内容结束位置
                    var contentEnd;

                    // 1. 查找最近的空行（\n\n）
                    var blankLineIdx = markdown.indexOf('\n\n', contentStart);

                    // 2. 查找下一个脚注定义（如果有）
                    var nextDefIdx = (di + 1 < defMatches.length) ? defMatches[di + 1].start : -1;

                    // 3. 取两者中较小的（或文档末尾）
                    if (blankLineIdx !== -1) {
                        contentEnd = blankLineIdx;
                    } else {
                        contentEnd = markdown.length;
                    }

                    // 如果下一个定义在空行之前，则以定义边界为准
                    if (nextDefIdx !== -1 && nextDefIdx < contentEnd) {
                        contentEnd = nextDefIdx;
                    }

                    // 确保不超出文档边界
                    if (contentEnd > markdown.length) contentEnd = markdown.length;
                    if (contentEnd < contentStart) contentEnd = contentStart;

                    dm.contentEnd = contentEnd;
                    dm.content = markdown.substring(contentStart, contentEnd).trim();
                }


                // 第三步：先从前往后记录所有脚注（保持原始顺序）
                for (var di = 0; di < defMatches.length; di++) {
                    var dm = defMatches[di];
                    if (!footnotes[dm.name]) {
                        footnoteIndex++;
                        footnotes[dm.name] = {
                            index: footnoteIndex,
                            content: dm.content,
                            name: dm.name
                        };
                        footnoteOrder.push(dm.name);
                    }
                }

                // 第四步：从后往前移除定义区域（保持索引正确）
                for (var di = defMatches.length - 1; di >= 0; di--) {
                    var dm = defMatches[di];
                    markdown = markdown.substring(0, dm.start) + markdown.substring(dm.contentEnd);
                }

                // 第五步：替换所有脚注引用为可点击链接
                editormd.regexs.footnoteRef.lastIndex = 0;
                markdown = markdown.replace(editormd.regexs.footnoteRef, function(match, name) {
                    if (!name || name.length > 50) return match;

                    var cleanName = name.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
                    if (!cleanName || !footnotes[cleanName]) {
                        return match;
                    }

                    var fn = footnotes[cleanName];
                    // 使用行内 HTML，与 sup 标签区分；提供完整的锚点跳转
                    return '<sup class="editormd-footnote-ref-wrapper"><a href="#editormd-fn-' + fn.index + '" id="editormd-fnref-' + fn.index + '">[' + fn.index + ']</a></sup>';
                });

                // 第六步：在文档末尾添加脚注列表（紧凑 HTML 避免 marked breaks:true 产生多余 <br>）
                if (footnoteOrder.length > 0) {
                    var footnoteHtml = '\n\n<div class="editormd-footnotes-section">';
                    footnoteHtml += '<hr class="editormd-footnote-sep">';
                    footnoteHtml += '<div class="editormd-footnote-title"><strong>脚注</strong></div>';
                    footnoteHtml += '<ol class="editormd-footnote-list">';

                    for (var fi = 0; fi < footnoteOrder.length; fi++) {
                        var fnName = footnoteOrder[fi];
                        var fn = footnotes[fnName];

                        // 对脚注内容做 XSS 防护和内联 Markdown 处理
                        var fnContent = fn.content;

                        // 0. 先恢复脚注内容中的代码块占位符（行内代码等）
                        // 因为脚注内容是在代码块保护阶段之后提取的，其中可能包含占位符
                        fnContent = restoreCodeBlocks(fnContent, codeProtection.placeholders);

                        // 1. 先转义 < 和 >（主要 XSS 向量）
                        fnContent = fnContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        // 2. 内联 Markdown 转换（代码优先于粗体/斜体，符合标准 Markdown 规范）
                        //    注意：先用占位符保护 <code> 块，避免粗体/斜体正则二次匹配已转换的标签
                        fnContent = fnContent.replace(/`([^`]+)`/g, '<code>$1</code>');
                        var codeBlocks = [];
                        fnContent = fnContent.replace(/<code>[^<]*<\/code>/g, function(m) {
                            codeBlocks.push(m);
                            return '<!--fncode-' + (codeBlocks.length - 1) + '-->';
                        });
                        fnContent = fnContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                        fnContent = fnContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                        // 还原 <code> 块
                        for (var ci = 0; ci < codeBlocks.length; ci++) {
                            fnContent = fnContent.split('<!--fncode-' + ci + '-->').join(codeBlocks[ci]);
                        }
                        // 3. 换行转 <br>（避免 marked.js breaks:true 额外添加）
                        fnContent = fnContent.replace(/\n/g, '<br>');

                        footnoteHtml += '<li class="editormd-footnote-item" id="editormd-fn-' + fn.index + '" value="' + fn.index + '">';
                        footnoteHtml += '<span class="editormd-footnote-content">' + fnContent + '</span>';
                        footnoteHtml += ' <a href="#editormd-fnref-' + fn.index + '" class="editormd-footnote-backref" title="返回引用位置">&#8617;</a>';
                        footnoteHtml += '</li>';
                    }
                    footnoteHtml += '</ol>';
                    footnoteHtml += '</div>';
                    markdown += footnoteHtml;
                }
            }
        } catch(e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] Footnote processing error:", e);
            }
        }

        // 处理上标和下标语法（脚注引用已替换完毕，不冲突）
        // 上标：^文本^ → <sup>文本</sup>
        // 下标：^^文本^^ → <sub>文本</sub>
        // 组合上下标：<<下标>^<上标>> → 垂直堆叠容器（sup 在上、sub 在下，同级并列）
        try {
            // ★ 先处理组合上下标（<<X>^<Y>>），再处理下标（^^），最后处理上标（^），避免冲突
            editormd.regexs.supsub.lastIndex = 0;
            markdown = markdown.replace(editormd.regexs.supsub, function(match, subText, supText) {
                if (!subText || subText.length > 100 || !supText || supText.length > 100) return match;
                // 保护产生的 HTML 不被后续 ^ / ^^ 处理误匹配
                var safeSub = subText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\^/g, "&#94;");
                var safeSup = supText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\^/g, "&#94;");
                // ★ 使用 inline-block 包装容器，sup/sub 同级并列垂直堆叠，均依附于基准字符
                return '<span class="editormd-supsub"><sup>' + safeSup + '</sup><sub>' + safeSub + '</sub></span>';
            });

            // 再处理下标（双符号），避免冲突
            editormd.regexs.subscript.lastIndex = 0;
            markdown = markdown.replace(editormd.regexs.subscript, function(match, text) {
                if (!text || text.length > 100) return match;
                var safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return '<sub>' + safeText + '</sub>';
            });

            editormd.regexs.superscript.lastIndex = 0;
            markdown = markdown.replace(editormd.regexs.superscript, function(match, text) {
                if (!text || text.length > 100) return match;
                var safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return '<sup>' + safeText + '</sup>';
            });
        } catch(e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] Superscript/Subscript processing error:", e);
            }
        }

        // 处理字体大小语法：!数字 文本! → <span style="font-size:数字px">文本</span>
        try {
            markdown = markdown.replace(editormd.regexs.fontSize, function(match, size, text) {
                // 防止误匹配图片语法 ![alt](url) 中的 !
                if (typeof match === "string" && /^\[/.test(match)) return match;

                var fontSize = parseInt(size, 10);
                if (isNaN(fontSize) || fontSize < 8 || fontSize > 200) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Invalid font size: " + size + ", using default");
                    }
                    return match;
                }

                if (!text || text.length > 1000) return match;

                var safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return '<span style="font-size:' + fontSize + 'px">' + safeText + '</span>';
            });
        } catch(e) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] Font size processing error:", e);
            }
        }

        // 恢复转义语法占位符（\[\[ → [[，\]\] → ]]）
        for (var ei = 0; ei < escapePlaceholders.length; ei++) {
            var ep = escapePlaceholders[ei];
            markdown = markdown.split("<!--" + ep.id + "-->").join(ep.html);
        }

        // 恢复之前保护的代码块，让 marked 正常解析代码高亮
        markdown = restoreCodeBlocks(markdown, codeProtection.placeholders);

        // ★ 预处理 tooltip 语法：将 <宽,高> 转换为标准 title 格式
        // 将 [text](tooltip:type:content)<宽,高> 转换为 [text](tooltip:type:content "<宽,高>")
        // 注意：需要正确处理 content 中可能包含引号的情况
        if (options.tooltip) {
            markdown = markdown.replace(/\[([^\]]+)\]\(tooltip:([^)]+?)\)<(\d+),(\d+)>/gi, function(match, text, content, width, height) {
                // content 可能包含引号，需要保留原样
                return '[' + text + '](tooltip:' + content + ' "<' + width + ',' + height + '>")';
            });
        }

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
            toc                  : true,           // 生成目录（Table of Contents）
            tocm                 : false,
            tocStartLevel        : 1,              // 从第几级标题开始生成目录  
            pageBreak            : true,
            atLink               : true,           // 是否解析 @用户名 链接
            emailLink            : true,           // 是否解析邮箱地址自动链接
            taskList             : true,           // 启用 GitHub Flavored Markdown 任务列表

            tex                  : false,          // 启用 TeX / LaTeX 数学公式（基于 KaTeX）
            flowChart            : false,          // 启用流程图（flowChart.js 仅支持 IE9+）
            sequenceDiagram      : false,          // 启用时序图（sequenceDiagram.js 仅支持 IE9+）
            pinyin               : false,          // 启用拼音标注语法 {文本 | 拼音}
            textAlign            : true,           // 启用文本对齐语法
            imageResize          : true,           // 启用图片宽高编辑语法
            echarts              : false,          // 启用 Apache ECharts 图表
            tabs                 : true,           // 启用标签页 [[tabs]] 语法
            columns              : true,           // 启用多栏布局 [[columns:N]] 语法
            pageBlock            : true,           // 启用纸张页面 [[page:A4]] / [[page:A5]] 语法
            tooltip              : true,           // 启用悬浮提示 [text](tooltip:content) 语法
            copybook             : true            // 启用字帖语法 [[copybookTian]]、[[copybookMi]]、[[copybookPinyin]]
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
            // 重置 atLinkReg 的 lastIndex，避免全局正则的状态残留问题
            atLinkReg.lastIndex = 0;
            
            if (atLinkReg.test(text))
            { 
                atLinkReg.lastIndex = 0;
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
                // 保留原始拼音中的空格，不执行 trim
                // 仅对分组检测使用 trim 后的版本
                var pyTextRaw = $3;
                var pyTrimmed = pyTextRaw.trim();
                // 保存原始拼音中的空格（用 &nbsp; 替代），防止 HTML 折叠空白
                var pyText = pyTextRaw.replace(/ /g, '&nbsp;');
                
                // 检测拼音中是否包含空格（表示分组拼音如 "chuáng qián míng yuè guāng"）
                var pyGroups = pyTrimmed.split(/\s+/).filter(function(g) { return g.length > 0; });
                var textChars = [];
                // 将文字拆分为可见字符数组
                for (var i = 0; i < baseText.length; i++) {
                    textChars.push(baseText.charAt(i));
                }
                
                // 如果拼音分组数等于文字字符数，进行一一对应渲染
                if (pyGroups.length > 1 && pyGroups.length === textChars.length) {
                    var result = '';
                    for (var j = 0; j < textChars.length; j++) {
                        result += '<ruby class="editormd-pinyin editormd-pinyin-matched"><rb>' + textChars[j] + '</rb><rt>' + pyGroups[j] + '</rt></ruby>';
                    }
                    return result;
                }
                
                // 分组数不匹配或没有空格分隔时，使用标准 ruby 渲染（拼音在上方，文字在下方）
                // 注意：不使用 display:inline-block 覆盖 rb/rt 的 display:ruby-base/ruby-text，
                // 否则会破坏 ruby 上下排列的布局（拼音和文字挤在同一行）
                var rtStyleAttr = '';
                var rbStyleAttr = '';
                
                // 当文字与拼音长度差异较大时，给较短的元素设置 text-align:justify 以视觉对齐
                var textWidth = baseText.length;
                var pyWidth   = pyTrimmed.replace(/\s/g, '').length * 0.65;
                var maxWidth  = Math.max(textWidth, pyWidth) + 'em';
                
                if (pyGroups.length > 1 && pyGroups.length !== textChars.length) {
                    // 拼音分组数与文字数不匹配：两端对齐显示
                    rtStyleAttr = ' style="min-width:' + maxWidth + ';text-align:justify;text-align-last:justify;"';
                } else if ((pyGroups.length === 1 || pyGroups.length !== textChars.length) && Math.abs(textWidth - pyWidth) > 1.5) {
                    // 单组拼音与文字长度不匹配时，对较短的一方进行两端对齐
                    if (textWidth > pyWidth) {
                        rbStyleAttr = ' style="min-width:' + maxWidth + ';text-align:justify;text-align-last:justify;"';
                    } else {
                        rtStyleAttr = ' style="min-width:' + maxWidth + ';text-align:justify;text-align-last:justify;"';
                    }
                }
                
                // 使用 <rp> 括号为不支持 ruby 的浏览器提供降级方案
                return '<ruby class="editormd-pinyin"><rb' + rbStyleAttr + '>' + baseText + '</rb><rp>(</rp><rt' + rtStyleAttr + '>' + pyText + '</rt><rp>)</rp></ruby>';
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

            // 安全检查：防止 javascript: 和 data: 等危险协议注入
            if (href && /^\s*(javascript|data|vbscript):/i.test(href.trim())) {
                return editormd.escapeHtml(text || href);
            }
            
            // ★ 解码 marked.js 自动编码的 HTML 实体
            // marked.js 会将引号编码为 &quot;，尖括号编码为 &lt; &gt;
            if (href) {
                href = href.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }
            if (title) {
                title = title.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }
            
            // 转义 href 用于 HTML 属性
            var safeHref = editormd.escapeAttr(href || "");

            // ★★★ 新版悬浮提示语法 ★★★
            // 语法格式：[触发文本](tooltip:类型:内容)<宽度,高度>
            // 支持类型：text、image、iframe、html
            // 宽度和高度为可选参数
            if (settings.tooltip && href.indexOf("tooltip:") === 0) {
                var tooltipBody = href.substring(8); // 去掉 "tooltip:" 前缀
                var tooltipType = "text";
                var tooltipContent = tooltipBody;
                var tooltipWidth = "";
                var tooltipHeight = "";
                
                // ★ 解析可选的宽度和高度参数 <宽度,高度>
                // 从 title 参数中提取（marked.js 会将 <> 中的内容作为 title）
                if (title) {
                    var sizeMatch = title.match(/^<(\d+),(\d+)>$/);
                    if (sizeMatch) {
                        tooltipWidth = sizeMatch[1];
                        tooltipHeight = sizeMatch[2];
                        title = ""; // 清空 title，避免渲染到 HTML 中
                    }
                }
                
                // ★ 解析类型和内容
                var typeMatch = tooltipBody.match(/^(text|image|iframe|html):/);
                if (typeMatch) {
                    tooltipType = typeMatch[1];
                    tooltipContent = tooltipBody.substring(typeMatch[0].length);
                    
                    // ★ 处理不同类型的内容
                    if (tooltipType === "image" || tooltipType === "iframe") {
                        // 图片和 iframe 类型：支持引号包围的 URL
                        if (tooltipContent.match(/^["']/) && tooltipContent.match(/["']$/)) {
                            tooltipContent = tooltipContent.replace(/^["']|["']$/g, '');
                        }
                    } else if (tooltipType === "html") {
                        // HTML 类型：仅支持CSS选择器格式
                        var selector = tooltipContent;
                        
                        // 如果以引号开头和结尾，移除引号
                        if (selector.match(/^["']/) && selector.match(/["']$/)) {
                            selector = selector.replace(/^["']|["']$/g, '');
                        }
                        
                        // 验证选择器格式（必须是以#、.、[开头的有效CSS选择器）
                        if (selector.match(/^[.#\[][a-zA-Z0-9\-_\[\]="'#\.:\s]*$/)) {
                            // 构建属性字符串 - 使用 html-selector 类型
                            var attrs = 'data-tooltip="' + editormd.escapeAttr(selector) + '" data-tooltip-type="html-selector"';
                            if (tooltipWidth) attrs += ' data-tooltip-width="' + tooltipWidth + '"';
                            if (tooltipHeight) attrs += ' data-tooltip-height="' + tooltipHeight + '"';
                            return '<span class="editormd-tooltip-trigger" ' + attrs + ' tabindex="0">' + text + '</span>';
                        } else {
                            // 如果不是有效的CSS选择器，返回错误提示
                            console.warn('无效的HTML工具提示选择器:', tooltipContent, '，仅支持CSS选择器格式如 #id, .class, [attribute]');
                            var errAttrs = 'data-tooltip="无效选择器:' + editormd.escapeAttr(tooltipContent) + '" data-tooltip-type="text"';
                            return '<span class="editormd-tooltip-trigger" ' + errAttrs + ' tabindex="0">' + text + '</span>';
                        }
                    }
                }
                
                // ★ 构建通用的 tooltip HTML
                var attrs = 'data-tooltip="' + editormd.escapeAttr(tooltipContent) + '" data-tooltip-type="' + editormd.escapeAttr(tooltipType) + '"';
                if (tooltipWidth) attrs += ' data-tooltip-width="' + tooltipWidth + '"';
                if (tooltipHeight) attrs += ' data-tooltip-height="' + tooltipHeight + '"';
                return '<span class="editormd-tooltip-trigger" ' + attrs + ' tabindex="0">' + text + '</span>';
            }

            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            var imageExts = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
            
            if (videoExts.test(href)) {
                var videoOut = '<video src="' + safeHref + '" controls preload="metadata" class="editormd-video-player"';
                if (title) videoOut += ' title="' + editormd.escapeAttr(title) + '"';
                videoOut += '>' + text + '</video>';
                return videoOut;
            }
            
            var out = "<a href=\"" + safeHref + "\"";
            
            if (!imageExts.test(href)) {
                out += ' download class="editormd-attachment-link"';
            }
            
            // 重置 atLinkReg 的 lastIndex，避免全局正则的状态残留
            atLinkReg.lastIndex = 0;
            var titleHasAt = atLinkReg.test(title || "");
            atLinkReg.lastIndex = 0;
            var textHasAt = atLinkReg.test(text || "");
            atLinkReg.lastIndex = 0;
            
            if (titleHasAt || textHasAt)
            {
                if (title)
                {
                    out += " title=\"" + editormd.escapeAttr(title).replace(/@/g, "&#64;");
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
            var tooltipAttr = "";
            
            // ★★★ 图片悬浮提示语法（已废弃，保留向后兼容）★★★
            // 新版建议使用：[![alt](url)](tooltip:type:content)<w,h>
            if (settings.tooltip && title && title.indexOf("tooltip:") === 0) {
                var imgTooltipBody = title.substring(8);
                var imgTooltipType = "text";
                var imgTooltipContent = imgTooltipBody;
                var imgTypeMatch = imgTooltipBody.match(/^(text|image|iframe|html):/);
                if (imgTypeMatch) {
                    imgTooltipType = imgTypeMatch[1];
                    imgTooltipContent = imgTooltipBody.substring(imgTypeMatch[0].length);
                    
                    // 处理引号包围的内容
                    if ((imgTooltipType === "image" || imgTooltipType === "iframe") && 
                        imgTooltipContent.match(/^["']/) && imgTooltipContent.match(/["']$/)) {
                        imgTooltipContent = imgTooltipContent.replace(/^["']|["']$/g, '');
                    }
                }
                tooltipAttr = ' data-tooltip="' + editormd.escapeAttr(imgTooltipContent) + '" data-tooltip-type="' + editormd.escapeAttr(imgTooltipType) + '" class="editormd-tooltip-trigger"';
                out = "<img src=\"" + href + "\" alt=\"" + text + "\"" + tooltipAttr;
                title = "";
            }
            
            if (title) {
                out += " title=\"" + title + "\"";
            }
            
            out += " />";
            return out;
        };
        
        markedRenderer.heading = function(text, level, raw) {
                    
            var linkText       = text;
            var hasLinkReg     = /\s*\<a\s*href\=\"(.*)\"\s*([^\>]*)\>(.*)\<\/a\>\s*/;
            var getLinkTextReg = /\s*\<a\s*([^\>]+)\>([^\>]*)\<\/a\>\s*/g;

            // 修复 smartypants 导致的 HTML 属性引号弯化问题（如 class="badge" → class="badge"）
            // smartypants 会把 ASCII 双引号转为弯引号，破坏 HTML 标签结构
            text = text.replace(/<[^>]+>/g, function(tag) {
                return tag.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
            });

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
            
            // TOC 目录文本过滤：清除 Unicode 对齐标记、删除线标记和 HTML 标签
            // 避免 TOC 中出现 ⁑⠕二级标题右对齐⠕⁑ 这样的原始语法标记
            var tocText = text
                .replace(/⁑(⁑|⁖|⠕|⁛)/g, "")   // 移除对齐开始标记（居中⁑⁑、左⁑⁖、右⁑⠕、两端⁑⁛）
                .replace(/(⁖|⠕|⁛)⁑/g, "")     // 移除对齐结束标记（左⁖⁑、右⠕⁑、两端⁛⁑）
                .replace(/~~/g, "")             // 移除删除线标记
                .replace(/<\/?[^>]+>/g, "");    // 移除 HTML 标签（span, em, strong 等）
            tocText = trim(tocText);
            // 若过滤后为空，回退到原始文本
            if (!tocText) tocText = text;
            
            var escapedText    = tocText.replace(/[^\u4e00-\u9fa5\w\s]+/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
            var toc = {
                text  : tocText,
                level : level,
                slug  : escapedText
            };
            
            var isChinese = /^[\u4e00-\u9fa5]+$/.test(tocText);
            var id        = (isChinese) ? encodeURIComponent(tocText).replace(/\%/g, "") : tocText.toLowerCase().replace(/[^\w]+/g, "-");

            markdownToC.push(toc);
            
            var headingHTML = "<h" + level + " id=\"h"+ level + "-" + this.options.headerPrefix + id +"\">";
            
            headingHTML    += "<a name=\"" + tocText + "\" class=\"reference-link\"></a>";
            headingHTML    += "<span class=\"header-link octicon octicon-link\"></span>";
            var displayText = (hasLinkReg.test(linkText)) ? this.atLink(linkText) : this.atLink(text);
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
            var isToC           = (settings.tocm) ? /^(\[TOC\]|\[TOCM\])$/.test(text) : /^\[TOC\]$/.test(text);
            var isToCMenu       = /^\[TOCM\]$/.test(text);
            
            if (settings.tex) 
            {
                // 恢复被 marked.js breaks:true 插入的 <br> 标签
                // 注：LaTeX 反斜杠已在 protectTeXSyntax 中保护，此处只需处理 <br>
                var restoreTeXBreaks = function(texText) {
                    return texText.replace(/<br\s*\/?>\s*/gi, " ");
                };
                
                var isTeXLine = /^\$\$([\s\S]*)\$\$$/.test(text);
                
                if (isTeXLine) 
                {
                    // 整个段落是块级公式: $$...$$ → 直接包裹为 editormd-tex 块
                    text = text.replace(/^\$\$/, "").replace(/\$\$$/, "");
                    text = restoreTeXBreaks(text);
                    text = this.postProcessInline(text);
                    return "<p class=\"" + editormd.classNames.tex + "\" style=\"text-align:center;\">" + text + "</p>\n";
                }
                
                // 段落内混合公式处理
                // Step 1: 先处理 $$...$$ 块级公式（行内块级）
                text = text.replace(/\$\$([^$]+?)\$\$/g, function(match, content) {
                    return '<span class="' + editormd.classNames.tex + '" style="display:block;text-align:center;">' + restoreTeXBreaks(content.trim()) + '</span>';
                });
                // Step 2: 再处理 $...$ 行内公式（单美元符）
                text = text.replace(/\$(?!\$)([^$]+?)\$(?!\$)/g, function(match, content) {
                    return '<span class="' + editormd.classNames.tex + '">' + restoreTeXBreaks(content) + '</span>';
                });
            }
            
            var tocHTML = "<div class=\"markdown-toc editormd-markdown-toc\">" + text + "</div>";
            
            text = this.postProcessInline(text);
            
            return (isToC) ? ( (isToCMenu) ? "<div class=\"editormd-toc-menu\">" + tocHTML + "</div><br/>" : tocHTML )
                           : ( (pageBreakReg.test(text)) ? this.pageBreak(text) : "<p>" + this.atLink(text) + "</p>\n" );
        };

        markedRenderer.code = function (code, lang, escaped) { 

            if (lang === "seq" || lang === "sequence" || lang === "sequenceDiagram")
            {
                return "<div class=\"sequence-diagram\">" + code + "</div>";
            } 
            else if ( lang === "flow" || lang === "flowChart")
            {
                return "<div class=\"flowchart\">" + code + "</div>";
            } 
            else if ( lang === "math" || lang === "latex" || lang === "katex")
            {
                return "<p class=\"" + editormd.classNames.tex + "\">" + code + "</p>";
            }
            else if (lang === "echarts" && settings.echarts)
            {
                var chartId = "editormd-echarts-" + Math.random().toString(36).slice(2, 11);
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
            if (settings.taskList) 
            {
                // Handle task list markers: [ ] (unchecked) and [x] (checked)
                // marked v0.3.x may wrap list item text in <p> tags; strip them for reliable matching
                var stripped = text.replace(/<\/?p>/g, '').trim();
                if (/^\[([x\s])\]/.test(stripped))
                {
                    stripped = stripped.replace(/^\[\s\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" /> ')
                                       .replace(/^\[x\]\s*/,  '<input type="checkbox" class="task-list-item-checkbox" checked disabled /> ');
                    return "<li class=\"task-list-item\">" + this.postProcessInline(this.atLink(stripped)) + "</li>";
                }
            }
            
            return "<li>" + this.postProcessInline(this.atLink(text)) + "</li>";
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
        
        tocTitle      = tocTitle || "目录";
        
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

        // === XSS 安全过滤（始终执行，与 htmlDecode 配置无关） ===
        
        var xssWhitelist = {
            allowedTags: ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'img', 'a', 'b', 'i', 'strong', 'em', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'ruby', 'rb', 'rt', 'rp', 'del', 'ins', 'mark', 'small', 'dl', 'dt', 'dd', 'abbr', 'kbd', 'samp', 'var', 'cite', 'q', 'dfn', 'time', 'figure', 'figcaption', 'section', 'nav', 'article', 'aside', 'header', 'footer', 'main', 'details', 'summary', 'input', 'video', 'source'],
            allowedAttributes: {
                '*': ['class', 'id', 'style', 'title', 'lang', 'dir', 'data-*'],
                'a': ['href', 'target', 'rel', 'name', 'download'],
                'img': ['src', 'alt', 'width', 'height', 'title', 'loading'],
                'table': ['border', 'cellpadding', 'cellspacing'],
                'th': ['colspan', 'rowspan', 'align', 'scope'],
                'td': ['colspan', 'rowspan', 'align'],
                'code': ['class', 'data-lang'],
                'pre': ['class', 'data-lang'],
                'input': ['type', 'checked', 'disabled', 'class'],
                'video': ['src', 'controls', 'preload', 'class', 'title'],
                'details': ['open'],
                'time': ['datetime']
            },
            allowedSchemes: ['http', 'https', 'mailto', 'tel', 'ftp'],
            dangerousAttributes: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseenter', 'onmouseleave', 'ontouchstart', 'ontouchend', 'ontouchmove', 'onscroll', 'onresize', 'onselect', 'onreset', 'onformchange', 'onforminput', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'onabort', 'oncanplay', 'oncanplaythrough', 'oncontextmenu', 'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'oninput', 'oninvalid', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreadystatechange', 'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 'onwheel', 'oncopy', 'oncut', 'onpaste', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitionend'],
            dangerousTags: ['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'base', 'basefont', 'link', 'meta', 'noscript', 'template', 'form', 'textarea', 'button', 'select', 'option', 'optgroup', 'datalist', 'fieldset', 'label', 'legend', 'meter', 'output', 'progress']
        };
        
        // 彻底移除危险标签（始终执行，安全底线）
        for (var dt = 0; dt < xssWhitelist.dangerousTags.length; dt++) {
            var dTag = xssWhitelist.dangerousTags[dt];
            var dTagReg = new RegExp("<\\s*" + dTag + "[^>]*>[\\s\\S]*?<\\s*\\/\\s*" + dTag + "\\s*>", "gi");
            html = html.replace(dTagReg, "");
            // 同时处理自闭合的危险标签
            var dTagSelfReg = new RegExp("<\\s*" + dTag + "[^>]*\\/?\\s*>", "gi");
            html = html.replace(dTagSelfReg, "");
        }
        
        // 清洗 href 和 src 属性，防止 javascript: 协议注入（始终执行）
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
        
        // 移除危险的事件属性（始终执行）
        for (var da = 0; da < xssWhitelist.dangerousAttributes.length; da++) {
            var dAttr = xssWhitelist.dangerousAttributes[da];
            var dAttrReg = new RegExp("\\s+" + dAttr + "\\s*=\\s*['\"][^'\"]*['\"]", "gi");
            html = html.replace(dAttrReg, "");
            // 处理不带引号的属性值
            var dAttrReg2 = new RegExp("\\s+" + dAttr + "\\s*=\\s*[^\\s>]*", "gi");
            html = html.replace(dAttrReg2, "");
        }
        
        // 移除 style 属性中的 expression 和 behavior（IE 特有的 XSS 向量，始终执行）
        html = html.replace(/style\s*=\s*["'][^"']*["']/gi, function(match) {
            var sanitized = match.replace(/expression\s*\(/gi, "expr-invalid(");
            sanitized = sanitized.replace(/behavior\s*:/gi, "behavior-invalid:");
            sanitized = sanitized.replace(/javascript\s*:/gi, "javascript-invalid:");
            sanitized = sanitized.replace(/vbscript\s*:/gi, "vbscript-invalid:");
            return sanitized;
        });

        // === 用户自定义标签过滤（仅在 htmlDecode 配置了过滤规则时执行） ===
        
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
     * Static helper: Inject "Copy" buttons into every <pre> block inside a container.
     * Places a floating copy button at the top-right corner of each pre.
     * The button is absolute-positioned and does not scroll with code content.
     *
     * @param {jQuery} $container  The container element (jQuery object)
     */
    editormd.initCodeCopy = function($container) {
        var classPrefix = editormd.defaults ? editormd.defaults.classPrefix || "editormd-" : "editormd-";
        var copyText    = "复制";
        var copiedText  = "已复制";
        var failedText  = "复制失败";

        $container.find("pre").each(function() {
            var $pre = $(this);

            // Avoid duplicate buttons
            if ($pre.data("_copyBtnReady")) return;
            $pre.data("_copyBtnReady", true);

            // Ensure pre is positioned for the absolute button
            if ($pre.css("position") === "static") {
                $pre.css("position", "relative");
            }

            var $btn = $("<span>")
                .addClass(classPrefix + "code-copy-btn")
                .text(copyText)
                .attr("title", copyText);

            $btn.on("click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                if ($btn.hasClass("copied") || $btn.hasClass("failed")) return;

                // Use stored original code text (set before prettyPrint), fallback to live extraction
                var code = $pre.data("_originalCode");
                if (!code) {
                    var $code = $pre.find("code");
                    code = $code.length > 0
                        ? $code.text()
                        : $pre.clone().find("." + classPrefix + "code-copy-btn").remove().end().text();
                }

                var done = function(success) {
                    $btn.removeClass("copied failed")
                        .addClass(success ? "copied" : "failed")
                        .text(success ? copiedText : failedText);
                    clearTimeout($btn.data("_timer"));
                    $btn.data("_timer", setTimeout(function() {
                        $btn.removeClass("copied failed").text(copyText);
                    }, 2500));
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(code).then(function(){done(true);}).catch(function(){done(false);});
                } else {
                    var ta = document.createElement("textarea");
                    ta.value = code; ta.style.position="fixed"; ta.style.left="-9999px";
                    document.body.appendChild(ta); ta.select();
                    try { done(document.execCommand("copy")); } catch(ex) { done(false); }
                    document.body.removeChild(ta);
                }
            });

            $pre.append($btn);
        });
    };

    /**
     * 初始化指定容器内的所有悬浮提示（Tooltip）
     * Initialize all tooltips within a given container (static method)
     * 
     * @param {jQuery} $container  容器元素（jQuery 对象）
     * @returns {void}
     */
    editormd.initTooltips = function($container) {
        if (!$container || $container.length === 0) return;
        
        // Clean up orphaned tooltip popups from previous renders before re-initializing
        $("body").children(".editormd-tooltip-popup").remove();
        
        $container.find(".editormd-tooltip-trigger").each(function() {
            var $trigger = $(this);
            if ($trigger.attr("data-tooltip-initialized") === "true") {
                return;
            }
            
            var tooltipType    = $trigger.attr("data-tooltip-type") || "text";
            var tooltipContent = $trigger.attr("data-tooltip");
            var tooltipWidth   = $trigger.attr("data-tooltip-width") || "";
            var tooltipHeight  = $trigger.attr("data-tooltip-height") || "";
            
            // ★ HTML 类型：从 data-tooltip-html 读取 Base64 编码的原始 HTML 内容并解码
            if (tooltipType === "html") {
                tooltipContent = editormd.base64Decode($trigger.attr("data-tooltip-html") || "");
                if (!tooltipContent) return;
            } else if (!tooltipContent) {
                return;
            }
            
            // 构造 tooltip 内容 HTML（v1.12.1: 精确尺寸限制 + 加载状态）
            var tooltipHtml = '';
            if (tooltipType === "image") {
                var imgStyle = 'display:none;';
                if (tooltipWidth) imgStyle += 'width:' + tooltipWidth + 'px;max-width:' + tooltipWidth + 'px;';
                else imgStyle += 'max-width:340px;';
                if (tooltipHeight) imgStyle += 'height:' + tooltipHeight + 'px;max-height:' + tooltipHeight + 'px;';
                else imgStyle += 'max-height:220px;';
                if (tooltipWidth || tooltipHeight) imgStyle += 'object-fit:contain;';
                tooltipHtml = '<div class="editormd-tooltip-loading"><span>加载中...</span></div><img src="' + tooltipContent + '" alt="" style="' + imgStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);" onerror="$(this).prev().html(\'<span>图片加载失败</span>\');" />';
            } else if (tooltipType === "iframe") {
                var iframeStyle = 'display:none;';
                if (tooltipWidth) iframeStyle += 'width:' + tooltipWidth + 'px;max-width:' + tooltipWidth + 'px;';
                else iframeStyle += 'width:340px;';
                if (tooltipHeight) iframeStyle += 'height:' + tooltipHeight + 'px;max-height:' + tooltipHeight + 'px;';
                else iframeStyle += 'height:210px;';
                tooltipHtml = '<div class="editormd-tooltip-loading"><span>加载中...</span></div><iframe src="' + tooltipContent + '" frameborder="0" style="' + iframeStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);"></iframe>';
            } else if (tooltipType === "html") {
                // ★ 复杂 HTML 内容：设置最大宽高防止溢出，允许内部样式
                tooltipHtml = '<div class="editormd-tooltip-html-content">' + tooltipContent + '</div>';
            } else if (tooltipType === "html-selector") {
                // ★ HTML 选择器类型：查找页面中的DOM元素
                tooltipHtml = '<div class="editormd-tooltip-html-content editormd-tooltip-selector-loading">正在加载HTML内容...</div>';
            } else {
                // 文本类型：包裹在 .editormd-tooltip-text-content 中
                tooltipHtml = '<div class="editormd-tooltip-text-content">' + tooltipContent + '</div>';
            }
            
            var $tooltip = $('<div class="editormd-tooltip-popup editormd-tooltip-' + tooltipType + '">' + tooltipHtml + '</div>');
            
            // ★ v1.12.1: 应用可选宽度和高度 — 同时设置 popup 和内部元素
            if (tooltipWidth) {
                $tooltip.css({width: tooltipWidth + "px", "max-width": tooltipWidth + "px"});
                $tooltip.find("img,iframe,div.editormd-tooltip-html-content,div.editormd-tooltip-text-content").css("max-width", tooltipWidth + "px");
            }
            if (tooltipHeight) {
                $tooltip.css({height: tooltipHeight + "px", "max-height": tooltipHeight + "px"});
                $tooltip.find("img,iframe,div.editormd-tooltip-html-content,div.editormd-tooltip-text-content").css("max-height", tooltipHeight + "px");
            }
            
            $("body").append($tooltip);
            
            /**
             * 显示 tooltip —— 使用 viewport-relative 定位，使 tooltip 显示在触发元素上方
             */
            var showTooltip = function(e) {
                clearTimeout($trigger.data("tooltip-timer"));
                
                // 如果是 html-selector 类型，需要动态加载DOM元素内容
                if (tooltipType === "html-selector") {
                    // 查找页面中的DOM元素
                    var selector = tooltipContent;
                    console.log('HTML选择器工具提示 - 查找元素:', selector, '类型:', tooltipType);
                    
                    var $target = $(selector);
                    console.log('HTML选择器工具提示 - 找到元素数量:', $target.length);
                    
                    if ($target.length > 0) {
                        // 克隆目标元素，移除隐藏属性（如display:none, visibility:hidden, opacity:0等）
                        var $clone = $target.clone();
                        
                        // 记录原始样式用于调试
                        console.log('HTML选择器工具提示 - 原始元素样式:', {
                            display: $target.css('display'),
                            visibility: $target.css('visibility'),
                            opacity: $target.css('opacity'),
                            position: $target.css('position')
                        });
                        
                        // 移除常见隐藏属性
                        $clone.css({
                            display: '',
                            visibility: '',
                            opacity: '',
                            position: '',
                            left: '',
                            top: '',
                            width: '',
                            height: '',
                            margin: '',
                            padding: '',
                            border: '',
                            background: '',
                            color: ''
                        });
                        
                        // 移除可能影响显示的类名
                        $clone.removeClass(function(index, className) {
                            // 移除包含"hide", "hidden", "invisible"等隐藏相关的类
                            var classes = className.split(/\s+/);
                            var toRemove = [];
                            for (var i = 0; i < classes.length; i++) {
                                var cls = classes[i].toLowerCase();
                                if (cls.indexOf('hide') === 0 || 
                                    cls.indexOf('hidden') >= 0 || 
                                    cls.indexOf('invisible') >= 0 ||
                                    cls.indexOf('collapse') >= 0 ||
                                    cls.indexOf('transparent') >= 0) {
                                    toRemove.push(classes[i]);
                                }
                            }
                            return toRemove.join(' ');
                        });
                        
                        // 移除隐藏属性
                        $clone.removeAttr('hidden');
                        $clone.removeAttr('aria-hidden');
                        
                        // 设置克隆元素的样式，确保在tooltip中正常显示
                        $clone.css({
                            display: 'block',
                            visibility: 'visible',
                            opacity: '1',
                            position: 'relative',
                            maxWidth: '100%',
                            maxHeight: '300px',
                            overflow: 'auto'
                        });
                        
                        // 更新tooltip内容
                        $tooltip.html('<div class="editormd-tooltip-html-content">' + $clone[0].outerHTML + '</div>');
                        $tooltip.removeClass('editormd-tooltip-text editormd-tooltip-image editormd-tooltip-iframe editormd-tooltip-html');
                        $tooltip.addClass('editormd-tooltip-html');
                        
                        console.log('HTML选择器工具提示 - 成功加载元素到tooltip');
                    } else {
                        // 未找到元素，显示错误信息
                        console.error('HTML选择器工具提示 - 未找到元素:', selector);
                        $tooltip.html('<div class="editormd-tooltip-html-content" style="color: #ff6b6b; padding: 10px; font-size: 12px;">未找到元素: <code>' + editormd.escapeHTML(selector) + '</code><br>请检查CSS选择器是否正确，元素是否存在于页面中。</div>');
                    }
                }
                
                // 先临时显示以获取真实尺寸
                $tooltip.css({ display: "block", visibility: "hidden" });
                
                // 使用 getBoundingClientRect() 获取 viewport-relative 坐标
                var triggerRect = $trigger[0].getBoundingClientRect();
                var tooltipW   = $tooltip.outerWidth();
                var tooltipH   = $tooltip.outerHeight();
                
                // 水平居中于触发元素，垂直置于触发元素上方 8px
                var left = triggerRect.left + (triggerRect.width / 2) - (tooltipW / 2);
                var top  = triggerRect.top - tooltipH - 8;
                
                // 边界处理：防止 tooltip 超出视口
                var winW = window.innerWidth;
                var winH = window.innerHeight;
                
                if (left < 10) left = 10;
                if (left + tooltipW > winW - 10) left = winW - tooltipW - 10;
                
                if (top < 10) {
                    // 上方空间不足，显示在下方
                    top = triggerRect.bottom + 8;
                    if (top + tooltipH > winH - 10) {
                        top = winH - tooltipH - 10;
                    }
                }
                
                $tooltip.css({
                    left: left + "px",
                    top: top + "px",
                    display: "block",
                    visibility: "visible"
                });
                
                // Force reflow so the CSS opacity transition fires
                // eslint-disable-next-line no-unused-expressions
                $tooltip[0] && $tooltip[0].offsetHeight;
                
                $tooltip.addClass("show");
            };

            /**
             * 隐藏 tooltip —— 延迟后重置 opacity，然后隐藏元素
             */
            var hideTooltip = function() {
                $trigger.data("tooltip-timer", setTimeout(function() {
                    $tooltip.removeClass("show");
                    // 等待 CSS transition 完成后彻底隐藏
                    setTimeout(function() {
                        if (!$tooltip.hasClass("show")) {
                            $tooltip.css({ display: "none" });
                        }
                    }, 220);
                }, 200));
            };

            // 绑定事件 — popup 与 trigger 之间平滑过渡，避免闪烁关闭
            $trigger.on("mouseenter", showTooltip).on("mouseleave", hideTooltip);
            $tooltip.on("mouseenter", function() {
                // 鼠标从 trigger 移到 popup：取消隐藏定时器，popup 保持显示
                clearTimeout($trigger.data("tooltip-timer"));
            }).on("mouseleave", function() {
                // 鼠标离开 popup：同样使用延迟隐藏，给用户回到 trigger 的机会
                $trigger.data("tooltip-timer", setTimeout(function() {
                    $tooltip.removeClass("show");
                    setTimeout(function() {
                        if (!$tooltip.hasClass("show")) {
                            $tooltip.css({ display: "none" });
                        }
                    }, 220);
                }, 200));
            });
            // 点击 popup 内部链接或按钮时保持 popup 显示
            $tooltip.on("mousedown", function(e) {
                clearTimeout($trigger.data("tooltip-timer"));
            });
            $trigger.on("focus", showTooltip).on("blur", hideTooltip);

            $trigger.attr("data-tooltip-initialized", "true");
        });
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
            atLink               : true,    // 是否解析 @用户名 链接
            emailLink            : true,    // 是否解析邮箱地址自动链接
            tex                  : false,
            taskList             : true,    // GitHub Flavored Markdown 任务列表
            pinyin               : false,   // 拼音标注 {文本|拼音}
            textAlign            : true,    // 文本对齐
            imageResize          : true,    // 图片尺寸
            flowChart            : false,
            sequenceDiagram      : false,
            previewCodeHighlight : true,
            echarts              : false,
            tabs                 : true,
            columns              : true,
            tooltip              : true,
            copybook             : true
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
            textAlign            : settings.textAlign,
            imageResize          : settings.imageResize,
            echarts              : settings.echarts,
            tabs                 : settings.tabs,
            columns              : settings.columns,
            tooltip              : settings.tooltip,
            copybook             : settings.copybook
        };

        var markedOptions = {
            renderer    : editormd.markedRenderer(markdownToC, rendererOptions),
            gfm         : settings.gfm,
            tables      : true,
            breaks      : true,
            pedantic    : false,
            sanitize    : false, // 关闭 sanitize 以确保 HTML 注释占位符不被转义，占位符用于 tabs/columns 等自定义语法
            smartLists  : true,
            smartypants : true
        };
        
		markdownDoc = new String(markdownDoc);

        // 在 marked 解析之前保护 LaTeX 语法中的反斜杠
        var mdProtected = editormd.protectTeXSyntax(markdownDoc);
        // 在 marked 解析之前预处理自定义块级语法
        var mdPreprocess = editormd.preprocessMarkdownBlocks(mdProtected, rendererOptions);
        var markdownParsed = marked(mdPreprocess.markdown, markedOptions);
        markdownParsed = editormd.restorePlaceholders(markdownParsed, mdPreprocess.placeholders);
        markdownParsed = editormd.restoreTeXSyntax(markdownParsed);
        markdownParsed = editormd.fixSmartypantsHTML(markdownParsed);
        if (settings.taskList) markdownParsed = editormd.postProcessTaskLists(markdownParsed);

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

        // 向所有 pre 代码块注入复制按钮
        editormd.initCodeCopy(div);
        
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
                    // 使用 .text() 自动解码 HTML 实体，与同步渲染一致
                    var texCode = tex.text();
                    // 修复 KaTeX 对 &amp; 等实体处理
                    texCode = texCode.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
                    if (texCode.trim()) {
                        // 自动检测 displayMode：公式含 \begin{...}（矩阵、行列式等）使用块级模式
                        var isBlock = /^\\begin\{/.test(texCode);
                        katex.render(texCode, tex[0], { throwOnError: false, displayMode: isBlock });
                    }
                    tex.find(".katex").css("font-size", "1.6em");
                });
            };
            
            if (settings.autoLoadKaTeX && !editormd.$katex && !editormd.kaTeXLoaded)
            {
                // 使用 editormd.defaults.path 作为 KaTeX 资源加载的基础路径
                // 修复在 examples/ 等子目录下 KaTeX 路径 404 的问题
                var katexBasePath = settings.path || editormd.defaults.path || "";
                this.loadKaTeX(katexBasePath, function() {
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
                    if (noAxisTypes.indexOf(chartType) === -1) {
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
                    var $divider = $('<div class="editormd-column-divider"></div>');
                    $divider.css({
                        position: "absolute",
                        left: (i / count * 100) + "%",
                        top: "8px",
                        bottom: "8px",
                        width: "0",
                        transform: "translateX(-50%)",
                        borderLeft: "1px dashed #bbb",
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
            editormd.initTooltips(div);
        }
        
        div.getMarkdown = function() {            
            return saveTo.val();
        };
        
        return div;
    };
    
    // xfEditor 编辑器主题列表（用于切换工具栏等主题）
    // 自 v1.5.0 起添加
    editormd.themes        = ["default", "dark"];
    
    // 预览区主题列表
    // added @1.5.0
    editormd.previewThemes = ["default", "dark"];
    
    // CodeMirror / 编辑区主题列表
    // 自 v1.5.0 起重命名为 editorThemes，旧版本为 themes
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
     * 动态加载xfEditor插件，但不立即执行
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
        
        if (editormd.isIE8) 
        {            
            css.onreadystatechange = function() {
                if (css.readyState) 
                {
                    if (css.readyState === "loaded" || css.readyState === "complete") 
                    {
                        css.onreadystatechange = null; 
                        editormd.loadFiles.css.push(fileName);
                        callback();
                    }
                } 
            };
        }
        else
        {
            css.onload = function() {
                editormd.loadFiles.css.push(fileName);
                callback();
            };
        }

        css.href   = (/\.css$/i.test(fileName)) ? fileName : (fileName + ".css");

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
        script.src    = (/\.js$/i.test(fileName)) ? fileName : (fileName + ".js");
        
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
        
        // 优雅处理脚本加载失败
        script.onerror = function() {
            // 记录加载失败，让调用方能够感知
            if (!editormd.loadFiles.failed) {
                editormd.loadFiles.failed = [];
            }
            editormd.loadFiles.failed.push(fileName);
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] Failed to load script: " + fileName);
            }
            // 即使脚本加载失败，也继续执行加载链
            callback();
        };

        if (into === "head") {
            document.getElementsByTagName("head")[0].appendChild(script);
        } else {
            document.body.appendChild(script);
        }
    };
    
    // KaTeX 资源加载配置
    // 默认路径为项目根目录下的 lib/katex/，会自动拼接 settings.path 前缀
    // 用户可以通过 editormd.katexURL 覆盖为完整 URL（如 CDN 地址）
    editormd.katexURL  = {
        css : "katex/katex.min.css",
        js  : "katex/katex.min.js"
    };
    
    editormd.kaTeXLoaded = false;
    
    /**
     * 自动检测 editormd.js 所在的基路径，用于解决子目录下部署时资源 404 的问题
     * @private
     * @returns {String} 返回基路径（末尾带 /），如 "../" 或 "./lib/"
     */
    editormd._resolveBasePath = function() {
        // 尝试从加载 editormd.js 的 script 标签推断基路径
        if (document.currentScript && document.currentScript.src) {
            var src = document.currentScript.src;
            var match = src.match(/^(.*\/)editormd/);
            if (match) {
                return match[1];
            }
        }
        // 回退：遍历所有 script 标签查找 editormd
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
            var s = scripts[i];
            if (s.src && (s.src.indexOf("editormd") !== -1)) {
                var m = s.src.match(/^(.*\/)editormd/);
                if (m) return m[1];
            }
        }
        return "";
    };
    
    /**
     * 加载KaTeX文件
     * load KaTeX files — 自动解析基路径解决相对路径 404 问题
     * 
     * @param {String}   [basePath=""]           资源路径前缀（如 settings.path）
     * @param {Function} [callback=function()]   加载成功后执行的回调函数
     */
    
    editormd.loadKaTeX = function (basePath, callback) {
        // 兼容旧的 loadKaTeX(callback) 调用方式
        if (typeof basePath === "function") {
            callback = basePath;
            basePath = "";
        }
        basePath = basePath || "";
        
        // 如果 basePath 为空或是默认的 "./lib/"，尝试自动推断基路径
        // 解决在子目录（如 examples/）下部署时相对路径 404 的问题
        if (!basePath || basePath === "./lib/") {
            var autoPath = editormd._resolveBasePath();
            if (autoPath) {
                // 从 autoPath 推导 lib 目录：editormd.js 在项目根目录
                // 例如 autoPath = "https://example.com/editor.md/"
                // 则 KaTeX 应在 "https://example.com/editor.md/lib/katex/"
                basePath = autoPath + "lib/";
            }
        }
        
        var cssUrl = (basePath ? basePath : "") + editormd.katexURL.css;
        var jsUrl  = (basePath ? basePath : "") + editormd.katexURL.js;
        editormd.loadCSS(cssUrl, function(){
            editormd.loadScript(jsUrl, callback || function(){});
        });
    };
        
    /**
     * 漂亮的 Toast 通知系统（替代原生 alert）
     * 支持 info / success / warning / error 四种类型
     *
     * @param {String} message 提示信息
     * @param {String} [type="info"] 类型: "info" | "success" | "warning" | "error"
     * @param {Number} [duration=3000] 显示时长（毫秒），0 表示不自动关闭
     */
    editormd.notify = function(message, type, duration) {
        type = type || "info";
        duration = (typeof duration === "undefined") ? 3000 : duration;

        // 初始化通知容器
        var $container = $("#editormd-notify-container");
        if ($container.length === 0) {
            $container = $('<div id="editormd-notify-container" style="position:fixed;top:16px;right:16px;z-index:100000;display:flex;flex-direction:column;gap:8px;pointer-events:none;"></div>');
            $("body").append($container);
        }

        var icons = { info: "ℹ", success: "✓", warning: "⚠", error: "✕" };
        var colors = { info: "#2196F3", success: "#4CAF50", warning: "#FF9800", error: "#F44336" };
        var bgColors = { info: "#E3F2FD", success: "#E8F5E9", warning: "#FFF3E0", error: "#FFEBEE" };
        var textColors = { info: "#1565C0", success: "#2E7D32", warning: "#E65100", error: "#C62828" };

        var $toast = $(
            '<div class="editormd-notify-toast" style="' +
            'display:flex;align-items:flex-start;gap:10px;' +
            'background:' + bgColors[type] + ';color:' + textColors[type] + ';' +
            'padding:12px 16px;border-radius:8px;min-width:260px;max-width:420px;' +
            'box-shadow:0 4px 16px rgba(0,0,0,0.12);' +
            'border-left:4px solid ' + colors[type] + ';' +
            'font-size:14px;line-height:1.5;' +
            'pointer-events:auto;' +
            'transform:translateX(120%);opacity:0;transition:all 0.35s cubic-bezier(0.4,0,0.2,1);' +
            'word-break:break-word;' +
            '">' +
            '<span style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;' +
            'width:22px;height:22px;border-radius:50%;background:' + colors[type] + ';color:#fff;' +
            'font-size:12px;font-weight:bold;line-height:1;">' + icons[type] + '</span>' +
            '<span style="flex:1;"></span>' +
            '<span class="editormd-notify-close" style="flex-shrink:0;cursor:pointer;font-size:16px;' +
            'opacity:0.5;line-height:1;padding:0 2px;" onclick="$(this).closest(\'.editormd-notify-toast\').remove()">×</span>' +
            '</div>'
        );
        
        // 使用 .text() 安全设置消息，防止 XSS
        $toast.find("span").eq(1).text(message);

        $container.append($toast);

        // 入场动画
        setTimeout(function() {
            $toast.css({ transform: "translateX(0)", opacity: "1" });
        }, 10);

        // 自动关闭
        if (duration > 0) {
            var timer = setTimeout(function() {
                $toast.css({ transform: "translateX(120%)", opacity: "0" });
                setTimeout(function() { $toast.remove(); }, 350);
            }, duration);

            // 鼠标悬停暂停计时
            $toast.on("mouseenter", function() { clearTimeout(timer); });
            $toast.on("mouseleave", function() {
                timer = setTimeout(function() {
                    $toast.css({ transform: "translateX(120%)", opacity: "0" });
                    setTimeout(function() { $toast.remove(); }, 350);
                }, 1200);
            });
        }
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
            height : (typeof options.height === "string") ? options.height : "auto"
        });

        var dialogPosition = function(){
            dialog.css({
                top    : ($(window).height() - dialog.height()) / 2 + "px",
                left   : ($(window).width() - dialog.width()) / 2 + "px"
            });
        };

        dialogPosition();

        $(window).on("resize.editormd-dialog", dialogPosition);

        dialog.children("." + classPrefix + "dialog-close").on(mouseOrTouch("click", "touchend"), function(e) {
            e.preventDefault();
            e.stopPropagation();
            dialog.hide().lockScreen(false).hideMask();
        });

        if (typeof options.buttons === "object")
        {
            var footer = dialog.footer = dialog.find("." + classPrefix + "dialog-footer");

            for (var key in options.buttons)
            {
                var btn = options.buttons[key];
                var btnClassName = classPrefix + key + "-btn";

                footer.append("<button type=\"button\" class=\"" + classPrefix + "btn " + btnClassName + "\">" + btn[0] + "</button>");
                btn[1] = btn[1].bind(dialog);
                footer.children("." + btnClassName).on(mouseOrTouch("click", "touchend"), function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    btn[1](e);
                });
            }
        }

        if (options.title !== "" && options.drag)
        {                        
            var posX, posY;
            var dialogHeader = dialog.children("." + classPrefix + "dialog-header");

            if (!options.mask) {
                dialogHeader.on(mouseOrTouch("click", "touchend"), function(){
                    editormd.dialogZindex += 2;
                    dialog.css("z-index", editormd.dialogZindex);
                });
            }

            dialogHeader.mousedown(function(e) {
                e = e || window.event;  // IE 兼容
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

                this.on("touchstart", start).on("touchmove", move);
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
        } catch(e) {
            // 不支持 TouchEvent，继续使用鼠标事件
        }

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
