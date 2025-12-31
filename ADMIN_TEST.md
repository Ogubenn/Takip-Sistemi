# 🧪 ADMIN PANELİ TEST DOKÜMANI

**Tarih:** 31 Aralık 2025  
**Test Edilen Sistem:** Bulancak Atıksu Arıtma Tesisi Admin Paneli  
**Versiyon:** 1.0

---

## 📋 TEST SENARYOLARI

### 1️⃣ Login Testi

**Test Adımları:**
1. Tarayıcıda `http://localhost:8000/admin-login.html` adresini aç
2. Kullanıcı adı: `admin` ve Şifre: `admin123` gir
3. "Beni hatırla" kutucuğunu işaretle
4. "Giriş Yap" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Başarılı giriş sonrası admin.html sayfasına yönlenme
- ✅ Session bilgisi localStorage'a kaydedilmeli
- ✅ Dashboard sayfası açılmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 2️⃣ Dashboard Görüntüleme

**Test Adımları:**
1. Admin panele başarılı giriş yap
2. Dashboard sayfasını kontrol et

**Beklenen Sonuç:**
- ✅ 4 istatistik kartı görünmeli (Kullanıcılar, Binalar, Kontroller, Bugünkü Kontroller)
- ✅ Kullanıcı sayısı: En az 1 (admin)
- ✅ Bina sayısı: 8 (default binalar)
- ✅ Sidebar'da kullanıcı bilgisi görünmeli

**Test Durumu:** ⏳ Test Edilecek

---

### 3️⃣ Kullanıcı Ekleme

**Test Adımları:**
1. Sol menüden "Kullanıcılar" sekmesine tıkla
2. "➕ Yeni Kullanıcı" butonuna tıkla
3. Formu doldur:
   - Ad Soyad: Test Operatör
   - Kullanıcı Adı: operator1
   - E-posta: operator@test.com
   - Rol: Operatör
   - Şifre: test123
4. "Kaydet" butonuna tıkla

**Beklenen Sonuç:**
- ✅ "Kullanıcı başarıyla kaydedildi" toast mesajı
- ✅ Modal kapanmalı
- ✅ Yeni kullanıcı tabloda görünmeli
- ✅ Kullanıcı badge'i 2 olmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 4️⃣ Kullanıcı Düzenleme

**Test Adımları:**
1. Kullanıcılar tablosunda herhangi bir kullanıcının "✏️ Düzenle" butonuna tıkla
2. Ad Soyad alanını değiştir
3. "Kaydet" butonuna tıkla

**Beklenen Sonuç:**
- ✅ "Kullanıcı başarıyla güncellendi" toast mesajı
- ✅ Değişiklikler tabloda yansımalı

**Test Durumu:** ⏳ Test Edilecek

---

### 5️⃣ Kullanıcı Silme

**Test Adımları:**
1. Kullanıcılar tablosunda admin olmayan bir kullanıcının "🗑️ Sil" butonuna tıkla
2. Onay penceresinde "Tamam" seç

**Beklenen Sonuç:**
- ✅ "Kullanıcı başarıyla silindi" toast mesajı
- ✅ Kullanıcı tablodan kaldırılmalı
- ✅ Son admin silinememeli (koruma mekanizması)

**Test Durumu:** ⏳ Test Edilecek

---

### 6️⃣ Bina Ekleme

**Test Adımları:**
1. Sol menüden "Binalar" sekmesine tıkla
2. "➕ Yeni Bina" butonuna tıkla
3. Formu doldur:
   - Bina ID: test_bina
   - Bina Adı: Test Binası
   - İkon: 🏭
   - Açıklama: Deneme amaçlı bina
   - Aktif: ✓ İşaretli
4. "Kaydet" butonuna tıkla

**Beklenen Sonuç:**
- ✅ "Bina başarıyla eklendi" toast mesajı
- ✅ Yeni bina tabloda görünmeli
- ✅ Bina badge'i 9 olmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 7️⃣ Kontrol Listesi Yönetimi

**Test Adımları:**
1. Binalar tablosunda bir binanın "📋 Kontrol Listesi" butonuna tıkla
2. Kontrol listesi modalı açılmalı
3. Yeni madde ekle:
   - "Yeni madde ekle..." alanına "Test kontrol maddesi" yaz
   - "➕ Ekle" butonuna tıkla
4. Eklenen maddeyi düzenle
5. Maddeyi yukarı/aşağı taşı
6. Maddeyi sil

**Beklenen Sonuç:**
- ✅ Her işlem için toast mesajı
- ✅ Değişiklikler anında yansımalı
- ✅ Modal kapatıldığında veriler korunmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 8️⃣ Responsive Tasarım

**Test Adımları:**
1. Tarayıcı penceresini küçült (mobil boyut)
2. Sidebar'ın davranışını kontrol et
3. Tabloların scrollbar gösterip göstermediğini kontrol et

**Beklenen Sonuç:**
- ✅ 768px altında sidebar daraltılmalı
- ✅ Tablolar yatay scroll göstermeli
- ✅ Butonlar responsive olmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 9️⃣ Oturum Kalıcılığı

**Test Adımları:**
1. "Beni hatırla" ile giriş yap
2. Tarayıcıyı kapat
3. Tarayıcıyı tekrar aç
4. `admin-login.html` sayfasına git

**Beklenen Sonuç:**
- ✅ Otomatik olarak admin.html'e yönlenmeli
- ✅ Session bilgisi localStorage'da saklanmalı

**Test Durumu:** ⏳ Test Edilecek

---

### 🔟 Çıkış İşlemi

**Test Adımları:**
1. Sidebar'daki "🚪 Çıkış Yap" butonuna tıkla
2. Onay penceresinde "Tamam" seç

**Beklenen Sonuç:**
- ✅ Session temizlenmeli
- ✅ Login sayfasına yönlenmeli
- ✅ Geri butonu ile admin panele dönülememeli

**Test Durumu:** ⏳ Test Edilecek

---

## 🐛 BULUNAN HATALAR

| # | Hata | Kritiklik | Durum |
|---|------|-----------|-------|
| - | Henüz test edilmedi | - | - |

---

## ✅ TAMAMLANAN DÜZELTMELER

1. **Script.js Bağımlılığı Kaldırıldı**
   - admin.html'den gereksiz script.js import kaldırıldı
   - Admin.js bağımsız çalışıyor

2. **Event Propagation Düzeltildi**
   - Menu linklerine event parametresi eklendi
   - preventDefault ile sayfa yenilenmesi engellendi

3. **Default Veri İnisyalizasyonu**
   - Admin.html'de ilk açılışta default kullanıcı ve binalar oluşturuluyor
   - Admin-login.html'de default admin hesabı otomatik oluşturuluyor

---

## 📊 TEST SONUÇLARI ÖZETİ

**Toplam Test:** 10  
**Başarılı:** 0 (henüz test edilmedi)  
**Başarısız:** 0  
**Beklemede:** 10  

**Test Başarı Oranı:** ⏳ 0% (Test bekleniyor)

---

## 🎯 SONRAKİ ADIMLAR

1. Admin paneli tarayıcıda test et
2. Bulunan hataları kaydet
3. Kritik hataları düzelt
4. Test senaryolarını tamamla
5. Test başarı oranını %100 yap

---

## 📝 NOTLAR

- Sunucu çalışıyor: `http://localhost:8000`
- Login sayfası: `http://localhost:8000/admin-login.html`
- Admin panel: `http://localhost:8000/admin.html`
- Default hesap: admin / admin123

**Geliştirici:** Oğulcan Durkan  
**Son Güncelleme:** 31 Aralık 2025
