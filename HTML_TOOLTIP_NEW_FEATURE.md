# HTML 工具提示新语法：CSS选择器支持

## 概述

在 xfEditor v1.12.0 中，我们重新设计了复杂 HTML 悬浮提示功能，**仅支持通过 CSS 选择器引用页面中 DOM 元素**。这种设计更加直观、易用，避免了复杂的 Base64 编码过程，同时保持了强大的灵活性。

## 语法格式

### 1. 带引号的 CSS 选择器格式

```markdown
[链接文本](tooltip:html:"CSS选择器")
```

示例：
```markdown
[查看隐藏内容](tooltip:html:"#hidden-content")
[查看样式卡片](tooltip:html:".tooltip-card")
[查看属性元素](tooltip:html:"[data-tooltip-content]")
[查看组合选择器](tooltip:html:".card .header")
```

### 2. 无引号的简单选择器格式

```markdown
[链接文本](tooltip:html:.class-name)
[链接文本](tooltip:html:#element-id)
```

示例：
```markdown
[查看隐藏内容](tooltip:html:#hidden-content)
[查看样式卡片](tooltip:html:.tooltip-card)
[查看无引号类](tooltip:html:.test-class)
```

### 3. 支持的选择器类型

| 选择器类型 | 示例 | 说明 |
|------------|------|------|
| ID选择器 | `#element-id` | 通过元素的id属性选择 |
| 类选择器 | `.class-name` | 通过元素的class属性选择 |
| 属性选择器 | `[data-tooltip]` | 通过元素的属性选择 |
| 属性值选择器 | `[data-tooltip="content"]` | 通过属性值精确选择 |
| 组合选择器 | `.card .title` | 通过后代关系选择 |
| 多类选择器 | `.class1.class2` | 同时具有多个类的元素 |

## 核心特性

### 1. 自动隐藏属性移除
当通过 CSS 选择器引用 DOM 元素时，系统会自动移除目标元素的以下隐藏属性：
- `display: none`
- `visibility: hidden`
- `opacity: 0`
- `position: absolute` + `top: -9999px` 等绝对定位隐藏方式

这使得开发者可以在页面中定义隐藏的 HTML 内容，这些内容只在悬浮框中显示，不会干扰页面正常布局。

### 2. 元素克隆机制
系统会克隆目标元素的完整 DOM 结构，包括：
- 所有子元素和文本节点
- 内联样式和类名
- 数据属性（data-*）
- 事件监听器（注意：克隆的元素不会保留原始的事件绑定）

### 3. 安全隔离
引用的 DOM 元素在悬浮框中显示时：
- 保持原有的样式和布局
- 与页面中的原始元素完全独立
- 不会影响原始元素的显示状态
- 支持复杂的 HTML 结构和 CSS 样式

## 使用示例

### 基础示例

在 HTML 页面中定义隐藏内容：

```html
<!-- 通过ID选择器引用 -->
<div id="hidden-content" style="display: none;">
  <h3>隐藏的HTML内容</h3>
  <p>这个元素设置了 display: none，但会在悬浮框中正常显示。</p>
  <ul>
    <li>列表项 1</li>
    <li>列表项 2</li>
    <li>列表项 3</li>
  </ul>
</div>

<!-- 通过类选择器引用 -->
<div class="tooltip-card" style="visibility: hidden; position: absolute; top: -9999px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              padding: 20px; border-radius: 12px; color: #fff; min-width: 240px;">
    <h3 style="margin: 0 0 10px; font-size: 18px;">产品特性</h3>
    <p style="margin: 0 0 12px; font-size: 14px; opacity: 0.9;">主要功能列表</p>
    <ul style="text-align: left; font-size: 13px; margin: 0 0 15px; padding: 0 0 0 20px;">
      <li>实时预览与同步滚动</li>
      <li>30+ 语言代码高亮</li>
      <li>ECharts 图表嵌入</li>
    </ul>
  </div>
</div>
```

在 Markdown 中引用：

```markdown
# HTML 工具提示示例

## 通过 ID 选择器引用
[查看隐藏内容](tooltip:html:"#hidden-content")

## 通过类选择器引用
[查看产品卡片](tooltip:html:".tooltip-card")

## 通过属性选择器引用
[查看数据内容](tooltip:html:"[data-tooltip-content]")
```

### 高级示例：动态内容

