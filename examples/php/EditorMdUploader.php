<?php

/**
 * Editor.md PHP 上传类（PHP 8 版本）
 *
 * 支持图片、附件（文件）、视频等多种类型的文件上传。
 * 采用 PHP 8 语法编写，包含类型声明、构造函数属性提升、match 表达式等现代特性。
 * 仅供演示与开发环境使用，生产环境请根据实际需求加强安全校验。
 *
 * @package   Editor.md
 * @version   2.0.0
 * @author    Pandao
 * @license   MIT
 * @link      https://pandao.github.io/editor.md/
 */

declare(strict_types=1);

class EditorMdUploader
{
    // ==================== 上传类型常量 ====================

    /** 图片上传 */
    public const TYPE_IMAGE = 'image';

    /** 附件（文件）上传 */
    public const TYPE_FILE = 'file';

    /** 视频上传 */
    public const TYPE_VIDEO = 'video';

    // ==================== 随机文件名模式常量 ====================

    /** 保留原文件名 */
    public const RANDOM_NONE = 0;

    /** 日期时间格式文件名 */
    public const RANDOM_DATE = 1;

    /** 随机字符串文件名 */
    public const RANDOM_STRING = 2;

    // ==================== 属性 ====================

    /** @var array|null 上传的文件信息（来自 $_FILES 数组的某一项） */
    public ?array $files = null;

    /** @var string 文件扩展名（小写，不含点号） */
    public string $fileExt = '';

    /** @var string 最终保存的文件名 */
    public string $saveName = '';

    /** @var string 最终保存的完整 URL 地址 */
    public string $saveURL = '';

    /** @var string 保存本地文件的路径 */
    public string $savePath = '';

    /** @var string|int 生成随机文件名的长度，当为日期类型时作为日期格式字符串 */
    public string|int $randomLength = '';

    /** @var int 随机生成文件名的模式：0=保留原名，1=日期格式，2=随机字符串 */
    public int $randomNameType = self::RANDOM_DATE;

    /** @var array 允许上传的文件扩展名列表 */
    public array $formats = ['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'];

    /** @var int 最大上传文件大小，单位 KB */
    public int $maxSize = 1024;

    /** @var bool 是否覆盖同名文件 */
    public bool $cover = true;

    /** @var bool 上传成功后是否进行 URL 重定向（用于跨域上传） */
    public bool $redirect = false;

    /** @var string 上传成功或出错后重定向的目标 URL */
    public string $redirectURL = '';

    /** @var array 错误信息文本（可在实例化后自定义） */
    public array $errors = [
        'empty'      => '上传文件不能为空',
        'format'     => '上传的文件格式不符合规定',
        'maxsize'    => '上传的文件太大',
        'unwritable' => '保存目录不可写，请更改权限',
        'not_exist'  => '保存目录不存在',
        'same_file'  => '已经有相同的文件存在',
    ];

    // ==================== 构造函数 ====================

    /**
     * 构造函数
     *
     * @param string          $savePath       最终保存的本地路径
     * @param string          $saveURL        最终保存的 URL 地址
     * @param array|null      $formats        允许上传的文件扩展名数组，null 则使用默认值
     * @param int             $randomNameType 随机文件名模式：0/1/2
     * @param string|int      $randomLength   随机文件名长度或日期格式
     * @param bool            $cover          是否覆盖同名文件
     * @param int             $maxSize        最大上传文件大小（KB）
     */
    public function __construct(
        string $savePath,
        string $saveURL,
        ?array $formats = null,
        int $randomNameType = self::RANDOM_DATE,
        string|int $randomLength = '',
        bool $cover = true,
        int $maxSize = 1024,
    ) {
        $this->savePath       = $savePath;
        $this->saveURL        = $saveURL;
        $this->randomNameType = $randomNameType;
        $this->randomLength   = $randomLength;
        $this->cover          = $cover;
        $this->maxSize        = $maxSize;

        if ($formats !== null) {
            $this->formats = $formats;
        }
    }

    // ==================== 公共方法 ====================

    /**
     * 批量配置参数
     *
     * @param array<string, mixed> $configs 配置键值对数组
     * @return void
     */
    public function config(array $configs): void
    {
        foreach ($configs as $key => $value) {
            $this->$key = $value;
        }
    }

