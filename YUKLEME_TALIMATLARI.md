# 🚀 DOSYA YÜKLEME TALİMATLARI

## FileZilla Bağlantı Bilgileri
```
Host: ogubenn.com.tr (veya ftp.ogubenn.com.tr)
Username: [DirectAdmin kullanıcı adınız]
Password: [DirectAdmin şifreniz]
Port: 21 (FTP) veya 22 (SFTP)
```

---

## 📤 YÜKLENECEK DOSYALAR (Öncelik Sırasına Göre)

### 🔴 ÖNCELİK 1: API Dosyaları

#### 1. Checklist API (YENİ)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\api\checklist\index.php
Sunucu Yolu: /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/checklist/index.php

İşlem: 
1. FileZilla'da /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/ klasörüne git
2. Sağ tık → "Dizin oluştur" → "checklist" yaz
3. checklist klasörüne gir
4. Yerel dosyayı sürükle-bırak
```

#### 2. Users API (GÜNCELLEME)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\api\users\index.php
Sunucu Yolu: /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/users/index.php

İşlem:
1. Mevcut dosyaya sağ tık → "Sil" (veya doğrudan üzerine yaz)
2. Yeni dosyayı sürükle-bırak
```

#### 3. Buildings API (GÜNCELLEME)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\api\buildings\index.php
Sunucu Yolu: /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/buildings/index.php

İşlem:
1. Mevcut dosyaya sağ tık → "Sil"
2. Yeni dosyayı sürükle-bırak
```

#### 4. Test Database Script (YENİ - TEMPORARİ)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\api\test-db.php
Sunucu Yolu: /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/test-db.php

İşlem:
1. /domains/api.bulancakatiksu.ogubenn.com.tr/public_html/ dizinine git
2. test-db.php dosyasını sürükle-bırak
3. ⚠️ DİKKAT: Test sonrası bu dosyayı SİL (güvenlik riski)
```

---

### 🟡 ÖNCELİK 2: Frontend Dosyaları

#### 5. Admin.js (GÜNCELLEME)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\js\admin.js
Sunucu Yolu: /domains/bulancakatiksu.ogubenn.com.tr/public_html/js/admin.js

İşlem:
1. /domains/bulancakatiksu.ogubenn.com.tr/public_html/js/ dizinine git
2. Mevcut admin.js'i sil
3. Yeni dosyayı yükle

⚠️ UYARI: Browser cache temizlenmeli yoksa eski kod çalışır
```

#### 6. Admin.html (GÜNCELLEME)
```
Yerel Dosya: C:\Users\ogulc\OneDrive\Masaüstü\Takip-Sistemi\admin.html
Sunucu Yolu: /domains/bulancakatiksu.ogubenn.com.tr/public_html/admin.html

İşlem:
1. /domains/bulancakatiksu.ogubenn.com.tr/public_html/ dizinine git
2. Mevcut admin.html'i sil
3. Yeni dosyayı yükle
```

---

## 🧪 TEST AŞAMALARI

### Test 1: Database Connection (İLK TEST)
```
1. Browser'da aç: https://api.bulancakatiksu.ogubenn.com.tr/test-db.php

Beklenen Çıktı:
{
    "success": true,
    "message": "Database bağlantısı başarılı",
    "stats": {
        "users": 3,
        "buildings": 8,
        "checklist_items": 60,
        "control_records": 0
    },
    "users_list": [...],
    "buildings_list": [...]
}

✅ Başarılı ise devam et
❌ Başarısız ise database.php'yi kontrol et
```

### Test 2: Admin Panel Giriş
```
1. https://bulancakatiksu.ogubenn.com.tr/admin-login.html
2. Kullanıcı: ogu
3. Şifre: 10031317534.Og
4. Giriş yap

✅ Dashboard görünmeli
❌ Hata alırsan F12 Console'a bak
```

### Test 3: Kullanıcı Ekleme
```
1. Kullanıcılar sekmesine git
2. "Yeni Kullanıcı" butonuna tıkla
3. Form doldur:
   - Ad Soyad: Test Kullanıcı
   - Kullanıcı Adı: testuser
   - E-posta: test@example.com
   - Rol: Operatör
   - Şifre: Test123456
4. Kaydet butonuna tıkla

Kontroller:
✅ "Kullanıcı eklendi!" mesajı görünmeli
✅ Tabloda yeni kullanıcı görünmeli
✅ Dashboard'da kullanıcı sayısı artmalı

