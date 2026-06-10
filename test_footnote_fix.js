// Test footnote order and placeholder restoration
var fs = require('fs');

// Load editormd.js
var code = fs.readFileSync('editormd.js', 'utf8');

// Simulate the footnote processing logic
var footnoteDefAnchorRe = /^\[\^([^\]]+)\]:/gm;
var footnoteRefRe = /\[\^([^\]]+)\]/g;

var md = `## 脚注测试

这里有[^fn1]、[^fn2]、[^fn3]。

[^fn1]: 第一个脚注，包含 \`行内代码\`。
[^fn2]: 第二个脚注，包含 **粗体**。
[^fn3]: 第三个脚注。`;

console.log('=== INPUT ===');
console.log(md);

// Simulate protectCodeBlocks (simplified - just replace inline code)
var codePlaceholders = [];
var cid = 0;
md = md.replace(/`([^`\n]+)`/g, function(match, content) {
    var id = "editormd-cb-" + (++cid);
    codePlaceholders.push({ id: id, html: match });
    return "<!--" + id + "-->";
});

console.log('\n=== AFTER CODE PROTECTION ===');
console.log('Placeholders:', codePlaceholders.map(function(p) { return p.id; }));
console.log('MD:', md);

// Simulate footnote processing
var fnDefRegex = footnoteDefAnchorRe;
fnDefRegex.lastIndex = 0;
var defMatches = [];
var defMatch;
while ((defMatch = fnDefRegex.exec(md)) !== null) {
    var name = defMatch[1].trim();
    defMatches.push({ name: name, start: defMatch.index, anchorEnd: defMatch.index + defMatch[0].length });
}

var footnotes = {};
var footnoteOrder = [];
var fnIdx = 0;

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
    if (contentEnd > md.length) contentEnd = md.length;
    if (contentEnd < contentStart) contentEnd = contentStart;
    dm.contentEnd = contentEnd;
    dm.content = md.substring(contentStart, contentEnd).trim();
}

// Use PUSH instead of UNSHIFT
for (var di = defMatches.length - 1; di >= 0; di--) {
    var dm = defMatches[di];
    if (!footnotes[dm.name]) {
        fnIdx++;
        footnotes[dm.name] = { index: fnIdx, content: dm.content, name: dm.name };
        footnoteOrder.push(dm.name); // PUSH to maintain order
    }
    md = md.substring(0, dm.start) + md.substring(dm.contentEnd);
}

console.log('\n=== FOOTNOTE ORDER ===');
console.log('Order:', footnoteOrder);
console.log('Expected: [fn1, fn2, fn3]');

// Restore placeholders in footnote content
function restoreCodeBlocks(text, placeholders) {
    for (var i = 0; i < placeholders.length; i++) {
        var cp = placeholders[i];
        text = text.split("<!--" + cp.id + "-->").join(cp.html);
    }
    return text;
}

console.log('\n=== FOOTNOTE CONTENT (with placeholder restoration) ===');
for (var name in footnotes) {
    var fn = footnotes[name];
    var restoredContent = restoreCodeBlocks(fn.content, codePlaceholders);
    console.log('[' + name + '] (index ' + fn.index + '): ' + restoredContent);
    if (restoredContent.indexOf('<!--editormd-cb-') !== -1) {
        console.log('  ERROR: Placeholder not restored!');
    } else if (restoredContent.indexOf('`') !== -1) {
        console.log('  OK: Inline code restored');
    }
}

// Replace footnote refs
md = md.replace(footnoteRefRe, function(match, name) {
    if (!footnotes[name]) return match;
    return '<sup>[' + footnotes[name].index + ']</sup>';
});

console.log('\n=== AFTER FOOTNOTE REPLACEMENT ===');
console.log(md);

console.log('\n=== VERIFICATION ===');
console.log('✓ Footnote order correct:', JSON.stringify(footnoteOrder) === '["fn1","fn2","fn3"]');
console.log('✓ No placeholders in content:', Object.values(footnotes).every(function(fn) {
    return restoreCodeBlocks(fn.content, codePlaceholders).indexOf('<!--editormd-cb-') === -1;
}));
