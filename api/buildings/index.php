<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$db = getDB();

// GET all buildings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM buildings WHERE is_active = 1 ORDER BY display_order, created_at");
        $buildings = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'buildings' => $buildings
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
    }
    exit;
}

// POST new building (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id']) || !isset($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID ve isim zorunludur']);
        exit;
    }
    
    try {
        $stmt = $db->prepare("INSERT INTO buildings (id, name, icon, description, display_order) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['id'],
            $input['name'],
            $input['icon'] ?? '🏢',
            $input['description'] ?? '',
            $input['displayOrder'] ?? 0
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Bina oluşturuldu']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bu ID zaten kullanılıyor']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
