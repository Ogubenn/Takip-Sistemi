// API Configuration
const API_CONFIG = {
    // Development (local test için)
    development: {
        BASE_URL: 'http://localhost/api',
        TIMEOUT: 5000
    },
    
    // Production (subdomain ile)
    production: {
        BASE_URL: 'https://api.bulancakatiksu.ogubenn.com.tr',
        TIMEOUT: 10000
    }
};

// Aktif environment
const ENV = 'production';

// API Helper Functions
const API = {
    BASE_URL: API_CONFIG[ENV].BASE_URL,
    TIMEOUT: API_CONFIG[ENV].TIMEOUT,
    
    // GET request
    async get(endpoint, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers,
                signal: AbortSignal.timeout(this.TIMEOUT)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    },
    
    // POST request
    async post(endpoint, data, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(this.TIMEOUT)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    },
    
    // PUT request
    async put(endpoint, data, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data),
                signal: AbortSignal.timeout(this.TIMEOUT)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    },
    
    // DELETE request
    async delete(endpoint, token = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers,
                signal: AbortSignal.timeout(this.TIMEOUT)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    },
    
    // Response handler
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Bir hata oluştu');
        }
        
        return data;
    },
    
    // Error handler
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.name === 'AbortError') {
            return { success: false, message: 'İstek zaman aşımına uğradı' };
        }
        
        if (error.message.includes('Failed to fetch')) {
            return { success: false, message: 'Sunucuya bağlanılamadı' };
        }
        
        return { success: false, message: error.message };
    },
    
    // Token yönetimi
    getToken() {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    },
    
    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('auth_token', token);
        } else {
            sessionStorage.setItem('auth_token', token);
        }
    },
    
    removeToken() {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
    }
};
