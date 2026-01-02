<?php
require_once __DIR__ . '/../config/database.php';

// Public endpoint - no authentication required
$db = getDB();

$year = $_GET['year'] ?? date('Y');
$month = $_GET['month'] ?? null;

try {
    // Aktif bina sayısı
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM buildings WHERE is_active = 1");
    $stmt->execute();
    $totalBuildings = $stmt->fetch()['count'];
    
    // Günlük kontrol durumunu getir
    $sql = "SELECT 
                control_date,
                COUNT(DISTINCT building_id) as completed_buildings,
                AVG(completion_rate) as avg_completion
            FROM control_records
            WHERE YEAR(control_date) = ?";
    
    $params = [$year];
    
    if ($month) {
        $sql .= " AND MONTH(control_date) = ?";
        $params[] = $month;
    }
    
    $sql .= " GROUP BY control_date";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();
    
    // Günlük verileri işle
    $calendar = [];
    foreach ($records as $record) {
        $date = $record['control_date'];
        $completedBuildings = (int)$record['completed_buildings'];
        $avgCompletion = round($record['avg_completion'], 1);
        
        // Renk kodlaması
        // Yeşil: Tüm binalar kontrol edildi (%100 completion)
        // Sarı: Bazı binalar kontrol edildi veya tamamlanma < %80
        // Kırmızı: Hiç kontrol yok
        
        if ($completedBuildings >= $totalBuildings && $avgCompletion >= 80) {
            $status = 'complete'; // Yeşil
        } elseif ($completedBuildings > 0) {
            $status = 'partial'; // Sarı
        } else {
            $status = 'none'; // Kırmızı
        }
        
        $calendar[$date] = [
            'date' => $date,
            'status' => $status,
            'completed_buildings' => $completedBuildings,
            'total_buildings' => $totalBuildings,
            'avg_completion' => $avgCompletion
        ];
    }
    
    echo json_encode([
        'success' => true,
        'year' => (int)$year,
        'month' => $month ? (int)$month : null,
        'total_buildings' => $totalBuildings,
        'calendar' => $calendar
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
}
