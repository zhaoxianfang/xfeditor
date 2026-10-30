[TOC]

# 🎯 xfEditor v2.0.0 全部功能完整演示

> Open source online Markdown editor — 更适合教育、教学、网页演示、数据呈现、内容排版的现代化 Markdown 在线编辑器。

> **📌 文档使用说明**
> 本文档是 xfEditor 全部扩展语法的完整演示与**参考手册**。除示例外，各章节还提供「语法格式 / 使用说明 / 注意事项 / 语法边界 / 支持格式」等文字说明，请重点阅读以 `<u>` 下划线高亮的小结（如 `📌 语法说明`、`⚠️ 注意事项`）。
>
> **📌 Mermaid 兼容性（重要）**
> xfEditor 的流程图 / 时序图分别采用 **flowchart.js** 与 **js-sequence-diagrams** 的**专用语法**，与 Mermaid 完全不同：
> - **不支持** Mermaid 的 `graph TD / graph LR`、`A-->B`、`A[文本]`、`A{文本}`、`A((文本))`、`A -.-> B` 等任何 Mermaid 流程图语法；
> - **不支持** Mermaid 的 `sequenceDiagram`、`participant A as Alice`、`A->>B: hello`、`loop...end`、`alt...else...end`、`activate/deactivate`、`autonumber` 等任何 Mermaid 时序图语法；
> - 若代码块标注为 `flow` / `seq` 而内容使用了 Mermaid 语法，将无法渲染，请改用本文第十三、十四章的专用语法。
>
> 除特别说明外，所有示例均可直接复制到编辑器中预览。

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
> xfEditor 是一款开源的、可嵌入的 Markdown 在线编辑器，基于 CodeMirror、Marked 构建，内置零依赖 micro-DOM（XfDom），**完全不需要 jQuery / Zepto**。它提供了丰富的扩展语法，支持标准 Markdown / GFM / CommonMark。

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

1. 第一步：安装依赖（CodeMirror、marked.js）
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

> **📌 基础语法说明与边界**
> - **标题**：`#` 1~6 级；`#` 后需有空格；`=`（H1）/`-`（H2）下划线式标题也支持；
> - **文本样式**：`**粗**`、`*斜*`、`***粗斜***`、`~~删除~~`、`` `行内代码` ``；支持嵌套（如 `**粗体 *斜体* 混合**`）；`<u>`/`<mark>`/`<kbd>` 等内联 HTML 同样生效；
> - **链接**：支持标题（`[text](url "title")`）、自动链接 `<https://...>`、`{target=_blank}` 新窗口、`mailto:`；邮箱自动识别（`a@b.com`）与 `@用户名`（见二十一章）互不冲突；
> - **引用**：`>` 可嵌套（`>>`/`>>>`）；引用内支持列表/代码块/公式等块级元素；
> - **列表**：无序 `-/*/+`、有序 `1.` 可嵌套（4 空格缩进）；任务列表 `- [x]`/`- [ ]` 支持嵌套子任务；
> - **边界**：Markdown 标记与内容之间需符合规范（如 `**` 前后不能有空格）；HTML 标签与 Markdown 混用时，块级 HTML 标签后的 Markdown 会按规范降级解析（GFM 行为）。

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
| 09 | Grid 栅格布局 | v2.0.0 | ✅ | 10栏栅格系统，自动平分 |
| 10 | Tooltip 悬浮提示 | v1.7.0 | ✅ | 5 种提示类型 |

### 2.2 表格对齐方式

| Left-Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| col 3 is | some wordy text | $1,600 |
| col 2 is | centered | $12 |
| zebra stripes | are neat | $1 |

> 💡 **表格编辑**：点击预览区表格单元格，弹出工具栏可插入/删除行或列，Markdown 源码自动同步。

> **📌 表格语法说明与边界**
> - **分隔行必需**：表头与数据之间必须有分隔行，且每列至少 `3` 个 `-`（如 `|---|`）；缺少分隔行会被当作普通文本行。
> - **对齐方式**：分隔行中 `:---` 左对齐、`:---:` 居中、`---:` 右对齐、`---` 默认（左对齐）。
> - **字面竖线**：单元格内容中不能直接出现 `|`；需要字面竖线时用 `\|` 转义（如 `a\|b`）。
> - **行内语法**：单元格内支持加粗、斜体、行内代码、链接、Emoji 等行内 Markdown；**不支持**块级元素（代码块、列表、引用、多段文本）。
> - **省略边界**：行首 / 行尾的 `|` 可以省略；单元格内容前后的空白会被自动修剪。
> - **空单元格**：直接留空或使用单个空格 `| |` 均可。
> - **列数不齐**：某行列数少于表头时，缺失单元格自动补空；多于表头时，多余列自动合并进最后一列（GFM 规范行为）。

---

## 三、💻 代码高亮 (JetBrains 风格 · 40+ 语言)

