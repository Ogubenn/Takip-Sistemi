<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

$db = getDB();

// GET controls with filtering
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireAuth();
    
    $buildingId = $_GET['buildingId'] ?? null;
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $userId = $_GET['userId'] ?? null;
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);
    
    try {
        $sql = "SELECT c.*, b.name as building_name, b.icon as building_icon, u.full_name as user_full_name 
                FROM control_records c 
                LEFT JOIN buildings b ON c.building_id = b.id 
                LEFT JOIN users u ON c.user_id = u.id 
                WHERE 1=1";
        $params = [];
        
        if ($buildingId) {
            $sql .= " AND c.building_id = ?";
            $params[] = $buildingId;
        }
        if ($startDate) {
            $sql .= " AND c.control_date >= ?";
            $params[] = $startDate;
        }
        if ($endDate) {
            $sql .= " AND c.control_date <= ?";
            $params[] = $endDate;
        }
        if ($userId) {
            $sql .= " AND c.user_id = ?";
            $params[] = $userId;
        }
        
        $sql .= " ORDER BY c.control_date DESC, c.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $controls = $stmt->fetchAll();
        
        // Parse JSON checked_items
        foreach ($controls as &$control) {
            $control['checked_items'] = json_decode($control['checked_items'], true);
        }
        
        echo json_encode([
            'success' => true,
            'controls' => $controls,
            'count' => count($controls)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
    }
    exit;
}

// POST new control (Operator+)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireOperator();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['buildingId']) || !isset($input['controlDate']) || !isset($input['checkedItems'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina, tarih ve kontrol maddeleri zorunludur']);
        exit;
    }
    
    try {
        $checkedCount = count($input['checkedItems']);
        $completionRate = $checkedCount > 0 ? 100 : 0;
        
        $stmt = $db->prepare("INSERT INTO control_records (building_id, user_id, control_date, checked_items, notes, checked_count, completion_rate) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['buildingId'],
            $user['id'],
            $input['controlDate'],
            json_encode($input['checkedItems']),
            $input['notes'] ?? '',
            $checkedCount,
            $completionRate
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Kontrol kaydı oluşturuldu',
            'controlId' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bu bina için bugün zaten kontrol kaydı var']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
