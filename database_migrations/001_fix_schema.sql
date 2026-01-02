-- ============================================
-- Migration Script #001: Schema Fixes
-- Tarih: 2026-01-02
-- Açıklama: Kritik veritabanı şema düzeltmeleri
-- ============================================

-- BACKUP KONTROLÜ
-- Bu script'i çalıştırmadan önce mutlaka backup alın:
-- mysqldump -u ogubenn_atiksi_db -p ogubenn_atiksi_db > backup_20260102.sql

-- ============================================
-- 1. control_records.user_id NULL yapılabilir yap
-- ============================================
-- Sorun: Anonim kontroller kaydedilemiyor çünkü user_id NOT NULL
-- Çözüm: NULL yapılabilir hale getir

ALTER TABLE control_records 
MODIFY COLUMN user_id INT NULL 
COMMENT 'Anonim kontroller için NULL olabilir. Frontend user_id göndermezse NULL kalır.';

-- ============================================
-- 2. buildings.image_path kolonu ekle
-- ============================================
-- Sorun: Bina fotoğrafı yükleme özelliği eklenmiş ama veritabanında kolon yok
-- Çözüm: image_path kolonunu ekle
-- NOT: Eğer kolon zaten varsa hata verecektir, bu normaldir

ALTER TABLE buildings 
ADD COLUMN image_path VARCHAR(500) NULL COMMENT 'Bina fotoğraf dosya yolu. Örnek: assets/images/buildings/building123.jpg' 
AFTER icon;

-- ============================================
-- 3. users tablosuna timestamp kolonları ekle
-- ============================================
-- Sorun: created_at ve updated_at kolonları frontend'te gösterilemiyor
-- Çözüm: Bu kolonları ekle
-- NOT: Eğer kolonlar zaten varsa hata verecektir, bu normaldir

ALTER TABLE users 
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Kullanıcının sisteme eklenme tarihi',
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Kullanıcının son güncellenme tarihi';

-- ============================================
-- 4. Performance için indexler ekle
-- ============================================
-- Bu indexler sorgu performansını önemli ölçüde artırır
-- NOT: Eğer index zaten varsa hata verecektir, bu normaldir

-- Control records tarih bazlı sorgular için
CREATE INDEX idx_control_date 
ON control_records(control_date);

-- Aktif kullanıcı kontrolü için
CREATE INDEX idx_user_active 
ON users(is_active);

-- Aktif bina kontrolü için
CREATE INDEX idx_building_active 
ON buildings(is_active);

-- Bina fotoğrafı var/yok kontrolü için
CREATE INDEX idx_building_image 
ON buildings(image_path);

-- Checklist item sıralaması için
CREATE INDEX idx_checklist_order 
ON checklist_items(building_id, item_order, is_active);

-- User role bazlı sorgular için
CREATE INDEX idx_user_role 
ON users(role, is_active);

-- ============================================
-- DOĞRULAMA SORULARI
-- ============================================
-- Migration'ın başarılı olup olmadığını kontrol edin

-- 1. control_records.user_id NULL mi?
SELECT 
    'control_records.user_id CHECK' as test_name,
    CASE 
        WHEN IS_NULLABLE = 'YES' THEN '✅ BAŞARILI - NULL olabilir'
        ELSE '❌ BAŞARISIZ - Hala NOT NULL'
    END as result,
    COLUMN_TYPE as data_type
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'control_records' 
AND COLUMN_NAME = 'user_id';

-- 2. buildings.image_path var mı?
SELECT 
    'buildings.image_path CHECK' as test_name,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ BAŞARILI - Kolon mevcut'
        ELSE '❌ BAŞARISIZ - Kolon yok'
    END as result,
    COLUMN_TYPE as data_type
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'buildings' 
AND COLUMN_NAME = 'image_path';

-- 3. users.created_at var mı?
SELECT 
    'users.created_at CHECK' as test_name,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ BAŞARILI - Kolon mevcut'
        ELSE '❌ BAŞARISIZ - Kolon yok'
    END as result,
    COLUMN_TYPE as data_type
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'created_at';

-- 4. users.updated_at var mı?
SELECT 
    'users.updated_at CHECK' as test_name,
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✅ BAŞARILI - Kolon mevcut'
        ELSE '❌ BAŞARISIZ - Kolon yok'
    END as result,
    COLUMN_TYPE as data_type
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'updated_at';

-- 5. Tüm indexler oluşturuldu mu?
SELECT 
    'INDEX CHECK' as test_name,
    TABLE_NAME,
    INDEX_NAME,
    '✅ Mevcut' as result
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND INDEX_NAME IN (
    'idx_control_date',
    'idx_user_active',
    'idx_building_active',
    'idx_building_image',
    'idx_checklist_order',
    'idx_user_role'
)
ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================
-- OPSIYONEL: VERİ KONTROLÜ
-- ============================================
-- Migration sonrası veri tutarlılığını kontrol edin

-- Anonim kontrol kayıtları var mı?
SELECT 
    'Anonim kontrol sayısı' as bilgi,
    COUNT(*) as adet
FROM control_records 
WHERE user_id IS NULL;

-- Fotoğrafı olan binalar
SELECT 
    'Fotoğrafı olan bina sayısı' as bilgi,
    COUNT(*) as adet
FROM buildings 
WHERE image_path IS NOT NULL AND image_path != '';

-- Kullanıcı oluşturma tarihleri
SELECT 
    'En eski kullanıcı' as bilgi,
    username,
    created_at
FROM users 
WHERE created_at IS NOT NULL
ORDER BY created_at ASC 
LIMIT 1;

-- ============================================
-- BAŞARI MESAJI
-- ============================================
SELECT 
    '🎉 Migration tamamlandı!' as mesaj,
    'Yukarıdaki doğrulama sorgularını kontrol edin.' as not_bilgi,
    'Tüm ✅ işaretleri görüyorsanız migration başarılı!' as durum;

-- ============================================
-- ROLLBACK (ACİL DURUM)
-- ============================================
-- Eğer bir şeyler ters giderse bu komutları kullanın:

-- ALTER TABLE control_records MODIFY COLUMN user_id INT NOT NULL;
-- ALTER TABLE buildings DROP COLUMN image_path;
-- ALTER TABLE users DROP COLUMN created_at;
-- ALTER TABLE users DROP COLUMN updated_at;
-- DROP INDEX idx_control_date ON control_records;
-- DROP INDEX idx_user_active ON users;
-- DROP INDEX idx_building_active ON buildings;
-- DROP INDEX idx_building_image ON buildings;
-- DROP INDEX idx_checklist_order ON checklist_items;
-- DROP INDEX idx_user_role ON users;
