<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare($koneksi, 'SELECT avatar FROM users WHERE id = ? LIMIT 1');
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $avatar);
mysqli_stmt_fetch($stmt);
mysqli_stmt_close($stmt);

if ($avatar) {
    $path = realpath(__DIR__ . '/../' . $avatar);
    $uploadRoot = realpath(__DIR__ . '/../uploads/profile');
    if ($path && $uploadRoot && strpos($path, $uploadRoot) === 0 && is_file($path)) {
        @unlink($path);
    }
}

$empty = null;
$update = mysqli_prepare($koneksi, 'UPDATE users SET avatar = ? WHERE id = ?');
mysqli_stmt_bind_param($update, 'si', $empty, $user_id);
mysqli_stmt_execute($update);
mysqli_stmt_close($update);

unset($_SESSION['avatar']);
json_response(['success' => true, 'message' => 'Foto profil dihapus']);
