[TOC]

# 🎯 xfEditor v1.17.9 全部功能完整演示

> Open source online Markdown editor — 更适合教育、教学、网页演示、数据呈现、内容排版的现代化 Markdown 在线编辑器。

---

## 一、📝 Markdown 基础语法

### 1.1 标题 (Headings)

# 一级标题 H1
## 二级标题 H2
### 三级标题 H3
#### 四级标题 H4
##### 五级标题 H5
###### 六级标题 H6

### 1.2 文本样式 (Inline Styles)

**粗体文本** | *斜体文本* | ***粗斜体文本*** | ~~删除线文本~~ | `行内代码`

<u>下划线（HTML 标签）</u> 和 <mark>高亮标记</mark>

### 1.3 超链接 (Links)

- [普通链接](https://github.com/zhaoxianfang/xfeditor)
- [带标题的链接](https://github.com/zhaoxianfang/xfeditor "xfEditor GitHub 仓库")
- 自动链接：<https://github.com>
- 新窗口打开：[GitHub](https://github.com){target=_blank}
- 当前窗口打开：[文档首页](./index.html){target=_self}
- 邮件链接：[发送邮件](mailto:test@example.com)
- 自动邮件识别：test@example.com

### 1.4 引用 (Blockquotes)

> **关于 xfEditor**
>
> xfEditor 是一款开源的、可嵌入的 Markdown 在线编辑器，基于 CodeMirror、jQuery 和 Marked 构建。它提供了丰富的扩展语法，支持标准 Markdown / GFM / CommonMark。

> **嵌套引用**
>> 第二层嵌套引用
>>> 第三层嵌套引用

### 1.5 列表 (Lists)

#### 无序列表

- 项目一
- 项目二
  - 嵌套子项 A
  - 嵌套子项 B
    - 第三层子项
- 项目三

#### 有序列表

1. 第一步：安装依赖（jQuery、CodeMirror）
2. 第二步：配置参数（width、height、path）
3. 第三步：初始化编辑器
   1. 创建容器 HTML 元素
   2. 调用 `xfEditor()` 方法
   3. 获取编辑器实例

#### GFM 任务列表 (Task Lists)

- [x] 已完成任务
- [ ] 未完成任务
- [x] @mentions 提醒功能
- [x] #标签 引用功能
- [ ] 嵌套任务测试
  - [x] 子任务已完成
  - [ ] 子任务进行中

### 1.6 Emoji 与特殊字符

😀 😃 😄 😁 😅 🤣 😉 😊 😇 🙂 🙃 😋 😎 🤩
❤️ 💙 💚 💛 🧡 💜 🖤 🤍 🤎 💯
✅ ❌ ⚠️ 🔴 🟢 🟡 🟠 🔵 ⭐ 🔥 💡 📌
🚀 ✨ 🎉 🎨 🛠️ 📦 🔧 ⚙️ 📊 📈 📉 🏆
← → ↑ ↓ ↔️ ↩️ ↪️ 🔗 📎 ✂️ 📋

HTML 实体：&copy; &reg; &trade; &mdash; &ndash; &hellip; &laquo; &raquo; &deg; &plusmn; &infin;
键盘标记：<kbd>Ctrl</kbd> + <kbd>S</kbd> 保存 | <kbd>F11</kbd> 全屏 | <kbd>Ctrl</kbd> + <kbd>F</kbd> 搜索

---

## 二、📊 表格与表格编辑

### 2.1 基础表格

| 编号 | 功能 | 版本 | 状态 | 说明 |
|:---:|------|------|:----:|------|
| 01 | 实时预览 | v1.0 | ✅ | 所见即所得编辑，支持同步滚动 |
| 02 | 图片上传 | v1.0 | ✅ | 拖拽上传、跨域上传、尺寸编辑 |
| 03 | 流程图 Flowchart | v1.0 | ✅ | 基于 flowchart.js 实时渲染 |
| 04 | 时序图 Sequence | v1.0 | ✅ | js-sequence-diagrams 渲染 |
| 05 | KaTeX 科学公式 | v1.0 | ✅ | 行内与块级 LaTeX 数学公式 |
| 06 | ECharts 图表 | v1.7.0 | ✅ | 支持 6 种图表类型 |
| 07 | Tabs 标签页 | v1.7.0 | ✅ | 标签页组件，支持任意嵌套 |
| 08 | Columns 多列 | v1.7.0 | ✅ | 报纸式多栏排版 |
| 09 | Grid 栅格布局 | v1.17.0 | ✅ | 10栏栅格系统，自动平分 |
| 10 | Tooltip 悬浮提示 | v1.7.0 | ✅ | 5 种提示类型 |

### 2.2 表格对齐方式

| Left-Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| col 3 is | some wordy text | $1,600 |
| col 2 is | centered | $12 |
| zebra stripes | are neat | $1 |

> 💡 **表格编辑**：点击预览区表格单元格，弹出工具栏可插入/删除行或列，Markdown 源码自动同步。

---

## 三、💻 代码高亮 (JetBrains 风格 · 40+ 语言)

### 3.1 JavaScript

```javascript
// 斐波那契数列生成器
function* fibonacci(n) {
    let [a, b] = [0, 1];
    for (let i = 0; i < n; i++) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const seq = [...fibonacci(10)];
console.log(seq); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// async/await 示例
async function fetchUserData(id) {
    try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("获取用户数据失败:", err.message);
        return null;
    }
}
```

### 3.2 TypeScript

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor" | "viewer";
    createdAt: Date;
}

class UserService {
    private users: Map<number, User> = new Map();

    addUser(user: User): void {
        this.users.set(user.id, user);
        console.log(`添加用户: ${user.name}`);
    }

    getUser(id: number): User | undefined {
        return this.users.get(id);
    }

    getAdmins(): User[] {
        return [...this.users.values()].filter(u => u.role === "admin");
    }
}
```

### 3.3 Python

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

### 3.4 Go

```go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup
    urls := []string{"https://golang.org", "https://pkg.go.dev"}

    for _, url := range urls {
        wg.Add(1)
        go func(u string) {
            defer wg.Done()
            fmt.Printf("正在获取 %s...\n", u)
        }(url)
    }

    wg.Wait()
    fmt.Println("全部完成!")
}
```

### 3.5 Java

```java
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println("找到索引: " + search(arr, 7));
    }
}
```

### 3.6 Rust

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("翻倍后: {:?}", doubled);

    // 模式匹配
    for n in &numbers {
        match n % 2 {
            0 => println!("{} 是偶数", n),
            _ => println!("{} 是奇数", n),
        }
    }
}
```

