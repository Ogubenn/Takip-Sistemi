<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$db = getDB();

// GET all checklist items or for specific building
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $buildingId = $_GET['building_id'] ?? null;
    
    try {
        if ($buildingId) {
            // Get items for specific building
            $stmt = $db->prepare("SELECT * FROM checklist_items WHERE building_id = ? AND is_active = 1 ORDER BY item_order");
            $stmt->execute([$buildingId]);
        } else {
            // Get all items
            $stmt = $db->query("SELECT ci.*, b.name as building_name 
                               FROM checklist_items ci 
                               LEFT JOIN buildings b ON ci.building_id = b.id 
                               WHERE ci.is_active = 1 
                               ORDER BY ci.building_id, ci.item_order");
        }
        
        $items = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'items' => $items
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

// POST new checklist item (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['building_id']) || !isset($input['item_text'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina ID ve madde metni zorunludur']);
        exit;
    }
    
    try {
        // Get max order for this building
        $stmt = $db->prepare("SELECT COALESCE(MAX(item_order), 0) + 1 as next_order FROM checklist_items WHERE building_id = ?");
        $stmt->execute([$input['building_id']]);
        $nextOrder = $stmt->fetch()['next_order'];
        
        // Insert item
        $stmt = $db->prepare("INSERT INTO checklist_items (building_id, item_text, item_order, is_active) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $input['building_id'],
            $input['item_text'],
            $input['item_order'] ?? $nextOrder,
            $input['is_active'] ?? 1
        ]);
        
        $itemId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Kontrol maddesi eklendi',
            'item_id' => $itemId
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

// PUT update checklist item (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = requireAdmin();
    $itemId = $_GET['id'] ?? null;
    
    if (!$itemId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Madde ID gerekli']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        $updates = [];
        $params = [];
        
        if (isset($input['item_text'])) {
            $updates[] = "item_text = ?";
            $params[] = $input['item_text'];
        }
        
        if (isset($input['item_order'])) {
            $updates[] = "item_order = ?";
            $params[] = $input['item_order'];
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
        $params[] = $itemId;
        
        $sql = "UPDATE checklist_items SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Kontrol maddesi güncellendi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE checklist item (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireAdmin();
    $itemId = $_GET['id'] ?? null;
    
    if (!$itemId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Madde ID gerekli']);
        exit;
    }
    
    try {
        // Soft delete
        $stmt = $db->prepare("UPDATE checklist_items SET is_active = 0, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$itemId]);
        
        echo json_encode(['success' => true, 'message' => 'Kontrol maddesi silindi']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
