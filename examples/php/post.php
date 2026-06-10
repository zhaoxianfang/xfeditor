<?php

/**
 * Editor.md 表单提交接收页（PHP 8 版本）
 *
 * ## 功能说明
 *
 * 接收编辑器所在表单的 POST 请求，展示提交的 Markdown 内容和 HTML 内容。
 * 支持安全的内容展示，自动统计字符数，并提供返回和下载功能。
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
 * HTML 页面，展示提交的 Markdown 和 HTML 内容（经过 HTML 实体转义保护）。
 *
 * @package   Editor.md
 * @version   2.0.0
 */

declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');

?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>提交内容展示 — Editor.md v1.10.0</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            max-width: 960px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
            background: #f0f2f5;
        }
        h1 {
            color: #1a1a2e;
            border-bottom: 3px solid #e94560;
            padding-bottom: 12px;
            margin-bottom: 24px;
            font-size: 22px;
        }
        .section {
            background: #fff;
            border-radius: 10px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .section h2 {
            margin: 0 0 16px 0;
            color: #e94560;
            font-size: 17px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        pre {
            background: #1e1e2e;
            color: #cdd6f4;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 14px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 600px;
            overflow-y: auto;
        }
        .badge {
            display: inline-block;
            background: #e94560;
            color: #fff;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-blue {
            background: #0969da;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .actions a, .actions button {
            padding: 8px 18px;
            border-radius: 6px;
            border: 1px solid #d0d7de;
            background: #fff;
            cursor: pointer;
            font-size: 13px;
            text-decoration: none;
            color: #333;
            transition: all 0.2s;
        }
        .actions a:hover, .actions button:hover {
            background: #f6f8fa;
            border-color: #0969da;
            color: #0969da;
        }
        .empty-hint {
            color: #8b949e;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <h1>📄 Editor.md v1.10.0 — 提交内容展示</h1>
    <div class="actions">
        <a href="javascript:history.back();">← 返回编辑器</a>
    </div>

<?php

// 检查是否有表单提交
if (!isset($_POST['submit'])) {
    echo '<div class="section"><p class="empty-hint">📭 请通过编辑器所在表单提交内容到此页面。</p></div>';
    echo '</body></html>';
    exit;
}

// Markdown 源码
$markdownDoc = isset($_POST['test-editormd-markdown-doc'])
    ? (string)$_POST['test-editormd-markdown-doc']
    : '';

if ($markdownDoc !== '') {
    $markdownLen = mb_strlen($markdownDoc);
    $markdownLineCount = substr_count($markdownDoc, "\n") + 1;

    echo '<div class="section">';
    echo '<h2>📝 Markdown 源码 <span class="badge badge-blue">' . $markdownLen . ' 字符 / ' . $markdownLineCount . ' 行</span></h2>';
    echo '<pre>' . htmlspecialchars($markdownDoc, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</pre>';
    echo '</div>';
} else {
    echo '<div class="section"><p class="empty-hint">⚠️ 未收到 Markdown 内容。（请确认 textarea name 与编辑器 name 配置一致）</p></div>';
}

// HTML 代码
$htmlCode = isset($_POST['test-editormd-html-code'])
    ? (string)$_POST['test-editormd-html-code']
    : '';

if ($htmlCode !== '') {
    $htmlLen = mb_strlen($htmlCode);

    echo '<div class="section">';
    echo '<h2>🌐 HTML 代码 <span class="badge badge-blue">' . $htmlLen . ' 字符</span></h2>';
    echo '<pre>' . htmlspecialchars($htmlCode, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</pre>';
    echo '</div>';
}

// 展示所有 POST 字段（调试用）
if (isset($_GET['debug'])) {
    $postKeys = array_diff_key($_POST, ['test-editormd-markdown-doc' => '', 'test-editormd-html-code' => '', 'submit' => '']);
    if (count($postKeys) > 0) {
        echo '<div class="section">';
        echo '<h2>🔍 其他 POST 参数</h2>';
        echo '<pre>' . htmlspecialchars(print_r($postKeys, true), ENT_QUOTES, 'UTF-8') . '</pre>';
        echo '</div>';
    }
}

?>

</body>
</html>