### 3.7 SQL

```sql
-- 用户活跃度分析
SELECT
    DATE(created_at) AS reg_date,
    COUNT(*) AS new_users,
    SUM(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS active_7d
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY reg_date DESC;
```

### 3.8 Shell / Bash

```bash
#!/bin/bash
# 项目部署脚本
set -e

echo "🚀 开始部署 xfEditor..."
npm run build:js
npm run build:css

echo "📦 压缩静态资源..."
gzip -kf xf_editor.min.js xf_editor.min.css

echo "✅ 部署完成!"
```

### 3.9 YAML

```yaml
# xfEditor CI 配置
name: xfEditor Build
on:
  push:
    branches: [master]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
```

### 3.10 JSON

```json
{
    "name": "xfEditor",
    "version": "1.17.9",
    "features": {
        "echarts": true,
        "tabs": true,
        "columns": true,
        "grid": true,
        "tooltip": true,
        "tex": true,
        "flowchart": true,
        "superscript": true,
        "fontSize": true,
        "footnote": true,
        "pageBlock": true,
        "sequenceDiagram": true,
        "copybook": true,
        "pinyin": true,
        "textAlign": true,
        "syncScroll": true
    },
    "dependencies": {
        "codemirror": "^5.65",
        "marked": "^4.0",
        "katex": "^0.16",
        "echarts": "^5.4"
    }
}
```

> xfEditor 内建支持 40+ 编程语言语法高亮：`HTML` `CSS` `SCSS/SASS` `SQL` `PHP` `C/C++` `C#` `Ruby` `Lua` `R` `Perl` `Dart` `YAML` `Erlang` `CoffeeScript` `Nginx` `HTTP` `Shell/Bash` `Markdown` `Diff` `Dockerfile` `TOML` ...

---

## 四、🏷️ 代码块属性扩展

### 4.1 自定义 class 属性

