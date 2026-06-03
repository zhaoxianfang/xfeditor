## 更新日志

### v1.7.0

##### v1.7.0 (重大更新)

全面优化、改进和增强版：

- **重构块级语法架构，根治 fenced code block 冲突**：
    - 引入 `preprocessMarkdownBlocks` 预处理机制，在 `marked()` 解析前提取自定义块级语法；
    - Tabs 语法从 ` ```tabs ` 改为 `[[tabs]]...[[/tabs]]`，彻底避免内部代码块被误判为结束标签；
    - 多列排版语法从 ` ```columns:N ` 改为 `[[columns:N]]...[[/columns]]`；
    - 文本对齐语法从 `->text<-` / `->text->` / `<-text->` 改为 `[[align:center|left|right]]...[[/align]]`；
    - 支持 tabs / columns / align 块级嵌套和递归渲染，内部可自由使用代码块、表格、图表等；

- **图片尺寸语法升级**：
    - 新语法 `![alt](url)<W,H>` 替代旧版 `![alt](url =WxH)`，更加直观自然；
    - 预览区拖拽调整尺寸后，左侧编辑器对应 `<W,H>` 值自动同步更新；
    - 预处理阶段自动兼容转换，现有渲染器无需改动；

- **新增浏览器草稿暂存功能**：
    - 配置 `draftAutoSave: true` 开启自动暂存，防止误刷新/跳转丢失内容；
    - 支持配置 `draftInterval`（秒）控制自动暂存间隔；
    - 页面重新加载时自动检测并弹出恢复对话框，列出历史版本；
    - 新增实例方法 `saveDraft()`、`clearDraft()`、`showDraftRecovery()`；
    - 新增 `getWordCount()`、`getCursorPosition()`、`exportFile()` 等实用接口；

- **ECharts 图表增强**：
    - `initECharts()` 增加容器可见性检测，避免不可见容器初始化失败；
    - 智能坐标轴注入，饼图/漏斗图/仪表盘等无坐标轴类型不再注入空坐标轴；
    - 命名空间 resize 事件，防止重复绑定和内存泄漏；
    - `markdownToHTML()` 静态方法支持异步自动加载 `echarts.min.js`；

- **表格编辑 UI 增强**：
    - 表格控制按钮悬停高亮效果优化；
    - 单元格悬停增加 `box-shadow` 高亮边框；
    - 鼠标悬停表格即自动显示控制条；

- **Tabs / Columns / Align 预览样式增强**：
    - Tab 导航使用 flex 布局，`li.active` 带底部蓝色边框高亮；
    - 多栏布局首元素 `margin-top: 0` 优化；

- **完善文档和示例**：
    - 全部示例文件更新为新块级语法；
    - 补充 tabs 内嵌套图表、代码块、表格的复杂示例；

- **嵌套语法失效修复与 Unicode 对齐（第四轮修复）**：
    - 修复 tabs / columns / align 块级容器内部嵌套拼音、列表、表格等语法不生效的问题；
    - 新增统一的 `postProcessInline()` 方法，在 `heading`、`paragraph`、`listitem`、`tablecell` 渲染器中集中处理行内语法；
    - 新增 Unicode 特殊字符对齐语法：`⁑⁑内容⁑⁑`（居中）、`⁑⁖内容⁖⁑`（左对齐）、`⁑⠕内容⠕⁑`（右对齐）、`⁑⁛内容⁛⁑`（两端对齐）；
    - 旧版 `[[align]]` 块级语法和 `->text<-` 行内语法继续兼容；

- **全面加强图片上传功能**：
    - 图片对话框新增剪贴板粘贴上传支持，自动提取图片 blob 并触发上传；
    - 优化上传错误处理，服务端返回非 JSON 时给出明确提示；
    - 图片对话框确认时生成 `<W,H>` 新语法，与系统保持一致；

- **新增文件上传功能**：
    - 新增 `fileUpload`、`fileFormats`、`fileUploadURL` 配置项；
    - 新增 `file-dialog` 插件，支持 URL 插入和本地上传两种模式；
    - 工具栏新增 `file` 图标（`fa-paperclip`），一键打开文件上传对话框；
    - 上传成功后自动在光标处插入 `[文件名](文件地址)` Markdown 链接；

- **新增接口文档与上传接口规范**：
    - 新增 `examples/api-reference.html`，枚举所有配置项、实例方法、事件回调、静态方法及使用示例；
    - 文档中详细给出图片上传和文件上传的请求参数、成功/失败返回示例、跨域上传说明；

- **草稿功能全面优化（第五轮修复）**：
    - 修复草稿恢复弹窗 CSS 冲突：删除重复的第二套 `.editormd-draft-dialog` 样式，根治标题、内容、按钮水平并排的布局错乱；
    - 修复草稿恢复弹窗在可编辑模式下不显示的问题：显式设置 `display:block` 并添加遮罩层，支持 ESC 和点击遮罩关闭；
    - 新增 `draftMaxDays` 配置项（默认 30 天），支持控制草稿最长保留期限；
    - `saveDraft()` 新增超期草稿自动清理逻辑，每次保存前过滤掉过期记录；
    - `saveDraft()` 新增内容去重机制：若已存在相同内容的草稿，自动删除旧版本只保留最新；
    - `saveDraft()` 新增同会话去重优化：同一编辑会话（10 分钟内）定时暂存只保留最新一条，避免短间隔配置下堆积大量版本；
    - `showDraftRecovery()` 显示前自动清理过期草稿并同步更新 localStorage；
    - 文件上传对话框增强错误处理：JSON.parse 加 try-catch，上传成功后自动回填文件名；
    - 补充语言包中 `dialog.file.uploadError` 默认提示字段；

