<?php
require_once __DIR__ . '/../includes/app.php';
start_secure_session();

if (empty($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}
