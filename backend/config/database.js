const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Bağlantı testi
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL veritabanına başarıyla bağlandı!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL bağlantı hatası:', err.message);
        process.exit(1);
    });

module.exports = pool;
