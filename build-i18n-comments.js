/**
 * 编辑器注释全部中文化脚本
 * 将 src/editormd.js 中的所有英文注释替换为中文注释
 */

const fs = require('fs');

let src = fs.readFileSync('src/editormd.js', 'utf8');

// ===================== 模块加载区域注释 =====================
const moduleCommentMap = {
    // Polyfill and module loading
    '// Polyfill: always override window.test to prevent "test is not defined" / "test.mode is not a function"':
        '// Polyfill：始终覆盖 window.test，防止浏览器报 "test is not defined" / "test.mode is not a function" 错误',
    '// CommonJS/Node.js':
        '// CommonJS / Node.js 模块加载',
    'else if (typeof define === "function")  // AMD/CMD/Sea.js':
        'else if (typeof define === "function")  // AMD / CMD / Sea.js 模块加载',
    'if (define.amd) // for Require.js':
        'if (define.amd) // Require.js AMD 加载',
    'define(["jquery"], factory);  // for Sea.js':
        'define(["jquery"], factory);  // Sea.js CMD 加载',

    // Toolbar icons class
    '"goto-line"      : "fa-terminal", // fa-crosshairs':
        '"goto-line"      : "fa-terminal", // 跳转到行（备选图标：fa-crosshairs）',

    // Draft auto-save
    '// Setup draft auto-save and recovery':
        '// 设置草稿自动保存与恢复',
    '// Check for existing drafts on init':
        '// 初始化时检查是否存在旧草稿',

    // Loaded display
    'editor.data("oldWidth", editor.width()).data("oldHeight", editor.height()); // 为了兼容Zepto':
        'editor.data("oldWidth", editor.width()).data("oldHeight", editor.height()); // 缓存编辑器原始宽高（兼容 Zepto）',
};

for (const [oldStr, newStr] of Object.entries(moduleCommentMap)) {
    src = src.replace(oldStr, newStr);
}

