[TOC]

# 👋 欢迎使用 xfEditor

---

## 🚀 快速入门

xfEditor 是一款功能强大的开源 Markdown 在线编辑器，基于 CodeMirror、jQuery 和 Marked 构建，适用于教育、教学、文档编写和内容排版等场景。

**核心能力一览：**

| 分类 | 特性 |
|------|------|
| ✍️ 编辑体验 | 实时预览、同步滚动、代码折叠、行号显示、括号匹配、搜索替换 |
| 🎨 扩展语法 | KaTeX 公式、ECharts 图表、Tabs 标签页、多列排版、栅格布局 |
| 🛡 安全防护 | XSS 过滤、HTML 标签解析控制、URL 白名单 |
| 📦 开箱即用 | 图片上传、文件上传、视频嵌入、草稿自动保存 |
| 🌍 多语言 | 中/英/日等语言包，可自定义扩展 |

```javascript
// 初始化一个最简编辑器
var editor = xfEditor("my-editor", {
    path    : "../lib/",      // 依赖模块路径
    height  : 640,
    markdown : "# Hello xfEditor\n\n开始你的创作之旅！"
});
```

---

## 📝 Markdown 基础语法

### 标题 (Headings)

# 一级标题 H1
## 二级标题 H2
### 三级标题 H3
#### 四级标题 H4
##### 五级标题 H5
###### 六级标题 H6

> 💡 使用 `Ctrl + 1~6` 快速设置标题级别。

### 文本样式 (Text Styles)

**粗体文本** `**粗体**` 或 `__粗体__`

*斜体文本* `*斜体*` 或 `_斜体_`

***粗斜体*** `***粗斜体***`

~~删除线~~ `~~删除线~~`

`行内代码` `` `行内代码` ``

> 这是一段引用文本。Markdown 是一种轻量级标记语言，允许人们使用易读易写的纯文本格式编写文档。
>
> 引用可以嵌套：
>> 二级引用内容
>>
>> > 三级引用内容

### 超链接 (Links)

