<p align="center" style="text-align: center;">

![xfEditor's Logo](./images/logo.png)

</p>

# xfEditor 编辑器 v2.1.0

> **xfEditor 是一款更适合教育、教学、网页演示、数据呈现、内容排版的现代化 Markdown 开源在线编辑器。** 基于 [pandao/editor.md](https://github.com/pandao/editor.md) 深度改进，在原有基础上进行了系统性优化、Bug 修复和新功能拓展。

**xfEditor** 是一款开源可嵌入的 Markdown 在线编辑器组件，基于 CodeMirror 和 marked 构建，**零外部 DOM 库依赖**（内置轻量 micro-DOM）。**完全离线可用**，不依赖任何外部 CDN 资源。

## v2.1.0 版本核心变更
- **🔖 版本统一**：全量版本号统一收敛为 `v2.1.0`（含 `xfEditor.version`、`package.json`、各构建产物头、插件 `@version` 注释）。
- **🎨 上传组件统一美化**：图片/视频/附件上传对话框的「本地上传」重构为协调一致的渐变按钮 + 文件名回显组件，修复原生按钮样式割裂问题。
- **🚫 上传地址门控**：未配置对应上传地址时，视频/音频/附件的本地上传入口被禁用（不保存文件到前端）；图片为唯一例外，无地址时自动转为 base64 内联。
- **🗑️ 文件删除服务端通知**：已上传到服务器的文件在编辑器中删除/修改时，自动回调 `fileDeleteURL` 通知服务端清理，避免僵尸文件；新增 `onFileUploaded` / `onFileDeleted` 事件。
- **🖱️ 拖拽 / 粘贴文件**：支持拖入或粘贴图片、视频、音频、附件，按类型识别后走对应上传或离线处理。
- **🔄 同步滚动重构**：按 H1~H8 标题章节双向定位，再按章节内容高度比例同步滚动。
- **📑 事件与回调文档**：新增 `examples/events-reference.html`，系统枚举所有事件/回调的参数、用法与接入示例。


## 在线体验
- [功能导航页](https://zhaoxianfang.github.io/xfeditor/examples/index.html)
- [带目录预览](https://zhaoxianfang.github.io/xfeditor/examples/html-preview-markdown-to-html-custom-toc-container.html)
- [字帖](https://zhaoxianfang.github.io/xfeditor/examples/copybook.html)
- [图表](https://zhaoxianfang.github.io/xfeditor/examples/echarts.html)
- [完整演示](https://zhaoxianfang.github.io/xfeditor/examples/all-features.html)
- [API 接口文档](https://zhaoxianfang.github.io/xfeditor/examples/api-reference.html)

##核心变更
- **🔄 章节同步滚动**：先对齐左右两侧最小/最深层 H 标签章节，再按章节内容高度比例滚动；主控区带 TTL 过期，媒体加载与尺寸变化后自动重建模型，杜绝抖动与回环。
- **🚫 零兼容 / 零别名**：彻底移除 IE polyfill、window.test 全局污染、URL 兼容别名（escapeHTML/escapeAttr/ucfirst 等）、loadKaTeX 旧签名、eval 回退等历史兼容代码；公开 API 唯一命名。
- **🔐 安全加固**：XSS 过滤新增协议白名单（http/https/mailto/tel/ftp + 安全 data 图片），危险协议黑名单双保险；上传文件名采用 Markdown 结构转义；fetch Promise 统一防 unhandled rejection。
- **⚡ 性能提升**：章节模型仅在内容/尺寸变化时重建，滚动热路径只读缓存；实例级状态隔离，多编辑器互不干扰。
- **🧹 资源清理**：destroy 完整解绑章节同步/拖拽/字体加载监听与动画帧，杜绝内存泄漏。
- **📚 文档与示例**：全部接口文档与 demo 更新至 v2.1.0，内容与实际实现一致。


## 📐 完整语法与功能速览

xfEditor 支持 **40+ 种语法和功能**，远超标准 Markdown。以下为完整列表：

### 🏷 Markdown 基础语法
| 语法 | 说明 |
|------|------|
| `# H1` ~ `###### H6` | 六级标题 |
| `**粗体**` `*斜体*` `~~删除线~~` | 文本样式 |
| `` `行内代码` `` | 行内代码 |
| `[文本](url)` | 超链接 |
| `> 引用` | 引用块 |
| `- / 1.` | 无序/有序列表 |
| `---` | 分隔线 |
| `![alt](url)` | 图片 |

### 📊 代码与图表
| 语法 | 说明 | 配置 |
|------|------|------|
| ` ```lang ` | 30+语言代码高亮（JetBrains 风格） | 默认 |
| ` ```(.className) ` | 代码块设置 pre 的 class 属性 | 默认 |
| ` ```(#idName) ` | 代码块设置 pre 的 id 属性 | 默认 |
| ` ```(hidden) ` | 隐藏代码块（配合 tooltip 悬浮预览） | 默认 |
| ` ```(.cls#id) ` | 同时设置 class 和 id | 默认 |
| ` ```(hidden.cls#id) ` | 隐藏 + class + id 组合 | 默认 |
| ` ```echarts ` | ECharts 交互式图表 | `echarts: true` |
| ` ```flow ` | 流程图 Flowchart | `flowChart: true` |
| ` ```seq ` | 时序图 Sequence Diagram | `sequenceDiagram: true` |
| ` $$ ` 或 ` $ ` | KaTeX 数学公式（行内/块级） | `tex: true` |

### 🎯 扩展语法
| 语法 | 说明 | 配置 |
|------|------|------|
| `[TOC]` / `[TOCM]` | 目录（平铺/下拉菜单） | `toc: true` |
| `- [x]` / `- [ ]` | GFM 任务列表 | `taskList: true` |
| `@username` | @链接提及 | `atLink: true` |
| `[========]` | 打印分页符 | `pageBreak: true` |
| `[text](url){target=_blank}` | 链接跳转方式（新页面/当前页面/父窗口） | 默认 |

### 📐 版面布局
| 语法 | 说明 | 配置 |
|------|------|------|
| `[[columns:N]]...[[/columns]]` | N 列多栏排版（2-6 列） | `columns: true` |
| `[[row]]...[[col:N]]...[[/row]]` | 栅格化布局（Bootstrap 风格 10 栏） | `grid: true` |
| `[[tabs]]...[[/tabs]]` | 标签页组件（支持嵌套） | `tabs: true` |
| `[[page:A4]]...[[/page]]` | 纸张页面（A0-A8/LETTER） | `pageBlock: true` |
| `⁑居中⁑` / `⠪右对齐⠪` | Unicode 行内对齐 | `textAlign: true` |

### 🛠 文本增强
| 语法 | 说明 | 配置 |
|------|------|------|
| `{汉字 \| pīn yīn}` | 拼音标注 | `pinyin: true` |
| `^上标^` | 上标 | 内置语法 |
| `^^下标^^` | 下标 | 内置语法 |
| `<<下标>^<上标>>` | 组合上下标 | 内置语法 |
| `!32 文字!` | 字体大小（8-200px） | 内置语法 |
| `[^注解名]` / `[^注解名]: 内容` | 脚注系统 | 内置语法 |

### 🖱 悬浮提示 Tooltip
| 语法 | 说明 | 配置 |
|------|------|------|
| `[文本](tooltip:text:内容)` | 文本悬浮提示 | `tooltip: true` |
| `[文本](tooltip:image:url)<宽,高>` | 图片悬浮提示（支持宽高） | `tooltip: true` |
| `[文本](tooltip:iframe:url)<宽,高>` | 嵌入页面悬浮提示（支持宽高） | `tooltip: true` |
| `[文本](tooltip:html:#id)` | HTML DOM 元素悬浮提示 | `tooltip: true` |
| `[文本](tooltip:iframe:pre#id)` | 代码块内容悬浮预览 | `tooltip: true` |
| 固定宽高自动滚动 | 设置宽高后超出内容自动显示滚动条 | `tooltip: true` |

### 📝 字帖与教育
| 语法 | 说明 | 配置 |
|------|------|------|
| `[[copybookTian]]...[[/copybookTian]]` | 田字格字帖 | `copybook: true` |
| `[[copybookMi]]...[[/copybookMi]]` | 米字格字帖 | `copybook: true` |
| `[[copybookPinyin]]...[[/copybookPinyin]]` | 拼音格字帖 | `copybook: true` |
| `{汉字\|拼音}` 花括号语法 | 拼音格内嵌写法（推荐） | `copybook: true` |
| `(!width:NNN)` | 行级宽度参数，两端对齐 | `copybook: true` |
| `[^name]` 字帖脚注 | 字帖/拼音格内脚注引用 | 内置语法 |

### 🎬 多媒体与附件
| 语法 | 说明 | 配置 |
|------|------|------|
| `[[video]]url[[/video]]` | 视频嵌入 | 默认 |
| `<video src="...">` | HTML5 视频 | `htmlDecode` |
| `[[file]]url\|名称[[/file]]` | 附件链接 | `fileUpload: true` |
| `[文本](url)` → .mp4 自动 | 视频链接自动识别 | 默认 |

### 🔧 编辑器功能
| 功能 | 说明 | 配置 |
|------|------|------|
| 同步滚动 | 先按 H1~H8 标题章节定位，再按章节内容高度比例双向同步；主控区 TTL 过期、媒体加载自动重建 | `syncScroll: true` |
| 表格行列编辑 | 预览区点击单元格插入/删除行列 | `tableEdit: true` |
| 图片尺寸编辑 | 拖拽+精确输入图片尺寸 | `imageResize: true` |
| 代码复制按钮 | 代码块右上角一键复制 | 默认 |
| 图片/文件/视频上传 | 拖拽/粘贴到鼠标位置，按后缀与 MIME 自动选择接口，上传后回显 | `dropPasteUpload/imageUploadURL/fileUploadURL` |
| 草稿自动保存 | localStorage 定时保存+恢复 | `draftAutoSave: true` |
| 搜索替换 | 编辑器内搜索/替换 | `searchReplace: true` |
| 代码折叠 | CodeMirror 代码折叠 | `codeFold: true` |
| 公式插入面板 | 100+公式模板、11 分类、一键插入 | 工具栏按钮 |
| 全屏编辑 | 全屏沉浸式编辑 | F11 |
| 多语言 | 简体中文/繁体中文/英文 | `lang` |
| 主题切换 | 编辑器+预览区多套主题 | `theme`/`previewTheme` |
| 表单集成 | `saveHTMLToTextarea: true` | — |

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
- 实时预览
- 30+ 语言代码语法高亮
- 搜索替换、只读模式、全屏编辑、自动高度

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
    <link rel="stylesheet" href="css/xf_editor.min.css" />
</head>
<body>
<div id="editor">
    <textarea style="display:none;">### 你好！
- 支持**粗体**和*斜体*
- `代码高亮`
- $E=mc^2$ 数学公式</textarea>
</div>
<script src="xf_editor.min.js"></script>
<script>
xfEditor.dom(function(){
    xfEditor("editor", {
        width: "100%", height: "600px",
        path: "./lib/",
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

**直接下载**：将 `css/` `xf_editor.min.js` `lib/` `fonts/` `images/` `languages/` `plugins/` 部署到 Web 服务器。

**构建产物**：v2.1.0 仅提供浏览器全局脚本（`xf_editor.js`、`xf_editor.min.js`、`xf_editor.preview.min.js`）。插件与语言包通过 `window.xfEditor` 注册，无需模块加载器。

**npm**：`npm install xf_editor`

### 创建编辑器

```javascript
var editor = xfEditor("editor", {
    width  : "100%", height : "600px",
    path   : "./lib/",        // 依赖库自动加载路径
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
<link rel="stylesheet" href="css/xf_editor.preview.min.css" />
<div id="preview"><textarea style="display:none;">### Hello</textarea></div>
<script src="xf_editor.min.js"></script>
<script src="lib/marked.min.js"></script>
<script src="lib/prettify.min.js"></script>
<script>
xfEditor.dom(function(){ xfEditor.markdownToHTML("preview", {echarts:true,tabs:true}); });
</script>
```

### 常用操作

```javascript
editor.getMarkdown();               // 获取 Markdown 源码
editor.setValue("新内容");           // 设置内容
editor.insertValue("Hello");        // 光标处插入
editor.clear();                     // 清空
editor.getHTML();                   // 获取片段或完整独立 HTML（含样式和脚本）
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
| `placeholder` | `"写点什么吧~"` | 占位符 |

### 预览
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `watch` | `true` | 实时预览 |
| `delay` | `80` | 解析延迟 (ms) |
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
| `dropPasteUpload` | `true` | 允许拖放/粘贴文件到编辑区自动上传 |
| `dropPasteAtMouse` | `true` | 粘贴/拖放文件插入到最近鼠标位置（false 用光标位置，拖放坐标同样忽略） |
| `dropPasteMaxFiles` | `10` | 单次拖放/粘贴最多处理文件数（0 表示不处理） |
| `dropPasteFallbackToBase64` | `true` | 图片上传失败时降级为内嵌 base64，保证内容不丢失 |
| `uploadMaxSize` | `10MB` | 图片单文件大小上限 |
| `uploadMaxFileSize` | `50MB` | 视频/附件单文件大小上限 |
| `strictMimeCheck` | `true` | 校验图片扩展名、MIME 与文件头 |
| `allowedUploadProtocols` | `["http:","https:","mailto:","tel:","ftp:","/","./","../"]` | 服务端返回地址协议白名单 |
| `uploadFunction` | `null` | 自定义上传函数 `(file, meta, done)`；配置后优先于 URL 上传，**无需填写任何 `uploadURL` 即可工作** |
| `uploadHeaders` | `{}` | XHR 上传附加请求头 |
| `uploadTimeout` | `30000` | 单个 XHR 上传超时（毫秒），超时后继续处理队列后续文件 |
| `onUploadProgress` | `function(){}` | 上传进度回调 `(info)`，`info={file,loaded,total,percent}` |
| `onUploadError` | `function(){}` | 上传失败回调 `(info)`，`info={type,name,message}` |

> 拖放/粘贴上传由 `dropPasteUpload` 独立控制，按文件类型自动选择 `imageUploadURL` / `videoUploadURL` / `fileUploadURL`（或统一走 `uploadFunction`），与工具栏弹窗的 `imageUpload` / `fileUpload` 开关互不影响。
>
> - 粘贴的截图通常没有文件名，编辑器会按 MIME 推断扩展名（如 `image/png` → `png`），再通过格式白名单与图片魔数校验，不会误判为“不支持的格式”。
> - 文件事件在原生 DOM 捕获阶段接管（CodeMirror 自带事件在含文件时不会触发），`onpaste` / `ondrop` 回调仍会正常收到通知；普通文本粘贴不受影响。
> - 拖放按鼠标位置定位插入点；多文件按拖入顺序依次插入。

### 扩展功能
| 选项 | 默认值 | 说明 |
|------|--------|------|
| `tex` | `false` | KaTeX 公式 |
| `flowChart` | `false` | 流程图 |
| `sequenceDiagram` | `false` | 时序图 |
| `taskList` | `true` | 任务列表 |
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
| `grid` | `true` | 栅格化布局（[[row]]/[[col]]） |
| `tooltip` | `true` | 悬浮提示 |
| `copybook` | `true` | 字帖（田字格、米字格、拼音格） |
| `pageBlock` | `true` | 纸张页面（A4/Letter等） |
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
| `setValue(v)` | 设置内容 |
| `appendMarkdown(md)` | 追加内容 |
| `insertValue(v)` | 在光标处插入内容 |
| `clear()` | 清空 |
| `setMarkdown(md)` | 设置 Markdown 源文档（`""` 可清空） |
| `getHTML([opts])` | 完整独立 HTML 或片段（含样式+脚本）；支持 `wrap` 生成 DOCTYPE 文档、`theme` 暗色主题、SEO/外部资源等选项；支持布尔简写 `getHTML(true/false)` |
| `getPreviewedHTML([opts])` | 预览区 HTML 片段（支持 `rawMarkdown`/`includeStyles`/`includeScripts`/`wrap`/`theme`/`lang`/`charset`/SEO `meta`） |
| `getUseTypes()` | 检测当前内容用到的扩展特性（导出用） |
| `getDetectedFeatures()` | 检测渲染 HTML 中包含的特性 |
| `getExportFileName()` / `setExportFileName(name)` | 读写导出文件名 |

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

### 同步滚动与生命周期
| 方法 | 说明 |
|------|------|
| `bindChapterSync()` | 绑定章节同步引擎（渲染时自动调用；`watch()` 重新开启时自动恢复） |
| `unbindChapterSync()` | 解除章节同步绑定并清理全部监听（`unwatch()` 时自动调用） |
| `suspendSyncScroll()` | 临时 suspend 同步（内容程序化更新时用） |
| `resumeSyncScroll()` | 恢复同步 |
| `scrollToLineNum(line, linePercent)` | 滚动编辑区到指定行并按章节规则同步预览 |
| `destroy()` | 销毁实例，释放所有监听器/定时器/动画帧 |
| `watch()` / `unwatch()` | 开启/关闭实时预览 |
| `previewing()` / `previewed()` | 进入/退出纯预览模式 |
| `fullscreen()` / `fullscreenExit()` | 进入/退出全屏 |
| `show()` / `hide()` | 显示/隐藏编辑器 |
| `resize()` | 重新计算尺寸（同时失效章节模型） |
| `setLang(lang)` | 切换界面语言 |
| `executePlugin(name, path)` | 执行插件 |
| `search()` / `searchReplace()` / `searchReplaceAll()` | 搜索与替换 |
| `linkDialog()` / `referenceLinkDialog()` / `canvasDialog()` | 插入对话框 |
| `showColorPicker()` / `applyColor(color)` | 颜色选择与应用 |
| `initECharts()` / `initTabs()` / `initColumns()` / `initBanners()` / `initTooltips()` | 扩展渲染初始化 |
| `saveDraft()` / `clearDraft()` / `showDraftRecovery()` | 草稿管理 |

## 静态方法 API

### `xfEditor.markdownToHTML(id, options)`
将 textarea 中的 Markdown 渲染为 HTML 预览：
```javascript
xfEditor.markdownToHTML("preview-container", {
    markdown: "# Hello", htmlDecode: "style,script,iframe",
    toc: true, tex: true,
    echarts: true, tabs: true, columns: true, tooltip: true, copybook: true
});
```

### 其他静态属性
| 属性/方法 | 说明 |
|-----------|------|
| `xfEditor.dom` | 内置 micro-DOM 对象（唯一入口） |
| `xfEditor.escapeHtml(str)` | HTML 实体转义（XSS 防护） |
| `xfEditor.escapeMarkdownText(str)` | Markdown 结构符转义（用于链接文字/图片 alt） |
| `xfEditor.marked` | marked 解析器实例 |
| `xfEditor.defaults` | 全局默认配置对象 |
| `xfEditor.toolbarModes` | 工具栏预设模式 |
| `xfEditor.version` | 版本号字符串（`"2.1.0"`） |
| `xfEditor.safeFileName(name)` | 文件名安全化（去 Markdown 残留与非法字符） |
| `xfEditor.firstHeading(markdown)` | 提取首个标题文本 |
| `xfEditor.base64Encode(str)` / `xfEditor.base64Decode(str)` | Base64 编解码（UTF-8 安全） |
| `xfEditor.registerLang(lang, obj)` / `xfEditor.getLang(lang)` | 语言包注册与获取 |
| `xfEditor.filterHTMLTags(html, options)` | HTML 标签白名单过滤（XSS 防护） |
| `xfEditor.markdownToCRenderer` / `xfEditor.tocDropdownMenu` | 目录渲染器 |
| `xfEditor.loadPlugin(url, cb)` / `xfEditor.loadCSS(url)` / `xfEditor.loadScript(url)` | 资源加载 |
| `xfEditor.loadKaTeX([basePath], [callback])` | 按需加载 KaTeX（可选基路径与回调） |
| `xfEditor.notify(msg, type)` | 全局通知 |
| `xfEditor.dateFormat(date, format)` | 日期格式化 |

---

## 事件系统

```javascript
// 配置方式
xfEditor("editor", {
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
| `onPageAllLoad` | 网页所有资源加载完成 | `onEditorLoad` | 编辑器加载完成 |

### 编辑器状态
| 属性 | 类型 | 说明 |
|------|------|------|
| `state.watching` | Boolean | 是否启用实时预览 |
| `state.loaded` | Boolean | 是否已完成加载 |
| `state.preview` | Boolean | 是否处于预览模式 |
| `state.fullscreen` | Boolean | 是否处于全屏模式 |

---

## Markdown 扩展语法

### ECharts 图表 (`echarts: true`)
````markdown
```echarts
{"type":"bar","title":{"text":"月度销售"},"xAxis":{"data":["1月","2月","3月"]},"yAxis":{},"series":[{"type":"bar","data":[120,200,150]}]}
```
````
支持 bar / line / pie / radar / funnel / **tree（树图/脑图）**

**Tree图/脑图示例**：
````markdown
```echarts
{
  "theme": "dark",
  "type": "tree",
  "height": 500,
  "title": {"text": "组织架构"},
  "series": [{
    "type": "tree",
    "data": [{"name": "CEO", "children": [
      {"name": "CTO", "children": [{"name": "前端"}, {"name": "后端"}]},
      {"name": "CFO"}
    ]}],
    "layout": "orthogonal", "orient": "LR",
    "expandAndCollapse": true,
    "initialTreeDepth": 2
  }]
}
```
````

> ECharts 配置支持 `"theme": "dark"` / `"light"` 主题切换，`"height": 500` 自定义图表高度，`expandAndCollapse: true` 支持节点折叠展开

### Tabs 标签页 (`tabs: true`)
```markdown
[[tabs]]
[[tab:产品介绍]] xfEditor 是一款开源 Markdown 编辑器... [[/tab]]
[[/tabs]]
```

### 多列排版 (`columns: true`)
```markdown
[[columns:3]]
### 第一栏 ... ### 第二栏 ... ### 第三栏 ...
[[/columns]]
```

### 纸张页面 (`pageBlock: true`)
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

#### HTML 元素类型 增强
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
⁑居中⁑  ⁑⁖左对齐⁖⁑  ⠪右对齐⠪
```

**键盘快捷键：**
- `Ctrl+Alt+L` - 左对齐
- `Ctrl+Alt+C` - 居中对齐
- `Ctrl+Alt+R` - 右对齐

### 字帖 (`copybook: true`)

田字格、米字格、拼音格字帖，用于展示汉字书写范例。支持脚注嵌入、花括号语法、宽度参数等高级特性。

**田字格（支持脚注）**：
```markdown
[[copybookTian]]
(春眠不觉晓)(处处闻啼鸟)
(夜来风雨声)(花落知多少)
[[/copybookTian]]
```

**米字格（支持脚注）**：
```markdown
[[copybookMi]]
(床前明月光)(疑是地上霜)
(举头望明月)(低头思故乡)
[[/copybookMi]]
```

**拼音格 — 花括号语法 + 宽度参数**（推荐用于古诗文对齐）：
```markdown
[[copybookPinyin]]
{春眠不觉晓|chūn mián bù jué xiǎo}(!width:125)
{处处闻啼鸟|chù chù wén tí niǎo}(!width:125)
{夜来风雨声|yè lái fēng yǔ shēng}(!width:125)
{花落知多少|huā luò zhī duō shǎo}(!width:125)
[[/copybookPinyin]]
```

**字帖内嵌脚注**：
```markdown
[[copybookPinyin]]
{春眠不觉[^jue]晓|chūn mián bù jué xiǎo}(!width:125)
{处处闻啼[^niao]鸟|chù chù wén tí niǎo}(!width:125)
[[/copybookPinyin]]

[^jue]: 觉：醒来、睡醒
[^niao]: 鸟：鸣禽
```
> 脚注标记 `[^name]` 不产生独立单元格，附在前一个汉字上；拼音格中脚注上方不显示拼音，
> 点击可平滑滚动跳转到文末脚注区并高亮显示。

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
[^f2]: 支持多种图表类型。
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
xfEditor("editor", {
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
        ucwords: function(){ return xfEditor.toolbarHandlers.ucwords; }
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

### `[data-theme="dark"]` 属性支持

独立 HTML 预览页面（通过 `getHTML()` 或 `markdownToHTML()` 生成的内容）无需加载完整编辑器 JS，只需在父元素上添加 `data-theme="dark"` 属性即可启用暗色主题：

```html
<!-- 整页暗色 -->
<html data-theme="dark">
<body>
  <div class="xf_editor-html-preview">...</div>
</body>
</html>

<!-- 仅某个区域暗色 -->
<div data-theme="dark">
  <div class="xf_editor-html-preview">...</div>
</div>

<!-- JS 动态切换 -->
<script>
  // 切换为暗色
  document.documentElement.setAttribute('data-theme', 'dark');
  // 恢复亮色
  document.documentElement.removeAttribute('data-theme');
</script>
```

暗色覆盖范围：背景色、文字色、代码块、行内代码、引用块、表格、**脚注**、流程图、时序图、Tabs、TOC 目录、Badge、ECharts、字帖、附件链接、滚动条等全部元素。

### 多语言
内置 `zh-cn`（简体中文）、`zh-tw`（繁体中文）、`en`（英文）。自定义语言包：

```javascript
(function() {
    xfEditor.lang["en"] = {
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
    // 方式一：加载外部插件文件（加载完成自动执行）
    xfEditor.loadPlugin("./plugins/my-plugin.js", function() {
        // 插件已就绪
    });
    // 方式二：执行已注册的内置插件
    xfEditor.executePlugin("my-plugin");
})();
```

---

## 上传接口规范

### 图片上传 (imageUpload)

**请求**：`POST` 到 `imageUploadURL`，字段名 `xf_editor-image-file`

**成功响应**：
```json
{ "success": 1, "message": "上传成功", "url": "./uploads/image.png" }
```

**失败响应**：
```json
{ "success": 0, "message": "上传失败" }
```

### 文件上传 (fileUpload)

**请求**：`POST` 到 `fileUploadURL`，字段名 `xf_editor-file-file`

**成功响应**：
```json
{ "success": 1, "message": "上传成功", "url": "./uploads/file.docx", "name": "file.docx" }
```

---

## 内置 DOM 库

xfEditor **零外部 DOM 库依赖**，内置 micro-DOM 层随编辑器一起打包，无需引入任何第三方库。

编辑器内部统一使用 micro-DOM，仅通过单一入口对外暴露：

```javascript
xfEditor.dom      // 内置 micro-DOM（唯一入口，无别名）
```

它实现了编辑器实际用到的 DOM API 子集（选择器、事件含命名空间、class/属性/样式、尺寸与位置、遍历、插入删除、Ajax 等），纯原生实现。

### 插件开发

插件直接复用编辑器暴露的 DOM 库：

```javascript
var factory = function (exports) {
    var dom = (exports && exports.dom) ? exports.dom : null;
    // ...
};
```

---

## 依赖库列表

| 库 | 用途 |
|----|------|
| [CodeMirror](http://codemirror.net/) | 代码编辑器核心 |
| [marked](https://github.com/markedjs/marked) | Markdown 解析器 |
| [KaTeX](https://khan.github.io/KaTeX/) (v0.16.9) | 数学公式渲染（字体已 Base64 内嵌，离线可用） |
| [prettify.js](https://github.com/google/code-prettify) | 代码语法高亮 |
| [Raphael.js](http://raphaeljs.com/) | SVG 矢量图形（流程图/时序图依赖） |
| [flowchart.js](http://flowchart.js.org/) | 流程图 |
| [sequence-diagram.js](https://bramp.github.io/js-sequence-diagrams/) | 时序图 |
| [underscore.js](http://underscorejs.org/) | 工具函数库 |
| [FontAwesome](http://fontawesome.io/) | 图标字体 |
| [ECharts](https://echarts.apache.org/) | 交互式图表 |

---

**最后更新**: 2026-11-27
**版本**: v2.1.0

---

## 许可证

MIT License © xfEditor 贡献者。详见 [LICENSE](./LICENSE)。
