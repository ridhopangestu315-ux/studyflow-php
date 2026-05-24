<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare($koneksi, 'SELECT id, name AS nama, color, icon FROM subjects WHERE user_id = ? ORDER BY name ASC');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal mengambil mata kuliah'], 500);
}

mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$list = [];
while ($row = mysqli_fetch_assoc($result)) {
    $list[] = $row;
}

mysqli_stmt_close($stmt);
json_response(['success' => true, 'mata_kuliah' => $list]);
