<?php
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Logout is client-side (token deletion)
echo json_encode([
    'success' => true,
    'message' => 'Çıkış başarılı'
]);
