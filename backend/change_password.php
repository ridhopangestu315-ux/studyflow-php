<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$current = (string) ($data['current_password'] ?? '');
$new = (string) ($data['new_password'] ?? '');
$confirm = (string) ($data['confirm_password'] ?? '');

if ($current === '' || $new === '' || $confirm === '') {
    json_response(['success' => false, 'message' => 'Semua field password harus diisi'], 422);
}

if (strlen($new) < 6) {
    json_response(['success' => false, 'message' => 'Password baru minimal 6 karakter'], 422);
}

if ($new !== $confirm) {
    json_response(['success' => false, 'message' => 'Konfirmasi password tidak cocok'], 422);
}

$stmt = mysqli_prepare($koneksi, 'SELECT password FROM users WHERE id = ? LIMIT 1');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal memeriksa password'], 500);
}

mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $hash);

if (!mysqli_stmt_fetch($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'User tidak ditemukan'], 404);
}
mysqli_stmt_close($stmt);

if (!password_verify($current, $hash)) {
    json_response(['success' => false, 'message' => 'Password lama tidak cocok'], 422);
}

$new_hash = password_hash($new, PASSWORD_DEFAULT);
$update = mysqli_prepare($koneksi, 'UPDATE users SET password = ? WHERE id = ?');
if (!$update) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan update password'], 500);
}

mysqli_stmt_bind_param($update, 'si', $new_hash, $user_id);
if (!mysqli_stmt_execute($update)) {
    mysqli_stmt_close($update);
    json_response(['success' => false, 'message' => 'Gagal mengubah password'], 500);
}

mysqli_stmt_close($update);
json_response(['success' => true, 'message' => 'Password berhasil diubah']);
