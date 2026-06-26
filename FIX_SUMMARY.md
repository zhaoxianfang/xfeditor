# xfEditor 修复与改进总结

## 构建日期
2026-06-26

---

## v1.17.8 — 同步滚动彻底重写 + 暗色主题完善 + 主控区保护

### 🔴 同步滚动彻底重写

**核心架构变更**：

1. **主控区保护机制（新）**：
   - 通过 `wheel` 事件精确追踪用户正在滚动哪一侧（编辑区 or 预览区）
   - 主控区（用户正在操作的区域）**绝对不应被动滚动**
   - 轮询间隔 400ms 自动清除主控区标记

2. **位置映射表重构（新）**：
   - 替换旧的「标题锚点 + 线性插值」方案
   - 使用全部 `data-sign` 块构建精细位置映射表（`_buildPositionMap`）
   - 标题锚点用于精确对齐关键位置，块间按 editorLine 比例分配
   - 查找时使用二分查找 + 插值，精度大幅提升

3. **移除问题代码**：
   - ❌ 预览区 click 处理器：之前的 `click.editormd-sync-click` 会在用户点击预览区后**强制滚动编辑区**，导致「滚动后再点击→另一侧跳转」的 bug
   - ❌ 全页面 `mouseover` 追踪：之前的 `document.mouseover` 处理器每毫秒都在遍历 DOM 树，性能低下
   - ❌ `mouseenter/mouseleave` 200ms 延迟清除：导致主控区判断不准确

4. **防抖与方向门控优化**：
   - 编辑区 → 预览区：`_masterZone === "preview"` 时禁用（预览区是主控区，禁止写入）
   - 预览区 → 编辑区：`_masterZone === "editor"` 时禁用（编辑区是主控区，禁止写入）
   - 程序化滚动标记（`programmaticScroll`）精确防止反馈循环

### 🔴 暗色主题修复

- `setTheme("dark")` 现在**同时切换**编辑区、工具栏和**预览区**为暗色主题
- 预览区自动添加 `editormd-preview-theme-dark` class

### 🔴 暗色主题 CSS 增强

- 新增 10 个暗色主题选择器覆盖字帖（copybook）各个子元素
- 包括：`grid-cell`、`pinyin-top`、`pinyin-bottom`、`hanzi-text`、`pinyin-text`、`footnote` 等

### 🔴 图片缩放事件泄漏修复

- 将 `$(document).on("mousemove.editormd-img")` 和 `mouseup.editormd-img` 从 `.each()` 循环内**移至外部全局单例绑定**
- 防止每次 `initImageResize()` 调用时累积全局事件处理器
- 拖拽缩放期间调用 `suspendSyncScroll()`，防止预览区尺寸变化触发编辑器滚动

### 技术细节

**位置映射表构建流程**：
1. 扫描所有 `data-sign` 块
2. 提取标题锚点（editorLine → blockIndex 精确映射）
3. 标题间按 editorLine 比例分配 previewY 偏移
4. 构建 `[{editorLine, previewY}]` 密集映射表
5. 二分查找 + 线性插值定位

**轮询控制流程**：
```
用户 wheel 滚动编辑区 → _setMasterZone("editor")
  → 预览区 scroll 事件检查 → _masterZone === "editor" → 跳过
  → 编辑区 scroll 事件检查 → _masterZone === "editor" → 同步预览
  
用户 wheel 滚动预览区 → _setMasterZone("preview")  
  → 编辑区 scroll 事件检查 → _masterZone === "preview" → 跳过
  → 预览区 scroll 事件检查 → _masterZone === "preview" → 同步编辑
  
400ms 无 wheel 事件 → _masterZone = null → 回退到 mouseTarget 判断
```

---

## v1.17.8 (旧) — CodeMirror 事件崩溃修复 + 字帖宽度控制 + 拼音/脚注增强

### 🔴 致命Bug修复：CodeMirror `.off().on()` TypeError 崩溃

**问题根源**：在 `bindSyncScroll` 中使用链式调用 `cm.off("event").on("event", handler)` 来防止重复绑定。但 **CodeMirror 5.0.0 的 `.off()` 方法不支持链式调用**（不返回 `this`），导致 `.off()` 返回 `undefined`，后续 `.on()` 报错 `Cannot read properties of undefined (reading 'on')`。

源码证据（`lib/codemirror/lib/codemirror.js:8004`）：
```js
ctor.prototype.off = function(type, f) {off(this, type, f);};
//                                         ^^^^^^^^^^^^^^^ 没有 return this
```

**修复方案**：将 2 处 CodeMirror 的 `.off().on()` 链式调用拆分为独立语句：
```js
// ❌ 旧代码
cm.off("changes.xfsync").on("changes.xfsync", handler);
// ✅ 新代码
cm.off("changes.xfsync");
cm.on("changes.xfsync", handler);
```

> 注：jQuery 对象的 `.off().on()` 链式调用不受影响（jQuery 正确返回 this）。

### 🆕 新功能：字帖组级宽度控制

**语法**：`{文本|拼音}(!width:NNN)`，`(!width:NNN)` 为可选参数。

**示例**：
```markdown
[[copybookPinyin]]
{春眠不觉晓|chūn mián bù jué xiǎo}(!width:125)
{处处闻啼鸟|chù chù wén tí niǎo}(!width:125)
{夜来风雨声|yè lái fēng yǔ shēng}(!width:125)
[[/copybookPinyin]]
```

**实现**：
- `(!width:NNN)` 从行级参数升级为组级参数 — 每组独立设置宽度
- 组容器使用 `display: inline-flex; justify-content: space-between` 实现两端对齐排版
- 田字格/米字格同样支持 `(!width:NNN)` 组级宽度
- 兼容圆括号旧语法

### 🎨 拼音样式与功能增强

- 拼音颜色从 `#666` 改为 `#6b8e6b`（翠绿色），字重/字间距微调
- 一一对应模式（`editormd-pinyin-matched`）：每个字独立 ruby，居中对齐
- 拼音内嵌脚注样式独立：`font-size: 0.55em; vertical-align: super`
- 新增 CSS 类：`.editormd-pinyin .editormd-footnote-ref-wrapper`

