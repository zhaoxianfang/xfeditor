/**
 * xfEditor 简体中文语言包
 * 
 * @file        zh-cn.js
 * @description 简体中文 (Simplified Chinese) 语言包
 * @version     1.0.0
 * @license     MIT License
 * @updateTime  2026-06-04
 */

(function(){
    var factory = function (exports) {
        var lang = {
            name        : "zh-cn",
            description : "开源在线 Markdown 编辑器<br/>Open source online Markdown editor.",
            tocTitle    : "目录",
            placeholder : "写点什么吧~",

            toolbar : {
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
                "html-entities"  : "HTML 实体字符",
                pagebreak        : "插入分页符",
                "goto-line"      : "跳转到行",
                watch            : "关闭实时预览",
                unwatch          : "开启实时预览",
                preview          : "全窗口预览 HTML（按 Shift + ESC 退出）",
                fullscreen       : "全屏（按 ESC 退出）",
                clear            : "清空",
                search           : "搜索",
                help             : "使用帮助",
                info             : "关于 " + exports.title,
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
                draft            : "草稿",
                restoreDraft     : "恢复草稿",
                clearDraft       : "清除所有草稿",
                draftRestoreTip  : "检测到以下自动保存的草稿，点击任意草稿可恢复到编辑器：",
                draftClearBtn    : "清除所有",
                draftCancelBtn   : "暂不恢复"
            },

            buttons : {
                enter  : "确定",
                cancel : "取消",
                close  : "关闭",
                confirm  : "确认"
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
                    emptyAlert        : "错误：请填写预格式文本或代码的内容。",
                    placeholder       : "在此编写代码..."
                },
                codeBlock : {
                    title             : "添加代码块",                    
                    selectLabel       : "代码语言：",
                    selectDefaultText : "请选择代码语言",
                    otherLanguage     : "其他语言",
                    unselectedLanguageAlert : "错误：请选择代码所属的语言类型。",
                    codeEmptyAlert    : "错误：请填写代码内容。",
                    placeholder       : "在此编写代码..."
                },
                htmlEntities : {
                    title : "HTML 实体字符"
                },
                help : {
                    title : "使用帮助"
                }
            }
        };
        
        exports.defaults.lang = lang;
        // 同时注册到语言包注册表，使 xfEditor.getLang("zh-cn") 可获取
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
            define(["xfEditor"], function(xfEditor) {
                factory(xfEditor);
            });
        } else { // for Sea.js
            define(function(require) {
                var xfEditor = require("../xfEditor");
                factory(xfEditor);
            });
        }
    } 
    else
    {
        factory(window.xfEditor);
    }
    
})();
