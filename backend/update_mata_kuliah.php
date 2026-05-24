<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$subject_id = (int) ($data['id'] ?? 0);
$nama = clean_text((string) ($data['nama'] ?? ''), 120);
$color = trim((string) ($data['color'] ?? '#4f46e5'));
$icon = clean_text((string) ($data['icon'] ?? 'book'), 20);

if ($subject_id <= 0) {
    json_response(['success' => false, 'message' => 'ID mata kuliah tidak valid'], 422);
}

if (strlen($nama) < 3) {
    json_response(['success' => false, 'message' => 'Nama mata kuliah minimal 3 karakter'], 422);
}

if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
    $color = '#4f46e5';
}

$stmt = mysqli_prepare($koneksi, 'UPDATE subjects SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan update mata kuliah'], 500);
}

mysqli_stmt_bind_param($stmt, 'sssii', $nama, $color, $icon, $subject_id, $user_id);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal mengubah mata kuliah. Nama mungkin sudah dipakai.'], 500);
}

if (mysqli_stmt_affected_rows($stmt) === 0) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Mata kuliah tidak ditemukan atau tidak berubah'], 404);
}

mysqli_stmt_close($stmt);
json_response([
    'success' => true,
    'message' => 'Mata kuliah berhasil diperbarui',
    'mata_kuliah' => ['id' => $subject_id, 'nama' => $nama, 'color' => $color, 'icon' => $icon],
]);