// ===================== 原型方法区域注释 =====================
const prototypeCommentMap = {
    // Dropdown handlers
    '// Dropdown toggle handler':
        '// 下拉菜单切换事件处理器',
    '// Close other open dropdowns':
        '// 关闭其他已打开的下拉菜单',
    '// Dropdown menu item click handler':
        '// 下拉菜单项点击事件处理器',
    '// Close dropdown':
        '// 关闭下拉菜单',

    // Preview code highlight
    '// Inject copy buttons into all pre blocks':
        '// 向所有 pre 代码块注入复制按钮',

    // Copy button related
    '// Avoid duplicate buttons':
        '// 避免重复创建按钮',
    '// Ensure pre is positioned for the absolute button':
        '// 确保 pre 元素为 relative 定位，以便按钮 absolute 定位',
    '// Move all existing children into the scroll wrapper':
        '// 将所有现有子元素移入滚动包装容器',
    '// Get code text from the scroll wrapper\'s code element':
        '// 从滚动包装容器中的 code 元素获取代码文本',
    '// Use Clipboard API if available':
        '// 优先使用 Clipboard API',
    '// Fallback using textarea':
        '// 降级方案：使用 textarea + execCommand',
    '// Append button directly to the pre (outside the scroll wrapper)':
        '// 将复制按钮追加到 pre 元素（位于滚动包装容器外部）',

    // TeX related
    '// Double click to edit formula in source':
        '// 双击公式可定位到源码中进行编辑',

    // Event handling
    '// Enhanced event handling':
        '// 增强的事件处理（keydown/keyup/mouseup/mousedown/paste/drop/copy/cut/focus/blur）',

    // Save method
    '// Initialize table editing and image resize in preview':
        '// 初始化预览区中的表格编辑和图片缩放功能',

    // Table editing
    '// Find all table blocks in markdown source':
        '// 在 Markdown 源中查找所有表格块',
    '// blank line inside table - skip but don\'t break (some tables have blank lines)':
        '// 表格内部空行 — 跳过但不中断扫描（某些表格含有空行）',
    '// Store table block reference':
        '// 存储表格块引用信息',
    '// Also store first column header text for re-identification after modifications':
        '// 同时存储首列表头文本，供表格被修改后重新识别',
    '// Add column controls (positioned above selected column)':
        '// 添加列控制按钮（定位在选中列上方）',
    '// Add row controls (positioned to the left of selected row)':
        '// 添加行控制按钮（定位在选中行左侧）',
    '// Track current cell':
        '// 跟踪当前选中的单元格',
    '// Use wrapper-relative offset to handle scrolling properly':
        '// 使用相对于包装容器的偏移来正确处理滚动',
    '// Hide controls when clicking outside':
        '// 点击表格外部时隐藏控制按钮',
    '// Verify tableStart is still valid and re-find the table boundaries':
        '// 验证 tableStart 是否仍然有效，必要时重新查找表格边界',
    '// Table position changed - re-find by identifier':
        '// 表格位置已变化 — 通过标识文本重新查找',
    '// Fallback: find any table starting at or near expected position':
        '// 降级方案：查找任意表格作为备选',
    '// Find table end':
        '// 查找表格结束位置',
    '// Ensure minimum rows: header + separator + at least 1 data row':
        '// 确保最小行数：表头 + 分隔行 + 至少 1 行数据',
    '// Make sure rowIndex is valid':
        '// 确保 rowIndex 在有效范围内',
    '// thead: insert before header. body: insert at tableStart + 2 + rowIndex':
        '// 表头区域：在表头之前插入。表体：在 tableStart + 2 + rowIndex 处插入',
    '// thead: insert as first data row. body: insert after current row':
        '// 表头区域：作为第一行数据插入。表体：在当前行之后插入',
    '// Prevent deleting if only header + separator remain':
        '// 仅剩表头和分隔行时阻止删除操作',
    '// Update table position reference on wrapper':
        '// 更新包装容器上的表格位置引用',

    // Image resize
    '// Add resize handle':
        '// 添加缩放拖拽手柄',
    '// Shift key to maintain aspect ratio':
        '// 按 Shift 键保持宽高比',
    '// Double click to edit size':
        '// 双击图片可编辑尺寸',
    '// Find and replace image markdown with new <width,height> syntax':
        '// 查找并替换图片 Markdown，更新为新的 <宽,高> 语法',

    // Word count
    '// Count Chinese characters':
        '// 统计中文字符数',
    '// Count English words (sequences of letters)':
        '// 统计英文单词数（字母序列）',

    // Draft methods
    '// Remove expired drafts':
        '// 移除过期的草稿',
    '// Remove duplicates (same content), keep only the latest':
        '// 移除内容重复的草稿，仅保留最新的',
    '// Keep only last 20 drafts':
        '// 最多保留 20 条草稿',

    // Color picker
    '// Remove any existing picker':
        '// 移除已存在的颜色选择面板',
    '// Common document colors: 2 rows x 4 cols, first 7 are colors, 8th is custom picker':
        '// 常用颜色：2行×4列，前7个为预设颜色，第8个为自定义选择器',
    '// 8th custom color square':
        '// 第8个为自定义颜色方块',
    '// Hidden custom area':
        '// 隐藏的自定义颜色区域',
    '// Position relative to toolbar button':
        '// 相对于工具栏按钮定位',
    '// Save context for apply':
        '// 保存上下文信息用于应用颜色',
    '// Swatch click':
        '// 预设颜色块点击',
    '// Custom picker click':
        '// 自定义颜色选择器点击',
    '// Back button':
        '// 返回按钮',
    '// Native color input change':
        '// 原生颜色选择器值变化',
    '// Hex input validate':
        '// 16进制颜色值输入校验',
    '// Confirm button':
        '// 确认按钮',
    '// Close when clicking outside':
        '// 点击面板外部时关闭',

    // Apply color
    '// Apply color to editor selection':
        '// 将选中的颜色应用到编辑器选区',

    // Destroy method
    '// 1. Clear all timers':
        '// 1. 清除所有定时器',
    '// 2. Unbind document events (namespaced with editormd)':
        '// 2. 解绑所有文档级事件（editormd 命名空间）',
    '// 3. Unbind window resize events (namespaced)':
        '// 3. 解绑所有窗口 resize 事件（命名空间）',
    '// Unbind generic resize (may affect other instances,':
        '// 解绑通用 resize（可能影响其他实例，',
    '// but this is the best we can do for anonymous handlers)':
        '// 但对于匿名处理器这是最优解）',
    '// 4. Exit fullscreen if active':
        '// 4. 如果处于全屏状态则退出全屏',
    '// 5. Destroy CodeMirror and restore original textarea':
        '// 5. 销毁 CodeMirror 并恢复原始 textarea',
    '// 6. Remove editormd-specific DOM elements':
        '// 6. 移除 editormd 相关的 DOM 元素',
    '// Restore original textarea visibility':
        '// 恢复原始 textarea 的可见性',
    '// 7. Remove editormd classes':
        '// 7. 移除 editormd 相关的 CSS 类名',
    '// 8. Reset state':
        '// 8. 重置编辑器状态',
    '// 9. Clear references to aid garbage collection':
        '// 9. 清除引用以辅助垃圾回收',
};

