<?php
// Şifre hash generator
$password = '10031317534.Og';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Şifre: " . $password . "\n";
echo "Hash: " . $hash . "\n";
echo "\n";
echo "SQL Komutu:\n";
echo "DELETE FROM users WHERE username = 'ogu';\n";
echo "INSERT INTO users (username, password_hash, full_name, email, role, is_active) VALUES ('ogu', '$hash', 'Oğulcan Durkan', 'ogu@bulancak.bel.tr', 'admin', 1);\n";
?>
