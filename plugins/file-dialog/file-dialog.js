/*!
 * File upload dialog plugin for Editor.md
 *
 * @file        file-dialog.js
 * @author      Editor.md
 * @version     1.7.0
 * @updateTime  2026-06-03
 * {@link       https://github.com/zhaoxianfang/xfeditor}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

        var pluginName   = "file-dialog";

        exports.fn.fileDialog = function() {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var fileLang    = lang.dialog.file;
            var classPrefix = this.classPrefix;
            var iframeName  = classPrefix + "file-iframe";
            var dialogName  = classPrefix + pluginName, dialog;

            cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                var action = settings.fileUploadURL + (settings.fileUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid;

                var dialogContent = ( (settings.fileUpload) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (settings.fileUpload) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" : "" ) +
                                        "<label>" + fileLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (settings.fileUpload) ? "<div class=\"" + classPrefix + "file-input\">" +
                                                                                "<input type=\"file\" name=\"" + classPrefix + "file-file\" />" +
                                                                                "<input type=\"submit\" value=\"" + fileLang.uploadButton + "\" />" +
                                                                            "</div>" : "";
                                        })() +
                                        "<br/>" +
                                        "<label>" + fileLang.alt + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                                        "<br/>" +
                                    ( (settings.fileUpload) ? "</form>" : "</div>");

                dialog = this.createDialog({
                    title      : fileLang.title,
                    width      : (settings.fileUpload) ? 465 : 380,
                    height     : 224,
                    name       : dialogName,
                    content    : dialogContent,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter : [lang.buttons.enter, function() {
                            var url  = this.find("[data-url]").val();
                            var alt  = this.find("[data-alt]").val();

                            if (url === "")
                            {
                                editormd.notify(fileLang.fileURLEmpty, "warning");
                                return false;
                            }

                            var altText = (alt !== "") ? alt : url.substring(url.lastIndexOf("/") + 1);
                            // ★ fix: 通过 editor instance 获取 cm，避免闭包捕获过期引用
                            var editorCm = _this.cm;
                            if (editorCm && typeof editorCm.replaceSelection === "function") {
                                editorCm.focus();
                                editorCm.replaceSelection("[" + altText + "](" + url + ")");
                            }

                            this.hide().lockScreen(false).hideMask();
                            this.remove();

                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();
                            this.remove();
                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "file-dialog-" + guid);

                // 上传功能仅在启用时设置，对话框始终显示
                if (settings.fileUpload) {
                    var fileInput  = dialog.find("[name=\"" + classPrefix + "file-file\"]");

                    fileInput.on("change", function() {
                        var fileName  = fileInput.val();
                        var isAllowed = new RegExp("(\\.(" + settings.fileFormats.join("|") + "))$", "i");

                        if (fileName === "")
                        {
                            editormd.notify(fileLang.uploadFileEmpty, "warning");
                            return false;
                        }

                        if (!isAllowed.test(fileName))
                        {
                            editormd.notify(fileLang.formatNotAllowed + settings.fileFormats.join(", "), "warning");
                            return false;
                        }

                        loading(true);

                        var submitHandler = function() {
                            var uploadIframe = document.getElementById(iframeName);

                            uploadIframe.onload = function() {
                                loading(false);

                                var body = (uploadIframe.contentWindow ? uploadIframe.contentWindow : uploadIframe.contentDocument).document.body;
                                var json = (body.innerText) ? body.innerText : ( (body.textContent) ? body.textContent : null);

                                try {
                                    json = (typeof JSON.parse !== "undefined") ? JSON.parse(json) : eval("(" + json + ")");
                                } catch (err) {
                                    editormd.notify(fileLang.uploadError + " " + (json || ""), "error", 5000);
                                    return false;
                                }

                                if (json.success === 1)
                                {
                                    dialog.find("[data-url]").val(json.url);
                                    dialog.find("[data-alt]").val(json.name || "");
                                }
                                else
                                {
                                    editormd.notify(json.message || fileLang.uploadError, "error", 5000);
                                }

                                return false;
                            };
                        };

                        dialog.find("[type=\"submit\"]").on("click", submitHandler).trigger("click");
                    });
                }
            }

            dialog = editor.find("." + dialogName);
            dialog.find("[type=\"text\"]").val("");
            dialog.find("[type=\"file\"]").val("");

            this.dialogShowMask(dialog);
            this.dialogLockScreen();
            dialog.show();

        };

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
                var editormd = require("./../../editormd");
                factory(editormd);
            });
        }
    }
    else
    {
        factory(window.editormd);
    }

})();
