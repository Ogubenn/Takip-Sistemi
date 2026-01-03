/**
 * API.JS - API İletişim Modülü
 * Tüm backend API çağrılarını yöneten merkezi modül
 */

const API_MODULE = {
    // Base URL (config.js'den alınır veya varsayılan)
    baseURL: typeof API_CONFIG !== 'undefined' && API_CONFIG.production 
        ? API_CONFIG.production.BASE_URL 
        : 'https://api.bulancakatiksu.ogubenn.com.tr',
    
    // Token yönetimi
    token: null,
    
    /**
     * Token'ı ayarla
     * @param {string} token - JWT token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    },
    
    /**
     * Token'ı al
     * @returns {string|null}
     */
    getToken() {
        if (!this.token) {
            this.token = localStorage.getItem('auth_token');
        }
        return this.token;
    },
    
    /**
     * Token'ı temizle (logout)
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    },
    
    /**
     * Request headers oluştur
     * @param {boolean} includeAuth - Auth header ekle mi?
     * @returns {Object}
     */
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        return headers;
    },
    
    /**
     * HTTP response'u işle
     * @param {Response} response - Fetch response
     * @returns {Promise}
     */
    async handleResponse(response) {
        let data;
        const contentType = response.headers.get('content-type');
        
        // JSON response kontrolü
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // JSON değilse text olarak al
            const text = await response.text();
            console.warn('Non-JSON response:', text);
            data = { success: false, message: 'Sunucu geçersiz yanıt döndürdü' };
        }
        
        // HTTP hata durumları
        if (!response.ok) {
            // 401 Unauthorized - Token geçersiz
            if (response.status === 401) {
                this.clearToken();
                if (window.location.pathname !== '/admin-login.html') {
                    window.location.href = '/admin-login.html';
                }
                throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
            }
            
            // 403 Forbidden - Yetki yok
            if (response.status === 403) {
                throw new Error('Bu işlem için yetkiniz yok.');
            }
            
            // 404 Not Found
            if (response.status === 404) {
                throw new Error('İstenilen kaynak bulunamadı.');
            }
            
            // 500 Server Error
            if (response.status >= 500) {
                throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
            }
            
            // Diğer hatalar
            throw new Error(data.message || `HTTP ${response.status} hatası`);
        }
        
        // Backend'den gelen hata mesajı varsa
        if (data.success === false) {
            throw new Error(data.message || 'İşlem başarısız');
        }
        
        return data;
    },
    
    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parametreleri
     * @param {string} token - Opsiyonel token (yoksa localStorage'dan alır)
     * @returns {Promise}
     */
    async get(endpoint, params = {}, token = null) {
        if (token) this.setToken(token);
        
        // Query string oluştur
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },
    
    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {string} token - Opsiyonel token
     * @returns {Promise}
     */
    async post(endpoint, data = {}, token = null) {
        if (token) this.setToken(token);
        
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },
    
    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {string} token - Opsiyonel token
     * @returns {Promise}
     */
    async put(endpoint, data = {}, token = null) {
        if (token) this.setToken(token);
        
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },
    
    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {string} token - Opsiyonel token
     * @returns {Promise}
     */
    async delete(endpoint, token = null) {
        if (token) this.setToken(token);
        
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    },
    
    /**
     * Dosya upload (multipart/form-data)
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data
     * @param {string} token - Opsiyonel token
     * @returns {Promise}
     */
    async upload(endpoint, formData, token = null) {
        if (token) this.setToken(token);
        
        const url = `${this.baseURL}${endpoint}`;
        
        // FormData için Content-Type header'ı eklemiyoruz (tarayıcı otomatik ekler)
        const headers = {};
        if (this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API Upload Error:', error);
            throw error;
        }
    },
    
    // ============================================
    // KISA YOL FONKSİYONLARI (ENDPOINTS)
    // ============================================
    
    /**
     * Kullanıcı login
     * @param {string} username
     * @param {string} password
     * @returns {Promise}
     */
    async login(username, password) {
        const response = await this.post('/auth/login.php', { username, password });
        if (response.token) {
            this.setToken(response.token);
            localStorage.setItem('current_user', JSON.stringify(response.user));
        }
        return response;
    },
    
    /**
     * Logout
     */
    logout() {
        this.clearToken();
        window.location.href = '/admin-login.html';
    },
    
    /**
     * Mevcut kullanıcıyı al
     * @returns {Object|null}
     */
    getCurrentUser() {
        try {
            const user = localStorage.getItem('current_user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    },
    
    /**
     * Token geçerli mi kontrol et
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // ============================================
    // KULLANICI İŞLEMLERİ
    // ============================================
    
    async getUsers(activeOnly = false) {
        return this.get('/users/index.php', activeOnly ? { active_only: 'true' } : {});
    },
    
    async createUser(userData) {
        return this.post('/users/index.php', userData);
    },
    
    async updateUser(userId, userData) {
        return this.put(`/users/index.php?id=${userId}`, userData);
    },
    
    async deleteUser(userId) {
        return this.delete(`/users/index.php?id=${userId}`);
    },
    
    // ============================================
    // BİNA İŞLEMLERİ
    // ============================================
    
    async getBuildings(activeOnly = false) {
        return this.get('/buildings/index.php', activeOnly ? { active_only: 'true' } : {});
    },
    
    async createBuilding(buildingData) {
        return this.post('/buildings/index.php', buildingData);
    },
    
    async updateBuilding(buildingId, buildingData) {
        return this.put(`/buildings/index.php?id=${buildingId}`, buildingData);
    },
    
    async deleteBuilding(buildingId) {
        return this.delete(`/buildings/index.php?id=${buildingId}`);
    },
    
    // ============================================
    // CHECKLIST İŞLEMLERİ
    // ============================================
    
    async getChecklist(buildingId) {
        return this.get('/checklist/index.php', { building_id: buildingId });
    },
    
    async updateChecklistItem(itemId, data) {
        return this.put(`/checklist/index.php?id=${itemId}`, data);
    },
    
    // ============================================
    // KONTROL İŞLEMLERİ
    // ============================================
    
    async getControls(filters = {}) {
        return this.get('/controls/index.php', filters);
    },
    
    async createControl(controlData) {
        return this.post('/controls/index.php', controlData);
    },
    
    async updateControl(controlId, controlData) {
        return this.put(`/controls/index.php?id=${controlId}`, controlData);
    },
    
    // ============================================
    // İSTATİSTİKLER
    // ============================================
    
    async getStats(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        return this.get('/controls/stats.php', params);
    }
};

// Global olarak erişilebilir yap (API_MODULE'ü API olarak export et)
window.API = API_MODULE;

// Export (ES6 module desteği varsa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_MODULE;
}
}