- **工具栏对齐按钮改为 Unicode 行内对齐（第六轮修复）**：
    - `align-left`、`align-center`、`align-right` 工具栏按钮不再插入 `[[align]]` 块级标签，改为直接插入 `⁑⁖...⁖⁑`、`⁑⁑...⁑⁑`、`⁑⠕...⠕⁑` Unicode 行内标记；
    - 新增 `align-justify`（两端对齐）工具栏按钮，插入 `⁑⁛...⁛⁑` 标记；
    - 旧版 `[[align]]` 块级标签和 `->text<-` 语法继续兼容；

- **引用链接对话框改进（第六轮修复）**：
    - 引用链接确认时直接在光标处插入行内链接 `[text](url "title")`，不再生成 `[name][id]` + 文档末尾定义的分割式引用链接；
    - 编辑区可直接查看和编辑链接地址与标题，提升可读性和可维护性；

- **拼音工具显示与 Insert 下拉工具栏（第七轮修复）**：
    - `toolbarModes.full` 中新增 `pinyin` 按钮，默认工具栏可直接使用拼音标注功能；
    - 新增 `insert` 下拉工具栏，将 code、preformatted-text、code-block、table、datetime、emoji、html-entities、pagebreak 统一归入，减少工具栏水平占用；
    - `toolbarIconsClass` 和 `lang.toolbar` 补充 `insert` 对应的图标 `fa-plus` 和中文名称；

- **图片与文件上传示例完善（第七轮修复）**：
    - `all-features.html` 中 `imageUpload` 和 `fileUpload` 均设为 `true`，并配置 `imageUploadURL` / `fileUploadURL` 指向示例 PHP 接口，确保本地上传按钮正常显示；
    - 修复图片上传弹窗新增尺寸输入框后内容溢出导致确认/取消按钮显示在弹窗外的问题，弹窗高度从 254 调整为 300；

- **新增工具栏介绍页面与文档更新（第七轮修复）**：
    - 新增 `examples/toolbar-reference.html`，以表格形式枚举所有工具栏按钮的图标、功能描述与用法；
    - `examples/index.html` 添加工具栏介绍页面和文件上传示例入口；
    - 全面更新 `README.md` 和 `CHANGE.md`，补充 Insert 下拉菜单、拼音工具显示等说明；

### v1.6.0

##### v1.6.0 (重大更新)

全面优化、改进和增强版：

- **全面加强 XSS 安全防护**：
    - 新增白名单机制，过滤危险 HTML 标签（script、iframe、object、embed 等）；
    - 过滤危险事件属性（onerror、onload、onclick 等）；
    - 过滤非法 URL 协议（javascript:、vbscript:、data:text/html 等）；
    - 过滤 CSS 表达式和 behavior（IE 特定攻击向量）；

- **新增拼音标注功能**：
    - 支持 `{文本 | pinyin}` 语法，在预览区显示带拼音的文本；
    - 使用 HTML5 `<ruby>`、`<rb>`、`<rt>` 标签实现；
    - 新增 `pinyin` 配置项；

- **新增文本对齐语法**：
    - `->文本<-` 居中对齐；
    - `->文本->` 右对齐；
    - `<-文本->` 左对齐；
    - 新增 `textAlign` 配置项；

- **新增图片宽高尺寸编辑**：
    - 支持 Markdown 语法 `![alt](url=300x200)`；
    - 预览区支持拖拽调整图片尺寸；
    - 预览区支持双击输入精确尺寸；
    - 图片对话框新增尺寸输入框；
    - 新增 `imageResize` 配置项；

- **新增表格行列编辑**：
    - 预览区表格支持点击单元格显示操作控件；
    - 支持插入行（上方/下方）、插入列（左侧/右侧）；
    - 支持删除行、删除列；
    - 操作后自动同步修改 Markdown 源码；
    - 新增 `tableEdit` 配置项；

- **新增工具栏下拉分组功能**：
    - 支持 `{"名称": ["item1", "item2", ...]}` 语法配置下拉工具栏；
    - 默认将 H1-H6 合并为一个下拉菜单；
    - 默认将对齐按钮合并为一个下拉菜单；
    - 减少工具栏水平占用空间；
    - 新增 `toolbarDropdown` 配置项；

- **全面加强事件处理机制**：
    - 新增 `onbeforesave`、`onaftersave` 事件；
    - 新增 `oninsert`、`ontablechange`、`onimagechange` 事件；
    - 新增 `onkeydown`、`onkeyup` 事件；
    - 新增 `onmouseup`、`onmousedown` 事件；
    - 新增 `onpaste`、`ondrop` 事件；
    - 新增 `oncopy`、`oncut` 事件；
    - 新增 `onfocus`、`onblur` 事件；
    - 新增 `oncursoractivity` 事件；

- **其他改进**：
    - 完善 HTML 标签识别和解析；
    - 优化编辑器聚焦状态样式；
    - 更新并美化文档；
    - 全面修复潜在错误和漏洞；

### v1.7.0

##### v1.7.0 (重大更新)

全面新增图表、标签页、多栏排版和悬浮提示等功能：

- **新增 Apache ECharts 图表库支持**：
    - 支持柱状图、折线图、饼图、雷达图、漏斗图等常见图表类型；
    - 使用 ` ```echarts ` 代码块语法，内部编写 JSON 配置；
    - 预览区自动调用 `echarts.init()` 渲染图表；
    - 图表支持响应式窗口缩放；
    - 工具栏新增图表下拉分组，一键插入各类图表模板；
    - 新增 `echarts` 配置项；

- **新增 Tabs 标签页功能**：
    - 支持 ` ```tabs ` 代码块语法；
    - 内部使用 `[[tab:标题]]...[[/tab]]` 定义标签页；
    - 预览区渲染为可交互的标签页组件；
    - 支持点击切换标签，带有平滑过渡效果；
    - 每个标签页内容支持完整的 Markdown 渲染；
    - 工具栏新增 `tabs` 按钮，一键插入标签页模板；
    - 新增 `tabs` 配置项；

