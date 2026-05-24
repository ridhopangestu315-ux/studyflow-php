<?php
require_once __DIR__ . '/../includes/app.php';
start_secure_session();
require_post();
require __DIR__ . '/koneksi.php';

$data = read_json_body();
$email = strtolower(trim($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    json_response(['success' => false, 'message' => 'Email dan password tidak boleh kosong'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Format email tidak valid'], 422);
}

$stmt = mysqli_prepare($koneksi, 'SELECT id, email, password, name, avatar, theme FROM users WHERE email = ? LIMIT 1');
if (!$stmt) {
    json_response(['success' => false, 'message' => 'Gagal memproses login. Pastikan database sudah diimport.'], 500);
}

mysqli_stmt_bind_param($stmt, 's', $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = $result ? mysqli_fetch_assoc($result) : null;
mysqli_stmt_close($stmt);

if (!$user || !password_verify($password, $user['password'])) {
    json_response(['success' => false, 'message' => 'Email atau password salah'], 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['email'] = $user['email'];
$_SESSION['nama'] = $user['name'];
$_SESSION['avatar'] = $user['avatar'] ?? null;
$_SESSION['theme'] = $user['theme'] ?? 'light';

json_response([
    'success' => true,
    'message' => 'Login berhasil',
    'nama' => $user['name'],
    'avatar' => $user['avatar'],
    'theme' => $user['theme'],
]);
