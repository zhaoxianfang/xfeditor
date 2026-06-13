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
| `syncScrolling` | `true` | 同步滚动 ⭐v1.12加强：自适应锁定时长、惯性检测与平滑缓动、元素类型感知留白 |
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

**文本提示**：
```markdown
[悬停查看](tooltip:这是提示内容)
```

**图片提示**：
```markdown
![图片](url){"tooltip": "图片说明"}
```

**图片型悬浮提示**（鼠标悬停时显示图片）：
```markdown
[查看 Logo](tooltip:image:../images/logo.png)
```

**iframe 型悬浮提示**（嵌入外部页面）：
```markdown
[查看页面](tooltip:iframe:./demo.html)
```

**复杂 HTML 悬浮提示** ⭐v1.12 增强：

**HTML 选择器语法** ⭐v1.12 新增（仅支持CSS选择器格式）：
```markdown
[查看隐藏内容](tooltip:html:"#hidden-content")        # 通过ID选择器引用页面元素
[查看样式卡片](tooltip:html:".tooltip-card")          # 通过类选择器引用元素
[查看属性元素](tooltip:html:"[data-tooltip-content]") # 通过属性选择器引用元素
[查看无引号选择器](tooltip:html:.test-class)         # 无引号的类选择器格式
```

**语法规则**：
1. **带引号格式**：`tooltip:html:"选择器"` - 选择器用双引号包裹
2. **无引号格式**：`tooltip:html:.class-name` - 仅适用于简单的类选择器
3. **支持的选择器类型**：
   - ID选择器：`#element-id`
   - 类选择器：`.class-name`
   - 属性选择器：`[attribute]`、`[attribute=value]`
   - 组合选择器：`.class1.class2`、`#id .class`

**特性**：
1. **自动移除隐藏属性**：自动移除目标元素的display:none、visibility:hidden、opacity:0等隐藏属性
2. **动态DOM加载**：实时查找页面中的DOM元素并克隆到悬浮框中
3. **错误处理**：未找到元素时显示友好的错误提示信息
4. **样式保留**：保留原始元素的HTML结构和内联样式
5. **安全隔离**：元素只在悬浮框中显示，不直接显示在网页中

**使用示例**：
```html
<!-- 在页面任意位置定义隐藏元素 -->
<div id="hidden-content" style="display:none;">
  <h3>隐藏的HTML内容</h3>
  <p>这个元素被隐藏，但可以通过HTML工具提示显示。</p>
</div>

<!-- 在Markdown中引用 -->
[查看隐藏内容](tooltip:html:"#hidden-content")
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
editor.getHTML();              // 获取 HTML
editor.getPreviewedHTML();     // 获取预览区 HTML
editor.getTextareaSavedHTML(); // 获取保存的 HTML
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
- `onscroll` / `onpreviewscroll` - 滚动
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
