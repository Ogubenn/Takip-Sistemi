const jwt = require('jsonwebtoken');

// JWT token doğrulama middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Yetkilendirme token\'ı bulunamadı' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Geçersiz veya süresi dolmuş token' 
            });
        }

        req.user = user;
        next();
    });
};

// Admin rolü kontrolü
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Bu işlem için admin yetkisi gerekli' 
        });
    }
    next();
};

// Operatör veya admin kontrolü
const requireOperator = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ 
            success: false, 
            message: 'Bu işlem için operatör veya admin yetkisi gerekli' 
        });
    }
    next();
};

module.exports = { 
    authenticateToken, 
    requireAdmin, 
    requireOperator 
};