```(.code-demo)
// 语法：```(.className)
// 效果：pre 标签拥有 class="code-demo"
// 用法：通过 CSS .code-demo 自定义此代码块样式
```

### 4.2 自定义 id 属性

```(#demo-block)
// 语法：```(#idName)
// 效果：pre 标签拥有 id="demo-block"
// 用法：document.getElementById("demo-block") 精确定位
```

### 4.3 class + id 组合

```javascript(.my-code#main-block)
// 语法：```javascript(.class#id)
// 效果：pre 有 class="my-code" id="main-block"
//       code 有 class="lang-javascript" 用于语法高亮
class ApiClient {
    constructor(baseUrl) { this.baseUrl = baseUrl; }
    async request(path) {
        return fetch(this.baseUrl + path).then(r => r.json());
    }
}
```

### 4.4 Hidden 隐藏代码块

#### 基础隐藏

```(hidden.hidden-code-secret)
## 🔐 这段内容在页面上完全不可见
console.log("但可通过 tooltip:iframe:pre 悬浮查看！");
alert("hidden 代码块配合 tooltip 实现隐藏预览");
```

- [👁 悬浮查看隐藏内容](tooltip:iframe:pre.hidden-code-secret)<400,200>

#### 隐藏 + 语言高亮 + class/id 组合

```javascript(hidden.important-code#secret-block)
// 🔐 此代码块在页面中完全隐藏
// 用法1：tooltip:iframe:pre.important-code （class 选择器）
// 用法2：tooltip:iframe:pre#secret-block    （id 选择器）
// 用法3：document.getElementById("secret-block").innerText （JS 获取）

function topSecretAlgorithm(data) {
    return data
        .map(x => x * Math.PI)
        .filter(x => x > 10)
        .reduce((a, b) => a + b, 0);
}

console.log(topSecretAlgorithm([1, 2, 3, 5, 8]));
```

- [👁 悬浮查看机密代码（320×220）](tooltip:iframe:pre#secret-block)<320,220>

```python(hidden.extra-info)
# Python 隐藏代码 - 通过 class 选择器引用
def fibonacci(n):
    """生成斐波那契数列"""
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print(fibonacci(15))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]
```

- [👁 查看 Python 隐藏代码（380×240）](tooltip:iframe:pre.extra-info)<380,240>

---

## 五、📊 ECharts 交互式图表

### 5.1 柱状图 (Bar)

```echarts
{
  "type": "bar",
  "title": {"text": "月度销售额"},
  "xAxis": {"data": ["1月", "2月", "3月", "4月", "5月", "6月"]},
  "yAxis": {},
  "series": [
    {"type": "bar", "data": [120, 200, 150, 80, 70, 110], "name": "产品A"},
    {"type": "bar", "data": [90, 140, 180, 120, 100, 130], "name": "产品B"}
  ]
}
```

### 5.2 折线图 (Line)

```echarts
{
  "type": "line",
  "title": {"text": "用户增长趋势"},
  "xAxis": {"type": "category", "data": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]},
  "yAxis": {"type": "value"},
  "series": [
    {"type": "line", "data": [150, 230, 224, 218, 135, 147, 260], "smooth": true, "name": "新增用户"},
    {"type": "line", "data": [820, 932, 901, 934, 1290, 1330, 1320], "smooth": true, "name": "活跃用户"}
  ]
}
```

### 5.3 饼图 (Pie)

```echarts
{
  "type": "pie",
  "title": {"text": "访问来源分布"},
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "data": [
      {"value": 1048, "name": "搜索引擎"},
      {"value": 735, "name": "直接访问"},
      {"value": 580, "name": "邮件营销"},
      {"value": 484, "name": "联盟广告"},
      {"value": 300, "name": "视频广告"}
    ]
  }]
}
```

### 5.4 雷达图 (Radar)

```echarts
{
  "type": "radar",
  "title": {"text": "能力评估模型"},
  "radar": {
    "indicator": [
      {"name": "销售", "max": 100},
      {"name": "管理", "max": 100},
      {"name": "信息技术", "max": 100},
      {"name": "客服", "max": 100},
      {"name": "研发", "max": 100},
      {"name": "市场", "max": 100}
    ]
  },
  "series": [{
    "type": "radar",
    "data": [
      {"value": [85, 90, 70, 80, 95, 75], "name": "预算分配"},
      {"value": [50, 40, 90, 60, 70, 80], "name": "实际开销"}
    ]
  }]
}
```

### 5.5 漏斗图 (Funnel)

```echarts
{
  "type": "funnel",
  "title": {"text": "销售转化漏斗"},
  "series": [{
    "type": "funnel",
    "sort": "descending",
    "data": [
      {"value": 1000, "name": "展现"},
      {"value": 800, "name": "点击"},
      {"value": 600, "name": "访问"},
      {"value": 400, "name": "咨询"},
      {"value": 200, "name": "订单"},
      {"value": 150, "name": "成交"}
    ]
  }]
}
```

### 5.6 树图/脑图 (Tree)

```echarts
{
  "type": "tree",
  "height": 500,
  "title": {"text": "产品技术架构", "subtext": "点击节点圆圈可折叠/展开", "left": "center", "top": 10},
  "tooltip": {"trigger": "item", "triggerOn": "mousemove"},
  "series": [{
    "type": "tree",
    "data": [{
      "name": "🚀 智能中枢",
      "symbolSize": 18,
      "children": [{
        "name": "📊 数据分析",
        "itemStyle": {"color": "#4fc3f7"},
        "children": [
          {"name": "实时看板", "value": 95},
          {"name": "异常检测", "value": 88},
          {"name": "趋势预测", "value": 76}
        ]
      }, {
        "name": "🤖 AI 引擎",
        "itemStyle": {"color": "#81c784"},
        "children": [
          {"name": "NLP", "value": 92},
          {"name": "CV", "value": 85},
          {"name": "大语言模型", "value": 96}
        ]
      }, {
        "name": "⚙️ 基础设施",
        "itemStyle": {"color": "#ffb74d"},
        "children": [
          {"name": "云原生", "value": 90},
          {"name": "边缘计算", "value": 78},
          {"name": "安全合规", "value": 82}
        ]
      }]
    }],
    "layout": "orthogonal",
    "orient": "LR",
    "roam": true,
    "expandAndCollapse": true,
    "initialTreeDepth": 2,
    "top": "5%",
    "left": "3%",
    "bottom": "3%",
    "right": "8%",
    "symbol": "circle",
    "symbolSize": 14,
    "lineStyle": {"width": 2, "curveness": 0.3},
    "label": {"position": "left", "verticalAlign": "middle", "align": "right", "fontSize": 12},
    "leaves": {"label": {"position": "right", "verticalAlign": "middle", "align": "left", "fontSize": 11}},
    "emphasis": {"focus": "descendant"},
    "nodePadding": 25,
    "animationDuration": 800
  }]
}
```

> **ECharts 图表要点**：支持 `bar`/`line`/`pie`/`radar`/`funnel`/`tree` 六种类型。可设 `"theme": "dark"` 切换暗色主题，`"height"` 自定义高度，树图支持折叠/展开和拖拽漫游。

---

## 六、🗂️ Tabs 标签页组件

### 6.1 基础用法

[[tabs]]
[[tab:产品介绍]]
xfEditor 是一款开源的、可嵌入的 Markdown 在线编辑器。

**核心特性：**

- 支持 Standard Markdown / GFM / CommonMark
- 支持实时预览、图片上传、HTML 标签解析
- 支持流程图、时序图、ECharts 交互式图表
- 支持 KaTeX 科学公式、代码语法高亮
- 支持 Tabs 标签页、多列排版、栅格化布局
- 支持悬浮提示、草稿暂存、脚注系统
[[/tab]]

[[tab:更新日志]]
### v1.17.9（最新）

- 🔄 同步滚动引擎全面重写（双向精确同步）
- 🎯 预览→编辑方向完全修复
- 🛡 预览交互防护（防止意外链接/表单提交）
- 🔗 标题锚点智能配对
- 🐛 编辑器内存泄漏修复

### v1.17.0

- 🌳 Tree图/脑图
- 🙈 Hidden 隐藏代码块 + iframe:pre 悬浮预览
- 🎨 TOC 目录全面美化
- 🛡 内存泄漏修复

### v1.7.0

- 新增 ECharts 图表、Tabs 标签页、多列排版
- 新增悬浮提示 Tooltip、草稿暂存、视频嵌入
- 新增字帖系统（田字格/米字格/拼音格）
[[/tab]]

[[tab:快捷键参考]]
| 快捷键 | 功能 |
|--------|------|
| **Ctrl+S** / **Cmd+S** | 保存内容 |
| **F11** | 切换全屏编辑 |
| **F10** | 切换预览模式 |
| **Ctrl+F** / **Cmd+F** | 搜索 |
| **Ctrl+Shift+F** / **Cmd+Option+F** | 替换 |
| **Ctrl+Q** / **Cmd+Q** | 代码折叠 |
| **Ctrl+G** / **Cmd+G** | 跳转行 |
| **Shift+ESC** | 退出全窗口预览 |
| **ESC** | 退出全屏 |
[[/tab]]
[[/tabs]]

### 6.2 标签页内嵌套复杂内容

[[tabs]]
[[tab:代码示例]]
```javascript
// 在 Tab 内编写的代码
class TabDemo {
    constructor(name) { this.name = name; }
    greet() {
        return `Hello from tab "${this.name}"!`;
    }
}

