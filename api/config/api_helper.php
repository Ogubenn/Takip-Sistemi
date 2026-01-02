<?php
/**
 * API Helper Functions
 * Tutarlı response formatı ve error handling için
 * 
 * @package Bulancak Atıksu Takip Sistemi
 * @version 1.0.0
 * @date 2026-01-02
 */

/**
 * Başarılı API response döndür
 * 
 * @param mixed $data Response data
 * @param string $message Success message
 * @param int $code HTTP status code
 */
function apiSuccess($data = [], $message = 'İşlem başarılı', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Hata API response döndür
 * 
 * @param string $message Error message
 * @param int $code HTTP status code
 * @param array $errors Additional error details
 */
function apiError($message = 'Bir hata oluştu', $code = 400, $errors = []) {
    http_response_code($code);
    $response = [
        'success' => false,
        'message' => $message,
        'timestamp' => time()
    ];
    
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Validation hatası döndür (422)
 * 
 * @param array $errors Validation errors array
 */
function apiValidationError($errors = []) {
    apiError('Doğrulama hatası', 422, $errors);
}

/**
 * Kayıt bulunamadı hatası döndür (404)
 * 
 * @param string $resource Resource name
 */
function apiNotFound($resource = 'Kayıt') {
    apiError($resource . ' bulunamadı', 404);
}

/**
 * Yetkilendirme hatası döndür (401)
 * 
 * @param string $message Custom message
 */
function apiUnauthorized($message = 'Yetkilendirme gerekli') {
    apiError($message, 401);
}

/**
 * Erişim engellendi hatası döndür (403)
 * 
 * @param string $message Custom message
 */
function apiForbidden($message = 'Bu işlem için yetkiniz yok') {
    apiError($message, 403);
}

/**
 * Sunucu hatası döndür (500)
 * 
 * @param string $message Custom message
 * @param Exception $exception Exception object (optional)
 */
function apiServerError($message = 'Sunucu hatası', $exception = null) {
    // Log exception if provided
    if ($exception && defined('DEBUG') && DEBUG === true) {
        error_log('API Server Error: ' . $exception->getMessage());
        error_log('Stack trace: ' . $exception->getTraceAsString());
    }
    
    apiError($message, 500);
}

/**
 * Input validation helper
 * 
 * @param array $input Input data
 * @param array $required Required fields
 * @return array Validation errors (empty if valid)
 */
function validateRequired($input, $required) {
    $errors = [];
    
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            $errors[$field] = ucfirst($field) . ' alanı gereklidir';
        }
    }
    
    return $errors;
}

/**
 * Email validation
 * 
 * @param string $email Email address
 * @return bool
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize string input
 * 
 * @param string $input Input string
 * @return string Sanitized string
 */
function sanitizeString($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

/**
 * Get request input (JSON or POST)
 * 
 * @return array Input data
 */
function getRequestInput() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Fallback to POST if JSON decode fails
    if (json_last_error() !== JSON_ERROR_NONE) {
        $input = $_POST;
    }
    
    return $input ?: [];
}

/**
 * Pagination helper
 * 
 * @param int $total Total records
 * @param int $page Current page
 * @param int $limit Records per page
 * @return array Pagination data
 */
function getPagination($total, $page = 1, $limit = 20) {
    $page = max(1, (int)$page);
    $limit = max(1, min(100, (int)$limit));
    $offset = ($page - 1) * $limit;
    $totalPages = ceil($total / $limit);
    
    return [
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset,
        'totalPages' => $totalPages,
        'hasNext' => $page < $totalPages,
        'hasPrev' => $page > 1
    ];
}

/**
 * Log API request (optional - for debugging)
 * 
 * @param string $endpoint Endpoint name
 * @param string $method HTTP method
 * @param array $data Request data
 */
function logApiRequest($endpoint, $method, $data = []) {
    if (defined('DEBUG') && DEBUG === true) {
        $log = [
            'timestamp' => date('Y-m-d H:i:s'),
            'endpoint' => $endpoint,
            'method' => $method,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'data' => $data
        ];
        
        error_log('API Request: ' . json_encode($log));
    }
}
