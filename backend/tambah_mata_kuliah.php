<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$nama = clean_text((string) ($data['nama'] ?? ''), 120);

if (strlen($nama) < 3) {
    json_response(['success' => false, 'message' => 'Nama mata kuliah minimal 3 karakter'], 422);
}

$stmt = mysqli_prepare($koneksi, 'INSERT IGNORE INTO mata_kuliah (user_id, nama) VALUES (?, ?)');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan mata kuliah'], 500);
}

mysqli_stmt_bind_param($stmt, 'is', $user_id, $nama);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menyimpan mata kuliah'], 500);
}

$new_id = mysqli_insert_id($koneksi);
mysqli_stmt_close($stmt);

if ($new_id === 0) {
    $ambil = mysqli_prepare($koneksi, 'SELECT id FROM mata_kuliah WHERE user_id = ? AND nama = ? LIMIT 1');
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
    'mata_kuliah' => ['id' => $new_id, 'nama' => $nama],
]);
