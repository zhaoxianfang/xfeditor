## xfEditor 使用帮助

开源在线 Markdown 编辑器 v1.12.0，基于 [Editor.md](https://github.com/zhaoxianfang/xfeditor) 深度改进，支持标准 Markdown 及丰富的扩展语法。

---

### 编辑器界面说明

| 区域 | 说明 |
|------|------|
| **工具栏** | 顶部图标按钮，提供常用编辑操作的快捷入口 |
| **编辑区** | 左侧 CodeMirror 编辑器，支持语法高亮和行号显示 |
| **预览区** | 右侧实时预览面板，所见即所得的渲染效果 |
| **状态栏** | 底部信息栏，显示行号、列号、字数统计等 |

---

### 核心功能速览

#### 基础 Markdown 语法

| 语法 | 效果 | 快捷键 |
|------|------|--------|
| `**粗体**` | **粗体** | `Ctrl+B` |
| `*斜体*` | *斜体* | `Ctrl+I` |
| `~~删除线~~` | ~~删除线~~ | `Ctrl+Shift+S` |
| `` `行内代码` `` | `行内代码` | `Ctrl+K` |
| `[链接](url)` | 超链接 | `Ctrl+L` |
| `![图片](url)` | 图片 | `Ctrl+Shift+I` |

#### 标题

| 语法 | 效果 | 快捷键 |
|------|------|--------|
| `# H1` | 一级标题 | `Ctrl+1` |
| `## H2` | 二级标题 | `Ctrl+2` |
| `### H3` | 三级标题 | `Ctrl+3` |
| `#### H4` | 四级标题 | `Ctrl+4` |
| `##### H5` | 五级标题 | `Ctrl+5` |
| `###### H6` | 六级标题 | `Ctrl+6` |

#### 列表

| 语法 | 说明 | 快捷键 |
|------|------|--------|
| `- 项目` 或 `* 项目` | 无序列表 | `Ctrl+U` |
| `1. 项目` | 有序列表 | `Ctrl+Shift+O` |
| `- [x] 完成` | 任务列表 | — |

---

### v1.12.0 新增扩展语法

#### ⬆️ 上标与下标

| 语法 | 效果 | 说明 |
|------|------|------|
| `x^2^` | x² | 上标，数学公式常用 |
| `H^^2^^O` | H₂O | 下标，化学式专用 |
| `X<<2>^<3>>` | X₂³ | 组合上下标，同时显示下标和上标 ⭐v1.11 |
| `^14^^6C` | ¹⁴₆C | 同位素：上标+下标组合 |

#### 🔤 字体大小

| 语法 | 效果 | 说明 |
|------|------|------|
| `!8 小字!` | 8px 文字 | 最小字体 |
| `!20 标题!` | 20px 文字 | 大号字体 |
| `!48 超大标题!` | 48px 文字 | 超大标题 |
| 支持范围：**8px ~ 200px** | | |

#### 📌 脚注功能

```markdown
这是一段带脚注的文字[^note1]。

[^note1]: 这是脚注的详细说明内容。
```

- 引用格式：`[^标识名]`
- 定义格式：`[^标识名]: 脚注内容`
- 文末自动汇总所有脚注

#### 🧮 KaTeX 公式

| 语法 | 效果 | 快捷键 |
|------|------|--------|
| `$E=mc^2$` | 行内公式 | — |
| `$$公式$$` | 块级公式 | `Ctrl+Shift+K` |

支持的公式类型：代数、微积分、矩阵、集合、三角函数、希腊字母等 100+ 种

#### 📊 ECharts 图表

````markdown
```echarts
{
  "xAxis": { "data": ["A", "B", "C"] },
  "yAxis": {},
  "series": [{ "type": "bar", "data": [5, 20, 36] }]
}
```
````

支持：柱状图、折线图、饼图、雷达图、漏斗图等多种图表类型

#### 🏷️ 拼音标注

`{你好 | nǐ hǎo}` — 在文字上方显示拼音

`{汉字 | hàn zì}` — 支持多音字标注

#### 📐 多列排版

```markdown
[[columns:2]]
左侧内容...
[[/columns]]
```

支持 2~4 列，报纸式多栏布局

#### 📑 Tabs 标签页

```markdown
[[tabs]]
[[tab:标签1]]
标签1的内容...
[[/tab]]
[[tab:标签2]]
标签2的内容...
[[/tab]]
[[/tabs]]
```

支持嵌套代码块、表格、图表等

#### 📄 纸张页面

```markdown
[[page:A4 header="文档标题" footer="第 {page} 页 / 共 {total} 页"]]
页面内容...
[[/page]]
```

支持：A0~A8, AN, LETTER, LEGAL 多种纸张规格

#### 📝 字帖 Copybook

- `[[tian]]汉字[[/tian]]` — 田字格
- `[[mi]]汉字[[/mi]]` — 米字格
- `[[pinyin]]nǐ hǎo[[/pinyin]]` — 拼音格

#### 💬 悬浮提示 Tooltip

| 语法 | 说明 |
|------|------|
| `[文本](tooltip:提示内容)` | 鼠标悬停显示文本提示 |
| `![图片](url "tooltip:图片说明")` | 图片的悬浮说明 |
| `[链接](tooltip:image:图片url)` | 悬停显示图片 |
| `[链接](tooltip:iframe:页面url)` | 悬停显示嵌入式页面 |
| `[链接](tooltip:html:Base64编码HTML)` | ⭐v1.12 新增：悬停显示自定义 HTML 卡片 |

#### 🖼️ 图片尺寸编辑

- `![alt](url)<宽度,高度>` — 指定图片尺寸
- 预览区拖拽图片边角即时调整大小
- Shift 键等比缩放
- ⭐v1.12 修复：精准追踪图片出现次数，拖拽第 N 个实例准确定位

#### 📜 核心功能

- 支持 Markdown 扩展语法（GFM 表格、任务列表、围栏代码块、脚注等）
- 实时 HTML 预览（支持滚动）
- ToC 目录导航
- KaTeX 数学公式渲染
- 流程图 / 时序图支持
- ECharts 图表支持
- 标签页 / 多栏布局语法
- 图片拖拽缩放与编辑
- 表格行/列编辑（插入、删除、上下移动）
- 一键复制 HTML

---

### 完整键盘快捷键

| 快捷键 (Windows/Linux) | 快捷键 (Mac) | 说明 |
|:-----------------------|:-------------|:-----|
| `F9` | `F9` | 切换实时预览 |
| `F10` | `F10` | 全屏 HTML 预览（按 Shift+ESC 退出） |
| `F11` | `F11` | 切换全屏状态（按 ESC 退出） |
| `Ctrl+1~6` | `Cmd+1~6` | 插入标题 1~6 |
| `Ctrl+A` | `Cmd+A` | 全选 |
| `Ctrl+B` | `Cmd+B` | 插入粗体 |
| `Ctrl+D` | `Cmd+D` | 插入日期时间 |
| `Ctrl+F` | `Cmd+F` | 查找/搜索 |
| `Ctrl+G` | `Cmd+G` | 下一个搜索结果 |
| `Ctrl+H` | `Cmd+H` | 插入水平线 |
| `Ctrl+I` | `Cmd+I` | 插入斜体 |
| `Ctrl+K` | `Cmd+K` | 插入行内代码 |
| `Ctrl+L` | `Cmd+L` | 插入链接 |
| `Ctrl+U` | `Cmd+U` | 插入无序列表 |
| `Ctrl+Q` | `Ctrl+Q` | 代码折叠切换 |
| `Ctrl+Z` | `Cmd+Z` | 撤销 |
| `Ctrl+Y` | `Cmd+Y` | 重做 |
| `Ctrl+Shift+A` | `Cmd+Shift+A` | 插入 @ 链接 |
| `Ctrl+Shift+C` | `Cmd+Shift+C` | 插入行内代码 |
| `Ctrl+Shift+F` | `Cmd+Option+F` | 替换 |
| `Ctrl+Shift+G` | `Shift+Cmd+G` | 上一个搜索结果 |
| `Ctrl+Shift+H` | `Cmd+Shift+H` | HTML 实体字符对话框 |
| `Ctrl+Shift+I` | `Cmd+Shift+I` | 插入图片 |
| `Ctrl+Shift+K` | `Cmd+Shift+K` | 插入 KaTeX 公式 |
| `Ctrl+Shift+L` | `Cmd+Shift+L` | 插入链接对话框 |
| `Ctrl+Shift+O` | `Cmd+Shift+O` | 插入有序列表 |
| `Ctrl+Shift+P` | `Cmd+Shift+P` | 插入预格式化文本 |
| `Ctrl+Shift+Q` | `Cmd+Shift+Q` | 插入引用 |
| `Ctrl+Shift+R` | `Shift+Cmd+Option+F` | 全部替换 |
| `Ctrl+Shift+S` | `Cmd+Shift+S` | 插入删除线 |
| `Ctrl+Shift+T` | `Cmd+Shift+T` | 插入表格对话框 |
| `Ctrl+Shift+U` | `Cmd+Shift+U` | 转大写 |
| `Alt+L` | `Alt+L` | 转小写 |
| `Shift+Alt+C` | `Shift+Alt+C` | 插入代码块 ``` |
| `Shift+Alt+H` | `Shift+Alt+H` | 打开使用帮助 |
| `Shift+Alt+P` | `Shift+Alt+P` | 插入分页符 |
| `Shift+Alt+U` | `Shift+Alt+U` | 首字母大写 |
| `Ctrl+Shift+Alt+C` | `Cmd+Shift+Alt+C` | 代码块对话框 |
| `Ctrl+Shift+Alt+I` | `Cmd+Shift+Alt+I` | 图片对话框 |
| `Ctrl+Alt+G` | `Cmd+Alt+G` | 跳转到指定行 |

---

### 主要配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `width` | String | `"100%"` | 编辑器宽度 |
| `height` | Number | `720` | 编辑器高度 (px) |
| `path` | String | `"./lib/"` | 资源库路径 |
| `theme` | String | `"default"` | 编辑器主题 |
| `previewTheme` | String | `"default"` | 预览区主题 |
| `codeFold` | Boolean | `false` | 代码折叠 |
| `searchReplace` | Boolean | `true` | 搜索替换 |
| `toc` | Boolean | `true` | 目录生成 |
| `emoji` | Boolean | `false` | Emoji 表情 |
| `taskList` | Boolean | `false` | 任务列表 |
| `tex` | Boolean | `false` | KaTeX 公式 |
| `flowChart` | Boolean | `false` | 流程图 |
| `sequenceDiagram` | Boolean | `false` | 时序图 |
| `imageUpload` | Boolean | `false` | 图片上传 |
| `fileUpload` | Boolean | `false` | 文件上传 |
| `videoUpload` | Boolean | `false` | 视频上传 |
| `atLink` | Boolean | `true` | @ 链接 |
| `tabs` | Boolean | `true` | Tabs 组件 |
| `columns` | Boolean | `true` | 多列排版 |
| `tooltip` | Boolean | `true` | 悬浮提示 |
| `copybook` | Boolean | `true` | 字帖功能 |
| `pageBlock` | Boolean | `true` | 纸张页面 |
| `pageBreak` | Boolean | `true` | 分页符 |
| `footnote` | Boolean | `true` | 脚注功能 |
| `superscript` | Boolean | `true` | 上标 |
| `subscript` | Boolean | `true` | 下标 |
| `fontSize` | Boolean | `true` | 字体大小 |
| `imageResize` | Boolean | `true` | 图片尺寸编辑 |
| `watch` | Boolean | `true` | 实时预览 |
| `htmlDecode` | Boolean/String | `false` | HTML标签解析 |

---

### 事件回调列表

| 事件 | 触发时机 |
|------|----------|
| `onload` | 编辑器加载完成 |
| `onchange` | 编辑器内容发生变化 |
| `onfullscreen` | 进入全屏模式 |
| `onfullscreenExit` | 退出全屏模式 |
| `onresize` | 编辑器窗口尺寸变化 |
| `onpreviewing` | 预览区开始渲染前 |
| `onpreviewed` | 预览区渲染完成后 |
| `onwatch` | 开启实时预览 |
| `onunwatch` | 关闭实时预览 |
| `onkeydown` | 键盘按键按下 |
| `onkeyup` | 键盘按键释放 |
| `onmouseup` | 鼠标按键释放 |
| `onmousedown` | 鼠标按键按下 |
| `onpaste` | 粘贴操作 |
| `ondrop` | 拖拽放置 |
| `oncopy` | 复制操作 |
| `oncut` | 剪切操作 |
| `onfocus` | 编辑器获得焦点 |
| `onblur` | 编辑器失去焦点 |
| `oncursoractivity` | 光标位置变化 |
| `onEditorLoad` | 编辑器 DOM 加载完成 |
| `onPageLoad` | 页面 DOM 就绪 |
| `onPageAllLoad` | 所有资源加载完成 |
| `onAllAsyncLoad` | 所有异步依赖加载完成 |

---

### API 常用方法

| 方法 | 说明 |
|------|------|
| `getMarkdown()` | 获取 Markdown 源码 |
| `setMarkdown(md)` | 设置 Markdown 源码 |
| `getHTML()` | 获取预览区 HTML |
| `watch()` | 开启实时预览 |
| `unwatch()` | 关闭实时预览 |
| `previewing()` | 强制刷新预览 |
| `fullscreen()` | 进入全屏 |
| `fullscreenExit()` | 退出全屏 |
| `show()` | 显示编辑器 |
| `hide()` | 隐藏编辑器 |
| `resize()` | 调整尺寸 |
| `clear()` | 清空内容 |
| `insertValue(val)` | 在光标处插入文本 |
| `getCursor()` | 获取光标位置 |
| `setCursor(line, ch)` | 设置光标位置 |
| `getSelection()` | 获取选中文本 |
| `setSelection(start, end)` | 设置选区 |
| `replaceSelection(text)` | 替换选中文本 |
| `getState()` | 获取编辑器状态 |
| `focus()` | 编辑器获得焦点 |
| `getLine(lineNum)` | 获取指定行文本 |
| `getLineCount()` | 获取总行数 |

---

### 流程图参考

- [Flowchart.js 官方文档](http://flowchart.js.org/)
- [Flowchart.js GitHub](https://github.com/adrai/flowchart.js)

### 时序图参考

- [js-sequence-diagrams](http://bramp.github.io/js-sequence-diagrams/)

### KaTeX 公式参考

- [KaTeX 支持的公式](https://katex.org/docs/supported.html)
- [KaTeX 官方文档](https://katex.org/)

### Markdown 语法参考

- [Markdown 语法说明（中文）](http://www.markdown.cn/)
- [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/)
- [Markdown Guide](https://www.markdownguide.org/)

---

*xfEditor — 开源在线 Markdown 编辑器 | 基于 Editor.md 改编 | MIT 许可证*
