<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/api_helper.php';

$db = getDB();

// GET all users (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = requireAdmin();
    
    try {
        // Option to filter by is_active (default: show all)
        $filterActive = isset($_GET['active_only']) && $_GET['active_only'] === 'true';
        
        if ($filterActive) {
            $stmt = $db->query("SELECT id, username, full_name, email, role, is_active, last_login FROM users WHERE is_active = 1 ORDER BY id DESC");
        } else {
            $stmt = $db->query("SELECT id, username, full_name, email, role, is_active, last_login FROM users ORDER BY is_active DESC, id DESC");
        }
        
        $users = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'users' => $users,
            'total' => count($users)
        ]);
    } catch (Exception $e) {
        apiServerError('Kullanıcılar yüklenemedi: ' . $e->getMessage(), $e);
    }
    exit;
}

// POST new user (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = requireAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Kullanıcı adı ve şifre gerekli']);
        exit;
    }
    
    try {
        // Check if username exists (case-insensitive) - sadece aktif kullanıcılarda
        $stmt = $db->prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND is_active = 1");
        $stmt->execute([$input['username']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Bu kullanıcı adı zaten kullanılıyor']);
            exit;
        }
        
        // Check if email exists (if provided, case-insensitive) - sadece aktif kullanıcılarda
        if (!empty($input['email'])) {
            $stmt = $db->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND is_active = 1");
            $stmt->execute([$input['email']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kullanılıyor']);
                exit;
            }
        }
        
        // Hash password
        $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);
        
        // Insert user
        $stmt = $db->prepare("INSERT INTO users (username, password_hash, full_name, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['username'],
            $hashedPassword,
            $input['full_name'] ?? null,
            $input['email'] ?? null,
            $input['role'] ?? 'user',
            $input['is_active'] ?? 1
        ]);
        
        $userId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Kullanıcı başarıyla oluşturuldu',
            'user_id' => $userId
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        $errorMessage = $e->getMessage();
        
        // Duplicate entry hatası için özel mesaj
        if (strpos($errorMessage, 'Duplicate entry') !== false) {
            if (strpos($errorMessage, 'username') !== false) {
                echo json_encode(['success' => false, 'message' => 'Bu kullanıcı adı zaten kullanılıyor']);
            } else if (strpos($errorMessage, 'email') !== false) {
                echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kullanılıyor']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Bu bilgiler zaten kayıtlı']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $errorMessage]);
        }
    }
    exit;
}

// PUT update user (Admin only)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $user = requireAdmin();
    $userId = $_GET['id'] ?? null;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Kullanıcı ID gerekli']);
        exit;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Build update query dynamically
        $updates = [];
        $params = [];
        
        if (isset($input['username'])) {
            // Check if username already exists (for other active users)
            $stmt = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ? AND is_active = 1");
            $stmt->execute([$input['username'], $userId]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.']);
                exit;
            }
            $updates[] = "username = ?";
            $params[] = $input['username'];
        }
        
        if (isset($input['password']) && !empty($input['password'])) {
            $updates[] = "password_hash = ?";
            $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
        }
        
        if (isset($input['full_name'])) {
            $updates[] = "full_name = ?";
            $params[] = $input['full_name'];
        }
        
        if (isset($input['email'])) {
            // Check if email already exists (for other active users)
            if (!empty($input['email'])) {
                $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ? AND is_active = 1");
                $stmt->execute([$input['email'], $userId]);
                if ($stmt->fetch()) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta adresi seçin.']);
                    exit;
                }
            }
            $updates[] = "email = ?";
            $params[] = $input['email'];
        }
        
        if (isset($input['role'])) {
            $updates[] = "role = ?";
            $params[] = $input['role'];
        }
        
        if (isset($input['is_active'])) {
            $updates[] = "is_active = ?";
            $params[] = $input['is_active'];
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Güncellenecek alan belirtilmedi']);
            exit;
        }
        
        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode([
            'success' => true,
            'message' => 'Kullanıcı başarıyla güncellendi'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        // Check for duplicate username error
        if (strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'username') !== false) {
            echo json_encode(['success' => false, 'message' => 'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.']);
        } elseif (strpos($e->getMessage(), 'Duplicate entry') !== false && strpos($e->getMessage(), 'email') !== false) {
            echo json_encode(['success' => false, 'message' => 'Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta adresi seçin.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Sunucu hatası: ' . $e->getMessage()]);
        }
    }
    exit;
}

// DELETE user (Admin only) - SOFT DELETE
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $user = requireAdmin();
    $userId = $_GET['id'] ?? null;
    
    if (!$userId) {
        apiError('Kullanıcı ID gerekli', 400);
    }
    
    // Prevent deleting own account
    if ($user['id'] == $userId) {
        apiError('Kendi hesabınızı devre dışı bırakamazsınız', 400);
    }
    
    try {
        // Check if user exists
        $stmt = $db->prepare("SELECT id, username, is_active FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $targetUser = $stmt->fetch();
        
        if (!$targetUser) {
            apiNotFound('Kullanıcı');
        }
        
        if ($targetUser['is_active'] == 0) {
            apiError('Bu kullanıcı zaten devre dışı', 400);
        }
        
        // Soft delete: set is_active to 0
        $stmt = $db->prepare("UPDATE users SET is_active = 0 WHERE id = ?");
        $stmt->execute([$userId]);
        
        apiSuccess(
            ['user_id' => $userId, 'username' => $targetUser['username']], 
            'Kullanıcı başarıyla devre dışı bırakıldı'
        );
    } catch (Exception $e) {
        apiServerError('Kullanıcı devre dışı bırakılamadı: ' . $e->getMessage(), $e);
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
