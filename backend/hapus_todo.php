<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$todo_id = (int) ($data['id'] ?? 0);

if ($todo_id <= 0) {
    json_response(['success' => false, 'message' => 'ID tugas tidak valid'], 422);
}

$stmt = mysqli_prepare($koneksi, 'DELETE FROM tasks WHERE id = ? AND user_id = ?');
mysqli_stmt_bind_param($stmt, 'ii', $todo_id, $user_id);

if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menghapus tugas'], 500);
}

if (mysqli_stmt_affected_rows($stmt) === 0) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Tugas tidak ditemukan atau bukan milik Anda'], 404);
}

mysqli_stmt_close($stmt);
json_response(['success' => true, 'message' => 'Tugas berhasil dihapus']);
