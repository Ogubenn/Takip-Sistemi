-- ============================================
-- ACİL VERİTABANI RESTORE - KRİTİK VERİLER
-- Tarih: 2026-01-03
-- Açıklama: Silinen verileri geri yükle
-- ============================================

-- KULLANIM: Bu dosyanın TAMAMINI phpMyAdmin'de çalıştır

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. ADMIN KULLANICI OLUŞTUR (ÖNCELİK!)
-- ============================================

INSERT INTO users (username, password, email, full_name, role, is_active, created_at, updated_at) VALUES
('admin', '$2y$10$rZ8qGHQjK5JF7d3YrVvVOeq8YF8WbN9GKY9vNJ5xQ7F5LzKqvQxsq', 'admin@bulancak.com', 'Sistem Yöneticisi', 'admin', 1, NOW(), NOW()),
('ogulcan', '$2y$10$rZ8qGHQjK5JF7d3YrVvVOeq8YF8WbN9GKY9vNJ5xQ7F5LzKqvQxsq', 'ogulcan@bulancak.com', 'Oğulcan Gökalp', 'admin', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    is_active = 1,
    updated_at = NOW();

-- Şifre: admin123 (her iki kullanıcı için aynı)

-- ============================================
-- 2. DEMO BİNALAR OLUŞTUR
-- ============================================

INSERT INTO buildings (building_id, building_name, icon, image_path, is_active, created_at, updated_at) VALUES
('BINA-001', 'Ana Bina', '🏢', NULL, 1, NOW(), NOW()),
('BINA-002', 'Arıtma Tesisi', '🏭', NULL, 1, NOW(), NOW()),
('BINA-003', 'Pompa İstasyonu', '⚙️', NULL, 1, NOW(), NOW()),
('BINA-004', 'Depo', '📦', NULL, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    is_active = 1,
    updated_at = NOW();

-- ============================================
-- 3. DEMO KONTROL MADDELERİ
-- ============================================

INSERT INTO checklist_items (building_id, item_text, item_order, is_active, created_at, updated_at) VALUES
('BINA-001', 'Elektrik panosu kontrolü', 1, 1, NOW(), NOW()),
('BINA-001', 'Acil çıkış yolları kontrolü', 2, 1, NOW(), NOW()),
('BINA-001', 'Yangın söndürme ekipmanları kontrolü', 3, 1, NOW(), NOW()),
('BINA-002', 'Arıtma havuzları su seviyesi kontrolü', 1, 1, NOW(), NOW()),
('BINA-002', 'Kimyasal madde stok kontrolü', 2, 1, NOW(), NOW()),
('BINA-002', 'Havalandırma sistemi kontrolü', 3, 1, NOW(), NOW()),
('BINA-003', 'Pompa çalışma durumu kontrolü', 1, 1, NOW(), NOW()),
('BINA-003', 'Motor yağ seviyesi kontrolü', 2, 1, NOW(), NOW()),
('BINA-003', 'Titreşim ve gürültü kontrolü', 3, 1, NOW(), NOW()),
('BINA-004', 'Depo sıcaklık kontrolü', 1, 1, NOW(), NOW()),
('BINA-004', 'Malzeme stok kontrolü', 2, 1, NOW(), NOW()),
('BINA-004', 'Temizlik ve düzen kontrolü', 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    is_active = 1,
    updated_at = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DOĞRULAMA
-- ============================================

SELECT '==================== RESTORE DOĞRULAMA ====================' as status;

SELECT 
    'Kullanıcılar' as tablo,
    COUNT(*) as kayit_sayisi,
    SUM(is_active) as aktif_kayit
FROM users;

SELECT 
    'Binalar' as tablo,
    COUNT(*) as kayit_sayisi,
    SUM(is_active) as aktif_kayit
FROM buildings;

SELECT 
    'Kontrol Maddeleri' as tablo,
    COUNT(*) as kayit_sayisi,
    SUM(is_active) as aktif_kayit
FROM checklist_items;

SELECT '==================== RESTORE TAMAMLANDI ====================' as status;

SELECT '⚠️ ÖNEMLİ: Login bilgileri' as bilgi;
SELECT 'Kullanıcı: admin veya ogulcan' as kullanici;
SELECT 'Şifre: admin123' as sifre;
