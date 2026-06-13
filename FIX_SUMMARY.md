# xfEditor 修复与优化总结

**当前版本**: v1.12.0  
**修复日期**: 2026-06-11  
**jQuery 版本**: 3.7.1  
**KaTeX 版本**: v0.16.9（已从旧版本升级）

---

## 📊 修复统计

### 第三十三轮修复（组合上下标优化 + 独立 HTML 输出增强 + 同步滚动加固 + 滚动位置修复 + 文档全更新）

**修复日期**: 2026-06-11

#### 1. 🎨 组合上下标样式优化

- **文件**: `scss/editormd.preview.scss`
- **变更**:
  - `font-size: 70%` → `50%`（字号缩小，视觉效果更紧凑）
  - `line-height: 1.15` → `1.05`（行高缩小，减少元素高度）
  - `sup bottom: 0.05em` → `0.1em`（上标下调至合适位置）
  - `sub top: 0.2em` → `0.12em`（下标微调，保持视觉平衡）
  - 内部 `sup, sub` 的 `line-height: 1.1` → `1.05`（同步缩小）

#### 2. 🚀 `getHTML()` / `getPreviewedHTML()` 独立输出增强

- **问题**: 生成的 HTML 缺少组合上下标、脚注、字帖等样式，依赖外部 CSS 文件
- **文件**: `src/editormd.js`
- **修复**:
  - `_getCoreStyles()` 新增 30+ 条 CSS 规则：组合上下标、脚注全部件（section/title/list/item/content/backref/ref-wrapper）、字帖网格（copybook/row/cell/svg/hanzi/pinyin 系列）
  - `getPreviewedHTML()` 新增 `forceRender` 策略：当需要内联样式/脚本时，始终从 Markdown 完整重渲染，而非使用预览区缓存（避免编辑器特定属性污染输出）
  - `getHTML()` 添加 `<meta name="generator">` 标签，标识版本信息
  - `_buildRendererOptions()` 补充 `video`、`fileList` 配置项

#### 3. 🔧 同步滚动加固

- **文件**: `src/editormd.js` (`bindScrollEvent` 函数)
- **问题**: 原实现使用 `mouseover/mouseout` 动态绑定/解绑，鼠标一离开编辑区即停止同步
- **修复**:
  - scroll 事件改为**始终绑定**（命名空间 `.editormd-sync`），双向同步持续有效
  - 加入 **`requestAnimationFrame` 节流**（`_rafPending` 标志），每帧最多一次同步
  - 互斥锁超时从 50ms → 80ms，更稳定
  - `destroy` 方法新增 `.editormd-sync` 命名空间事件解绑

#### 4. 🐛 图片缩放/表格编辑滚动位置丢失修复

- **文件**: `src/editormd.js` (`modifyTableInMarkdown` / `modifyImageSizeInMarkdown`)
- **根因**: `cm.setValue()` 同步触发 change 事件→设置 debounce timer→`this.timer = 0` 覆盖 timer ID→旧 timer 在 delay 后再次 `save()`→二次渲染无滚动恢复→页面跳回顶部
- **修复**: 在 `cm.setValue()` 前后各清除一次定时器，手动 `save()` + `scrollTop()` 恢复位置后设置 `timer = null`

#### 5. 📝 文档与示例更新

- `README.md`: 新增 v1.12.0 改进表
- `USAGE_GUIDE.md`: 版本号更新至 v1.12.0
- `FIX_SUMMARY.md`: 新增第三十三轮修复记录
- `examples/all-features.html`: 版本号更新至 v1.12.0
- `plugins/help-dialog/help.md`: 版本号更新

#### 6. 📦 构建产物

- 所有 `.js` / `.css` 和 `.min.js` / `.min.css` 已重新编译压缩
- JS: `editormd.js`(467K) / `.min.js`(181K) / `.amd.js`(470K) / `.amd.min.js`(182K)
- CSS: `editormd.css`(131K) / `.min.css`(105K) / `.preview.css`(75K) / `.preview.min.css`(61K)

---

### 第三十二轮修复（组合上下标语法 + 渲染管线一致性修复 + 构建产物重建）

**修复日期**: 2026-06-11

#### 1. ✨ 新增组合上下标语法 `<>>`

- **文件**: `src/editormd.js` (regexs 定义 + 渲染管线)
- **语法**: `X<<下标>^<上标>>` — 在 X 的右下角显示下标，右上角显示上标
  - 例如 `X<<2>^<3>>` 渲染为 X<sub>2</sub><sup>3</sup>（X₂³）
- **正则**: `/<([^>\n]+)>^<([^>\n]+)>>/g`
  - 两个捕获组：组 1 = 下标文本，组 2 = 上标文本
  - 限制不跨行，不包含 `>` 字符
- **处理**: 生成 `<sub>下标</sub><sup>上标</sup>` HTML
- **顺序**: 在所有上下标处理中**最先执行**（先于 `^^` 下标、`^` 上标），避免冲突
- **安全**: XSS 防护（`<`/`>` 转义）、长度限制各 100 字符、try/catch 包裹

#### 2. 🐛 `getPreviewedHTML()` 渲染管线不一致修复（关键修复）

- **问题**: 第 4473 行后的 `getPreviewedHTML()` 缺少三个关键后处理步骤：
  - ❌ 缺少 `fixSmartypantsHTML` — 弯引号不会被修正为 ASCII 引号
  - ❌ 缺少 `postProcessTaskLists` — 任务列表 `[ ]`/`[x]` 不会被渲染为 checkbox
  - ❌ 缺少 `filterHTMLTags` — XSS 过滤缺失，危险标签和协议未被清理
- **修复**: 在 `restoreTeXSyntax` 后追加三个步骤（与主预览管线一致）
- **影响范围**: `getPreviewedHTML()` 用于 HTML 导出、自定义 ToC 容器预览等场景

#### 3. 🐛 `editormd.markdownToHTML()` 渲染管线不一致修复

- **问题**: 独立 API `editormd.markdownToHTML()` 在第 9225 行缺少两个关键步骤：
  - ❌ 缺少 `protectTeXSyntax` — LaTeX 公式中的反斜杠会被 marked.js 当作转义符吃掉
  - ❌ 缺少 `restoreTeXSyntax` — 反斜杠占位符不会被还原
- **修复**: 在所有步骤之前添加 `protectTeXSyntax`，在 `restorePlaceholders` 之后添加 `restoreTeXSyntax`
- **影响范围**: 所有调用 `editormd.markdownToHTML()` 的外部 API 场景

#### 4. 📋 四条渲染管线一致性全面验证

| 管线 | protectTeX | preprocess | marked | restorePlaceholders | restoreTeX | fixSmartypants | taskList | filterHTML |
|------|:----------:|:----------:|:------:|:-------------------:|:----------:|:--------------:|:--------:|:----------:|
| `watch()` (主线) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `getRawHTML()` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `getPreviewedHTML()` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (FIXED) | ✅ (FIXED) | ✅ (FIXED) |
| `markdownToHTML()` | ✅ (FIXED) | ✅ | ✅ | ✅ | ✅ (FIXED) | ✅ | ✅ | ✅ |

#### 5. 📦 构建产物全部重建

- JS 源码重建：`editormd.js` (460K), `editormd.amd.js` (463K)
- 全部压缩：`editormd.min.js` (177K), `editormd.amd.min.js` (178K)
- CSS 编译/压缩：`css/editormd.css/.min.css`, `css/editormd.preview.css/.min.css`, `css/editormd.logo.css/.min.css`
- 示例更新：`examples/all-features.html` 新增组合上下标示例 + v1.11.0 更新日志

#### 涉及修改文件
- `src/editormd.js` — regexs 定义（新增 `supsub`）、渲染管线（新增组合上下标处理、修复两条管线）
- `examples/all-features.html` — 新增组合上下标示例、更新日志
- `FIX_SUMMARY.md` — 本文档
- 10 个构建产物文件

---

### 第三十一轮修复（全面代码审计 + 正则优化 + 事件泄漏修复 + 构建产物重建）

**修复日期**: 2026-06-10

#### 1. 🐛 Email 正则全面改进（兼容性修复）
- **问题**: 原 email 正则过于严格，不支持连字符域名、dots/plus 本地部分、多级 TLD
- **修复**: 扩展为 `/([\w\.\+\-]+)@([\w\-]+)\.([\w\-]{2,})\.?(\w+)?/g`

#### 2. 🔤 tooltipLink/tooltipImg 大小写修复
- **修复**: 添加 `i` 大小写不敏感标志

#### 3. 🔤 `atLink` 正则增强
- **修复**: `@(\w+)` → `@([\w\-]+)`，支持含连字符的用户名

#### 4. 🐛 `fontSize` 与图片语法冲突修复
- **问题**: `!32 text!` 可能误匹配 `![alt](url)` 中的 `!`
- **修复**: 添加回调 guard：`/^\[/.test(match)` 时跳过

#### 5. 🐛 `initColumns` 重复变量声明 Bug 修复（关键修复）
- **问题**: 重复声明覆盖了列数范围修正值
- **修复**: 删除重复的 `var count` 声明

#### 6. 🧹 事件内存泄漏全面修复（6 个泄漏点）
| 泄漏点 | 修复方式 |
|--------|----------|
| 工具栏滚动固定 | 命名空间 `scroll.editormd-autofixed` + destroy 清理 |
| F9/F10/F11 快捷键 | 命名空间 `keydown.editormd-fkeys` + destroy 清理 |
| 草稿对话框 resize | closeDialog 新增 `off("resize.editormdDraft")` |
| 通用对话框 resize | `.resize()` → `.on("resize.editormd-dialog")` |
| 下拉菜单关闭 | 命名空间 `click.editormd-dropdown` |
| Tooltip 事件 | destroy 新增 tooltip 事件清理 |

#### 7. 📦 构建产物全部重建
#### 8. 📋 完整代码审计确认
- ✅ `protectCodeBlocks()` 正确保护三种代码格式
- ✅ `superscript`/`subscript` 处理顺序正确
- ✅ `findBalancedBlocks` 支持 20 层递归嵌套
- ✅ 所有块处理有 try/catch 包裹

#### 涉及修改文件
- `src/editormd.js` — regexs、fontSize 回调、initColumns、事件、destroy
- 10 个构建产物文件

---

### 第三十轮修复（pageOpen 正则修复 + 全局重命名 + 关闭按钮 + 帮助/关于表更新）

**修复日期**: 2026-06-10

#### 1. 🐛 pageOpen 正则Bug修复（关键修复）
- **文件**: `src/editormd.js`
- **问题**: `pageOpen: /\[\[page:(A\d+|AN|LETTER|LEGAL)\]\]/gi` 不匹配带属性的 `[[page:A4 header="..." footer="..."]]` 语法（如 `[[page:A4 header="2024年度工作总结报告" footer="第 {page} 页 / 共 {total} 页"]]`），导致 `findBalancedBlocks` 找不到页面块
- **修复**: 更新为 `/\[\[page:(A\d+|AN|LETTER|LEGAL)(?:\s[^\]]*)?\]\]/gi`，支持可选属性匹配

#### 2. 🌐 全局重命名 `pandao` → `zhaoxianfang`
- **变更范围**: 40+ 文件，包含所有插件 `.js`、示例 `.html`、SCSS/CSS、语言包、文档
- **具体替换**:
  - `github.com/pandao` → `github.com/zhaoxianfang`
  - `pandao.github.io/editor.md/` → `github.com/zhaoxianfang/editor`
  - `@author pandao` → `@author zhaoxianfang`
  - `Author: Pandao` → `Author: zhaoxianfang` (SCSS/CSS 注释头)
- **例外**: 保留关于弹窗中的原项目归属声明（`https://github.com/pandao/editor.md` + `Editor.md`）

#### 3. 📛 全局重命名 `Editor.md` → `xfEditor`
- **变更范围**: 80+ 文件
- **修改内容**:
  - `editormd.title = "xfEditor"`
  - `editormd.homePage = "https://github.com/zhaoxianfang/editor"`
  - 所有注释中的 `[Editor.md]` 日志前缀 → `[xfEditor]`
  - 所有 JSDoc 注释中的 `Editor.md` → `xfEditor`
  - 语言包中的 `"Editor.md"` → `"xfEditor"`
  - 所有示例页面标题/描述中的 `Editor.md` → `xfEditor`
  - `"Editor.md Preview"` → `"xfEditor Preview"`
- **保留**: 关于弹窗归属声明中的 `Editor.md`

