# Editor.md

> **本项目是基于 [pandao/editor.md](https://github.com/pandao/editor.md) 的深度改进和功能增强版本。** 在原有基础上进行了系统性优化、Bug 修复和新功能拓展。

**Editor.md** 是一款开源可嵌入的 Markdown 在线编辑器组件，基于 CodeMirror、jQuery 和 marked 构建。

---

## 目录

1. [主要特性](#主要特性)
2. [快速开始](#快速开始)
3. [安装与使用](#安装与使用)
4. [配置选项全表](#配置选项全表)
5. [实例方法 API](#实例方法-api)
6. [静态方法 API](#静态方法-api)
7. [事件系统](#事件系统)
8. [Markdown 扩展语法](#markdown-扩展语法)
9. [工具栏配置](#工具栏配置)
10. [主题与多语言](#主题与多语言)
11. [插件系统](#插件系统)
12. [上传接口规范](#上传接口规范)
13. [依赖库列表](#依赖库列表)
14. [许可证](#许可证)

---

## 主要特性

### 核心能力
- 标准 Markdown / CommonMark / GFM 语法支持
- 实时预览 + 同步滚动
- 30+ 语言代码语法高亮
- 搜索替换、只读模式、全屏编辑、自动高度
- 支持 AMD/CMD 模块加载（Require.js / Sea.js）
- 兼容 IE8+、iPad、Zepto.js

### v1.7.0 新增
| 特性 | 说明 |
|------|------|
| **ECharts 图表** | ` ```echarts ` 代码块，支持柱状图/折线图/饼图/雷达图/漏斗图 |
| **Tabs 标签页** | `[[tabs]]...[[/tabs]]` 语法，内部支持代码块/表格/图表 |
| **多列排版** | `[[columns:N]]...[[/columns]]` 报纸式多栏 |
| **悬浮提示** | `[文本](tooltip:内容)` 和图片 `"tooltip:..."` 语法 |
| **图片尺寸语法** | `![alt](url)<W,H>` 拖拽后自动同步源码 |
| **草稿自动保存** | localStorage 自动保存 + 恢复对话框 |
| **文件上传** | `fileFormats` 白名单 + 工具栏上传 |
| **Unicode 行内对齐** | `⁑⁑居中⁑⁑` `⁑⁖左对齐⁖⁑` `⁑⠕右对齐⠕⁑` `⁑⁛两端对齐⁛⁑` |
| **其他增强** | 图片粘贴上传、Shift等比缩放、公式双击定位、代码复制按钮、insert下拉工具栏 |

### v1.6.0 新增
- 拼音标注 `{文本 | pinyin}`、表格行列编辑、工具栏下拉分组
- 增强 XSS 安全防护、完善事件回调系统

### Markdown 扩展语法
ToC 目录 `[TOC]` / `[TOCM]`、Emoji `:smiley:`、任务列表 `- [x]`、@链接 `@username`、KaTeX 数学公式 `$$...$$`、flowchart.js 流程图、sequence-diagram.js 时序图、分页符 `[========]`、HTML 标签过滤解析

---

## 快速开始

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Editor.md</title>
    <link rel="stylesheet" href="css/editormd.min.css" />
</head>
<body>
<div id="editor">
    <textarea style="display:none;">### 你好！
- 支持**粗体**和*斜体*
- `代码高亮`
- $E=mc^2$ 数学公式</textarea>
</div>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
<script src="editormd.min.js"></script>
<script>
$(function(){
    editormd("editor", {
        width: "100%", height: "600px",
        path: "lib/",
        tex: true, emoji: true, taskList: true,
        echarts: true, tabs: true, columns: true, tooltip: true
    });
});
</script>
</body>
</html>
```

---

## 安装与使用

### 安装

**直接下载**：将 `css/` `editormd.min.js` `lib/` `fonts/` `images/` `languages/` `plugins/` 部署到 Web 服务器。

**npm**：`npm install editor.md`

**AMD (Require.js)**：
```html
<script src="require.min.js"></script>
<script>
require.config({ paths: { editormd: "editormd.amd.min" } });
require(["editormd"], function(editormd) {
    editormd("editor", { path: "lib/" });
});
</script>
```

### 创建编辑器

```javascript
var editor = editormd("editor", {
    width  : "100%", height : "600px",
    path   : "lib/",          // 依赖库自动加载路径
    watch  : true,            // 实时预览
    tex    : true,            // 数学公式
    echarts: true,            // ECharts 图表
    tabs   : true,            // Tabs 标签页
    columns: true,            // 多列排版
    tooltip: true,            // 悬浮提示
});
```

### Markdown→HTML（无编辑器模式）

```html
<link rel="stylesheet" href="css/editormd.preview.min.css" />
<div id="preview"><textarea style="display:none;">### Hello</textarea></div>
<script src="jquery.min.js"></script>
<script src="editormd.min.js"></script>
<script src="lib/marked.min.js"></script>
<script src="lib/prettify.min.js"></script>
<script>
$(function(){ editormd.markdownToHTML("preview", {echarts:true,tabs:true}); });
</script>
```

### 常用操作

```javascript
editor.getMarkdown();               // 获取 Markdown 源码
editor.setValue("新内容");           // 设置内容
editor.insertValue("Hello");        // 光标处插入
editor.insertValue("追加", true);   // 追加到末尾
editor.clear();                     // 清空
editor.getHTML();                   // 获取完整独立 HTML（含样式和脚本）
editor.getPreviewedHTML();          // 获取预览区 HTML 片段
editor.getCursorPosition();         // {line, ch}
editor.setCursor({line:5,ch:10});  // 设置光标
editor.getWordCount();              // 字数统计
editor.exportFile("文档", "markdown"); // 导出文件
```

---

## 配置选项全表

### 核心配置
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | String/Number | `"100%"` | 宽度 |
| `height` | String/Number | `"100%"` | 高度 |
| `path` | String | `"./lib/"` | 依赖模块路径 |
| `mode` | String | `"gfm"` | `"gfm"` / `"markdown"` |
| `markdown` | String | `""` | 初始内容 |
| `readOnly` | Boolean | `false` | 只读模式 |
| `autoFocus` | Boolean | `true` | 自动聚焦 |
| `autoHeight` | Boolean | `false` | 自适应高度 |
| `saveHTMLToTextarea` | Boolean | `false` | 表单提交保存 HTML |

### 外观
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `theme` | `""` | 编辑器整体主题 |
| `editorTheme` | `"default"` | CodeMirror 编辑区主题 |
| `previewTheme` | `""` | 预览区主题 |
| `fontSize` | `"13px"` | 字体大小 |
| `placeholder` | `"Enjoy Markdown!..."` | 占位符 |

### 预览
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `watch` | `true` | 实时预览 |
| `delay` | `300` | 解析延迟 (ms) |
| `syncScrolling` | `true` | 同步滚动 |
| `previewCodeHighlight` | `true` | 预览区代码高亮 |

### CodeMirror 编辑
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `tabSize` | `4` | Tab 宽度 |
| `lineNumbers` | `true` | 行号 |
| `lineWrapping` | `true` | 自动换行 |
| `autoCloseBrackets` | `true` | 自动闭合括号 |
| `styleActiveLine` | `true` | 当前行高亮 |
| `matchBrackets` | `true` | 匹配括号 |

### 工具栏/辅助
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `toolbar` | `true` | 显示工具栏 |
| `toolbarAutoFixed` | `true` | 滚动固定 |
| `toolbarIcons` | `"full"` | `"full"/"simple"/"mini"` |
| `toolbarDropdown` | `true` | 下拉分组 |
| `codeFold` | `false` | 代码折叠 |
| `gotoLine` | `true` | 跳转到行 |
| `searchReplace` | `true` | 搜索替换 |
| `autoLoadModules` | `true` | 自动加载依赖 |

### 弹窗
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `dialogLockScreen` | `true` | 弹窗锁屏 |
| `dialogShowMask` | `true` | 显示遮罩 |
| `dialogDraggable` | `true` | 可拖拽 |
| `dialogMaskOpacity` | `0.1` | 遮罩透明度 |

### 上传
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `imageUpload` | `false` | 图片上传 |
| `imageFormats` | `["jpg","jpeg","gif","png","bmp","webp"]` | 允许格式 |
| `imageUploadURL` | `""` | 上传 URL |
| `crossDomainUpload` | `false` | 跨域上传 |
| `imageResize` | `true` | 图片尺寸编辑 |
| `fileUpload` | `false` | 文件上传 |
| `fileFormats` | `["doc","docx","pdf","txt","zip","rar","xls","xlsx","ppt","pptx","mp4","mp3"]` | 文件格式 |
| `fileUploadURL` | `""` | 文件上传 URL |

### 扩展功能
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `tex` | `false` | KaTeX 公式 |
| `flowChart` | `false` | 流程图 |
| `sequenceDiagram` | `false` | 时序图 |
| `emoji` | `false` | Emoji |
| `taskList` | `false` | 任务列表 |
| `toc` | `true` | 目录 |
| `tocm` | `false` | ToC 下拉菜单 |
| `tocContainer` | `""` | 自定义 ToC 容器 |
| `tocStartLevel` | `1` | ToC 起始级别 |
| `htmlDecode` | `false` | HTML 过滤 |
| `pageBreak` | `true` | 分页符 |
| `atLink` | `true` | @链接 |
| `emailLink` | `true` | 邮件链接 |
| `pinyin` | `false` | 拼音标注 |
| `textAlign` | `true` | 行内对齐 |
| `tableEdit` | `true` | 表格编辑 |
| `echarts` | `false` | ECharts 图表 |
| `tabs` | `true` | Tabs 标签页 |
| `columns` | `true` | 多列排版 |
| `tooltip` | `true` | 悬浮提示 |

### 草稿
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `draftAutoSave` | `false` | 自动保存草稿 |
| `draftInterval` | `30` | 保存间隔 (秒) |
| `draftMaxDays` | `30` | 保留天数 |

---

## 实例方法 API

### 内容操作
| 方法 | 说明 |
|------|------|
| `getMarkdown()` | 获取 Markdown 源码 |
| `getValue()` | 同 getMarkdown |
| `setValue(v)` | 设置内容 |
| `appendMarkdown(md)` | 追加内容 |
| `insertValue(v, [append])` | 插入/追加 |
| `clear()` | 清空 |
| `getHTML([opts])` | 完整独立 HTML（含样式+脚本） |
| `getPreviewedHTML([opts])` | 预览区 HTML 片段 |
| `getTextareaSavedHTML()` | getHTML() 别名 |

### 选区与光标
| 方法 | 说明 |
|------|------|
| `getSelection()` | 选中文本 |
| `setSelection(from, to)` | 设置选区 `{line,ch}` |
| `replaceSelection(v)` | 替换选中 |
| `getCursorPosition()` | 光标位置 `{line,ch}` |
| `setCursor(pos)` | 设置光标 |
| `focus()` | 获得焦点 |
| `getWordCount()` | 字数统计 |

### 编辑器控制
| 方法 | 说明 |
|------|------|
| `resize([w,h])` | 调整尺寸 |
| `width([w])` / `height([h])` | 获取/设置宽高 |
| `recreate()` | 重建编辑器 |
| `save()` | 手动保存/渲染预览 |
| `gotoLine(n)` | 跳转到行 |

### 主题
| 方法 | 说明 |
|------|------|
| `setTheme(t)` | 整体主题 |
| `setEditorTheme(t)` | 编辑区主题 |
| `setPreviewTheme(t)` | 预览区主题 |

### 工具栏/弹窗
| 方法 | 说明 |
|------|------|
| `showToolbar()` / `hideToolbar()` | 显示/隐藏 |
| `createDialog(opts)` | 创建对话框 |
| `showInfoDialog()` / `hideInfoDialog()` | 信息弹窗 |
| `lockScreen(lock)` | 锁屏 |

### 事件/配置/快捷键
| 方法 | 说明 |
|------|------|
| `on(event, cb)` / `off(event)` | 事件绑定/解绑 |
| `set(k,v)` / `config(k,v)` | 设置配置 |
| `addKeyMap(m)` / `removeKeyMap(m)` | 快捷键管理 |
| `exportFile(name, fmt)` | 导出文件 |
| `saveDraft()` / `clearDraft()` | 草稿管理 |

### 渲染扩展
| 方法 | 说明 |
|------|------|
| `katexRender()` | 渲染 KaTeX |
| `flowChartAndSequenceDiagramRender()` | 渲染图表 |
| `previewCodeHighlight()` | 刷新代码高亮 |
| `initCodeCopy($el)` | 代码复制 |
| `initECharts()` / `initTabs()` / `initColumns()` / `initTooltips()` | 初始化组件 |

---

## 静态方法 API

### `editormd.markdownToHTML(id, options)`
将 textarea 中的 Markdown 渲染为 HTML 预览：
```javascript
editormd.markdownToHTML("preview-container", {
    markdown: "# Hello", htmlDecode: "style,script,iframe",
    toc: true, emoji: true, tex: true,
    echarts: true, tabs: true, columns: true, tooltip: true
});
```

### 其他静态属性
| 属性/方法 | 说明 |
|-----------|------|
| `editormd.$` | jQuery / Zepto 对象 |
| `editormd.marked()` | marked 解析器实例 |
| `editormd.isMarkdown(text)` | 判断是否为 Markdown 文本 |
| `editormd.defaults` | 全局默认配置对象 |
| `editormd.toolbarModes` | 工具栏预设模式 |
| `editormd.codeMirrorThemes` | 可用 CodeMirror 主题列表 |

---

## 事件系统

```javascript
// 配置方式
editormd("editor", {
    onload: function(){}, onchange: function(){},
    onfullscreen: function(){}, onfullscreenExit: function(){},
});

// 动态绑定
editor.on("onchange", function(){});
editor.off("onchange");
```

### 完整事件
| 事件 | 触发时机 | 事件 | 触发时机 |
|------|----------|------|----------|
| `onload` | 加载完成 | `onresize` | 尺寸变化 |
| `onchange` | 内容变更 | `onwatch/onunwatch` | 开始/停止预览 |
| `onpreviewing/onpreviewed` | 预览前/后 | `onfullscreen/onfullscreenExit` | 全屏/退出 |
| `onscroll/onpreviewscroll` | 滚动 | `onbeforesave/onaftersave` | 保存前/后 |
| `oninsert` | 插入文本 | `ontablechange` | 表格变化 |
| `onimagechange` | 图片尺寸变化 | `onkeydown/onkeyup` | 键盘事件 |
| `onmouseup/onmousedown` | 鼠标事件 | `onpaste/ondrop` | 粘贴/拖放 |
| `oncopy/oncut` | 复制/剪切 | `onfocus/onblur` | 焦点事件 |
| `oncursoractivity` | 光标移动 | | |

---

## Markdown 扩展语法

### ECharts 图表 (`echarts: true`)
````markdown
```echarts
{"type":"bar","title":{"text":"月度销售"},"xAxis":{"data":["1月","2月","3月"]},"yAxis":{},"series":[{"type":"bar","data":[120,200,150]}]}
```
````
支持 bar / line / pie / radar / funnel

### Tabs 标签页 (`tabs: true`)
```markdown
[[tabs]]
[[tab:产品介绍]] Editor.md 是一款开源 Markdown 编辑器... [[/tab]]
[[tab:更新日志]] ### v1.7.0 - 新增 ECharts 图表支持 [[/tab]]
[[/tabs]]
```

### 多列排版 (`columns: true`)
```markdown
[[columns:3]]
### 第一栏 ... ### 第二栏 ... ### 第三栏 ...
[[/columns]]
```

### 悬浮提示 (`tooltip: true`)
```markdown
[百度](tooltip:百度是全球最大的中文搜索引擎)
![Logo](image.png "tooltip:这是 Logo 的说明")
```

### 数学公式 (`tex: true`)
```markdown
行内: $E = mc^2$
块级:
$$
\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$
```

### Emoji (`emoji: true`)
```markdown
:smiley: :heart: :thumbsup: :fa-github: :editormd-logo:
```

### 任务列表 (`taskList: true`)
```markdown
- [x] 已完成
- [ ] 待完成
```

### 拼音标注 (`pinyin: true`)
```markdown
{你好 | nǐ hǎo} {世界 | shì jiè}
```

### 行内对齐 (`textAlign: true`)
```markdown
⁑⁑居中⁑⁑  ⁑⁖左对齐⁖⁑  ⁑⠕右对齐⠕⁑  ⁑⁛两端对齐⁛⁑
```

### 流程图 (`flowChart: true`)
````markdown
```flow
st=>start: 开始|past
e=>end: 结束
op=>operation: 操作
cond=>condition: 判断
st->op->cond
cond(yes)->e
cond(no)->op
```
````

### 时序图 (`sequenceDiagram: true`)
````markdown
```seq
客户端->>服务器: 请求
服务器-->>客户端: 响应
```
````

### ToC 目录
```markdown
[TOC]      # 平铺式
[TOCM]     # 下拉菜单式
```

### 其他
```markdown
@username          # @链接
[========]         # 分页符
```

---

## 工具栏配置

```javascript
editormd("editor", {
    toolbarIcons: "full",  // "full" | "simple" | "mini"
    
    // 完全自定义
    toolbarIcons: [
        "undo","redo","|","bold","del","italic","|",
        { "标题": ["h1","h2","h3","h4","h5","h6"] },  // 下拉分组
        "|","watch","preview","fullscreen","search","|","help","info"
    ],
    
    // 自定义按钮
    toolbarCustomIcons: {
        lowercase: '<a href="javascript:;"><i class="fa">a</i></a>',
        ucwords: '<a href="javascript:;"><i class="fa">Aa</i></a>'
    },
    toolbarHandlers: {
        ucwords: function(){ return editormd.toolbarHandlers.ucwords; }
    }
});
```

---

## 主题与多语言

### 主题切换
```javascript
editor.setTheme("dark");
editor.setEditorTheme("monokai");
editor.setPreviewTheme("default");
```
编辑区支持所有 CodeMirror 主题色系。预览区内置 `default` / `dark` 两种。

### 多语言
内置 `zh-cn`（简体中文）、`zh-tw`（繁体中文）、`en`（英文）。自定义语言包：

```javascript
(function() {
    editormd.lang["en"] = {
        name: "en", description: "Open source online Markdown editor.",
        tocTitle: "Table of Contents",
        toolbar: { bold: "Bold (Ctrl+B)", /* ... */ },
        button: { ok: "OK", cancel: "Cancel" },
        dialog: { /* 对话框文本 */ }
    };
})();
```

---

## 插件系统

### 内置插件
| 插件 | 路径 | 功能 |
|------|------|------|
| link-dialog | `plugins/link-dialog/` | 插入/编辑链接 |
| image-dialog | `plugins/image-dialog/` | 插入/上传图片 |
| file-dialog | `plugins/file-dialog/` | 文件上传 |
| video-dialog | `plugins/video-dialog/` | 视频上传 |
| code-block-dialog | `plugins/code-block-dialog/` | 代码块插入 |
| table-dialog | `plugins/table-dialog/` | 表格插入 |
| goto-line-dialog | `plugins/goto-line-dialog/` | 跳转到行 |
| help-dialog | `plugins/help-dialog/` | Markdown 帮助 |
| html-entities-dialog | `plugins/html-entities-dialog/` | HTML 实体插入 |
| preformatted-text-dialog | `plugins/preformatted-text-dialog/` | 预格式化文本 |
| reference-link-dialog | `plugins/reference-link-dialog/` | 引用式链接 |

### 自定义插件开发

插件模板结构：
```javascript
(function(){
    var pluginName = "my-plugin";
    editormd.plugin(function(editormd) {
        // 插件初始化代码
    });
})();
```

---

## 上传接口规范

### 图片上传 (imageUpload)

**请求**：`POST` 到 `imageUploadURL`，字段名 `editormd-image-file`

**成功响应**：
```json
{ "success": 1, "message": "上传成功", "url": "./uploads/image.png" }
```

**失败响应**：
```json
{ "success": 0, "message": "上传失败" }
```

### 文件上传 (fileUpload)

**请求**：`POST` 到 `fileUploadURL`，字段名 `editormd-file-file`

**成功响应**：
```json
{ "success": 1, "message": "上传成功", "url": "./uploads/file.docx", "name": "file.docx" }
```

---

## jQuery 3.x 兼容性说明

本项目已完全升级至 **jQuery 3.7.1**，所有废弃方法已更新，确保与现代浏览器和最新 jQuery 版本完全兼容。

### 主要变更

#### 1. 选择器语法更新
jQuery 3.x 要求属性选择器中的特殊字符必须用引号包裹：

```javascript
// ❌ 旧版本（jQuery 1.x，会报错）
$("a[href*=#]")

// ✅ 新版本（jQuery 3.x，正确用法）
$("a[href*='#']")
```

#### 2. 事件绑定方法更新
所有已废弃的事件绑定方法已替换为现代方法：

```javascript
// ❌ 已废弃的方法
.bind()    →  ✅ .on()
.unbind()  →  ✅ .off()
.delegate() →  ✅ .on() (事件委托)
.live()    →  ✅ .on() (已移除)
.die()     →  ✅ .off() (已移除)

// 示例
// 旧写法
$(element).bind("click", handler);
$(element).unbind("click");

// 新写法
$(element).on("click", handler);
$(element).off("click");
```

#### 3. 其他方法更新

```javascript
.size()     →  .length      // 获取元素数量
.andSelf()  →  .addBack()   // 添加回前一个选择集
```

### 兼容性测试

我们提供了专门的测试页面来验证所有功能：

- 打开 `examples/jquery-test.html` 进行全面测试
- 所有 63 个示例文件已更新并通过测试
- 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）

### 性能提升

升级至 jQuery 3.x 后的性能改进：

- ✅ 更小的文件体积（约 30KB，gzip 后约 10KB）
- ✅ 更快的选择器性能
- ✅ 更好的内存管理
- ✅ 支持现代 JavaScript 特性（Promise、async/await）
- ✅ 移除过时的 IE 兼容代码

---

## 依赖库列表

| 库 | 用途 |
|----|------|
| [CodeMirror](http://codemirror.net/) | 代码编辑器核心 |
| [marked](https://github.com/markedjs/marked) | Markdown 解析器 |
| [jQuery](http://jquery.com/) | DOM 操作 |
| [KaTeX](https://khan.github.io/KaTeX/) | 数学公式渲染 |
| [prettify.js](https://github.com/google/code-prettify) | 代码语法高亮 |
| [Raphael.js](http://raphaeljs.com/) | SVG 矢量图形（流程图/时序图依赖） |
| [flowchart.js](http://flowchart.js.org/) | 流程图 |
| [sequence-diagram.js](https://bramp.github.io/js-sequence-diagrams/) | 时序图 |
| [underscore.js](http://underscorejs.org/) | 工具函数库 |
| [FontAwesome](http://fontawesome.io/) | 图标字体 |
| [ECharts](https://echarts.apache.org/) | 交互式图表 |

---

