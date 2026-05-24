<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require __DIR__ . '/koneksi.php';

$stmt = mysqli_prepare(
    $koneksi,
    "SELECT id, title AS judul, DATE_FORMAT(schedule_date, '%Y-%m-%d') AS tanggal,
            TIME_FORMAT(schedule_time, '%H:%i') AS jam, category AS kategori
     FROM schedules
     WHERE user_id = ?
     ORDER BY schedule_date ASC, schedule_time ASC"
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
