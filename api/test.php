<?php
// Basit test dosyası
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'OK',
    'message' => 'API Çalışıyor! 🎉',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_NAME']
]);
