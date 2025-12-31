# 🚀 Bulancak Atıksu Backend API - Kurulum Rehberi

## 📦 Gereksinimler
- Node.js (v16+)
- MySQL (v8+)
- npm veya yarn

## 🔧 Kurulum Adımları

### 1. Bağımlılıkları Yükle
```bash
cd backend
npm install
```

### 2. Database Oluştur

**MySQL'e bağlan:**
```bash
mysql -u root -p
```

**SQL dosyasını çalıştır:**
```sql
source database-setup.sql
```

Ya da phpMyAdmin'den `database-setup.sql` dosyasını import et.

### 3. Environment Dosyası Oluştur

`.env.example` dosyasını `.env` olarak kopyala:
```bash
cp .env.example .env
```

**.env dosyasını düzenle:**
```env
DB_HOST=ogubenn.com.tr
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=bulancak_atiksu

PORT=2222
NODE_ENV=production

JWT_SECRET=rastgele_gizli_anahtar_buraya_koy

FRONTEND_URL=https://your-vercel-app.vercel.app
```

**🔒 JWT Secret Oluştur:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Sunucuyu Başlat

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Sunucu `https://ogubenn.com.tr:2222` adresinde çalışacak.

## 🧪 Test Et

**Health check:**
```bash
curl https://ogubenn.com.tr:2222/health
```

**Login test:**
```bash
curl -X POST https://ogubenn.com.tr:2222/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/verify` - Token doğrula

### Users (Auth required)
- `GET /api/users` - Tüm kullanıcılar
- `GET /api/users/:id` - Kullanıcı detay
- `POST /api/users` - Kullanıcı oluştur (Admin)
- `PUT /api/users/:id` - Kullanıcı güncelle (Admin)
- `DELETE /api/users/:id` - Kullanıcı sil (Admin)

### Buildings
- `GET /api/buildings` - Tüm binalar
- `GET /api/buildings/:id` - Bina detay + kontrol listesi
- `POST /api/buildings` - Bina oluştur (Admin)
- `PUT /api/buildings/:id` - Bina güncelle (Admin)
- `DELETE /api/buildings/:id` - Bina sil (Admin)

### Checklist
- `GET /api/checklist/:buildingId` - Kontrol listesi
- `POST /api/checklist/:buildingId` - Madde ekle (Admin)
- `PUT /api/checklist/:id` - Madde güncelle (Admin)
- `DELETE /api/checklist/:id` - Madde sil (Admin)

### Controls (Auth required, Operator+)
- `GET /api/controls` - Kontrol kayıtları (filtreleme)
- `GET /api/controls/:id` - Kontrol detay
- `POST /api/controls` - Kontrol kaydet
- `PUT /api/controls/:id` - Kontrol güncelle
- `DELETE /api/controls/:id` - Kontrol sil (Admin)
- `GET /api/controls/stats/overview` - İstatistikler

## 🔐 Default Admin Hesap

- **Kullanıcı:** admin
- **Şifre:** admin123

**⚠️ ÜRETİME GEÇMEDEn ŞİFREYİ DEĞİŞTİR!**

## 🌐 CORS Ayarları

Backend, `.env` dosyasındaki `FRONTEND_URL` adresine CORS izni veriyor.

Vercel'e deploy ettikten sonra `.env` dosyasını güncelle:
```env
FRONTEND_URL=https://bulancak-atiksu.vercel.app
```

## 🚀 Sunucuya Deploy

### Yöntem 1: PM2 ile (Önerilen)
```bash
npm install -g pm2
pm2 start server.js --name bulancak-api
pm2 save
pm2 startup
```

### Yöntem 2: Systemd Service
```bash
sudo nano /etc/systemd/system/bulancak-api.service
```

```ini
[Unit]
Description=Bulancak Atıksu API
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable bulancak-api
sudo systemctl start bulancak-api
```

## 📊 Database Yedekleme

**Yedek al:**
```bash
mysqldump -u root -p bulancak_atiksu > backup_$(date +%Y%m%d).sql
```

**Geri yükle:**
```bash
mysql -u root -p bulancak_atiksu < backup_20251231.sql
```

## 🐛 Hata Ayıklama

**Log kontrol (PM2):**
```bash
pm2 logs bulancak-api
```

**Database bağlantı testi:**
```bash
node -e "require('./config/database')"
```

## 🔒 Güvenlik Notları

1. `.env` dosyasını Git'e ekleme (.gitignore'da)
2. JWT secret'i güçlü ve rastgele yap
3. HTTPS kullan (production)
4. Rate limiting ekle (opsiyonel)
5. Admin şifresini değiştir

## 📞 Destek

Sorun yaşarsan:
1. `pm2 logs` ile log kontrol et
2. MySQL bağlantısını kontrol et
3. Port 2222'nin açık olduğunu doğrula

**Geliştirici:** Oğulcan Durkan  
**Tarih:** 31 Aralık 2025
