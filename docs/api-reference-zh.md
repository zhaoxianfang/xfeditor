# Editor.md API 参考文档

## 目录

1. [初始化](#初始化)
2. [配置选项](#配置选项)
3. [实例方法](#实例方法)
4. [静态方法](#静态方法)
5. [语言和本地化](#语言和本地化)
6. [事件回调](#事件回调)
7. [工具栏配置](#工具栏配置)
8. [自定义语法参考](#自定义语法参考)
9. [上传接口规范](#上传接口规范)

---

## 初始化

### 基本用法

```html
<!-- 1. 引入依赖 -->
<link rel="stylesheet" href="css/editormd.css" />
<script src="js/jquery.min.js"></script>
<script src="editormd.min.js"></script>

<!-- 2. 定义编辑器容器 -->
<div id="test-editor">
    <textarea style="display:none;">### Hello Editor.md !</textarea>
</div>

<script>
    // 3. 初始化编辑器
    var editor = editormd("test-editor", {
        width   : "100%",
        height  : "500px",
        path    : "lib/",
        watch   : true
    });
</script>
```

### 多实例

```javascript
var editor1 = editormd("editor-1", { /* ... */ });
var editor2 = editormd("editor-2", { /* ... */ });
```

### 获取/设置 Markdown 内容

```javascript
// 获取内容
var markdown = editor.getMarkdown();
// 或
var markdown = editor.cm.getValue();

// 设置内容
editor.cm.setValue("## 新内容");

// 获取 HTML
var html = editor.getHTML();
```

---

## 配置选项

### 核心配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | String/Number | `"100%"` | 编辑器宽度 |
| `height` | String/Number | `"100%"` | 编辑器高度 |
| `path` | String | `"./lib/"` | 依赖模块文件目录 |
| `theme` | String | `""` | Editor.md 编辑器主题 |
| `editorTheme` | String | `"default"` | CodeMirror 编辑区主题 |
| `previewTheme` | String | `""` | 预览区主题 |
| `mode` | String | `"gfm"` | 编辑器模式：`"gfm"` 或 `"markdown"` |
| `markdown` | String | `""` | Markdown 源内容 |
| `value` | String | `""` | 初始值（当 mode 不是 gfm/markdown 时使用） |
| `placeholder` | String | `"写点什么吧~"` | 编辑区占位符文本 |

### 实时预览

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `watch` | Boolean | `true` | 启用实时预览 |
| `delay` | Number | `300` | Markdown 解析延迟（毫秒） |
| `syncScrolling` | Boolean/String | `true` | 同步滚动：`true` / `false` / `"single"` |

### CodeMirror 配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabSize` | Number | `4` | Tab 宽度 |
| `indentUnit` | Number | `4` | 缩进单位 |
| `lineNumbers` | Boolean | `true` | 显示行号 |
| `lineWrapping` | Boolean | `true` | 自动换行 |
| `autoCloseBrackets` | Boolean | `true` | 自动闭合括号 |
| `autoCloseTags` | Boolean | `true` | 自动闭合标签 |
| `matchBrackets` | Boolean | `true` | 括号匹配高亮 |
| `matchWordHighlight` | Boolean/String | `true` | 单词匹配高亮：`true` / `false` / `"onselected"` |
| `styleActiveLine` | Boolean | `true` | 高亮当前行 |
| `styleSelectedText` | Boolean | `true` | 选中文本样式 |
| `showTrailingSpace` | Boolean | `true` | 显示行尾空格 |
| `codeFold` | Boolean | `false` | 启用代码折叠 |
| `autoFocus` | Boolean | `true` | 自动聚焦 |

### 搜索替换

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `searchReplace` | Boolean | `true` | 启用搜索替换功能 |
| `gotoLine` | Boolean | `true` | 启用跳转到行功能 |

### 上传配置

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `imageUpload` | Boolean | `false` | 启用图片上传 |
| `imageUploadURL` | String | `""` | 图片上传接口地址 |
| `imageFormats` | Array | `["jpg","jpeg","gif","png","bmp","webp"]` | 允许的图片格式 |
| `fileUpload` | Boolean | `false` | 启用文件上传 |
| `fileUploadURL` | String | `""` | 文件上传接口地址 |
| `fileFormats` | Array | `[...]` | 允许的文件格式 |
| `videoUpload` | Boolean | `false` | 启用视频上传 |
| `videoUploadURL` | String | `""` | 视频上传接口地址 |
| `videoFormats` | Array | `["mp4","webm","ogv","mov"]` | 允许的视频格式 |
| `crossDomainUpload` | Boolean | `false` | 是否跨域上传 |

### 功能开关

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `toc` | Boolean | `true` | 启用目录生成 |
| `tocm` | Boolean | `false` | 使用 [TOCM] 自动创建目录下拉菜单 |
| `tex` | Boolean | `false` | 启用 TeX 数学公式（基于 KaTeX） |
| `flowChart` | Boolean | `false` | 启用流程图 |
| `sequenceDiagram` | Boolean | `false` | 启用时序图 |
| `taskList` | Boolean | `false` | 启用 GFM 任务列表 |
| `emoji` | Boolean | `false` | 启用 Github Emoji 表情 |
| `atLink` | Boolean | `true` | 启用 @link 语法 |
| `emailLink` | Boolean | `true` | 启用邮件地址自动链接 |
| `pageBreak` | Boolean | `true` | 启用分页符 [========] |
| `htmlDecode` | Boolean | `false` | 开启 HTML 标签识别解析 |
| `previewCodeHighlight` | Boolean | `true` | 启用预览区代码高亮 |
| `pinyin` | Boolean | `false` | 启用拼音标注 |
| `textAlign` | Boolean | `true` | 启用文本对齐语法 |
| `imageResize` | Boolean | `true` | 启用图片宽高编辑 |
| `echarts` | Boolean | `false` | 启用 ECharts 图表 |
| `tabs` | Boolean | `true` | 启用标签页语法 |
| `columns` | Boolean | `true` | 启用多栏布局语法 |
| `tooltip` | Boolean | `true` | 启用悬浮提示语法 |
| `draftAutoSave` | Boolean | `false` | 启用草稿自动保存 |
| `draftInterval` | Number | `30` | 草稿自动保存间隔（秒） |
| `draftMaxDays` | Number | `30` | 草稿最大保留天数 |

### 工具栏

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `toolbar` | Boolean | `true` | 显示工具栏 |
| `toolbarAutoFixed` | Boolean | `true` | 滚动时工具栏固定位置 |
| `toolbarIcons` | String | `"full"` | 工具栏模式：`"full"` / `"simple"` / `"mini"` |
| `toolbarTitles` | Object | `{}` | 自定义工具栏按钮标题 |
| `toolbarHandlers` | Object | `{}` | 自定义工具栏按钮处理函数 |
| `toolbarCustomIcons` | Object | `{}` | 自定义工具栏按钮 HTML |
| `toolbarIconTexts` | Object | `{}` | 非 FontAwesome 图标的文本 |

### 语言配置

```javascript
lang : {
    name        : "zh-cn",     // 语言标识
    description : "...",       // 关于对话框描述
    tocTitle    : "目录",      // 目录标题
    placeholder : "写点什么吧~", // 编辑区占位符
    toolbar     : { /* 工具栏按钮文本 */ },
    buttons     : { /* 对话框按钮文本 */ },
    dialog      : { /* 各对话框文本 */ }
}
```

---

## 实例方法

### 生命周期方法

#### `editor.destroy()`
完全销毁编辑器实例，清理所有资源（事件监听、定时器、DOM 元素等）。

```javascript
// 使用完毕时销毁编辑器
editor.destroy();
```

#### `editor.setLang(langObj, recreateToolbar)`
动态切换编辑器语言。

```javascript
// 切换到英文
editor.setLang("en");

// 使用自定义语言包
editor.setLang({
    name: "fr",
    toolbar: { bold: "Gras", /* ... */ }
});

// 不重建工具栏（仅更新内部配置）
editor.setLang("en", false);
```

### 内容操作

#### `editor.getMarkdown()`
获取编辑器中 Markdown 源内容。

```javascript
var content = editor.getMarkdown();
```

#### `editor.getHTML()`
获取预览 HTML 内容。

```javascript
var html = editor.getHTML();
```

#### `editor.setValue(value)`
设置编辑器内容。

```javascript
editor.setValue("## 新标题");
```

#### `editor.clear()`
清空编辑器内容。

```javascript
editor.clear();
```

### 预览控制

#### `editor.watch()`
开启实时预览。

```javascript
editor.watch();
```

#### `editor.unwatch()`
关闭实时预览。

```javascript
editor.unwatch();
```

#### `editor.previewing()`
预览模式（全窗口预览 HTML）。

```javascript
editor.previewing();
```

#### `editor.fullscreen()`
全屏模式切换。

```javascript
editor.fullscreen();     // 进入全屏
editor.fullscreen(true); // 强制进入全屏
editor.fullscreen(false);// 退出全屏
```

### 主题切换

#### `editor.setTheme(theme)`
设置编辑器主题。

```javascript
editor.setTheme("dark");
```

#### `editor.setEditorTheme(theme)`
设置 CodeMirror 编辑区主题。

```javascript
editor.setEditorTheme("monokai");
```

#### `editor.setPreviewTheme(theme)`
设置预览区主题。

```javascript
editor.setPreviewTheme("dark");
```

### 工具栏

#### `editor.setToolbar()`
重建工具栏。

```javascript
editor.setToolbar();
```

#### `editor.getToolbarHandles()`
获取工具栏按钮引用。

```javascript
editor.getToolbarHandles();
```

### 对话框

#### `editor.showInfoDialog()`
显示关于对话框。

```javascript
editor.showInfoDialog();
```

### 搜索

#### `editor.search()`
打开搜索对话框。

```javascript
editor.search();
```

#### `editor.searchReplace()`
打开搜索替换对话框。

```javascript
editor.searchReplace();
```

#### `editor.searchReplaceAll()`
打开全局搜索替换对话框。

```javascript
editor.searchReplaceAll();
```

#### `editor.gotoLine(line)`
跳转到指定行。

```javascript
editor.gotoLine(100);
editor.gotoLine(); // 显示跳转对话框
```

### 表格

#### `editor.tableDialog()`
打开表格插入对话框。

```javascript
editor.tableDialog();
```

### 代码块

#### `editor.codeBlockDialog()`
打开代码块对话框。

```javascript
editor.codeBlockDialog();
```

### 草稿管理

#### `editor.restoreDraft()`
恢复自动保存的草稿。

```javascript
editor.restoreDraft();
```

#### `editor.clearDraft()`
清除所有草稿。

```javascript
editor.clearDraft();
```

### 其他

#### `editor.resize(width, height)`
调整编辑器尺寸。

```javascript
editor.resize("100%", "600px");
```

#### `editor.recreate()`
重建编辑器界面（用于语言包或模块加载后刷新）。

```javascript
editor.recreate();
```

#### `editor.save()`
手动触发保存（解析 Markdown 并更新预览）。

```javascript
editor.save();
```

---

## 静态方法

#### `editormd.markdownToHTML(id, options)`
**最重要的静态方法之一** — 将 Markdown 文本所在的 textarea/div 转换为独立的 HTML 预览页面。适用于编辑器之外的静态渲染场景（如 `full-preview.html`）。

```javascript
editormd.markdownToHTML("content-area", {
    htmlDecode          : "style,script,iframe",
    emoji               : true,
    taskList            : true,
    tex                 : true,
    flowChart           : true,
    sequenceDiagram     : true,
    echarts             : true,
    tabs                : true,
    columns             : true,
    tooltip             : true,
    pinyin              : true,
    textAlign           : true,
    imageResize         : true,
    pageBreak           : true
});
```

**关键选项说明：**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `htmlDecode` | Boolean/String | `false` | 是否解析 HTML 标签。设为 `"style,script,iframe"` 可过滤危险标签 |
| `tocContainer` | String | `""` | 自定义目录容器。可为空（自动生成）、`""`（不生成）或 CSS 选择器 |
| `markdown` | String | `""` | 要解析的 Markdown 源码。为空时自动获取容器内 textarea 的值 |
| `markdownSourceCode` | Boolean | `false` | 是否在预览区底部展示 Markdown 源码 |
| `tocDropdown` | Boolean | `false` | 是否使用下拉菜单形式的目录（ToCM） |
| `tocStartLevel` | Number | `1` | 从第几级标题开始生成目录 |

#### `editormd("id").getHTML(options)`
**v1.7.0 重点改进** — 获取编辑器预览区 HTML 或生成独立可显示 HTML。

```javascript
// 基本用法：获取预览区 HTML 片段
var html = editor.getHTML();

// 包装为完整 HTML 页面（可直接保存为 .html 文件打开）
var fullPage = editor.getHTML({ wrap: true });

// 自定义选项
var custom = editor.getHTML({
    wrap            : true,      // 是否包装为完整 HTML 页面
    includeStyles   : true,      // 是否包含核心 CSS 样式
    includeScripts  : true,      // 是否包含初始化 JS（tooltip/tabs 等）
    title           : "我的文档", // 页面标题（仅 wrap: true）
    lang            : "zh-CN"    // 页面语言（仅 wrap: true）
});
```

**返回值：**
- 当 `wrap: false`（默认）：返回 `String` — 预览区 HTML 片段，含内联样式与脚本
- 当 `wrap: true`：返回 `String` — 完整独立的 HTML 页面，可直接保存或展示

#### `editormd("id").getPreviewedHTML()`
获取预览区渲染后的 HTML 内容（不包含编辑器UI）。与 `getHTML()` 类似，但始终返回预览容器内的 HTML。
```javascript
var previewed = editor.getPreviewedHTML();
```

### 语言相关

#### `editormd.registerLang(name, langObj)`
注册语言包到全局注册表。

```javascript
editormd.registerLang("fr", {
    name: "fr",
    toolbar: {
        bold: "Gras",
        italic: "Italique",
        // ...
    },
    // ...
});
```

#### `editormd.getLang(name)`
获取已注册的语言包。返回 `null` 如果未注册。

```javascript
var enLang = editormd.getLang("en");
```

### 加载资源

#### `editormd.loadScript(url, callback)`
动态加载 JavaScript 文件。

```javascript
editormd.loadScript("lib/codemirror/addons.min.js", function() {
    console.log("Addons loaded!");
});
```

#### `editormd.loadCSS(url)`
动态加载 CSS 文件。

```javascript
editormd.loadCSS("css/custom-theme.css");
```

### 日期格式化

#### `editormd.dateFormat(date, format)`
日期时间格式化。

```javascript
var now = editormd.dateFormat(new Date(), "Y-m-d H:i:s");
// => "2026-06-04 08:53:00"
```

### 对话框

#### `editormd.dialog(options)`
创建自定义对话框。

```javascript
var dialog = editormd.dialog({
    id      : "my-dialog",
    title   : "提示",
    content : "这是一个自定义对话框",
    width   : 400,
    height  : 300
});
```

#### `editormd.toolbarDialog(opts)`
创建工具栏对话框（自动包含遮罩层）。

```javascript
editormd.toolbarDialog({
    title   : "示例",
    content : "对话框内容",
    buttons : [
        '<button class="editormd-btn">确定</button>',
        '<button class="editormd-btn">取消</button>'
    ]
});
```

### 事件判断

#### `editormd.mouseOrTouch(mouseEvent, touchEvent)`
判断使用鼠标事件还是触摸事件。

```javascript
var eventType = editormd.mouseOrTouch("click", "touchend");
```

---

## 语言和本地化

### 内置语言

编辑器内置了三种语言的完整支持：

| 语言 | 标识符 | 文件 |
|------|--------|------|
| 简体中文 | `zh-cn` | 内置于 `editormd.js` |
| 繁体中文 | `zh-tw` | `languages/zh-tw.js` |
| 英文 | `en` | `languages/en.js` |

### 加载外部语言包

```html
<!-- 在引入 editormd.js 之后加载语言包 -->
<script src="editormd.min.js"></script>
<script src="languages/en.js"></script>
<!-- 此时所有新创建的编辑器都使用英文 -->
```

### 运行时切换语言

```javascript
var editor = editormd("editor", { /* ... */ });

// 使用已注册的语言包切换
editor.setLang("en");

// 使用自定义语言对象
editor.setLang({
    name: "custom",
    toolbar: { bold: "My Bold", /* ... */ }
});
```

### 注册自定义语言

```javascript
// 方式一：直接注册
editormd.registerLang("fr", {
    name: "fr",
    toolbar: { bold: "Gras", italic: "Italique" },
    buttons: { enter: "OK", cancel: "Annuler", close: "Fermer" }
});

// 方式二：通过语言文件注册（参照 languages/en.js 格式）
```

### 语言包结构

```javascript
{
    name        : "zh-cn",          // 语言标识
    description : "描述文本",       // 关于对话框描述
    tocTitle    : "目录",           // 目录标题
    placeholder : "写点什么吧~",    // 编辑区占位符
    toolbar     : {                 // 工具栏按钮 tooltip
        bold        : "粗体",
        italic      : "斜体",
        // ... 其他按钮
    },
    buttons     : {                 // 对话框按钮
        enter       : "确定",
        cancel      : "取消",
        close       : "关闭",
        confirm     : "确认"
    },
    dialog      : {                 // 对话框内容
        link        : { title: "添加链接", /*...*/ },
        image       : { title: "添加图片", /*...*/ },
        // ... 其他对话框
    }
}
```

---

## 事件回调

编辑器提供了丰富的事件回调函数，可以在初始化时配置：

```javascript
var editor = editormd("editor", {
    onload : function() {
        console.log("编辑器加载完成", this);
    },
    onchange : function() {
        console.log("内容发生变化");
    },
    onresize : function() {
        console.log("编辑器尺寸改变");
    },
    onscroll : function() {
        console.log("编辑器滚动");
    },
    onpreviewing : function() {
        console.log("将要进入预览模式");
    },
    onpreviewed : function() {
        console.log("已进入预览模式");
    },
    onfullscreen : function() {
        console.log("进入全屏");
    },
    onfullscreenExit : function() {
        console.log("退出全屏");
    },
    onsave : function() {
        console.log("保存时触发");
    },
    onwatch : function() {
        console.log("开启实时预览");
    },
    onunwatch : function() {
        console.log("关闭实时预览");
    },
    onkeydown : function(event) {
        console.log("按键按下", event.keyCode);
    },
    onkeyup : function(event) {
        console.log("按键释放", event.keyCode);
    },
    onfocus : function() {
        console.log("编辑器获得焦点");
    },
    onblur : function() {
        console.log("编辑器失去焦点");
    },
    onpaste : function(event) {
        console.log("粘贴事件");
    },
    ondrop : function(event) {
        console.log("拖放事件");
    },
    oncopy : function(event) {
        console.log("复制事件");
    },
    oncut : function(event) {
        console.log("剪切事件");
    },
    oninsert : function(text) {
        console.log("插入文本", text);
    },
    ontablechange : function(table) {
        console.log("表格变化");
    },
    onimagechange : function(image) {
        console.log("图片变化");
    }
});
```

---

## 自定义语法参考

Editor.md 在标准 Markdown 基础之上扩展了以下自定义语法：

### 拼音标注 (Pinyin)

```
{Editor.md | biān jí qì}
{你好世界 | nǐ hǎo shì jiè}
```

使用 HTML5 `<ruby>` 标签渲染。多组拼音与文字使用空格分隔时，每对一一对应。

### 文本对齐 (Text Align)

```
=左对齐文本=
= =居中对齐= =
==右对齐文本==
```

支持 Unicode 字符实现，分别为 `=...=`、`= =...= =`、`==...==`。

### 标签页 (Tabs)

```
[[tabs]]
[[tab: 标签一]]
这是标签一的 Markdown 内容。
支持任意 Markdown 语法。
[[/tab]]
[[tab: 标签二]]
标签二的内容。
[[/tab]]
[[/tabs]]
```

### 多列排版 (Columns)

```
[[columns:3]]
第一列内容...

第二列内容...

第三列内容...
[[/columns]]
```

`:N` 指定列数（2-6），列间用空行分隔。

### 悬浮提示 (Tooltip)

```
[悬停文字](tooltip:提示内容)
[悬停文字](tooltip:![图片](url) 图片描述)
[悬停文字](tooltip:<iframe ...></iframe>)
```

### 视频插入 (Video)

```
[[video]]
https://example.com/video.mp4|视频标题
https://example.com/video2.webm|另一个视频
[[/video]]

// 内联方式
![alt](video.mp4 800x600)
```

### 文件列表 (File Attachment)

```
[[file]]
https://example.com/doc.pdf|文档名称.pdf
https://example.com/archive.zip|压缩包.zip
[[/file]]
```

### ECharts 图表

````
```echarts
option = {
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
    yAxis: { type: 'value' },
    series: [{ data: [120, 200, 150], type: 'bar' }]
};
```
````

### 图片宽高 (Image Resize)

```
![alt](url 800x600)
![alt](url 50%xauto)
```

---

## 上传接口规范

### 统一上传接口 (upload.php)

**请求方式**：`POST`（`multipart/form-data`）

**文件域名称**：
| 上传类型 | 文件域 name |
|----------|------------|
| 图片 | `editormd-image-file` |
| 附件 | `editormd-file-file` |
| 视频 | `editormd-video-file` |

**可选 POST 参数**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `upload_type` | `string` | 上传类型：`image` / `file` / `video`。不传则根据文件域自动识别 |
| `max_size` | `int` | 最大文件大小（KB）。不传则使用默认值 |

**成功响应示例**：
```json
{
    "success": true,
    "message": "上传成功！",
    "url": "/examples/uploads/20240604120000_12345.jpg",
    "data": {
        "file_name": "20240604120000_12345.jpg",
        "file_size": 204800,
        "file_ext": "jpg"
    }
}
```

**失败响应示例**：
```json
{
    "success": false,
    "message": "您上传的文件太大了，文件大小超出了系统限定值 5120 KB，不能上传。"
}
```

**错误码对照**（`data.error_code`）：
| 错误码 | 说明 |
|--------|------|
| `1` | 超出 `upload_max_filesize` 限制 |
| `2` | 超出 `MAX_FILE_SIZE` 限制 |
| `3` | 文件只有部分被上传 |
| `4` | 没有文件被上传 |
| `6` | 找不到临时目录 |
| `7` | 写文件到硬盘出错 |
| `8` | 某个 PHP 扩展停止了上传 |

### 跨域上传接口 (cross-domain-upload.php)

**请求方式**：`POST`（`multipart/form-data`）

**GET 参数**：
| 参数名 | 必填 | 说明 |
|--------|------|------|
| `callback` | 是 | 回调页面 URL |
| `dialog_id` | 是 | 对话框 DOM ID |

上传成功后通过 302 重定向回到 callback 页面，由 callback 页面通过 `window.parent` 更新父窗口中的图片 URL。

**回调页面参数**：
| 参数 | 说明 |
|------|------|
| `success` | `1` 成功 / `0` 失败 |
| `message` | URL 编码的提示信息 |
| `url` | 上传后的文件 URL（仅成功） |
| `dialog_id` | 原样回传的对话框 ID |

### 编辑器上传配置

```javascript
var editor = editormd("editor", {
    // 图片上传
    imageUpload      : true,
    imageUploadURL   : "./php/upload.php",
    imageFormats     : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
    crossDomainUpload: false,

    // 附件上传
    fileUpload       : true,
    fileUploadURL    : "./php/upload.php",

    // 视频上传
    videoUpload      : true,
    videoUploadURL   : "./php/upload.php",
});
```

**跨域上传**：
```javascript
crossDomainUpload : true,
imageUploadURL    : "./php/cross-domain-upload.php?callback=./php/upload_callback.html&dialog_id=..."
```

---

## 工具栏配置

### 自定义工具栏按钮

```javascript
var editor = editormd("editor", {
    toolbarIcons : function() {
        return [
            "undo", "redo", "|",
            "bold", "del", "italic", "quote", "|",
            "h1", "h2", "h3", "h4", "h5", "h6", "|",
            "list-ul", "list-ol", "hr", "|",
            "link", "reference-link", "image", "code", "|",
            "preformatted-text", "code-block", "table", "html-entities", "|",
            "watch", "preview", "fullscreen", "clear", "search", "|",
            "help", "info"
        ];
    }
});
```

### 自定义图标

```javascript
var editor = editormd("editor", {
    toolbarCustomIcons : {
        "bold" : '<i class="my-bold-icon">B</i>'
    },
    toolbarIconTexts : {
        "h1" : "H1",
        "h2" : "H2"
    }
});
```
