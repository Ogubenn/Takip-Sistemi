# 🚀 HIZLI CANLI KURULUM - 30 Dakika

**Hedef:** API'yi sunucuya yükle, database'i kur, gerçek sitede test et ve geliştirmeye devam et.

---

## ⚡ ADIM 1: DATABASE KURULUMU (5 dk)

### 1.1 DirectAdmin'e Gir
- URL: `https://sunucuIP:2222` veya `https://domain.com:2222`
- Login: Hosting kullanıcı adı/şifre

### 1.2 Database Oluştur
1. **MySQL Management** → **MySQL Databases**
2. **Create New Database**:
   ```
   Database Adı: atiksu_db
   → Otomatik prefix eklenecek: kullaniciadi_atiksu_db
   
   Kullanıcı: atiksu_user
   → Otomatik prefix: kullaniciadi_atiksu_user
   
   Şifre: [Güçlü şifre oluştur - KAYDET!]
   ```
3. **Create** tıkla

### 1.3 Database Import Et
1. **phpMyAdmin** aç (DirectAdmin → Database bölümünden)
2. Sol taraftan **`kullaniciadi_atiksu_db`** seç
3. **Import** sekmesi
4. **Choose File** → `database-setup.sql` seç
5. **Go** tıkla
6. ✅ "Import başarılı" mesajını gör

### 1.4 Kontrol Et
phpMyAdmin'de şunları gör:
- ✅ `users` - 1 satır (admin)
- ✅ `buildings` - 8 satır
- ✅ `checklist_items` - 60+ satır
- ✅ `control_records` - 0 satır (boş - normal)

**✅ Database hazır!**

---

## ⚡ ADIM 2: API DOSYALARINI HAZIRLA (3 dk)

### 2.1 Database Bilgilerini Güncelle

Yerel bilgisayarda `api/config/database.php` dosyasını aç ve düzenle:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'kullaniciadi_atiksu_db');      // ← DirectAdmin'den kopyala
define('DB_USER', 'kullaniciadi_atiksu_user');    // ← DirectAdmin'den kopyala
define('DB_PASS', 'GUCLU_SIFRE_BURAYA');          // ← Adım 1.2'deki şifre
define('DB_CHARSET', 'utf8mb4');

// JWT Secret Key - DEĞİŞTİR!
define('JWT_SECRET', 'bulancak_2025_SECRET_' . bin2hex(random_bytes(16)));
define('JWT_ALGORITHM', 'HS256');

// CORS Settings
define('ALLOWED_ORIGINS', ['*']); // Production'da domain ekle
```

**💾 KAYDET!**

---

## ⚡ ADIM 3: API YÜKLE (7 dk)

### 3.1 Seçim Yap

**SEÇENEK A - Subdomain (Önerilen):**
- Frontend: `atiksu.domain.com`
- API: `api.domain.com`

**SEÇENEK B - Ana Domain:**
- Frontend: `domain.com`
- API: `domain.com/api/`

### 3.2 Subdomain Oluştur (SEÇENEK A seçtiysen)

1. **DirectAdmin** → **Subdomain Management**
2. **Create Subdomain**:
   ```
   Subdomain: api
   Domain: domain.com
   → Sonuç: api.domain.com
   ```
3. **Create**

### 3.3 Dosyaları Yükle

**DirectAdmin File Manager:**

**SEÇENEK A - Subdomain:**
1. `public_html/api.domain.com/` klasörüne git
2. `api/` klasöründeki **TÜM** dosyaları yükle (ZIP yapıp extract edebilirsin)

**SEÇENEK B - Ana domain:**
1. `public_html/` klasörüne git
2. **New Folder** → `api`
3. `api/` klasöründeki **TÜM** dosyaları yükle

### 3.4 İzinleri Kontrol Et (Opsiyonel)
- Dosyalar: 644
- Klasörler: 755

**✅ API yüklendi!**

---

## ⚡ ADIM 4: API TEST ET (5 dk)

### 4.1 Health Check
Tarayıcıda aç:
```
https://api.domain.com/health.php
```
veya
```
https://domain.com/api/health.php
```

**Beklenen:**
```json
{
  "status": "OK",
  "message": "Bulancak Atıksu API çalışıyor",
  "timestamp": "2025-12-31T15:30:00Z"
}
```

❌ **403 Forbidden görürsen:**
- `.htaccess` dosyasını **SİL** veya yorum satırı yap
- PHP versiyonunu kontrol et (7.4+ olmalı)

### 4.2 Buildings Test
```
https://api.domain.com/buildings/index.php
```

**Beklenen:**
```json
{
  "success": true,
  "buildings": [
    { "id": "giris", "name": "Giriş", "icon": "🚪", ... },
    ...
  ]
}
```

### 4.3 Login Test (PowerShell)
```powershell
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.domain.com/auth/login.php" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Beklenen:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1Qi...",
  "user": { "id": 1, "username": "admin", ... }
}
```

**✅ API çalışıyor!**

---

## ⚡ ADIM 5: FRONTEND HAZIRLA (5 dk)

### 5.1 config.js Güncelle

Yerel bilgisayarda `config.js` dosyasını düzenle:

```javascript
// API Configuration
const API_CONFIG = {
    production: {
        BASE_URL: 'https://api.domain.com',  // ← Gerçek domain yaz
        TIMEOUT: 10000
    }
};

