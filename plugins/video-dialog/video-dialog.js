/**!
 * Video upload dialog plugin for Editor.md
 *
 * @file        video-dialog.js
 * @author      Editor.md
 * @version     1.7.0
 * @updateTime  2026-06-03
 * {@link       https://github.com/zhaoxianfang/xfeditor}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

        var pluginName   = "video-dialog";

        exports.fn.videoDialog = function() {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var videoLang   = lang.dialog.video;
            var classPrefix = this.classPrefix;
            var iframeName  = classPrefix + "video-iframe";
            var dialogName  = classPrefix + pluginName, dialog;

            cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                var action = settings.videoUploadURL + (settings.videoUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid;

                var dialogContent = ( (settings.videoUpload) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (settings.videoUpload) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" : "" ) +
                                        "<label>" + videoLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (settings.videoUpload) ? "<div class=\"" + classPrefix + "file-input\">" +
                                                                                "<input type=\"file\" name=\"" + classPrefix + "video-file\" accept=\"video/*\" />" +
                                                                                "<input type=\"submit\" value=\"" + videoLang.uploadButton + "\" />" +
                                                                            "</div>" : "";
                                        })() +
                                        "<br/>" +
                                        "<label>" + videoLang.alt + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                                        "<br/>" +
                                        "<label>" + (videoLang.size || "尺寸 (宽x高)") + "</label>" +
                                        "<input type=\"text\" placeholder=\"例如: 640x480\" data-size style=\"width:120px;\" />" +
                                        "<br/>" +
                                        "<label>" + (videoLang.align || "对齐方式") + "</label>" +
                                        "<select data-align style=\"width:120px;\">" +
                                            "<option value=\"left\">" + (videoLang.alignLeft || "左对齐") + "</option>" +
                                            "<option value=\"center\" selected>" + (videoLang.alignCenter || "居中") + "</option>" +
                                            "<option value=\"right\">" + (videoLang.alignRight || "右对齐") + "</option>" +
                                        "</select>" +
                                        "<br/>" +
                                    ( (settings.videoUpload) ? "</form>" : "</div>");

                dialog = this.createDialog({
                    title      : videoLang.title,
                    width      : (settings.videoUpload) ? 465 : 380,
                    height     : 300,
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
                            var url   = this.find("[data-url]").val();
                            var alt   = this.find("[data-alt]").val();
                            var size  = this.find("[data-size]").val().trim();
                            var align = this.find("[data-align]").val();

                            if (url === "")
                            {
                                editormd.notify(videoLang.videoURLEmpty, "warning");
                                return false;
                            }

                            var sizeStr = "";
                            var w = "";
                            var h = "";
                            if (size && /^\d+\s*x\s*\d+$/.test(size)) {
                                var sizeParts = size.replace(/\s/g, "").split("x");
                                w = sizeParts[0];
                                h = sizeParts[1];
                                sizeStr = "<" + w + "," + h + ">";
                            }

                            var md = "![" + alt + "](" + url + ")" + sizeStr;

                            if (align !== "left") {
                                var style = "";
                                if (w) style += "width:" + w + "px;";
                                if (h) style += "height:" + h + "px;";
                                var styleAttr = style ? ' style="' + style + '"' : "";
                                md = '<div class="editormd-video-wrapper" style="text-align:' + align + ';"><video src="' + url + '" controls preload="metadata"' + styleAttr + '>' + alt + '</video></div>';
                            }

                            cm.focus();
                            cm.replaceSelection(md);

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

                dialog.attr("id", classPrefix + "video-dialog-" + guid);

                // 上传功能仅在启用时设置，对话框始终显示
                if (settings.videoUpload) {
                    var fileInput  = dialog.find("[name=\"" + classPrefix + "video-file\"]");

                    fileInput.on("change", function() {
                        var fileName  = fileInput.val();
                        var isVideo   = new RegExp("(\\.(" + settings.videoFormats.join("|") + "))$", "i");

                        if (fileName === "")
                        {
                            editormd.notify(videoLang.uploadFileEmpty, "warning");
                            return false;
                        }

                        if (!isVideo.test(fileName))
                        {
                            editormd.notify(videoLang.formatNotAllowed + settings.videoFormats.join(", "), "warning");
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
                                } catch(err) {
                                    editormd.notify(videoLang.uploadError + " " + (json || ""), "error", 5000);
                                    return false;
                                }

                                if (json.success === 1)
                                {
                                    dialog.find("[data-url]").val(json.url);
                                }
                                else
                                {
                                    editormd.notify(json.message || videoLang.uploadError, "error", 5000);
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