<?php

/**
 * Editor.md 统一上传接口（PHP 8 版本）
 *
 * ## 功能说明
 *
 * 支持图片、附件（文件）、视频三种类型的文件上传。
 * 根据不同的 file input name 自动识别上传类型：
 *   - editormd-image-file → 图片上传
 *   - editormd-file-file  → 附件上传
 *   - editormd-video-file → 视频上传
 *
 * 也可通过 POST 参数 `upload_type` 明确指定：image / file / video
 *
 * ## 请求参数
 *
 * ### 文件域（multipart/form-data）：
 * | 参数名              | 类型   | 必填 | 说明                              |
 * |---------------------|--------|------|-----------------------------------|
 * | editormd-image-file | File   | 否   | 图片文件。当 upload_type=image 时有效   |
 * | editormd-file-file  | File   | 否   | 附件文件。当 upload_type=file 时有效    |
 * | editormd-video-file | File   | 否   | 视频文件。当 upload_type=video 时有效   |
 *
 * ### POST 参数（可选）：
 * | 参数名      | 类型   | 必填 | 说明                                              |
 * |-------------|--------|------|---------------------------------------------------|
 * | upload_type | string | 否   | 上传类型：image / file / video。不传则根据文件域自动识别 |
 * | max_size    | int    | 否   | 最大文件大小（KB），不传则使用默认值                   |
 *
 * ## 响应格式（JSON）
 *
 * ### 成功响应：
 * ```json
 * {
 *   "success": 1,
 *   "message": "上传成功！",
 *   "url": "/examples/uploads/20240604120000_12345.jpg",
 *   "data": {
 *     "file_name": "20240604120000_12345.jpg",
 *     "file_size": 204800,
 *     "file_ext": "jpg",
 *     "upload_type": "image"
 *   }
 * }
 * ```
 *
 * ### 失败响应：
 * ```json
 * {
 *   "success": 0,
 *   "message": "上传文件不能为空",
 *   "data": {
 *     "error_code": 4,
 *     "upload_type": "image"
 *   }
 * }
 * ```
 *
 * @package   Editor.md
 * @version   2.0.0
 */

declare(strict_types=1);

require_once __DIR__ . '/EditorMdUploader.php';

// ==================== 请求头 ====================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// 处理 OPTIONS 预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 仅允许 POST 请求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => 0,
        'message' => '仅支持 POST 请求方式，当前为 ' . $_SERVER['REQUEST_METHOD'],
        'data'    => ['allowed_method' => 'POST'],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ==================== 配置 ====================

// 项目根目录下的 uploads 文件夹
$uploadsDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}
$savePath = realpath($uploadsDir) . DIRECTORY_SEPARATOR;
// 相对于站点根目录的 URL 路径
$url      = rtrim(dirname($_SERVER['PHP_SELF']), '/') . '/';
$saveURL  = $url . '../uploads/';

// 各类文件允许的扩展名
$allowedFormats = [
    EditorMdUploader::TYPE_IMAGE => ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp', 'svg'],
    EditorMdUploader::TYPE_FILE  => [
        'zip', 'rar', '7z', 'tar', 'gz',           // 压缩包
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', // Office
        'pdf', 'txt', 'md', 'csv',                   // 文档
        'mp3', 'wav', 'ogg',                         // 音频
    ],
    EditorMdUploader::TYPE_VIDEO => ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
];

// 各类文件的默认大小限制（KB）
$maxSizeMap = [
    EditorMdUploader::TYPE_IMAGE => 1024 * 5,     // 图片最大 5MB
    EditorMdUploader::TYPE_FILE  => 1024 * 20,    // 附件最大 20MB
    EditorMdUploader::TYPE_VIDEO => 1024 * 50,    // 视频最大 50MB
];

// ==================== 识别上传类型与文件域名称 ====================

/**
 * file input name → 上传类型的映射
 */
$typeMap = [
    'editormd-image-file' => EditorMdUploader::TYPE_IMAGE,
    'editormd-file-file'  => EditorMdUploader::TYPE_FILE,
    'editormd-video-file' => EditorMdUploader::TYPE_VIDEO,
];

