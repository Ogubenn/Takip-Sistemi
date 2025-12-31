# 🚀 PHP Backend API - Kurulum Rehberi

## 📁 Yapı

```
api/
├── .htaccess              # URL rewriting
├── health.php             # Health check
├── config/
│   ├── database.php       # Database bağlantısı
│   └── auth.php           # JWT helper functions
├── auth/
│   ├── login.php          # POST /api/auth/login
│   ├── logout.php         # POST /api/auth/logout
│   └── verify.php         # GET /api/auth/verify
├── buildings/
│   ├── index.php          # GET/POST /api/buildings
│   └── detail.php         # GET/PUT/DELETE /api/buildings/{id}
└── controls/
    ├── index.php          # GET/POST /api/controls
    └── stats.php          # GET /api/controls/stats
```

## 📤 Sunucuya Yükleme

### 1. FTP/FileZilla ile Bağlan

**Host:** ogubenn.com.tr  
**Username:** FTP kullanıcı adın  
**Port:** 21 (veya 22 SFTP için)

### 2. Yükleme Konumu

`api/` klasörünü sunucundaki public_html veya www klasörüne yükle:

```
public_html/
└── api/
    ├── .htaccess
    ├── health.php
    ├── config/
    ├── auth/
    ├── buildings/
    └── controls/
```

### 3. Dosya İzinleri

```bash
chmod 755 api/
chmod 644 api/*.php
chmod 644 api/*/*.php
```

## 🧪 Test Et

### Health Check

Tarayıcıda aç:
```
https://ogubenn.com.tr/api/health
```

Göreceksin:
```json
{
  "status": "OK",
  "message": "Bulancak Atıksu PHP API çalışıyor",
  "timestamp": "2025-12-31 15:30:00",
  "version": "1.0.0"
}
```

### Login Test

```bash
curl -X POST https://ogubenn.com.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Başarılı yanıt:
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Sistem Yöneticisi",
    "email": "admin@bulancak.bel.tr",
    "role": "admin"
  }
}
```

## 📡 API Endpoints

**Base URL:** `https://ogubenn.com.tr/api`

### Authentication
- `POST /auth/login` - Giriş yap
- `POST /auth/logout` - Çıkış yap
- `GET /auth/verify` - Token doğrula (Auth required)

### Buildings
- `GET /buildings` - Tüm binalar
- `GET /buildings/{id}` - Bina detay + kontrol listesi
- `POST /buildings` - Yeni bina (Admin)
- `PUT /buildings/{id}` - Bina güncelle (Admin)
- `DELETE /buildings/{id}` - Bina sil (Admin)

### Controls
- `GET /controls` - Kontrol kayıtları (Auth required)
- `POST /controls` - Yeni kontrol (Operator+)
- `GET /controls/stats` - İstatistikler (Auth required)

## 🔐 Authentication

Token kullanımı:

```javascript
fetch('https://ogubenn.com.tr/api/buildings', {
    headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
    }
})
```

## 🐛 Sorun Giderme

### "500 Internal Server Error"

1. PHP version kontrolü (7.4+):
```bash
php -v
```

2. Error log kontrol:
```bash
tail -f /path/to/error_log
```

3. `.htaccess` çalışıyor mu?
```
https://ogubenn.com.tr/api/health
```

### "Database connection failed"

`config/database.php` dosyasında:
- `DB_HOST` = localhost olmalı
- `DB_NAME` = ogubenn_atiksi_db
- `DB_USER` = ogubenn_atiksi_db
- `DB_PASS` = 10031317534.Og

### CORS Hatası

Frontend farklı domain'deyse, `config/database.php` dosyasında:

```php
header('Access-Control-Allow-Origin: https://your-vercel-app.vercel.app');
```

## 📊 Performans

- ✅ Hafif (PHP native, framework yok)
- ✅ Hızlı (PDO prepared statements)
- ✅ Güvenli (JWT, bcrypt, SQL injection koruması)

## 🔄 Güncelleme

Kod değiştiğinde sadece değişen dosyayı FTP ile yeniden yükle.

---

**API Hazır!** Frontend'i bağlamaya geçebiliriz. 🚀

**Destek:** Sorun olursa `https://ogubenn.com.tr/api/health` ile API durumunu kontrol et.
