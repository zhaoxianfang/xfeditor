# xfEditor 编辑器

> **本编辑器是基于 [pandao/editor.md](https://github.com/zhaoxianfang/editor) 的深度改进和功能增强版本。** 在原有基础上进行了系统性优化、Bug 修复和新功能拓展。

**xfEditor** 是一款开源可嵌入的 Markdown 在线编辑器组件，基于 CodeMirror、jQuery 和 marked 构建。

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

### v1.12.1 改进
| 特性 | 说明 |
|------|------|
| **Tooltip 尺寸限制修复** | 修复悬浮图片/iframe 的宽度高度限制：用户指定 `<宽度,高度>` 时，直接设置图片的 `width`/`height` 属性并配合 `object-fit:contain` 保持比例；同时设置 popup 容器的 `max-width`/`max-height` 覆盖 CSS 限制；CSS 默认 `max-width` 从 360px 调整至 90vw |
| **getHTML/getPreviewedHTML 加强** | `_getCoreStyles()` 内联 Tooltip CSS 同步更新（90vw max-width）；HTML 输出内联所有样式确保完全不依赖外部 CSS/JS |
| **接口完善** | 完善所有核心接口的事件处理逻辑；API 文档和类型提示更新 |

### v1.12.0 改进
| 特性 | 说明 |
|------|------|
| **Tooltip 样式优化** | 所有悬浮提示框背景改为透明，padding 和 margin 设为 0，提供更大的自定义空间 |
| **getHTML() 接口增强** | 新增 SEO meta 标签（description/author/keywords）、外部样式表/脚本链接、自定义 meta 标签、语言设置、字符编码、压缩输出等选项 |
| **getPreviewedHTML() 接口增强** | 新增目录生成、行号标记、外部样式表/脚本链接、压缩输出等选项；支持更灵活的输出控制 |
| **图片缩放出现次数追踪** | 修复拖拽第 N 次出现的图片时回写修改第一次出现位置的 Bug；新增 `data-image-occurrence` 属性精准定位 |
| **复杂 HTML 悬浮提示** | 新增 `tooltip:html:"元素选择器"` 语法，支持通过CSS选择器引用页面中的DOM元素作为悬浮内容 |
| **公式弹窗自动加载** | `formula()` 自动检测 KaTeX 加载状态，未加载时先 `loadKaTeX()` 再打开面板，无需手动配置 `tex: true` |
| **组合上下标优化** | 缩小 `.editormd-supsub` 字号至 50%、调整 line-height 为 1.05、优化上标位置(bottom:0.1em)，视觉更紧凑协调 |
| **独立 HTML 输出增强** | `getHTML()` 和 `getPreviewedHTML()` 现可生成完全自包含的 HTML（内联所有 CSS：组合上下标、脚注、字帖、KaTeX 等），无需依赖外部 CSS/JS 文件 |
| **渲染管线优化** | `getPreviewedHTML()` 在需要内联样式/脚本时自动从 Markdown 完整重渲染，确保输出干净独立；`_getCoreStyles()` 补充脚注、字帖网格等缺失样式 |
| **滚动位置修复** | `modifyTableInMarkdown()` 和 `modifyImageSizeInMarkdown()` 修复 `cm.setValue()` 后定时器冲突导致滚动位置二次丢失的 Bug |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |
| **示例与文档** | 全部示例文件更新至 v1.12.0；新增复杂 HTML 提示演示；代码块语法修复；缺失依赖库补全；文档全面更新 |

### v1.11.0 改进
| 特性 | 说明 |
|------|------|
| **组合上下标语法** | 新增 `X<<下标>^<上标>>` 语法，同时显示下标和上标（如 X₂³），比分别使用 `^^` 和 `^` 更精确简洁 |
| **渲染管线一致性** | 修复 `getPreviewedHTML()` 缺失 `fixSmartypantsHTML`/`postProcessTaskLists`/`filterHTMLTags` 三个后处理步骤；修复 `editormd.markdownToHTML()` 缺失 `protectTeXSyntax`/`restoreTeXSyntax` TeX 保护步骤 |
| **代码审计** | 全面审计所有正则、嵌套语法、事件绑定，确认无新增风险点 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |

### v1.10.0 改进
| 特性 | 说明 |
|------|------|
| **工具栏修复** | 修复图片/视频/文件工具栏按钮失效问题（dialog.show() 提前 return bug）；修复 executePlugin 加载失败时未捕获异常导致静默失败|
| **弹窗全面美化** | 所有编辑模式弹窗现代化重设计：紫色渐变标题栏、圆形关闭按钮、多层柔和阴影、8px 圆角；表单输入 focus 紫色发光环；Primary 渐变提交按钮 + hover 上浮动画 |
| **XSS 安全加固** | 新增 `editormd.escapeHtml()` / `editormd.escapeAttr()` 工具函数；修复 Tooltip data-tooltip 属性注入、Link renderer href/title 注入、notify() HTML 注入、applyColor() 选区注入、图片/视频/文件块 URL 注入共 6 项安全漏洞 |
| **Link 安全协议阻断** | 活跃的 `javascript:` / `data:` / `vbscript:` 协议检测与阻断 |
| **ECharts 内存修复** | resize 事件命名空间改为基于 chart ID，支持统一 `.off("resize.editormd-echarts")` 彻底清理 |
| **新语法支持** | 上标 `^x^`、下标 `^^x^^`、字体大小 `!32!`、脚注 `[^name]` 四种新语法 |
| **帮助系统重写** | 帮助对话框内容全面更新为中文版，含完整快捷键表、配置项、API、事件列表 |
| **关于对话框增强** | 显示 v1.10.0 新特性概览、技术栈组件列表 |
| **上传功能优化** | 图片/视频/文件上传弹窗增强；图片粘贴上传支持；统一上传接口优化；PHP 上传类全面增强 |
| **示例页面完善** | 新增文件上传、视频上传、全部事件综合演示 3 个示例；@links 页面中文详解；index.html 导航扩展 |
| **文档更新** | README、USAGE_GUIDE 全面更新至 v1.10.0 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |

### v1.9.0 改进
| 特性 | 说明 |
|------|------|
| **草稿弹窗美化** | 全新现代化 UI：渐变头部、卡片式列表、悬停动画；智能时间标签（刚刚/N分钟前/N小时前）；平滑入场/退场动画 |
| **悬浮提示修复** | 修复文本型 Tooltip `pointer-events:none` 导致 popup 无法拦截鼠标事件的问题，popup 与 trigger 之间鼠标平滑过渡 |
| **任务列表渲染修复** | `dangerousTags` 中移除 `input`，修复 Task List checkbox 被 XSS 过滤误删 |
| **独立预览 Tooltip** | editormd.preview.css 添加完整 Tooltip 样式（含箭头、图片/iframe 型） |
| **KaTeX 安全防护** | else 分支添加 `typeof katex !== "undefined"` 检查，防止未加载时崩溃 |
| **ECharts 内存优化** | resize 事件使用命名空间+debounce 防重复绑定，避免累积大量 handler |
| **Columns 独立导出** | 独立 HTML 导出新增 `initColumns` 函数，多栏分隔线正确初始化 |
| **XSS 安全增强** | 白名单新增 `video`、`source`、`input` 标签及属性，防止合法元素被过滤 |
| **加载失败告警** | `loadScript` onerror 记录失败脚本到 `loadFiles.failed`，控制台输出 warn |
| **initTabs 事件修复** | 实例方法 `initTabs` 添加 `.off()` 防止重复绑定 click handler |
| **全屏修复** | CSS `width:100%!important; max-width:none!important` 确保全屏宽度填充，命名空间事件管理 |
| **代码块重构** | 移除 JetBrains 标题栏结构，简化为右上角浮动复制按钮；pre `::before` 语言标签已移除 |
| **任务列表CSS修复** | 预览容器下 `.task-list-item` CSS 选择器正确匹配，checkbox 正常渲染 |
| **工具栏修复** | 下拉按钮图标 `<i>` 与箭头 `<span>` 改为 `inline-block` 同行对齐 |
| **linenums 优化** | 移除过大 padding（`padding: 0 0 0 3.5em; margin: 0`），消除白色边距 |
| **LaTeX 保护** | 改进 protectTeXSyntax 防货币符号误匹配，仅保护含 TeX 命令的公式 |
| **嵌套限制** | hasMatchingPair 添加递归深度上限（20层），防止极端嵌套导致栈溢出 |
| **事件清理** | 预览/全屏 ESC 统一使用命名空间事件，destroy 时完整清理 |

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
| **公式插入面板** | 工具栏"∑"按钮，11 分类浏览/搜索过滤/一键插入 $...$ 或 $$...$$ 公式/自动关闭弹窗 |
| **字帖** | 田字格/米字格/拼音格三种字帖，SVG 辅助线，工具栏一键插入 |
| **纸张页面** | `[[page:A4 header="标题" footer="第{page}页"]` 标准纸张尺寸预览，页头页脚，超页高自动分页 |
| **事件系统增强** | 新增 onEditorLoad / onPageLoad / onAllAsyncLoad / onPageAllLoad 四个事件回调 |
| **其他增强** | 图片粘贴上传、Shift等比缩放、公式双击定位、代码复制按钮、insert下拉工具栏、下拉菜单文字描述、美化代码块 |

### v1.6.0 新增
- 拼音标注 `{文本 | pinyin}`、表格行列编辑、工具栏下拉分组
- 增强 XSS 安全防护、完善事件回调系统

### Markdown 扩展语法
ToC 目录 `[TOC]` / `[TOCM]`、任务列表 `- [x]`、@链接 `@username`、KaTeX 数学公式 `$$...$$`、flowchart.js 流程图、sequence-diagram.js 时序图、分页符 `[========]`、HTML 标签过滤解析、Tabs 标签页、多列排版、悬浮提示、字帖、纸张页面 `[[page:A4]]`

---

## 快速开始

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>xfEditor</title>
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
        tex: true, taskList: true,
        echarts: true, tabs: true, columns: true, tooltip: true, copybook: true,
        pageBlock: true, superscript: true, subscript: true, fontSize: true, footnote: true
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
    pageBlock: true,          // 纸张页面
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
| `copybook` | `true` | 字帖（田字格、米字格、拼音格） |
| `pageBlock` | `true` | 纸张页面（A4/Letter等） |
| `superscript` | `true` | 上标 ^内容^ |
| `subscript` | `true` | 下标 ^^内容^^ |
| `fontSize` | `true` | 字体大小 !字号 文字! |
| `footnote` | `true` | 脚注 [^name] |
| `previewOnly` | `false` | 纯预览模式（禁用编辑功能） |

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
    toc: true, tex: true,
    echarts: true, tabs: true, columns: true, tooltip: true, copybook: true
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
| `onbeforesave/onaftersave` | 保存前/后 |
| `oninsert` | 插入文本 | `ontablechange` | 表格变化 |
| `onimagechange` | 图片尺寸变化 | `onkeydown/onkeyup` | 键盘事件 |
| `onmouseup/onmousedown` | 鼠标事件 | `onpaste/ondrop` | 粘贴/拖放 |
| `oncopy/oncut` | 复制/剪切 | `onfocus/onblur` | 焦点事件 |
| `oncursoractivity` | 光标移动 | `onEditorLoad` | 编辑器加载完成 |
| `onPageLoad` | 网页 DOM 加载完成 | `onAllAsyncLoad` | 所有异步模块加载完成 |
| `onPageAllLoad` | 网页所有资源加载完成 | | |

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
[[tab:产品介绍]] xfEditor 是一款开源 Markdown 编辑器... [[/tab]]
[[tab:更新日志]] ### v1.11.0 - 组合上下标语法、渲染管线一致性修复 ### v1.10.0 - 工具栏修复、弹窗美化、XSS 安全加固 [[/tab]]
[[/tabs]]
```

### 多列排版 (`columns: true`)
```markdown
[[columns:3]]
### 第一栏 ... ### 第二栏 ... ### 第三栏 ...
[[/columns]]
```

### 纸张页面 (`pageBlock: true`) <sup>NEW</sup>
以标准纸张尺寸展示内容，超出页高自动分页。适用于打印预览、报告文档等场景。

**支持纸张规格：**
- A系列：A0 ~ A8
- AN：等同于 A4
- LETTER：美国信纸
- LEGAL：美国法律用纸

**基础语法：**
```markdown
[[page:A4]]
# 我的工作报告

## 项目概述
本季度完成了以下内容...

## 详细说明
这是详细的项目说明文本...

[========]  <!-- 手动分页符 -->
[[/page]]
```

**带页头页脚：**
```markdown
[[page:A4 header="工作报告" footer="第 {page} 页 / 共 {total} 页"]]
# 我的工作报告

内容会自动分页，每页都会显示页头和带页码的页脚...
[[/page]]
```

**支持属性：**
- `header="标题"` — 设置页头文本
- `footer="页脚"` — 设置页脚文本，支持占位符：
  - `{page}` — 当前页码
  - `{total}` — 总页数

**纸张类型：** `A0` ~ `A8`、`LETTER`、`LEGAL`

内容超出页面高度时自动分割为多页，页间距仅 4px。支持在页面内嵌套 [[tabs]]、[[columns]] 等其他语法。

```markdown
[[page:A4 header="技术文档" footer="xfEditor"]]
[[tabs]]
[[tab:概况]]
这是 A4 页面中的标签页内容...
[[/tab]]
[[tab:详情]]
包含表格和图片的详细说明...
[[/tab]]
[[/tabs]]
[[/page]]
```

### 悬浮提示 (`tooltip: true`)

支持四种类型的悬浮提示：文本、图片、嵌入页面和 HTML 元素。

**统一语法格式**：`[触发文本](tooltip:类型:内容)<宽度,高度>`

#### 文本类型
```markdown
[百度](tooltip:text:百度是全球最大的中文搜索引擎)
[提示文本](tooltip:text:这是详细的提示内容)<300,200>
```

#### 图片类型
```markdown
![Logo](tooltip:image:https://example.com/logo.png)
![预览图](tooltip:image:https://example.com/preview.jpg)<400,300>
```

#### 嵌入页面类型
```markdown
[查看文档](tooltip:iframe:https://example.com/doc)
[嵌入页面](tooltip:iframe:https://example.com/page)<500,400>
```

#### HTML 元素类型 ⭐v1.12 增强
```markdown
[查看隐藏内容](tooltip:html:#hidden-content)
[查看样式卡片](tooltip:html:.tooltip-card)
[查看属性元素](tooltip:html:[data-tooltip-content])
[自定义尺寸](tooltip:html:#my-element)<400,300>
```

**HTML 选择器支持**：
- `#element-id` - ID 选择器
- `.class-name` - 类选择器
- `[attribute]` - 属性选择器
- `[attribute=value]` - 属性值选择器

**特性**：
1. **可选宽高参数**：`<宽度,高度>` 格式，单位为 px，超出后自动滚动
2. **自动移除隐藏属性**：HTML 类型自动移除 `display:none`、`visibility:hidden`、`opacity:0`
3. **动态加载 DOM**：实时查找并克隆页面元素
4. **支持复杂 HTML**：可引用包含复杂结构的页面元素
5. **错误处理**：未找到元素时显示友好提示

### 数学公式 (`tex: true`)
```markdown
行内: $E = mc^2$
块级:
$$
\frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}
$$
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

**键盘快捷键：**
- `Ctrl+Alt+L` - 左对齐
- `Ctrl+Alt+C` - 居中对齐
- `Ctrl+Alt+R` - 右对齐
- `Ctrl+Alt+J` - 两端对齐

### 字帖 (`copybook: true`)

田字格、米字格、拼音格字帖，用于展示汉字书写范例。

**田字格**：
```markdown
[[copybookTian]]
(春眠不觉晓)(处处闻啼鸟)
(夜来风雨声)(花落知多少)
[[/copybookTian]]
```

**米字格**：
```markdown
[[copybookMi]]
(春眠不觉晓)(处处闻啼鸟)
(夜来风雨声)(花落知多少)
[[/copybookMi]]
```

**拼音格**（上方四线三格 + 下方米字格，用 `|` 分隔汉字与拼音）：
```markdown
[[copybookPinyin]]
(春眠不觉晓|chūn mián bù jué xiǎo)(处处闻啼鸟|chù chù wén tí niǎo)
(夜来风雨声|yè lái fēng yǔ shēng)(花落知多少|huā luò zhī duō shǎo)
[[/copybookPinyin]]
```

### 上标与下标

使用 `^` 符号创建上标和下标：

**上标** `^内容^`：
```markdown
x^2^ + y^3^ = z^n^
E = mc^2^
100m^2^ 建筑面积
```

**下标** `^^内容^^`：
```markdown
H^^2^^O（水分子）
CO^^2^^（二氧化碳）
log^^10^^(100) = 2
```

**组合使用**：
```markdown
U^235^^92^^（铀-235）
C^^6^^H^^12^^O^^6^^ + 6O^^2^^ → 6CO^^2^^ + 6H^^2^^O
```

> 注意：在处理顺序上，先匹配下标（双 `^^` 符号），再匹配上标（单 `^` 符号），避免冲突。上标/下标内容长度上限为 100 字符，超出部分将保持原始文本。

### 字体大小 (`!字号 文本!`)

使用 `!数字 文本!` 语法指定文字大小，字号范围 **8-200px**：

```markdown
!12 这是一段12px的小字!
!16 这是16px的正常文字!
!24 这是24px的较大文字!
!32 这是32px的大文字!
!48 这是48px的标题级文字!
!10 本协议最终解释权归甲方所有。!
!20 **重要提示**：请仔细阅读以下内容!!
!36 限时特惠! !28 全场五折起!
```

> 注意：字号范围限制为 8-200px，超出范围的值将被忽略。文本内容长度上限为 1000 字符。

### 脚注功能

脚注由两部分组成：**引用** `[^脚注名]` 和 **定义** `[^脚注名]: 内容`。

**基础用法**：
```markdown
这里有一个脚注引用[^example]。

[^example]: 这是脚注的内容，会显示在页面底部。
```

**标题中的脚注**：
```markdown
## 关于本编辑器[^about]

[^about]: xfEditor 是一款开源的 Markdown 在线编辑器。
```

**多个脚注**：
```markdown
项目特色[^f1]包括实时预览[^f2]和图表渲染[^f3]。

[^f1]: 所见即所得编辑体验。
[^f2]: 双向同步滚动。
[^f3]: 支持多种图表类型。
```

> 注意：脚注引用 `[^name]` 会渲染为可点击的上标链接，点击后跳转到文档底部的脚注内容。脚注内容处的 `↩` 链接可返回原文引用位置。脚注定义按出现顺序自动编号。

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

### 工具栏下拉图标文本

所有下拉菜单的子项现在都会自动在图标后显示对应的本地化文字描述。例如：
- 插入 → `[+] 行内代码`、`[icon] 代码块`、`[icon] 表格` 等
- 图表 → `[icon] 柱状图`、`[icon] 折线图`、`[icon] 饼图` 等
- 字帖 → `[⊞] 田字格`、`[*] 米字格`、`[A↓] 拼音格`
- 标题 → `H1`、`H2`、`H3`、`H4`、`H5`、`H6`

下拉菜单宽度自适应内容，图标行内显示，文字不换行。

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
| [KaTeX](https://khan.github.io/KaTeX/) (v0.16.9) | 数学公式渲染 |
| [prettify.js](https://github.com/google/code-prettify) | 代码语法高亮 |
| [Raphael.js](http://raphaeljs.com/) | SVG 矢量图形（流程图/时序图依赖） |
| [flowchart.js](http://flowchart.js.org/) | 流程图 |
| [sequence-diagram.js](https://bramp.github.io/js-sequence-diagrams/) | 时序图 |
| [underscore.js](http://underscorejs.org/) | 工具函数库 |
| [FontAwesome](http://fontawesome.io/) | 图标字体 |
| [ECharts](https://echarts.apache.org/) | 交互式图表 |

---