F12 Network Tab:
- Request URL: https://api.bulancakatiksu.ogubenn.com.tr/users/index.php
- Method: POST
- Status: 200 OK
- Response: {"success": true, "message": "Kullanıcı başarıyla oluşturuldu"}
```

### Test 4: Bina Ekleme
```
1. Binalar sekmesine git
2. "Yeni Bina" butonuna tıkla
3. Form doldur:
   - ID: test_bina_1
   - Bina Adı: Test Binası
   - İkon: 🏭
   - Açıklama: Test amaçlı bina
   - Aktif: ✅
4. Kaydet

Kontroller:
✅ "Bina eklendi!" mesajı
✅ Tabloda görünmeli
✅ Dashboard'da bina sayısı artmalı
```

### Test 5: İstatistikler Sekmesi
```
1. İstatistikler sekmesine tıkla
2. Stat cards dolmalı:
   - Toplam Kontrol
   - Tamamlanma Oranı
   - Aktif Binalar
   - Aktif Kullanıcılar
3. Bina bazında tablo görünmeli

✅ Hepsinde sayı görünmeli (0 da olabilir)
```

### Test 6: Kontrol Maddeleri
```
1. Kontrol Maddeleri sekmesine git
2. "Yeni Madde Ekle" butonuna tıkla
3. Form doldur:
   - Bina: Giriş
   - Madde: Test kontrol maddesi
   - Sıra: 99
   - Aktif: ✅
4. Kaydet

Kontroller:
✅ "Madde eklendi!" mesajı
✅ Tabloda görünmeli
✅ Dropdown filtre çalışmalı
```

---

## 🐛 SORUN GİDERME

### Sorun 1: "Token bulunamadı" Hatası
**Neden:** Eski admin.js yüklü, token gönderilmiyor

**Çözüm:**
1. FileZilla'da js/admin.js dosyasını tekrar yükle
2. Browser'da Ctrl+Shift+Del → Cache temizle
3. Sayfayı yenile (Ctrl+F5)

### Sorun 2: "password_hash column not found"
**Neden:** Eski users/index.php yüklü

**Çözüm:**
1. FileZilla'da api/users/index.php'yi sil
2. Yeni dosyayı yükle
3. Browser'da test et

### Sorun 3: Modal Açılmıyor
**Neden:** Eski admin.html veya admin.js

**Çözüm:**
1. Her iki dosyayı da yeniden yükle
2. Browser cache temizle
3. F12 Console'da JavaScript hatalarına bak

### Sorun 4: API 404 Not Found
**Neden:** Klasör yapısı yanlış veya dosya yüklenmemiş

**Çözüm:**
1. FileZilla'da dosya yolunu kontrol et
2. chmod 644 (dosya izinleri)
3. DirectAdmin File Manager'dan kontrol et

### Sorun 5: CORS Error
**Neden:** API'de CORS headers eksik

**Çözüm:**
1. api/config/database.php kontrol et
2. CORS headers mevcut olmalı:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

---

## 📋 YÜKLEME KONTROLÜ

Her dosyayı yükledikten sonra işaretle:

### API
- [ ] api/checklist/index.php (YENİ klasör + dosya)
- [ ] api/users/index.php (GÜNCELLEME)
- [ ] api/buildings/index.php (GÜNCELLEME)
- [ ] api/test-db.php (GEÇİCİ - test için)

### Frontend
- [ ] js/admin.js (GÜNCELLEME)
- [ ] admin.html (GÜNCELLEME)

### Test
- [ ] Test 1: Database connection ✅
- [ ] Test 2: Admin login ✅
- [ ] Test 3: Kullanıcı ekleme ✅
- [ ] Test 4: Bina ekleme ✅
- [ ] Test 5: İstatistikler ✅
- [ ] Test 6: Checklist items ✅

---

## 🎯 SON KONTROL

Tüm testler başarılıysa:
1. ✅ api/test-db.php dosyasını SİL (güvenlik)
2. ✅ api/debug.php dosyasını SİL (varsa)
3. ✅ api/debug-login.php dosyasını SİL (varsa)
4. ✅ Browser cache temizle
5. ✅ Proje kullanıma hazır!

---

**NOT:** Herhangi bir sorun olursa:
1. F12 → Console sekmesinde hata mesajlarını oku
2. F12 → Network sekmesinde API isteklerini kontrol et
3. Hata mesajını buraya yapıştır, devam edelim!