> **📌 代码高亮语法说明**
> - **声明**：``` ```语言 ``` 起、``` ``` ``` 止；语言标识不区分大小写，也支持别名（如 `js`/`javascript`、`py`/`python`、`ts`/`typescript`、`sh`/`bash`/`shell`）；
> - **支持 40+ 语言**：JavaScript/TypeScript/Python/Java/C/C++/C#/Go/Rust/PHP/Ruby/Swift/Kotlin/SQL/HTML/XML/CSS/SCSS/LESS/JSON/YAML/TOML/Markdown/Shell/Bash/Dockerfile/nginx/ini/conf/diff/latex/Objective-C/Perl/Lua/R/Powershell/Vue/JSX/TSX 等；
> - **未识别语言**：语言名不在列表时按纯文本显示（无高亮，但不报错）；语言名可省略（``` ``` ``` 纯文本块）；
> - **行号**：默认不显示行号；点击代码块右上角「行号」按钮可切换；
> - **复制**：鼠标悬停代码块右上角出现「复制」按钮，一键复制全部内容（含高亮 HTML）；
> - **其它能力**：折叠超长代码（可选）、代码块属性扩展（见第四章）、`flow/seq/echarts/tex` 等语言名被图表渲染器接管（见后文对应章节）。

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

> **📌 代码块属性扩展语法说明**
> - **声明位置**：语言标识后的圆括号内，格式 `` ```语言(属性) ``；
> - **支持三类属性，可组合**：
>   - `.class名` —— 多个 class 用 `.` 连写（如 `(.a.b)`）；
>   - `#id名` —— 每块最多一个 id；
>   - `hidden` —— 隐藏代码块，渲染后 `<pre>` 不显示（可配合 `tooltip:iframe:pre.选择器` 悬浮预览或 JS 读取）；
> - **组合示例**：`` ```javascript(hidden.important-code#secret-block) ``（隐藏 + class + id 同时生效）；
> - **作用对象**：`class`/`id` 挂载在 `<pre>` 标签上；语言高亮由 `<code class="lang-xxx">` 承担（独立于属性扩展）；
> - **边界**：属性圆括号内不能包含空格；`hidden` 必须与其它属性用 `.` 分隔；语言名省略时（`` ```(.code-demo) ``）仍可带属性。

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

> **📌 ECharts 语法说明与边界**
> - **声明格式**：代码块标注语言为 `echarts`（或 `chart`），内部为**标准 JSON 对象**（ECharts `option` 配置），渲染时传入 `echarts.init(...).setOption(option)`。
> - **JSON 必须合法**：不允许注释、尾逗号、单引号；字符串必须双引号包裹；键名同样需双引号。JSON 解析失败时该代码块仅显示源码、不渲染图表（无报错弹窗）。
> - **顶层可选键**：`theme`（`"dark"` 暗色主题 / `"light"` 亮色）、`height`（如 `"320px"`、`400`，默认 `320px`）、`width`（默认自适应容器宽度）；其余键均为 ECharts 原生 option。
> - **类型选择**：通过 option 的 `series[].type` 指定 `bar` / `line` / `pie` / `radar` / `funnel` / `tree`；同图可混合多系列（如柱状 + 折线双轴）。
> - **响应式**：图表宽度自适应容器，窗口尺寸变化自动 resize；页面处于隐藏标签页时暂停渲染（节省性能）。
> - **导出能力**：图表右上角工具栏支持缩放/保存图片/查看数据（可点击图表配置 `toolbox` 控制）。

---

## 六、🗂️ Tabs 标签页组件

> **📌 Tabs 语法说明与边界**
> - **声明结构**：`[[tabs]]` 开始 → 每页 `[[tab:页标题]]` … `[[/tab]]` → `[[/tabs]]` 结束；
> - **页标题**：`[[tab:标题]]` 中 `:` 后的任意文本作为标签标题（支持中文、Emoji、空格）；
> - **嵌套能力**：每个 `[[tab]]` 内可放置任意 Markdown（标题、列表、表格、图表、代码块，甚至再嵌套 Tabs / Columns / Grid），但标签之间**不能交叉**（必须先 `[[/tab]]` 再开新页）；
> - **边界**：`[[tabs]]` 与 `[[/tabs]]` 必须成对出现且层级正确；页数 ≥1；单页未闭合时后续内容全部归入该页；
> - **默认页**：第一页默认激活；点击标题切换，内容区域独立滚动；
> - **性能**：所有页内容一次渲染完成（非懒加载），超大内容建议拆分。

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
### v2.0.0（最新）

- 🔄 同步滚动引擎全面重写（双向精确同步）
- 🎯 预览→编辑方向完全修复
- 🛡 预览交互防护（防止意外链接/表单提交）
- 🔗 标题锚点智能配对
- 🐛 编辑器内存泄漏修复
- 🌳 Tree图/脑图
- 🙈 Hidden 隐藏代码块 + iframe:pre 悬浮预览
- 🎨 TOC 目录全面美化
- 📤 导出下拉菜单（PDF / Word / Markdown / HTML）
- 📝 导出文件名自动推导（标题 → 正文首个 H1/H2）
- 🔒 XSS 过滤与宿主 CSS 干扰防护层增强

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

> **📌 Columns 语法说明与边界**
> - **声明**：`[[columns:N]]`（N 为栏数）开始，`[[/columns]]` 结束；
> - **分栏方式**：基于 CSS3 `columns` 多列布局，块内全部内容按 N 栏**自动流式均衡分布**（报纸式——文字从第一栏顶部流到第二栏），**无需也不支持**显式分栏标记；
> - 块内支持完整 Markdown（标题/列表/表格/图表/代码块/Tabs 均可）；
> - **边界**：N 建议 2~4（过多栏导致列宽过窄）；`[[columns:N]]` 与 `[[/columns]]` 必须成对，未闭合时后续内容全部进入多栏模式；
> - **响应式**：窄屏（<768px）自动切换为单列堆叠；栏间有分隔线与间距，不可自定义。

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

