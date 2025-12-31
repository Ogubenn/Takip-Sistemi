# 🚀 DEPLOYMENT YOLDAĞI - Adım Adım Kurulum

**Hedef:** Günlük kontrol verilerini MySQL database'e kaydetmek ve uzun süreli saklamak.

---

## 📅 GENEL AKIŞ

```
Kullanıcı → Frontend (Vercel) → API (DirectAdmin) → MySQL Database
                                      ↓
                            Günlük Kayıt Tutuluyor
                            (1 Yıl+ Veri Saklama)
```

---

## 🎯 FAZ 1: DATABASE KURULUMU (15 dk)

### Adım 1.1: DirectAdmin'de Database Oluştur
1. DirectAdmin'e giriş yap: `https://sunucu:2222`
2. **MySQL Management** → **MySQL Databases**
3. **Create New Database**:
   - Database Adı: `atiksu_db` (otomatik prefix: `kullaniciadi_atiksu_db`)
   - Kullanıcı: `atiksu_user` (otomatik prefix: `kullaniciadi_atiksu_user`)
   - Şifre: **Güçlü şifre oluştur** (kaydet!)
4. **Create** tıkla

### Adım 1.2: Database Import Et
1. **phpMyAdmin** aç (DirectAdmin → Database → phpMyAdmin)
2. Sol taraftan `kullaniciadi_atiksu_db` seç
3. **Import** sekmesi
4. `database-setup.sql` dosyasını seç
5. **Go** tıkla
6. ✅ **Başarılı mesajı** görmelisin

### Adım 1.3: Tabloları Kontrol Et
phpMyAdmin'de kontrol et:
- ✅ `users` - 1 satır (admin kullanıcısı)
- ✅ `buildings` - 8 satır (8 bina)
- ✅ `checklist_items` - 60+ satır (kontrol maddeleri)
- ✅ `control_records` - 0 satır (kayıtlar buraya gelecek)

**Veri Yapısı:**
```sql
control_records tablosu (Günlük kayıtlar buraya gider)
├── id (AUTO_INCREMENT)
├── building_id (hangi bina)
├── user_id (kim kontrol etti)
├── control_date (YYYY-MM-DD)
├── checked_items (JSON - hangi maddeler işaretlendi)
├── notes (notlar)
├── completion_rate (tamamlanma yüzdesi)
└── created_at (kayıt zamanı)

UNIQUE KEY: building_id + control_date
(Aynı bina için günde 1 kayıt)
```

---

## 🎯 FAZ 2: API KURULUMU (20 dk)

### Adım 2.1: Subdomain Oluştur (Opsiyonel ama önerilen)
1. DirectAdmin → **Subdomain Management**
2. **Create Subdomain**:
   - Subdomain: `api`
   - Domain: `yenidomain.com`
   - Sonuç: `api.yenidomain.com`
3. **Create** tıkla

### Adım 2.2: API Dosyalarını Hazırla
Yerel bilgisayarda `api/config/database.php` dosyasını düzenle:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'kullaniciadi_atiksu_db');      // ← Buraya gerçek DB adı
define('DB_USER', 'kullaniciadi_atiksu_user');    // ← Buraya gerçek kullanıcı
define('DB_PASS', 'guclu_sifre_buraya');          // ← Buraya DB şifresi
define('DB_CHARSET', 'utf8mb4');
```

### Adım 2.3: API'yi Yükle
**DirectAdmin File Manager:**

**SEÇENEK A - Subdomain kullanıyorsan:**
1. `public_html/api.yenidomain.com/` klasörüne git
2. `api/` klasöründeki **TÜM** dosyaları yükle

**SEÇENEK B - Ana domain kullanıyorsan:**
1. `public_html/` klasörüne git
2. **New Folder** → `api`
3. `api/` klasörüne gir
4. Yerel `api/` klasöründeki **TÜM** dosyaları yükle

### Adım 2.4: İzinleri Kontrol Et
File Manager'da:
- **Dosyalar:** 644 (okuma/yazma sadece sahibi)
- **Klasörler:** 755 (execute izni)

### Adım 2.5: API Test Et
Tarayıcıda aç:

**Test 1 - Health Check:**
```
https://api.yenidomain.com/health.php
```
Beklenen:
```json
{
  "status": "OK",
  "message": "Bulancak Atıksu API çalışıyor",
  "timestamp": "2025-12-31T15:30:00Z"
}
```

**Test 2 - Login:**
```bash
# PowerShell'de:
$body = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.yenidomain.com/auth/login.php" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

Beklenen:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Sistem Yöneticisi",
    "role": "admin"
  }
}
```

**Test 3 - Buildings:**
```
https://api.yenidomain.com/buildings/index.php
```
Beklenen: 8 bina listesi (JSON array)

---

## 🎯 FAZ 3: FRONTEND API ENTEGRASYONU (45 dk)

### Adım 3.1: Config Güncelle
`config.js` dosyasında:

```javascript
const API_CONFIG = {
    production: {
        BASE_URL: 'https://api.yenidomain.com',  // ← Gerçek domain yaz
        TIMEOUT: 10000
    }
};

