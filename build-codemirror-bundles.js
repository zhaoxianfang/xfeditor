/**
 * 重建 CodeMirror addons.min.js 和 modes.min.js
 * 
 * 修复内容：
 * 1. 排除 runmode/runmode.node.js（使用了裸 exports，在浏览器中报错）
 * 2. 包含 mode/simple.js（提供 defineSimpleMode 函数，dockerfile 等模式依赖它）
 * 3. 包含 cypher 模式（meta.js 中有注册但模式文件未包含）
 */

const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const addonBasePath = 'lib/codemirror/addon';
const modeBasePath = 'lib/codemirror/mode';
const distPath = 'lib/codemirror';

// 要合并的 addon 文件列表（与 Gulpfile.js 一致，增加 mode/simple）
const addonFiles = [
    'edit/trailingspace',
    'dialog/dialog',
    'search/searchcursor',
    'search/search',
    'scroll/annotatescrollbar',
    'search/matchesonscrollbar',
    'display/placeholder',
    'edit/closetag',
    'fold/foldcode',
    'fold/foldgutter',
    'fold/indent-fold',
    'fold/brace-fold',
    'fold/xml-fold',
    'fold/markdown-fold',
    'fold/comment-fold',
    'mode/overlay',
    'mode/simple',            // 新增：提供 defineSimpleMode
    'selection/active-line',
    'edit/closebrackets',
    'display/fullscreen',
    'search/match-highlighter'
];

// 要合并的 mode 文件列表（与 Gulpfile.js 一致）
const modeNames = [
    'css',
    'sass',
    'shell',
    'sql',
    'clike',
    'php',
    'xml',
    'markdown',
    'javascript',
    'htmlmixed',
    'gfm',
    'http',
    'go',
    'dart',
    'coffeescript',
    'nginx',
    'python',
    'perl',
    'lua',
    'r',
    'ruby',
    'rst',
    'smartymixed',
    'vb',
    'vbscript',
    'velocity',
    'xquery',
    'yaml',
    'erlang',
    'jade',
    'cypher'                 // 新增：cypher 模式
];

// 表头注释
const headerComment = [
    '/*',
    ' * xfEditor',
    ' *',
    ' * @file        <%= fileName %>',
    ' * @description CodeMirror <%= type %> bundle for xfEditor',
    ' * @license     MIT License',
    ' * @updateTime  ' + new Date().toISOString().split('T')[0],
    ' */',
    ''
].join('\n');

// ========== 构建 addons.min.js ==========
console.log('构建 addons.min.js...');
let addonsContent = '';
let addonsFound = 0;
let addonsMissing = 0;

for (const addonFile of addonFiles) {
    const filePath = path.join(addonBasePath, addonFile + '.js');
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        // 确保每个文件末尾有换行和分号分隔
        addonsContent += content.replace(/\s*$/, '\n;\n');
        addonsFound++;
        console.log('  ✓ ' + addonFile + '.js');
    } else {
        console.log('  ✗ 文件不存在: ' + filePath);
        addonsMissing++;
    }
}

// 合并后写入未压缩版
const unminifiedAddonsPath = path.join(distPath, 'addons.js');
fs.writeFileSync(unminifiedAddonsPath, addonsContent, 'utf8');

// 写入压缩版（稍后用 terser 压缩）
const minAddonsPath = path.join(distPath, 'addons.min.js');
fs.writeFileSync(minAddonsPath, addonsContent, 'utf8');

console.log(`addons: 找到 ${addonsFound} 个文件, 缺失 ${addonsMissing} 个`);
console.log('输出: ' + minAddonsPath);

// ========== 构建 modes.min.js ==========
console.log('\n构建 modes.min.js...');
let modesContent = '';
let modesFound = 0;
let modesMissing = 0;

// 先添加 meta.js
const metaPath = path.join(modeBasePath, 'meta.js');
if (fs.existsSync(metaPath)) {
    modesContent += fs.readFileSync(metaPath, 'utf8').replace(/\s*$/, '\n;\n');
    console.log('  ✓ meta.js');
}

for (const modeName of modeNames) {
    const filePath = path.join(modeBasePath, modeName, modeName + '.js');
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        modesContent += content.replace(/\s*$/, '\n;\n');
        modesFound++;
        console.log('  ✓ ' + modeName + '/' + modeName + '.js');
    } else {
        console.log('  ✗ 文件不存在: ' + filePath);
        modesMissing++;
    }
}

// 合并后写入
const unminifiedModesPath = path.join(distPath, 'modes.js');
fs.writeFileSync(unminifiedModesPath, modesContent, 'utf8');
const minModesPath = path.join(distPath, 'modes.min.js');
fs.writeFileSync(minModesPath, modesContent, 'utf8');

console.log(`modes: 找到 ${modesFound} 个文件, 缺失 ${modesMissing} 个`);
console.log('输出: ' + minModesPath);

console.log('\n构建完成！请运行 terser 进行压缩。');