> **📌 Grid 语法说明与边界**
> - **结构**：`[[row]]` 定义一行（flex 容器），行内若干 `[[col]]...[[/col]]` 列；
> - **显式列宽**：`[[col:N]]` 中 N 为该列占 **10 栏制**的份数（1~10，如 `[[col:7]]` 占 70%）；同一行内各列 N 之和 **≤10**，不足 10 时右侧留白，**>10 时自动换行**；
> - **自动平分**：`[[col]]`（不带 N）时，同行内所有无 N 列均分剩余宽度（如 2 个 `[[col]]` 各 50%，3 个各 33.3%）；
> - **混合模式**：`[[col:2]]` 与 `[[col]]` 可混用，无 N 列按剩余宽度均分；
> - 每列内容独立渲染完整 Markdown（可嵌套 Tabs / 图表 / 列表等），列间有分隔线；
> - **边界**：`[[row]]`/`[[/row]]`、`[[col]]`/`[[/col]]` 必须正确配对；N 不能为 0 或超过 10；
> - **响应式**：窄屏（<768px）列自动堆叠为单列，分隔线消失。

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

> **📌 Tooltip 详细说明与边界**
> - **通用格式**：`[链接文本](tooltip:类型:引用)<宽,高>`；`<宽,高>` 可省略（使用默认尺寸），`<` 与 `>` 必须成对且紧贴链接末尾；
> - **text**：`tooltip:text:提示文字`，纯文本提示（文字含空格用引号包裹 `"..."`）；
> - **image**：`tooltip:image:图片路径`，路径可为相对路径、绝对路径或 `"http(s)://..."` 外链（外链加引号）；尺寸 `<w,h>` 控制图片显示大小；
> - **iframe**：`tooltip:iframe:页面路径`，将指定 HTML 页面嵌入悬浮窗；相对路径相对当前页面解析；外链受限（跨域页面可能被浏览器拦截）；
> - **iframe:pre**：`tooltip:iframe:pre.类名` 或 `tooltip:iframe:pre#id`，引用页面内已定义的**代码块**（通过 class/id 选择器）进行悬浮预览——被引用代码块建议加 `hidden` 属性隐藏本体；
> - **html**：`tooltip:html:.类名` / `tooltip:html:#id`，引用页面内任意隐藏 DOM 元素（`display:none` 元素会被自动临时显示）作为提示内容；
> - **边界**：类型名（text/image/iframe/html）小写且不可拼错；内容含 `)` 时需注意括号配对；同一页面多个 tooltip 互不干扰；
> - **交互**：鼠标悬停显示、移出隐藏；触屏设备点击链接显示/再点隐藏。

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

⠪版本号：v2.0.0 | 许可证：MIT⠪

> **📌 文本对齐语法说明**
> - **三组 Unicode 标记**（可用「工具栏 → 文本对齐」插入）：`⁑...⁑` 居中、`⁑⁖...⁖⁑` 两端对齐、`⠪...⠪` 右对齐；
> - 标记必须**成对**包裹文本：`⁑文本⁑`、`⁑⁖文本⁖⁑`、`⠪文本⠪`；
> - 支持块级与行内（整段或段落内部分文本均可对齐）；可跨多行；
> - **边界**：标记包裹的文本内不能再次出现同名标记（不可嵌套）；未配对（缺少闭合标记）时按普通文本输出；
> - 这些标记是 Unicode 特殊字符，复制到纯文本编辑器会保留原样。

---

## 十一、🔤 拼音标注

> **📌 拼音标注语法说明**
> - **格式**：`{文字 | 拼音}`，花括号内 `|` 前为正文、`|` 后为注音（支持带声调/数字调/轻声写法），渲染为文字上方小字拼音；
> - **边界**：`|` 前后各有一个空格（`{文字 | 拼音}`）；花括号不能嵌套；正文或拼音含 `}` 时需拆分使用；
> - 注音仅做展示，不影响正文复制（复制时只复制正文文字）；
> - 适用于中文教育、多音字注音、外语发音标注等场景。

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

> **📌 TeX / KaTeX 语法说明与边界**
> - **两种声明方式**：行内公式用 `$...$`（如 `$E=mc^2$`），块级公式用 `$$...$$`（独占段落，居中显示）。
> - **渲染引擎**：基于 KaTeX（`\mathrm`/`\text`/`\begin{cases}` 等标准 LaTeX 命令均可用），渲染失败时保持源码原样展示，不影响其它内容。
> - **行内公式边界**：`$` 与内容之间**不能有空格**（`$ x $` 不会被解析为公式）；同一行内多个 `$...$` 分别独立解析。
> - **块级公式**：`$$` 必须独占一行（前后各留一个空行更稳妥），内部可换行（如 `\begin{aligned}...\end{aligned}`）；`$$` 与内容之间换行/空格均可。
> - **转义**：需要字面 `$` 时用 `\$`（如在普通文本中写价格 `\$100`）；行内连续 `$$` 需用 `\$` 分隔避免误解析。
> - **支持的常见宏**：上下标 `^`/`_`、分式 `\frac`、根号 `\sqrt`、求和 `\sum`、积分 `\int`、矩阵 `\begin{matrix}`、分段 `\begin{cases}`、对齐 `\begin{aligned}`、箭头 `\to`/`\rightarrow`、希腊字母 `\alpha` 等；
> - **不支持的能力**：KaTeX 不支持的宏（如 `\overbrace` 部分版本、复杂 `\xrightarrow` 文本）会保持未渲染状态；不支持 `tikz`、化学式 `\ce{}`（需 mhchem 插件，默认未启用）等扩展包。
> - **性能提示**：超大块级公式（含大量矩阵）渲染较慢，建议拆分为多个较小的 `$$...$$`。

