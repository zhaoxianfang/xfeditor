/**!
 * Video upload dialog plugin for xf_editor
 *
 * @file        video-dialog.js
 * @author      xf_editor
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
                // ★ 上传地址门控：仅当 videoUpload 开启且 videoUploadURL 已配置才允许上传；
                //   未配置地址时一律禁用本地上传（不保存文件到前端），与图片（base64 例外）区分
                var hasVideoUploadURL = !!(settings.videoUpload && settings.videoUploadURL && String(settings.videoUploadURL).trim() !== "");
                var action = hasVideoUploadURL ? (settings.videoUploadURL + (settings.videoUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid) : "";

                var dialogContent = ( (hasVideoUploadURL) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (settings.videoUpload) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" + (_this._csrfHiddenInput ? _this._csrfHiddenInput() : "") : "" ) +
                                        "<label>" + videoLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (hasVideoUploadURL) ? "<div class=\"" + classPrefix + "file-upload\" data-type=\"video\">" +
                                                                                "<label class=\"" + classPrefix + "file-btn\" title=\"" + videoLang.uploadButton + "\">" +
                                                                                    "<i class=\"fa fa-video-camera\"></i><span class=\"" + classPrefix + "file-btn-label\">" + videoLang.uploadButton + "</span>" +
                                                                                    "<input type=\"file\" class=\"" + classPrefix + "file-input-el\" name=\"" + classPrefix + "video-file\" accept=\"video/*\" />" +
                                                                                "</label>" +
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
                                    ( (hasVideoUploadURL) ? "</form>" : "</div>");

                dialog = this.createDialog({
                    title      : videoLang.title,
                    width      : (hasVideoUploadURL) ? 465 : 380,
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
                                xfEditor.notify(videoLang.videoURLEmpty, "warning");
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
                                md = '<div class="xfEditor-video-wrapper" style="text-align:' + align + ';"><video src="' + url + '" controls preload="metadata"' + styleAttr + '>' + alt + '</video></div>';
                            }

                            // ★ fix: 通过 editor instance 获取 cm，避免闭包捕获过期引用
                            var editorCm = _this.cm;
                            if (editorCm && typeof editorCm.replaceSelection === "function") {
                                editorCm.focus();
                                editorCm.replaceSelection(md);
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

                dialog.attr("id", classPrefix + "video-dialog-" + guid);

                // 上传功能仅在配置了上传地址时绑定（未配置则本地上传入口已被隐藏）
                if (hasVideoUploadURL) {
                    var fileInput  = dialog.find("[name=\"" + classPrefix + "video-file\"]");

                    // 统一的上传 iframe 解析逻辑见核心 _bindServerUpload（低耦合、三对话框复用）

                    fileInput.on("change", function() {
                        var fileName  = fileInput.val();
                        var isVideo   = new RegExp("(\\.(" + settings.videoFormats.join("|") + "))$", "i");

                        if (fileName === "")
                        {
                            xfEditor.notify(videoLang.uploadFileEmpty, "warning");
                            return false;
                        }

                        if (!isVideo.test(fileName))
                        {
                            xfEditor.notify(videoLang.formatNotAllowed + settings.videoFormats.join(", "), "warning");
                            fileInput.val("");
                            return false;
                        }

                        var file = fileInput.get(0).files[0];
                        if (!file) return false;

                        _this._bindServerUpload(iframeName, {
                            loading: loading,
                            onSuccess: function(json) {
                                // 统一解析上传返回（兼容多种成功标识与 URL 字段），成功才回写地址并提示绿色成功
                                var res = _this._parseUploadResult(json);
                                if (res.success) {
                                    dialog.find("[data-url]").val(res.url);
                                    // 登记已上传文件，便于后续删除时通知服务端清理（防僵尸文件）
                                    try { _this._trackUploadedFile({ type: "video", url: res.url, name: (res.name || fileInput.val() || "") }); } catch (e) {}
                                    xfEditor.notify("上传成功", "success", 3000);
                                } else {
                                    xfEditor.notify(res.message || videoLang.uploadError, "error", 5000);
                                }
                            },
                            onError: function(err, raw) {
                                xfEditor.notify(videoLang.uploadError + " " + (raw || ""), "error", 5000);
                            }
                        });
                        loading(true);
                        var form = dialog.find("form");
                        if (form.length > 0) form[0].submit();
                        return false;
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

            define(["xfEditor"], function(xfEditor) {
                factory(xfEditor);
            });

        } else { // for Sea.js
            define(function(require) {
                var xfEditor = require("./../../xf_editor");
                factory(xfEditor);
            });
        }
    }
    else
    {
        factory(window.xfEditor);
    }

})();