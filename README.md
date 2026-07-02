<p align="center" style="text-align: center;">

![xfEditor's Logo](./images/logo.png)

</p>

# xfEditor 编辑器 v1.17.22

> **xfEditor 是一款更适合教育、教学、网页演示、数据呈现、内容排版的现代化 Markdown 开源在线编辑器。** 基于 [pandao/editor.md](https://github.com/pandao/editor.md) 深度改进，在原有基础上进行了系统性优化、Bug 修复和新功能拓展。

**xfEditor** 是一款开源可嵌入的 Markdown 在线编辑器组件，基于 CodeMirror、jQuery 和 marked 构建。**完全离线可用**，不依赖任何外部 CDN 资源。


## 在线体验
- [功能导航页](https://zhaoxianfang.github.io/xfeditor/examples/index.html)
- [带目录预览](https://zhaoxianfang.github.io/xfeditor/examples/html-preview-markdown-to-html-custom-toc-container.html)
- [字帖](https://zhaoxianfang.github.io/xfeditor/examples/copybook.html)
- [图表](https://zhaoxianfang.github.io/xfeditor/examples/echarts.html)
- [完整演示](https://zhaoxianfang.github.io/xfeditor/examples/all-features.html)
- [API 接口文档](https://zhaoxianfang.github.io/xfeditor/examples/api-reference.html)

**v1.17.22 代码安全加固与全面审计修复：**
- **🛡 XSS 安全修复**：Tooltip `text`/`html` 类型内容增加 `escapeHTML` 转义（预览路径 + 静态路径），阻断用户可控内容注入
- **🛡 XSS 安全修复**：`html-selector` 类型 tooltip 自动剥离克隆元素中的 `on*` 内联事件处理器，防止事件劫持
- **🛡 内存泄漏修复**：jQuery tooltip 路径 `mouseleave` on popup 增加 Blob URL revocation，与纯 JS 路径保持一致
- **🛡 空引用防御**：12 个 `this.cm` 危险调用路径（`setValue`/`getValue`/`setMarkdown`/`getMarkdown`/`setCursor`/`getCursor`/`setSelection`/`getSelection`/`getCursorPosition`/`download`/`saveDraft`/`find`/`setEditorTheme`/`getCodeMirrorOption`/`setCodeMirrorOption`/`addKeyMap`/`undo`/`redo`）增加 null 守卫，防止实例销毁后回调崩溃
- **🛡 防御性编程**：预览代码中内联 `escapeHTML` 增加 null/undefined 输入守卫
- **📦 CSS 全面压缩**：`xf_editor.css` (144KB→115KB)、`xf_editor.preview.css` (85KB→70KB)、`xf_editor.logo.css` (1.8KB→1.5KB) 全部重建 minified 版本

**v1.17.21 iframe:pre Tooltip 悬浮预览全面修复：**
- **🐛 修复 iframe:pre 悬浮提示内容为空/不完整**：静态 `xfEditor.initTooltips` 方法缺少 `buildIframeHTML` 包裹步骤，导致提取的代码直接作为 Blob 裸文本而非完整 HTML 页面展示（预览代码路径的 `initTooltips` 一直正确调用 `buildIframeHTML`）
- **🆕 新增 `xfEditor.buildIframeHTML()` 静态方法**：将原始代码按语言类型智能包裹为完整 HTML 文档（JS→\<script\>、CSS→\<style\>、HTML→\<body\>、纯文本→\<pre\>）
- **🐛 修复 `&#39;`/`&apos;` 实体被错误转义为 `\'`**：预览代码中 6 处单引号转义将 `&#39;`/`&apos;` 错误替换为 `\'`（带多余反斜杠），导致代码中单引号被污染。统一修正为 `'`
- **🛡 增强 `extractCodeText`：支持多 code 元素**：当 pre 内嵌多个 `<code>` 元素时（如 prettyPrint 拆分场景），逐个提取后合并，不再仅提取第一个元素
- **🛡 新增 `_extractSingleCodeText` 内部方法**：抽离单个 DOM 元素代码提取逻辑

**v1.17.20 getUseTypes() 语法特性检测 + API 页面重构：**
- **🆕 新增 `getUseTypes()` 实例方法**：通过 `editor.getUseTypes()` 实时分析编辑器 Markdown 源码，返回 `{名称:bool}` 键值对（共 27 个检测维度：echarts/katex/copybook/flowchart/sequenceDiagram/taskList/pageBreak/tabs/columns/grid/pageBlock/video/fileList/tooltip/pinyin/supsub/textAlign/badge/footnote/atLink/emailLink/codeBlock/codeHighlight/table/image/blockquote/headings），典型场景：保存前按需加载资源（如检测到 echarts 则加载 ECharts JS）
- **🏗️ api-reference.html 页面重构**：Header 从 `<header>` 改为 `<div class="api-header">`，移入 `.api-content` 内部统一布局；新增 `getUseTypes` 完整文档（返回值表格 + 代码示例）

**v1.17.19 代码复制修复 + extractCodeText 处理器顺序修正：**
- **🐛 复制按钮代码丢失修复**：`extractCodeText()` 中实体解码（`&lt;`→`<`）在 HTML 标签剥离之前执行，导致 prettyPrint 高亮后的 `&lt;=` 解码为 `<=` 后被贪婪式 `<[^>]+>` 正则消耗。修复为 **先剥离标签 → 再解码实体**（`<br>`→`\n` → `<[^>]+>`→`` → `&amp;`/`&lt;`/`&gt;` 解码），同时修正 `&amp;` 解码顺序（必须在 `&lt;`/`&gt;` 之前，防止 `&amp;lt;` 被错误拆解）
- **🔧 内联脚本同步修复**：3 处内联生成的代码提取脚本（HTML 导出/iframe:pre/tooltip）同样修正为标签剥离优先顺序
- **📦 全部构建产物重编译**：`xf_editor.js`/`.min.js`/`preview.min.js` 已同步重建

**v1.17.18 全面审查修复 + SCSS/CSS 强化 + 安全加固：**
- **🔧 SCSS/CSS 全面修复**：移除 `xf_editor.dialog.scss` 中 2 处冗余 hover 渐变（与默认值完全相同的无效 hover）；修复 10 处裸 `transform` 缺少 `-webkit-`/`-ms-` 厂商前缀的问题（改用 `@include transform()` mixin）；修复 `github-markdown.scss` 中 `word-break: normal;` 紧接 `word-break: keep-all;` 的覆盖冗余；修复 `font-awesome.scss` 中 `transform` 缺少前缀
- **🔒 Tooltip HTML XSS 防护**：`tooltipType="html"` 的 `popup.innerHTML` 注入 Base64 解码内容现在先经过 `textContent` 提取再 `escapeHTML` 包装，防止恶意 HTML 执行
- **🔒 多处 HTML 转义增强**：`pageHeader` 增加 `&`/`"`/`'` 转义；`footerContent` 使用 `escapeHtml()`；附件链接 `url`/`name` 增加 `&`/`'` 转义防止属性注入
- **🐛 上传插件事件累积修复**：`image-dialog`/`file-dialog`/`video-dialog` 中 submit handler 改为 `.off().on()` 模式，防止多次打开弹窗导致一次点击触发多次上传
- **🛡️ 库加载空值保护**：`CodeMirror` 和 `marked` 加载后增加 `typeof undefined` 检查，防止库文件缺失时静默失败；`markdownToHTML` 增加目标元素 `#id` 不存在时的错误提示
- **📦 全部构建产物**：所有 `.js`/`.min.js`/`preview.min.js`/`.css`/`.min.css` 已同步重构

**v1.17.17 预览版复制按钮格式保留 + tooltip iframe 代码提取修复：**
- **🐛 preview.min.js 代码提取修复**：实例 `initCodeCopy` fallback 从 `.text()` 改为 `extractCodeText()`（v1.17.16 遗留；3 处遗漏）
- **🐛 Tooltip iframe 代码提取**：jQuery 侧和内联脚本侧改用 `innerHTML` + HTML 实体解码（之前是 `.text()`/`textContent`）
- **📦 构建产物同步**：`xf_editor.preview.min.js` 重新编译，全部 6 个文件代码提取点已统一

**v1.17.13 安全加固 + 兼容性增强 + 全面审计修复：**
- **🔒 XSS 安全修复**：`markedRenderer.image` 中 `href`/`title`/`text` 属性现在全部经过 `escapeAttr`/`escapeHtml` 安全转义，防止属性注入攻击；`filterHTMLTags` 新增 HTML 实体解码检测（`&#106;avascript:` 等编码绕过），覆盖所有危险协议变体
- **🌐 ES5 浏览器兼容性修复**：移除 `(?<!!)` ES2018 负向后瞻语法，改用捕获组前置字符检查，确保 IE11 和老版 Safari 正常运行
- **🐛 多反引号保护修复**：`preprocessLinkTarget` 现在正确保护 `` `…` `` 多反引号行内代码，防止混淆 `[text](url){target=…}` 链接语法
- **🧹 死代码标记**：5 个未使用正则（`tabs`/`tabItem`/`columns`/`videoBlock`/`fileBlock`）标记为 `[DEPRECATED]` 保留向后兼容
- **🎯 货币符号优化**：`protectTeXSyntax` 新增货币模式检测，`$100` 等以数字开头的 `$…$` 不再误触 LaTeX 保护
- **✅ 任务列表去重**：`postProcessTaskLists` 跳过已包含 checkbox 的 HTML，避免与 `markedRenderer.listitem` 重复渲染
- **📦 全面重构构建**：所有 `.js` / `.css` / `.min.js` / `.min.css` / `preview.min.js` 文件已同步重构

**v1.17.16 复制按钮格式保留修复 + filterHTMLTags 核心 Bug 修复：**
- **🐛 filterHTMLTags pre/code 块消失 Bug 修复**：v1.17.15 引入的 pre/code 保护块还原代码被错误放置在 `typeof filters !== "string"` 早期返回之后，导致 `htmlDecode: true/false` 时所有 `<pre>`/`<code>` 内容被永久替换为 HTML 注释（代码块完全消失）。修复：将还原代码移到安全过滤完成但用户过滤之前，确保所有路径都正确还原
- **🐛 复制按钮代码格式保留**：引入 `xfEditor.extractCodeText()` 使用 `innerHTML` + HTML 实体解码提取代码文本，代替之前的 `textContent`/`.text()` 方式。`innerHTML` 方式完美保留原始缩进/空格/换行，解决了 prettify 后 `<span>` 结构下 `textContent` 可能丢失空白的问题
- **🔧 全部提取点统一**：编辑器实例 `previewCodeHighlight`、静态方法 `markdownToHTML`、实例方法 `initCodeCopy`、静态方法 `xfEditor.initCodeCopy`、内联脚本 `initCodeCopy` 共 5 处代码提取点全部切换为 `extractCodeText`
- **📦 构建产物**：所有 `.js` / `.min.js` / `preview.min.js` 文件已重新编译

**v1.17.15 全面安全加固 + 示例修复 + 文档完善：**
- **🛡️ XSS 过滤保护 pre/code 块**：`filterHTMLTags()` 在移除危险标签前保护 `<pre>`/`<code>` 块，确保代码示例中的 `<script>`/`<style>`/`<iframe>` 等标签不被误删（修复最严重的安全过滤缺陷）
- **🛡️ CSS.escape polyfill**：为 IE/旧浏览器添加 `CSS.escape` polyfill，修复脚注点击跳转在旧浏览器中失败的问题
- **🛡️ padStart polyfill**：为 IE/ES2016- 浏览器添加 `String.prototype.padStart` polyfill，修复草稿恢复功能在旧浏览器中崩溃的问题
- **🔧 config() 防御性参数**：`config("key", undefined)` 不再覆盖已有值；两个 `if` 改为 `if-else` 避免逻辑混淆
- **🔧 exportFile 降级方案**：Blob/URL.createObjectURL 不可用时自动降级为 data URI 下载
- **🔧 用户过滤空标签名**：`filters.split("|")` 空标签名跳过处理，防止生成错误正则
- **🔧 getHTML 布尔简写**：支持 `editor.getHTML(true)` / `editor.getHTML(false)` 控制压缩输出
- **🔧 代码复制保留格式**：`markdownToHTML` 在 `prettyPrint` 前保存原始代码文本，修复复制按钮丢失换行/空格问题
- **📝 示例文件全面修复**：12 个示例文件修复（拼写错误 `htmlDebode`→`htmlDecode`、弃用 API `todoList`→`taskList`、缺失 `path` 参数、过期版本号、弃用 `<a name>` 属性、非压缩 JS 引用）
- **📄 API 文档 Header 对齐**：`api-reference.html` Header 与 `.api-content` 使用 block 自然流式布局对齐
- **📦 构建产物**：所有 `.js` / `.css` / `.min.js` / `.min.css` / `preview.min.js` 文件已重新编译

**v1.17.12 深色主题 + 体积优化 + 代码精简：**
- **🎨 Prettify 深色主题重写**：彻底移除亮色背景和黑白交替行号样式冲突，统一为 VS Code Dark+ 配色（纯文本 #e6edf3、字符串 #ce9178、关键字 #569cd6、注释 #6a9955、类型 #4ec9b0、函数 #dcdcaa），所有行号无交替背景、完美适配 #0d1117 暗色 pre 背景
- **📄 API 文档页 Header 对齐**：Header 与正文 .api-content 左侧完美对齐（margin-left: 270px），消除固定导航栏与 Header 的交叉遮挡
- **📦 getHTML 默认压缩**：`minify` 选项默认值改为 `true`，输出时 CSS 自动去除空格、JS 自动压缩，减少存储体积且保证代码可正常运行
- **🔧 代码精简**：提取 `_renderMarkdownPipeline` 统一共享 Markdown 渲染管线（消除 4 处重复的 9 步处理流程）、`save()` 使用 `_buildRendererOptions` 替代手写 22 行配置、移除 IE8 兼容代码和调试 console 注释
- **📊 体积优化**：源文件从 12,991 行减少至 ~12,940 行，消除约 60 行冗余代码

**v1.17.11 全面优化与增强：**
- **🎨 代码块样式全面重设计**：macOS 风格 header bar（红绿灯装饰）、精致暗色 GitHub Dark 主题（#0d1117）、优化字体渲染与间距、代码复制按钮移至 header bar 右侧
- **📐 预览区媒体自适应**：图片、视频、表格、公式、图表均设置 `max-width: 100%`，防止内容溢出；表格超出水平宽度自动显示滚动条
- **🔧 工具栏固定定位修复**：修复嵌入页面滚动时工具栏左右偏移问题，改用 `editor.offset().left` 精确定位，确保工具栏始终与编辑器保持对齐且同宽
- **📄 API 文档页重设计**：现代化 Header（渐变背景 + 几何装饰 + 版本标签 + 能力指标）、表格水平滚动容器（防止内容溢出导致页面布局混乱）、圆角 tag 标签
- **📦 离线完备性**：getHTML 接口产出的 HTML 完全不依赖任何外部资源（无 CDN/Google Fonts），包含内联完整 CSS 样式（代码块、复制按钮、媒体自适应、表格滚动等），可在离线条件下完美渲染
- **🧹 样式清理**：移除 SCSS 中重复的 pre/code 样式规则，消除 CSS 特异性冲突导致的代码块样式异常
- **📝 示例与文档**：所有示例文件、README、USAGE_GUIDE 更新至最新版本

**v1.17.10 修复：**
- **Tabs 嵌套智能感知**：`findTabsBlocksAware()` 追踪 `[[tab:xxx]]`/`[[/tab]]` 上下文深度，表格文本 `[[tabs]]` 不再被误判为标签
- **内嵌 Tabs 占位符保护**：`extractTabItems` 用绝对位置替换 inner-tabs 块，确保深层嵌套时正确提取顶层 tab 项
- **Video/File 块嵌套支持**：`[[video]]`/`[[file]]` 改用 `findBalancedBlocks`，支持与其他块级语法交叉嵌套
- **预览打包文件**：`xf_editor.preview.min.js`（~1.1MB）合并所有预览依赖，减少 HTTP 请求
- **工具栏完整文档**：API 参考页面新增全部 63 个工具栏按钮及中文描述对照表
- **冗余文件清理**：删除测试脚本、旧版 Logo 源文件、CodeMirror 测试文件等 16 个冗余文件

---

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
| ` ```(.className) ` | 代码块设置 pre 的 class 属性 ⭐v1.14 | 默认 |
| ` ```(#idName) ` | 代码块设置 pre 的 id 属性 ⭐v1.14 | 默认 |
| ` ```(hidden) ` | 隐藏代码块（配合 tooltip 悬浮预览）🆕v1.15 | 默认 |
| ` ```(.cls#id) ` | 同时设置 class 和 id ⭐v1.14 | 默认 |
| ` ```(hidden.cls#id) ` | 隐藏 + class + id 组合 🆕v1.15 | 默认 |
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
| `[text](url){target=_blank}` | 链接跳转方式（新页面/当前页面/父窗口）🆕v1.17.2 | 默认 |

### 📐 版面布局
| 语法 | 说明 | 配置 |
|------|------|------|
| `[[columns:N]]...[[/columns]]` | N 列多栏排版（2-6 列） | `columns: true` |
| `[[row]]...[[col:N]]...[[/row]]` | 栅格化布局（Bootstrap 风格 10 栏）🆕v1.15 | `grid: true` |
| `[[tabs]]...[[/tabs]]` | 标签页组件（支持嵌套） | `tabs: true` |
| `[[page:A4]]...[[/page]]` | 纸张页面（A0-A8/LETTER） | `pageBlock: true` |
| `⁑居中⁑` / `⠪右对齐⠪` | Unicode 行内对齐 | `textAlign: true` |

### 🛠 文本增强
| 语法 | 说明 | 配置 |
|------|------|------|
| `{汉字 \| pīn yīn}` | 拼音标注 | `pinyin: true` |
| `^上标^` | 上标 | `superscript: true` |
| `^^下标^^` | 下标 | `subscript: true` |
| `<<下标>^<上标>>` | 组合上下标 | `superscript/subscript` |
| `!32 文字!` | 字体大小（8-200px） | `fontSize: true` |
| `[^注解名]` / `[^注解名]: 内容` | 脚注系统 | `footnote: true` |

### 🖱 悬浮提示 Tooltip
| 语法 | 说明 | 配置 |
|------|------|------|
| `[文本](tooltip:text:内容)` | 文本悬浮提示 | `tooltip: true` |
| `[文本](tooltip:image:url)<宽,高>` | 图片悬浮提示（支持宽高） | `tooltip: true` |
| `[文本](tooltip:iframe:url)<宽,高>` | 嵌入页面悬浮提示（支持宽高）🆕全类型最大化/还原/关闭按钮 v1.17.2 | `tooltip: true` |
| `[文本](tooltip:html:#id)` | HTML DOM 元素悬浮提示 | `tooltip: true` |
| `[文本](tooltip:iframe:pre#id)` | 代码块内容悬浮预览 ⭐v1.14 | `tooltip: true` |
| 固定宽高自动滚动 | 设置宽高后超出内容自动显示滚动条 🆕v1.17 | `tooltip: true` |

### 📝 字帖与教育
| 语法 | 说明 | 配置 |
|------|------|------|
| `[[copybookTian]]...[[/copybookTian]]` | 田字格字帖 | `copybook: true` |
| `[[copybookMi]]...[[/copybookMi]]` | 米字格字帖 | `copybook: true` |
| `[[copybookPinyin]]...[[/copybookPinyin]]` | 拼音格字帖 🆕v1.17.8 | `copybook: true` |
| `{汉字\|拼音}` 花括号语法 | 拼音格内嵌写法（推荐）🆕v1.17.8 | `copybook: true` |
| `(!width:NNN)` | 行级宽度参数，两端对齐 🆕v1.17.8 | `copybook: true` |
| `[^name]` 字帖脚注 | 字帖/拼音格内脚注引用 🆕v1.17.8 | `footnote: true` |

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
| 同步滚动 | 编辑区与预览区双向同步滚动，基于区块签名精准定位 🆕v1.17.1 | `syncScroll: true` |
| 表格行列编辑 | 预览区点击单元格插入/删除行列 | `tableEdit: true` |
| 图片尺寸编辑 | 拖拽+精确输入图片尺寸 | `imageResize: true` |
| 代码复制按钮 | 代码块右上角一键复制 | 默认 |
| 图片/文件/视频上传 | 拖拽上传、粘贴上传、格式白名单 | `imageUpload/fileUpload` |
| 草稿自动保存 | localStorage 定时保存+恢复 | `draftAutoSave: true` |
| 搜索替换 | 编辑器内搜索/替换 | `searchReplace: true` |
| 代码折叠 | CodeMirror 代码折叠 | `codeFold: true` |
| 公式插入面板 | 100+公式模板、11 分类、一键插入 | 工具栏按钮 |
| 全屏编辑 | 全屏沉浸式编辑 | F11 |
| 多语言 | 简体中文/繁体中文/英文 | `lang` |
| 主题切换 | 编辑器+预览区多套主题 | `theme`/`previewTheme` |
| AMD/CMD 加载 | Require.js / Sea.js 支持 | — |
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
- 支持 AMD/CMD 模块加载（Require.js / Sea.js）
- 兼容 IE8+、iPad、Zepto.js

### v1.17.10 改进 🆕
| 特性 | 说明 |
|------|------|
| **🔄 同步滚动引擎全面重写** | 统一 `_syncState` 状态管理对象（取代散落的 `_scrollAnimation`、`_syncScrollActive` 等标志）；**程序化滚动识别**（`programmaticScroll` 标记）精确区分用户滚动和代码触发滚动，消除反馈循环；**门控优先级体系**（suppressAllSync → programmaticScroll → disablePreviewListener → applyingDomChanges → mouseTarget）确保各方向互不干扰 |
| **📜 预览→编辑方向完全修复** | 修复 `disableScrollListener` 错误阻止用户预览区滚动的问题：`disablePreviewListener` 仅在 editor→preview 动画期间禁用反向同步，不再影响用户主动滚动；**祖先链滚动监听**（previewContainer → parent → ... → body）确保不遗漏任何滚动事件 |
| **🎯 预览交互防护** | `suppressAllSync` 机制：图片拖拽缩放/表格编辑等预览区操作更新编辑器内容时，完全暂停双向同步滚动，防止 `cm.setValue()` → `save()` → `previewContainer.html()` → 滚动跳转的连锁反应；操作完成后自动恢复同步；暴露 `suspendSyncScroll()` / `resumeSyncScroll()` 外部接口 |
| **🔗 锚点智能配对** | 标题锚点匹配从纯顺序升级为**文本+层级二维验证**：优先匹配完全相同文本和层级的标题，剩余未匹配项按顺序回退配对；**代码块过滤**：跳过 `` ``` `` 代码块内的 `#` 开头行，避免误匹配 |
| **🛡 表格编辑同步防护** | `modifyTableInMarkdown` 同步添加 `suspendSyncScroll` / `resumeSyncScroll` 保护（与图片缩放一致） |
| **📐 滚动定位强化** | `scrollToLineNum()` 使用 `programmaticScroll` 标记防止 smooth 滚动触发反向同步；动画使用 `programmaticScroll` + 延迟清除（50ms后）防止动画帧间的 scroll 事件触发循环 |

### v1.17.3 改进
| 特性 | 说明 |
|------|------|
| **🔄 同步滚动彻底修复（标题锚点重写）** | 移除简单的 `lineRatio * blockCount` 比例映射，改用标题锚点映射引擎：解析 markdown 源码中所有标题行号 + 预览 DOM 标题元素按序配对 → 构造 `editorLine ↔ previewElement` 双向映射表；编辑→预览方向在相邻标题锚点间线性插值精确计算目标滚动位置；预览→编辑方向直接找到视口内可见标题锚点对应的编辑器行号；无标题文档自动回退到比例 + 二分查找；新增 `_buildHeadingAnchorMap()` 实例方法供 `bindSyncScroll` 和 `scrollToLineNum` 共用 |
| **📜 预览区滚动现在可同步编辑区** | 修复预览区 `scroll` 事件可能不在 `previewContainer` 上触发的问题：使用 `_findScrollContainer` 自动检测真实滚动容器并绑定双保险监听器（容器 + previewContainer）；`unbindSyncScroll` 同步清理所有监听器 |
| **⚡ 锚点缓存与失效** | 内容不变时缓存锚点映射避免重复构建（内容指纹匹配）；`wheel`/滚动条拖拽（`mousedown`）时自动失效重建 |

### v1.17.2 改进
| 特性 | 说明 |
|------|------|
| **🔗 同步滚动引擎增强** | 编辑→预览方向升级为可见行范围映射（`lineAtHeight`），比纯滚动比例更精准；新增 `easeInOutCubic` 缓动动画替代线性步进；预览→编辑方向使用二分查找定位可见区块（O(log n)）；新增滚动条拖拽检测，拖拽时自动暂停动画；所有方向添加 30ms 防抖（`SYNC_DEBOUNCE`）避免高频计算；`addBlockSignatures()` 扩展支持 `li, section, article, header, footer, nav, dl` 等更多块级元素 |
| **🔧 工具栏全面修复** | `executePlugin` 重构为统一插件调用方式：优先检查 `this[name]` 函数直接调用（适用所有模式），再回退到动态加载；修复非 AMD 模式下插件无法调用的问题；`linkDialog`、`imageDialog`、`videoDialog`、`tableDialog` 等所有插件对话框现在都能正确写入编辑区 |
| **🔗 链接跳转方式** | 新增链接跳转方式选择（新页面/当前页面/父窗口/顶层窗口）；支持扩展语法 `[text](url){target=_blank}` → 渲染为 `target="_blank"`；新增 `preprocessLinkTarget()` 预处理函数在所有渲染管线中统一处理 |
| **🖱 悬浮提示增强** | 最大化/还原按钮现在适用于所有 tooltip 类型（不仅是 iframe）；最大化后点击还原正确恢复到原始尺寸（包括自适应状态）；图标区分：最大化 `□` → 还原 `❐`；还原时内部内容元素样式完整恢复 |
| **📐 块签名系统增强** | `addBlockSignatures()` 扩展支持更多块级元素标签；新增 `data-sign-count` 属性记录总块数用于边界计算 |
| **📦 构建与文档** | 所有 .js/.css .min 文件重新编译压缩至 v1.17.2；README、USAGE_GUIDE 更新至最新版本；`xf_editor.amd.js` 通过 `build-amd.js` 同步更新 |

### v1.17.1 改进
| 特性 | 说明 |
|------|------|
| **🔗 同步滚动引擎重写** | 参照 Tencent/cherry-markdown 设计，完全重写同步滚动引擎。新增 `data-sign` 块签名系统实现编辑区行号 ↔ 预览区块的精准双向映射；`requestAnimationFrame` 缓动动画（~200ms）替代即时跳转；滚轮事件中断动画并恢复用户控制；`_applyingDomChanges` 锁防止 DOM 更新期间反向同步；新增 `scrollToLineNum(lineNum, linePercent)` API 支持编程式精确定位 |
| **📐 区块签名系统** | 新增 `addBlockSignatures()` 后处理函数，为预览区每个块级元素（h1-h6, p, pre, blockquote, ul, ol, table, div 等）注入 `data-sign="block-N"` 属性，使滚动映射精度达到块级别 |
| **🛡 锁机制增强** | 三重防抖锁：`disableScrollListener`（动画期间）、`_applyingDomChanges`（DOM更新期间）、`_syncScrollActive`（鼠标区域追踪），彻底杜绝滚动死循环 |

### v1.17.0 改进
| 特性 | 说明 |
|------|------|
| **🔗 同步滚动** | 新增编辑区与预览区双向同步滚动功能，采用基于比例的同步算法；编辑区滚动时预览区按比例跟随，预览区滚动时编辑区同样跟随；通过鼠标位置追踪防止滚动死循环；默认启用 `syncScroll: true` |
| **🖱 Tooltip 增强** | iframe 类型 Tooltip 弹窗右上角新增「最大化」和「关闭」按钮；最大化支持全屏展示并一键还原；关闭按钮可立即关闭弹窗；固定宽高时自动显示滚动条（`overflow:auto`），超出指定尺寸的内容可水平/垂直滚动 |
| **📐 栅格布局完善** | 补全 `.xf_editor-row` 和 `.xf_editor-col` 的 CSS 样式（flex 布局、列间距、边框分隔等）；空行（无 col 的 row）显示警告占位提示；列宽最小值从 0 提升至 1% 防止不可见列；修复 `[[columns:0]]` 被错误解析为 3 列的问题 |
| **🎨 SCSS/CSS 重构** | `xf_editor.grid.scss` 新增 row/col 样式定义；`xf_editor.preview.scss` 新增 Tooltip 最大化/关闭按钮样式；所有 CSS 重新编译压缩 |
| **🔧 系统审计** | 全面检查栅格化语法和所有复杂嵌套语法的边界问题；`findBalancedBlocks` 性能验证通过；占位符 ID 跨层级无冲突验证；空值安全保护增强 |
| **📦 构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩至 v1.17.0；版本号统一更新；更新 README、USAGE_GUIDE 文档及所有示例文件 |

### v1.16.0 改进
| 特性 | 说明 |
|------|------|
| **章节编号规范化** | 修复 all-features.html 和 full-preview.html 中「七点五」编号问题，统一重编号为「八」起；所有示例文件编号连续性校验通过（一到二十六） |
| **栅格选项传递修复** | `createMarkedOptions` 补全缺失的 `grid`、`textAlign` 选项，确保嵌套渲染时栅格语法正确处理 |
| **构建与文档** | 所有 .js/.css .min 文件重新编译压缩至 v1.16.0；README、USAGE_GUIDE、FIX_SUMMARY 更新至最新版本 |

### v1.15.0 改进
| 特性 | 说明 |
|------|------|
| **Hidden 隐藏代码块** | 新增 ````(hidden)``` / ````(hidden.class#id)``` 语法，代码块添加 `display:none!important` 样式；配合 `tooltip:iframe:pre#id` 实现"隐藏+悬浮预览"；`initCodeCopy` 自动跳过隐藏代码块的复制按钮注入 |
| **Scroll Spy 目录高亮** | TOC 目录新增滚动监听功能，页面滚动时自动高亮当前章节；激活项超出视区时自动滚动到可见位置；使用 requestAnimationFrame 节流 |
| **TOC 侧栏美化** | 侧栏宽度从 320px 优化至 260px；渐变头部 + 紫色装饰条；浮动按钮脉冲呼吸动画；层级差异化字号与权重；自定义细滚动条；底部"回到顶部"链接 |
| **目录样式精减** | 冲刷 `.markdown-toc` 自带 padding/margin/border；收紧目录项间距与层级缩进；hover 左移动画效果；左侧彩色边框激活指示器 |
| **系统全面审计** | 对所有功能、语法、渲染逻辑进行全面审计排查；修复潜在边界条件问题；增强空值安全保护与正则安全处理 |
| **构建与文档** | 所有 .js/.css .min 文件重新编译压缩；更新 README、USAGE_GUIDE、code-attr 示例文件；新增 hidden 代码块完整文档 |
| **🆕 栅格化布局** | 新增 `[[row]]...[[col:N]]...[[/row]]` 语法（Bootstrap 风格 10 栏栅格）；支持显式/自动/混合列宽；col 内可嵌套图表、Tabs、代码块等全部语法；≤768px 自动响应式堆叠；工具栏「插入」菜单新增「栅格化」按钮 |
| **🎨 组件样式补全** | `xf_editor.preview.css` 补全 Tabs、Columns、Pinyin、TextAlign、ImageResize、Badge、Video、File 等缺失样式；新增完整暗色主题覆盖 |

### v1.14.0 改进
| 特性 | 说明 |
|------|------|
| **代码块属性扩展** | 新增 ````(.className)``` / ````(#idName)``` 语法，支持为代码块的 `<pre>` 标签设置 class/id 属性；支持与语言标识组合（如 ````javascript(.snippet#demo)```） |
| **iframe:pre 悬浮预览** | 新增 `tooltip:iframe:pre#id` / `tooltip:iframe:pre.class` 悬浮提示类型，提取页面 `<pre>` 元素内容以 iframe 渲染展示（HTML 内容被浏览器解析渲染，纯文本直接显示），每次悬停动态创建 Blob URL 确保 JS 重新执行 |
| **表格空单元格修复** | 修复 marked.js v0.3.3 表格解析 Bug：最后一行最后一列为空时单元格被丢失；通过后处理自动补齐缺失的空 `<td>` |
| **内存泄漏修复** | `initTooltips` 清理时释放 Blob URL；`restoreCodeBlocks`/`restorePlaceholders` 增加空值安全保护 |
| **全面审计** | 对所有功能、语法、渲染逻辑、事件绑定进行全面审计和优化修复；包含空输入保护、正则安全增强、嵌套语法验证等 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |
| **示例与文档** | 更新 USAGE_GUIDE.md、README.md、FIX_SUMMARY.md；新增代码块属性扩展和 iframe:pre 文档 |

### v1.13.0 改进
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
| **组合上下标优化** | 缩小 `.xf_editor-supsub` 字号至 50%、调整 line-height 为 1.05、优化上标位置(bottom:0.1em)，视觉更紧凑协调 |
| **独立 HTML 输出增强** | `getHTML()` 和 `getPreviewedHTML()` 现可生成完全自包含的 HTML（内联所有 CSS：组合上下标、脚注、字帖、KaTeX 等），无需依赖外部 CSS/JS 文件 |
| **渲染管线优化** | `getPreviewedHTML()` 在需要内联样式/脚本时自动从 Markdown 完整重渲染，确保输出干净独立；`_getCoreStyles()` 补充脚注、字帖网格等缺失样式 |
| **滚动位置修复** | `modifyTableInMarkdown()` 和 `modifyImageSizeInMarkdown()` 修复 `cm.setValue()` 后定时器冲突导致滚动位置二次丢失的 Bug |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |
| **示例与文档** | 全部示例文件更新至 v1.12.0；新增复杂 HTML 提示演示；代码块语法修复；缺失依赖库补全；文档全面更新 |

### v1.11.0 改进
| 特性 | 说明 |
|------|------|
| **组合上下标语法** | 新增 `X<<下标>^<上标>>` 语法，同时显示下标和上标（如 X₂³），比分别使用 `^^` 和 `^` 更精确简洁 |
| **渲染管线一致性** | 修复 `getPreviewedHTML()` 缺失 `fixSmartypantsHTML`/`postProcessTaskLists`/`filterHTMLTags` 三个后处理步骤；修复 `xfEditor.markdownToHTML()` 缺失 `protectTeXSyntax`/`restoreTeXSyntax` TeX 保护步骤 |
| **代码审计** | 全面审计所有正则、嵌套语法、事件绑定，确认无新增风险点 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |

### v1.10.0 改进
| 特性 | 说明 |
|------|------|
| **工具栏修复** | 修复图片/视频/文件工具栏按钮失效问题（dialog.show() 提前 return bug）；修复 executePlugin 加载失败时未捕获异常导致静默失败|
| **弹窗全面美化** | 所有编辑模式弹窗现代化重设计：紫色渐变标题栏、圆形关闭按钮、多层柔和阴影、8px 圆角；表单输入 focus 紫色发光环；Primary 渐变提交按钮 + hover 上浮动画 |
| **XSS 安全加固** | 新增 `xfEditor.escapeHtml()` / `xfEditor.escapeAttr()` 工具函数；修复 Tooltip data-tooltip 属性注入、Link renderer href/title 注入、notify() HTML 注入、applyColor() 选区注入、图片/视频/文件块 URL 注入共 6 项安全漏洞 |
| **Link 安全协议阻断** | 活跃的 `javascript:` / `data:` / `vbscript:` 协议检测与阻断 |
| **ECharts 内存修复** | resize 事件命名空间改为基于 chart ID，支持统一 `.off("resize.xf_editor-echarts")` 彻底清理 |
| **新语法支持** | 上标 `^x^`、下标 `^^x^^`、字体大小 `!32!`、脚注 `[^name]` 四种新语法 |
| **帮助系统重写** | 帮助对话框内容全面更新为中文版，含完整快捷键表、配置项、API、事件列表 |
| **关于对话框增强** | 显示 v1.10.0 新特性概览、技术栈组件列表 |
| **上传功能优化** | 图片/视频/文件上传弹窗增强；图片粘贴上传支持；统一上传接口优化；PHP 上传类全面增强 |
| **示例页面完善** | 新增文件上传、视频上传、全部事件综合演示 3 个示例；at-links 页面中文详解；index.html 导航扩展 |
| **文档更新** | README、USAGE_GUIDE 全面更新至 v1.10.0 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |

### v1.9.0 改进
| 特性 | 说明 |
|------|------|
| **草稿弹窗美化** | 全新现代化 UI：渐变头部、卡片式列表、悬停动画；智能时间标签（刚刚/N分钟前/N小时前）；平滑入场/退场动画 |
| **悬浮提示修复** | 修复文本型 Tooltip `pointer-events:none` 导致 popup 无法拦截鼠标事件的问题，popup 与 trigger 之间鼠标平滑过渡 |
| **任务列表渲染修复** | `dangerousTags` 中移除 `input`，修复 Task List checkbox 被 XSS 过滤误删 |
| **独立预览 Tooltip** | xf_editor.preview.css 添加完整 Tooltip 样式（含箭头、图片/iframe 型） |
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
| **Unicode 行内对齐** | `⁑居中⁑` `⁑⁖左对齐⁖⁑` `⠪右对齐⠪` |
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
    <link rel="stylesheet" href="css/xf_editor.min.css" />
</head>
<body>
<div id="editor">
    <textarea style="display:none;">### 你好！
- 支持**粗体**和*斜体*
- `代码高亮`
- $E=mc^2$ 数学公式</textarea>
</div>
<script src="examples/js/jquery.min.js"></script>
<script src="xf_editor.min.js"></script>
<script>
$(function(){
    xfEditor("editor", {
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

**直接下载**：将 `css/` `xf_editor.min.js` `lib/` `fonts/` `images/` `languages/` `plugins/` 部署到 Web 服务器。

**npm**：`npm install xf_editor`

**AMD (Require.js)**：
```html
<script src="require.min.js"></script>
<script>
require.config({ paths: { xfEditor: "xf_editor.amd.min" } });
require(["xfEditor"], function(xfEditor) {
    xfEditor("editor", { path: "lib/" });
});
</script>
```

### 创建编辑器

```javascript
var editor = xfEditor("editor", {
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
<link rel="stylesheet" href="css/xf_editor.preview.min.css" />
<div id="preview"><textarea style="display:none;">### Hello</textarea></div>
<script src="jquery.min.js"></script>
<script src="xf_editor.min.js"></script>
<script src="lib/marked.min.js"></script>
<script src="lib/prettify.min.js"></script>
<script>
$(function(){ xfEditor.markdownToHTML("preview", {echarts:true,tabs:true}); });
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
| `grid` | `true` | 栅格化布局（[[row]]/[[col]]） |
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
| `getHTML([minify\|opts])` | 完整独立 HTML（含样式+脚本）；支持布尔简写 `getHTML(true/false)` |
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
| `xfEditor.$` | jQuery / Zepto 对象 |
| `xfEditor.marked()` | marked 解析器实例 |
| `xfEditor.isMarkdown(text)` | 判断是否为 Markdown 文本 |
| `xfEditor.defaults` | 全局默认配置对象 |
| `xfEditor.toolbarModes` | 工具栏预设模式 |
| `xfEditor.codeMirrorThemes` | 可用 CodeMirror 主题列表 |

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
支持 bar / line / pie / radar / funnel / **tree（树图/脑图）** 🆕v1.15

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

**拼音格 — 圆括号语法**（上方四线三格 + 下方米字格，用 `|` 分隔汉字与拼音）：
```markdown
[[copybookPinyin]]
(春眠不觉晓|chūn mián bù jué xiǎo)(处处闻啼鸟|chù chù wén tí niǎo)
[[/copybookPinyin]]
```

**拼音格 — 花括号语法 + 宽度参数** 🆕v1.17.8（推荐用于古诗文对齐）：
```markdown
[[copybookPinyin]]
{春眠不觉晓|chūn mián bù jué xiǎo}(!width:125)
{处处闻啼鸟|chù chù wén tí niǎo}(!width:125)
{夜来风雨声|yè lái fēng yǔ shēng}(!width:125)
{花落知多少|huā luò zhī duō shǎo}(!width:125)
[[/copybookPinyin]]
```

**字帖内嵌脚注** 🆕v1.17.8：
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
    xfEditor.plugin(function(xfEditor) {
        // 插件初始化代码
    });
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
| [KaTeX](https://khan.github.io/KaTeX/) (v0.16.9) | 数学公式渲染（字体已 Base64 内嵌，离线可用） |
| [prettify.js](https://github.com/google/code-prettify) | 代码语法高亮 |
| [Raphael.js](http://raphaeljs.com/) | SVG 矢量图形（流程图/时序图依赖） |
| [flowchart.js](http://flowchart.js.org/) | 流程图 |
| [sequence-diagram.js](https://bramp.github.io/js-sequence-diagrams/) | 时序图 |
| [underscore.js](http://underscorejs.org/) | 工具函数库 |
| [FontAwesome](http://fontawesome.io/) | 图标字体 |
| [ECharts](https://echarts.apache.org/) | 交互式图表 |

---

**最后更新**: 2026-07-01
**版本**: v1.17.10

### 最新优化 (2026-07-01)

| 优化项 | 说明 |
|--------|------|
| **代码块暗色主题** | pre 代码块使用暗色背景 (#1e1e1e)，取消圆角边框；行内 code 使用淡绿色背景 (#e6ffed) |
| **KaTeX 完全离线** | getHTML() 输出的 KaTeX 公式字体由 CDN 改为 Base64 内嵌，完全支持离线使用，无需任何外部网络请求 |
| **UI 全面升级** | 预览区/编辑区整体样式优化：代码块暗色滚动条、复制按钮暗色主题适配、API 文档页面美化 |
| **getHTML 智能输出** | 根据 Markdown 内容自动检测使用的语法特性，按需输出精简有效的 CSS/JS，不包含未使用功能的冗余代码 |
| **代码体积优化** | 合并重复代码，提高复用率，降低代码体积 |
| **构建产物** | 所有 .js/.css 和 .min 版本已重新编译压缩 |