- **新增多列排版功能**：
    - 支持 ` ```columns:N ` 代码块语法，N 为列数（如 2、3、4）；
    - 预览区使用 CSS `column-count` 实现报纸式多栏排版；
    - 支持完整的 Markdown 内容渲染；
    - 工具栏新增 `columns` 按钮，默认插入 3 栏模板；
    - 新增 `columns` 配置项；

- **新增悬浮提示（Tooltip/Popover）功能**：
    - 支持链接悬浮提示：`[文本](tooltip:提示内容)`；
    - 支持图片悬浮提示：`![alt](url "tooltip:提示内容")`；
    - 预览区鼠标悬停或聚焦时显示精美黑色提示框；
    - 支持点击触发（移动端友好）；
    - 工具栏新增 `tooltip` 按钮；
    - 新增 `tooltip` 配置项；

- **全面加强图片编辑功能**：
    - 拖拽调整尺寸时按住 Shift 键可保持原始宽高比例；
    - 优化拖拽手柄交互体验；

- **全面加强数学公式编辑**：
    - 预览区公式支持双击定位到 Markdown 源码对应位置；
    - 公式元素显示 "双击编辑公式" 提示；

- **全面加强下拉工具栏**：
    - 新增图表下拉分组，整合 6 种常用图表；
    - 优化下拉菜单展开/收起交互；

- **全面加强系统稳定性与性能**：
    - 修复 `save()` 方法中 `rendererOptions` 缺少 `echarts/tabs/columns/tooltip` 配置项的 Bug，确保实时预览模式下 v1.7.0 新功能正常生效；
    - 修复 Tooltip 重复创建 DOM 导致的内存泄漏问题，改为事件委托模式和全局单一弹窗容器；
    - 修复 ECharts 图表 `window.resize` 事件重复绑定导致的性能问题，改为命名空间统一管理和实例缓存；
    - 修复公式双击定位源码时特殊字符导致搜索失败的 Bug，改用正则转义匹配；
    - 修复图片拖拽调整尺寸后 wrapper 容器尺寸未同步的 Bug；
    - 改进 Tabs 工具栏分割逻辑，兼容多种换行格式，过滤空内容并增加默认回退；

- **全面加强系统稳定性与性能（第二轮修复）**：
    - 修复 `loadedDisplay()` 中 `save()` 在 `preview.show()` 之前执行导致预览区不可见时 ECharts 初始化失败的 Bug；
    - 修复 `initECharts()` 未检测容器可见性和未智能处理坐标轴配置的问题，饼图/漏斗图等无坐标轴图表现在可正确渲染；
    - 修复 `markdownToHTML()` 中 ECharts 不自动加载 `echarts.min.js` 且匿名 resize 事件重复绑定导致内存泄漏的 Bug；
    - 修复 `markdownToHTML()` 中 Tabs 重复绑定点击事件的 Bug，增加 `data-initialized` 保护；
    - 修复 `markdownToHTML()` 中 Tooltip 为每个 trigger 重复创建 DOM 导致内存泄漏的 Bug，改为全局单一 popup + 事件委托模式；
    - 修复工具栏下拉菜单中 `fa-caret-down` 箭头因 `.fa { display: block }` 导致换行显示的 Bug；

- **全面扩展实例接口**：
    - 新增 `getWordCount()` 方法，获取 Markdown 字数统计；
    - 新增 `getCursorPosition()` 方法，获取光标所在行号和列号；
    - 新增 `insertValue(value, append)` 方法，在光标处或末尾插入文本；
    - 新增 `clear()` 方法，一键清空编辑器内容；
    - 新增 `exportFile(filename, format)` 方法，支持导出 Markdown 或 HTML 文件；
    - 新增 `getSelection()` 方法，获取当前选中的文本；
    - 新增 `setSelection(start, end)` 方法，设置选区范围；

- **全面完善示例体系**：
    - 新增 `examples/echarts.html` ECharts 图表独立示例；
    - 新增 `examples/tabs.html` Tabs 标签页独立示例；
    - 新增 `examples/columns.html` 多列排版独立示例；
    - 新增 `examples/tooltip.html` 悬浮提示独立示例；
    - 新增 `examples/pinyin.html` 拼音标注独立示例；
    - 新增 `examples/text-align.html` 文本对齐独立示例；
    - 新增 `examples/table-edit.html` 表格编辑独立示例；
    - 新增 `examples/image-resize.html` 图片尺寸编辑独立示例；
    - 更新 `examples/index.html` 全面枚举所有功能特性，新增 v1.7.0 和 v1.6.0 分类导航；
    - 完善 `examples/all-features.html` 资源路径和交互体验；

- **其他改进**：
    - 完善 HTML 标签 XSS 过滤白名单，兼容新组件；
    - 优化表格编辑控件展示逻辑；
    - 新增 `examples/all-features.html` 全部功能综合演示示例；
    - 更新 `examples/full.html` 启用所有 v1.7.0 功能；
    - 更新并美化文档和中文说明；
    - 全面修复潜在错误和漏洞；

### v1.0.x

##### v1.0.0 beta

预览版：基本功能完成；

##### v1.0.0 releases

发布 v1.0.0 正式版。

主要更新：

- 新建分支 `mathjax-version`，但不打算继续对此分支进行开发；

- 移除 MathJax，改用 KaTeX [#2](https://github.com/pandao/editor.md/issues/2)，解析和预览响应速度大幅度提高 [#3](https://github.com/pandao/editor.md/issues/3)；
    - 移除 `mathjax` 配置项；
    - 移除 `mathjaxURL` 属性；
    - 移除 `setMathJaxConfig()` 方法；
    - 移除 `loadMathJax()` 方法；
    - 移除MathJax的所有示例；
    - 新增 `tex` 配置项，表示是否开启支持科学公式 TeX ，基于 KaTeX；
    - 新增 `katexURL` 属性；
    - 新增 `loadKaTeX` 方法；
    - 新增 KaTeX 的示例；
    
- `setCodeEditor()` 方法更名为 `setCodeMirror()`；

- 合并 CodeMirror 使用到的多个 JS 模块文件，大幅减少 HTTP 请求，加快下载速度；
    - 新增合并后的两个模块文件：`./lib/codemirror/modes.min.js`、`./lib/codemirror/addons.min.js` ；
    - `Gulpfile.js` 新增合并 CodeMirror 模块文件的任务方法 `codemirror-mode` 和 `codemirror-addon` ；
    - 另外在使用 Require.js 时，因为 CodeMirror 的严格模块依赖的限制，不能使用上述合并的模块文件，仍然采用动态加载多个模块文件；
    
- 更新 `README.md` 等相关文档和示例；

- 解决 Sea.js 环境下 Raphael.js 无法运行导致不支持流程图和时序图的问题，即必须先加载 Raphael.js ，后加载 Sea.js ；

### v1.1.x

##### v1.1.0

主要更新：

- 设计并更换了 Logo；
- 新增添加图片、链接、锚点链接、代码块、预格式文本等操作弹出对话框层及示例；
- 新增支持图片(跨域)上传；
- 改用 `<textarea>` 来存放 Markdown 源文档；
- 新增支持自定义工具栏；
- 新增支持多语言；
- 新增支持 Zepto.js；
- 新增支持多个 Editor.md 并存和动态加载 Editor.md 及示例；
- 新增支持智能识别和解析 HTML 标签及示例；
- 新增多个外部操作方法接口及示例；
- 修复了一些大大小小的 Bug；

具体更新如下：

- 更换 Logo，建立基础 VI；
    - 创建了全系列 WebFont 字体 `dist/fonts/editormd-logo.*` ；
    - 新增样式类 `editormd-logo` 等；

- 改用 `<textarea>` 来存放 Markdown 源文档；
    - 原先使用 `<script type="text/markdown"></script>` 来存放 Markdown 源文档；
    - 创建 Editor.md 只需要写一个 `<div id="xxxx"></div>` ，如果没有添加 `class="editormd"` 属性会自动添加，另外如果不存在 `<textarea>` 标签，则也会自动添加 `<textarea>` ；

- 新增支持智能识别和解析 HTML 标签，增强了 Markdown 语法的扩展性，几乎无限，例如：插入视频等等；
    - 新增配置项 `htmlDecode` ，表示是否开启 HTML 标签识别和解析，但是为了安全性，默认不开启；
    - 新增识别和解析 HTML 标签的示例；
    
- 新增插入链接、锚点链接、预格式文本和代码块的弹出对话框层；
    - 弹出层改为使用固定定位；
    - 新增动态创建对话框的方法 `createDialog()`；
    - 新增静态属性 `editormd.codeLanguages` ，用于存放代码语言列表；

- 开始支持图片上传；
    - 新增添加图片（上传）弹出对话框层；
    - 支持基于 iframe 的跨域上传，并添加相应的示例（ PHP 版）；
    
- 开始支持自定义工具栏图标及操作处理；
    - 配置项 `toolbarIcons` 类型由数组更改为函数，返回一个图标按钮列表数组；
    - 新增配置项 `toolbarHandlers` 和 `toolbarIconsTexts` ，分别用于自定义按钮操作处理和按钮内容文本；
    - 新增方法 `getToolbarHandles()` ，用于可在外部使用默认的操作方法；
    - 新增成员属性 `activeIcon` ，可获取当前或上次点击的工具栏图标的 jQuery 实例对象；
    
- 新增表单取值、自定义工具栏、图片上传、多个 Editor.md 并存和动态加载 Editor.md 等多个示例；

- 新增插入锚点按钮和操作处理；

- 新增预览 HTML 内容窗口的关闭按钮，之前只能按 ESC 才能退出 HTML 全窗口预览；

- 新增多语言（ l18n ）及动态加载语言包支持；
    - 新增英语 `en` 和繁体中文 `zh-tw` 语言包模块；
    - 修改一些方法的内部实现以支持动态语言加载:
        - `toolbarHandler()` 更为 `setToolbarHandler()` ；
        - `setToolbar()` 方法包含 `setToolbarHandler()` ；
        - 新建 `createInfoDialog()` 方法；
	    - 修改 `showInfoDialog()` 和 `hideInfoDialog()` 方法的内部实现等；

- 修改多次 Bug ，并优化触摸事件，改进对 iPad 的支持；

- 工具栏新增清空按钮和清空方法 `clear()` ，解决工具栏文本会被选中出现蓝底的问题;

- 配置项 `tocStartLevel` 的默认值由 2 改为 1，表示默认从 H1 开始生成 ToC；

- 解决 IE8 下加载出错的问题；
    - 新增两个静态成员属性 `isIE` 和 `isIE8` ，用于判断 IE8；
    - 由于 IE8 不支持 FlowChart 和 SequenceDiagram，默认在 IE8 下不加载这两个组件，无论是否开启；

- 新增 Zepto.js 的支持；
	- 为了兼容 Zepto.js ，某些元素在操作处理上不再使用 `outerWidth()` 、 `outerHeight()` 、`hover()` 、`is()` 等方法；
	- 为了避免修改 flowChart.js 和 sequence-diagram.js 的源码，所以想支持 flowChart 或 sequenceDiagram 得加上这一句： `var jQuery = Zepto;`；

- 新增 `editormd.$name` 属性，修改 `editormd.homePage` 属性的新地址；

- `editormd.markdownToHTML()` 新增方法返回一个 jQuery 实例对象；
    - 该实例对象定义了一个 `getMarkdown()`方法，用于获取 Markdown 源代码；
    - 该实例对象定义了一个 `tocContainer` 成员属性，即 ToC 列表的父层的 jQuery 实例对象；

- 新增只读模式；
    - 新增配置项 `readOnly` ，默认值为 `false` ，即可编辑模式；
    - 其他相关改动；

- 新增方法 `focus()` 、 `setCursor()` 、 `getCursor()` 、`setSelection()` 、`getSelection()` 、 `replaceSelection()` 和 `insertValue()` 方法，并增加对应的示例；

- 新增配置项 `saveHTMLToTextarea` ，用于将解析后的 HTML 保存到 Textarea，以供提交到后台程序；
    - `getHTML()` 方法必须在 `saveHTMLToTextarea == true` 的情况下才能使用；
    - 新增 `getHTML()` 方法的别名 `getTextareaSavedHTML()` 方法；
    - 新增方法 `getPreviewedHTML()` ，用于获取预览窗口的 HTML ；

- 修复了一些大大小小的 Bugs；

##### v1.1.1

- 接受一个 pull 请求，修复了 `getHTML ()` 和 `getPreviewedHTML()` 方法中的 ３ 处错误；

##### v1.1.2

- 修复 Bug [＃10](https://github.com/pandao/editor.md/issues/10)；
- 修复 Bug [＃12](https://github.com/pandao/editor.md/issues/12)；

##### v1.1.3

- 修复 Bug [＃14](https://github.com/pandao/editor.md/issues/14)；
- 修复 Bug [＃15](https://github.com/pandao/editor.md/issues/15)；

##### v1.1.4

- 修复 Bug [＃17](https://github.com/pandao/editor.md/issues/17)；
    - 修改了 `getToolbarHandles()` 和 `setToolbarHandler()` 方法；
- 从 `editormd.scss` 中分离出 `editormd.logo.scss` ，并生成 `editormd.logo.css` ，以便单独使用；
    - 同时修改了 `Gulpfile.js` 的相应任务；
    
##### v1.1.5

- 修复 Bug [＃18](https://github.com/pandao/editor.md/issues/18)；
    - 修改了 `showInfoDialog()` 和 `createInfoDialog()` 方法；
    - 新增 `infoDialogPosition()` 方法；
    
- 修复 Bug [＃20](https://github.com/pandao/editor.md/issues/20)；
    - 修改了引用的处理函数；
    - 插入的 headers 的 `#` 号后面都加上了一个空格；

