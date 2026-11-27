# xfEditor micro-DOM API 参考文档

## 概述

xfEditor 内置 micro-DOM 层（`xfEditor.dom`），是一个纯原生 JavaScript 实现的轻量 DOM 工具库，
随编辑器一起打包，无任何外部依赖。本文档记录其全部公开 API 的行为与用法。

> 所有示例中的 `dom` 均指 `xfEditor.dom`。

---

## 选择器

### dom(selector, context)

**功能**：选择 DOM 元素

**参数**：
- `selector` (string|Element|Function|Array): 选择器字符串、DOM 元素、函数或数组
- `context` (Element|XfDom, 可选): 查询上下文

**返回值**：XfDom 对象（类数组）

**示例**：
```javascript
// 选择器字符串
dom('.class')
dom('#id')
dom('div')
dom('div.class')

// DOM 元素
dom(document.body)
dom(element)

// 函数（DOM ready）
dom(function() {
    console.log('DOM ready');
});

// HTML 字符串（创建元素）
dom('<div>Test</div>')
dom('<div/>', { class: 'test', text: 'Test' })

// 数组
dom([element1, element2])
```

**行为**：
- 返回 XfDom 对象，具有 `length` 属性和数组索引
- 支持链式调用
- 空选择器返回空集合（`length: 0`）
- 函数参数在 DOM ready 后执行

---

## DOM 操作

### dom.fn.html([content])

**功能**：获取或设置元素的 HTML 内容

**参数**：
- `content` (string|Function, 可选): HTML 字符串或返回 HTML 的函数

**返回值**：
- 无参数：返回第一个元素的 innerHTML（string）
- 有参数：返回 this（支持链式调用）

**示例**：
```javascript
// 获取
var html = dom('.container').html();

// 设置
dom('.container').html('<p>New content</p>');

// 函数
dom('.item').html(function(index, oldHtml) {
    return '<span>' + index + '</span>';
});
```

---

### dom.fn.text([content])

**功能**：获取或设置元素的文本内容

**参数**：
- `content` (string|Function, 可选): 文本字符串或返回文本的函数

**返回值**：
- 无参数：返回所有元素的文本合并（string）
- 有参数：返回 this

**示例**：
```javascript
// 获取
var text = dom('.container').text();

// 设置
dom('.container').text('New text');
```

---

### dom.fn.val([value])

**功能**：获取或设置表单元素的值

**参数**：
- `value` (string|Array|Function, 可选): 值或返回值的函数

**返回值**：
- 无参数：返回第一个元素的 value
- 有参数：返回 this

**示例**：
```javascript
// 获取
var value = dom('input').val();

// 设置
dom('input').val('new value');

// 多选框
dom('select').val(['option1', 'option2']);
```

---

### dom.fn.attr(name, [value])

**功能**：获取或设置元素的属性

**参数**：
- `name` (string|Object): 属性名或属性对象
- `value` (string|Function, 可选): 属性值或返回值的函数

**返回值**：
- 字符串参数：返回属性值（string）
- 对象参数：返回 this
- 两个参数：返回 this

**示例**：
```javascript
// 获取
var id = dom('div').attr('id');

// 设置
dom('div').attr('id', 'container');

// 对象设置
dom('div').attr({
    'id': 'container',
    'data-test': 'value'
});
```

---

### dom.fn.removeAttr(name)

**功能**：移除元素的属性

**参数**：
- `name` (string): 属性名（支持空格分隔多个）

**返回值**：this

**示例**：
```javascript
dom('div').removeAttr('id');
dom('div').removeAttr('id title');
```

---

### dom.fn.prop(name, [value])

**功能**：获取或设置元素的 DOM 属性

**参数**：
- `name` (string|Object): 属性名或属性对象
- `value` (any, 可选): 属性值

**返回值**：
- 字符串参数：返回属性值
- 其他：返回 this

**示例**：
```javascript
// 获取
var checked = dom('input').prop('checked');

// 设置
dom('input').prop('checked', true);
```

---

### dom.fn.data(key, [value])

**功能**：获取或设置元素的数据

**参数**：
- `key` (string|Object, 可选): 数据键名或数据对象
- `value` (any, 可选): 数据值

**返回值**：
- 无参数：返回所有数据（Object）
- 字符串参数：返回数据值
- 其他：返回 this

**示例**：
```javascript
// 从 data-* 属性读取
var id = dom('div').data('id'); // <div data-id="123">

// 存储
dom('div').data('custom', { key: 'value' });

// 获取所有
var allData = dom('div').data();
```

---

### dom.fn.css(name, [value])

**功能**：获取或设置元素的样式

**参数**：
- `name` (string|Object): 样式名或样式对象
- `value` (string|number|Function, 可选): 样式值

