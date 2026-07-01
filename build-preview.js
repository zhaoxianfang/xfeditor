/**
 * xfEditor 预览页面 JS 打包脚本
 * 将预览所需的 JS 文件（不含 jQuery）合并为单个 xf_editor.preview.min.js
 * jQuery 需要由使用者单独引入（<script src="jquery.min.js"></script>）
 * （所有源文件已经是 .min.js，直接拼接即可）
 */

var fs = require('fs');
var path = require('path');

// ★ 不包含 jQuery，jQuery 由使用者单独引入
var previewFiles = [
    { path: 'lib/marked.min.js',             required: true },
    { path: 'lib/prettify.min.js',           required: false },
    { path: 'lib/raphael.min.js',            required: false },
    { path: 'lib/underscore.min.js',        required: false },
    { path: 'lib/sequence-diagram.min.js',  required: false },
    { path: 'lib/flowchart.min.js',          required: false },
    { path: 'lib/jquery.flowchart.min.js',  required: false },
    { path: 'lib/echarts.min.js',            required: false },
    { path: 'xf_editor.min.js',              required: true },
];

console.log('xfEditor Preview Bundle Builder');
console.log('==============================\n');

var totalSize = 0;
previewFiles.forEach(function(f) {
    var fullPath = path.join(__dirname, f.path);
    if (!fs.existsSync(fullPath)) {
        if (f.required) { console.error('ERROR: Missing ' + f.path); process.exit(1); }
        console.log('  SKIP (not found): ' + f.path);
        return;
    }
    var stat = fs.statSync(fullPath);
    totalSize += stat.size;
    console.log('  OK ' + f.path + ' (' + (stat.size / 1024).toFixed(1) + ' KB)');
});

var header = '/** xfEditor Preview Bundle v1.17.10 | ' + new Date().toISOString().slice(0,10) + ' | KaTeX fonts embedded (offline) */\n';
var bundle = header;
previewFiles.forEach(function(f) {
    var fullPath = path.join(__dirname, f.path);
    if (!fs.existsSync(fullPath)) return;
    bundle += fs.readFileSync(fullPath, 'utf8') + '\n';
});

var outputPath = path.join(__dirname, 'xf_editor.preview.min.js');
fs.writeFileSync(outputPath, bundle, 'utf8');
var outSize = fs.statSync(outputPath).size;
console.log('\nDONE: xf_editor.preview.min.js (' + (outSize / 1024).toFixed(1) + ' KB)');
console.log('Source total: ' + (totalSize / 1024).toFixed(1) + ' KB | Saved ' + previewFiles.length + ' HTTP requests');
