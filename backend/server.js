const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const buildingRoutes = require('./routes/buildings');
const checklistRoutes = require('./routes/checklist');
const controlRoutes = require('./routes/controls');

const app = express();
const PORT = process.env.PORT || 2222;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Production'da frontend URL'ini ekle
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Bulancak Atıksu API çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/controls', controlRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint bulunamadı' 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('🚀 Bulancak Atıksu Arıtma Tesisi Backend API');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📡 Sunucu çalışıyor: https://ogubenn.com.tr:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Available Endpoints:');
    console.log('  GET    /health                      - Health check');
    console.log('  POST   /api/auth/login              - Kullanıcı girişi');
    console.log('  POST   /api/auth/logout             - Çıkış');
    console.log('  GET    /api/auth/verify             - Token doğrulama');
    console.log('  GET    /api/users                   - Kullanıcılar');
    console.log('  GET    /api/buildings               - Binalar');
    console.log('  GET    /api/checklist/:buildingId   - Kontrol listesi');
    console.log('  GET    /api/controls                - Kontrol kayıtları');
    console.log('  GET    /api/controls/stats/overview - İstatistikler');
    console.log('\n✅ Backend hazır! Frontend\'i API\'ye bağlayabilirsin.\n');
});

module.exports = app;
