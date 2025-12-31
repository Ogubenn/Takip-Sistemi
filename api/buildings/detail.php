<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

// Get building ID from query string
$buildingId = $_GET['id'] ?? null;

if (!$buildingId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bina ID gerekli']);
    exit;
}

$db = getDB();

// GET single building with checklist
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare("SELECT * FROM buildings WHERE id = ?");
        $stmt->execute([$buildingId]);
        $building = $stmt->fetch();
        
        if (!$building) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Bina bulunamadı']);
            exit;
        }
        
        $stmt = $db->prepare("SELECT * FROM checklist_items WHERE building_id = ? AND is_active = 1 ORDER BY item_order");
        $stmt->execute([$buildingId]);
        $checklist = $stmt->fetchAll();
        
        // Checklist'i text array olarak dön (frontend bekliyor)
        $checklistTexts = array_map(function($item) {
            return $item['item_text'];
        }, $checklist);
        
        $building['checklist'] = $checklistTexts;
        
        echo json_encode([
            'success' => true,
            'building' => $building
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
    }
    exit;
}

// PUT update building (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $updates = [];
        $params = [];
        
        if (isset($input['name'])) {
            $updates[] = 'name = ?';
            $params[] = $input['name'];
        }
        if (isset($input['icon'])) {
            $updates[] = 'icon = ?';
            $params[] = $input['icon'];
        }
        if (isset($input['description'])) {
            $updates[] = 'description = ?';
            $params[] = $input['description'];
        }
        if (isset($input['displayOrder'])) {
            $updates[] = 'display_order = ?';
            $params[] = $input['displayOrder'];
        }
        if (isset($input['isActive'])) {
            $updates[] = 'is_active = ?';
            $params[] = $input['isActive'] ? 1 : 0;
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Güncellenecek alan bulunamadı']);
            exit;
        }
        
        $params[] = $buildingId;
        $sql = "UPDATE buildings SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Bina güncellendi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
    }
    exit;
}

// DELETE building (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireAdmin();
    
    try {
        $stmt = $db->prepare("DELETE FROM buildings WHERE id = ?");
        $stmt->execute([$buildingId]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Bina bulunamadı']);
            exit;
        }
        
        echo json_encode(['success' => true, 'message' => 'Bina silindi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