---

## 十三、🔀 流程图 Flowchart

> **📌 语法格式（flowchart.js 专用语法）**
> 代码块标注语言为 `flow`（或 `flowchart`）。由**节点定义**与**连线**两部分组成：
>
> **① 节点定义**：`id=>类型: 文本`
> | 类型 | 说明 | 图形 |
> |---|---|---|
> | `start` | 开始节点 | 圆角矩形 |
> | `end` | 结束节点 | 圆角矩形 |
> | `operation` | 操作步骤 | 矩形 |
> | `subroutine` | 子程序 | 双竖线矩形 |
> | `condition` | 条件判断 | 菱形 |
> | `inputoutput` | 输入/输出 | 平行四边形 |
> | `input` | 输入 | 平行四边形 |
> | `output` | 输出 | 平行四边形 |
> | `parallel` | 并行任务 | 双横线矩形 |
>
> **② 连线**：`a->b`（顺序）、`a(yes)->b` / `a(no)->b`（条件分支，括号内也可用任意文本如 `a(通过)->b`）、`a(right)->b`（方向修饰：`left`/`right`/`top`/`bottom`）、`para(path1, bottom)->a`（parallel 多路径：`path1`/`path2`/`path3`…，方向可选）。
>
> **③ 样式连线**：`a@>b({"stroke":"Red","stroke-width":6,"arrow-end":"classic-wide-long"})`（`@>` 为带样式的连线，花括号内为合法 JSON）。
>
> **④ 链接**：节点文本后追加 `:>https://url` 使整个节点可点击跳转；追加 `[blank]` 在新窗口打开（如 `st=>start: 开始:>https://example.com[blank]`）。
>
> **⑤ 状态高亮**：节点文本后追加 `|状态`，支持 `past`/`current`/`future`/`approved`/`rejected`/`invalid` 六种状态配色（如 `op1=>operation: 已处理|past`）。
>
> **⚠️ 不支持 Mermaid 语法**：`graph TD/LR`、`A-->B`、`A[文本]`、`A{文本}`、`A((文本))`、`A-.->B`、`A -->|标签| B`、`subgraph` 等 Mermaid 流程图语法**均不支持**，不会渲染（仅显示源码）。
>
> **📌 使用说明与边界**
> - 节点 id 建议使用英文/数字/下划线（如 `st`、`op1`、`cond2`），避免中文与空格；
> - 节点文本可含中文、符号与空格，但**不能包含 `=>` 与 `->`**；
> - 同一节点 id 重复定义时后定义覆盖先定义；未定义却被引用的 id 不渲染连线；
> - 菱形判断节点的两个分支建议用 `(yes)`/`(no)` 或任意可辨识文本区分；
> - `parallel` 节点的多路分支必须用 `path1/path2/...` 前缀且每条路径都要有连线，否则该路不显示；
> - `cond(align-next=no)=>condition: 文本` 可让下一个节点从判断节点下方引出（适用于复杂布局）；
> - 样式连线 `@>` 需要节点已通过普通 `->` 连线建立拓扑，否则不显示；
> - 节点文本中的 `:` 后若跟 `http`，将被解析为链接而不再作为文本显示。

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

示例一
```flow
st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.google.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks
in=>input: some in
out=>output: some out

st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1
para(path3, right)->in->out->e
```

示例二
```flow
st=>start: Start|past:>http://www.google.com[blank]
e=>end: End|future:>http://www.google.com
op1=>operation: My Operation|past
op2=>operation: Stuff|current
sub1=>subroutine: My Subroutine|invalid
cond=>condition: Yes
or No?|approved:>http://www.google.com
c2=>condition: Good idea|rejected
io=>inputoutput: catch something...|future

st->op1(right)->cond
cond(yes, right)->c2
cond(no)->sub1(left)->op1
c2(yes)->io->e
c2(no)->op2->e
```

示例三
```flow
st=>start: Improve your
l10n process!
e=>end: Continue to have fun!:>https://youtu.be/YQryHo1iHb8[blank]
op1=>operation: Go to locize.com:>https://locize.com[blank]
sub1=>subroutine: Read the awesomeness
cond(align-next=no)=>condition: Interested to
getting started?
io=>inputoutput: Register:>https://www.locize.app/register[blank]
sub2=>subroutine: Read about improving
your localization workflow
or another source:>https://medium.com/@adrai/8-signs-you-should-improve-your-localization-process-3dc075d53998[blank]
op2=>operation: Login:>https://www.locize.app/login[blank]
cond2=>condition: valid password?
cond3=>condition: reset password?
op3=>operation: send email
sub3=>subroutine: Create a demo project
sub4=>subroutine: Start your real project
io2=>inputoutput: Subscribe

st->op1->sub1->cond
cond(yes)->io->op2->cond2
cond2(no)->cond3
cond3(no,bottom)->op2
cond3(yes)->op3
op3(right)->op2
cond2(yes)->sub3
sub3->sub4->io2->e
cond(no)->sub2(right)->op1

st@>op1({"stroke":"Red"})@>sub1({"stroke":"Red"})@>cond({"stroke":"Red"})@>io({"stroke":"Red"})@>op2({"stroke":"Red"})@>cond2({"stroke":"Red"})@>sub3({"stroke":"Red"})@>sub4({"stroke":"Red"})@>io2({"stroke":"Red"})@>e({"stroke":"Red","stroke-width":6,"arrow-end":"classic-wide-long"})
```

