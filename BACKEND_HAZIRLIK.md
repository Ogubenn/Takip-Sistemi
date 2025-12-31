# 🔧 BACKEND GEÇİŞİ HAZIRLIK DOKÜMANI

**Proje:** Bulancak Atıksu Arıtma Tesisi Kontrol Sistemi  
**Tarih:** 31 Aralık 2025  
**Hazırlayan:** Oğulcan Durkan

---

## 📊 DATABASE ŞEMASI

### Tablolar

#### 1. `users` - Kullanıcılar
```sql
CREATE TABLE users (
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
    INDEX idx_email (email)
);
```

**Örnek Veri:**
```json
{
    "id": 1,
    "username": "admin",
    "password_hash": "$2b$10$...",
    "full_name": "Sistem Yöneticisi",
    "email": "admin@bulancak.bel.tr",
    "role": "admin",
    "created_at": "2025-12-31T10:00:00Z",
    "last_login": "2025-12-31T14:30:00Z",
    "is_active": true
}
```

---

#### 2. `buildings` - Binalar
```sql
CREATE TABLE buildings (
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
);
```

**Örnek Veri:**
```json
{
    "id": "giris",
    "name": "Giriş",
    "icon": "🚪",
    "description": "Tesis giriş kontrol noktası",
    "is_active": true,
    "display_order": 1,
    "created_at": "2025-12-31T10:00:00Z",
    "updated_at": "2025-12-31T10:00:00Z"
}
```

---

#### 3. `checklist_items` - Kontrol Listesi Maddeleri
```sql
CREATE TABLE checklist_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id VARCHAR(50) NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    item_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    INDEX idx_building (building_id),
    INDEX idx_order (building_id, item_order)
);
```

**Örnek Veri:**
```json
{
    "id": 1,
    "building_id": "giris",
    "item_text": "Giriş kapısı ve güvenlik kontrol edildi",
    "item_order": 1,
    "is_active": true,
    "created_at": "2025-12-31T10:00:00Z",
    "updated_at": "2025-12-31T10:00:00Z"
}
```

---

#### 4. `control_records` - Kontrol Kayıtları
```sql
CREATE TABLE control_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    building_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    control_date DATE NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    checked_count INT NOT NULL,
    total_count INT NOT NULL,
    completion_rate DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_building_date (building_id, control_date),
    INDEX idx_user_date (user_id, control_date),
    INDEX idx_date (control_date),
    UNIQUE KEY unique_building_date (building_id, control_date)
);
```

**Örnek Veri:**
```json
{
    "id": 1,
    "building_id": "giris",
    "user_id": 1,
    "control_date": "2025-12-31",
    "completed_at": "2025-12-31T14:30:00Z",
    "notes": "Her şey normal",
    "checked_count": 9,
    "total_count": 10,
    "completion_rate": 90.00
}
```

---

#### 5. `control_record_items` - Kontrol Kayıt Detayları
```sql
CREATE TABLE control_record_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    control_record_id INT NOT NULL,
    checklist_item_id INT NOT NULL,
    item_order INT NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    is_checked BOOLEAN NOT NULL,
    FOREIGN KEY (control_record_id) REFERENCES control_records(id) ON DELETE CASCADE,
    FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id),
    INDEX idx_record (control_record_id)
);
```

**Örnek Veri:**
```json
{
    "id": 1,
    "control_record_id": 1,
    "checklist_item_id": 1,
    "item_order": 1,
    "item_text": "Giriş kapısı ve güvenlik kontrol edildi",
    "is_checked": true
}
```

---

#### 6. `sessions` - Oturum Yönetimi (Opsiyonel)
```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);
```

---

## 🔌 API ENDPOINT'LERİ

### Base URL: `/api/v1`

---

### 🔐 Authentication

#### POST `/auth/login`
Kullanıcı girişi

**Request:**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "username": "admin",
        "full_name": "Sistem Yöneticisi",
        "email": "admin@bulancak.bel.tr",
        "role": "admin"
    }
}
```

#### POST `/auth/logout`
Kullanıcı çıkışı

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Çıkış başarılı"
}
```

