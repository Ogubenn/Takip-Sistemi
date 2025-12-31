<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';

echo json_encode([
    'test' => 'API Test',
    'timestamp' => date('Y-m-d H:i:s')
]);

try {
    $db = getDB();
    echo json_encode([
        'database_connection' => 'SUCCESS',
        'message' => 'Database bağlantısı başarılı'
    ]);
    
    // Users tablosunu kontrol et
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    
    echo json_encode([
        'users_table' => 'OK',
        'user_count' => $userCount
    ]);
    
    // Kullanıcı listesini göster (şifresiz)
    $stmt = $db->query("SELECT id, username, full_name, email, role, is_active FROM users");
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'users' => $users
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database Error',
        'message' => $e->getMessage()
    ]);
}
?>