---

## 十四、⏱️ 时序图 Sequence Diagram

> **📌 语法格式（js-sequence-diagrams 专用语法）**
> 代码块标注语言为 `seq`（或 `sequence`）。每行一条指令，从上到下按时间顺序执行：
>
> **① 标题**：`Title: 标题文本`（可省略）。
>
> **② 参与者**：`participant A` 定义参与者；`participant A as 名称` 为参与者起显示名（后续用 `A` 引用）。
>
> **③ 消息（信号）**：`发送方->接收方: 消息内容`，箭头符号组合如下：
> | 写法 | 含义 |
> |---|---|
> | `A->B: 消息` | 实线 + 实心箭头 |
> | `A-->B: 消息` | 虚线 + 实心箭头 |
> | `A->>B: 消息` | 实线 + 开放箭头 |
> | `A-->>B: 消息` | 虚线 + 开放箭头 |
> | `A-xB: 消息` | 实线 + 叉号箭头 |
> | `A--xB: 消息` | 虚线 + 叉号箭头 |
>
> **④ 注释（Note）**：`Note left of A: 文本` / `Note right of A: 文本` / `Note over A, B: 文本`（横跨多个参与者时用逗号分隔）。
>
> **⚠️ 不支持 Mermaid 语法**：`sequenceDiagram`、`participant A as Alice` 的 Mermaid 别名写法、`A->>B: hello`（该写法虽形似但 Mermaid 语义不同）、`loop ... end`、`alt ... else ... end`、`opt ... end`、`activate/deactivate`、`destroy`、`autonumber`、`par ... and ... end` 等 Mermaid 时序图特性**均不支持**，不会渲染（仅显示源码）。
>
> **📌 使用说明与边界**
> - 参与者名（`A`、`B`…）建议使用英文/数字/下划线，避免中文与空格；中文名需用 `as` 起别名后引用；
> - 消息内容可含中文、符号与空格，但不能包含 `->`/`-->` 等箭头字符；
> - `Note over A, B` 的参与者之间**不能有空格**（`A, B` 会被当作单个参与者名）；
> - `Title:`、`Note`、`participant` 关键字区分大小写，需按规范书写；
> - 时序图不自动编号消息；不支持循环/分支/激活/销毁等高级语义（见上「不支持」清单）；
> - 渲染基于 `<svg>`，可直接右键复制矢量图。

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

更多语法示例（participant 别名 / Note 注释 / 多种箭头）：

```seq
Title: 参与者别名与注释示例
participant Alice as 爱丽丝
participant Bob as 鲍勃
Alice->Bob: 开始对话
Note right of Bob: 鲍勃正在思考
Bob->>Alice: 好的，收到
Note left of Alice: 爱丽丝在等待回复
Alice-->Bob: 稍等片刻
Note over Alice, Bob: 双方进入协作模式
Bob-xAlice: 发送附件（叉号箭头）
Alice-->>Bob: 文件已收到（虚线开放箭头）
```

> 💡 说明：`participant A as 名称` 定义后，`as` 前的**短名**（`A`/`B`…）用于所有连线与 `Note left of / right of / over` 的引用，`as` 后的中文名仅显示在泳道顶部；连线中不能直接写 `A as 名称->B as 名称`。

---

## 十五、🎬 视频嵌入

> **📌 语法说明与边界**
> - 支持两种方式：编辑器「添加视频」按钮自动插入的 `[[video]]...[[/video]]` 标签，以及原生 `<video>` HTML 标签；
> - `[[video]]` 标签内**只允许一个 URL 或相对路径**，换行后直接写 `[[/video]]` 闭合；支持 `.mp4/.webm/.ogg/.ogv` 等浏览器可直接播放的格式；
> - 可选参数：URL 后追加 `|宽度x高度`（如 `xxx.mp4|640x360`）或追加 `|autoplay`（自动播放）、`|loop`（循环）可组合使用（如 `xxx.mp4|640x360|autoplay|loop`）；
> - 原生 `<video src="..." controls></video>` 属性（`controls`/`autoplay`/`loop`/`muted`/`poster` 等）由浏览器原生支持；
> - 不支持的格式（如 `.flv`/`.rmvb`）不会转换，仅显示下载链接；
> - ⚠️ 外网视频地址需网络可达才可播放；离线环境建议使用本地相对路径。

### 视频标签语法

> 使用编辑器的「添加视频」工具栏按钮，或直接编写以下格式：

[[video]]
https://vjs.zencdn.net/v/oceans.mp4
[[/video]]

### 原生 HTML5 video

<video src="https://vjs.zencdn.net/v/oceans.mp4" controls width="100%" height="320"></video>

---

## 十六、📎 附件链接

> **📌 语法说明与边界**
> - 声明格式：`[[file]]` 内每行一个附件，格式为 `文件名 | 描述`（`|` 前为文件名/相对路径，`|` 后为显示描述）；
> - 文件名支持任意扩展名（`.pdf/.docx/.xlsx/.pptx/.zip/.rar` 等），渲染为带文件类型图标的卡片，点击下载；
> - 描述可省略（`report.pdf | 2024年度数据报表` 中 `| 2024年度数据报表` 为描述，可写可不写）；
> - 文件名含 `|` 时需转义（`\|`）；相对路径相对当前页面 URL 解析；
> - 同一 `[[file]]` 块可声明多个附件（每行一个）。

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