**返回值**：
- 字符串参数：返回样式值（string）
- 其他：返回 this

**示例**：
```javascript
// 获取
var color = dom('div').css('color');

// 设置
dom('div').css('color', 'red');
dom('div').css('color', 'red !important');

// 对象设置
dom('div').css({
    'color': 'red',
    'background': 'blue'
});
```

---

## 类操作

### dom.fn.addClass(className)

**功能**：添加 CSS 类

**参数**：
- `className` (string|Function): 类名（支持空格分隔多个）或返回类名的函数

**返回值**：this

**示例**：
```javascript
dom('div').addClass('active');
dom('div').addClass('class1 class2');
```

---

### dom.fn.removeClass(className)

**功能**：移除 CSS 类

**参数**：
- `className` (string|Function, 可选): 类名（不传则移除所有类）

**返回值**：this

**示例**：
```javascript
dom('div').removeClass('active');
dom('div').removeClass(); // 移除所有类
```

---

### dom.fn.toggleClass(className, [state])

**功能**：切换 CSS 类

**参数**：
- `className` (string|Function): 类名
- `state` (boolean, 可选): 强制添加或移除

**返回值**：this

**示例**：
```javascript
dom('div').toggleClass('active');
dom('div').toggleClass('active', true); // 强制添加
```

---

### dom.fn.hasClass(className)

**功能**：检查是否包含 CSS 类

**参数**：
- `className` (string): 类名

**返回值**：boolean

**示例**：
```javascript
if (dom('div').hasClass('active')) {
    // ...
}
```

---

## DOM 遍历

### dom.fn.find(selector)

**功能**：查找后代元素

**参数**：
- `selector` (string|Element|XfDom): 选择器、元素或 XfDom 对象

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.container').find('.item');
dom('.container').find(element);
```

---

### dom.fn.children([selector])

**功能**：获取子元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.container').children();
dom('.container').children('.item');
```

---

### dom.fn.parent([selector])

**功能**：获取父元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').parent();
dom('.item').parent('.container');
```

---

### dom.fn.parents([selector])

**功能**：获取所有祖先元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').parents();
dom('.item').parents('.container');
```

---

### dom.fn.siblings([selector])

**功能**：获取兄弟元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').siblings();
dom('.item').siblings('.active');
```

---

### dom.fn.next([selector])

**功能**：获取下一个兄弟元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').next();
```

---

### dom.fn.prev([selector])

**功能**：获取上一个兄弟元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').prev();
```

---

### dom.fn.eq(index)

**功能**：获取指定索引的元素

**参数**：
- `index` (number): 索引（支持负数）

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').eq(0);   // 第一个
dom('.item').eq(-1);  // 最后一个
```

---

### dom.fn.first()

**功能**：获取第一个元素

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').first();
```

---

### dom.fn.last()

**功能**：获取最后一个元素

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').last();
```

---

### dom.fn.filter(selector)

**功能**：过滤元素

**参数**：
- `selector` (string|Function|Element): 选择器、函数或元素

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').filter('.active');
dom('.item').filter(function(index) {
    return index % 2 === 0;
});
```

---

### dom.fn.not(selector)

**功能**：排除元素

**参数**：
- `selector` (string|Function|Element|XfDom): 选择器、函数、元素或 XfDom 对象

**返回值**：XfDom 对象

**示例**：
```javascript
dom('.item').not('.active');
```

---

### dom.fn.is(selector)

**功能**：检查元素是否匹配选择器

**参数**：
- `selector` (string|Function|Element|XfDom): 选择器、函数、元素或 XfDom 对象

**返回值**：boolean

**示例**：
```javascript
if (dom('.item').is('.active')) {
    // ...
}
```

---

## DOM 插入

### dom.fn.append(content, [...])

**功能**：在元素内部末尾插入内容

**参数**：
- `content` (string|Element|XfDom|Function): 要插入的内容

**返回值**：this

**示例**：
```javascript
dom('.container').append('<div>New</div>');
dom('.container').append(element);
```

---

### dom.fn.prepend(content, [...])

**功能**：在元素内部开头插入内容

**参数**：
- `content` (string|Element|XfDom|Function): 要插入的内容

**返回值**：this

**示例**：
```javascript
dom('.container').prepend('<div>New</div>');
```

---

### dom.fn.before(content, [...])

**功能**：在元素前面插入内容

**参数**：
- `content` (string|Element|XfDom|Function): 要插入的内容

**返回值**：this

**示例**：
```javascript
dom('.item').before('<div>New</div>');
```

---

### dom.fn.after(content, [...])

**功能**：在元素后面插入内容

**参数**：
- `content` (string|Element|XfDom|Function): 要插入的内容

**返回值**：this

**示例**：
```javascript
dom('.item').after('<div>New</div>');
```

---

### dom.fn.remove([selector])

**功能**：移除元素

**参数**：
- `selector` (string, 可选): 过滤选择器

**返回值**：this

**示例**：
```javascript
dom('.item').remove();
dom('.item').remove('.active');
```

---

### dom.fn.empty()

**功能**：清空元素的所有子节点

**返回值**：this

**示例**：
```javascript
dom('.container').empty();
```

---

### dom.fn.clone([deep])

**功能**：克隆元素

**参数**：
- `deep` (boolean, 可选): 是否深度克隆（默认 true）

**返回值**：XfDom 对象

**示例**：
```javascript
var $clone = dom('.item').clone();
```

---

## 事件

### dom.fn.on(events, [selector], [data], handler)

**功能**：绑定事件

**参数**：
- `events` (string): 事件名（支持空格分隔多个）
- `selector` (string, 可选): 委托选择器
- `data` (any, 可选): 传递给事件处理函数的数据
- `handler` (Function): 事件处理函数

**返回值**：this

**示例**：
```javascript
// 直接绑定
dom('div').on('click', function(e) {
    console.log('clicked');
});

