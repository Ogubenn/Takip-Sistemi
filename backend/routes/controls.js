const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireOperator } = require('../middleware/auth');

const router = express.Router();

// GET /api/controls - Kontrol kayıtlarını listele (filtreleme ile)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { buildingId, startDate, endDate, userId, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT c.*, b.name as building_name, b.icon as building_icon, u.full_name as user_full_name FROM control_records c LEFT JOIN buildings b ON c.building_id = b.id LEFT JOIN users u ON c.user_id = u.id WHERE 1=1';
        const params = [];

        if (buildingId) {
            query += ' AND c.building_id = ?';
            params.push(buildingId);
        }

        if (startDate) {
            query += ' AND c.control_date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND c.control_date <= ?';
            params.push(endDate);
        }

        if (userId) {
            query += ' AND c.user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY c.control_date DESC, c.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [controls] = await db.query(query, params);

        // Her kayıt için checked items'ı parse et
        const formattedControls = controls.map(control => ({
            ...control,
            checked_items: JSON.parse(control.checked_items || '[]')
        }));

        res.json({ 
            success: true,
            controls: formattedControls,
            count: formattedControls.length
        });

    } catch (error) {
        console.error('Get controls error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// GET /api/controls/:id - Tek kontrol kaydı detayı
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [controls] = await db.query(
            `SELECT c.*, b.name as building_name, b.icon as building_icon, 
             u.full_name as user_full_name, u.username 
             FROM control_records c 
             LEFT JOIN buildings b ON c.building_id = b.id 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.id = ?`,
            [req.params.id]
        );

        if (controls.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kontrol kaydı bulunamadı' 
            });
        }

        const control = {
            ...controls[0],
            checked_items: JSON.parse(controls[0].checked_items || '[]')
        };

        res.json({ 
            success: true,
            control
        });

    } catch (error) {
        console.error('Get control error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// POST /api/controls - Yeni kontrol kaydı oluştur (Operatör+)
router.post('/', authenticateToken, requireOperator, async (req, res) => {
    try {
        const { buildingId, controlDate, checkedItems, notes } = req.body;
        const userId = req.user.id;

        if (!buildingId || !controlDate || !checkedItems) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bina, tarih ve kontrol maddeleri zorunludur' 
            });
        }

        // Bina var mı kontrol et
        const [buildings] = await db.query('SELECT id FROM buildings WHERE id = ?', [buildingId]);
        if (buildings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bina bulunamadı' 
            });
        }

        // Aynı bina ve tarih için kayıt var mı?
        const [existing] = await db.query(
            'SELECT id FROM control_records WHERE building_id = ? AND control_date = ?',
            [buildingId, controlDate]
        );

        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bu bina için bugün zaten kontrol kaydı var' 
            });
        }

        const checkedCount = checkedItems.length;
        const completionRate = checkedCount > 0 ? 100 : 0; // Total count API'den alınabilir

        const [result] = await db.query(
            `INSERT INTO control_records 
            (building_id, user_id, control_date, checked_items, notes, checked_count, completion_rate) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                buildingId, 
                userId, 
                controlDate, 
                JSON.stringify(checkedItems), 
                notes || '', 
                checkedCount, 
                completionRate
            ]
        );

        res.status(201).json({ 
            success: true,
            message: 'Kontrol kaydı başarıyla oluşturuldu',
            controlId: result.insertId
        });

    } catch (error) {
        console.error('Create control error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// PUT /api/controls/:id - Kontrol kaydı güncelle (Kendi kaydı veya Admin)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const controlId = req.params.id;
        const { checkedItems, notes } = req.body;

        // Kayıt var mı ve kullanıcı yetkili mi?
        const [controls] = await db.query(
            'SELECT user_id FROM control_records WHERE id = ?',
            [controlId]
        );

        if (controls.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kontrol kaydı bulunamadı' 
            });
        }

        // Sadece kendi kaydını veya admin tüm kayıtları güncelleyebilir
        if (req.user.role !== 'admin' && controls[0].user_id !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Bu kaydı güncelleme yetkiniz yok' 
            });
        }

        const updates = [];
        const values = [];

        if (checkedItems) {
            updates.push('checked_items = ?');
            values.push(JSON.stringify(checkedItems));
            updates.push('checked_count = ?');
            values.push(checkedItems.length);
        }

        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Güncellenecek alan bulunamadı' 
            });
        }

        values.push(controlId);
        await db.query(
            `UPDATE control_records SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        res.json({ 
            success: true,
            message: 'Kontrol kaydı güncellendi'
        });

    } catch (error) {
        console.error('Update control error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// DELETE /api/controls/:id - Kontrol kaydı sil (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // Sadece admin silebilir
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Bu işlem için admin yetkisi gerekli' 
            });
        }

        const [result] = await db.query('DELETE FROM control_records WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kontrol kaydı bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Kontrol kaydı silindi'
        });

    } catch (error) {
        console.error('Delete control error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// GET /api/controls/stats/overview - Genel istatistikler
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        // Toplam kontrol sayısı
        const [totalControls] = await db.query('SELECT COUNT(*) as count FROM control_records');
        
        // Bu ayki kontroller
        const [monthlyControls] = await db.query(
            'SELECT COUNT(*) as count FROM control_records WHERE MONTH(control_date) = MONTH(CURRENT_DATE) AND YEAR(control_date) = YEAR(CURRENT_DATE)'
        );

        // Bugünkü kontroller
        const [todayControls] = await db.query(
            'SELECT COUNT(*) as count FROM control_records WHERE control_date = CURDATE()'
        );

        // Ortalama tamamlanma oranı
        const [avgCompletion] = await db.query(
            'SELECT AVG(completion_rate) as avg_rate FROM control_records'
        );

        res.json({ 
            success: true,
            stats: {
                totalControls: totalControls[0].count,
                monthlyControls: monthlyControls[0].count,
                todayControls: todayControls[0].count,
                avgCompletionRate: Math.round(avgCompletion[0].avg_rate || 0)
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;