### 📌 字帖脚注布局优化

- 拼音格中脚注只显示在汉字区（`.editormd-copybook-pinyin-bottom`），不在拼音区显示
- 新增 `.editormd-copybook-footnote` CSS 类：`position: absolute; bottom: 0; right: 1px`
- 脚注 CSS 类从 `.editormd-footnote-ref-wrapper` 改为 `.editormd-copybook-footnote`，避免样式冲突

### 💅 CSS 全面美化

- 新增 `.editormd-copybook-group` / `.editormd-copybook-group-pinyin` / `.editormd-copybook-group-grid` 组容器样式
- 新增 `.editormd-copybook-row-wide` 宽行容器样式
- `.editormd-pinyin-matched` 一一对应模式样式优化
- SCSS 源文件同步更新

### 📦 文档与示例更新

- `examples/index.html` — 新增 v1.17.8 分区，版本号/导航/统计更新
- `README.md` — 版本描述更新至 v1.17.8
- `USAGE_GUIDE.md` — 版本号更新，字帖宽度文档完善
- `FIX_SUMMARY.md` — 新增本版本条目

---

## v1.17.6-FIX — 同步滚动容器错位致命Bug修复 + 字帖脚注支持 + 全面优化

### 🔴 致命Bug修复：同步滚动容器错位

**问题根源**：整个同步滚动引擎中，`preview` 变量指向 `this.previewContainer`（`.editormd-preview-container` 内层 div），但在 CSS 布局中实际滚动发生在 `.editormd-preview`（外层 div）。所有位置计算公式：
- `preview[0].scrollTop` — 在内层 div 上始终返回 0（外层才滚动）
- `preview[0].getBoundingClientRect()` — 返回内层 div 的视口坐标（而非实际可观察区域）

**影响范围**：
- ❌ 编辑区滚动 → 预览区完全不动（计算出的目标位置始终为 0）
- ❌ 预览区滚动 → 编辑区不跟随（视口检测使用错误的容器 rect）
- ❌ `scrollToLineNum()` API 方法滚动到错误位置
- ❌ TOC 目录链接点击滚动失效
- ❌ 预览区点击同步跳转到错误行号

**修复方案**：引入 `_getScrollContainer()` 函数，从 `preview[0]` 向上查找第一个 `scrollHeight > clientHeight` 的祖先元素作为**实际滚动容器**。所有位置计算统一使用此容器的 `scrollTop` 和 `getBoundingClientRect()`。

**修复的函数（共 8 处）**：
| 函数 | 修复内容 |
|------|----------|
| `_editorLineToPreviewScroll` | `preview[0].scrollTop` → `sc.scrollTop`，`preview[0].getBoundingClientRect()` → `sc.getBoundingClientRect()` |
| `_previewScrollToEditorLine` | 视口基准从 `preview[0].rect` 改为 `sc.rect` |
| `_scrollAnimationTo` | 移除显式 `scrollContainer` 参数，内部调用 `_getScrollContainer()` |
| `_editorSyncToPreview` | 调用简化：`_scrollAnimationTo(targetScrollTop)` |
| `_previewScrollHandler` | 异常跳变防护使用 `_getScrollContainer()` |
| `_bindPreviewScroll` | 滚动事件绑定到 `_getScrollContainer()` |
| `scrollToLineNum` | 使用实际滚动容器的 rect 和 scrollTo |
| TOC 点击处理 | 使用实际滚动容器的 scrollTo |

### 🔴 data-sign 格式Bug修复

**问题**：`addBlockSignatures()` 生成 `data-sign="block-{N}"` 格式，但预览区点击处理器使用正则 `/line-(\d+)/` 解析期望 `H1-line-5` 格式，导致预览点击同步**完全失效**。

**修复**：重写点击处理器，解析 `block-{N}` 格式，通过块索引比例映射计算编辑区行号。

### 🆕 字帖/拼音格脚注支持

**新语法**：`(处处闻[^fn1]啼鸟)` 或 `(处处闻[^fn1]啼鸟|chù chù wén tí niǎo)`

- `[^脚注名]` 紧跟在要标注的汉字后面
- 字帖格右上角显示脚注编号标记 `<sup>`
- 页面底部可用标准 `[^fn1]: 注释内容` 定义脚注

**实现**：`renderCopybookGrid()` 新增 `parseCharsWithFN()` 内部函数，逐字符扫描文本，检测 `[^...]` 模式并将脚注引用附加到前一个字符对象上。

### 🟡 scrollToLineNum 改进

- 使用实际滚动容器而非 `preview[0]`
- 使用双 `requestAnimationFrame` 替代 `setTimeout(400)` 清除程序化滚动标记

---

## v1.17.6 — 同步滚动全面重构 + 嵌套语法强化 + 安全性加固

### 🔴 核心改进：编辑器-预览区双向同步滚动全面重构

本次重构实现了**鼠标在左侧编辑区滚动时，右侧实时跟随展示对应的预览内容；鼠标在右侧预览区滚动时，左侧实时跟随展示对应的编辑源码**。

#### 改进 1: 预览区滚动监听精简（消除 N 倍事件）

**问题**：旧版 `_bindPreviewScroll()` 将 scroll 监听器绑定到预览区 DOM 元素的**所有祖先元素**链上（一直追溯到 body），导致单个用户滚动操作触发 N 次 `_previewScrollHandler` 回调（N = DOM 树深度），造成严重的性能浪费和潜在的滚动竞态问题。

**修复**：精简为三层绑定：
1. **主绑定**：仅绑定到通过 `_findScrollContainer()` 找到的**实际滚动容器**
2. **直连绑定**：绑定到 `previewContainer` 自身（某些布局下直接滚动发生在容器本身）
3. **后备绑定**：仅绑定到 `window` 且在回调中验证预览区在可视区域内