> **📌 图片尺寸语法说明**
> - **固定尺寸**：图片 Markdown 末尾追加 `<宽,高>`（如 `![alt](path)<180,180>`）；可只写宽 `<180>`（高自动等比）或 `x` 高 `<x120>`；`<100,>` 等价 `<100>`；
> - **可拖拽调整**：不写尺寸参数的图片，预览区右下角出现拖拽手柄，可自由调整；**按住 Shift** 等比缩放；**双击图片**弹出精确尺寸输入框；
> - **边界**：`<w,h>` 内不能有空格；`w`/`h` 需为正整数（像素）；比例失衡时可双击纠正；
> - 调整结果**实时同步**回 Markdown 源码（写回 `![alt](path)<w,h>`），再次渲染保持一致性；
> - 尺寸仅影响预览显示，不修改原图文件。

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

> **📌 Page Block 语法说明与边界**
> - **声明**：`[[page:纸张类型]]` 开始、`[[/page]]` 结束；纸张类型支持 `A4`（含页头页脚）、`AN`（A4 之外任意宽度/高度，`AN` 使用系统默认 A4 宽高）、`A5` 等；
> - **页头页脚**：`[[page:A4 header="..." footer="..."]]` 可选的 `header` / `footer` 参数，引号内支持占位符：`{page}` 当前页码、`{total}` 总页数；
> - **分页**：块内内容超过一页高度时自动分页；也可配合「二十、分页符」`[========]` 手动强制分页；
> - **边界**：`[[page:...]]` 与 `[[/page]]` 必须成对；参数值用**双引号**包裹（含空格时必需）；header/footer 均为单行文本（不支持换行与 Markdown）；
> - **打印**：打印预览（Ctrl/Cmd+P）按纸张尺寸分页输出，页头页脚自动出现在每一页；
> - 块内支持全部扩展语法（表格/图表/公式/代码块等）。

### A4 纸张（含页头页脚）

[[page:A4 header="xfEditor v2.0.0 — 开源 Markdown 在线编辑器" footer="第 {page} 页 / 共 {total} 页"]]
### xfEditor — 开源 Markdown 编辑器

xfEditor 是一款功能强大的开源 Markdown 在线编辑器，基于 CodeMirror、Marked 构建，内置零依赖 micro-DOM（XfDom），不依赖 jQuery。

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
| xfEditor | v2.0.0 | Markdown 编辑渲染引擎 |
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

**议题**：xfEditor v2.0.0 发布计划

**决议**：全票通过，立即执行
[[/page]]

---

## 二十、📑 分页符

> **📌 分页符语法说明**
> - **声明**：单独一行写 `[========]`（至少 8 个 `=`，左右各一个 `[` `]`）；
> - **效果**：在**打印预览**（Ctrl/Cmd+P）与 Page Block 分页中强制换页；普通预览中显示为浅色分隔线；
> - **边界**：`[========]` 必须独占一行（前后留空行更稳妥）；`=` 少于 8 个时不生效；多个分页符连续使用时按顺序分页；
> - 分页符不产生任何可见文本，仅影响分页边界。

第一页的内容在这一行结束。

[========]

第二页从这行开始，在打印预览中可以看到换页效果。

---

## 二十一、@ 链接

> **📌 @ 链接语法说明**
> - **格式**：`@用户名`（如 `@zhaoxianfang`），自动解析为成员/项目链接；
> - **解析规则**：`@` 后紧跟英文/数字/下划线连续字符视为用户名（中文等字符处截断）；`@` 前有 `\` 时转义为字面 `@`；
> - **默认行为**：解析为指向 `https://github.com/用户名` 的链接（可通过配置 `atLink` 回调自定义跳转目标）；
> - **边界**：`@` 位于行首或空格/标点后才会触发解析（邮箱中的 `@`（如 `a@b.com`）与已有链接文本中的 `@` 不解析）。

@zhaoxianfang — 作者主页 | @contributor — 开源贡献者

---

## 二十二、✍️ 字帖 Copybook

字帖系统支持三种格型：**田字格**、**米字格**、**拼音格**。

> **📌 字帖语法说明与边界**
> - **三种格型标签**：`[[copybookTian]]`（田字格）、`[[copybookMi]]`（米字格）、`[[copybookPinyin]]`（拼音格），均以对应 `[[/xxx]]` 闭合；
> - **内容写法**：田字格/米字格每字一个圆括号 `(字)`（连续书写即连续分格）；拼音格用花括号 `{汉字|拼音}`（推荐）或圆括号 `(汉字|拼音)`（兼容旧版）；
> - **宽度参数**：拼音格内可写 `(!width:125)` 设置每格宽度（px），组内两端对齐；
> - **脚注**：字帖内可嵌入 `[^注]` 脚注标记，对应脚注定义写在 `[[/xxx]]` 之后；
> - **边界**：标签必须成对；圆括号/花括号必须配对（未配对文字不进入字帖格）；拼音与汉字用 `|` 分隔；混用三种格型时各自独立成块；
> - 字帖渲染为可打印的格子书写区，适合练字、识字教学场景。

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

