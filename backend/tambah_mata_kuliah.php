<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$nama = clean_text((string) ($data['nama'] ?? ''), 120);
$color = trim((string) ($data['color'] ?? '#4f46e5'));
$icon = clean_text((string) ($data['icon'] ?? 'book'), 20);

if (strlen($nama) < 3) {
    json_response(['success' => false, 'message' => 'Nama mata kuliah minimal 3 karakter'], 422);
}

if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
    $color = '#4f46e5';
}

$stmt = mysqli_prepare($koneksi, 'INSERT IGNORE INTO subjects (user_id, name, color, icon) VALUES (?, ?, ?, ?)');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan mata kuliah'], 500);
}

mysqli_stmt_bind_param($stmt, 'isss', $user_id, $nama, $color, $icon);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menyimpan mata kuliah'], 500);
}

$new_id = mysqli_insert_id($koneksi);
mysqli_stmt_close($stmt);

if ($new_id === 0) {
    $ambil = mysqli_prepare($koneksi, 'SELECT id FROM subjects WHERE user_id = ? AND name = ? LIMIT 1');
    mysqli_stmt_bind_param($ambil, 'is', $user_id, $nama);
    mysqli_stmt_execute($ambil);
    $result = mysqli_stmt_get_result($ambil);
    $row = mysqli_fetch_assoc($result);
    $new_id = (int) ($row['id'] ?? 0);
    mysqli_stmt_close($ambil);
}

json_response([
    'success' => true,
    'message' => 'Mata kuliah berhasil ditambahkan',
    'mata_kuliah' => ['id' => $new_id, 'nama' => $nama, 'color' => $color, 'icon' => $icon],
]);