const ENV = 'production';  // ← production yap
```

**💾 KAYDET!**

---

## ⚡ ADIM 6: FRONTEND YÜKLE (5 dk)

### 6.1 Dosyaları Yükle

**DirectAdmin File Manager:**

**SEÇENEK A - Subdomain (Frontend için):**
1. **Subdomain Management** → `atiksu` subdomain oluştur
2. `public_html/atiksu.domain.com/` klasörüne git
3. Şu dosyaları yükle:
   - ✅ `index.html`
   - ✅ `kontrol.html`
   - ✅ `gecmis.html`
   - ✅ `istatistikler.html`
   - ✅ `qr-kodlar.html`
   - ✅ `admin-login.html`
   - ✅ `admin.html`
   - ✅ `config.js` (güncellenmiş)
   - ✅ `css/` klasörü
   - ✅ `js/` klasörü (güncellenmiş script.js + admin.js)
   - ✅ `assets/` klasörü

**SEÇENEK B - Ana domain:**
1. `public_html/` klasörüne git
2. Yukarıdaki dosyaları yükle

**❌ YÜKLEME:**
- ❌ `api/` klasörü (zaten yükledin)
- ❌ `database-setup.sql`
- ❌ `*.md` dosyaları
- ❌ `.backup` dosyaları

---

## ⚡ ADIM 7: TEST ET! (5 dk)

### 7.1 Ana Sayfa Test
Tarayıcıda aç:
```
https://atiksu.domain.com/
```
veya
```
https://domain.com/
```

**Beklenen:**
- ⟳ "Binalar yükleniyor..." spinner görünecek
- ✅ 8 bina kartı listelenecek
- ✅ Bugün tamamlanan: 0/8

### 7.2 Admin Login Test
```
https://atiksu.domain.com/admin-login.html
```

**Login:**
- Kullanıcı: `admin`
- Şifre: `admin123`

**Beklenen:**
- ⟳ "Giriş yapılıyor..."
- ✅ "Giriş başarılı!"
- → admin.html'e yönlendirilecek

### 7.3 Kontrol Test
1. Ana sayfada bir bina seç (örn: Giriş)
2. Checklist yüklenecek
3. Birkaç madde işaretle
4. Not yaz
5. **Kaydet**

**Beklenen:**
- ⟳ "Kontrol kaydediliyor..."
- ✅ "Kontrol başarıyla kaydedildi!"
- → Ana sayfaya dönecek

### 7.4 Database Kontrol
phpMyAdmin'de:
```sql
SELECT * FROM control_records ORDER BY created_at DESC LIMIT 5;
```

**✅ Yeni kaydını göreceksin!**

### 7.5 Geçmiş Test
```
https://atiksu.domain.com/gecmis.html
```

**Beklenen:**
- Az önce kaydettiğin kontrol görünecek!

---

## 🎉 KURULUM TAMAMLANDI!

```
✅ Database kuruldu ve import edildi
✅ API sunucuya yüklendi ve çalışıyor
✅ Frontend sunucuya yüklendi
✅ Test edildi - Çalışıyor!
```

---

## 🔧 ŞİMDİ GELİŞTİRMEYE DEVAM ET

### Geliştirme Akışı:
1. Yerel bilgisayarda kod yaz
2. Değişiklikleri sunucuya yükle (File Manager veya FTP)
3. Tarayıcıda test et
4. Hata varsa F12 Console'a bak
5. Düzelt ve tekrar yükle

### Hata Ayıklama:
- **F12 → Console** (JavaScript hataları)
- **F12 → Network** (API çağrıları)
- **phpMyAdmin** (Database kontrol)
- **DirectAdmin → Error Logs** (PHP hataları)

### Sık Yapılacaklar:
```powershell
# Tek dosya güncelleme
# File Manager'da dosyayı seç → Edit

# Çoklu dosya
# ZIP yap → Upload → Extract

# Database backup
# phpMyAdmin → Export → Go
```

---

## 📋 HIZLI REFERANS

**Database:**
- phpMyAdmin: DirectAdmin → MySQL Management
- Tablo: `control_records` (günlük kayıtlar burada)

**API Endpoints:**
- Health: `/health.php`
- Login: `/auth/login.php`
- Buildings: `/buildings/index.php`
- Controls: `/controls/index.php`
- Stats: `/controls/stats.php`

**Admin:**
- Login: `admin` / `admin123`
- ⚠️ **Şifreyi değiştir!** (Admin panel → Kullanıcılar)

---

## 🚨 SORUN GİDERME

### API çalışmıyor (403/404)
```bash
# .htaccess'i sil
# PHP versiyonunu kontrol et (DirectAdmin → PHP Settings)
# Error log'a bak (DirectAdmin → System Info & Files → Error Logs)
```

### Frontend yüklenmiyor
```bash
# F12 → Console → Hataları oku
# config.js yüklendi mi kontrol et
# API URL'i doğru mu?
```

### Database hatası
```bash
# config/database.php bilgileri doğru mu?
# phpMyAdmin'de bağlanabiliyor musun?
```

---

## ✅ BAŞARILI!

Artık gerçek sitede çalışıyor! 🎉

**Sonraki adımlar:**
- Güvenlik: Admin şifresini değiştir
- Özellik ekle: Fotoğraf upload, PDF export, vs.
- Optimize et: Cache, compression
- Vercel'e deploy (opsiyonel, daha hızlı frontend için)

**İyi geliştirmeler!** 🚀
