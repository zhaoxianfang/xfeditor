# xfEditor 修复与改进总结

## 构建日期
2026-06-16

---

## v1.15.0 — Tree图/脑图、Hidden 隐藏代码块、全系统审计修复

### 新增功能

#### 1. Tree图/脑图（ECharts）
- **工具栏**：图表子菜单新增「🌳 树图/脑图」按钮（`echarts-tree`），点击插入完整预设模板
- **Markdown 语法**：与现有 ` ```echarts ` 语法完全兼容，`"type": "tree"` 即可
- **主题支持**：`"theme": "dark"` / `"light"` 切换 ECharts 内置主题
- **交互特性**：`expandAndCollapse: true` 折叠/展开，`roam: true` 缩放平移
- **布局方向**：`orient: "LR"` 左→右、`"TB"` 上→下、`"RL"` 右→左、`"BT"` 下→上
- **自定义高度**：`"height": 500` 设置容器高度（默认 400px）

#### 2. Hidden 隐藏代码块
**语法**：````(hidden)```、````(hidden.class#id)```、````html(hidden#preview)```
在代码块围栏标识的小括号中使用 `hidden` 关键词，为 `<pre>` 标签添加 `style="display:none!important"`：
- ````(hidden)``` → `<pre style="display:none!important">`
- ````(hidden.className#idName)``` → class + id + hidden 同时设置
- 配合 `tooltip:iframe:pre#id` 实现"隐藏代码 + 悬浮预览"
- `initCodeCopy` 自动跳过隐藏代码块的复制按钮注入

#### 3. Scroll Spy 滚动监听目录高亮
- 页面滚动时自动高亮当前章节对应的 TOC 条目
- 激活项超出 TOC 可视区时自动滚动到可见位置
- 使用 `requestAnimationFrame` 节流，性能友好

### 改进与优化

#### 1. TOC 侧栏全面美化
- 侧栏宽度优化：320px → 260px（更紧凑）
- 渐变头部 + 紫色装饰竖条 + hover 旋转关闭按钮
- 目录项层级差异化（H2 13px 粗体 / H3 12px / H4 11.5px）
- hover 左移平滑动画 + 左侧彩色边框激活指示器
- 浮动按钮呼吸脉冲动画 + hover 填充反转效果
- 冲刷 `.markdown-toc` 自带的大 padding/margin/border
- 层级缩进收紧：18px → 10px
- 自定细滚动条美化
- 底部"↑ 回到顶部"快捷链接

#### 2. ECharts 引擎改进
- **智能 tooltip**：无坐标轴图表（pie/tree/funnel 等）自动使用 `trigger: "item"` 模式
- **主题支持**：`config.theme` 传递给 `echarts.init(dom, theme)`
- **自定义高度**：`config.height` 控制容器高度
- **顶级配置透传**：`backgroundColor`、`grid`、`dataZoom`、`visualMap`、`toolbox`

#### 3. 构建与文档更新
- 所有 .js/.css/.min 文件重新编译压缩
- README.md 更新至 v1.15.0，新增 Tree图/脑图文档
- USAGE_GUIDE.md 新增 Tree图/脑图完整参数表
- examples/echarts.html 新增树图/脑图示例
- examples/all-features.html、full-preview.html 新增 §5.6 树图/脑图章节
- FIX_SUMMARY.md 记录所有变更

### v1.15.0 Bug 修复（第二轮）

#### 1. standalone 预览页 Tabs/Columns 等组件无样式 🔴 CRITICAL
**根因**：`editormd.preview.css`（standalone 预览专用）缺少 Tabs、Columns、Pinyin、TextAlign、ImageResize、Badge、Video、File 相关 CSS 样式。这些样式仅存在于 `editormd.css`（编辑器主 CSS）中。
**影响**：`full-preview.html` 等使用 `..\/css\/editormd.preview.min.css` 的独立预览页面，Tabs 标签页、多列排版、拼音标注、文本对齐、图片拖拽缩放等功能完全不显示样式。
**修复**：
- 向 `editormd.preview.css` 和 `editormd.preview.scss` 添加完整的 Tabs/Columns/Pinyin/TextAlign/ImageResize/ECharts/Badge/Video/File 样式
- 新增 `editormd.preview.css` 暗色主题（Dark Theme），覆盖所有新组件
- 新增 Badge 标记样式（`.badge`、`.badge-new`，含呼吸动画）
- 新增视频播放器和文件附件链接样式

#### 2. 字体文件清理
- 删除未使用的 `fonts/FontAwesome.otf`（原始字体文件，项目中仅使用 webfont 格式）

#### 3. 暗色主题完善
- `editormd.preview.themes.scss` 新增 Tabs/Columns/ECharts/Pinyin/Tooltip/Badge/Attachment/Copybook/PageBlock 暗色主题样式
- 确保独立预览页在暗色主题下所有组件正常显示

#### 4. 文件修改清单
| 文件 | 变更 |
|------|------|
| `css/editormd.preview.css` | 新增 ~250 行样式（组件 + 暗色主题） |
| `css/editormd.preview.min.css` | 重新压缩 |
| `css/editormd.min.css` | 重新压缩 |
| `css/editormd.dialog.min.css` | 重新压缩 |
| `css/editormd.logo.min.css` | 重新压缩 |
| `scss/editormd.preview.scss` | 新增组件样式块 |
| `scss/editormd.preview.themes.scss` | 新增暗色主题扩展 |
| `fonts/FontAwesome.otf` | 已删除 |

---

## v1.14.0 — 代码块属性扩展、iframe:pre 悬浮预览、表格 Bug 修复

### 新增功能

#### 1. 代码块 class/id 属性扩展
**语法**：````(.class_name)```、````(#id_name)```、````(.cls#id)```
在代码块围栏标识后的小括号中指定 `<pre>` 标签的 class 和 id 属性：
- ````(.test_class)``` → `<pre class="test_class">`
- ````(#test_id)``` → `<pre id="test_id">`
- ````(.cls#id)``` → `<pre class="cls" id="id">`
- 支持与语言标识组合：````javascript(.snippet#demo)```
- ⭐ v1.15.0 新增 `hidden` 关键词支持

**应用场景**：自定义代码块样式、JavaScript 定位、配合 iframe:pre 悬浮预览

#### 2. iframe:pre 悬浮提示类型
**语法**：`[text](tooltip:iframe:pre#id)` 或 `[text](tooltip:iframe:pre.class)`
提取页面中指定 `<pre>` 元素的内容，在悬浮提示中以深色主题 iframe 展示代码。
- 配合代码块属性扩展使用：先给代码块标记 `(#demo)`，再用 `[查看代码](tooltip:iframe:pre#demo)` 引用
- 支持 Blob URL（自动释放，无内存泄漏）

### Bug 修复

#### 1. iframe:pre 404 错误修复 🔴 CRITICAL
**根因**：`\bhidden\b\.?` 正则将 `hidden-code-secret` 中的 `hidden` 也误删 → class 被破坏 → `$(pre.xxx)` 找不到元素 → 回落为 URL 请求 → 404
**修复**：改用 `.split('.')` 按 token 精确过滤，保留完整复合词。同时新增 pre 选择器防御性降级（找不到元素时显示 about:blank + 警告，不发起网络请求）。

#### 2. 内存泄漏修复（5 项） 🛡️
| 漏洞 | 根因 | 修复 |
|------|------|------|
| ECharts resize 子命名空间泄漏 | `$(window).off("resize.editormd-echarts")` 无法匹配 `resize.editormd-echarts.ec-xxx` 子命名空间 | 改为 `$(window).off(".editormd-echarts")` 批量清理 |
| `$(window).on("load")` 未解绑 | destroy() 中缺少解绑 | 添加命名空间 `.editormd-pageload` + destroy 解绑 |
| ECharts 实例未 dispose | destroy() 中未调用 `echarts.dispose()` | 添加 `previewContainer.find(".editormd-echarts").each(...echarts.dispose(this)...)` |
| 对话框拖拽残留 | `document.onmousemove/onmouseup` 在拖拽中断时永久残留 | destroy 中添加 `document.onmousemove = null` 清理 |
| `markdownToHTML` resize 累积 | 每次调用绑定额外处理器 | 在绑定前 `$(window).off("resize.editormd-echarts-md")` 清理 |

#### 3. 表格最后一行最后一列为空时单元格丢失
**根因**：marked.js v0.3.3 中 pipe-table 的 cell 分割使用贪婪正则 `replace(/^ *\| *| *\| *$/g, "")`，当最后一列为空时，` *\| *$` 会吞掉前一列的管道符，导致单元格数量少一个。

**修复**：新增 `editormd.fixTableEmptyCells()` 后处理函数，以 `<thead>` 列数为基准自动补齐 `<tbody>` 中缺失的空 `<td>` 单元格。已注入到所有渲染路径（主预览、getHTML、standalone、markdownToHTML）。

### 其他修复

| 修复项 | 描述 |
|--------|------|
| `preprocessMarkdownBlocks` 空输入保护 | 添加 `markdown` 参数类型和空值检查，防止 `Cannot read properties of undefined (reading 'replace')` |
| `restoreCodeBlocks` 空数组保护 | 添加 `codePlaceholders` 空数组/元素检查 |
| `restorePlaceholders` 空元素保护 | 添加 `ph.id` 空值检查 |
| Blob URL 内存泄漏修复 | `initTooltips` 清理旧 tooltip 时调用 `revokeObjectURL()` 释放 blob URL |
| 代码块语言检测修复 | `markedRenderer.code` 中特殊语言（seq/flow/math/echarts）改用 `cleanLang` 检测，兼容带属性语法 |

---

## v1.13.3 — 代码优化与压缩

### 优化目标
原始文件 160KB (4588行)，v1.13.2 膨胀至 502KB (10906行，+214%)。本次优化在保持所有功能和逻辑完整的前提下，通过代码复用和结构化压缩减少文件体积。

### 优化内容

| 优化项 | 方法 | 节省 |
|--------|------|------|
| CSS 样式内联合并 | `_getCoreStyles` 中 259 个 `css.push()` 合并为 38 个 | ~270 行 |
| 初始化脚本合并 | `_getInitScripts` 中 `scripts.push()` 分组合并 | ~50 行 |
| 去除装饰性注释 | 移除分隔线、★标记、冗余段落注释 | ~80 行 |
| 移除防御性 console.warn | 简化 `findBalancedBlocks` 中的类型检查 | ~30 行 |
| 空白符压缩 | 减少连续空行和行尾空格 | ~20 行 |
| CSS 文件重压缩 | `css/editormd.min.css`、`css/editormd.dialog.min.css` | ✅ |

### 构建产物对比

| 文件 | v1.13.2 | v1.13.3 | 节省 |
|------|---------|---------|------|
| `editormd.js` | 502K | 470K | -32K (-6.4%) |
| `editormd.min.js` | 193K | 187K | -6K (-3.1%) |
| `editormd.amd.js` | 505K | 473K | -32K (-6.3%) |
| `editormd.amd.min.js` | 194K | 189K | -5K (-2.6%) |
| `css/editormd.min.css` | - | 109K | 重新压缩 |

---

## v1.13.2 — 反向同步巨大偏移修复

### 根因分析
1. **代码块内 "#注释" 被误识别为标题** — 如 Python 代码块中 `# 快速排序实现` 被当作 Markdown 标题
2. **文本匹配不可靠** — 键值匹配预处理差异导致匹配失败
3. **`cm.charCoords + scrollTop` 坐标系不匹配**

### 解决方案
- `_buildHeadingLineMap()` — 代码块感知 + 顺序索引匹配 + TOC排除
- `_syncPreviewToEditor()` — `getBoundingClientRect()` + `cm.scrollIntoView()` 
- `_syncEditorToPreview()` — 三级降级策略（索引→属性扫描→行号比例）

### 匹配策略演进

| 版本 | 匹配方式 | 代码块感知 | 坐标系 | 反向精度 |
|------|----------|-----------|--------|---------|
| v1.13.0 | 百分比公式 | ❌ | scrollTop | 很差 |
| v1.13.1 | 文本键值 | ❌ | charCoords | 很差(偏移) |
| v1.13.2+ | **顺序索引** | ✅ | **getBoundingClientRect + scrollIntoView** | **精确** |

---

## v1.13.1 — 标题锚点精确同步滚动

### Bug 修复清单

| Bug | 版本 | 修复 |
|-----|------|------|
| `markActiveLeftOnEdit is not defined` | v1.13.1 | 统一使用 `_this._markActiveLeft()` |
| 编辑区→预览区偏移 2-3 节 | v1.13.1 | 标题锚点映射替代百分比公式 |
| `gotoLine()` 预览区同步偏移 | v1.13.1 | 改用 `_syncEditorToPreview()` |
| `flowChart...Render()` 滚动还原偏移 | v1.13.1 | 改用 `_syncEditorToPreview()` |
| **预览区→编辑区巨大偏移** | **v1.13.2** | **代码块感知 + 顺序匹配 + scrollIntoView** |
| 代码块内 `#` 注释被误识别 | v1.13.2 | `_buildHeadingLineMap` 新增代码块追踪 |
| jQuery `.offset()` 坐标系不稳定 | v1.13.2 | 统一使用 `getBoundingClientRect()` |
| `charCoords + scrollTop` 手动偏移 | v1.13.2 | 使用 `cm.scrollIntoView()` |

---

## 构建产物

| 源文件 | 输出文件 | 状态 |
|--------|---------|------|
| `src/editormd.js` | `editormd.min.js` | ✅ v1.13.3 |
| `src/editormd.js` → AMD | `editormd.amd.js` / `.min.js` | ✅ v1.13.3 |
| `css/editormd.css` | `css/editormd.min.css` | ✅ 已更新 |
| `css/editormd.dialog.css` | `css/editormd.dialog.min.css` | ✅ 已更新 |
| `languages/en.js` | `languages/en.min.js` | ✅ 已构建 |
| `languages/zh-cn.js` | `languages/zh-cn.min.js` | ✅ 已构建 |
| `languages/zh-tw.js` | `languages/zh-tw.min.js` | ✅ 已构建 |

---

## 兼容性说明

- 向后兼容所有现有 API
- `editormd.original.js` 未被修改（仅作参考）
- 所有编辑器实例默认开启 `syncScrolling: true`
- 支持 jQuery 1.8+，使用 `.on()`/`.off()` 命名空间事件兼容 jQuery 3.x
