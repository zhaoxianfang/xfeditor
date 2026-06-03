# Editor.md

![](https://pandao.github.io/editor.md/images/logos/editormd-logo-180x180.png)

![](https://img.shields.io/github/stars/pandao/editor.md.svg)
![](https://img.shields.io/github/forks/pandao/editor.md.svg)
![](https://img.shields.io/github/tag/pandao/editor.md.svg)
![](https://img.shields.io/github/release/pandao/editor.md.svg)
![](https://img.shields.io/github/issues/pandao/editor.md.svg)
![](https://img.shields.io/bower/v/editor.md.svg)

**Editor.md** : The open source embeddable online markdown editor (component), based on CodeMirror & jQuery & Marked.

### Features

- Support Standard Markdown / CommonMark and GFM (GitHub Flavored Markdown);
- Full-featured: Real-time Preview, Image (cross-domain) upload, Preformatted text/Code blocks/Tables insert, Code fold, Search replace, Read only, Themes, Multi-languages, L18n, HTML entities, Code syntax highlighting...;
- Markdown Extras : Support [ToC (Table of Contents)](https://pandao.github.io/editor.md/examples/toc.html), [Emoji](https://pandao.github.io/editor.md/examples/emoji.html), [Task lists](https://pandao.github.io/editor.md/examples/task-lists.html), [@Links](https://pandao.github.io/editor.md/examples/@links.html)...;
- **NEW in v1.7.0**: Apache ECharts support (bar, line, pie, radar, funnel) via ` ```echarts ` code blocks;
- **NEW in v1.7.0**: Tabs component support via `[[tabs]]...[[/tabs]]` block tags, fully compatible with nested code blocks, tables and charts;
- **NEW in v1.7.0**: Multi-column newspaper-style layout via `[[columns:N]]...[[/columns]]` block tags;
- **NEW in v1.7.0**: Tooltip/Popover support for links and images;
- **NEW in v1.7.0**: Unicode inline alignment via `⁑⁑text⁑⁑` (center), `⁑⁖text⁖⁑` (left), `⁑⠕text⠕⁑` (right), `⁑⁛text⁛⁑` (justify);
- **NEW in v1.7.0**: File upload with configurable `fileFormats` whitelist and toolbar integration;
- **NEW in v1.7.0**: Image paste-upload from clipboard and improved upload error handling;
- **NEW in v1.7.0**: Image resize with Shift key to maintain aspect ratio;
- **NEW in v1.7.0**: Double-click formulas in preview to jump to source;
- **NEW in v1.6.0**: Pinyin annotation support `{text | pinyin}` syntax;
- **NEW in v1.7.0**: Unicode inline alignment via `⁑⁑text⁑⁑` (center), `⁑⁖text⁖⁑` (left), `⁑⠕text⠕⁑` (right), `⁑⁛text⁛⁑` (justify), works in headings, paragraphs and list items; legacy `[[align]]` block tags still compatible;
- **NEW in v1.7.0**: Image dimension syntax upgraded to `![alt](url)<W,H>`, editor syncs on preview resize;
- **NEW in v1.7.0**: Browser draft auto-save with recovery dialog (`draftAutoSave`, `draftInterval`);
- **NEW in v1.6.0**: Image width/height dimension editing in both editor and preview (legacy `=WxH` syntax);
- **NEW in v1.6.0**: Table row/column insert/delete operations in both editor and preview;
- **NEW in v1.6.0**: Toolbar dropdown groups for reducing toolbar sprawl;
- **NEW in v1.6.0**: Enhanced XSS protection with whitelist-based filtering;
- **NEW in v1.6.0**: Comprehensive event handling system (keydown, keyup, mouseup, mousedown, paste, drop, copy, cut, focus, blur, cursorActivity);
- Compatible with all major browsers (IE8+), compatible Zepto.js and iPad;
- Support [decode & filter of the HTML tags & attributes](https://pandao.github.io/editor.md/examples/html-tags-decode.html);
- Support [TeX (LaTeX expressions, Based on KaTeX)](https://pandao.github.io/editor.md/examples/katex.html), [Flowchart](https://pandao.github.io/editor.md/examples/flowchart.html) and [Sequence Diagram](https://pandao.github.io/editor.md/examples/sequence-diagram.html) of Markdown extended syntax;
- Support AMD/CMD (Require.js & Sea.js) Module Loader, and Custom/define editor plugins;

[README & Examples (English)](https://pandao.github.io/editor.md/en.html)
  

--------

**Editor.md** 是一款开源的、可嵌入的 Markdown 在线编辑器（组件），基于 CodeMirror、jQuery 和 Marked 构建。

![editormd-screenshot](https://pandao.github.io/editor.md/examples/images/editormd-screenshot.png "editormd-screenshot")

#### 主要特性

- 支持通用 Markdown / CommonMark 和 GFM (GitHub Flavored Markdown) 风格的语法，也可[变身为代码编辑器](https://pandao.github.io/editor.md/examples/change-mode.html)；
- 支持实时预览、图片（跨域）上传、预格式文本/代码/表格插入、代码折叠、跳转到行、搜索替换、只读模式、自定义样式主题和多语言语法高亮等功能；
- 支持 [ToC（Table of Contents）](https://pandao.github.io/editor.md/examples/toc.html)、[Emoji表情](https://pandao.github.io/editor.md/examples/emoji.html)、[Task lists](https://pandao.github.io/editor.md/examples/task-lists.html)、[@链接](https://pandao.github.io/editor.md/examples/@links.html)等 Markdown 扩展语法；
- **v1.7.0 新增**: Apache ECharts 图表库支持，使用 ` ```echarts ` 代码块语法插入柱状图、折线图、饼图、雷达图、漏斗图；
- **v1.7.0 新增**: Tabs 标签页功能，使用 `[[tabs]]...[[/tabs]]` 标签语法创建可交互标签页，内部支持代码块、表格、图表等任意 Markdown 内容；
- **v1.7.0 新增**: 多列排版功能，使用 `[[columns:N]]...[[/columns]]` 标签语法实现报纸式多栏排版；
- **v1.7.0 新增**: Unicode 行内对齐语法，`⁑⁑内容⁑⁑` 居中、`⁑⁖内容⁖⁑` 左对齐、`⁑⠕内容⠕⁑` 右对齐、`⁑⁛内容⁛⁑` 两端对齐，适用于标题、段落、列表等任意行内位置；旧版 `[[align]]` 块级标签仍兼容；
- **v1.7.0 新增**: 图片尺寸语法升级为 `![alt](url)<W,H>`，预览区拖拽后编辑器同步更新；
- **v1.7.0 新增**: 浏览器草稿暂存功能，配置 `draftAutoSave: true` 自动保存编辑内容，防止误刷新丢失；支持配置 `draftInterval`（秒）和 `draftMaxDays`（最长保留天数），相同内容自动去重仅保留最新版本；
- **v1.7.0 新增**: 悬浮提示功能，支持 `[文本](tooltip:内容)` 和 `![alt](url "tooltip:内容")` 语法；
- **v1.7.0 新增**: Unicode 行内对齐语法，`⁑⁑内容⁑⁑` 居中、`⁑⁖内容⁖⁑` 左对齐、`⁑⠕内容⠕⁑` 右对齐、`⁑⁛内容⁛⁑` 两端对齐，适用于标题、段落、列表等任意行内场景；
- **v1.7.0 新增**: Insert 下拉工具栏，将代码、预格式化文本、代码块、表格、日期时间、Emoji、HTML 实体、分页符统一归入 `insert` 下拉菜单；
- **v1.7.0 新增**: 文件上传功能，支持配置 `fileFormats` 白名单，工具栏一键上传并插入文件链接，同时支持填写 URL 和本地上传；
- **v1.7.0 新增**: 图片编辑增强，拖拽调整尺寸时按住 Shift 键保持原始宽高比例，支持剪贴板粘贴上传；
- **v1.7.0 新增**: 数学公式双击编辑，预览区双击公式可快速定位到 Markdown 源码；
- **v1.6.0 新增**: 拼音标注语法 `{文本 | pinyin}`，在预览区显示带拼音的文本；
- **v1.6.0 新增**: ~~文本对齐语法支持（`->文本<-` 居中...）~~（v1.7.0 已升级为 Unicode 行内对齐 `⁑⁑...⁑⁑`，旧版 `[[align]]` 仍兼容）；
- **v1.6.0 新增**: ~~图片宽高尺寸编辑，支持 `![alt](url=300x200)` 语法~~（v1.7.0 已升级为 `![alt](url)<W,H>` 语法）；
- **v1.6.0 新增**: 表格行列操作，在预览区点击表格单元格即可插入/删除行列，自动同步到 Markdown 源码；
- **v1.6.0 新增**: 工具栏下拉分组功能，使用 `{"H1": ["h1","h2",...]}` 语法合并同类工具栏图标；
- **v1.6.0 新增**: 全面增强 XSS 安全防护，采用白名单机制过滤危险标签、事件属性和非法协议；
- **v1.6.0 新增**: 完善的事件处理机制，支持 keydown、keyup、mouseup、mousedown、paste、drop、copy、cut、focus、blur、cursorActivity 等事件回调；
- 支持 TeX 科学公式（基于 [KaTeX](https://pandao.github.io/editor.md/examples/katex.html)）、流程图 [Flowchart](https://pandao.github.io/editor.md/examples/flowchart.html) 和 [时序图 Sequence Diagram](https://pandao.github.io/editor.md/examples/sequence-diagram.html);
- 支持[识别和解析 HTML 标签，并且支持自定义过滤标签及属性解析](https://pandao.github.io/editor.md/examples/html-tags-decode.html)，具有可靠的安全性和几乎无限的扩展性；
- 支持 AMD / CMD 模块化加载（支持 [Require.js](https://pandao.github.io/editor.md/examples/use-requirejs.html) & [Sea.js](https://pandao.github.io/editor.md/examples/use-seajs.html)），并且支持[自定义扩展插件](https://pandao.github.io/editor.md/examples/define-plugin.html)；
- 兼容主流的浏览器（IE8+）和 [Zepto.js](https://pandao.github.io/editor.md/examples/use-zepto.html)，且支持 iPad 等平板设备；

#### 下载与安装

下载：

[Github 下载](https://github.com/pandao/editor.md/archive/master.zip)

NPM 安装：

```bash
npm install editor.md
```

Bower 安装：

```bash
bower install editor.md
```

#### 使用方法

##### 创建 Markdown 编辑器

```html
<link rel="stylesheet" href="editor.md/css/editormd.min.css" />
<div id="editor">
    <textarea style="display:none;">### 你好，Editor.md！</textarea>
</div>
<script src="jquery.min.js"></script>
<script src="editor.md/editormd.min.js"></script>
<script type="text/javascript">
    $(function() {
        var editor = editormd("editor", {
            width: "100%",
            height: "100%",
            path: "editor.md/lib/",  // 依赖模块自动加载路径
            // 开启 v1.7.0 全部新功能
            echarts: true,
            tabs: true,
            columns: true,
            tooltip: true,
            tex: true,
            flowChart: true,
            sequenceDiagram: true,
            emoji: true,
            taskList: true
        });
    });
</script>
```

##### Markdown 转 HTML（非编辑模式）

```html
<link rel="stylesheet" href="editormd/css/editormd.preview.css" />
<div id="test-markdown-view">
    <textarea style="display:none;">### 你好世界！</textarea>
</div>
<script src="jquery.min.js"></script>
<script src="editormd/editormd.js"></script>
<script src="editormd/lib/marked.min.js"></script>
<script src="editormd/lib/prettify.min.js"></script>
<script type="text/javascript">
    $(function() {
        var testView = editormd.markdownToHTML("test-markdown-view", {
            echarts: true,
            tabs: true,
            columns: true,
            tooltip: true
        });
    });
</script>
```

#### v1.7.0 新功能详解

##### ECharts 图表

开启 `echarts: true`，使用 ` ```echarts ` 代码块插入图表：

```markdown
```echarts
{
  "type": "bar",
  "title": {"text": "月度销售额"},
  "xAxis": {"data": ["1月", "2月", "3月"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [120, 200, 150]}]
}
```
```

支持的图表类型：`bar`（柱状图）、`line`（折线图）、`pie`（饼图）、`radar`（雷达图）、`funnel`（漏斗图）。

##### Tabs 标签页

开启 `tabs: true`，使用 `[[tabs]]...[[/tabs]]` 标签语法：

```markdown
[[tabs]]
[[tab:产品介绍]]
Editor.md 是一款开源 Markdown 编辑器...
[[/tab]]
[[tab:更新日志]]
### v1.7.0
- 新增 ECharts 图表支持
[[/tab]]
[[/tabs]]
```

##### 多列排版

开启 `columns: true`，使用 `[[columns:N]]...[[/columns]]` 标签语法：

```markdown
[[columns:3]]
### 第一栏
第一栏内容...

### 第二栏
第二栏内容...

### 第三栏
第三栏内容...
[[/columns]]
```

##### 悬浮提示

开启 `tooltip: true`。

**文本悬浮提示：**
```markdown
[百度](tooltip:百度是全球最大的中文搜索引擎)
```

**图片悬浮提示：**
```markdown
![Logo](image.png "tooltip:这是 Logo 图片的说明")
```

##### 图片编辑增强

- 在预览区拖拽图片右下角调整尺寸；
- 按住 **Shift** 键拖拽保持原始宽高比；
- 双击图片输入精确宽高数值；
- 修改自动同步回 Markdown 源码。

##### 公式双击定位

开启 `tex: true` 后，预览区双击 KaTeX 渲染的公式，光标会自动跳转到 Markdown 源码中对应的 `$$...$$` 位置。

##### Unicode 行内对齐

开启 `textAlign: true`，使用 Unicode 特殊字符标记实现行内对齐：

```markdown
⁑⁑居中对齐的文本⁑⁑

⁑⁖左对齐的文本⁖⁑

⁑⠕右对齐的文本⠕⁑

⁑⁛两端对齐的文本，内容较长时可以看到两端对齐的效果。⁛⁑
```

适用场景：标题、段落、列表项、表格单元格等任意行内位置。旧版 `[[align]]` 块级标签和 `->text<-` 语法仍然兼容。

##### 文件上传

开启 `fileUpload: true` 并配置 `fileUploadURL` 和允许格式 `fileFormats`：

```javascript
editormd("editor", {
    fileUpload    : true,
    fileFormats   : ["doc", "docx", "pdf", "txt", "zip", "rar", "xls", "xlsx", "ppt", "pptx", "mp4", "mp3"],
    fileUploadURL : "./php/upload.php"
});
```

上传成功后，服务端应返回 JSON：

```json
{
    "success": 1,
    "message": "上传成功",
    "url": "./uploads/file.docx",
    "name": "file.docx"
}
```

工具栏点击"文件"图标即可打开上传对话框，支持 URL 直接插入和本地上传两种模式。

##### 扩展接口（v1.7.0 新增）

```javascript
var editor = editormd("editor", { /* ... */ });

// 获取字数统计（不含空白和 Markdown 标记）
var count = editor.getWordCount();

// 获取光标位置 {line, ch}
var pos = editor.getCursorPosition();

// 在光标处插入文本
editor.insertValue("插入的内容");

// 追加到文档末尾
editor.insertValue("追加内容", true);

// 清空编辑器
editor.clear();

// 获取当前选中的文本
var selection = editor.getSelection();

// 设置选区
editor.setSelection({line: 0, ch: 0}, {line: 0, ch: 10});

// 导出文件（支持 markdown 和 html 格式）
editor.exportFile("文档名", "markdown");
editor.exportFile("文档名", "html");
```

#### Usages

##### Create a Markdown editor

```html
<link rel="stylesheet" href="editor.md/css/editormd.min.css" />
<div id="editor">
    <!-- Tips: Editor.md can auto append a `<textarea>` tag -->
    <textarea style="display:none;">### Hello Editor.md !</textarea>
</div>
<script src="jquery.min.js"></script>
<script src="editor.md/editormd.min.js"></script>
<script type="text/javascript">
    $(function() {
        var editor = editormd("editor", {
            // width: "100%",
            // height: "100%",
            // markdown: "xxxx",     // dynamic set Markdown text
            path : "editor.md/lib/"  // Autoload modules mode, codemirror, marked... dependents libs path
        });
    });
</script>
```

If you using modular script loader:

- [Using Require.js](https://github.com/pandao/editor.md/tree/master/examples/use-requirejs.html)
- [Using Sea.js](https://github.com/pandao/editor.md/tree/master/examples/use-seajs.html)

##### Markdown to HTML

```html
<link rel="stylesheet" href="editormd/css/editormd.preview.css" />
<div id="test-markdown-view">
    <!-- Server-side output Markdown text -->
    <textarea style="display:none;">### Hello world!</textarea>             
</div>
<script src="jquery.min.js"></script>
<script src="editormd/editormd.js"></script>
<script src="editormd/lib/marked.min.js"></script>
<script src="editormd/lib/prettify.min.js"></script>
<script type="text/javascript">
    $(function() {
	    var testView = editormd.markdownToHTML("test-markdown-view", {
            // markdown : "[TOC]\n### Hello world!\n## Heading 2", // Also, you can dynamic set Markdown text
            // htmlDecode : true,  // Enable / disable HTML tag encode.
            // htmlDecode : "style,script,iframe",  // Note: If enabled, you should filter some dangerous HTML tags for website security.
        });
    });
</script>    
```

> See the full example: [http://editor.md.ipandao.com/examples/html-preview-markdown-to-html.html](http://editor.md.ipandao.com/examples/html-preview-markdown-to-html.html)

##### HTML to Markdown?

Sorry, Editor.md not support HTML to Markdown parsing, Maybe In the future.

#### New Features in v1.7.0

##### Apache ECharts Support

Enable `echarts: true` and use fenced code blocks with language `echarts`:

```markdown
```echarts
{
  "type": "bar",
  "title": {"text": "柱状图"},
  "xAxis": {"data": ["A", "B", "C"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [5, 20, 36]}]
}
```
```

Supported chart types: `bar`, `line`, `pie`, `radar`, `funnel`.
The JSON inside the code block is passed directly to `echarts.init().setOption()`.

##### Tabs

Enable `tabs: true` and use `[[tabs]]...[[/tabs]]` block tags:

```markdown
[[tabs]]
[[tab:Tab1]]
Tab1 content supports **Markdown** syntax.
[[/tab]]
[[tab:Tab2]]
Tab2 content.
[[/tab]]
[[/tabs]]
```

Each tab's content is independently rendered with full Markdown support.

##### Multi-Column Layout

Enable `columns: true` and use `[[columns:N]]...[[/columns]]` block tags:

```markdown
[[columns:3]]
### Column 1
Content for the first column.

### Column 2
Content for the second column.

### Column 3
Content for the third column.
[[/columns]]
```

The number after `columns:` specifies the column count (e.g., 2, 3, 4).
Uses CSS `column-count` for newspaper-style layouts.

##### Tooltip / Popover

Enable `tooltip: true`.

**Link tooltip:**
```markdown
[Hover me](tooltip:This is a tooltip)
```

**Image tooltip:**
```markdown
![Image](image.jpg "tooltip:Image description")
```

The tooltip appears on mouse hover or focus, with a smooth fade-in animation.

##### Image Resize Enhancements

- Drag the resize handle in the preview area to adjust image dimensions.
- Hold **Shift** while dragging to maintain the original aspect ratio.
- Double-click an image to input exact width and height values via prompt.
- Changes are automatically synchronized back to the Markdown source.

##### Formula Double-Click Edit

When `tex: true`, double-clicking a rendered KaTeX formula in the preview area will jump the cursor to the corresponding `$$...$$` block in the Markdown source.

#### New Features in v1.6.0

##### Toolbar Dropdown Groups

```javascript
editormd("editor", {
    toolbarIcons : [
        "undo", "redo", "|",
        { "h1" : ["h1", "h2", "h3", "h4", "h5", "h6"] },  // Dropdown group
        "|",
        { "align" : ["align-left", "align-center", "align-right"] },
        "|",
        "bold", "italic", "del"
    ]
});
```

##### Pinyin Annotation

```markdown
{基本语法 | jī běn yǔ fǎ}
```

##### Text Alignment

```markdown
⁑⁑This text is centered⁑⁑

⁑⠕This text is right aligned⠕⁑

⁑⁖This text is left aligned⁖⁑

⁑⁛This text is justified⁛⁑
```

旧版块级对齐（仍兼容）：

```markdown
[[align:center]]
This text is centered
[[/align]]

[[align:right]]
This text is right aligned
[[/align]]

[[align:left]]
This text is left aligned
[[/align]]
```

##### Image with Dimensions

```markdown
![Alt text](image.jpg)<300,200>
```

##### Enhanced Event Handling

```javascript
editormd("editor", {
    onkeydown: function(cm, e) { console.log("keydown", e); },
    onkeyup: function(cm, e) { console.log("keyup", e); },
    onpaste: function(cm, e) { console.log("paste", e); },
    ondrop: function(cm, e) { console.log("drop", e); },
    onfocus: function(cm, e) { console.log("focus"); },
    onblur: function(cm, e) { console.log("blur"); },
    oncursoractivity: function(cm) { console.log("cursor moved"); }
});
```

#### Examples

[https://pandao.github.io/editor.md/examples/index.html](https://pandao.github.io/editor.md/examples/index.html)

#### Options

Editor.md options and default values:

```javascript
{
    mode                 : "gfm",          // gfm or markdown
    name                 : "",             // Form element name for post
    value                : "",             // value for CodeMirror, if mode not gfm/markdown
    theme                : "",             // Editor.md self themes, before v1.5.0 is CodeMirror theme, default empty
    editorTheme          : "default",      // Editor area, this is CodeMirror theme at v1.5.0
    previewTheme         : "",             // Preview area theme, default empty
    markdown             : "",             // Markdown source code
    appendMarkdown       : "",             // if in init textarea value not empty, append markdown to textarea
    width                : "100%",
    height               : "100%",
    path                 : "./lib/",       // Dependents module file directory
    pluginPath           : "",             // If this empty, default use settings.path + "../plugins/"
    delay                : 300,            // Delay parse markdown to html, Uint : ms
    autoLoadModules      : true,           // Automatic load dependent module files
    watch                : true,
    placeholder          : "Enjoy Markdown! coding now...",
    gotoLine             : true,           // Enable / disable goto a line
    codeFold             : false,
    autoHeight           : false,
    autoFocus            : true,           // Enable / disable auto focus editor left input area
    autoCloseTags        : true,
    searchReplace        : true,           // Enable / disable (CodeMirror) search and replace function
    syncScrolling        : true,           // options: true | false | "single", default true
    readOnly             : false,          // Enable / disable readonly mode
    tabSize              : 4,
    indentUnit           : 4,
    lineNumbers          : true,           // Display editor line numbers
    lineWrapping         : true,
    autoCloseBrackets    : true,
    showTrailingSpace    : true,
    matchBrackets        : true,
    indentWithTabs       : true,
    styleSelectedText    : true,
    matchWordHighlight   : true,           // options: true, false, "onselected"
    styleActiveLine      : true,           // Highlight the current line
    dialogLockScreen     : true,
    dialogShowMask       : true,
    dialogDraggable      : true,
    dialogMaskBgColor    : "#fff",
    dialogMaskOpacity    : 0.1,
    fontSize             : "13px",
    saveHTMLToTextarea   : false,          // If enable, Editor will create a <textarea name="{editor-id}-html-code"> tag save HTML code for form post to server-side.
    disabledKeyMaps      : [],
    
    onload               : function() {},
    onresize             : function() {},
    onchange             : function() {},
    onwatch              : null,
    onunwatch            : null,
    onpreviewing         : function() {},
    onpreviewed          : function() {},
    onfullscreen         : function() {},
    onfullscreenExit     : function() {},
    onscroll             : function() {},
    onpreviewscroll      : function() {},
    onbeforesave         : function() {},
    onaftersave          : function() {},
    oninsert             : function() {},
    ontablechange        : function() {},
    onimagechange        : function() {},
    onkeydown            : function() {},
    onkeyup              : function() {},
    onmouseup            : function() {},
    onmousedown          : function() {},
    onpaste              : function() {},
    ondrop               : function() {},
    oncopy               : function() {},
    oncut                : function() {},
    onfocus              : function() {},
    onblur               : function() {},
    oncursoractivity     : function() {},
    
    imageUpload          : false,          // Enable/disable upload
    imageFormats         : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
    imageUploadURL       : "",             // Upload url
    crossDomainUpload    : false,          // Enable/disable Cross-domain upload
    uploadCallbackURL    : "",             // Cross-domain upload callback url
    imageResize          : true,           // Enable image width/height edit in preview
    
    fileUpload           : false,          // Enable/disable file upload
    fileFormats          : ["doc", "docx", "pdf", "txt", "zip", "rar", "xls", "xlsx", "ppt", "pptx", "mp4", "mp3"],
    fileUploadURL        : "",             // File upload url
    
    draftAutoSave        : false,          // Enable browser draft auto-save
    draftInterval        : 30,             // Auto-save interval in seconds
    draftMaxDays         : 30,             // Maximum days to keep drafts (auto cleanup older)
    echarts              : false,          // Enable Apache ECharts support
    tabs                 : true,           // Enable tabs syntax
    columns              : true,           // Enable multi-column layout syntax
    tooltip              : true,           // Enable tooltip/popover syntax

    toc                  : true,           // Table of contents
    tocm                 : false,          // Using [TOCM], auto create ToC dropdown menu
    tocTitle             : "",             // for ToC dropdown menu button
    tocDropdown          : false,          // Enable/disable Table Of Contents dropdown menu
    tocContainer         : "",             // Custom Table Of Contents Container Selector
    tocStartLevel        : 1,              // Said from H1 to create ToC
    htmlDecode           : false,          // Open the HTML tag identification 
    pageBreak            : true,           // Enable parse page break [========]
    atLink               : true,           // for @link
    emailLink            : true,           // for email address auto link
    taskList             : false,          // Enable Github Flavored Markdown task lists
    emoji                : false,          // :emoji: , Support Github emoji, Twitter Emoji (Twemoji);
                                           // Support FontAwesome icon emoji :fa-xxx: > Using fontAwesome icon web fonts;
                                           // Support Editor.md logo icon emoji :editormd-logo: :editormd-logo-1x: > 1~8x;
    tex                  : false,          // TeX(LaTeX), based on KaTeX
    flowChart            : false,          // flowChart.js only support IE9+
    sequenceDiagram      : false,          // sequenceDiagram.js only support IE9+
    previewCodeHighlight : true,           // Enable / disable code highlight of editor preview area
    pinyin               : false,          // Enable pinyin display syntax {text | pinyin}
    textAlign            : true,           // Enable text align syntax
    tableEdit            : true,           // Enable table row/col insert/delete in preview
    toolbarDropdown      : true,           // Enable toolbar dropdown groups

    toolbar              : true,           // show or hide toolbar
    toolbarAutoFixed     : true,           // on window scroll auto fixed position
    toolbarIcons         : "full",         // Toolbar icons mode, options: full, simple, mini, See `editormd.toolbarModes` property.
    toolbarTitles        : {},
    toolbarHandlers      : {
        ucwords : function() {
            return editormd.toolbarHandlers.ucwords;
        },
        lowercase : function() {
            return editormd.toolbarHandlers.lowercase;
        }
    },
    toolbarCustomIcons   : {               // using html tag create toolbar icon, unused default <a> tag.
        lowercase        : "<a href=\"javascript:;\" title=\"Lowercase\" unselectable=\"on\"><i class=\"fa\" name=\"lowercase\" style=\"font-size:24px;margin-top: -10px;\">a</i></a>",
        "ucwords"        : "<a href=\"javascript:;\" title=\"ucwords\" unselectable=\"on\"><i class=\"fa\" name=\"ucwords\" style=\"font-size:20px;margin-top: -3px;\">Aa</i></a>"
    },
    toolbarIconTexts     : {},
    
    lang : {  // Language data, you can custom your language.
        name        : "zh-cn",
        description : "开源在线Markdown编辑器<br/>Open source online Markdown editor.",
        tocTitle    : "目录",
        toolbar     : {
            //...
        },
        button: {
            //...
        },
        dialog : {
            //...
        }
        //...
    }
}
```

#### Dependents

- [CodeMirror](http://codemirror.net/ "CodeMirror")
- [marked](https://github.com/markedjs/marked "marked")
- [jQuery](http://jquery.com/ "jQuery")
- [FontAwesome](http://fontawesome.io/ "FontAwesome")
- [github-markdown.css](https://github.com/sindresorhus/github-markdown-css "github-markdown.css")
- [KaTeX](http://khan.github.io/KaTeX/ "KaTeX")
- [prettify.js](http://code.google.com/p/google-code-prettify/ "prettify.js")
- [Rephael.js](http://raphaeljs.com/ "Rephael.js")
- [flowchart.js](http://adrai.github.io/flowchart.js/ "flowchart.js")
- [sequence-diagram.js](http://bramp.github.io/js-sequence-diagrams/ "sequence-diagram.js")
- [Prefixes.scss](https://github.com/pandao/prefixes.scss "Prefixes.scss")

#### Changes

[Change logs](https://github.com/pandao/editor.md/blob/master/CHANGE.md)

#### License

The MIT License.

Copyright (c) 2015-2019 Pandao
