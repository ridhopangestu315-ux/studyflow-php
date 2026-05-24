<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare(
    $koneksi,
    "SELECT id, judul, DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal, TIME_FORMAT(jam, '%H:%i') AS jam, kategori
     FROM jadwal
     WHERE user_id = ?
     ORDER BY tanggal ASC, jam ASC"
);

if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal mengambil jadwal'], 500);
}

mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$jadwal = [];
while ($row = mysqli_fetch_assoc($result)) {
    $jadwal[] = $row;
}

mysqli_stmt_close($stmt);
json_response(['success' => true, 'jadwal' => $jadwal]);
