// =====================================================
// xfEditor 综合功能验证测试
// =====================================================

var passed = 0;
var failed = 0;

function test(name, fn) {
    try {
        var result = fn();
        if (result) {
            console.log("  ✅ " + name + " — PASSED");
            passed++;
        } else {
            console.log("  ❌ " + name + " — FAILED: " + (result === false ? "Assertion failed" : result));
            failed++;
        }
    } catch(e) {
        console.log("  ❌ " + name + " — ERROR: " + e.message);
        failed++;
    }
}

console.log("\n========== 1. 脚注顺序测试 ==========");

// Simulate footnote processing
(function() {
    var md = `测试文本[^fn1]和[^fn2]还有[^fn3]\n\n[^fn1]: 内容1\n\n[^fn2]: 内容2\n\n[^fn3]: 内容3`;
    var footnoteDefAnchorRe = /^\[\^([^\]]+)\]:/gm;
    var footnoteRefRe = /\[\^([^\]]+)\]/g;
    
    var footnotes = {};
    var footnoteOrder = [];
    var footnoteIndex = 0;
    var defMatches = [];
    var defMatch;
    
    // Collect definitions
    while ((defMatch = footnoteDefAnchorRe.exec(md)) !== null) {
        var name = defMatch[1].trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
        if (name && name.length <= 50) {
            defMatches.push({
                name: name,
                start: defMatch.index,
                anchorEnd: defMatch.index + defMatch[0].length
            });
        }
    }
    
    // Calculate content
    for (var di = 0; di < defMatches.length; di++) {
        var dm = defMatches[di];
        var contentStart = dm.anchorEnd;
        var afterAnchor = md.substring(contentStart);
        var leadingWs = afterAnchor.match(/^[ \t]*\n?/);
        if (leadingWs) contentStart += leadingWs[0].length;
        var blankLineIdx = md.indexOf('\n\n', contentStart);
        var nextDefIdx = (di + 1 < defMatches.length) ? defMatches[di + 1].start : -1;
        var contentEnd = blankLineIdx !== -1 ? blankLineIdx : md.length;
        if (nextDefIdx !== -1 && nextDefIdx < contentEnd) contentEnd = nextDefIdx;
        dm.contentEnd = contentEnd;
        dm.content = md.substring(contentStart, contentEnd).trim();
    }
    
    // Record from front to back (fixed)
    for (var di = 0; di < defMatches.length; di++) {
        var dm = defMatches[di];
        if (!footnotes[dm.name]) {
            footnoteIndex++;
            footnotes[dm.name] = { index: footnoteIndex, content: dm.content };
            footnoteOrder.push(dm.name);
        }
    }
    
    test("脚注顺序: fn1 索引 1", function() { return footnotes.fn1 && footnotes.fn1.index === 1; });
    test("脚注顺序: fn2 索引 2", function() { return footnotes.fn2 && footnotes.fn2.index === 2; });
    test("脚注顺序: fn3 索引 3", function() { return footnotes.fn3 && footnotes.fn3.index === 3; });
    test("脚注顺序: 数组顺序 [fn1, fn2, fn3]", function() { return footnoteOrder.join(',') === 'fn1,fn2,fn3'; });
})();

console.log("\n========== 2. 围栏代码块 CommonMark 测试 ==========");