for (const [oldStr, newStr] of Object.entries(prototypeCommentMap)) {
    src = src.replace(oldStr, newStr);
}

// ===================== 静态方法区域注释 =====================
const staticCommentMap = {
    // KeyMaps comment
    '"Ctrl-B"       : "bold",  // if this is string ==  editormd.toolbarHandlers.xxxx':
        '"Ctrl-B"       : "bold",  // 如果值为字符串，则对应 editormd.toolbarHandlers 中的方法',

    // preprocessMarkdownBlocks
    '// Convert new image/video size syntax to inline HTML for renderer compatibility':
        '// 将新的图片/视频尺寸语法转换为内联 HTML 以兼容 marked 渲染器',
    '// Process tabs blocks: [[tabs]]...[[/tabs]]':
        '// 处理标签页语法：[[tabs]]...[[/tabs]]',
    '// Process columns blocks: [[columns:N]]...[[/columns]]':
        '// 处理多栏布局语法：[[columns:N]]...[[/columns]]',
    '// Process video blocks: [[video]]...[[/video]]':
        '// 处理视频列表语法：[[video]]...[[/video]]',
    '// Process file blocks: [[file]]...[[/file]]':
        '// 处理文件列表语法：[[file]]...[[/file]]',

    // markedRenderer defaults
    'toc                  : true,           // Table of contents':
        'toc                  : true,           // 生成目录（Table of Contents）',
    'tocStartLevel        : 1,              // Said from H1 to create ToC':
        'tocStartLevel        : 1,              // 从第几级标题开始生成目录',
    'atLink               : true,           // for @link':
        'atLink               : true,           // 是否解析 @用户名 链接',
    'emailLink            : true,           // for mail address auto link':
        'emailLink            : true,           // 是否解析邮箱地址自动链接',
    'taskList             : false,          // Enable Github Flavored Markdown task lists':
        'taskList             : false,          // 启用 GitHub Flavored Markdown 任务列表',
    'tex                  : false,          // TeX(LaTeX), based on KaTeX':
        'tex                  : false,          // 启用 TeX / LaTeX 数学公式（基于 KaTeX）',
    'flowChart            : false,          // flowChart.js only support IE9+':
        'flowChart            : false,          // 启用流程图（flowChart.js 仅支持 IE9+）',
    'sequenceDiagram      : false,          // sequenceDiagram.js only support IE9+':
        'sequenceDiagram      : false,          // 启用时序图（sequenceDiagram.js 仅支持 IE9+）',
    'pinyin               : false,          // Enable pinyin syntax {text | pinyin}':
        'pinyin               : false,          // 启用拼音标注语法 {文本 | 拼音}',
    'textAlign            : true,           // Enable text align syntax':
        'textAlign            : true,           // 启用文本对齐语法',
    'imageResize          : true,           // Enable image width/height syntax':
        'imageResize          : true,           // 启用图片宽高编辑语法',
    'echarts              : false,          // Enable Apache ECharts':
        'echarts              : false,          // 启用 Apache ECharts 图表',
    'tabs                 : true,           // Enable tabs syntax':
        'tabs                 : true,           // 启用标签页 [[tabs]] 语法',
    'columns              : true,           // Enable multi-column layout':
        'columns              : true,           // 启用多栏布局 [[columns:N]] 语法',
    'tooltip              : true            // Enable tooltip syntax':
        'tooltip              : true            // 启用悬浮提示 [text](tooltip:content) 语法',

    // markedRenderer.link
    '// Tooltip link syntax: [text](tooltip:content) / [text](tooltip:image:url) / [text](tooltip:iframe:url)':
        '// 悬浮提示链接语法：[文本](tooltip:内容) / [文本](tooltip:image:图片URL) / [文本](tooltip:iframe:页面URL)',

    // markedRenderer.image
    '// Image tooltip syntax: ![alt](url){tooltip:content} / {tooltip:image:url} / {tooltip:iframe:url}':
        '// 图片悬浮提示语法：![alt](url){tooltip:内容} / {tooltip:image:图片URL} / {tooltip:iframe:页面URL}',

    // tocDropdownMenu
    'tocTitle      = tocTitle || "Table of Contents";':
        'tocTitle      = tocTitle || "目录";',

    // markdownToHTML
    'atLink               : true,    // for @link':
        'atLink               : true,    // 是否解析 @用户名 链接',
    'emailLink            : true,    // for mail address auto link':
        'emailLink            : true,    // 是否解析邮箱地址自动链接',
    'taskList             : false,   // Github Flavored Markdown task lists':
        'taskList             : false,   // GitHub Flavored Markdown 任务列表',

    // Preprocess before marked
    '// Preprocess custom block syntax before marked parsing':
        '// 在 marked 解析之前预处理自定义块级语法',

    // Inject copy buttons
    '// Inject copy buttons into all pre blocks':
        '// 向所有 pre 代码块注入复制按钮',

    // markdownToHTML rendererOptions
    'atLink               : settings.atLink,           // for @link':
        'atLink               : settings.atLink,           // 是否解析 @用户名 链接',
    'emailLink            : settings.emailLink,        // for mail address auto link':
        'emailLink            : settings.emailLink,        // 是否解析邮箱地址自动链接',

    // sanitize
    "sanitize    : (settings.htmlDecode) ? false : true, // 是否忽略HTML标签，即是否开启HTML标签解析，为了安全性，默认不开启":
        "sanitize    : (settings.htmlDecode) ? false : true, // 是否过滤 HTML 标签，即是否开启 HTML 标签解析（默认关闭以保证安全性）",

    // Theme comments
    '// Editor.md themes, change toolbar themes etc.':
        '// Editor.md 编辑器主题列表（用于切换工具栏等主题）',
    '// added @1.5.0':
        '// 自 v1.5.0 起添加',
    '// Preview area themes':
        '// 预览区主题列表',
    '// CodeMirror / editor area themes':
        '// CodeMirror / 编辑区主题列表',
    '// @1.5.0 rename -> editorThemes, old version -> themes':
        '// 自 v1.5.0 起重命名为 editorThemes，旧版本为 themes',

    // KaTeX
    '// 使用国外的CDN，加载速度有时会很慢，或者自定义URL':
        '// 使用国外的 CDN 可能加载较慢，建议使用本地路径或自定义 URL',
    '// You can custom KaTeX load url.':
        '// 你可以自定义 KaTeX 的加载URL',

    // loadScript onerror
    '// Handle script load failure gracefully':
        '// 优雅处理脚本加载失败',
    '// Continue loading chain even if a script fails':
        '// 即使脚本加载失败，也继续执行加载链',

    // Filter HTML
    '// Enhanced XSS protection with whitelist approach':
        '// 增强的 XSS 防护（白名单方式）',
    '// Remove dangerous tags completely':
        '// 彻底移除危险标签',
    '// Also handle self-closing dangerous tags':
        '// 同时处理自闭合的危险标签',
    '// Sanitize href and src attributes to prevent javascript: protocol':
        '// 清洗 href 和 src 属性，防止 javascript: 协议注入',
    '// Remove dangerous event attributes':
        '// 移除危险的事件属性',
    '// Handle without quotes':
        '// 处理不带引号的属性值',
    '// Remove expression and behavior in style attributes (IE-specific XSS vectors)':
        '// 移除 style 属性中的 expression 和 behavior（IE 特有的 XSS 向量）',

    // Static initCodeCopy
    '// Append button directly to the pre (outside the scroll wrapper)':
        '// 将复制按钮追加到 pre 元素（位于滚动包装容器外部）',
    '// Fallback using textarea + execCommand':
        '// 降级方案：使用 textarea + execCommand',
};

