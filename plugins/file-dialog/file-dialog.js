/*!
 * File upload dialog plugin for xf_editor
 *
 * @file        file-dialog.js
 * @author      xf_editor
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
                // ★ 上传地址门控：仅当 fileUpload 开启且 fileUploadURL 已配置才允许上传；
                //   未配置地址时一律禁用本地上传（不保存文件到前端），与图片（base64 例外）区分
                var hasFileUploadURL = !!(settings.fileUpload && settings.fileUploadURL && String(settings.fileUploadURL).trim() !== "");
                var action = hasFileUploadURL ? (settings.fileUploadURL + (settings.fileUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid) : "";

                var dialogContent = ( (hasFileUploadURL) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (hasFileUploadURL) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" + (_this._csrfHiddenInput ? _this._csrfHiddenInput() : "") : "" ) +
                                        "<label>" + fileLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (hasFileUploadURL) ? "<div class=\"" + classPrefix + "file-upload\" data-type=\"file\">" +
                                        "<label class=\"" + classPrefix + "file-btn\" title=\"" + fileLang.uploadButton + "\">" +
                                            "<i class=\"fa fa-paperclip\"></i><span class=\"" + classPrefix + "file-btn-label\">" + fileLang.uploadButton + "</span>" +
                                            "<input type=\"file\" class=\"" + classPrefix + "file-input-el\" name=\"" + classPrefix + "file-file\" />" +
                                        "</label>" +
                                    "</div>" : "";
                                        })() +
                                        "<br/>" +
                                        "<label>" + fileLang.alt + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                                        "<br/>" +
                                    ( (hasFileUploadURL) ? "</form>" : "</div>");

                dialog = this.createDialog({
                    title      : fileLang.title,
                    width      : (hasFileUploadURL) ? 465 : 380,
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
                                xfEditor.notify(fileLang.fileURLEmpty, "warning");
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

                // 上传功能仅在配置了上传地址时绑定（未配置则本地上传入口已被隐藏）
                if (hasFileUploadURL) {
                    var fileInput  = dialog.find("[name=\"" + classPrefix + "file-file\"]");

                    fileInput.on("change", function() {
                        var fileName  = fileInput.val();
                        var isAllowed = new RegExp("(\\.(" + settings.fileFormats.join("|") + "))$", "i");

                        if (fileName === "")
                        {
                            xfEditor.notify(fileLang.uploadFileEmpty, "warning");
                            return false;
                        }

                        if (!isAllowed.test(fileName))
                        {
                            xfEditor.notify(fileLang.formatNotAllowed + settings.fileFormats.join(", "), "warning");
                            fileInput.val("");
                            return false;
                        }

                        var file = fileInput.get(0).files[0];
                        if (!file) return false;

                        // 统一的上传 iframe 解析逻辑见核心 _bindServerUpload（低耦合、三对话框复用）
                        _this._bindServerUpload(iframeName, {
                            loading: loading,
                            onSuccess: function(json) {
                                // 统一解析上传返回（兼容多种成功标识与 URL 字段），成功才回写地址并提示绿色成功
                                var res = _this._parseUploadResult(json);
                                if (res.success) {
                                    dialog.find("[data-url]").val(res.url);
                                    dialog.find("[data-alt]").val(res.name || "");
                                    // 登记已上传文件，便于后续删除时通知服务端清理（防僵尸文件）
                                    try { _this._trackUploadedFile({ type: "file", url: res.url, name: (res.name || fileInput.val() || "") }); } catch (e) {}
                                    xfEditor.notify("上传成功", "success", 3000);
                                } else {
                                    xfEditor.notify(res.message || fileLang.uploadError, "error", 5000);
                                }
                            },
                            onError: function(err, raw) {
                                xfEditor.notify(fileLang.uploadError + " " + (raw || ""), "error", 5000);
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
