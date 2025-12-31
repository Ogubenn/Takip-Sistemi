-- Bulancak Atıksu Arıtma Tesisi - Database Kurulum Script
-- Tarih: 31 Aralık 2025

-- ⚠️ ÖNEMLİ: Database adını hosting panelinizden oluşturduğunuz database adı ile değiştirin!
-- Örnek: ogubenn_bulancak veya ogubenn_atiksu gibi

-- Database oluştur komutu paylaşımlı hostinglerde çalışmaz, yorum satırı yaptık
-- CREATE DATABASE IF NOT EXISTS bulancak_atiksu 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- Hosting panelinizden oluşturduğunuz database adını buraya yazın:
USE ogubenn_atiksi_db;

-- 1. Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'operator', 'viewer') DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Buildings tablosu
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Checklist Items tablosu
CREATE TABLE IF NOT EXISTS checklist_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id VARCHAR(50) NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    item_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    INDEX idx_building (building_id),
    INDEX idx_order (building_id, item_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Control Records tablosu
CREATE TABLE IF NOT EXISTS control_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    control_date DATE NOT NULL,
    checked_items JSON NOT NULL,
    notes TEXT,
    checked_count INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_building (building_id),
    INDEX idx_user (user_id),
    INDEX idx_date (control_date),
    INDEX idx_created (created_at),
    UNIQUE KEY unique_building_date (building_id, control_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ÖRNEK VERİLER (Test için)
-- ============================================

-- Default Admin Kullanıcı (Şifre: admin123)
-- bcrypt hash: $2b$10$vQ2xGJ0jHZ5L5nC8b9M5mOqYZ0N6Z8wH1WwPGH9K9qQZbQ0gWx9y6
INSERT IGNORE INTO users (username, password_hash, full_name, email, role) 
VALUES ('admin', '$2b$10$vQ2xGJ0jHZ5L5nC8b9M5mOqYZ0N6Z8wH1WwPGH9K9qQZbQ0gWx9y6', 'Sistem Yöneticisi', 'admin@bulancak.bel.tr', 'admin');

-- 8 Bina
INSERT IGNORE INTO buildings (id, name, icon, description, display_order) VALUES
('giris', 'Giriş', '🚪', 'Tesis giriş kontrol noktası', 1),
('kum_yag', 'Kum ve Yağ Tutucu', '🏗️', 'Kum ve yağ tutucu ünitesi kontrolü', 2),
('idari', 'İdari Bina', '🏢', 'İdari bina genel kontrol', 3),
('blower', 'Blower Odası', '💨', 'Havalandırma sistemi kontrolü', 4),
('test1', 'Test Oda 1', '🧪', 'Test laboratuvarı 1', 5),
('test2', 'Test Oda 2', '🔬', 'Test laboratuvarı 2', 6),
('test3', 'Test Oda 3', '⚗️', 'Test laboratuvarı 3', 7),
('test4', 'Test Oda 4', '🧬', 'Test laboratuvarı 4', 8);

-- Giriş binası için örnek kontrol listesi
INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('giris', 'Giriş kapısı ve güvenlik kontrol edildi', 1),
('giris', 'Aydınlatma sistemleri çalışıyor', 2),
('giris', 'Zemin temizliği yapıldı', 3),
('giris', 'Güvenlik kameraları kontrol edildi', 4),
('giris', 'Acil çıkış işaretleri kontrol edildi', 5),
('giris', 'Yangın söndürme cihazları yerinde ve dolu', 6),
('giris', 'Bilgilendirme panoları güncel', 7),
('giris', 'Dış çevre temizliği yapıldı', 8),
('giris', 'Park alanı kontrol edildi', 9),
('giris', 'Genel durum normal', 10);

-- Kum ve Yağ Tutucu için örnek kontrol listesi
INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('kum_yag', 'Kum tutucu ünitesi temizlendi', 1),
('kum_yag', 'Yağ tutucu filtreler kontrol edildi', 2),
('kum_yag', 'Su seviyesi uygun', 3),
('kum_yag', 'Pompa sistemleri çalışıyor', 4),
('kum_yag', 'Koku kontrolü yapıldı', 5),
('kum_yag', 'Mekanik parçalar yağlandı', 6),
('kum_yag', 'Elektrik paneli kontrol edildi', 7),
('kum_yag', 'Vana sistemleri çalışıyor', 8);

-- İdari Bina için örnek kontrol listesi
INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('idari', 'Ofis alanları temizlendi', 1),
('idari', 'Bilgisayarlar ve ekipmanlar çalışıyor', 2),
('idari', 'Klima sistemleri kontrol edildi', 3),
('idari', 'Elektrik ve su tesisatı normal', 4),
('idari', 'Mutfak alanı temizlendi', 5),
('idari', 'Tuvalet ve lavabolar temizlendi', 6),
('idari', 'Yangın alarm sistemi test edildi', 7);

-- Blower Odası için örnek kontrol listesi
INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('blower', 'Blower üniteler çalışıyor', 1),
('blower', 'Hava basıncı normal seviyelerde', 2),
('blower', 'Motor sıcaklıkları kontrol edildi', 3),
('blower', 'Titreşim seviyeleri normal', 4),
('blower', 'Elektrik paneli kontrol edildi', 5),
('blower', 'Filtre sistemleri temiz', 6),
('blower', 'Havalandırma kanalları açık', 7),
('blower', 'Ses seviyesi normal', 8);

-- Test Odaları için örnek kontrol listeleri
INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('test1', 'Laboratuvar ekipmanları kalibre edildi', 1),
('test1', 'Su numuneleri alındı', 2),
('test1', 'pH ölçümü yapıldı', 3),
('test1', 'Kimyasal stokları kontrol edildi', 4),
('test1', 'Laboratuvar temizliği yapıldı', 5);

INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('test2', 'Mikroskop ve ekipmanlar temizlendi', 1),
('test2', 'Biyolojik testler yapıldı', 2),
('test2', 'Numune saklama koşulları uygun', 3),
('test2', 'Kayıt defterleri güncellendi', 4);

INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('test3', 'Ağır metal analizi yapıldı', 1),
('test3', 'Spektrofotometre kalibre edildi', 2),
('test3', 'Reaktif stokları kontrol edildi', 3),
('test3', 'Güvenlik ekipmanları yerinde', 4);

INSERT IGNORE INTO checklist_items (building_id, item_text, item_order) VALUES
('test4', 'COD analizi yapıldı', 1),
('test4', 'BOD ölçümü alındı', 2),
('test4', 'Askıda katı madde testi yapıldı', 3),
('test4', 'Test sonuçları kaydedildi', 4);

-- ============================================
-- VERİTABANI KURULUM TAMAMLANDI
-- ============================================

SELECT 'Database kurulumu başarılı!' as Status;
SELECT COUNT(*) as TotalUsers FROM users;
SELECT COUNT(*) as TotalBuildings FROM buildings;
SELECT COUNT(*) as TotalChecklistItems FROM checklist_items;
