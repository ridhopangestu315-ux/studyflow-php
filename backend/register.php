<?php
require_once __DIR__ . '/../includes/app.php';
start_secure_session();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$nama = clean_text((string) ($data['nama'] ?? ''), 120);
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if ($nama === '') {
    json_response(['success' => false, 'message' => 'Nama tidak boleh kosong'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Format email tidak valid'], 422);
}

if (strlen($password) < 6) {
    json_response(['success' => false, 'message' => 'Password minimal 6 karakter'], 422);
}

$cek = mysqli_prepare($koneksi, 'SELECT id FROM users WHERE email = ? LIMIT 1');
if (!$cek) {
    json_response(['success' => false, 'message' => 'Tabel users tidak ditemukan. Import database.sql terlebih dahulu.'], 500);
}

mysqli_stmt_bind_param($cek, 's', $email);
mysqli_stmt_execute($cek);
mysqli_stmt_store_result($cek);

if (mysqli_stmt_num_rows($cek) > 0) {
    mysqli_stmt_close($cek);
    json_response(['success' => false, 'message' => 'Email sudah terdaftar. Gunakan email lain atau login.'], 409);
}
mysqli_stmt_close($cek);

$hash = password_hash($password, PASSWORD_DEFAULT);
$insert = mysqli_prepare($koneksi, 'INSERT INTO users (email, password, nama_lengkap) VALUES (?, ?, ?)');
if (!$insert) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan registrasi. Periksa struktur database.'], 500);
}

mysqli_stmt_bind_param($insert, 'sss', $email, $hash, $nama);
if (!mysqli_stmt_execute($insert)) {
    mysqli_stmt_close($insert);
    json_response(['success' => false, 'message' => 'Gagal membuat akun. Coba lagi.'], 500);
}

$userId = mysqli_insert_id($koneksi);
mysqli_stmt_close($insert);

$defaultCourses = [
    'Analisis dan Perancangan Sistem',
    'Grafika Komputer',
    'Interaksi Manusia dan Komputer',
    'Jaringan Komputer',
    'Pendidikan Agama Islam',
    'Pemrograman Web',
    'Praktikum Jaringan Komputer',
    'Praktikum PBO',
    'Sistem Rekayasa Berkelanjutan',
    'Statistika Untuk Komputasi',
];

$courseStmt = mysqli_prepare($koneksi, 'INSERT IGNORE INTO mata_kuliah (user_id, nama) VALUES (?, ?)');
if ($courseStmt) {
    foreach ($defaultCourses as $courseName) {
        mysqli_stmt_bind_param($courseStmt, 'is', $userId, $courseName);
        mysqli_stmt_execute($courseStmt);
    }
    mysqli_stmt_close($courseStmt);
}

json_response(['success' => true, 'message' => 'Register berhasil']);
