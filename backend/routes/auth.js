const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// POST /api/auth/login - Kullanıcı girişi
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kullanıcı adı ve şifre gerekli' 
            });
        }

        // Kullanıcıyı bul
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE', 
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Geçersiz kullanıcı adı veya şifre' 
            });
        }

        const user = users[0];

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Geçersiz kullanıcı adı veya şifre' 
            });
        }

        // Last login güncelle
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?', 
            [user.id]
        );

        // JWT token oluştur
        const expiresIn = rememberMe ? '7d' : '24h';
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role,
                fullName: user.full_name
            },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.json({ 
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// POST /api/auth/logout - Çıkış (client-side token silme)
router.post('/logout', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Çıkış başarılı' 
    });
});

// GET /api/auth/verify - Token doğrulama
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token bulunamadı' 
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Geçersiz token' 
                });
            }

            // Kullanıcının hala aktif olduğunu kontrol et
            const [users] = await db.query(
                'SELECT id, username, full_name, email, role FROM users WHERE id = ? AND is_active = TRUE',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Kullanıcı bulunamadı' 
                });
            }

            res.json({ 
                success: true,
                user: users[0]
            });
        });

    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;
