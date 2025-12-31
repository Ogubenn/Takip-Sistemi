const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/buildings - Tüm binaları listele
router.get('/', async (req, res) => {
    try {
        const [buildings] = await db.query(
            'SELECT * FROM buildings WHERE is_active = TRUE ORDER BY display_order, created_at'
        );

        res.json({ 
            success: true,
            buildings
        });

    } catch (error) {
        console.error('Get buildings error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// GET /api/buildings/:id - Tek bina detayı + kontrol listesi
router.get('/:id', async (req, res) => {
    try {
        // Bina bilgisi
        const [buildings] = await db.query(
            'SELECT * FROM buildings WHERE id = ?',
            [req.params.id]
        );

        if (buildings.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bina bulunamadı' 
            });
        }

        // Kontrol listesi
        const [checklist] = await db.query(
            'SELECT * FROM checklist_items WHERE building_id = ? AND is_active = TRUE ORDER BY item_order',
            [req.params.id]
        );

        res.json({ 
            success: true,
            building: buildings[0],
            checklist
        });

    } catch (error) {
        console.error('Get building error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// POST /api/buildings - Yeni bina oluştur (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id, name, icon, description, displayOrder } = req.body;

        if (!id || !name) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID ve isim zorunludur' 
            });
        }

        // ID kontrolü
        const [existing] = await db.query('SELECT id FROM buildings WHERE id = ?', [id]);
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Bu ID zaten kullanılıyor' 
            });
        }

        await db.query(
            'INSERT INTO buildings (id, name, icon, description, display_order) VALUES (?, ?, ?, ?, ?)',
            [id, name, icon || '🏢', description || '', displayOrder || 0]
        );

        res.status(201).json({ 
            success: true,
            message: 'Bina başarıyla oluşturuldu'
        });

    } catch (error) {
        console.error('Create building error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// PUT /api/buildings/:id - Bina güncelle (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, icon, description, displayOrder, isActive } = req.body;
        const buildingId = req.params.id;

        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (icon) {
            updates.push('icon = ?');
            values.push(icon);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (displayOrder !== undefined) {
            updates.push('display_order = ?');
            values.push(displayOrder);
        }
        if (isActive !== undefined) {
            updates.push('is_active = ?');
            values.push(isActive);
        }

        if (updates.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Güncellenecek alan bulunamadı' 
            });
        }

        values.push(buildingId);
        const [result] = await db.query(
            `UPDATE buildings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bina bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Bina başarıyla güncellendi'
        });

    } catch (error) {
        console.error('Update building error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// DELETE /api/buildings/:id - Bina sil (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM buildings WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Bina bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Bina başarıyla silindi'
        });

    } catch (error) {
        console.error('Delete building error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;
