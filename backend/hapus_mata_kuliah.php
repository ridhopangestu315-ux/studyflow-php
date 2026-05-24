<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$mk_id = (int) ($data['id'] ?? 0);

if ($mk_id <= 0) {
    json_response(['success' => false, 'message' => 'ID tidak valid'], 422);
}

$stmt = mysqli_prepare($koneksi, 'DELETE FROM mata_kuliah WHERE id = ? AND user_id = ?');
mysqli_stmt_bind_param($stmt, 'ii', $mk_id, $user_id);

if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menghapus mata kuliah'], 500);
}

mysqli_stmt_close($stmt);
json_response(['success' => true, 'message' => 'Mata kuliah berhasil dihapus']);