for (const [oldStr, newStr] of Object.entries(staticCommentMap)) {
    src = src.replace(oldStr, newStr);
}

// ===================== 多行注释块中文化 =====================
const multiLineCommentMap = {
    '         * Inject a "Copy" button into the top-right corner of every <pre> block\n         * in the given container.\n         *\n         * @param   {jQuery} $container  The container to search for <pre> blocks\n         * @returns {editormd}':
        '         * 向给定容器中的每个 <pre> 块右上角注入"复制"按钮。\n         *\n         * @param   {jQuery} $container  要搜索 <pre> 块的容器（jQuery 对象）\n         * @returns {editormd}',

    '        /**\n         * Initialize table editing in preview area\n         */':
        '        /**\n         * 初始化预览区的表格编辑功能\n         */',

    '        /**\n         * Modify table markdown source based on preview action\n         */':
        '        /**\n         * 根据预览区操作修改 Markdown 源中的表格内容\n         */',

    '        /**\n         * Initialize image resize in preview area\n         */':
        '        /**\n         * 初始化预览区的图片缩放功能\n         */',

    '        /**\n         * Modify image size in markdown source\n         */':
        '        /**\n         * 修改 Markdown 源中的图片尺寸\n         */',

    '        /**\n         * Initialize ECharts in preview area\n         */':
        '        /**\n         * 初始化预览区的 ECharts 图表\n         */',

    '        /**\n         * Initialize Tabs in preview area\n         */':
        '        /**\n         * 初始化预览区的标签页标签切换\n         */',

    '        /**\n         * Initialize multi-column layout dividers in preview area\n         */':
        '        /**\n         * 初始化预览区的多栏布局分隔线\n         */',

    '        /**\n         * Initialize Tooltips in preview area\n         */':
        '        /**\n         * 初始化预览区的悬浮提示工具\n         */',

    '    /**\n     * Show color picker panel for text color or background color\n     */':
        '    /**\n     * 显示文字颜色或背景颜色选择面板\n     */',

    '    /**\n     * Apply color to editor selection\n     */':
        '    /**\n     * 将选中的颜色应用到编辑器选区\n     */',

    '        /**\n         * Preprocess markdown to extract custom block-level syntax (tabs, columns, align)\n         * before passing to marked. This prevents conflicts with fenced code blocks.\n         */':
        '        /**\n         * 预处理 Markdown：在传递给 marked 之前提取自定义块级语法\n         * （标签页、多栏、对齐），避免与围栏式代码块冲突。\n         */',

    '    /**\n     * Static helper: Inject "Copy" buttons into every <pre> block inside a container.\n     * Used by both the editor preview and the standalone markdownToHTML renderer.\n     *\n     * @param {jQuery} $container  The container element (jQuery object)\n     */':
        '    /**\n     * 静态辅助方法：向容器中的每个 <pre> 代码块注入"复制"按钮。\n     * 供编辑器预览和独立 markdownToHTML 渲染器共同使用。\n     *\n     * @param {jQuery} $container  容器元素（jQuery 对象）\n     */',
};

