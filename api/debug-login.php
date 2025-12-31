<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';

// Login test
$testUsername = 'ogu';
$testPassword = '10031317534.Og';

try {
    $db = getDB();
    
    echo "=== LOGIN DEBUG ===\n\n";
    
    // 1. Kullanıcıyı ara
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$testUsername]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "❌ HATA: Kullanıcı bulunamadı!\n";
        echo "Aranan kullanıcı adı: " . $testUsername . "\n\n";
        
        // Tüm kullanıcıları göster
        $stmt = $db->query("SELECT id, username, full_name FROM users");
        $allUsers = $stmt->fetchAll();
        echo "Database'deki kullanıcılar:\n";
        foreach ($allUsers as $u) {
            echo "- ID: {$u['id']}, Username: {$u['username']}, Name: {$u['full_name']}\n";
        }
        exit;
    }
    
    echo "✅ Kullanıcı bulundu!\n";
    echo "ID: " . $user['id'] . "\n";
    echo "Username: " . $user['username'] . "\n";
    echo "Full Name: " . $user['full_name'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    echo "Active: " . ($user['is_active'] ? 'Evet' : 'Hayır') . "\n\n";
    
    // 2. Şifre kontrolü
    echo "=== ŞİFRE KONTROLÜ ===\n";
    echo "Girilen şifre: " . $testPassword . "\n";
    echo "Database'deki hash: " . substr($user['password_hash'], 0, 30) . "...\n";
    
    if (password_verify($testPassword, $user['password_hash'])) {
        echo "✅ ŞİFRE DOĞRU!\n";
        echo "\n🎉 GİRİŞ BAŞARILI! Sistem çalışıyor.\n";
    } else {
        echo "❌ ŞİFRE YANLIŞ!\n\n";
        
        // Yeni hash oluştur
        $newHash = password_hash($testPassword, PASSWORD_BCRYPT);
        echo "Yeni hash oluşturuldu:\n";
        echo $newHash . "\n\n";
        
        echo "SQL Komutu:\n";
        echo "UPDATE users SET password_hash = '$newHash' WHERE username = '$testUsername';\n";
    }
    
} catch (Exception $e) {
    echo "❌ HATA: " . $e->getMessage() . "\n";
}
?>
