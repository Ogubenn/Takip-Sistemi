-- ============================================
-- KRİTİK SORUN ÇÖZÜM - HEPSİNİ BİRLİKTE ÇALIŞTIR
-- Tarih: 2026-01-03
-- Açıklama: Tüm veritabanı sorunlarını tek seferde çöz
-- ============================================

-- KULLANIM: Bu dosyanın TAMAMINI phpMyAdmin'de çalıştır

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. UNIQUE CONSTRAINT KALDIR (EN KRİTİK!)
-- ============================================
-- Soft delete için username UNIQUE olmamalı

-- UNIQUE constraint'i kaldır (hata verirse devam et)
ALTER TABLE users DROP INDEX username;

-- Normal index ekle (performans için, hata verirse devam et)
CREATE INDEX idx_username_lookup ON users(username);

-- ============================================
-- 2. control_records.user_id NULL YAPILABİLİR
-- ============================================
-- Anonim kontroller için

ALTER TABLE control_records 
MODIFY COLUMN user_id INT NULL 
COMMENT 'Anonim kontroller için NULL olabilir';

-- ============================================
-- 3. buildings.image_path EKLE (varsa hata normal)
-- ============================================

ALTER TABLE buildings 
ADD COLUMN image_path VARCHAR(500) NULL COMMENT 'Bina fotoğraf yolu' 
AFTER icon;

-- ============================================
-- 4. users TIMESTAMP KOLONLARI EKLE (varsa hata normal)
-- ============================================

ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================
-- 5. PERFORMANS İNDEXLERİ
-- ============================================

CREATE INDEX idx_control_date ON control_records(control_date);
CREATE INDEX idx_user_active ON users(is_active);
CREATE INDEX idx_building_active ON buildings(is_active);
CREATE INDEX idx_building_image ON buildings(image_path);
CREATE INDEX idx_checklist_order ON checklist_items(building_id, item_order, is_active);
CREATE INDEX idx_user_role ON users(role, is_active);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DOĞRULAMA - HEPSİNİ KONTROL ET
-- ============================================

SELECT '==================== DOĞRULAMA BAŞLADI ====================' as status;

-- 1. UNIQUE constraint kalktı mı?
SELECT 
    '1. UNIQUE Constraint' as test,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ TAMAM - UNIQUE kaldırıldı'
        ELSE '❌ HATA - UNIQUE hala var'
    END as sonuc
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'users'
AND CONSTRAINT_TYPE = 'UNIQUE'
AND CONSTRAINT_NAME LIKE '%username%';

-- 2. user_id NULL olabilir mi?
SELECT 
    '2. control_records.user_id' as test,
    CASE 
        WHEN IS_NULLABLE = 'YES' THEN '✅ TAMAM - NULL olabilir'
        ELSE '❌ HATA - NOT NULL'
    END as sonuc,
    COLUMN_TYPE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'control_records' 
AND COLUMN_NAME = 'user_id';

-- 3. image_path var mı?
SELECT 
    '3. buildings.image_path' as test,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ TAMAM - Kolon var'
        ELSE '❌ HATA - Kolon yok'
    END as sonuc,
    COLUMN_TYPE
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'buildings' 
AND COLUMN_NAME = 'image_path';

-- 4. timestamp kolonları var mı?
SELECT 
    '4. users.created_at' as test,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ TAMAM'
        ELSE '❌ HATA'
    END as sonuc
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'created_at';

SELECT 
    '5. users.updated_at' as test,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ TAMAM'
        ELSE '❌ HATA'
    END as sonuc
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'updated_at';

-- 6. İndexler oluşturuldu mu?
SELECT 
    '6. Performance İndexler' as test,
    COUNT(*) as index_sayisi,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ TAMAM - Tüm indexler var'
        ELSE '⚠️ DİKKAT - Bazı indexler eksik'
    END as sonuc
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND INDEX_NAME IN (
    'idx_control_date',
    'idx_user_active',
    'idx_building_active',
    'idx_building_image',
    'idx_checklist_order',
    'idx_user_role'
);

SELECT '==================== DOĞRULAMA BİTTİ ====================' as status;

-- Tüm sonuçlarda ✅ görüyorsan BAŞARILI!
-- ❌ varsa o sorguyu tekrar çalıştır
