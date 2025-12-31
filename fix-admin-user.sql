-- Admin kullanıcısı oluşturma
-- Kullanıcı adı: ogu
-- Şifre: 10031317534.Og

-- NOT: Şifre hash'ini generate-hash.php ile oluştur ve buraya yapıştır
-- Şu an placeholder hash kullanılıyor - gerçek hash için generate-hash.php'yi çalıştır

-- Önce mevcut kullanıcıyı sil (varsa)
DELETE FROM users WHERE username = 'ogu';

-- Yeni kullanıcı ekle
INSERT INTO users (username, password_hash, full_name, email, role, is_active) 
VALUES (
    'ogu',
    'HASH_BURAYA_GELECEK',
    'Oğulcan Durkan',
    'ogu@bulancak.bel.tr',
    'admin',
    1
);

-- Kontrol et
SELECT id, username, full_name, email, role, is_active, created_at 
FROM users 
WHERE username = 'ogu';
