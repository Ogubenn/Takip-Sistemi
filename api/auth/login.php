<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Kullanıcı adı ve şifre gerekli'
    ]);
    exit;
}

$username = $input['username'];
$password = $input['password'];
$rememberMe = $input['rememberMe'] ?? false;

try {
    $db = getDB();
    
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz kullanıcı adı veya şifre'
        ]);
        exit;
    }
    
    // Verify password (bcrypt)
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz kullanıcı adı veya şifre'
        ]);
        exit;
    }
    
    // Update last login
    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Create JWT
    $expiresIn = $rememberMe ? (7 * 24 * 60 * 60) : (24 * 60 * 60); // 7 days or 1 day
    $payload = [
        'id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'fullName' => $user['full_name'],
        'exp' => time() + $expiresIn
    ];
    
    $token = generateJWT($payload);
    
    echo json_encode([
        'success' => true,
        'message' => 'Giriş başarılı',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'fullName' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sunucu hatası'
    ]);
}