    /**
     * 执行文件上传
     *
     * @param string $name 文件域的 name 属性值（如 'editormd-image-file'）
     * @return bool 上传成功返回 true，失败返回 false
     */
    public function upload(string $name): bool
    {
        // 检查是否有文件上传
        if (empty($_FILES[$name]['tmp_name']) || $_FILES[$name]['error'] === UPLOAD_ERR_NO_FILE) {
            $this->message(message: $this->errors['empty'], success: false);
            return false;
        }

        $this->files = $_FILES[$name];

        // 检查上传错误码
        if ($this->files['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE   => '上传的文件超过了 php.ini 中 upload_max_filesize 选项限制的值',
                UPLOAD_ERR_FORM_SIZE  => '上传文件的大小超过了 HTML 表单中 MAX_FILE_SIZE 选项指定的值',
                UPLOAD_ERR_PARTIAL    => '文件只有部分被上传',
                UPLOAD_ERR_NO_TMP_DIR => '找不到临时目录',
                UPLOAD_ERR_CANT_WRITE => '写文件到硬盘时出错',
                UPLOAD_ERR_EXTENSION  => '某个扩展停止了文件的上传',
            ];
            $message = $errorMessages[$this->files['error']] ?? '未知上传错误';
            $this->message(message: $message, success: false, extra: [
                'error_code' => $this->files['error'],
            ]);
            return false;
        }

        // 自动创建保存目录（如果不存在）
        if (!is_dir($this->savePath)) {
            if (!@mkdir($this->savePath, 0755, true)) {
                $this->message(message: $this->errors['not_exist'], success: false);
                return false;
            }
        }

        // 检查保存目录是否可写
        if (!is_writable($this->savePath)) {
            $this->message(message: $this->errors['unwritable'], success: false);
            return false;
        }

        // 取得扩展名
        $this->fileExt = $this->getFileExt($this->files['name']);

        // 生成最终保存的文件名
        $this->setSaveName();

        return $this->moveFile();
    }

    /**
     * 获取最终保存的文件名
     *
     * @return string
     */
    public function getSaveName(): string
    {
        return $this->saveName;
    }

    /**
     * 获取文件扩展名（小写，不含点号）
     *
     * @param string $fileName 原始文件名
     * @return string
     */
    public function getFileExt(string $fileName): string
    {
        $ext = strrchr($fileName, '.');
        return $ext !== false ? strtolower(trim(substr($ext, 1))) : '';
    }

