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
            $input['display_order'] ?? 0
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Bina oluşturuldu']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bu ID zaten kullanılıyor']);
    }
    exit;
}

// PUT update building (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = requireAdmin();
    $buildingId = $_GET['id'] ?? null;
    
    if (!$buildingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina ID gerekli']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $updates = [];
        $params = [];
        
        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = $input['name'];
        }
        
        if (isset($input['icon'])) {
            $updates[] = "icon = ?";
            $params[] = $input['icon'];
        }
        
        if (isset($input['description'])) {
            $updates[] = "description = ?";
            $params[] = $input['description'];
        }
        
        if (isset($input['display_order'])) {
            $updates[] = "display_order = ?";
            $params[] = $input['display_order'];
        }
        
        if (isset($input['is_active'])) {
            $updates[] = "is_active = ?";
            $params[] = $input['is_active'] ? 1 : 0;
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Güncellenecek veri yok']);
            exit;
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $buildingId;
        
        $sql = "UPDATE buildings SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Bina güncellendi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE building (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireAdmin();
    $buildingId = $_GET['id'] ?? null;
    
    if (!$buildingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina ID gerekli']);
        exit;
    }
    
    try {
        // Soft delete (is_active = 0)
        $stmt = $db->prepare("UPDATE buildings SET is_active = 0, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$buildingId]);
        
        echo json_encode(['success' => true, 'message' => 'Bina silindi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