```javascript
// 旧方案：循环绑定所有祖先（N 次绑定）
while (current && current !== document.body) {
    $(current).on("scroll.editormd-sync-v3", _previewScrollHandler);
    current = current.parentElement;
}

// 新方案：三层精准绑定
var scrollEl = _findScrollContainer(preview[0]);
$(scrollEl).on("scroll.editormd-sync-v3", _previewScrollHandler);
preview.on("scroll.editormd-sync-v3-direct", _previewScrollHandler);
$(window).on("scroll.editormd-sync-v3-win", filteredHandler);
```

#### 改进 2: 滚动动画竞态修复

**问题**：`_scrollAnimationTo()` 使用 `setTimeout(50ms)` 清除 `programmaticScroll` 标记，与 `requestAnimationFrame` 动画帧之间存在竞态窗口。在 50ms 内，用户的滚动事件可能被程序化标记拦截。

**修复**：
- 使用 `_animCounter` 唯一 ID 追踪动画，防止过期回调执行
- 使用 `double rAF` 替代 `setTimeout` 清除标记（更精确的帧同步）
- 添加目标位置变化检测，避免不必要动画：
  ```javascript
  if (Math.abs(scrollContainer.scrollTop - targetScrollTop) < 2) return;
  ```

#### 改进 3: 编辑器内容变更 → 自动重新同步

**新增功能**：监听 CodeMirror `changes` 事件，在用户输入/粘贴后 30ms 重新同步预览区滚动：
```javascript
cm.on("changes", function() {
    clearTimeout(_editorChangeTimer);
    _editorChangeTimer = setTimeout(function() {
        _invalidateAnchors();
        _editorSyncToPreview();
    }, 30);
});
```

#### 改进 4: 编辑器键盘导航 → 即时同步

**新增功能**：监听 CodeMirror `cursorActivity` 事件，当光标因 PageUp/PageDown/Ctrl+Home/Ctrl+End 等键盘导航离开可视区域时，立即触发同步：
```javascript
cm.on("cursorActivity", function() {
    var cursor = cm.getCursor();
    var cursorTop = cm.charCoords(cursor, "local").top;
    if (cursorTop < cmInfo.top || cursorTop > cmInfo.top + cmInfo.clientHeight) {
        _invalidateAnchors();
        _editorSyncToPreview();
    }
});
```

#### 改进 5: 预览区点击 → 编辑区同步

**新增功能**：用户点击预览区内容时，编辑器自动滚动到对应行号。通过 `data-sign` 属性解析出的行号映射：
```javascript
preview.on("click.editormd-sync-click", function(e) {
    // 排除交互元素（链接、按钮、tab导航等）
    var signEl = $(e.target).closest('[data-sign]');
    var lineMatch = signEl.attr('data-sign').match(/line-(\d+)/);
    cm.scrollTo(0, targetEditorTop);
});
```

#### 改进 6: 窗口大小调整 → 重新同步

```javascript
$(window).on("resize.editormd-sync", function() {
    _cachedPreviewScrollEl = null;  // 清除滚动容器缓存
    _invalidateAnchors();
    _editorSyncToPreview();
});
```

#### 改进 7: 全局鼠标位置精确追踪

**新增功能**：使用 `document.mouseover` 替代仅依赖 `mouseenter/mouseleave`，通过 DOM 遍历精确判断鼠标是否在编辑区/预览区内：
```javascript
$(document).on("mouseover.editormd-sync-track", function(e) {
    // 遍历 DOM 树检查是否在编辑区或预览区内
});
```

#### 改进 8: 编辑区→预览区滚动比例映射改进

**问题**：旧版仅使用 `cm.lineAtHeight()` 获取可视中心行，对于行高不均匀的文档精度不足。

**修复**：同时使用滚动比例和可视行计算，取两者平均：
```javascript
var scrollRatio = cmInfo.top / cmMaxScroll;
var ratioLine = Math.round(scrollRatio * (totalLines - 1));
var visibleCenter = firstVisibleLine + (lastVisibleLine - firstVisibleLine) / 2;
centerLine = Math.round((ratioLine + visibleCenter) / 2);
```

#### 改进 9: 滚动容器缓存优化

```javascript
var _cachedPreviewScrollEl = null;
// 缓存有效期 500ms，避免每次 findScrollContainer 都遍历 DOM
```

#### 改进 10: unbindSyncScroll 全面清理

新增清理的监听器：
- `cm.off("changes cursorActivity")` — CodeMirror 事件
- `$(window).off("scroll.editormd-sync-v3-win resize.editormd-sync")`
- `$(document).off("mouseover.editormd-sync-track")`
- `preview.off("click.editormd-sync-click click.editormd-toc")`
- `scroll.editormd-sync-v3-direct` 命名空间
- 重置 `lastEditorSyncTime` 和 `lastPreviewSyncTime`

### 🟡 嵌套语法安全性加固

#### `findBalancedBlocks` 安全限制

新增两级安全保护：
- **最大块数限制**：500 个块后停止搜索
- **最大迭代限制**：50000 次迭代后停止搜索
- 防止病态输入（如海量嵌套标签）导致的浏览器卡死

#### `preprocessMarkdownBlocks` null 安全检查

```javascript
if (typeof editormd.$marked !== "function") {
    console.warn("[xfEditor] editormd.$marked is not available");
    return { markdown: markdown, placeholders: [] };
}
```

### 🟢 错误诊断改进

同步滚动的 7 个静默 `catch(e) {}` 改为带警告日志的 `catch(e) { console.warn(...) }`：
- Editor→Preview 同步错误
- Preview→Editor 同步错误
- 初始化/动画/恢复相关同步错误

---

## v1.17.5 — 关键 Bug 修复 + 全面优化

### 🔴 关键 Bug 1: `restorePlaceholders` 嵌套占位符失效

**问题**：当预处理阶段产生嵌套占位符时（如 `[[tabs]]` 嵌套在 `[[row]]/[[col]]` 内），`restorePlaceholders` 仅执行单次顺序遍历，导致内层占位符无法被还原。

