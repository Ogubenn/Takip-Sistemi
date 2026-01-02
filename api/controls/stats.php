<?php
require_once __DIR__ . '/../config/database.php';

// Public endpoint - no authentication required
$db = getDB();

$period = $_GET['period'] ?? 'all';

try {
    // Total controls
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records");
    $totalControls = $stmt->fetch()['count'];
    
    // Monthly controls (current month)
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records WHERE MONTH(control_date) = MONTH(CURRENT_DATE) AND YEAR(control_date) = YEAR(CURRENT_DATE)");
    $monthlyControls = $stmt->fetch()['count'];
    
    // Weekly controls
    $stmt = $db->query("SELECT COUNT(*) as count FROM control_records WHERE YEARWEEK(control_date, 1) = YEARWEEK(CURDATE(), 1)");
    $weeklyControls = $stmt->fetch()['count'];
    
    // Today's controls with full details
    $stmt = $db->query("SELECT c.*, b.name as building_name, b.icon as building_icon 
                        FROM control_records c 
                        LEFT JOIN buildings b ON c.building_id = b.id 
                        WHERE c.control_date = CURDATE()
                        ORDER BY c.created_at DESC");
    $todayControls = $stmt->fetchAll();
    
    // Average completion rate
    $stmt = $db->query("SELECT AVG(completion_rate) as avg_rate FROM control_records");
    $avgCompletionRate = round($stmt->fetch()['avg_rate'] ?? 0, 1);
    
    // Building statistics
    $stmt = $db->query("SELECT 
                            b.id, 
                            b.name, 
                            b.icon,
                            COUNT(c.id) as total_controls,
                            AVG(c.completion_rate) as avg_completion,
                            MAX(c.control_date) as last_control
                        FROM buildings b
                        LEFT JOIN control_records c ON b.id = c.building_id
                        WHERE b.is_active = 1
                        GROUP BY b.id, b.name, b.icon
                        ORDER BY total_controls DESC");
    $buildingStats = $stmt->fetchAll();
    
    // Monthly trend (last 6 months)
    $stmt = $db->query("SELECT 
                            DATE_FORMAT(control_date, '%Y-%m') as month,
                            COUNT(*) as count,
                            AVG(completion_rate) as avg_completion
                        FROM control_records
                        WHERE control_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                        GROUP BY DATE_FORMAT(control_date, '%Y-%m')
                        ORDER BY month ASC");
    $monthlyTrend = $stmt->fetchAll();
    
    // Daily trend (last 30 days)
    $stmt = $db->query("SELECT 
                            control_date,
                            COUNT(*) as count,
                            AVG(completion_rate) as avg_completion
                        FROM control_records
                        WHERE control_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                        GROUP BY control_date
                        ORDER BY control_date ASC");
    $dailyTrend = $stmt->fetchAll();
    
    // Active buildings count
    $stmt = $db->query("SELECT COUNT(*) as count FROM buildings WHERE is_active = 1");
    $activeBuildings = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'totalControls' => (int)$totalControls,
        'monthlyControls' => (int)$monthlyControls,
        'weeklyControls' => (int)$weeklyControls,
        'todayControls' => $todayControls,
        'avgCompletionRate' => (float)$avgCompletionRate,
        'buildingStats' => $buildingStats,
        'monthlyTrend' => $monthlyTrend,
        'dailyTrend' => $dailyTrend,
        'activeBuildings' => (int)$activeBuildings
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
}
