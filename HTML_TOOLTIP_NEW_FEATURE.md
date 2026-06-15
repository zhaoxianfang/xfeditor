# Tooltip 悬浮提示完整语法指南

## 概述

xfEditor v1.12.1 全面重构了悬浮提示（Tooltip）功能，提供统一的语法格式，支持文本、图片、iframe 和 HTML 四种类型，并支持可选的宽度和高度参数。v1.12.1 修复了图片/iframe 尺寸限制问题。

## 语法格式

### 基本语法

```markdown
[触发文本](tooltip:类型:内容)<宽度,高度>
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| 触发文本 | 是 | 鼠标悬停的触发对象，可以是文本或图片路径 |
| 类型 | 是 | 悬浮内容类型：text、image、iframe、html |
| 内容 | 是 | 悬浮显示的内容，根据类型不同而不同 |
| 宽度,高度 | 否 | 悬浮框的固定尺寸（单位：px），超出后自动滚动 |

---

## 一、文本类型 Tooltip

### 语法

```markdown
[触发文本](tooltip:text:文本内容)<宽度,高度>
```

### 示例

#### 1.1 基础用法（自动宽高）

```markdown
[百度](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。)
```

#### 1.2 设置固定宽高

```markdown
[百度简介](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。百度拥有数万名研发工程师，是中国乃至全球都顶尖的技术团队。)<50,20>
```

**效果说明：**
- 宽度设为 50px，高度设为 20px
- 文本超出高度时自动出现垂直滚动条

#### 1.3 图片作为触发对象

```markdown
[../images/baidu.png](tooltip:text:这是通过图片路径触发的文本悬浮提示。)
```

---

## 二、图片类型 Tooltip

### 语法

```markdown
[触发文本](tooltip:image:图片URL)<宽度,高度>
```

### 示例

#### 2.1 基础用法（自动宽高）

```markdown
[查看Logo](tooltip:image:../images/logos/editormd-logo-180x180.png)
```

#### 2.2 设置固定宽高（图片拉伸/缩放）

```markdown
[Logo 50x40](tooltip:image:../images/logos/editormd-logo-180x180.png)<50,40>
[Logo 100x80](tooltip:image:../images/logos/editormd-logo-180x180.png)<100,80>
[Logo 150x120](tooltip:image:../images/logos/editormd-logo-180x180.png)<150,120>
```

**效果说明：**
- 设置固定宽高后，图片会自动拉伸或缩放以填充整个区域
- 无论原图尺寸如何，都会按照设置的尺寸显示

#### 2.3 使用引号包围URL（推荐）

```markdown
[外部图片](tooltip:image:"https://picsum.photos/300/200?random=1")<120,80>
[随机图片](tooltip:image:'https://picsum.photos/200/150?random=2')<100,75>
```

**说明：**
- 图片URL可以使用单引号或双引号包围
- 推荐使用引号，避免特殊字符导致解析错误

---

## 三、iframe 类型 Tooltip

### 语法

```markdown
[触发文本](tooltip:iframe:页面URL)<宽度,高度>
```

### 示例

#### 3.1 基础用法

```markdown
[查看示例页面](tooltip:iframe:./simple.html)
```

#### 3.2 设置固定宽高（超出自动滚动）

```markdown
[小窗口 100x60](tooltip:iframe:./simple.html)<100,60>
[中窗口 200x120](tooltip:iframe:./simple.html)<200,120>
[大窗口 300x180](tooltip:iframe:./simple.html)<300,180>
```

**效果说明：**
- iframe 内容超出设置的宽高时，会自动出现滚动条
- 水平或垂直方向都会根据需要出现滚动条

#### 3.3 使用引号包围URL

```markdown
[外部页面](tooltip:iframe:"https://example.com")<200,150>
```

---

## 四、HTML 类型 Tooltip

### 语法

```markdown
[触发文本](tooltip:html:CSS选择器)<宽度,高度>
```

### 示例

#### 4.1 Class选择器

```markdown
[查看产品卡片](tooltip:html:.test_tooltip1)<150,100>
```

#### 4.2 ID选择器

```markdown
[查看ID元素](tooltip:html:#test_tooltip_id)<160,80>
```

#### 4.3 使用引号包围选择器

```markdown
[带引号的class](tooltip:html:".test_tooltip1")<140,90>
[带引号的ID](tooltip:html:"#test_tooltip_id")<150,85>
```

### HTML元素定义

在页面中定义隐藏的HTML元素：

```html
<div class="test_tooltip1" style="display:none;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 15px; border-radius: 8px; color: #fff; text-align: center;">
        <h4 style="margin: 0 0 8px; font-size: 16px;">🎯 产品特性</h4>
        <p style="margin: 0 0 10px; font-size: 13px;">这是通过CSS选择器引用的HTML内容</p>
        <ul style="text-align: left; font-size: 12px; margin: 0; padding: 0 0 0 18px;">
            <li>实时预览与同步滚动</li>
            <li>30+ 语言代码高亮</li>
            <li>ECharts 图表嵌入</li>
        </ul>
    </div>
</div>

<div id="test_tooltip_id" style="display:none;">
    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; 
                border-left: 4px solid #2196F3;">
        <h4 style="margin: 0 0 8px; color: #1976D2;">📚 ID选择器示例</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">
            这是通过ID选择器 <code>#test_tooltip_id</code> 引用的内容。
        </p>
    </div>
</div>
```

### 特性说明

1. **支持的选择器类型**
   - ID选择器：`#element-id`
   - 类选择器：`.class-name`
   - 属性选择器：`[data-tooltip-content]`
   - 组合选择器：`.card .title`

2. **自动隐藏属性移除**
   - 自动移除 `display: none`
   - 自动移除 `visibility: hidden`
   - 自动移除 `opacity: 0`
   - 自动移除绝对定位隐藏方式

3. **元素克隆机制**
   - 完整克隆目标元素的DOM结构
   - 保持原有的样式和类名
   - 与原始元素完全独立

---

## 五、宽度和高度参数详解

### 参数格式

```markdown
<宽度,高度>
```

### 规则说明

1. **单位固定为像素（px）**
   - 不需要写单位，直接写数字即可
   - 例如：`<100,80>` 表示宽100px，高80px

2. **参数可选**
   - 不写 `<宽度,高度>` 时，tooltip 自动适应内容大小
   - 只写宽度或只写高度无效，必须同时写两个参数

3. **超出自动滚动**
   - 文本类型：超出高度时垂直滚动
   - 图片类型：图片拉伸/缩放填充整个区域
   - iframe类型：水平或垂直方向都会根据需要滚动
   - HTML类型：超出时垂直滚动

### 示例对比

```markdown
<!-- 自动宽高 -->
[自动大小](tooltip:text:这段文本会自动适应大小)

<!-- 固定宽高 -->
[固定50x30](tooltip:text:这段文本固定宽度50px高度30px)<50,30>

<!-- 图片拉伸 -->
[图片100x80](tooltip:image:./logo.png)<100,80>
```

---

## 六、完整示例

### 文本类型完整示例

```markdown
## 文本悬浮提示

### 自动宽高
[百度](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。)

### 固定宽高
[百度简介](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。百度拥有数万名研发工程师，是中国乃至全球都顶尖的技术团队。)<50,20>

### 图片触发
[../images/baidu.png](tooltip:text:这是通过图片路径触发的文本悬浮提示。)
```

### 图片类型完整示例

```markdown
## 图片悬浮提示

### 自动宽高
[查看Logo](tooltip:image:../images/logos/editormd-logo-180x180.png)

### 固定宽高
[Logo 50x40](tooltip:image:../images/logos/editormd-logo-180x180.png)<50,40>
[Logo 100x80](tooltip:image:../images/logos/editormd-logo-180x180.png)<100,80>

### 外部图片
[随机图片](tooltip:image:"https://picsum.photos/300/200?random=1")<120,80>
```

### iframe 类型完整示例

```markdown
## iframe 悬浮提示

### 自动宽高
[查看示例](tooltip:iframe:./simple.html)

### 固定宽高
[小窗口](tooltip:iframe:./simple.html)<100,60>
[中窗口](tooltip:iframe:./simple.html)<200,120>
[大窗口](tooltip:iframe:./simple.html)<300,180>
```

### HTML 类型完整示例

```markdown
## HTML 悬浮提示

### Class选择器
[查看产品卡片](tooltip:html:.test_tooltip1)<150,100>

### ID选择器
[查看ID元素](tooltip:html:#test_tooltip_id)<160,80>

### 带引号
[带引号](tooltip:html:".test_tooltip1")<140,90>
```

---

## 七、最佳实践

### 1. 性能优化

- 避免在 tooltip 中嵌入过大的图片或复杂的HTML结构
- iframe 类型建议设置固定宽高，避免频繁重排
- HTML 类型引用的元素尽量保持简洁

### 2. 样式设计

- 确保文本内容有合适的颜色对比度
- 图片建议使用合适的尺寸，避免过度拉伸
- HTML 元素建议使用内联样式，确保在 tooltip 中正常显示

### 3. 内容组织

- 文本内容建议简短精炼，长文本建议设置固定高度
- 图片URL建议使用引号包围，避免特殊字符问题
- HTML选择器建议使用有意义的ID或类名

---

## 八、兼容性说明

### 浏览器兼容性

- Chrome 50+
- Firefox 45+
- Safari 10+
- Edge 79+
- Internet Explorer 11（部分功能受限）

### 编辑器版本要求

- xfEditor v1.12.1 及以上版本

---

## 九、故障排除

### 常见问题

#### 1. Tooltip 不显示

**检查项：**
- 是否启用了 `tooltip: true` 配置
- 语法格式是否正确
- 内容是否为空
- 图片URL或iframe URL是否正确

#### 2. 样式丢失

**检查项：**
- HTML元素是否包含了必要的内联样式
- CSS选择器是否正确匹配
- 元素是否存在于页面中

#### 3. 宽高参数无效

**检查项：**
- 格式是否为 `<宽度,高度>`
- 是否同时写了宽度和高度
- 数字是否有效

### 调试技巧

```javascript
// 在控制台调试 tooltip
var editor = editormd("editor");
editor.initTooltips(); // 手动初始化 tooltip

// 检查 tooltip 元素
var $tooltips = $('.editormd-tooltip-trigger');
console.log('Tooltip 数量:', $tooltips.length);
```

---

## 十、更新日志

### v1.12.1

- **尺寸限制修复**：图片类型设置宽高后，使用显式 `width`/`height` + `object-fit:contain` 精确控制尺寸，不会拉伸变形
- **popup 约束解除**：Tooltip popup 的 `max-width` 从 `360px` 放宽至 `90vw`，支持更大的悬浮框
- **iframe 尺寸修复**：iframe 类型的 popup 容器同时设置显式宽高和最大宽高限制

### v1.12.0

- **全新语法**：统一为 `[文本](tooltip:类型:内容)<宽度,高度>` 格式
- **四种类型**：支持 text、image、iframe、html 四种类型
- **可选宽高**：支持设置固定的宽度和高度
- **自动滚动**：内容超出时自动出现滚动条
- **引号支持**：URL和选择器支持引号包围
- **向后兼容**：保留对旧版语法的兼容支持

### v1.11.0

- 优化 tooltip 的定位算法
- 修复 tooltip 在滚动时的显示问题
- 改进 tooltip 的动画效果

### v1.10.0

- 引入复杂 HTML 工具提示功能
- 支持 Base64 编码的 HTML 内容
- 添加图片和 iframe 类型工具提示

---

## 相关链接

- [完整示例](examples/tooltip.html)
- [API 文档](README.md#悬浮提示-tooltip-true)
- [使用指南](USAGE_GUIDE.md#7-悬浮提示-tooltip-true)
- [GitHub 仓库](https://github.com/zhaoxianfang/editor)
