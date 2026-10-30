/*!
 * Image (upload) dialog plugin for xf_editor
 *
 * @file        image-dialog.js
 * @author zhaoxianfang
 * @version     1.3.4
 * @updateTime  2015-06-09
 * {@link       https://github.com/zhaoxianfang/xfeditor}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "image-dialog";

		exports.fn.imageDialog = function() {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var imageLang   = lang.dialog.image;
            var classPrefix = this.classPrefix;
            var iframeName  = classPrefix + "image-iframe";
			var dialogName  = classPrefix + pluginName, dialog;

			cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                // 是否有可用的上传地址：imageUpload 已开启且 imageUploadURL 非空
                var hasUploadURL = !!(settings.imageUpload && settings.imageUploadURL && String(settings.imageUploadURL).trim() !== "");
                // 本地上传按钮默认显示（除非显式关闭 imageUpload:false）；
                // 即便没有配置上传地址，本地选择图片也会读取为 base64 涂鸦块插入，开箱即用
                var showLocalUpload = (settings.imageUpload !== false);

                var action = "";
                if (hasUploadURL)
                {
                    action = settings.imageUploadURL + (settings.imageUploadURL.indexOf("?") >= 0 ? "&" : "?") + "guid=" + guid;
                    if (settings.crossDomainUpload)
                    {
                        action += "&callback=" + settings.uploadCallbackURL + "&dialog_id=xfEditor-image-dialog-" + guid;
                    }
                }

                var dialogContent = ( (hasUploadURL) ? "<form action=\"" + action +"\" target=\"" + iframeName + "\" method=\"post\" enctype=\"multipart/form-data\" class=\"" + classPrefix + "form\">" : "<div class=\"" + classPrefix + "form\">" ) +
                                        ( (hasUploadURL) ? "<iframe name=\"" + iframeName + "\" id=\"" + iframeName + "\" guid=\"" + guid + "\"></iframe>" + (_this._csrfHiddenInput ? _this._csrfHiddenInput() : "") : "" ) +
                                        "<label>" + imageLang.url + "</label>" +
                                        "<input type=\"text\" data-url />" + (function(){
                                            return (showLocalUpload) ? "<div class=\"" + classPrefix + "file-upload\" data-type=\"image\">" +
                                                                                "<label class=\"" + classPrefix + "file-btn\" title=\"" + imageLang.uploadButton + "\">" +
                                                                                    "<i class=\"fa fa-image\"></i><span class=\"" + classPrefix + "file-btn-label\">" + imageLang.uploadButton + "</span>" +
                                                                                    "<input type=\"file\" class=\"" + classPrefix + "file-input-el\" name=\"" + classPrefix + "image-file\" accept=\"image/*\" />" +
                                                                                "</label>" +
                                                                            "</div>" : "";
                                        })() +
                                        "<br/>" +
                                        "<label>" + imageLang.alt + "</label>" +
                                        "<input type=\"text\" value=\"" + selection + "\" data-alt />" +
                                        "<br/>" +
                                        "<label>" + imageLang.link + "</label>" +
                                        "<input type=\"text\" value=\"http://\" data-link />" +
                                        "<br/>" +
                                        "<label>" + (imageLang.size || "尺寸 (宽x高)") + "</label>" +
                                        "<input type=\"text\" placeholder=\"例如: 300x200\" data-size style=\"width:120px;\" />" +
                                        "<br/>" +
                                        ( (hasUploadURL) ? "</form>" : "</div>");

                //var imageFooterHTML = "<button class=\"" + classPrefix + "btn " + classPrefix + "image-manager-btn\" style=\"float:left;\">" + imageLang.managerButton + "</button>";

                dialog = this.createDialog({
                    title      : imageLang.title,
                    width      : (showLocalUpload) ? 465 : 380,
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
                            var url  = this.find("[data-url]").val();
                            var alt  = this.find("[data-alt]").val();
                            var link = this.find("[data-link]").val();
                            var size = this.find("[data-size]").val().trim();

                            if (url === "")
                            {
                                xfEditor.notify(imageLang.imageURLEmpty, "warning");
                                return false;
                            }

							var altAttr = (alt !== "") ? " \"" + alt + "\"" : "";
                            var sizeStr = "";
                            if (size && /^\d+\s*x\s*\d+$/.test(size)) {
                                var sizeParts = size.replace(/\s/g, "").split("x");
                                sizeStr = "<" + sizeParts[0] + "," + sizeParts[1] + ">";
                            }

                            // ★ 无上传地址：把图片（本地 base64 或远程 URL）转成涂鸦语法块插入
                            if (!hasUploadURL)
                            {
                                var insertCanvas = function(dataUri) {
                                    var editorCm = _this.cm;
                                    if (!editorCm || typeof editorCm.replaceSelection !== "function") return;
                                    editorCm.focus();
                                    var align = "center";
                                    var block = _this._buildCanvasBlock(dataUri, align, alt || "");
                                    editorCm.replaceSelection("\n" + block + "\n");
                                };

                                if (/^data:image\//i.test(url)) {
                                    insertCanvas(url);
                                    this.hide().lockScreen(false).hideMask();
                                    this.remove();
                                    return false;
                                }

                                // 远程图片：下载为 base64 再插入
                                loading(true);
                                _this.fileToDataURL(url, function(err, dataUri) {
                                    loading(false);
                                    if (err || !dataUri) {
                                        xfEditor.notify(imageLang.loadImageFail || "图片加载失败，请检查地址或网络。", "error", 5000);
                                        return;
                                    }
                                    insertCanvas(dataUri);
                                    this.hide().lockScreen(false).hideMask();
                                    this.remove();
                                }.bind(this));

                                return false;
                            }

                            // ★ fix: 通过 editor instance 获取 cm，避免闭包捕获过期引用
                            var editorCm = _this.cm;
                            if (editorCm && typeof editorCm.replaceSelection === "function") {
                                editorCm.focus();
                                if (link === "" || link === "http://")
                                {
                                    editorCm.replaceSelection("![" + alt + "](" + url + altAttr + ")" + sizeStr);
                                }
                                else
                                {
                                    editorCm.replaceSelection("[![" + alt + "](" + url + altAttr + ")]" + "(" + link + altAttr + ")" + sizeStr);
                                }

                                if (alt === "") {
                                    editorCm.setCursor(cursor.line, cursor.ch + 2);
                                }
                            }

                            this.hide().lockScreen(false).hideMask();

                            //删除对话框
                            this.remove();

                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            //删除对话框
                            this.remove();
                            
                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "image-dialog-" + guid);

                // 本地上传组件（文件选择/粘贴）始终绑定：showLocalUpload 为 true 时即使未配置 imageUpload，
                // 也会走 base64 离线插入；配置了 imageUploadURL 则走表单上传
                if (showLocalUpload) {
                    var fileInput  = dialog.find("[name=\"" + classPrefix + "image-file\"]");

                    // 统一的上传 iframe 解析逻辑见核心 _bindServerUpload（低耦合、三对话框复用）

                    // 粘贴板图片直接写入文件选择框（仅当未配置上传地址时走 base64 分支）
                    dialog.on("paste", function(e) {
                        var cd = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
                        if (!cd || !cd.items || cd.items.length === 0) return;
                        for (var i = 0; i < cd.items.length; i++) {
                            if (cd.items[i].type && cd.items[i].type.indexOf("image") !== -1) {
                                var blob = cd.items[i].getAsFile();
                                if (!blob) return;
                                try {
                                    var fileObj = new File([blob], "pasted-image-" + Date.now() + ".png", { type: "image/png" });
                                    var dataTransfer = new DataTransfer();
                                    dataTransfer.items.add(fileObj);
                                    fileInput[0].files = dataTransfer.files;
                                    fileInput.trigger("change");
                                    e.preventDefault();
                                } catch (err) { /* 浏览器不支持则忽略 */ }
                                return;
                            }
                        }
                    });

                    fileInput.on("change", function() {
                        var fileName  = fileInput.val();
                        var isImage   = new RegExp("(\\.(" + settings.imageFormats.join("|") + "))$", "i"); // /(\.(webp|jpg|jpeg|gif|bmp|png))$/

                        if (fileName === "")
                        {
                            xfEditor.notify(imageLang.uploadFileEmpty, "warning");

                            return false;
                        }

                        if (!isImage.test(fileName))
                        {
                            xfEditor.notify(imageLang.formatNotAllowed + settings.imageFormats.join(", "), "warning");
                            fileInput.val("");

                            return false;
                        }

                        var file = fileInput.get(0).files[0];
                        if (!file) return false;

                        // ★ 无上传地址：将本地图片读取为 base64 填入地址框（图片名称写入 alt），
                        //   由「确认」按钮统一转换并插入涂鸦块；粘贴/选择文件均走此分支
                        if (!hasUploadURL)
                        {
                            loading(true);
                            _this.fileToDataURL(file, function(err, dataUri) {
                                loading(false);
                                if (err || !dataUri) {
                                    xfEditor.notify(imageLang.loadImageFail || "图片读取失败，请重试。", "error", 5000);
                                    return;
                                }
                                var baseName = fileName.replace(/^.*[\\\/]/, "");
                                dialog.find("[data-url]").val(dataUri);
                                var altEl = dialog.find("[data-alt]");
                                if (altEl.length > 0) {
                                    altEl.val(altEl.val() || baseName);
                                }
                            });
                            return false;
                        }

                        // ★ 有上传地址：提交表单到隐藏 iframe（修复旧版 type=button 无法触发表单提交的缺陷）
                        _this._bindServerUpload(iframeName, {
                            crossDomain: settings.crossDomainUpload,
                            loading: loading,
                            onSuccess: function(json) {
                                // 统一解析上传返回（兼容多种成功标识与 URL 字段），成功才回写地址并提示绿色成功
                                var res = _this._parseUploadResult(json);
                                if (res.success) {
                                    dialog.find("[data-url]").val(res.url);
                                    // 登记已上传文件，便于后续删除时通知服务端清理（防僵尸文件）
                                    try { _this._trackUploadedFile({ type: "image", url: res.url, name: (res.name || fileInput.val() || "") }); } catch (e) {}
                                    xfEditor.notify("上传成功", "success", 3000);
                                } else {
                                    xfEditor.notify(res.message || "上传失败，未知错误。", "error", 5000);
                                }
                            },
                            onError: function() {
                                xfEditor.notify("上传响应解析失败，请检查服务器返回格式。", "error", 5000);
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
			dialog.find("[data-link]").val("http://");

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
