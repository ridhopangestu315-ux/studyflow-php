<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$nama_tugas = clean_text((string) ($data['nama_tugas'] ?? ''), 180);
$mata_kuliah = clean_text((string) ($data['mata_kuliah'] ?? ''), 120);
$deadline = trim((string) ($data['deadline'] ?? ''));
$prioritas = strtolower(trim((string) ($data['prioritas'] ?? 'sedang')));
$prioritasValid = ['rendah', 'sedang', 'tinggi'];

if (strlen($nama_tugas) < 3) {
    json_response(['success' => false, 'message' => 'Nama tugas minimal 3 karakter'], 422);
}

if ($mata_kuliah === '') {
    json_response(['success' => false, 'message' => 'Mata kuliah tidak boleh kosong'], 422);
}

if (!valid_date_ymd($deadline)) {
    json_response(['success' => false, 'message' => 'Format deadline tidak valid'], 422);
}

if (!in_array($prioritas, $prioritasValid, true)) {
    $prioritas = 'sedang';
}

$subject_id = null;
$subjectStmt = mysqli_prepare($koneksi, 'SELECT id FROM subjects WHERE user_id = ? AND name = ? LIMIT 1');
if ($subjectStmt) {
    mysqli_stmt_bind_param($subjectStmt, 'is', $user_id, $mata_kuliah);
    mysqli_stmt_execute($subjectStmt);
    mysqli_stmt_bind_result($subjectStmt, $foundSubjectId);
    if (mysqli_stmt_fetch($subjectStmt)) {
        $subject_id = (int) $foundSubjectId;
    }
    mysqli_stmt_close($subjectStmt);
}

$stmt = mysqli_prepare(
    $koneksi,
    'INSERT INTO tasks (user_id, subject_id, title, subject_name, deadline, priority, category, is_done) VALUES (?, ?, ?, ?, ?, ?, ?, 0)'
);

if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan penyimpanan tugas. Periksa struktur database.'], 500);
}

$category = clean_text((string) ($data['kategori'] ?? 'tugas'), 60);
mysqli_stmt_bind_param($stmt, 'iisssss', $user_id, $subject_id, $nama_tugas, $mata_kuliah, $deadline, $prioritas, $category);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menambahkan tugas'], 500);
}

$todo_id = mysqli_insert_id($koneksi);
mysqli_stmt_close($stmt);

$ambil = mysqli_prepare(
    $koneksi,
    'SELECT id, title AS nama_tugas, subject_name AS mata_kuliah, deadline, priority AS prioritas, is_done AS sudah_selesai, created_at AS dibuat_pada FROM tasks WHERE id = ? AND user_id = ?'
);
mysqli_stmt_bind_param($ambil, 'ii', $todo_id, $user_id);
mysqli_stmt_execute($ambil);
$result = mysqli_stmt_get_result($ambil);
$todo = mysqli_fetch_assoc($result);
mysqli_stmt_close($ambil);

json_response([
    'success' => true,
    'message' => 'Tugas berhasil ditambahkan',
    'todo' => $todo,
]);
