<?php
require_once __DIR__ . '/../includes/app.php';

$dbConfig = require __DIR__ . '/../config/database.php';

$koneksi = @mysqli_connect(
    $dbConfig['host'],
    $dbConfig['username'],
    $dbConfig['password'],
    $dbConfig['database'],
    (int) $dbConfig['port']
);

if (!$koneksi) {
    json_response([
        'success' => false,
        'message' => 'Koneksi database gagal. Periksa config/database.php dan pastikan database sudah dibuat/import.',
        'error' => mysqli_connect_error(),
    ], 500);
}

mysqli_set_charset($koneksi, $dbConfig['charset']);
