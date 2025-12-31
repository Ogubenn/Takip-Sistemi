const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Tüm kullanıcıları listele
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, full_name, email, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC'
        );

        res.json({ 
            success: true,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// GET /api/users/:id - Tek kullanıcı detayı
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, username, full_name, email, role, created_at, last_login, is_active FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// POST /api/users - Yeni kullanıcı oluştur (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, password, fullName, email, role } = req.body;

        // Validasyon
        if (!username || !password || !fullName || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tüm alanlar zorunludur' 
            });
        }

        // Kullanıcı adı kontrolü
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bu kullanıcı adı veya email zaten kullanılıyor' 
            });
        }

        // Şifreyi hashle
        const passwordHash = await bcrypt.hash(password, 10);

        // Kullanıcı ekle
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, passwordHash, fullName, email, role || 'operator']
        );

        res.status(201).json({ 
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// PUT /api/users/:id - Kullanıcı güncelle (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { fullName, email, role, isActive, password } = req.body;
        const userId = req.params.id;

        // Kullanıcı var mı kontrol et
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }

        // Güncelleme sorgusu oluştur
        const updates = [];
        const values = [];

        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (role) {
            updates.push('role = ?');
            values.push(role);
        }
        if (isActive !== undefined) {
            updates.push('is_active = ?');
            values.push(isActive);
        }
        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            values.push(passwordHash);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Güncellenecek alan bulunamadı' 
            });
        }

        values.push(userId);
        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ 
            success: true,
            message: 'Kullanıcı başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// DELETE /api/users/:id - Kullanıcı sil (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        // Kendi hesabını silmeye çalışıyor mu?
        if (req.user.id === parseInt(userId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Kendi hesabınızı silemezsiniz' 
            });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Kullanıcı başarıyla silindi'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;