const demo = new TabDemo("Code Demo");
console.log(demo.greet());
```
[[/tab]]

[[tab:表格示例]]
| 功能 | 状态 |
|------|:----:|
| Tabs 标签页 | ✅ |
| ECharts 图表 | ✅ |
| 多列排版 | ✅ |
| Grid 栅格 | ✅ |
| 嵌套支持 | ✅ |
[[/tab]]

[[tab:图表示例]]
```echarts
{
  "type": "bar",
  "title": {"text": "Tab 内图表嵌套"},
  "xAxis": {"data": ["Q1", "Q2", "Q3", "Q4"]},
  "yAxis": {},
  "series": [
    {"type": "bar", "data": [320, 450, 280, 510], "name": "收入"},
    {"type": "bar", "data": [220, 380, 250, 420], "name": "支出"}
  ]
}
```
[[/tab]]

[[tab:任务列表]]
- [x] 代码块嵌套 ✅
- [x] 表格嵌套 ✅
- [x] 图表嵌套 ✅
- [x] 任务列表嵌套 ✅
- [ ] 更多深度嵌套测试中...
[[/tab]]
[[/tabs]]

---

## 七、📰 多列排版 Columns

使用 `[[columns:N]]...[[/columns]]` 创建 N 栏报纸式布局。

[[columns:3]]
### 第一栏
多列排版功能可以像报纸一样将内容分割为多个栏目展示。

- 自动均衡分布
- 支持全 Markdown 语法
- 响应式适配

### 第二栏
使用 `[[columns:3]]` 语法即可开启三栏排版，数字可根据需要调整为 2、3、4 等。

> 每一栏的内容都会独立渲染 Markdown。

### 第三栏
您可以在每一栏中放入不同的产品介绍、功能特性或服务说明。

1. 简洁的语法
2. 强大的兼容性
3. 美观的展示效果
[[/columns]]

---

## 八、📐 栅格化布局 Grid

使用 `[[row]]` / `[[col:N]]` 实现 10 栏栅格系统。

### 8.1 显式列宽

[[row]]
[[col:1]]
**10%**
1 栏
[[/col]]
[[col:2]]
**20%**
2 栏
[[/col]]
[[col:7]]
**70%**
7 栏
> 每列内容独立渲染 Markdown
[[/col]]
[[/row]]

### 8.2 自动平分

[[row]]
[[col]]
**第 1 栏**（50%）
[[/col]]
[[col]]
**第 2 栏**（50%）
[[/col]]
[[/row]]

[[row]]
[[col]]
**第 1 栏**（33.33%）
[[/col]]
[[col]]
**第 2 栏**（33.33%）
[[/col]]
[[col]]
**第 3 栏**（33.33%）
[[/col]]
[[/row]]

### 8.3 混合显式与自动

[[row]]
[[col:3]]
**显式 30%**
[[/col]]
[[col:5]]
**显式 50%**
[[/col]]
[[col]]
**自动 20%**
（剩余空间）
[[/col]]
[[/row]]

### 8.4 栅格内嵌套 Tabs 和图表

[[row]]
[[col:4]]
### 嵌套 Tabs

[[tabs]]
[[tab:标签A]]
栅格列中嵌套的标签页 A 内容。
[[/tab]]
[[tab:标签B]]
- 支持列表
- 支持 **粗体**、*斜体*
[[/tab]]
[[/tabs]]
[[/col]]
[[col:6]]
### 嵌套图表

```echarts
{
  "type": "bar",
  "title": {"text": "栅格中的图表"},
  "xAxis": {"data": ["A", "B", "C"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [120, 200, 150], "name": "系列"}]
}
```
[[/col]]
[[/row]]

### 8.5 完整页面布局

[[row]]
[[col:5]]
### 主内容区
文章主要内容，占 50% 宽度。
[[/col]]
[[col:5]]
### 侧边栏
侧边栏内容，占另外 50% 宽度。

> 可放广告、标签云、推荐阅读等。
[[/col]]
[[/row]]

[[row]]
[[col:3]]
**底部左 (30%)**
鸣谢：开源社区
[[/col]]
[[col:4]]
**底部中 (40%)**
链接：[GitHub](https://github.com)
[[/col]]
[[col:3]]
**底部右 (30%)**
© 2024 xfEditor | MIT
[[/col]]
[[/row]]

---

## 九、💬 悬浮提示 Tooltip

### 9.1 文本悬浮 (tooltip:text)

- [百度简介](tooltip:text:百度（NASDAQ: BIDU）是全球最大的中文搜索引擎，创立于2000年1月1日，总部位于中国北京。)
- [长文本滚动](tooltip:text:这是一段很长的文本内容用于测试固定高度后的自动滚动效果。当文本内容超过设置的高度时，会自动出现垂直滚动条。)<80,40>
- [窄提示](tooltip:text:简短文本提示)<50,20>

### 9.2 图片悬浮 (tooltip:image)

- [查看 Logo](tooltip:image:../images/logo.png)
- [Logo 小图](tooltip:image:../images/logo.png)<50,40>
- [Logo 大图](tooltip:image:../images/logo.png)<100,80>
- [外部图片](tooltip:image:"https://picsum.photos/300/200?random=1")<120,80>

### 9.3 iframe 悬浮 (tooltip:iframe)

- [查看示例页面](tooltip:iframe:./simple.html)
- [小窗口 100×60](tooltip:iframe:./simple.html)<100,60>
- [中窗口 200×120](tooltip:iframe:./simple.html)<200,120>

### 9.4 iframe:pre 代码块悬浮预览

支持通过 id 或 class 选择器引用已定义的代码块进行悬浮预览。

```(#preview-demo)
<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><title>悬浮预览</title></head>
<body>
<h1>Hello from xfEditor!</h1>
<p>这是通过 <strong>tooltip:iframe:pre</strong> 渲染的代码块内容</p>
</body>
</html>
```

- [查看 HTML 预览（420×280）](tooltip:iframe:pre#preview-demo)<420,280>

### 9.5 HTML DOM 悬浮 (tooltip:html)

- [查看产品卡片](tooltip:html:.test_tooltip1)<150,100>
- [查看 ID 元素](tooltip:html:#test_tooltip_id)<160,80>

> **Tooltip 语法总结**：`[文本](tooltip:类型:内容)<宽度,高度>` | 类型: text / image / iframe / html / iframe:pre

<div class="test_tooltip1" style="display:none; visibility:hidden;">
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 15px; border-radius: 10px; color: #fff; text-align: center; min-width: 220px;">
        <h4 style="margin: 0 0 8px; font-size: 16px;">🎯 高级功能</h4>
        <p style="margin: 0 0 10px; font-size: 13px;">CSS选择器工具提示演示</p>
        <ul style="text-align: left; font-size: 12px; margin: 0; padding: 0 0 0 18px;">
            <li>支持 CSS 选择器引用</li>
            <li>自动移除隐藏属性</li>
            <li>动态加载 DOM 内容</li>
        </ul>
    </div>
</div>

<div id="test_tooltip_id" style="display:none;">
    <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
        <h4 style="margin: 0 0 8px; color: #1976D2;">📚 ID选择器示例</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">通过 ID 选择器 <code>#test_tooltip_id</code> 引用。</p>
    </div>
</div>

---

## 十、↔️ 文本对齐

使用工具栏按钮插入 Unicode 对齐标记：

⁑欢迎使用 xfEditor — 开源在线 Markdown 编辑器⁑

⁑⁖开源、简洁、强大，支持实时预览与扩展语法⁖⁑

⠪版本号：v1.17.9 | 许可证：MIT⠪

---

## 十一、🔤 拼音标注

{xfEditor | biān jí qì} 是一款非常优秀的 {Markdown | mā kè dáo nà} 编辑器，支持 {GitHub | jí tè bù} Flavored Markdown。

{xfEditor | biān jí qì} 提供了丰富的扩展语法和强大的自定义能力，让您的文档更加生动、专业且易于阅读。

**教育场景示例：**

{春眠不觉晓 | chūn mián bù jué xiǎo}
{处处闻啼鸟 | chù chù wén tí niǎo}
{夜来风雨声 | yè lái fēng yǔ shēng}
{花落知多少 | huā luò zhī duō shǎo}

---

## 十二、📐 科学公式 TeX / KaTeX

### 行内公式

质能方程：$E = mc^{2}$ | 勾股定理：$a^2 + b^2 = c^2$ | 欧拉公式：$e^{i\pi} + 1 = 0$

### 块级公式

二次方程求根公式：

$$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$$

定积分：

$$\int_{a}^{b} f(x) \, dx = F(b) - F(a)$$

矩阵：

$$\begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}$$

分段函数：

$$f(x) =
\begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}$$

高斯积分：

$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

求和公式：

$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

> 💡 双击预览区公式可快速定位到 Markdown 源码对应位置。

---

## 十三、🔀 流程图 Flowchart

```flow
st=>start: 用户访问
op1=>operation: 输入 Markdown 内容
op2=>operation: 实时预览渲染
cond1=>condition: 是否需要导出？
sub1=>subroutine: 导出为 HTML
sub2=>subroutine: 导出为 PDF
cond2=>condition: 开启自动保存？
op3=>operation: 定时保存草稿
io=>inputoutput: 获取最终内容
ed=>end: 完成

st->op1->op2->cond1
cond1(yes)->sub1->cond2
cond1(no)->sub2->cond2
cond2(yes)->op3->io->ed
cond2(no)->io->ed
```

---

## 十四、⏱️ 时序图 Sequence Diagram

```seq
Title: xfEditor 内容处理流程
用户->编辑器: 输入 Markdown 文本
编辑器->Marked解析器: 解析 Markdown→HTML
Marked解析器-->编辑器: 返回解析结果
编辑器->KaTeX渲染器: 渲染数学公式
编辑器->ECharts渲染器: 渲染交互式图表
编辑器->FlowChart渲染器: 渲染流程图
编辑器->Sequence渲染器: 渲染时序图
编辑器-->用户: 展示实时预览效果
用户->编辑器: 点击保存按钮
编辑器->后端API: POST 同步内容
后端API-->编辑器: 确认保存成功
编辑器-->用户: 显示保存成功提示
```

---

## 十五、🎬 视频嵌入

### 视频标签语法

> 使用编辑器的「添加视频」工具栏按钮，或直接编写以下格式：

[[video]]
https://vjs.zencdn.net/v/oceans.mp4
[[/video]]

### 原生 HTML5 video

<video src="https://vjs.zencdn.net/v/oceans.mp4" controls width="100%" height="320"></video>

---

## 十六、📎 附件链接

[[file]]
document.pdf | 项目技术文档
[[/file]]

[[file]]
report.xlsx | 2024年度数据报表
[[/file]]

[[file]]
presentation.pptx | 产品演示幻灯片
[[/file]]

---

## 十七、🖼️ 图片尺寸编辑

### 固定尺寸

![Logo 180×180](../images/logo.png)<180,180>
![Logo 100×100](../images/logo.png)<100,100>
![Logo 64×64](../images/logo.png)<64,64>

### 可拖拽调整

![可拖拽调整尺寸的图片](../images/logo.png)

> 💡 拖拽右下角调整尺寸 | **Shift** 保持宽高比 | 双击输入精确尺寸

---

## 十八、🎨 HTML 标签解析

<div style="padding: 12px; border: 1px solid #d1d5da; border-radius: 6px; background: #f6f8fa;">
    <strong style="color: #24292e;">🎨 自定义 HTML 区块</strong><br/>
    <span style="color: #586069;">xfEditor 支持解析 HTML 标签，并具有可靠的安全性和几乎无限的扩展性。</span>
</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 15px 0;">
    <h3 style="margin: 0 0 8px; color: white;">💡 渐变色提示框</h3>
    <p style="margin: 0; opacity: 0.9;">这是一个使用 HTML/CSS 自定义样式的彩色区块，展示了 xfEditor 对 HTML 标签的完整支持。</p>
</div>

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 16px; border-radius: 8px; color: white; margin: 15px 0;">
    <h3 style="margin: 0 0 6px; color: white;">⚠️ 警告区块</h3>
    <p style="margin: 0; font-size: 13px; opacity: 0.95;">通过 htmlDecode 配置可精确控制哪些标签被解析，确保 XSS 安全。</p>
</div>

---

## 十九、📄 纸张页面 Page Block

### A4 纸张（含页头页脚）

[[page:A4 header="xfEditor v1.17.9 — 开源 Markdown 在线编辑器" footer="第 {page} 页 / 共 {total} 页"]]
### xfEditor — 开源 Markdown 编辑器

xfEditor 是一款功能强大的开源 Markdown 在线编辑器，基于 CodeMirror、jQuery 和 Marked 构建。

**核心优势：**

- 丰富的扩展语法（KaTeX/ECharts/Tabs/Grid）
- 安全的 XSS 过滤和 HTML 标签控制
- 完善的工具栏和自定义功能
- 教育场景专项优化（字帖、拼音标注）

> 本编辑器适合教育、教学、文档编写和内容排版等场景。
[[/page]]

### AN 纸张（含页头页脚）

[[page:AN header="AN 纸张 — 产品技术方案书" footer="机密 · 第 {page} 页"]]
#### 一、项目背景

本项目旨在为在线教育平台提供一套完整的 Markdown 编辑与渲染解决方案。

#### 二、技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| xfEditor | v1.17.9 | Markdown 编辑渲染引擎 |
| ECharts | v5.4 | 交互式图表 |
| KaTeX | v0.16 | 数学公式渲染 |
| CodeMirror | v5.65 | 代码编辑器 |

#### 三、实施计划

1. 第一阶段：核心功能测试
2. 第二阶段：性能优化与安全加固
3. 第三阶段：生产环境部署
[[/page]]

### A5 纸张

[[page:A5 header="会议纪要" footer="xfEditor 项目组 · {page}/{total}"]]
### 会议纪要

**日期**：2024年12月

**议题**：xfEditor v1.17.9 发布计划

**决议**：全票通过，立即执行
[[/page]]

---

## 二十、📑 分页符

第一页的内容在这一行结束。

[========]

第二页从这行开始，在打印预览中可以看到换页效果。

---

## 二十一、@ 链接

@pandao — 作者主页 | @xfeditor — 项目维护者 | @contributor — 开源贡献者

---

## 二十二、✍️ 字帖 Copybook

字帖系统支持三种格型：**田字格**、**米字格**、**拼音格**。

### 22.1 田字格

[[copybookTian]]
(春眠不觉晓)(处处闻啼鸟)
(夜来风雨声)(花落知多少)
[[/copybookTian]]

### 22.2 米字格

[[copybookMi]]
(床前明月光)(疑是地上霜)
(举头望明月)(低头思故乡)
[[/copybookMi]]

### 22.3 拼音格 — 花括号语法 + 宽度参数

[[copybookPinyin]]
{春眠不觉晓|chūn mián bù jué xiǎo}
{处处闻啼鸟|chù chù wén tí niǎo}
{夜来风雨声|yè lái fēng yǔ shēng}
{花落知多少|huā luò zhī duō shǎo}
[[/copybookPinyin]]

> `(!width:125)` 设置每行拼音格宽度为 125px，组内两端对齐。

### 22.4 拼音格 — 圆括号语法（兼容旧版）

[[copybookPinyin]]
(春眠不觉晓|chūn mián bù jué xiǎo)(处处闻啼鸟|chù chù wén tí niǎo)
(夜来风雨声|yè lái fēng yǔ shēng)(花落知多少|huā luò zhī duō shǎo)
[[/copybookPinyin]]

### 22.5 字帖内嵌入脚注

[[copybookPinyin]]
{春眠不觉[^jue]晓|chūn mián bù jué xiǎo}
{处处闻啼[^niao]鸟|chù chù wén tí niǎo}
[[/copybookPinyin]]

[^jue]: **觉**（jué）：在古诗文中意为"醒来、睡醒"。春眠中醒来，不觉天已大亮。
[^niao]: **鸟**（niǎo）：鸣禽。此处描写处处可闻鸟鸣之热闹景象。

[[copybookTian]]
(春眠不觉[^chun]晓)
(处处闻啼[^chu]鸟)
[[/copybookTian]]

[^chun]: **春**：春季、春天，四季之首。
[^chu]: **处**：读 chù，表示"地方、处处"之意。

### 22.6 混合格型

[[copybookTian]]
(大)(漠)(孤)(烟)(直)
[[/copybookTian]]

[[copybookMi]]
(长)(河)(落)(日)(圆)
[[/copybookMi]]

---

## 二十三、⁂ 上标与下标

### 23.1 上标 `^上标^`

- 数学公式：x^2^ + y^3^ = z^n^ | E = mc^2^
- 面积单位：100m^2^ 建筑面积
- 指数运算：2^10^ = 1024, a^b+c^ = d
- 版权标注：Copyright © 2024^All Rights Reserved^
- 温度标注：25°C^常温^

### 23.2 下标 `^^下标^^`

- 化学式：H^^2^^O（水） | CO^^2^^（二氧化碳） | H^^2^^SO^^4^^（硫酸）
- 数学序列：a^^0^^ + a^^1^^x + a^^2^^x^2^ + a^^3^^x^3^
- 对数：log^^10^^(100) = 2 | log^^2^^(1024) = 10
- DNA 序列：5'^^端^^-ATGCCG-3'^^端^^
- 脚注样式：第^^1^^页 | 项目^^A^^

### 23.3 组合上下标 `<<下标>^<上标>>`

- 同位素：U<<92>^<235>>（铀-235） | C<<6>^<14>>（碳-14）
- 矩阵元素：A<<i>^<j>>（第 i 行第 j 列）
- 排列组合：C<<5>^<3>>（5 选 3 组合数）
- 求和范围：S<<k=1>^<n>> a^^k^^
- 编码声明：UTF<<8>^<BOM>>

### 23.4 混合使用完整示例

- 化学方程式：C^^6^^H^^12^^O^^6^^ + 6O^^2^^ → 6CO^^2^^ + 6H^^2^^O
- 数列求和：S^^n^^ = a^^1^^ + a^^2^^ + a^^3^^ + ... + a^^n^^
- 数学恒等式：(a + b)^2^ = a^2^ + 2ab + b^2^
- 极限表示：e^x^ = 1 + x + x^2^/2! + x^3^/3! + ...

---

## 二十四、🔤 字体大小

使用 `!字号 文本!` 语法指定字号（范围 8-200px）：

- !10 这是 10px 的超小文字，适合注释和免责声明!
- !12 这是 12px 的小字，适合辅助信息!
- !14 这是 14px 的正常小字!
- !16 这是 16px 的标准正文!
- !20 这是 20px 的较大文字!
- !24 这是 24px 的小标题!
- !32 这是 32px 的大标题文字!
- !48 这是 48px 的超大标题!
- !64 这是 64px 的海报标题!

**实用场景：**

- 合同条款：!10 本协议最终解释权归甲方所有，如有争议协商解决。!
- 强调声明：!20 **重要提示**：请仔细阅读以下内容，确认无误后签字。!
- 促销广告：!36 🔥 限时特惠! !28 全场五折起，错过再等一年!
- 标题装饰：!28 📢 系统通知! !16 服务器将于今晚 22:00 进行维护升级。!

---

## 二十五、👣 脚注功能

### 25.1 基础脚注

这里有一个脚注引用[^example1]，点击跳转到文末查看详情。这是另一个脚注[^example2]。

[^example1]: 这是第一个脚注的详细内容 — 点击左侧 "↩" 可跳回引用位置。
[^example2]: 脚注定义可以写在文档的任何位置，所有脚注最终统一显示在文档末尾。

### 25.2 内联格式脚注

xfEditor[^editor-footnote] 是一款强大的开源 Markdown 在线编辑器，支持多种扩展语法。

[^editor-footnote]: xfEditor 核心依赖：**CodeMirror**（编辑器内核）、**Marked**（Markdown 解析器）、**KaTeX**（数学公式渲染）、**ECharts**（图表渲染）、**jQuery**（DOM 操作）。采用 `MIT` 许可证，欢迎参与贡献。

### 25.3 标题中使用脚注

#### 关于本编辑器[^about]

现代 Markdown 编辑器应具备丰富的扩展能力和良好的用户体验。

[^about]: 本文档演示了 xfEditor v1.17.9 的全部功能。更多文档请参阅 `USAGE_GUIDE.md` 和 `README.md`。

### 25.4 多脚注连续引用

xfEditor 项目特色[^feature1]包括实时预览、丰富的扩展语法[^feature2]、强大的图表渲染[^feature3]和完善的脚注系统[^feature4]。

[^feature1]: 实时编辑、实时渲染，所见即所得的用户体验。
[^feature2]: 支持 KaTeX 公式、ECharts 图表、流程图、时序图等 27+ 种扩展语法。
[^feature3]: ECharts 六种图表类型 + FlowChart + SequenceDiagram + 全嵌套支持。
[^feature4]: 本脚注系统支持引用跳转、内容自动汇总、返回定位和高亮动画。

---

## 二十六、📋 综合嵌套演示

以下演示所有核心扩展语法的**相互嵌套**能力：

[[tabs]]
[[tab:栅格→Tabs→Table→Chart]]
[[row]]
[[col:6]]
### Tabs 内嵌 Grid

[[tabs]]
[[tab:表格]]
| 嵌套层级 | 组件 |
|:---:|------|
| L1 | [[tabs]] |
| L2 | [[row]][[col]] |
| L3 | [[tabs]]（再次） |
| L4 | 表格/图表/列表 |
[[/tab]]
[[tab:列表]]
- ✅ 支持任意深度嵌套
- ✅ 每个层级独立渲染
- ✅ 自动处理边界条件
- ✅ 多层嵌套性能稳定
[[/tab]]
[[/tabs]]
[[/col]]
[[col:4]]
### ECharts 嵌套

```echarts
{
  "type": "pie",
  "title": {"text": "嵌套饼图"},
  "series": [{
    "type": "pie",
    "data": [
      {"value": 40, "name": "类型A"},
      {"value": 35, "name": "类型B"},
      {"value": 25, "name": "类型C"}
    ]
  }]
}
```
[[/col]]
[[/row]]
[[/tab]]

[[tab:Columns + 多内容]]
[[columns:2]]
### 左栏
**包含内容：**
- 文本段落
- 代码块
- 表格

```javascript
const nested = true;
console.log("多层嵌套演示");
```

### 右栏
**包含内容：**
- 引用块
- ECharts 图表

> 复杂嵌套完全支持，xfEditor 能正确处理所有组合场景。

```echarts
{
  "type": "bar",
  "title": {"text": "Columns 内图表"},
  "xAxis": {"data": ["A", "B", "C"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [30, 50, 40], "name": "数据"}]
}
```
[[/columns]]
[[/tab]]

[[tab:综合场景]]
### 教育文档示例

[[row]]
[[col:5]]
#### 📖 课文内容
{静夜思 | jìng yè sī}

床前明月光[^about-li],
疑是地上霜。
举头望明月，
低头思故乡。

[^about-li]: **李白**（701—762），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。
[[/col]]
[[col:5]]
#### 📊 知识点分析

```echarts
{
  "type": "bar",
  "title": {"text": "古诗知识体系"},
  "xAxis": {"data": ["字词", "修辞", "意境", "背景", "韵律"]},
  "yAxis": {},
  "series": [{"type": "bar", "data": [85, 90, 95, 70, 80], "name": "掌握度"}]
}
```
[[/col]]
[[/row]]
[[/tab]]
[[/tabs]]

---

## 二十七、🏁 结语

xfEditor 持续迭代，致力于为开发者和内容创作者提供最优秀的 Markdown 编辑体验。

### 功能总览

| 类别 | 包含功能 |
|------|----------|
| 🏗 基础 | 标题、文本样式、链接、列表、引用、代码、图片、表格、分隔线 |
| 📊 图表 | ECharts 柱状图、折线图、饼图、雷达图、漏斗图、树图/脑图 |
| 🗂 布局 | Tabs 标签页、Columns 多列排版、Grid 栅格化布局、PageBlock 纸张页面 |
| 💬 交互 | Tooltip 悬浮提示（5 种类型）、表格编辑、图片缩放 |
| ✏️ 编辑 | 代码折叠、搜索替换、同步滚动、代码块属性扩展 |
| 📐 公式 | KaTeX 行内/块级数学公式、Flowchart 流程图、Sequence 时序图 |
| 🔤 排版 | 拼音标注、文本对齐（行内/块级）、上标/下标、组合上下标、字体大小（8-200px） |
| 👣 脚注 | 引用跳转、自动汇总、多脚注、内联格式、标题脚注、高亮动画 |
| 📦 媒体 | 图片上传/跨域、文件上传、视频嵌入/上传、附件链接 |
| ✍️ 教育 | 田字格、米字格、拼音格字帖（宽度控制、脚注嵌入、混合格型） |
| 🛡 安全 | XSS 过滤、HTML 标签白名单控制、Hidden 隐藏代码块、URL 安全 |
| 🎨 样式 | 代码块 class/id 属性扩展、40+ 语言高亮、主题切换（default/dark） |
| 🌍 国际化 | 中文/English/繁體中文 语言包，支持自定义注册 |
| 🔌 扩展 | 插件系统、自定义工具栏、自定义快捷键、动态配置 |

### 技术栈

| 依赖 | 版本 | 用途 |
|------|------|------|
| CodeMirror | ^5.65 | 编辑器内核 |
| marked.js | ^4.0 | Markdown 解析 |
| KaTeX | ^0.16 | 数学公式渲染 |
| ECharts | ^5.4 | 交互式图表 |
| jQuery | ^1.8+ | DOM 操作 |
| FlowChart.js | ^1.x | 流程图 |
| js-sequence-diagrams | ^2.x | 时序图 |
| highlight.js | ^11.x | 代码语法高亮 |

> Made with ❤️ by Contributors | [MIT License](https://github.com/zhaoxianfang/xfeditor/blob/master/LICENSE)
