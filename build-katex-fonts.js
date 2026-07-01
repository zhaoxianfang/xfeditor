/**
 * KaTeX 字体 Base64 嵌入脚本
 * 将 lib/katex/fonts 中的 .woff2 字体文件转为 base64 data URI
 * 供 getHTML() 接口使用，实现离线环境下的 KaTeX 公式渲染
 */

var fs = require('fs');
var path = require('path');

var fontsDir = path.join(__dirname, 'lib/katex/fonts');

// KaTeX 字体映射表：字体家族 -> 文件名模式
var fontMap = {
    'KaTeX_AMS': [
        { weight: 400, style: 'normal',  file: 'KaTeX_AMS-Regular' }
    ],
    'KaTeX_Caligraphic': [
        { weight: 700, style: 'normal',  file: 'KaTeX_Caligraphic-Bold' },
        { weight: 400, style: 'normal',  file: 'KaTeX_Caligraphic-Regular' }
    ],
    'KaTeX_Fraktur': [
        { weight: 700, style: 'normal',  file: 'KaTeX_Fraktur-Bold' },
        { weight: 400, style: 'normal',  file: 'KaTeX_Fraktur-Regular' }
    ],
    'KaTeX_Main': [
        { weight: 700, style: 'normal',  file: 'KaTeX_Main-Bold' },
        { weight: 700, style: 'italic',  file: 'KaTeX_Main-BoldItalic' },
        { weight: 400, style: 'italic',  file: 'KaTeX_Main-Italic' },
        { weight: 400, style: 'normal',  file: 'KaTeX_Main-Regular' }
    ],
    'KaTeX_Math': [
        { weight: 700, style: 'italic',  file: 'KaTeX_Math-BoldItalic' },
        { weight: 400, style: 'italic',  file: 'KaTeX_Math-Italic' }
    ],
    'KaTeX_SansSerif': [
        { weight: 700, style: 'normal',  file: 'KaTeX_SansSerif-Bold' },
        { weight: 400, style: 'italic',  file: 'KaTeX_SansSerif-Italic' },
        { weight: 400, style: 'normal',  file: 'KaTeX_SansSerif-Regular' }
    ],
    'KaTeX_Script': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Script-Regular' }
    ],
    'KaTeX_Size1': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Size1-Regular' }
    ],
    'KaTeX_Size2': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Size2-Regular' }
    ],
    'KaTeX_Size3': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Size3-Regular' }
    ],
    'KaTeX_Size4': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Size4-Regular' }
    ],
    'KaTeX_Typewriter': [
        { weight: 400, style: 'normal',  file: 'KaTeX_Typewriter-Regular' }
    ]
};

function encodeFontBase64(filePath) {
    if (!fs.existsSync(filePath)) {
        // 尝试 .woff2 扩展名
        if (filePath.endsWith('.woff2')) {
            var altPath = filePath.replace(/\.woff2$/, '.woff');
            if (fs.existsSync(altPath)) return encodeFontBase64(altPath);
        }
        console.warn('  WARN: Font not found: ' + filePath);
        return null;
    }
    var buf = fs.readFileSync(filePath);
    var ext = path.extname(filePath).toLowerCase();
    var mime = ext === '.woff2' ? 'font/woff2' : (ext === '.woff' ? 'font/woff' : 'font/truetype');
    return 'data:' + mime + ';base64,' + buf.toString('base64');
}

console.log('KaTeX Font Base64 Encoder');
console.log('========================\n');

var totalFonts = 0;
var fontFaces = [];

for (var family in fontMap) {
    var variants = fontMap[family];
    for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        // 优先使用 .woff2（体积最小），回退到 .woff
        var woff2Path = path.join(fontsDir, v.file + '.woff2');
        var dataUri = encodeFontBase64(woff2Path);
        if (dataUri) {
            var fontFace = '@font-face{font-family:' + family + ';font-style:' + v.style + ';font-weight:' + v.weight + ';src:url(' + dataUri + ')}';
            fontFaces.push(fontFace);
            totalFonts++;
            console.log('  OK ' + v.file + '.woff2 (' + (dataUri.length / 1024).toFixed(1) + ' KB)');
        }
    }
}

var output = fontFaces.join('');

console.log('\nTotal: ' + totalFonts + ' fonts encoded');
console.log('Output size: ' + (output.length / 1024).toFixed(1) + ' KB');

// 输出到临时文件
var outPath = path.join(__dirname, '.katex-fonts-base64.tmp');
fs.writeFileSync(outPath, output, 'utf8');
console.log('\nWritten to: ' + outPath);
console.log('\nDone! Now use replace_in_file to update the source code.');
