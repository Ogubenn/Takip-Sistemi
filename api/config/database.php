<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'ogubenn_atiksi_db');
define('DB_USER', 'ogubenn_atiksi_db');
define('DB_PASS', '10031317534.Og');
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key
define('JWT_SECRET', 'bulancak_atiksu_2025_secret_key_change_this');
define('JWT_ALGORITHM', 'HS256');

// CORS Settings
define('ALLOWED_ORIGINS', ['*']); // Production'da Vercel domain'ini ekle

// Create PDO connection
function getDB() {
    static $db = null;
    
    if ($db === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $db = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database bağlantı hatası'
            ]);
            exit;
        }
    }
    
    return $db;
}

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