> **📌 字体大小语法说明与边界**
> - **格式**：`!字号 文本!`，`!` 后紧跟数字字号（px），加**一个空格**再写文本，结尾 `!` 闭合（如 `!20 这是 20px 文字!`）；
> - **范围**：字号取值 **8~200px**；超出范围自动夹取到边界（`<8` 按 8、`>200` 按 200）；非数字输入不生效；
> - **边界**：`!` 与数字之间不能有空格；文本内不能包含未转义的 `!`；同一文本可再叠加行内 Markdown（加粗/斜体/上标等）；
> - 适用于标题、注释、免责声明等不同层级文字排版。

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

[^editor-footnote]: xfEditor 核心依赖：**CodeMirror**（编辑器内核）、**Marked**（Markdown 解析器）、**KaTeX**（数学公式渲染）、**ECharts**（图表渲染）、内置 **XfDom micro-DOM**（DOM 操作，零外部依赖）。采用 `MIT` 许可证，欢迎参与贡献。

### 25.3 标题中使用脚注

#### 关于本编辑器[^about]

现代 Markdown 编辑器应具备丰富的扩展能力和良好的用户体验。

[^about]: 本文档演示了 xfEditor v2.0.0 的全部功能。更多文档请参阅 `USAGE_GUIDE.md` 和 `README.md`。

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

## 二十七、🖌️ 画布涂鸦 Canvas Graffiti

通过工具栏的 **画笔（✏️）** 图标（或调用 `canvasDialog()`）打开涂鸦面板，可在画布上手绘画作、标注、签名、思维导图等，
保存后以 `data:image/...;base64,...` 形式内嵌于文档，无需任何外部图片文件。

### 27.1 语法

涂鸦使用 `[[canvas[:align] title="..."]] ... [[/canvas]]` 块语法，内容体为图片的 `data:` URI：

```markdown
[[canvas:center title="我的涂鸦"]]
(data:image/jpeg;base64,/9j/4AAQ...)
[[/canvas]]
```

- `[[canvas]]` 与 `[[/canvas]]` 为块级容器配对标签。
- 可选对齐参数：`left`（默认）/ `center` / `right`，写在 `canvas:` 后，如 `[[canvas:center]]`。
- 可选标题参数：`title="..."`，支持中文与英文，始终显示在图片**正下方居中**位置。
- 内容体为图片 `data:` URI。**保存时编辑器会在 WebP / 多档 JPEG / PNG 之间自动选择体积最小者**（在 XSS 白名单 `png|jpeg|webp` 内放行），因此文档中可能出现 `data:image/png;base64,`、`data:image/jpeg;base64,` 或 `data:image/webp;base64,`。对白底/纯色等简单画面会自动选 PNG（体积更小），对色彩丰富的画面会选 WebP/JPEG，内容始终零丢失。

### 27.2 涂鸦面板工具栏

工具栏采用紧凑分组、图标化布局：

| 分组 | 功能 | 说明 |
|------|------|------|
| 操作（同一 `.xf-cg-group` 内，按钮均 30×30px、间距 2px） | ↶ 撤销 / ↷ 恢复 / ✏️ 画笔 / 🧽 橡皮擦 / 🔄 重置 / 🗑️ 清空 / ↔️ 选择 / 🔍 放大 / 🔍 缩小 | 九个功能按钮紧挨成一组，宽度高度均 30px、间隔 2px；其中 ↔️ 选择/扩展画布 位于 🗑️ 清空 右侧、🔍 放大 左侧 |
| 颜色 | 颜色选择器 + 8 色快捷色板 + 粗细滑块 | 粗细 1–40，色板选中高亮 |
| 橡皮大小 | 橡皮大小滑块 | 范围 2–60，实时改变橡皮擦擦除半径 |
| 视图 | 百分比实时显示 | 与操作组中的放大 / 缩小 / 重置联动 |
| 对齐 / 名称 | 对齐下拉 + 名称输入框 | 设置渲染对齐方式与图片标题 |

> **画笔 / 橡皮擦 / 选择工具 三者互斥**：点选橡皮后需再点画笔才能回到画笔模式；点选选择工具后可再次点选以退出。
> **画笔 / 橡皮只作画、不改尺寸**：绘制（含放大后绘制）过程**绝不修改**画布宽高，因此不会出现抖动或尺寸被意外改变；需要改变画布大小时，请使用「选择工具」拖拽扩展。

### 27.2.1 清空画布（🗑️）

点击 **清空画布** 按钮：一次性清除画布上的所有内容，并把画布尺寸 **重置为填满绘制区**（`.xf-cg-canvas-wrap` 的宽高），缩放比例归位为 100%。清空操作本身会被记入撤销栈，因此清空后仍可点击 **撤销 / 恢复** 回退或前进到清空前的状态。

### 27.2.2 选择工具 / 方向性扩展画布（↔️）

点击 **选择工具** 后，光标变为「小手（抓取）」；在画布上 **长按鼠标左键并拖动**，即按拖拽方向 **方向性地扩展画布**，松手后光标恢复。扩展方向与内容位移规则如下（拖拽增量实时换算到画布坐标）：

- **向右拖** → 向**左**扩展画布，画布内**全部涂鸦内容整体右移**新增的宽度；
- **向下拖** → 向**上**扩展画布，画布内**全部涂鸦内容整体下移**新增的高度；
- **向左拖** → 向**右**扩展画布（仅加宽，内容位置不变）；
- **向上拖** → 向**下**扩展画布（仅加高，内容位置不变）。

当画布尺寸超出绘制区时，绘制区会 **自动出现滚动条**，可滚动查看全部内容。

