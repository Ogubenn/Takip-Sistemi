<?php
require_once __DIR__ . '/database.php';

// JWT Helper Functions
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function generateJWT($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    $payload = json_encode($payload);
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return false;
    }
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    
    $signature = base64url_decode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    $payload = json_decode(base64url_decode($base64UrlPayload), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

function getBearerToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

function requireAuth() {
    $token = getBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Token bulunamadı'
        ]);
        exit;
    }
    
    $payload = verifyJWT($token);
    
    if (!$payload) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Geçersiz veya süresi dolmuş token'
        ]);
        exit;
    }
    
    return $payload;
}

function requireAdmin() {
    $user = requireAuth();
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Bu işlem için admin yetkisi gerekli'
        ]);
        exit;
    }
    
    return $user;
}

function requireOperator() {
    $user = requireAuth();
    
    if ($user['role'] !== 'admin' && $user['role'] !== 'operator') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Bu işlem için operatör veya admin yetkisi gerekli'
        ]);
        exit;
    }
    
    return $user;
}
