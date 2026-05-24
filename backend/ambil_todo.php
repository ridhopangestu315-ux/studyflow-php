<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare(
    $koneksi,
    "SELECT id, title AS nama_tugas, subject_name AS mata_kuliah, deadline, priority AS prioritas,
            is_done AS sudah_selesai, created_at AS dibuat_pada
     FROM tasks
     WHERE user_id = ?
     ORDER BY is_done ASC, deadline ASC, created_at DESC"
);

if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal mengambil tugas. Periksa struktur tabel tasks.'], 500);
}

mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$todos = [];
while ($row = mysqli_fetch_assoc($result)) {
    $todos[] = $row;
}

mysqli_stmt_close($stmt);
json_response(['success' => true, 'todos' => $todos]);
