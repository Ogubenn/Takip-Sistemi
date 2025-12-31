<?php
require_once __DIR__ . '/../config/database.php';

// Public endpoint - no authentication required
$db = getDB();

try {
    // Total controls
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records");
    $totalControls = $stmt->fetch()['count'];
    
    // Monthly controls
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records WHERE MONTH(control_date) = MONTH(CURRENT_DATE) AND YEAR(control_date) = YEAR(CURRENT_DATE)");
    $monthlyControls = $stmt->fetch()['count'];
    
    // Today controls
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records WHERE control_date = CURDATE()");
    $todayControls = $stmt->fetch()['count'];
    
    // Average completion rate
    $stmt = $db->query("SELECT AVG(completion_rate) as avg_rate FROM control_records");
    $avgCompletion = round($stmt->fetch()['avg_rate'] ?? 0);
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'totalControls' => (int)$totalControls,
            'monthlyControls' => (int)$monthlyControls,
            'todayControls' => (int)$todayControls,
            'avgCompletionRate' => (int)$avgCompletion
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası']);
}
