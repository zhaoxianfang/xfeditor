/*!
 * Link dialog plugin for xf_editor
 *
 * @file        link-dialog.js
 * @author zhaoxianfang
 * @version     1.3.0
 * @updateTime  2026-06-24
 * {@link       https://github.com/zhaoxianfang/xfeditor}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "link-dialog";

		exports.fn.linkDialog = function() {

			var _this       = this;
			var cm          = this.cm;
            var editor      = this.editor;
            var settings    = this.settings;
            var selection   = cm.getSelection();
            var lang        = this.lang;
            var linkLang    = lang.dialog.link;
            var classPrefix = this.classPrefix;
			var dialogName  = classPrefix + pluginName, dialog;

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
                // ★ v1.3.0: 新增跳转方式选择
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

                            // ★ fix: 通过 editor instance 获取 cm，避免闭包捕获过期引用
                            var editorCm = _this.cm;
                            if (editorCm && typeof editorCm.replaceSelection === "function") {
                                editorCm.focus();
                                editorCm.replaceSelection(str);
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
                var xfEditor = require("./../../xfEditor");
                factory(xfEditor);
            });
		}
	} 
	else
	{
        factory(window.xfEditor);
	}

})();
