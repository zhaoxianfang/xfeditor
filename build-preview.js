/**
 * xfEditor 预览页面 JS 打包脚本
 * 将预览所需的 JS 文件（不含 jQuery）合并为单个 xf_editor.preview.min.js
 * jQuery 需要由使用者单独引入（<script src="jquery.min.js"></script>）
 * （所有源文件已经是 .min.js，直接拼接即可）
 */

var fs = require('fs');
var path = require('path');
var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// ★ 无 jQuery 依赖：xf_editor.min.js 已内置 micro-DOM 与 flowChart/sequenceDiagram 插件
var previewFiles = [
    { path: 'lib/marked.min.js',             required: true },
    { path: 'lib/prettify.min.js',           required: false },
    { path: 'lib/echarts.min.js',            required: false },
    // ★ xf_editor.min.js 已内联 flowchart bundle（flowchart v1.18 绘制逻辑），
    //   但 Raphael 矢量库与 underscore（_.extend 工具）并未内联，需单独引入；
    //   sequence-diagram.min.js 依赖全局 Raphael（new Raphael()）与 underscore（_.extend），
    //   必须放在 raphael/underscore/xf_editor 三者之后，确保三者均已提供全局 Raphael 与 _。
    { path: 'lib/raphael.min.js',           required: true },
    { path: 'lib/underscore.min.js',        required: true },
    { path: 'xf_editor.min.js',             required: true },
    { path: 'lib/sequence-diagram.min.js',  required: false },
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

var header = '/** xfEditor Preview Bundle v' + pkg.version + ' | ' + new Date().toISOString().slice(0,10) + ' | KaTeX fonts embedded (offline) */\n';
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
