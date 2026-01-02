<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

// Sadece admin yükleyebilir
$user = requireAdmin();

$db = getDB();

// POST - Upload building image
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $buildingId = $_POST['buildingId'] ?? null;
    
    if (!$buildingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina ID gerekli']);
        exit;
    }
    
    // Dosya kontrolü
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Lütfen bir resim dosyası seçin']);
        exit;
    }
    
    $file = $_FILES['image'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    
    // Dosya uzantısı kontrolü
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!in_array($fileExt, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Sadece JPG, PNG, GIF ve WEBP dosyaları yüklenebilir']);
        exit;
    }
    
    // Dosya boyutu kontrolü (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($fileSize > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dosya boyutu 5MB\'dan büyük olamaz']);
        exit;
    }
    
    // Resim dosyası mı kontrol et
    $imageInfo = getimagesize($fileTmpName);
    if ($imageInfo === false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz resim dosyası']);
        exit;
    }
    
    try {
        // Upload klasörünü oluştur
        $uploadDir = __DIR__ . '/../../assets/images/buildings/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Benzersiz dosya adı oluştur
        $newFileName = 'building_' . $buildingId . '_' . time() . '.' . $fileExt;
        $destination = $uploadDir . $newFileName;
        
        // Eski resmi sil (varsa)
        $stmt = $db->prepare("SELECT image_path FROM buildings WHERE id = ?");
        $stmt->execute([$buildingId]);
        $oldImage = $stmt->fetch();
        
        if ($oldImage && $oldImage['image_path']) {
            $oldImagePath = __DIR__ . '/../../' . $oldImage['image_path'];
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }
        
        // Dosyayı taşı
        if (!move_uploaded_file($fileTmpName, $destination)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Dosya yüklenirken hata oluştu']);
            exit;
        }
        
        // Veritabanında image_path'i güncelle
        $imagePath = 'assets/images/buildings/' . $newFileName;
        $stmt = $db->prepare("UPDATE buildings SET image_path = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$imagePath, $buildingId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Resim başarıyla yüklendi',
            'imagePath' => $imagePath,
            'imageUrl' => '/' . $imagePath
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE - Remove building image
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $input);
    $buildingId = $input['buildingId'] ?? $_GET['buildingId'] ?? null;
    
    if (!$buildingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bina ID gerekli']);
        exit;
    }
    
    try {
        // Eski resmi sil
        $stmt = $db->prepare("SELECT image_path FROM buildings WHERE id = ?");
        $stmt->execute([$buildingId]);
        $image = $stmt->fetch();
        
        if ($image && $image['image_path']) {
            $imagePath = __DIR__ . '/../../' . $image['image_path'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        // Veritabanında image_path'i temizle
        $stmt = $db->prepare("UPDATE buildings SET image_path = NULL, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$buildingId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Resim silindi'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