##### v1.1.6

修复多处 Bug，具体如下：
    
- 修复 Bug [#23](https://github.com/pandao/editor.md/issues/23)，即 Headers 的 id 属性的重复及中文问题；
    - 修改了 `editormd.markedRenderer()` 方法；

- 修复 Bug [#24](https://github.com/pandao/editor.md/issues/24)；
    - 修改了 `setMarkdown()` 、 `clear()` 和 `loadedDisplay()` 方法的内部实现；
    - 新增了 `katexRender()` 、 `flowChartAndSequenceDiagramRender()` 、 `previewCodeHighlight()` 方法；
    
- 修复有些情况下无法保存 Markdown 源文档到 textarea 的问题；
    - 修改了 `setCodeMirror()` 、 `recreateEditor()` 等方法；

- 修改了以上 Bug 及部分相关示例文件；

##### v1.1.7

修复多处 Bug，具体如下：

- 修复 Bug [#25](https://github.com/pandao/editor.md/issues/25)；
    - 修改了 `loadedDisplay()` 方法，将 `settings.onload` 移动了 `CodeMirror.on("change")` 事件注册后再触发；

- 修复 Bug [#26](https://github.com/pandao/editor.md/issues/26)；
    - 修改了 `saveToTextareas()` 方法；
    - 新增 `state.loaded` 和 `state.watching` 两个属性；

- 修改了以上 Bug 相关示例文件；

##### v1.1.8

改进功能，具体如下：

- 改进 [#27](https://github.com/pandao/editor.md/issues/27)；
    - 新增配置项 `matchWordHighlight` ，可选值有： `true, false, "onselected"` ，默认值为 `true` ，即开启自动匹配和标示相同单词；

- 改进 [#28](https://github.com/pandao/editor.md/issues/28)；
    - 将 `jquery.min.js` 、 `font-awesome.min.css` 、 `github-markdown.css` 移除（这是一个疏忽，它们不是动态加载的依赖模块或者不需要的，避免不必要的硬盘空间占用）；

- 修改了所有相关的示例文件；

##### v1.1.9

- 修复无法解析 heading link 的 Bug [#29](https://github.com/pandao/editor.md/issues/29)；

    - 修改了 `editormd.markedRenderer()` 方法的内部实现；
    - 新增了 `editormd.trim()` ，用于清除字符串两边的空格；
    - 修改了所有相关的示例文件和测试用例 `marked-heading-link-test.html` ；
    
- 修改了 `README.md` ，添加了 `Shields.io` 图标；

### v1.2

##### v1.2.0

v1.2.0 主要更新：

- 新增代码折叠、搜索替换、自定义样式主题和自定义快捷键等功能；
- 新增 Emoji 表情、@Link 、GFM Task Lists 支持；
- 新增表格插入、Emoji 表情插入、HTML 实体字符插入、使用帮助等对话框；
- 新增插件扩展机制；
- 新增手动加载依赖模块方式；
- 改用 `Prefixes.css` 作 CSS 前缀预处理；
- 改进和增强工具栏自定义功能，完善事件监听和处理方法；
- 部分功能改进（更加方便的预格式文本/代码插入、自动闭合标签等）、新增多个方法、改进 Require.js 支持和修复多个 Bug 等等；

**具体更新如下：**

- 新建 v1.1.x 分支；
    - v1.2 文件结构变动较大；

- 新增代码折叠、自动闭合标签和搜索替换功能；
    - 搜索快捷键 `Ctrl + F / Command + F` ；
    - 替换快捷键 `Ctrl + Shift + F / Command + Option + F` ；
    - 折叠快捷键 `Ctrl + Q / Command + Q` ；

- 新增自定义主题支持；
    - 新增 3 个成员方法 `setTheme()` 、 `setCodeMirrorOption()` 和 `getCodeMirrorOption()` ；

- 新增 @Link 支持；

- 新增 GFM Task Lists 支持；

- 新增 Emoji 表情支持；
    - 支持 Github emoji `:emoji-name:` 、FontAwesome icons（`:fa-xxx:`）、Twitter emoji (twemoji) （ `:tw-xxxx:` ）、Editor.md logo icons（ `:editormd-logo:` ）形式的 Emoji；
    - 新增属性 `editormd.emoji` 、 `editormd.twemoji` 、 `editormd.urls` 和 `editormd.regex`；
    
- 新增 HTML 实体字符插入、插入表格和使用帮助对话框；
    - 修改了 `createDialog()` 等方法；
    - 新增 `mask` 成员属性和锁屏方法 `editormd.lockScreen()` 、 `editormd.fn.lockScreen()` ；

- 改进插入预格式文本和代码对话框；
    - 将 `<textarea>` 改为 `CodeMirror` ，输入更加方便和直观；

- 新增自定义键盘快捷键功能；
    - 新增 2 个方法： `addKeyMap()` 和 `removeKayMap()`；

- 改用 `Prefixes.css` 作CSS前缀预处理；
    - SCSS前缀预处理mixins改用 [Prefixes.scss](https://github.com/pandao/prefixes.scss "Prefixes.scss")；

- 改进和增强工具栏自定义功能；
	- 新增配置项 `toolbarCustomIcons` ，用于增加自定义工具栏的功能，可以直接插入 HTML 标签，不使用默认的元素创建图标；
    - 新增工具栏列表预设值属性 `editormd.toolbarModes` ；
    - 移除成员属性 `toolbarIconHandlers` ；

- 完善和新增事件处理方法；
	- 新增事件回调注册方法 `on()` ；
	- 新增事件回调移除方法 `off()` ；
	- 新增事件回调处理配置项： `onresize` 、 `onscroll` 、`onpreviewscroll` 、 `onpreviewing` 、 `onpreviewed` 、`onwatch` 和 `onunwatch` ；

- 新增手动加载依赖模块方式，以便可同步使用成员方法；
    - 新增属性 `autoLoadModules` ，默认值为 `true` ；

- 新增插件及扩展机制；
    
    - 新增插件自定义机制，改变整体结构(包括文件结构)，以便更加方便地实现插件扩展；
	- 新增对象扩展方法 `extends()` 、 `set()` ；

- 新增成员方法和属性：

    - 新增两个方法： `setValue()` 、`getValue()`；
	- 新增 `config()` 方法，用于加载后重新配置；
	- 增加两个属性 `cm` ，是 `codeEditor` 的简写， `cmElement` 是 `codeMirror` 的别名;

- 成员方法的改进：

	- 改进： `showToolbar()` 和 `hideToolbar()` 方法增加一个 `callback` 函数，用于直接回调操作；
	- 改进：修改了 `previewCodeHighlight()` 方法；
	- 更名： `recreateEditor()` 更名为 `recreate()` ；
    - 移除 `setMarked()` 方法；
    
- 新增 HTML 标签解析过滤机制；
    - 通过设置 `settings.htmlDecode = "style,script,iframe"` 来实现过滤指定标签的解析；

- 改进 Require.js 支持；
    - 修复 Require.js 下 CodeMirror 编辑器的代码无法高亮的问题；
    - 更新 `underscore` 版本至 `1.8.2` ；
    - 移除 `editormd.requirejsInit()` 和 `editormd.requireModules()` 方法；
    - 新增 `Require.js/AMD` 专用版本文件 `editormd.amd.js` ；
    - 新建 Gulp 任务 `amd` ；

- 修改和新增以上改进等相关示例；

### v1.3

#### v1.3.0

主要更新：

- 预设键盘快捷键处理（粗体等），插入 Markdown 更加方便；
- 更新 CodeMirror 版本为 `5.0` ；
- 更新 Marked 版本为 `0.3.3`；
- 新增自动高度和工具栏固定定位功能；
- 改进表格插入对话框；
- 工具栏新增三个按钮，分别是将所选文本首字母转成大写、转成小写、转成大写；
- 修改使用帮助文档；
- 修复多个 Bug；

具体更新如下：

- 新增常用键盘快捷键预设处理；
    - 新增属性 `editormd.keyMaps` ，预设一些常用操作，例如插入粗体等；
    - 新增成员方法 `registerKeyMaps()` ；
    - 退出HTML全屏预览快捷键更改为 `Shift + ESC`；
    - 新增配置项 `disabledKeyMaps` ，用于屏蔽一些快捷键操作；
- 更新 CodeMirror 版本为 `5.0`；
    - 修改无法输入 `/` 的问题；
- 更新 Marked 版本为 `0.3.3`；
- 新增自动高度和工具栏固定定位（滚动条拖动时）模式；
    - 新增配置项 `settings.autoHeight` ；
    - 新增配置项 `settings.toolbarAutoFixed` ；
    - 新增方法 `setToolbarAutoFixed(true|false)` ；
- 新增邮箱地址自动添加链接功能；
    - 新增配置项 `emailLink` ，默认为 `true` ; 
- 改进表格插入对话框；
- 工具栏新增三个按钮，分别是将所选文本首字母转成大写、转成小写、转成大写；
    - 新增方法 `editormd.ucwords()` ，别名 `editormd.wordsFirstUpperCase()` ；
    - 新增方法 `editormd.ucfirst()` ，别名 `editormd.firstUpperCase()` ；
    - 新增两个成员方法 `getSelections()` 和 `getSelections()` ；

- 修复 Font awesome 图标 emoji 部分无法解析的 Bug，[#39](https://github.com/pandao/editor.md/issues/39)
- 改进 @link 功能 [#40](https://github.com/pandao/editor.md/issues/40)；
    - 新增配置项 `atLink` ，默认为 `true` ; 
- 修复无法输入 `/` 的问题 [#42](https://github.com/pandao/editor.md/issues/42)；
- 修改使用帮助说明的错误 [#43](https://github.com/pandao/editor.md/issues/43)；
- 新增配置项 `pluginPath`，默认为空时，等于 `settings.path + "../plugins/"` ；

### v1.4

#### v1.4.0

主要更新：

- 新增延迟解析机制，预览更即时；
- 新增跳转到指定行的功能和对话框；
- 新增 ToC 下拉菜单、自定义 ToC 容器的功能；
- 新增跳转到行、搜索的工具栏按钮；
- 新增支持插入和解析（打印）分页符；
- 改进快捷键功能和自动高度模式等；
- 改进：将锚点链接改名为引用链接；
- 改进编辑器重建和重配置功能；
- 修复多个 Bug；

具体更新：

- 新增延迟解析预览的机制，解决输入太多太快出现的 “延迟卡顿” 问题；
    - 新增配置项 `delay` ，默认值为 `300`；
    - 修复当输入速度太快时，解析Flowchart会抛出错误的问题；
- 修改 iPad 等移动终端的浏览器无法上传图片的问题 [#48](https://github.com/pandao/editor.md/issues/48)；
- 修复单独引用 `editormd.preview.css` 时无法显示 Font Awesome 和 Editor.md logo 字体的问题；
- 更新和修改 Gulp 构建；
    - 修改了 `Gulpfile.js` ，并且 `gulp-ruby-sass` 升级到最新版本 `1.0.0-alpha.3` ; 
    - 编辑 SCSS 时，不再生成 CSS 的 Source map 文件；
- 执行 jshint 和更正一些 JS 写法的不规范，精简了代码；
- 新增配置项 `appendMarkdown` 和 `appendMarkdown()` 方法，用于(初始化前后)追加 Markdown 到 Textarea ；
- 改进部分预设快捷键功能，包括 F9 (watch)、F10 (preview)、F11 (fullscreen)等;
- 修复自动高度模式下出现的几个问题；
    - 全屏退出时高度不正确的问题：修改了 `fullscreenExit()` 方法的内部实现；
    - 当解析预览后的 HTML 内容高度高于 Markdown 源码编辑器高度时，无法正确预览的问题 [#49](https://github.com/pandao/editor.md/issues/49)；
- 修改 `onscroll` 和 `onpreviewscroll` 无法访问 `this` 的问题；
- 修改 `init()` 方法，可以只设置一个参数；
- 新增插入 TeX (KaTeX) 公式的快捷键 `Ctrl + Shift + K` 和插入方法 `tex()` ；
- 将锚点链接改为引用链接，引用的链接改为插入到页尾；
    - 工具栏的名称 `anchor` 改为 `reference-link`；
    - 工具栏的名称 `htmlEntities` 改名为 `html-entities`；
- 改进编辑器重建和重配置功能；
    - 修改了 `loadedDisplay()` 方法；
    - 修改了 `config()` 和 `recreate()` 方法；
- 新增跳转到指定行的功能；
    - 新增方法 `gotoLine()` ；
    - 新增跳转到行对话框插件 `goto-line-dialog` ；
    - 新增快捷键 `Ctrl + Alt + G` ；
    - 改进 `executePlugin()` 方法；
    - 修改了 `help-dialog/help.md` ；
- 新增搜索工具栏按钮；
    - 新增方法 `search()` 、`searchReplace()` 和 `searchReplaceAll()` ；
    - 原全屏预览 HTML 按钮的图标改为 `fa-desktop`；
    - 改为默认开启搜索替换功能；
- 更换了关于 Editor.md 的标语（ slogan ）；
- 标题按钮 `h` 改为大写的 `H`；
- `saveToTextareas()` 方法更名为 `save()`；
- 新增 ToC 下拉菜单、自定义 ToC 容器的功能；
    - 新增 Markdown 扩展语法 `[TOCM]` ，自动生成 ToC 下拉菜单；
    - 新增配置项 `tocm` ，默认为 `true`，即可以使用 `[TOCM]` ；
    - 新增配置项 `tocDropdown` 和 `tocTitle` ；
    - 新增方法 `editormd.tocDropdownMenu()` ；
    - 新增配置项 `tocContainer` ，值为 jQuery 选择器，默认为空；
- 修改了配置项 `placeholder` 的默认值；
- 改进对 IE8 的兼容支持；
- 修复 Firefox 下因为 `Object.watch()` 而出现的问题；
- 新增支持插入和解析（打印）分页符；
    - 新增配置项 `pageBreak` ，默认值为 `true`；
    - 新增语法 `[========]` ，即括号内至少 8 个等号；
    - 新增插入分页符的工具栏图标和方法 `pagebreak()` ；
    - 新增插入分页符的快捷键 `Shift + Alt + P`；
- 修复一些 Bug，包括 [#51](https://github.com/pandao/editor.md/issues/51) 等；
- 新增和修改以上更新的相关示例；

#### v1.4.1

- 新增配置项 `syncScrolling`，即是否开启同步滚动预览，默认值为 `false` ； 
- 修复 Bug [＃64](https://github.com/pandao/editor.md/issues/64)；
    - 更新 `editormd.katexURL` 资源地址的默认值，即更新版本为 `0.3.0` ； 
    - 新增测试用例`tests/katex-tests.html`；
    - 修改示例文件`examples/katex.html`； 
- 修复 Bug [＃66](https://github.com/pandao/editor.md/issues/66)；
- 修复编辑器工具栏按钮 `:hover` CSS3 transition 无效的问题； 
- 修改了 `README.md`；

#### v1.4.2

- 改进和增强自定义工具栏功能，支持图标按钮右对齐 [#69](https://github.com/pandao/editor.md/issues/69)；
- 改进和增强 HTML 标签的解析过滤功能，支持过滤指定的属性等 [#70](https://github.com/pandao/editor.md/issues/70)；
- 删除分支 `mathjax-version` 和 `v1.1.9`；

#### v1.4.3

- 改进：可配置是否自动聚焦编辑器 [#74](https://github.com/pandao/editor.md/issues/74)；
	- 新增配置项 `autoFocus`，默认值为 `true`; 
- 修复 Bug [#77](https://github.com/pandao/editor.md/issues/77)；
- 改进：帮助对话框里的链接改为新窗口打开，避免直接跳转到链接，导致编辑内容丢失的问题 [#79](https://github.com/pandao/editor.md/issues/79)；
- 改进和完善编辑器配置项；
	- 新增配置项 `tabSize`、`indentUnit` 和 `lineWrapping`；
	- 新增配置项 `autoCloseBrackets` 和 `showTrailingSpace` ；
	- 新增配置项 `matchBrackets`、`indentWithTabs` 和 `styleSelectedText`；
- 改进：修改 CSS `font-family`，改进跨平台中英文字体显示；
- 修改了 `README.md`；

#### v1.4.4

- 修复 Bug [#81](https://github.com/pandao/editor.md/issues/81)，即不支持 `:+1:` 的问题；
- 修复 Bug [#85](https://github.com/pandao/editor.md/issues/85)，即图片上传返回结果不支持 `Content-Type=application/json` 的问题；
- 修复图片上传无法显示 loading 的问题；

#### v1.4.5

- 规范项目的中英文混排；
- 新增配置项 `name`，用于指定 Markdown textarea 的 `name="xxxx"` 属性；
- 修复 Bug，即无法正确解析公式的 `<` 和 `>` 的问题 [#87](https://github.com/pandao/editor.md/issues/87);
- 修复 Bug，即 `getHTML()` 无效的问题 [#95](https://github.com/pandao/editor.md/issues/95);
- 修复 Bug，即火狐上传图片后无法返回值的问题 [#96](https://github.com/pandao/editor.md/issues/96);
    - 修改了图片上传插件；
    - 修改 PHP 上传类及示例；
- 方法更名：`extends()` 更名为 `extend()`，以兼容 IE8；
- 修复 IE8 下 Emoji 正则表达式字符集越界的问题；
- 更新了 `README.md` 和 `CHANGE.md` 等相关文档文件；


### v1.5

#### v1.5.0

主要更新：

- 新增：编辑器黑色主题 Dark，改进自定义主题功能（即工具栏、编辑区、预览区可分别设置主题样式）；
- 新增：多行公式支持；
- 新增：支持非编辑状态下的 ToC 自定义容器；
- 新增：支持设置为单向同步滚动；
- 改进：编辑器样式美化，更换了滚动条样式; 
- 改进：提高同步滚动定位的精确度；
- 改进：修复和改进 HTML 标签及属性过滤功能；
- 改进：修复在 Bootstrap 下的兼容性问题；
- 修复多处 Bug；

具体更新：

- 新增：解析后的代码块自动换行；

- 新增：支持多行公式；
    - 新增：新增语法：\`\`\`math | latex | katex；
    - 改进：美化 KaTeX 公式，即加大字号等；

- 新增：支持设置为单向同步滚动，即只是编辑区单向同步滚动，配置项 `syncScrolling : "single"`；
    - 新增：配置同步滚动示例文件 `sync-scrolling.html`；

- 新增：增加了编辑器样式主题 Dark，即工具栏和预览区各自有一个暗黑色主题；
    - 变更：自 `v1.5.0` 开始，配置项 `theme` 改为指定 Editor.md 本身的主题；
    - 新增配置项 `editorTheme` ，用于指定编辑区的主题，即 CodeMirror 的主题；
    - 新增配置项 `previewTheme` ，用于指定预览区的主题；
    - 新增方法 `setEditorTheme()`，别名： `setCodeMirror()`；
    - 新增方法 `setPreviewTheme()`；
    - 修改了方法 `setTheme()` ；
    - 更换了滚动条样式，Only Webkit；
    - 改进全屏状态下的样式显示，去掉 JS 操作的部分，改为通过 CSS 样式类 `.editormd-fullscreen` 控制；
    - 修改和增加相关的方法、SCSS 文件及示例文件 `themes.html`；

- 新增：非编辑状态下 ToC 自定义容器支持；
    - 新增配置项 `markdownSourceCode`，即解析后是否保留源码，默认为不保留 `false`；
    - 新增配置项 `tocContainer`，值为自定义 ToC 容器的 ID 选择器 `#xxxxx`，默认为空；
    - 新增和修改了相关示例文件；

- 新增：新增加了 CSS 样式类 `editormd-preview-active`，可以控制全屏HTML预览时的内容层样式；
    - 修改了 `previewing()` 和 `previewed()` 方法；
    - 相关 issues [#103](https://github.com/pandao/editor.md/issues/103)；
    - 另外也调整了关闭按钮的位置；

- 改进：修复插入 Emoji `:moon:` 无法显示的问题，修改为其是 `:waxing_gibbous_moon:` 的别名 [#94](https://github.com/pandao/editor.md/pull/94)；

- 改进：修改了 CodeMirror 代码行的左右内间距，使其不会挨着左边的行号层；
    - 相关 issues [#97](https://github.com/pandao/editor.md/issues/97)；

- 改进：修改了同步滚动的定位算法，提高精确度；
    - 修正问题 [#99](https://github.com/pandao/editor.md/issues/99)；
    - 修改了 `bindScrollEvent()` 方法；

- 改进：完善 HTML 标签过滤功能，即代码块、`<pre>` 预格式文本和行内代码里的标签及属性不会被过滤；
    - 修复 Bug [#105](https://github.com/pandao/editor.md/issues/105)；
- 改进：当不显示行号时 `settings.lineNumbers == false`，CodeMirror 行号层去掉右边框； 
- 改进：根据指针在当前行的位置更合理插入标题和水平线 [#104](https://github.com/pandao/editor.md/pull/104)；
- 改进：调整了字体，优先显示 `"YaHei Consolas Hybrid", Consolas`；
- 改进：修复在 Bootstrap 下的兼容性问题，即因为 box-sizing 写错位置导致的弹出层宽度等错位问题 [#107](https://github.com/pandao/editor.md/issues/107)；