// 事件委托
dom('.container').on('click', '.item', function(e) {
    console.log('item clicked');
});

// 多个事件
dom('div').on('click mouseenter', function(e) {
    console.log(e.type);
});
```

---

### dom.fn.off(events, [selector], [handler])

**功能**：解绑事件

**参数**：
- `events` (string, 可选): 事件名
- `selector` (string, 可选): 委托选择器
- `handler` (Function, 可选): 事件处理函数

**返回值**：this

**示例**：
```javascript
// 解绑所有
dom('div').off();

// 解绑特定事件
dom('div').off('click');

// 解绑特定处理函数
dom('div').off('click', handler);
```

---

### dom.fn.one(events, [selector], [data], handler)

**功能**：绑定一次性事件

**参数**：同 `dom.fn.on()`

**返回值**：this

**示例**：
```javascript
dom('div').one('click', function(e) {
    console.log('只触发一次');
});
```

---

### dom.fn.trigger(eventName, [extraParameters])

**功能**：触发事件

**参数**：
- `eventName` (string): 事件名
- `extraParameters` (Array, 可选): 额外参数

**返回值**：this

**示例**：
```javascript
dom('div').trigger('click');
dom('div').trigger('custom', [arg1, arg2]);
```

---

## 显示/隐藏

### dom.fn.show()

**功能**：显示元素

**返回值**：this

**示例**：
```javascript
dom('div').show();
```

---

### dom.fn.hide()

**功能**：隐藏元素

**返回值**：this

**示例**：
```javascript
dom('div').hide();
```

---

### dom.fn.toggle([state])

**功能**：切换显示/隐藏

**参数**：
- `state` (boolean, 可选): 强制显示或隐藏

**返回值**：this

**示例**：
```javascript
dom('div').toggle();
dom('div').toggle(true); // 强制显示
```

---

## 工具方法

### dom.extend([deep], target, [source1], [source2], ...)

**功能**：扩展对象

**参数**：
- `deep` (boolean, 可选): 是否深拷贝
- `target` (Object): 目标对象
- `source` (Object, 可选): 源对象

**返回值**：Object

**示例**：
```javascript
// 浅拷贝
var obj = dom.extend({}, { a: 1 }, { b: 2 });

// 深拷贝
var obj = dom.extend(true, {}, { a: { x: 1 } }, { a: { y: 2 } });
```

---

### dom.each(collection, callback)

**功能**：遍历集合

**参数**：
- `collection` (Array|Object): 要遍历的集合
- `callback` (Function): 回调函数 `(index, value)` 或 `(key, value)`

**返回值**：collection

**示例**：
```javascript
// 数组
dom.each([1, 2, 3], function(index, value) {
    console.log(index, value);
});

