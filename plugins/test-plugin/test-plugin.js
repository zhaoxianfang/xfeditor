/*!
 * Test plugin for xfEditor
 *
 * 用于 examples/define-plugin.html 的演示插件：
 * 展示如何通过 xfEditor.loadPlugin() 动态加载一个插件，
 * 并同时扩展「静态方法」(xfEditor.xxx) 与「实例方法」(xfEditor.fn.xxx)。
 *
 * @file        test-plugin.js
 * @author      zhaoxianfang
 * @version     1.0.0
 * {@link       https://github.com/zhaoxianfang/xfeditor}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

        // 编辑器已内置零依赖 micro-DOM，插件复用它（零外部依赖）
        var dom = (exports && exports.dom) ? exports.dom : null;

        if (!exports) {
            return;
        }

        /**
         * 静态方法：xfEditor.testPlugin()
         * 无需编辑器实例即可调用。
         */
        exports.testPlugin = function() {
            if (typeof console !== "undefined" && console.log) {
                console.log("testPlugin: 插件已成功加载并执行（静态方法）");
            }

            return exports;
        };

        /**
         * 实例方法：editorInstance.testPlugin()
         * 在编辑器实例上下文中调用，可访问 this.editor / this.cm 等。
         */
        if (exports.fn) {
            exports.fn.testPlugin = function() {
                var _this = this;

                if (typeof console !== "undefined" && console.log) {
                    console.log("testPlugin: 实例方法被调用", _this);
                }

                return _this;
            };
        }

    };

    factory(window.xfEditor);
})();
