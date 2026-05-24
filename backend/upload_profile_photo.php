<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

if (empty($_FILES['avatar']) || !is_uploaded_file($_FILES['avatar']['tmp_name'])) {
    json_response(['success' => false, 'message' => 'File foto tidak ditemukan'], 422);
}

$file = $_FILES['avatar'];
$maxSize = 2 * 1024 * 1024;
$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
];

if ($file['size'] > $maxSize) {
    json_response(['success' => false, 'message' => 'Ukuran foto maksimal 2MB'], 422);
}

$mime = function_exists('mime_content_type') ? mime_content_type($file['tmp_name']) : '';
if ($mime === '' && ($imageInfo = @getimagesize($file['tmp_name']))) {
    $mime = $imageInfo['mime'] ?? '';
}
if (!isset($allowed[$mime])) {
    json_response(['success' => false, 'message' => 'Format foto harus JPG atau PNG'], 422);
}

$uploadDir = __DIR__ . '/../uploads/profile';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    json_response(['success' => false, 'message' => 'Folder upload tidak bisa dibuat'], 500);
}

$filename = 'user_' . $user_id . '_' . time() . '.' . $allowed[$mime];
$target = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    json_response(['success' => false, 'message' => 'Gagal menyimpan foto'], 500);
}

$relativePath = 'uploads/profile/' . $filename;
$stmt = mysqli_prepare($koneksi, 'UPDATE users SET avatar = ? WHERE id = ?');
mysqli_stmt_bind_param($stmt, 'si', $relativePath, $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_close($stmt);

$_SESSION['avatar'] = $relativePath;
json_response(['success' => true, 'message' => 'Foto profil berhasil diupload', 'avatar' => $relativePath]);
