# xfEditor 使用指南

> xfEditor v1.12.0 完整使用手册

---

## 📖 目录

1. [快速开始](#快速开始)
2. [配置选项](#配置选项)
3. [Markdown 扩展语法](#markdown-扩展语法)
4. [键盘快捷键](#键盘快捷键)
5. [API 参考](#api-参考)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 🚀 快速开始

### 基础用法

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/editormd.min.css" />
</head>
<body>
    <div id="editor">
        <textarea style="display:none;"># Hello xfEditor</textarea>
    </div>
    <script src="js/jquery.min.js"></script>
    <script src="editormd.min.js"></script>
    <script type="text/javascript">
        var editor = editormd("editor", {
            width: "100%",
            height: 600,
            path: "lib/"
        });
    </script>
</body>
</html>
```

### 纯预览模式

```javascript
editormd.markdownToHTML("preview-container", {
    markdown: "# Hello World",
    htmlDecode: "style,script,iframe",
    toc: true,
    tex: true,
    echarts: true,
    tabs: true,
    columns: true,
    tooltip: true,
    copybook: true,
    pageBlock: true
});
```

---

## ⚙️ 配置选项

### 核心功能

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `width` | `"100%"` | 编辑器宽度 |
| `height` | `"100%"` | 编辑器高度 |
| `path` | `"lib/"` | 依赖库路径 |
| `theme` | `""` | 编辑器整体主题 |
| `editorTheme` | `"default"` | CodeMirror 编辑区主题 |
| `previewTheme` | `""` | 预览区主题 |
| `markdown` | `""` | 初始化 Markdown 内容 |

### 预览功能

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `watch` | `true` | 实时预览 |
| `delay` | `300` | 解析延迟 (ms) |
| `previewCodeHighlight` | `true` | 预览区代码高亮 |

### 扩展语法

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `tex` | `false` | KaTeX 数学公式 |
| `flowChart` | `false` | 流程图 |
| `sequenceDiagram` | `false` | 时序图 |
| `taskList` | `false` | 任务列表 |
| `toc` | `true` | 目录生成 |
| `atLink` | `true` | @链接 |
| `emailLink` | `true` | 邮件链接 |
| `pinyin` | `false` | 拼音标注 |
| `textAlign` | `true` | 文本对齐 |
| `tableEdit` | `true` | 表格编辑 |
| `echarts` | `false` | ECharts 图表 |
| `tabs` | `true` | Tabs 标签页 |
| `columns` | `true` | 多列排版 |
| `tooltip` | `true` | 悬浮提示 |
| `copybook` | `true` | 字帖 |
| `pageBlock` | `true` | 纸张页面 |
| `previewOnly` | `false` | 纯预览模式（禁用编辑功能） |

---

## 📝 Markdown 扩展语法

### 1. ECharts 图表 (`echarts: true`)

支持柱状图、折线图、饼图、雷达图、漏斗图：

````markdown
```echarts
{
  "type": "bar",
  "title": {"text": "月度销售"},
  "xAxis": {"data": ["1月", "2月", "3月"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [120, 200, 150]}]
}
```
````

### 2. Tabs 标签页 (`tabs: true`)

```markdown
[[tabs]]
[[tab:产品介绍]]
xfEditor 是一款开源 Markdown 编辑器...
[[/tab]]
[[tab:更新日志]]
### v1.10.0
- 工具栏图片/视频/文件按钮失效修复
- 编辑模式弹窗全面美化（渐变标题栏、现代按钮、输入框优化）
- XSS 安全加固（6 项注入漏洞修复）
- ECharts resize 事件内存泄漏修复
- Link 渲染器活跃安全协议阻断
[[/tab]]
[[/tabs]]
```

**嵌套支持**：
- Tabs 内可嵌套 Columns
- Tabs 内可嵌套代码块、表格、图表
- 支持多级嵌套（最多 20 层）

### 3. 多列排版 (`columns: true`)

```markdown
[[columns:3]]
### 第一栏
内容...

### 第二栏
内容...

### 第三栏
内容...
[[/columns]]
```

### 4. 纸张页面 (`pageBlock: true`)

以标准纸张尺寸展示内容，支持自动分页：

```markdown
[[page:A4 header="文档标题" footer="第 {page} 页 / 共 {total} 页"]]
# 文档标题

内容...

[========]  <!-- 手动分页符 -->

更多内容...
[[/page]]
```

**支持的纸张规格**：
- A系列：A0 ~ A8
- AN：等同于 A4
- LETTER：美国信纸
- LEGAL：美国法律用纸

**页头页脚占位符**：
- `{page}` - 当前页码
- `{total}` - 总页数

### 5. 拼音标注 (`pinyin: true`)

```markdown
{你 | nǐ} {好 | hǎo}
{中国 | zhōng guó}
{学习 | xué xí}
```

**拼音输入技巧**：
- 使用带声调符号的字母：ā á ǎ à
- 多字词语用空格分隔拼音
- 参照 [拼音参照表](examples/pinyin-reference.html) 获取完整声母韵母列表

### 6. 行内对齐 (`textAlign: true`)

```markdown
⁑⁑居中对齐⁑⁑
⁑⁖左对齐⁖⁑
⁑⠕右对齐对齐⠕⁑
⁑⁛两端对齐⁛⁑
```

**键盘快捷键**：
- `Ctrl+Alt+L` - 左对齐
- `Ctrl+Alt+C` - 居中对齐
- `Ctrl+Alt+R` - 右对齐
- `Ctrl+Alt+J` - 两端对齐

### 7. 悬浮提示 (`tooltip: true`)

**新版统一语法**（v1.12.0）：

```markdown
[触发文本](tooltip:类型:内容)<宽度,高度>
```

**支持的类型**：
- `text` - 文本内容
- `image` - 图片URL
- `iframe` - 页面URL
- `html` - CSS选择器（引用页面DOM元素）

---

#### 7.1 文本类型

**基础用法**：
```markdown
[悬停查看](tooltip:text:这是提示内容)
```

**设置固定宽高**（超出自动滚动）：
```markdown
[百度简介](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。)<50,20>
```

**图片作为触发对象**：
```markdown
[../images/logo.png](tooltip:text:这是通过图片路径触发的文本悬浮提示。)
```

---

#### 7.2 图片类型

**基础用法**（自动宽高）：
```markdown
[查看Logo](tooltip:image:../images/logos/editormd-logo-180x180.png)
```

**设置固定宽高**（图片拉伸/缩放）：
```markdown
[Logo 50x40](tooltip:image:../images/logos/editormd-logo-180x180.png)<50,40>
[Logo 100x80](tooltip:image:../images/logos/editormd-logo-180x180.png)<100,80>
```

**使用引号包围URL**（推荐）：
```markdown
[外部图片](tooltip:image:"https://picsum.photos/300/200?random=1")<120,80>
[随机图片](tooltip:image:'https://picsum.photos/200/150?random=2')<100,75>
```

---

#### 7.3 iframe 类型

**基础用法**：
```markdown
[查看示例页面](tooltip:iframe:./simple.html)
```

**设置固定宽高**（超出自动滚动）：
```markdown
[小窗口](tooltip:iframe:./simple.html)<100,60>
[中窗口](tooltip:iframe:./simple.html)<200,120>
[大窗口](tooltip:iframe:./simple.html)<300,180>
```

**使用引号包围URL**：
```markdown
[外部页面](tooltip:iframe:"https://example.com")<200,150>
```

---

#### 7.4 HTML 类型（CSS选择器）

**Class选择器**：
```markdown
[查看产品卡片](tooltip:html:.test_tooltip1)<150,100>
```

**ID选择器**：
```markdown
[查看ID元素](tooltip:html:#test_tooltip_id)<160,80>
```

**使用引号包围选择器**：
```markdown
[带引号的class](tooltip:html:".test_tooltip1")<140,90>
[带引号的ID](tooltip:html:"#test_tooltip_id")<150,85>
```

**HTML元素定义**：
```html
<!-- 在页面中定义隐藏元素 -->
<div class="test_tooltip1" style="display:none;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 15px; border-radius: 8px; color: #fff;">
        <h4>🎯 产品特性</h4>
        <p>这是通过CSS选择器引用的HTML内容</p>
        <ul>
            <li>实时预览与同步滚动</li>
            <li>30+ 语言代码高亮</li>
            <li>ECharts 图表嵌入</li>
        </ul>
    </div>
</div>

<div id="test_tooltip_id" style="display:none;">
    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
        <h4 style="color: #1976D2;">📚 ID选择器示例</h4>
        <p>这是通过ID选择器引用的内容。</p>
    </div>
</div>
```

---

#### 7.5 宽度和高度参数

**参数格式**：`<宽度,高度>`

**规则说明**：
1. 单位固定为像素（px），不需要写单位
2. 参数可选，不写时自动适应内容大小
3. 必须同时写宽度和高度

**v1.12.1 尺寸限制优化**：
- **图片类型**：设置宽高后，图片使用显式 `width`/`height` + `object-fit:contain` 精确限制尺寸，popup 容器同时设置 `max-width`/`max-height` 防止溢出
- **iframe 类型**：popup 容器根据指定尺寸设置显式宽高和最大宽高限制
- **CSS 约束解除**：Tooltip popup 的 `max-width` 已从 `360px` 放宽至 `90vw`，不再强制限制悬浮框最大宽度

**不同类型的行为**：
- **text**：超出高度时垂直滚动
- **image**：图片使用 `object-fit:contain` 按比例缩放填充区域，不会拉伸变形
- **iframe**：水平或垂直方向都会根据需要滚动
- **html**：超出高度时垂直滚动

---

#### 7.6 完整示例

```markdown
## 文本类型
[百度](tooltip:text:百度是全球最大的中文搜索引擎。)
[固定大小](tooltip:text:这段文本固定宽度50px高度20px。)<50,20>

## 图片类型
[查看Logo](tooltip:image:../images/logo.png)
[Logo 100x80](tooltip:image:../images/logo.png)<100,80>
[外部图片](tooltip:image:"https://picsum.photos/300/200")<120,80>

## iframe类型
[查看页面](tooltip:iframe:./demo.html)
[小窗口](tooltip:iframe:./demo.html)<150,100>

## HTML类型
[查看产品卡片](tooltip:html:.product-card)<150,100>
[查看详情](tooltip:html:"#detail-content")<160,80>
```

### 8. 字帖 (`copybook: true`)

**田字格**：
```markdown
[[copybookTian]]
(汉字1)(汉字2)(汉字3)
[[/copybookTian]]
```

**米字格**：
```markdown
[[copybookMi]]
(汉字1)(汉字2)(汉字3)
[[/copybookMi]]
```

**拼音格**：
```markdown
[[copybookPinyin]]
(汉字1|拼音1)(汉字2|拼音2)
[[/copybookPinyin]]
```

### 9. 上标与下标

**上标** `^内容^`（右上角标）：
```markdown
x^2^ + y^3^ = z^n^
E = mc^2^
100m^2^ 建筑面积
```

**下标** `^^内容^^`（右下角标）：
```markdown
H^^2^^O（水分子）
CO^^2^^（二氧化碳）
log^^10^^(100) = 2
```

**组合上下标** `<<下标>^<上标>>`（同时显示下标和上标）⭐v1.11 新增：
```markdown
X<<2>^<3>>（X₂³）
U<<92>^<235>>（铀-235，92 是下标，235 是上标）
A<<i>^<j>>（矩阵元素 Aᵢʲ）
S<<k=1>^<n>>（求和：下标 k=1，上标 n）
```

**分别组合使用**（传统方式）：
```markdown
U^235^^92^^（铀-235，使用独立上下标组合）
C^^6^^H^^12^^O^^6^^ + 6O^^2^^ → 6CO^^2^^ + 6H^^2^^O
```

> 处理顺序：先匹配组合上下标（`<<>>`），再匹配下标（双 `^^`），最后匹配上标（单 `^`），避免冲突。文本长度限制各 100 字符。

### 10. 字体大小 (`!字号 文本!`)

使用 `!数字 文本!` 语法控制文字显示大小，字号范围 **8-200px**：

```markdown
!12 12px小字!
!16 16px正文!
!24 24px大号文字!
!32 32px标题!
!48 48px超大标题!
```

> 超出范围的字号会被忽略。可以与 `**粗体**` 等 Markdown 内联语法组合使用。

### 11. 脚注功能

**脚注引用** `[^脚注名称]` 和 **脚注定义** `[^脚注名称]: 内容`：

```markdown
这里有一个脚注引用[^example]。

[^example]: 这是脚注的内容，会统一显示在文档末尾。
```

**标题中使用脚注**：
```markdown
## 关于本编辑器[^about]

[^about]: xfEditor 是一款开源的 Markdown 在线编辑器组件。
```

**多个脚注**：
```markdown
项目特色[^f1]包括实时预览[^f2]和图表渲染[^f3]。

[^f1]: 所见即所得编辑体验。
[^f2]: 编辑区和预览区双向同步滚动。
[^f3]: 支持 ECharts 多种图表类型。
```

> 脚注定义可以写在文档的任何位置，所有脚注内容会按定义顺序在文档末尾统一显示。点击脚注引用可跳转到对应定义，点击 `↩` 可返回引用位置。

### 12. 图片尺寸编辑 (`imageResize: true`)

```markdown
![图片](url)<300,200>
```

- 拖拽图片边角调整尺寸
- 自动同步 Markdown 源码
- 支持 Shift 等比缩放
- ⭐v1.12 修复：精准追踪图片出现次数，拖拽第 N 个实例不会错误修改第一个

### 13. 视频和文件列表

**视频列表**：
```markdown
[[video]]
https://example.com/video1.mp4 | 视频标题1
https://example.com/video2.mp4 | 视频标题2
[[/video]]
```

**文件列表**：
```markdown
[[file]]
https://example.com/file1.pdf | 文件名1
https://example.com/file2.docx | 文件名2
[[/file]]
```

---

## ⌨️ 键盘快捷键

### 文本格式化

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+B` | 粗体 |
| `Ctrl+I` | 斜体 |
| `Ctrl+D` | 删除线 |
| `Ctrl+K` | 行内代码 |
| `Shift+Ctrl+K` | KaTeX 公式 |
| `Shift+Ctrl+C` | 代码块 |

### 标题

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+1` ~ `Ctrl+6` | 一级到六级标题 |

### 列表和引用

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+U` | 无序列表 |
| `Shift+Ctrl+Q` | 引用 |

### 对齐

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Alt+L` | 左对齐 |
| `Ctrl+Alt+C` | 居中对齐 |
| `Ctrl+Alt+R` | 右对齐 |
| `Ctrl+Alt+J` | 两端对齐 |

### 其他

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+L` | 链接 |
| `Ctrl+H` | 水平分隔线 |
| `Ctrl+Alt+G` | 跳转到行 |
| `F9` | 切换实时预览 |
| `F10` | 切换预览 |
| `F11` | 全屏 |

---

## 🔌 API 参考

### 实例方法

**内容操作**：
```javascript
editor.getMarkdown();          // 获取 Markdown
editor.setMarkdown(md);        // 设置 Markdown
editor.getHTML();              // 获取完整独立 HTML 文档（含 DOCTYPE、内联 CSS/JS）
editor.getPreviewedHTML();     // 获取预览区 HTML（支持全页、片段、压缩模式）
editor.getTextareaSavedHTML(); // 获取保存的 HTML（getHTML 的别名）
```

**获取独立 HTML**：`getHTML(options)` — ⭐v1.12.1加强，生成完全不依赖外部文件的完整 HTML 文档：
```javascript
var html = editor.getHTML({
    title: "我的文章",               // 页面标题
    description: "文章简介",          // meta description
    author: "作者名",                // meta author
    keywords: "关键词, 标签",        // meta keywords
    includeStyles: true,             // 内联所有 CSS 样式
    includeScripts: true,            // 内联交互脚本（Tooltip/Tabs/Columns/ECharts等）
    externalStyles: ["https://cdn.example.com/theme.css"],  // 外部样式表
    externalScripts: ["https://cdn.example.com/app.js"],   // 外部脚本
    customMeta: {"viewport": "width=device-width"},  // 自定义 meta 标签
    lang: "zh-CN",                   // HTML lang 属性
    charset: "UTF-8",                // 字符编码
    minify: false                    // 是否压缩输出
});
```

**获取预览区 HTML**：`getPreviewedHTML(options)` — ⭐v1.12.1加强：
```javascript
var html = editor.getPreviewedHTML({
    includeStyles: true,      // 内联核心 CSS
    includeScripts: true,     // 内联交互脚本
    fullPage: false,          // 是否包裹为完整 HTML 页面
    rawMarkdown: false,       // 是否返回原始 Markdown
    title: "Preview",         // 页面标题（fullPage 模式）
    includeTOC: false,        // 是否包含目录
    includeLineNumbers: false,// 是否包含行号标记
    minify: false             // 是否压缩输出
});
```

**编辑器操作**：
```javascript
editor.cm;                     // CodeMirror 实例
editor.setCursor(line, ch);    // 设置光标
editor.getSelection();         // 获取选中文本
editor.replaceSelection(text); // 替换选中文本
```

**预览操作**：
```javascript
editor.previewCodeHighlight(); // 刷新代码高亮
editor.katexRender();          // 渲染 KaTeX
editor.initECharts();          // 初始化 ECharts
editor.initTabs();             // 初始化 Tabs
editor.initColumns();          // 初始化 Columns
editor.initPages();            // 初始化纸张页面
```

**工具栏**：
```javascript
editor.showToolbar();          // 显示工具栏
editor.hideToolbar();          // 隐藏工具栏
editor.setToolbarAutoFixed(true); // 设置工具栏固定
```

**全屏和预览**：
```javascript
editor.fullscreen();           // 全屏
editor.unfullscreen();         // 退出全屏
editor.previewing();            // 预览模式
editor.previewed();             // 退出预览
editor.watch();                 // 开启实时预览
editor.unwatch();               // 关闭实时预览
```

**配置和事件**：
```javascript
editor.set(key, value);        // 设置配置
editor.config(key, value);     // 同 set
editor.on(event, callback);    // 绑定事件
editor.off(event);             // 解绑事件
```

**草稿管理**：
```javascript
editor.saveDraft();            // 保存草稿
editor.clearDraft();           // 清除草稿
```

### 静态方法

```javascript
editormd.markdownToHTML(id, options); // 渲染 Markdown 为 HTML
editormd.$;                          // jQuery/Zepto 对象
editormd.marked;                     // marked 解析器
editormd.defaults;                   // 全局默认配置
```

### 事件系统

```javascript
editor.on("onchange", function() {
    console.log("内容已变化");
});

editor.on("onfullscreen", function() {
    console.log("进入全屏");
});
```

**完整事件列表**：
- `onload` - 加载完成
- `onchange` - 内容变更
- `onresize` - 尺寸变化
- `onfullscreen` / `onfullscreenExit` - 全屏/退出
- `onwatch` / `onunwatch` - 开启/关闭预览
- `onpreviewing` / `onpreviewed` - 预览前/后
- `ontablechange` - 表格变化
- `onimagechange` - 图片尺寸变化
- `onkeydown` / `onkeyup` - 键盘事件
- `onpaste` / `ondrop` - 粘贴/拖放

---

## 💡 最佳实践

### 1. 性能优化

**大型文档**：
- 使用 `delay: 500` 增加解析延迟
- 禁用不需要的功能（如 `flowChart: false`）
- 使用 `codeFold: true` 折叠代码块

**图片优化**：
- 使用 CDN 加载图片
- 设置合理的图片尺寸
- 避免大量高清图片

### 2. 安全性

**XSS 防护**：
```javascript
htmlDecode: "style,script,iframe|on*"
```

**上传安全**：
- 使用白名单验证文件格式
- 限制文件大小
- 使用 HTTPS 上传

### 3. 嵌套语法

**推荐做法**：
```markdown
[[page:A4]]
[[tabs]]
[[tab:标签1]]
内容...
[[/tab]]
[[tab:标签2]]
[[columns:2]]
左栏内容...
右栏内容...
[[/columns]]
[[/tab]]
[[/tabs]]
[[/page]]
```

**注意事项**：
- 嵌套深度不超过 20 层
- 确保标签正确闭合
- 避免在代码块内使用嵌套语法

### 4. 打印优化

**CSS 打印样式**：
```css
@media print {
    .editormd-page-block {
        page-break-after: always;
    }
}
```

---

## ❓ 常见问题

### Q: 如何禁用实时预览？

```javascript
editormd("editor", {
    watch: false,
    previewOnly: true
});
```

### Q: 如何自定义工具栏？

```javascript
editormd("editor", {
    toolbarIcons: function() {
        return [
            "undo", "redo", "|",
            "bold", "italic", "|",
            "h1", "h2", "h3", "|",
            "link", "image", "|",
            "watch", "preview", "fullscreen"
        ];
    }
});
```

### Q: 如何添加自定义快捷键？

```javascript
editor.addKeyMap({
    "Ctrl-Shift-S": function() {
        // 自定义操作
        console.log("保存");
    }
});
```

### Q: 如何获取渲染后的 HTML？

```javascript
// 方法1：实时获取
var html = editor.getPreviewedHTML();

// 方法2：保存到 textarea
editormd("editor", {
    saveHTMLToTextarea: true
});
var html = editor.getTextareaSavedHTML();
```

### Q: 如何处理图片上传？

```javascript
editormd("editor", {
    imageUpload: true,
    imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
    imageUploadURL: "/upload",
    crossDomainUpload: false
});
```

### Q: 如何在页面内使用 Tabs 和 Columns？

```markdown
[[page:A4]]
[[tabs]]
[[tab:标签页]]
[[columns:2]]
左栏内容
右栏内容
[[/columns]]
[[/tab]]
[[/tabs]]
[[/page]]
```

### Q: 如何添加拼音标注？

```markdown
{汉字 | 拼音}
{中国 | zhōng guó}
```

使用工具栏"拼"按钮或快捷键快速插入。

### Q: 如何创建纸张页面？

```markdown
[[page:A4 header="标题" footer="第 {page} 页"]]
内容...
[[/page]]
```

支持 A0-A8、AN、LETTER、LEGAL 等纸张规格。

---

## 📚 更多资源

- [完整示例列表](examples/index.html)
- [拼音参照表](examples/pinyin-reference.html)
- [纸张页面示例](examples/page-syntax.html)
- [文件上传示例](examples/file-upload.html)
- [视频上传示例](examples/video-upload.html)
- [事件系统演示](examples/event-handlers.html)
- [API 文档](README.md)
- [修复日志](FIX_SUMMARY.md)

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**最后更新**: 2026-06-10
**版本**: v1.12.0