#### 4. 🎨 关闭按钮样式优化
- **文件**: `scss/editormd.dialog.scss`, `scss/editormd.preview.scss`
- **修改**:
  - 移除 `width`/`height` 固定尺寸 → 不强制圆形
  - 移除 `border-radius(50%)` → 不再圆形
  - 移除 `background`/`border` → 无边框和背景
  - **字体大小**: 基础从 `16px` → `24px`，草案弹窗从 `20px` → `24px`，预览从 `18px` → `24px`
  - hover 仅改变颜色和缩放，不再有背景变化

#### 5. 📖 帮助/关于弹窗内容更新
- **关于弹窗** (`createInfoDialog`):
  - 移除 v1.10.0 新特性展示块
  - 新增声明块：本项目基于 [Editor.md](https://github.com/pandao/editor.md) 改编
  - 更新仓库地址为 `https://github.com/zhaoxianfang/editor`
  - 版权更新为 `zhaoxianfang`
- **帮助弹窗** (`help.md`):
  - 标题更新为 "xfEditor 使用帮助"
  - 新增基于 Editor.md 改编的说明
  - 脚注更新为 "基于 Editor.md 改编"

#### 6. 📦 构建产物全部重建
- SCSS 重编译：`editormd.css`, `editormd.preview.css`, `editormd.logo.css`
- JS 源码重建：`editormd.js`, `editormd.amd.js`
- 全部压缩：所有 `.min.css` 和 `.min.js` 文件

#### 涉及修改文件
- `src/editormd.js` — pageOpen 正则、title/homePage、About 对话框、全部注释
- `scss/editormd.dialog.scss` — 基础 + 草案弹窗关闭按钮样式
- `scss/editormd.preview.scss` — 预览关闭按钮样式
- `scss/lib/prefixes.scss` — Author 头部
- `scss/editormd.themes.scss` — Editor.md → xfEditor
- 12 个插件 `.js` 文件 — `@author` 和 `{@link}` 更新
- `plugins/help-dialog/help.md` — 标题和归属更新
- 3 个语言包文件 — 名称和 URL 更新
- 71 个示例 `.html` 文件 — Editor.md→xfEditor + pandao→zhaoxianfang
- 示例 `.md`、`.css`、`.php`、`.js` 文件
- `README.md`、`FIX_SUMMARY.md`、`USAGE_GUIDE.md`、`JQUERY_3_UPGRADE.md`
- `Gulpfile.js`、`build-codemirror-bundles.js`、`test_comprehensive.js`
- 全部 10 个构建产物文件

---

### 第二十九轮修复（工具栏帮助/关于重写 + 全部示例完善 + 上传功能优化 + 构建产物重建）

**修复日期**: 2026-06-10

#### 1. 📖 "使用帮助"对话框全面重写
- **文件**: `plugins/help-dialog/help.md`
- **变更**: 从英文旧版（2015年）完全重写为中文 v1.10.0 完整参考文档
- **新增内容**（200+行）:
  - 核心功能快速参考表
  - v1.10.0 新语法详解（上标/下标/字体大小/脚注）
  - 完整键盘快捷键表（50+ 条目，含对齐快捷键）
  - 配置选项表（25+ 选项）
  - 事件回调列表（25+ 事件）
  - API 方法列表（20+ 方法）

#### 2. ℹ️ "关于"对话框增强
- **文件**: `src/editormd.js` → `createInfoDialog()`
- **变更**: 新增 v1.10.0 新特性高亮展示块、技术栈组件列表
- **版权**: 从 "2015" 更新为 "2015-2026"

#### 3. 🆕 新增 3 个专属示例页面
| 文件 | 功能 | 内容覆盖 |
|------|------|----------|
| `examples/file-upload.html` | 文件上传 | 6 章节：概述/格式/用法/上传流程/后端规范/安全建议 |
| `examples/video-upload.html` | 视频上传 | 7 章节：格式/用法/语法/HTML5播放器/后端API/注意事项 |
| `examples/event-handlers.html` | 事件系统 | 实时事件日志面板，演示所有 28 个事件回调 |

#### 4. 📄 示例页面全面重写
- **`examples/image-upload.html`**: 完全重写为 8 章节：概述/格式/用法/尺寸/粘贴上传/配置/后端API/安全
- **`examples/page-syntax.html`**: 新增完整 AN 纸张演示区、AN 特性表、配置代码示例；工具栏新增 page 下拉按钮
- **`examples/@links.html`**: 完全重写为中文详解，含功能说明表、配置方式、语法规则表、注意事项

#### 5. 🛠️ PHP 后端全面优化
- **`examples/php/upload.php`**: 新增 OPTIONS 预检、auto-creation 目录、扩展名检测 fallback、空文件检测、`expected_input_name` 错误提示
- **`examples/php/cross-domain-upload.php`**: 新增 OPTIONS 预检、auto-creation 目录、`name` 参数文档
- **`examples/php/post.php`**: 全新 UI（渐变/阴影/卡片）、行数/字符统计、debug 模式、安全转义
- **`examples/php/upload_callback.html`**: 全新状态图标 UI、文件名显示、延迟跳转反馈

#### 6. 📋 index.html 导航更新
- 事件区新增 `event-handlers.html` 为推荐链接
- 上传区新增 `file-upload.html`、`video-upload.html` 为推荐链接
- `image-upload.html` 描述更新

#### 7. 📦 构建产物全部重建
- `editormd.min.js` (176K) / `editormd.amd.min.js` (177K)
- `css/editormd.min.css` (105K) / `editormd.preview.min.css` (61K) / `editormd.logo.min.css` (1.5K)

#### 8. 📝 文档更新
- **`README.md`**: v1.10.0 改进表新增 5 行（新语法支持/帮助系统重写/关于增强/上传优化/示例和文档）
- **`USAGE_GUIDE.md`**: 日期更新至 2026-06-10

#### 涉及修改文件
- `plugins/help-dialog/help.md` — 完全重写为中文 v1.10.0 参考
- `src/editormd.js` — createInfoDialog 增强
- `examples/file-upload.html` / `video-upload.html` / `event-handlers.html` — **新建**
- `examples/image-upload.html` / `@links.html` / `page-syntax.html` / `index.html` — 重写/增强
- `examples/php/upload.php` / `cross-domain-upload.php` / `post.php` / `upload_callback.html` — 全面优化
- `README.md` / `USAGE_GUIDE.md` / `FIX_SUMMARY.md` — 文档更新
- 全部 10 个构建产物文件已重建

---

### 第二十八轮修复（示例页面完善 + 版本统一 + 新示例创建）

**修复日期**: 2026-06-10

#### 1. 📄 版本引用全面统一
- **全局搜索**: 15+ 个示例文件中存在旧版本 `v1.6.0` / `v1.7.0` / `v1.8.0` 引用
- **修复文件**:
  - `examples/all-features.html` — Tabs 变更日志扩展至 v1.10.0、JSON 版本号、行内版本文字
  - `examples/full-preview.html` — title/h1 标题、JS 代码示例、Tabs 变更日志、行内版本文字
  - `examples/api-reference.html` — title/h1 标题、文件上传章节标记
  - `examples/tabs.html` / `tooltip.html` / `video.html` — title 标题
  - `examples/image-resize.html` / `text-align.html` / `pinyin.html` / `table-edit.html` — title 标题
  - `examples/toolbar-reference.html` — title/h1 标题
  - `examples/echarts.html` / `columns.html` / `page-syntax.html` / `@links.html` — title/内容版本
- **保留**: Tabs 变更日志中的 "### v1.8.0" 等历史版本标记为正确

#### 2. 🆕 新增 3 个专属示例页面
| 文件 | 功能 | 内容覆盖 |
|------|------|----------|
| `examples/superscript-subscript.html` | 上标与下标 | 4 章节：数学公式上标、化学式下标、同位素组合、边界情况 |
| `examples/font-size.html` | 字体大小 | 4 章节：8-64px 基础演示、实用场景、与 Markdown 组合、边界测试 |
| `examples/footnote.html` | 脚注功能 | 5 章节：基础脚注、内联格式、标题脚注、多脚注、列表嵌套 |

#### 3. 📋 index.html 导航更新
- v1.10.0 新特性区新增 3 个 `featured` 推荐链接：上标与下标、字体大小、脚注功能
- 所有新增页面均带有图标和详细描述

#### 4. 📦 构建产物全部重建
- `editormd.min.js` (175.2 KB) / `editormd.amd.min.js` (176.5 KB)
- `css/editormd.min.css` (105.2 KB) / `editormd.preview.min.css` (61.1 KB) / `editormd.logo.min.css` (1.5 KB)

#### 涉及修改文件
- `examples/index.html` — 新增 3 个 v1.10.0 推荐链接
- `examples/all-features.html` — 版本更新 + 变更日志扩展
- `examples/full-preview.html` — 版本更新 + 变更日志扩展
- `examples/api-reference.html` — 版本更新
- `examples/tabs.html` / `tooltip.html` / `video.html` / `image-resize.html` / `text-align.html` / `pinyin.html` / `table-edit.html` / `toolbar-reference.html` — title 版本更新
- `examples/echarts.html` / `columns.html` / `page-syntax.html` / `@links.html` — 版本更新
- `examples/superscript-subscript.html` / `font-size.html` / `footnote.html` — **新建**
- 全部 14 个构建产物文件已重建

---

### 第二十七轮修复（公式弹窗去搜索 + 下拉菜单全方向溢出 + 示例完善 + 文档更新）

**修复日期**: 2026-06-10

#### 1. 🔍 公式弹窗删除搜索功能
- **变更**: 移除公式弹窗中的搜索栏（HTML 生成代码 + JS 搜索过滤事件处理 + SCSS 搜索样式）
- **删除位置**:
  - `src/editormd.js`: 移除 `formula-search-bar` HTML 生成（搜索框 + 搜索图标）
  - `src/editormd.js`: 移除 `$searchInput` 变量、`input` 和 `keydown` 事件处理（约 30 行）
  - `scss/editormd.dialog.scss`: 移除 `formula-search-bar`、`formula-search`、`formula-search-icon` 三组样式（约 35 行）
- **保留**: Tab 导航栏、分类面板、公式网格、底部自定义输入栏全部保留

#### 2. 🔧 下拉菜单全方向溢出彻底修复
- **根因分析**: 上轮已修复 `overflow: hidden` → `visible`，但仅做了右边缘检测；当菜单靠近底部边缘时，仍会被视口底部裁剪
- **修复措施**:
  - **CSS** 新增 `.editormd-dropdown-menu-up` 类（向上展开，top→bottom:33px，箭头翻转向下）
  - **JS** 双阶段检测：
    1. 第一阶段：检测右边缘 → 右对齐 (`.dropdown-menu-right`)
    2. 第二阶段（`requestAnimationFrame` 嵌套）：重新测量后检测底部溢出 → 向上展开 (`.dropdown-menu-up`)
    3. 最终：计算可用高度，动态设置 `max-height` 兜底
  - **清理**: 关闭时完整重置所有位置类和内联样式
- **效果**: 无论菜单在哪个位置打开（角落/边缘/小屏），都能自动适配方向

#### 3. 📄 示例页面全面完善
- **`examples/index.html`**:
  - 版本号 1.8.0 → 1.10.0
  - 重新组织分类：v1.10.0 新特性 / v1.7.0 增强功能
  - 新增"全部功能完整演示"置顶推荐链接
  - 公式面板描述更新为"11 分类、100+LaTeX、Tab切换、一键插入"
- **`examples/all-features.html`**:
  - 已覆盖所有 24 种语法：Markdown基础/表格/代码高亮(JS+Python+TS+Go+JSON)/ECharts 5类/Tabs/Columns/Tooltip/对齐/拼音/KaTeX/Flowchart/时序图/Video/附件/Image/HTML/分页/@链接/Copybook 3类/上标下标/字体大小/脚注
- **`examples/full-preview.html`**:
  - 版本号 1.8.0 → 1.10.0
  - 新增章节：上标与下标（^语法^/^^语法^^/组合）、字体大小（!字号!）、脚注功能

#### 4. 📦 构建与压缩
- 所有 SCSS → CSS 编译完成
- 所有 CSS → .min.css 压缩完成
- `build-amd.js` → `editormd.amd.js` 完成
- `editormd.js` + `editormd.amd.js` → `.min.js` 压缩完成
- 共 12 个文件全部重建

#### 涉及修改文件
- `src/editormd.js` — 删除公式搜索HTML+JS事件；增强下拉菜单全方向溢出检测
- `scss/editormd.dialog.scss` — 删除搜索相关样式（~35行）
- `scss/editormd.menu.scss` — 新增 `dropdown-menu-up` 向上展开类
- `examples/index.html` — 版本号 + 分类重组 + 描述更新
- `examples/all-features.html` — 保持完整覆盖
- `examples/full-preview.html` — 新增上标/下标/字号/脚注 + 版本号
- `FIX_SUMMARY.md` — 本更新记录
- 全部 12 个编译输出文件已重建

---

### 第二十六轮修复（公式弹窗样式 + 下拉菜单溢出 + 全面优化）

**修复日期**: 2026-06-10

#### 1. 🎨 公式弹窗全面样式化
- **根因**: 公式弹窗（`editormd-formula-*` 系列类）在项目中**没有任何 SCSS 样式定义**，完全依赖浏览器默认样式
- **修复**: 新增 17 组完整的公式弹窗样式规则（~250 行 SCSS），覆盖所有子组件：
  - **Tab 导航栏**：横向滚动 + 活跃态紫色下划线 + hover 高亮
  - **搜索栏**：图标定位 + focus 紫色边框 + 阴影光晕
  - **内容区**：可滚动 + 自定义滚动条
  - **公式网格**：`grid-template-columns: repeat(auto-fill, minmax(155px, 1fr))` 响应式网格
  - **公式卡片**：hover 上浮动画 + 紫色边框 + 阴影；块级公式（矩阵等）自动跨两列
  - **KaTeX 容器**：居中渲染 + 字号适配
  - **公式名称**：底部标签 + 分隔线
  - **底部栏**：flex 布局 + 模式切换 radio 按钮（选中态紫色高亮）
  - **自定义输入**：等宽字体 + focus 紫光 + 插入按钮渐变
- **效果**: 公式弹窗从裸 HTML 变为精美、功能完备的现代化 UI

#### 2. 🔧 下拉菜单溢出裁剪彻底修复
- **根因**: `.editormd` 容器设置 `overflow: hidden`，内部绝对定位的下拉菜单即使 `z-index: 10000` 也无法突破父容器的裁剪边界
- **修复**:
  - `.editormd` → `overflow: visible`（允许下拉菜单溢出）
  - `.editormd-container` 保持 `overflow: hidden`（编辑器内容区继续正确裁剪）
  - `.editormd-toolbar` → 显式 `overflow: visible`
  - 下拉菜单自身 `overflow-y: auto`（长列表可滚动）
- **JS 自动定位**: 新增 `requestAnimationFrame` 检测右边缘溢出 → 自动追加 `.editormd-dropdown-menu-right` 类（`left: auto; right: 0`）
- **动态高度限制**: 检测视口底部空间，自动设置 `max-height` 防止底部溢出

#### 3. ✅ 全面验证通过
- 所有 25 项 CSS 修复验证通过（公式弹窗 16 项 + 溢出/样式 9 项）
- 所有 JS 修复验证通过（自动定位 + 公式分类 + cm 安全）
- 编译后 CSS 含 50 处 `editormd-formula-*` 引用规则

#### 涉及修改文件
- `scss/editormd.scss` — `.editormd` overflow → visible；`.editormd-toolbar` overflow → visible
- `scss/editormd.dialog.scss` — 新增 250+ 行公式弹窗完整样式
- `scss/editormd.menu.scss` — 下拉菜单 `overflow-y: auto` + `.dropdown-menu-right` 右对齐
- `src/editormd.js` — 下拉菜单自动右边缘检测 + 动态 max-height
- 全部 12 个编译输出文件已重建

---

### 第二十五轮修复（全面验证 + 性能优化 + cm安全防护）

**修复日期**: 2026-06-10

#### 1. 🚀 同步滚动性能大幅优化
- **根因**: `buildLineMap()` 每次滚动都执行 DOM 查询（`.find()`），严重消耗性能
- **修复**: 实现智能缓存机制，基于 `scrollHeight + 元素数量` 哈希判断是否需要重建
- **效果**: 缓存命中时仅更新元素位置偏移，避免重复 DOM 遍历

#### 2. 🛡️ `cm` 空值安全防护
- **根因**: 某些边缘情况下 `this.cm` 可能为 `null`
- **修复**: `bindScrollEvent` 方法增加 `if (!cm) return this;` 空值守卫

#### 3. 🔄 全面重新构建
- 所有 SCSS → CSS 重新编译（editormd.css, preview.css, logo.css）
- 所有 JS 重新构建（editormd.js, editormd.min.js, editormd.amd.js, editormd.amd.min.js）
- 所有 CSS 重新压缩（editormd.min.css, preview.min.css, logo.min.css）

#### 4. ✅ 全面验证通过
- `cm is not defined` 错误已修复（`var cm = this.cm;` + null guard）
- Dialog container/Footer padding 正确（`4px 10px` / `4px 14px`）
- Form submit padding 正确（`6px 12px`）
- Dialog close 按钮样式优化（24x24px, hover 缩放效果）
- 下拉菜单 z-index 提升至 `10000` + `overflow: visible`
- 工具栏新增 A3/A4/A5 页面尺寸 + 流程图/时序图
- 颜色选择器样式完整编译

#### 涉及修改文件
- `src/editormd.js` — 同步滚动缓存优化 + cm 空值守卫
- 所有 CSS/JS 输出文件重新构建

---

### 第二十四轮修复（颜色选择器 + 弹窗样式 + 同步滚动 + 工具栏增强）

**修复日期**: 2026-06-10

#### 1. 🐛 颜色选择器CSS缺失修复
- **根因**: 颜色选择器样式未添加到 SCSS 文件中
- **修复**: 在 `scss/editormd.scss` 中添加完整的颜色选择器样式
- **样式**: 每行4个方格、渐变确认按钮、hover 上浮效果

#### 2. 🎨 弹窗样式优化
- `.editormd-dialog-container` padding 改为 `4px 10px`
- `.editormd-dialog-footer` padding 改为 `4px 14px`
- `.editormd-form input[type=submit]` padding 改为 `6px 12px`
- `.editormd-dialog-close` 尺寸调整为 `24x24px`，添加半透明背景

#### 3. 🐛 下拉菜单被遮挡修复
- **根因**: 下拉菜单 `z-index: 100` 太低
- **修复**: 提升至 `z-index: 10000`，添加 `overflow: visible`

#### 4. 🔧 工具栏新增功能
- 新增页面尺寸下拉菜单：A3、A4、A5 页面
- 新增流程图插入功能（`insert-flowchart`）
- 新增时序图插入功能（`insert-sequence`）
- 页面语法自动插入开始和结束标签

#### 5. 🐛 同步滚动 `cm is not defined` 修复
- **根因**: `bindScrollEvent` 方法中 `buildLineMap` 函数使用了未定义的 `cm` 变量
- **修复**: 在方法开头添加 `var cm = this.cm;`

#### 6. 📝 脚注样式优化
- 删除脚注返回链接（`.editormd-footnote-backref`）
- 删除脚注内容中的 `<br>` 换行显示
- 删除脚注引用悬浮虚线效果
- 脚注内容支持表格、代码块、引用、tabs、多栏等语法
- 优化脚注区 margin 和行高，减少空白

#### 涉及修改文件
- `src/editormd.js` — 工具栏配置、处理函数、同步滚动修复
- `scss/editormd.scss` — 颜色选择器样式
- `scss/editormd.dialog.scss` — 弹窗样式优化
- `scss/editormd.form.scss` — 按钮样式优化
- `scss/editormd.menu.scss` — 下拉菜单 z-index 修复
- `scss/editormd.preview.scss` — 脚注样式优化

---

### 第二十三轮修复（工具栏修复 + 弹窗美化 + 安全加固 + 全面审计）

**修复日期**: 2026-06-09

#### 1. 🐛 工具栏图片/视频/文件按钮失效（超级关键）
- **根因**: `image-dialog.js`、`video-dialog.js`、`file-dialog.js` 三个插件中 `if (!settings.imageUpload) { return; }` 在 `dialog.show()` 之前提前返回，导致弹窗创建但从未显示
- **修复**: 将上传相关代码包裹在条件判断内，`dialog.show()` 始终可执行

#### 2. 🐛 executePlugin 未捕获异常导致工具栏静默失败
- **根因**: `loadScript.onerror` 在加载失败时仍调用 callback，callback 中 `_this[name](cm)` 因 `_this[name]` 为 `undefined` 抛 `TypeError`
- **修复**: 添加 `typeof _this[name] !== "function"` 检查 + 所有插件调用包裹 try/catch + notify 错误提示

#### 3. 🔒 XSS 安全加固（6 项）
- **Tooltip `data-tooltip` 属性注入**: 用户可控 `tooltipContent` 直接拼入 HTML 属性 → 使用 `editormd.escapeAttr()` 转义
- **Link renderer `href`/`title` 注入**: `sanitize: false` 使死代码协议检查失效 → 添加活跃 `javascript:`/`data:`/`vbscript:` 协议阻断 + `editormd.escapeAttr()` 全属性转义
- **`editormd.notify()` 原始 HTML 注入**: `message` 拼接入 HTML → 改用 `.text()` 安全插入
- **`applyColor()` 选区注入**: 编辑器选区未转义插入 HTML → 颜色值验证 + HTML 转义
- **图片/视频/文件块 URL 转义不完整**: 仅转义 `"` → 使用 `editormd.escapeAttr()` 完整转义 `&<>"'`
- **新增工具函数**: `editormd.escapeHtml()` 和 `editormd.escapeAttr()`

#### 4. 🧠 ECharts resize 事件内存泄漏
- **根因**: 随机后缀命名空间 `resize.editormd-echarts-{random}` 导致 `.off()` 无法匹配清理
- **修复**: 改为基于 chart ID 的命名空间 `resize.editormd-echarts.{id}`，支持统一 `.off("resize.editormd-echarts")` 清理

#### 5. 🎨 编辑模式弹窗全面美化
- **Dialog 基础样式**: `border-radius: 3px→8px`、多层柔和阴影、`overflow:hidden`、系统字体
- **Dialog Header**: 紫色渐变 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`、白色标题、装饰符号
- **Dialog Close**: 圆形按钮 + 半透明 hover 背景
- **Dialog Container**: 优化 padding `24px`、标题样式、表单输入美化（圆角 6px、focus 发光环）
- **Dialog Footer**: flex 布局 + `gap: 10px` + 浅灰背景
- **Dialog Info**: 蓝色渐变头部 + 优化链接样式
- **Form 按钮**: 渐变色 primary 按钮 + hover 上浮 + `box-shadow` 光晕
- **表单输入**: border-color 过渡 + focus `box-shadow` 紫色发光环
- **危险按钮**: 红框 outline 样式 + hover 填充

#### 6. ✅ 脚注编号验证
- 经审计确认脚注使用 `push` 方法按顺序添加，编号顺序正确

#### 涉及修改文件
- `plugins/image-dialog/image-dialog.js` — 上传条件修复
- `plugins/video-dialog/video-dialog.js` — 上传条件修复
- `plugins/file-dialog/file-dialog.js` — 上传条件修复
- `src/editormd.js` — executePlugin / XSS / 内存泄漏 / URL转义 / 工具函数 / 版本号
- `scss/editormd.dialog.scss` — 弹窗样式全面美化
- `scss/editormd.form.scss` — 表单按钮样式美化
- `css/editormd.css` / `css/editormd.min.css` — 重新编译
- `css/editormd.preview.css` / `css/editormd.preview.min.css` — 重新编译
- `editormd.js` / `editormd.min.js` — 重新构建
- `editormd.amd.min.js` — 重新构建
- `package.json` — 版本号更新至 1.10.0

---

### 第十九轮修复（脚注系统全面重写 + 占位符修复 + 样式优化）
- 🐛 **修复上标/下标显示为 `<!--editormd-cb-N-->`** — 根本原因：代码块占位符 `<!--...-->` 被 smartypants 将 `--` 转为 `—`，且脚注处理在代码块恢复之前执行导致占位符泄露到脚注内容中
- ✅ **脚注处理移至 `restoreCodeBlocks` 之后** — 确保代码块先恢复，脚注内容不再包含占位符
- ✅ **脚注定义边界重写** — 使用 `\n\n`（空行）作为定义内容边界，不再吞噬相邻段落
- ✅ **脚注内容不会跨越到下一个定义** — 最近的空行或下一个定义作为内容终点
- ✅ **脚注 HTML 格式优化** — 内容中换行转 `<br>`，避免 marked.js `breaks:true` 产生多余 `<br>` 标签
- ✅ **脚注锚点 ID 加前缀** — `editormd-fnref-N` / `editormd-fn-N`，避免与页面其他元素冲突
- ✅ **点击跳转修复** — 统一的 `<a href="#...">` 锚点，支持双向跳转（引用↔定义）
- ✅ **正则 `lastIndex` 显式重置** — 上标/下标/脚注引用正则使用时重置状态，防止全局匹配异常
- ✅ **脚注引用样式独立** — `.editormd-footnote-ref-wrapper` 区分于普通 `<sup>` 标签
- ✅ **脚注 CSS 全面重写** — 圆标编号、卡片式布局、柔和高亮动画、hover 交互
- ✅ **all-features.html 脚注示例格式优化** — 确保定义间有空行分隔

### 第十八轮修复（新语法支持 + 同步滚动优化 + 脚注系统）
- ✅ **上标语法 `^内容^`** — 正则为 `\^([^^]+)\^`，渲染为 `<sup>` 标签
- ✅ **下标语法 `^^内容^^`** — 正则为 `\^\^([^^]+)\^\^`，渲染为 `<sub>` 标签
- ✅ **字体大小语法 `!数字 文本!`** — 正则为 `!(\d+)\s+([^!]+)!`，字号范围 8-200px
- ✅ **脚注引用 `[^名称]`** — 渲染为可点击上标链接，跳转到页面底部
- ✅ **脚注定义 `[^名称]:内容`** — 手动解析定义锚点，提取多行内容，文末有序列表展示
- ✅ **脚注自动编号** — 定义按出现顺序编号，未定义引用保持原样
- ✅ **脚注 CSS 样式** — 完整的脚注列表样式、链接样式、target 高亮动画
- ✅ **同步滚动算法优化** — 编辑器→预览：使用实际滚动比例替代行号比例
- ✅ **同步滚动预览→编辑器** — 使用实际像素比例映射，不再依赖行坐标计算
- ✅ **同步滚动边界处理** — 优化顶部/底部检测，滚动更精准
- ✅ **脚注解析健壮性** — 从后往前处理定义避免索引偏移
- ✅ **脚注 XSS 防护** — 内容转义 `&<>`，内联格式白名单（粗体/斜体/代码）
- ✅ **all-features.html 全面更新** — 添加新语法示例（二十二~二十四节）
- ✅ **README.md 文档更新** — 添加上标/下标/字体大小/脚注使用说明
- ✅ **全部文件重新构建** — JS/CSS 编译压缩

### 第二十二轮修复（全面代码审计 + 5 项关键修复）

- 🔍 **全面代码审计** — 使用 code-explorer 对 `src/editormd.js` 和 `examples/all-features.html` 进行逐行审计
- 🐛 **围栏代码块正则不支持 CommonMark 闭合规则** — 原 `\1` 反向引用要求精确匹配，闭合围栏数量多于开启围栏时匹配失败
- ✅ **修复围栏代码块正则** — 改用独立捕获 + 类型/数量验证 + `(?=\s*(?:\n|$))` 换行断言，支持 CommonMark 规范
- 🐛 **脚注内联 Markdown 处理顺序错误** — 粗体/斜体先行导致 `` `**MIT**` `` 被错误解析为 `<code><strong>MIT</strong></code>`
- ✅ **修复脚注内联处理顺序** — 行内代码优先处理，并用占位符保护 `<code>` 块防止粗体/斜体二次匹配
- 🐛 **pageFooter 属性转义不完整** — 缺少 `&` → `&amp;` 步骤，裸 `&` 在 HTML 属性中不合法
- ✅ **完善 pageFooter 转义链** — 添加 `replace(/&/g, "&amp;")` 为首步
- 🐛 **函数命名拼写错误** — `getToolbarHandles` 缺少字母 'r'（应为 `getToolbarHandlers`）
- ✅ **修正函数命名** — 函数定义 + 2 处调用点统一改为 `getToolbarHandlers`
- ✅ **22 项综合功能测试全部通过** — 脚注顺序、围栏代码块、上标/下标、内联处理、HTML 转义、工具栏处理器
- ✅ **全部编译通过** — JS/CSS/AMD

### 第二十一轮修复（工具栏失效 + 脚注顺序 + 占位符泄露 — 超级关键 Bug）

- 🐛 **根因：`getToolbarHandles` 使用未定义变量** — 第1441行使用 `toolbarIconHandlers[name]`，但该变量不存在，导致整个工具栏处理器系统失效，所有工具栏按钮点击无响应
- ✅ **修复工具栏处理器** — 将 `toolbarIconHandlers[name]` 改为 `toolbarHandlers[name]`
- 🐛 **脚注编号顺序反转** — 使用 `unshift` 在数组开头插入，导致脚注顺序为 3, 2, 1 而非 1, 2, 3
- ✅ **修复脚注顺序** — 将 `footnoteOrder.unshift(dm.name)` 改为 `push`，保持原始出现顺序
- 🐛 **脚注内容中显示占位符** — 脚注内容在代码块保护阶段被提取，其中的行内代码 `` `MIT` `` 还是占位符形式 `<!--editormd-cb-N-->`
- ✅ **恢复脚注内容中的占位符** — 在处理脚注内容时调用 `restoreCodeBlocks(fnContent, codeProtection.placeholders)` 恢复行内代码等
- ✅ **全部编译通过**

### 第二十轮修复（上标/脚注互扰修复 — 关键 Bug）

- 🐛 **根因：上标正则贪婪匹配跨文本** — `/\^([^^]+)\^/g` 从 `[^fn1]` 中的 `^` 匹配到 `[^fn2]` 的 `^`，吞掉中间所有内容，同时也破坏脚注定义的解析
- ✅ **处理顺序重排** — 脚注处理移到上标/下标之前，确保 `[^name]` 先被替换为 HTML，上标正则运行时不再看到 `[^name]` 中的 `^` 字符
- ✅ **正则在 `[^^]` 中排除换行符** — `/[^^\n]+/` 防止上标/下标跨行贪婪匹配
- ✅ **sub/sup 正则限行** — `superscript: /\^([^^\n]+)\^/g`，`subscript: /\^\^([^^\n]+)\^\^/g`
- ✅ **完全重构 `preprocessMarkdownBlocks` 内部顺序**：
  1. 保护代码块（`protectCodeBlocks`）
  2. 块级语法（tabs/columns/page）
  3. **脚注定义解析 + 引用替换**（新位置）
  4. 下标 → 上标 → 字体大小
  5. 恢复占位符 + 代码块
- ✅ **全部编译通过**

### 第十七轮修复（事件处理增强 + 语法处理优化 + 边界检查完善）
- ✅ **findBalancedBlocks 边界检查** — 参数验证、正则异常捕获、文本长度限制
- ✅ **递归深度警告** — 嵌套超过 20 层时输出警告日志
- ✅ **文本长度安全限制** — 100万字符上限防止性能问题
- ✅ **initTabs/initColumns/initPages 边界检查** — 容器存在验证
- ✅ **列数范围验证** — columns 限制 1-12 列，超出时自动修正
- ✅ **标签页数量限制** — tabs 最多 50 个标签页
- ✅ **图片尺寸验证** — imageResize 参数校验、XSS 防护增强
- ✅ **字帖类型验证** — copybook 类型白名单检查
- ✅ **纸张类型验证** — page 纸张规格白名单检查
- ✅ **视频/文件数量限制** — video 最多 50 个、file 最多 100 个
- ✅ **URL 长度验证** — 视频/文件 URL 最大 2000 字符
- ✅ **全面 try-catch 包裹** — 所有语法处理添加异常捕获
- ✅ **console.warn 日志** — 所有异常输出友好警告信息
- ✅ **全部文件重新构建** — JS/CSS 编译压缩

### 第十六轮修复（纸张页面语法增强 + 快捷键完善 + 文档更新）
- ✅ **修复 `[[page:AN]]` 语法无法识别** — 正则更新支持 AN/LETTER/LEGAL
- ✅ **添加 AN 纸张尺寸定义** — 等同于 A4（794×1123px）
- ✅ **添加对齐快捷键** — Ctrl+Alt+L/C/R/J 四种对齐方式
- ✅ **创建拼音参照表页面** — 声母/韵母/声调完整列表
- ✅ **创建 USAGE_GUIDE.md** — 完整使用指南文档
- ✅ **更新 examples/index.html** — 添加拼音参照表链接
- ✅ **全部文件重新构建** — JS/CSS 编译压缩

### 第十五轮修复（表格编辑修复 + 页面语法增强 + 预览模式优化）
- ✅ **表格编辑按钮定位修复** — 移除 `editormd.scss` 中旧版冲突 CSS（~50 行）
- ✅ **表格编辑 CSS 整合** — 将表格编辑样式移至 `editormd.preview.scss`，纳入 SCSS 编译管道
- ✅ **初始化顺序修正** — `initPages()` 在 `initTableEdit()` 之前执行，避免 DOM 重建导致事件丢失
- ✅ **按钮定位边界保护** — 增加 `Math.max()` 防止负值偏移
- ✅ **页头页脚支持** — `[[page:A4 header="标题" footer="第 {page} 页"]]` 支持配置页头页脚
- ✅ **页码占位符** — `{page}` 当前页码、`{total}` 总页数自动替换
- ✅ **分页后页头页脚渲染** — 自动分页后每页正确显示页头页脚
- ✅ **预览模式编辑禁用** — 新增 `previewOnly` 配置项，纯预览模式禁用表格编辑/图片缩放
- ✅ **自动检测预览模式** — 当 `watch: false` 且 `toolbar: false` 时自动禁用编辑功能
- ✅ **examples/index.html 完善** — 添加纸张页面示例链接，优化展示布局
- ✅ **page-syntax.html 更新** — 展示页头页脚功能，完善使用说明
- ✅ **README 文档更新** — 页头页脚语法说明、配置项文档
- ✅ **全部文件重新构建** — JS/CSS 编译压缩

### 第十四轮修复（代码去重 + 新语法 + 嵌套增强 + 全面优化）
- ✅ **CSS 代码去重** — 移除 `editormd.scss` 与 `editormd.preview.scss` 重复的 tooltip 样式定义（~40行重复代码）
- ✅ **SCSS 变量规范化** — `editormd.grid.scss` 和 `editormd.tab.scss` 硬编码类名改为 `$prefix` 变量
- ✅ **新增 `[[page:A4]]` / `[[page:A5]]` 语法** — 纸张页面布局，支持 A0~A8、LETTER、LEGAL 规格
- ✅ **页面内容自动换行** — 超出纸张宽度内容自动换行展示
- ✅ **高度溢出自动分页** — 内容超过纸张高度时智能分割为多页，页间距 4px
- ✅ **纸张水印** — 每页右下角显示纸张规格标识
- ✅ **嵌套语法增强** — `[[page]]` 内可嵌套 `[[tabs]]` / `[[columns]]` / `[[copybook]]`，反之亦然
- ✅ **递归渲染支持** — 页面内容通过完整的 markdown 渲染管道递归处理
- ✅ **打印样式** — @media print 适配，分页打印支持
- ✅ **响应式适配** — 小屏幕自动缩放纸张尺寸
- ✅ **`pageBlock` 配置选项** — 新增设置项控制纸张页面语法启用/禁用
- ✅ **文档完善** — README 新增纸张页面语法说明和示例
- ✅ **全部文件重新构建** — JS/CSS 编译压缩

### 第十三轮修复（草稿弹窗 UI/UX 全面升级）
- ✅ **草稿弹窗美化** — 全新现代化 UI 设计，渐变头部、卡片式列表、悬停动画
- ✅ **时间标签优化** — 智能时间显示（刚刚、N分钟前、N小时前、N天前）
- ✅ **入场/退场动画** — 平滑缩放淡入淡出效果，支持 ESC 关闭动画
- ✅ **响应式定位** — 窗口大小改变自动重新居中
- ✅ **确认提示增强** — 清除草稿前增加确认对话框
- ✅ **选中视觉反馈** — 点击草稿时高亮显示恢复状态
- ✅ **语言文案优化** — 中文/英文/繁中更友好的按钮文案
- ✅ **CSS 样式增强** — SCSS 添加完整的 `.editormd-draft-*` 样式族
- ✅ **滚动条美化** — 草稿列表自定义滚动条样式
- ✅ **文件构建更新** — 所有 .js/.css 重新编译压缩

### 第十二轮修复（全面系统审查与优化）
- ✅ **Tooltip 核心修复** — `pointer-events:none` → `auto`，popup 与 trigger 平滑交互，支持点击 popup 内元素，独立导出支持
- ✅ **Task List 渲染修复** — `dangerousTags` 移除 `input`，`allowedTags` 新增 `input`/`video`/`source`
- ✅ **XSS 安全增强** — 白名单新增 `video`、`source`、`input` 标签及属性
- ✅ **KaTeX 安全防护** — else 分支 `typeof katex !== "undefined"` 检查
- ✅ **ECharts 内存优化** — resize 事件使用命名空间+debounce 防重复绑定
- ✅ **Columns 独立导出** — 独立 HTML 新增 `initColumns` 函数，`reInitHiddenContent` 支持 Columns 重新初始化
- ✅ **loadScript 失败告警** — onerror 记录失败脚本到 `loadFiles.failed`，警告输出
- ✅ **initTabs 事件修复** — 实例方法添加 `.off()` 防止重复绑定
- ✅ **katexRender 守卫优化** — 放宽 timer 检查，支持异步回调时渲染
- ✅ **flowchartTimer 守卫一致性** — FlowChart/SequenceDiagram 独立判断
- ✅ **静默错误告警** — FlowChart/SequenceDiagram 重渲染 catch 块输出 console.warn
- ✅ **废弃 API 更新** — `escape()` → `encodeURIComponent()`，`substr()` → `slice()`
- ✅ **非标准 CSS 修复** — `inline-ruby` → `ruby`（pinyin 显示）
- ✅ **死代码清理** — 移除 image renderer 中未使用的 `style` 变量
- ✅ **Tooltip 样式完善** — preview SCSS 添加完整 Tooltip 样式（trigger/popup/arrow/image/iframe/loading）
- ✅ **示例文件更新** — 4 个示例文件新增 v1.7.0+ 功能配置
- ✅ **文档更新** — README.md v1.8.0 改进记录，FIX_SUMMARY.md 本次修复日志

### 核心文件修复
- ✅ `src/editormd.js` - 核心源文件（多轮修复）
- ✅ `editormd.js` - 编译后完整版
- ✅ `editormd.min.js` - 压缩版
- ✅ `editormd.amd.js` - AMD 模块版本
- ✅ `editormd.amd.min.js` - AMD 压缩版

### 草稿弹窗相关文件
- ✅ `src/editormd.js` - `showDraftRecovery()` 方法全面重构
- ✅ `scss/editormd.dialog.scss` - 新增草稿弹窗完整样式
- ✅ `css/editormd.css` / `css/editormd.min.css` - 重新编译
- ✅ `languages/zh-cn.js` / `zh-tw.js` / `en.js` - 更新多语言文案

### KaTeX 升级
- ✅ `lib/katex/katex.min.js` - 升级至 v0.16.9
- ✅ `lib/katex/katex.min.css` - 升级至 v0.16.9
- ✅ `lib/katex/fonts/` - 60 个字体文件全部更新

### CSS 文件修复
- ✅ `css/editormd.css` - 全面优化公式弹窗样式
- ✅ `css/editormd.min.css` - 重新生成压缩版
- ✅ `css/editormd.preview.css` - 删除 `.editormd-column-divider-icon` 样式
- ✅ `css/editormd.preview.min.css` - 重新生成压缩版

### 示例文件完善
- ✅ `examples/formula.html` - 公式插入示例（重写，更全面）
- ✅ `examples/index.html` - 首页（更新公式功能描述）
- ✅ `examples/all-features.html` - 完善所有示例（13个）
- ✅ `examples/full-preview.html` - 完善预览页面
- ✅ `examples/tabs.html` - Tabs 标签页示例
- ✅ `examples/columns.html` - 多栏布局示例

### 文档更新
- ✅ `README.md` - 更新文档
- ✅ `JQUERY_3_UPGRADE.md` - jQuery 升级文档
- ✅ `FIX_SUMMARY.md` - 本修复总结

---

## 🔧 修复内容详解

### 第一轮修复：jQuery 3.7 升级兼容性

#### 1. 选择器语法修复
**问题**: `Uncaught Error: Syntax error, unrecognized expression: a[href*=#]`

**修复**:
```javascript
// 修复前
$("a[href*=#]").bind(clickOrTouch(), function() { ... });

// 修复后
$("a[href*='#']").on(clickOrTouch(), function() { ... });
```

#### 2. 事件绑定方法升级
- `.bind()` → `.on()` (71+ 处)
- `.unbind()` → `.off()` (5+ 处)

---

### 第二轮修复：Marked sanitize 导致占位符转义

**问题**: `[[tabs]]` 和 `[[columns:N]]` 渲染结果为 `<!--editormd-ph-1-->`

**根因**: marked v0.3.3 的 `sanitize: true` 会将 HTML 注释转义为 `&lt;!--editormd-ph-1--&gt;`

**修复**: 将 `src/editormd.js` 中所有 4 处 `sanitize: (settings.htmlDecode) ? false : true` 改为 `sanitize: false`

**影响行号**: 2465, 3672, 4224, 7030

---

### 第三轮修复：语法嵌套与代码块保护

#### 1. `findBalancedBlocks` 嵌套检测逻辑完善
**问题**: 当 columns/tabs 内容中含有类似 `[[columns:3]]` 的普通文本（无匹配 `[[/columns]]`）时，原算法将其计入嵌套 depth

**修复**: 新增 `hasMatchingPair()` 递归预检查函数，验证嵌套开标签是否有对应的闭标签对

#### 2. `protectCodeBlocks` 代码块保护加强
**问题**: 原正则不完整，无法正确处理多反引号围栏代码块和行内代码

**修复**:
- 围栏代码块正则: `` /(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?\1/g ``
- 多反引号行内代码: `` /(`{2,})([\s\S]*?)\1/g ``
- 单反引号行内代码: `` /`([^`\n]+)`/g ``

#### 3. 递归调用代码块占位符恢复修复（本轮新增）
**问题**: `preprocessMarkdownBlocks` 递归处理 columns/tabs 内部内容时，代码块占位符（`<!--editormd-cb-N-->`）丢失，导致行内代码 `` `[columns:2]` `` 未被正确渲染为 `<code>` 标签

**修复**: 在递归调用 `preprocessMarkdownBlocks` 之前，先恢复上层保护的代码块占位符：
```javascript
// 在递归处理前，先恢复上层保护的代码块占位符
var colContentRestored = restoreCodeBlocks(colContent.trim(), codeProtection.placeholders);
var preprocessed = editormd.preprocessMarkdownBlocks(colContentRestored, options);
```

**影响位置**:
- 行 5969: tabs 内部递归调用
- 行 5982: tabs 无标签页时的递归调用
- 行 6012: columns 内部递归调用

---

### 第四轮修复：渲染器逻辑完善

#### 1. `markedRenderer.link` video 标签修复
**问题**: `<video ...>` 标签末尾的 `>` 导致 `title` 属性被置于标签外

**修复**: 将 `>` 从开标签末尾移至 `title` 属性拼接之后

#### 2. `markedRenderer.paragraph` isTeXInline 正则修复
**问题**: `` /\$\$(.*)\$\$/g.test(text) `` 中 `g` 标志导致 `.test()` 时 `lastIndex` 累积

**修复**: 移除 `g` 标志 → `` /\$\$(.*)\$\$/.test(text) ``

#### 3. `markedRenderer.heading` 中文标题处理修复
**问题 1**: `/^[\u4e00-\u9fa5]+$/.test(tocText)` 仅当标题全为纯中文时返回 true

**修复**: 改为 `/[\u4e00-\u9fa5]/.test(tocText)` 检测是否包含中文

**问题 2**: `tocText.toLowerCase().replace(/[^\w]+/g, "-")` 会移除所有中文字符

**修复**: `tocText.replace(/[^\u4e00-\u9fa5\w\s]+/g, "").replace(/\s+/g, "-")`

#### 4. `atLinkReg` 全局正则 `lastIndex` 问题修复
**问题**: `/@(\w+)/g` 在 `.test()` 后 `lastIndex` 未重置

**修复**: 在 `atLink` 和 `link` 方法中每次 `.test()` 后执行 `atLinkReg.lastIndex = 0`

**影响位置**: 行 6118, 6122, 6279, 6281, 6283

---

### 第五轮修复：HTML 过滤与安全

#### 1. `filterHTMLTags` dangerousTags 修复
**问题**: `<video>` 和 `<audio>` 被列入 `dangerousTags`，导致编辑器生成的视频/音频播放器被删除

**修复**: 从 `dangerousTags` 中移除 `'video'` 和 `'audio'`

#### 2. `filterHTMLTags` allowedTags 重复修复
**问题**: `input` 标签同时在 `allowedTags` 和 `dangerousTags` 中，`dangerousTags` 先执行导致 `allowedTags` 中的条目无效

**修复**: 从 `allowedTags` 中移除 `'input'`

---

### 第六轮修复：功能优化

#### 1. 删除 `.editormd-column-divider-icon` 元素
**问题**: 分栏布局的分隔线包含不必要的图标元素

**修复**:
- JS: 移除 span 子元素（改为纯 div）
- CSS: 删除 `.editormd-column-divider-icon` 样式规则

#### 2. 默认使用中文语言
**修复**: `full-features-demo.html` 默认加载 `zh-cn.js`

#### 3. `getHTML()` 与 `getPreviewedHTML()` 职责区分
**修复**:
- `getHTML()`: 输出完整独立 HTML 文档（含 DOCTYPE、html、head、body、title、meta）
- `getPreviewedHTML()`: 输出内容片段，新增 `fullPage`、`rawMarkdown`、`title` 选项

#### 4. `markedRenderer.code` 语言识别完善
**修复**: 扩展语言名映射
- `seq`/`sequence`/`sequenceDiagram` → sequence
- `flow`/`flowChart` → flowchart

---

### 第七轮新增：工具栏公式插入 + 事件回调扩展

#### 1. 新增工具栏"插入公式"功能
**功能描述**: 点击工具栏中的"插入公式"按钮（计算器图标 `fa-calculator`），弹出公式选择面板

**面板功能**:
- **8 个公式分类**: 代数公式、微积分、三角函数、集合与逻辑、概率统计、矩阵、希腊字母、括号与特殊符号
- **搜索过滤**: 顶部搜索框实时过滤公式项
- **一键插入**: 点击公式自动插入到编辑器光标位置，自动判断行内（`$...$`）或块级（`$$...$$`）格式
- **自定义公式**: 面板底部支持输入任意 LaTeX 公式后插入

**涉及的修改**:
- `src/editormd.js`: 添加 `toolbarIconsClass.formula`、`toolbarModes.full` 按钮、`toolbarHandlers.formula` 方法
- `css/editormd.css`: 添加 `.editormd-formula-dialog` 系列样式（约 180 行）
- `languages/zh-cn.js`: 添加 `formula: "插入公式"` 语言包文本
- `examples/formula.html`: 新增公式插入示例文件

#### 2. 新增 4 个事件回调接口
**新增事件**:

| 事件 | 触发时机 | 说明 |
|------|----------|------|
| `onEditorLoad` | 编辑器加载完成（包括 CodeMirror 初始化） | 在 `onload` 之后立即触发 |
| `onPageLoad` | 当前网页 DOM 加载完成 | 在 `$(document).ready()` 中触发 |
| `onAllAsyncLoad` | 编辑器所有异步加载完成 | KaTeX、FlowChart、SequenceDiagram、ECharts 等模块加载完成后触发一次 |
| `onPageAllLoad` | 网页所有资源加载完成 | 在 `$(window).on('load')` 中触发 |

**实现方式**:
- `onEditorLoad`: 在 `loadedDisplay()` 方法中 `onload` 之后触发
- `onPageLoad`: 在 `loadedDisplay()` 中用 `$(function(){})` 触发
- `onAllAsyncLoad`: 添加 `_asyncLoadCount` 计数器，跟踪 KaTeX、FlowChart、ECharts 等异步加载，全部完成后触发
- `onPageAllLoad`: 在 `loadedDisplay()` 中绑定 `$(window).on('load', ...)` 触发

**示例用法**:
```javascript
editormd("editor", {
    onEditorLoad: function() {
        console.log("编辑器加载完成");
    },
    onPageLoad: function() {
        console.log("网页 DOM 加载完成");
    },
    onAllAsyncLoad: function() {
        console.log("所有异步模块加载完成");
    },
    onPageAllLoad: function() {
        console.log("网页所有资源加载完成");
    }
});
```

---

#### 1. 删除 `.editormd-column-divider-icon` 元素
**问题**: 分栏布局的分隔线包含不必要的图标元素

**修复**:
- JS: 移除 span 子元素（改为纯 div）
- CSS: 删除 `.editormd-column-divider-icon` 样式规则

#### 2. 默认使用中文语言
**修复**: `full-features-demo.html` 默认加载 `zh-cn.js`

#### 3. `getHTML()` 与 `getPreviewedHTML()` 职责区分
**修复**:
- `getHTML()`: 输出完整独立 HTML 文档（含 DOCTYPE、html、head、body、title、meta）
- `getPreviewedHTML()`: 输出内容片段，新增 `fullPage`、`rawMarkdown`、`title` 选项

#### 4. `markedRenderer.code` 语言识别完善
**修复**: 扩展语言名映射
- `seq`/`sequence`/`sequenceDiagram` → sequence
- `flow`/`flowChart` → flowchart

---

### 第八轮修复：KaTeX 升级 + 公式对话框全面优化

**修复日期**: 2026-06-06

#### 1. KaTeX 升级至 v0.16.9
**问题**: 旧版本 KaTeX（约 v0.5.x）不支持大量 LaTeX 命令，导致公式预览报错：
- `\cfrac` → `Expected 'EOF', got '\cfrac'`
- `\mathbb{R}` → `Expected 'EOF', got '\mathbb'`
- `\sqrt[3]{x}` → `Optional arguments to \sqrt aren't supported yet`
- `\operatorname{Tr}` → 不支持
- `\begin{pmatrix}`, `\begin{bmatrix}`, `\begin{cases}`, `\begin{aligned}` → 不支持
- `\pmod{n}` → 不支持
- `\limits` → 不支持

**修复**: 
- 从 CDN 下载 KaTeX v0.16.9 完整包（JS + CSS + 60 字体文件）
- 替换 `lib/katex/` 下所有文件
- 验证 31+ 个关键 LaTeX 命令全部支持

#### 2. 公式预览性能优化 — 延迟渲染
**问题**: 点击公式工具时编辑器卡死，需要等待很久才弹出弹窗

**根因**: 弹窗打开时同步渲染 100+ 个 KaTeX 公式，阻塞主线程

**修复**: 
- 改为**分步延迟渲染**：弹窗先显示，30ms 后再渲染第一个 Tab
- **按需渲染**：其他 Tab 的公式在用户切换时才渲染
- 使用 `requestAnimationFrame` 批量渲染（每批 6 个公式）
- 已渲染的 Tab 不重复渲染

**效果**: 弹窗秒开，公式逐批显示，UI 完全不卡顿

#### 3. 点击公式自动关闭弹窗
**问题**: 插入公式后弹窗不关闭，需要手动关闭

**修复**: 点击公式项或自定义公式插入后自动调用 `$dialog.hide().lockScreen(false).hideMask()` 关闭弹窗

#### 4. 弹窗尺寸和布局优化
**修复**:
- 弹窗尺寸从 820×560 扩大到 900×600
- 公式网格最小列宽从 140px 增大到 165px
- 公式卡片最小高度从 65px 增大到 76px
- KaTeX 容器添加 `overflow: visible` 避免内部滚动条
- Tab 栏、搜索栏、底部工具栏标记 `flex-shrink: 0` 防止被挤压
- 公式名称添加文本溢出省略号

#### 5. 范数公式修复
**问题**: `\|x\|` 渲染为绝对值（单竖线）

**修复**: 改为 `\lVert x \rVert`，显式使用范数符号，在 KaTeX v0.16.9 中正确渲染为双竖线

#### 6. 公式示例页面重写
**修复**: `examples/formula.html` 完全重写，包含：
- 美观的渐变头部设计
- 新特性说明面板
- 丰富的 Markdown 公式示例（质能方程、正态分布、贝叶斯、矩阵、微积分等）
- LaTeX 语法速查表
- 支持所有 11 个分类的公式插入

#### 7. 首页更新
**修复**: `examples/index.html` 中公式功能描述更新为 "11 分类、100+公式、搜索过滤、一键插入、自动关闭"

#### 涉及的修改
- `src/editormd.js`: 重写 formula 方法（延迟渲染、自动关闭、按需渲染）
- `css/editormd.css`: 全面优化公式弹窗样式（约 300 行）
- `lib/katex/`: 完整替换 KaTeX v0.16.9
- `examples/formula.html`: 重写示例页面
- `examples/index.html`: 更新描述

---

### 第九轮修复：公式弹窗稳定性 + 表单提交防护

**修复日期**: 2026-06-06

#### 1. 修复 `lockScreen is not a function` 致命错误
**问题**: 点击公式后报错 `x.hide(...).lockScreen is not a function`，导致编辑器卡死

**根因**: `createDialog` 返回的 `dialog` 对象上附着 `.lockScreen()`、`.hideMask()` 等自定义方法，但公式方法中用 `$("." + dialogName)` 重新查询 DOM 创建了新的 jQuery 对象，丢失了这些方法

**修复**: 
- `var $dialog = editormd.createDialog.call(_this, {...})` 直接捕获返回值
- 添加降级方案：如果 `$dialog.lockScreen` 不是函数，则调用 `editormd.lockScreen()` 静态方法
- 关闭前先 `cm.focus()` 聚焦编辑器，防止失焦导致卡死

#### 2. 修复矩阵公式 `\c` 解析错误（第九轮尝试，实际需要在第十轮中完全修复）
**问题**: 矩阵公式 `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` 报错 `Expected group as argument to '\c'`

**说明**: 第九轮修复误判了根因，将 KaTeX 容器也使用 `escLatex`（含 `&amp;`），实际上导致了更多 HTML 实体干扰。真正的修复在第十轮。

#### 3. 全面防护表单提交事件
**问题**: 弹窗中的按钮和输入可能触发外层 `<form>` 提交

**修复**:
- 所有 `<button>` 添加 `type="button"` 属性（共 5 处：草稿清除/取消、颜色选择返回/确认、公式插入按钮）
- `createDialog` 中的动态按钮添加 `type="button"` 并包裹 `e.preventDefault() + e.stopPropagation()`
- 关闭按钮（×）添加 `e.preventDefault() + e.stopPropagation()`
- 公式 Tab 切换添加 `e.preventDefault() + e.stopPropagation()`
- 公式项点击添加 `e.preventDefault() + e.stopPropagation()`
- 自定义公式插入按钮添加 `e.preventDefault() + e.stopPropagation()`
- 搜索框 Enter 键添加 `e.preventDefault() + e.stopPropagation()`
- 自定义输入框 Enter 键添加 `e.preventDefault() + e.stopPropagation()`

#### 4. 编辑器稳定性增强
**修复**:
- 公式插入后立即 `cm.focus()` 确保编辑器聚焦
- `.off()` 解绑后 `.on()` 重新绑定所有事件，防止事件累积
- `lockScreen` 调用增加 typeof 安全检查，防止方法不存在时抛异常

#### 涉及的修改
- `src/editormd.js`: 修复 formula 方法（5 处 lockScreen 引用、HTML 转义、事件防护）+ createDialog（2 处按钮修复）
- `editormd.js` / `editormd.min.js`: 重新构建
- `editormd.amd.js` / `editormd.amd.min.js`: 重新构建
- `FIX_SUMMARY.md`: 新增第九轮修复记录

---

---

### 第十轮修复：彻底修复 `\c` KaTeX 解析错误 + 预览面板 KaTeX 防护

**修复日期**: 2026-06-06

#### 1. 修复 `\c` 解析错误的真正根因
**问题**: 矩阵公式 `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` 弹窗预览时仍报错 `Expected group as argument to '\c'`

**第八/九轮修复的误判**: 第九轮把 KaTeX 容器文本也使用 `escLatex`（含 `&amp;`），导致 HTML 实体解码链路更复杂，反而增加了不可预知的误解析风险。

**真正的解决方案**:
- **KaTeX 容器使用原始 LaTeX**：新建 `texContent = f.latex.replace(/</g, '&lt;').replace(/>/g, '&gt;')`，仅转义 `<` `>` 保证 HTML 安全
- **保留 `&` 和 `\\` 不做处理**：KaTeX 需要原始 `&`（矩阵列分隔符）和 `\\`（行分隔符），不做任何 HTML 实体编码
- **`data-latex` 属性仍使用 `escLatex`**（完整 HTML 实体转义），确保 HTML 属性合法性

**原理**:
- HTML 文本内容中的 `& ` (后跟非实体名字符) 是合法的，浏览器返回原始 `&`
- `.text()` 读取时不会篡改 `\` 反斜杠
- KaTeX 得到与 `f.latex` 完全一致的字符串，无任何变异

#### 2. 预览面板 KaTeX 渲染添加 `throwOnError: false`
**问题**: 编辑器的实时预览面板中 KaTeX 渲染出错时抛出 `Uncaught ParseError`，导致页面崩溃

**根因**: 预览面板的两处 KaTeX.render 调用（同步渲染 line 1871、异步渲染 line 7661）都没有设置 `throwOnError: false`

**修复**:
- **同步渲染**（line 1871）：`editormd.$katex.render(texCode, tex[0])` → 添加 `{ throwOnError: false }`
- **异步渲染**（line 7661）：改用 `.text()` 获取文本（统一方式）并添加 `{ throwOnError: false }`，同时修复 `&amp;`/`&lt;`/`&gt;`/`&quot;` 实体解码

**效果**:
- KaTeX 解析错误只会在预览区显示红色错误文字，不再抛出异常导致页面崩溃
- 两个渲染路径使用一致的文本获取方式（`.text()` + 统一实体解码）

#### 涉及的修改
- `src/editormd.js`:
  - 公式容器：`escLatex` → `texContent`（仅 `<` `>` 转义，保留 `&` `\\` 原始）
  - 预览面板同步渲染：添加 `throwOnError: false`
  - 预览面板异步渲染：改用 `.text()` + 统一实体解码 + `throwOnError: false`
- `editormd.js` / `editormd.min.js`: 重新构建
- `editormd.amd.js` / `editormd.amd.min.js`: 重新构建
- `FIX_SUMMARY.md`: 新增第十轮修复记录

> ⚠️ **第十轮修复引入的新问题**：`texContent`（不转义 `&`）导致 HTML 解析异常使公式弹窗中所有公式预览失效；后续修复见第十一轮。

---

### 第十一轮修复：修复矩阵多行变单行 + 公式弹窗预览失效

**修复日期**: 2026-06-06

#### 修复 1: 公式弹窗预览显示为原始 LaTeX 源码
**问题**: 插入公式弹窗中，所有公式预览都显示为原始 LaTeX 源码，而非 KaTeX 渲染结果

**根因**: 第十轮中 `texContent` 只转义 `<` `>` 不转义 `&`，当 HTML 通过 `editor.append(html)` 插入时，未转义的 `&` 字符可能导致浏览器 HTML 解析异常，进而使 KaTeX 渲染失败（被 try-catch 静默吞掉）

**修复**: 恢复使用 `escLatex`（完整 HTML 实体转义：`& → &amp;`、`< → &lt;`、`> → &gt;`、`" → &quot;`）填充 KaTeX 容器。jQuery `.text()` / DOM `textContent` 会自动将实体解码回原始字符，KaTeX 获得正确的 LaTeX

#### 修复 2: 矩阵/行列式等多行公式预览时变成单行
**问题**: 编辑区预览面板中，矩阵 `\begin{pmatrix} a & b \\ c & d \end{pmatrix}` 显示为单行，行列式同理

**根因**: marked.js 配置 `breaks: true`（line 2500），将 `$$...$$` 公式块内换行符转换为 `<br>` 标签。KaTeX 通过 `.text()` 读取文本时 `<br>` 被忽略（非文本节点），导致所有行挤在一起

**修复**: 在 `markedRenderer.paragraph` 中添加 `restoreTeXBreaks` 函数，将公式中的 `<br>` 还原为换行符 `\n`：
- `restoreTeXBreaks` 使用正则 `/<br\s*\/?>\s*/gi` 匹配所有 `<br>` 变体并替换为 `\n`（空格语义）
- **注意**：替换为 `\n` 而非 `\\`，因为 LaTeX 的 `\\` 换行命令本身未被 marked.js 删除，只需恢复被移除的换行符即可；若替换为 `\\` 会添加多余的 LaTeX 换行命令导致公式错乱
- 应用于三个位置：块级 `$$...$$`（整段）、行内 `$$...$$`（段内混排）、行内 `$...$`
- 代码块 `math`/`latex`/`katex` 不受影响（其内容不被 marked.js 内联处理）

#### 修复 3: KaTeX displayMode 自动检测
**问题**: 矩阵等块级公式（含 `\begin{...}`）使用默认 `displayMode: false`，显示效果不如块级模式

**修复**: 三处 KaTeX 渲染均添加自动检测：
- 同步预览 `katexRender`：`(/^\\begin\{/.test(texCode))` → `displayMode: true`
- 异步预览 `katexHandle`：同样的正则检测
- 公式弹窗 `renderPanelFormulas`：读取父元素 `data("block")` 属性判断

#### 修改清单
- `src/editormd.js`:
  - 公式容器：`texContent` → `escLatex`（回退第十轮的误修复）
  - `markedRenderer.paragraph`：新增 `restoreTeXBreaks` 保护公式内 `\\`
  - 预览面板同步/异步渲染：添加 `displayMode` 自动检测
  - 弹窗公式渲染：根据 `data-block` 属性设置 `displayMode`
- `editormd.js` / `editormd.min.js`: 重新构建
- `editormd.amd.js` / `editormd.amd.min.js`: 重新构建

> ⚠️ **第十一轮修复 2 的第二次修正**（同日）：
> - `restoreTeXBreaks` 第一版将 `<br>` 替换为 `\\`（添加多余 LaTeX 换行命令）→ 公式错乱
> - 第二版替换为 `\n`（换行符）→ 部分浏览器 `.text()` 行为不一致
> - 第三版替换为 `" "`（空格）→ 所有浏览器行为一致，但矩阵仍为单行
>
> ⚠️ **第十一轮修复 2 的第三次修正（同日·修正）**：根因不是 `<br>`，而是 **marked.js 将 `\\` 当作 Markdown 转义序列处理**（`\\` → `\`），丢失了一个反斜杠。矩阵源文本 `a & b \\\n` 经 marked.js 处理后变成 `a & b \<br>`（行分隔符 `\\` 只剩一个 `\`），再经 `<br>`→空格 后 `\\` 完全丢失。
>
> 此次在 `restoreTeXBreaks` 中增加 `\<br>` → `\\<br>` 步骤修复 `\\` 问题，但该方案只能修复 `\\`，无法解决其他被 marked.js 转义的 LaTeX 命令（如 `\{` → `{`、`\}` → `}`、`\#` → `#` 等）。
>
> ⚠️ **第十一轮修复 2 的第四次修正（同日·最终）**：改为**预处理方案** —— 在 marked.js 处理前保护所有 `$...$`/`$$...$$` 内的反斜杠，处理后再恢复：
> - 新增 `protectTeXSyntax(markdown)` ：将公式内所有 `\` 替换为唯一占位符 `EDITORMD_TEX_BACKSLASH_7F3A`
> - 新增 `restoreTeXSyntax(html)` ：将占位符还原为 `\`
> - 在所有 3 个 marked.js 处理管线中集成（预览、HTML导出、getHTML）
> - 简化 `restoreTeXBreaks` 为仅处理 `<br>` → 空格
> - 此方案修复了 **所有** LaTeX 命令中反斜杠被 marked.js 转义的问题（`\\`、`\{`、`\}`、`\#` 等）
>
> ⚠️ **第十一轮修复 4（新增）**：`createDialog` 每次 `editor.append(html)` 创建新 DOM，但旧对话框仅 `.hide()` 不删除。第二次打开时选择器（如 `.find(".formula-item")`) 可能拿到旧 DOM 中已被 KaTeX 渲染覆盖的内容，导致预览变为 KaTeX HTML 而非 LaTeX 源码。修复：创建前先 `_this.editor.find("." + dialogName).remove()` 清理旧 DOM。

---

### 手动测试清单
- [ ] 打开 `examples/all-features.html`，验证示例 11（tabs）和示例 12（columns）渲染正常
- [ ] 验证行内代码 `` `[columns:2]` `` 和 `` `[[tabs]]` `` 被渲染为 `<code>` 标签
- [ ] 验证中文标题的 TOC slug 生成（如 "第一章 Introduction" → "di-yi-zhang-introduction"）
- [ ] 验证 video 标签的 `title` 属性正常显示
- [ ] 验证 @链接 功能正常（atLinkReg lastIndex 修复）
- [ ] 测试嵌套语法：`[[tabs]]` 内嵌 `[[columns:N]]`，`[[columns:N]]` 内嵌 `[[tabs]]`
- [ ] 测试代码块内的 `[[columns:N]]` 不被解析为语法
- [ ] 验证 `getHTML()` 返回完整 HTML 文档
- [ ] 验证 `getPreviewedHTML({fullPage: true})` 功能

### 浏览器兼容性测试
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)

---

## 🚀 部署步骤

### 1. 提交代码
```bash
git add .
git commit -m "fix: comprehensive bug fixes and improvements for Editor.md

- Fix code block protection in preprocessMarkdownBlocks recursive calls
- Fix markedRenderer for Chinese headings, video tags, TeX inline
- Fix atLinkReg lastIndex issue (global regex state)
- Fix filterHTMLTags to support video/audio tags
- Remove .editormd-column-divider-icon element
- Set default language to Chinese (zh-cn)
- Differentiate getHTML() and getPreviewedHTML() functionality
- Improve findBalancedBlocks nested syntax detection
- Strengthen protectCodeBlocks for fenced code and inline code
- Update examples and documentation"
```

### 2. 推送到远程
```bash
git push origin master
```

---

## 📊 影响范围评估

### 代码变更统计
- **修改文件**: 30+ 个
- **代码行数**: 约 1000+ 行修改
- **影响范围**: 核心库 + 所有示例 + CSS + 文档

### 风险评估
- **破坏性变更**: 无（已完全向后兼容）
- **性能影响**: 正面（优化递归逻辑）
- **兼容性**: 提升（支持现代浏览器）

---

## 🔧 第十二轮修复详解：全面系统审查与优化

### 1. Tooltip 悬浮提示核心修复

**问题 1：文本型 Tooltip popup 无法拦截鼠标交互**

根因：CSS `pointer-events: none` 导致文本 Tooltip popup 的 `mouseenter`/`mouseleave` 事件不触发，鼠标从 trigger 移到 popup 时立即关闭（`hideTooltip` 200ms 定时器未被 popup 取消）。

修复：
- `pointer-events: none` → `auto`（文本 Tooltip 无交互元素，`auto` 无害）
- 静态 `editormd.initTooltips` popup `mouseleave` 使用延迟隐藏（与 trigger 相同行为）
- 添加 popup `mousedown` 事件清空隐藏定时器，支持点击内部链接
- 内联脚本版 `initTooltips` 移除 `ty==="image"||ty==="iframe"` 限制，所有类型统一处理
- SCSS 添加完整 Tooltip 样式（trigger focus、popup arrow、image/iframe/loading）

**问题 2：独立预览 HTML 无 Tooltip 样式**

根因：`editormd.preview.css` 缺少 `.editormd-tooltip-trigger` 和 `.editormd-tooltip-popup` 样式。

修复：`scss/editormd.preview.scss` 添加完整 Tooltip 样式，编译后所有使用 `editormd.preview.css` 的场景都能正常显示。

### 2. Task List `<input>` 被 XSS 过滤误删

根因：`filterHTMLTags` 的 `dangerousTags` 包含 `'input'`，导致 `postProcessTaskLists` 注入的 `<input type="checkbox">` 被正则删除。

修复：`dangerousTags` 移除 `'input'`，`allowedTags` 新增 `'input'`（含 `type`/`checked`/`disabled` 属性白名单）。

### 3. XSS 安全白名单增强

根因：`allowedTags` 缺少 `video`、`source` 标签，但渲染器可生成 `<video>` 元素（视频文件链接），会被 XSS 过滤器移除。

修复：
- 白名单新增 `'input'`、`'video'`、`'source'`
- 新增 `input` 允许属性：`type`、`checked`、`disabled`、`class`
- 新增 `video` 允许属性：`src`、`controls`、`preload`、`class`、`title`

### 4. KaTeX 安全防护

**问题**：`settings.tex` else 分支直接 `editormd.$katex = katex`，若 `katex` 全局变量不存在（`autoLoadModules: false` 且未预加载），后续 `katexRender` 崩溃。

修复：两处赋值均添加 `typeof katex !== "undefined"` 前置检查。

### 5. katexRender timer 守卫放宽

**问题**：`this.timer === null` 直接返回，异步回调中 timer 可能尚未赋值，导致 KaTeX 公式跳过渲染。

修复：添加 `typeof editormd.$katex === "undefined"` 条件，仅在 KaTeX 完全未加载时跳过。

### 6. ECharts resize 事件内存优化

**问题**：
- 每次预览刷新时 `$(window).on("resize.editormd-echarts", ...)` 累积多个 handler
- `reInitHiddenContent` 中同样累积（Tab 切换多次）

修复：
- 使用唯一命名空间 `resize.editormd-echarts-<id>` 避免冲突
- `data-resize-bound` 属性标记，每个 chart instance 只绑定一次
- 150ms debounce 减少频繁 resize 开销

### 7. Columns 独立导出支持

**问题**：`getHTML()` 导出的独立 HTML 中 `initTabs`/`initTooltips`/`initCodeCopy`/`initECharts` 均已内联，唯独缺少 `initColumns`。

修复：
- 内联脚本新增 `initColumns` 函数（遍历 `.editormd-columns` 添加分隔线）
- DOM Ready 添加 `initColumns($c)` 调用
- `reInitHiddenContent` 新增 Columns 重新初始化（Tab 面板显示后）

### 8. loadScript 失败处理

**问题**：`script.onerror` 静默调用 `callback()`，下游代码假设库已成功加载，导致运行时错误（如 `flowChart()` 方法不存在）。

修复：
- onerror 记录失败文件名到 `editormd.loadFiles.failed` 数组
- 控制台输出 `console.warn("[Editor.md] Failed to load script: ...")`
- 调用方可通过检查 `loadFiles.failed` 判断加载状态

### 9. initTabs 事件绑定优化

**问题**：实例方法 `initTabs` 使用 `.on("click", "li", ...)` 无 `.off()`，若 `data-initialized` 被重置会导致重复绑定。

修复：添加 `.off("click", "li")` 先解绑再绑定（与独立 HTML 版本一致）。

### 10. FlowChart/SequenceDiagram 守卫一致性

**问题**：`flowchartTimer === null` 时整个渲染函数返回，若仅启用 SequenceDiagram（FlowChart 关闭），SequenceDiagram 也被跳过。

修复：FlowChart 和 SequenceDiagram 分别判断，SequenceDiagram 额外检查 `typeof Diagram !== "undefined"`。

### 11. 静默错误迁移至可见告警

**问题**：`reInitHiddenContent` 中 FlowChart/SequenceDiagram 重渲染 `try { ... } catch(e) {}` 完全吞掉错误。

修复：catch 块输出 `console.warn("[Editor.md] ... render failed:", e)`。

### 12. 废弃 API 现代化

| 废弃 API | 替换 | 位置 |
|----------|------|------|
| `escape()` | `encodeURIComponent()` | heading slug 生成 |
| `String.prototype.substr()` | `String.prototype.slice()` | ECharts ID 生成 |
| `display: inline-ruby` | `display: ruby` | pinyin CSS |

### 13. 死代码清理

- image renderer：移除声明但从未赋值的 `style` 变量（图片尺寸在预处理阶段已处理）

### 14. 示例文件完善

| 文件 | 更新内容 |
|------|----------|
| `html-preview-markdown-to-html.html` | 两个 `markdownToHTML` 调用均添加 tooltip/echarts/tabs/columns/pinyin/textAlign/imageResize/pageBreak/atLink/copybook 配置 |
| `html-preview-...-custom-toc-container.html` | 同上，两个调用均补充缺失配置 |
| `all-features.html` | 添加 `pageBreak: true` 和 `atLink: true` 配置 |
| `full-preview.html` | 已完整，无需修改 |

---

## 第十六轮修复：纸张页面语法增强与快捷键完善

### 1. 修复 `[[page:AN]]` 语法无法识别的问题

**问题根源**：
- `editormd.regexs.pageOpen` 正则表达式只支持 `A\d+` 格式（如 A4, A5）
- 不匹配 `AN`、`LETTER`、`LEGAL` 等纸张规格
- 导致 `[[page:AN]]...[[/page]]` 无法被识别为页面块

**修复方案**：
| 位置 | 修改内容 |
|------|----------|
| 第 6802 行 | `pageOpen: /\[\[page:(A\d+|AN|LETTER|LEGAL)\]\]/gi` |
| 第 3392 行 | 添加 `"AN": { w: 794, h: 1123 }` 纸张尺寸定义 |
| 第 7355 行 | 添加 `"AN": { w: 794, h: 1123 }` 纸张尺寸定义 |
| 第 7361 行 | 正则匹配模式更新为 `(A\d+|AN|LETTER|LEGAL)` |

**支持的纸张规格**：
- A系列：A0 ~ A8
- AN：等同于 A4（794×1123px）
- LETTER：美国信纸（816×1056px）
- LEGAL：美国法律用纸（816×1344px）

### 2. 添加对齐功能键盘快捷键

**新增快捷键**：
| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+Alt+L` | 左对齐 | 插入 `⁑⁖...⁖⁑` 语法 |
| `Ctrl+Alt+C` | 居中对齐 | 插入 `⁑⁑...⁑⁑` 语法 |
| `Ctrl+Alt+R` | 右对齐 | 插入 `⁑⠕...⠕⁑` 语法 |
| `Ctrl+Alt+J` | 两端对齐 | 插入 `⁑⁛...⁛⁑` 语法 |

**代码位置**：第 6682-6685 行

### 3. 文档更新

**README.md 更新内容**：
- 添加纸张页面支持的纸张规格说明
- 添加对齐功能的键盘快捷键说明

### 4. 嵌套语法支持

**已支持的嵌套场景**：
- ✅ `[[page:A4]]` 内嵌套 `[[tabs]]`
- ✅ `[[page:A4]]` 内嵌套 `[[columns:N]]`
- ✅ `[[tabs]]` 内嵌套 `[[columns:N]]`
- ✅ `[[columns:N]]` 内嵌套 `[[tabs]]`
- ✅ 多级嵌套（最多 20 层）

**嵌套处理机制**：
- `findBalancedBlocks` 函数支持嵌套检测
- `hasMatchingPair` 递归验证嵌套有效性
- 递归深度限制为 20 层，防止栈溢出

### 5. 代码质量

**Linter 检查结果**：
- ✅ 无新增错误
- ✅ 所有修改符合代码规范
- ℹ️ 存在 79 个 HINT 级别提示（均为预存在，非本次引入）

### 6. 新增文件

| 文件 | 说明 |
|------|------|
| `examples/pinyin-reference.html` | 拼音参照表页面，包含所有声母、韵母、声调 |
| `USAGE_GUIDE.md` | 完整使用指南文档 |

### 7. 文档完善

**README.md 更新**：
- 添加纸张页面支持的纸张规格说明
- 添加对齐功能的键盘快捷键说明

**examples/index.html 更新**：
- 添加拼音参照表页面链接

**编译文件**：
- ✅ `editormd.min.js` - 已重新编译
- ✅ `editormd.amd.min.js` - 已重新编译
- ✅ `css/editormd.min.css` - 已重新编译
- ✅ `css/editormd.preview.min.css` - 已重新编译
- ✅ `css/editormd.logo.min.css` - 已重新编译

---

## 第三十四轮修复：同步滚动全面加强、图片缩放修复、复杂HTML提示、构建产物重建

**修复日期**：2026-06-12

### 1. 同步滚动全面加强

**问题回顾**：
- 编辑器与预览区双向滚动同步精度不足，长文档中偏差明显
- 锁定持续时间固定，无法适应不同滚动速度
- 缺少惯性阶段处理，滚动停止后位置跳跃
- 所有块元素使用统一留白，不同类型元素可视需求不同

**修复方案**：

| 改进项 | 说明 |
|--------|------|
| **自适应锁定时长** | 根据滚动速度动态调整锁定时间：快速 >200px → 400ms / 正常 30-200px → 300ms / 慢速 <30px → 180ms / 惯性阶段 → 120ms |
| **惯性检测** | 5 样本滑动窗口速度追踪，检测递减趋势判定是否进入惯性减速阶段 |
| **平滑缓动** | 惯性阶段使用 `current + (target - current) × 0.4` 缓动系数平滑过渡，避免跳跃 |
| **元素类型感知留白** | 标题 → 12% 视口(上限80px) / 代码块 → 18%(上限120px) / 水平线 → 10%(上限60px) / 标准 → 25%(上限MAX_TOP_GAP) |
| **滑动窗口扩展** | VELOCITY_WINDOW 从 3 扩展至 5，速度追踪更平滑 |
| **BLOCK_SEL 扩展** | 新增 `figure, .editormd-html-block, div.editormd-image-container, div[data-source-line]` 元素选择 |

**代码位置**：
- 自适应锁定：`lockBoth()` 函数
- 惯性检测：编辑器/预览区 scroll 事件处理中的 velocity 追踪逻辑
- 元素感知留白：`editormd.scrollToPreview()` 和 `editormd.scrollToEditor()` 中的 topGap 计算
- 新增变量：`_scrollDirection`, `_inertiaCount`, `_lineMapBuilding`

### 2. 图片缩放出现次数追踪修复

**问题**：拖拽调整第 N 次出现的图片时，Markdown 回写总是修改第一次出现的位置。

**修复方案**：
- 预览区渲染时为每个图片实例添加 `data-image-occurrence` 属性，标记在文档中的出现次序
- `modifyImageSizeInMarkdown()` 函数使用计数器匹配方式，精准定位到指定出现次数的图片
- 支持 `![alt](url)<W,H>` 和 `<img src="url" width="W" height="H">` 两种语法格式的精准替换

### 3. 复杂 HTML 悬浮提示支持

**新增语法**：`[链接文本](tooltip:html:<Base64URL编码的HTML>)`

**特性**：
- 支持任意复杂 HTML 内容的悬浮提示（渐变背景、按钮、列表、表格等）
- 使用 `encodeURIComponent`/`decodeURIComponent` 进行内容编码，安全存入 data 属性
- 自动适应内容宽度，支持 `min-width` 设置
- 与文本/图片/iframe 三种现有类型兼容共存

**样式**：新增 `.editormd-tooltip-html` 样式类，支持内容自适应和滚动

### 4. 构建产物全面重建

| 产物 | 状态 |
|------|------|
| `editormd.js` | ✅ 从 `src/editormd.js` 重新构建 |
| `editormd.amd.js` | ✅ 从 `src/editormd.js` 重新构建（含 AMD 替换）|
| `editormd.min.js` | ✅ UglifyJS 压缩构建 |
| `editormd.amd.min.js` | ✅ UglifyJS 压缩构建 |
| `css/editormd.min.css` | ✅ CleanCSS 压缩构建 |
| `css/editormd.preview.min.css` | ✅ CleanCSS 压缩构建 |
| `css/editormd.logo.min.css` | ✅ CleanCSS 压缩构建 |

### 5. 示例文件全面更新

| 文件 | 更新内容 |
|------|----------|
| `all-features.html` | 版本号统一至 v1.12.0；新增复杂 HTML 悬浮提示演示；修复"结语"章节位置；更新同步滚动/图片缩放功能描述；重编号 20-24 章 |
| `simple.html` | 修复代码块反引号被空格分隔的问题 |
| `full-preview.html` | 版本号更新至 v1.12.0；修复重复章节编号 13.1→13.2 |
| `html-preview-markdown-to-html.html` | 补全缺失的 `katex.min.css`、`katex.min.js`、`echarts.min.js` 依赖引入 |

### 6. 文档全面更新

| 文件 | 更新内容 |
|------|----------|
| `FIX_SUMMARY.md` | 新增第三十四轮修复完整记录 |
| `USAGE_GUIDE.md` | 新增复杂 HTML 悬浮提示语法、同步滚动增强、图片缩放追踪说明 |
| `README.md` | v1.12.0 改进条目更新：同步滚动加固、图片缩放追踪、HTML 提示、自适应锁定、元素感知留白 |
| `help.md` | 新增图片缩放功能、复杂 HTML 悬浮提示语法、同步滚动说明 |

---

## 📚 参考资源

- [jQuery 3.x 升级指南](https://jquery.com/upgrade-guide/3.0/)
- [marked v0.3.3 文档](https://github.com/markedjs/marked)
- [Editor.md GitHub](https://github.com/zhaoxianfang/editor)

---

## 👏 贡献者

- **修复执行**: CodeBuddy AI Assistant
- **测试验证**: 待人工测试
- **审核**: 待审核

---

## 第三十五轮修复：HTML工具提示选择器支持 + 同步滚动防循环机制 + 文档全面更新

**修复日期**：2026-06-13

### 1. HTML工具提示选择器语法扩展

**新增功能**：支持通过CSS选择器引用页面中的DOM元素作为悬浮提示内容

**语法格式**：
- `[查看HTML](tooltip:html:.test_dom)` - 使用class选择器
- `[查看HTML](tooltip:html:"#test_dom")` - 使用ID选择器
- `[查看HTML](tooltip:html:"[data-target]")` - 使用属性选择器

**特性**：
- **自动隐藏属性移除**：当通过CSS选择器引用DOM元素时，自动移除元素的隐藏属性（`display: none`、`visibility: hidden`、`opacity: 0`），确保元素在悬浮框中正常显示
- **双重格式支持**：保持向后兼容原有的Base64编码格式 `tooltip:html:<Base64URL>`
- **智能检测**：正则表达式检测选择器格式（以引号开头或包含CSS选择器字符）

**实现逻辑**：
1. 解析阶段：扩展 `tooltipLink` 正则表达式以支持选择器格式
2. 渲染阶段：为选择器类型生成特殊标记 `<span data-tooltip-type="html-selector">`
3. 初始化阶段：通过 `initTooltips` 函数查找并处理选择器类型
4. 显示阶段：`showTooltip` 函数动态克隆DOM元素并移除隐藏属性

**代码位置**：
- 行 9281-9325：HTML工具提示语法扩展支持CSS选择器
- 行 9938-9964：工具提示初始化逻辑处理 `html-selector` 类型
- 行 9972-10058：动态加载DOM元素并移除隐藏属性

### 2. 同步滚动防循环机制增强

**问题**：编辑区和预览区双向滚动时可能出现循环触发问题

**解决方案**：
- **时间戳锁定**：使用 `_syncLockedUntil` 变量记录每个方向的锁定截止时间
- **单向触发**：左侧编辑区触发右侧滚动时锁定左侧，右侧预览区触发左侧滚动时锁定右侧
- **智能锁定**：根据滚动速度动态调整锁定时长，快速滚动时延长锁定时间
- **事件节流**：使用 `requestAnimationFrame` 进行节流处理，避免过度触发

**关键代码**：
```javascript
// 防循环滚动机制
var _syncLockedUntil = { left: 0, right: 0 };

// 检查是否应该同步滚动
var shouldSync = function(direction, scrollTop, speed) {
    var now = Date.now();
    // 如果当前方向被锁定，跳过
    if (now < _syncLockedUntil[direction]) {
        return false;
    }
    // 锁定相反方向一段时间
    var opposite = direction === 'left' ? 'right' : 'left';
    var lockDuration = speed > 200 ? 400 : (speed > 30 ? 300 : 180);
    _syncLockedUntil[opposite] = now + lockDuration;
    return true;
};
```

### 3. 示例文件更新

**`examples/tooltip.html`**：
- 新增CSS选择器语法演示
- 添加隐藏的DOM元素示例：`#hidden-content` 和 `.test_dom`
- 更新使用说明以演示新的HTML选择器语法

**`examples/all-features.html`**：
- 更新HTML工具提示部分，添加选择器语法说明
- 保持原有的Base64编码格式示例

**`examples/full-preview.html`**：
- 更新版本号至v1.12.0
- 确保工具提示功能已启用

### 4. 文档全面更新

**`README.md`**：
- 更新悬浮提示语法部分，添加HTML选择器语法的详细说明
- 添加v1.12.0版本的新特性说明

**`USAGE_GUIDE.md`**：
- 更新复杂HTML悬浮提示部分，详细说明了传统Base64编码和新CSS选择器两种方式

**新增 `HTML_TOOLTIP_NEW_FEATURE.md`**：
- 创建新的详细说明文档，专门介绍HTML工具提示新语法
- 包含使用示例、最佳实践、故障排除等内容

### 5. 构建产物重建

**文件构建**：
- `editormd.js` (538,000字节) - 包含所有新功能
- `editormd.min.js` (199,148字节) - 压缩版
- `editormd.amd.min.js` (192,760字节) - AMD压缩版
- `css/editormd.min.css` (109,186字节) - 样式压缩版

**验证**：
- 所有.min文件已通过构建脚本重新生成
- 所有新功能已正确包含在压缩文件中
- 文件修改时间戳验证构建顺序正确

---

## 📄 许可证

本修复工作遵循 MIT 许可证，与 Editor.md 项目保持一致。
