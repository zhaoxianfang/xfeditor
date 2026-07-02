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
        window.xfEditor = factory();
	}
    
}(function() {    

    /* Require.js assignment replace */
    
    "use strict";
    
    // ★ v1.17.15: CSS.escape polyfill（IE/旧浏览器兼容）
    if (typeof CSS !== "undefined" && !CSS.escape) {
        CSS.escape = function(value) {
            var str = String(value);
            return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\]^`{|}~]/g, "\\$&");
        };
    }
    // ★ v1.17.15: String.prototype.padStart polyfill（IE/ES2016-兼容）
    if (!String.prototype.padStart) {
        String.prototype.padStart = function(targetLength, padString) {
            targetLength = targetLength >> 0;
            padString = String(typeof padString !== "undefined" ? padString : " ");
            if (this.length >= targetLength) return String(this);
            var pad = "";
            while (pad.length < targetLength - this.length) pad += padString;
            return pad.substring(0, targetLength - this.length) + String(this);
        };
    }
    
    var $ = (typeof (jQuery) !== "undefined") ? jQuery : Zepto;

	if (typeof ($) === "undefined") {
		return ;
	}
    
    /**
     * xfEditor
     * 
     * @param   {String} id           编辑器的ID
     * @param   {Object} options      配置选项 Key/Value
     * @returns {Object} xfEditor     返回xfEditor对象
     */
    
    var xfEditor         = function (id, options) {
        return new xfEditor.fn.init(id, options);
    };
    
    xfEditor.title        = xfEditor.$name = "xfEditor";
    xfEditor.version      = "1.17.22";
    xfEditor.homePage     = "https://github.com/zhaoxianfang/xfeditor";
    xfEditor.classPrefix  = "xf_editor-";
    
    /**
     * HTML 实体转义工具函数
     * 将特殊字符转义为 HTML 实体，防止 XSS 攻击
     */
    xfEditor.escapeHtml = function(str) {
        if (str == null || typeof str !== "string") return "";
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;");
    };
    
    // 别名：保持大写的 escapeHTML 与 escapeHtml 一致（历史代码中两处均有调用）
    xfEditor.escapeHTML = xfEditor.escapeHtml;
    
    /**
     * HTML 属性值转义（仅转义引号相关，保留 &<> 供 link href 等场景使用）
     */
    xfEditor.escapeAttr = function(str) {
        if (str == null || typeof str !== "string") return "";
        return str.replace(/&/g, "&amp;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#39;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
    };
    
    /**
     * Base64 编码（UTF-8 安全），用于在 HTML 属性中存储含特殊字符的内容
     */
    xfEditor.base64Encode = function(str) {
        if (str == null) return "";
        try {
            // 使用现代标准 API 替代已弃用的 unescape(encodeURIComponent(...))
            var utf8Bytes = new TextEncoder().encode(str);
            var binary = '';
            for (var i = 0; i < utf8Bytes.length; i++) {
                binary += String.fromCharCode(utf8Bytes[i]);
            }
            return btoa(binary);
        } catch(e) {
            return "";
        }
    };

    /**
     * Base64 解码（UTF-8 安全）
     */
    xfEditor.base64Decode = function(b64) {
        if (!b64) return "";
        try {
            // 使用现代标准 API 替代已弃用的 decodeURIComponent(escape(atob(...)))
            var binary = atob(b64);
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch(e) {
            return "";
        }
    };
    
    xfEditor.toolbarModes = {
        full : [
            "undo", "redo", "|", 
            "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", 
            { "h1" : ["h1", "h2", "h3", "h4", "h5", "h6"] },
            "|", 
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "video", "file", "|",
            { "insert" : ["code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "grid", "insert-flowchart", "insert-sequence"] },
            "|",
            { "page" : ["page-a3", "page-a4", "page-a5"] },
            "|",
            { "align" : ["align-left", "align-center", "align-right"] },
            "|",
            "pinyin",
            "|",
            { "chart" : ["echarts-tree", "echarts-bar", "echarts-line", "echarts-pie", "echarts-radar", "echarts-funnel"] },
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
    
    xfEditor.defaults     = {
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
        pluginPath           : "../plugins/", // 插件目录路径（相对于示例 HTML 页面）
        delay                : 80,             // Markdown 解析延迟，单位：毫秒
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
        tocTitle             : "",         tocDropdown          : false,          // 自动创建目录下拉菜单
        tocContainer         : "",         tocStartLevel        : 1,          htmlDecode           : false,          // 开启 HTML 标签识别解析，XSS 安全过滤始终生效
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
        grid                 : true,           // 启用栅格化布局语法 [[row]]/[[col:N]]
        pageBlock            : true,           // 启用纸张页面语法 [[page:A4]] / [[page:A5]]
        video                : true,           // 启用视频列表语法 [[video]]
        file                 : true,           // 启用文件列表语法 [[file]]
        tooltip              : true,           // 启用悬浮提示语法 [text](tooltip:tip)
        syncScroll           : true,           // 启用编辑区和预览区同步滚动（v1.17.0）
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
                return xfEditor.toolbarHandlers.ucwords;
            },
            lowercase : function() {
                return xfEditor.toolbarHandlers.lowercase;
            }
        },
        toolbarCustomIcons   : {               lowercase        : "<a href=\"javascript:;\" title=\"\" unselectable=\"on\"><i class=\"fa\" name=\"lowercase\" style=\"font-size:24px;margin-top: -10px;\">a</i></a>",
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
            h1               : xfEditor.classPrefix + "bold",
            h2               : xfEditor.classPrefix + "bold",
            h3               : xfEditor.classPrefix + "bold",
            h4               : xfEditor.classPrefix + "bold",
            h5               : xfEditor.classPrefix + "bold",
            h6               : xfEditor.classPrefix + "bold",
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
            "table-edit"     : "fa-table",
            "insert"         : "fa-plus",
            "pinyin"         : "fa-language",
            "image-resize"   : "fa-arrows-alt",
            "echarts-tree"   : "fa-tree",
            "echarts-bar"    : "fa-bar-chart",
            "echarts-line"   : "fa-line-chart",
            "echarts-pie"    : "fa-pie-chart",
            "echarts-radar"  : "fa-bullseye",
            "echarts-funnel" : "fa-filter",
            "chart"          : "fa-area-chart",
            "tabs"           : "fa-folder-o",
            "columns"        : "fa-newspaper-o",
            "grid"           : "fa-th",
            "tooltip"        : "fa-comment-o",
            "color"          : "fa-font",
            "bg-color"       : "fa-paint-brush",
            "formula"         : "",
            "copybook"       : "xf_editor-icon-copybook",
            "copybook-tian"  : "xf_editor-icon-tian",
            "copybook-mi"    : "xf_editor-icon-mi",
            "copybook-pinyin": "xf_editor-icon-pinyin",
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
                info             : "关于" + xfEditor.title,
                "align-left"     : "左对齐",
                "align-center"   : "居中对齐",
                "align-right"    : "右对齐",
                "table-edit"     : "表格编辑",
                insert           : "插入",
                pinyin           : "拼音标注",
                "image-resize"   : "图片尺寸",
                "echarts-tree"   : "树图/脑图",
                "echarts-bar"    : "柱状图",
                "echarts-line"   : "折线图",
                "echarts-pie"    : "饼图",
                "echarts-radar"  : "雷达图",
                "echarts-funnel" : "漏斗图",
                chart            : "图表",
                tabs             : "标签页",
                columns          : "多栏排版",
                grid             : "栅格化",
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
                    title         : "添加链接",
                    url           : "链接地址",
                    urlTitle      : "链接标题",
                    urlEmpty      : "错误：请填写链接地址。",
                    target        : "跳转方式",
                    targetDefault : "默认(当前页面)",
                    targetBlank   : "新页面打开",
                    targetSelf    : "当前页面打开",
                    targetParent  : "父窗口打开",
                    targetTop     : "顶层窗口打开"
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
    
    xfEditor.classNames  = {
        tex : xfEditor.classPrefix + "tex"
    };

    xfEditor.dialogZindex = 99999;
    
    xfEditor.$katex       = null;
    xfEditor.$marked      = null;
    xfEditor.$CodeMirror  = null;
    xfEditor.$prettyPrint = null;

    /**
     * 语言包注册表
     * Language pack registry
     * 外部语言文件通过 xfEditor.langs["en"] = {...} 注册
     */
    xfEditor.langs = {};

    /**
     * 注册语言包
     * Register a language pack
     * 
     * @param   {String} name    语言名称标识符，如 "en", "zh-cn", "zh-tw"
     * @param   {Object} langObj 语言包对象
     * @returns {void}
     */
    xfEditor.registerLang = function(name, langObj) {
        xfEditor.langs[name] = langObj;
    };

    /**
     * 获取已注册的语言包
     * Get a registered language pack
     * 
     * @param   {String} name  语言名称标识符
     * @returns {Object|null}  语言包对象，未注册则返回 null
     */
    xfEditor.getLang = function(name) {
        return xfEditor.langs[name] || null;
    };

    /**
     * 将内置默认语言注册到语言包注册表
     * 确保 xfEditor.getLang("zh-cn") 无需加载外部文件即可获取
     */
    xfEditor.langs[xfEditor.defaults.lang.name] = xfEditor.defaults.lang;

    xfEditor.prototype    = xfEditor.fn = {
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
         * @returns {xfEditor}               返回xfEditor的实例对象
         */
        
        init : function (id, options) {
            
            options              = options || {};
            
            if (typeof id === "object")
            {
                options = id;
            }
            
            var _this            = this;
            var classPrefix      = this.classPrefix  = xfEditor.classPrefix; 
            var settings         = this.settings     = $.extend(true, {}, xfEditor.defaults, options);
            
            id                   = (typeof id === "object") ? settings.id : id;
            
            var editor           = this.editor       = $("#" + id);
            
            this.id              = id;
            this.lang            = settings.lang;
            this.timer           = null;
            this.flowchartTimer  = null;
            this._asyncLoadCount  = 0;        // 异步加载计数器
            this._allAsyncLoaded = false;    // onAllAsyncLoad 是否已触发
            this._syncingScroll   = false;   // 同步滚动防抖标记
            this._scrollSyncBound = false;   // 是否已绑定同步滚动事件
            this._syncScrollActive = null;   // 当前鼠标所在区域："editor" | "preview" | null
            this._applyingDomChanges = false;  // DOM 更新期间锁定滚动同步
            // ★ v1.17.4: 统一同步滚动状态管理
            this._syncState = {
                suppressAllSync    : false,   // 完全禁用双向同步（preview→editor内容更新时）
                programmaticScroll : false,   // 标记为程序化滚动（忽略该次scroll事件）
                disablePreviewListener : false, // 禁用预览区→编辑区方向（editor→preview动画期间）
                editorDestTop      : 0,       // 动画目标位置
                editorAnimTimer    : null,    // 编辑器动画 timer
                lastEditorSyncTime : 0,       // 防抖时间戳
                lastPreviewSyncTime: 0,       // 防抖时间戳
                mouseTarget        : null     // 鼠标所在区域 "editor" | "preview" | null
            };
            
            var classNames       = this.classNames   = {
                textarea : {
                    html     : classPrefix + "html-textarea",
                    markdown : classPrefix + "markdown-textarea"
                }
            };
            
            settings.pluginPath = (settings.pluginPath === "") ? settings.path + "../plugins/" : settings.pluginPath; 
            
            this.state.watching = (settings.watch) ? true : false;
            
            if ( !editor.hasClass("xf_editor") ) {
                editor.addClass("xf_editor");
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
                    xfEditor.$katex = katex;
                }
                
                if (settings.searchReplace && !settings.readOnly) 
                {
                    xfEditor.loadCSS(settings.path + "codemirror/addon/dialog/dialog");
                    xfEditor.loadCSS(settings.path + "codemirror/addon/search/matchesonscrollbar");
                }
            }
            
            if ((typeof define === "function" && define.amd) || !settings.autoLoadModules)
            {
                if (typeof CodeMirror !== "undefined") {
                    xfEditor.$CodeMirror = CodeMirror;
                }
                
                if (typeof marked     !== "undefined") {
                    xfEditor.$marked     = marked;
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
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        loadQueues : function() {
            var _this        = this;
            var settings     = this.settings;
            var loadPath     = settings.path;
                                
            var onEditorReady = function() {
                if (xfEditor.isIE8) 
                {
                    _this.loadedDisplay();
                    return ;
                }
                _this.loadedDisplay();
            };

            xfEditor.loadCSS(loadPath + "codemirror/codemirror.min");
            
            if (settings.searchReplace && !settings.readOnly)
            {
                xfEditor.loadCSS(loadPath + "codemirror/addon/dialog/dialog");
                xfEditor.loadCSS(loadPath + "codemirror/addon/search/matchesonscrollbar");
            }
            
            if (settings.codeFold)
            {
                xfEditor.loadCSS(loadPath + "codemirror/addon/fold/foldgutter");            
            }
            
            xfEditor.loadScript(loadPath + "codemirror/codemirror.min", function() {
                // ★ v1.17.18: 空值安全检查
                xfEditor.$CodeMirror = (typeof CodeMirror !== "undefined") ? CodeMirror : null;
                if (!xfEditor.$CodeMirror) { console.warn("[xfEditor] CodeMirror 加载失败"); return; }
                
                xfEditor.loadScript(loadPath + "diff_match_patch", function() {
                    
                xfEditor.loadScript(loadPath + "codemirror/addons.min", function() {
                    
                    xfEditor.loadScript(loadPath + "codemirror/modes.min", function() {
                        
                        _this.setCodeMirror();
                        
                        if (settings.mode !== "gfm" && settings.mode !== "markdown") 
                        {
                            _this.loadedDisplay();
                            
                            return false;
                        }
                        
                        _this.setToolbar();

                        xfEditor.loadScript(loadPath + "marked.min", function() {

                            // ★ v1.17.18: 空值安全检查
                            xfEditor.$marked = (typeof marked !== "undefined") ? marked : null;
                            if (!xfEditor.$marked) { console.error("[xfEditor] marked 库加载失败"); return; }
                                
                            if (settings.previewCodeHighlight) 
                            {
                                xfEditor.loadScript(loadPath + "prettify.min", function() {
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
         * @returns {xfEditor}  返回xfEditor的实例对象
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
            
            // ★ v1.17.8: 同步切换预览区主题 — 确保左右两侧都切换到暗色/默认主题
            this.setPreviewTheme(theme);
            
            return this;
        },
        
        /**
         * 设置 CodeMirror（编辑区）的主题
         * Setting CodeMirror (Editor area) theme
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        setEditorTheme : function(theme) {  
            var settings   = this.settings;  
            settings.editorTheme = theme;  
            
            if (theme !== "default")
            {
                xfEditor.loadCSS(settings.path + "codemirror/theme/" + settings.editorTheme);
            }
            
            if (!this.cm) return this;
            this.cm.setOption("theme", theme);
            
            return this;
        },
        
        /**
         * setEditorTheme() 的别名
         * setEditorTheme() alias
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        setCodeMirrorTheme : function (theme) {            
            this.setEditorTheme(theme);
            
            return this;
        },
        
        /**
         * 设置 xfEditor 的主题
         * Setting xfEditor theme
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        setCodeMirror : function() { 
            var settings         = this.settings;
            var editor           = this.editor;
            
            if (settings.editorTheme !== "default")
            {
                xfEditor.loadCSS(settings.path + "codemirror/theme/" + settings.editorTheme);
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
                    scrollIntoView           : false
            };
            
            this.codeEditor = this.cm        = xfEditor.$CodeMirror.fromTextArea(this.markdownTextarea[0], codeMirrorConfig);
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
            if (!this.cm) return undefined;
            return this.cm.getOption(key);
        },
        
        /**
         * 配置和重配置CodeMirror的选项
         * CodeMirror setting options / resettings
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        setCodeMirrorOption : function(key, value) {
            
            this.cm.setOption(key, value);
            
            return this;
        },
        
        /**
         * 添加 CodeMirror 键盘快捷键
         * Add CodeMirror keyboard shortcuts key map
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        addKeyMap : function(map, bottom) {
            this.cm.addKeyMap(map, bottom);
            
            return this;
        },
        
        /**
         * 移除 CodeMirror 键盘快捷键
         * Remove CodeMirror keyboard shortcuts key map
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
         * @returns {xfEditor}                   返回xfEditor的实例对象
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
                xfEditor.notify("行号必须是一个整数", "warning");
                return this;
            }
            
            line  = parseInt(line) - 1;
            
            if (line > count)
            {
                xfEditor.notify("行号超出范围：1-" + count, "warning");
                
                return this;
            }
            
            cm.setCursor( {line : line, ch : 0} );
            
            var scrollInfo   = cm.getScrollInfo();
            var clientHeight = scrollInfo.clientHeight; 
            var coords       = cm.charCoords({line : line, ch : 0}, "local");
            
            cm.scrollTo(null, (coords.top + coords.bottom - clientHeight) / 2);
            
            cm.focus();
            
            return this;
        },
        
        /**
         * 扩展当前实例对象，可同时设置多个或者只设置一个
         * Extend xfEditor instance object, can mutil setting.
         * 
         * @returns {xfEditor}                  this(xfEditor instance object.)
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
         * Extend xfEditor instance object, one by one
         * 
         * @param   {String|Object}   key       option key
         * @param   {String|Object}   value     option value
         * @returns {xfEditor}                  this(xfEditor instance object.)
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
         * @returns {xfEditor}                  this(xfEditor instance object.)
         */
        
        config : function(key, value) {
            var settings = this.settings;
            
            if (typeof key === "object")
            {
                settings = $.extend(true, settings, key);
            }
            else if (typeof key === "string" && value !== undefined)
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
         * @returns {xfEditor}                  this(xfEditor instance object.)
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
         * @returns {xfEditor}                    this(xfEditor instance object.)
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
         * @returns {xfEditor}  返回xfEditor的实例对象
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
         * @returns {xfEditor}                         this(xfEditor instance object.)
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
         * @returns {xfEditor}  返回xfEditor的实例对象
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

                var editorOffset = editor.offset();
                var editorWidth  = editor.width();
                
                if (top - editorOffset.top > 10 && top < editorOffset.top + editor.height())
                {
                    toolbar.css({
                        position : "fixed",
                        top      : 0,
                        width    : editorWidth + "px",
                        left     : editorOffset.left + "px",
                        right    : "auto"
                    });
                }
                else
                {
                    toolbar.css({
                        position : "absolute",
                        top      : 0,
                        width    : "100%",
                        left     : 0,
                        right    : "auto"
                    });
                }
            };
            
            if (!state.fullscreen && !state.preview && settings.toolbar && settings.toolbarAutoFixed)
            {
                $(window).on("scroll.xf_editor-autofixed", autoFixedHandle);
            }

            return this;
        },
        
        /**
         * 配置和初始化工具栏
         * Set toolbar and Initialization
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
                            : ((typeof settings.toolbarIcons === "string")  ? xfEditor.toolbarModes[settings.toolbarIcons] : settings.toolbarIcons);
            
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

                    var dropdownHTML = pullRight ? "<li class=\"pull-right xf_editor-toolbar-dropdown\">" : "<li class=\"xf_editor-toolbar-dropdown\">";
                    dropdownHTML += "<a href=\"javascript:;\" title=\"" + dTitle + "\" unselectable=\"on\" class=\"xf_editor-dropdown-toggle\">";
                    dropdownHTML += "<i class=\"fa " + dIconClass + "\" name=\""+dropdownName+"\" unselectable=\"on\">"+((dIsHeader) ? dropdownName.toUpperCase() : ( (dIconClass === "") ? dIconTexts : "") ) + "</i>";
                    dropdownHTML += " <span class=\"fa fa-caret-down\"></span>";
                    dropdownHTML += "</a>";
                    dropdownHTML += "<ul class=\"xf_editor-dropdown-menu\">";
                    
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
            xfEditor.dialogLockScreen.call(this);
            
            return this;
        },

        dialogShowMask : function(dialog) {
            xfEditor.dialogShowMask.call(this, dialog);
            
            return this;
        },
        
        getToolbarHandlers : function(name) {
            var toolbarHandlers = this.toolbarHandlers = xfEditor.toolbarHandlers;

            return (name && typeof toolbarHandlers[name] !== "undefined") ? toolbarHandlers[name] : toolbarHandlers;
        },
        
        /**
         * 工具栏图标事件处理器
         * Bind toolbar icons event handle
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
            toolbar.find("." + classPrefix + "toolbar-dropdown > ." + classPrefix + "dropdown-toggle").on(xfEditor.mouseOrTouch("click", "touchend"), function(event) {
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
                        $(document).off("click.xf_editor-dropdown", closeDropdown);
                    }
                };
                
                if ($dropdown.hasClass("open")) {
                    $(document).on("click.xf_editor-dropdown", closeDropdown);
                }
                
                return false;
            });
                
            toolbarIcons.on(xfEditor.mouseOrTouch("click", "touchend"), function(event) {

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
            toolbar.find("." + classPrefix + "dropdown-menu > li > a").on(xfEditor.mouseOrTouch("click", "touchend"), function(event) {
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
            return xfEditor.createDialog.call(this, options);
        },
        
        /**
         * 创建关于xfEditor的对话框
         * Create about xfEditor dialog
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        createInfoDialog : function() {
            var _this        = this;
			var editor       = this.editor;
            var classPrefix  = this.classPrefix;  
            
            var infoDialogHTML = [
                "<div class=\"" + classPrefix + "dialog " + classPrefix + "dialog-info\" style=\"\">",
                "<div class=\"" + classPrefix + "dialog-container\">",
                "<h1><i class=\"xf_editor-logo xf_editor-logo-lg xf_editor-logo-color\"></i> " + xfEditor.title + "<small>v" + xfEditor.version + "</small></h1>",
                "<p>" + this.lang.description + "</p>",
                "<p style=\"margin: 10px 0 20px 0;\">仓库地址：<a href=\"" + xfEditor.homePage + "\" target=\"_blank\">" + xfEditor.homePage + " <i class=\"fa fa-external-link\"></i></a></p>",
                "<div style=\"background:#f6f8fa;border-radius:6px;padding:12px 16px;margin:12px 0;font-size:13px;line-height:1.7;\">",
                "<strong>声明</strong><br>",
                "本编辑器基于开源项目 <a href=\"https://github.com/pandao/editor.md\" target=\"_blank\" class=\"hover-link\">Editor.md</a> 改编而来，感谢原作者 Pandao 的杰出贡献。",
                "</div>",
                "<p style=\"font-size: 0.85em;\">Copyright &copy; 2015-2026 <a href=\"https://github.com/zhaoxianfang\" target=\"_blank\" class=\"hover-link\">zhaoxianfang</a>, The <a href=\"https://github.com/zhaoxianfang/xfeditor/blob/master/LICENSE\" target=\"_blank\" class=\"hover-link\">MIT</a> License.</p>",
                "<p style=\"font-size: 0.75em;color:#8b949e;margin-top:8px;\">Powered by CodeMirror, marked.js, KaTeX, ECharts, Flowchart.js, js-sequence-diagrams</p>",
                "</div>",
                "<a href=\"javascript:;\" class=\"fa fa-close " + classPrefix + "dialog-close\"></a>",
                "</div>"
            ].join("\n");

            editor.append(infoDialogHTML);
            
            var infoDialog  = this.infoDialog = editor.children("." + classPrefix + "dialog-info");

            infoDialog.find("." + classPrefix + "dialog-close").on(xfEditor.mouseOrTouch("click", "touchend"), function() {
                _this.hideInfoDialog();
            });
            
            infoDialog.css("border", (xfEditor.isIE8) ? "1px solid #ddd" : "").css("z-index", xfEditor.dialogZindex).show();
            
            this.infoDialogPosition();

            return this;
        },
        
        /**
         * 关于xfEditor对话居中定位
         * xfEditor dialog position handle
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
         * @returns {xfEditor}  返回xfEditor的实例对象
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

			infoDialog.css("z-index", xfEditor.dialogZindex).show();

			this.infoDialogPosition();

            return this;
        },
        
        /**
         * 隐藏关于xfEditor
         * Hide about xfEditor dialog
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
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
         * @returns {xfEditor}           返回xfEditor的实例对象
         */
        
        lockScreen : function(lock) {
            xfEditor.lockScreen(lock);
            this.resize();

            return this;
        },
        
        /**
         * 编辑器界面重建，用于动态语言包或模块加载等
         * Recreate editor
         * 
         * @returns {xfEditor}  返回xfEditor的实例对象
         */
        
        recreate : function() {
            var _this            = this;
            var editor           = this.editor;
            var settings         = this.settings;
            
            this.codeMirror.remove();
            
            this.setCodeMirror();

            if (!settings.readOnly) 
            {
                if (editor.find(".xf_editor-dialog").length > 0) {
                    editor.find(".xf_editor-dialog").remove();
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
         * @returns {xfEditor}             返回xfEditor的实例对象
         */
        
        previewCodeHighlight : function() {    
            var settings         = this.settings;
            var previewContainer = this.previewContainer;
            
            if (settings.previewCodeHighlight) 
            {
                // ★ v1.17.16: 使用 extractCodeText 提取原始代码（保留缩进/换行/空格）
                previewContainer.find("pre").each(function() {
                    var $pre = $(this);
                    var $code = $pre.find("code");
                    if ($code.length > 0 && $pre.data("_originalCode") === undefined) {
                        $pre.data("_originalCode", xfEditor.extractCodeText($code));
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
         * @returns {xfEditor}
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

                    // ★ v1.17.17: 优先读取存储的原始代码，fallback 用 extractCodeText 保留完整格式
                    var code = $pre.data("_originalCode");
                    if (!code) {
                        var $code = $pre.find("code");
                        code = $code.length > 0
                            ? xfEditor.extractCodeText($code)
                            : xfEditor.extractCodeText($pre.clone().find("." + classPrefix + "code-copy-btn").remove().end());
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
         * @returns {xfEditor}             返回xfEditor的实例对象
         */
        
        katexRender : function() {
            
            // 仅在编辑器实例尚未初始化完成且非异步回调时跳过
            // 异步加载回调中 timer 可能尚未赋值，这种情况下应继续渲染
            if (this.timer === null && typeof xfEditor.$katex === "undefined")
            {
                return this;
            }
            
            var _this = this;
            this.previewContainer.find("." + xfEditor.classNames.tex).each(function(){
                var tex  = $(this);
                var texCode = tex.text().trim();
                // 自动检测 displayMode：公式含 \begin{...}（矩阵、行列式等）使用块级模式
                var isBlock = /^\\begin\{/.test(texCode);
                xfEditor.$katex.render(texCode, tex[0], { throwOnError: false, displayMode: isBlock });
                
                // 双击公式可定位到源码中进行编辑
                tex.attr("title", "双击编辑公式").css("cursor", "pointer");
                tex.off("dblclick.xf_editor-tex").on("dblclick.xf_editor-tex", function() {
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
         * @returns {xfEditor}             返回xfEditor的实例对象
         */
        
        flowChartAndSequenceDiagramRender : function() {
            var $this            = this;
            var settings         = this.settings;
            var previewContainer = this.previewContainer;
            
            if (xfEditor.isIE8) {
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
                    
            return this;
        },
        
        /**
         * 注册键盘快捷键处理
         * Register CodeMirror keyMaps (keyboard shortcuts).
         * 
         * @param   {Object}    keyMap      KeyMap key/value {"(Ctrl/Shift/Alt)-Key" : function(){}}
         * @returns {xfEditor}              return this
         */
        
        registerKeyMaps : function(keyMap) {
            
            var _this           = this;
            var cm              = this.cm;
            var settings        = this.settings;
            var toolbarHandlers = xfEditor.toolbarHandlers;
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
                for (var k in xfEditor.keyMaps)
                {
                    var _keyMap = xfEditor.keyMaps[k];
                    var handle = (typeof _keyMap === "string") ? toolbarHandlers[_keyMap].bind(_this) : _keyMap.bind(_this);
                    
                    if ($.inArray(k, ["F9", "F10", "F11"]) < 0 && $.inArray(k, disabledKeyMaps) < 0)
                    {
                        var _map = {};
                        _map[k] = handle;

                        cm.addKeyMap(_map);
                    }
                }
                
                $(window).on("keydown.xf_editor-fkeys", function(event) {
                    
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
                editor.addClass("xf_editor-focus");
                settings.onfocus.call(_this, _cm, e);
            });
            
            cm.on("blur", function(_cm, e) {
                editor.removeClass("xf_editor-focus");
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
         * @returns {xfEditor}             返回xfEditor的实例对象
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
            $(window).on("load.xf_editor-pageload", function() {
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
         * @returns {xfEditor}             返回xfEditor的实例对象
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
         * @returns {xfEditor}              返回xfEditor的实例对象
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
         * @returns {xfEditor}                    返回xfEditor的实例对象
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
                    // CSS 中 .xf_editor-fullscreen 已通过 !important 控制尺寸
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
         * @returns {xfEditor}     返回xfEditor的实例对象
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
            
            var marked          = xfEditor.$marked;
            var markdownToC     = this.markdownToC = [];            
            var rendererOptions = this.markedRendererOptions = this._buildRendererOptions(settings, {
                toc           : settings.toc,
                tocm          : settings.tocm,
                tocStartLevel : settings.tocStartLevel
            });
            
            var markedOptions = this.markedOptions = {
                renderer    : xfEditor.markedRenderer(markdownToC, rendererOptions),
                gfm         : true,
                tables      : true,
                breaks      : true,
                pedantic    : false,
                sanitize    : false,  // 关闭 sanitize 以确保 HTML 注释占位符不被转义
                smartLists  : true,
                smartypants : true
            };
            
            marked.setOptions(markedOptions);

            var newMarkdownDoc = xfEditor._renderMarkdownPipeline(cmValue, markedOptions, rendererOptions, settings);
            
            this.markdownTextarea.text(cmValue);
            
            cm.save();
            
            if (settings.saveHTMLToTextarea) 
            {
                this.htmlTextarea.text(newMarkdownDoc);
            }
            
            if(settings.watch || (!settings.watch && state.preview))
            {
                // ★ v1.17.1: DOM 更新期间锁定同步滚动，防止内容变化触发反向同步
                this._applyingDomChanges = true;
                clearTimeout(this.__syncDomLockTimer);
                
                // ★ v1.17.1: 注入 data-sign 块签名用于精准行号映射
                if (settings.syncScroll) {
                    var totalEditorLines = (cmValue.match(/\n/g) || []).length + 1;
                    newMarkdownDoc = xfEditor.addBlockSignatures(newMarkdownDoc, totalEditorLines);
                }
                
                previewContainer.html(newMarkdownDoc);

                // ★ v1.17.1: 延迟解锁滚动同步，等待 DOM 高度稳定
                this.__syncDomLockTimer = setTimeout(function() {
                    _this._applyingDomChanges = false;
                }, 100);

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
                    
                    xfEditor.markdownToCRenderer(markdownToC, tocContainer, settings.tocDropdown, settings.tocStartLevel);
            
                    if (settings.tocDropdown || tocContainer.find("." + this.classPrefix + "toc-menu").length > 0)
                    {
                        xfEditor.tocDropdownMenu(tocContainer, (settings.tocTitle !== "") ? settings.tocTitle : this.lang.tocTitle);
                    }
            
                    if (settings.tocContainer !== "")
                    {
                        previewContainer.find(".markdown-toc").css("border", "none");
                    }
                }
                
                if (settings.tex)
                {
                    if (!xfEditor.kaTeXLoaded && settings.autoLoadModules) 
                    {
                                    _this._asyncLoadCount++;
                        xfEditor.loadKaTeX(settings.path, function() {
                            if (typeof katex !== "undefined") {
                                xfEditor.$katex = katex;
                                xfEditor.kaTeXLoaded = true;
                            }
                            _this.katexRender();
                            _this._asyncLoadCount--;
                            _this._checkAllAsyncLoaded();
                        });
                    } 
                    else 
                    {
                        if (typeof katex !== "undefined") {
                            xfEditor.$katex = katex;
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
                            xfEditor.loadScript(settings.path + "raphael.min", function() {
                                xfEditor.loadScript(settings.path + "underscore.min", function() {
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
                                        xfEditor.loadScript(settings.path + "flowchart.min", function() {
                                            xfEditor.loadScript(settings.path + "jquery.flowchart.min", checkDone);
                                        });
                                    }
                                    if (hasSequence && typeof Diagram === "undefined") {
                                        pending++;
                                        xfEditor.loadScript(settings.path + "sequence-diagram.min", checkDone);
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
                    var echartsElements = previewContainer.find(".xf_editor-echarts");
                    if (echartsElements.length > 0) {
                        if (typeof echarts === "undefined") {
                            _this._asyncLoadCount++;
                            xfEditor.loadScript(settings.path + "echarts.min", function() {
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
                if (settings.syncScroll) {
                    // ★ v1.17.7: 确保首次绑定
                    if (!_this._scrollSyncBound) {
                        _this.bindSyncScroll();
                    }
                    // ★ v1.17.7: 内容变更后强制刷新同步状态
                    // 即使 bindSyncScroll 已绑定，内容变更后也需要：
                    // 1. 重新无效化锚点缓存（因为 data-sign 已变化）
                    // 2. 延迟触发一次编辑区→预览区的同步滚动
                    if (_this._syncState) {
                        // 清除上一次的延迟同步定时器，防止累积
                        if (_this.__lastSyncTimer) {
                            clearTimeout(_this.__lastSyncTimer);
                            _this.__lastSyncTimer = null;
                        }
                        // 延迟确保 DOM 已稳定（如 KaTeX/flowchart 等异步渲染）
                        var _syncTimer = setTimeout(function() {
                            if (!_this._syncState || _this._syncState.suppressAllSync) return;
                            if (_this._applyingDomChanges) return;
                            if (!_this.cm) return;
                            try {
                                var cm = _this.cm;
                                var cmInfo = cm.getScrollInfo();
                                var cmMaxScroll = Math.max(0, cmInfo.height - cmInfo.clientHeight);
                                if (cmMaxScroll <= 0) return;
                                var scrollRatio = cmInfo.top / cmMaxScroll;
                                var totalLines = cm.lineCount();
                                var centerLine = Math.round(scrollRatio * (totalLines - 1));
                                // ★ 通过内部函数快速同步
                                if (_this._syncState && typeof _this._syncState._refreshSync === 'function') {
                                    _this._syncState._refreshSync(centerLine);
                                } else {
                                    // 回退：直接调用 xfEditor.resize() 触发重绘
                                    if (typeof _this._syncState._invalidateAnchors === 'function') {
                                        _this._syncState._invalidateAnchors();
                                    }
                                }
                            } catch(e) {}
                        }, 250);
                        // 存储 timer 以便清理
                        _this.__lastSyncTimer = _syncTimer;
                    }
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
                if ($table.hasClass("xf_editor-table-editable")) {
                    return;
                }
                $table.addClass("xf_editor-table-editable");
                
                var $wrapper = $('<div class="xf_editor-table-wrapper"></div>');
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
                    '<div class="xf_editor-table-col-controls">',
                    '<a class="xf_editor-table-btn" data-action="add-col-before" title="左侧插入列">+</a>',
                    '<a class="xf_editor-table-btn" data-action="del-col" title="删除列">-</a>',
                    '<a class="xf_editor-table-btn" data-action="add-col-after" title="右侧插入列">+</a>',
                    '</div>'
                ].join("");
                
                // 添加行控制按钮（定位在选中行左侧）
                var rowControls = [
                    '<div class="xf_editor-table-row-controls">',
                    '<a class="xf_editor-table-btn" data-action="add-row-before" title="上方插入行">+</a>',
                    '<a class="xf_editor-table-btn" data-action="del-row" title="删除行">-</a>',
                    '<a class="xf_editor-table-btn" data-action="add-row-after" title="下方插入行">+</a>',
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
                    previewContainer.find(".xf_editor-table-col-controls, .xf_editor-table-row-controls").hide();
                    
                    // 计算列控件位置（显示在选中列上方）
                    var colTop = relTop - 28;
                    var colLeft = relLeft;
                    var colWidth = currentCell.outerWidth();
                    
                    // 计算行控件位置（显示在选中行左侧）
                    var rowTop = relTop;
                    var rowLeft = relLeft - 32;
                    var rowHeight = Math.max(currentCell.outerHeight(), 60);
                    
                    // 列控件：显示在单元格上方
                    $wrapper.find(".xf_editor-table-col-controls").css({
                        top: Math.max(colTop, -28),   // 防止过度偏移
                        left: colLeft,
                        width: colWidth,
                        display: "flex"
                    });
                    // 行控件：显示在单元格左侧
                    $wrapper.find(".xf_editor-table-row-controls").css({
                        top: rowTop,
                        left: Math.max(rowLeft, -32), // 防止过度偏移
                        height: rowHeight,
                        display: "flex"
                    });
                });
                
                $wrapper.find(".xf_editor-table-btn").on("click", function(e) {
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
            $(document).off("click.xf_editor-table").on("click.xf_editor-table", function(e) {
                if (!$(e.target).closest(".xf_editor-table-wrapper").length) {
                    previewContainer.find(".xf_editor-table-col-controls, .xf_editor-table-row-controls").hide();
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
            
            if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
            
            // ★ v1.17.4: 暂停双向同步滚动
            if (this.suspendSyncScroll) this.suspendSyncScroll();
            
            var cursor = cm.getCursor();
            var editorScroll = cm.getScrollInfo();
            var previewScroll = this.preview.scrollTop();
            
            cm.setValue(lines.join("\n"));
            
            if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
            
            cm.setCursor(Math.min(cursor.line, lines.length - 1), cursor.ch);
            
            cm.scrollTo(editorScroll.left, editorScroll.top);
            this.timer = 0;
            
            this.save();
            
            this.preview.scrollTop(previewScroll);
            this.timer = null;
            
            // ★ v1.17.4: 恢复同步滚动
            var _thisTable = this;
            setTimeout(function() {
                if (_thisTable.resumeSyncScroll) _thisTable.resumeSyncScroll();
            }, 150);
            
            this.settings.ontablechange.call(this, action, rowIndex, colIndex);
        },
        
        /**
         * Initialize image resize in preview area
         */
        initImageResize : function() {
            var _this = this;
            var previewContainer = this.previewContainer;
            var cm = this.cm;
            
            // ★ v1.17.8: 冲突 prevention — 防止重复绑定文档级事件
            $(document).off("mousemove.xf_editor-img").off("mouseup.xf_editor-img");
            
            var srcOccurrenceCounter = {};
            var _resizeState = null; // { img, wrapper, startX, startY, startWidth, startHeight, imgSrc }
            
            // ★ v1.17.8: 全局文档级事件 — 只绑定一次（避免 .each 循环内累积）
            $(document).on("mousemove.xf_editor-img", function(e) {
                if (!_resizeState) return;
                var s = _resizeState;
                var newWidth = s.startWidth + (e.clientX - s.startX);
                var newHeight = s.startHeight + (e.clientY - s.startY);
                var ratio = s.startWidth / s.startHeight;
                
                if (e.shiftKey) {
                    newHeight = newWidth / ratio;
                }
                
                if (newWidth > 20) s.img.css("width", newWidth + "px");
                if (newHeight > 20) s.img.css("height", newHeight + "px");
            });
            
            $(document).on("mouseup.xf_editor-img", function(e) {
                if (!_resizeState) return;
                var s = _resizeState;
                _resizeState = null;
                
                // ★ v1.17.8: 恢复双向同步
                if (_this.resumeSyncScroll) _this.resumeSyncScroll();
                
                var finalWidth = Math.round(s.img.width());
                var finalHeight = Math.round(s.img.height());
                var occIdx = parseInt(s.wrapper.attr("data-image-occurrence"), 10) || 1;
                _this.modifyImageSizeInMarkdown(s.imgSrc, s.img.attr("alt"), finalWidth, finalHeight, occIdx);
            });
            
            previewContainer.find("img").each(function() {
                var $img = $(this);
                if ($img.hasClass("xf_editor-img-resizable")) {
                    return;
                }
                $img.addClass("xf_editor-img-resizable");
                
                var imgSrc = $img.attr("src") || "";
                var cleanSrc = imgSrc.replace(/\s*=\s*\d+x\d+/, "").trim();
                var srcKey = cleanSrc;
                srcOccurrenceCounter[srcKey] = (srcOccurrenceCounter[srcKey] || 0) + 1;
                var occurrence = srcOccurrenceCounter[srcKey];
                
                var $wrapper = $('<div class="xf_editor-img-wrapper" style="display:inline-block;position:relative;"></div>');
                $img.wrap($wrapper);
                $wrapper = $img.parent();
                $wrapper.attr("data-image-occurrence", occurrence);
                $wrapper.attr("data-image-src", srcKey);
                
                var handle = $('<div class="xf_editor-img-resize-handle" title="拖拽调整尺寸"></div>');
                $wrapper.append(handle);
                
                handle.on("mousedown", function(e) {
                    // ★ v1.17.8: 拖拽期间暂停双向同步 — 预览区是主控区
                    if (_this.suspendSyncScroll) _this.suspendSyncScroll();
                    
                    _resizeState = {
                        img: $img,
                        wrapper: $wrapper,
                        startX: e.clientX,
                        startY: e.clientY,
                        startWidth: $img.width(),
                        startHeight: $img.height(),
                        imgSrc: imgSrc
                    };
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                // 双击图片可编辑尺寸
                $img.off("dblclick.xf_editor-img").on("dblclick.xf_editor-img", function(e) {
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

            // 正则说明：匹配 ![alt](url "title")<W,H> 或 ![alt](url)<W,H> 或 ![alt](url)
            // - [^\]]* 匹配 alt 文本
            // - ([^)\s]+) 匹配 URL（不含空格和右括号）
            // - (?:\s+"[^"]*")? 可选匹配标题部分
            // - (?:<(\d+),\s*(\d+)>)? 可选匹配尺寸后缀
            
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
                    if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
                
                // ★ v1.17.4: 暂停双向同步滚动，防止内容更新触发滚动跳转
                if (this.suspendSyncScroll) this.suspendSyncScroll();
                
                var editorScroll = cm.getScrollInfo();
                var previewScroll = this.preview.scrollTop();
                
                cm.setValue(newMarkdown);
                
                    if (this.timer && this.timer !== 0) { clearTimeout(this.timer); this.timer = null; }
                
                // 保存编辑器滚动位置（需在 save 前恢复）
                cm.scrollTo(editorScroll.left, editorScroll.top);
                this.timer = 0;
                
                // save() 会触发 previewContainer.html() 重渲染，重置预览滚动位置
                this.save();
                
                // ★ 恢复预览区滚动位置
                this.preview.scrollTop(previewScroll);
                this.timer = null;
                
                // ★ v1.17.4: 恢复同步滚动（延迟确保 DOM 稳定后重建锚点）
                var _thisImg = this;
                setTimeout(function() {
                    if (_thisImg.resumeSyncScroll) _thisImg.resumeSyncScroll();
                }, 150);
                
                this.settings.onimagechange.call(this, src, width, height);
            }
        },
        
        /**
         * Initialize ECharts in preview area
         */
        initECharts : function() {
            var previewContainer = this.previewContainer;
            var editorTheme    = this.settings.theme;

            previewContainer.find(".xf_editor-echarts").each(function() {
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
                    try {
                        // 主题优先级：用户显式设置 > 编辑器主题 > 无主题(默认)
                        var chartTheme = config.theme || editorTheme || undefined;
                        var chartInstance = echarts.init(this, chartTheme);
                        var option = {
                            title: config.title || {},
                            tooltip: config.tooltip || {},
                            series: config.series || []
                        };
                        // 只在显式定义时添加 legend/radar，避免空对象干扰无坐标轴图表
                        if (config.legend !== undefined) option.legend = config.legend;
                        if (config.radar !== undefined) option.radar = config.radar;

                        var chartType = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                        var noAxisTypes = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst", "tree"];
                        if (noAxisTypes.indexOf(chartType) === -1) {
                            option.xAxis = config.xAxis || {};
                            option.yAxis = config.yAxis || {};
                        }

                        // 智能 tooltip 默认值：无坐标轴类型使用 item，有坐标轴使用 axis
                        if (config.tooltip === undefined) {
                            var hasAxis = (noAxisTypes.indexOf(chartType) === -1);
                            option.tooltip = { trigger: hasAxis ? "axis" : "item" };
                        }
                        // 传入其他常用顶级配置
                        if (config.backgroundColor !== undefined) option.backgroundColor = config.backgroundColor;
                        if (config.grid !== undefined) option.grid = config.grid;
                        if (config.dataZoom !== undefined) option.dataZoom = config.dataZoom;
                        if (config.visualMap !== undefined) option.visualMap = config.visualMap;
                        if (config.toolbox !== undefined) option.toolbox = config.toolbox;
                        chartInstance.setOption(option);
                        // 确保图表在容器内正确渲染
                        chartInstance.resize();
                        $chart.attr("data-initialized", "true");
                    } catch(e) {
                        // 图表初始化失败（如主题未注册等），静默跳过
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] ECharts init failed:", e.message);
                        }
                    }

                    // 使用命名空间+debounce避免累积大量 resize handler
                    // 每个 chart instance 只绑定一次 resize
                    if (!$chart.attr("data-resize-bound")) {
                        $chart.attr("data-resize-bound", "true");
                        var resizeTimer = null;
                        // 使用 chart id 作为命名空间后缀，便于清理（destroy 时统一解绑）
                        var ecNsId = $chart.attr("id") || ("ec-" + Date.now());
                        $(window).on("resize.xf_editor-echarts." + ecNsId, function() {
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
                $panel.find(".xf_editor-echarts").each(function() {
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
                        try {
                            var chartTheme2 = config.theme || _this.settings.theme || undefined;
                            var chartInstance2 = echarts.init(this, chartTheme2);
                            var option2 = {
                                title: config.title || {},
                                tooltip: config.tooltip || {},
                                series: config.series || []
                            };
                            if (config.legend !== undefined) option2.legend = config.legend;
                            if (config.radar !== undefined) option2.radar = config.radar;
                            var chartType2 = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                            var noAxisTypes2 = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst", "tree"];
                            if (noAxisTypes2.indexOf(chartType2) === -1) {
                                option2.xAxis = config.xAxis || {};
                                option2.yAxis = config.yAxis || {};
                            }
                            if (config.tooltip === undefined) {
                                var hasAxis2 = (noAxisTypes2.indexOf(chartType2) === -1);
                                option2.tooltip = { trigger: hasAxis2 ? "axis" : "item" };
                            }
                            if (config.backgroundColor !== undefined) option2.backgroundColor = config.backgroundColor;
                            if (config.grid !== undefined) option2.grid = config.grid;
                            if (config.dataZoom !== undefined) option2.dataZoom = config.dataZoom;
                            if (config.visualMap !== undefined) option2.visualMap = config.visualMap;
                            if (config.toolbox !== undefined) option2.toolbox = config.toolbox;
                            chartInstance2.setOption(option2);
                            chartInstance2.resize();
                            $chart.attr("data-initialized", "true");
                        } catch(e) {
                            if (typeof console !== "undefined" && console.warn) {
                                console.warn("[xfEditor] ECharts tab-reinit failed:", e.message);
                            }
                        }
                        if (!$chart.attr("data-resize-bound")) {
                            $chart.attr("data-resize-bound", "true");
                            var resizeTimer2 = null;
                            var ecNsId2 = $chart.attr("id") || ("ec2-" + Date.now());
                            $(window).on("resize.xf_editor-echarts." + ecNsId2, function() {
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
                if (_this.settings.tex && typeof xfEditor.$katex !== "undefined") {
                    $panel.find(".xf_editor-tex").each(function() {
                        var $tex = $(this);
                        if ($tex.attr("data-initialized") === "true") return;
                        $tex.attr("data-initialized", "true");
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
                    $panel.find(".xf_editor-columns").each(function() {
                        var $cols = $(this);
                        if ($cols.attr("data-initialized") === "true") return;
                        var count = parseInt($cols.attr("data-count"), 10) || 2;
                        $cols.find(".xf_editor-column-divider").remove();
                        for (var ci = 1; ci < count; ci++) {
                            $cols.append('<div class="xf_editor-column-divider" style="position:absolute;top:8px;bottom:8px;width:0;transform:translateX(-50%);border-left:1px dashed #bbb;pointer-events:none;z-index:1"></div>');
                        }
                        $cols.attr("data-initialized", "true");
                    });
                }
            }
            
            previewContainer.find(".xf_editor-tabs").each(function() {
                var $tabs = $(this);
                if ($tabs.attr("data-initialized") === "true") {
                    return;
                }
                
                var $nav = $tabs.find(".xf_editor-tab-nav");
                var $body = $tabs.find(".xf_editor-tab-body");
                
                // 初次初始化时，对第一个（默认激活的）面板中的内容进行渲染
                var $firstPanel = $body.find(".xf_editor-tab-panel.active");
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
                    
                    $body.find(".xf_editor-tab-panel").removeClass("active");
                    var $panel = $body.find('.xf_editor-tab-panel[data-index="' + index + '"]');
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

            previewContainer.find(".xf_editor-columns").each(function() {
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

                $cols.find(".xf_editor-column-divider").remove();
                $cols.css("position", "relative");

                for (var i = 1; i < count; i++) {
                    var $divider = $('<div class="xf_editor-column-divider"></div>');
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
             * @param {jQuery} $pageBlock - The .xf_editor-page-block element
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
             * @param {jQuery} $pageBlock - The .xf_editor-page-block element
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
                var pageContent = $pageBlock.find(".xf_editor-page-content");
                
                // 边界检查：确保内容区域存在
                if (!pageContent.length) return;
                
                var watermark = $pageBlock.find(".xf_editor-page-watermark").detach();
                var headerEl = $pageBlock.find(".xf_editor-page-header");
                var footerEl = $pageBlock.find(".xf_editor-page-footer");
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
                var $measure = $('<div class="xf_editor-page-content" style="position:absolute;visibility:hidden;width:' + containerWidth + 'px;left:-9999px;"></div>');
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
                    resultHtml += '<div class="xf_editor-page-block xf_editor-page-split" data-paper="' + paperKey + '" data-page="' + pageNum + '" data-total="' + totalPages + '" style="width:' + containerWidth + 'px;min-height:' + pageHeight + 'px;margin-bottom:' + pageMargin + 'px;">';
                    
                    // Add header to each page
                    if (headerText) {
                        resultHtml += '<div class="xf_editor-page-header">' + headerText + '</div>';
                    }
                    
                    resultHtml += '<div class="xf_editor-page-content">' + pages[i].join("") + '</div>';
                    
                    // Add footer to each page with page number
                    if (footerTemplate) {
                        resultHtml += '<div class="xf_editor-page-footer">' + processFooterTemplate(footerTemplate, pageNum, totalPages) + '</div>';
                    }
                    
                    // Add watermark to last page only
                    if (i === totalPages - 1 && watermark.length) {
                        resultHtml += '<div class="xf_editor-page-watermark">' + paperKey + '</div>';
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
            previewContainer.find(".xf_editor-page-block").each(function() {
                splitPageContent($(this));
            });
        },

        /**
         * Initialize Tooltips in preview area (instance method)
         */
        initTooltips : function() {
            xfEditor.initTooltips(this.previewContainer);
        },
        
        /**
         * 聚焦光标位置
         * Focusing the cursor position
         * 
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        focus : function() {
            if (!this.cm) return this;
            this.cm.focus();

            return this;
        },
        
        /**
         * 设置光标的位置
         * Set cursor position
         * 
         * @param   {Object}    cursor 要设置的光标位置键值对象，例：{line:1, ch:0}
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        setCursor : function(cursor) {
            if (!this.cm) return this;
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
            if (!this.cm) return {line: 0, ch: 0};
            return this.cm.getCursor();
        },
        
        /**
         * 设置光标选中的范围
         * Set cursor selected ranges
         * 
         * @param   {Object}    from   开始位置的光标键值对象，例：{line:1, ch:0}
         * @param   {Object}    to     结束位置的光标键值对象，例：{line:1, ch:0}
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        setSelection : function(from, to) {
            if (!this.cm) return this;
        
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
            if (!this.cm) return "";
            return this.cm.getSelection();
        },

        /**
         * 获取字数统计
         * Get word count of editor content
         *
         * @returns {Object}         返回 { text: 总字符数, word: 中文词数/英文单词数 }
         */

        getWordCount : function() {
            if (!this.cm) return {text: 0, word: 0};
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
         * @returns {xfEditor}             返回xfEditor的实例对象
         */

        exportFile : function(filename, format) {
            format = format || "md";
            filename = filename || ("xf_editor-export-" + xfEditor.dateFormat());
            var content = "";

            if (!this.cm) return this;
            if (format === "html") {
                content = this.previewContainer.html();
            } else if (format === "txt") {
                content = this.cm.getValue().replace(/\n/g, "\r\n");
            } else {
                content = this.cm.getValue();
            }

            try {
                var blob = new Blob([content], { type: "text/" + format + ";charset=utf-8" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = filename + "." + format;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch(e) {
                // ★ v1.17.15-FIX: 旧浏览器降级方案 — 使用 data URI 下载
                var fallbackUrl = "data:text/" + format + ";charset=utf-8," + encodeURIComponent(content);
                var fa = document.createElement("a");
                fa.href = fallbackUrl;
                fa.download = filename + "." + format;
                fa.target = "_blank";
                document.body.appendChild(fa);
                fa.click();
                document.body.removeChild(fa);
            }

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
            if (!this.cm) return this;
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
            if (!this.cm) return [""];
            return this.cm.getSelections();
        },
        
        /**
         * 替换当前光标选中的文本或在当前光标处插入新字符
         * Replace the text at the current cursor selected or insert a new character at the current cursor position
         * 
         * @param   {String}    value  要插入的字符值
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        replaceSelection : function(value) {
            if (!this.cm) return this;
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        setMarkdown : function(md) {
            if (!this.cm) return this;
            this.cm.setValue(md || this.settings.markdown);
            
            return this;
        },
        
        /**
         * 获取编辑器的markdown源文档
         * Set xfEditor markdown/CodeMirror value
         * 
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        getMarkdown : function() {
            if (!this.cm) return "";
            return this.cm.getValue();
        },
        
        /**
         * 获取编辑器的源文档
         * Get CodeMirror value
         * 
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        getValue : function() {
            if (!this.cm) return "";
            return this.cm.getValue();
        },

        /**
         * 判断编辑器编辑区内容使用了哪些语法特性
         * Detect which syntax features are used in the editor content
         * 
         * @returns {Object}  返回键值对对象，键为特性名称，值为布尔值（true 表示已使用）
         * @example
         * var types = editor.getUseTypes();
         * // { echarts: true, katex: false, copybook: false, ... }
         */
        
        getUseTypes : function() {
            var md = this.getMarkdown() || '';
            if (!md.trim()) return {};

            var r = {};

            // ECharts 图表：```echarts
            r.echarts = /```echarts\b/.test(md);

            // KaTeX 科学公式：$$ 块级公式 或 $...$ 行内公式
            r.katex = /\$\$/.test(md) || /\$[^$\n\r]+\$/.test(md);

            // 字帖：[[tian: / [[mi: / [[pinyin:
            r.copybook = /\[\[(tian|mi|pinyin)\s*:/.test(md);

            // 流程图：```flow
            r.flowchart = /```flow\b/.test(md);

            // 时序图：```sequence
            r.sequenceDiagram = /```sequence\b/.test(md);

            // 任务列表：- [ ] 或 - [x]
            r.taskList = /^\s*[-*+]\s+\[[ x]\]/m.test(md);

            // 分页符：[========]
            r.pageBreak = /\[========\]/.test(md);

            // 多标签页：[[tabs]] / [[tab: / [[/tabs]]
            r.tabs = /\[\[\/?tabs\]\]|\[\[tab\s*:/.test(md);

            // 多列排版：[[columns: / [[/columns]]
            r.columns = /\[\[\/?columns[:\]]/.test(md);

            // 栅格布局：[[row]] / [[col: / [[/col]] / [[/row]]
            r.grid = /\[\[\/?row\]\]|\[\[\/?col[:\]]/.test(md);

            // 页面块：[[page:
            r.pageBlock = /\[\[page\s*:/.test(md);

            // 视频：[[video]]
            r.video = /\[\[video\]\]/.test(md);

            // 文件列表：[[file]]
            r.fileList = /\[\[file\]\]/.test(md);

            // 悬浮提示：[text](tooltip:...)
            r.tooltip = /\]\(tooltip\s*:/.test(md);

            // 拼音标注：{汉字|pinyin}
            r.pinyin = /\{[^}]+\|[^}]+\}/.test(md);

            // 上下标：~下标~ 或 ^上标^（排除 ~~ 删除线和 ^^ 尖括号）
            r.supsub = /(?<!\*)[~\^][^~\^\n\r]+[~\^](?!\*)/.test(md);

            // 文字对齐：-> / <- / 行首控制标记
            r.textAlign = /^[ \t]*(->|<-)/m.test(md);

            // Badge 标签：%badge:...%
            r.badge = /%badge\s*:[^%]+%/.test(md);

            // 脚注：[^label]
            r.footnote = /\[\^[^\]]+\][^:(]/m.test(md);

            // @提及链接：@username
            r.atLink = /(?<!\w)@[a-zA-Z0-9_\u4e00-\u9fa5]+/.test(md);

            // 邮件链接：<email> 或 [text](mailto:...)
            r.emailLink = /<[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}>/.test(md) ||
                          /\[[^\]]*\]\(mailto:/i.test(md);

            // 围栏代码块：```
            r.codeBlock = /```/.test(md);

            // 指定语言代码高亮：```lang（fence 后跟语言标识符）
            r.codeHighlight = /```[a-zA-Z#+\-][a-zA-Z0-9_+#-]*\s*[\n\r]/.test(md);

            // 表格：管道表格 |...|
            r.table = /^\s*\|[^\n\r]+\|[ \t]*$/m.test(md);

            // 图片：![...](...)
            r.image = /!\[[^\]]*\]\([^)]+\)/.test(md);

            // 引用块：> 行首
            r.blockquote = /^>\s/m.test(md);

            // 标题：# ~ ######
            r.headings = /^#{1,6}\s/m.test(md);

            return r;
        },

        /**
         * 设置编辑器的源文档
         * Set CodeMirror value
         * 
         * @param   {String}     value   set code/value/string/text
         * @returns {xfEditor}           返回xfEditor的实例对象
         */
        
        setValue : function(value) {
            this.cm.setValue(value);
            
            return this;
        },
        
        /**
         * 清空编辑器
         * Empty CodeMirror editor container
         * 
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        clear : function() {
            if (!this.cm) return this;
            this.cm.setValue("");

            return this;
        },

        /**
         * 保存草稿到浏览器本地存储
         * Save draft to browser localStorage
         *
         * @returns {xfEditor}         返回xfEditor的实例对象
         */

        saveDraft : function() {
            if (!this.settings.draftAutoSave || this.settings.readOnly || !this.cm) return this;

            var cmValue = this.cm.getValue();
            if (!cmValue || cmValue.trim() === "") return this;

            var draftKey = "xf_editor-draft-" + (this.id || "default");
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
         * @returns {xfEditor}         返回xfEditor的实例对象
         */

        clearDraft : function() {
            var draftKey = "xf_editor-draft-" + (this.id || "default");
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
         * @returns {xfEditor}         返回xfEditor的实例对象
         */

        showDraftRecovery : function() {
            if (!this.settings.draftAutoSave || this.settings.readOnly) return this;

            var draftKey = "xf_editor-draft-" + (this.id || "default");
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
            var dialogId = "xf_editor-draft-recovery-" + this.id;
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
                
                listHtml += '<div class="xf_editor-draft-item" data-index="' + i + '" title="点击恢复此版本 (' + dateStr + ')">' +
                    '<span class="xf_editor-draft-time" title="' + dateStr + '">' + timeLabel + '</span>' +
                    '<span class="xf_editor-draft-preview">' + previewText + '</span>' +
                    '</div>';
            }

            // 创建遮罩层
            var $mask = $('<div id="' + maskId + '" class="xf_editor-draft-mask" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99998;opacity:0;transition:opacity 300ms ease;"></div>');
            $("body").append($mask);

            var lang = _this.settings.lang;
            var dialogHtml = '<div id="' + dialogId + '" class="xf_editor-dialog xf_editor-draft-dialog" style="display:block;opacity:0;transform:scale(0.9) translate(-50%, -50%);transition:all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);">' +
                '<div class="xf_editor-dialog-header">' +
                '<strong class="xf_editor-dialog-title">' + (lang.toolbar.restoreDraft || "恢复草稿") + ' <span style="font-size:12px;font-weight:normal;opacity:0.8;">(' + draftCount + ')</span></strong>' +
                '<a href="javascript:;" class="xf_editor-dialog-close" title="关闭">&times;</a>' +
                '</div>' +
                '<div class="xf_editor-dialog-content">' +
                '<p class="xf_editor-draft-tip">' + (lang.toolbar.draftRestoreTip || "检测到以下自动保存的草稿，点击任意草稿可恢复到编辑器：") + '</p>' +
                '<div class="xf_editor-draft-list">' + listHtml + '</div>' +
                '</div>' +
                '<div class="xf_editor-dialog-footer">' +
                '<button type="button" class="xf_editor-draft-clear" title="清除所有保存的草稿">' + (lang.toolbar.draftClearBtn || "清除所有") + '</button>' +
                '<button type="button" class="xf_editor-draft-cancel" title="关闭此对话框">' + (lang.toolbar.draftCancelBtn || "暂不恢复") + '</button>' +
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
                $(document).off("keydown.xfEditorDraft");
                $(window).off("resize.xfEditorDraft");
            };

            $dialog.find(".xf_editor-dialog-close, .xf_editor-draft-cancel").on("click", function() {
                closeDialog(true);
            });

            $dialog.find(".xf_editor-draft-clear").on("click", function() {
                // 添加确认提示
                if (draftCount > 0 && !confirm("确定要清除所有 " + draftCount + " 个草稿吗？此操作不可恢复。")) {
                    return;
                }
                _this.clearDraft();
                closeDialog(true);
            });

            $dialog.find(".xf_editor-draft-item").on("click", function() {
                var $item = $(this);
                var idx = parseInt($item.data("index"), 10);
                
                // 添加选中效果
                $item.css({
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff"
                });
                $item.find(".xf_editor-draft-time").css({
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff"
                });
                $item.find(".xf_editor-draft-preview").css("color", "#fff");
                
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

            $(document).on("keydown.xfEditorDraft", function(e) {
                if (e.keyCode === 27) {
                    closeDialog(true);
                }
            });

            // 窗口大小改变时重新居中
            $(window).on("resize.xfEditorDraft", function() {
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
         *   1. 必要的 CSS 样式（内联，从 xfEditor.css / xfEditor.preview.css 中提取）
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
         * @param {Boolean|Object} [options] 可以传入布尔值控制压缩 (getHTML(true))，或传入配置对象
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
         * @param {Boolean} [options.minify=true]  是否压缩输出
         * @returns {String} 完整 HTML 文档字符串
         */
        getHTML : function(options) {
            // ★ 支持 getHTML(true/false) 布尔值简写
            if (typeof options === 'boolean') {
                options = { minify: options };
            }
            var opts = $.extend({
                includeStyles    : true,
                includeScripts   : true,
                minify           : true   // ★ 默认压缩输出以减少存储体积
            }, options || {});
            
            // 获取预览区原始 HTML
            var rawHTML = this.getPreviewedHTML();
            
            // 如果没有内容，尝试从 Markdown 渲染
            if (!rawHTML || rawHTML.trim() === '') {
                var markdownText = this.getMarkdown();
                if (markdownText) {
                    var settings = this.settings;
                    var rendererOptions = this._buildRendererOptions(settings, {toc: false, tocm: false});
                    var markedOptions = {
                        renderer: xfEditor.markedRenderer([], rendererOptions),
                        gfm: settings.gfm, tables: true, breaks: true,
                        pedantic: false, sanitize: false,
                        smartLists: true, smartypants: true
                    };
                    rawHTML = xfEditor._renderMarkdownPipeline(markdownText, markedOptions, rendererOptions, settings);
                }
            }
            
            // 清理 HTML 中的内部初始化标记，确保独立使用时纯 JS 脚本可以重新初始化所有组件
            rawHTML = rawHTML
                .replace(/\sdata-tooltip-initialized="true"/g, '')
                .replace(/\sdata-initialized="true"/g, '')
                .replace(/\sdata-resize-bound="true"/g, '')
                .replace(/\sdata-fc-initialized="true"/g, '')
                .replace(/\sdata-sd-initialized="true"/g, '')
                .replace(/\sdata-xfe-initialized="true"/g, '');
            
            // ★ 移除旧版的代码复制按钮（纯 HTML 无事件），让 _getInitScripts 的 initCodeCopy 重新创建
            rawHTML = rawHTML.replace(/<span\b[^>]*class="[^"]*\bxf_editor-code-copy-btn\b[^"]*"[^>]*>[\s\S]*?<\/span>/g, '');
            
            // ★ 移除所有 jQuery .data() 留下的 attr 数据标记（独立页面不需要）
            rawHTML = rawHTML
                .replace(/\sdata-_copyBtnReady="true"/g, '')
                .replace(/\sdata-_originalCode="[^"]*"/g, '')
                .replace(/<\!--\s*\[xf_editor:protected\]\s*-->/g, '')
                .replace(/<\!--\s*\[\/xf_editor:protected\]\s*-->/g, '');
            
            // 统一检测一次功能特性，避免 _getCoreStyles 和 _getInitScripts 重复扫描
            var featureFlags = opts.includeStyles || opts.includeScripts ? this._detectFeatures(rawHTML) : {};
            this._lastFeatureFlags = featureFlags;
            
            var inlineStyles = "";
            var inlineScripts = "";
            if (opts.includeStyles) {
                inlineStyles = this._getCoreStyles(rawHTML, featureFlags);
            }
            if (opts.includeScripts) {
                inlineScripts = this._getInitScripts(rawHTML, featureFlags);
            }
            
            // ★ v1.17.14: getHTML 输出优化
            // - minify=true（默认）：移除多余空白，压缩体积，适合存储/传输
            // - minify=false：保持可读格式，适合调试
            // 输出：不带 html/head/body 标签的独立可用网页内容
            // 结构：style 标签 + 内容 div + script 标签，可直接嵌入任意页面使用
            // 注意：不使用外部 CSS/JS 引用、不使用 @font-face CDN，完全自包含
            var html = '';
            var nl = opts.minify ? '' : '\n';
            var sp = opts.minify ? '' : '  ';
            
            if (opts.includeStyles && inlineStyles) {
                // minify 模式下压缩 CSS：移除注释、合并空白、精简分号后空格
                var cssOutput = opts.minify
                    ? inlineStyles.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,>])\s*/g, '$1').trim()
                    : inlineStyles;
                html += '<style>' + nl + cssOutput + nl + '</style>' + nl;
            }
            
            html += '<div class="markdown-body xf_editor-html-preview">' + nl;
            // minify 模式下，精简 HTML 空白（保留 pre/code/textarea 内的内容不变）
            var contentHtml = rawHTML || "";
            if (opts.minify) {
                // 保护 pre/textarea 内容区域，只压缩它们之外的空白
                var protectedBlocks = [];
                contentHtml = contentHtml.replace(/(<(pre|textarea)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, function(m, open, tag, body, close) {
                    protectedBlocks.push(m);
                    return '\x00PROTECT' + (protectedBlocks.length - 1) + '\x00';
                });
                // 压缩 HTML 空白
                contentHtml = contentHtml.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
                // 还原保护块
                contentHtml = contentHtml.replace(/\x00PROTECT(\d+)\x00/g, function(_, idx) {
                    return protectedBlocks[parseInt(idx, 10)];
                });
            }
            html += contentHtml + nl;
            html += '</div>' + nl;
            
            if (opts.includeScripts && inlineScripts) {
                // minify 模式下压缩 JS：移除单行注释、合并空白
                var jsOutput = opts.minify
                    ? inlineScripts
                        .replace(/\/\/.*$/gm, '')
                        .replace(/\/\*[\s\S]*?\*\//g, '')
                        .replace(/\n\s*\n/g, '\n')
                        .replace(/^\s+|\s+$/gm, '')
                        .replace(/\n/g, '')
                    : inlineScripts;
                html += '<script>' + nl + jsOutput + nl + '<\/script>' + nl;
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
                grid               : settings.grid,
                pageBlock          : settings.pageBlock,
                tooltip            : settings.tooltip,
                copybook           : settings.copybook,
                video              : settings.video,
                fileList           : settings.fileList
            }, overrides || {});
        },

        /**
         * 检测 HTML 内容中实际使用了哪些功能特性（用于按需输出 CSS/JS）
         * @private
         * @param {String} html 已渲染的 HTML 内容
         * @returns {Object} 特性标记对象
         */
        _detectFeatures : function(html) {
            if (!html) return {};
            // 一次性计算所有检测结果，避免重复正则匹配
            var f = {};
            // KaTeX 公式（含块级和行内两种形式）
            f.katex = /class=["'][^"']*katex[ "']/.test(html) || html.indexOf('class="katex"') >= 0 || /class=["'][^"']*\bkatex-display\b/.test(html);
            // 字帖
            f.copybook = html.indexOf('xf_editor-copybook') >= 0;
            // 拼音标注
            f.pinyin = html.indexOf('xf_editor-pinyin') >= 0;
            // 上下标（supsub）
            f.supsub = html.indexOf('xf_editor-supsub') >= 0;
            // Tooltip 悬浮提示
            f.tooltip = html.indexOf('xf_editor-tooltip-trigger') >= 0;
            // Tabs 多标签
            f.tabs = html.indexOf('xf_editor-tabs') >= 0;
            // 多列排版
            f.columns = html.indexOf('xf_editor-columns') >= 0;
            // 栅格布局
            f.grid = html.indexOf('xf_editor-row') >= 0;
            // 脚注
            f.footnotes = html.indexOf('xf_editor-footnote') >= 0;
            // ECharts 图表
            f.echarts = html.indexOf('xf_editor-echarts') >= 0 || html.indexOf('_echarts_instance_') >= 0;
            // 视频播放器
            f.video = html.indexOf('xf_editor-video-player') >= 0 || /<video\b/.test(html);
            // 文件列表
            f.fileList = html.indexOf('xf_editor-file-list') >= 0;
            // 目录（TOC）
            f.toc = html.indexOf('markdown-toc') >= 0;
            // 代码块（含复制按钮）— 检测 <pre> 标签存在性
            f.codeBlock = /<pre\b/.test(html);
            // 代码高亮（prettyprint）— 检测 prettyprint class 和 linenums
            f.prettyprint = html.indexOf('prettyprint') >= 0 || html.indexOf('linenums') >= 0;
            // 流程图/时序图
            f.flowchart = html.indexOf('flowchart') >= 0 || html.indexOf('sequence-diagram') >= 0;
            // 任务列表
            f.taskList = html.indexOf('task-list-item') >= 0 || html.indexOf('task-list-item-checkbox') >= 0;
            // 分页线
            f.pageBreak = html.indexOf('xf_editor-page-break') >= 0;
            // 文字对齐
            f.textAlign = html.indexOf('xf_editor-text-align') >= 0;
            // 表格
            f.table = /<table\b/.test(html);
            // 图片（用于检测需要调整图片样式的场景）
            f.image = /<img\b/.test(html);
            // 字帖图标（SVG icon）
            f.copybookIcons = html.indexOf('xf_editor-icon-copybook') >= 0 ||
                html.indexOf('xf_editor-icon-tian') >= 0 ||
                html.indexOf('xf_editor-icon-mi') >= 0 ||
                html.indexOf('xf_editor-icon-pinyin') >= 0;
            // Badge 标签（内联徽章）
            f.badge = /class=["'][^"']*\bbadge\b/.test(html);
            // 块引用
            f.blockquote = /<blockquote\b/.test(html);
            // 标题
            f.headings = /<h[1-6]\b/.test(html);
            return f;
        },
        
        /**
         * 获取最近一次 getHTML() 调用的特性检测结果（调试用）
         * 返回各功能特性的 true/false 标记对象
         * @public
         * @returns {Object} 特性标记对象，无调用记录时返回空对象
         */
        getDetectedFeatures : function() {
            return $.extend({}, this._lastFeatureFlags || {});
        },

        /**
         * 获取核心 CSS 样式（内联版本，用于 getHTML() 输出独立页面）
         * 根据 HTML 内容按需输出，不包含未使用功能的 CSS
         * @private
         * @param {String} [html] 已渲染的 HTML 内容，用于按需检测
         * @param {Object} [features] 预检测的特性标记对象（避免重复扫描）
         * @returns {String}
         */
        _getCoreStyles : function(html, features) {
            var f = features || this._detectFeatures(html);
            var c=[];
            // ═══════════════════════════════════════════════
            // ★ 基础样式（始终输出，确保与预览区完全一致）
            // ═══════════════════════════════════════════════
            c.push('.markdown-body{text-align:left;font-size:14px;line-height:1.6;color:#24292e;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",Helvetica,Arial,sans-serif;}');
            c.push('.markdown-body>*:first-child{margin-top:0!important;}.markdown-body>*:last-child{margin-bottom:0!important;}');
            c.push('.markdown-body img,.markdown-body video,.markdown-body iframe,.markdown-body svg{max-width:100%!important;height:auto;box-sizing:border-box;}');
            c.push('.markdown-body table{display:block;max-width:100%;overflow-x:auto;word-break:normal;-webkit-overflow-scrolling:touch;}');
            c.push('.markdown-body a{color:#0366d6;text-decoration:none;}.markdown-body a:hover{text-decoration:underline;}');
            c.push('.markdown-body strong{font-weight:600;}.markdown-body em{font-style:italic;}');
            c.push('.markdown-body h1,.markdown-body h2,.markdown-body h3,.markdown-body h4,.markdown-body h5,.markdown-body h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}');
            c.push('.markdown-body h1{font-size:2em;padding-bottom:0.3em;border-bottom:1px solid #eaecef;}.markdown-body h2{font-size:1.5em;padding-bottom:0.3em;border-bottom:1px solid #eaecef;}.markdown-body h3{font-size:1.25em;}.markdown-body h4{font-size:1em;}.markdown-body h5{font-size:0.875em;}.markdown-body h6{font-size:0.85em;color:#6a737d;}');
            c.push('.markdown-body p{margin-top:0;margin-bottom:16px;}');
            c.push('.markdown-body blockquote{margin:0 0 16px;padding:0 1em;color:#6a737d;border-left:0.25em solid #dfe2e5;}');
            c.push('.markdown-body blockquote>:first-child{margin-top:0;}.markdown-body blockquote>:last-child{margin-bottom:0;}');
            c.push('.markdown-body ul,.markdown-body ol{padding-left:2em;margin-top:0;margin-bottom:16px;}');
            c.push('.markdown-body ul ul,.markdown-body ul ol,.markdown-body ol ol,.markdown-body ol ul{margin-top:0;margin-bottom:0;}');
            c.push('.markdown-body li{word-wrap:break-all;}.markdown-body li>p{margin-top:16px;}.markdown-body li+li{margin-top:0.25em;}');
            c.push('.markdown-body img{max-width:100%;box-sizing:border-box;}.markdown-body img[align=right]{padding-left:20px;}.markdown-body img[align=left]{padding-right:20px;}');
            c.push('.markdown-body hr{height:0.25em;padding:0;margin:24px 0;background-color:#e1e4e8;border:0;}');
            // 表格
            c.push('.markdown-body table{display:block;width:100%;overflow:auto;border-spacing:0;border-collapse:collapse;margin-top:0;margin-bottom:16px;}');
            c.push('.markdown-body table th{font-weight:600;padding:6px 13px;border:1px solid #dfe2e5;}.markdown-body table td{padding:6px 13px;border:1px solid #dfe2e5;}');
            c.push('.markdown-body table tr{background-color:#fff;border-top:1px solid #c6cbd1;}.markdown-body table tr:nth-child(2n){background-color:#f6f8fa;}');
            c.push('.markdown-body table thead tr{background-color:#F8F8F8;}');
            // ★ Inline code — 淡绿色背景
            c.push('.markdown-body code:not(pre code){color:#1a6b3c;background:#e6ffed;border:1px solid #b7ebc9;padding:2px 6px;border-radius:3px;font-size:85%;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;white-space:nowrap;}');
            c.push('.markdown-body p code{margin-left:5px;margin-right:4px;}');
            // ★ Pre block — 精致暗色主题 + macOS 风格 header bar
            c.push('.markdown-body pre{position:relative;border:1px solid #30363d;background:#0d1117;padding:44px 20px 20px 20px;margin-bottom:20px;overflow:auto;line-height:1.65;font-size:13.5px;word-wrap:normal;border-radius:6px;font-family:"SF Mono","Fira Code","Cascadia Code",Consolas,"Liberation Mono",Menlo,Monaco,monospace;color:#e6edf3;box-shadow:0 1px 3px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.03);}');
            c.push('.markdown-body pre::before{content:"";position:absolute;top:0;left:0;right:0;height:36px;background:#161b22;border-bottom:1px solid #30363d;border-radius:6px 6px 0 0;}');
            c.push('.markdown-body pre::after{content:"";position:absolute;top:12px;left:16px;width:10px;height:10px;border-radius:50%;background:#ff5f57;box-shadow:18px 0 0 #febc2e,36px 0 0 #28c840;z-index:2;}');
            c.push('.markdown-body pre code{padding:0;background:transparent;border:none;font-size:13.5px;line-height:1.65;color:#e6edf3;white-space:pre;word-break:normal;font-family:inherit;}');
            c.push('.markdown-body pre::-webkit-scrollbar{height:6px;width:6px;}.markdown-body pre::-webkit-scrollbar-track{background:#161b22;border-radius:3px;}.markdown-body pre::-webkit-scrollbar-thumb{background:#444c56;border-radius:3px;}.markdown-body pre::-webkit-scrollbar-thumb:hover{background:#6e7681;}');
            // ★ Copy button — 亮色主题、始终可见，适配暗色 pre 背景
            c.push('.xf_editor-code-copy-btn{position:absolute;top:6px;right:12px;z-index:10;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:11px;line-height:1.3;color:#c9d1d9;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;user-select:none;-webkit-user-select:none;transition:all 0.15s ease;opacity:1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}');
            c.push('.xf_editor-code-copy-btn:hover{color:#fff;border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.22);}');
            c.push('.xf_editor-code-copy-btn.copied{color:#4caf50;border-color:#4caf50;background:rgba(76,175,80,0.15);cursor:default;pointer-events:none;}');
            c.push('.xf_editor-code-copy-btn.failed{color:#f44336;border-color:#f44336;background:rgba(244,67,54,0.15);cursor:default;pointer-events:none;}');
            // Task list
            if (f.taskList) {
                c.push('.markdown-body li.task-list-item{list-style:none;}.markdown-body li.task-list-item+li.task-list-item{margin-top:3px;}.markdown-body input.task-list-item-checkbox{float:left;margin:0.35em 0 0.25em -1.6em;vertical-align:middle;}');
            }
            // TOC
            if (f.toc) {
                c.push('.markdown-body .markdown-toc{padding:16px 20px;margin:16px 0;background:#f8f9fb;border:1px solid #e1e4e8;border-radius:8px;font-size:14px;}');
                c.push('.markdown-body .markdown-toc-list{margin:0;padding:0 0 0 4px;list-style:none;}.markdown-body .markdown-toc-list ul{padding-left:18px;list-style:none;}');
                c.push('.markdown-body .markdown-toc-list li{margin:3px 0;position:relative;}');
                c.push('.markdown-body .markdown-toc-list a{color:#0366d6;text-decoration:none;font-size:13px;line-height:1.65;display:inline-block;padding:2px 0;transition:all 150ms ease;}');
                c.push('.markdown-body .markdown-toc-list a:hover{color:#005cc5;text-decoration:underline;}');
                c.push('.markdown-body .markdown-toc-list a.toc-level-1{font-weight:600;font-size:14px;}.markdown-body .markdown-toc-list a.toc-level-2{font-weight:500;font-size:13px;padding-left:4px;}.markdown-body .markdown-toc-list a.toc-level-3{font-weight:400;font-size:12.5px;padding-left:8px;color:#586069;}.markdown-body .markdown-toc-list a.toc-level-4,.markdown-body .markdown-toc-list a.toc-level-5,.markdown-body .markdown-toc-list a.toc-level-6{font-size:12px;padding-left:12px;color:#6a737d;}');
            }
            // 分页符
            if (f.pageBreak) {
                c.push('hr.xf_editor-page-break{border:1px dotted #ccc;font-size:0;height:2px;}');
            }
            // --- supsub 上下标 ---
            if (f.supsub) {
                c.push('.xf_editor-supsub{display:inline-block;vertical-align:text-bottom;font-size:50%;line-height:1.05;text-align:left;}.xf_editor-supsub sup,.xf_editor-supsub sub{display:block;position:relative;line-height:1.05;font-size:1em;}.xf_editor-supsub sup{bottom:0.1em;}.xf_editor-supsub sub{top:0.12em;}');
            }
            // --- pinyin 拼音标注 ---
            if (f.pinyin || f.copybook) {
                c.push('.xf_editor-pinyin{display:ruby;ruby-align:center;line-height:2.2;white-space:nowrap;}.xf_editor-pinyin rb{display:ruby-base;}.xf_editor-pinyin rt{display:ruby-text;font-size:0.65em;color:#666;line-height:1;}.xf_editor-pinyin rp{display:none;}');
                c.push('.xf_editor-pinyin-footnote.xf_editor-pinyin{line-height:2.2;display:ruby;ruby-align:center;}.xf_editor-pinyin-footnote rt{font-size:0.65em;line-height:1;color:transparent;user-select:none;}.xf_editor-pinyin-footnote.xf_editor-pinyin rb{display:ruby-base;font-size:75%;vertical-align:super;line-height:1.2;}');
                // ★ 拼音宽度容器：子元素均分宽度（用 span 包裹，不破坏 ruby 布局）
                c.push('.xf_editor-pinyin-wrap{display:inline-flex!important;flex-wrap:nowrap;overflow:hidden!important;max-width:100%;}.xf_editor-pinyin-wrap>.xf_editor-pinyin-col{flex:1 1 0;min-width:0;text-align:center;overflow:hidden;}');
            }
            // --- tooltip 悬浮提示 ---
            if (f.tooltip) {
                c.push('.xf_editor-tooltip-trigger{border-bottom:1px dashed #2C7EEA;color:#2C7EEA;cursor:help;position:relative;display:inline;}.xf_editor-tooltip-trigger:focus{outline:2px solid #2C7EEA;outline-offset:2px;border-radius:2px;}');
                c.push('.xf_editor-tooltip-popup{position:fixed;z-index:99999;background:#fff;color:#333;padding:0;margin:0;border-radius:8px;font-size:13px;line-height:1.5;max-width:320px;word-wrap:break-word;display:none;opacity:0;transition:opacity 0.2s;pointer-events:auto;box-shadow:0 4px 20px rgba(0,0,0,0.2);}.xf_editor-tooltip-popup.show{opacity:1;}');
                c.push('.xf_editor-tooltip-popup.xf_editor-tooltip-text{background:#1e1e1e;color:#d4d4d4;}.xf_editor-tooltip-text-content{white-space:pre-wrap;background:#1e1e1e;color:#d4d4d4;padding:10px 16px;border-radius:8px;display:inline-block;}');
                c.push('.xf_editor-tooltip-arrow{position:absolute;left:50%;margin-left:-8px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;z-index:10000;}.xf_editor-tooltip-arrow-bottom .xf_editor-tooltip-arrow{top:100%;border-top:7px solid #1e1e1e;}.xf_editor-tooltip-arrow-top .xf_editor-tooltip-arrow{bottom:100%;border-bottom:7px solid #1e1e1e;}');
                c.push('.xf_editor-tooltip-popup.xf_editor-tooltip-image,.xf_editor-tooltip-popup.xf_editor-tooltip-iframe{padding:0;margin:0;max-width:90vw;background:#fff;border:none;pointer-events:auto;min-width:100px;min-height:60px;}.xf_editor-tooltip-popup.xf_editor-tooltip-image img{display:block;max-width:340px;max-height:220px;width:auto;height:auto;border-radius:4px;object-fit:contain;}.xf_editor-tooltip-popup.xf_editor-tooltip-iframe iframe{display:block;width:340px;height:210px;border-radius:4px;background:#fff;}');
                c.push('.xf_editor-tooltip-arrow-top.xf_editor-tooltip-image .xf_editor-tooltip-arrow,.xf_editor-tooltip-arrow-top.xf_editor-tooltip-iframe .xf_editor-tooltip-arrow{border-bottom-color:#fff;}.xf_editor-tooltip-arrow-bottom.xf_editor-tooltip-image .xf_editor-tooltip-arrow,.xf_editor-tooltip-arrow-bottom.xf_editor-tooltip-iframe .xf_editor-tooltip-arrow{border-top-color:#fff;}.xf_editor-tooltip-arrow-top.xf_editor-tooltip-text .xf_editor-tooltip-arrow{border-bottom-color:#1e1e1e;}.xf_editor-tooltip-arrow-bottom.xf_editor-tooltip-text .xf_editor-tooltip-arrow{border-top-color:#1e1e1e;}');
                c.push('.xf_editor-tooltip-popup.xf_editor-tooltip-html,.xf_editor-tooltip-popup.xf_editor-tooltip-html-selector{max-width:420px;max-height:360px;overflow-y:auto;overflow-x:hidden;background:#fff;color:#333;padding:0;margin:0;pointer-events:auto;}.xf_editor-tooltip-html-content{overflow-wrap:break-word;background:#fff;color:#333;padding:0;margin:0;}.xf_editor-tooltip-html-content img{max-width:100%;height:auto;}.xf_editor-tooltip-html-content table{font-size:12px;border-collapse:collapse;width:100%;}.xf_editor-tooltip-html-content table th,.xf_editor-tooltip-html-content table td{border:1px solid rgba(0,0,0,0.15);padding:4px 8px;}.xf_editor-tooltip-html-content table th{background:rgba(0,0,0,0.05);}.xf_editor-tooltip-html-content a{color:#2C7EEA;}.xf_editor-tooltip-html-content code{background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:3px;font-size:12px;color:#d63384;}.xf_editor-tooltip-html-content pre{background:rgba(0,0,0,0.04);padding:8px;border-radius:4px;overflow-x:auto;font-size:12px;}.xf_editor-tooltip-html-content ul,.xf_editor-tooltip-html-content ol{padding-left:20px;}.xf_editor-tooltip-html-content hr{border-color:rgba(0,0,0,0.15);}.xf_editor-tooltip-html-content blockquote{border-left:3px solid rgba(0,0,0,0.2);padding-left:10px;margin:4px 0;color:rgba(0,0,0,0.65);}.xf_editor-tooltip-loading{display:flex;align-items:center;justify-content:center;padding:20px;color:#999;font-size:12px;background:#fff;}');
                c.push('.xf_editor-tooltip-max-btn,.xf_editor-tooltip-close-btn{position:absolute;top:5px;z-index:10001;width:22px;height:22px;border:none;border-radius:3px;font-size:12px;line-height:22px;text-align:center;cursor:pointer;opacity:0.6;transition:opacity 0.15s;padding:0;color:#666;background:rgba(255,255,255,0.85);}.xf_editor-tooltip-max-btn:hover,.xf_editor-tooltip-close-btn:hover{opacity:1;}.xf_editor-tooltip-close-btn{right:5px;}.xf_editor-tooltip-max-btn{right:30px;font-size:14px;}.xf_editor-tooltip-close-btn:hover{background:#e74c3c;color:#fff;}.xf_editor-tooltip-max-btn:hover{background:#3498db;color:#fff;}');
            }
            // --- tabs 多标签 ---
            if (f.tabs) {
                c.push('.xf_editor-tabs{margin:15px 0;border:1px solid #ddd;border-radius:4px;overflow:hidden;background:#fff;}.xf_editor-tab-nav{list-style:none;margin:0;padding:0;display:flex;background:#f8f8f8;border-bottom:1px solid #ddd;}.xf_editor-tab-nav li{padding:10px 20px;cursor:pointer;border-right:1px solid #ddd;border-bottom:2px solid transparent;font-size:14px;color:#666;transition:all 0.2s;user-select:none;margin:0;}.xf_editor-tab-nav li:hover{background:#eee;}.xf_editor-tab-nav li.active{background:#fff;color:#2C7EEA;font-weight:bold;border-bottom-color:#2C7EEA;}.xf_editor-tab-body{padding:15px;min-height:60px;}.xf_editor-tab-panel{display:none;}.xf_editor-tab-panel.active{display:block;}.xf_editor-tab-panel>:first-child{margin-top:0;}');
            }
            // --- columns 多列排版 ---
            if (f.columns) {
                c.push('.xf_editor-columns{margin:15px 0;padding:15px;border:1px dashed #ddd;border-radius:4px;column-gap:30px;-webkit-column-gap:30px;-moz-column-gap:30px;column-rule:1px solid #ccc;-webkit-column-rule:1px solid #ccc;-moz-column-rule:1px solid #ccc;}');
            }
            // --- grid 栅格化布局（[[row]]/[[col]] 语法）---
            if (f.grid) {
                c.push('.xf_editor-row{display:flex;flex-wrap:wrap;margin:10px 0;width:100%;box-sizing:border-box;}.xf_editor-row:after{content:"";display:table;clear:both;}.xf_editor-col{box-sizing:border-box;padding:8px 12px;min-width:0;word-wrap:break-word;overflow-wrap:break-word;}.xf_editor-col+.xf_editor-col{border-left:1px solid rgba(0,0,0,0.08);}.xf_editor-col>:first-child{margin-top:0;}.xf_editor-col>:last-child{margin-bottom:0;}');
            }
            // --- video 视频播放器 ---
            if (f.video) {
                c.push('.xf_editor-video-player{display:block;max-width:100%;border-radius:4px;background:#000;margin:10px 0;}');
            }
            // --- fileList 文件列表 ---
            if (f.fileList) {
                c.push('.xf_editor-file-list{margin:10px 0;}.xf_editor-file-list a{display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border:1px solid #ddd;border-radius:3px;text-decoration:none;color:#333;font-size:13px;}.xf_editor-file-list a:hover{background:#f0f0f0;}');
            }
            // --- textAlign 文字对齐 ---
            if (f.textAlign) {
                c.push('.xf_editor-text-align{display:block;margin:0.5em 0;}.xf_editor-text-align-center{text-align:center!important;}.xf_editor-text-align-left{text-align:left!important;}.xf_editor-text-align-right{text-align:right!important;}');
            }
            // --- badge 徽章标签 ---
            if (f.badge) {
                c.push('.xf_editor-html-preview .badge{display:inline-block;padding:2px 10px;font-size:12px;font-weight:600;line-height:1.6;color:#fff;background:#6c757d;border-radius:10px;vertical-align:middle;margin:0 3px;white-space:nowrap;}');
                c.push('.xf_editor-html-preview .badge-new{background:linear-gradient(135deg,#4CAF50,#45a049);}');
                c.push('.xf_editor-html-preview .badge-info{background:linear-gradient(135deg,#17a2b8,#138496);}');
                c.push('.xf_editor-html-preview .badge-warning{background:linear-gradient(135deg,#ffc107,#e0a800);color:#212529;}');
                c.push('.xf_editor-html-preview .badge-danger{background:linear-gradient(135deg,#dc3545,#c82333);}');
                c.push('.xf_editor-html-preview .badge-success{background:linear-gradient(135deg,#28a745,#218838);}');
                c.push('.xf_editor-html-preview h1 .badge,.xf_editor-html-preview h2 .badge,.xf_editor-html-preview h3 .badge{font-size:0.5em;vertical-align:middle;position:relative;top:-0.2em;}');
            }
            // --- echarts 图表容器 ---
            if (f.echarts) {
                c.push('.xf_editor-echarts{margin:15px 0;border:1px solid #eee;border-radius:4px;min-height:400px;}');
            }
            // === 基础排版样式（始终输出）===
            c.push('.xf_editor-html-preview{text-align:left;font-size:16px;line-height:1.6;padding:20px;overflow:auto;width:100%;background-color:#fff;color:#333;word-wrap:break-word;overflow-wrap:break-word;position:relative;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";}.xf_editor-html-preview *{box-sizing:border-box;}.xf_editor-html-preview p{margin-top:0;margin-bottom:10px;}.xf_editor-html-preview strong{font-weight:600;}.xf_editor-html-preview em{font-style:italic;}.xf_editor-html-preview del{text-decoration:line-through;}');
            c.push('.xf_editor-html-preview blockquote{padding:0 1em;color:#6a737d;border-left:0.25em solid #dfe2e5;margin:0 0 16px 0;}.xf_editor-html-preview blockquote>:first-child{margin-top:0;}.xf_editor-html-preview blockquote>:last-child{margin-bottom:0;}');
            // ★ 代码块 pre — 精致暗色主题 + macOS 风格 header bar
            c.push('.xf_editor-html-preview pre{position:relative;border:1px solid #30363d;background:#0d1117;padding:44px 20px 20px 20px;margin-bottom:20px;overflow:auto;line-height:1.65;font-size:13.5px;font-family:"SF Mono","Fira Code","Cascadia Code",Consolas,"Liberation Mono",Menlo,monospace;color:#e6edf3;word-wrap:normal;border-radius:6px;}');
            c.push('.xf_editor-html-preview pre::before{content:"";position:absolute;top:0;left:0;right:0;height:36px;background:#161b22;border-bottom:1px solid #30363d;border-radius:6px 6px 0 0;}');
            c.push('.xf_editor-html-preview pre::after{content:"";position:absolute;top:12px;left:16px;width:10px;height:10px;border-radius:50%;background:#ff5f57;box-shadow:18px 0 0 #febc2e,36px 0 0 #28c840;z-index:2;}');
            c.push('.xf_editor-html-preview pre code{border:none;background:transparent;padding:0;font-size:13.5px;line-height:1.65;color:#e6edf3;white-space:pre;word-break:normal;font-family:inherit;}');
            // ★ 行内 code 使用浅绿色背景，与暗色代码块形成对比
            c.push('.xf_editor-html-preview code{font-family:"SF Mono","Fira Code","Cascadia Code",Consolas,"Liberation Mono",Menlo,monospace;}');
            c.push('.xf_editor-html-preview code:not(pre code){color:#1a6b3c;background:#e6ffed;border:1px solid #b7ebc9;padding:2px 6px;border-radius:3px;font-size:85%;white-space:nowrap;}');
            // ★ scrollbar 暗色主题适配
            c.push('.xf_editor-html-preview pre::-webkit-scrollbar{height:6px;width:6px;}.xf_editor-html-preview pre::-webkit-scrollbar-track{background:#161b22;border-radius:3px;}.xf_editor-html-preview pre::-webkit-scrollbar-thumb{background:#444c56;border-radius:3px;}.xf_editor-html-preview pre::-webkit-scrollbar-thumb:hover{background:#6e7681;}');
            c.push('.xf_editor-html-preview img{max-width:100%;}');
            c.push('.xf_editor-html-preview table{border-collapse:collapse;border-spacing:0;width:100%;margin-bottom:16px;display:block;overflow:auto;}.xf_editor-html-preview table th,.xf_editor-html-preview table td{padding:6px 13px;border:1px solid #dfe2e5;}.xf_editor-html-preview table th{font-weight:600;background:#f6f8fa;}.xf_editor-html-preview table tr{background:#fff;border-top:1px solid #c6cbd1;}.xf_editor-html-preview table tr:nth-child(2n){background:#f6f8fa;}');
            c.push('.xf_editor-html-preview hr{height:0.25em;padding:0;margin:24px 0;background-color:#e1e4e8;border:0;overflow:hidden;}.xf_editor-html-preview hr.xf_editor-page-break{border:1px dotted #ccc;font-size:0;height:2px;margin:10px 0;padding:0;background:transparent;}');
            c.push('.xf_editor-html-preview h1,.xf_editor-html-preview h2,.xf_editor-html-preview h3,.xf_editor-html-preview h4,.xf_editor-html-preview h5,.xf_editor-html-preview h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}.xf_editor-html-preview h1{font-size:2em;border-bottom:1px solid #eee;padding-bottom:0.3em;}.xf_editor-html-preview h2{font-size:1.5em;border-bottom:1px solid #eee;padding-bottom:0.3em;}.xf_editor-html-preview h3{font-size:1.25em;}.xf_editor-html-preview h4{font-size:1em;}.xf_editor-html-preview h5{font-size:0.875em;}.xf_editor-html-preview h6{font-size:0.85em;color:#6a737d;}');
            c.push('.xf_editor-html-preview a{color:#0366d6;text-decoration:none;}.xf_editor-html-preview a:hover{text-decoration:underline;}.xf_editor-html-preview ul,.xf_editor-html-preview ol{padding-left:2em;margin-top:0;margin-bottom:16px;}.xf_editor-html-preview ul ul,.xf_editor-html-preview ul ol,.xf_editor-html-preview ol ol,.xf_editor-html-preview ol ul{margin-top:0;margin-bottom:0;}.xf_editor-html-preview li{word-wrap:break-all;}.xf_editor-html-preview li>p{margin-top:16px;}.xf_editor-html-preview li+li{margin-top:0.25em;}');
            // --- 代码复制按钮（亮色主题，始终可见）---
            if (f.codeBlock) {
                c.push('.xf_editor-code-copy-btn{position:absolute;top:6px;right:12px;z-index:10;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:11px;line-height:1.3;color:#c9d1d9;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:4px;cursor:pointer;user-select:none;-webkit-user-select:none;transition:all 0.15s ease;opacity:1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}');
                c.push('.xf_editor-code-copy-btn:hover{color:#fff;border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.22);}.xf_editor-code-copy-btn.copied{color:#4caf50;border-color:#4caf50;background:rgba(76,175,80,0.15);cursor:default;pointer-events:none;}.xf_editor-code-copy-btn.failed{color:#f44336;border-color:#f44336;background:rgba(244,67,54,0.15);cursor:default;pointer-events:none;}');
            }
            c.push('.xf_editor-html-preview li.task-list-item{list-style:none;}.xf_editor-html-preview li.task-list-item+li.task-list-item{margin-top:3px;}.xf_editor-html-preview .task-list-item-checkbox{float:left;margin:0.35em 0 0.25em -1.6em;vertical-align:middle;}');
            c.push('.xf_editor-html-preview .flowchart,.xf_editor-html-preview .sequence-diagram{margin:0 auto;text-align:center;}.xf_editor-html-preview .flowchart svg,.xf_editor-html-preview .sequence-diagram svg{margin:0 auto;}.xf_editor-html-preview .flowchart text,.xf_editor-html-preview .sequence-diagram text{font-size:15px!important;}');
            // --- KaTeX 公式样式（完整官方 katex.min.css v0.16.9 + CDN 字体）---
            if (f.katex) {
                // 完整嵌入官方 katex.min.css（~26KB），替代自写不完整 CSS
                // @font-face 使用 Base64 内嵌字体（woff2），无需外部 CDN 支持离线使用
                c.push('@font-face{font-family:KaTeX_AMS;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Caligraphic;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Fraktur;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Main;font-style:italic;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Main;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:700;src:url(data:font/woff2;base64,d09GMgABAAAAAEAQAA4AAAAAekQAAD+0AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAgUwIagmcDBEICoG+WIGVWAE2AiQDgzgLgV4ABCAFiQwHg30MgTIb7mMF45glsHEAsMl719mBGDYOGC7D0lEIbByAiMxfEPx/Tq5kDDgFfs7Mgk2GEaMNZkJGYKygcBdfmBr7/iSDZ1PQyUX5xjA/Omw2mxeK6n1MThPrWAytiLXxqvdXC9vaFjl+0e2b9r9jbvOKeixG9oDqM7Bt5E9y8g5Pzvn37uA49h0HBzvsEAIJBwlkkAR2yIJAxjYJWe4MTXQnrhlrnF2uLlv9xjF/rf7WjqkdW233H3b9Tu3v93/LWUlz/Hpz+1UqU9UNz0QDjhGHjkFV6m0m5A0hmStcMbij/dbYuUPOouRdZjbF056G6uGezX9rCXImRSV0/6ur3GntCxuCVN5xedWlAvKsg1DU6aTWSqr70rdHHsgb08AizhIfyVagDlhw221PmmoYMGSq2JyntGbJcr74lolTJnpLnn/tsGwQ/MiQ21IKQAKiCI7swBU31ubo39NtVRqni0QPUoVqbG3bp3QVvL6Z4BqlR+xfW8pFlbACo/zwPW2ADBvSkRH0g5JvfUXtolZXjdbM87abT5dwAPoE6u5D6tl/S5d7Qf1FJt1HSLAY0bpGtnpjZ+yxSy82RRiKwu3lNAi4MT5MQwn8n86yHSnkIFfX3bsq2B+VwaJO08h/xpbmj+R9Hq335NGhbC/Ii/ahDn12kMD2geM9DgCUKTrgll7PVZu2BirqFF0X+E8ns//9u0uTzhqs7jKxTqGIH2gyIXFIgdJMHEt9/MZI/Pvz0id8fqAoqlxkWqXAcLabdzW9L4pG0Y4JDLOi+fBrrp6ke6gknTZ6m9jb/KOfj040saWjiSVCsdQvohYqKRJC4rHMqgKSy2woEkG2n+dsY1bD616pW85XLECAQCix7VIeJRxfC5bDZOLWZq70r/5dHyQ4RwghVldUxroQDHdvTIjAm/RuELTltsFnWge7Ovg40A+4O995exJfGYkP7e9Ju9Lie1a1oO1vEIHF9yQI0sIvMQTiYiXov50Z0MWsFS1zqC0LaWEJB4LCZK3KE+uW1eu4V/n9v18/5euZhfsc+OnKjH93TFrRzHjVX9Ldu97wkkPTE4NekaVJU9z9/X/3jGKNGwLQFV9NJG8+L++Pe+m5qurMrQQEP7cfbO2ubjfltePibL8oFdpZ1uju3xhdSzYQqg99BVavIMHNKtG7X4F5B7S8xDFy/TNhT9eYYJIeyZGxllAzoaD0WghIMHpHAGrr2BGGWLGOCNCcIpu3JnyXJBGjL/Bm1xfTBAlz7wTkGWF2U0PG9UkLdzqMnrrxA9s7shVsTZ4+wGiE+JZMG5FmQigRjrWlUkcxYZQgQQlDWyDF7sDhBg14xcJW+VdrSUvsj/pES7CpPted3wFHmtykTFy/cV+VLOjoL3hRFDErNbRAotOI6Q50TCBXhmGMvCmNCIfHCWplkNOhu4nbi6orbQg7eRwRSgZCla/c2pYBXVOqOUtXuIwk13LFlG7VJilBqDpCdANJUbw6MoE+yPDUgCy66pFlnph5Y+1qrjqifjeQRFhYQ48G7LaNHfDgEa77LDIH1vXciaz9PzEZxTHlZOTtELdM2tEgahX03QVEg0/CpBU5skA2Oy0Eh5tgj882LyBk8InwcEzwfUXIGjiyAdAjBRxdMaTbG+/KV1W4sdesjoOWvSzBvn9tCUS4lYSyeYtlQcg8SoZH9LOhBZd6XULKwAxRe0Cf5zwiHrR7qk4Kf540jWkNqtoSAVjW6pS/KEjZCtaI1deW5hOiwJ3CnvgsRxx7CUAhV2aKD0LzSrxTSwo8boRwiXunFa4Yks6GRoIRuZMtwklkQ0RY3QuFMerpU/LHcuJITvLbYXX3PW3svhk5thgFEnX3LZGKEDRPItS2EHZfhB8aPh/BtoCIX1j8WEqG+7wJ6mfhAyvryS7byBE4LulXr1LI4WbU+HQ5QasllKMWCLohPQISKm1BSp+vmwQTBVz2AkXm0afAPPlGuHrES9nupBATNya890gQ8QYTtCKeDW7uHDxRRwoFknQcpVoHRKbDRK4jRKEziFJnEpWOErXOIhodIxk6e3o2JA4NidbVvSCoCD6KxtgE37ZBjcqfW3sz5+/PtJjgh7tPgnb+PsSHm+jQokcxoBhRTChmlEwUC0oWihU9c4CauMq9RsoqujIOjd3QQjZiTurO5wBzg7mDNoYGMKwe1UDSnFT42iXRoECc7C0ogumSeM1IDwozbfXDW3XWcfmpZtlcHvDJgWn5mBAnUnT7BAGpan8AUWfQVaT3TeZKXtpy+S5xAzWGbniEgvwpcvSgulM7FoyZRcDR2vyFKLBQz1A1RchQNL3LedPQRJgQjgz7zm++LUhp6+ZrGFkEQhSld5rhTzq8deFJgFx2jnOOAXUu+EykuBPVst1EzU9SYCe3zO+7CacMnVWjwjy7r55xixwiGyZ6Moh8gsxbjKzHNqc6DMZGyGRqDmOYTgYxMt5yp2aTINUoyyDNGSGHg43L5VDbmUa0KIJLAGNQbpjpiczFFRnZGN05ohKMuoxOS++UFxOOaYaZhSf1nGerEpccOWtQQDlEM1UqQ61iiBuT/dSFCrVYY74j4DmMgWnUzeMtH2FYMKsmfSJqaNQ/bhmgFMOGcaezXNuToQ59EFRoGrK1lGHL7GhArVVxpM1OaEL/kXfM1okHlqh54k0OgkWhOBoCiyNrtU61s5gLxowgyooOEGHbIU3tHAEvkXcwH8D3nIIalczpKY+gcCbdjz2Gqf2rGCYzuAZ8dt1a5oxNm4xVuCQ6HSrqoMPLTePMWLkknDJ9ocVsSf7LFip068Y85h5MTkVvJQoEhml60KqK8sJvrEZzyb6gwiAbGmqyBsROs3oEc4mjxQxBkUbCQLUdQCQNZkqWqOuGUH0HEA0G10bbKQiCgkRTADUvAKIlwGyVN3CbgdsN3GEwZ+gm7M7RqKsDiG6DmZal3D1DqLcDiD6Dox8eoRggFDMJxSxCMZtQzCEUcwnFPELv+bZpyBvIY7DzfsK35RD+Oez99R+B14htGshqQYFYWECjD6hkccayhEVZciwW6w9Lth8tLaBlBfbldytlRZayMksZz1ImNqFVBbS6wL6mtDLWZhnrsoz1WcaGTWhjAW0qcG62neQecP8/gSpPMmAk3GTQKXXNzYHsE1jvCcSYWLRq92eeHQIivI8QareZB8U+hVbwCARpuyHI9Ad0ZeEcg68nOn0YAh8O/MoR1mDaVGuY1InD/eaD2WHKVF9UQAJ06oj5qMPm5PERCsC8pa/mRFPXvxwGA1e6w8kiZlU2WWzCSbsiJsoTEJWZkpndbUtdRZPewTaJxCuyawRpSbquvWLRmtZYHmmT5JSSJmFTsaRB4OUVDDgXNFBkVJwnKglFmgNd6aZmH8WWSUyVdqu1Ldw6gyDGet0ii10YdJERbgW/XC7ALa15UXo+xqfIaIakWCe0V3uJunSsnywSCvMNXkmhN5/LNKi5kWmzbP95n0LLnDkZZZXY3wcm4LBDDhN1TaNZCGJQUhylN0ezNFfOlQtlbjKJ91ROqnldSBHo5xWwRBNwZC4BZB1BsQLmS7X8dQp7V80TGtwgVhLJpnmEh5E3NTfRljOOMIhCwM0yc7DQJkp9hY8ovAxIrsGJ7DFxtdkP72qmamP0+qaHmyy7HJkghocK6HuC4gbTNSIBxSKCYa8wtUuKZCMmNJTSy3J8iS/9b+g60BVGw6A4K5T/9bcQsKSV/eMIYPbSth4w4pejqP/GiCebUOK1JGaMMX5qHtkOFXDPJiArx3Exjlg2n9CaywKTwGFwlpmgQrT0qffNDMRLpUoMheUOnjDtfkCoTcvAHRWF1NJUtPTDCxH9rqCC68Sa6BpTWNLh0SxZz84xuaa+SAThKRGHCIYXgZcDghZySo7AIkIoRHonk2pqbZ3sqk/RLFNrG8dN55mqhLCIcVy1R3ZVUu/R3MfUh5gGooFvriMf7WOaJugTnrhsOkFinai6KVNmoGWNOOxIgHv6P2i3d9R/ymSwaPlWKo6AbngjSiJLNG/SAjTaJizOMvfKBxIpAg1GChug1f2mWK1mLFwW+coXN0xOJgyDVCAdx/gPmonCN2uXJrbGO1EILMCbiD7Rj1v+0aMHD5ZKpRxNKLw6k1ir5b524pLL/ByyUUuJoIhGYFCU9GRahTVlg1tt0C3jxqQaZwXXsr3PRHGxkEpn3EMdlj9N7OzI7VGiVxPEajd+QV6IeHEU/gYBFOtiqBwgGqPoOXPqP9VhLIcrqpSYB/qjO4E+IQ0SMtJxpc+bnBWGeb4nODb7d5/ieufaXh7uSvonTqnFEU3zJ/K2ijfahOcbFr1MESr5jecngghZN6BkER/lMbHBuFLO3MHekcQrRvu5VMtlwMeNOKlOoURaskZZtJIKzxzwJVncSAT9YGJJGJs8U2hZZtD097qAmuQB64XMYxosn2ws8DDHtZb4nPFu2/MAi9UMVDkQJapMGQy/oR8SJsbvnKB8zb/figViEtXOOekR5mZ8OeoJXj072AWwp+Bp9wnc/PTqC3Aessps0oQuihYUpKx2mQSelo9cH4w7bWBwKzSynsKOWjcPjFVtvtidbhSfehFyDpbsHwSxRgGmxf8le7CAgKv15ovASFCB7M9Yzw3OhtCSYnoNpFdQ/8r4rFck3k/1mqyu3Z+eIv+Rf7HMRXJcYZnfSPGv5l83rtMGau95j0LqCWk3UP3Gv3J1mW/uMk2+IHtKy/84csjVAgauVnwUL/9E038XwOKmCFT7yeoqmbKtFS5Hr9kCevL/AhBVY2wWtL8hUTLxXCPwrCSfP8LnDf3BG/+b+BI/5MGAa6nXsZjbLBFKqCytbLmB+0IlL9/p65Jt5GiEgLPcKF+hreE+97wwJsNpDFOH1SanbMq68IwozCJ+mBrILoXZ/27OZJ0w7b5zXmNtzeqCQVE7inKmIO6HJYVqw+22K19QLjAWWu1xX6nET4KLhMHZaxzLZotZZ3aW2zeIYHa5A3hU+49QxCITz0/YyCtDI+wMJGdhSBHubiQ3dW6DUUlJ17tBL9+HRzgZnsRn2dg77F9j94dB5gNgWmWL63nV2K/qdEsu3yKS70IFw22Q8mdQvQj97OkwHlqytzIrr1Gm2npvdRkxyDl7w4gxm23bEeEef6UdXOwr4ysynyhE/kCAPN1+jeRjf4InCot9o3vepTgey8BmO8p50TJXZbPghEqDu8xGrXNQFMGksiB9FpYvyBmt9cxUht9oCRgLyAetXEX78af9Gs8ZBMPcnw3h3wiocsj3vS8NHiK9XbpvcQlcw+es+1pT36UpUUcgM+yvpQRcer6EUH/mxf4vazNvY+OylQ1+5/49+dJ/+eWhwAam2A04x5EtCAw/9/3VQO36mHQylt5u5M15hjPFUbpONyhRHHCV1E8d/1B5NOolS3Xmtuj6YT5DyzzVAbgedrl10lUcKm5LluPvoP8lBteJWAiPD08Eq8oVFrLysIAR8GFgP2t/vml2kx50nR+uXK8AL/1h1oSN3MXlEzdSI53yLeJ8hxIU24cjR5xIolJyPvn5DosfFOiVLLh04kF7LUtMg5y7OdMioQikTgSRx5jxu1hKPMmAys4CI0ctsVDj15j6cTkn60kppV8s0/L50jrizktki8IjfO1QKKxqZWBhACZDupbIDIIyrD8M9qjtjYVndRzjq8AlihSCP9CqLRFOCfai0eOGJPibwNRgM+X215ac/UN2i36xMCXJMwAwFUahj8BOzxnY9yuS9DKwZ1kAElZ0n7qkxzbzoJRSa1oWdCWHoxhutKlwjbj5Mj+lGWBigfMoxDjW6fQYJRDKUbvWO8BPnhfvMC0yTIU2Y55ezsQxOlHlvDi9SQGHzijQp5Kwkaxn49QUJS575NL4ebltHXQmgYllAdOT01+lS8CB5TQoDC9COvPsV9GKrRJyT0Rtd0UcpdhrKnF4hpMSKnNl7CQG+M0F/RtxBCifCo9BZtBwTZnnkxcat6YV8Hmg3FDv3wyzrIKFA8UNrpiz5/Q3bWIeS/3MG3D6MmBtfK0daxwpSvA1HFqjh9HQvCtzzLmc1K7meYnkq1RSUwAjiSh6OOtFFxp6xDTBZnPkYXmMpTYlQHnf3ZLtia5iAbzsGwPXNdip+9eYbhHC4NI3CbZnSgb3RjWwfMNrBU1W5kMXr0BLHxFwRcjxrZNQpkVmwFSts5GPunPDG+EGuhuXrAtZHTGtrONNy/wph/oRkOH2l+gJ7DZDkFpjZUb7ZA11G6e18Thlco25Im15i7NczeWsrqxG5/SBXgHhnMqv4qDZBw4Phfow6AM1zo+b3W2GzLmZtp6Z4i5EuTJZJRP1T2mJIB1dMQyEp+vGPbAwLrwZJn7aLlEV/gSic4PYvXR8P/7nKiEV2LYoynvxBricnQSKoVDuzvYkhZoCp201n4GJgLJrs94I5XCcVznsxFMM0/5oL1Om1BrF0vmYmCtB//V42PwLjZxgr6xLYyTTsM8J1pcN52fCAnC0keL47CkkMz5FAAD7mk/Rf0jAYbSO8usEsEwpBGKCDTKD5pIsy8DWpuSH1cEVHjEviA/CjBc+DjjWcuZ6XoNSaLeltC3vebrpAPaFKd2NMcXQYiVjmKvxKVYU+pATmI2+bAS+KQQIvLtteautZdbES9aJPyYvldttEHNmIzmXNI4vKE72cxUXgaOr5l3OFJHlaGgSTtK+M+3QVLa30DLfogrDr1KgSr/QsYSTNW/EHd1drVEAe0/EXTqHCuedGgjLqf61YKVeNt25c3V6Ij7wLORZfJbwhk4h16bqDvdMcS3955Mi+UX+SxcbtorTatP8itaW4DSNR5d0s6QZJllDVNq7wvAiFdj1EuliYF2oAcvMdfzwwuk8V8YqBAnMrG+1rgYSYAGue0VTmZHUGdfYE3t7cVF5Wytr0TbwEkxdHJd0TaUmy+wwz+opRl8Q+P2o5/glx3ep79MovLrxSLJd+MMVbbP31cKmo2F1m5b3qCAoNyy7S2cE8VCRtHQ9AfoWfHsiHdi2ZYM4cvzfW8WEMjsB/e1c75lQdJ6u/Ki67DSu4VZwDb+kMzSxF4gYIFiaNZUXQhUSG17CDwSWIswtXxUmDEEa39RBTjeq0t1yRD48gnzP67I4siAryVYyjEqGEzqUBPEUh46fdOtrtfzw/qP1ajygrSaBlu8JsKnScOfCOuvWGZ+FTvQ4MKdmnN3Q/b73/dxUMWxupEvvJzCavd5y9Zi23JFIWYwOnZpTQ7MBjCgx7YDCSzNWMbU9XDYNWvM2vQhUwLMghZ23BHNaapOLFRFKZAaFgVjH2xoNSiQ6JLpfra75vodquE0J69UOmX3ABRAeW7UMiUvRUerSrGZePD3JAj9EK7zOLel0QXoBueWJW504a64CZmIuUBmeFxYMhKU91Z1VA4sVLISa07JbMbGb1kwrmoe+6XZHUzaOQKOtWou0OCZLG7sl0RImhuJ+ohjv9A5dNXYatpy5odevz+gg6s80kZ4SCt+UPzRFZwK2aWOM8QsYu1BrRArbZZDXUEgtsZ4r15j5BKlqsB5ixDxoc6wzlRUFfnEylNUyieb48JtcLVS7eN1EA4tE48pYFQnLl/snrgcis2w9s6WmrJeqQms1yKKwyOBMuGvTQGD9I+cvUyzH8xDAqXcC04z5FaAgZ6VhsQdFi74Zl5P1QudKWVNaPCu9jhVeYx+kCGv5QtDWMHco37cAlh3qzD0pttrN5DQljdS3bpsUl80MaIER7ebXjI2Q+YlPq55ljzxjSg00hSeAFxNFi/qYjUOG8UHGdRqIHs1opu1pHbkKrTjnoYeEwQoaBS/tIlAmbvEmhkVVpgtPuu8FJJcWhxV9yMrUm2JuS2X6HmWPdtYebRk2BYetsS4SUKaxQjRNWmeqZZpwedVw70FbaGZknrNo+r7IY5UE+45KQXKFKw4gLzKZIuXnXaHifidYu6HFEhfIRihjUk9slxLwPj0NfJketsBJ0voTcmrHUMpxYXaKjl3RJjB4N7Nbx9XjsnuoOuaZpSuvXEKjlJfneZ7R/c8k+M8owEQyAAsVNNkEy3l4HCcx0Kek50Q2avg+rfiwkf/HiF4NG1S39mKK037bfXX1asVmUizyNxa8ypyMSex5P74P7HKCTXH/ZE+QCQRmLadwJOXaFC3eykBGQGBRLM8X5jlWucKLqYT8JFq59J1QDCGFKfz4FPLku87mLoKuSIX/bB5A5q0YIQgKLkYSqA0sWtJ65TbnFglglyiBZVYRPGUNHmUoRTd+eStFLvHfsRbeD5AbjGJfABWixZnmKcS4vP67PkuQW/+0FavDhzkAapbdwTjm9hLWm2W3Gcd7DReuREAYvV/mRsTTr0pcOMjh2/g6fSKPUIzK1h/ChRouWiKRmNErlVNS0zXcr8CrzNWexn7Z0KAhJRaAsSxm63m6Zeqi1fcq4Hlzo3XnMKYPOILz93huZrIHju+0uvifCPDNnU8dfPOlzr4fF98aVMBKc4S16ktY24LT8OwTfpWNbhNdsdIM1u18Hi1JvdMkilu7WSKLqHRF58ogP6PlEsNYZgoXqVy/vmVTe5mbXBf74U249gzbdzbMqyTW6YvoMPydJB2jvkqfhxu7rIfiULdLN5jnk6E1f9CsRneSfeACQjFiiBPPvUYm3JmQpctvUoDqnB7QBeVI2RC3suIbjuHVCAD/z8Le815MFEVJR/FpXjrYkpnT8ppGMLO5KauHP8XSwmYig4N+LUcLzVP059smxXQRZGxSVFLkirdIV/UxESSa4oaQloH3G9z4ylICtnfUKSJnKP16msRgaxGEG9USEvCW/S6Y5q8UFr95aBiEoEjOac1jh0bAmECKSg2sX2v1J4Hjps1Vrr0mGqDdJTohb+M09WY1dEERlG9cejwmIvPpwuf95a5cU8Pdb94sPjBteS7fXva9ZfCMw5OTNkNJ33CHWIm2c/3LqUOHyvs+J2ygU6PSKCb7GwxwKVTnm2WPmDvgBIxx03aU9espAg7f201uUki3PLn8mw74y05XYbUe085B8xSFWXt80QXiVeHagR+LFH1JptcYcpZHU+h2wqn65VKJ+wLsUEHmSR3kRBNzgWqPkJ+69digk6J7w+nJw5KcVO802JqHRxAuRpx9ahxnk7tasgu6sxC5vocUAY15r4pAniQb/SzxVVqC7kCR7rqey4yWzg58yXHyfs+xUDTIAT/oP6tOyW5JmnZOO6EH8Xsj85cN1AzXCRfKxfR4mt8yOLTsoO6JYsfYxXEuQ0CUy4nq24/cribk5YSAwR3H4hMoi4m4QBqXrSw3nWHhheTVK14vvYtEidkCahA0zAdSwWwClRzWeYv37AYPBJAfBzHTTgs6lZkHFKq3BzZ4T/Rz/0p7MgLjK1N2LS2dNetR6Dp3+YB2N0nQa1gszX6xJEm/9rquu5Cggq7BUNr7w/eQ0RuX/GG1sQCxlVSgJxbBDkN/qF9PlL7bH6ionuVoO6+m73741Kkv68RLh3JDJ3+ea/HXj1dw/Eyu8WGz8e966wtQIACl6TPd+eHsUU/lvCubfsk10z1isPYn4vR21qgll2W1ox9e3ekh2YK1fge9Zt1aOmkSSSlPYjOtRxiM66hClzSS114wZ9JTjik607zGnKk7IhPN4YuagbFrPPR/eMfTsbq5EPbK6wKFkBAvjsXm8H8iTSQyBnrUgdLu3Cci4d6p4aHWV297df0GP6uUkJ740C/Sr3c2OcpX3KnvPCfOrR9YskYorRA901bvh0DAFFHUxauV76BTiUKGi2sLZglb4X4BMddm7Ty+r686mI69FykfGay4tc3XGO3dwCWKfwhmJDQub54yk3Uj4Jc1vX6pL5Ca96shcH1gBIr1YwdfYekxggmmwFr8qkpEkIm2RLungj3h4TmlQa9U5g2jUsYDjZue9obFjNlbocDIhqgzJCboNSyG4Vsy8wFcEg6gh8opR9xecHt6zfHRGwwYRzvmpqLJeO5CeNhb3J7ftX7OnKxXInhVk98CDhd+QAdcBa1AVcVVf3XvuUjmn/XJ4YdLym25LPOGPVHzH+umdrH2XSrxVno5xzfPNhelFpExuAYHkQfmmJQdl+4rI542lPkV6eB3atcesxHfHajdFKpoKvVr8rx5atOmX/qs5sCdjTnsikq25OH9SvHGo/fZQbatrMiK+cUiYsI9JFSSRBi8mPdygb7/HQlbvAm2ee3eA9mXmGWuRYSoHZiMXYCUEuTEBhbo5Kq4gCmYyYChcjPjC3xoNUc8EeqGHBUKP7j1cwjzz22wODksBIEBSE3UreqDBrCDJcywNETATf7uLEZZfTf99TXox98a+Szjd7aGJRpkSAujQ0gizo+3WU1whn91TTNz/M43h4toRv1/TFd/W3CiC+pWj2nG4LoUdLAFNzQdcCnDh32zoVnaNdo1ENzTA017AxV7tBzes2JbZ6vg8I0r2loEewlllEEi44TENyQmMUIQ8jYsHVfsa+3Yp/AzlYOFqCh08N22nja27eBoS+s3NQusujTGsFCJbcs7ZZfye/aGaix1jdktnpFPt6H2PO2Pbo3PZC0f4HViWgkqfPjlD3bKvvrsMnTTgr+ObQ+FKoIhzmAKSoSlESmc11cbY3ffcqVE4ZuP78QO+cEGAwTb7LojXOYykX4k8S6XSX1qbKKk0XyxRVJwubGzHWouzf8ABiYtOrB7V9lukpgqZPjZ+iglusZhZbXg6tHDeNZR69NH4VjTl7UYNGbtMlaJeiY5VKMJsArWXL5Mru4y7IxpVPcEvvdXrScqovyediiJIJox9Zjh+q/P4lHHbjFBr2WhPobYPYRLo57cWSKl+7QzoVk0S+ArK4WLinRHOCQdlri+wNoPxESN2u9/Jy2WiogJg5M2GBDXayDEYgf1G7R1Ac+qTUfHeIMsLyY9/v9PzvConPE4Vxe8Er0XL2EwzYzFSdODWXP2t2fWZsbxeSGqYX5tV/28499Ol5b6iXgn8B/nW1pAqJ4oqRtSd4EcEXOZyIX7aVq1QLUQTE3ds8GrL8lcw5XMBJnmNCCl7xiKW95mp6fQuu7k5OzMtIUliA/AU1MPtclm0H2QnnAHvQvjPFpLi3ULNDOBTIyLJ0I4nZenyulw4wNz4sDH476vOdyHUn4XKn46ox2Q6FgkEHpcZS/+ufQu9FMcfvY1t/WPGhGHIbI8kFkryDAoVT80I7/xs+wbvqEWfwUDb8n7bIVRSS3qWfWM8ipnoecDW2ET7kQ7Ufp9BguGWBehhumGv+Gr7Fye1HptZLgLFTUC44xJ39dcVta4T645+UPXy+MvhKgOaQeEyNHB/eur32bYCtd7d/RHnYsOnUtqhM35ybLocOdkyErGNENAIbtYcHHLyjz1NI0RYjNVcmzBOjE+HBEzkY6/RORqLbHbojWaGkZZ8KyGFofIEIEYfDN/3kqvXLEL1ncyGENdyUU5wZOIPvTBoiX4PwRaonBGmtaMS3pARQcQ9Vj9GhIBj7ToL0mI95WgRn8hNBcO8nwIEw1R9fkM4HL08/E4KAIC1RmFbjV2WZP2GvwC2r4Cg8ENzk+yk8aGVEOtDsMTQFODH8jE5vVxKD8IgT1toqiQw+P1eR5TxzclNq/4k4GGRNhfj5AjrkYb8Y371o6TTN7G1LyS1OX02OgDPWRLjzoojeQfnayfFTh5tzKRKnd0ZJGXtcPaRf7q6qbyyMepwuxxRRW3ciYbd+1ODlJSVlCr++RLCMY7Q+y6yoD/or9hjZTRC3Uq5jX9u6QEtjlCKTYxkT8ceAsJjlmmXn7o33M7E1C19QnlYHU9tEA5O4oHXpTK/q/HniOwfRhr+iFHUUuiRlDn5ul37MndsB/6rTjw9uu1zb8XnCSTJzvkb8XjDRU9VRWxmOVxUVV+U1Zv1vw2T4Kgaj89O7cn5szssXRzB1mKBtmfEv5LI/rP7q5CFH/nUOkW8OqbkLGVmxFyUNl4LOGQvIHX4nDqRhlKTLA0VQo+zXynNyulE1HhfsvBGzNaDJeR2cS//8OnE2fxyQACl/xGeeKAuRuQr33JnYy/meyGUs3yucIyBxypgDrNTIoIPYXNfIW7jotKmYHKYMRd4/mbRJg3379Fu0NY2lCkmCOuWzLUyL+qbXj62qG7vapgEOey0iBfMV895HaE80o9HH9PYaKkOnCaIbC8svv8dxHh4UqpPLZHI+8XReBwqJ8tsk6GOek8LfgZ1DIkAkb+B2SULUTLFQQ5EUpGo9Cq1fpNQn+IyB3f9eojx9R14hqy5wCHaiQR1Dxidkdqg6FWTzjjHRn7BT29mg3Uwyp9Ym9/1BrC7xgmh1bB695jgQbYyPAES7kWOOnlAI0KRx/onCEk2M7X6WsFJix1H6o0oKSinLoIXNfdNw25eOfKq57H/PR7oggRI6IfrUNgAOOdCPeGvqGxAGQNOqwYo38vqWmaHOzhjaMbj+ExoIhc90W1aYH1ImeE6dI/nNa73lcotAukgF+lOcr157stlhLqVPHVvroE9DUXP1dnNQPE/Bk5j5xbMa9y3u5bAHpb1hgJpJw9aCj5jPIgl1XbTUY/HlqeDkFru0mxP2kovIJsurXpZohYuAqXaA+jlDnPnMcwmujqnEl9Lb4jLZ8BpLKNrCqZMgLmufYzcisLWweebG2Hjcb1z9WR6DDM2CvpEtyseHs8BJDV7/hnBWZNFSoIRklZdFibQN8n4J4+koS/YGKdJwVF5qlzsCEJjdsyVFSrrfbH3/6qyLItxavtdnonB82GSwh3YhL7qV/RB2REKaMs+HgRzjAljUkA4olFi4a7hAcxT4nB+hQ0uakUO8blFtQfSumuvwPgyiOVjyd2o9xCcgYwm7qBWCYCtPPIZz9CHTfQD552/8RjbTmp+KE/2fW79j4mHxCWEGy3MUbGkWRAIO4FVd2AFJUSoSAnjUcMW2vOBY/Y7c4Rts88XJ2lnAlkbFGZ8G4lpoXnMsGP0LL/jk28o5bhrPlGoE9bife5SB1HRK7mkyTIC5bB/f0P/vdY+OGXP2xYvTVSBXVem5HINM7z7hKJQyk2HLhF5vt0TBQa4WTDUjEgMRWm+iz5fD27pVPTghQjbm03G73Jqu+uq9XtxMu754Vktx1+Rx6RqpFLX6XYmiWGzXlMoVokWb6TCYdGCaZkp9efWwyzQ7xpltGn+MqfO7+vtojHwAc/JyvJlBdS52bv7kU1i7FPWLXt9dUSIjf/A8fzDDB4hcMbBCe3kZWVl/TB5YhAlIOol2iWgtXP2+u6GuNSFz7DF6qrszaVBXNfuth5Xz6bZJFhnw0K/fG398kqDGb1jDY0DaSaa+MTbNycGA3NLNE4ntbL7lBZXy+EzVlmv764RdgzRxnvmPjr++FrPNal8qidm4OasWd8VsG3KSDtlnXD2gYnKxGhmsB3PNJss8+jy1PtKwIlqsfHkfahanYlk2jLL48PPMKlh7w1TgcPOfv9i4+aEevO+6/J92fQm5ZJAiUQsDRBHd9gL6VMqkEu/KWP6O/Qnlc+CLzeUuWt6O1XCliiDr4vnjjLVSdGP9HqP9fJ/yPTbugDzATHX7Gkho3UpiBk83vF0OGVURiSLNOcuKxZsU7/4ASZ+6dF/7ledgf9sr67IS7W4z1b1w9gtL+gPQQDAofifV/BlKZ163VrLz+rVUWyFi5Cbin0tw3ym4rMrHGvyxVYAL/1DACnr3bMUdnVxcfHnrQc2Zs/02X8BpOWS+6vHMZOtCs8cveRHNpY8ptk7UzbPTEvooqqvV1vNMgDyPolVSZDt7hZlPGUfeE9HYPF5SecN7+P9+Ko/4eGIMyhwvA023Qr5iS/LH4IBbTsTUoVW7cDld+RaUvTc52RXBsmB11/giBHyGM/V/+f27OkhT8VqI3kWb96xCJ0MtX5P8jPEyxUZ00E8/VrftDK78jVn+mkfwl2KrLXmzLe1sv+pFRUGMZ+fyxq7pzIzeHjS/nwqp/Pze8RomI6zVGte9Qv368YFVdIcKHjBfol8dezIwGOCHvSFagSoEkdR/nmG8Hi9dUJbJ34r9Z8PX8VW00g7GEtWVX2lHS4sy/rUk+gOOapzs9F4yzrpEcAyFqqYdl8s4SDX3k7VzK00zn+YtHaTIMjsyfBQmT/QUVn6EvDFKhEZMaRtQdlIcvDwixnMGuHhBCOIwuXE93GktyVYMZ9onKiXEqoCaO0g14LtNNhWIJQiSMfGLMC2o89C0Nn/lNvmMeLMTbsFXL0q6k6BaWc+aKp2yUSsJXij/wLQ3d6GJvougpXMb1OJ/rK0H5ntdSZnbu15Vmy+OfCuFNyV8LOWK1bj8hFqoSJkziU5DXqbanTLWaI4yZMqd9enalZplkqiaN/sdIjzY1zG+t8ZWnRGnKQjXYuaqzXjItTq0daCObY2mTL7KzBOdwqJi4fu7jbWXlsjSiBBzA7K38pZJyClardbgAhXgEU8hvc5/9imriErOj7NaKqfx23l8DsAe8TkcwK8KfZBsAvuUTqu+tr+SXEzIe2O1vUH4i9slD1En+R8Ct86Aeyikxin7C4UB9EXyiQig+7f3p98UUW+hQT25xjiKcqoKrAJzf6dgk+rrAQ5UQMrH5+9chUbkQbBUQVWaUvK9O8ieR5f2YzsK1+Lo6jW2/alcvkaQm0+2FRDOrHJmQaml/zcY0hxbvrZCW5F2yZZ82y/8gMe15rYLx3mk8VbbpmnDLtEs1D93oeKnR/ds1KvCh7YTB1COynzNk3bdH5ls5KbtZKImOTWnJeogyNwWsT8mp+AYe/7z+yAPcfyaLcj91125c2H6KMN4zym4oC9Dm0qILOFeo26jeCnFx6J4c4V+d2EeVEeawlR/oxxSYipatlMtD2dFclnHa5xLrNunWwTChaLkgGFovmlWM5yu0fjvej1CXJXQnLsIuIEhEaxcf/O/kvBm8mW/evn/Wj1ed3yNfK6xIaLrlyjWX2UQMD5fJ3/Poy70wWxsNlUd+6aYyO5lrx9+jlrdxQvvNAPxqRS+Pod0PRkNkf0SevejHUNA6WzW3l6106w2iWer24I/7AuDHnxEYJaxa9annEPz48PZ1Yz5Slok5XMM8k+trQvGYf+v+haEi7L+P72eK6UoFpx4/L5rYItEYDv7Y3ql7v+HIg/w1Tr/7oB8Y5PwoKOUTMueaoIcNVP/COJEz6BgpIa0M1Ps0rc/Vl4O9tO5hprqi2fqkFnGJ53tvSnCsXRzmoGMhwoZrZRpctWICVBGnxHK0GF8sSDVkH9YOiffvo+LMTisy3jbL/yOR/1tPIUpxXK/jI7HpT5RSmCZnSzX9Vhf/RUDrgS91bdKi4SVKVzc+8Zmo9SZ7iUMbRdt1RKVrVVBqQ5Qw4JtB4/dBvZ9tTFdxptjPstAi/pVeUwxgccOu/KXsOxMwg7pT8IeanJwube+r/+xd639ku1l8xyO5Idd+fVFC1+/wVwqXAH7iP/vEPB488Wb/ogowztr46lsKEGTzudCH8abomWZYc42lX8BKJ5xYCl5NQ5PWU3qqovP+kISfq3I0jDkx26F/vvOIQyMIGBD0+cvu7dHVtaWAUK+oAg6lcElx93gvlhZmYh16bAVnCdt88NRj0Iq8WLejOBESyhSA7vvk0FlwD2AlUM+aSJK/tgFm7HoEe2RAxqA7px6q8oPTN0uugsr11+PG3voawXnzroTUrNRinIfXIHwsHnuZKXSeuSHImP3X0tV0IFbRWjUpnK/9d19Se8h37+8W8kHYNHspPtbYk66K5T4bGZN2iyscehXOuW8vWiXDt81zr3wplWgLxgoF+KOulolHLY2RkWKDliPAYkAevOIAkd7mO9Ln0y+fiGw5RwgO7pbDbFAblotdTKzB2T/pYdpWyZTiccwjsK+7MCq58C0AgsENuE8rvoD/HBhGMqb93G3obcW97FNiAB+lms7hoACTvOBmpdTpNVJvonkE8O3GCXvORLINgZYEDB610WmdOtZIpcdJQbw274LzXqx9hraZ1pEi3QMrMfJR0Dx37miakUbdqmwDAkPPf0L2zg3WYCMTTtIig13CY7gsG47DHQx/hskWNgup6Ti4lshiPm8AQx1Pct7F6qN7e/qiLuIpymPaLN/yKGPzjnO7khsR6Caeu78joE0sGoce+Ked88qo8MH+tiKDPKJGWHwLDqeunj3CxenClIzznxLix/6n0EU4nEUqufoHNkN2CK2Tk4+iNZxN8KdJMKmY+ns2fo/N/0dAxMyE8l6E/Gt5B+pwGDpvsKtMYq6n8ucN7Jfrt+vUALiwNHAJC1387MfkeF826G/ayUqZhq3En2JIraBTHKnI+ri/aSVO+NIYWS7pr0B9LZDPYALuRwuYU3pshzp1T3XiaJBgwjEOyHhgUFXoDDpKulbrBcIkXTDWztEwYngBEuFEZLuhlcBU3K5P1Bes5168+D+Ciom0j++z6mG0IUKLxUHZoJwTzR6Oiqbk5GsG/3oO1wPvzY1+gmqVHP4qAhO/3YOCylNIPcoquGUhsP0v1ha7Y699QpJ55Rm0PzHG8SL80MUH4EkgyNK6dD+SC1dtFalc4rgV75KmQ2lB9/rftZ1fGhrzF/tV8Trt7x8V6kV/Z/tDwfM6VU9cZYL8YPrv+/YnxRad4dy9AtLDpgZ36TSJeBD04GsxLsI7tmzJVD/dJhZHtedXP1o3vSZYEnI35kz+sPB0MPrh4GZxR+NVwZipAE9ImE2BmtbdVuXB/T2I8GGLBtKQisjQz/IFlrp3JLY4XBlaOP7VNhj0oLzpNp/91ohDhKEkkUb6awFeXZ6qZ6D3WjAWNDT69Lys6WdebmBNedlzC2BBYc4g//j9jHVDVe2LHSUbFSfRkjZLkqfgovPhRK5n47v38c8kuXceqemPZzdmBD/CAMtUyIx15AuHuZkew1/9e2xGKyuLCylO7nn+tZGjv1hEeQZXmPLHhuYxleBD0cXhiXZJiPLIkLiufucAnLVHkQZkcxt6nxLUKVY6GlwiyemfKwpl+VC4j8v0lnsoL+u6r/xJq1sPJh73aEZOEnM38WHrYIEqE4CGAo0wHTHAM93mszjCKFdlH24IswOEyJDtiwpyaz4X+MpgsTCceSQdELMFpNnN73ZR31z4+I6oYuP/VP8SC3wjxh1STNJQWpFr9b63ua55xtCuLQP9gdYy01Jf5x/4b9QtbWrMbCz1fqlnTANmj9e/VKNbaPnRqDFWU6gPTvFf7xnrrp8wVxRFZBHhrw4u3bLR6c+SeTFVnbiwnAcOMEeK+WdmNHViKfcrlPF/csO2wdD6DF7i/cXlCTsh2wdXlq8PB7TBFkIJ78/6VsZqYSYhCAPF/UZJ1VY1vef/lTkM+qLFw3buD/BLbF/SJpXtHbEwkS+w4CHQOLLxb9BrOvzS2aEdUnF7h2JGBUY+vW0ecVljW7qQ4f7KZQzUoAh08qWjLkXzWH4S1n0B7mHVjXhHdVpWR3JY9FFRHSPRYmT9X2yBZksfi5E6y3JuOvvSFZhrW4jBgyqQ/szxLJVtNGvUgmagmKyjkubpr/6S5dQXful73FNHS1yj2grdYsnxJvctKtgy3D1iXmmcFymtqWznIdUbJe373UgnJ6a24OLc81SH86Y3CzKtK/X6Th1fMg69mLBfOtj6u1n7/aXaHtGkmDDq7UNVCzgGWK5pr52foOzJWrF42nCn9F8VpMu+1DNySCtjuxqKPinlGQN65SEXBp7PQrmUNO9t2RtIgaRiplFN/UPwP3kHA4+yequlAXvpMpuI1ecYPRtnfpRiA/9E+ef4wzwXDncg1bIA/wc4ghU+dFIW01rzSJzegBLug0u1gJRkG8EoYGUeA5TAURw/sY1/+Wbq0K4/T5n5MH2VgaV2+6+SeitjCvCX7DD39b+7XpF8UUn/JZfku/deAKNngGW9130CGwBn0GfvX5bbykwCPShraimjpqxRvjSQ9aYO7FPtoRM+oi4xGbFOBFiIih+flSu5KhBVqWY6EDHU+Yka/8gW0A8l6xn4O0Rsl0YaUw6VfBfAfr0QRoVjIzD5lP/11i7E80tKoHXbM7rZSn1DsbGVfKrVr1282H1+WXouW7xbj7DW610KysI5bY/FJmuKlHy+KuC0ee8uYhWBKYFjDsDI8rlDKMYRUINDRr4VPWvBpCiXsTeu0A9CiTYakJZP1lFsTelfsG8u/jTsAmPrp0j+tPMn9m4vx29X4L4UcxkJLwQQV279alsFlmZfPfkN2OH09F0V6BUysE03s+EqC/QIQjub67nuZpcp4xlxwiRfOhx00AmZ/0PgU1bhX0rNcSnEl3ALqw/J1Mt+XjNgBw9GjCUrbgzEfTs5PYtDHx3wjbQrqcIMjCkWUmG6Wo+IArilCwZ6gtdoyHmLXpqKp+g0/+42JooIUgAiyXtrqKXJIP6awzrW1pn6rQFGjCm9Ssizmh2D05r6cCn3AKUoSYT0mz3tCwNub15njyyAMORGruyz9SczZgYni7ylwQZMQzS6NdhHeOR75ECmaOKnQ/63B/6CLrkrlkX+uS1P3eeih96To56yGgUSNapl0xoaJXgyQP2blyVeNj7QprLXvl+bD+RYmNRqP19Zmqg0P0PmL7iuqnLHaOnN8SjUXe/EidPFC7Q0znl17ZLo2DUPiTZJJU/02hfRVCRthtPIKYBdF3wttTePRS/M0UgPp9RTJHxFGY+6hRltPbttAHs8HCxh4RoQW6cG7LmbG/xc6y1+IrNmLMkTxGZjtZiBAzZAz+K9tnLNsbgt6bn/+I35HQNhRfUFGqWepR+bfduASWf6sJ/cpYjJfhnj7m3P4V59T1e5oeHyYh5NBJNRQyZtJ1u5b1S3a1SlHICzMjYHYpFp6gcKuHTZXZJsr7POqL65kAX7HVvdjr2CFVxUa7s27PyeprJmSdshMIYLL76npSGplO7iCbxqrFx98Xh4v5sIAfJe6uWBQ2yuYvM3B3J6VS8aXa9bV5FQcSqPqa5VOnUS+tGjLvW93ZEwsdqtmBxI19fUff/8KOrrDFLlE8CMEeRmpqtrHNlKcwfL7JbtRHHp4ERnFhLKQifnwGASz13RXmXKr+SbBpV35urfyrVtqpKSysdgnDxU2952Imsswqk3aAYVkYl0aA+J6qgmBEdW9NXr0kbsaYyVSeFNvi7l/+UTEglv3X9HojJGGrEzVyJtKX7Lp/pgqsb5RrwgUuEPeE40mYcYb0paC6p+mRtg6LfG9N24ZE1s7bNnrR1SmfbtnWW+h+09+JG1MDnblXERQBPZ1/ndfEFAwCXQIDIirMCQly+MbP5iIaejKpswTVplcyaA6pJ1gYAgdI/R9Kx2a8riQapelUYXYcOd7yPT90+a4OCptBcOHQ9Sh1vKME5fXbp+X4WWupqfuzsvmMjZEDTu58K3nsDdO6SRiOo3llP67RTXI7kBfDeY2ChmcGalwR80eFkPaZlvjTBVq1ehLKmmmmtiXBep1MplAGJSlL4wtZzrUI/TRpsYqtr65E2a9E89cvlLYmCO3bri5qwYg8M5OMitgjzRZN3y/Tg047q5quQqX9pGJgfFfXlGH6rADcAMEwi1N4l6F/Y+zlTOCXVGJ/Y4eMsbHrIFall69Sxcfzrtst0G/els80myERTjDIn+2QDuhMzi+itW/nX1EQgQWhGlsTx5zIUfx+7ep6VAv9FK9R8af71iw4P7lIbAOZzowRPH8F5ZgUvZOu75IOoea85+yY+cpwjIe5iTqykcbGurqVrYQR5OlhoWGomSmec0IKgn7IefpqPRK6wB2bHPXKDIJMzuyFwTP5RmPSNpd7YvDeDCIC5K0P7G4uJwBBoWuhWMCT9OP2h01PGV0NQraOnCzSLnHdwXegF583g1NHLIswJfyu+MVbX4gkeDFnOnTLzuuFWQurqyOb51DuKRG//SOVDmHwZ86RAUkXWuxHGh95ngmg2BBsDP7lIIHFKyolcEtnSkuUhBEWL456bZnUJZbtuecP5/OVPIR8kCOXrbrTHM9AcF1pjJS7MlaO+Vj8ycdNjVfdAgAqWQCixiVfJh5EMFmJpx8SCGDap7RSdkQatJfahO01VYW5iowFWp+XwEEzZkwQUskJBOXBy2EGhY5mHB3Wb4qsMutggWpWFnG4WRuJsVFTUYxUqJlb8LAU1YBi9p08zAYNmYUQQZlFEmIPqSXcorJWKFgKJbkazAeVBA8YlMiIqoaKhHUJEJSlGpQAkSuQLqooASIDz5FLpOCA0XM7jk31lRm15CIk4YARWbhAhS/0aHZnQkdWvTCidfK52GF5tfRUErLIdg4qjSfGIqxCIWmKlVZEj5c6pYzy6jkslIcA2BD0CIgOcJG0n1WjI3M7zFF3AgFEfamadNRAB4MXFkNXEpKbBQCuBgtdRuOUK4SdZZEGElCceFsA1DeVl/hLcoAiJbfY2PDXOSILA1ehAAELT/ltWZ+N0Po/RUTlrEfAkHLnoe30nv9i+WevyoCYdBbEGEG7MB0h5YbDWmO0MH+WXMe97SVFqjW7u3AZXL+6QndpTt0baZwS/cZjhvqZa9bdjRPR/W0VbbTU2MKer+++zQWae21ufZL4UYjPCudw/J9R7pe+Q0U+xllLkel1S97XOmFlXSK2cMsMY252JrP1iiQsPvlVlYL+NSB4IfYt4tsH+yXa/sEwFd5GMtX7DGZNu+ftVkStp1UuEdJfAoaHrLK9PRO2daobHoPXrNDdpcVlObOzFZMqaVfa6Gwj9J6n9pXmc3X7l1xp6iswYRf4hKM+58Wm8h0suwhZp3BvD3LF9TrZ46luD4e1c499HuSzuMMsm2OVaf/6PRNIX9j1QHL062XtfcW767KfSm9TWQ7t1/QEAcnQcKx98ueHlsrkOp4EUu24ZAE26t+KLLlAsQOuWCUsy5Ehb+LwRrKxRQIdRY9dvH7j89PBfLmG3Rw9HK2srB0BVik9bR0cghVyD6Q5k6tkJkLh/umpwJVn7FVHE5SsepqYxzAGC1PL2BlNFWL635Z67i+86JaFm86UtJ5jXcyDrY6bABYA1edwpR7O5S2zhZmwFSO/ouLaAWzo35feVIMBuHU2RnzIGk5ksUGFwDnzFuVB8tgZu9FapTMAnmdLllBnJetD8kpr7HFxthcO1xrPu2IV/+EkBXZQeC1ndnk49VdpQJuY3/MSp8PJO2Br/yuIORksOMCNWq76hHBs/M56tw+/oXPU4Y2549LOzuASEOk7jkXJF9YRKdCAGkxE8nKtOrHHTkVgONXCWnDGp6Ek6OwKr4P6HIv2ZWt0ho4WsYZ0QX2afaWAT6CE5LB/Ag8V/gj2vD4sRkgxio6tl7f8yfiBBrXhcyO8v6XU8e8dxHfSJKYBEVKRk5BScXIxCyTRRarbDZ2OXIf0u+vk0uefG4eBQoVKeZVIoQnEElkCpVGZzBZbA6XxxcIRWKJVCYPJEqyomq6YVq243oIIiQxCYqUjJyCkio8SE0jg5aOnoGRiVkmiyxW2Wx14VTO/imiHIObj3UW5jHrev0YtVn966ZFMktw1ZyP7e9Xz5pudbk1Yhd9P4wvPNKhSUssBAW+V+lMs2vp8Hagn8LrDdmwWqPyDfdm3KKYXJMAa/vfnkqHr1KMHp77ihe8W7C2fN36VxK/oh15K+NjC4u52jgd9JY0zXC4NHpg0/KpSKrn7xumXfSanS4PVHkeejnZNA3AtuYT4GXjRoPTECtwyqGCIesw+xkDJsRgTr+vHZWjih249EeaBcEQtxPuvpAP8rW9ACEQFJo2gg21TSd8G5p60qNb1HkMauFk0KyczuyHXcTGIcCId6XrTsCs9RkTRmCwwHoe3B8ZW6fho/QUsweFQiEAAAA=)}@font-face{font-family:KaTeX_Math;font-style:italic;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_SansSerif;font-style:normal;font-weight:700;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_SansSerif;font-style:italic;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_SansSerif;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Script;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Size1;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Size2;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,d09GMgABAAAAABRYAA4AAAAALRQAABQBAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAgUQIDgmcDBEICqowoRYBNgIkA4EeC1IABCAFiQAHgiQMgRwbMycjEXZztMJT/OUBT8ZvqgIwIbZlhOVRe5/Y4TgOVm/26guMVEV+hCSzx9O2ft7ukikmSyhLL+AhNmAmWIHeF87oyyi4/NktATDObmBpQqkO0XGZSf5Woc5WoP4HGIc9v1xv0DrMVJGay0kidb3pvFxg18l2T0BGVkUSqOrh9sU0W9oBQkuW72GnqAI0AYKjV580ZSBCW8pFlbACq2yAdAEyoJ6MIAUl/9lF7aK+rhqdIUkCYlX6/79Wad/9VbUMdjlEHkgnwsaYP6+65tT/v5sDVcMNgz0nW9W7YeSeDhAqVnt8TjQeDyRJmMhNLDsdFyFcpM5yOPrRK2x+f6/1Zlt1xUpMECYMsfVK+7xHARg+gbYBAwDbgN0LAJukS0YfgiOAgVjjMoAfxPDtd/B8aodFfeBFlpk4OePRGqnFO0mArZ04iM1INxduUXJo0HIiAdGQQtbvIhtIRnYdFlrsGPY49i6OayXaBK1N+4iOZ/jKhJkIE3NmJgASxa4NPxHTilZv1j6oYxu+NME39+4i7w1bbTH4X8l/zv8E72Pv/f3e1++1vKd4M/N13eva1zWAQPzD1PAoQICn0Isi6/9g7G4d5sP3QPoy1Fs6kybwChb5P1sGpBrqibEWeAOo3RZUmLwDATI/c2BQq9aBQ+oLfObWiO8go6TkCzbT8SW1m2A8OBf4DsZOriFuz1usq4vJo+k8sG3xVjg7evBAQkx9K9Npxe0pcBtOY6vUrn6JiOEJBUOSk6T09J6qkVp48BYi+95SOsresAfzKFjwiHs/giVummaj9rahvHsejzzoeYtSoJhrqOippErQmsbTgxE5k2ZDwRBXJVmTCM2VhZvcQYrR0AAs4HMI3AfgYqms6JsoUmpTLvI/sQxx9/GPIWWMdY6gFGMcFF8KlFQfHQxITyAi1wKLOwGWe9jujbXGcu5gJl0mSgOFVXrR4UEnzSD4ZQDkaxFG2448dUpD/kc1Fbo3ILLdkHZM3otBo42C9yEkbdjxArojBwtw+KaFrmwTe2iOexXAfQYrz0DVsR1YbQcHQnk7Qg7/EVKKmxLePGoWUndyd1y0nDFhz7+244d4ux5PSb6r+0ZJAUJEkl6jK6ROeR6W87IQchlv2gLw0CW7PR0QgZUc+lnA7s5IyMOKXAhGpPtopL41auNr6xChYF1H9KmLDjHWGhFEXLPThAP3sccq3ENcdEhA3dTUlX+EVI2uQMIkTbcROUZaV4r1g1CIuhufIujouUyyym5Y31/njF0t2YJyFJjqHPpS2BhUeCQpAgQLX0QziLcJmlMBj51hTmItRPhmg/VeFLetmpsVSYPijjK66mhExAFi0NTbjZztkUzeYwGRaRdEYKdFqtuXTYGRAl1HBwGpe+khdI/AgdxL+qtaGJXJkRsj3nseSP6gQUWRDyQ2puUn0aFEgdk3jjgiEKkERvECpwRBUKJgUJJgUrJgUYpgk1pwOszQItwmzHz9IKhUoK9L5pgOi85wpf27ZuvwNPvvCiMxgihFWwEVV2uGXUUJDQxaGHQw6GFIhSENBgMMFAxGGEywsg0yN27JHk+ocukoazqZlSSPrXL7aGBPnxum7XBAZCAlLWme0uv7HsdpwwE5E6tSEfYd1d3t4WgXhs72wvsYa9KVpD2OLKdDvtBvn4UR2J8jz8cPSoS4tQRzlyC2U7igUyVdZyO+QtyQORlEEQCsHyBHBqo7cw5PhyKIQ1ODTBRM5p5JJQPAL5m+1WbDib9POUs4MTaC3Lce1dmbrx1ZAOaIcw8R2dWuX/hyAI9vThubi8w1Hrc22QWpllsITPcmLUL3jWWb3rtwQdikGTiQTS5Ff7utcimNzizQfqrHRbAY+JaXeDTdAsFUKwzmujZxuWySTre73TQMs8rMEJn285RRuOyDBXJ9HW6SmVZQ2leJFGFEBrup2wKRhSJC4dC7ne7CY0905DCyAhGBkQU6NzUwPLcAF+X3PffNpUznIdwhJfiW8ioeQyVzak3zulNgZCSEGdK+Vt/BJHK5uzXvlUz7yN9nPp00s6bT25zdHHhzpgMvVM1cSlA/jmHH7MUgc7EqtM680azVt+E9s7P/fgd72OwCF4Cs1G+0EGSnhty50o5g4+kgVUVW0HNUVIC5Kk1m/A9m+O4TwOPUV2O3VDrlJV6Mwu0J7/fykb1UDGqZI+Ob2TnndMrYqtnURrJU0gEbb7hRpZLcN7U655h2lQiUJWfP/nwLl7l/ozvC3V435X0VKKBcjoxUrASZiKruCuZ6KpX0G13BWb4a4zpHFROrQQtSXFArlOpGIUG9UN2ARIloZKDAKCQICo034QIECjKaLaWW0UjQaqluQwsk2oWKDqGiU6ju8owi0Y0j0YMj0YsjHUKiVPThFEz9rppmW8jcQQ6F1gDLFB6NABELmTnAgEEL0dBoBBi20MIRSwxy8mhGVbmol7HH4NPjqXcn8PsT7SRCjohOOsiachBNbw65rjHXzsU8O9fMB/eABd6BFjqIFjlILb6G52GJnYeldh6W2XlY7gGtcBCtdJBa5YfnY7WdjzV2Ptba+VjnAa13EG1wUHmj5Rrv/W0kyky8RmD0/pt1mkRNS4vfHGX3R3F97bx79m1YAQGamUkEYhRlRK07mAWYVwA4GSBGsWEMBvuF5hsNgCZigK8TmogDox4GiCDiE4VsEbu2Qka7ahqVlZwPq2hRyFOS7Q7mNhNUKWphCl8svJdsqVgidbhuzAzcHreLcFt0QhDkXOSgjC/E2ABB3hh3ts0D+0wiM4yLIiyA4GyAlIUZv9P+/s1vjbHbXoKylWf4RSCaiN6WYIAqGJwQSDHbwmyGU2qaE8UVBHFygiDFXFR/KopYHde3Vmbcx1lfHkvoeQbXl+bztRnGFNDkg1F5QAIBcqJBHvxCCC1CQU0oQFgGXp1uDCDXldJfZ1eqydaEdV+uZgt4oUsD0Qu2fLJKBy3V8nkq/Hc/NLvAn/dzP5/LmYte61N/KnLsObfGPj8JjqirSD0FU39j5jUqnkDKuSM4LT6cXkw3OI1/n5tlnBtKZ+U5UiteWuNmWKSCX2ZpTYhlbK5f6w9bWj9PxisFxqAEZ87JO5fabVNtu/7aiI8Qgj2B0cXuu0erKB97a7uycklJsq5dw1rxJEXMRS76aXeJ3qOGHBf4zEwf+/j1iVgHwdHHmYWSL/zax3eYdC7az2SS4bS3aJqkEbJ93PbqqHF2zNjvF264FF5ovbBNLDP0VWz4/7GPr+zwT/2xn+O0GCzeQOo1KFcya2sMKfJCkKfcxa3ww3LRN0i5AfJtnL5q5Vf7GIWlZdcQBhq+r1tywfrvCyEeeEE+gd+vzBzWVJ+pkmLxZey/w4Wo39nGLuw/6aThPUdq1if5oKroXYTDU97we2SkiX4mJ9UcSO+PHLynOKuIV5DqYy9fZk2k2lvAs9YJqdleb9NMTSJfl03vhuqrQBCtrftcEZAERVh8umrFpvt6/it/yP3u297PnEMqyPNAt1nc8gXuY59kr+P01d7G+3RSUh1TkKaAN15vEc2fJZE9+BypEc6td1Hdbb5/W1IGqJLAcgUlQglXMHj5kpVgDLdciBs4NQSU55MmbdoE1kj1cZu3Kcvhli3y/Hlmx3LUDCzWWaKTlwN2b3rsrfqBmuGu3xx9/1Z3WaSGUcgDg9IvJoiD/EzwUJ6P3EH5P/7wX+AfpL7qYy0+7G3t0QfT8rNBFYjykZcQa1c+A6G18FocPd2+9BgAJuvCyiKnZKnUjvd24t6PG2HKTKTxJ6AIwziWc9xBt18temdS2JHa+DexT3RyedhBsS9d+v5UD2X01mkXqZvAn7QIX4zpqM3+zoK/z8azPADpvONXgRimkfoJISCqdRDUIUT+D+sdspegfJ1nGEOZdKy2a9e9/YPug97AM6oQfh5vCYDqMF3a/VIfKP0oJ33v3yI4hVpqQ0MOZ8wJ9AYPJPUH9/5N7Xbd/eEHrnsbnC/fSArgxHMv/vGaesYro54DLH2cPSEQYMd89P6TEQhDbLhPlub/7zXNnx/cB1VXdUoe9fobWqNkIy69+ZThg3XAYn3hugHM4zdc8NOoKk5s1FGvv01wv+fxW7QzWwNEVLi+mPx/DLT7gEBw/VpeygTNgefhp4SSYU3jgHOHW5WxY8CpaRwuTYAf9ZlwIBdD8so2z7nTYzxhQCjQj3d+XuwQFsfDj6Z82GwFpGyK+Kj6HTcP5CZPIbDanG+CHxKExcWOzzvH9QJgTUZEhSLBo6+9X+uWlhb9+BWTWVB8oWSlni/Qr/x/Z9DLbWF+9WORtLTW/f5rjwqEASHH47zucNfU7uDDm4kxq/fK5o9PrhyjLcXmrTQHnoOfmDtqat2O604P/HIX+mIVjp3AsVeKIZj85awXP4GhR2f9VQD2DwlVyJ1zfxv5Wyytuibp0T/IerHYULrUETStsVTZ+bf8HeRnGhe4xnDdK3e9Ad3+SPypDGnjGq77Rzd3cXwFdfu3dmg9HQld3LyhM6PQ5s6VioZO+7EZY/94Gm293+5U/+vAH7mhaW3NXPO8uuIjPTVE1TW7Rgqe4WM20M+fn6dAuKgFvXJeso5ZJtmhq+8pz6FSs09mHmiG1lQdC5Olxa3e5y3l2BDyNW973FPFGRQqIHc2mcmXagjN5zeUsyV8eUH6PcfMH8l/XyvZPJqZfdpn3NrAFH2Sdux/OPOpuUrq1CU8+K42/a/E5aY/WiSrVYoGZZ11lbP2M5balesjk15KjJtRVap02r2ar6QM8Z9kK9lieDp5u+pAl34pUi9R+PUjdz3vteYVqJNenPgZuv4NJ4oL+BfwDwu3UCEIuipTy63+hvVTtejHwXw/g7sxsNS41rLL6QtRJLu3hxU3rnk6Y38FUZHaYi2qa7D6PxzyWplZF7Yc2GeB95dUfLg0HL9U2ipn6G++5q2JBb1BWbDK2Y6SSdVKq2nNkhIFM/leQaV1KH659t1F8Kf8ovZ+fokafL/bZZcVKW9Lnyp6ugzFN27XPZ0if1bOwqmkWUrZneqkN6RJgUQlBvjEKtkVhfqpDNWr8/viJ3ehr5IVl2UsTDkUkT6RlPyV1PZ9ozBiQB5uKtOj20QjjWXu7sOC5kqot/QdJ29pT9P4vQ9wONs+efVUWVH8kGHDddYI54F7cfq09haJPwFPcOMe3jq9dADwlVvVZ6SSmzMqX+vgKDvxKLktaRXlW3aURpxzLZ8GeIfqj3SF5Wv8Jh4JE9Sub82rV3+otesUN7ty/7cu+CdQjEv/wcPIvzB25eBEQuFKkeD7eNa1qKGn85NA4NoTvcrivs8TnexLTRRGrrgzHFZDrg8GxS5eu67kvMgTD8KtO2/cEN64iV4/GGR8jr5qyz62QhB2vDN78K2ynacnU0fy79q54NCKJ+LTR/XX4pTPV+zevtm7FhxZFSw65rI3RJWrxxZGsk4mt3Ufrd5UsvCXE0cEkuQkxxCn29JvO3zaGDYPT5w9JV5cMV2sKqf8lENjoD5ntebzRQrPn5sfBg3Y9eaY4R9Wyv1VfCTbppMQtQaZDGGIhfMXLXyzt3xZp2TX/oZthspXhS6KN+tRXsxQG+G0m4M7O7bwiqtibyDjj57hr+raSASbIpGHxFAPExuXt6UUL1uOYcyFv/ivoY9Ub9qxc5xYvszx8OKNqKkpPL4bWv8JbGC+ojlw8Msv0YqVCJv117zKPQKHx7FbsKDyr9Saetkf6bKf0d6kscFweJD8OSJRX3pczSIV4UiQV/pVUvJbpbxgJKwgWerHL6klkZ9JNPt3TWvw6Sn91LS/+qdpubykE6ZX29dsXwzTgxL2Og5/7n3mKXh7QXMGRBKtb7O9de7eLlHOb2wR/uWkZ1Hu8IPS/fwr+/cE615GLQCwATOVoux1QWvUoxnx/yJW71oMGPwNThiJqujvIhaAG/e2dSEzeAJvwocE7gFx8CDMBUZW8C9nWknk/pWFWSrif/AUI6cgoxsdCVogI5zjR0Q9rmI/mmBmUAwfZsRSGIJRPy8Q+QI8jJbVJT2Lch8wvNho8yCAkA9i2xwYhwMiOJ5OeIq5CJROzMVACHfOxaHY43MJSAvw5zLAH3Duk9k6V4DNRpOvpBDSQ29DgRGj5hsXdocBk0iUECOSE42WySorR1iUVKjfhIEaLmiQAf0qBKsWpDI4cTZc99Md0uFRFUrT4xq+sEdf7R8yX4WAxlU269IgbEG/U73+cE9TBvUYV2zEsElJjXdNvydjo31CspCO9sO63CuwKiiZcSaskdDBBlQ2VZOHmq1UUyEcMXCkhmM309irpoeNi5H5g8qyZGetOeY+9dsM6QnhgAhpn8fG0N8kj7FEu+U3NQe7r57Frv2HFly9CZMzJL9mglU1DTv7kOVcJqlaj6E9VEKutFYuNLK97wlz1UAxW809MJ4icWqQmBB7mEAfpkwfCUPSMv0uwjKVobXGqMGu3O+70g0se6AmkjZ6u++9n9Rj2ptwVU3sNbhPkhnT47fVp05RnZSFW6Rw0qhX9rd1Qqh4UlST0dgoZAa5vurb1ShWaVjAQGzszMqc0tRfM993wAM+SOXJ59WpO4DBm/AWwhEBBxAD9sNpOISYiIXYiIO4iIf4SICESITESIKkSIbkSIGUKI41NRymaR8tXbuLdnImw4N9/f8Zk9UVp9NBw1hngVNoF40toB2H47RcU120x8l0fJZ/akaRx8qc6qNpx+E4nfR7c0PFEzxZ3xxDaEtLFP0sucNRDFj+GIAJ1so9510AwFtK2AAHKLzWo3V1zVHvumYl9Qmq5U42zFmv1E6MGZaRu9nLABHqzUKNzSxuOQZC051oZvWIzTGsU3vL6GNCYRUA)}@font-face{font-family:KaTeX_Size3;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Size4;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}@font-face{font-family:KaTeX_Typewriter;font-style:normal;font-weight:400;src:url(data:font/woff2;base64,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)}');
                c.push('.katex{text-rendering:auto;font:normal 1.21em KaTeX_Main,Times New Roman,serif;line-height:1.2;text-indent:0}.katex *{-ms-high-contrast-adjust:none!important;border-color:currentColor}.katex .katex-version:after{content:"0.16.9"}.katex .katex-mathml{clip:rect(1px,1px,1px,1px);border:0;height:1px;overflow:hidden;padding:0;position:absolute;width:1px}.katex .katex-html>.newline{display:block}.katex .base{position:relative;white-space:nowrap;width:-webkit-min-content;width:-moz-min-content;width:min-content}.katex .base,.katex .strut{display:inline-block}.katex .textbf{font-weight:700}.katex .textit{font-style:italic}.katex .textrm{font-family:KaTeX_Main}.katex .textsf{font-family:KaTeX_SansSerif}.katex .texttt{font-family:KaTeX_Typewriter}.katex .mathnormal{font-family:KaTeX_Math;font-style:italic}.katex .mathit{font-family:KaTeX_Main;font-style:italic}.katex .mathrm{font-style:normal}.katex .mathbf{font-family:KaTeX_Main;font-weight:700}.katex .boldsymbol{font-family:KaTeX_Math;font-style:italic;font-weight:700}.katex .amsrm,.katex .mathbb,.katex .textbb{font-family:KaTeX_AMS}.katex .mathcal{font-family:KaTeX_Caligraphic}.katex .mathfrak,.katex .textfrak{font-family:KaTeX_Fraktur}.katex .mathboldfrak,.katex .textboldfrak{font-family:KaTeX_Fraktur;font-weight:700}.katex .mathtt{font-family:KaTeX_Typewriter}.katex .mathscr,.katex .textscr{font-family:KaTeX_Script}.katex .mathsf,.katex .textsf{font-family:KaTeX_SansSerif}.katex .mathboldsf,.katex .textboldsf{font-family:KaTeX_SansSerif;font-weight:700}.katex .mathitsf,.katex .textitsf{font-family:KaTeX_SansSerif;font-style:italic}.katex .mainrm{font-family:KaTeX_Main;font-style:normal}.katex .vlist-t{border-collapse:collapse;display:inline-table;table-layout:fixed}.katex .vlist-r{display:table-row}.katex .vlist{display:table-cell;position:relative;vertical-align:bottom}.katex .vlist>span{display:block;height:0;position:relative}.katex .vlist>span>span{display:inline-block}.katex .vlist>span>.pstrut{overflow:hidden;width:0}.katex .vlist-t2{margin-right:-2px}.katex .vlist-s{display:table-cell;font-size:1px;min-width:2px;vertical-align:bottom;width:2px}.katex .vbox{align-items:baseline;display:inline-flex;flex-direction:column}.katex .hbox{width:100%}.katex .hbox,.katex .thinbox{display:inline-flex;flex-direction:row}.katex .thinbox{max-width:0;width:0}.katex .msupsub{text-align:left}.katex .mfrac>span>span{text-align:center}.katex .mfrac .frac-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline,.katex .hline,.katex .mfrac .frac-line,.katex .overline .overline-line,.katex .rule,.katex .underline .underline-line{min-height:1px}.katex .mspace{display:inline-block}.katex .clap,.katex .llap,.katex .rlap{position:relative;width:0}.katex .clap>.inner,.katex .llap>.inner,.katex .rlap>.inner{position:absolute}.katex .clap>.fix,.katex .llap>.fix,.katex .rlap>.fix{display:inline-block}.katex .llap>.inner{right:0}.katex .clap>.inner,.katex .rlap>.inner{left:0}.katex .clap>.inner>span{margin-left:-50%;margin-right:50%}.katex .rule{border:0 solid;display:inline-block;position:relative}.katex .hline,.katex .overline .overline-line,.katex .underline .underline-line{border-bottom-style:solid;display:inline-block;width:100%}.katex .hdashline{border-bottom-style:dashed;display:inline-block;width:100%}.katex .sqrt>.root{margin-left:.27777778em;margin-right:-.55555556em}.katex .fontsize-ensurer.reset-size1.size1,.katex .sizing.reset-size1.size1{font-size:1em}.katex .fontsize-ensurer.reset-size1.size2,.katex .sizing.reset-size1.size2{font-size:1.2em}.katex .fontsize-ensurer.reset-size1.size3,.katex .sizing.reset-size1.size3{font-size:1.4em}.katex .fontsize-ensurer.reset-size1.size4,.katex .sizing.reset-size1.size4{font-size:1.6em}.katex .fontsize-ensurer.reset-size1.size5,.katex .sizing.reset-size1.size5{font-size:1.8em}.katex .fontsize-ensurer.reset-size1.size6,.katex .sizing.reset-size1.size6{font-size:2em}.katex .fontsize-ensurer.reset-size1.size7,.katex .sizing.reset-size1.size7{font-size:2.4em}.katex .fontsize-ensurer.reset-size1.size8,.katex .sizing.reset-size1.size8{font-size:2.88em}.katex .fontsize-ensurer.reset-size1.size9,.katex .sizing.reset-size1.size9{font-size:3.456em}.katex .fontsize-ensurer.reset-size1.size10,.katex .sizing.reset-size1.size10{font-size:4.148em}.katex .fontsize-ensurer.reset-size1.size11,.katex .sizing.reset-size1.size11{font-size:4.976em}.katex .fontsize-ensurer.reset-size2.size1,.katex .sizing.reset-size2.size1{font-size:.83333333em}.katex .fontsize-ensurer.reset-size2.size2,.katex .sizing.reset-size2.size2{font-size:1em}.katex .fontsize-ensurer.reset-size2.size3,.katex .sizing.reset-size2.size3{font-size:1.16666667em}.katex .fontsize-ensurer.reset-size2.size4,.katex .sizing.reset-size2.size4{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size2.size5,.katex .sizing.reset-size2.size5{font-size:1.5em}.katex .fontsize-ensurer.reset-size2.size6,.katex .sizing.reset-size2.size6{font-size:1.66666667em}.katex .fontsize-ensurer.reset-size2.size7,.katex .sizing.reset-size2.size7{font-size:2em}.katex .fontsize-ensurer.reset-size2.size8,.katex .sizing.reset-size2.size8{font-size:2.4em}.katex .fontsize-ensurer.reset-size2.size9,.katex .sizing.reset-size2.size9{font-size:2.88em}.katex .fontsize-ensurer.reset-size2.size10,.katex .sizing.reset-size2.size10{font-size:3.45666667em}.katex .fontsize-ensurer.reset-size2.size11,.katex .sizing.reset-size2.size11{font-size:4.14666667em}.katex .fontsize-ensurer.reset-size3.size1,.katex .sizing.reset-size3.size1{font-size:.71428571em}.katex .fontsize-ensurer.reset-size3.size2,.katex .sizing.reset-size3.size2{font-size:.85714286em}.katex .fontsize-ensurer.reset-size3.size3,.katex .sizing.reset-size3.size3{font-size:1em}.katex .fontsize-ensurer.reset-size3.size4,.katex .sizing.reset-size3.size4{font-size:1.14285714em}.katex .fontsize-ensurer.reset-size3.size5,.katex .sizing.reset-size3.size5{font-size:1.28571429em}.katex .fontsize-ensurer.reset-size3.size6,.katex .sizing.reset-size3.size6{font-size:1.42857143em}.katex .fontsize-ensurer.reset-size3.size7,.katex .sizing.reset-size3.size7{font-size:1.71428571em}.katex .fontsize-ensurer.reset-size3.size8,.katex .sizing.reset-size3.size8{font-size:2.05714286em}.katex .fontsize-ensurer.reset-size3.size9,.katex .sizing.reset-size3.size9{font-size:2.46857143em}.katex .fontsize-ensurer.reset-size3.size10,.katex .sizing.reset-size3.size10{font-size:2.96285714em}.katex .fontsize-ensurer.reset-size3.size11,.katex .sizing.reset-size3.size11{font-size:3.55428571em}.katex .fontsize-ensurer.reset-size4.size1,.katex .sizing.reset-size4.size1{font-size:.625em}.katex .fontsize-ensurer.reset-size4.size2,.katex .sizing.reset-size4.size2{font-size:.75em}.katex .fontsize-ensurer.reset-size4.size3,.katex .sizing.reset-size4.size3{font-size:.875em}.katex .fontsize-ensurer.reset-size4.size4,.katex .sizing.reset-size4.size4{font-size:1em}.katex .fontsize-ensurer.reset-size4.size5,.katex .sizing.reset-size4.size5{font-size:1.125em}.katex .fontsize-ensurer.reset-size4.size6,.katex .sizing.reset-size4.size6{font-size:1.25em}.katex .fontsize-ensurer.reset-size4.size7,.katex .sizing.reset-size4.size7{font-size:1.5em}.katex .fontsize-ensurer.reset-size4.size8,.katex .sizing.reset-size4.size8{font-size:1.8em}.katex .fontsize-ensurer.reset-size4.size9,.katex .sizing.reset-size4.size9{font-size:2.16em}.katex .fontsize-ensurer.reset-size4.size10,.katex .sizing.reset-size4.size10{font-size:2.5925em}.katex .fontsize-ensurer.reset-size4.size11,.katex .sizing.reset-size4.size11{font-size:3.11em}.katex .fontsize-ensurer.reset-size5.size1,.katex .sizing.reset-size5.size1{font-size:.55555556em}.katex .fontsize-ensurer.reset-size5.size2,.katex .sizing.reset-size5.size2{font-size:.66666667em}.katex .fontsize-ensurer.reset-size5.size3,.katex .sizing.reset-size5.size3{font-size:.77777778em}.katex .fontsize-ensurer.reset-size5.size4,.katex .sizing.reset-size5.size4{font-size:.88888889em}.katex .fontsize-ensurer.reset-size5.size5,.katex .sizing.reset-size5.size5{font-size:1em}.katex .fontsize-ensurer.reset-size5.size6,.katex .sizing.reset-size5.size6{font-size:1.11111111em}.katex .fontsize-ensurer.reset-size5.size7,.katex .sizing.reset-size5.size7{font-size:1.33333333em}.katex .fontsize-ensurer.reset-size5.size8,.katex .sizing.reset-size5.size8{font-size:1.6em}.katex .fontsize-ensurer.reset-size5.size9,.katex .sizing.reset-size5.size9{font-size:1.92em}.katex .fontsize-ensurer.reset-size5.size10,.katex .sizing.reset-size5.size10{font-size:2.30444444em}.katex .fontsize-ensurer.reset-size5.size11,.katex .sizing.reset-size5.size11{font-size:2.76444444em}.katex .fontsize-ensurer.reset-size6.size1,.katex .sizing.reset-size6.size1{font-size:.5em}.katex .fontsize-ensurer.reset-size6.size2,.katex .sizing.reset-size6.size2{font-size:.6em}.katex .fontsize-ensurer.reset-size6.size3,.katex .sizing.reset-size6.size3{font-size:.7em}.katex .fontsize-ensurer.reset-size6.size4,.katex .sizing.reset-size6.size4{font-size:.8em}.katex .fontsize-ensurer.reset-size6.size5,.katex .sizing.reset-size6.size5{font-size:.9em}.katex .fontsize-ensurer.reset-size6.size6,.katex .sizing.reset-size6.size6{font-size:1em}.katex .fontsize-ensurer.reset-size6.size7,.katex .sizing.reset-size6.size7{font-size:1.2em}.katex .fontsize-ensurer.reset-size6.size8,.katex .sizing.reset-size6.size8{font-size:1.44em}.katex .fontsize-ensurer.reset-size6.size9,.katex .sizing.reset-size6.size9{font-size:1.728em}.katex .fontsize-ensurer.reset-size6.size10,.katex .sizing.reset-size6.size10{font-size:2.074em}.katex .fontsize-ensurer.reset-size6.size11,.katex .sizing.reset-size6.size11{font-size:2.488em}.katex .fontsize-ensurer.reset-size7.size1,.katex .sizing.reset-size7.size1{font-size:.41666667em}.katex .fontsize-ensurer.reset-size7.size2,.katex .sizing.reset-size7.size2{font-size:.5em}.katex .fontsize-ensurer.reset-size7.size3,.katex .sizing.reset-size7.size3{font-size:.58333333em}.katex .fontsize-ensurer.reset-size7.size4,.katex .sizing.reset-size7.size4{font-size:.66666667em}.katex .fontsize-ensurer.reset-size7.size5,.katex .sizing.reset-size7.size5{font-size:.75em}.katex .fontsize-ensurer.reset-size7.size6,.katex .sizing.reset-size7.size6{font-size:.83333333em}.katex .fontsize-ensurer.reset-size7.size7,.katex .sizing.reset-size7.size7{font-size:1em}.katex .fontsize-ensurer.reset-size7.size8,.katex .sizing.reset-size7.size8{font-size:1.2em}.katex .fontsize-ensurer.reset-size7.size9,.katex .sizing.reset-size7.size9{font-size:1.44em}.katex .fontsize-ensurer.reset-size7.size10,.katex .sizing.reset-size7.size10{font-size:1.72833333em}.katex .fontsize-ensurer.reset-size7.size11,.katex .sizing.reset-size7.size11{font-size:2.07333333em}.katex .fontsize-ensurer.reset-size8.size1,.katex .sizing.reset-size8.size1{font-size:.34722222em}.katex .fontsize-ensurer.reset-size8.size2,.katex .sizing.reset-size8.size2{font-size:.41666667em}.katex .fontsize-ensurer.reset-size8.size3,.katex .sizing.reset-size8.size3{font-size:.48611111em}.katex .fontsize-ensurer.reset-size8.size4,.katex .sizing.reset-size8.size4{font-size:.55555556em}.katex .fontsize-ensurer.reset-size8.size5,.katex .sizing.reset-size8.size5{font-size:.625em}.katex .fontsize-ensurer.reset-size8.size6,.katex .sizing.reset-size8.size6{font-size:.69444444em}.katex .fontsize-ensurer.reset-size8.size7,.katex .sizing.reset-size8.size7{font-size:.83333333em}.katex .fontsize-ensurer.reset-size8.size8,.katex .sizing.reset-size8.size8{font-size:1em}.katex .fontsize-ensurer.reset-size8.size9,.katex .sizing.reset-size8.size9{font-size:1.2em}.katex .fontsize-ensurer.reset-size8.size10,.katex .sizing.reset-size8.size10{font-size:1.44027778em}.katex .fontsize-ensurer.reset-size8.size11,.katex .sizing.reset-size8.size11{font-size:1.72777778em}.katex .fontsize-ensurer.reset-size9.size1,.katex .sizing.reset-size9.size1{font-size:.28935185em}.katex .fontsize-ensurer.reset-size9.size2,.katex .sizing.reset-size9.size2{font-size:.34722222em}.katex .fontsize-ensurer.reset-size9.size3,.katex .sizing.reset-size9.size3{font-size:.40509259em}.katex .fontsize-ensurer.reset-size9.size4,.katex .sizing.reset-size9.size4{font-size:.46296296em}.katex .fontsize-ensurer.reset-size9.size5,.katex .sizing.reset-size9.size5{font-size:.52083333em}.katex .fontsize-ensurer.reset-size9.size6,.katex .sizing.reset-size9.size6{font-size:.5787037em}.katex .fontsize-ensurer.reset-size9.size7,.katex .sizing.reset-size9.size7{font-size:.69444444em}.katex .fontsize-ensurer.reset-size9.size8,.katex .sizing.reset-size9.size8{font-size:.83333333em}.katex .fontsize-ensurer.reset-size9.size9,.katex .sizing.reset-size9.size9{font-size:1em}.katex .fontsize-ensurer.reset-size9.size10,.katex .sizing.reset-size9.size10{font-size:1.20023148em}.katex .fontsize-ensurer.reset-size9.size11,.katex .sizing.reset-size9.size11{font-size:1.43981481em}.katex .fontsize-ensurer.reset-size10.size1,.katex .sizing.reset-size10.size1{font-size:.24108004em}.katex .fontsize-ensurer.reset-size10.size2,.katex .sizing.reset-size10.size2{font-size:.28929605em}.katex .fontsize-ensurer.reset-size10.size3,.katex .sizing.reset-size10.size3{font-size:.33751205em}.katex .fontsize-ensurer.reset-size10.size4,.katex .sizing.reset-size10.size4{font-size:.38572806em}.katex .fontsize-ensurer.reset-size10.size5,.katex .sizing.reset-size10.size5{font-size:.43394407em}.katex .fontsize-ensurer.reset-size10.size6,.katex .sizing.reset-size10.size6{font-size:.48216008em}.katex .fontsize-ensurer.reset-size10.size7,.katex .sizing.reset-size10.size7{font-size:.57859209em}.katex .fontsize-ensurer.reset-size10.size8,.katex .sizing.reset-size10.size8{font-size:.69431051em}.katex .fontsize-ensurer.reset-size10.size9,.katex .sizing.reset-size10.size9{font-size:.83317261em}.katex .fontsize-ensurer.reset-size10.size10,.katex .sizing.reset-size10.size10{font-size:1em}.katex .fontsize-ensurer.reset-size10.size11,.katex .sizing.reset-size10.size11{font-size:1.19961427em}.katex .fontsize-ensurer.reset-size11.size1,.katex .sizing.reset-size11.size1{font-size:.20096463em}.katex .fontsize-ensurer.reset-size11.size2,.katex .sizing.reset-size11.size2{font-size:.24115756em}.katex .fontsize-ensurer.reset-size11.size3,.katex .sizing.reset-size11.size3{font-size:.28135048em}.katex .fontsize-ensurer.reset-size11.size4,.katex .sizing.reset-size11.size4{font-size:.32154341em}.katex .fontsize-ensurer.reset-size11.size5,.katex .sizing.reset-size11.size5{font-size:.36173633em}.katex .fontsize-ensurer.reset-size11.size6,.katex .sizing.reset-size11.size6{font-size:.40192926em}.katex .fontsize-ensurer.reset-size11.size7,.katex .sizing.reset-size11.size7{font-size:.48231511em}.katex .fontsize-ensurer.reset-size11.size8,.katex .sizing.reset-size11.size8{font-size:.57877814em}.katex .fontsize-ensurer.reset-size11.size9,.katex .sizing.reset-size11.size9{font-size:.69453376em}.katex .fontsize-ensurer.reset-size11.size10,.katex .sizing.reset-size11.size10{font-size:.83360129em}.katex .fontsize-ensurer.reset-size11.size11,.katex .sizing.reset-size11.size11{font-size:1em}.katex .delimsizing.size1{font-family:KaTeX_Size1}.katex .delimsizing.size2{font-family:KaTeX_Size2}.katex .delimsizing.size3{font-family:KaTeX_Size3}.katex .delimsizing.size4{font-family:KaTeX_Size4}.katex .delimsizing.mult .delim-size1>span{font-family:KaTeX_Size1}.katex .delimsizing.mult .delim-size4>span{font-family:KaTeX_Size4}.katex .nulldelimiter{display:inline-block;width:.12em}.katex .delimcenter,.katex .op-symbol{position:relative}.katex .op-symbol.small-op{font-family:KaTeX_Size1}.katex .op-symbol.large-op{font-family:KaTeX_Size2}.katex .accent>.vlist-t,.katex .op-limits>.vlist-t{text-align:center}.katex .accent .accent-body{position:relative}.katex .accent .accent-body:not(.accent-full){width:0}.katex .overlay{display:block}.katex .mtable .vertical-separator{display:inline-block;min-width:1px}.katex .mtable .arraycolsep{display:inline-block}.katex .mtable .col-align-c>.vlist-t{text-align:center}.katex .mtable .col-align-l>.vlist-t{text-align:left}.katex .mtable .col-align-r>.vlist-t{text-align:right}.katex .svg-align{text-align:left}.katex svg{fill:currentColor;stroke:currentColor;fill-rule:nonzero;fill-opacity:1;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;display:block;height:inherit;position:absolute;width:100%}.katex svg path{stroke:none}.katex img{border-style:none;max-height:none;max-width:none;min-height:0;min-width:0}.katex .stretchy{display:block;overflow:hidden;position:relative;width:100%}.katex .stretchy:after,.katex .stretchy:before{content:""}.katex .hide-tail{overflow:hidden;position:relative;width:100%}.katex .halfarrow-left{left:0;overflow:hidden;position:absolute;width:50.2%}.katex .halfarrow-right{overflow:hidden;position:absolute;right:0;width:50.2%}.katex .brace-left{left:0;overflow:hidden;position:absolute;width:25.1%}.katex .brace-center{left:25%;overflow:hidden;position:absolute;width:50%}.katex .brace-right{overflow:hidden;position:absolute;right:0;width:25.1%}.katex .x-arrow-pad{padding:0 .5em}.katex .cd-arrow-pad{padding:0 .55556em 0 .27778em}.katex .mover,.katex .munder,.katex .x-arrow{text-align:center}.katex .boxpad{padding:0 .3em}.katex .fbox,.katex .fcolorbox{border:.04em solid;box-sizing:border-box}.katex .cancel-pad{padding:0 .2em}.katex .cancel-lap{margin-left:-.2em;margin-right:-.2em}.katex .sout{border-bottom-style:solid;border-bottom-width:.08em}.katex .angl{border-right:.049em solid;border-top:.049em solid;box-sizing:border-box;margin-right:.03889em}.katex .anglpad{padding:0 .03889em}.katex .eqn-num:before{content:"(" counter(katexEqnNo) ")";counter-increment:katexEqnNo}.katex .mml-eqn-num:before{content:"(" counter(mmlEqnNo) ")";counter-increment:mmlEqnNo}.katex .mtr-glue{width:50%}.katex .cd-vert-arrow{display:inline-block;position:relative}.katex .cd-label-left{display:inline-block;position:absolute;right:calc(50% + .3em);text-align:left}.katex .cd-label-right{display:inline-block;left:calc(50% + .3em);position:absolute;text-align:right}.katex-display{display:block;margin:1em 0;text-align:center}.katex-display>.katex{display:block;text-align:center;white-space:nowrap}.katex-display>.katex>.katex-html{display:block;position:relative}.katex-display>.katex>.katex-html>.tag{position:absolute;right:0}.katex-display.leqno>.katex>.katex-html>.tag{left:0;right:auto}.katex-display.fleqn>.katex{padding-left:2em;text-align:left}');
                // xf_editor 上下文样式
                c.push('.xf_editor-html-preview p.xf_editor-tex{text-align:center;}.xf_editor-html-preview span.xf_editor-tex{margin:0 5px;}');
            }
            // --- 代码高亮（prettyprint）— 统一暗色主题，无交替背景
            if (f.prettyprint) {
                c.push('.pln{color:#e6edf3}.str,.atv{color:#ce9178}.kwd,.tag{color:#569cd6}.com{color:#6a9955;font-style:italic}.typ{color:#4ec9b0}.lit{color:#b5cea8}.pun,.opn,.clo{color:#d4d4d4}.atn{color:#9cdcfe}.dec{color:#4ec9b0}.var{color:#9cdcfe}.fun{color:#dcdcaa}');
                c.push('ol.linenums{margin:0!important;padding:0 0 0 3em!important;color:#484f58}ol.linenums li{list-style-type:decimal!important;padding-left:6px;min-height:1.5em;line-height:1.6;color:#e6edf3}ol.linenums li.L0,ol.linenums li.L1,ol.linenums li.L2,ol.linenums li.L3,ol.linenums li.L4,ol.linenums li.L5,ol.linenums li.L6,ol.linenums li.L7,ol.linenums li.L8,ol.linenums li.L9{list-style-type:decimal!important}');
            }
            // --- 字帖图标（SVG inline icons）---
            if (f.copybookIcons) {
                c.push('.fa.xf_editor-icon-copybook,.fa.xf_editor-icon-tian,.fa.xf_editor-icon-mi,.fa.xf_editor-icon-pinyin{width:15px;height:15px;vertical-align:middle;position:relative;font-family:inherit!important;overflow:visible;margin-top:-1px;}');
                c.push('.fa.xf_editor-icon-copybook{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Cpath d=%27M2 1h7l3 3v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cpath d=%27M9 1v3h3%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cline x1=%274%27 y1=%276%27 x2=%2710%27 y2=%276%27 stroke=%27%23999%27 stroke-width=%270.6%27/%3E%3Cline x1=%274%27 y1=%278%27 x2=%279%27 y2=%278%27 stroke=%27%23999%27 stroke-width=%270.5%27/%3E%3Cline x1=%274%27 y1=%2710%27 x2=%278%27 y2=%2710%27 stroke=%27%23999%27 stroke-width=%270.5%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
                c.push('.fa.xf_editor-icon-tian{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Crect x=%270.5%27 y=%270.5%27 width=%2713%27 height=%2713%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.5%27 rx=%271.5%27/%3E%3Cline x1=%270.5%27 y1=%277%27 x2=%2713.5%27 y2=%277%27 stroke=%27%23555%27 stroke-width=%271%27/%3E%3Cline x1=%277%27 y1=%270.5%27 x2=%277%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%271%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
                c.push('.fa.xf_editor-icon-mi{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Crect x=%270.5%27 y=%270.5%27 width=%2713%27 height=%2713%27 fill=%27none%27 stroke=%27%23555%27 stroke-width=%271.5%27 rx=%271.5%27/%3E%3Cline x1=%270.5%27 y1=%277%27 x2=%2713.5%27 y2=%277%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%277%27 y1=%270.5%27 x2=%277%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%270.5%27 y1=%270.5%27 x2=%2713.5%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%2713.5%27 y1=%270.5%27 x2=%270.5%27 y2=%2713.5%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
                c.push('.fa.xf_editor-icon-pinyin{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 14 14%27%3E%3Cline x1=%271%27 y1=%272%27 x2=%2713%27 y2=%272%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%271%27 y1=%276%27 x2=%2713%27 y2=%276%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3Cline x1=%271%27 y1=%2710%27 x2=%2713%27 y2=%2710%27 stroke=%27%23555%27 stroke-width=%270.8%27/%3E%3Cline x1=%271%27 y1=%2712%27 x2=%2713%27 y2=%2712%27 stroke=%27%23555%27 stroke-width=%271.2%27/%3E%3C/svg%3E");background-size:contain;background-repeat:no-repeat;background-position:center;}');
            }
            // --- TOC 目录 ---
            if (f.toc) {
                c.push('.markdown-toc.xf_editor-markdown-toc{padding:16px 20px;margin:16px 0;background:#f8f9fb;border:1px solid #e1e4e8;border-radius:8px;font-size:14px;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list{margin:0;padding:0 0 0 4px;list-style:none;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list ul{padding-left:18px;list-style:none;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list li{margin:4px 0;position:relative;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a{color:#0366d6;text-decoration:none;font-size:13px;line-height:1.6;display:inline-block;padding:2px 0;transition:all 150ms ease;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a:hover{color:#005cc5;text-decoration:underline;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-1{font-weight:600;font-size:14px;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-2{font-weight:500;font-size:13px;padding-left:4px;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-3{font-weight:400;font-size:12.5px;padding-left:8px;color:#586069;}.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-4,.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-5,.markdown-toc.xf_editor-markdown-toc .markdown-toc-list a.toc-level-6{font-size:12px;padding-left:12px;color:#6a737d;}');
                c.push('.xf_editor-toc-menu{position:relative;display:inline-block;margin:8px 0;}.xf_editor-toc-menu .toc-menu-btn{display:inline-block;padding:6px 14px;background:#f6f8fa;border:1px solid #d1d5da;border-radius:6px;font-size:13px;color:#24292e;cursor:pointer;text-decoration:none!important;transition:all 200ms ease;}.xf_editor-toc-menu .toc-menu-btn:hover{background:#e1e4e8;border-color:#c6cbd1;}.xf_editor-toc-menu .toc-menu-btn .fa{margin-right:5px;font-size:12px;}');
                c.push('.xf_editor-toc-menu .markdown-toc-list{display:none;position:absolute;top:100%;left:0;min-width:220px;max-height:460px;overflow-y:auto;background:#fff;border:1px solid #d1d5da;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:400;margin-top:4px;padding:8px 0;}.xf_editor-toc-menu .markdown-toc-list li{padding:0;}.xf_editor-toc-menu .markdown-toc-list a{display:block;padding:5px 16px;color:#24292e;font-size:13px;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:background 150ms ease;}.xf_editor-toc-menu .markdown-toc-list a:hover{background:#f1f8ff;color:#0366d6;}.xf_editor-toc-menu .markdown-toc-list a.toc-level-1{font-weight:600;}.xf_editor-toc-menu .markdown-toc-list a.toc-level-2{padding-left:24px;font-weight:500;}.xf_editor-toc-menu .markdown-toc-list a.toc-level-3{padding-left:32px;font-size:12.5px;}');
            }
            // --- 脚注样式 ---
            if (f.footnotes) {
                c.push('.xf_editor-footnotes-section{margin-top:24px;padding-top:12px;border-top:1px solid #d1d5db;}.xf_editor-footnote-sep{display:none;}.xf_editor-footnote-title{font-size:14px;font-weight:700;color:#1f2937;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}.xf_editor-footnote-list{padding:0;margin:0;list-style:none;counter-reset:xf_editor-fn-counter;}');
                c.push('.xf_editor-footnote-item{position:relative;margin-bottom:6px;padding:8px 10px 8px 32px;font-size:13px;line-height:1.5;color:#4b5563;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;transition:all 0.25s ease;}.xf_editor-footnote-item::before{counter-increment:xf_editor-fn-counter;content:counter(xf_editor-fn-counter);position:absolute;left:8px;top:8px;font-size:11px;font-weight:700;color:#6b7280;min-width:18px;text-align:center;}.xf_editor-footnote-content{display:block;}.xf_editor-footnote-content p{margin:0 0 6px;}.xf_editor-footnote-backref{display:none;}');
                c.push('.xf_editor-footnote-ref-wrapper{display:inline;margin:0 1px;font-size:75%;line-height:0;position:relative;bottom:0.5em;}.xf_editor-footnote-ref-wrapper a{text-decoration:none;color:#2563eb;font-weight:600;}.xf_editor-footnote-ref-wrapper a:hover{color:#1d4ed8;text-decoration:underline;}.xf_editor-footnote-highlight{background:#fef3c7 !important;border-color:#f59e0b !important;box-shadow:0 0 12px rgba(245,158,11,0.3) !important;transition:all 0.3s ease;animation:xf_editor-footnote-pulse 0.6s ease-in-out;}@keyframes xf_editor-footnote-pulse{0%,100%{box-shadow:0 0 8px rgba(245,158,11,0.2);}50%{box-shadow:0 0 20px rgba(245,158,11,0.5);}}');
            }
            // --- 字帖（copybook）---
            if (f.copybook) {
                c.push('.xf_editor-copybook{display:block;margin:1em 0;padding:12px 8px;background:#fef7e9;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow-x:auto;}.xf_editor-copybook-row{display:flex;justify-content:center;gap:4px;margin-bottom:6px;flex-wrap:wrap;}.xf_editor-copybook-row:last-child{margin-bottom:0;}.xf_editor-copybook-cell{position:relative;flex-shrink:0;}.xf_editor-copybook-grid-cell{width:52px;height:52px;background:#fff;border:1px solid #d4c296;box-shadow:0 1px 2px rgba(0,0,0,0.02);}.xf_editor-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;}.xf_editor-copybook-hanzi-text{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-family:"KaiTi","楷体","华文楷书",serif;color:#3e2a1a;line-height:1;z-index:3;}');
                c.push('.xf_editor-copybook-pinyin-cell{display:flex;flex-direction:column;align-items:center;width:52px;}.xf_editor-copybook-pinyin-top{position:relative;width:100%;height:28px;background:#fffef8;border:none;}.xf_editor-copybook-pinyin-top .xf_editor-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;}.xf_editor-copybook-pinyin-text{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:#3a7d44;font-family:"KaiTi","楷体",serif;z-index:3;}.xf_editor-copybook-pinyin-bottom{position:relative;width:100%;height:52px;background:#fff;border:1px solid #d4c296;border-top:none;margin-top:2px;}');
                c.push('.xf_editor-copybook-pinyin-bottom .xf_editor-copybook-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;}.xf_editor-copybook-pinyin-bottom .xf_editor-copybook-hanzi-text{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-family:"KaiTi","楷体",serif;color:#3e2a1a;line-height:1;z-index:3;}');
                c.push('.xf_editor-copybook-footnote{position:absolute;top:-2px;right:0;font-size:55%;line-height:1;z-index:10;}.xf_editor-copybook-footnote a{display:inline-block;text-decoration:none;color:#2563eb;font-weight:700;padding:1px 3px;background:rgba(255,255,255,0.85);border-radius:2px;}.xf_editor-copybook-footnote a:hover{color:#1d4ed8;text-decoration:underline;}');
                c.push('.xf_editor-copybook-row-justified{justify-content:space-between !important;gap:0 !important;}.xf_editor-copybook-row-justified .xf_editor-copybook-pinyin-cell{flex:1 1 0;min-width:36px;max-width:80px;}.xf_editor-copybook-row-justified .xf_editor-copybook-pinyin-cell:not(:last-child){margin-right:2px;}');
                // ★ 字帖组级宽度容器（花括号/圆括号语法 + (!width:NNN)）
                c.push('.xf_editor-copybook-group{display:inline-flex!important;flex-wrap:nowrap;align-items:stretch;vertical-align:top;overflow:hidden!important;}');
                c.push('.xf_editor-copybook-group-pinyin{display:inline-flex!important;flex-wrap:nowrap;align-items:stretch;overflow:hidden!important;}');
                c.push('.xf_editor-copybook-group-pinyin>.xf_editor-copybook-pinyin-cell{flex:1 1 0!important;min-width:0!important;width:auto!important;max-width:none!important;overflow:hidden!important;}');
                c.push('.xf_editor-copybook-group-grid{display:inline-flex!important;flex-wrap:nowrap;align-items:stretch;overflow:hidden!important;}');
                c.push('.xf_editor-copybook-group-grid>.xf_editor-copybook-grid-cell{flex:1 1 0!important;min-width:0!important;width:auto!important;max-width:none!important;overflow:hidden!important;}');
                // ★ 行级宽容器 — 组保持其显式宽度，非组单元格均分剩余空间
                c.push('.xf_editor-copybook-row-wide{display:flex!important;flex-wrap:nowrap;justify-content:flex-start;gap:4px!important;}');
                c.push('.xf_editor-copybook-row-wide>.xf_editor-copybook-cell{flex:1 1 0;min-width:0;}');
                // ★ 关键修复：组元素保持显式 width 内联样式（不增长不收缩），否则 flex-basis:0 会使 width:Npx 失效
                c.push('.xf_editor-copybook-row-wide>.xf_editor-copybook-group{flex:0 0 auto!important;min-width:0;max-width:100%;}');
            }
            return c.join('\n');
        },
        
        /**
         * 获取独立页面所需的交互初始化脚本（用于 getHTML() 输出）
         * 根据 HTML 内容按需输出，不包含未使用功能的 JS
         * @private
         * @param {String} [html] 已渲染的 HTML，用于按需检测
         * @param {Object} [features] 预检测的特性标记对象（避免重复扫描）
         * @returns {String}
         */
        _getInitScripts : function(html, features) {
            var f = features || this._detectFeatures(html);
            var s = [];
            s.push('(function(){');
            s.push('"use strict";');
            // --- ECharts 不再自动加载 CDN：由父页面负责引入 ---
            s.push('var _doc=document,_win=window;');
            s.push('');
            // --- 通用工具函数 ---
            s.push('function $$(sel,ctx){if(!ctx)ctx=_doc;if(sel&&sel.charAt(0)===">")sel=":scope "+sel;return ctx.querySelectorAll(sel);}');
            s.push('function $1(sel,ctx){if(!ctx)ctx=_doc;if(sel&&sel.charAt(0)===">")sel=":scope "+sel;return ctx.querySelector(sel);}');
            s.push('function addEvt(el,evt,fn){el.addEventListener(evt,fn);}');
            s.push('function hasCls(el,c){return el.classList.contains(c);}');
            s.push('function addCls(el,c){el.classList.add(c);}');
            s.push('function rmCls(el,c){el.classList.remove(c);}');
            s.push('function setAttr(el,k,v){el.setAttribute(k,v);}');
            s.push('function getAttr(el,k){return el.getAttribute(k);}');
            s.push('function rmAttr(el,k){el.removeAttribute(k);}');
            s.push('');
            // --- ECharts 初始化（被动模式：仅 echarts 已由父页面引入时才渲染）---
            if (f.echarts) {
            s.push('function initECharts(container){');
            s.push('  if(!container||typeof echarts==="undefined")return;');
            s.push('  var charts=$$(".xf_editor-echarts",container);');
            s.push('  if(charts.length===0)return;');
            s.push('  for(var i=0;i<charts.length;i++){');
            s.push('    var c=charts[i];');
            s.push('    if(getAttr(c,"data-initialized")==="true")continue;');
            s.push('    var config={};');
            s.push('    try{config=JSON.parse(getAttr(c,"data-config"));}catch(e){continue;}');
            s.push('    var curH=c.style.height||_win.getComputedStyle(c).height;');
            s.push('    if(!curH||curH==="0px"||curH==="auto"){');
            s.push('      var ch=(config.height||"").toString();');
            s.push('      if(ch&&!/px|em|rem|vh|%$/.test(ch))ch=ch+"px";');
            s.push('      c.style.height=ch||"400px";');
            s.push('    }');
            s.push('    var rect=c.getBoundingClientRect();');
            s.push('    if(rect.width===0)continue;');
            s.push('    var style=_win.getComputedStyle(c);');
            s.push('    if(style.display==="none"||style.visibility==="hidden")continue;');
            s.push('    try{');
            s.push('      var ecTheme=config.theme;');
            s.push('      if(!ecTheme){var p=c;while(p&&p!==container.parentNode){var cls=p.className||"";var m=cls.match(/theme-(\\w+)/);if(m){ecTheme=m[1];break;}p=p.parentNode;}}');
            s.push('      var ch=echarts.init(c,ecTheme);');
            s.push('      var opt={title:config.title||{},tooltip:config.tooltip||{},series:config.series||[]};');
            s.push('      if(config.legend!==undefined)opt.legend=config.legend;');
            s.push('      if(config.radar!==undefined)opt.radar=config.radar;');
            s.push('      var t=config.type||(config.series&&config.series[0]&&config.series[0].type)||"";');
            s.push('      var noAxis=["pie","funnel","gauge","graph","treemap","sunburst","tree"];');
            s.push('      if(noAxis.indexOf(t)===-1){opt.xAxis=config.xAxis||{};opt.yAxis=config.yAxis||{};}else if(!config.tooltip){opt.tooltip={trigger:"item"};}');
            s.push('      if(config.backgroundColor)opt.backgroundColor=config.backgroundColor;');
            s.push('      if(config.grid!==undefined)opt.grid=config.grid;');
            s.push('      if(config.dataZoom!==undefined)opt.dataZoom=config.dataZoom;');
            s.push('      if(config.visualMap!==undefined)opt.visualMap=config.visualMap;');
            s.push('      if(config.toolbox!==undefined)opt.toolbox=config.toolbox;');
            s.push('      ch.setOption(opt);ch.resize();');
            s.push('      setAttr(c,"data-initialized","true");');
            s.push('      var ecId=getAttr(c,"id")||("ec"+Math.random().toString(36).slice(2,9));');
            s.push('      c._chartInstance=ch;c._resizeHandler=function(){ch.resize();};');
            s.push('      addEvt(_win,"resize",c._resizeHandler);');
            s.push('    }catch(e){if(typeof console!=="undefined")console.warn("[xfEditor] ECharts init:",e.message);}');
            s.push('  }');
            s.push('}');
            } // end if (f.echarts)
            s.push('');
            // --- Tabs 初始化 ---
            if (f.tabs) {
            s.push('function initTabs(container){');
            s.push('  if(!container)return;');
            s.push('  var tabs=$$(".xf_editor-tabs",container);');
            s.push('  for(var i=0;i<tabs.length;i++){');
            s.push('    try{');
            s.push('      var tb=tabs[i];');
            s.push('      if(getAttr(tb,"data-initialized")==="true")continue;');
            s.push('      var nav=$1(">.xf_editor-tab-nav",tb);');
            s.push('      var body=$1(">.xf_editor-tab-body",tb);');
            s.push('      if(!nav||!body)continue;');
            s.push('      var lis=$$(">li",nav);');
            s.push('      if(!lis||lis.length===0)continue;');
            s.push('      for(var j=0;j<lis.length;j++){');
            s.push('        (function(li,idx,lisRef,bodyRef){');
            s.push('          addEvt(li,"click",function(e){');
            s.push('            e.preventDefault();e.stopPropagation();');
            s.push('            try{');
            s.push('              for(var k=0;k<lisRef.length;k++){rmCls(lisRef[k],"active");}');
            s.push('              addCls(li,"active");');
            s.push('              var panels=$$(">.xf_editor-tab-panel",bodyRef);');
            s.push('              for(var k=0;k<panels.length;k++){rmCls(panels[k],"active");}');
            s.push('              var panel=$1(\'>.xf_editor-tab-panel[data-index="\'+idx+\'"]\',bodyRef);');
            s.push('              if(panel){addCls(panel,"active");if(typeof initECharts==="function")initECharts(panel);}');
            s.push('            }catch(e2){}');
            s.push('          });');
            s.push('        })(lis[j],j,lis,body);');
            s.push('      }');
            s.push('      setAttr(tb,"data-initialized","true");');
            s.push('    }catch(e){}');
            s.push('  }');
            s.push('}');
            } // end if (f.tabs)
            s.push('');
            // --- 代码复制按钮 ---
            if (f.codeBlock) {
            s.push('function initCodeCopy(container){');
            s.push('  if(!container||typeof navigator==="undefined")return;');
            s.push('  var pres=$$("pre",container);');
            s.push('  for(var i=0;i<pres.length;i++){');
            s.push('    var pre=pres[i];');
            s.push('    // ★ 先清除任何残留的旧按钮（可能来自编辑器渲染时注入的死按钮）');
            s.push('    var oldBtns=pre.querySelectorAll(".xf_editor-code-copy-btn");');
            s.push('    for(var j=0;j<oldBtns.length;j++){oldBtns[j].parentNode.removeChild(oldBtns[j]);}');
            s.push('    pre._copyBtnReady=true;');
            s.push('    var cs=_win.getComputedStyle(pre);');
            s.push('    if(cs.position==="static")pre.style.position="relative";');
            s.push('    // 克隆节点获取纯净代码内容，排除附加元素');
            s.push('    var cloned=pre.cloneNode(true);');
            s.push('    var oldBtns=cloned.querySelectorAll(".xf_editor-code-copy-btn");');
            s.push('    for(var bi=0;bi<oldBtns.length;bi++){oldBtns[bi].parentNode.removeChild(oldBtns[bi]);}');
            s.push('    // ★ 收集 ALL <code> 元素的内容 — 优先用 textContent（保留原始空白），innerText 作为降级');
            s.push('    // ★ v1.17.16: 使用 innerHTML 提取，保留原始缩进/空格/换行');
            s.push('    var codeEls=cloned.querySelectorAll("code");');
            s.push('    if(codeEls.length>0){');
            s.push('      var parts=[];for(var ci=0;ci<codeEls.length;ci++){');
            s.push('        var h=codeEls[ci].innerHTML;if(!h){parts.push("");continue;}');
            s.push('        h=h.replace(/<br\\s*\\/?>/gi,"\\n");h=h.replace(/<[^>]+>/g,"");');
            s.push('        h=h.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('        parts.push(h.replace(/^\\n+/,"").replace(/\\n+$/,""));');
            s.push('      }');
            s.push('      pre._originalCode=parts.join("\\n");');
            s.push('    }else{');
            s.push('      var hc=cloned.innerHTML;');
            s.push('      hc=hc.replace(/<br\\s*\\/?>/gi,"\\n");hc=hc.replace(/<[^>]+>/g,"");');
            s.push('      hc=hc.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('      pre._originalCode=hc.replace(/^\\n+/,"").replace(/\\n+$/,"");');
            s.push('    }');
            s.push('    var btn=_doc.createElement("span");');
            s.push('    btn.className="xf_editor-code-copy-btn";');
            s.push('    btn.textContent="复制";btn.title="复制代码";');
            s.push('    // ★ 存储 pre 引用到按钮上，避免 parentElement 不可靠');
            s.push('    btn._preRef=pre;');
            s.push('    addEvt(btn,"click",function(e){');
            s.push('      e.stopPropagation();e.preventDefault();');
            s.push('      var self=this;');
            s.push('      if(hasCls(self,"copied")||hasCls(self,"failed"))return;');
            s.push('      // ★ 优先使用存储的引用，确保获取到正确的代码');
            s.push('      var targetPre=self._preRef||self.parentElement;');
            s.push('      var code=targetPre._originalCode;');
            s.push('      if(!code||!code.trim()){');
            s.push('        // ★ v1.17.16 fallback: innerHTML 提取保留原始格式');
            s.push('        var cp=targetPre.cloneNode(true);');
            s.push('        var cbs=cp.querySelectorAll(".xf_editor-code-copy-btn");');
            s.push('        for(var cj=0;cj<cbs.length;cj++){cbs[cj].parentNode.removeChild(cbs[cj]);}');
            s.push('        var ce=cp.querySelectorAll("code");');
            s.push('        if(ce.length>0){');
            s.push('          var pp=[];for(var ck=0;ck<ce.length;ck++){');
            s.push('            var hi=ce[ck].innerHTML;if(!hi){pp.push("");continue;}');
            s.push('            hi=hi.replace(/<br\\s*\\/?>/gi,"\\n");hi=hi.replace(/<[^>]+>/g,"");');
            s.push('            hi=hi.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('            pp.push(hi.replace(/^\\n+/,"").replace(/\\n+$/,""));');
            s.push('          }');
            s.push('          code=pp.join("\\n");');
            s.push('        }else{');
            s.push('          var hr=cp.innerHTML;hr=hr.replace(/<br\\s*\\/?>/gi,"\\n");hr=hr.replace(/<[^>]+>/g,"");');
            s.push('          hr=hr.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('          code=hr.replace(/^\\n+/,"").replace(/\\n+$/,"");');
            s.push('        }');
            s.push('        if(code&&code.trim()){targetPre._originalCode=code;}');
            s.push('      }');
            s.push('      if(!code||!code.trim()){code="";}');
            s.push('      var done=function(ok){');
            s.push('        rmCls(self,"copied");rmCls(self,"failed");');
            s.push('        addCls(self,ok?"copied":"failed");');
            s.push('        self.textContent=ok?"已复制":"复制失败";');
            s.push('        clearTimeout(self._timer);');
            s.push('        self._timer=setTimeout(function(){rmCls(self,"copied");rmCls(self,"failed");self.textContent="复制";},2500);');
            s.push('      };');
            s.push('      if(navigator.clipboard&&navigator.clipboard.writeText){');
            s.push('        navigator.clipboard.writeText(code).then(function(){done(true);}).catch(function(){done(false);});');
            s.push('      }else{');
            s.push('        var ta=_doc.createElement("textarea");');
            s.push('        ta.style.cssText="position:fixed;left:-9999px;top:-9999px;opacity:0;";');
            s.push('        ta.value=code;');
            s.push('        _doc.body.appendChild(ta);ta.focus();ta.select();');
            s.push('        try{done(_doc.execCommand("copy"));}catch(ex){done(false);}');
            s.push('        setTimeout(function(){if(ta.parentNode)ta.parentNode.removeChild(ta);},100);');
            s.push('      }');
            s.push('    });');
            s.push('    pre.appendChild(btn);');
            s.push('  }');
            s.push('}');
            } // end if (f.codeBlock)
            s.push('');
            // --- 多列排版分隔线 ---
            if (f.columns) {
            s.push('function initColumns(container){');
            s.push('  if(!container)return;');
            s.push('  var cols=$$(".xf_editor-columns",container);');
            s.push('  for(var i=0;i<cols.length;i++){');
            s.push('    var c=cols[i];');
            s.push('    if(getAttr(c,"data-initialized")==="true")continue;');
            s.push('    var count=parseInt(getAttr(c,"data-count"),10)||2;');
            s.push('    var divs=$$(".xf_editor-column-divider",c);');
            s.push('    for(var d=0;d<divs.length;d++){divs[d].parentNode.removeChild(divs[d]);}');
            s.push('    c.style.position="relative";');
            s.push('    for(var j=1;j<count;j++){');
            s.push('      var div=_doc.createElement("div");');
            s.push('      div.className="xf_editor-column-divider";');
            s.push('      div.style.cssText="position:absolute;left:"+((j/count)*100)+"%;top:8px;bottom:8px;width:0;transform:translateX(-50%);border-left:1px dashed #bbb;pointer-events:none;z-index:1;";');
            s.push('      c.appendChild(div);');
            s.push('    }');
            s.push('    setAttr(c,"data-initialized","true");');
            s.push('  }');
            s.push('}');
            } // end if (f.columns)
            s.push('');
            // --- 脚注点击跳转（含字帖内脚注） ---
            if (f.footnotes) {
            s.push('function initFootnotes(container){');
            s.push('  if(!container)return;');
            s.push('  // 覆盖所有脚注引用：标准脚注 ref-wrapper、字帖脚注 copybook-footnote');
            s.push('  var refs=container.querySelectorAll(".xf_editor-footnote-ref-wrapper a[href^=\\x27#\\x27],.xf_editor-copybook-footnote a[href^=\\x27#\\x27]");');
            s.push('  for(var i=0;i<refs.length;i++){');
            s.push('    (function(link){');
            s.push('      addEvt(link,"click",function(e){');
            s.push('        var href=link.getAttribute("href");');
            s.push('        if(!href||href.indexOf("#")!==0)return;');
            s.push('        e.preventDefault();e.stopPropagation();');
            s.push('        var rawId=href.slice(1);');
            s.push('        var target=_doc.getElementById(rawId);');
            s.push('        // 回退：尝试用 CSS.escape');
            s.push('        if(!target){try{target=_doc.getElementById(CSS.escape(rawId));}catch(ex){}}');
            s.push('        if(!target){');
            s.push('          try{var esc=rawId.replace(/[!"#$%&\'()*+,.\\/:;<=>?@[\\]^`{|}~]/g,"\\\\$&");target=_doc.getElementById(esc);}catch(ex){}');
            s.push('        }');
            s.push('        if(target){');
            s.push('          // 清除旧高亮');
            s.push('          var old=$$(".xf_editor-footnote-highlight");');
            s.push('          for(var k=0;k<old.length;k++){rmCls(old[k],"xf_editor-footnote-highlight");}');
            s.push('          addCls(target,"xf_editor-footnote-highlight");');
            s.push('          target.scrollIntoView({behavior:"smooth",block:"center"});');
            s.push('          setTimeout(function(){rmCls(target,"xf_editor-footnote-highlight");},2000);');
            s.push('        }');
            s.push('      });');
            s.push('    })(refs[i]);');
            s.push('  }');
            s.push('  // 脚注返回链接（backref）');
            s.push('  var backRefs=container.querySelectorAll(".xf_editor-footnote-backref a[href^=\\x27#\\x27]");');
            s.push('  for(var j=0;j<backRefs.length;j++){');
            s.push('    (function(link){');
            s.push('      addEvt(link,"click",function(e){');
            s.push('        var href=link.getAttribute("href");');
            s.push('        if(!href||href.indexOf("#")!==0)return;');
            s.push('        e.preventDefault();e.stopPropagation();');
            s.push('        var rawId=href.slice(1);');
            s.push('        var target=_doc.getElementById(rawId);');
            s.push('        if(!target){try{target=_doc.getElementById(CSS.escape(rawId));}catch(ex){}}');
            s.push('        if(target){target.scrollIntoView({behavior:"smooth",block:"center"});}');
            s.push('      });');
            s.push('    })(backRefs[j]);');
            s.push('  }');
            s.push('}');
            } // end if (f.footnotes)
            s.push('');
            // --- Tooltip 悬浮提示（纯 JS 实现，不依赖 jQuery/xfEditor）---
            if (f.tooltip) {
            s.push('function base64Decode(str){try{return decodeURIComponent(Array.prototype.map.call(atob(str),function(c){return"%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);}).join(""));}catch(e){return"";}}');
            s.push('function escapeHTML(s){if(s==null||typeof s!=="string")return"";var d=document.createElement("div");d.textContent=s;return d.innerHTML;}');
            s.push('function escapeAttr(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}');
            s.push('');
            s.push('function buildIframeHTML(code,langCls){');
            s.push('  if(!code||!code.trim())return"<!DOCTYPE html><html><body></body></html>";');
            s.push('  // ★ 已经是完整 HTML 页面，直接使用');
            s.push('  if(/^\\s*<!DOCTYPE\\s/i.test(code)||/^\\s*<html[\\s>]/i.test(code)||/<\\/html>\\s*$/i.test(code))return code;');
            s.push('  // ★ 检测代码类型：含 HTML 标签 vs 纯 JS/CSS');
            s.push('  var hasHtmlTags=/<[a-zA-Z][\\s\\S]*>/i.test(code)||/<\\/[a-zA-Z]+>/i.test(code);');
            s.push('  var hasScriptTag=/<script[\\s>]/i.test(code);');
            s.push('  var isJs=(/lang(uage)?[\\s"\\x27]*[:=]\\s*[\\s"\\x27]*js|javascript/i.test(langCls));');
            s.push('  var isCss=(/lang(uage)?[\\s"\\x27]*[:=]\\s*[\\s"\\x27]*css/i.test(langCls));');
            s.push('  if(hasScriptTag||isJs){');
            s.push('    // ★ JS 代码：包在 <script> 里确保执行');
            s.push('    return"<!DOCTYPE html>\\n<html><head><meta charset=\\x27utf-8\\x27></head><body>\\n<script>\\n"+code+"\\n<\\/script>\\n</body></html>";');
            s.push('  }');
            s.push('  if(isCss){');
            s.push('    return"<!DOCTYPE html>\\n<html><head><meta charset=\\x27utf-8\\x27><style>\\n"+code+"\\n</style></head><body><p>CSS 代码已在 style 标签中生效。</p></body></html>";');
            s.push('  }');
            s.push('  if(hasHtmlTags){');
            s.push('    // ★ HTML 片段：放入 body 中渲染');
            s.push('    return"<!DOCTYPE html>\\n<html><head><meta charset=\\x27utf-8\\x27></head><body>\\n"+code+"\\n</body></html>";');
            s.push('  }');
            s.push('  // ★ 默认：作为纯文本展示在 pre 中');
            s.push('  return"<!DOCTYPE html>\\n<html><head><meta charset=\\x27utf-8\\x27></head><body>\\n<pre style=\\x27font-size:13px;line-height:1.6;white-space:pre-wrap;font-family:monospace;\\x27>"+escapeHTML(code)+"</pre>\\n</body></html>";');
            s.push('}');
            s.push('');
            s.push('function initTooltips(container){');
            s.push('  if(!container)return;');
            s.push('  var triggers=$$(".xf_editor-tooltip-trigger",container);');
            s.push('  for(var i=0;i<triggers.length;i++){');
            s.push('    (function(trigger){');
            s.push('      if(getAttr(trigger,"data-tooltip-initialized")==="true")return;');
            s.push('      setAttr(trigger,"data-tooltip-initialized","true");');
            s.push('');
            s.push('      var tooltipType=getAttr(trigger,"data-tooltip-type")||"text";');
            s.push('      var tooltipContent=getAttr(trigger,"data-tooltip");');
            s.push('      var tooltipWidth=getAttr(trigger,"data-tooltip-width")||"";');
            s.push('      var tooltipHeight=getAttr(trigger,"data-tooltip-height")||"";');
            s.push('');
            s.push('      var htmlContent="";');
            s.push('      var isPreContent=false,_rawPreCode=null;');
            s.push('');
            s.push('      if(tooltipType==="html"){');
            s.push('        tooltipContent=base64Decode(getAttr(trigger,"data-tooltip-html")||"");');
            s.push('        if(!tooltipContent)return;');
            s.push('        // ★ v1.17.18 XSS 防护：使用 textContent 而非 innerHTML 注入安全文本内容');
            s.push('        // 如果确实需要 HTML，则通过 filterHTMLTags 过滤危险标签');
            s.push('        var tmpDiv=document.createElement("div");tmpDiv.innerHTML=tooltipContent;');
            s.push('        tooltipContent=tmpDiv.textContent||tmpDiv.innerText||"";');
            s.push('        if(!tooltipContent.trim())return;');
            s.push('        htmlContent=\'<div class="xf_editor-tooltip-html-content">\'+escapeHTML(tooltipContent)+"</div>";');
            s.push('      }else if(tooltipType==="image"){');
            s.push('        var istyle="display:none;";');
            s.push('        if(tooltipWidth){istyle+="width:"+tooltipWidth+"px;max-width:"+tooltipWidth+"px;";}else{istyle+="max-width:340px;";}');
            s.push('        if(tooltipHeight){istyle+="height:"+tooltipHeight+"px;max-height:"+tooltipHeight+"px;";}else{istyle+="max-height:220px;";}');
            s.push('        if(tooltipWidth||tooltipHeight){istyle+="object-fit:contain;";}');
            s.push('        htmlContent=\'<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><img src="\'+escapeAttr(tooltipContent)+\'" alt="" style="\'+istyle+\'" onload="this.previousElementSibling.style.display=\\\'none\\\';this.style.display=\\\'block\\\';" onerror="this.previousElementSibling.innerHTML=\\\'<span>图片加载失败</span>\\\';" />\';');
            s.push('      }else if(tooltipType==="iframe"){');
            s.push('        var fstyle="display:none;";');
            s.push('        if(tooltipWidth){fstyle+="width:"+tooltipWidth+"px;max-width:"+tooltipWidth+"px;";}else{fstyle+="width:340px;";}');
            s.push('        if(tooltipHeight){fstyle+="height:"+tooltipHeight+"px;max-height:"+tooltipHeight+"px;";}else{fstyle+="height:210px;";}');
            s.push('        if(tooltipContent&&/^pre[#.][a-zA-Z_\\-][\\w\\-]*$/.test(tooltipContent)){');
            s.push('          try{');
            s.push('            var preEl=document.querySelector(tooltipContent);');
            s.push('            if(preEl){');
            s.push('              isPreContent=true;');
            s.push('              // ★ 收集 ALL <code> 元素，确保多组代码块全部提取');
            s.push('              var ces=preEl.querySelectorAll("code");');
            s.push('              var rawCode;');
            s.push('              // ★ v1.17.17: 使用 innerHTML 提取原始代码（保留缩进/换行/空格）');
            s.push('              if(ces.length>0){');
            s.push('                var rp=[];for(var ri=0;ri<ces.length;ri++){');
            s.push('                  var hi=ces[ri].innerHTML;if(!hi){rp.push("");continue;}');
            s.push('                  hi=hi.replace(/<br\\s*\\/?>/gi,"\\n");hi=hi.replace(/<[^>]+>/g,"");');
            s.push('                  hi=hi.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('                  rp.push(hi.replace(/^\\n+/,"").replace(/\\n+$/,""));');
            s.push('                }');
            s.push('                rawCode=rp.join("\\n");');
            s.push('              }else{');
            s.push('                var hc=preEl.innerHTML;');
            s.push('                hc=hc.replace(/<br\\s*\\/?>/gi,"\\n");hc=hc.replace(/<[^>]+>/g,"");');
            s.push('                hc=hc.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,\'"\').replace(/&#39;/g,"\'").replace(/&apos;/g,"\'").replace(/&nbsp;/g," ");');
            s.push('                rawCode=hc.replace(/^\\n+/,"").replace(/\\n+$/,"");');
            s.push('              }');
            s.push('              var langCls=preEl.className||"";');
            s.push('              // ★ 将原始代码构建为完整的独立 HTML 页面，确保 JS 和 CSS 能在 iframe 中正常执行');
            s.push('              _rawPreCode=buildIframeHTML(rawCode,langCls);');
            s.push('              htmlContent=\'<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><iframe src="about:blank" frameborder="0" style="\'+fstyle+\'" onload="this.previousElementSibling.style.display=\\\'none\\\';this.style.display=\\\'block\\\';"></iframe>\';');
            s.push('            }else{htmlContent=\'<div class="xf_editor-tooltip-loading"><span>Pre 元素不存在</span></div><iframe src="about:blank" frameborder="0" style="\'+fstyle+\'"></iframe>\';}');
            s.push('          }catch(ex){htmlContent=\'<div class="xf_editor-tooltip-loading"><span>加载失败</span></div><iframe src="about:blank" frameborder="0" style="\'+fstyle+\'"></iframe>\';}');
            s.push('        }else{');
            s.push('          htmlContent=\'<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><iframe src="\'+escapeAttr(tooltipContent)+\'" frameborder="0" style="\'+fstyle+\'" onload="this.previousElementSibling.style.display=\\\'none\\\';this.style.display=\\\'block\\\';"></iframe>\';');
            s.push('        }');
            s.push('      }else if(tooltipType==="html-selector"){');
            s.push('        htmlContent=\'<div class="xf_editor-tooltip-html-content">正在加载HTML内容...</div>\';');
            s.push('      }else{');
            s.push('        htmlContent=\'<div class="xf_editor-tooltip-text-content">\'+escapeHTML(tooltipContent||"")+"</div>";');
            s.push('      }');
            s.push('');
            s.push('      var popup=document.createElement("div");');
            s.push('      popup.className="xf_editor-tooltip-popup xf_editor-tooltip-"+tooltipType;');
            s.push('      popup.innerHTML=htmlContent;');
            s.push('      popup.style.display="none";');
            s.push('      popup.style.opacity="0";');
            s.push('');
            s.push('      if(isPreContent&&_rawPreCode){setAttr(popup,"data-iframepre-code",_rawPreCode);}');
            s.push('');
            s.push('      if(tooltipWidth){popup.style.width=tooltipWidth+"px";popup.style.maxWidth=tooltipWidth+"px";}');
            s.push('      if(tooltipHeight){popup.style.height=tooltipHeight+"px";popup.style.maxHeight=tooltipHeight+"px";}');
            s.push('');
            s.push('      var maxBtn=null,closeBtn=null,_isMaximized=false,_origCss={};');
            s.push('      if(tooltipType!=="text"){');
            s.push('        maxBtn=document.createElement("button");');
            s.push('        maxBtn.className="xf_editor-tooltip-max-btn";');
            s.push('        maxBtn.textContent="□";maxBtn.title="最大化";');
            s.push('        closeBtn=document.createElement("button");');
            s.push('        closeBtn.className="xf_editor-tooltip-close-btn";');
            s.push('        closeBtn.textContent="✕";closeBtn.title="关闭";');
            s.push('        popup.appendChild(maxBtn);');
            s.push('        popup.appendChild(closeBtn);');
            s.push('      }');
            s.push('');
            s.push('      _doc.body.appendChild(popup);');
            s.push('');
            // Maximize/restore
            s.push('      if(maxBtn){');
            s.push('        addEvt(maxBtn,"click",function(e){');
            s.push('          e.stopPropagation();e.preventDefault();');
            s.push('          if(!_isMaximized){');
            s.push('            _origCss={width:popup.style.width,height:popup.style.height,maxWidth:popup.style.maxWidth,maxHeight:popup.style.maxHeight,left:popup.style.left,top:popup.style.top,position:popup.style.position,borderRadius:popup.style.borderRadius};');
            s.push('            popup.style.width="96vw";popup.style.height="92vh";popup.style.maxWidth="96vw";popup.style.maxHeight="92vh";');
            s.push('            popup.style.left="2vw";popup.style.top="3vh";popup.style.position="fixed";');
            s.push('            popup.style.overflowX="auto";popup.style.overflowY="auto";');
            s.push('            var ifrMax=popup.querySelector("iframe");');
            s.push('            if(ifrMax){ifrMax.style.width="100%";ifrMax.style.height="90%";ifrMax.style.maxWidth="100%";ifrMax.style.maxHeight="100%";}');
            s.push('            maxBtn.textContent="❐";maxBtn.title="还原尺寸";');
            s.push('            _isMaximized=true;');
            s.push('          }else{');
            s.push('            popup.style.width=_origCss.width||"";popup.style.height=_origCss.height||"";');
            s.push('            popup.style.maxWidth=_origCss.maxWidth||"";popup.style.maxHeight=_origCss.maxHeight||"";');
            s.push('            popup.style.left=_origCss.left||"";popup.style.top=_origCss.top||"";');
            s.push('            popup.style.position=_origCss.position||"";');
            s.push('            popup.style.borderRadius=_origCss.borderRadius||"";');
            s.push('            var ifrRestore=popup.querySelector("iframe");');
            s.push('            if(ifrRestore){ifrRestore.style.width="";ifrRestore.style.height="";ifrRestore.style.maxWidth="";ifrRestore.style.maxHeight="";}');
            s.push('            maxBtn.textContent="□";maxBtn.title="最大化";');
            s.push('            _isMaximized=false;');
            s.push('          }');
            s.push('          popup.offsetHeight;');
            s.push('        });');
            s.push('      }');
            // Close button
            s.push('      if(closeBtn){');
            s.push('        addEvt(closeBtn,"click",function(e){');
            s.push('          e.stopPropagation();e.preventDefault();');
            s.push('          clearTimeout(trigger._tooltipTimer);');
            s.push('          rmCls(popup,"show");');
            s.push('          var bu=getAttr(popup,"data-blob-url");');
            s.push('          if(bu){try{(_win.URL||_win.webkitURL).revokeObjectURL(bu);}catch(ex){}rmAttr(popup,"data-blob-url");}');
            s.push('          setTimeout(function(){if(!hasCls(popup,"show"))popup.style.display="none";},220);');
            s.push('        });');
            s.push('      }');
            s.push('');
            // Show tooltip
            s.push('      function showTooltip(e){');
            s.push('        clearTimeout(trigger._tooltipTimer);');
            // iframe:pre — 使用 Blob URL 构建完整 HTML 页面，确保 JS/CSS 正常执行
            s.push('        var ipc=getAttr(popup,"data-iframepre-code");');
            s.push('        if(ipc){');
            s.push('          var ld=popup.querySelector(".xf_editor-tooltip-loading");');
            s.push('          var ifr=popup.querySelector("iframe");');
            s.push('          if(ld)ld.style.display="";');
            s.push('          if(ifr){');
            s.push('            ifr.style.display="none";');
            s.push('            try{');
            s.push('              // 每次 hover 强制重新加载 iframe，确保 JS 重新执行');
            s.push('              var oldBlobUrl=getAttr(popup,"data-blob-url");');
            s.push('              if(oldBlobUrl){try{(_win.URL||_win.webkitURL).revokeObjectURL(oldBlobUrl);}catch(ex){}}');
            s.push('              rmAttr(popup,"data-blob-url");');
            s.push('              var nb2=new Blob([ipc],{type:"text/html;charset=utf-8"});');
            s.push('              var blobUrl=(_win.URL||_win.webkitURL).createObjectURL(nb2);');
            s.push('              setAttr(popup,"data-blob-url",blobUrl);');
            s.push('              // ★ 重新绑定 onload 以确保加载完成后隐藏 loading');
            s.push('              ifr.onload=function(){if(ld)ld.style.display="none";ifr.style.display="block";};');
            s.push('              ifr.src=blobUrl;');
            s.push('            }catch(ex2){');
            s.push('              try{ifr.src="data:text/html;charset=utf-8,"+encodeURIComponent(ipc);}catch(ex3){}');
            s.push('            }');
            s.push('          }');
            s.push('        }');
            // html-selector
            s.push('        if(tooltipType==="html-selector"){');
            s.push('          var tgt=_doc.querySelector(tooltipContent);');
            s.push('          if(tgt){');
            s.push('            var clone=tgt.cloneNode(true);');
            s.push('            // ★ v1.17.22 XSS 防护：移除所有内联事件处理器 (on*) 属性');
            s.push('            (function stripEvents(el){');
            s.push('              var attrs=el.attributes;');
            s.push('              for(var a=attrs.length-1;a>=0;a--){');
            s.push('                if(/^on/i.test(attrs[a].name)){el.removeAttribute(attrs[a].name);}');
            s.push('              }');
            s.push('              for(var c=el.firstChild;c;c=c.nextSibling){if(c.nodeType===1)stripEvents(c);}');
            s.push('            })(clone);');
            s.push('            clone.style.cssText="display:block;visibility:visible;opacity:1;position:relative;max-width:100%;max-height:300px;overflow:auto;";');
            s.push('            clone.removeAttribute("hidden");clone.removeAttribute("aria-hidden");');
            s.push('            popup.innerHTML=\'<div class="xf_editor-tooltip-html-content">\'+clone.outerHTML+"</div>";');
            s.push('          }else{');
            s.push('            popup.innerHTML=\'<div class="xf_editor-tooltip-html-content" style="color:#ff6b6b;padding:10px;font-size:12px;">未找到元素: <code>\'+escapeHTML(tooltipContent)+"</code><br>请检查CSS选择器是否正确。</div>";');
            s.push('          }');
            s.push('          if(maxBtn){maxBtn=popup.querySelector(".xf_editor-tooltip-max-btn");}');
            s.push('          if(closeBtn){closeBtn=popup.querySelector(".xf_editor-tooltip-close-btn");}');
            s.push('        }');
            // Position
            s.push('        popup.style.display="block";popup.style.visibility="hidden";popup.style.opacity="0";');
            s.push('        var tr=trigger.getBoundingClientRect();');
            s.push('        var pw=popup.offsetWidth,ph=popup.offsetHeight;');
            s.push('        var left=tr.left+(tr.width/2)-(pw/2);');
            s.push('        var top=tr.top-ph-8;');
            s.push('        var ww=_win.innerWidth,wh=_win.innerHeight;');
            s.push('        if(left<10)left=10;');
            s.push('        if(left+pw>ww-10)left=Math.max(10,ww-pw-10);');
            s.push('        if(top<10){top=tr.bottom+8;if(top+ph>wh-10)top=Math.max(10,wh-ph-10);}');
            s.push('        popup.style.left=left+"px";popup.style.top=top+"px";');
            s.push('        popup.style.display="block";popup.style.visibility="visible";');
            s.push('        popup.offsetHeight;');
            s.push('        popup.style.opacity="";addCls(popup,"show");');
            s.push('      }');
            // Hide tooltip
            s.push('      function hideTooltip(){');
            s.push('        trigger._tooltipTimer=setTimeout(function(){');
            s.push('          rmCls(popup,"show");');
            s.push('          var bu=getAttr(popup,"data-blob-url");');
            s.push('          if(bu){try{(_win.URL||_win.webkitURL).revokeObjectURL(bu);}catch(ex){}rmAttr(popup,"data-blob-url");}');
            s.push('          setTimeout(function(){if(!hasCls(popup,"show"))popup.style.display="none";},220);');
            s.push('        },200);');
            s.push('      }');
            // Events
            s.push('      addEvt(trigger,"mouseenter",showTooltip);');
            s.push('      addEvt(trigger,"mouseleave",hideTooltip);');
            s.push('      addEvt(trigger,"focus",showTooltip);');
            s.push('      addEvt(trigger,"blur",hideTooltip);');
            s.push('      addEvt(popup,"mouseenter",function(){clearTimeout(trigger._tooltipTimer);});');
            s.push('      addEvt(popup,"mouseleave",hideTooltip);');
            s.push('      addEvt(popup,"mousedown",function(){clearTimeout(trigger._tooltipTimer);});');
            s.push('    })(triggers[i]);');
            s.push('  }');
            s.push('}');
            } // end if (f.tooltip)
            s.push('');
            // --- 主初始化入口（按需调用，仅初始化实际存在的功能组件）---
            s.push('function initAll(){');
            s.push('  var c=$1(".xf_editor-html-preview");');
            s.push('  if(!c||c.nodeType!==1)return;');
            // 构建初始化列表 — 基于编译时检测到的功能特性
            s.push('  var inits=[];');
            if (f.tooltip)   { s.push('  inits.push({name:"tooltips",fn:function(){initTooltips(c);}});'); }
            if (f.tabs)      { s.push('  inits.push({name:"tabs",fn:function(){initTabs(c);}});'); }
            if (f.columns)   { s.push('  inits.push({name:"columns",fn:function(){initColumns(c);}});'); }
            if (f.codeBlock) { s.push('  inits.push({name:"codeCopy",fn:function(){initCodeCopy(c);}});'); }
            if (f.footnotes) { s.push('  inits.push({name:"footnotes",fn:function(){initFootnotes(c);}});'); }
            if (f.echarts)   { s.push('  inits.push({name:"echarts",fn:function(){initECharts(c);}});'); }
            s.push('  var _hasConsole=typeof console!=="undefined"&&console.warn;');
            s.push('  for(var i=0;i<inits.length;i++){');
            s.push('    try{inits[i].fn();}catch(e){if(_hasConsole)console.warn("[xfEditor] init \'"+inits[i].name+"\':",e.message);}');
            s.push('  }');
            s.push('}');
            s.push('');
            s.push('if(_doc.readyState==="loading"){_doc.addEventListener("DOMContentLoaded",initAll);}else{setTimeout(initAll,10);}');
            s.push('})();');
            
            return s.join('\n');
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
         * 获取预览区渲染后的原始 HTML 内容
         * 返回编辑器预览区内 .xf_editor-preview-container 元素里面渲染出来的 html，
         * 不包含任何样式/脚本包裹。如需独立可用的网页内容，请使用 getHTML() 接口。
         *
         * @param {Object}  [options={}]  配置选项
         * @param {Boolean} [options.rawMarkdown=false] 是否返回原始 Markdown 文本而非渲染后的 HTML
         * @returns {String} 预览区 HTML 源码（纯内容，无包裹）
         */
        getPreviewedHTML : function(options) {
            var opts = $.extend({
                rawMarkdown : false
            }, options || {});

            if (opts.rawMarkdown) {
                return this.getMarkdown();
            }

            var rawHTML = "";
            var markdownText = this.getMarkdown();
            var settings = this.settings;
            
            if (this.previewContainer && this.previewContainer.html() && this.previewContainer.html().trim() !== '') {
                rawHTML = this.previewContainer.html();
            } else if (markdownText) {
                var rendererOptions = this._buildRendererOptions(settings, {toc: false, tocm: false});
                var markedOptions = {
                    renderer: xfEditor.markedRenderer([], rendererOptions),
                    gfm: settings.gfm, tables: true, breaks: true,
                    pedantic: false, sanitize: false,
                    smartLists: true, smartypants: true
                };
                rawHTML = xfEditor._renderMarkdownPipeline(markdownText, markedOptions, rendererOptions, settings);
            }

            // 直接返回预览区中 .xf_editor-preview-container 内的原始 HTML，不做任何包裹
            return rawHTML || "";
        },
        
        /**
         * 开启实时预览
         * Enable real-time watching
         * 
         * @returns {xfEditor}         返回xfEditor的实例对象
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
         * ★ v1.17.4: 共享标题锚点映射构建函数（增强：文本验证 + 层级匹配）
         * 解析 CM 源码提取标题行号 + 查询预览 DOM 标题元素 → 智能配对
         * 供 bindSyncScroll 和 scrollToLineNum 共用
         * 
         * @returns {Array<{editorLine, editorLevel, previewElement, previewSignIndex}>}
         */
        _buildHeadingAnchorMap : function() {
            var cm = this.cm;
            var preview = this.previewContainer;
            if (!cm || !preview || !preview[0]) return [];
            
            try {
                var mdSource = cm.getValue();
                var lines = mdSource.split('\n');
                
                // ★ v1.17.4: 只在非代码区域提取标题
                var mdHeadingRegex = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;
                var inCodeBlock = false;
                var editorHeadings = [];
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    // 检测代码块边界
                    if (/^\s*```/.test(line)) {
                        inCodeBlock = !inCodeBlock;
                        continue;
                    }
                    if (inCodeBlock) continue;
                    
                    var m = line.match(mdHeadingRegex);
                    if (m) {
                        editorHeadings.push({
                            line: i,
                            level: m[1].length,
                            text: m[2].replace(/\{#[^\}]*\}/g, '').trim()
                        });
                    }
                }
                
                if (editorHeadings.length === 0) return [];
                
                // 查找预览 DOM 中的所有标题元素（带 data-sign）
                var allBlocks = preview[0].querySelectorAll('[data-sign]');
                var previewHeadings = [];
                for (var j = 0; j < allBlocks.length; j++) {
                    var block = allBlocks[j];
                    if (/^H[1-6]$/.test(block.tagName)) {
                        var text = (block.textContent || '').replace(/[\s\u00a0\u200b]+/g, ' ').trim();
                        previewHeadings.push({
                            element: block,
                            signIndex: j,
                            level: parseInt(block.tagName.charAt(1)),
                            text: text
                        });
                    }
                }
                
                // ★ v1.17.4: 智能配对 — 优先文本+层级匹配，回退到顺序匹配
                var anchors = [];
                var usedPreview = {};
                
                // 第一轮：精确文本 + 层级匹配
                for (var ei = 0; ei < editorHeadings.length; ei++) {
                    var eH = editorHeadings[ei];
                    var bestMatch = null;
                    var bestScore = Infinity;
                    
                    for (var pi = 0; pi < previewHeadings.length; pi++) {
                        if (usedPreview[pi]) continue;
                        var pH = previewHeadings[pi];
                        
                        // 文本匹配度
                        if (eH.text === pH.text && eH.level === pH.level) {
                            // 完美匹配：优先选距离最近的
                            var dist = Math.abs(ei - pi);
                            if (dist < bestScore) {
                                bestScore = dist;
                                bestMatch = pi;
                            }
                        }
                    }
                    
                    if (bestMatch !== null) {
                        usedPreview[bestMatch] = true;
                        anchors.push({
                            editorLine: eH.line,
                            editorLevel: eH.level,
                            previewElement: previewHeadings[bestMatch].element,
                            previewSignIndex: previewHeadings[bestMatch].signIndex
                        });
                    }
                }
                
                // 第二轮：对剩余未匹配的，按顺序配对
                var remainingEditor = [];
                var remainingPreview = [];
                for (ei = 0; ei < editorHeadings.length; ei++) {
                    if (anchors.filter(function(a) { return a.editorLine === editorHeadings[ei].line; }).length === 0) {
                        remainingEditor.push(editorHeadings[ei]);
                    }
                }
                for (pi = 0; pi < previewHeadings.length; pi++) {
                    if (!usedPreview[pi]) {
                        remainingPreview.push(previewHeadings[pi]);
                    }
                }
                
                var limit2 = Math.min(remainingEditor.length, remainingPreview.length);
                for (var ri = 0; ri < limit2; ri++) {
                    anchors.push({
                        editorLine: remainingEditor[ri].line,
                        editorLevel: remainingEditor[ri].level,
                        previewElement: remainingPreview[ri].element,
                        previewSignIndex: remainingPreview[ri].signIndex
                    });
                }
                
                // 按 editorLine 排序保证顺序正确
                anchors.sort(function(a, b) { return a.editorLine - b.editorLine; });
                
                return anchors;
            } catch(e) {
                return [];
            }
        },
        
        /**
         * ★ v1.17.4: 绑定编辑区与预览区同步滚动（彻底重写）
         * 
         * 彻底修复：
         *   1. **程序化滚动识别**：使用 _syncState.programmaticScroll 标记区分
         *      用户手动滚动和代码触发的滚动。程序化滚动不触发反向同步。
         *   2. **预览→编辑方向完全修复**：
         *      - 使用 _syncState.disablePreviewListener 精确控制，仅在
         *        editor→preview 动画期间禁用反向同步
         *      - 不再错误地阻止用户预览区滚动事件
         *      - 使用委托监听模式，scroll 事件统一走 previewContainer，
         *        同时在滚动容器的祖先链上监听，确保不遗漏
         *   3. **预览交互防护**：_syncState.suppressAllSync 标志
         *      - 图片拖拽缩放、表格编辑等预览操作更新编辑器内容时
         *        完全禁止双向同步，防止内容更新→预览重建→滚动跳转
         *   4. **锚点文本验证匹配**：二维（文本+层级）匹配替代纯顺序配对
         *   5. **代码块过滤**：提取标题时跳过代码块内的 # 开头的行
         * 
         * 方向一 — 编辑区 → 预览区：
         *   1. 获取编辑区可视中心行号
         *   2. 标题锚点 + 插值定位预览滚动位置
         *   3. 设置 programmaticScroll 标记后播放缓动动画
         * 
         * 方向二 — 预览区 → 编辑区：
         *   1. 检查 suppressAllSync / disablePreviewListener / applyingDomChanges
         *   2. 标题锚点定位编辑器行号
         *   3. 使用 scrollIntoView 滚动编辑器
         * 
         * @returns {xfEditor}
         */
        bindSyncScroll : function() {
            var _this    = this;
            var settings = this.settings;
            
            if (!settings.syncScroll || this._scrollSyncBound) {
                return this;
            }
            
            var cm      = this.cm;
            // previewDom = previewContainer 内层 (.xf_editor-preview-container) — DOM 查询用
            // scrollEl   = 外层 .xf_editor-preview — 实际滚动、scrollTop、getBoundingClientRect 用
            var previewDom = this.previewContainer;
            var scrollEl   = this.preview && this.preview[0];
            var editor     = this.editor;
            
            // ★ v1.17.8: 初始化/校验 syncState — 增加主控区追踪
            if (!this._syncState) {
                this._syncState = {
                    lastEditorSyncTime: 0,
                    lastPreviewSyncTime: 0,
                    programmaticScroll: false,
                    disablePreviewListener: false,
                    editorAnimTimer: null,
                    mouseTarget: null,
                    suppressAllSync: false
                };
            }
            var state = this._syncState;
            
            if (!cm || !previewDom || !previewDom.length || !scrollEl || !editor || !editor.length) {
                return this;
            }
            
            var cmScrollEl = cm.getScrollerElement();
            var $cmScroll  = $(cmScrollEl);
            
            previewDom.css("overflow", "hidden");
            
            var SYNC_DEBOUNCE = 16;
            
            // ★★★ v1.17.8: 主控区追踪 — 基于 wheel 事件而非鼠标位置 ★★★
            // 核心原则：用户操作的那一侧是主控区，另一侧跟随；主控区绝不被动滚动
            var _masterZone = null;           // "editor" | "preview" | null
            var _masterZoneClearTimer = null;
            var MASTER_CLEAR_DELAY = 400;    // wheel 停止后 400ms 清除主控区追踪
            
            var _setMasterZone = function(zone) {
                if (_masterZoneClearTimer) clearTimeout(_masterZoneClearTimer);
                _masterZone = zone;
                _masterZoneClearTimer = setTimeout(function() {
                    _masterZone = null;
                }, MASTER_CLEAR_DELAY);
            };
            
            // ★★ Wheel 事件追踪 — 谁在用鼠标滚轮滚动，谁就是主控区 ★★
            $(cmScrollEl).off("wheel.xf_editor-master").on("wheel.xf_editor-master", function(e) {
                if (state.programmaticScroll) return;
                _setMasterZone("editor");
            });
            $(scrollEl).off("wheel.xf_editor-master").on("wheel.xf_editor-master", function(e) {
                if (state.programmaticScroll) return;
                _setMasterZone("preview");
            });
            
            // ★★ mouseenter/mouseleave — 辅助维护鼠标所在区域（用于没有 wheel 的情况，如点击跳转） ★★
            editor.off("mouseenter.xf_editor-sync mouseleave.xf_editor-sync")
                .on("mouseenter.xf_editor-sync", function() {
                    state.mouseTarget = "editor";
                    // ★ v1.17.9 fix: 鼠标进入编辑区立即清除反向主控区，防止旧 masterZone 阻断同步
                    if (_masterZone === "preview") {
                        if (_masterZoneClearTimer) clearTimeout(_masterZoneClearTimer);
                        _masterZone = null;
                    }
                }).on("mouseleave.xf_editor-sync", function() {
                    if (state.mouseTarget === "editor") state.mouseTarget = null;
                });
            $(scrollEl).off("mouseenter.xf_editor-sync mouseleave.xf_editor-sync")
                .on("mouseenter.xf_editor-sync", function() {
                    state.mouseTarget = "preview";
                    // ★ v1.17.9 fix: 鼠标进入预览区立即清除反向主控区，防止旧 masterZone 阻断同步
                    if (_masterZone === "editor") {
                        if (_masterZoneClearTimer) clearTimeout(_masterZoneClearTimer);
                        _masterZone = null;
                    }
                }).on("mouseleave.xf_editor-sync", function() {
                    if (state.mouseTarget === "preview") state.mouseTarget = null;
                });
            
            // ★★ v1.17.9 fix: 编辑器获得焦点时（如点击），清除反向主控区追踪 ★★
            cm.off("focus.xf_editor-sync");
            cm.on("focus.xf_editor-sync", function() {
                state.mouseTarget = "editor";
                if (_masterZone === "preview") {
                    if (_masterZoneClearTimer) clearTimeout(_masterZoneClearTimer);
                    _masterZone = null;
                }
            });
            
            // ★★ v1.17.8: 位置映射 — 基于全部 data-sign 块的精细映射表 ★★
            var _positionMap = null;       // [{editorLine, previewY}] — previewY 是相对于 scrollEl 内容顶部的偏移
            var _positionMapCacheKey = null;
            
            var _buildPositionMap = function() {
                try {
                    // ★ v1.17.9: 两层回退 — data-sign 块 → 全部块级元素 → 简单分段
                    var blocks = previewDom[0].querySelectorAll('[data-sign]');
                    if (!blocks || !blocks.length) {
                        // 回退：查找任意块级元素作为位置锚点
                        blocks = previewDom[0].querySelectorAll('h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,dl,hr,li');
                    }
                    if (!blocks || !blocks.length) {
                        // 最终回退：至少使用 previewDom 自身作为单个锚点
                        _positionMap = [];
                        if (previewDom[0]) {
                            var totalLinesFallback = cm.lineCount();
                            if (totalLinesFallback > 1) {
                                _positionMap = [
                                    { editorLine: 0, previewY: 0 },
                                    { editorLine: totalLinesFallback - 1, previewY: scrollEl.scrollHeight || 1000 }
                                ];
                            }
                        }
                        return;
                    }
                    
                    var totalLines = cm.lineCount();
                    if (totalLines <= 1) { _positionMap = []; return; }
                    
                    // ★ v1.17.8: 先构建标题锚点列表（精确的 editorLine→blockIndex 映射）
                    var mdSource = cm.getValue();
                    var lines = mdSource.split('\n');
                    var headingRegex = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;
                    var inCodeBlock = false;
                    var editorHeadings = [];
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        if (/^\s*```/.test(line)) { inCodeBlock = !inCodeBlock; continue; }
                        if (inCodeBlock) continue;
                        var m = line.match(headingRegex);
                        if (m) {
                            editorHeadings.push({
                                line: i,
                                text: m[2].replace(/\{#[^\}]*\}/g, '').trim()
                            });
                        }
                    }
                    
                    // 提取预览DOM中的标题元素
                    var previewHeadings = [];
                    for (var b = 0; b < blocks.length; b++) {
                        if (/^H[1-6]$/.test(blocks[b].tagName)) {
                            previewHeadings.push({
                                index: b,
                                text: (blocks[b].textContent || '').replace(/[\s\u00a0\u200b]+/g, ' ').trim()
                            });
                        }
                    }
                    
                    // 配对：文本匹配
                    var headingMap = []; // [{editorLine, blockIndex}]
                    var usedPH = {};
                    for (var ei = 0; ei < editorHeadings.length; ei++) {
                        for (var pi = 0; pi < previewHeadings.length; pi++) {
                            if (usedPH[pi]) continue;
                            if (editorHeadings[ei].text === previewHeadings[pi].text) {
                                headingMap.push({ editorLine: editorHeadings[ei].line, blockIndex: previewHeadings[pi].index });
                                usedPH[pi] = true;
                                break;
                            }
                        }
                    }
                    headingMap.sort(function(a, b) { return a.editorLine - b.editorLine; });
                    
                    // ★ v1.17.8: 构建完整位置映射表 — 标题锚点精确对齐 + 块间比例分配
                    _positionMap = [];
                    var scrollElRect = scrollEl.getBoundingClientRect ? scrollEl.getBoundingClientRect() : { top: 0 };
                    
                    if (headingMap.length < 2) {
                        // 标题不够，使用全体块的比例映射
                        var seRect = scrollEl.getBoundingClientRect();
                        for (var bi = 0; bi < blocks.length; bi++) {
                            var bRect = blocks[bi].getBoundingClientRect();
                            var py = scrollEl.scrollTop + (bRect.top - seRect.top);
                            var el = Math.round((bi / Math.max(1, blocks.length - 1)) * (totalLines - 1));
                            _positionMap.push({ editorLine: el, previewY: Math.max(0, py) });
                        }
                    } else {
                        // 有足量标题锚点：标题间按 editorLine 比例分配块
                        var prevH = headingMap[0];
                        _positionMap.push({ editorLine: 0, previewY: 0 });
                        
                        // 每个标题映射到精确位置
                        for (var hi = 0; hi < headingMap.length; hi++) {
                            var bh = headingMap[hi];
                            try {
                                var bR = blocks[bh.blockIndex].getBoundingClientRect();
                                var pY = scrollEl.scrollTop + (bR.top - scrollEl.getBoundingClientRect().top);
                                _positionMap.push({ editorLine: bh.editorLine, previewY: Math.max(0, pY) });
                            } catch(e) {}
                        }
                        
                        // 最后一个块
                        var lastBlock = blocks[blocks.length - 1];
                        try {
                            var lbR = lastBlock.getBoundingClientRect();
                            var lbY = scrollEl.scrollTop + (lbR.bottom - scrollEl.getBoundingClientRect().top);
                            _positionMap.push({ editorLine: totalLines - 1, previewY: Math.max(0, lbY) });
                        } catch(e) {
                            _positionMap.push({ editorLine: totalLines - 1, previewY: scrollEl.scrollHeight });
                        }
                    }
                    
                    // 去重 + 排序
                    _positionMap.sort(function(a, b) { return a.editorLine - b.editorLine || a.previewY - b.previewY; });
                } catch(e) {
                    _positionMap = [];
                }
            };
            
            var _getPositionMap = function() {
                // ★ v1.17.9: 用内容长度+行数作为缓存键，内容变化时更可靠地失效
                var key = cm.getValue().length + '_' + cm.lineCount();
                if (_positionMapCacheKey !== key) {
                    _buildPositionMap();
                    _positionMapCacheKey = key;
                }
                return _positionMap;
            };
            
            var _invalidatePositionMap = function() {
                _positionMap = null;
                _positionMapCacheKey = null;
            };
    
            // ================================================================
            // ★ v1.17.8: 滚动动画 — 使用外层 scrollEl
            // ================================================================
            var _animCounter = 0;
            var _scrollAnimationTo = function(targetScrollTop) {
                if (Math.abs(scrollEl.scrollTop - targetScrollTop) < 3) return;
                
                if (state.editorAnimTimer) {
                    cancelAnimationFrame(state.editorAnimTimer);
                    state.editorAnimTimer = null;
                }
                
                var animId = ++_animCounter;
                state.disablePreviewListener = true;
                state.programmaticScroll = true;
                
                var startTop = scrollEl.scrollTop;
                var startTime = performance.now();
                var duration = 200;
                
                var animationHandler = function(timestamp) {
                    if (animId !== _animCounter) return;
                    var elapsed = timestamp - startTime;
                    var progress = Math.min(1, elapsed / duration);
                    var easing = progress < 0.5
                        ? 4 * progress * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                    var newTop = startTop + (targetScrollTop - startTop) * easing;
                    scrollEl.scrollTop = Math.max(0, newTop);
                    
                    if (progress < 1) {
                        state.editorAnimTimer = requestAnimationFrame(animationHandler);
                    } else {
                        scrollEl.scrollTop = Math.max(0, targetScrollTop);
                        state.editorAnimTimer = null;
                        state.disablePreviewListener = false;
                        requestAnimationFrame(function() {
                            requestAnimationFrame(function() {
                                state.programmaticScroll = false;
                            });
                        });
                    }
                };
                state.editorAnimTimer = requestAnimationFrame(animationHandler);
            };
            
            // ★ v1.17.8: 暴露内部方法到 state 对象供外部调用
            state._invalidateAnchors = _invalidatePositionMap;
            state._refreshSync = function(centerLine) {
                try {
                    _invalidatePositionMap();
                    if (typeof centerLine === 'number') {
                        var targetScrollTop = _editorLineToPreviewScroll(centerLine);
                        if (targetScrollTop !== null) {
                            _scrollAnimationTo(targetScrollTop);
                        }
                    }
                } catch(e) {}
            };
    
            // ================================================================
            // ★★★ v1.17.8: 方向一 — 编辑区行号→预览区滚动位置 ★★★
            // 使用位置映射表（所有 data-sign 块）进行精确定位
            // ================================================================
            var _editorLineToPreviewScroll = function(editorLine) {
                try {
                    var map = _getPositionMap();
                    var totalLines = cm.lineCount();
                    
                    if (!map || map.length === 0) {
                        // ★ v1.17.9: 与 _buildPositionMap 保持一致的回退 — 先用 data-sign，再找任意块级元素
                        var blocks = previewDom[0].querySelectorAll('[data-sign]');
                        if (!blocks.length) {
                            blocks = previewDom[0].querySelectorAll('h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,dl,hr,li');
                        }
                        if (!blocks.length) return null;
                        var ratio = Math.max(0, Math.min(1, editorLine / Math.max(1, totalLines - 1)));
                        var tIdx = Math.round(ratio * (blocks.length - 1));
                        tIdx = Math.min(blocks.length - 1, Math.max(0, tIdx));
                        var targetBlock = blocks[tIdx];
                        var seRect = scrollEl.getBoundingClientRect();
                        var bRect = targetBlock.getBoundingClientRect();
                        return Math.max(0, scrollEl.scrollTop + (bRect.top - seRect.top));
                    }
                    
                    var lo = 0, hi = map.length - 1;
                    while (lo < hi) {
                        var mid = (lo + hi + 1) >> 1;
                        if (map[mid].editorLine <= editorLine) {
                            lo = mid;
                        } else {
                            hi = mid - 1;
                        }
                    }
                    
                    if (lo >= map.length - 1) return map[map.length - 1].previewY;
                    
                    var prev = map[lo];
                    var next = map[lo + 1];
                    var lineDist = next.editorLine - prev.editorLine;
                    if (lineDist <= 0) return prev.previewY;
                    
                    var t = Math.max(0, Math.min(1, (editorLine - prev.editorLine) / lineDist));
                    return prev.previewY + (next.previewY - prev.previewY) * t;
                } catch(e) {
                    return null;
                }
            };
    
            // ================================================================
            // ★★★ v1.17.8: 方向二 — 预览区滚动位置→编辑区行号 ★★★
            // ================================================================
            var _previewScrollToEditorLine = function() {
                try {
                    var map = _getPositionMap();
                    var totalLines = cm.lineCount();
                    if (totalLines <= 0) return null;
                    
                    if (!map || map.length === 0) {
                        // ★ v1.17.9: 与 _buildPositionMap 保持一致的回退 — 先用 data-sign，再找任意块级元素
                        var blocks = previewDom[0].querySelectorAll('[data-sign]');
                        if (!blocks.length) {
                            blocks = previewDom[0].querySelectorAll('h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,dl,hr,li');
                        }
                        if (!blocks.length) return null;
                        
                        var seRect = scrollEl.getBoundingClientRect();
                        var vpCenter = (seRect.top + seRect.bottom) / 2;
                        
                        var lo = 0, hi = blocks.length - 1, foundIdx = -1;
                        while (lo <= hi) {
                            var mid = (lo + hi) >> 1;
                            var r = blocks[mid].getBoundingClientRect();
                            if (r.bottom > vpCenter) {
                                foundIdx = mid;
                                hi = mid - 1;
                            } else {
                                lo = mid + 1;
                            }
                        }
                        if (foundIdx < 0) foundIdx = blocks.length - 1;
                        
                        var ratio = blocks.length > 1 ? foundIdx / (blocks.length - 1) : 0;
                        return Math.round(ratio * (totalLines - 1));
                    }
                    
                    var seRect = scrollEl.getBoundingClientRect();
                    var viewportCenterY = scrollEl.scrollTop + (seRect.bottom - seRect.top) / 2;
                    
                    var lo = 0, hi = map.length - 1;
                    while (lo < hi) {
                        var mid = (lo + hi + 1) >> 1;
                        if (map[mid].previewY <= viewportCenterY) {
                            lo = mid;
                        } else {
                            hi = mid - 1;
                        }
                    }
                    
                    if (lo >= map.length - 1) return totalLines - 1;
                    
                    var prev = map[lo];
                    var next = map[lo + 1];
                    var yDist = next.previewY - prev.previewY;
                    if (yDist <= 0) return prev.editorLine;
                    
                    var t = Math.max(0, Math.min(1, (viewportCenterY - prev.previewY) / yDist));
                    return Math.round(prev.editorLine + (next.editorLine - prev.editorLine) * t);
                } catch(e) {
                    return null;
                }
            };
    
            // ================================================================
            // ★ v1.17.8: 方向一：编辑区滚动 → 同步预览区
            //   门控：_masterZone !== "preview" 才允许（用户正在操作预览区时禁止）
            // ================================================================
            var _editorSyncToPreview = function() {
                if (state.suppressAllSync) return;
                if (state.programmaticScroll) return;
                if (_this._applyingDomChanges) return;
                if (_masterZone === "preview") return;
                if (!_masterZone && state.mouseTarget === "preview") return;
                
                var now = Date.now();
                if (now - state.lastEditorSyncTime < SYNC_DEBOUNCE) return;
                state.lastEditorSyncTime = now;
                
                try {
                    var cmInfo = cm.getScrollInfo();
                    var cmMaxScroll = Math.max(0, cmInfo.height - cmInfo.clientHeight);
                    if (cmMaxScroll <= 0) return;
                    
                    var scrollRatio = cmMaxScroll > 0 ? cmInfo.top / cmMaxScroll : 0;
                    var totalLines = cm.lineCount();
                    var centerLine = Math.round(scrollRatio * (totalLines - 1));
                    
                    var firstVisibleLine = cm.lineAtHeight(cmInfo.top, "local");
                    var lastVisibleLine = cm.lineAtHeight(cmInfo.top + cmInfo.clientHeight, "local");
                    var visibleCenter = firstVisibleLine + (lastVisibleLine - firstVisibleLine) / 2;
                    centerLine = Math.round((centerLine + visibleCenter) / 2);
                    
                    var targetScrollTop = _editorLineToPreviewScroll(centerLine);
                    if (targetScrollTop !== null) {
                        _scrollAnimationTo(targetScrollTop);
                    }
                } catch(e) {}
            };
            
            $cmScroll.off("scroll.xf_editor-sync").on("scroll.xf_editor-sync", _editorSyncToPreview);
            
            var _editorChangeTimer = null;
            cm.off("changes.xfsync");
            cm.on("changes.xfsync", function() {
                clearTimeout(_editorChangeTimer);
                _editorChangeTimer = setTimeout(function() {
                    if (_this._applyingDomChanges) return;
                    _invalidatePositionMap();
                    if (!state.suppressAllSync && _masterZone !== "preview") {
                        _editorSyncToPreview();
                    }
                }, 50);
            });
            
            cm.off("cursorActivity.xfsync");
            cm.on("cursorActivity.xfsync", function() {
                if (state.suppressAllSync) return;
                if (_this._applyingDomChanges) return;
                if (_masterZone === "preview") return;
                
                var cursor = cm.getCursor();
                var cmInfo = cm.getScrollInfo();
                var cursorTop = cm.charCoords(cursor, "local").top;
                if (cursorTop < cmInfo.top || cursorTop > cmInfo.top + cmInfo.clientHeight) {
                    _invalidatePositionMap();
                    _editorSyncToPreview();
                }
            });
    
            // ================================================================
            // ★ v1.17.8: 方向二：预览区滚动 → 同步编辑区
            //   门控：_masterZone !== "editor" 才允许（编辑区是主控区时禁止）
            // ================================================================
            var _previewScrollHandler = function(e) {
                if (state.suppressAllSync) return;
                if (state.programmaticScroll) return;
                if (state.disablePreviewListener) return;
                if (_this._applyingDomChanges) return;
                if (_masterZone === "editor") return;
                if (!_masterZone && state.mouseTarget === "editor") return;
                
                var now = Date.now();
                if (now - state.lastPreviewSyncTime < SYNC_DEBOUNCE) return;
                state.lastPreviewSyncTime = now;
                
                try {
                    var targetLine = _previewScrollToEditorLine();
                    if (targetLine === null) return;
                    
                    var cmInfo = cm.getScrollInfo();
                    if (cmInfo.clientHeight <= 0) return;
                    
                    var totalLines = cm.lineCount();
                    targetLine = Math.max(0, Math.min(totalLines - 1, targetLine));
                    
                    state.programmaticScroll = true;
                    var editorMaxScroll = cmInfo.height - cmInfo.clientHeight;
                    if (editorMaxScroll > 0) {
                        var lineCoords = cm.charCoords({line: targetLine, ch: 0}, "local");
                        var targetEditorTop = lineCoords.top - Math.round(cmInfo.clientHeight / 3);
                        targetEditorTop = Math.max(0, Math.min(editorMaxScroll, targetEditorTop));
                        cm.scrollTo(0, targetEditorTop);
                    }
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            state.programmaticScroll = false;
                        });
                    });
                } catch(e) {}
            };
    
            $(scrollEl).off("scroll.xf_editor-sync-v3").on("scroll.xf_editor-sync-v3", _previewScrollHandler);
            
            $(scrollEl).off("wheel.xf_editor-anim").on("wheel.xf_editor-anim", function() {
                if (state.editorAnimTimer) {
                    cancelAnimationFrame(state.editorAnimTimer);
                    state.editorAnimTimer = null;
                }
                // ★ v1.17.9 fix: 动画中断时重置防回环标志，否则永久死锁
                state.disablePreviewListener = false;
                state.programmaticScroll = false;
                _invalidatePositionMap();
            });
            $(cmScrollEl).off("wheel.xf_editor-anim").on("wheel.xf_editor-anim", function() {
                if (state.editorAnimTimer) {
                    cancelAnimationFrame(state.editorAnimTimer);
                    state.editorAnimTimer = null;
                }
                // ★ v1.17.9 fix: 动画中断时重置防回环标志，否则永久死锁
                state.disablePreviewListener = false;
                state.programmaticScroll = false;
                _invalidatePositionMap();
            });
            
            $(scrollEl).off("mousedown.xf_editor-sync").on("mousedown.xf_editor-sync", function(e) {
                var sw = scrollEl.offsetWidth - scrollEl.clientWidth;
                if (sw > 0 && e.offsetX > scrollEl.clientWidth) {
                    if (state.editorAnimTimer) {
                        cancelAnimationFrame(state.editorAnimTimer);
                        state.editorAnimTimer = null;
                    }
                    // ★ v1.17.9 fix: scrollbar拖拽也必须重置防回环标志
                    state.disablePreviewListener = false;
                    state.programmaticScroll = false;
                }
                _invalidatePositionMap();
            });
    
            // ================================================================
            // ★ v1.17.8: TOC 链接点击处理
            // ================================================================
            previewDom.off("click.xf_editor-toc").on("click.xf_editor-toc", ".markdown-toc-list a[href^='#']", function(e) {
                var href = $(this).attr("href");
                if (!href || href === "#") return;
                var targetId = decodeURIComponent(href.substring(1));
                var targetEl = null;
                try {
                    targetEl = previewDom[0].querySelector('[id="' + CSS.escape(targetId) + '"]');
                } catch(_) {
                    targetEl = previewDom[0].querySelector('[id="' + targetId.replace(/"/g, '\\"') + '"]');
                }
                if (targetEl && previewDom[0].contains(targetEl)) {
                    e.preventDefault();
                    e.stopPropagation();
                    var seRect = scrollEl.getBoundingClientRect();
                    var tRect = targetEl.getBoundingClientRect();
                    var targetScrollTop = scrollEl.scrollTop + (tRect.top - seRect.top) - 30;
                    targetScrollTop = Math.max(0, targetScrollTop);
                    _invalidatePositionMap();
                    _setMasterZone("preview");
                    state.programmaticScroll = true;
                    scrollEl.scrollTo({ top: targetScrollTop, behavior: "smooth" });
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            state.programmaticScroll = false;
                        });
                    });
                }
            });
            
            // ================================================================
            // ★ v1.17.8: 脚注引用链接点击处理
            // ================================================================
            previewDom.off("click.xf_editor-footnote").on("click.xf_editor-footnote", ".xf_editor-footnote-ref-wrapper a[href^='#xf_editor-fn-'], .xf_editor-copybook-footnote a[href^='#xf_editor-fn-'], .xf_editor-footnote-backref[href^='#xf_editor-fnref-']", function(e) {
                var href = $(this).attr("href");
                if (!href || href === "#") return;
                
                var targetId = decodeURIComponent(href.substring(1));
                var targetEl = null;
                try {
                    targetEl = previewDom[0].querySelector('[id="' + CSS.escape(targetId) + '"]');
                } catch(_) {
                    targetEl = previewDom[0].querySelector('[id="' + targetId.replace(/"/g, '\\"') + '"]');
                }
                
                if (targetEl && previewDom[0].contains(targetEl)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var tRect = targetEl.getBoundingClientRect();
                    var targetScrollTop = scrollEl.scrollTop + (tRect.top - scrollEl.getBoundingClientRect().top) - 40;
                    targetScrollTop = Math.max(0, targetScrollTop);
                    
                    _setMasterZone("preview");
                    state.programmaticScroll = true;
                    scrollEl.scrollTo({ top: targetScrollTop, behavior: "smooth" });
                    
                    var $target = $(targetEl);
                    $target.addClass("xf_editor-footnote-highlight");
                    setTimeout(function() {
                        $target.removeClass("xf_editor-footnote-highlight");
                    }, 2000);
                    
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() {
                            state.programmaticScroll = false;
                        });
                    });
                }
            });
            
            var _resizeTimer = null;
            $(window).off("resize.xf_editor-sync").on("resize.xf_editor-sync", function() {
                clearTimeout(_resizeTimer);
                _resizeTimer = setTimeout(function() {
                    _invalidatePositionMap();
                    _editorSyncToPreview();
                }, 200);
            });
    
            // ================================================================
            // ★ v1.17.9: 外部接口 — 预览区交互时暂停/恢复同步
            // ================================================================
            this.suspendSyncScroll = function() {
                state.suppressAllSync = true;
                // 清除所有待处理的同步定时器，防止覆盖手动滚动恢复
                clearTimeout(_editorChangeTimer);
                _editorChangeTimer = null;
                if (_this.__lastSyncTimer) {
                    clearTimeout(_this.__lastSyncTimer);
                    _this.__lastSyncTimer = null;
                }
                // 取消正在进行的动画
                if (state.editorAnimTimer) {
                    cancelAnimationFrame(state.editorAnimTimer);
                    state.editorAnimTimer = null;
                    state.disablePreviewListener = false;
                    state.programmaticScroll = false;
                }
            };
            this.resumeSyncScroll = function() {
                state.suppressAllSync = false;
                // ★ v1.17.9: 清除 save() 创建的延迟同步定时器，防止覆盖手动滚动恢复
                if (_this.__lastSyncTimer) {
                    clearTimeout(_this.__lastSyncTimer);
                    _this.__lastSyncTimer = null;
                }
                _invalidatePositionMap();
            };
    
            this._scrollSyncBound = true;
            _invalidatePositionMap();
            
            setTimeout(function() {
                if (state.suppressAllSync) return;
                if (_this._applyingDomChanges) return;
                try {
                    var cmInfo = cm.getScrollInfo();
                    var cmMaxScroll = Math.max(0, cmInfo.height - cmInfo.clientHeight);
                    if (cmMaxScroll <= 0) return;
                    var scrollRatio = cmMaxScroll > 0 ? cmInfo.top / cmMaxScroll : 0;
                    var totalLines = cm.lineCount();
                    var centerLine = Math.round(scrollRatio * (totalLines - 1));
                    var firstVisibleLine = cm.lineAtHeight(cmInfo.top, "local");
                    var lastVisibleLine = cm.lineAtHeight(cmInfo.top + cmInfo.clientHeight, "local");
                    centerLine = Math.round((centerLine + firstVisibleLine + (lastVisibleLine - firstVisibleLine) / 2) / 2);
                    var targetScrollTop = _editorLineToPreviewScroll(centerLine);
                    if (targetScrollTop !== null) {
                        _scrollAnimationTo(targetScrollTop);
                    }
                } catch(e) {}
            }, 300);
            
            return this;
        },
        
        /**
         * ★ v1.17.1: 解除同步滚动绑定
         * Unbind editor-preview sync scrolling
         * 
         * @returns {xfEditor}
         */
        unbindSyncScroll : function() {
            if (!this._scrollSyncBound) return this;
            
            try {
                // 取消动画
                if (this._syncState && this._syncState.editorAnimTimer) {
                    cancelAnimationFrame(this._syncState.editorAnimTimer);
                    this._syncState.editorAnimTimer = null;
                    this._syncState.disablePreviewListener = false;
                }
                // 兼容旧版
                if (this._scrollAnimation && this._scrollAnimation.timer) {
                    cancelAnimationFrame(this._scrollAnimation.timer);
                    this._scrollAnimation.timer = null;
                }
                
                var cmScrollEl = this.cm && this.cm.getScrollerElement();
                var preview = this.preview && this.preview[0];
                
                if (cmScrollEl) {
                    $(cmScrollEl).off("scroll.xf_editor-sync wheel.xf_editor-master wheel.xf_editor-anim");
                }
                if (preview) {
                    $(preview).off("scroll.xf_editor-sync-v3 wheel.xf_editor-master wheel.xf_editor-anim mousedown.xf_editor-sync mouseenter.xf_editor-sync mouseleave.xf_editor-sync");
                }
                if (this.previewContainer) {
                    this.previewContainer.off("click.xf_editor-toc click.xf_editor-footnote");
                }
                if (this.editor) {
                    this.editor.off("mouseenter.xf_editor-sync mouseleave.xf_editor-sync");
                }
                $(window).off("resize.xf_editor-sync");
                if (this.cm) {
                    this.cm.off("changes.xfsync cursorActivity.xfsync focus.xf_editor-sync");
                }
            } catch(e) {}
            
            clearTimeout(this.__syncLeaveTimer);
            clearTimeout(this.__syncDomLockTimer);
            clearTimeout(this.__lastSyncTimer);
            this.__lastSyncTimer = null;
            this._scrollSyncBound = false;
            this._syncingScroll = false;
            this._syncScrollActive = null;
            this._applyingDomChanges = false;
            // 重置同步状态
            if (this._syncState) {
                this._syncState.suppressAllSync = false;
                this._syncState.programmaticScroll = false;
                this._syncState.disablePreviewListener = false;
                this._syncState.mouseTarget = null;
                this._syncState.lastEditorSyncTime = 0;
                this._syncState.lastPreviewSyncTime = 0;
            }
            // 清理外部接口
            this.suspendSyncScroll = null;
            this.resumeSyncScroll = null;
            
            return this;
        },
        
        /**
         * ★ v1.17.2-FIX: 滚动预览区到指定编辑区行号（标题锚点 + 插值）
         * 
         * 参照 cherry-markdown scrollToLineNum(lineNum, linePercent)，
         * 使用标题锚点映射替代简单比例算法，定位精准。
         * 
         * @param {number} lineNum     目标行号（从 0 开始）
         * @param {number} [linePercent=0] 行内百分比偏移 (0~1)
         * @returns {xfEditor}
         */
        scrollToLineNum : function(lineNum, linePercent) {
            linePercent = linePercent || 0;
            var targetLine = lineNum + linePercent;
            
            var previewDom = this.previewContainer;
            var scrollEl = this.preview ? this.preview[0] : null;
            if (!previewDom || !previewDom[0] || !scrollEl) return this;
            var state = this._syncState;
            
            try {
                var totalLines = this.cm ? this.cm.lineCount() : 1;
                var anchors = this._buildHeadingAnchorMap();
                var targetScrollTop = null;
                
                // ★ 有标题锚点时使用插值定位
                if (anchors.length > 0) {
                    var prevAnchor = anchors[0];
                    var nextAnchor = anchors[anchors.length - 1];
                    
                    for (var i = 0; i < anchors.length; i++) {
                        if (anchors[i].editorLine <= targetLine) prevAnchor = anchors[i];
                        if (anchors[i].editorLine >= targetLine) {
                            nextAnchor = anchors[i];
                            break;
                        }
                    }
                    
                    var scRect = scrollEl.getBoundingClientRect();
                    
                    if (prevAnchor === nextAnchor) {
                        var pR = prevAnchor.previewElement.getBoundingClientRect();
                        targetScrollTop = scrollEl.scrollTop + (pR.top - scRect.top);
                    } else {
                        var editorDist = nextAnchor.editorLine - prevAnchor.editorLine;
                        if (editorDist <= 0) editorDist = 1;
                        var localRatio = (targetLine - prevAnchor.editorLine) / editorDist;
                        localRatio = Math.max(0, Math.min(1, localRatio));
                        
                        var pRect = prevAnchor.previewElement.getBoundingClientRect();
                        var nRect = nextAnchor.previewElement.getBoundingClientRect();
                        
                        var prevScrollPos = scrollEl.scrollTop + (pRect.top - scRect.top);
                        var nextScrollPos = scrollEl.scrollTop + (nRect.top - scRect.top);
                        
                        targetScrollTop = prevScrollPos + (nextScrollPos - prevScrollPos) * localRatio;
                    }
                }
                
                // ★ 回退：无标题时使用比例映射
                if (targetScrollTop === null) {
                    var blocks = previewDom[0].querySelectorAll('[data-sign]');
                    if (blocks.length) {
                        var ratio = Math.max(0, Math.min(1, targetLine / Math.max(1, totalLines - 1)));
                        var tIdx = Math.round(ratio * (blocks.length - 1));
                        tIdx = Math.min(blocks.length - 1, Math.max(0, tIdx));
                        var targetBlock = blocks[tIdx];
                        var containerRect = scrollEl.getBoundingClientRect();
                        var blockRect = targetBlock.getBoundingClientRect();
                        targetScrollTop = scrollEl.scrollTop + (blockRect.top - containerRect.top);
                    }
                }
                
                if (targetScrollTop !== null) {
                    if (state) state.programmaticScroll = true;
                    scrollEl.scrollTo({
                        top: Math.max(0, targetScrollTop),
                        behavior: "smooth"
                    });
                    if (state) {
                        requestAnimationFrame(function() {
                            requestAnimationFrame(function() {
                                state.programmaticScroll = false;
                            });
                        });
                    }
                }
            } catch(e) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] scrollToLineNum error:", e);
                }
            }
            
            return this;
        },
        
        /**
         * 显示编辑器
         * Show editor
         * 
         * @param   {Function} [callback=function()] 回调函数
         * @returns {xfEditor}                       返回xfEditor的实例对象
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
         * @returns {xfEditor}                       返回xfEditor的实例对象
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
                
                editor.find("." + this.classPrefix + "preview-close-btn").show().on(xfEditor.mouseOrTouch("click", "touchend"), function(){
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
                $(document).on("keyup.xf_editor-preview", function(event) {
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
            $(document).off("keyup.xf_editor-preview");
            
            this.codeMirror.show();
            
            if (settings.toolbar) {
                toolbar.show();
            }
            
            preview[(settings.watch) ? "show" : "hide"]();
            
            previewCloseBtn.hide().off(xfEditor.mouseOrTouch("click", "touchend"));
                
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
         * @returns {xfEditor}         返回xfEditor的实例对象
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
                $(document).on("keyup.xf_editor-fs", function(event) {
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
         * @returns {xfEditor}         返回xfEditor的实例对象
         */
        
        fullscreenExit : function() {
            
            var editor            = this.editor;
            var settings          = this.settings;
            var toolbar           = this.toolbar;
            var fullscreenClass   = this.classPrefix + "fullscreen";  
            
            this.state.fullscreen = false;
            
            // 移除 ESC 键监听（使用命名空间精确解绑）
            $(document).off("keyup.xf_editor-fs");
            
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
         * ★ v1.17.6: 内联链接对话框，不依赖插件异步加载
         * Inline link dialog - supports [text](url){target=_blank} syntax
         */
        linkDialog : function() {
            var _this       = this;
            var cm          = this.cm;
            var editor      = this.editor;
            var settings    = this.settings;
            var selection   = cm.getSelection();
            var lang        = this.lang;
            var linkLang    = lang.dialog.link;
            var classPrefix = this.classPrefix;
            var dialogName  = classPrefix + "link-dialog", dialog;

            cm.focus();

            if (editor.find("." + dialogName).length > 0)
            {
                dialog = editor.find("." + dialogName);
                dialog.find("[data-url]").val("http://");
                dialog.find("[data-title]").val(selection);
                dialog.find("[data-target]").val("");

                this.dialogShowMask(dialog);
                this.dialogLockScreen();
                dialog.show();
            }
            else
            {
                var dialogHTML = "<div class=\"" + classPrefix + "form\">" + 
                                        "<label>" + linkLang.url + "</label>" + 
                                        "<input type=\"text\" value=\"http://\" data-url />" +
                                        "<br/>" + 
                                        "<label>" + linkLang.urlTitle + "</label>" + 
                                        "<input type=\"text\" value=\"" + selection + "\" data-title />" + 
                                        "<br/>" +
                                        "<label>" + (linkLang.target || "跳转方式") + "</label>" +
                                        "<select data-target>" +
                                            "<option value=\"\">" + (linkLang.targetDefault || "默认(当前页面)") + "</option>" +
                                            "<option value=\"_blank\">" + (linkLang.targetBlank || "新页面打开") + "</option>" +
                                            "<option value=\"_self\">" + (linkLang.targetSelf || "当前页面打开") + "</option>" +
                                            "<option value=\"_parent\">" + (linkLang.targetParent || "父窗口打开") + "</option>" +
                                            "<option value=\"_top\">" + (linkLang.targetTop || "顶层窗口打开") + "</option>" +
                                        "</select>" +
                                        "<br/>" +
                                    "</div>";

                // 保存光标位置用于后续插入
                var cursor = cm.getCursor();

                dialog = this.createDialog({
                    title      : linkLang.title,
                    width      : 380,
                    height     : 300,
                    content    : dialogHTML,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons    : {
                        enter  : [lang.buttons.enter, function() {
                            var url    = this.find("[data-url]").val();
                            var title  = this.find("[data-title]").val();
                            var target = this.find("[data-target]").val();

                            if (url === "http://" || url === "")
                            {
                                xfEditor.notify(linkLang.urlEmpty, "warning");
                                return false;
                            }
                            
                            // ★ v1.17.6: 构建带 target 的链接标记
                            var str;
                            if (target) {
                                // 使用扩展语法: [text](url){target=_blank}
                                str = "[" + (title || url) + "](" + url + "){target=" + target + "}";
                            } else {
                                if (title) {
                                    str = "[" + title + "](" + url + " \"" + title + "\")";
                                } else {
                                    str = "[" + url + "](" + url + ")";
                                }
                            }

                            // ★ v1.17.6-FIX4: 使用 _this.cm 获取最新 CodeMirror 引用
                            var editCm = _this.cm;
                            if (editCm && typeof editCm.replaceSelection === "function") {
                                editCm.focus();
                                editCm.replaceSelection(str);
                            }

                            this.hide().lockScreen(false).hideMask();
                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();
                            return false;
                        }]
                    }
                });
            }
        },
        
        /**
         * ★ v1.17.6: 内联引用链接对话框
         * Inline reference link dialog
         */
        referenceLinkDialog : function() {
            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var dialogLang  = lang.dialog.referenceLink;
            var classPrefix = this.classPrefix;
            var dialogName  = classPrefix + "reference-link-dialog", dialog;
            var ReLinkId    = (this._reLinkIdCounter || 0) + 1;
            this._reLinkIdCounter = ReLinkId;

            cm.focus();

            if (editor.find("." + dialogName).length < 1)
            {
                var dialogHTML = "<div class=\"" + classPrefix + "form\">" +
                                        "<label>" + dialogLang.name + "</label>" +
                                        "<input type=\"text\" value=\"[" + ReLinkId + "]\" data-name />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.urlId + "</label>" +
                                        "<input type=\"text\" data-url-id />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.url + "</label>" +
                                        "<input type=\"text\" value=\"http://\" data-url />" +
                                        "<br/>" +
                                        "<label>" + dialogLang.urlTitle + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-title />" +
                                        "<br/>" +
                                    "</div>";

                dialog = this.createDialog({
                    name       : dialogName,
                    title      : dialogLang.title,
                    width      : 380,
                    height     : 296,
                    content    : dialogHTML,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter  : [lang.buttons.enter, function() {
                            var name  = this.find("[data-name]").val();
                            var url   = this.find("[data-url]").val();
                            var rid   = this.find("[data-url-id]").val();
                            var title = this.find("[data-title]").val();

                            if (url === "http://" || url === "")
                            {
                                xfEditor.notify(dialogLang.urlEmpty, "warning");
                                return false;
                            }

                            var linkText = title || name.replace(/^\[(.*)\]$/, "$1") || url;
                            var linkStr = "[" + linkText + "](" + url;
                            if (title && title !== linkText) {
                                linkStr += ' "' + title + '"';
                            }
                            linkStr += ")";

                            // ★ v1.17.6-FIX4: 使用 _this.cm 获取最新 CodeMirror 引用
                            var editCm = _this.cm;
                            if (editCm && typeof editCm.replaceSelection === "function") {
                                editCm.focus();
                                editCm.replaceSelection(linkStr);
                            }

                            if (selection === "") {
                                var curCm = _this.cm;
                                if (curCm) curCm.setCursor(cursor.line, cursor.ch + linkStr.length);
                            }

                            this.hide().lockScreen(false).hideMask();
                            return false;
                        }],
                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();
                            return false;
                        }]
                    }
                });
            }

            dialog = editor.find("." + dialogName);
            dialog.find("[data-name]").val("[" + ReLinkId + "]");
            dialog.find("[data-url-id]").val("");
            dialog.find("[data-url]").val("http://");
            dialog.find("[data-title]").val(selection);

            this.dialogShowMask(dialog);
            this.dialogLockScreen();
            dialog.show();
        },
        
        /**
         * 加载并执行插件
         * Load and execute the plugin
         * 
         * @param   {String}     name    plugin name / function name
         * @param   {String}     path    plugin load path
         * @returns {xfEditor}           返回xfEditor的实例对象
         */
        
        executePlugin : function(name, path) {
            
            var _this    = this;
            var cm       = this.cm;
            var settings = this.settings;
            
            // ★ v1.17.2: 统一插件调用方式，优先直接调用已注册的插件方法
            // 无论 AMD 或非 AMD 模式，只要 this[name] 是函数就直接调用
            if (typeof this[name] === "function") {
                try {
                    this[name](cm);
                } catch(e) {
                    xfEditor.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                    if (typeof console !== "undefined" && console.error) {
                        console.error("[xfEditor] Plugin error:", name, e);
                    }
                }
                return this;
            }
            
            // 插件未注册到实例上，尝试动态加载
            path = settings.pluginPath + path;
            
            // ★ v1.17.6: 确保 pluginPath 以 / 结尾，避免路径拼接错误
            if (!/\.js$/.test(path)) {
                path += ".js";
            }
            
            if (typeof xfEditor.loadFiles === "object" && $.inArray(path, xfEditor.loadFiles.plugin) < 0) {
                xfEditor.loadPlugin(path, function() {
                    if (typeof _this[name] !== "function") {
                        xfEditor.notify("插件加载失败：" + name + "，请检查插件路径", "error");
                        return;
                    }
                    xfEditor.loadPlugins[name] = _this[name];
                    try {
                        _this[name](cm);
                    } catch(e) {
                        xfEditor.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                        if (typeof console !== "undefined" && console.error) {
                            console.error("[xfEditor] Plugin error:", name, e);
                        }
                    }
                });
            }
            else if (typeof xfEditor.loadPlugins === "object" && typeof xfEditor.loadPlugins[name] === "function") {
                // 已经加载过的外部插件，直接调用
                try {
                    xfEditor.loadPlugins[name].call(this, cm);
                } catch(e) {
                    xfEditor.notify("插件执行错误：" + name + " - " + (e.message || "未知错误"), "error");
                    if (typeof console !== "undefined" && console.error) {
                        console.error("[xfEditor] Plugin error:", name, e);
                    }
                }
            }
            else {
                xfEditor.notify("插件未找到：" + name + "，请确认已加载此插件", "error");
            }
            
            return this;
        },
                
        /**
         * 搜索替换
         * Search & replace
         * 
         * @param   {String}     command    CodeMirror serach commands, "find, fintNext, fintPrev, clearSearch, replace, replaceAll"
         * @returns {xfEditor}              return this
         */
        
        search : function(command) {
            var settings = this.settings;
            
            if (!settings.searchReplace)
            {
                xfEditor.notify("请启用搜索替换功能：settings.searchReplace = true", "warning");
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
            $(".xf_editor-color-picker-panel").remove();
            $(document).off("mousedown.xf_editor-colorpicker");
            
            // 常用颜色：2行×4列，前7个为预设颜色，第8个为自定义选择器
            var commonColors = [
                "#000000", "#E74C3C", "#E67E22", "#F1C40F",
                "#2ECC71", "#3498DB", "#9B59B6"
            ];
            
            var typeLabel = (type === "color") ? "文字颜色" : "背景颜色";
            
            var panelHTML = [
                '<div class="xf_editor-color-picker-panel">',
                '<div class="xf_editor-color-picker-title">' + typeLabel + '</div>',
                '<div class="xf_editor-color-picker-grid">'
            ];
            
            for (var i = 0; i < commonColors.length; i++) {
                panelHTML.push(
                    '<div class="xf_editor-color-picker-swatch" ' +
                    'data-color="' + commonColors[i] + '" ' +
                    'style="background-color:' + commonColors[i] + '" ' +
                    'title="' + commonColors[i] + '"></div>'
                );
            }
            
            // 第8个为自定义颜色方块
            panelHTML.push(
                '<div class="xf_editor-color-picker-swatch xf_editor-color-picker-custom" title="自定义颜色">',
                '<div class="xf_editor-color-picker-plus-bg"></div>',
                '<span class="xf_editor-color-picker-plus">+</span>',
                '</div>'
            );
            
            panelHTML.push('</div>');
            
            // 隐藏的自定义颜色区域
            var lang = _this.settings.lang;
            panelHTML.push('<div class="xf_editor-color-picker-custom-area" style="display:none;">');
            panelHTML.push('<button type="button" class="xf_editor-color-picker-back">&larr; ' + (lang.buttons.close || "返回") + '</button>');
            panelHTML.push('<input type="color" class="xf_editor-color-picker-native" value="#ff0000" style="display:none;">');
            panelHTML.push('<div class="xf_editor-color-picker-hex-row">');
            panelHTML.push('<input type="text" class="xf_editor-color-picker-hex-input" maxlength="7" placeholder="#000000">');
            panelHTML.push('<button class="xf_editor-color-picker-confirm">' + (lang.buttons.confirm || "确认") + '</button>');
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
            this._colorPickerSelection = this.cm ? this.cm.getSelection() : "";
            this._colorPickerType = type;
            
            // 预设颜色块点击
            $panel.on("click", ".xf_editor-color-picker-swatch:not(.xf_editor-color-picker-custom)", function() {
                var color = $(this).data("color");
                _this.applyColor(color);
                $panel.remove();
                $(document).off("mousedown.xf_editor-colorpicker");
            });
            
            // 自定义颜色选择器点击
            $panel.on("click", ".xf_editor-color-picker-custom", function() {
                $panel.find(".xf_editor-color-picker-grid").hide();
                $panel.find(".xf_editor-color-picker-title").hide();
                $panel.find(".xf_editor-color-picker-custom-area").show();
                $panel.find(".xf_editor-color-picker-native").trigger("click");
            });
            
            // 返回按钮
            $panel.on("click", ".xf_editor-color-picker-back", function() {
                $panel.find(".xf_editor-color-picker-grid").show();
                $panel.find(".xf_editor-color-picker-title").show();
                $panel.find(".xf_editor-color-picker-custom-area").hide();
            });
            
            // 原生颜色选择器值变化
            $panel.on("input change", ".xf_editor-color-picker-native", function() {
                var val = $(this).val();
                $panel.find(".xf_editor-color-picker-hex-input").val(val);
            });
            
            // 16进制颜色值输入校验
            $panel.on("input", ".xf_editor-color-picker-hex-input", function() {
                var input = $(this);
                var val = input.val();
                if (val && val.charAt(0) !== "#") {
                    val = "#" + val;
                }
                val = val.replace(/[^#0-9a-fA-F]/g, "").substring(0, 7);
                input.val(val);
            });
            
            // 确认按钮
            $panel.on("click", ".xf_editor-color-picker-confirm", function() {
                var hexVal = $panel.find(".xf_editor-color-picker-hex-input").val();
                if (!hexVal) return;
                if (hexVal.charAt(0) !== "#") hexVal = "#" + hexVal;
                if (hexVal.length === 4 || hexVal.length === 7) {
                    _this.applyColor(hexVal);
                    $panel.remove();
                    $(document).off("mousedown.xf_editor-colorpicker");
                }
            });
            
            // 点击面板外部时关闭
            setTimeout(function() {
                $(document).on("mousedown.xf_editor-colorpicker", function(e) {
                    if (!$(e.target).closest(".xf_editor-color-picker-panel").length &&
                        !$(e.target).closest("." + _this.classPrefix + "menu > li > a").length) {
                        $panel.remove();
                        $(document).off("mousedown.xf_editor-colorpicker");
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
         * @returns {xfEditor} 返回xfEditor实例对象
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

            // 2. 解绑所有文档级事件（xfEditor 命名空间）
            $(document).off("click.xf_editor-table");
            $(document).off("mousemove.xf_editor-img mouseup.xf_editor-img");
            $(document).off("keydown.xfEditorDraft");
            $(document).off("mousedown.xf_editor-colorpicker");
            $(document).off("keyup.xf_editor-fs keyup.xf_editor-preview");

            // 3. 解绑所有窗口事件（使用命名空间批量清理）
            $(window).off("load.xf_editor-pageload");
            $(window).off(".xf_editor-echarts");  // 匹配所有子命名空间如 resize.xf_editor-echarts.xxx
            $(window).off("resize.xf_editor-echarts-md");
            $(window).off("resize.xfEditorDraft");
            $(window).off("scroll.xf_editor-autofixed");
            $(window).off("keydown.xf_editor-fkeys");
            $(window).off("resize.xf_editor-dialog");
            $(window).off(".xf_editor-auto");  // 匹配 xf_editor-auto 命名空间的元素级事件

            // 3b. 销毁所有 ECharts 实例并解绑其 resize 事件
            if (this.previewContainer) {
                this.previewContainer.find(".xf_editor-echarts").each(function() {
                    var $chart = $(this);
                    var instanceId = $chart.attr("_echarts_instance");
                    if (instanceId && typeof echarts !== "undefined") {
                        try { echarts.dispose(this); } catch(ex) {}
                    }
                });
            }

            // 解绑未命名空间的全局文档事件
            $(document).off("click.xf_editor-dropdown");
            $(document).off("click.tooltip keydown.tooltip");
            
            // 清理对话框拖拽残留（防止幽灵拖拽）
            if (document.onmousemove) {
                // 检查是否是 xfEditor 对话框的拖拽处理器
                try { document.onmousemove = null; } catch(ex) {}
            }
            try { document.onmouseup = null; } catch(ex) {}
            try { document.onselectstart = null; } catch(ex) {}
            
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

            // 6. 移除 xfEditor 相关的 DOM 元素
            editor.find("." + classPrefix + "preview-close-btn").remove();
            editor.find("." + classPrefix + "html-textarea").remove();
            editor.find("." + classPrefix + "preview").remove();
            editor.find("." + classPrefix + "container-mask").remove();
            editor.find("." + classPrefix + "mask").remove();
            editor.find("." + classPrefix + "toolbar").remove();

            // 恢复原始 textarea 的可见性
            this.markdownTextarea.show().removeAttr("style");

            // 7. 移除 xfEditor 相关的 CSS 类名
            editor.removeClass("xf_editor " + classPrefix + "vertical");
            if (settings.theme) {
                editor.removeClass(classPrefix + "theme-" + settings.theme);
            }

            // 8. 重置编辑器状态
            this.state.watching    = false;
            this.state.loaded      = false;
            this.state.preview     = false;
            this.state.fullscreen  = false;

            // 9. 清理所有悬浮提示 popup 元素及其 Blob URL
            $("body").children(".xf_editor-tooltip-popup").each(function() {
                var $popup = $(this);
                var blobUrl = $popup.attr("data-blob-url");
                if (blobUrl) {
                    try { (window.URL || window.webkitURL).revokeObjectURL(blobUrl); } catch(ex) {}
                }
                $popup.remove();
            });

            // 10. 清除引用以辅助垃圾回收
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
         * @returns {xfEditor}                返回 xfEditor 实例对象
         * 
         * 使用示例：
         *   editor.setLang("en");                    // 切换到内置英文
         *   editor.setLang({name: "fr", toolbar: {...}, ...});  // 使用自定义语言包
         */
        setLang : function(langObj, recreateToolbar) {
            var settings = this.settings;
            
            // 如果传入字符串（语言名称），则尝试从 xfEditor.langs 获取
            if (typeof langObj === "string") {
                var langName = langObj;
                if (xfEditor.langs && xfEditor.langs[langName]) {
                    langObj = xfEditor.langs[langName];
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
    xfEditor.fn.init.prototype = xfEditor.fn; 
   
    /**
     * 锁屏
     * lock screen when dialog opening
     * 
     * @returns {void}
     */

    xfEditor.dialogLockScreen = function() {
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
    
    xfEditor.dialogShowMask = function(dialog) {
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

    xfEditor.toolbarHandlers = {
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

            cm.replaceSelection(xfEditor.firstUpperCase(selection));
            cm.setSelections(selections);
        },
        
        ucwords : function() {
            var cm         = this.cm;
            var selection  = cm.getSelection();
            var selections = cm.listSelections();

            cm.replaceSelection(xfEditor.wordsFirstUpperCase(selection));
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
                xfEditor.notify("请启用 TeX 公式支持：settings.tex = true", "warning");
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
                xfEditor.notify("请启用分页符功能：settings.pageBreak = true", "warning");
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
            var datefmt   = xfEditor.dateFormat() + " " + xfEditor.dateFormat((langName === "zh-cn" || langName === "zh-tw") ? "cn-week-day" : "week-day");

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
                cm.replaceSelection("⁑居中对齐内容⁑");
                cm.setCursor(cursor.line, cursor.ch + 2);
            } else {
                cm.replaceSelection("⁑" + selection + "⁑");
            }
        },

        "align-right" : function() {
            var cm        = this.cm;
            var cursor    = cm.getCursor();
            var selection = cm.getSelection();

            if (selection === "") {
                cm.replaceSelection("⠪右对齐内容⠪");
                cm.setCursor(cursor.line, cursor.ch + 2);
            } else {
                cm.replaceSelection("⠪" + selection + "⠪");
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

        "echarts-tree" : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n```echarts\n{\n  \"type\": \"tree\",\n  \"height\": 550,\n  \"title\": {\"text\": \"组织架构与能力图谱\", \"subtext\": \"点击节点圆圈可折叠/展开\", \"left\": \"center\", \"top\": 10},\n  \"tooltip\": {\"trigger\": \"item\", \"triggerOn\": \"mousemove\"},\n  \"series\": [{\n    \"type\": \"tree\",\n    \"data\": [{\n      \"name\": \"🚀 智能中枢\",\n      \"symbolSize\": 18,\n      \"children\": [{\n        \"name\": \"📊 数据分析\",\n        \"itemStyle\": {\"color\": \"#4fc3f7\"},\n        \"children\": [\n          {\"name\": \"实时看板\", \"value\": 95},\n          {\"name\": \"异常检测\", \"value\": 88},\n          {\"name\": \"趋势预测\", \"value\": 76},\n          {\"name\": \"用户画像\", \"value\": 82}\n        ]\n      }, {\n        \"name\": \"🤖 AI 引擎\",\n        \"itemStyle\": {\"color\": \"#81c784\"},\n        \"children\": [\n          {\"name\": \"自然语言处理(NLP)\", \"value\": 92},\n          {\"name\": \"计算机视觉(CV)\", \"value\": 85},\n          {\"name\": \"强化学习\", \"value\": 70},\n          {\"name\": \"大语言模型\", \"value\": 96}\n        ]\n      }, {\n        \"name\": \"⚙️ 基础设施\",\n        \"itemStyle\": {\"color\": \"#ffb74d\"},\n        \"children\": [\n          {\"name\": \"云原生架构\", \"value\": 90},\n          {\"name\": \"边缘计算\", \"value\": 78},\n          {\"name\": \"安全合规\", \"value\": 82},\n          {\"name\": \"自动化运维\", \"value\": 74}\n        ]\n      }, {\n        \"name\": \"🎨 产品设计\",\n        \"itemStyle\": {\"color\": \"#f06292\"},\n        \"children\": [\n          {\"name\": \"用户体验\", \"value\": 88},\n          {\"name\": \"交互设计\", \"value\": 85},\n          {\"name\": \"视觉设计\", \"value\": 91},\n          {\"name\": \"设计系统\", \"value\": 80}\n        ]\n      }]\n    }],\n    \"layout\": \"orthogonal\",\n    \"orient\": \"LR\",\n    \"roam\": true,\n    \"expandAndCollapse\": true,\n    \"initialTreeDepth\": 2,\n    \"nodeScale\": 1.2,\n    \"top\": \"5%\",\n    \"left\": \"3%\",\n    \"bottom\": \"3%\",\n    \"right\": \"8%\",\n    \"symbol\": \"circle\",\n    \"symbolSize\": 14,\n    \"lineStyle\": {\"width\": 2, \"curveness\": 0.3},\n    \"edgeShape\": \"curve\",\n    \"label\": {\n      \"position\": \"left\",\n      \"verticalAlign\": \"middle\",\n      \"align\": \"right\",\n      \"fontSize\": 12\n    },\n    \"leaves\": {\n      \"label\": {\"position\": \"right\", \"verticalAlign\": \"middle\", \"align\": \"left\", \"fontSize\": 11},\n      \"symbolSize\": 8\n    },\n    \"emphasis\": {\n      \"focus\": \"descendant\",\n      \"lineStyle\": {\"width\": 3},\n      \"itemStyle\": {\"shadowBlur\": 20, \"shadowColor\": \"rgba(74,108,247,0.6)\", \"borderWidth\": 2},\n      \"label\": {\"fontWeight\": 700, \"fontSize\": 14}\n    },\n    \"nodePadding\": 25,\n    \"nodeGap\": 15,\n    \"animationDuration\": 800,\n    \"animationDurationUpdate\": 600\n  }]\n}\n```\n");
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

        grid : function() {
            var cm = this.cm;
            var cursor = cm.getCursor();
            cm.replaceSelection("\n[[row]]\n[[col:3]]\n栅格内容（30%宽度）\n[[/col]]\n[[col:7]]\n栅格内容（70%宽度）\n[[/col]]\n[[/row]]\n");
            cm.setCursor(cursor.line + 2, 0);
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

            if (!xfEditor.kaTeXLoaded) {
                if (settings.autoLoadModules) {
                    xfEditor.loadKaTeX(settings.path, function() {
                        if (typeof katex !== "undefined") {
                            xfEditor.$katex = katex;
                            xfEditor.kaTeXLoaded = true;
                        }
                        // 递归调用自己，此时 KaTeX 已就绪
                        xfEditor.toolbarHandlers.formula.call(_this);
                    });
                }
                return;
            }

            // 公式分类和示例（涵盖各种复杂场景）
            var katexAvail = (typeof xfEditor.$katex !== "undefined" && xfEditor.$katex !== null);
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
            var $dialog = xfEditor.createDialog.call(_this, {
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
                            xfEditor.$katex.render(latexText, $el[0], { throwOnError: false, displayMode: isBlock });
                        } catch(e) {
                            if (window.console) console.error("[xfEditor] KaTeX render error:", e);
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
                    xfEditor.lockScreen(false);
                    _this.mask.hide();
                }
            });

            // 自定义公式插入
            function insertCustom() {
                var customLatex = $customInput.val().trim();
                if (!customLatex) { xfEditor.notify("请输入 LaTeX 公式", "warning"); return; }
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
                    xfEditor.lockScreen(false);
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

    xfEditor.keyMaps = {
        "Ctrl-1"       : "h1",
        "Ctrl-2"       : "h2",
        "Ctrl-3"       : "h3",
        "Ctrl-4"       : "h4",
        "Ctrl-5"       : "h5",
        "Ctrl-6"       : "h6",
        "Ctrl-B"       : "bold",  // 如果值为字符串，则对应 xfEditor.toolbarHandlers 中的方法
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
                xfEditor.notify("请启用 @链接功能：settings.atLink = true", "warning");
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
    
    xfEditor.trim = trim;
    
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
    
    xfEditor.ucwords = xfEditor.wordsFirstUpperCase = ucwords;
    
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
    
    xfEditor.firstUpperCase = xfEditor.ucfirst = firstUpperCase;
    
    xfEditor.urls = {
        atLinkBase : "https://github.com/"
    };
    
    xfEditor.regexs = {
        atLink        : /@([\w\-]+)/g,
        email         : /([\w\.\+\-]+)@([\w\-]+)\.([\w\-]{2,})\.?(\w+)?/g,
        emailLink     : /(mailto:)?([\w\.\+\-]+)@([\w\-]+)\.([\w\-]{2,})\.?(\w+)?/g,

        pageBreak     : /^\[[=]{8,}\]$/,
        // ★ v1.17.7: 支持 {text|pinyin}(!width:NNN) 可选的组级宽度参数
        pinyin        : /\{([^|{}]+)\s*\|\s*([^|{}]+)\}(?:\s*\(!width:(\d+)\))?/g,
        unicodeAlignCenter : /⁑([\s\S]*?)⁑/g,
        unicodeAlignLeft   : /⁑⁖([\s\S]*?)⁖⁑/g,
        unicodeAlignRight  : /⠪([\s\S]*?)⠪/g,
        imageSizeNew    : /!\[([^\]]*)\]\(([^)]+)\)<(\d+),\s*(\d+)>/g,
        // ★ [DEPRECATED v1.17.13] 以下 tabs/tabItem/columns 正则已被内联 findBalancedBlocks 替代，
        //   保留仅用于向后兼容（外部代码可能引用 xfEditor.regexs.tabs 等）。
        tabs            : /\[\[tabs\]\]([\s\S]*?)\[\[\/tabs\]\]/g,
        tabItem       : /\[\[tab:([^\]]+)\]\]([\s\S]*?)\[\[\/tab\]\]/g,
        columns       : /\[\[columns:(\d+)\]\]([\s\S]*?)\[\[\/columns\]\]/g,
        copybookTian   : /\[\[copybookTian\]\]/g,
        copybookMi     : /\[\[copybookMi\]\]/g,
        copybookPinyin : /\[\[copybookPinyin\]\]/g,
        copybookTianEnd   : /\[\[\/copybookTian\]\]/g,
        copybookMiEnd     : /\[\[\/copybookMi\]\]/g,
        copybookPinyinEnd : /\[\[\/copybookPinyin\]\]/g,
        // ★ [DEPRECATED v1.17.13] videoBlock/fileBlock 正则已被内联 findBalancedBlocks 替代
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
    var TEX_CARET_PLACEHOLDER  = "EDITORMDCARETPLACEHOLDER9E4B";

    xfEditor.protectTeXSyntax = function(markdown) {
        if (!markdown) return markdown;

        // Protect $$...$$ blocks first (handles inner $ not being double-matched)
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, function(match, tex) {
            return "$$" + tex.replace(/\\/g, TEX_BSLASH_PLACEHOLDER)
                              .replace(/\^/g, TEX_CARET_PLACEHOLDER) + "$$";
        });

        // Protect remaining $...$ inline formulas
        // 只匹配包含 TeX 命令（以反斜杠开头）或 TeX 特殊字符（^、_、{、}等）的内容
        // 避免误匹配货币符号（如 $5.00 或 Cost: $100）
        // ★ v1.17.13: 增加数字起始检测，$100 后不跟 LaTeX 标记直接跳过
        markdown = markdown.replace(/\$(?=[^$\n\r]{1,200}\$)([^$\n\r]+?)\$/g, function(match, tex) {
            // 货币检测：如果内容以数字开头且不包含 LaTeX 命令，视为货币跳过
            if (/^\d/.test(tex) && !/[\\{}_^]/.test(tex)) {
                return match;
            }
            // 只有当内容包含 LaTeX 特征时才保护（反斜杠命令、花括号、下划线、上标等）
            if (/[\\{}_^]/.test(tex)) {
                return "$" + tex.replace(/\\/g, TEX_BSLASH_PLACEHOLDER)
                                .replace(/\^/g, TEX_CARET_PLACEHOLDER) + "$";
            }
            return match;
        });

        return markdown;
    };

    xfEditor.restoreTeXSyntax = function(html) {
        if (!html) return html;
        // ★ v1.17.9-FIX: 先还原 ^，再还原 \，确保 \^ 等组合字符正确还原
        return html.split(TEX_CARET_PLACEHOLDER).join("^")
                   .split(TEX_BSLASH_PLACEHOLDER).join("\\");
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
    xfEditor.fixSmartypantsHTML = function(html) {
        if (!html) return html;
        return html.replace(/<[^>]+>/g, function(tag) {
            return tag.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
        });
    };

    /**
     * 修复 marked.js v0.3.3 表格解析中"最后一行最后一列为空时丢失单元格"的 Bug
     * Fix marked.js v0.3.3 table bug: empty last cell in last row is dropped
     *
     * marked.js v0.3.3 中 pipe-table 的 cell 解析使用 greedy replace+split，
     * 当最后一行最后一列为空（如 "| 图片上传 |  |"）时，贪婪的正则会吞掉
     * 前一个单元格到管道符之间的全部内容，导致该行少一列。
     *
     * 本函数作为后处理：以 <thead> 的列数为基准，对 <tbody> 中列数不足的行自动补齐空 <td>。
     *
     * @param {string} html  marked.js 渲染后的 HTML 字符串
     * @returns {string}     修复后的 HTML 字符串
     */
    xfEditor.fixTableEmptyCells = function(html) {
        if (!html || html.indexOf("<table") === -1) return html;
        
        return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, function(tableMatch) {
            // 提取 thead 的行（所有 th 行）
            var theadMatch = tableMatch.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
            var headerColCount = 0;
            if (theadMatch) {
                var thCount = (theadMatch[1].match(/<th[\s>]/gi) || []).length;
                headerColCount = thCount;
            }
            if (headerColCount === 0) return tableMatch;
            
            // 修复 tbody 中每行的列数
            var fixed = tableMatch.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, function(trMatch, trContent) {
                // 跳过 <thead> 内的行（它们已经是正确的）
                if (trMatch.indexOf("<th") !== -1) return trMatch;
                
                // 计算当前行的 <td 数量
                var tdCount = (trContent.match(/<td[\s>]/gi) || []).length;
                if (tdCount >= headerColCount) return trMatch;
                
                // 补齐缺失的 <td></td>
                var missing = headerColCount - tdCount;
                var padding = "";
                for (var p = 0; p < missing; p++) {
                    padding += "<td></td>\n";
                }
                return trMatch.replace(/<\/tr>/i, padding + "</tr>");
            });
            
            return fixed;
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
    xfEditor.postProcessTaskLists = function(html) {
        if (!html) return html;
        
        // ★ v1.17.13: 如果 HTML 中已有 task-list-item-checkbox（listitem renderer 已处理），
        //   跳过后处理以避免重复渲染。
        if (html.indexOf('task-list-item-checkbox') !== -1) return html;

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
     * ★ v1.17.1: 为预览区 HTML 注入 data-sign 块签名，用于同步滚动行号映射
     * 
     * 参照 cherry-markdown 的设计思路，为每个块级元素添加 data-sign 属性，
     * 使编辑区行号和预览区块之间可以相互映射，从而实现精准的同步滚动。
     *
     * 支持的块级元素：h1-h6, p, pre, blockquote, ul, ol, table,
     *                  div.xf_editor-row, div.xf_editor-columns, div.xf_editor-tabs
     *
     * @param {string}  html       已渲染的 HTML 字符串
     * @param {number}  totalLines 编辑器总行数 (/n 分隔)
     * @returns {string} 带有 data-sign 属性的 HTML
     */
    xfEditor.addBlockSignatures = function(html, totalLines) {
        if (!html || totalLines < 1) return html;
        
        var blockIdx = 0;
        
        // ★ v1.17.2: 增强块签名注入，覆盖更多块级元素
        // 支持的标签：h1-h6, p, pre, blockquote, ul, ol, table, dl, hr, 
        //              div.xf_editor-*, section, article, header, footer, nav, main, aside
        //              li (list items for finer granularity)
        var result = html.replace(/<(h[1-6]|p|pre|blockquote|ul|ol|table|dl|hr|section|article|header|footer|nav|main|aside|li|div\s+[^>]*class="[^"]*xf_editor-[^"]*")[^>]*>/gi, function(tagMatch) {
            // 跳过自闭合标签、已包含 data-sign 的标签、以及非块级上下文中的标签
            if (/\/>$/.test(tagMatch) || /data-sign\s*=/.test(tagMatch)) {
                return tagMatch;
            }
            
            blockIdx++;
            // 在标签结束 > 前插入 data-sign 属性
            var insertPos = tagMatch.length - 1;
            return tagMatch.substring(0, insertPos) + ' data-sign="block-' + blockIdx + '"' + tagMatch.substring(insertPos);
        });
        
        // 存储块总数用于后续比例计算
        result = result.replace(/<div class="markdown-body[^"]*"[^>]*>/, function(match) {
            if (/data-sign-count=/.test(match)) return match;
            return match.replace('>', ' data-sign-count="' + blockIdx + '">');
        });
        
        return result;
    };

    /**
     * ★ v1.17.2: 预处理链接 target 语法
     * 将 [text](url){target=_blank} 转换为 [text](url "target=_blank")
     * 使 marked.js 能够将 target 信息传入 link renderer 的 title 参数
     * 
     * @param {string} markdown 
     * @returns {string}
     */
    xfEditor.preprocessLinkTarget = function(markdown) {
        if (!markdown || typeof markdown !== "string") return markdown || "";
        
        // ★ v1.17.6-FIX1: 先保护代码块，防止代码块内的 [text](url){target=_blank} 被误转换
        // 因为 preprocessLinkTarget 在 protectCodeBlocks 之前运行，必须自行保护代码区域
        var codePlaceholders = [];
        var cid = 0;
        
        // 1) 保护围栏代码块（```...``` 或 ~~~...~~~），要求行首开始
        //    使用 \2 反向引用确保开闭围栏类型相同
        markdown = markdown.replace(
            /(^|\n)((`{3,}|~{3,}))[^\n]*\n([\s\S]*?)\n\2(?=\s*(?:\n|$))/g,
            function(match) {
                var id = "xf_editor-ltp-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "\n<!--" + id + "-->\n";
            }
        );
        
        // 2) 保护行内代码（支持单反引号和多反引号，不跨行）
        // ★ v1.17.13: 增加多反引号行内代码保护，避免 ``[text](url){target=blank}`` 被误处理
        // 先处理多反引号（2+ 个反引号），再处理单反引号
        markdown = markdown.replace(/(`{2,})([\s\S]*?)\1/g, function(match, fence, content) {
            // 行内代码不能包含换行符；跨行的是围栏代码块（已在步骤1处理）
            if (content.indexOf('\n') !== -1) return match;
            var id = "xf_editor-ltp-" + (++cid);
            codePlaceholders.push({ id: id, html: match });
            return "<!--" + id + "-->";
        });
        markdown = markdown.replace(/`([^`\n]+)`/g, function(match) {
            var id = "xf_editor-ltp-" + (++cid);
            codePlaceholders.push({ id: id, html: match });
            return "<!--" + id + "-->";
        });
        
        // 3) 处理链接 target 语法 [text](url){target=value}
        //    ★ 使用捕获组检查前一个字符，排除图片语法 ![alt](url){target=...}
        //    ES5 兼容：不使用 (?<!!) 负向后瞻（ES2018+），改用捕获组 + 回调检查
        //    使用非贪婪匹配 + 边界检测，避免跨行误匹配
        markdown = markdown.replace(
            /(^|[^!])\[([^\]]*?)\]\(([^)\n]*?)\)\{target=([^}\n]+)\}/gi,
            function(match, before, text, url, target) {
                // 将 target 放入 title 位置（标准 Markdown 语法）
                return before + "[" + text + "](" + url.trim() + " \"target=" + target.trim() + "\")";
            }
        );
        
        // 4) 恢复代码块
        for (var i = 0; i < codePlaceholders.length; i++) {
            var cp = codePlaceholders[i];
            if (cp && cp.id) {
                markdown = markdown.split("<!--" + cp.id + "-->").join(cp.html || "");
            }
        }
        
        return markdown;
    };

    /**
     * Preprocess markdown to extract custom block-level syntax (tabs, columns, align)
     * before passing to marked. This prevents conflicts with fenced code blocks.
     */
    xfEditor.preprocessMarkdownBlocks = function(markdown, options) {
        if (!markdown || typeof markdown !== "string") {
            return { markdown: markdown || "", placeholders: [] };
        }
        
        // ★ v1.17.6: 安全防护 — 确保 $marked 可用
        if (typeof xfEditor.$marked !== "function") {
            if (typeof console !== "undefined" && console.warn) {
                console.warn("[xfEditor] xfEditor.$marked is not available — markdown parsing will be skipped");
            }
            return { markdown: markdown, placeholders: [] };
        }
        
        var placeholders = [];
        var placeholderId = 0;

        function addPlaceholder(html) {
            var id = "xf_editor-ph-" + (++placeholderId);
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
                textAlign: opts.textAlign,
                imageResize: opts.imageResize,
                echarts: opts.echarts,
                tabs: disableBlocks ? false : opts.tabs,
                columns: disableBlocks ? false : opts.columns,
                grid: disableBlocks ? false : opts.grid,
                pageBlock: disableBlocks ? false : opts.pageBlock,
                video: disableBlocks ? false : opts.video,
                file: disableBlocks ? false : opts.file,
                tooltip: opts.tooltip,
                copybook: opts.copybook
            };
            return {
                renderer: xfEditor.markedRenderer([], ro),
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
            // ★ v1.17.5-FIX3: 围栏必须位于行首（CommonMark 规范要求）
            // 之前缺少行首锚点，导致文本中 "```(hidden.class#id) ` 语法" 这类
            // 作为示例展示的围栏语法被误识别为真正的代码块，吞噬后续大段内容
            // 新正则添加 (^|\n) 前缀，确保围栏开标签和闭标签都必须在行首
            text = text.replace(/(^|\n)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n(`{3,}|~{3,})(?=\s*(?:\n|$))/g, function(match, prefix, openFence, lang, content, closeFence) {
                // 闭合围栏必须与开启围栏类型相同，且数量 >= 开启围栏数量
                if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) {
                    return match; // 不是有效的闭合围栏，保持原样
                }
                var id = "xf_editor-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return prefix + "<!--" + id + "-->";
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
                var id = "xf_editor-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "<!--" + id + "-->";
            });
            // 单反引号行内代码：`code`（不能跨行，不能包含 `）
            text = text.replace(/`([^`\n]+)`/g, function(match, content) {
                var id = "xf_editor-cb-" + (++cid);
                codePlaceholders.push({ id: id, html: match });
                return "<!--" + id + "-->";
            });

            return { text: text, placeholders: codePlaceholders };
        }

        function restoreCodeBlocks(text, codePlaceholders) {
            if (!codePlaceholders || codePlaceholders.length === 0) return text;
            for (var i = 0; i < codePlaceholders.length; i++) {
                var cp = codePlaceholders[i];
                if (cp && cp.id) {
                    text = text.split("<!--" + cp.id + "-->").join(cp.html || "");
                }
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

            var openRe = new RegExp(openRegex.source, openRegex.flags.replace('g', '') + 'g');
            var closeRe = new RegExp(closeRegex.source, closeRegex.flags.replace('g', '') + 'g');

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

            // ★ v1.17.6: 安全限制 — 最大处理块数量，防止病态输入导致浏览器卡死
            var maxBlocks = 500;
            var maxTotalIterations = 50000;
            var _totalIterations = 0;
            
            while (i < text.length) {
                if (blocks.length >= maxBlocks) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Maximum blocks limit (" + maxBlocks + ") reached, stopping block search");
                    }
                    break;
                }
                if (_totalIterations++ > maxTotalIterations) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Maximum iteration limit reached, stopping block search");
                    }
                    break;
                }
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
                markdown = markdown.replace(xfEditor.regexs.imageSizeNew, function(match, alt, url, w, h) {
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
                    var safeUrl = xfEditor.escapeAttr(url);
                    
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
            var id = "xf_editor-esc-" + (++escId);
            escapePlaceholders.push({ id: id, html: match.substring(1) }); // 去掉反斜杠
            return "<!--" + id + "-->";
        });

        // ========== ★ v1.17.9-FIX: 脚注处理移到最前（tabs/columns/grid 之前）==========
        // 根因：脚注在 tabs/columns/row 之后处理时，每次递归调用 preprocessMarkdownBlocks
        // 都将 footnoteIndex 重置为 0，导致多个 tab 中产生编号重复的 [1] 脚注。
        // 修复：在块级语法处理之前，从原始 markdown 一次性处理所有脚注，全局唯一编号。
        // 同时构建共享映射供字帖系统使用。
        //
        // ★ v1.17.9-FIX4: _wasRootFootnotesCall 确保脚注列表只在最外层调用中添加
        // 防止递归 preprocessMarkdownBlocks（tabs/columns 内）把脚注列表插入到嵌套内容末尾
        var _wasRootFootnotesCall = false;
        if (!options._footnotesProcessed) {
            _wasRootFootnotesCall = true;
            // Step 1: 从原始 markdown 构建脚注定义映射（共享给字帖系统）
            var _sharedFootnoteMap = {};
            var _sharedFootnoteOrder = [];
            var _sharedDefMatches = [];
            
            try {
                var _sharedFnDefRegex = xfEditor.regexs.footnoteDefAnchor;
                _sharedFnDefRegex.lastIndex = 0;
                var _sfnMatch;
                while ((_sfnMatch = _sharedFnDefRegex.exec(markdown)) !== null) {
                    var _sfnName = _sfnMatch[1].trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
                    if (_sfnName && _sfnName.length <= 50) {
                        _sharedDefMatches.push({
                            name: _sfnName,
                            start: _sfnMatch.index,
                            anchorEnd: _sfnMatch.index + _sfnMatch[0].length
                        });
                    }
                }
                
                // Step 2: 计算每个定义的内容范围
                for (var _sdi = 0; _sdi < _sharedDefMatches.length; _sdi++) {
                    var _sdm = _sharedDefMatches[_sdi];
                    var _scontentStart = _sdm.anchorEnd;
                    var _safterAnchor = markdown.substring(_scontentStart);
                    var _sleadingWs = _safterAnchor.match(/^[ \t]*\n?/);
                    if (_sleadingWs) _scontentStart += _sleadingWs[0].length;
                    
                    var _scontentEnd;
                    var _sblankLineIdx = markdown.indexOf('\n\n', _scontentStart);
                    var _snextDefIdx = (_sdi + 1 < _sharedDefMatches.length) ? _sharedDefMatches[_sdi + 1].start : -1;
                    
                    if (_sblankLineIdx !== -1) {
                        _scontentEnd = _sblankLineIdx;
                    } else {
                        _scontentEnd = markdown.length;
                    }
                    if (_snextDefIdx !== -1 && _snextDefIdx < _scontentEnd) _scontentEnd = _snextDefIdx;
                    if (_scontentEnd > markdown.length) _scontentEnd = markdown.length;
                    if (_scontentEnd < _scontentStart) _scontentEnd = _scontentStart;
                    
                    _sdm.contentEnd = _scontentEnd;
                    _sdm.content = markdown.substring(_scontentStart, _scontentEnd).trim();
                }
                
                // Step 3: 构建脚注索引映射
                var _sharedFnIndex = 0;
                for (var _sdi = 0; _sdi < _sharedDefMatches.length; _sdi++) {
                    var _sdm = _sharedDefMatches[_sdi];
                    if (!_sharedFootnoteMap[_sdm.name]) {
                        _sharedFnIndex++;
                        _sharedFootnoteMap[_sdm.name] = {
                            index: _sharedFnIndex,
                            content: _sdm.content,
                            name: _sdm.name
                        };
                        _sharedFootnoteOrder.push(_sdm.name);
                    }
                }
                
                // Step 4: 从后往前移除脚注定义区域
                for (var _sdi = _sharedDefMatches.length - 1; _sdi >= 0; _sdi--) {
                    var _sdm = _sharedDefMatches[_sdi];
                    markdown = markdown.substring(0, _sdm.start) + markdown.substring(_sdm.contentEnd);
                }
                
                // ★ v1.17.9-FIX2: Step 5 之前计算字帖块范围，替换时跳过字帖内的 [^name]
                // 字帖内部有独立的 parseCharsWithFN 解析 [^name]，需要保留原始语法
                var _copybookRanges = [];
                var _copybookTypes = [
                    { open: 'copybookTian', close: 'copybookTianEnd' },
                    { open: 'copybookMi', close: 'copybookMiEnd' },
                    { open: 'copybookPinyin', close: 'copybookPinyinEnd' }
                ];
                for (var _cbt = 0; _cbt < _copybookTypes.length; _cbt++) {
                    var _cbOpen = xfEditor.regexs[_copybookTypes[_cbt].open];
                    var _cbClose = xfEditor.regexs[_copybookTypes[_cbt].close];
                    if (_cbOpen && _cbClose) {
                        var _cbBlocks = findBalancedBlocks(markdown, _cbOpen, _cbClose);
                        for (var _cbi = 0; _cbi < _cbBlocks.length; _cbi++) {
                            _copybookRanges.push({ start: _cbBlocks[_cbi].start, end: _cbBlocks[_cbi].end });
                        }
                    }
                }
                
                // Step 5: 替换 [^name] 引用为 HTML（全局唯一编号），跳过字帖内的引用
                if (_sharedFootnoteOrder.length > 0) {
                    xfEditor.regexs.footnoteRef.lastIndex = 0;
                    markdown = markdown.replace(xfEditor.regexs.footnoteRef, function(match, name, offset) {
                        // 跳过字帖块内部的 [^name]（由 copybook 系统自行解析）
                        for (var _cri = 0; _cri < _copybookRanges.length; _cri++) {
                            if (offset + match.length > _copybookRanges[_cri].start && offset < _copybookRanges[_cri].end) {
                                return match;
                            }
                        }
                        if (!name || name.length > 50) return match;
                        var cleanName = name.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
                        if (!cleanName || !_sharedFootnoteMap[cleanName]) return match;
                        var fn = _sharedFootnoteMap[cleanName];
                        return '<sup class="xf_editor-footnote-ref-wrapper"><a href="#xf_editor-fn-' + fn.index + '" id="xf_editor-fnref-' + fn.index + '">[' + fn.index + ']</a></sup>';
                    });
                }
            } catch(e) {
                if (typeof console !== "undefined" && console.warn) {
                    console.warn("[xfEditor] Footnote processing error:", e);
                }
            }
            
            // 标记已处理，存储映射供后续使用
            options._footnotesProcessed = true;
            options._sharedFootnoteMap = _sharedFootnoteMap;
            options._sharedFootnoteOrder = _sharedFootnoteOrder;
            options._sharedDefMatches = _sharedDefMatches;
        }
        
        // ★ v1.17.9-FIX5: tab-context-aware tabs 块扫描器
        // 解决表格单元格中文本 [[tabs]]/[[row]][[col]] 被 hasMatchingPair 误判为
        // 真实标签导致 findBalancedBlocks 返回错误块的问题。
        // 核心思路：扫描时同时追踪 [[tab:xxx]]/[[/tab]] 上下文深度，
        // 处于 tabContextDepth > 0 中的 [[tabs]] 属于 tab 内容文本，予以忽略。
        function findTabsBlocksAware(text) {
            var blocks = [];
            var allTokens = [];
            var patterns = [
                { re: /\[\[tabs\]\]/g,             type: 'tabsOpen' },
                { re: /\[\[\/tabs\]\]/g,           type: 'tabsClose' },
                { re: /\[\[tab:([^\]]+)\]\]/g,     type: 'tabOpen' },
                { re: /\[\[\/tab\]\]/g,            type: 'tabClose' }
            ];
            for (var pi = 0; pi < patterns.length; pi++) {
                var pr = patterns[pi];
                pr.re.lastIndex = 0;
                var m;
                while ((m = pr.re.exec(text)) !== null) {
                    allTokens.push({ idx: m.index, len: m[0].length, type: pr.type, title: m[1] || '' });
                }
            }
            allTokens.sort(function(a, b) { return a.idx - b.idx; });

            var tabsDepth = 0;
            var tabContextDepth = 0;
            var currentStart = -1;
            var currentContentStart = -1;
            var safetyLimit = 5000;
            for (var ti = 0; ti < allTokens.length && ti < safetyLimit; ti++) {
                var t = allTokens[ti];
                switch (t.type) {
                    case 'tabsOpen':
                        if (tabContextDepth === 0) {
                            if (tabsDepth === 0) {
                                currentStart = t.idx;
                                currentContentStart = t.idx + t.len;
                            }
                            tabsDepth++;
                        }
                        break;
                    case 'tabsClose':
                        if (tabContextDepth === 0) {
                            tabsDepth--;
                            if (tabsDepth === 0 && currentStart >= 0) {
                                blocks.push({
                                    start: currentStart,
                                    end: t.idx + t.len,
                                    content: text.substring(currentContentStart, t.idx),
                                    fullMatch: text.substring(currentStart, t.idx + t.len)
                                });
                                currentStart = -1;
                            }
                        }
                        break;
                    case 'tabOpen':
                        tabContextDepth++;
                        break;
                    case 'tabClose':
                        if (tabContextDepth > 0) tabContextDepth--;
                        break;
                }
            }
            return blocks;
        }

        // 处理标签页语法：[[tabs]]...[[/tabs]]（支持嵌套）
        // 注意：必须逆序处理（从后往前），否则前面的 block 被替换后，
        // 后续 block 的位置（基于原始文本）会错误地偏移
        if (options.tabs !== false) {
            // ★ v1.17.9-FIX5: 使用 tab-context-aware 扫描器替换 findBalancedBlocks
            // 防止表格内文本 [[tabs]] 干扰真实 tabs 块的匹配
            var tabBlocks = findTabsBlocksAware(markdown);
            for (var bi = tabBlocks.length - 1; bi >= 0; bi--) {
                var block = tabBlocks[bi];
                
                // 边界检查：确保块数据有效
                if (!block || !block.content) continue;
                
                var content = block.content;
                var originalEnd = block.end;
                var tabHtml = '<div class="xf_editor-tabs">';
                var tabHeaders = '<ul class="xf_editor-tab-nav">';
                var tabBodies = '<div class="xf_editor-tab-body">';
                var tabIndex = 0;
                var hasTabs = false;
                var tabMarkedOptions = createMarkedOptions(options, true);

                // ★ v1.17.9-FIX5: 提取嵌套 tab 项（tab-context-aware 版本）
                // 两步走：
                // 1. 扫描找到顶层 [[tab:xxx]] 项
                // 2. 对每个 tab 项的内容，使用 findTabsBlocksAware 仅查找实数内嵌 [[tabs]] 块
                //    此扫描器理解 [[tab:xxx]]/[[/tab]] 上下文，会自动忽略表格中出现的文本 [[tabs]]
                function extractTabItems(content) {
                    // Step A: 查找顶层 [[tab:xxx]]...[[/tab]] 项（深度追踪）
                    var topLevelTabs = [];
                    var allTokens = [];
                    var tabOpenRe = /\[\[tab:([^\]]+)\]\]/g;
                    var tabCloseRe = /\[\[\/tab\]\]/g;
                    var tabsOpenRe = /\[\[tabs\]\]/g;
                    var tabsCloseRe = /\[\[\/tabs\]\]/g;
                    var match;
                    tabOpenRe.lastIndex = 0;
                    while ((match = tabOpenRe.exec(content)) !== null) allTokens.push({ idx: match.index, type: 'tabO', title: match[1], len: match[0].length });
                    tabCloseRe.lastIndex = 0;
                    while ((match = tabCloseRe.exec(content)) !== null) allTokens.push({ idx: match.index, type: 'tabC', len: match[0].length });
                    tabsOpenRe.lastIndex = 0;
                    while ((match = tabsOpenRe.exec(content)) !== null) allTokens.push({ idx: match.index, type: 'tabsO', len: match[0].length });
                    tabsCloseRe.lastIndex = 0;
                    while ((match = tabsCloseRe.exec(content)) !== null) allTokens.push({ idx: match.index, type: 'tabsC', len: match[0].length });
                    allTokens.sort(function(a, b) { return a.idx - b.idx; });

                    var tabDepth = 0;
                    var currentTop = null;
                    var safety = 3000;
                    for (var ti = 0; ti < allTokens.length && ti < safety; ti++) {
                        var t = allTokens[ti];
                        if (t.type === 'tabO') {
                            if (tabDepth === 0) {
                                currentTop = { title: t.title.trim(), contentStart: t.idx + t.len };
                            }
                            tabDepth++;
                        } else if (t.type === 'tabC') {
                            tabDepth--;
                            if (tabDepth === 0 && currentTop) {
                                currentTop.contentRaw = content.substring(currentTop.contentStart, t.idx);
                                currentTop.endPos = t.idx + t.len;
                                topLevelTabs.push(currentTop);
                                currentTop = null;
                            }
                        }
                    }

                    // Step B: 对每个顶层 tab，用 findTabsBlocksAware 查找它的实数内嵌 [[tabs]] 块
                    //        然后将它们保护为占位符。同时记录在原始 content 中的绝对位置。
                    var allInnerTabsPlaceholders = [];
                    var innerTabsPid = 0;
                    for (var tli = 0; tli < topLevelTabs.length; tli++) {
                        var tlt = topLevelTabs[tli];
                        var innerTabs = findTabsBlocksAware(tlt.contentRaw);
                        for (var it = innerTabs.length - 1; it >= 0; it--) {
                            var itBlock = innerTabs[it];
                            var pid = "xf_editor-iptp-" + (++innerTabsPid);
                            var fullBlock = tlt.contentRaw.substring(itBlock.start, itBlock.end);
                            // 绝对位置（基于外部 content 参数）
                            var absStart = tlt.contentStart + itBlock.start;
                            var absEnd = tlt.contentStart + itBlock.end;
                            allInnerTabsPlaceholders.push({ id: pid, content: fullBlock, absStart: absStart, absEnd: absEnd });
                            // 在该 tab 内容中替换为占位符
                            tlt.contentRaw = tlt.contentRaw.substring(0, itBlock.start) + "<!--" + pid + "-->" + tlt.contentRaw.substring(itBlock.end);
                        }
                    }

                    // Step C: 为了后续扫描方便，重构原始 content，把所有内嵌 [[tabs]] 块替换为占位符
                    //         使用绝对位置直接替换（比 split() 更可靠，不受子串提取边界影响）
                    var protectedContent = content;
                    if (allInnerTabsPlaceholders.length > 0) {
                        // 按 absStart 降序排列，从后往前替换，确保位置不受前面替换影响
                        allInnerTabsPlaceholders.sort(function(a, b) { return b.absStart - a.absStart; });
                        for (var pi = 0; pi < allInnerTabsPlaceholders.length; pi++) {
                            var p = allInnerTabsPlaceholders[pi];
                            protectedContent = protectedContent.substring(0, p.absStart) + "<!--" + p.id + "-->" + protectedContent.substring(p.absEnd);
                        }
                    }

                    // Step D: 在保护后的内容上重新扫描 [[tab:xxx]]/[[/tab]]
                    allTokens = [];
                    tabOpenRe.lastIndex = 0;
                    while ((match = tabOpenRe.exec(protectedContent)) !== null) allTokens.push({ idx: match.index, type: 'open', title: match[1], len: match[0].length });
                    tabCloseRe.lastIndex = 0;
                    while ((match = tabCloseRe.exec(protectedContent)) !== null) allTokens.push({ idx: match.index, type: 'close', len: match[0].length });
                    allTokens.sort(function(a, b) { return a.idx - b.idx; });

                    var items = [];
                    var depth = 0;
                    var current = null;
                    for (var j = 0; j < allTokens.length && j < safety; j++) {
                        var tt = allTokens[j];
                        if (tt.type === 'open') {
                            depth++;
                            if (depth === 1) {
                                current = { title: tt.title.trim(), contentStart: tt.idx + tt.len };
                            }
                        } else if (tt.type === 'close') {
                            depth--;
                            if (depth === 0 && current) {
                                var rawContent = protectedContent.substring(current.contentStart, tt.idx);
                                // Step E: 还原内嵌 tabs 占位符
                                for (var ri = 0; ri < allInnerTabsPlaceholders.length; ri++) {
                                    rawContent = rawContent.split("<!--" + allInnerTabsPlaceholders[ri].id + "-->").join(allInnerTabsPlaceholders[ri].content);
                                }
                                current.content = rawContent;
                                current.end = tt.idx + tt.len;
                                items.push(current);
                                current = null;
                            }
                        }
                    }
                    if (current) {
                        var rawContent = protectedContent.substring(current.contentStart).trim();
                        for (var ri = 0; ri < allInnerTabsPlaceholders.length; ri++) {
                            rawContent = rawContent.split("<!--" + allInnerTabsPlaceholders[ri].id + "-->").join(allInnerTabsPlaceholders[ri].content);
                        }
                        current.content = rawContent;
                        items.push(current);
                    }
                    return items;
                }

                try {
                    var tabItems = extractTabItems(content);
                    for (var ti = 0; ti < tabItems.length; ti++) {
                        if (ti >= 50) {
                            if (typeof console !== "undefined" && console.warn) {
                                console.warn("[xfEditor] Maximum tabs limit (50) exceeded");
                            }
                            break;
                        }
                        hasTabs = true;
                        var tabItem = tabItems[ti];
                        var tabTitle = tabItem.title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
                        var tabContent = (tabItem.content || "").trim();
                        // 在递归处理前，先恢复上层保护的代码块占位符，避免 marked 渲染时丢失
                        var tabContentRestored = restoreCodeBlocks(tabContent, codeProtection.placeholders);
                        var preprocessed = xfEditor.preprocessMarkdownBlocks(tabContentRestored, options);
                        var tabContentHtml = xfEditor.$marked(preprocessed.markdown, tabMarkedOptions);
                        tabContentHtml = xfEditor.restorePlaceholders(tabContentHtml, preprocessed.placeholders);

                        var activeClass = (tabIndex === 0) ? ' class="active"' : '';
                        var activeBodyClass = (tabIndex === 0) ? ' class="xf_editor-tab-panel active"' : ' class="xf_editor-tab-panel"';
                        tabHeaders += '<li' + activeClass + ' data-index="' + tabIndex + '">' + tabTitle + '</li>';
                        tabBodies += '<div' + activeBodyClass + ' data-index="' + tabIndex + '">' + tabContentHtml + '</div>';
                        tabIndex++;
                    }

                    if (!hasTabs) {
                        // 在递归处理前，先恢复上层保护的代码块占位符
                        var contentRestored = restoreCodeBlocks(content.trim(), codeProtection.placeholders);
                        var preprocessed2 = xfEditor.preprocessMarkdownBlocks(contentRestored, options);
                        var defaultHtml = xfEditor.$marked(preprocessed2.markdown, tabMarkedOptions);
                        defaultHtml = xfEditor.restorePlaceholders(defaultHtml, preprocessed2.placeholders);
                        tabHeaders += '<li class="active" data-index="0">Tab1</li>';
                        tabBodies += '<div class="xf_editor-tab-panel active" data-index="0">' + defaultHtml + '</div>';
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
                var colCount = colMatch ? (isNaN(parseInt(colMatch[1], 10)) ? 3 : parseInt(colMatch[1], 10)) : 3;
                
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
                    var preprocessed = xfEditor.preprocessMarkdownBlocks(colContentRestored, options);
                    var colContentHtml = xfEditor.$marked(preprocessed.markdown, colMarkedOptions);
                    colContentHtml = xfEditor.restorePlaceholders(colContentHtml, preprocessed.placeholders);
                    var colHtml = '<div class="xf_editor-columns" data-count="' + colCount + '" style="-webkit-column-count:' + colCount + ';-moz-column-count:' + colCount + ';column-count:' + colCount + ';">' + colContentHtml + '</div>';
                    var colPlaceholder = addPlaceholder(colHtml);
                    markdown = markdown.substring(0, colBlock.start) + colPlaceholder + markdown.substring(colOriginalEnd);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Columns processing error:", e);
                    }
                }
            }
        }

        // 处理栅格化布局语法：[[row]]...[[/row]]（支持 [[col:N]] / [[col]] 子元素）
        // ★ 栅格化系统：类似 Bootstrap 10 栏栅格，每行 10 等份
        //   - [[row]]...[[/row]] → 独占 100% 宽度的行容器
        //   - [[col:N]](1≤N≤10)  → 占 N×10% 宽度
        //   - [[col]]            → 按行内 col 个数平分 100% 宽度
        if (options.grid !== false) {
            var rowBlocks = findBalancedBlocks(markdown, /\[\[row\]\]/g, /\[\[\/row\]\]/g);
            for (var ri = rowBlocks.length - 1; ri >= 0; ri--) {
                var rowBlock = rowBlocks[ri];
                if (!rowBlock || !rowBlock.fullMatch) continue;

                var rowContent = rowBlock.content;
                var rowOriginalEnd = rowBlock.end;
                var rowMarkedOptions = createMarkedOptions(options, true);

                try {
                    // ★ v1.17.9-FIX: 提取同一行内的兄弟 [[col]] 块
                    // findBalancedBlocks 会把兄弟 [[col:6]] 和 [[col:4]] 当作嵌套合并，
                    // 导致只生成一个宽度错误的列。本函数按顺序扫描，正确定义兄弟边界。
                    function extractColBlocks(rowContent) {
                        var colBlocks = [];
                        var idx = 0;
                        var colOpenRe2 = /\[\[col(?::(\d+))?\]\]/g;
                        var colCloseRe2 = /\[\[\/col\]\]/g;
                        while (idx < rowContent.length) {
                            colOpenRe2.lastIndex = idx;
                            var om = colOpenRe2.exec(rowContent);
                            if (!om) break;
                            var depth = 1;
                            var sp = om.index + om[0].length;
                            var cm = null;
                            colCloseRe2.lastIndex = sp;
                            while (depth > 0) {
                                cm = colCloseRe2.exec(rowContent);
                                if (!cm) break;
                                // 检查此闭标签之前是否有嵌套的开标签（col 内嵌 col 场景）
                                colOpenRe2.lastIndex = sp;
                                var nm;
                                while ((nm = colOpenRe2.exec(rowContent)) !== null && nm.index < cm.index) {
                                    depth++;
                                    sp = nm.index + nm[0].length;
                                }
                                depth--;
                                if (depth > 0) sp = cm.index + cm[0].length;
                            }
                            if (depth === 0 && cm) {
                                colBlocks.push({
                                    start: om.index, end: cm.index + cm[0].length,
                                    content: rowContent.substring(om.index + om[0].length, cm.index),
                                    fullMatch: rowContent.substring(om.index, cm.index + cm[0].length)
                                });
                                idx = cm.index + cm[0].length;
                            } else {
                                idx = om.index + 1;
                            }
                        }
                        return colBlocks;
                    }
                    
                    var colBlocks = extractColBlocks(rowContent);
                    
                    // ★ v1.17.0: 空 row 警告
                    if (colBlocks.length === 0) {
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] Empty row block (no [[col]] found), row will be rendered as empty container.");
                        }
                        // 仍然生成空 row 容器，以便用户发现并修正
                        var emptyRowHtml = '<div class="xf_editor-row" style="min-height:20px;border:1px dashed #ddd;padding:8px;color:#999;font-size:12px;">⚠ 空行（请添加 [[col]] 或 [[col:N]] 列）</div>';
                        var emptyRowPlaceholder = addPlaceholder(emptyRowHtml);
                        markdown = markdown.substring(0, rowBlock.start) + emptyRowPlaceholder + markdown.substring(rowOriginalEnd);
                        continue;
                    }
                    
                    // 计算每个 col 的宽度：有数字的用 N*10%，没数字的平分剩余空间
                    var autoCount = 0;
                    var totalDefined = 0;
                    var colWidths = [];
                    for (var ci2 = 0; ci2 < colBlocks.length; ci2++) {
                        var colMatch2 = colBlocks[ci2].fullMatch.match(/\[\[col(?::(\d+))?\]\]/);
                        var colN = colMatch2 && colMatch2[1] ? parseInt(colMatch2[1], 10) : -1;
                        if (colN >= 1 && colN <= 10) {
                            colWidths.push(colN * 10);
                            totalDefined += colN * 10;
                        } else if (colN === -1) {
                            colWidths.push(-1); // auto
                            autoCount++;
                        } else {
                            // 无效值，当作 auto
                            colWidths.push(-1);
                            autoCount++;
                        }
                    }
                    
                    // 计算 auto col 的宽度
                    var remaining = Math.max(0, 100 - totalDefined);
                    var autoWidth = autoCount > 0 ? Math.floor(remaining / autoCount) : 0;
                    var autoRemainder = autoCount > 0 ? remaining - autoWidth * autoCount : 0;
                    
                    // 生成每个 col 的 HTML
                    var rowHtml = '<div class="xf_editor-row">';
                    for (var cj = 0; cj < colBlocks.length; cj++) {
                        var w = colWidths[cj];
                        if (w === -1) {
                            w = autoWidth + (autoRemainder-- > 0 ? 1 : 0);
                        }
                        // ★ v1.17.0: 最小宽度 1%，防止 0% 宽度列不可见
                        w = Math.max(1, Math.min(100, w));
                        
                        var colContentRaw = colBlocks[cj].content;
                        var colContentRestored = restoreCodeBlocks(colContentRaw.trim(), codeProtection.placeholders);
                        var colPreprocessed = xfEditor.preprocessMarkdownBlocks(colContentRestored, options);
                        var colContentHtml = xfEditor.$marked(colPreprocessed.markdown, rowMarkedOptions);
                        colContentHtml = xfEditor.restorePlaceholders(colContentHtml, colPreprocessed.placeholders);
                        
                        rowHtml += '<div class="xf_editor-col xf_editor-col-' + w + '" style="width:' + w + '%;">' + colContentHtml + '</div>';
                    }
                    rowHtml += '</div>';
                    
                    var rowPlaceholder = addPlaceholder(rowHtml);
                    markdown = markdown.substring(0, rowBlock.start) + rowPlaceholder + markdown.substring(rowOriginalEnd);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Grid (row/col) processing error:", e);
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
            var html = '<div class="xf_editor-copybook xf_editor-copybook-' + type + '">';
            var isMi = (type === 'mi');
            var isPinyin = (type === 'pinyin');
            
            // ★ v1.17.6-FIX3: 解析字符和脚注 — 使用全局脚注映射 _copybookFootnoteMap
            // 生成与全局脚注系统一致的 ID：xf_editor-fnref-{N} 和 xf_editor-fn-{N}
            var parseCharsWithFN = function(text) {
                var result = [];
                var j = 0;
                while (j < text.length) {
                    var ch = text.charAt(j);
                    if (ch === '[' && text.substring(j, j + 2) === '[^') {
                        var closeIdx = text.indexOf(']', j + 2);
                        if (closeIdx > j) {
                            var fnRef = text.substring(j + 2, closeIdx);
                            // 查找全局脚注映射以获取正确索引
                            var fnIndex = _copybookFootnoteMap[fnRef] || null;
                            if (result.length > 0) result[result.length - 1].fn = fnIndex;
                            j = closeIdx + 1;
                            continue;
                        }
                    }
                    if (ch !== ' ' && ch !== '\t' && ch !== '\r' && ch !== '\n')
                        result.push({ ch: ch, fn: null });
                    j++;
                }
                return result;
            };

            for (var li = 0; li < lines.length; li++) {
                var line = lines[li].trim();
                if (!line) continue;

                // ★ v1.17.7: 支持 {content|pinyin}(!width:NNN) 花括号语法（含可选宽度参数）
                // 同时兼容原有的 (content|pinyin) 圆括号语法
                var groups = [];
                
                // ★ 先尝试花括号组（带可选 (!width:NNN)）
                // \{[^{}]*\} 匹配花括号内容，\(!width:(\d+)\) 匹配可选宽度参数
                var curlyRegex = /\{([^{}]*?)\}(?:\s*\(!width:(\d+)\))?/g;
                var cm;
                while ((cm = curlyRegex.exec(line)) !== null) {
                    groups.push({ 
                        content: cm[1], 
                        width: cm[2] ? parseInt(cm[2], 10) : null, 
                        delim: 'curly' 
                    });
                }
                
                // 如果没有花括号组，回退到圆括号组（也支持 (!width:NNN)）
                if (groups.length === 0) {
                    var parenRegex = /\(([^)]*?)\)(?:\s*\(!width:(\d+)\))?/g;
                    var pm;
                    while ((pm = parenRegex.exec(line)) !== null) {
                        // 过滤掉单独的 (!width:NNN) 参数行
                        if (pm[1] && !/^!width:\d+$/.test(pm[1].trim())) {
                            groups.push({ 
                                content: pm[1], 
                                width: pm[2] ? parseInt(pm[2], 10) : null, 
                                delim: 'paren' 
                            });
                        }
                    }
                }
                
                if (groups.length === 0) continue;

                // ★ v1.17.7: 检测是否有任何 group 指定了宽度 — 决定行容器样式
                var hasAnyWidth = false;
                for (var gi = 0; gi < groups.length; gi++) {
                    if (groups[gi].width) { hasAnyWidth = true; break; }
                }

                // ★ 行容器：有宽度时使用 flex 布局让各组内内容两端对齐
                var rowStyle = '';
                var rowClass = 'xf_editor-copybook-row';
                if (hasAnyWidth && isPinyin) {
                    rowClass += ' xf_editor-copybook-row-wide';
                }
                html += '<div class="' + rowClass + '"' + rowStyle + '>';

                for (var gi = 0; gi < groups.length; gi++) {
                    var groupContent = groups[gi].content.trim();
                    if (!groupContent) continue;
                    var groupWidth = groups[gi].width;

                    if (isPinyin) {
                        var parts = groupContent.split('|');
                        var charObjs = parseCharsWithFN(parts[0] || '');
                        var pinyins = (parts[1] || '').trim().split(/\s+/);
                        
                        // ★ v1.17.7: 每个字符独立单元格，拼音在上、汉字在下
                        // 脚注标记 [^fn] 不产生独立单元格，附加在前一个汉字上
                        // 支持 (!width:NNN) — 组宽度作用于容器，各单元格按比例分配

                        var groupCellHtml = '';
                        for (var ci = 0; ci < charObjs.length; ci++) {
                            var co = charObjs[ci], ch = co.ch, py = pinyins[ci] || '', fn = co.fn;
                            groupCellHtml += '<div class="xf_editor-copybook-cell xf_editor-copybook-pinyin-cell">';
                            // ★ 上方拼音区（四线格）
                            groupCellHtml += '<div class="xf_editor-copybook-pinyin-top">';
                            groupCellHtml += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="xf_editor-copybook-svg">';
                            groupCellHtml += '<line x1="2" y1="0" x2="98" y2="0" stroke="#2f7d4a" stroke-width="1.2" opacity="0.9"/>';
                            groupCellHtml += '<line x1="2" y1="30" x2="98" y2="30" stroke="#2f7d4a" stroke-width="1" opacity="0.85"/>';
                            groupCellHtml += '<line x1="2" y1="63" x2="98" y2="63" stroke="#2f7d4a" stroke-width="1" opacity="0.85"/>';
                            groupCellHtml += '<line x1="2" y1="100" x2="98" y2="100" stroke="#2f7d4a" stroke-width="1.2" opacity="0.9"/>';
                            groupCellHtml += '</svg>';
                            groupCellHtml += '<span class="xf_editor-copybook-pinyin-text">' + py + '</span>';
                            groupCellHtml += '</div>';
                            // ★ 下方汉字区（田字格/米字格）
                            groupCellHtml += '<div class="xf_editor-copybook-pinyin-bottom">';
                            groupCellHtml += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="xf_editor-copybook-svg">';
                            groupCellHtml += '<line x1="1" y1="1" x2="99" y2="99" stroke="#b8823a" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>';
                            groupCellHtml += '<line x1="99" y1="1" x2="1" y2="99" stroke="#b8823a" stroke-width="0.7" stroke-dasharray="4 3" opacity="0.6"/>';
                            groupCellHtml += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c69654" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.6"/>';
                            groupCellHtml += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c69654" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.6"/>';
                            groupCellHtml += '<rect x1="1" y1="1" width="98" height="98" fill="none" stroke="#a57a42" stroke-width="0.5" opacity="0.5"/>';
                            groupCellHtml += '</svg>';
                            groupCellHtml += '<span class="xf_editor-copybook-hanzi-text">' + ch + '</span>';
                            // ★ 脚注：渲染在汉字区底部，不显示在上方拼音区
                            if (fn) groupCellHtml += '<sup class="xf_editor-copybook-footnote"><a href="#xf_editor-fn-' + fn + '" id="xf_editor-fnref-' + fn + '">[' + fn + ']</a></sup>';
                            groupCellHtml += '</div>';
                            groupCellHtml += '</div>';
                        }

                        // ★ v1.17.7: 组级宽度包装 — 当 group 指定了 (!width:NNN)
                        if (groupWidth) {
                            groupCellHtml = '<div class="xf_editor-copybook-group xf_editor-copybook-group-pinyin" style="width:' + groupWidth + 'px;">' +
                                groupCellHtml + '</div>';
                        }
                        html += groupCellHtml;
                    } else {
                        // tian / mi 字帖
                        var charObjs2 = parseCharsWithFN(groupContent);
                        var gridCellHtml = '';
                        for (var cj = 0; cj < charObjs2.length; cj++) {
                            var co2 = charObjs2[cj], ch2 = co2.ch, fn2 = co2.fn;
                            gridCellHtml += '<div class="xf_editor-copybook-cell xf_editor-copybook-grid-cell">';
                            gridCellHtml += '<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="xf_editor-copybook-svg">';
                            if (isMi) {
                                gridCellHtml += '<line x1="1" y1="1" x2="99" y2="99" stroke="#b8823a" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.65"/>';
                                gridCellHtml += '<line x1="99" y1="1" x2="1" y2="99" stroke="#b8823a" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.65"/>';
                                gridCellHtml += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c69654" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>';
                                gridCellHtml += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c69654" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.65"/>';
                                gridCellHtml += '<rect x1="1" y1="1" width="98" height="98" fill="none" stroke="#a57a42" stroke-width="0.7" opacity="0.55"/>';
                            } else {
                                gridCellHtml += '<line x1="50" y1="0" x2="50" y2="100" stroke="#c2995b" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.75"/>';
                                gridCellHtml += '<line x1="0" y1="50" x2="100" y2="50" stroke="#c2995b" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.75"/>';
                                gridCellHtml += '<rect x1="1" y1="1" width="98" height="98" fill="none" stroke="#b58f53" stroke-width="0.7" opacity="0.55"/>';
                            }
                            gridCellHtml += '</svg>';
                            gridCellHtml += '<span class="xf_editor-copybook-hanzi-text">' + ch2 + '</span>';
                            if (fn2) gridCellHtml += '<sup class="xf_editor-copybook-footnote"><a href="#xf_editor-fn-' + fn2 + '" id="xf_editor-fnref-' + fn2 + '">[' + fn2 + ']</a></sup>';
                            gridCellHtml += '</div>';
                        }

                        // ★ v1.17.7: tian/mi 字帖也支持组级宽度
                        if (groupWidth) {
                            gridCellHtml = '<div class="xf_editor-copybook-group xf_editor-copybook-group-grid" style="width:' + groupWidth + 'px;">' +
                                gridCellHtml + '</div>';
                        }
                        html += gridCellHtml;
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

        // ★ v1.17.9-FIX: 使用共享脚注映射（已在 tabs 之前从原始 markdown 构建）
        // 确保字帖脚注 ID 与全局脚注系统使用相同的编号
        var _copybookFootnoteMap = {};
        if (options._sharedFootnoteMap) {
            // 从共享映射转换为简单 name → index 映射
            for (var _fnk in options._sharedFootnoteMap) {
                if (options._sharedFootnoteMap.hasOwnProperty(_fnk)) {
                    _copybookFootnoteMap[_fnk] = options._sharedFootnoteMap[_fnk].index;
                }
            }
        }

        // 处理字帖语法：[[copybookTian]]...[[/copybookTian]]、[[copybookMi]]...[[/copybookMi]]、[[copybookPinyin]]...[[/copybookPinyin]]
        // 各种字帖类型可以彼此嵌套，也可以嵌套在 tabs/columns 内使用
        // ★ v1.17.6-FIX2: 传递脚注映射使字帖脚注 ID 与全局系统一致
        if (options.copybook !== false) {
            try {
                processCopybookBlocks(findBalancedBlocks(markdown, xfEditor.regexs.copybookTian, xfEditor.regexs.copybookTianEnd), 'tian');
                processCopybookBlocks(findBalancedBlocks(markdown, xfEditor.regexs.copybookMi, xfEditor.regexs.copybookMiEnd), 'mi');
                processCopybookBlocks(findBalancedBlocks(markdown, xfEditor.regexs.copybookPinyin, xfEditor.regexs.copybookPinyinEnd), 'pinyin');
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

            var pageBlocks = findBalancedBlocks(markdown, xfEditor.regexs.pageOpen, xfEditor.regexs.pageClose);
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
                    var pagePreprocessed = xfEditor.preprocessMarkdownBlocks(pageRestored, options);
                    var pageMarkedOptions = createMarkedOptions(options, true);
                    var pageContentHtml = xfEditor.$marked(pagePreprocessed.markdown, pageMarkedOptions);
                    pageContentHtml = xfEditor.restorePlaceholders(pageContentHtml, pagePreprocessed.placeholders);

                    // 构建页面HTML，包含页头、页脚区域
                    var headerHtml = pageHeader ? '<div class="xf_editor-page-header">' + pageHeader.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '</div>' : '';
                    // ★ v1.17.9-FIX1: 直接渲染页脚初始内容（{page}/{total} 暂用 1/1）
                    // data-footer-template 属性保留供 initPages() 分页时更新
                    // 解决 markdownToHTML 模式下 footer 不显示的问题
                    var footerContent = pageFooter ? xfEditor.escapeHtml(pageFooter.replace(/{page}/gi, '1').replace(/{total}/gi, '1')) : '';
                    var footerHtml = pageFooter ? '<div class="xf_editor-page-footer" data-footer-template="' + pageFooter.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '">' + footerContent + '</div>' : '';

                    var pageHtml = '<div class="xf_editor-page-block" data-paper="' + paperKey + '" data-width="' + paperSize.w + '" data-height="' + paperSize.h + '" style="width:' + paperSize.w + 'px;min-height:' + paperSize.h + 'px;">' +
                        headerHtml +
                        '<div class="xf_editor-page-content">' + pageContentHtml + '</div>' +
                        footerHtml +
                        '<div class="xf_editor-page-watermark">' + paperKey + '</div>' +
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
        // ★ v1.17.10-FIX: 使用 findBalancedBlocks 替代简单正则，支持嵌套和与其他块级语法的交叉嵌套
        if (options.video !== false) {
            var videoBlocks = findBalancedBlocks(markdown, /\[\[video\]\]/g, /\[\[\/video\]\]/g);
            for (var vi = videoBlocks.length - 1; vi >= 0; vi--) {
                var vb = videoBlocks[vi];
                if (!vb || !vb.content) continue;
                
                var videoContent = vb.content;
                try {
                    var lines = videoContent.trim().split("\n");
                    var resultHtml = "";
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].trim();
                        if (!line) continue;
                        // 跳过已经被处理为占位符的行（如嵌套块级语法的渲染结果）
                        if (/^<!--xf_editor-/.test(line)) continue;
                        var parts = line.split("|");
                        var url = parts[0].trim();
                        
                        // XSS 防护：验证 URL
                        if (!url || url.length > 2000) continue;
                        
                        var title = parts[1] ? parts[1].trim() : "";
                        resultHtml += '<video src="' + xfEditor.escapeAttr(url) + '" controls preload="metadata" class="xf_editor-video-player">' + xfEditor.escapeHtml(title || "Video") + '</video>';
                        
                        // 安全限制：最多支持 50 个视频
                        if (i >= 49) {
                            if (typeof console !== "undefined" && console.warn) {
                                console.warn("[xfEditor] Maximum videos limit (50) exceeded");
                            }
                            break;
                        }
                    }
                    var placeholder = addPlaceholder(resultHtml);
                    markdown = markdown.substring(0, vb.start) + placeholder + markdown.substring(vb.end);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] Video block processing error:", e);
                    }
                }
            }
        }

        // 处理文件列表语法：[[file]]...[[/file]]
        // ★ v1.17.10-FIX: 使用 findBalancedBlocks 替代简单正则，支持嵌套和与其他块级语法的交叉嵌套
        if (options.file !== false) {
            var fileBlocks = findBalancedBlocks(markdown, /\[\[file\]\]/g, /\[\[\/file\]\]/g);
            for (var fi = fileBlocks.length - 1; fi >= 0; fi--) {
                var fb = fileBlocks[fi];
                if (!fb || !fb.content) continue;
                
                var fileContent = fb.content;
                try {
                    var flines = fileContent.trim().split("\n");
                    var fresultHtml = '<div class="xf_editor-file-list">';
                    for (var i = 0; i < flines.length; i++) {
                        var line = flines[i].trim();
                        if (!line) continue;
                        // 跳过已经被处理为占位符的行
                        if (/^<!--xf_editor-/.test(line)) continue;
                        var parts = line.split("|");
                        var url = parts[0].trim();
                        
                        // XSS 防护：验证 URL
                        if (!url || url.length > 2000) continue;
                        
                        var name = parts[1] ? parts[1].trim() : url.split("/").pop();
                        var ext = url.split(".").pop().toLowerCase();
                        fresultHtml += '<a href="' + url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '" download class="xf_editor-attachment-link" data-ext="' + ext + '">' + name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") + '</a>';
                        
                        // 安全限制：最多支持 100 个文件
                        if (i >= 99) {
                            if (typeof console !== "undefined" && console.warn) {
                                console.warn("[xfEditor] Maximum files limit (100) exceeded");
                            }
                            break;
                        }
                    }
                    fresultHtml += '</div>';
                    var placeholder = addPlaceholder(fresultHtml);
                    markdown = markdown.substring(0, fb.start) + placeholder + markdown.substring(fb.end);
                } catch(e) {
                    if (typeof console !== "undefined" && console.warn) {
                        console.warn("[xfEditor] File block processing error:", e);
                    }
                }
            }
        }

        // 处理上标和下标语法（脚注引用已在 tabs 之前处理完毕，不冲突）
        // 上标：^文本^ → <sup>文本</sup>
        // 下标：^^文本^^ → <sub>文本</sub>
        // 组合上下标：<<下标>^<上标>> → 垂直堆叠容器（sup 在上、sub 在下，同级并列）
        try {
            xfEditor.regexs.supsub.lastIndex = 0;
            markdown = markdown.replace(xfEditor.regexs.supsub, function(match, subText, supText) {
                if (!subText || subText.length > 100 || !supText || supText.length > 100) return match;
                // 保护产生的 HTML 不被后续 ^ / ^^ 处理误匹配
                var safeSub = subText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\^/g, "&#94;");
                var safeSup = supText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\^/g, "&#94;");
                    return '<span class="xf_editor-supsub"><sup>' + safeSup + '</sup><sub>' + safeSub + '</sub></span>';
            });

            // 再处理下标（双符号），避免冲突
            xfEditor.regexs.subscript.lastIndex = 0;
            markdown = markdown.replace(xfEditor.regexs.subscript, function(match, text) {
                if (!text || text.length > 100) return match;
                var safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return '<sub>' + safeText + '</sub>';
            });

            xfEditor.regexs.superscript.lastIndex = 0;
            markdown = markdown.replace(xfEditor.regexs.superscript, function(match, text) {
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
        // ★ v1.17.6-FIX3: 修复 guard 条件 — 原 /\^\[/ 检测图片语法永远不触发(match 以 ! 开头)，
        //     改用检测 match 是否以 !数字形式开头；图片语法 ![alt] 的 [ 不是数字，不会被误匹配
        try {
            markdown = markdown.replace(xfEditor.regexs.fontSize, function(match, size, text) {
                // 防止误匹配：图片语法 ![alt](url) 中 '!' 后跟 '[' 而非数字，正则本身不会匹配
                // 但额外保护：如果 size 无法解析为有效数字则原样返回
                if (!size || !/^\d+$/.test(size)) return match;

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

        // 预处理 tooltip 语法：将 <宽,高> 转换为标准 title 格式
        // 将 [text](tooltip:type:content)<宽,高> 转换为 [text](tooltip:type:content "<宽,高>")
        // 注意：需要正确处理 content 中可能包含引号的情况
        if (options.tooltip) {
            markdown = markdown.replace(/\[([^\]]+)\]\(tooltip:([^)]+?)\)<(\d+),(\d+)>/gi, function(match, text, content, width, height) {
                // content 可能包含引号，需要保留原样
                return '[' + text + '](tooltip:' + content + ' "<' + width + ',' + height + '>")';
            });
        }

        // ★ v1.17.9-FIX4: 仅在最外层调用追加脚注列表，防止递归调用插入到嵌套内容中
        if (_wasRootFootnotesCall && options._sharedFootnoteOrder && options._sharedFootnoteOrder.length > 0) {
            var footnoteHtml = '\n\n<div class="xf_editor-footnotes-section">';
            footnoteHtml += '<hr class="xf_editor-footnote-sep">';
            footnoteHtml += '<div class="xf_editor-footnote-title"><strong>脚注</strong></div>';
            footnoteHtml += '<ol class="xf_editor-footnote-list">';
            
            for (var fi = 0; fi < options._sharedFootnoteOrder.length; fi++) {
                var fnName = options._sharedFootnoteOrder[fi];
                var fn = options._sharedFootnoteMap[fnName];
                if (!fn) continue;
                
                var fnContent = fn.content;
                fnContent = restoreCodeBlocks(fnContent, codeProtection.placeholders);
                fnContent = fnContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                fnContent = fnContent.replace(/`([^`]+)`/g, '<code>$1</code>');
                var codeBlocks = [];
                fnContent = fnContent.replace(/<code>[^<]*<\/code>/g, function(m) {
                    codeBlocks.push(m);
                    return '<!--fncode-' + (codeBlocks.length - 1) + '-->';
                });
                fnContent = fnContent.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
                fnContent = fnContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                fnContent = fnContent.replace(/\*(.+?)\*/g, '<em>$1</em>');
                for (var ci = 0; ci < codeBlocks.length; ci++) {
                    fnContent = fnContent.split('<!--fncode-' + ci + '-->').join(codeBlocks[ci]);
                }
                fnContent = fnContent.replace(/\n/g, '<br>');
                
                footnoteHtml += '<li class="xf_editor-footnote-item" id="xf_editor-fn-' + fn.index + '" value="' + fn.index + '">';
                footnoteHtml += '<span class="xf_editor-footnote-content">' + fnContent + '</span>';
                footnoteHtml += ' <a href="#xf_editor-fnref-' + fn.index + '" class="xf_editor-footnote-backref" title="返回引用位置">&#8617;</a>';
                footnoteHtml += '</li>';
            }
            footnoteHtml += '</ol></div>';
            markdown += footnoteHtml;
            
            // 仅添加一次，避免递归调用重复添加
            delete options._sharedFootnoteOrder;
        }

        return { markdown: markdown, placeholders: placeholders };
    };

    /**
     * ★ v1.17.5-FIX: 多轮替换解决嵌套占位符问题
     * 当占位符的 HTML 内容中包含其他占位符引用时（如 tabs 嵌套在 grid col 内），
     * 单次遍历无法恢复所有占位符。改用多轮循环直到无变化或达到安全上限(10轮)。
     * 使用 forEach 闭包隔离作用域，避免 uglify 变量名碰撞。
     */
    xfEditor.restorePlaceholders = function(html, placeholders) {
        if (!html || !placeholders || placeholders.length === 0) return html;
        var maxRounds = 10;
        while (maxRounds-- > 0) {
            var anyFound = false;
            placeholders.forEach(function(ph) {
                if (ph && ph.id) {
                    var marker = "<!--" + ph.id + "-->";
                    if (html.indexOf(marker) !== -1) {
                        html = html.split(marker).join(ph.html || "");
                        anyFound = true;
                    }
                }
            });
            if (!anyFound) break;
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

    xfEditor.markedRenderer = function(markdownToC, options) {
        var defaults = {
            toc                  : true,           // 生成目录（Table of Contents）
            tocm                 : false,
            tocStartLevel        : 1,              pageBreak            : true,
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
            video                : true,           // 启用视频列表 [[video]] 语法
            file                 : true,           // 启用文件列表 [[file]] 语法
            tooltip              : true,           // 启用悬浮提示 [text](tooltip:content) 语法
            copybook             : true        };
        
        var settings        = $.extend(defaults, options || {});    
        var marked          = xfEditor.$marked;
        var markedRenderer  = new marked.Renderer();
        markdownToC         = markdownToC || [];        
            
        var regexs          = xfEditor.regexs;
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
                        return "<a href=\"" + xfEditor.urls.atLinkBase + "" + $2 + "\" title=\"&#64;" + $2 + "\" class=\"at-link\">" + $1 + "</a>";
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
            
            var pinyinReg = xfEditor.regexs.pinyin;
            // ★ v1.17.9: 脚注引用 HTML 匹配正则（在 pinyin 处理前已被 marked 渲染）
            var fnRefRegex = /<sup class="xf_editor-footnote-ref-wrapper">[\s\S]*?<\/sup>/g;
            
            text = text.replace(pinyinReg, function($1, $2, $3, $4) {
                var baseText = $2.trim();
                // 保留原始拼音中的空格，不执行 trim
                var pyTextRaw = $3;
                var pyTrimmed = pyTextRaw.trim();
                // 保存原始拼音中的空格（用 &nbsp; 替代），防止 HTML 折叠空白
                var pyText = pyTextRaw.replace(/ /g, '&nbsp;');
                // ★ v1.17.7: 可选的宽度参数 (!width:NNN)
                var userWidth = $4 ? parseInt($4, 10) : null;
                
                // 检测拼音中是否包含空格（表示分组拼音如 "chuáng qián míng yuè guāng"）
                var pyGroups = pyTrimmed.split(/\s+/).filter(function(g) { return g.length > 0; });
                
                // ★ v1.17.9: 检测 baseText 是否包含脚注 HTML（被 marked 渲染后的 footnotes）
                var hasFootnotes = fnRefRegex.test(baseText);
                fnRefRegex.lastIndex = 0;
                
                if (hasFootnotes && pyGroups.length > 1) {
                    // ★ v1.17.9: 脚注嵌入模式 — 将 baseText 拆分为 tokens（文字字符 + 脚注HTML块）
                    var tokens = [];
                    var lastIdx = 0, fnMatch;
                    while ((fnMatch = fnRefRegex.exec(baseText)) !== null) {
                        // 脚注前的文字字符
                        var preText = baseText.substring(lastIdx, fnMatch.index);
                        for (var ti = 0; ti < preText.length; ti++) {
                            var ch = preText.charAt(ti);
                            if (ch !== ' ') tokens.push({ type: 'char', content: ch });
                        }
                        // 脚注HTML块
                        tokens.push({ type: 'fn', content: fnMatch[0] });
                        lastIdx = fnRefRegex.lastIndex;
                    }
                    // 最后一个脚注后的剩余字符
                    var tailText = baseText.substring(lastIdx);
                    for (var tj = 0; tj < tailText.length; tj++) {
                        var tc = tailText.charAt(tj);
                        if (tc !== ' ') tokens.push({ type: 'char', content: tc });
                    }
                    
                    // 只统计 char 类型的 token 用于拼音匹配
                    var charCnt = 0;
                    for (var a = 0; a < tokens.length; a++) {
                        if (tokens[a].type === 'char') charCnt++;
                    }
                    
                    // 拼音分组数匹配纯文字字符数 → 一一对应渲染
                    if (charCnt === pyGroups.length) {
                        var result = '', pyIdx = 0;
                        for (var b = 0; b < tokens.length; b++) {
                            var tok = tokens[b];
                            if (tok.type === 'char') {
                                var rubyHtml = '<ruby class="xf_editor-pinyin xf_editor-pinyin-matched"><rb>' + tok.content + '</rb><rt>' + pyGroups[pyIdx] + '</rt></ruby>';
                                result += userWidth ? '<span class="xf_editor-pinyin-col">' + rubyHtml + '</span>' : rubyHtml;
                                pyIdx++;
                            } else {
                                // ★ v1.17.9: 脚注块：显示脚注标记，上方用 4 个 &nbsp; 空白占位保证对齐
                                var fnRuby = '<ruby class="xf_editor-pinyin xf_editor-pinyin-footnote"><rb>' + tok.content + '</rb><rt>&nbsp;&nbsp;&nbsp;&nbsp;</rt></ruby>';
                                result += userWidth ? '<span class="xf_editor-pinyin-col">' + fnRuby + '</span>' : fnRuby;
                            }
                        }
                        if (userWidth) {
                            result = '<span class="xf_editor-pinyin-wrap" style="display:inline-flex;width:' + userWidth + 'px;">' + result + '</span>';
                        }
                        return result;
                    }
                    
                    // 分组数不匹配 → 降级为整体 ruby 渲染（脚注嵌入在 rb 中）
                    var cleanBase = baseText.replace(fnRefRegex, '').replace(/\s/g, '');
                    var textWidth = cleanBase.length;
                    var pyWidth = pyTrimmed.replace(/\s/g, '').length * 0.65;
                    var maxWidth = Math.max(textWidth, pyWidth) + 'em';
                    var rtStyleAttr = ' style="min-width:' + maxWidth + ';text-align:justify;text-align-last:justify;"';
                    var rubyHtml = '<ruby class="xf_editor-pinyin"><rb>' + baseText + '</rb><rp>(</rp><rt' + rtStyleAttr + '>' + pyText + '</rt><rp>)</rp></ruby>';
                    if (userWidth) {
                        rubyHtml = '<span class="xf_editor-pinyin-wrap" style="display:inline-flex;width:' + userWidth + 'px;"><span class="xf_editor-pinyin-col">' + rubyHtml + '</span></span>';
                    }
                    return rubyHtml;
                }
                
                // ★ 非脚注模式：原有逻辑
                var textChars = [];
                for (var i = 0; i < baseText.length; i++) {
                    textChars.push(baseText.charAt(i));
                }
                
                // 如果拼音分组数等于文字字符数，进行一一对应渲染
                if (pyGroups.length > 1 && pyGroups.length === textChars.length) {
                    var result = '';
                    for (var j = 0; j < textChars.length; j++) {
                        var rubyHtml = '<ruby class="xf_editor-pinyin xf_editor-pinyin-matched"><rb>' + textChars[j] + '</rb><rt>' + pyGroups[j] + '</rt></ruby>';
                        result += userWidth ? '<span class="xf_editor-pinyin-col">' + rubyHtml + '</span>' : rubyHtml;
                    }
                    // ★ v1.17.7: 指定宽度时用容器包裹并使子元素均分宽度
                    if (userWidth) {
                        result = '<span class="xf_editor-pinyin-wrap" style="display:inline-flex;width:' + userWidth + 'px;">' + result + '</span>';
                    }
                    return result;
                }
                
                // 分组数不匹配或没有空格分隔时，使用标准 ruby 渲染（拼音在上方，文字在下方）
                var rtStyleAttr = '';
                var rbStyleAttr = '';
                
                // 当文字与拼音长度差异较大时，给较短的元素设置 text-align:justify 以视觉对齐
                var textWidth = baseText.length;
                var pyWidthNoFn = pyTrimmed.replace(/\s/g, '').length * 0.65;
                var maxWidthNoFn = Math.max(textWidth, pyWidthNoFn) + 'em';
                
                if (pyGroups.length > 1 && pyGroups.length !== textChars.length) {
                    rtStyleAttr = ' style="min-width:' + maxWidthNoFn + ';text-align:justify;text-align-last:justify;"';
                } else if ((pyGroups.length === 1 || pyGroups.length !== textChars.length) && Math.abs(textWidth - pyWidthNoFn) > 1.5) {
                    if (textWidth > pyWidthNoFn) {
                        rbStyleAttr = ' style="min-width:' + maxWidthNoFn + ';text-align:justify;text-align-last:justify;"';
                    } else {
                        rtStyleAttr = ' style="min-width:' + maxWidthNoFn + ';text-align:justify;text-align-last:justify;"';
                    }
                }
                
                var rubyHtml = '<ruby class="xf_editor-pinyin"><rb' + rbStyleAttr + '>' + baseText + '</rb><rp>(</rp><rt' + rtStyleAttr + '>' + pyText + '</rt><rp>)</rp></ruby>';
                
                if (userWidth) {
                    rubyHtml = '<span class="xf_editor-pinyin-wrap" style="display:inline-flex;width:' + userWidth + 'px;"><span class="xf_editor-pinyin-col">' + rubyHtml + '</span></span>';
                }
                
                return rubyHtml;
            });
            
            return text;
        };
        
        markedRenderer.postProcessInline = function(text) {
            if (!text) {
                return text;
            }
            
            text = this.pinyin(text);
            
            if (settings.textAlign) {
                text = text.replace(xfEditor.regexs.unicodeAlignCenter, function($0, $1) {
                    return '<span class="xf_editor-text-align xf_editor-text-align-center" style="display:inline-block;width:100%;text-align:center;">' + $1 + '</span>';
                });
                text = text.replace(xfEditor.regexs.unicodeAlignLeft, function($0, $1) {
                    return '<span class="xf_editor-text-align xf_editor-text-align-left" style="display:inline-block;width:100%;text-align:left;">' + $1 + '</span>';
                });
                text = text.replace(xfEditor.regexs.unicodeAlignRight, function($0, $1) {
                    return '<span class="xf_editor-text-align xf_editor-text-align-right" style="display:inline-block;width:100%;text-align:right;">' + $1 + '</span>';
                });
            }
            
            return text;
        };
        
        markedRenderer.link = function (href, title, text) {

            // 安全检查：防止 javascript: 和 data: 等危险协议注入
            if (href && /^\s*(javascript|data|vbscript):/i.test(href.trim())) {
                return xfEditor.escapeHtml(text || href);
            }
            
            // marked.js 会将引号编码为 &quot;，尖括号编码为 &lt; &gt;
            if (href) {
                href = href.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }
            if (title) {
                title = title.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }
            
            // 转义 href 用于 HTML 属性
            var safeHref = xfEditor.escapeAttr(href || "");

            // 语法格式：[触发文本](tooltip:类型:内容)<宽度,高度>
            // 支持类型：text、image、iframe、html、iframe:pre（提取pre元素内容以iframe展示）
            // 新增 iframe:pre 类型：iframe:pre#id 或 iframe:pre.class 提取指定pre元素内容
            // 宽度和高度为可选参数
            if (settings.tooltip && href.indexOf("tooltip:") === 0) {
                var tooltipBody = href.substring(8); // 去掉 "tooltip:" 前缀
                var tooltipType = "text";
                var tooltipContent = tooltipBody;
                var tooltipWidth = "";
                var tooltipHeight = "";
                
                    // 从 title 参数中提取（marked.js 会将 <> 中的内容作为 title）
                if (title) {
                    var sizeMatch = title.match(/^<(\d+),(\d+)>$/);
                    if (sizeMatch) {
                        tooltipWidth = sizeMatch[1];
                        tooltipHeight = sizeMatch[2];
                        title = ""; // 清空 title，避免渲染到 HTML 中
                    }
                }
                
                    var typeMatch = tooltipBody.match(/^(text|image|iframe|html):/);
                if (typeMatch) {
                    tooltipType = typeMatch[1];
                    tooltipContent = tooltipBody.substring(typeMatch[0].length);
                    
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
                            var attrs = 'data-tooltip="' + xfEditor.escapeAttr(selector) + '" data-tooltip-type="html-selector"';
                            if (tooltipWidth) attrs += ' data-tooltip-width="' + tooltipWidth + '"';
                            if (tooltipHeight) attrs += ' data-tooltip-height="' + tooltipHeight + '"';
                            return '<span class="xf_editor-tooltip-trigger" ' + attrs + ' tabindex="0">' + text + '</span>';
                        } else {
                            // 如果不是有效的CSS选择器，返回错误提示
                            console.warn('无效的HTML工具提示选择器:', tooltipContent, '，仅支持CSS选择器格式如 #id, .class, [attribute]');
                            var errAttrs = 'data-tooltip="无效选择器:' + xfEditor.escapeAttr(tooltipContent) + '" data-tooltip-type="text"';
                            return '<span class="xf_editor-tooltip-trigger" ' + errAttrs + ' tabindex="0">' + text + '</span>';
                        }
                    }
                }
                
                    var attrs = 'data-tooltip="' + xfEditor.escapeAttr(tooltipContent) + '" data-tooltip-type="' + xfEditor.escapeAttr(tooltipType) + '"';
                if (tooltipWidth) attrs += ' data-tooltip-width="' + tooltipWidth + '"';
                if (tooltipHeight) attrs += ' data-tooltip-height="' + tooltipHeight + '"';
                return '<span class="xf_editor-tooltip-trigger" ' + attrs + ' tabindex="0">' + text + '</span>';
            }

            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            var imageExts = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i;
            
            if (videoExts.test(href)) {
                var videoOut = '<video src="' + safeHref + '" controls preload="metadata" class="xf_editor-video-player"';
                if (title) videoOut += ' title="' + xfEditor.escapeAttr(title) + '"';
                videoOut += '>' + text + '</video>';
                return videoOut;
            }
            
            var out = "<a href=\"" + safeHref + "\"";
            
            if (!imageExts.test(href)) {
                out += ' download class="xf_editor-attachment-link"';
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
                    out += " title=\"" + xfEditor.escapeAttr(title).replace(/@/g, "&#64;");
                }
                
                return out + "\">" + text.replace(/@/g, "&#64;") + "</a>";
            }

            // ★ v1.17.2: 解析 title 中的 target 指令
            var linkTarget = "_blank";  // 默认新窗口打开
            var linkRel    = "noopener noreferrer";
            var linkTitle  = title || "";
            
            if (linkTitle) {
                var targetMatch = linkTitle.match(/^target=(_blank|_self|_parent|_top)$/i);
                if (targetMatch) {
                    linkTarget = targetMatch[1].toLowerCase();
                    linkTitle = ""; // 清空 title，这是 target 指令不是真正的 title
                    if (linkTarget === "_self") {
                        linkRel = ""; // 当前页面不需要 noopener
                    }
                }
            }
            
            if (linkTitle) {
                out += " title=\"" + xfEditor.escapeAttr(linkTitle) + "\"";
            }
            
            out += " target=\"" + linkTarget + "\"";
            if (linkRel) {
                out += " rel=\"" + linkRel + "\"";
            }
            out += ">" + text + "</a>";

            return out;
        };
        
        markedRenderer.image = function(href, title, text) {
            // ★ v1.17.13: 对所有用户提供的属性值进行 HTML 属性转义，防止 XSS 属性注入攻击
            var safeHref  = xfEditor.escapeAttr(href || "");
            var safeText  = xfEditor.escapeAttr(text || "");
            var safeTitle = title ? xfEditor.escapeAttr(title) : "";
            
            var videoExts = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
            if (videoExts.test(href)) {
                var videoOut = "<video src=\"" + safeHref + "\" controls preload=\"metadata\"";
                if (title) {
                    videoOut += " title=\"" + safeTitle + "\"";
                }
                videoOut += ">" + xfEditor.escapeHtml(text || "") + "</video>";
                return videoOut;
            }
            
            var out = "<img src=\"" + safeHref + "\" alt=\"" + safeText + "\"";
            var tooltipAttr = "";
            
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
                tooltipAttr = ' data-tooltip="' + xfEditor.escapeAttr(imgTooltipContent) + '" data-tooltip-type="' + xfEditor.escapeAttr(imgTooltipType) + '" class="xf_editor-tooltip-trigger"';
                out = "<img src=\"" + safeHref + "\" alt=\"" + safeText + "\"" + tooltipAttr;
                title = "";
            }
            
            if (title) {
                out += " title=\"" + safeTitle + "\"";
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
            
            // 避免 TOC 中出现 ⁑居中对齐标题⁑ 或 ⠪右对齐标题⠪ 这样的原始语法标记
            var tocText = text
                .replace(/⁑(⁖)?/g, "")          // 移除对齐开始标记（居中⁑、左⁑⁖）
                .replace(/⁖⁑/g, "")             // 移除左对齐结束标记
                .replace(/⠪/g, "")              // 移除右对齐标记
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
                text = "<hr style=\"page-break-after:always;\" class=\"page-break xf_editor-page-break\" />";
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
                    // 整个段落是块级公式: $$...$$ → 直接包裹为 xf_editor-tex 块
                    text = text.replace(/^\$\$/, "").replace(/\$\$$/, "");
                    text = restoreTeXBreaks(text);
                    text = this.postProcessInline(text);
                    return "<p class=\"" + xfEditor.classNames.tex + "\" style=\"text-align:center;\">" + text + "</p>\n";
                }
                
                // 段落内混合公式处理
                // Step 1: 先处理 $$...$$ 块级公式（行内块级）
                text = text.replace(/\$\$([^$]+?)\$\$/g, function(match, content) {
                    return '<span class="' + xfEditor.classNames.tex + '" style="display:block;text-align:center;">' + restoreTeXBreaks(content.trim()) + '</span>';
                });
                // Step 2: 再处理 $...$ 行内公式（单美元符）
                text = text.replace(/\$(?!\$)([^$]+?)\$(?!\$)/g, function(match, content) {
                    return '<span class="' + xfEditor.classNames.tex + '">' + restoreTeXBreaks(content) + '</span>';
                });
            }
            
            var tocHTML = "<div class=\"markdown-toc xf_editor-markdown-toc\">" + text + "</div>";
            
            text = this.postProcessInline(text);
            
            return (isToC) ? ( (isToCMenu) ? "<div class=\"xf_editor-toc-menu\">" + tocHTML + "</div><br/>" : tocHTML )
                           : ( (pageBreakReg.test(text)) ? this.pageBreak(text) : "<p>" + this.atLink(text) + "</p>\n" );
        };

        markedRenderer.code = function (code, lang, escaped) { 

            // 扩展语法：代码块支持 class/id/hidden 属性
            // ```(.test_class_dom)  → pre class="test_class_dom"
            // ```(#test_id_dom)     → pre id="test_id_dom"
            // ```js(.myclass)       → pre class="myclass" + code class="lang-js"
            // ```js(#myid)          → pre id="myid"       + code class="lang-js"
            // ```(.cls#id) 或 ```(#id.cls) → 同时设置 class 和 id
            // ```(hidden)           → pre style="display:none!important" (隐藏代码块)
            // ```(hidden.cls#id)    → pre class="cls" id="id" style="display:none!important"
            var preClass = "";
            var preId = "";
            var preHidden = false;
            var cleanLang = lang || "";
            
            if (cleanLang) {
                // 提取 (...) 中的 class/id/hidden 定义
                var attrMatch = cleanLang.match(/\(([^)]+)\)$/);
                if (attrMatch) {
                    var attrStr = attrMatch[1];
                    // 移除括号部分，保留剩余语言标识
                    cleanLang = cleanLang.substring(0, attrMatch.index);
                    // 检测 hidden 标记（作为独立关键词，不以 . 或 # 开头）
                    if (/\bhidden\b/.test(attrStr)) {
                        preHidden = true;
                        // 按 . 分割属性 token，过滤掉独立 "hidden" token
                        // 使用分割方式避免误伤包含 hidden 的复合词（如 hidden-code-secret）
                        var segments = attrStr.split('.');
                        var filtered = [];
                        for (var si = 0; si < segments.length; si++) {
                            if (segments[si] !== 'hidden') {
                                filtered.push(segments[si]);
                            }
                        }
                        attrStr = filtered.join('.');
                        // 清理多余点号
                        attrStr = attrStr.replace(/^\.\.+|\.\.+$|\.{2,}/g, '.').replace(/^\.|\.$/g, '');
                        // 如果过滤后剩余内容非空且不以 # 或 . 开头，补充 . 前缀
                        if (attrStr && !/^[#.]/.test(attrStr)) {
                            attrStr = '.' + attrStr;
                        }
                        if (!attrStr || attrStr === '.') {
                            attrStr = '';
                        }
                    }
                    // 解析 class 和 id
                    var classParts = attrStr.match(/\.([a-zA-Z_][\w\-]*)/g);
                    var idMatch = attrStr.match(/#([a-zA-Z_][\w\-]*)/);
                    if (classParts) {
                        for (var ci = 0; ci < classParts.length; ci++) {
                            preClass += (preClass ? " " : "") + classParts[ci].substring(1);
                        }
                    }
                    if (idMatch) {
                        preId = idMatch[1];
                    }
                }
            }

            if (cleanLang === "seq" || cleanLang === "sequence" || cleanLang === "sequenceDiagram")
            {
                return "<div class=\"sequence-diagram\">" + code + "</div>";
            } 
            else if ( cleanLang === "flow" || cleanLang === "flowChart")
            {
                return "<div class=\"flowchart\">" + code + "</div>";
            } 
            else if ( cleanLang === "math" || cleanLang === "latex" || cleanLang === "katex")
            {
                return "<p class=\"" + xfEditor.classNames.tex + "\">" + code + "</p>";
            }
            else if (cleanLang === "echarts" && settings.echarts)
            {
                var chartId = "xf_editor-echarts-" + Math.random().toString(36).slice(2, 11);
                var config = {};
                try {
                    config = JSON.parse(code);
                } catch(e) {
                    config = { type: "bar", title: { text: "ECharts 配置错误" }, xAxis: { data: ["A"] }, yAxis: {}, series: [{ type: "bar", data: [0] }] };
                }
                var chartHeight = (config.height && typeof config.height === "number") ? config.height : 400;
                return '<div id="' + chartId + '" class="xf_editor-echarts" data-config=\'' + JSON.stringify(config) + '\' style="width:100%;height:' + chartHeight + 'px;"></div>';
            }
            else 
            {
                // 如果有自定义 class/id/hidden，需要修改 pre 标签
                if (preClass || preId || preHidden) {
                    // 先调用默认渲染器生成标准 HTML
                    var defaultOutput = marked.Renderer.prototype.code.call(this, code, cleanLang, escaped);
                    // 修改 <pre> 标签，添加 class / id / hidden style
                    if (preClass) {
                        defaultOutput = defaultOutput.replace(
                            /^(<pre)([\s>])/,
                            '$1 class="' + preClass + '"$2'
                        );
                    }
                    if (preId) {
                        defaultOutput = defaultOutput.replace(
                            /^(<pre(?:\s[^>]*)?)([\s>])/,
                            '$1 id="' + preId + '"$2'
                        );
                    }
                    if (preHidden) {
                        defaultOutput = defaultOutput.replace(
                            /^(<pre(?:\s[^>]*)?)([\s>])/,
                            '$1 style="display:none!important"$2'
                        );
                    }
                    return defaultOutput;
                }
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
    
    xfEditor.markdownToCRenderer = function(toc, container, tocDropdown, startLevel) {
        
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
    
    xfEditor.tocDropdownMenu = function(container, tocTitle) {
        
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
    
    xfEditor.filterHTMLTags = function(html, filters) {
        
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
        
        // ★ v1.17.15-FIX: 保护 <pre> 和 <code> 块，防止代码示例中的 <script>/<style>/<iframe> 等标签被过滤误删
        var xssProtectedBlocks = [];
        var xssProtectId = 0;
        html = html.replace(/(<(pre|code)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi, function(match) {
            var id = "xf_editor-xssp-" + (++xssProtectId);
            xssProtectedBlocks.push({ id: id, html: match });
            return "<!--" + id + "-->";
        });
        
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
        // ★ v1.17.13: 增加 HTML 实体解码后再检测，防止 &#106;avascript: 等编码绕过
        html = html.replace(/(href|src)\s*=\s*["']?([^"'>\s]*)["']?/gi, function(match, attr, url) {
            // 先进行基本清理：移除 null 字节和控制字符
            var cleanUrl = url.replace(/[\x00-\x1f\x7f]+/g, "");
            // HTML 实体解码：处理 &#106;avascript: 等编码绕过
            // 先处理 &#xNN; 格式（十六进制），再处理 &#NN; 格式（十进制），最后处理命名实体
            var decoded = cleanUrl;
            // 解码数字实体 &#xNN; 和 &#NN;
            decoded = decoded.replace(/&#[xX]([0-9a-fA-F]{2});?/g, function(m, hex) {
                return String.fromCharCode(parseInt(hex, 16));
            });
            decoded = decoded.replace(/&#(\d{2,4});?/g, function(m, dec) {
                return String.fromCharCode(parseInt(dec, 10));
            });
            // 移除 HTML 实体分号残留再转小写
            decoded = decoded.replace(/;/g, "");
            var sanitizedUrl = decoded.toLowerCase();
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

        // ★ v1.17.16-FIX: 还原被保护的 <pre>/<code> 块必须在早期返回之前（而不是之后）
        // 否则 htmlDecode: true/false（typeof !== "string"）时会跳过还原，导致代码块消失！
        for (var xpi = 0; xpi < xssProtectedBlocks.length; xpi++) {
            html = html.split("<!--" + xssProtectedBlocks[xpi].id + "-->").join(xssProtectedBlocks[xpi].html);
        }

        // === 用户自定义标签过滤（仅在 htmlDecode 配置了过滤规则时执行） ===
        if (typeof filters !== "string") {
            return html;
        }

        var expression = filters.split("|");
        var filterTags = expression[0].split(",");
        var attrs      = expression[1];

        for (var i = 0, len = filterTags.length; i < len; i++)
        {
            var tag = filterTags[i].trim();
            
            // ★ v1.17.15-FIX: 跳过空标签名，防止生成错误正则
            if (!tag) continue;

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
     * ★ v1.17.16: 从 &lt;code&gt; 元素可靠提取原始代码文本（保留缩进/空格/换行）
     * 使用 innerHTML + 实体解码，比 textContent 更可靠（textContent 在 DOM 结构复杂时可能丢失空白）
     *
     * @param   {HTMLElement|jQuery} el  code 元素
     * @returns {string}                  解码后的原始代码文本
     */
    xfEditor.extractCodeText = function(el) {
        if (!el) return "";
        // ★ v1.17.20: 支持 jQuery 多元素集合 — 逐个提取后合并（如 pre 内嵌多个 code 元素）
        if (el.jquery && el.length > 1) {
            var parts = [];
            for (var i = 0; i < el.length; i++) {
                var part = xfEditor._extractSingleCodeText(el[i]);
                if (part) parts.push(part);
            }
            return parts.join("\n");
        }
        var dom = (el.jquery) ? el[0] : el;
        return xfEditor._extractSingleCodeText(dom);
    };

    /**
     * 从单个 DOM 元素提取原始代码文本（内部方法）
     * @param   {HTMLElement} dom  单个 DOM 元素（code 或 pre）
     * @returns {string}           解码后的原始代码文本
     */
    xfEditor._extractSingleCodeText = function(dom) {
        if (!dom) return "";
        // 使用 innerHTML 获取原始 HTML，这保留了所有空格/换行/实体
        var raw = dom.innerHTML;
        if (!raw) return "";
        // ★ v1.17.19: 先处理 <br> 转回换行
        raw = raw.replace(/<br\s*\/?>/gi, "\n");
        // ★ v1.17.19: 剥离所有 HTML 标签（必须在实体解码之前！否则解码后的 < > 会被贪婪式 <[^>]+> 消耗）
        raw = raw.replace(/<[^>]+>/g, "");
        // ★ v1.17.19: 最后解码 HTML 实体 — &amp; 必须在 &lt;/&gt; 之前，避免 &amp;lt; 被错误拆解
        raw = raw.replace(/&amp;/g, "&")
                 .replace(/&lt;/g, "<")
                 .replace(/&gt;/g, ">")
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'")
                 .replace(/&apos;/g, "'")
                 .replace(/&nbsp;/g, " ");
        // 去除首尾多余的空白行（保留代码内部的空白）
        return raw.replace(/^\n+/, "").replace(/\n+$/, "");
    };

    /**
     * ★ v1.17.20: 将提取的原始代码构建为完整的独立 HTML 页面
     * 用于 tooltip iframe:pre 类型悬浮预览 — 根据代码语言自动选择渲染方式
     * （JS → <script>、CSS → <style>、HTML → <body>、纯文本 → <pre>）
     *
     * @param   {String} code    提取后的原始代码文本
     * @param   {String} langCls pre 元素的 className（用于判断语言）
     * @returns {String}         完整的 HTML 文档字符串
     */
    xfEditor.buildIframeHTML = function(code, langCls) {
        if (!code || !code.trim()) return '<!DOCTYPE html><html><body></body></html>';
        // ★ 已经是完整 HTML 页面，直接使用
        if (/^\s*<!DOCTYPE\s/i.test(code) || /^\s*<html[\s>]/i.test(code) || /<\/html>\s*$/i.test(code)) return code;
        // ★ 检测代码类型：含 HTML 标签 vs 纯 JS/CSS
        var hasHtmlTags = /<[a-zA-Z][\s\S]*>/i.test(code) || /<\/[a-zA-Z]+>/i.test(code);
        var hasScriptTag = /<script[\s>]/i.test(code);
        var isJs = (/lang(uage)?[\s"\x27]*[:=]\s*[\s"\x27]*js|javascript/i.test(langCls));
        var isCss = (/lang(uage)?[\s"\x27]*[:=]\s*[\s"\x27]*css/i.test(langCls));
        if (hasScriptTag || isJs) {
            return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head><body>\n<script>\n' + code + '\n<\/script>\n</body></html>';
        }
        if (isCss) {
            return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><style>\n' + code + '\n</style></head><body><p>CSS 代码已在 style 标签中生效。</p></body></html>';
        }
        if (hasHtmlTags) {
            return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head><body>\n' + code + '\n</body></html>';
        }
        // ★ 默认：作为纯文本展示在 pre 中，使用 textContent 赋值防止 XSS
        var escaped = xfEditor.escapeHTML(code);
        return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head><body>\n<pre style="font-size:13px;line-height:1.6;white-space:pre-wrap;font-family:monospace;">' + escaped + '</pre>\n</body></html>';
    };

    /**
     * Static helper: Inject "Copy" buttons into every <pre> block inside a container.
     * Places a floating copy button at the top-right corner of each pre.
     * The button is absolute-positioned and does not scroll with code content.
     *
     * @param {jQuery} $container  The container element (jQuery object)
     */
    xfEditor.initCodeCopy = function($container) {
        var classPrefix = xfEditor.defaults ? xfEditor.defaults.classPrefix || "xf_editor-" : "xf_editor-";
        var copyText    = "复制";
        var copiedText  = "已复制";
        var failedText  = "复制失败";

        $container.find("pre").each(function() {
            var $pre = $(this);

            // 跳过隐藏的 pre 代码块（hidden 属性），避免无意义的 DOM 操作
            if ($pre[0] && $pre[0].style && $pre[0].style.display === "none") return;

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

                // ★ v1.17.16: 优先读取存储的原始代码，fallback 用 extractCodeText 保留完整格式
                var code = $pre.data("_originalCode");
                if (!code) {
                    var $code = $pre.find("code");
                    code = $code.length > 0
                        ? xfEditor.extractCodeText($code)
                        : xfEditor.extractCodeText($pre.clone().find("." + classPrefix + "code-copy-btn").remove().end());
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
    xfEditor.initTooltips = function($container) {
        if (!$container || $container.length === 0) return;
        
        // Clean up orphaned tooltip popups from previous renders before re-initializing
        $("body").children(".xf_editor-tooltip-popup").each(function() {
            // 释放 Blob URL（iframe:pre 类型会创建 Blob URL）
            var $popup = $(this);
            var blobUrl = $popup.attr("data-blob-url");
            if (blobUrl) {
                try { (window.URL || window.webkitURL).revokeObjectURL(blobUrl); } catch(e) {}
            }
        }).remove();
        
        $container.find(".xf_editor-tooltip-trigger").each(function() {
            var $trigger = $(this);
            if ($trigger.attr("data-tooltip-initialized") === "true") {
                return;
            }
            
            var tooltipType    = $trigger.attr("data-tooltip-type") || "text";
            var tooltipContent = $trigger.attr("data-tooltip");
            var tooltipWidth   = $trigger.attr("data-tooltip-width") || "";
            var tooltipHeight  = $trigger.attr("data-tooltip-height") || "";
            
            if (tooltipType === "html") {
                tooltipContent = xfEditor.base64Decode($trigger.attr("data-tooltip-html") || "");
                if (!tooltipContent) return;
            } else if (!tooltipContent) {
                return;
            }
            
            // 构造 tooltip 内容 HTML（v1.12.1: 精确尺寸限制 + 加载状态）
            var tooltipHtml = '';
            var _rawPreCode = null; // iframe:pre 类型：存储原始代码，每次 hover 动态创建 Blob URL
            if (tooltipType === "image") {
                var imgStyle = 'display:none;';
                if (tooltipWidth) imgStyle += 'width:' + tooltipWidth + 'px;max-width:' + tooltipWidth + 'px;';
                else imgStyle += 'max-width:340px;';
                if (tooltipHeight) imgStyle += 'height:' + tooltipHeight + 'px;max-height:' + tooltipHeight + 'px;';
                else imgStyle += 'max-height:220px;';
                if (tooltipWidth || tooltipHeight) imgStyle += 'object-fit:contain;';
                tooltipHtml = '<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><img src="' + xfEditor.escapeAttr(tooltipContent) + '" alt="" style="' + imgStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);" onerror="$(this).prev().html(\'<span>图片加载失败</span>\');" />';
            } else if (tooltipType === "iframe") {
                // 新增 iframe:pre 类型：提取页面中指定 pre 元素内容并以 iframe 展示
                // 语法：[text](tooltip:iframe:pre#id) 或 [text](tooltip:iframe:pre.class)
                // 支持 hidden 代码块：当通过 iframe:pre 引用隐藏的 pre（```(hidden)）时，
                // 提取的原始文本内容在 Blob 中独立渲染，不受原 pre 的 display:none!important 影响
                var iframeSrc = tooltipContent;
                var isPreContent = false;
                // 安全校验：确保 pre 选择器后必须有至少一个有效 CSS 标识符字符，防止 $("pre#") / $("pre.") 报错
                // 允许连字符开头（CSS 规范合法但少用），如 pre.--my-class
                if (tooltipContent && /^pre[#.][a-zA-Z_\-][\w\-]*$/.test(tooltipContent)) {
                    var preSelector = tooltipContent; // 如 "pre#test_id_dom" 或 "pre.test_class_dom"
                    var $pre;
                    try {
                        $pre = $(preSelector);
                    } catch(e) {
                        $pre = $([]);
                    }
                    if ($pre.length > 0) {
                        isPreContent = true;
                        // ★ v1.17.20: 使用 extractCodeText 提取原始代码，再通过 buildIframeHTML 包裹为完整 HTML 页面
                        // 这样 iframe 中的 JS/CSS 可以正常执行，纯文本也会在 <pre> 标签中正确显示
                        var rawCode = ($pre.find("code").length > 0) ? xfEditor.extractCodeText($pre.find("code")) : xfEditor.extractCodeText($pre);
                        var langCls = $pre[0].className || "";
                        _rawPreCode = xfEditor.buildIframeHTML(rawCode, langCls);
                    }
                }
                var iframeStyle = 'display:none;';
                if (tooltipWidth) iframeStyle += 'width:' + tooltipWidth + 'px;max-width:' + tooltipWidth + 'px;';
                else iframeStyle += 'width:340px;';
                if (tooltipHeight) iframeStyle += 'height:' + tooltipHeight + 'px;max-height:' + tooltipHeight + 'px;';
                else iframeStyle += 'height:210px;';
                if (isPreContent) {
                    // iframe:pre 类型：初始 src 留空，在 showTooltip 时动态注入 Blob URL
                    tooltipHtml = '<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><iframe src="about:blank" frameborder="0" style="' + iframeStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);"></iframe>';
                } else if (tooltipContent && /^pre[#.][a-zA-Z_\-][\w\-]*$/.test(tooltipContent)) {
                    // pre 选择器模式匹配但 DOM 中未找到对应元素（如元素尚未渲染、选择器拼写错误等）
                    // 防御性处理：使用 about:blank 避免将 "pre.xxx" 当作相对 URL 发起 404 请求
                    console.warn('iframe:pre tooltip: 未找到 pre 元素 "' + tooltipContent + '"，请检查选择器是否正确。');
                    tooltipHtml = '<div class="xf_editor-tooltip-loading" style="display:flex;align-items:center;justify-content:center;color:#888;font-size:12px;"><span>Pre 元素不存在</span></div><iframe src="about:blank" frameborder="0" style="' + iframeStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);"></iframe>';
                } else {
                    tooltipHtml = '<div class="xf_editor-tooltip-loading"><span>加载中...</span></div><iframe src="' + xfEditor.escapeAttr(tooltipContent) + '" frameborder="0" style="' + iframeStyle + '" onload="$(this).prev().hide();$(this).fadeIn(200);"></iframe>';
                }
            } else if (tooltipType === "html") {
                    // ★ v1.17.22 XSS 防护：将 HTML 内容转为纯文本后重新包裹，防止 XSS 注入
                    var safeHtml = xfEditor.escapeHTML(tooltipContent);
                    tooltipHtml = '<div class="xf_editor-tooltip-html-content">' + safeHtml + '</div>';
            } else if (tooltipType === "html-selector") {
                    tooltipHtml = '<div class="xf_editor-tooltip-html-content xf_editor-tooltip-selector-loading">正在加载HTML内容...</div>';
            } else {
                // 文本类型：包裹在 .xf_editor-tooltip-text-content 中，XSS 防护：escapeHTML 转义
                tooltipHtml = '<div class="xf_editor-tooltip-text-content">' + xfEditor.escapeHTML(tooltipContent) + '</div>';
            }
            
            var $tooltip = $('<div class="xf_editor-tooltip-popup xf_editor-tooltip-' + tooltipType + '">' + tooltipHtml + '</div>');
            
            // iframe:pre 类型：存储原始代码内容，每次 hover 时动态创建 Blob URL
            if (isPreContent && _rawPreCode) {
                $tooltip.attr("data-iframepre-code", _rawPreCode);
            }
            
            // ★ v1.17.0: Tooltip 固定宽高时启用滚动条
            if (tooltipWidth) {
                $tooltip.css({width: tooltipWidth + "px", "max-width": tooltipWidth + "px"});
                $tooltip.find("img,iframe,div.xf_editor-tooltip-html-content,div.xf_editor-tooltip-text-content").css("max-width", tooltipWidth + "px");
            }
            if (tooltipHeight) {
                $tooltip.css({height: tooltipHeight + "px", "max-height": tooltipHeight + "px"});
                $tooltip.find("img,iframe,div.xf_editor-tooltip-html-content,div.xf_editor-tooltip-text-content").css("max-height", tooltipHeight + "px");
            }
            // ★ v1.17.0: 固定尺寸时自动溢出滚动
            if (tooltipWidth || tooltipHeight) {
                var overflowX = tooltipWidth ? "auto" : "hidden";
                var overflowY = tooltipHeight ? "auto" : "hidden";
                $tooltip.css({overflowX: overflowX, overflowY: overflowY});
                // 内容区也设置滚动
                $tooltip.find(".xf_editor-tooltip-text-content,.xf_editor-tooltip-html-content").css({
                    overflowY: tooltipHeight ? "auto" : "hidden",
                    overflowX: tooltipWidth ? "auto" : "hidden",
                    maxWidth: tooltipWidth ? tooltipWidth + "px" : "",
                    maxHeight: tooltipHeight ? tooltipHeight + "px" : ""
                });
            }
            
            // ★ v1.17.2: 为 image/iframe/html/html-selector 类型添加最大化和关闭按钮
            // 注意：text 文本类型不添加按钮（文字悬浮提示无需最大化）
            var $maxBtn, $closeBtn;
            var _origCss = {};
            var _isMaximized = false;
            
            if (tooltipType !== "text") {
                // 最大化按钮 — 使用 □ (最大化) / ❐ (还原) 图标
                $maxBtn = $('<button class="xf_editor-tooltip-max-btn" title="最大化">□</button>');
                // 关闭按钮
                $closeBtn = $('<button class="xf_editor-tooltip-close-btn" title="关闭">✕</button>');
                
                // 将按钮添加到 tooltip
                $tooltip.append($maxBtn).append($closeBtn);
            }
            
            // ★ v1.17.2: 最大化/还原功能（image/iframe/html/html-selector 类型，自适应宽高）
            if ($maxBtn) {
                $maxBtn.on("click", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    clearTimeout($trigger.data("tooltip-timer"));
                    
                    if (!_isMaximized) {
                    // ============ 进入最大化 ============
                    // 保存所有原始样式（包括自适应状态）
                    _origCss = {
                        width: $tooltip.css("width"),
                        height: $tooltip.css("height"),
                        maxWidth: $tooltip.css("max-width"),
                        maxHeight: $tooltip.css("max-height"),
                        minWidth: $tooltip.css("min-width"),
                        minHeight: $tooltip.css("min-height"),
                        left: $tooltip.css("left"),
                        top: $tooltip.css("top"),
                        position: $tooltip.css("position"),
                        borderRadius: $tooltip.css("border-radius"),
                        overflowX: $tooltip.css("overflow-x"),
                        overflowY: $tooltip.css("overflow-y")
                    };
                    // 保存内部内容元素的原始样式
                    _origCss._innerStyles = [];
                    $tooltip.children("img,iframe,div.xf_editor-tooltip-html-content,div.xf_editor-tooltip-text-content,.xf_editor-tooltip-loading").each(function() {
                        var $el = $(this);
                        _origCss._innerStyles.push({
                            el: this,
                            width: $el.css("width"),
                            height: $el.css("height"),
                            maxWidth: $el.css("max-width"),
                            maxHeight: $el.css("max-height"),
                            display: $el.css("display")
                        });
                    });
                    
                    // 设置为全屏尺寸
                    $tooltip.css({
                        width: "96vw",
                        height: "92vh",
                        maxWidth: "96vw",
                        maxHeight: "92vh",
                        minWidth: "0",
                        minHeight: "0",
                        left: "2vw",
                        top: "3vh",
                        borderRadius: "4px",
                        overflowX: "auto",
                        overflowY: "auto",
                        position: "fixed"
                    });
                    
                    // 调整内部内容元素尺寸
                    $tooltip.children("img,iframe,div.xf_editor-tooltip-html-content,div.xf_editor-tooltip-text-content,.xf_editor-tooltip-loading").css({
                        width: "100%",
                        height: "calc(100% - 36px)",
                        maxWidth: "100%",
                        maxHeight: "calc(100% - 36px)"
                    });
                    
                    $maxBtn.text("❐").attr("title", "还原尺寸");
                    _isMaximized = true;
                } else {
                    // ============ 退出最大化，恢复原始尺寸 ============
                    // 恢复 tooltip 容器样式
                    $tooltip.css({
                        width: _origCss.width || "",
                        height: _origCss.height || "",
                        maxWidth: _origCss.maxWidth || "",
                        maxHeight: _origCss.maxHeight || "",
                        minWidth: _origCss.minWidth || "",
                        minHeight: _origCss.minHeight || "",
                        left: _origCss.left || "",
                        top: _origCss.top || "",
                        position: _origCss.position || "",
                        borderRadius: _origCss.borderRadius || "",
                        overflowX: _origCss.overflowX || "",
                        overflowY: _origCss.overflowY || ""
                    });
                    
                    // ★ 恢复内部内容元素的原始样式（包括自适应状态）
                    if (_origCss._innerStyles) {
                        for (var si = 0; si < _origCss._innerStyles.length; si++) {
                            var s = _origCss._innerStyles[si];
                            if (s.el && s.el.style) {
                                s.el.style.width = s.width || "";
                                s.el.style.height = s.height || "";
                                s.el.style.maxWidth = s.maxWidth || "";
                                s.el.style.maxHeight = s.maxHeight || "";
                                s.el.style.display = s.display || "";
                            }
                        }
                    }
                    
                    $maxBtn.text("□").attr("title", "最大化");
                    _isMaximized = false;
                }
                
                // Force reflow
                $tooltip[0] && $tooltip[0].offsetHeight;
            });
            } // end if ($maxBtn)
            
            // 关闭功能
            if ($closeBtn) {
                $closeBtn.on("click", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    clearTimeout($trigger.data("tooltip-timer"));
                    $tooltip.removeClass("show");
                    // 释放 Blob URL
                    var blobUrl2 = $tooltip.attr("data-blob-url");
                    if (blobUrl2) {
                        try { (window.URL || window.webkitURL).revokeObjectURL(blobUrl2); } catch(ex) {}
                        $tooltip.removeAttr("data-blob-url");
                    }
                    setTimeout(function() {
                        if (!$tooltip.hasClass("show")) {
                            $tooltip.css({ display: "none" });
                        }
                    }, 220);
                });
            }
            
            $("body").append($tooltip);
            
            /**
             * 显示 tooltip —— 使用 viewport-relative 定位，使 tooltip 显示在触发元素上方
             */
            var showTooltip = function(e) {
                clearTimeout($trigger.data("tooltip-timer"));
                
                // iframe:pre 类型：每次 hover 动态创建 Blob URL，确保 JS 重新执行
                var iframePreCode = $tooltip.attr("data-iframepre-code");
                if (iframePreCode) {
                    // 先释放上一次的 Blob URL
                    var oldBlob = $tooltip.attr("data-blob-url");
                    if (oldBlob) {
                        try { (window.URL || window.webkitURL).revokeObjectURL(oldBlob); } catch(ex) {}
                        $tooltip.removeAttr("data-blob-url");
                    }
                    // 创建新的 Blob URL（浏览器会将内容作为完整 HTML 渲染）
                    try {
                        var newBlob = new Blob([iframePreCode], {type: 'text/html;charset=utf-8'});
                        var newBlobUrl = (window.URL || window.webkitURL).createObjectURL(newBlob);
                        $tooltip.attr("data-blob-url", newBlobUrl);
                        // 显示 loading，隐藏 iframe，设置新 src 触发 onload
                        $tooltip.find(".xf_editor-tooltip-loading").show();
                        $tooltip.find("iframe").hide().attr("src", newBlobUrl);
                    } catch(ex) {
                        // 降级：使用 data: URI
                        $tooltip.find(".xf_editor-tooltip-loading").show();
                        $tooltip.find("iframe").hide().attr("src", 'data:text/html;charset=utf-8,' + encodeURIComponent(iframePreCode));
                    }
                }
                
                // 如果是 html-selector 类型，需要动态加载DOM元素内容
                if (tooltipType === "html-selector") {
                    // 查找页面中的DOM元素
                    var selector = tooltipContent;
                    var $target = $(selector);
                    
                    if ($target.length > 0) {
                        // 克隆目标元素，移除隐藏属性（如display:none, visibility:hidden, opacity:0等）
                        var $clone = $target.clone();
                        
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
                        
                        // ★ v1.17.22 XSS 防护：移除克隆元素中所有内联事件处理器 (on*) 属性
                        $clone.find('*').addBack().each(function() {
                            var attrs = this.attributes;
                            if (attrs) {
                                var toRemove = [];
                                for (var a = 0; a < attrs.length; a++) {
                                    if (/^on/i.test(attrs[a].name)) toRemove.push(attrs[a].name);
                                }
                                for (var r = 0; r < toRemove.length; r++) {
                                    this.removeAttribute(toRemove[r]);
                                }
                            }
                        });
                        
                        // 更新tooltip内容（安全防护：已剥离 on* 事件属性后使用 outerHTML）
                        var cloneHtml = $clone[0] ? $clone[0].outerHTML : '';
                        $tooltip.html('<div class="xf_editor-tooltip-html-content">' + cloneHtml + '</div>');
                        $tooltip.removeClass('xf_editor-tooltip-text xf_editor-tooltip-image xf_editor-tooltip-iframe xf_editor-tooltip-html');
                        $tooltip.addClass('xf_editor-tooltip-html');
                    } else {
                        // 未找到元素，显示错误信息
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn('HTML selector tooltip - element not found:', selector);
                        }
                        $tooltip.html('<div class="xf_editor-tooltip-html-content" style="color: #ff6b6b; padding: 10px; font-size: 12px;">未找到元素: <code>' + xfEditor.escapeHTML(selector) + '</code><br>请检查CSS选择器是否正确，元素是否存在于页面中。</div>');
                    }
                }
                
                // 先临时显示以获取真实尺寸
                $tooltip.css({ display: "block", visibility: "hidden" });
                
                // 使用 getBoundingClientRect() 获取 viewport-relative 坐标
                // 空值防护：如果 trigger 元素已不存在于 DOM 中则直接返回
                if (!$trigger[0]) {
                    $tooltip.css({ display: "none", visibility: "hidden" });
                    return;
                }
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
                if (left + tooltipW > winW - 10) left = Math.max(10, winW - tooltipW - 10);
                
                if (top < 10) {
                    // 上方空间不足，显示在下方
                    top = triggerRect.bottom + 8;
                    if (top + tooltipH > winH - 10) {
                        top = Math.max(10, winH - tooltipH - 10);
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
                    // 释放 iframe:pre 类型的 Blob URL，避免内存泄漏
                    var blobUrl = $tooltip.attr("data-blob-url");
                    if (blobUrl) {
                        try { (window.URL || window.webkitURL).revokeObjectURL(blobUrl); } catch(ex) {}
                        $tooltip.removeAttr("data-blob-url");
                    }
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
                    // ★ v1.17.22 释放 iframe:pre 类型的 Blob URL，避免内存泄漏
                    var blobUrl2 = $tooltip.attr("data-blob-url");
                    if (blobUrl2) {
                        try { (window.URL || window.webkitURL).revokeObjectURL(blobUrl2); } catch(ex) {}
                        $tooltip.removeAttr("data-blob-url");
                    }
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
     * 统一构建 rendererOptions 静态版本（供 markdownToHTML 等静态方法使用）
     * @private
     */
    xfEditor._buildRendererOptionsStatic = function(settings, overrides) {
        return $.extend({
            toc           : false, tocm : false, tocStartLevel : 1,
            taskList      : settings.taskList, tex : settings.tex,
            pageBreak     : settings.pageBreak, atLink : settings.atLink,
            emailLink     : settings.emailLink, flowChart : settings.flowChart,
            sequenceDiagram : settings.sequenceDiagram,
            previewCodeHighlight : settings.previewCodeHighlight,
            pinyin        : settings.pinyin, textAlign : settings.textAlign,
            imageResize   : settings.imageResize, echarts : settings.echarts,
            tabs          : settings.tabs, columns : settings.columns,
            grid          : settings.grid, pageBlock : settings.pageBlock,
            tooltip       : settings.tooltip, copybook : settings.copybook,
            video         : settings.video, fileList : settings.fileList
        }, overrides || {});
    };

    /**
     * 统一 Markdown 渲染管线（保护→预处理→marked 渲染→还原后处理）
     * 被 save()/getHTML()/getPreviewedHTML()/markdownToHTML() 共用
     * @private
     * @param {String} markdown 原始 Markdown
     * @param {Object} markedOpts marked 解析选项
     * @param {Object} rendererOpts renderer 选项（用于 preprocessMarkdownBlocks）
     * @param {Object} settings 编辑器设置
     * @returns {String} 渲染后的 HTML
     */
    xfEditor._renderMarkdownPipeline = function(markdown, markedOpts, rendererOpts, settings) {
        var mdProtected = xfEditor.protectTeXSyntax(markdown);
        mdProtected = xfEditor.preprocessLinkTarget(mdProtected);
        var mdPreprocess = xfEditor.preprocessMarkdownBlocks(mdProtected, rendererOpts);
        var html = (xfEditor.$marked || marked)(mdPreprocess.markdown, markedOpts);
        html = xfEditor.restorePlaceholders(html, mdPreprocess.placeholders);
        html = xfEditor.restoreTeXSyntax(html);
        html = xfEditor.fixSmartypantsHTML(html);
        html = xfEditor.fixTableEmptyCells(html);
        if (settings.taskList) html = xfEditor.postProcessTaskLists(html);
        return xfEditor.filterHTMLTags(html, settings.htmlDecode);
    };

    /**
     * 将Markdown文档解析为HTML用于前台显示
     * Parse Markdown to HTML for Font-end preview.
     * 
     * @param   {String}   id            用于显示HTML的对象ID
     * @param   {Object}   [options={}]  配置选项，可选
     * @returns {Object}   div           返回jQuery对象元素
     */
    
    xfEditor.markdownToHTML = function(id, options) {
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
            atLink               : true,
            emailLink            : true,
            tex                  : false,
            taskList             : true,
            pinyin               : false,
            textAlign            : true,
            imageResize          : true,
            flowChart            : false,
            sequenceDiagram      : false,
            previewCodeHighlight : true,
            echarts              : false,
            tabs                 : true,
            columns              : true,
            pageBlock            : true,
            video                : true,
            file                 : true,
            tooltip              : true,
            copybook             : true
        };
        
        xfEditor.$marked  = (typeof marked !== "undefined") ? marked : null;

        // ★ v1.17.18: 验证 target element 是否存在
        var div           = $("#" + id);
        if (div.length === 0) {
            if (typeof console !== "undefined" && console.error) {
                console.error("[xfEditor] markdownToHTML: 找不到目标元素 #" + id);
            }
            return;
        }
        var settings      = div.settings = $.extend(true, defaults, options || {});
        var saveTo        = div.find("textarea");
        
        if (saveTo.length < 1)
        {
            div.append("<textarea></textarea>");
            saveTo        = div.find("textarea");
        }        
        
        var markdownDoc   = (settings.markdown === "") ? saveTo.val() : settings.markdown; 
        var markdownToC   = [];

        // ★ 使用统一的 rendererOptions 构造函数和渲染管线
        var rendererOptions = xfEditor._buildRendererOptionsStatic(settings, {
            toc: settings.toc,
            tocm: settings.tocm,
            tocStartLevel: settings.tocStartLevel
        });

        var markedOptions = {
            renderer    : xfEditor.markedRenderer(markdownToC, rendererOptions),
            gfm         : settings.gfm,
            tables      : true,
            breaks      : true,
            pedantic    : false,
            sanitize    : false,
            smartLists  : true,
            smartypants : true
        };
        
        markdownDoc = new String(markdownDoc);
        var markdownParsed = xfEditor._renderMarkdownPipeline(markdownDoc, markedOptions, rendererOptions, settings);
        
        if (settings.markdownSourceCode) {
            saveTo.text(markdownDoc);
        } else {
            saveTo.remove();
        }
        
        div.addClass("markdown-body " + this.classPrefix + "html-preview").append(markdownParsed);
        
        // ★ v1.17.9-FIX: markdownToHTML 模式下脚注点击跳转处理
        // 编辑器模式下由 init() 中的事件委托处理，此处为纯预览模式添加
        div.off("click.xf_editor-md-footnote").on("click.xf_editor-md-footnote",
            ".xf_editor-footnote-ref-wrapper a[href^='#xf_editor-fn-'], " +
            ".xf_editor-copybook-footnote a[href^='#xf_editor-fn-'], " +
            ".xf_editor-footnote-backref[href^='#xf_editor-fnref-']",
            function(e) {
                var href = $(this).attr("href");
                if (!href || href === "#") return;
                
                var targetId = decodeURIComponent(href.substring(1));
                var targetEl = null;
                try {
                    targetEl = div[0].querySelector('[id="' + CSS.escape(targetId) + '"]');
                } catch(_) {
                    targetEl = div[0].querySelector('[id="' + targetId.replace(/"/g, '\\"') + '"]');
                }
                
                if (targetEl && div[0].contains(targetEl)) {
                    e.preventDefault();
                    e.stopPropagation();
                    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    var $target = $(targetEl);
                    $target.addClass("xf_editor-footnote-highlight");
                    setTimeout(function() {
                        $target.removeClass("xf_editor-footnote-highlight");
                    }, 2000);
                }
            }
        );
        
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
                div.find(".xf_editor-toc-menu, .xf_editor-markdown-toc").remove();
            }
        }
            
        if (settings.previewCodeHighlight) 
        {
            // ★ v1.17.16: 使用 extractCodeText 提取原始代码（保留缩进/换行/空格）
            div.find("pre").each(function() {
                var $pre = $(this);
                var $code = $pre.find("code");
                if ($code.length > 0 && $pre.data("_originalCode") === undefined) {
                    $pre.data("_originalCode", xfEditor.extractCodeText($code));
                }
            });
            div.find("pre").addClass("prettyprint linenums");
            // ★ 方案 B: 若 prettyPrint 全局函数可用，执行高亮；否则忽略（已保存原始代码）
            if (typeof prettyPrint !== "undefined" && prettyPrint) {
                prettyPrint();
            }
        }

        // 向所有 pre 代码块注入复制按钮
        xfEditor.initCodeCopy(div);
        
        if (!xfEditor.isIE8) 
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
                    xfEditor.loadScript(xfEditor.defaults.path + "raphael.min", function() {
                        xfEditor.loadScript(xfEditor.defaults.path + "underscore.min", function() {
                            var mdPending = 0;
                            var mdCheckDone = function() {
                                mdPending--;
                                if (mdPending <= 0) mdRenderFs();
                            };
                            if (mdHasFlowChart && typeof flowchart === "undefined") {
                                mdPending++;
                                xfEditor.loadScript(xfEditor.defaults.path + "flowchart.min", function() {
                                    xfEditor.loadScript(xfEditor.defaults.path + "jquery.flowchart.min", mdCheckDone);
                                });
                            }
                            if (mdHasSequence && typeof Diagram === "undefined") {
                                mdPending++;
                                xfEditor.loadScript(xfEditor.defaults.path + "sequence-diagram.min", mdCheckDone);
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
                div.find("." + xfEditor.classNames.tex).each(function(){
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
                });
            };
            
            if (settings.autoLoadKaTeX && !xfEditor.$katex && !xfEditor.kaTeXLoaded)
            {
                // 使用 xfEditor.defaults.path 作为 KaTeX 资源加载的基础路径
                    var katexBasePath = settings.path || xfEditor.defaults.path || "";
                this.loadKaTeX(katexBasePath, function() {
                    xfEditor.$katex      = katex;
                    xfEditor.kaTeXLoaded = true;
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
            // 移除旧的 resize 处理器防止累积（使用通配命名空间）
            $(window).off("resize.xf_editor-echarts-md");
            $(window).off("resize.xf_editor-echarts-md-chart-");
            
            var initMdECharts = function() {
                // 自动检测主题：优先从 options.theme，其次从 div 上溯查找 theme-* class
                var mdTheme = settings.theme;
                if (!mdTheme) {
                    var $themeParent = div.closest('[class*="theme-"]');
                    if ($themeParent.length) {
                        var m = $themeParent.attr("class").match(/(?:^|\s)theme-(\w+)/);
                        if (m) mdTheme = m[1];
                    }
                }

                div.find(".xf_editor-echarts").each(function() {
                    var $chart = $(this);
                    if ($chart.attr("data-initialized") === "true") return;
                    if ($chart.is(":hidden") || $chart.width() === 0 || $chart.height() === 0) return;

                    var config = {};
                    try {
                        config = JSON.parse($chart.attr("data-config"));
                    } catch(e) { return; }

                    try {
                        var chartMdTheme = config.theme || mdTheme || undefined;
                        var chartInstance = echarts.init(this, chartMdTheme);
                        var option = {
                            title: config.title || {},
                            tooltip: config.tooltip || {},
                            series: config.series || []
                        };
                        if (config.legend !== undefined) option.legend = config.legend;
                        if (config.radar !== undefined) option.radar = config.radar;

                        var chartType = config.type || (config.series && config.series[0] && config.series[0].type) || "";
                        var noAxisTypes = ["pie", "funnel", "gauge", "graph", "treemap", "sunburst", "tree"];
                        if (noAxisTypes.indexOf(chartType) === -1) {
                            option.xAxis = config.xAxis || {};
                            option.yAxis = config.yAxis || {};
                        } else if (config.tooltip === undefined) {
                            option.tooltip = { trigger: "item" };
                        }
                        if (config.backgroundColor !== undefined) option.backgroundColor = config.backgroundColor;
                        if (config.grid !== undefined) option.grid = config.grid;
                        if (config.dataZoom !== undefined) option.dataZoom = config.dataZoom;
                        if (config.visualMap !== undefined) option.visualMap = config.visualMap;
                        if (config.toolbox !== undefined) option.toolbox = config.toolbox;

                        chartInstance.setOption(option);
                        chartInstance.resize();
                        $chart.attr("data-initialized", "true");
                        // 使用 chart id 作为命名空间，避免多个 ECharts 实例共享同一 resize handler
                        var mdEcId = $chart.attr("id") || ("md-ec-" + Math.random().toString(36).slice(2, 9));
                        $(window).on("resize.xf_editor-echarts-md-chart-" + mdEcId, function() { chartInstance.resize(); });
                    } catch(e) {
                        if (typeof console !== "undefined" && console.warn) {
                            console.warn("[xfEditor] ECharts markdownToHTML init failed:", e.message);
                        }
                    }
                });
            };

            if (typeof echarts === "undefined") {
                xfEditor.loadScript(xfEditor.defaults.path + "echarts.min", function() {
                    initMdECharts();
                });
            } else {
                initMdECharts();
            }
        }
        
        if (settings.tabs)
        {
            div.find(".xf_editor-tabs").each(function() {
                var $tabs = $(this);
                if ($tabs.attr("data-initialized") === "true") {
                    return;
                }
                var $nav = $tabs.find("> .xf_editor-tab-nav");
                var $body = $tabs.find("> .xf_editor-tab-body");
                $nav.on("click", "> li", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $li = $(this);
                    var index = $li.attr("data-index");
                    $nav.find("> li").removeClass("active");
                    $li.addClass("active");
                    $body.find("> .xf_editor-tab-panel").removeClass("active");
                    var $panel = $body.find('> .xf_editor-tab-panel[data-index="' + index + '"]');
                    $panel.addClass("active");
                    // 面板变为可见后，重新初始化隐藏的 ECharts 图表
                    if ($panel.length && typeof initMdECharts === "function") {
                        setTimeout(function() { initMdECharts(); }, 100);
                    }
                });
                $tabs.attr("data-initialized", "true");
            });
        }

        if (settings.columns)
        {
            div.find(".xf_editor-columns").each(function() {
                var $cols = $(this);
                if ($cols.attr("data-initialized") === "true") {
                    return;
                }
                var count = parseInt($cols.attr("data-count"), 10) || 2;
                $cols.find(".xf_editor-column-divider").remove();
                $cols.css("position", "relative");
                for (var i = 1; i < count; i++) {
                    var $divider = $('<div class="xf_editor-column-divider"></div>');
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
            xfEditor.initTooltips(div);
        }
        
        div.getMarkdown = function() {            
            return saveTo.val();
        };
        
        return div;
    };
    
    // xfEditor 编辑器主题列表（用于切换工具栏等主题）
    // 自 v1.5.0 起添加
    xfEditor.themes        = ["default", "dark"];
    
    // 预览区主题列表
    // added @1.5.0
    xfEditor.previewThemes = ["default", "dark"];
    
    // CodeMirror / 编辑区主题列表
    // 自 v1.5.0 起重命名为 editorThemes，旧版本为 themes
    xfEditor.editorThemes = [
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

    xfEditor.loadPlugins = {};
    
    xfEditor.loadFiles = {
        js     : [],
        css    : [],
        plugin : []
    };
    
    /**
     * 动态加载xfEditor插件，但不立即执行
     * Load xfEditor plugins
     * 
     * @param {String}   fileName              插件文件路径
     * @param {Function} [callback=function()] 加载成功后执行的回调函数
     * @param {String}   [into="head"]         嵌入页面的位置
     */
    
    xfEditor.loadPlugin = function(fileName, callback, into) {
        callback   = callback || function() {};
        
        this.loadScript(fileName, function() {
            xfEditor.loadFiles.plugin.push(fileName);
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
    
    xfEditor.loadCSS   = function(fileName, callback, into) {
        into       = into     || "head";        
        callback   = callback || function() {};
        
        if ($.inArray(fileName, xfEditor.loadFiles.css) >= 0) {
            callback();
            return;
        }
        
        var css    = document.createElement("link");
        css.type   = "text/css";
        css.rel    = "stylesheet";
        
        if (xfEditor.isIE8) 
        {            
            css.onreadystatechange = function() {
                if (css.readyState) 
                {
                    if (css.readyState === "loaded" || css.readyState === "complete") 
                    {
                        css.onreadystatechange = null; 
                        xfEditor.loadFiles.css.push(fileName);
                        callback();
                    }
                } 
            };
        }
        else
        {
            css.onload = function() {
                xfEditor.loadFiles.css.push(fileName);
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
    
    /**
     * 动态加载JS文件的方法
     * Load javascript file method
     * 
     * @param {String}   fileName              JS文件名
     * @param {Function} [callback=function()] 加载成功后执行的回调函数
     * @param {String}   [into="head"]         嵌入页面的位置
     */

    xfEditor.loadScript = function(fileName, callback, into) {
        
        into          = into     || "head";
        callback      = callback || function() {};
        
        if ($.inArray(fileName, xfEditor.loadFiles.js) >= 0) {
            callback();
            return;
        }
        
        var script    = null; 
        script        = document.createElement("script");
        script.id     = fileName.replace(/[\./]+/g, "-");
        script.type   = "text/javascript";        
        script.src    = (/\.js$/i.test(fileName)) ? fileName : (fileName + ".js");
        
        if (xfEditor.isIE8) 
        {            
            script.onreadystatechange = function() {
                if(script.readyState) 
                {
                    if (script.readyState === "loaded" || script.readyState === "complete") 
                    {
                        script.onreadystatechange = null; 
                        xfEditor.loadFiles.js.push(fileName);
                        callback();
                    }
                } 
            };
        }
        else
        {
            script.onload = function() {
                xfEditor.loadFiles.js.push(fileName);
                callback();
            };
        }
        
        // 优雅处理脚本加载失败
        script.onerror = function() {
            // 记录加载失败，让调用方能够感知
            if (!xfEditor.loadFiles.failed) {
                xfEditor.loadFiles.failed = [];
            }
            xfEditor.loadFiles.failed.push(fileName);
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
    // 用户可以通过 xfEditor.katexURL 覆盖为完整 URL（如 CDN 地址）
    xfEditor.katexURL  = {
        css : "katex/katex.min.css",
        js  : "katex/katex.min.js"
    };
    
    xfEditor.kaTeXLoaded = false;
    
    /**
     * 自动检测 xfEditor.js 所在的基路径，用于解决子目录下部署时资源 404 的问题
     * @private
     * @returns {String} 返回基路径（末尾带 /），如 "../" 或 "./lib/"
     */
    xfEditor._resolveBasePath = function() {
        // 尝试从加载 xfEditor.js 的 script 标签推断基路径
        if (document.currentScript && document.currentScript.src) {
            var src = document.currentScript.src;
            var match = src.match(/^(.*\/)xfEditor/);
            if (match) {
                return match[1];
            }
        }
        // 回退：遍历所有 script 标签查找 xf_editor
        var scripts = document.getElementsByTagName("script");
        for (var i = scripts.length - 1; i >= 0; i--) {
            var s = scripts[i];
            if (s.src && (s.src.indexOf("xf_editor") !== -1)) {
                var m = s.src.match(/^(.*\/)xfEditor/);
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
    
    xfEditor.loadKaTeX = function (basePath, callback) {
        // 兼容旧的 loadKaTeX(callback) 调用方式
        if (typeof basePath === "function") {
            callback = basePath;
            basePath = "";
        }
        basePath = basePath || "";
        
        // 如果 basePath 为空或是默认的 "./lib/"，尝试自动推断基路径
        // 解决在子目录（如 examples/）下部署时相对路径 404 的问题
        if (!basePath || basePath === "./lib/") {
            var autoPath = xfEditor._resolveBasePath();
            if (autoPath) {
                    // 例如 autoPath = "https://example.com/xf_editor/"
                // 则 KaTeX 应在 "https://example.com/xf_editor/lib/katex/"
                basePath = autoPath + "lib/";
            }
        }
        
        var cssUrl = (basePath ? basePath : "") + xfEditor.katexURL.css;
        var jsUrl  = (basePath ? basePath : "") + xfEditor.katexURL.js;
        xfEditor.loadCSS(cssUrl, function(){
            xfEditor.loadScript(jsUrl, callback || function(){});
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
    xfEditor.notify = function(message, type, duration) {
        type = type || "info";
        duration = (typeof duration === "undefined") ? 3000 : duration;

        // 初始化通知容器
        var $container = $("#xf_editor-notify-container");
        if ($container.length === 0) {
            $container = $('<div id="xf_editor-notify-container" style="position:fixed;top:16px;right:16px;z-index:100000;display:flex;flex-direction:column;gap:8px;pointer-events:none;"></div>');
            $("body").append($container);
        }

        var icons = { info: "ℹ", success: "✓", warning: "⚠", error: "✕" };
        var colors = { info: "#2196F3", success: "#4CAF50", warning: "#FF9800", error: "#F44336" };
        var bgColors = { info: "#E3F2FD", success: "#E8F5E9", warning: "#FFF3E0", error: "#FFEBEE" };
        var textColors = { info: "#1565C0", success: "#2E7D32", warning: "#E65100", error: "#C62828" };

        var $toast = $(
            '<div class="xf_editor-notify-toast" style="' +
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
            '<span class="xf_editor-notify-close" style="flex-shrink:0;cursor:pointer;font-size:16px;' +
            'opacity:0.5;line-height:1;padding:0 2px;" onclick="$(this).closest(\'.xf_editor-notify-toast\').remove()">×</span>' +
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
    
    xfEditor.lockScreen = function(lock) {
        $("html,body").css("overflow", (lock) ? "hidden" : "");
    };
        
    /**
     * 动态创建对话框
     * Creating custom dialogs
     * 
     * @param   {Object} options 配置项键值对 Key/Value
     * @returns {dialog} 返回创建的dialog的jQuery实例对象
     */

    xfEditor.createDialog = function(options) {
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
        var classPrefix  = xfEditor.classPrefix;
        var guid         = (new Date()).getTime();
        var dialogName   = ( (options.name === "") ? classPrefix + "dialog-" + guid : options.name);
        var mouseOrTouch = xfEditor.mouseOrTouch;

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
                editor.find("." + classPrefix + "mask").css(options.maskStyle).css("z-index", xfEditor.dialogZindex - 1).show();
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
            zIndex : xfEditor.dialogZindex,
            border : (xfEditor.isIE8) ? "1px solid #ddd" : "",
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

        $(window).on("resize.xf_editor-dialog", dialogPosition);

        dialog.children("." + classPrefix + "dialog-close").on(mouseOrTouch("click", "touchend"), function(e) {
            e.preventDefault();
            e.stopPropagation();
            dialog.hide().lockScreen(false).hideMask();
        });

        if (typeof options.buttons === "object")
        {
            var footer = dialog.footer = dialog.find("." + classPrefix + "dialog-footer");

            // ★ v1.17.6-FIX4: 使用 Object.keys().forEach() 替代 for...in 循环
            //    for...in + var btn 存在经典闭包陷阱：所有事件处理器闭包共享同一个 btn 变量，
            //    循环结束后 btn 始终指向最后一个按钮，导致"确定"按钮实际执行"取消"的回调
            Object.keys(options.buttons).forEach(function(key) {
                var btn = options.buttons[key];
                var btnClassName = classPrefix + key + "-btn";

                footer.append("<button type=\"button\" class=\"" + classPrefix + "btn " + btnClassName + "\">" + btn[0] + "</button>");
                btn[1] = btn[1].bind(dialog);
                footer.children("." + btnClassName).on(mouseOrTouch("click", "touchend"), function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    btn[1](e);
                });
            });
        }

        if (options.title !== "" && options.drag)
        {                        
            var posX, posY;
            var dialogHeader = dialog.children("." + classPrefix + "dialog-header");

            if (!options.mask) {
                dialogHeader.on(mouseOrTouch("click", "touchend"), function(){
                    xfEditor.dialogZindex += 2;
                    dialog.css("z-index", xfEditor.dialogZindex);
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

        xfEditor.dialogZindex += 2;

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
    
    xfEditor.mouseOrTouch = function(mouseEventType, touchEventType) {
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
    
    xfEditor.dateFormat = function(format) {                
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

    return xfEditor;

}));