// 优先使用 POST 参数中的 upload_type
$uploadType = isset($_POST['upload_type'])
    ? trim((string)$_POST['upload_type'])
    : null;

// 如果未指定 upload_type，根据上传的文件域自动识别
if ($uploadType === null || $uploadType === '') {
    foreach ($typeMap as $fieldName => $type) {
        if (isset($_FILES[$fieldName]) && !empty($_FILES[$fieldName]['tmp_name'])) {
            $uploadType = $type;
            break;
        }
    }
}

// 如果仍然无法识别，遍历所有上传文件
if ($uploadType === null) {
    foreach ($_FILES as $fieldName => $fileInfo) {
        if (!empty($fileInfo['tmp_name'])) {
            // 根据字段名猜测类型
            if (str_contains($fieldName, 'image')) {
                $uploadType = EditorMdUploader::TYPE_IMAGE;
            } elseif (str_contains($fieldName, 'video')) {
                $uploadType = EditorMdUploader::TYPE_VIDEO;
            } elseif (str_contains($fieldName, 'file')) {
                $uploadType = EditorMdUploader::TYPE_FILE;
            } else {
                // 根据扩展名猜测
                $ext = strtolower(pathinfo((string)$fileInfo['name'], PATHINFO_EXTENSION));
                if (in_array($ext, $allowedFormats[EditorMdUploader::TYPE_IMAGE], true)) {
                    $uploadType = EditorMdUploader::TYPE_IMAGE;
                } elseif (in_array($ext, $allowedFormats[EditorMdUploader::TYPE_VIDEO], true)) {
                    $uploadType = EditorMdUploader::TYPE_VIDEO;
                } else {
                    $uploadType = EditorMdUploader::TYPE_FILE;
                }
            }
            break;
        }
    }
}

// 最终默认为图片类型
if ($uploadType === null) {
    $uploadType = EditorMdUploader::TYPE_IMAGE;
}

// 验证上传类型是否合法
if (!in_array($uploadType, [EditorMdUploader::TYPE_IMAGE, EditorMdUploader::TYPE_FILE, EditorMdUploader::TYPE_VIDEO], true)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => 0,
        'message' => '不支持的上传类型: ' . $uploadType,
        'data'    => ['allowed_types' => ['image', 'file', 'video']],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ==================== 确定文件域名称和配置 ====================

// 反向查找文件域名称
$fileInputName = array_search($uploadType, $typeMap, true) ?: 'editormd-image-file';
$formats       = $allowedFormats[$uploadType] ?? $allowedFormats[EditorMdUploader::TYPE_IMAGE];

// 自定义最大文件大小（可通过 POST 参数覆盖）
$customMaxSize = isset($_POST['max_size']) ? (int)$_POST['max_size'] : null;
$maxSize       = $customMaxSize ?? $maxSizeMap[$uploadType] ?? 1024;

// 检查是否启用了上传（文件域名称对应的文件必须有内容）
$hasFile = isset($_FILES[$fileInputName]) && !empty($_FILES[$fileInputName]['tmp_name']);

if (!$hasFile && $uploadType === EditorMdUploader::TYPE_IMAGE) {
    // 对于图片上传，也尝试检查是否有其他文件域
    foreach ($_FILES as $fName => $fInfo) {
        if (!empty($fInfo['tmp_name'])) {
            $fileInputName = $fName;
            $hasFile = true;
            break;
        }
    }
}

if (!$hasFile) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => 0,
        'message' => '上传文件不能为空',
        'data'    => [
            'error_code' => UPLOAD_ERR_NO_FILE,
            'upload_type' => $uploadType,
            'expected_input_name' => $fileInputName,
        ],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ==================== 创建上传器并执行上传 ====================

$uploader = new EditorMdUploader(
    savePath: $savePath,
    saveURL: $saveURL,
    formats: $formats,
    randomNameType: EditorMdUploader::RANDOM_DATE,
    randomLength: 'YmdHis',
    cover: true,
    maxSize: $maxSize,
);

// 执行上传
$uploader->upload($fileInputName);
