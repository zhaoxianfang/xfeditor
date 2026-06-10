<?php

/**
 * Editor.md 跨域上传接口（PHP 8 版本）
 *
 * ## 功能说明
 *
 * 支持跨域场景下的图片上传。上传完成后不直接返回 JSON，
 * 而是通过 302 重定向到指定的 callback 页面，由 callback 页面
 * 通过 window.parent 操作父窗口的 DOM 来填充上传结果。
 *
 * ## 请求参数
 *
 * ### URL 查询参数（GET）：
 * | 参数名    | 类型   | 必填 | 说明                                      |
 * |-----------|--------|------|-------------------------------------------|
 * | callback  | string | 是   | 回调页面的 URL（同域下的 HTML 页面）          |
 * | dialog_id | string | 是   | 编辑器中图片对话框的 DOM ID                  |
 *
 * ### 文件域（multipart/form-data）：
 * | 参数名              | 类型 | 必填 | 说明     |
 * |---------------------|------|------|----------|
 * | editormd-image-file | File | 是   | 图片文件  |
 *
 * ## 工作流程
 *
 * 1. 用户选择文件 → 上传到此接口
 * 2. 服务器保存文件
 * 3. 服务器 302 重定向到 `callback?success=1&url=...&message=...&dialog_id=...`
 * 4. callback 页面通过 `window.parent` 更新父窗口的图片 URL
 *
 * ## 回调页面参数
 *
 * 重定向到 callback 页面时会携带以下查询参数：
 * | 参数名    | 值                          | 说明                 |
 * |-----------|-----------------------------|----------------------|
 * | success   | 1 或 0                      | 上传是否成功          |
 * | message   | URL 编码的消息文本           | 成功或失败的提示信息  |
 * | url       | URL 编码的文件访问地址       | 仅成功时携带          |
 * | name      | URL 编码的文件名             | 仅成功时携带          |
 * | dialog_id | 原样传递                     | 图片对话框 DOM ID    |
 * | temp      | 时间戳                       | 防止浏览器缓存        |
 *
 * @package   Editor.md
 * @version   2.0.0
 */

declare(strict_types=1);

require_once __DIR__ . '/EditorMdUploader.php';

// ==================== 请求头 ====================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 仅允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: text/html; charset=utf-8');
    echo '<p>仅支持 POST 请求方式</p>';
    exit;
}

// ==================== 参数验证 ====================

$callbackUrl = isset($_GET['callback']) ? trim((string)$_GET['callback']) : '';
$dialogId    = isset($_GET['dialog_id']) ? trim((string)$_GET['dialog_id']) : '';

if ($callbackUrl === '') {
    http_response_code(400);
    header('Content-Type: text/html; charset=utf-8');
    echo '<p>缺少 callback 参数</p>';
    exit;
}

// ==================== 配置 ====================

$uploadsDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}
$savePath = realpath($uploadsDir) . DIRECTORY_SEPARATOR;

// 跨域上传：使用绝对路径（包含域名）
$scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$saveURL  = $scheme . '://' . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/') . '/../uploads/';

// 允许的图片格式
$formats = ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'];

// 文件域名称
$fileInputName = 'editormd-image-file';

// ==================== 构建重定向 URL ====================

// 拼接 dialog_id 和防缓存时间戳
$separator = (!str_contains($callbackUrl, '?')) ? '?' : '&';
$callbackUrl .= $separator . 'dialog_id=' . urlencode($dialogId) . '&temp=' . date('ymdHis');

// ==================== 创建上传器并执行上传 ====================

$uploader = new EditorMdUploader(
    savePath: $savePath,
    saveURL: $saveURL,
    formats: $formats,
    randomNameType: EditorMdUploader::RANDOM_DATE,
    randomLength: 'YmdHis',
    cover: true,
    maxSize: 1024 * 5,  // 5MB
);

// 配置重定向模式
$uploader->redirect    = true;
$uploader->redirectURL = $callbackUrl;

// 执行上传
$uploader->upload($fileInputName);
