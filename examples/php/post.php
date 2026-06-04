<?php

/**
 * Editor.md 表单提交接收页（PHP 8 版本）
 *
 * ## 功能说明
 *
 * 接收编辑器所在表单的 POST 请求，展示提交的 Markdown 内容和 HTML 内容。
 *
 * ## 请求参数
 *
 * ### POST 参数：
 * | 参数名                     | 类型   | 必填 | 说明                                                    |
 * |----------------------------|--------|------|---------------------------------------------------------|
 * | submit                     | string | 否   | 表单提交标识，存在即表示表单已提交                          |
 * | test-editormd-markdown-doc | string | 否   | 编辑器的 Markdown 源码。textarea name 由编辑器的 name 属性决定 |
 * | test-editormd-html-code    | string | 否   | 编辑器生成的 HTML 代码（需启用 saveHTMLToTextarea 配置）     |
 *
 * ## 响应格式
 *
 * HTML 页面，展示提交的 Markdown 和 HTML 内容（经过 HTML 实体转义）。
 *
 * @package   Editor.md
 * @version   2.0.0
 */

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');

?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>提交内容展示 - Editor.md</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
            background: #f8f9fa;
        }
        h1 {
            color: #1a1a2e;
            border-bottom: 2px solid #e94560;
            padding-bottom: 10px;
        }
        .section {
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .section h2 {
            margin-top: 0;
            color: #e94560;
        }
        pre {
            background: #1e1e2e;
            color: #cdd6f4;
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .badge {
            display: inline-block;
            background: #e94560;
            color: #fff;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 12px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <h1>Editor.md 提交内容展示</h1>

<?php

// 检查是否有表单提交
if (!isset($_POST['submit'])) {
    echo '<div class="section"><p>请通过编辑器所在表单提交内容。</p></div>';
    echo '</body></html>';
    exit;
}

// Markdown 源码
$markdownDoc = isset($_POST['test-editormd-markdown-doc'])
    ? (string)$_POST['test-editormd-markdown-doc']
    : '';

if ($markdownDoc !== '') {
    $markdownLen = mb_strlen($markdownDoc);
    echo '<div class="section">';
    echo '<h2>Markdown 源码<span class="badge">' . $markdownLen . ' 字符</span></h2>';
    echo '<pre>' . htmlspecialchars($markdownDoc, ENT_QUOTES, 'UTF-8') . '</pre>';
    echo '</div>';
} else {
    echo '<div class="section"><p>未收到 Markdown 内容。（textarea name 应与编辑器 name 配置一致）</p></div>';
}

// HTML 代码
$htmlCode = isset($_POST['test-editormd-html-code'])
    ? (string)$_POST['test-editormd-html-code']
    : '';

if ($htmlCode !== '') {
    $htmlLen = mb_strlen($htmlCode);
    echo '<div class="section">';
    echo '<h2>HTML 代码<span class="badge">' . $htmlLen . ' 字符</span></h2>';
    echo '<pre>' . htmlspecialchars($htmlCode, ENT_QUOTES, 'UTF-8') . '</pre>';
    echo '</div>';
}

?>

</body>
</html>
