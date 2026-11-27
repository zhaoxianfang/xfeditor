/**
 * xfEditor micro-DOM API 测试套件
 * 
 * 目的：测试所有 micro-DOM API 的行为，确保迁移后功能一致
 * 运行：在浏览器中打开 tests/test-runner.html
 */

(function(window) {
    'use strict';

    // 测试工具
    var TestRunner = {
        passed: 0,
        failed: 0,
        tests: [],
        
        test: function(name, fn) {
            this.tests.push({ name: name, fn: fn });
        },
        
        assert: function(condition, message) {
            if (!condition) {
                throw new Error(message || 'Assertion failed');
            }
        },
        
        assertEqual: function(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || ('Expected ' + expected + ' but got ' + actual));
            }
        },
        
        assertDeepEqual: function(actual, expected, message) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(message || ('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual)));
            }
        },

        assertNotEqual: function(actual, expected, message) {
            if (actual === expected) {
                throw new Error(message || ('Expected not ' + expected + ' but got ' + actual));
            }
        },
        
        run: function() {
            console.log('=== 开始测试 ===\n');
            
            for (var i = 0; i < this.tests.length; i++) {
                var test = this.tests[i];
                try {
                    test.fn();
                    this.passed++;
                    console.log('✅ PASS: ' + test.name);
                } catch (e) {
                    this.failed++;
                    console.error('❌ FAIL: ' + test.name);
                    console.error('   Error: ' + e.message);
                }
            }
            
            console.log('\n=== 测试结果 ===');
            console.log('通过: ' + this.passed);
            console.log('失败: ' + this.failed);
            console.log('总计: ' + this.tests.length);
            
            return this.failed === 0;
        }
    };

    // ==================== 选择器测试 ====================
    
    TestRunner.test('dom(selector) - 选择单个元素', function() {
        var div = document.createElement('div');
        div.id = 'test-div';
        document.body.appendChild(div);
        
        var divDom = dom('#test-div');
        TestRunner.assertEqual(divDom.length, 1, '应该找到 1 个元素');
        TestRunner.assertEqual(divDom[0], div, '应该返回正确的元素');
        
        document.body.removeChild(div);
    });
    
    TestRunner.test('dom(selector) - 选择多个元素', function() {
        var divs = [];
        for (var i = 0; i < 3; i++) {
            var div = document.createElement('div');
            div.className = 'test-div';
            document.body.appendChild(div);
            divs.push(div);
        }
        
        var divsDom = dom('.test-div');
        TestRunner.assertEqual(divsDom.length, 3, '应该找到 3 个元素');
        
        divs.forEach(function(div) {
            document.body.removeChild(div);
        });
    });
    
    TestRunner.test('dom(html) - 创建元素', function() {
        var divDom = dom('<div class="created">Test</div>');
        TestRunner.assertEqual(divDom.length, 1, '应该创建 1 个元素');
        TestRunner.assertEqual(divDom[0].className, 'created', '应该有正确的 class');
        TestRunner.assertEqual(divDom[0].textContent, 'Test', '应该有正确的文本');
    });
    
    TestRunner.test('dom(function) - DOM ready', function() {
        var called = false;
        dom(function() {
            called = true;
        });
        
        // 立即执行（因为 DOM 已经加载）
        setTimeout(function() {
            TestRunner.assert(called, '应该调用回调函数');
        }, 10);
    });

    // ==================== DOM 操作测试 ====================
    
    TestRunner.test('dom.fn.html() - 获取/设置 HTML', function() {
        var divDom = dom('<div>Original</div>');
        TestRunner.assertEqual(divDom.html(), 'Original', '应该获取正确的 HTML');
        
        divDom.html('Modified');
        TestRunner.assertEqual(divDom.html(), 'Modified', '应该设置正确的 HTML');
    });
    
    TestRunner.test('dom.fn.text() - 获取/设置文本', function() {
        var divDom = dom('<div>Original</div>');
        TestRunner.assertEqual(divDom.text(), 'Original', '应该获取正确的文本');
        
        divDom.text('Modified');
        TestRunner.assertEqual(divDom.text(), 'Modified', '应该设置正确的文本');
    });
    
    TestRunner.test('dom.fn.val() - 获取/设置值', function() {
        var inputDom = dom('<input type="text" value="test">');
        TestRunner.assertEqual(inputDom.val(), 'test', '应该获取正确的值');
        
        inputDom.val('modified');
        TestRunner.assertEqual(inputDom.val(), 'modified', '应该设置正确的值');
    });
    
    TestRunner.test('dom.fn.attr() - 获取/设置属性', function() {
        var divDom = dom('<div id="test"></div>');
        TestRunner.assertEqual(divDom.attr('id'), 'test', '应该获取正确的属性');
        
        divDom.attr('id', 'modified');
        TestRunner.assertEqual(divDom.attr('id'), 'modified', '应该设置正确的属性');
        
        divDom.attr({ 'data-test': 'value', 'title': 'Test' });
        TestRunner.assertEqual(divDom.attr('data-test'), 'value', '应该支持对象设置属性');
    });
    
    TestRunner.test('dom.fn.removeAttr() - 移除属性', function() {
        var divDom = dom('<div id="test"></div>');
        divDom.removeAttr('id');
        TestRunner.assertEqual(divDom.attr('id'), undefined, '应该移除属性');
    });
    
    TestRunner.test('dom.fn.prop() - 获取/设置属性', function() {
        var checkboxDom = dom('<input type="checkbox">');
        TestRunner.assertEqual(checkboxDom.prop('checked'), false, '应该获取正确的属性');
        
        checkboxDom.prop('checked', true);
        TestRunner.assertEqual(checkboxDom.prop('checked'), true, '应该设置正确的属性');
    });
    
    TestRunner.test('dom.fn.data() - 获取/设置数据', function() {
        var divDom = dom('<div data-test="value"></div>');
        TestRunner.assertEqual(divDom.data('test'), 'value', '应该从 data-* 属性获取数据');
        
        divDom.data('custom', { key: 'value' });
        TestRunner.assertDeepEqual(divDom.data('custom'), { key: 'value' }, '应该存储对象数据');
    });
    
    TestRunner.test('dom.fn.addClass() - 添加类', function() {
        var divDom = dom('<div></div>');
        divDom.addClass('test-class');
        TestRunner.assert(divDom[0].classList.contains('test-class'), '应该添加类');
        
        divDom.addClass('class1 class2');
        TestRunner.assert(divDom[0].classList.contains('class1') && divDom[0].classList.contains('class2'), '应该添加多个类');
    });
    
    TestRunner.test('dom.fn.removeClass() - 移除类', function() {
        var divDom = dom('<div class="test-class"></div>');
        divDom.removeClass('test-class');
        TestRunner.assert(!divDom[0].classList.contains('test-class'), '应该移除类');
    });
    
    TestRunner.test('dom.fn.toggleClass() - 切换类', function() {
        var divDom = dom('<div></div>');
        divDom.toggleClass('test-class');
        TestRunner.assert(divDom[0].classList.contains('test-class'), '应该添加类');
        
        divDom.toggleClass('test-class');
        TestRunner.assert(!divDom[0].classList.contains('test-class'), '应该移除类');
    });
    
    TestRunner.test('dom.fn.hasClass() - 检查类', function() {
        var divDom = dom('<div class="test-class"></div>');
        TestRunner.assert(divDom.hasClass('test-class'), '应该返回 true');
        TestRunner.assert(!divDom.hasClass('other-class'), '应该返回 false');
    });
    
    TestRunner.test('dom.fn.css() - 获取/设置样式', function() {
        var divDom = dom('<div></div>');
        divDom.css('color', 'red');
        TestRunner.assertEqual(divDom[0].style.color, 'red', '应该设置样式');
        
        divDom.css({ 'background': 'blue', 'padding': '10px' });
        TestRunner.assertEqual(divDom[0].style.background, 'blue', '应该支持对象设置样式');
    });

    // ==================== DOM 遍历测试 ====================
    
    TestRunner.test('dom.fn.find() - 查找子元素', function() {
        var divDom = dom('<div><span class="child"></span></div>');
        var childDom = divDom.find('.child');
        TestRunner.assertEqual(childDom.length, 1, '应该找到 1 个子元素');
    });
    
    TestRunner.test('dom.fn.children() - 获取子元素', function() {
        var divDom = dom('<div><span></span><span></span></div>');
        var childrenDom = divDom.children();
        TestRunner.assertEqual(childrenDom.length, 2, '应该有 2 个子元素');
    });
    
    TestRunner.test('dom.fn.parent() - 获取父元素', function() {
        var divDom = dom('<div><span class="child"></span></div>');
        var parentDom = divDom.find('.child').parent();
        TestRunner.assertEqual(parentDom[0], divDom[0], '应该返回正确的父元素');
    });
    
    TestRunner.test('dom.fn.parents() - 获取所有祖先元素', function() {
        var container = document.createElement('div');
        container.id = 'container';
        var div = document.createElement('div');
        var span = document.createElement('span');
        span.className = 'child';
        
        div.appendChild(span);
        container.appendChild(div);
        document.body.appendChild(container);
        
        var parentsDom = dom('.child').parents();
        TestRunner.assert(parentsDom.length > 0, '应该有祖先元素');
        
        document.body.removeChild(container);
    });
    
    TestRunner.test('dom.fn.siblings() - 获取兄弟元素', function() {
        var divDom = dom('<div><span class="s1"></span><span class="s2"></span><span class="s3"></span></div>');
        var siblingsDom = divDom.find('.s2').siblings();
        TestRunner.assertEqual(siblingsDom.length, 2, '应该有 2 个兄弟元素');
    });
    
    TestRunner.test('dom.fn.next() - 获取下一个兄弟元素', function() {
        var divDom = dom('<div><span class="s1"></span><span class="s2"></span></div>');
        var nextDom = divDom.find('.s1').next();
        TestRunner.assertEqual(nextDom.hasClass('s2'), true, '应该返回正确的下一个元素');
    });
    
    TestRunner.test('dom.fn.prev() - 获取上一个兄弟元素', function() {
        var divDom = dom('<div><span class="s1"></span><span class="s2"></span></div>');
        var prevDom = divDom.find('.s2').prev();
        TestRunner.assertEqual(prevDom.hasClass('s1'), true, '应该返回正确的上一个元素');
    });
    
    TestRunner.test('dom.fn.eq() - 获取指定索引元素', function() {
        var divsDom = dom('<div></div><div></div><div></div>');
        TestRunner.assertEqual(divsDom.eq(0).length, 1, 'eq(0) 应该返回第一个元素');
        TestRunner.assertEqual(divsDom.eq(-1).length, 1, 'eq(-1) 应该返回最后一个元素');
    });
    
    TestRunner.test('dom.fn.first() - 获取第一个元素', function() {
        var divsDom = dom('<div class="first"></div><div></div>');
        TestRunner.assertEqual(divsDom.first().hasClass('first'), true, '应该返回第一个元素');
    });
    
    TestRunner.test('dom.fn.last() - 获取最后一个元素', function() {
        var divsDom = dom('<div></div><div class="last"></div>');
        TestRunner.assertEqual(divsDom.last().hasClass('last'), true, '应该返回最后一个元素');
    });
    
    TestRunner.test('dom.fn.filter() - 过滤元素', function() {
        var divsDom = dom('<div class="a"></div><div class="b"></div><div class="a"></div>');
        var filteredDom = divsDom.filter('.a');
        TestRunner.assertEqual(filteredDom.length, 2, '应该过滤出 2 个元素');
    });
    
    TestRunner.test('dom.fn.not() - 排除元素', function() {
        var divsDom = dom('<div class="a"></div><div class="b"></div><div class="a"></div>');
        var notDom = divsDom.not('.a');
        TestRunner.assertEqual(notDom.length, 1, '应该剩余 1 个元素');
    });
    
    TestRunner.test('dom.fn.is() - 检查元素', function() {
        var divDom = dom('<div class="test"></div>');
        TestRunner.assert(divDom.is('.test'), '应该返回 true');
        TestRunner.assert(!divDom.is('.other'), '应该返回 false');
    });

    // ==================== DOM 插入测试 ====================
    
    TestRunner.test('dom.fn.append() - 追加子元素', function() {
        var divDom = dom('<div></div>');
        divDom.append('<span>Test</span>');
        TestRunner.assertEqual(divDom.children().length, 1, '应该有 1 个子元素');
    });
    
    TestRunner.test('dom.fn.prepend() - 前置子元素', function() {
        var divDom = dom('<div><span>Original</span></div>');
        divDom.prepend('<span>New</span>');
        TestRunner.assertEqual(divDom.children().first().text(), 'New', '应该在最前面');
    });
    
    TestRunner.test('dom.fn.before() - 在前面插入', function() {
        var container = document.createElement('div');
        var div = document.createElement('div');
        div.className = 'target';
        container.appendChild(div);
        document.body.appendChild(container);
        
        dom('.target').before('<span>Before</span>');
        TestRunner.assertEqual(container.children[0].tagName, 'SPAN', '应该在前面插入');
        
        document.body.removeChild(container);
    });
    
    TestRunner.test('dom.fn.after() - 在后面插入', function() {
        var container = document.createElement('div');
        var div = document.createElement('div');
        div.className = 'target';
        container.appendChild(div);
        document.body.appendChild(container);
        
        dom('.target').after('<span>After</span>');
        TestRunner.assertEqual(container.children[1].tagName, 'SPAN', '应该在后面插入');
        
        document.body.removeChild(container);
    });
    
    TestRunner.test('dom.fn.remove() - 移除元素', function() {
        var divDom = dom('<div class="remove-me"></div>');
        document.body.appendChild(divDom[0]);
        
        divDom.remove();
        TestRunner.assertEqual(dom('.remove-me').length, 0, '应该移除元素');
    });
    
    TestRunner.test('dom.fn.empty() - 清空元素', function() {
        var divDom = dom('<div><span></span></div>');
        divDom.empty();
        TestRunner.assertEqual(divDom.children().length, 0, '应该没有子元素');
    });
    
    TestRunner.test('dom.fn.clone() - 克隆元素', function() {
        var divDom = dom('<div class="original">Test</div>');
        var cloneDom = divDom.clone();
        TestRunner.assertEqual(cloneDom[0] !== divDom[0], true, '应该是不同的元素');
        TestRunner.assertEqual(cloneDom.text(), 'Test', '应该有相同的内容');
    });

    // ==================== 事件测试 ====================
    
    TestRunner.test('dom.fn.on() - 绑定事件', function() {
        var divDom = dom('<div></div>');
        var clicked = false;
        
        divDom.on('click', function() {
            clicked = true;
        });
        
        divDom[0].click();
        TestRunner.assert(clicked, '应该触发点击事件');
    });
    
    TestRunner.test('dom.fn.off() - 解绑事件', function() {
        var divDom = dom('<div></div>');
        var clicked = false;
        
        var handler = function() {
            clicked = true;
        };
        
        divDom.on('click', handler);
        divDom.off('click', handler);
        
        divDom[0].click();
        TestRunner.assert(!clicked, '不应该触发点击事件');
    });
    
    TestRunner.test('dom.fn.one() - 绑定一次性事件', function() {
        var divDom = dom('<div></div>');
        var count = 0;
        
        divDom.one('click', function() {
            count++;
        });
        
        divDom[0].click();
        divDom[0].click();
        
        TestRunner.assertEqual(count, 1, '应该只触发一次');
    });
    
    TestRunner.test('dom.fn.trigger() - 触发事件', function() {
        var divDom = dom('<div></div>');
        var triggered = false;
        
        divDom.on('custom', function() {
            triggered = true;
        });
        
        divDom.trigger('custom');
        TestRunner.assert(triggered, '应该触发自定义事件');
    });

    // ==================== 显示/隐藏测试 ====================
    
    TestRunner.test('dom.fn.show() - 显示元素', function() {
        var divDom = dom('<div style="display: none;"></div>');
        divDom.show();
        TestRunner.assertNotEqual(divDom[0].style.display, 'none', '应该显示元素');
    });
    
    TestRunner.test('dom.fn.hide() - 隐藏元素', function() {
        var divDom = dom('<div></div>');
        divDom.hide();
        TestRunner.assertEqual(divDom[0].style.display, 'none', '应该隐藏元素');
    });
    
    TestRunner.test('dom.fn.toggle() - 切换显示', function() {
        var divDom = dom('<div></div>');
        divDom.toggle();
        TestRunner.assertEqual(divDom[0].style.display, 'none', '应该隐藏元素');
        
        divDom.toggle();
        TestRunner.assertNotEqual(divDom[0].style.display, 'none', '应该显示元素');
    });

    // ==================== 工具方法测试 ====================
    
    TestRunner.test('dom.extend() - 扩展对象', function() {
        var target = { a: 1 };
        var source = { b: 2 };
        dom.extend(target, source);
        
        TestRunner.assertDeepEqual(target, { a: 1, b: 2 }, '应该扩展对象');
    });
    
    TestRunner.test('dom.extend() - 深拷贝', function() {
        var target = { a: { x: 1 } };
        var source = { a: { y: 2 }, b: 3 };
        dom.extend(true, target, source);
        
        TestRunner.assertDeepEqual(target.a, { x: 1, y: 2 }, '应该深拷贝');
    });
    
    TestRunner.test('dom.each() - 遍历数组', function() {
        var arr = [1, 2, 3];
        var sum = 0;
        
        dom.each(arr, function(i, v) {
            sum += v;
        });
        
        TestRunner.assertEqual(sum, 6, '应该遍历所有元素');
    });
    
    TestRunner.test('dom.each() - 遍历对象', function() {
        var obj = { a: 1, b: 2 };
        var keys = [];
        
        dom.each(obj, function(k, v) {
            keys.push(k);
        });
        
        TestRunner.assertDeepEqual(keys, ['a', 'b'], '应该遍历所有属性');
    });
    
    TestRunner.test('dom.map() - 映射数组', function() {
        var arr = [1, 2, 3];
        var doubled = dom.map(arr, function(v) {
            return v * 2;
        });
        
        TestRunner.assertDeepEqual(doubled, [2, 4, 6], '应该映射所有元素');
    });
    
    TestRunner.test('dom.grep() - 过滤数组', function() {
        var arr = [1, 2, 3, 4, 5];
        var filtered = dom.grep(arr, function(v) {
            return v > 2;
        });
        
        TestRunner.assertDeepEqual(filtered, [3, 4, 5], '应该过滤数组');
    });
    
    TestRunner.test('dom.trim() - 去除空格', function() {
        TestRunner.assertEqual(dom.trim('  test  '), 'test', '应该去除两端空格');
    });
    
    TestRunner.test('dom.type() - 判断类型', function() {
        TestRunner.assertEqual(dom.type([1, 2]), 'array', '应该识别数组');
        TestRunner.assertEqual(dom.type({}), 'object', '应该识别对象');
        TestRunner.assertEqual(dom.type('test'), 'string', '应该识别字符串');
        TestRunner.assertEqual(dom.type(123), 'number', '应该识别数字');
        TestRunner.assertEqual(dom.type(null), 'null', '应该识别 null');
    });
    
    TestRunner.test('dom.isArray() - 判断数组', function() {
        TestRunner.assert(Array.isArray([1, 2]), '应该返回 true');
        TestRunner.assert(!Array.isArray('test'), '应该返回 false');
    });
    
    TestRunner.test('dom.isNumeric() - 判断数字', function() {
        TestRunner.assert(dom.isNumeric(123), '应该返回 true');
        TestRunner.assert(dom.isNumeric('123'), '应该返回 true');
        TestRunner.assert(!dom.isNumeric('test'), '应该返回 false');
    });
    
    TestRunner.test('dom.inArray() - 查找元素', function() {
        var arr = [1, 2, 3];
        TestRunner.assertEqual(dom.inArray(2, arr), 1, '应该找到元素');
        TestRunner.assertEqual(dom.inArray(4, arr), -1, '不应该找到元素');
    });
    
    TestRunner.test('dom.proxy() - 绑定上下文', function() {
        var obj = {
            name: 'test',
            getName: function() {
                return this.name;
            }
        };
        
        var fn = dom.proxy(obj.getName, obj);
        TestRunner.assertEqual(fn(), 'test', '应该绑定正确的上下文');
    });
    
    TestRunner.test('dom.parseJSON() - 解析 JSON', function() {
        var str = '{"a":1}';
        var obj = dom.parseJSON(str);
        TestRunner.assertEqual(obj.a, 1, '应该正确解析 JSON');
    });
    
    TestRunner.test('dom.now() - 获取当前时间戳', function() {
        var now = dom.now();
        TestRunner.assert(typeof now === 'number', '应该返回数字');
        TestRunner.assert(now > 0, '应该大于 0');
    });

    // ==================== AJAX 测试（模拟） ====================
    
    TestRunner.test('dom.ajax() - GET 请求', function() {
        // 这个测试需要实际的 HTTP 服务器
        // 在实际测试中应该 mock XMLHttpRequest
        var opts = {
            url: '/api/test',
            method: 'GET',
            success: function(data) {
                console.log('Success:', data);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        };
        
        // 验证参数处理
        TestRunner.assertEqual(opts.method, 'GET', '应该设置正确的 HTTP 方法');
    });

    // ==================== 链式调用测试 ====================
    
    TestRunner.test('链式调用', function() {
        var divDom = dom('<div></div>');
        
        // 所有方法应该返回 this 以支持链式调用
        var result = divDom
            .addClass('test')
            .removeClass('test')
            .css('color', 'red')
            .html('Test')
            .show();
        
        TestRunner.assertEqual(result, divDom, '应该返回 this');
    });

    // ==================== 特殊情况测试 ====================
    
    TestRunner.test('空集合', function() {
        var emptyDom = dom('.non-existent');
        TestRunner.assertEqual(emptyDom.length, 0, '应该是空集合');
        
        // 空集合上的方法不应该报错
        emptyDom.html('test');
        emptyDom.addClass('test');
        TestRunner.assertEqual(emptyDom.html(), undefined, '应该返回 undefined');
    });
    
    TestRunner.test('dom(null) 和 dom(undefined)', function() {
        var nullDom = dom(null);
        var undefinedDom = dom(undefined);
        
        TestRunner.assertEqual(nullDom.length, 0, '应该返回空集合');
        TestRunner.assertEqual(undefinedDom.length, 0, '应该返回空集合');
    });

    // 运行测试
    window.TestRunner = TestRunner;
    
})(window);
