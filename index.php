<?php
require_once __DIR__ . '/includes/app.php';
start_secure_session();

header('Location: ' . (!empty($_SESSION['user_id']) ? 'dashboard.php' : 'login.html'));
exit;
