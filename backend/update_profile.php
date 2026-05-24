<?php
require_once __DIR__ . '/../includes/app.php';
$user_id = require_login_json();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$name = clean_text((string) ($data['name'] ?? $_SESSION['nama'] ?? ''), 120);
$theme = strtolower(trim((string) ($data['theme'] ?? $_SESSION['theme'] ?? 'light')));

if ($name === '') {
    json_response(['success' => false, 'message' => 'Nama tidak boleh kosong'], 422);
}

if (!in_array($theme, ['light', 'dark'], true)) {
    $theme = 'light';
}

$stmt = mysqli_prepare($koneksi, 'UPDATE users SET name = ?, theme = ? WHERE id = ?');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal menyiapkan update profil'], 500);
}

mysqli_stmt_bind_param($stmt, 'ssi', $name, $theme, $user_id);
if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    json_response(['success' => false, 'message' => 'Gagal menyimpan profil'], 500);
}

mysqli_stmt_close($stmt);
$_SESSION['nama'] = $name;
$_SESSION['theme'] = $theme;

json_response(['success' => true, 'message' => 'Profil berhasil disimpan', 'profile' => ['name' => $name, 'theme' => $theme]]);