for (const [oldStr, newStr] of Object.entries(multiLineCommentMap)) {
    src = src.replace(oldStr, newStr);
}

// ===================== 剩余零星英文注释 =====================
const remainingComments = {
    '// Preprocess custom block syntax (tabs, columns, align) before marked parsing':
        '// 在 marked 解析之前预处理自定义块级语法（标签页、多栏、对齐）',
    '// Lazy load flowchart / sequence-diagram if preview contains corresponding elements':
        '// 预览区包含对应元素时延迟加载流程图 / 时序图',
    '// Auto-save draft after successful save':
        '// 保存成功后自动保存草稿',
    'if (codeMirror.css("display") === "none") // 为了兼容Zepto，而不使用codeMirror.is(":hidden")':
        'if (codeMirror.css("display") === "none") // 使用 css("display") 替代 is(":hidden") 以兼容 Zepto',

    // IE8 comment
    "e = e || window.event;  //IE":
        "e = e || window.event;  // IE 兼容",
};

for (const [oldStr, newStr] of Object.entries(remainingComments)) {
    src = src.replace(oldStr, newStr);
}

// ===================== 行内英文字符串替换（非对象 key 方式） =====================
// 这些是跨行的注释和特殊模式，需要用正则或逐个 replace 处理

// 复制按钮固定位置的注释
src = src.replace(
    '// Wrap existing content in scrollable container so the\n                // copy button stays fixed at the top-right regardless of scroll',
    '// 将原有内容包裹在可滚动容器中，使复制按钮在滚动时固定在右上角'
);

src = src.replace(
    '// In the same editing session (within 10 minutes), replace the latest draft\n                    // to avoid accumulating multiple drafts from auto-save intervals',
    '// 同一编辑会话中（10分钟内）替换最新草稿，避免自动保存产生多个重复草稿'
);

// Fallback comment (standalone, after "catch" clause)
src = src.replace(
    '                            // Fallback\n                            done(false);',
    '                            // 降级处理\n                            done(false);'
);

// Unbind generic resize comments (split across lines in destroy)
src = src.replace(
    "            // Unbind generic resize (may affect other instances, \n            // but this is the best we can do for anonymous handlers)",
    "            // 解绑通用 resize 事件（可能影响其他编辑器实例，\n            // 但对于匿名事件处理器这是最优方案）"
);

// 写回文件
fs.writeFileSync('src/editormd.js', src, 'utf8');
console.log('注释全部中文化处理完成！');
