<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$judul = clean_text((string) ($data['judul'] ?? ''), 180);
$tanggal = trim((string) ($data['tanggal'] ?? ''));
$jam = trim((string) ($data['jam'] ?? ''));
$kategori = strtolower(trim((string) ($data['kategori'] ?? 'kuliah')));
$kategoriValid = ['kuliah', 'organisasi', 'ujian', 'pribadi', 'deadline'];

if (strlen($judul) < 3) {
    json_response(['success' => false, 'message' => 'Nama kegiatan minimal 3 karakter'], 422);
}

if (!valid_date_ymd($tanggal)) {
    json_response(['success' => false, 'message' => 'Format tanggal tidak valid'], 422);
}

if (!valid_time_hm($jam)) {
    json_response(['success' => false, 'message' => 'Format jam tidak valid'], 422);
}

if (!in_array($kategori, $kategoriValid, true)) {
    $kategori = 'kuliah';
}

$stmt = mysqli_prepare($koneksi, 'INSERT INTO schedules (user_id, title, schedule_date, schedule_time, category) VALUES (?, ?, ?, ?, ?)');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan jadwal'], 500);
}

mysqli_stmt_bind_param($stmt, 'issss', $user_id, $judul, $tanggal, $jam, $kategori);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menyimpan jadwal'], 500);
}

$new_id = mysqli_insert_id($koneksi);
mysqli_stmt_close($stmt);

json_response([
    'success' => true,
    'message' => 'Jadwal berhasil ditambahkan',
    'jadwal' => [
        'id' => (string) $new_id,
        'judul' => $judul,
        'tanggal' => $tanggal,
        'jam' => $jam,
        'kategori' => $kategori,
    ],
]);
