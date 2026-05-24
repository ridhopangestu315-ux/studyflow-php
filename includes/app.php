<?php
declare(strict_types=1);

if (!defined('STUDYFLOW_APP')) {
    define('STUDYFLOW_APP', true);
}

ini_set('display_errors', '0');
ini_set('log_errors', '1');
date_default_timezone_set('Asia/Jakarta');

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

function json_response(array $payload, int $statusCode = 200): void
{
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);

    if (is_array($data)) {
        return $data;
    }

    return !empty($_POST) ? $_POST : [];
}

function require_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        json_response(['success' => false, 'message' => 'Method tidak diizinkan'], 405);
    }
}

function require_login_json(): int
{
    start_secure_session();

    if (empty($_SESSION['user_id'])) {
        json_response([
            'success' => false,
            'message' => 'Sesi habis. Silakan login ulang.',
            'redirect' => true,
        ], 401);
    }

    return (int) $_SESSION['user_id'];
}

function clean_text(string $value, int $maxLength = 255): string
{
    $value = trim($value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? '';
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength, 'UTF-8')
        : substr($value, 0, $maxLength);
}

function valid_date_ymd(string $date): bool
{
    $dt = DateTime::createFromFormat('Y-m-d', $date);
    return $dt instanceof DateTime && $dt->format('Y-m-d') === $date;
}

function valid_time_hm(string $time): bool
{
    $dt = DateTime::createFromFormat('H:i', $time);
    return $dt instanceof DateTime && $dt->format('H:i') === $time;
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