```html
<!-- 动态生成的工具提示内容 -->
<div id="user-stats" style="display: none;">
  <div class="stats-card">
    <h4>用户统计</h4>
    <p>在线用户：<span id="online-count">0</span></p>
    <p>今日活跃：<span id="today-active">0</span></p>
    <p>总用户数：<span id="total-users">0</span></p>
  </div>
</div>

<script>
// 动态更新统计数据
function updateStats() {
  document.getElementById('online-count').textContent = Math.floor(Math.random() * 1000);
  document.getElementById('today-active').textContent = Math.floor(Math.random() * 500);
  document.getElementById('total-users').textContent = Math.floor(Math.random() * 10000);
}
setInterval(updateStats, 5000);
</script>
```

在 Markdown 中引用动态内容：

```markdown
[查看实时统计](tooltip:html:"#user-stats")
```

## 与同步滚动的集成

HTML 工具提示功能与同步滚动功能完美集成：

1. **编辑区操作**：当在左侧编辑区修改或滚动时，右侧预览区会同步定位到对应的预览内容，左侧编辑区不会滚动。

2. **预览区操作**：当在右侧预览区滚动、拖拽调整图片尺寸或点击表格单元格进行编辑时，左侧编辑区会同步定位到对应的 Markdown 源码，右侧预览区不会滚动。

3. **防循环机制**：系统采用了先进的防循环触发机制，确保不会出现"左侧触发右侧 → 右侧触发左侧 → 左侧又触发右侧"的循环问题。

## 配置选项

在编辑器初始化时启用工具提示功能：

```javascript
var editor = editormd("editor", {
    tooltip: true,  // 启用工具提示功能
    // 其他配置...
});
```

## 最佳实践

### 1. 性能优化
- 避免引用过于复杂的 DOM 结构
- 尽量减少引用的 DOM 元素大小
- 对于静态内容，使用 Base64 编码方式
- 对于动态内容，使用 CSS 选择器方式

### 2. 样式设计
- 确保工具提示内容有合适的宽度和高度
- 使用响应式设计，适应不同屏幕尺寸
- 避免使用绝对定位的复杂布局
- 确保文本颜色和背景有足够的对比度

### 3. 内容组织
- 将工具提示内容组织在页面底部或隐藏区域
- 使用有意义的 ID 和类名
- 为重要的工具提示内容添加适当的 ARIA 属性
- 确保工具提示内容在无 CSS 的情况下仍然可读

## 兼容性说明

### 浏览器兼容性
- Chrome 50+
- Firefox 45+
- Safari 10+
- Edge 79+
- Internet Explorer 11（部分功能受限）

### 编辑器版本要求
- xfEditor v1.12.0 及以上版本

## 故障排除

### 常见问题

1. **工具提示不显示**
   - 检查是否启用了 `tooltip: true` 配置
   - 确认 CSS 选择器是否正确
   - 检查目标元素是否存在于页面中

2. **样式丢失**
   - 确保引用的元素包含了所有必要的样式
   - 检查 CSS 选择器是否正确匹配
   - 确认样式没有因为克隆操作而丢失

3. **性能问题**
   - 减少引用的 DOM 元素复杂度
   - 避免引用包含大量子元素的容器
   - 考虑使用 Base64 编码替代动态引用

### 调试技巧

```javascript
// 在控制台调试工具提示
var editor = editormd("editor");
editor.initTooltips(); // 手动初始化工具提示

// 检查工具提示元素
var $tooltips = $('.editormd-tooltip-trigger');
console.log('工具提示数量:', $tooltips.length);
```

## 更新日志

### v1.12.0
- 新增 CSS 选择器支持：`tooltip:html:"选择器"`
- 增强 HTML 工具提示的 DOM 元素引用能力
- 自动移除隐藏属性（display, visibility, opacity等）
- 改进工具提示的显示性能和稳定性

### v1.11.0
- 优化工具提示的定位算法
- 修复工具提示在滚动时的显示问题
- 改进工具提示的动画效果

### v1.10.0
- 引入复杂 HTML 工具提示功能
- 支持 Base64 编码的 HTML 内容
- 添加图片和 iframe 类型工具提示

## 相关链接

- [完整示例](examples/tooltip.html)
- [API 文档](README.md#悬浮提示-tooltip-true)
- [使用指南](USAGE_GUIDE.md#7-悬浮提示-tooltip-true)
- [GitHub 仓库](https://github.com/zhaoxianfang/editor)