#### GET `/auth/me`
Mevcut kullanıcı bilgisi

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "username": "admin",
        "full_name": "Sistem Yöneticisi",
        "email": "admin@bulancak.bel.tr",
        "role": "admin",
        "last_login": "2025-12-31T14:30:00Z"
    }
}
```

---

### 👥 Users

#### GET `/users`
Tüm kullanıcıları listele

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Response (200 OK):**
```json
{
    "success": true,
    "users": [
        {
            "id": 1,
            "username": "admin",
            "full_name": "Sistem Yöneticisi",
            "email": "admin@bulancak.bel.tr",
            "role": "admin",
            "is_active": true,
            "created_at": "2025-12-31T10:00:00Z",
            "last_login": "2025-12-31T14:30:00Z"
        }
    ]
}
```

#### POST `/users`
Yeni kullanıcı oluştur

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Request:**
```json
{
    "username": "operator1",
    "password": "test123",
    "full_name": "Test Operatör",
    "email": "operator@test.com",
    "role": "operator"
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Kullanıcı oluşturuldu",
    "user": {
        "id": 2,
        "username": "operator1",
        "full_name": "Test Operatör",
        "email": "operator@test.com",
        "role": "operator"
    }
}
```

#### PUT `/users/:id`
Kullanıcı güncelle

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Request:**
```json
{
    "full_name": "Test Operatör Güncel",
    "email": "operator_new@test.com",
    "role": "admin"
}
```

#### DELETE `/users/:id`
Kullanıcı sil

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Kullanıcı silindi"
}
```

---

### 🏢 Buildings

#### GET `/buildings`
Tüm binaları listele

**Response (200 OK):**
```json
{
    "success": true,
    "buildings": [
        {
            "id": "giris",
            "name": "Giriş",
            "icon": "🚪",
            "description": "Tesis giriş kontrol noktası",
            "is_active": true,
            "display_order": 1,
            "checklist_count": 10
        }
    ]
}
```

#### GET `/buildings/:id`
Bina detayı + kontrol listesi

**Response (200 OK):**
```json
{
    "success": true,
    "building": {
        "id": "giris",
        "name": "Giriş",
        "icon": "🚪",
        "description": "Tesis giriş kontrol noktası",
        "is_active": true,
        "checklist": [
            {
                "id": 1,
                "item_text": "Giriş kapısı ve güvenlik kontrol edildi",
                "item_order": 1,
                "is_active": true
            }
        ]
    }
}
```

#### POST `/buildings`
Yeni bina ekle

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Request:**
```json
{
    "id": "test_bina",
    "name": "Test Binası",
    "icon": "🏭",
    "description": "Deneme amaçlı bina",
    "is_active": true,
    "display_order": 9
}
```

#### PUT `/buildings/:id`
Bina güncelle

#### DELETE `/buildings/:id`
Bina sil

---

### 📋 Checklist Items

#### GET `/buildings/:building_id/checklist`
Bina kontrol listesi

#### POST `/buildings/:building_id/checklist`
Kontrol maddesi ekle

**Request:**
```json
{
    "item_text": "Yeni kontrol maddesi",
    "item_order": 11
}
```

#### PUT `/checklist-items/:id`
Kontrol maddesi güncelle

#### DELETE `/checklist-items/:id`
Kontrol maddesi sil

#### POST `/checklist-items/:id/reorder`
Sıralama değiştir

**Request:**
```json
{
    "new_order": 5
}
```

---

### ✅ Control Records

#### GET `/controls`
Kontrol kayıtları listesi

**Query Parameters:**
- `building_id` (optional): Binaya göre filtre
- `user_id` (optional): Kullanıcıya göre filtre
- `start_date` (optional): Başlangıç tarihi
- `end_date` (optional): Bitiş tarihi
- `page` (default: 1): Sayfa numarası
- `limit` (default: 20): Kayıt sayısı

**Response (200 OK):**
```json
{
    "success": true,
    "controls": [
        {
            "id": 1,
            "building_id": "giris",
            "building_name": "Giriş",
            "building_icon": "🚪",
            "user_id": 1,
            "user_name": "Sistem Yöneticisi",
            "control_date": "2025-12-31",
            "completed_at": "2025-12-31T14:30:00Z",
            "notes": "Her şey normal",
            "checked_count": 9,
            "total_count": 10,
            "completion_rate": 90.00
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "pages": 3
    }
}
```

#### GET `/controls/:id`
Kontrol kaydı detayı

**Response (200 OK):**
```json
{
    "success": true,
    "control": {
        "id": 1,
        "building_id": "giris",
        "building_name": "Giriş",
        "user_id": 1,
        "user_name": "Sistem Yöneticisi",
        "control_date": "2025-12-31",
        "completed_at": "2025-12-31T14:30:00Z",
        "notes": "Her şey normal",
        "checked_count": 9,
        "total_count": 10,
        "completion_rate": 90.00,
        "items": [
            {
                "id": 1,
                "item_order": 1,
                "item_text": "Giriş kapısı ve güvenlik kontrol edildi",
                "is_checked": true
            }
        ]
    }
}
```