**影响**：
- 栅格化布局(col)内嵌套的 Tabs 无法渲染（`[[tabs]]`/`[[tab:]]` 语法显示为原始文本）
- 任意两层及以上的嵌套块级语法均受影响

**修复**：改为多轮 while 循环 + `forEach` 闭包隔离，直到无变化或达到安全上限(10轮)，确保任意深度的嵌套占位符都能正确还原。`forEach` 闭包同时解决了 uglifyjs 压缩时变量名碰撞问题。

### 🔴 关键 Bug 2: 共享正则 `lastIndex` 状态污染导致多 Tab 丢失

**问题**：`preprocessMarkdownBlocks` 中 Tabs 处理使用 `var tabRegex = editormd.regexs.tabItem`（全局共享正则引用）。当对每个 Tab 内容递归调用 `preprocessMarkdownBlocks()` 时，内部递归也会访问同一个 `editormd.regexs.tabItem` 并可能重置其 `lastIndex`，导致外层 `while ((tabMatch = tabRegex.exec(content)) !== null)` 从位置 0 重新匹配，陷入只匹配第一个 Tab（产品介绍）的死循环，在达到 50 上限后 break。第二个（更新日志）和第三个（使用帮助）Tab 永远不会被匹配。

**影响**：
- 当 Tab 内容足够复杂（触发递归预处理）时，只有第一个 Tab 被渲染，其余 Tab 显示为原始 `[[tab:名称]]` 文本
- 在 all-features.html 中表现为「使用帮助」Tab 无法解析
- 所有包含多个 Tab 且 tab 内容触发递归预处理的场景均受影响

**根因演示**：
```
正则 lastIndex: 0 → match "产品介绍" → lastIndex=231
递归调用 → lastIndex 被重置为 0
while 循环: lastIndex=0 → match "产品介绍" AGAIN → lastIndex=231
while 循环: lastIndex=0 → match "产品介绍" AGAIN → ...
→ 50 次后触发安全限制 break，更新日志和使用帮助被静默丢弃
```

**修复**：改为 `var tabRegex = new RegExp(editormd.regexs.tabItem.source, 'g')`，创建完全独立的局部正则实例，即使递归调用修改了全局共享正则的 `lastIndex`，外层循环也不受影响。

### 🔴 关键 Bug 3: `protectCodeBlocks` 非行首匹配导致伪代码块吞噬后续语法

**问题**：`protectCodeBlocks()` 中围栏代码块正则 `/(`{3,}|~{3,})/g` 没有行首锚点（`^` 或 `\n`）。当文档中出现作为**示例文本**展示的围栏语法时（如 ` ```(hidden.class#id) ` 语法"），正则将其误识别为真正的代码块开头，并贪婪匹配到下一个真正的代码块结束围栏，形成长达数千字符的伪代码块。