- [普通链接](https://github.com/zhaoxianfang/xfeditor)
- [带标题的链接](https://github.com/zhaoxianfang/xfeditor "xfEditor GitHub 仓库")
- 自动链接：<https://github.com>
- 新窗口打开：[GitHub](https://github.com){target=_blank}
- 引用式链接：[xfEditor 官网][1]

[1]: https://github.com/zhaoxianfang/xfeditor

### 列表 (Lists)

#### 无序列表

- 项目一
- 项目二
  - 嵌套子项 A
  - 嵌套子项 B
    - 更深层级
- 项目三

#### 有序列表

1. 第一步：安装依赖
2. 第二步：配置参数
3. 第三步：初始化编辑器
   1. 创建容器元素
   2. 调用 xfEditor() 方法
   3. 监听事件回调

#### 任务列表 (GFM Task Lists)

- [x] 学习基础语法
- [x] 了解扩展功能
- [ ] 集成到项目
- [ ] 自定义主题
- [ ] 发布上线

---

## 🔀 分隔线与排版

三条或更多 `---` / `***` / `___` 创建水平分隔线：

---

> **分隔线上方** — 内容区块 A

---

> **分隔线下方** — 内容区块 B

---

## 📊 表格 (Tables)

| 功能 | 版本 | 状态 |
|------|------|------|
| 实时预览 | v1.0 | ✅ 已发布 |
| 图片上传 | v1.0 | ✅ 已发布 |
| ECharts 图表 | v1.7.0 | ✅ 已发布 |
| Tabs 标签页 | v1.7.0 | ✅ 已发布 |
| 多列排版 | v1.7.0 | ✅ 已发布 |
| 栅格化布局 | v1.17.0 | ✅ 已发布 |

> 💡 点击预览区表格单元格，可弹出工具栏进行插入/删除行列操作。

### 内容对齐

| 左对齐（默认） | 居中对齐 | 右对齐 |
|:---|:---:|---:|
| 单元格 A1 | 单元格 B1 | 单元格 C1 |
| 长内容示例文本 | 短文本 | 数字 12345 |

---

## 💻 代码高亮 (Code Highlight)

### JavaScript

```javascript
// 斐波那契数列生成器（ES6 Generator）
function* fibonacci(n) {
    let [a, b] = [0, 1];
    for (let i = 0; i < n; i++) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const seq = [...fibonacci(10)];
console.log(seq); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### Python

```python
# 快速排序实现
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

### Go

```go
package main

import "fmt"

// 二分搜索
func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11}
    fmt.Println(binarySearch(arr, 7))  // 3
    fmt.Println(binarySearch(arr, 6))  // -1
}
```

### Bash

```bash
#!/bin/bash
# 统计项目代码行数

echo "=== 代码统计 ==="
echo "JavaScript: $(find . -name '*.js' -not -path './node_modules/*' | xargs wc -l | tail -1 | awk '{print $1}') 行"
echo "CSS:        $(find . -name '*.css' | xargs wc -l | tail -1 | awk '{print $1}') 行"
echo "Markdown:   $(find . -name '*.md' | xargs wc -l | tail -1 | awk '{print $1}') 行"
```

### JSON 配置

```json
{
    "name": "xfEditor",
    "version": "1.17.9",
    "features": {
        "echarts": true,
        "tabs": true,
        "columns": true,
        "tex": true
    },
    "dependencies": {
        "codemirror": "^5.65",
        "marked": "^4.0",
        "katex": "^0.16"
    }
}
```

### YAML

```yaml
# xfEditor 配置文件
editor:
  name: my-editor
  theme: default
  height: 640

features:
  toc: true
  tex: true
  taskList: true
  imageResize: true

security:
  htmlDecode: "style,script,iframe|on*"
  xssFilter: true
```

---

## 🖼️ 图片 (Images)

### 基础图片

![xfEditor Logo](../images/logo.png)

> xfEditor — 开源在线 Markdown 编辑器

### 指定尺寸

![Logo 64x64](../images/logo.png)<64,64>

![Logo 128x128](../images/logo.png)<128,128>

> 💡 预览区拖拽图片右下角可调整尺寸；按住 **Shift** 保持宽高比。

---

## 📐 科学公式 (KaTeX)

行内公式：$E = mc^{2}$

块级公式（二次方程求根）：

$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$

矩阵：

$$\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}$$

积分：

$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

---

## 🏷️ 特殊字符与键盘

### Emoji

😀 😃 🚀 ✨ 🎉 ❤️ 💙 💚 ✅ ❌ ⚠️ ⭐ 🔥 💡 📌 🏆 📝 🛡 🔧 📂 🎨

### HTML 实体

&copy; &reg; &trade; &mdash; &laquo; &raquo; &plusmn; &times; &ne; &le; &ge;

### 键盘快捷键标注

<kbd>Ctrl</kbd> + <kbd>S</kbd> 保存 · <kbd>Ctrl</kbd> + <kbd>B</kbd> 加粗 · <kbd>Ctrl</kbd> + <kbd>I</kbd> 斜体

---

## 👣 脚注 (Footnotes)

脚注系统分为引用 `[^脚注名]` 和定义 `[^脚注名]: 内容` 两部分。

xfEditor[^1] 是一款优秀的 Markdown 在线编辑器，它有丰富的扩展语法[^2]。

[^1]: xfEditor 的核心依赖包括 **CodeMirror**（编辑器引擎）、**Marked**（Markdown 解析器）、**KaTeX**（数学公式渲染）和 **ECharts**（数据可视化图表）等。

[^2]: 扩展语法包含流程图、时序图、拼音标注、字帖排版、Tabs 标签页、多列布局、悬浮提示（Tooltip）等多种实用功能。

---

## ✨ 使用建议

### 初始化最佳实践

```javascript
var editor = xfEditor("container-id", {
    // 基础配置
    path       : "../lib/",          // 依赖库路径（必填）
    width      : "100%",
    height     : 640,
    
    // 内容配置
    markdown   : "# Hello World",   // 初始内容
    placeholder: "开始写作…",
    toc        : true,               // 启用目录
    
    // 扩展功能（按需开启）
    tex        : true,               // KaTeX 公式
    taskList   : true,               // GFM 任务列表
    htmlDecode : "style,script,iframe|on*", // XSS 过滤
    
    // 事件回调
    onload     : function() { console.log("编辑器加载完成"); },
    onchange   : function() { /* 内容变更 */ }
});
```

### 获取与设置内容

```javascript
// 获取 Markdown 源码
var md = editor.getMarkdown();

// 获取渲染后的 HTML
var html = editor.getHTML();

// 设置新内容
editor.setMarkdown("# 新的开始\n\n重新出发！");
```

---

## ✨ 接下来

更多高级功能（ECharts 图表、Tabs 标签页、多列排版、栅格化布局、悬浮提示 Tooltip、流程图、时序图、拼音标注、字帖等）请参阅 **full.md** 完整示例文档。

---

> Made with ❤️ by xfEditor Contributors | MIT License