const ENV = 'production';  // ← Bunu production yap
```

### Adım 3.2: Script.js Güncellemesi
`js/script.js` dosyasında **LocalStorage yerine API** kullan:

**ÖNCESİ (LocalStorage):**
```javascript
function saveControlData(buildingId, data) {
    const key = `kontrol_${buildingId}_${today}`;
    localStorage.setItem(key, JSON.stringify(data));
}
```

**SONRASI (API):**
```javascript
async function saveControlData(buildingId, data) {
    const response = await API.post('/controls/index.php', {
        building_id: buildingId,
        checked_items: data.checkedItems,
        notes: data.notes
    }, API.getToken());
    
    return response;
}
```

### Adım 3.3: Admin.js Güncellemesi
`js/admin.js` dosyasında **LocalStorage yerine API** kullan:

**Login işlemi:**
```javascript
async function handleLogin(username, password, remember) {
    const response = await API.post('/auth/login.php', {
        username: username,
        password: password,
        remember: remember
    });
    
    if (response.success) {
        API.setToken(response.token, remember);
        window.location.href = 'admin.html';
    } else {
        alert('Giriş başarısız: ' + response.message);
    }
}
```

---

## 🎯 FAZ 4: VERCEL DEPLOYMENT (30 dk)

### Adım 4.1: GitHub Repo Oluştur
1. GitHub'da yeni repo: `bulancak-atiksu-frontend`
2. Yerel terminalde:

```powershell
cd C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi

# .gitignore oluştur
@"
api/
database-setup.sql
node_modules/
.env
"@ | Out-File -FilePath .gitignore -Encoding UTF8

# Git init
git init
git add .
git commit -m "Initial commit - Frontend ready"
git branch -M main
git remote add origin https://github.com/kullaniciadi/bulancak-atiksu-frontend.git
git push -u origin main
```

### Adım 4.2: Vercel'e Deploy
1. **Vercel.com** → Login (GitHub ile)
2. **New Project** → Repo seç (`bulancak-atiksu-frontend`)
3. **Framework Preset:** Other (static HTML)
4. **Root Directory:** ./ (ana klasör)
5. **Environment Variables:** YOK (config.js'de hardcoded)
6. **Deploy** tıkla

### Adım 4.3: Custom Domain Bağla
1. Vercel Dashboard → Proje → **Settings** → **Domains**
2. **Add Domain:** `atiksu.yenidomain.com`
3. DNS ayarları gösterilecek:

**Cloudflare/Domain sağlayıcıda:**
```
Type: CNAME
Name: atiksu
Value: cname.vercel-dns.com
```

4. DNS yayılmasını bekle (5-30 dk)
5. ✅ SSL otomatik aktif olacak

---

## 🎯 FAZ 5: TEST & LANChe (15 dk)

### Adım 5.1: Frontend Test
1. `https://atiksu.yenidomain.com/` aç
2. Bina seç → Kontrol formu aç
3. Maddeleri işaretle → Kaydet
4. ✅ Başarılı mesajı görmeli

### Adım 5.2: Database Kontrol
phpMyAdmin'de:
```sql
SELECT * FROM control_records ORDER BY created_at DESC LIMIT 10;
```
✅ Yeni kaydı görmelisin!

### Adım 5.3: Geçmiş Kayıtlar Test
1. Frontend → **Geçmiş** sayfası
2. ✅ Kaydettiğin kontrolü görmeli

### Adım 5.4: Admin Panel Test
1. `https://atiksu.yenidomain.com/admin-login.html`
2. Login: `admin` / `admin123`
3. Kullanıcı ekle/düzenle/sil test et
4. Bina ekle/düzenle test et

---

## 📊 VERİ SAKLAMA & YEDEKLEME

### Otomatik Backup (DirectAdmin)
1. **DirectAdmin** → **Backup**
2. **Cron Jobs** ile otomatik:
   - Her gün: Database dump
   - Her hafta: Full backup

### Manuel Backup (phpMyAdmin)
1. Database seç
2. **Export** sekmesi
3. **Go** → SQL dosyası indirilir
4. **Önerilen:** Her ay yerel kopyasını kaydet

### Veri Silme Politikası
```sql
-- 1 yıldan eski kayıtları silme (isteğe bağlı)
DELETE FROM control_records 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## 🔒 GÜVENLİK KONTROL LİSTESİ

- ✅ Database kullanıcısı güçlü şifre
- ✅ Admin şifresini değiştir (ilk login'de)
- ✅ SSL aktif (HTTPS)
- ✅ JWT secret key değiştir (`api/config/database.php`)
- ✅ `.htaccess` ile `/api/config/` klasörünü gizle
- ✅ phpMyAdmin'e IP kısıtlaması (opsiyonel)

---

## 📞 DESTEK & HATA GİDERME

### API çalışmıyor (403/404)
- ✅ `.htaccess` dosyasını kontrol et
- ✅ Dosya izinleri: 644
- ✅ PHP versiyonu: 7.4+

### Database bağlanmıyor
- ✅ `database.php` içinde bilgileri kontrol et
- ✅ Database kullanıcısına izinler verilmiş mi?

### CORS hatası
- ✅ `api/config/database.php` içinde CORS headers kontrol et
- ✅ `Access-Control-Allow-Origin: *` olmalı

---

## 🎉 TAMAMLANDI!

Sistem artık hazır:
- ✅ Günlük kontroller database'e kaydediliyor
- ✅ Uzun süreli saklama aktif
- ✅ API güvenli (JWT token)
- ✅ Frontend hızlı (Vercel CDN)
- ✅ Backup sistemi kurulu

**Kullanıma hazır!** 🚀