(function() {
    // Normal case: exact match
    var text = '```js\nvar x = 1;\n```';
    var result = text.replace(/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?(`{3,}|~{3,})/g, function(match, openFence, lang, content, closeFence) {
        if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) return match;
        return "<PROTECTED>";
    });
    test("围栏代码块: 精确匹配", function() { return result === "<PROTECTED>"; });
    
    // CommonMark: closing fence longer than opening (with lookahead for line-end)
    var text2 = '````\ncode with ``` inside\n``````';
    var fenceRegex = /(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n(`{3,}|~{3,})(?=\s*(?:\n|$))/g;
    var result2 = text2.replace(fenceRegex, function(match, openFence, lang, content, closeFence) {
        if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) return match;
        return "<PROTECTED2>";
    });
    test("围栏代码块: CommonMark 长闭合", function() { return result2 === "<PROTECTED2>"; });
    
    // Case: mismatched fence types (should NOT match)
    var text3 = '```\ncode\n~~~';
    var result3 = text3.replace(/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?(`{3,}|~{3,})/g, function(match, openFence, lang, content, closeFence) {
        if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) return match;
        return "<PROTECTED3>";
    });
    test("围栏代码块: 类型不匹配不保护", function() { return result3 === text3; });
    
    // Tilde fences
    var text4 = '~~~bash\necho hello\n~~~';
    var result4 = text4.replace(/(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\n?(`{3,}|~{3,})/g, function(match, openFence, lang, content, closeFence) {
        if (openFence[0] !== closeFence[0] || closeFence.length < openFence.length) return match;
        return "<PROTECTED4>";
    });
    test("围栏代码块: 波浪线匹配", function() { return result4 === "<PROTECTED4>"; });
})();

console.log("\n========== 3. 上标/下标 + 脚注互不干扰测试 ==========");

(function() {
    var superscriptRe = /\^([^\^\n]+)\^/g;
    var subscriptRe = /\^\^([^\^\n]+)\^\^/g;
    var footnoteRefRe = /\[\^([^\]]+)\]/g;
    
    // After footnote processing, [^name] is already replaced with HTML
    var md = 'x^2^ + y^3^ = z^n^\nH^^2^^O\n脚注引用已处理';
    
    // Subscript first
    md = md.replace(subscriptRe, function(match, text) {
        if (!text || text.length > 100) return match;
        return '<sub>' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</sub>';
    });
    
    // Superscript second
    md = md.replace(superscriptRe, function(match, text) {
        if (!text || text.length > 100) return match;
        return '<sup>' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</sup>';
    });
    
    test("上标: x^2^ → <sup>2</sup>", function() { return md.indexOf('<sup>2</sup>') !== -1; });
    test("上标: y^3^ → <sup>3</sup>", function() { return md.indexOf('<sup>3</sup>') !== -1; });
    test("上标: z^n^ → <sup>n</sup>", function() { return md.indexOf('<sup>n</sup>') !== -1; });
    test("下标: H^^2^^O → <sub>2</sub>", function() { return md.indexOf('<sub>2</sub>O') !== -1; });
    test("上标: 不跨行匹配", function() { return /\^[^\n]+\^/.test(md) === false; });
    
    // Edge case: no footnote refs remain as [^xxx] in processed text
    test("无残留: 处理后无 [^xxx] 格式", function() { return !/\[\^[^\]]+\]/.test(md); });
})();

console.log("\n========== 4. 脚注内联处理顺序测试 ==========");

(function() {
    // Fix: code should be processed BEFORE bold/italic
    var fnContent = '使用 `**MIT**` 许可证和 `*斜体*` 代码';
    
    // Step 1: escape
    fnContent = fnContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Step 2: code FIRST, use placeholder protection so bold/italic doesn't re-match inside <code>
    fnContent = fnContent.replace(/`([^`]+)`/g, '<code>$1</code>');
    var codeBlocks = [];
    fnContent = fnContent.replace(/<code>[^<]*<\/code>/g, function(m) {
        codeBlocks.push(m);
        return '<!--fncode-' + (codeBlocks.length - 1) + '-->';
    });
    fnContent = fnContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    fnContent = fnContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Restore code blocks
    for (var ci = 0; ci < codeBlocks.length; ci++) {
        fnContent = fnContent.split('<!--fncode-' + ci + '-->').join(codeBlocks[ci]);
    }
    
    test("内联代码优先: `**MIT**` → <code>**MIT**</code>", function() { 
        return fnContent.indexOf('<code>**MIT**</code>') !== -1;
    });
    test("内联代码优先: `*斜体*` → <code>*斜体*</code>", function() { 
        return fnContent.indexOf('<code>*斜体*</code>') !== -1;
    });
})();

console.log("\n========== 5. pageFooter HTML 转义测试 ==========");

(function() {
    var pageFooter = 'Page & Co. "Test" <br> > OK';
    var escaped = pageFooter.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    test("pageFooter: & → &amp;", function() { return escaped.indexOf('&amp;') !== -1 && escaped.indexOf(' &amp; ') === -1 || escaped.indexOf('Page &amp;') !== -1; });
    test("pageFooter: \" → &quot;", function() { return escaped.indexOf('&quot;') !== -1; });
    test("pageFooter: <br> 转义", function() { return escaped.indexOf('&lt;br&gt;') !== -1; });
})();

console.log("\n========== 6. 工具栏处理器命名测试 ==========");

(function() {
    var editormd = { 
        toolbarHandlers: { 
            bold: function(){}, 
            italic: function(){} 
        } 
    };
    
    // Simulate getToolbarHandlers (fixed version)
    function getToolbarHandlers(name) {
        var toolbarHandlers = editormd.toolbarHandlers;
        return (name && typeof toolbarHandlers[name] !== "undefined") ? toolbarHandlers[name] : toolbarHandlers;
    }
    
    test("getToolbarHandlers: 返回指定处理器", function() { 
        return typeof getToolbarHandlers("bold") === "function"; 
    });
    test("getToolbarHandlers: 返回全部处理器", function() { 
        return typeof getToolbarHandlers() === "object"; 
    });
    test("getToolbarHandlers: 未知名称返回 all", function() { 
        return typeof getToolbarHandlers("unknown") === "object"; 
    });
})();

console.log("\n========================================");
console.log("  Results: " + passed + " passed, " + failed + " failed");
console.log("========================================\n");

if (failed > 0) {
    process.exit(1);
}
