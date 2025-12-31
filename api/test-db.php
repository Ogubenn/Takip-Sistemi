<?php
// Database Connection Test
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

try {
    $db = getDB();
    
    // Test users table
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    
    // Test buildings table
    $stmt = $db->query("SELECT COUNT(*) as count FROM buildings");
    $buildingCount = $stmt->fetch()['count'];
    
    // Test checklist_items table
    $stmt = $db->query("SELECT COUNT(*) as count FROM checklist_items");
    $checklistCount = $stmt->fetch()['count'];
    
    // Test control_records table
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records");
    $controlCount = $stmt->fetch()['count'];
    
    // Get users list
    $stmt = $db->query("SELECT id, username, full_name, role, is_active FROM users");
    $users = $stmt->fetchAll();
    
    // Get buildings list
    $stmt = $db->query("SELECT id, name, is_active FROM buildings ORDER BY display_order");
    $buildings = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database bağlantısı başarılı',
        'stats' => [
            'users' => $userCount,
            'buildings' => $buildingCount,
            'checklist_items' => $checklistCount,
            'control_records' => $controlCount
        ],
        'users_list' => $users,
        'buildings_list' => $buildings
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database hatası: ' . $e->getMessage()
    ]);
}