#### POST `/controls`
Yeni kontrol kaydı oluştur

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
    "building_id": "giris",
    "control_date": "2025-12-31",
    "notes": "Her şey normal",
    "items": [
        {
            "checklist_item_id": 1,
            "item_order": 1,
            "item_text": "Giriş kapısı ve güvenlik kontrol edildi",
            "is_checked": true
        }
    ]
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Kontrol kaydı oluşturuldu",
    "control_id": 1
}
```

#### PUT `/controls/:id`
Kontrol kaydı güncelle

#### DELETE `/controls/:id`
Kontrol kaydı sil

---

### 📊 Statistics

#### GET `/statistics/summary`
Genel istatistikler

**Query Parameters:**
- `start_date` (optional): Başlangıç tarihi
- `end_date` (optional): Bitiş tarihi

**Response (200 OK):**
```json
{
    "success": true,
    "statistics": {
        "total_controls": 150,
        "total_buildings": 8,
        "total_users": 5,
        "avg_completion_rate": 87.5,
        "today_controls": 4,
        "active_streak": 15,
        "by_building": {
            "giris": {
                "count": 25,
                "avg_completion": 90.0
            }
        },
        "by_user": {
            "1": {
                "name": "Sistem Yöneticisi",
                "count": 50,
                "avg_completion": 92.5
            }
        }
    }
}
```

#### GET `/statistics/building/:building_id`
Bina istatistikleri

#### GET `/statistics/user/:user_id`
Kullanıcı istatistikleri

---

### 💾 Data Management

#### POST `/data/export`
Verileri dışa aktar

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Response (200 OK):**
```json
{
    "success": true,
    "export_data": {
        "export_date": "2025-12-31T14:30:00Z",
        "version": "1.0",
        "users": [...],
        "buildings": [...],
        "controls": [...]
    }
}
```

#### POST `/data/import`
Verileri içe aktar

**Headers:** `Authorization: Bearer {token}`  
**Permissions:** Admin only

**Request:**
```json
{
    "export_data": {
        "users": [...],
        "buildings": [...],
        "controls": [...]
    },
    "overwrite": false
}
```

---

## 🔒 GÜVENLİK

### Authentication
- JWT (JSON Web Token) kullan
- Token süresi: 24 saat
- Refresh token: 7 gün

### Password Hashing
- bcrypt kullan (10 rounds)
- Minimum şifre uzunluğu: 6 karakter

### Rate Limiting
- Login: 5 deneme / 15 dakika
- API: 100 istek / dakika

### CORS
```javascript
{
    origin: ['http://localhost:8000', 'https://bulancak.bel.tr'],
    credentials: true
}
```

---

## 🚀 BACKEND TEKNOLOJI ÖNERİLERİ

### Seçenek 1: Node.js + Express
```bash
npm install express bcrypt jsonwebtoken mysql2 cors dotenv
```

### Seçenek 2: Python + Flask
```bash
pip install flask flask-bcrypt flask-jwt-extended mysql-connector-python flask-cors
```

### Seçenek 3: PHP + Laravel
```bash
composer require laravel/framework
```

---

## 📝 ÖNCELİKLİ GELİŞTİRME SIRASI

1. ✅ **Database Setup** - Tabloları oluştur
2. ✅ **Authentication API** - Login/Logout
3. ✅ **Users CRUD** - Kullanıcı yönetimi
4. ✅ **Buildings CRUD** - Bina yönetimi
5. ✅ **Checklist CRUD** - Kontrol listesi
6. ✅ **Control Records** - Kayıt sistemi
7. ✅ **Statistics** - İstatistik endpoint'leri
8. ⏳ **Frontend Integration** - API'ye bağlama
9. ⏳ **Testing** - API testleri
10. ⏳ **Deployment** - Canlıya alma

---

**Not:** Bu dokümantasyon backend geliştirme için hazırdır. Frontend kodu zaten hazır ve LocalStorage kullanıyor. Backend hazır olduğunda sadece API çağrılarına geçiş yapılacak.

**Son Güncelleme:** 31 Aralık 2025  
**Hazırlayan:** Oğulcan Durkan
