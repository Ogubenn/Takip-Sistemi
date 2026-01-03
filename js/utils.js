/**
 * UTILS.JS - Ortak Yardımcı Fonksiyonlar
 * Tüm sayfalarda kullanılan ortak fonksiyonlar
 */

// ============================================
// LOADING & NOTIFICATION FONKSİYONLARI
// ============================================

/**
 * Loading göster
 * @param {string} message - Gösterilecek mesaj
 */
function showLoading(message = 'Yükleniyor...') {
    const existingLoader = document.getElementById('global-loader');
    if (existingLoader) {
        existingLoader.querySelector('.loader-message').textContent = message;
        existingLoader.style.display = 'flex';
        return;
    }

    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(3px);
    `;
    
    loader.innerHTML = `
        <div style="
            background: white;
            padding: 30px 50px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
        ">
            <div style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p class="loader-message" style="
                margin: 0;
                font-size: 16px;
                color: #333;
                font-weight: 500;
            ">${message}</p>
        </div>
    `;
    
    // Animation ekle
    if (!document.getElementById('spinner-animation')) {
        const style = document.createElement('style');
        style.id = 'spinner-animation';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loader);
}

/**
 * Loading gizle
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Başarı mesajı göster
 * @param {string} message - Mesaj
 * @param {number} duration - Süre (ms)
 */
function showSuccess(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

/**
 * Hata mesajı göster
 * @param {string} message - Mesaj
 * @param {number} duration - Süre (ms)
 */
function showError(message, duration = 5000) {
    showNotification(message, 'error', duration);
}

/**
 * Bilgi mesajı göster
 * @param {string} message - Mesaj
 * @param {number} duration - Süre (ms)
 */
function showInfo(message, duration = 3000) {
    showNotification(message, 'info', duration);
}

/**
 * Notification göster (genel)
 * @param {string} message - Mesaj
 * @param {string} type - Tip: success, error, info
 * @param {number} duration - Süre (ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const colors = {
        success: { bg: '#28a745', icon: '✓' },
        error: { bg: '#dc3545', icon: '✕' },
        info: { bg: '#007bff', icon: 'ℹ' }
    };
    
    const config = colors[type] || colors.info;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${config.bg};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 15px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 20px; font-weight: bold;">${config.icon}</span>
        <span>${message}</span>
    `;
    
    // Animation ekle
    if (!document.getElementById('notification-animation')) {
        const style = document.createElement('style');
        style.id = 'notification-animation';
        style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============================================
// TARİH & ZAMAN FONKSİYONLARI
// ============================================

/**
 * Tarihi formatla
 * @param {string|Date} date - Tarih
 * @param {string} format - Format: 'full', 'date', 'time', 'datetime'
 * @returns {string}
 */
function formatDate(date, format = 'full') {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    switch (format) {
        case 'date':
            return `${day}.${month}.${year}`;
        case 'time':
            return `${hours}:${minutes}`;
        case 'datetime':
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        case 'full':
        default:
            return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
}

/**
 * Bugünün tarihini al (YYYY-MM-DD)
 * @returns {string}
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Geçen süreyi hesapla (relative time)
 * @param {string|Date} date - Tarih
 * @returns {string}
 */
function timeAgo(date) {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const seconds = Math.floor((new Date() - d) / 1000);
    
    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    
    return formatDate(date, 'date');
}

// ============================================
// VALİDASYON FONKSİYONLARI
// ============================================

/**
 * Email validasyonu
 * @param {string} email - Email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Telefon validasyonu (Türkiye)
 * @param {string} phone - Telefon
 * @returns {boolean}
 */
function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Boş alan kontrolü
 * @param {string} value - Değer
 * @returns {boolean}
 */
function isEmpty(value) {
    return !value || value.trim() === '';
}

/**
 * String temizle (XSS koruması)
 * @param {string} str - String
 * @returns {string}
 */
function sanitizeString(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * HTML encode
 * @param {string} str - String
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// STORAGE FONKSİYONLARI
// ============================================

/**
 * LocalStorage'a kaydet
 * @param {string} key - Anahtar
 * @param {any} value - Değer
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Storage save error:', error);
        return false;
    }
}

/**
 * LocalStorage'dan oku
 * @param {string} key - Anahtar
 * @param {any} defaultValue - Varsayılan değer
 * @returns {any}
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Storage read error:', error);
        return defaultValue;
    }
}

/**
 * LocalStorage'dan sil
 * @param {string} key - Anahtar
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
}

// ============================================
// DİĞER YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Debounce fonksiyonu
 * @param {Function} func - Fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Array'i grupla
 * @param {Array} array - Dizi
 * @param {string} key - Gruplama anahtarı
 * @returns {Object}
 */
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) result[group] = [];
        result[group].push(item);
        return result;
    }, {});
}

/**
 * Query string'den parametreleri al
 * @returns {Object}
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    
    return params;
}

/**
 * Sayfa yönlendir
 * @param {string} url - URL
 * @param {number} delay - Gecikme (ms)
 */
function redirect(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => window.location.href = url, delay);
    } else {
        window.location.href = url;
    }
}

/**
 * Confirm dialog (promise döner)
 * @param {string} message - Mesaj
 * @returns {Promise<boolean>}
 */
function confirmDialog(message) {
    return new Promise((resolve) => {
        resolve(confirm(message));
    });
}

// Export (ES6 module desteği varsa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        showSuccess,
        showError,
        showInfo,
        formatDate,
        getTodayDate,
        timeAgo,
        isValidEmail,
        isValidPhone,
        isEmpty,
        sanitizeString,
        escapeHtml,
        saveToStorage,
        getFromStorage,
        removeFromStorage,
        debounce,
        groupBy,
        getUrlParams,
        redirect,
        confirmDialog
    };
}