// 对象
dom.each({ a: 1, b: 2 }, function(key, value) {
    console.log(key, value);
});
```

---

### dom.map(collection, callback)

**功能**：映射集合

**参数**：
- `collection` (Array|Object): 要映射的集合
- `callback` (Function): 回调函数

**返回值**：Array

**示例**：
```javascript
var doubled = dom.map([1, 2, 3], function(value, index) {
    return value * 2;
});
```

---

### dom.grep(array, callback, [invert])

**功能**：过滤数组

**参数**：
- `array` (Array): 要过滤的数组
- `callback` (Function): 回调函数 `(value, index)`
- `invert` (boolean, 可选): 是否反转结果

**返回值**：Array

**示例**：
```javascript
var filtered = dom.grep([1, 2, 3, 4, 5], function(value) {
    return value > 2;
});
```

---

### dom.trim(str)

**功能**：去除字符串两端的空白

**参数**：
- `str` (string): 字符串

**返回值**：string

**示例**：
```javascript
var trimmed = dom.trim('  test  '); // 'test'
```

---

### dom.type(obj)

**功能**：判断对象类型

**参数**：
- `obj` (any): 要判断的对象

**返回值**：string

**示例**：
```javascript
dom.type([1, 2]);     // 'array'
dom.type({});         // 'object'
dom.type('test');     // 'string'
dom.type(123);        // 'number'
dom.type(null);       // 'null'
dom.type(undefined);  // 'undefined'
```

---

### dom.isArray(obj)

**功能**：判断是否为数组

**参数**：
- `obj` (any): 要判断的对象

**返回值**：boolean

**示例**：
```javascript
dom.isArray([1, 2]);  // true
dom.isArray('test');  // false
```

---

### dom.isNumeric(value)

**功能**：判断是否为数字

**参数**：
- `value` (any): 要判断的值

**返回值**：boolean

**示例**：
```javascript
dom.isNumeric(123);     // true
dom.isNumeric('123');   // true
dom.isNumeric('test');  // false
```

---

### dom.inArray(value, array, [fromIndex])

**功能**：在数组中查找值

**参数**：
- `value` (any): 要查找的值
- `array` (Array): 数组
- `fromIndex` (number, 可选): 起始索引

**返回值**：number（索引，未找到返回 -1）

**示例**：
```javascript
dom.inArray(2, [1, 2, 3]);  // 1
dom.inArray(4, [1, 2, 3]);  // -1
```

---

### dom.proxy(function, context)

**功能**：绑定函数上下文

**参数**：
- `function` (Function): 函数
- `context` (Object): 上下文对象

**返回值**：Function

**示例**：
```javascript
var obj = {
    name: 'test',
    getName: function() {
        return this.name;
    }
};

var fn = dom.proxy(obj.getName, obj);
fn(); // 'test'
```

---

### dom.parseJSON(json)

**功能**：解析 JSON 字符串

**参数**：
- `json` (string): JSON 字符串

**返回值**：Object

**示例**：
```javascript
var obj = dom.parseJSON('{"a":1}');
```

---

### dom.now()

**功能**：获取当前时间戳

**返回值**：number

**示例**：
```javascript
var timestamp = dom.now();
```

---

## AJAX

### dom.ajax(options)

**功能**：发送 AJAX 请求

**参数**：
- `options` (Object): 配置选项
  - `url` (string): 请求 URL
  - `method`/`type` (string): HTTP 方法（默认 'GET'）
  - `data` (Object|string): 请求数据
  - `contentType` (string): 内容类型
  - `dataType` (string): 预期响应类型
  - `success` (Function): 成功回调
  - `error` (Function): 失败回调
  - `complete` (Function): 完成回调
  - `headers` (Object): 请求头

**返回值**：XMLHttpRequest

**示例**：
```javascript
dom.ajax({
    url: '/api/data',
    method: 'POST',
    data: { key: 'value' },
    success: function(data) {
        console.log(data);
    },
    error: function(xhr, status, error) {
        console.error(error);
    }
});
```

---

### dom.get(url, [data], [success], [dataType])

**功能**：发送 GET 请求

**参数**：
- `url` (string): 请求 URL
- `data` (Object|string, 可选): 请求数据
- `success` (Function, 可选): 成功回调
- `dataType` (string, 可选): 预期响应类型

**返回值**：XMLHttpRequest

**示例**：
```javascript
dom.get('/api/data', { id: 123 }, function(data) {
    console.log(data);
});
```

---

### dom.post(url, [data], [success], [dataType])

**功能**：发送 POST 请求

**参数**：同 `dom.get()`

**返回值**：XMLHttpRequest

**示例**：
```javascript
dom.post('/api/data', { key: 'value' }, function(data) {
    console.log(data);
});
```

---

## 链式调用

所有实例方法（`dom.fn.*`）都返回 `this`，支持链式调用：

```javascript
dom('.item')
    .addClass('active')
    .css('color', 'red')
    .html('Test')
    .on('click', function() {})
    .show();
```

---

## 特殊情况

### 空集合

对空集合调用方法不会报错，但可能返回 `undefined`：

```javascript
var $empty = dom('.non-existent');
$empty.html('test');  // 无操作
$empty.html();        // undefined
```

---

### dom(null) 和 dom(undefined)

返回空集合：

```javascript
dom(null).length;      // 0
dom(undefined).length; // 0
```

---

## 总结

本文档记录了 xfEditor micro-DOM 层的所有 API 行为，用于测试验证与二次开发参考。
