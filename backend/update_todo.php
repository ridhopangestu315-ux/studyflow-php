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

$cek = mysqli_prepare($koneksi, 'SELECT id FROM todos WHERE id = ? AND user_id = ?');
mysqli_stmt_bind_param($cek, 'ii', $todo_id, $user_id);
mysqli_stmt_execute($cek);
mysqli_stmt_store_result($cek);

if (mysqli_stmt_num_rows($cek) === 0) {
    mysqli_stmt_close($cek);
    json_response(['success' => false, 'message' => 'Tugas tidak ditemukan atau bukan milik Anda'], 404);
}
mysqli_stmt_close($cek);

if (array_key_exists('sudah_selesai', $data) && count($data) <= 2) {
    $sudah_selesai = (int) $data['sudah_selesai'];
    if ($sudah_selesai !== 0 && $sudah_selesai !== 1) {
        json_response(['success' => false, 'message' => 'Status tugas tidak valid'], 422);
    }

    $stmt = mysqli_prepare($koneksi, 'UPDATE todos SET sudah_selesai = ? WHERE id = ? AND user_id = ?');
    mysqli_stmt_bind_param($stmt, 'iii', $sudah_selesai, $todo_id, $user_id);
} else {
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

    $stmt = mysqli_prepare(
        $koneksi,
        'UPDATE todos SET nama_tugas = ?, mata_kuliah = ?, deadline = ?, prioritas = ? WHERE id = ? AND user_id = ?'
    );
    mysqli_stmt_bind_param($stmt, 'ssssii', $nama_tugas, $mata_kuliah, $deadline, $prioritas, $todo_id, $user_id);
}

if (!$stmt || !mysqli_stmt_execute($stmt)) {
    json_response(['success' => false, 'message' => 'Gagal memperbarui tugas'], 500);
}
mysqli_stmt_close($stmt);

$ambil = mysqli_prepare(
    $koneksi,
    'SELECT id, nama_tugas, mata_kuliah, deadline, prioritas, sudah_selesai, dibuat_pada FROM todos WHERE id = ? AND user_id = ?'
);
mysqli_stmt_bind_param($ambil, 'ii', $todo_id, $user_id);
mysqli_stmt_execute($ambil);
$result = mysqli_stmt_get_result($ambil);
$todo = mysqli_fetch_assoc($result);
mysqli_stmt_close($ambil);

json_response(['success' => true, 'message' => 'Tugas berhasil diperbarui', 'todo' => $todo]);
