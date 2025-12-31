# 📁 Bulancak Atıksu Arıtma Tesisi - Kontrol Sistemi

## 🏗️ Proje Yapısı

```
Kontrol_Qr_Projesi/
│
├── 📄 index.html              # Ana sayfa - Bina seçimi
├── 📄 kontrol.html            # Kontrol listesi sayfası
├── 📄 gecmis.html             # Geçmiş kayıtlar görüntüleme
├── 📄 istatistikler.html      # İstatistikler ve raporlar
├── 📄 qr-kodlar.html          # QR kod oluşturucu
│
├── 📁 css/
│   └── style.css              # Ana stil dosyası (responsive design)
│
├── 📁 js/
│   └── script.js              # Ana JavaScript dosyası (veri yönetimi)
│
├── 📁 assets/
│   └── 📁 images/
│       └── logo.jpg           # Bulancak Belediyesi logosu
│
├── 📄 README.md               # Proje dokümantasyonu
└── 📄 LOGO_EKLEME_TALIMATI.md # Logo ekleme rehberi
```

## 🎯 Dosya Açıklamaları

### 📱 HTML Sayfaları

#### `index.html` - Ana Sayfa
- Bina kartları (Giriş, Pompaj, Arıtma, Jeneratör)
- Bugünün kontrol durumu (0/4)
- Hızlı linkler (Geçmiş, İstatistikler, QR Kodlar)

#### `kontrol.html` - Kontrol Sayfası
- Dinamik kontrol listeleri (her bina için farklı)
- Checkbox'lar ile kontrol işaretleme
- Not alanı
- Otomatik kaydetme (LocalStorage)

#### `gecmis.html` - Geçmiş Kayıtlar
- Tarih bazlı filtreleme
- Bina bazlı filtreleme
- Detaylı kayıt görüntüleme
- Tamamlanma oranları

#### `istatistikler.html` - İstatistikler
- Toplam kontrol sayısı


## 📱 Mobil Kullanım

### Özellikler
- ✅ Touch-friendly butonlar ve checkbox'lar
- ✅ Zoom kontrolü optimizasyonu
- ✅ Offline çalışma desteği
- ✅ Tüm ekran boyutlarına uyumlu
- ✅ Portre ve landscape mode desteği

## 🔧 Teknik Detaylar

### Frontend Teknolojileri
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Animations
- **JavaScript (Vanilla)**: ES6+ syntax
- **LocalStorage**: Client-side data storage
- **QRCode.js**: QR kod kütüphanesi

### Browser Desteği
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobil tarayıcılar (iOS Safari, Chrome Mobile)

## 🔒 Güvenlik ve Gizlilik

- ✅ Veriler sadece cihazda saklanır
- ✅ Sunucuya veri gönderilmez
- ✅ Kullanıcı izni gerektirmez
- ⚠️ Not: Tarayıcı verilerini silmek tüm kayıtları siler

## 📞 İletişim

Bu proje Bulancak Atıksu Arıtma Tesisi için özel olarak geliştirilmiştir.

---

**Versiyon**: 2.0  
**Son Güncelleme**: 31 Aralık 2025  
**Lisans**: Özel Kullanım

- Format: JPG
- Kullanım: Tüm sayfa header'larında
- Boyutlar: Mobil 80px → Tablet 100px → Desktop 120px

## 🏢 Binalar

1. **🏢 Giriş Binası** - Ana giriş ve güvenlik kontrolleri (10 madde)
2. **⚙️ Pompaj İstasyonu** - Pompa ve motor kontrolleri (10 madde)
3. **💧 Arıtma Ünitesi** - Su arıtma ve kimyasal kontroller (10 madde)
4. **🔌 Jeneratör Binası** - Jeneratör ve elektrik kontrolleri (10 madde)

## 🚀 Kurulum ve Kullanım

### Gereksinimler
- Modern web tarayıcısı
- LocalStorage desteği
- İnternet (sadece QR kod kütüphanesi için)

### Çalıştırma
1. `index.html` dosyasını tarayıcıda açın
2. Herhangi bir sunucu gerektirmez
3. Çevrimdışı çalışır (offline-ready)

### QR Kod Kullanımı
1. `qr-kodlar.html` sayfasını açın
2. QR kodları yazdırın
3. Bina girişlerine yerleştirin
4. Mobil kamera ile okutun
5. Direkt kontrol sayfasına yönlendirilir

## 📊 Özellikler

### Mevcut Özellikler ✅
- ✅ QR kod tabanlı erişim sistemi
- ✅ 4 bina için özel kontrol listeleri
- ✅ Her bina için 10 kontrol maddesi
- ✅ Not alanı ve gözlem kaydı
- ✅ Otomatik günlük sıfırlama (gece yarısı)
- ✅ Geçmiş kayıtlar görüntüleme
- ✅ İstatistik ve raporlar
- ✅ Günlük seri hesaplama
- ✅ Tam responsive tasarım (mobil/tablet/desktop)
- ✅ Bulancak Belediyesi logosu entegrasyonu
- ✅ Profesyonel dosya dizin yapısı

### Gelecek Özellikler 🔜
- 🔜 Kullanıcı giriş sistemi
- 🔜 Veritabanı entegrasyonu (MySQL/PostgreSQL)
- 🔜 Fotoğraf yükleme
- 🔜 E-posta bildirimleri
- 🔜 PDF rapor oluşturma
- Raporlama sistemi
- Fotoğraf ekleme
- E-posta bildirimleri

## 📂 Dosya Yapısı

```
Kontrol_Qr_Projesi/
├── index.html          # Ana sayfa
├── kontrol.html        # Kontrol sayfası
├── qr-kodlar.html      # QR kod oluşturucu
├── style.css           # Stil dosyası
├── script.js           # JavaScript kodları
└── README.md           # Bu dosya
```

## 🌐 Tarayıcı Desteği

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobil tarayıcılar ✅

## 📞 Destek

Sorularınız için: [Projeyi geliştirmeye devam edin]

---
**Versiyon**: 1.0  
**Tarih**: 31 Aralık 2025
