/**
 * xfEditor 繁體中文語言包
 * 
 * @file        zh-tw.js
 * @description 繁體中文 (Traditional Chinese) 語言包
 * @version     1.0.0
 * @license     MIT License
 * @updateTime  2026-06-04
 */

(function(){
    var factory = function (exports) {
        var lang = {
            name : "zh-tw",
            description : "開源線上 Markdown 編輯器<br/>Open source online Markdown editor.",
            tocTitle    : "目錄",
            placeholder : "寫點什麼吧~",

            toolbar     : {
                undo             : "復原（Ctrl+Z）",
                redo             : "重做（Ctrl+Y）",
                bold             : "粗體",
                del              : "刪除線",
                italic           : "斜體",
                quote            : "引用",
                ucwords          : "將每個單詞首字母轉成大寫",
                uppercase        : "將所選文字轉成大寫",
                lowercase        : "將所選文字轉成小寫",
                h1               : "標題1",
                h2               : "標題2",
                h3               : "標題3",
                h4               : "標題4",
                h5               : "標題5",
                h6               : "標題6",
                "list-ul"        : "無序列表",
                "list-ol"        : "有序列表",
                hr               : "橫線",
                link             : "連結",
                "reference-link" : "引用連結",
                image            : "圖片",
                file             : "上傳檔案",
                code             : "行內程式碼",
                "preformatted-text" : "預格式文字 / 程式碼區塊（縮排風格）",
                "code-block"     : "程式碼區塊（多語言風格）",
                table            : "新增表格",
                datetime         : "日期時間",
                "html-entities"  : "HTML 實體字元",
                pagebreak        : "插入分頁符",
                "goto-line"      : "跳轉到行",
                watch            : "關閉即時預覽",
                unwatch          : "開啟即時預覽",
                preview          : "全視窗預覽 HTML（按 Shift + ESC 退出）",
                fullscreen       : "全螢幕（按 ESC 退出）",
                clear            : "清空",
                search           : "搜尋",
                help             : "使用說明",
                info             : "關於 " + exports.title,
                "align-left"     : "靠左對齊",
                "align-center"   : "置中對齊",
                "align-right"    : "靠右對齊",
                "align-justify"  : "左右對齊",
                "table-edit"     : "表格編輯",
                insert           : "插入",
                pinyin           : "拼音標註",
                "image-resize"   : "圖片尺寸",
                "echarts-bar"    : "長條圖",
                "echarts-line"   : "折線圖",
                "echarts-pie"    : "圓餅圖",
                "echarts-radar"  : "雷達圖",
                "echarts-funnel" : "漏斗圖",
                chart            : "圖表",
                tabs             : "頁籤",
                columns          : "多欄排版",
                tooltip          : "懸浮提示",
                color            : "文字顏色",
                "bg-color"       : "背景顏色",
                draft            : "草稿",
                restoreDraft     : "恢復草稿",
                clearDraft       : "清除所有草稿",
                draftRestoreTip  : "偵測到以下自動儲存的草稿，點擊任意草稿可恢復到編輯器：",
                draftClearBtn    : "清除所有",
                draftCancelBtn   : "暫不恢復"
            },

            buttons : {
                enter   : "確定",
                cancel  : "取消",
                close   : "關閉",
                confirm : "確認"
            },

            dialog : {
                link   : {
                    title    : "新增連結",
                    url      : "連結網址",
                    urlTitle : "連結標題",
                    urlEmpty : "錯誤：請填寫連結網址。"
                },
                referenceLink : {
                    title    : "新增引用連結",
                    name     : "引用名稱",
                    url      : "連結網址",
                    urlId    : "連結ID",
                    urlTitle : "連結標題",
                    nameEmpty: "錯誤：引用連結的名稱不能為空。",
                    idEmpty  : "錯誤：請填寫引用連結的ID。",
                    urlEmpty : "錯誤：請填寫引用連結的網址。"
                },
                image  : {
                    title    : "新增圖片",
                    url      : "圖片網址",
                    link     : "圖片連結",
                    alt      : "圖片描述",
                    uploadButton     : "本地上傳",
                    imageURLEmpty    : "錯誤：圖片網址不能為空。",
                    uploadFileEmpty  : "錯誤：上傳的圖片不能為空！",
                    formatNotAllowed : "錯誤：僅允許上傳圖片檔案，允許的圖片格式有："
                },
                file : {
                    title    : "上傳檔案",
                    url      : "檔案網址",
                    alt      : "檔案名稱",
                    uploadButton     : "本地上傳",
                    fileURLEmpty     : "錯誤：檔案網址不能為空。",
                    uploadFileEmpty  : "錯誤：上傳的檔案不能為空。",
                    formatNotAllowed : "錯誤：僅允許上傳指定格式的檔案，允許的檔案格式有：",
                    uploadError      : "上傳出錯，請檢查 API 回傳格式是否正確。"
                },
                video : {
                    title         : "新增影片",
                    url           : "影片網址",
                    alt           : "影片描述",
                    uploadButton  : "本地上傳",
                    size          : "尺寸 (寬x高)",
                    align         : "對齊方式",
                    alignLeft     : "靠左對齊",
                    alignCenter   : "置中",
                    alignRight    : "靠右對齊",
                    videoURLEmpty : "錯誤：影片網址不能為空。",
                    uploadFileEmpty : "錯誤：上傳的影片不能為空！",
                    formatNotAllowed : "錯誤：僅允許上傳影片檔案，允許的影片格式有：",
                    uploadError   : "上傳出錯"
                },
                preformattedText : {
                    title             : "新增預格式文字或程式碼區塊", 
                    emptyAlert        : "錯誤：請填寫預格式文字或程式碼的內容。",
                    placeholder       : "在此編寫程式碼..."
                },
                codeBlock : {
                    title             : "新增程式碼區塊",                 
                    selectLabel       : "程式語言：",
                    selectDefaultText : "請選擇程式語言",
                    otherLanguage     : "其他語言",
                    unselectedLanguageAlert : "錯誤：請選擇程式碼所屬的語言類型。",
                    codeEmptyAlert    : "錯誤：請填寫程式碼內容。",
                    placeholder       : "在此編寫程式碼..."
                },
                htmlEntities : {
                    title : "HTML 實體字元"
                },
                help : {
                    title : "使用說明"
                }
            }
        };
        
        exports.defaults.lang = lang;
        // 同时注册到语言包注册表，使 editormd.getLang("zh-tw") 可获取
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