    /**
     * 统一响应输出
     *
     * 根据配置决定通过 JSON 输出还是通过 URL 重定向。
     * 返回标准 JSON 格式：
     *   成功：{"success": true,  "message": "...", "url": "保存路径", "data": {...}}
     *   失败：{"success": false, "message": "...", "data": {...}}
     *
     * @param string $message 提示信息
     * @param bool   $success 是否成功
     * @param array  $extra   附加数据（成功时通常包含文件大小等）
     * @return void
     */
    public function message(string $message, bool $success = false, array $extra = []): void
    {
        $url = $this->saveURL . $this->saveName;

        // 适用于跨域上传时，跳转到中介页面
        if ($this->redirect) {
            $this->redirectURL .= '&success=' . ($success ? '1' : '0') . '&message=' . urlencode($message);
            if ($success) {
                $this->redirectURL .= '&url=' . urlencode($url);
            }
            $this->doRedirect();
            return;
        }

        // 构建 JSON 响应体
        $response = [
            'success' => $success,
            'message' => $message,
        ];

        if ($success) {
            $response['url'] = $url;
            if ($extra !== []) {
                $response['data'] = $extra;
            }
        } else {
            if ($extra !== []) {
                $response['data'] = $extra;
            }
        }

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    // ==================== 私有方法 ====================

    /**
     * 检查并移动上传文件
     *
     * @return bool
     */
    private function moveFile(): bool
    {
        $files = $this->files;

        // 检查文件格式（扩展名白名单）
        if ($this->formats !== [] && !in_array($this->fileExt, $this->formats, true)) {
            $formats = implode(',', $this->formats);
            $message = sprintf(
                '您上传的文件 "%s" 是 .%s 格式的，系统不允许上传，您只能上传 %s 格式的文件。',
                $files['name'],
                $this->fileExt,
                $formats
            );
            $this->message(message: $message, success: false);
            return false;
        }

        // 验证 MIME 类型（防止伪造扩展名）
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo !== false ? finfo_file($finfo, $files['tmp_name']) : false;
        if ($finfo !== false) {
            finfo_close($finfo);
        }

        // MIME 类型 → 允许的扩展名映射（防止伪造扩展名）
        $mimeToExtMap = [
            'image/jpeg'      => ['jpg', 'jpeg'],
            'image/png'       => ['png'],
            'image/gif'       => ['gif'],
            'image/bmp'       => ['bmp'],
            'image/webp'      => ['webp'],
            'image/svg+xml'   => ['svg'],
            'video/mp4'       => ['mp4'],
            'video/x-msvideo' => ['avi'],
            'video/quicktime' => ['mov'],
            'video/x-ms-wmv'  => ['wmv'],
            'video/x-flv'     => ['flv'],
            'video/x-matroska'=> ['mkv'],
            'video/webm'      => ['webm'],
            'application/zip' => ['zip'],
            'application/x-rar-compressed' => ['rar'],
            'application/x-7z-compressed'  => ['7z'],
            'application/x-tar'    => ['tar'],
            'application/gzip'     => ['gz'],
            'application/pdf'      => ['pdf'],
            'text/plain'           => ['txt'],
            'text/csv'             => ['csv'],
            'text/markdown'        => ['md'],
            'audio/mpeg'           => ['mp3'],
            'audio/wav'            => ['wav'],
            'audio/ogg'            => ['ogg'],
            'application/msword'   => ['doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => ['docx'],
            'application/vnd.ms-excel'      => ['xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => ['xlsx'],
            'application/vnd.ms-powerpoint' => ['ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => ['pptx'],
        ];

        if ($detectedMime !== false) {
            $allowedExts = $mimeToExtMap[$detectedMime] ?? null;
            if ($allowedExts === null || !in_array($this->fileExt, $allowedExts, true)) {
                $this->message(
                    message: sprintf(
                        '文件扩展名 .%s 与检测到的实际文件类型 %s 不匹配，拒绝上传。',
                        $this->fileExt,
                        $detectedMime
                    ),
                    success: false,
                    extra: ['detected_mime' => $detectedMime, 'claimed_ext' => $this->fileExt]
                );
                return false;
            }
        }

        // 对于图片类型，额外验证是否为有效图像
        if (in_array($this->fileExt, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'], true)) {
            $imageInfo = @getimagesize($files['tmp_name']);
            if ($imageInfo === false) {
                $this->message(
                    message: '文件不是有效的图像文件，请检查文件是否损坏。',
                    success: false,
                );
                return false;
            }
        }

        // 防止路径穿越攻击：只保留文件名部分
        $safeFilename = basename($this->saveName);
        $this->saveName = $safeFilename;

        // 检查文件大小
        if (($files['size'] / 1024) > $this->maxSize) {
            $message = sprintf(
                '您上传的文件 "%s" 太大了，文件大小超出了系统限定值 %d KB，不能上传。',
                $files['name'],
                $this->maxSize
            );
            $this->message(message: $message, success: false);
            return false;
        }

        // 检查是否允许覆盖
        if (!$this->cover && file_exists($this->savePath . $this->saveName)) {
            $this->message(message: $this->saveName . $this->errors['same_file'], success: false);
            return false;
        }

        // 移动上传文件到目标目录
        $destPath = $this->savePath . $this->saveName;
        if (!@move_uploaded_file($files['tmp_name'], $destPath)) {
            // PHP 8: 使用 match 表达式获取错误信息
            $errorCode = $files['error'] ?? 999;
            $message = match ((int)$errorCode) {
                0       => '文件上传成功',
                1       => '上传的文件超过了 php.ini 中 upload_max_filesize 选项限制的值',
                2       => '上传文件的大小超过了 HTML 表单中 MAX_FILE_SIZE 选项指定的值',
                3       => '文件只有部分被上传',
                4       => '没有文件被上传',
                6       => '找不到临时目录',
                7       => '写文件到硬盘时出错',
                8       => '某个扩展停止了文件的上传',
                default => '未知错误，请检查文件是否损坏、是否超大等原因。',
            };
            $this->message(message: $message, success: false,
                extra: ['error_code' => $errorCode]
            );
            return false;
        }

        // 清理临时文件
        @unlink($files['tmp_name']);

        // 构建额外信息
        $extra = [
            'file_name' => $this->saveName,
            'file_size' => $files['size'],
            'file_ext'  => $this->fileExt,
        ];

        $this->message(message: '上传成功！', success: true, extra: $extra);
        return true;
    }

    /**
     * 生成随机文件名
     *
     * @return string
     */
    private function randomFileName(): string
    {
        return match ($this->randomNameType) {
            // 日期格式文件名
            self::RANDOM_DATE => (function (): string {
                date_default_timezone_set('PRC');
                $date = date((string)$this->randomLength);
                return $date . '_' . random_int(10000, 99999);
            })(),

            // 随机字符串文件名
            self::RANDOM_STRING => (function (): string {
                $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
                $max   = strlen($chars) - 1;
                $len   = (int)$this->randomLength ?: 8;
                $name  = '';
                for ($i = 0; $i < $len; $i++) {
                    $name .= $chars[random_int(0, $max)];
                }
                return $name;
            })(),

            // 保留原文件名
            default => '',
        };
    }

    /**
     * 设置最终保存的文件名
     *
     * @return void
     */
    private function setSaveName(): void
    {
        $this->saveName = $this->randomFileName();

        // 如果生成的文件名为空，则保留原文件名
        if ($this->saveName === '') {
            $this->saveName = $this->files['name'];
        } else {
            $this->saveName .= '.' . $this->fileExt;
        }
    }

    /**
     * 执行 URL 重定向
     *
     * @return void
     */
    private function doRedirect(): void
    {
        if ($this->redirectURL !== '') {
            header('Location: ' . $this->redirectURL);
            exit;
        }
    }
}
