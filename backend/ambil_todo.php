<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare(
    $koneksi,
    "SELECT id, nama_tugas, mata_kuliah, deadline, prioritas, sudah_selesai, dibuat_pada
     FROM todos
     WHERE user_id = ?
     ORDER BY sudah_selesai ASC, deadline ASC, dibuat_pada DESC"
);

if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal mengambil tugas. Periksa struktur tabel todos.'], 500);
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
