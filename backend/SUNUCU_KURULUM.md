# 🚀 Sunucuya Backend Kurulum Rehberi

## 📦 1. Dosyaları Sunucuya Yükle

### FTP/SFTP ile:
`backend/` klasörünün tüm içeriğini sunucunun bir klasörüne yükle.

Örnek konum: `/home/ogubenn/backend/`

### Yüklenecek Dosyalar:
```
backend/
├── package.json
├── .env
├── server.js
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
└── routes/
    ├── auth.js
    ├── users.js
    ├── buildings.js
    ├── checklist.js
    └── controls.js
```

## 🔧 2. .env Dosyasını Düzenle

Sunucuda `.env` dosyasını aç ve **DB_PASSWORD**'u gerçek şifrenle değiştir:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ogubenn__KGaQodQ2b8sbJC1CUeWNNWchs3nweqS0
DB_PASSWORD=GERÇEK_ŞİFRENİ_BURAYA_YAZ
DB_NAME=ogubenn_atiksi_db
```

## 📡 3. Node.js ve npm Kontrol

SSH ile sunucuya bağlan:

```bash
ssh ogubenn@ogubenn.com.tr
```

Node.js versiyonunu kontrol et:

```bash
node --version  # v16 veya üstü olmalı
npm --version
```

**Node.js yoksa:** Hosting sağlayıcınla iletişime geç.

## 📦 4. Paketleri Yükle

Backend klasörüne git ve paketleri yükle:

```bash
cd /home/ogubenn/backend
npm install
```

Bu şu paketleri yükleyecek:
- express
- mysql2
- bcrypt
- jsonwebtoken
- cors
- dotenv
- body-parser

## 🧪 5. Test Et

Önce manuel başlat:

```bash
node server.js
```

Başka bir terminal'de test et:

```bash
curl http://localhost:2222/health
```

Başarılı yanıt:
```json
{
  "status": "OK",
  "message": "Bulancak Atıksu API çalışıyor",
  "timestamp": "2025-12-31T..."
}
```

**Ctrl+C** ile durdur.

## 🔄 6. PM2 ile Kalıcı Çalıştır

PM2 kur (global):

```bash
npm install -g pm2
```

Backend'i başlat:

```bash
cd /home/ogubenn/backend
pm2 start server.js --name bulancak-api
```

PM2 komutları:

```bash
pm2 list              # Çalışan uygulamalar
pm2 logs bulancak-api # Logları göster
pm2 restart bulancak-api
pm2 stop bulancak-api
pm2 delete bulancak-api
```

Sunucu yeniden başladığında otomatik başlasın:

```bash
pm2 startup
pm2 save
```

## 🌐 7. Nginx/Apache Reverse Proxy (Opsiyonel)

Eğer port 2222 dışarıdan erişilebilir değilse:

### Nginx:
```nginx
location /api {
    proxy_pass http://localhost:2222;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Apache (.htaccess):
```apache
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:2222/api/$1 [P,L]
```

## 🔒 8. Firewall Ayarları

Port 2222'yi aç:

```bash
sudo ufw allow 2222/tcp
sudo ufw reload
```

## ✅ 9. API Test Et

Dış dünyadan test:

```bash
curl https://ogubenn.com.tr:2222/health
```

veya tarayıcıda:
```
https://ogubenn.com.tr:2222/health
```

## 🐛 Sorun Giderme

### "Cannot find module" Hatası
```bash
cd /home/ogubenn/backend
rm -rf node_modules package-lock.json
npm install
```

### Database Bağlantı Hatası
- `.env` dosyasında şifre doğru mu?
- MySQL çalışıyor mu: `systemctl status mysql`
- Port 3306 açık mı?

### Port Zaten Kullanılıyor
```bash
# Çalışan process'i bul
lsof -i :2222
# Kill et
kill -9 <PID>
```

### PM2 Log Kontrol
```bash
pm2 logs bulancak-api --lines 50
```

## 📊 İzleme

PM2 dashboard:
```bash
pm2 monit
```

## 🔄 Güncelleme

Kod değiştirdikten sonra:

```bash
cd /home/ogubenn/backend
pm2 restart bulancak-api
```

---

**Kurulum tamamlandı!** Artık frontend Vercel'e deploy edilip API'ye bağlanabilir.

**API Base URL:** `https://ogubenn.com.tr:2222/api`