**案例**：`all-features.html` 的「更新日志」Tab 内容中包含以下文本：
```
### v1.17.5
- 🙈 **Hidden 隐藏代码块**：` ```(hidden) ` ` ```(hidden.class#id) ` 语法
```
其中 `` ```(hidden.class#id) ` `` 作为语法示例的纯文本，被 `protectCodeBlocks` 误认为围栏代码块开始。从该位置（~10,448）一直匹配到 section 6.2 的 ` ```javascript ` 代码块结束（~12,463），吞掉了 2,015 个字符。

**被吞噬的关键内容**（按在文档中的位置顺序）：
- `[[tab:使用帮助]]` 开标签
- 使用帮助 Tab 的全部内容
- `[[/tab]]` 闭标签
- `[[/tabs]]` 闭标签（section 6.1 的结尾）
- `### 6.2 标签页内嵌套复杂内容` 标题
- 6.2 的描述文本
- `[[tabs]]` 开标签（section 6.2 的开头）
- `[[tab:代码示例]]` 开标签

**影响**：
- section 6.1 的 `[[/tabs]]` 消失 → `findBalancedBlocks` 无法找到 section 6.1 的配对 → 第一个 Tabs block 完全不处理
- section 6.2 的 `[[tabs]]` 消失 → 第二个 Tabs block 也不处理
- 保护后 `[[tabs]]` 从 3 锐减到 2，`[[/tabs]]` 从 3 锐减到 2
- 任何包含 ` ``` ` 围栏语法作为示例文本的 Tab/Columns/Grid 内容均可能受影响

**修复**：正则改为 `/(^|\n)(`{3,}|~{3,})/g`，要求围栏开标签必须在行首（CommonMark 规范）。回调函数中保留 `prefix`（前导换行符/行首），占位符前拼接 `prefix + "<!--"`。

```javascript
// 旧正则（无行首锚点，会误匹配行内出现的 ` ``` `）：
/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n(`{3,}|~{3,})(?=\s*(?:\n|$))/g

// 新正则（围栏必须在行首）：
/(^|\n)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n(`{3,}|~{3,})(?=\s*(?:\n|$))/g
```

### 🟢 CSS 编译优化

**问题**：
1. `scss/editormd.scss` 中直接定义了 tabs/columns/row/col 样式
2. `scss/editormd.scss` 又通过 `@import "editormd.preview"` 引入了 `editormd.preview.scss` 中的相同样式
3. 导致编译后的 `css/editormd.css` 中 tabs/columns/row/col 样式出现两次（~90 行重复）
4. `editormd-echarts` 同样重复出现

**修复**：从 `scss/editormd.scss` 中删除直接定义的 tabs/columns/row/col/echarts 样式块（~87 行），由 `@import "editormd.preview"` 统一提供。

### 🟡 `_getCoreStyles` 内联 CSS 统一

将 `_getCoreStyles()` 中的内联 tabs/row/col CSS 值统一为与 SCSS 编译后一致的样式值：
- Tab 导航背景: `#f8f9fa` → `#f8f8f8`
- Tab 导航项 padding: `10px 18px` → `10px 20px`
- Tab 导航项边框: `#eee` → `#ddd`
- Tab 导航项:hover 背景: `#fff` → `#eee`
- Tab 内容区 padding: `16px` → `15px`

### 📝 文档修复

- README.md: 配置表中补充 `grid` 选项
- USAGE_GUIDE.md: 修正章节编号重复（两个"8."→"8."和"9."，后续章节顺延）

---

## v1.17.5-hotfix — 预览区滚动时编辑区跳转到顶部的 bug 修复

### 问题诊断

用户反馈：右侧预览区滚动时，左侧编辑区直接滚动到顶部。

**根因分析**：

1. **二进制搜索回退路径 bug**（最严重）：
   `_previewScrollToEditorLine()` 在无标题锚点时使用二分查找定位 `[data-sign]` 块。
   - `foundIdx2` 初始值为 `0`
   - 当所有块都在视口**上方**时（用户已滚动通过），二分查找无法匹配任何块，`foundIdx2` 保持为 `0`
   - 导致 `ratio2 = 0` → 返回行号 `0` → 编辑器跳转到顶部

2. **标题锚点定位使用仅 `top` 而非视口中心**：
   原逻辑找 `et` 最小的标题（最靠近视口顶部的），但这在视口边界附近会导致不稳定的跳变。改用视口中心距离作为定位基准更为稳定。

3. **锚点回退直接返回第一个**：
   当所有标题都在视口下方时（用户在文档开头），直接返回 `anchors2[0].editorLine` 在特定情况下可能为 0，导致异常跳顶。

4. **缺少滚动来源验证**：
   `document.body` 上的 scroll 监听可能捕获与预览区无关的页面滚动事件，触发错误的同步计算。

5. **缺少安全防护**：
   没有机制检测编辑器从非顶部位置突然跳变到行 0 的异常情况。

### 修复方案

#### 1. `_previewScrollToEditorLine()` 全面重写

- **视口中心定位**：使用 `viewportCenter = (vpTop + vpBottom) / 2` 作为锚点匹配基准，替代仅使用 `vpTop`
- **三优先策略**：
  - 第一优先：查找穿过视口中心最近的标题锚点
  - 第二优先：查找视口上方最后一个锚点
  - 第三优先：查找视口下方第一个锚点（用户未滚动到任何标题）
- **二分搜索修复**：`foundIdx2` 初始值改为 `-1`，在循环后若 `< 0` 则使用最后一个块
- **零高度容器保护**：若 `getBoundingClientRect()` 返回高度为 0，回退使用 `window.innerHeight`
- **安全边界**：返回值始终限定在 `[0, totalLines-1]` 区间

#### 2. `_previewScrollHandler()` 安全强化

- **滚动来源验证**：检查 `e.target` 是否属于 preview 容器或其子孙元素，非预览区滚动直接跳过
- **异常跳变检测**：追踪 `_lastValidEditorLine`，若之前位置 > 5 行但目标突然为 0，且预览区 scrollTop > 50px，则使用滚动比例估算替代

#### 3. 三个文件同步修复
- `src/editormd.js`
- `editormd.js`
- `editormd.amd.js`
- `.min.js` 文件重新构建

---

## v1.17.5 — 同步滚动引擎全面重写（程序化识别 + 预览交互防护 + 门控体系）

### 问题诊断

经过 `all-features.html` 深度测试，发现三个核心问题：

**问题一：预览区→编辑区滚动不跟随**
- 根因：原有的 `disableScrollListener` 标志在 editor→preview 动画期间会错误地阻止用户主动在预览区的所有滚动事件
- 门控逻辑 `anim.disableScrollListener && _this._syncScrollActive !== "preview"` 意味着当动画运行时且鼠标不在预览区时，所有预览区 scroll 事件都被丢弃
- 滚动容器绑定不够全面：只绑定了 `_findScrollContainer` 找到的单个元素

**问题二：图片拖拽缩放触发预览区滚动跳转**
- 调用链：拖拽结束 → `modifyImageSizeInMarkdown()` → `cm.setValue()` → 触发 `cm.on("change")` → `save()` → `previewContainer.html()` 重建 DOM（滚动位置归零）→ `cm.scrollTo()` 触发 editor→preview sync → 预览滚动到基于编辑器中心行的计算位置（不正确）
- 之后 `this.preview.scrollTop(previewScroll)` 尝试恢复，但可能已被 sync 覆盖

**问题三：左右两侧可视内容偏差大**
- 标题锚点配对使用纯顺序匹配：第 N 个编辑器标题 = 第 N 个预览标题
- 代码块内的 `#` 开头行会被错误识别为标题
- 无文本/层级验证，错位后整个映射链全部偏移

### 修复方案

#### 1. 统一状态管理 `_syncState`

```javascript
this._syncState = {
    suppressAllSync      : false,   // 完全禁用（预览交互时）
    programmaticScroll   : false,   // 代码触发的滚动（忽略该事件）
    disablePreviewListener: false,  // 仅禁用预览→编辑（动画期间）
    editorAnimTimer      : null,
    lastEditorSyncTime   : 0,
    lastPreviewSyncTime  : 0,
    mouseTarget          : null
};
```

#### 2. 门控优先级体系

预览→编辑方向的检查顺序（优先级从高到低）：
1. `suppressAllSync` → 预览交互更新内容时完全禁用
2. `programmaticScroll` → 程序化滚动忽略
3. `disablePreviewListener` → editor→preview 动画期间禁用
4. `applyingDomChanges` → DOM 更新期间禁用
5. `mouseTarget === "editor"` → 鼠标在编辑区时禁用

#### 3. 预览交互防护

- 新增 `suspendSyncScroll()` / `resumeSyncScroll()` 外部接口
- `modifyImageSizeInMarkdown` 中：操作前 `suspendSyncScroll()`，150ms 后 `resumeSyncScroll()`
- `modifyTableInMarkdown` 中：同样添加保护
- 保护期间 `cm.setValue()` → `save()` → 预览重建不会触发任何方向同步

#### 4. 祖先链滚动监听

从 previewContainer 向上遍历至 body，每个可能有滚动能力的祖先都绑定 `.editormd-sync-v3` 监听器。确保无论滚动发生在哪个元素上，都能触发预览→编辑同步。

#### 5. 标题锚点智能配对

- **代码块过滤**：跟踪 `` ``` `` 边界，跳过代码块内行
- **文本+层级验证**：第一轮精确匹配（相同文本 + 相同层级），第二轮顺序回退
- **排序保证**：配对结果按 editorLine 排序

#### 6. 程序化滚动识别

- 编辑器 `scrollIntoView` 前设置 `programmaticScroll = true`，50ms 后清除
- 预览区 smooth `scrollTo` 同样设置标记，400ms 后清除
- 动画 `scrollContainer.scrollTop = ...` 每一帧都设置标记
- editor→preview 动画中 `disablePreviewListener = true`

### 代码变更

| 文件 | 变更 |
|------|------|
| `src/editormd.js` | 新增 `_syncState` 统一状态（+10行）；重写 `_buildHeadingAnchorMap`（+40行，文本验证+代码块过滤）；完全重写 `bindSyncScroll`（+550/-440行，门控体系+祖先链监听+程序化识别）；重写 `unbindSyncScroll`（+20/-10行）；更新 `scrollToLineNum`（+10/-0行，programmatic标记）；更新 `modifyImageSizeInMarkdown`（+8/-2行，suspendSyncScroll保护）；更新 `modifyTableInMarkdown` setValue 块（+8/-2行，suspendSyncScroll保护） |
| `editormd.amd.js` | 同步更新 |
| `editormd.js` | 同步更新 |
| `package.json` | 版本 → 1.17.4 |
| `README.md` | 新增 v1.17.5 改进表格 |
| `FIX_SUMMARY.md` | 新增 v1.17.5 详细说明 |
| 构建产物 | `editormd.min.js`、`editormd.amd.min.js`、`css/*.min.css` |

---

## v1.17.3 — 同步滚动彻底修复（标题锚点重写 + 预览区滚动修复）

### 问题诊断

**问题一：滚动右侧预览区时，左侧编辑区没有跟随滚动**
- 根因：`scroll` 事件绑定到 `this.previewContainer`，但实际滚动可能发生在父级容器
- 即使 `.editormd-preview-container` 设置了 `overflow: auto`，在某些布局/窗口尺寸下，实际的 scroll 事件并不在此元素上触发

**问题二：左右两侧可视内容偏差极大**
- 编辑器显示「## 十三、流程图 Flowchart」时，预览区显示「二十三、上标与下标」
- 根因：简单比例映射 (`editorLine/ totalLines` → `blockIndex / blockCount`) 假设编辑行数与预览区块呈线性关系，但实际上：
  - 1 行标题 → 1 个预览 block（大）
  - 50 行代码块 → 1 个预览 block（小）
  - 段落密度差异巨大
- 这种非线性导致比例映射严重偏离

### 修复方案：标题锚点映射（Heading Anchor Mapping）

#### 实现原理

**`_buildHeadingAnchorMap()` 实例方法**：
1. 解析 CodeMirror 源码中所有 `# ` 标题行号
2. 查询预览 DOM 中所有带 `[data-sign]` 的 `<h1>`-`<h6>` 元素
3. 按序配对构造 `editorLine ↔ previewElement` 双向映射表

**方向一：编辑区→预览区（标题锚点 + 插值）**：
1. 获取编辑区可视中心行号
2. 找到包含该行的相邻标题锚点（prevAnchor, nextAnchor）
3. 在相邻锚点间线性插值计算预览区目标滚动位置
4. 使用 `easeInOutCubic` 缓动动画滚动

**方向二：预览区→编辑区（标题锚点定位）**：
1. 查找预览区视口内第一个可见标题锚点
2. 直接返回该标题对应的编辑器行号
3. 使用 `CodeMirror.scrollIntoView` 定位

**回退策略**：文档无标题时自动回退到比例映射 + 二分查找

#### 滚动容器绑定修复

**双保险机制**：
- 同时监听 `_findScrollContainer(preview[0])` 真实滚动容器 + `previewContainer` 自身
- 使用 `.editormd-sync-v2` 命名空间避免与旧版冲突
- `unbindSyncScroll()` 同时清理两个监听器

#### 锚点缓存与失效

- 内容不变时使用缓存避免重复构建（内容指纹匹配）
- `wheel` / `mousedown`（滚动条拖拽）时自动失效重建

#### 代码变更

| 文件 | 变更 |
|------|------|
| `src/editormd.js` | 新增 `_buildHeadingAnchorMap` 实例方法（+60行）；重写 `bindSyncScroll`（+440/-340行）；更新 `unbindSyncScroll`(+10行）；重写 `scrollToLineNum`（+50/-25行）|
| `editormd.amd.js` | 同步更新 |
| `editormd.js` | 同步更新 |
| 构建产物 | `editormd.min.js`、`editormd.amd.min.js` |

---

## v1.17.2 — 同步滚动增强 + 工具栏修复 + 链接跳转方式 + 悬浮提示增强

### 1. 同步滚动引擎进一步增强
基于 v1.17.1 的区块签名映射引擎，进行以下增强：

**编辑→预览方向增强：**
- 使用 `cm.lineAtHeight()` 获取可见行范围，以可见区域中心行计算比例（替代纯滚动位置比例）
- 新增 `easeInOutCubic` 缓动函数替代线性步进
- 添加 30ms 防抖（`SYNC_DEBOUNCE`）

**预览→编辑方向增强：**
- 二分查找定位可见区块（O(log n) 替代 O(n) 线性扫描）
- 添加 30ms 防抖

**动画增强：**
- 使用 `performance.now()` 精确计时
- `easeInOutCubic` 缓动：加速→减速，更自然

**滚动条拖拽检测：**
- 新增 `mousedown` 事件检测滚动条拖拽
- 拖拽时自动暂停动画并恢复监听

**块签名系统增强：**
- `addBlockSignatures()` 扩展支持 `li`, `section`, `article`, `header`, `footer`, `nav`, `main`, `aside`, `dl`
- 新增 `data-sign-count` 属性记录总块数

### 2. 工具栏全面修复（`executePlugin` 重构）
**问题：** `executePlugin` 在 AMD 模式下调用插件（通过 `typeof define === "function"` 分支），非 AMD 模式尝试动态加载。如果插件未找到或路径错误，静默失败。

**修复：**
- 重构为统一调用方式：优先检查 `this[name]` 是否存在并直接调用
- 回退到动态加载之前缓存的外部插件
- 所有模式下都能正确调用已注册的插件方法
- `linkDialog`, `imageDialog`, `videoDialog`, `tableDialog`, `codeBlockDialog` 等全部恢复正常

### 3. 链接跳转方式（Link Target）
**新增功能：**
- 链接对话框中新增跳转方式下拉选择（新页面 `_blank` / 当前页面 `_self` / 父窗口 `_parent` / 顶层 `_top`）
- 支持扩展语法 `[text](url){target=_blank}`
- 新增 `preprocessLinkTarget()` 预处理函数
- 在所有渲染管线中统一处理（`save()`, `getHTML()`, `getPreviewedHTML()`, `markdownToHTML()`）
- 链接渲染器解析 title 中的 `target=` 指令
- `target="_self"` 时不添加 `rel="noopener"`

### 4. 悬浮提示最大化/还原增强
**改进：**
- 最大化/还原按钮现在适用于所有 tooltip 类型（不仅是 iframe）
- 图标区分：最大化 `□` → 还原 `❐`
- 还原时完整恢复原始尺寸：包括自适应状态（无宽高时）
- 内部内容元素样式（img, iframe, div 等）在还原时完整恢复
- 保存更多原始样式属性（minWidth, minHeight, position 等）

### 5. 构建与文档
- 版本号统一更新至 v1.17.2
- `editormd.amd.js` 通过 `build-amd.js` 同步更新
- 所有 .min 文件重新编译压缩
- README 更新：v1.17.2 改进说明、链接 target 语法说明
- 示例文件版本号更新
- 语言包新增链接跳转方式相关文本

---

## v1.17.1 — 同步滚动引擎重写（参照 cherry-markdown）

### 架构改进

#### 1. 区块签名系统（`addBlockSignatures`）
- **新增** `editormd.addBlockSignatures(html, totalLines)` 静态函数
- 在 marked 渲染后为所有块级元素注入 `data-sign="block-N"` 属性
- 支持的块级元素：h1-h6, p, pre, blockquote, ul, ol, table, div.editormd-*
- 使编辑区行号 ↔ 预览区块能精准双向映射，替代旧版纯比例算法

#### 2. 同步滚动引擎完全重写
参照 Tencent/cherry-markdown 的 `scrollHandler`、`$scrollAnimation`、`wheelHandler`、`scrollToLineNum` 设计：

**方向一：编辑区 → 预览区**
1. 获取 CodeMirror 可见行范围的第一行
2. 按行比例计算目标区块索引
3. 查找 `[data-sign="block-N"]` 元素
4. `requestAnimationFrame` 缓动动画滚动预览区（~200ms）

**方向二：预览区 → 编辑区**
1. 扫描 `[data-sign]` 区块，找到第一个 `bottom > viewportTop` 的块
2. 计算区块序号占总块数比例
3. 映射到编辑区行号
4. 使用 `cm.scrollIntoView` 定位

#### 3. 滚动动画系统
- `requestAnimationFrame` 逐帧步进，每帧移动 `delta / 12` 步
- 约 200ms 内完成，ease-out 效果
- 可取消（`cancelAnimationFrame`）
- 动画期间设定 `disableScrollListener = true` 阻止反向同步

#### 4. 多重防抖锁机制
```
┌─────────────────────────────────────────────────────┐
│ disableScrollListener  │ 动画进行中禁止预览→编辑同步   │
│ _applyingDomChanges    │ DOM 更新期间禁止反向同步       │
│ _syncScrollActive      │ 鼠标所在区域追踪防死循环       │
│ wheel handler          │ 用户滚轮打断动画+恢复监听      │
└─────────────────────────────────────────────────────┘
```

#### 5. 新增 API
- `editor.scrollToLineNum(lineNum, linePercent)` — 编程式滚动预览区到指定行号
- `editor.bindSyncScroll()` — 绑定同步滚动（改进版）
- `editor.unbindSyncScroll()` — 解绑同步滚动（改进版）
- `editormd.addBlockSignatures(html, totalLines)` — 静态方法

#### 6. 源码变更统计
| 文件 | 变更 |
|------|------|
| `src/editormd.js` | 新增 `addBlockSignatures` 函数（+40行）；重写 `bindSyncScroll`（+170/-65行）；重写 `unbindSyncScroll`（+12/-3行）；新增 `scrollToLineNum` API（+25行）；save() 注入块签名+DOM锁（+10行）；新增 4 个状态变量 |
| 构建产物 | `editormd.min.js`(197K)、`editormd.amd.min.js`(198K) |

#### 7. 文档更新
- `README.md`: v1.17.1 更新日志
- `USAGE_GUIDE.md`: 同步滚动配置 + `scrollToLineNum` API 文档
- `FIX_SUMMARY.md`: 本文件

---

## v1.17.0 — 同步滚动、Tooltip 增强、栅格布局完善

### 新增功能

#### 1. 编辑区与预览区同步滚动
- 采用基于比例的同步算法：滚动比例 = scrollTop / (scrollHeight - clientHeight)
- 编辑区滚动 → 预览区按相同比例跟随
- 预览区滚动 → 编辑区按相同比例跟随
- 通过鼠标位置追踪（mouseenter/mouseleave）防止滚动死循环
- 使用 requestAnimationFrame 确保平滑滚动
- 默认启用：`syncScroll: true`
- 新增 `bindSyncScroll()` 和 `unbindSyncScroll()` 实例方法

#### 2. Tooltip iframe 最大化/关闭按钮
- iframe 类型弹窗右上角自动显示最大化（⛶）和关闭（✕）按钮
- 最大化：弹窗切换至全屏模式（96vw × 92vh），iframe 自动调整，再次点击恢复
- 关闭：立即关闭弹窗，释放 Blob URL，无需等待延迟
- 存储并恢复原始尺寸 CSS，最大化/还原平滑过渡
- 按钮 hover 效果：最大化显示蓝色，关闭显示红色

#### 3. Tooltip 固定尺寸自动滚动条
- 设置宽高时容器自动 `overflow-x:auto; overflow-y:auto`
- 内容区（text-content/html-content）同步设置滚动
- 超出指定尺寸的内容可垂直/水平滚动

### 栅格布局完善

#### 4. CSS 样式补全
- `editormd.grid.scss` 新增 `.editormd-row`（flex-wrap 容器）和 `.editormd-col`（自适应列）样式
- `_getCoreStyles()` 同步补全样式，确保 `getHTML()` 导出时栅格布局可用
- 列间距 1px 分隔线（rgba 半透明），列内 8px/12px 内边距

#### 5. 边界条件修复
- 空行（无 [[col]] 的 [[row]]）：显示警告占位提示（⚠ 空行），不再静默生成空 div
- 列宽最小值从 0 提升至 1%，防止 0% 宽度列完全不可见
- `[[columns:0]]` 解析修复：`parseInt("0") || 3` 改为 `isNaN(parseInt(x))` 判断，0 列会触发 < 1 校验

### 构建产物更新

#### 6. 文件编译
- `editormd.min.js`、`editormd.amd.min.js` 重新压缩（v1.17.0）
- `css/editormd.min.css`、`css/editormd.preview.min.css` 重新压缩
- SCSS 源码编译至 CSS（editormd.preview.scss、editormd.grid.scss）
- `package.json` 版本号更新至 1.17.0
- README.md、USAGE_GUIDE.md、FIX_SUMMARY.md 更新至 v1.17.0

---

## v1.16.0 — 章节编号规范化、栅格语法修复

### 栅格语法修复

#### 4. `createMarkedOptions` 选项补全
- **新增 `grid` 选项**：防止嵌套渲染时栅格语法被意外跳过
- **新增 `textAlign` 选项**：确保嵌套内容（tabs/columns/page 内）的文本对齐语法正确渲染

### 章节编号规范化

#### 5. 示例文件编号修复
- all-features.html / full-preview.html 中「七点五、栅格化布局 Grid」改为「八、栅格化布局 Grid」
- 所有后续章节编号顺序递进（八→九、九→十...二十五→二十六）
- 所有子标题编号同步更新（7.5.x → 8.x、8.x → 9.x 等）

### 构建产物更新

#### 6. 文件编译
- `editormd.min.js`、`editormd.amd.min.js` 重新压缩（v1.16.0）
- `css/editormd.min.css`、`css/editormd.preview.min.css` 重新压缩
- `package.json` 版本号更新至 1.16.0
- README.md、USAGE_GUIDE.md 更新至 v1.16.0

---

## v1.15.0

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

### v1.15.0 Bug 修复（第三轮 — 栅格化布局）

#### 1. 🆕 栅格化布局语法 (Grid Layout) 🔴 NEW FEATURE
**语法**：`[[row]]...[[/row]]` + `[[col:N]]...[[/col]]` (1≤N≤10)，类似 Bootstrap 10 栏栅格系统
- `[[row]]` — 独占 100% 宽度的行容器（flexbox 实现）
- `[[col:N]]` — 占 N×10% 宽度（N 为 1-10 的数字）
- `[[col]]` — 省略数字时，按行内 col 个数平分剩余 100% 宽度
- 支持显式/自动/混合列宽计算
- **支持嵌套**：col 内部可包含代码块、表格、ECharts、Tabs 等全部 xfEditor 扩展语法
- **响应式**：小屏幕（≤768px）自动堆叠为 100% 宽度

#### 2. 🧰 工具栏新增「栅格化」工具
- 位于「插入」下拉菜单中，图标为 `fa-th`
- 插入预设模板：3:7 分栏示例

#### 4. 📐 CSS 样式扩展
| 文件 | 变更 |
|------|------|
| `css/editormd.css` | 新增 `.editormd-row` / `.editormd-col` 栅格样式 |
| `css/editormd.preview.css` | 新增栅格样式 + 暗色主题 |
| `css/editormd.min.css` / `.preview.min.css` | 重新压缩 |
| `scss/editormd.scss` | 新增栅格 SCSS |
| `scss/editormd.preview.scss` | 新增栅格 SCSS + 响应式 |
| `scss/editormd.preview.themes.scss` | 暗色主题栅格扩展 |

#### 5. 📄 示例页面更新
- `examples/all-features.html` — 新增 §7.5 栅格化布局章节（6 个子章节，含嵌套图表/Tabs 等复杂示例），添加 `grid: true` 配置
- `examples/full-preview.html` — 同步新增 §7.5 章节和 `grid: true` 配置

#### 6. 📦 构建确认
| 文件 | 大小 |
|------|------|
| `editormd.js` | ~495K |
| `editormd.min.js` | ~198K |
| `editormd.amd.js` | ~498K |
| `editormd.amd.min.js` | ~199K |
| 所有 `.min.css` / `languages/*.min.js` | ✅ 已重建 |

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
- 标题映射采用代码块感知 + 顺序索引匹配 + TOC排除策略
- 预览区定位统一使用 `getBoundingClientRect()` + `cm.scrollIntoView()` 
- 编辑器定位采用三级降级策略（索引→属性扫描→行号比例）

### 匹配策略演进

| 版本 | 匹配方式 | 代码块感知 | 坐标系 | 反向精度 |
|------|----------|-----------|--------|---------|
| v1.13.0 | 百分比公式 | ❌ | scrollTop | 很差 |
| v1.13.1 | 文本键值 | ❌ | charCoords | 很差(偏移) |
| v1.13.2+ | **顺序索引** | ✅ | **getBoundingClientRect + scrollIntoView** | **精确** |

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
- 支持 jQuery 1.8+，使用 `.on()`/`.off()` 命名空间事件兼容 jQuery 3.x
