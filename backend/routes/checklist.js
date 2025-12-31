const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/checklist/:buildingId - Bina için kontrol listesi
router.get('/:buildingId', async (req, res) => {
    try {
        const [items] = await db.query(
            'SELECT * FROM checklist_items WHERE building_id = ? AND is_active = TRUE ORDER BY item_order',
            [req.params.buildingId]
        );

        res.json({ 
            success: true,
            items
        });

    } catch (error) {
        console.error('Get checklist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// POST /api/checklist/:buildingId - Yeni kontrol maddesi ekle (Admin only)
router.post('/:buildingId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { itemText, itemOrder } = req.body;
        const buildingId = req.params.buildingId;

        if (!itemText) {
            return res.status(400).json({ 
                success: false, 
                message: 'Madde metni zorunludur' 
            });
        }

        // Eğer sıra verilmemişse, en sona ekle
        let order = itemOrder;
        if (!order) {
            const [result] = await db.query(
                'SELECT MAX(item_order) as maxOrder FROM checklist_items WHERE building_id = ?',
                [buildingId]
            );
            order = (result[0].maxOrder || 0) + 1;
        }

        const [result] = await db.query(
            'INSERT INTO checklist_items (building_id, item_text, item_order) VALUES (?, ?, ?)',
            [buildingId, itemText, order]
        );

        res.status(201).json({ 
            success: true,
            message: 'Kontrol maddesi eklendi',
            itemId: result.insertId
        });

    } catch (error) {
        console.error('Add checklist item error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// PUT /api/checklist/:id - Kontrol maddesi güncelle (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { itemText, itemOrder, isActive } = req.body;
        const itemId = req.params.id;

        const updates = [];
        const values = [];

        if (itemText) {
            updates.push('item_text = ?');
            values.push(itemText);
        }
        if (itemOrder !== undefined) {
            updates.push('item_order = ?');
            values.push(itemOrder);
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

        values.push(itemId);
        const [result] = await db.query(
            `UPDATE checklist_items SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kontrol maddesi bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Kontrol maddesi güncellendi'
        });

    } catch (error) {
        console.error('Update checklist item error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// DELETE /api/checklist/:id - Kontrol maddesi sil (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM checklist_items WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Kontrol maddesi bulunamadı' 
            });
        }

        res.json({ 
            success: true,
            message: 'Kontrol maddesi silindi'
        });

    } catch (error) {
        console.error('Delete checklist item error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

module.exports = router;