### 27.2.3 画布始终占满绘制区

可视画布会 **始终铺满** `.xf-cg-canvas-wrap` 的宽度与高度（不足时以白底填充，超出时滚动查看），不会出现四周留白或尺寸错乱的问题。

### 27.3 缩放不丢失内容（放大 / 缩小 / 重置）

涂鸦采用「离屏基准画布 + 可视视口」架构：放大 / 缩小**只改变显示比例**，绝不裁剪或丢弃画布舞台之外的内容。

- 验证：涂鸦任意内容后，无论放大到 299% 还是缩回 100%，再保存，画布舞台之外的内容都完整保留。
- 🔍 放大 / 🔍 缩小 / 🔄 重置 三个按钮位于操作组内，并实时显示当前缩放百分比。
- 视口画布与缩放显示严格 1:1：缩小后画布整体按比例变小（内容居中显示于灰底容器中），**整张可视画布均可涂鸦，不存在右侧 / 底部“死区”**；放大后画布变大，超出容器时由容器出现滚动条，同样全部可涂鸦。

### 27.4 扩展画布（改变尺寸的唯一途径）

画布的宽度 / 高度**只能通过「选择工具」拖拽来修改**（见 27.2.2）。画笔与橡皮仅用于在现有画布范围内作画，不会自动加宽 / 加高，也不会因绘制导致画布抖动或尺寸被改变——这样既避免了误改尺寸，也保证了绘制体验的流畅稳定。

### 27.5 保存时智能裁剪（去空白）

保存时编辑器会扫描所有非透明像素，按内容包围盒 **自动裁剪**，仅保留有涂鸦内容的区域并保留一定安全边距，去除上下左右四个方向的大片空白；同时**绝不丢失任何涂鸦内容**，再叠加白色背景后导出。这样既减小体积，又保证画面完整。

### 27.6 弹窗最大化 / 恢复

涂鸦弹窗支持 **最大化（⛶）/ 恢复** 按钮：

- 最大化后画布区占满可视区（约 94vw × 94vh），方便精细作画；再次点击恢复原尺寸。
- 画布区高度始终 = 弹窗内容高度 − 底部操作按钮高度 − 工具栏高度；中屏 / 手机上也不会溢出或无法关闭（弹窗最大宽度限制为可视区 95%）。

### 27.7 鼠标指针反馈

- 画笔模式：画布内鼠标变为画笔图标。
- 橡皮擦模式：画布内鼠标变为与当前橡皮大小一致的半透明圆形，便于直观感知擦除位置与范围。

### 27.8 重新编辑

渲染后的涂鸦图片可直接点击，再次打开涂鸦面板并载入原图进行编辑（不会出现空白或不可用）。

### 27.9 真实示例

下面是一段真实可渲染的涂鸦（点击预览区图片可重新编辑）：

[[canvas:center title="示例涂鸦"]]
(data:image/png;base64,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)
[[/canvas]]

---
## 二十八、🎠 Banner 轮播图

> 使用 `[[banner]] ... [[/banner]]` 语法插入轮播图，支持自动播放（3 秒，悬停暂停）、左右箭头、圆点指示器与触摸滑动。
> `width`（可选）为整体显示宽度，默认 `100%`；`height`（可选）为整体显示高度，默认取第一张图片的高度。
> 每行一个条目：`url` 为图片地址（必填）；`title` 标题、`desc` 描述均可省略；`href` 为点击跳转地址，不配置时点击无任何响应。

### 28.1 完整配置（宽高 + 标题 + 描述 + 跳转链接）

[[banner width="100%" height="320px"]]
{url:"https://picsum.photos/id/1015/1200/500",title:"山川河流",desc:"大自然的鬼斧神工，山川与河流交相辉映",href:"https://github.com/zhaoxianfang/xfeditor"},
{url:"https://picsum.photos/id/1016/1200/500",title:"峡谷风光",desc:"深邃的峡谷中隐藏着无尽的奥秘",href:"https://gitee.com/zhaoxianfang/xfeditor"},
{url:"https://picsum.photos/id/1018/1200/500",title:"雪山湖泊",desc:"雪山倒映在宁静的湖面上"},
[[/banner]]

### 28.2 极简配置（默认宽度 100%，高度取第一张图片；无标题、无跳转）

[[banner]]
{url:"https://picsum.photos/id/1039/1200/420",desc:"瀑布飞流直下"},
{url:"https://picsum.photos/id/1043/1200/420",desc:"静谧的森林小径"},
[[/banner]]

### 28.3 自定义宽度（居中展示单张图，点击跳转）

[[banner width="60%" height="220px"]]
{url:"https://picsum.photos/id/1047/900/400",title:"城市夜景",desc:"华灯初上的城市天际线",href:"https://github.com/zhaoxianfang/xfeditor"},
[[/banner]]

---
## 二十九、🏁 结语

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
| 📦 媒体 | 图片上传/跨域、文件上传、视频嵌入/上传、附件链接、Banner 轮播图 |
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
| XfDom（内置 micro-DOM） | — | DOM 操作（零外部依赖，无 jQuery） |
| FlowChart.js | ^1.x | 流程图 |
| js-sequence-diagrams | ^2.x | 时序图 |
| highlight.js | ^11.x | 代码语法高亮 |

> Made with ❤️ by Contributors | [MIT License](https://github.com/zhaoxianfang/xfeditor/blob/master/LICENSE)
