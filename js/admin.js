// ============================================
// ADMIN.JS - API ENTEGRASYONLU SÜRÜM
// LocalStorage → Backend API Migration
// Oğulcan Durkan - 2025
// ============================================

// ============================================
// AUTH & SESSION YÖNETİMİ
// ============================================

// Session kontrolü (Token tabanlı)
async function checkAdminSession() {
    const token = API.getToken();
    
    if (!token) {
        // Token yoksa login sayfasına yönlendir
        if (!window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        }
        return null;
    }
    
    // Token varsa verify et
    const user = await verifyToken();
    return user;
}

// Token doğrula
async function verifyToken() {
    try {
        const response = await API.get('/auth/verify.php', API.getToken());
        
        if (!response.success) {
            // Token geçersiz
            API.removeToken();
            if (!window.location.pathname.includes('admin-login.html')) {
                window.location.href = 'admin-login.html';
            }
            return null;
        }
        
        return response.user;
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        API.removeToken();
        if (!window.location.pathname.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        }
        return null;
    }
}

// Login işlemi
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showToast('Kullanıcı adı ve şifre gerekli!', 'error');
        return;
    }
    
    showLoading('Giriş yapılıyor...');
    
    try {
        const response = await API.post('/auth/login.php', {
            username: username,
            password: password,
            rememberMe: rememberMe
        });
        
        if (response.success) {
            API.setToken(response.token, rememberMe);
            showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showError(response.message || 'Giriş başarısız');
        }
    } catch (error) {
        showError('Sunucuya bağlanılamadı: ' + error.message);
    }
}

// Çıkış yap
function adminLogout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        API.removeToken();
        showSuccess('Çıkış yapıldı');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }
}

// ============================================
// UI HELPER FONKSİYONLARI
// ============================================

function showLoading(message = 'Yükleniyor...') {
    let loader = document.getElementById('globalLoader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999;">
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #0f2862; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                    <p style="margin: 0; font-size: 16px; color: #333;">${message}</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'block';
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Toast element bulunamadı');
        alert(message);
        return;
    }
    
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    if (toastIcon) toastIcon.textContent = icons[type] || icons.info;
    if (toastMessage) toastMessage.textContent = message;
    
    toast.className = 'toast';
    toast.classList.add(`toast-${type}`, 'show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function showError(message) {
    hideLoading();
    showToast(message, 'error');
}

function showSuccess(message) {
    hideLoading();
    showToast(message, 'success');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// KULLANICI YÖNETİMİ (API)
// ============================================

// Kullanıcıları getir
async function getUsers() {
    try {
        console.log('Kullanıcılar isteniyor...');
        const response = await API.get('/users/index.php', API.getToken());
        console.log('API Yanıtı:', response);
        
        if (response.success) {
            console.log('Kullanıcı sayısı:', response.users ? response.users.length : 0);
            return response.users || [];
        }
        console.warn('API başarısız:', response);
        return [];
    } catch (error) {
        console.error('Kullanıcılar yüklenemedi:', error);
        showError('Kullanıcılar yüklenirken hata: ' + error.message);
        return [];
    }
}

// Kullanıcı listesini göster
async function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        console.error('usersTableBody elementi bulunamadı!');
        return;
    }
    
    showLoading('Kullanıcılar yükleniyor...');
    
    const users = await getUsers();
    
    console.log('Yüklenen kullanıcılar:', users);
    
    hideLoading();
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <h3>Henüz kullanıcı yok</h3>
                    <p>Yeni kullanıcı eklemek için yukarıdaki butonu kullanın.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const isInactive = user.is_active == 0 || user.is_active === false;
        return `
        <tr ${isInactive ? 'style="opacity: 0.5; background-color: #f8f9fa;"' : ''}>
            <td>
                <div class="user-avatar" style="display: inline-flex; width: 35px; height: 35px; font-size: 1em; margin-right: 10px; ${isInactive ? 'opacity: 0.6;' : ''}">
                    ${user.full_name.charAt(0).toUpperCase()}
                </div>
                <strong>${user.full_name}</strong>
                ${isInactive ? '<span style="color: #dc3545; font-size: 0.85em; margin-left: 5px;">🚫 Devre Dışı</span>' : ''}
            </td>
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'operator' ? 'badge-info' : 'badge-warning'}">
                    ${user.role === 'admin' ? '👑 Admin' : user.role === 'operator' ? '⚙️ Operatör' : '👁️ Görüntüleyici'}
                </span>
            </td>
            <td style="font-size: 0.85em; color: #666;">
                ${user.last_login ? new Date(user.last_login).toLocaleString('tr-TR') : 'Hiç giriş yapmadı'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editUser(${user.id})" ${isInactive ? 'disabled title="Önce aktif edin"' : ''}>✏️ Düzenle</button>
                    ${isInactive 
                        ? '<button class="action-btn btn-success" onclick="reactivateUser(' + user.id + ')">✅ Aktif Et</button>'
                        : '<button class="action-btn btn-delete" onclick="deleteUser(' + user.id + ')">🗑️ Devre Dışı</button>'
                    }
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

// Yeni kullanıcı ekle modal aç
function openAddUserModal() {
    const form = document.getElementById('userForm');
    if (form) form.reset();
    
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = '➕ Yeni Kullanıcı Ekle';
    document.getElementById('userPassword').required = true;
    document.getElementById('userPassword').placeholder = 'Şifre';
    
    openModal('userModal');
}

// Kullanıcı düzenle
async function editUser(userId) {
    showLoading('Kullanıcı bilgileri yükleniyor...');
    
    const users = await getUsers();
    const user = users.find(u => u.id === userId);
    
    hideLoading();
    
    if (!user) {
        showError('Kullanıcı bulunamadı!');
        return;
    }
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userFullName').value = user.full_name;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').placeholder = 'Değiştirmek için yeni şifre girin';
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userModalTitle').textContent = '✏️ Kullanıcı Düzenle';
    openModal('userModal');
}

// Kullanıcı sil
async function deleteUser(userId) {
    if (!confirm('Bu kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?\n\nKullanıcı silinmez, sadece devre dışı kalır.')) {
        return;
    }
    
    showLoading('Kullanıcı devre dışı bırakılıyor...');
    
    try {
        const response = await API.delete(`/users/index.php?id=${userId}`, API.getToken());
        
        if (response.success) {
            showSuccess('Kullanıcı başarıyla devre dışı bırakıldı!');
            displayUsers();
            loadDashboard();
        } else {
            hideLoading();
            showError(response.message || 'İşlem başarısız');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// Kullanıcıyı tekrar aktif et
async function reactivateUser(userId) {
    if (!confirm('Bu kullanıcıyı tekrar aktif etmek istediğinizden emin misiniz?')) {
        return;
    }
    
    showLoading('Kullanıcı aktif ediliyor...');
    
    try {
        const response = await API.put(`/users/index.php?id=${userId}`, {
            is_active: 1
        }, API.getToken());
        
        if (response.success) {
            showSuccess('Kullanıcı başarıyla aktif edildi!');
            displayUsers();
            loadDashboard();
        } else {
            hideLoading();
            showError(response.message || 'İşlem başarısız');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// Kullanıcı kaydet (ekle/güncelle)
async function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const fullName = document.getElementById('userFullName').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;
    
    if (!fullName || !username || !role) {
        showError('Lütfen tüm zorunlu alanları doldurun!');
        return;
    }
    
    showLoading(userId ? 'Kullanıcı güncelleniyor...' : 'Kullanıcı ekleniyor...');
    
    const data = {
        full_name: fullName,
        username: username,
        email: email,
        role: role
    };
    
    if (password) {
        data.password = password;
    }
    
    try {
        let response;
        
        if (userId) {
            // Güncelle
            response = await API.put(`/users/index.php?id=${userId}`, data, API.getToken());
        } else {
            // Yeni ekle
            if (!password) {
                hideLoading();
                showError('Yeni kullanıcı için şifre gerekli!');
                return;
            }
            response = await API.post('/users/index.php', data, API.getToken());
        }
        
        hideLoading();
        
        if (response.success) {
            showSuccess(userId ? 'Kullanıcı güncellendi!' : 'Kullanıcı eklendi!');
            closeModal('userModal');
            displayUsers();
            loadDashboard();
        } else {
            showError(response.message || 'İşlem başarısız');
        }
    } catch (error) {
        hideLoading();
        showError(error.message || 'İşlem sırasında bir hata oluştu');
    }
}

// ============================================
// BİNA YÖNETİMİ (API)
// ============================================

// Binaları getir
async function getBuildings() {
    try {
        const response = await API.get('/buildings/index.php');
        
        if (response.success) {
            return response.buildings || [];
        }
        return [];
    } catch (error) {
        console.error('Binalar yüklenemedi:', error);
        return [];
    }
}

// Bina listesini göster
async function displayBuildings() {
    const tbody = document.getElementById('buildingsTableBody');
    if (!tbody) return;
    
    showLoading('Binalar yükleniyor...');
    
    const buildings = await getBuildings();
    
    hideLoading();
    
    if (buildings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <h3>Henüz bina yok</h3>
                    <p>Yeni bina eklemek için yukarıdaki butonu kullanın.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = buildings.map(building => `
        <tr>
            <td><div style="font-size: 2em;">${building.icon}</div></td>
            <td><strong>${building.name}</strong></td>
            <td>${building.description || '-'}</td>
            <td><span class="badge ${building.is_active ? 'badge-success' : 'badge-secondary'}">${building.is_active ? '✅ Aktif' : '❌ Pasif'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editBuilding('${building.id}')">✏️ Düzenle</button>
                    <button class="action-btn btn-delete" onclick="deleteBuilding('${building.id}')">🗑️ Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Yeni bina modal aç
function openAddBuildingModal() {
    const form = document.getElementById('buildingForm');
    if (form) form.reset();
    
    document.getElementById('buildingIdHidden').value = '';
    document.getElementById('buildingId').value = '';
    document.getElementById('buildingId').readOnly = false;
    document.getElementById('buildingModalTitle').textContent = '➕ Yeni Bina Ekle';
    
    openModal('buildingModal');
}

// Bina düzenle
async function editBuilding(buildingId) {
    showLoading('Bina bilgileri yükleniyor...');
    
    try {
        const response = await API.get(`/buildings/detail.php?id=${buildingId}`);
        
        hideLoading();
        
        if (response.success && response.building) {
            const building = response.building;
            
            document.getElementById('buildingIdHidden').value = building.id;
            document.getElementById('buildingId').value = building.id;
            document.getElementById('buildingId').readOnly = true;
            document.getElementById('buildingName').value = building.name;
            document.getElementById('buildingIcon').value = building.icon;
            document.getElementById('buildingDescription').value = building.description || '';
            document.getElementById('buildingActive').checked = building.is_active;
            
            // Mevcut resmi göster
            const previewDiv = document.getElementById('buildingImagePreview');
            const previewImg = document.getElementById('buildingImagePreviewImg');
            
            if (building.image_path) {
                previewImg.src = '/' + building.image_path;
                previewDiv.style.display = 'block';
            } else {
                previewDiv.style.display = 'none';
            }
            
            // Dosya input'ı temizle
            document.getElementById('buildingImage').value = '';
            
            document.getElementById('buildingModalTitle').textContent = '✏️ Bina Düzenle';
            openModal('buildingModal');
        } else {
            showError('Bina bulunamadı!');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// Bina sil
async function deleteBuilding(buildingId) {
    if (!confirm('Bu binayı silmek istediğinizden emin misiniz? İlişkili tüm kayıtlar silinecek!')) {
        return;
    }
    
    showLoading('Bina siliniyor...');
    
    try {
        const response = await API.delete(`/buildings/index.php?id=${buildingId}`, API.getToken());
        
        if (response.success) {
            showSuccess('Bina başarıyla silindi!');
            displayBuildings();
            // Dashboard'u otomatik güncelle
            loadDashboard();
        } else {
            showError(response.message || 'Bina silinemedi');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// Bina resmini sil
async function removeBuildingImage() {
    const buildingId = document.getElementById('buildingIdHidden').value;
    
    if (!buildingId) {
        showError('Bina ID bulunamadı!');
        return;
    }
    
    if (!confirm('Bina resmini silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    showLoading('Resim siliniyor...');
    
    try {
        const response = await fetch(`${API.baseURL}/buildings/upload.php?buildingId=${buildingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${API.getToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        hideLoading();
        
        if (result.success) {
            showSuccess('Resim silindi!');
            document.getElementById('buildingImagePreview').style.display = 'none';
            document.getElementById('buildingImage').value = '';
        } else {
            showError(result.message || 'Resim silinemedi');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// Bina kaydet
async function saveBuilding(event) {
    event.preventDefault();
    
    const buildingIdHidden = document.getElementById('buildingIdHidden').value.trim();
    const buildingId = document.getElementById('buildingId').value.trim();
    const buildingName = document.getElementById('buildingName').value.trim();
    const buildingIcon = document.getElementById('buildingIcon').value.trim();
    const buildingDescription = document.getElementById('buildingDescription').value.trim();
    const buildingActive = document.getElementById('buildingActive').checked;
    const buildingImageFile = document.getElementById('buildingImage').files[0];
    
    if (!buildingId || !buildingName) {
        showError('ID ve isim zorunludur!');
        return;
    }
    
    const isEdit = buildingIdHidden !== '';
    
    showLoading(isEdit ? 'Bina güncelleniyor...' : 'Bina ekleniyor...');
    
    const data = {
        id: buildingId,
        name: buildingName,
        icon: buildingIcon || '🏢',
        description: buildingDescription,
        is_active: buildingActive
    };
    
    try {
        let response;
        
        if (isEdit) {
            response = await API.put(`/buildings/index.php?id=${buildingIdHidden}`, data, API.getToken());
        } else {
            response = await API.post('/buildings/index.php', data, API.getToken());
        }
        
        if (response.success) {
            // Resim yükleme varsa
            if (buildingImageFile) {
                const formData = new FormData();
                formData.append('buildingId', isEdit ? buildingIdHidden : buildingId);
                formData.append('image', buildingImageFile);
                
                try {
                    const uploadResponse = await fetch(`${API.baseURL}/buildings/upload.php`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${API.getToken()}`
                        },
                        body: formData
                    });
                    
                    const uploadResult = await uploadResponse.json();
                    
                    if (!uploadResult.success) {
                        showError('Bina kaydedildi ama resim yüklenemedi: ' + uploadResult.message);
                    }
                } catch (uploadError) {
                    console.error('Resim yükleme hatası:', uploadError);
                    showError('Bina kaydedildi ama resim yüklenemedi');
                }
            }
            
            showSuccess(isEdit ? 'Bina güncellendi!' : 'Bina eklendi!');
            closeModal('buildingModal');
            displayBuildings();
            // Dashboard'u otomatik güncelle
            loadDashboard();
        } else {
            hideLoading();
            showError(response.message || 'İşlem başarısız');
        }
    } catch (error) {
        hideLoading();
        showError('Sunucu hatası: ' + error.message);
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    showLoading('Dashboard yükleniyor...');
    
    try {
        // Get all data in parallel
        const [statsResponse, buildingsResponse, usersResponse] = await Promise.all([
            API.get('/controls/stats.php', API.getToken()),
            API.get('/buildings/index.php'),
            API.get('/users/index.php', API.getToken())
        ]);
        
        hideLoading();
        
        // Update user count
        if (usersResponse.success) {
            const activeUsers = usersResponse.users.filter(u => u.is_active).length;
            document.getElementById('userCount').textContent = activeUsers;
        }
        
        // Update building count
        if (buildingsResponse.success) {
            const activeBuildings = buildingsResponse.buildings.filter(b => b.is_active).length;
            document.getElementById('buildingCount').textContent = activeBuildings;
        }
        
        // Update control stats
        if (statsResponse.success) {
            document.getElementById('controlCount').textContent = statsResponse.totalControls || 0;
            document.getElementById('todayControlCount').textContent = statsResponse.todayControls ? statsResponse.todayControls.length : 0;
        }
    } catch (error) {
        hideLoading();
        console.error('Dashboard yüklenemedi:', error);
        showError('Dashboard yüklenemedi: ' + error.message);
    }
}

// ============================================
// İSTATİSTİKLER YÖNETİMİ
// ============================================

async function loadStatistics() {
    showLoading('İstatistikler yükleniyor...');
    
    try {
        // Get stats from API
        const statsResponse = await API.get('/controls/stats.php', API.getToken());
        const buildingsResponse = await API.get('/buildings/index.php');
        const usersResponse = await API.get('/users/index.php', API.getToken());
        
        hideLoading();
        
        if (statsResponse.success) {
            // Update stat cards
            document.getElementById('stats_total_controls').textContent = statsResponse.totalControls || 0;
            document.getElementById('stats_monthly_controls').textContent = statsResponse.monthlyControls || 0;
            document.getElementById('stats_avg_completion').textContent = 
                (statsResponse.avgCompletionRate || 0).toFixed(1) + '%';
        }
        
        if (buildingsResponse.success) {
            const activeBuildings = buildingsResponse.buildings.filter(b => b.is_active).length;
            document.getElementById('stats_active_buildings').textContent = activeBuildings;
        }
        
        if (usersResponse.success) {
            const activeUsers = usersResponse.users.filter(u => u.is_active).length;
            document.getElementById('stats_active_users').textContent = activeUsers;
        }
        
        // Load building stats table
        await loadBuildingStats();
        
    } catch (error) {
        hideLoading();
        showError('İstatistikler yüklenemedi: ' + error.message);
    }
}

async function loadBuildingStats() {
    const tbody = document.getElementById('buildingStatsTable');
    if (!tbody) return;
    
    try {
        const buildings = await getBuildings();
        const controlsResponse = await API.get('/controls/index.php');
        
        if (buildings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        <div class="empty-state-icon">🏢</div>
                        <h3>Henüz bina yok</h3>
                    </td>
                </tr>
            `;
            return;
        }
        
        const controls = controlsResponse.success ? controlsResponse.controls : [];
        
        tbody.innerHTML = buildings.map(building => {
            const buildingControls = controls.filter(c => c.building_id === building.id);
            const totalControls = buildingControls.length;
            const lastControl = buildingControls.length > 0 ? 
                new Date(buildingControls[0].control_date).toLocaleDateString('tr-TR') : 
                'Kontrol yok';
            const avgCompletion = buildingControls.length > 0 ?
                (buildingControls.reduce((sum, c) => sum + parseFloat(c.completion_rate || 0), 0) / buildingControls.length).toFixed(1) + '%' :
                '0%';
            
            return `
                <tr>
                    <td>
                        <span style="font-size: 1.5em; margin-right: 10px;">${building.icon}</span>
                        <strong>${building.name}</strong>
                    </td>
                    <td>${totalControls}</td>
                    <td>${lastControl}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${avgCompletion}; height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a);"></div>
                            </div>
                            <span style="font-weight: bold; min-width: 50px;">${avgCompletion}</span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3>İstatistikler yüklenemedi</h3>
                    <p>${error.message}</p>
                </td>
            </tr>
        `;
    }
}

// ============================================
// CHECKLIST ITEMS YÖNETİMİ
// ============================================

async function loadChecklistItems(buildingId = null) {
    showLoading('Kontrol maddeleri yükleniyor...');
    
    try {
        const endpoint = buildingId ? `/checklist/index.php?building_id=${buildingId}` : '/checklist/index.php';
        const response = await API.get(endpoint, API.getToken());
        
        hideLoading();
        
        if (response.success) {
            displayChecklistItems(response.items);
            
            // Populate building filter dropdown
            const buildings = await getBuildings();
            const filterSelect = document.getElementById('checklistBuildingFilter');
            if (filterSelect && filterSelect.options.length === 1) {
                buildings.forEach(building => {
                    const option = document.createElement('option');
                    option.value = building.id;
                    option.textContent = `${building.icon} ${building.name}`;
                    filterSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        hideLoading();
        showError('Kontrol maddeleri yüklenemedi: ' + error.message);
    }
}

function displayChecklistItems(items) {
    const tbody = document.getElementById('checklistTableBody');
    if (!tbody) return;
    
    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <h3>Henüz kontrol maddesi yok</h3>
                    <p>Yeni madde eklemek için yukarıdaki butonu kullanın.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td style="text-align: center;">
                <input type="checkbox" class="checklist-item-checkbox" data-id="${item.id}" onchange="updateBulkDeleteButton()">
            </td>
            <td style="text-align: center; font-weight: bold; color: #666;">${item.item_order}</td>
            <td>
                <strong>${item.building_name || item.building_id}</strong>
            </td>
            <td>${item.item_text}</td>
            <td>
                <span class="badge ${item.is_active ? 'badge-success' : 'badge-danger'}">
                    ${item.is_active ? '✅ Aktif' : '❌ Pasif'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editChecklistItem(${item.id})">✏️ Düzenle</button>
                    <button class="action-btn btn-delete" onclick="deleteChecklistItem(${item.id})">🗑️ Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Toplu silme butonunu güncelle
    updateBulkDeleteButton();
}

function filterChecklistItems() {
    const filterSelect = document.getElementById('checklistBuildingFilter');
    const buildingId = filterSelect.value;
    loadChecklistItems(buildingId || null);
}

function openAddChecklistItemModal() {
    const form = document.getElementById('checklistItemForm');
    if (form) form.reset();
    
    document.getElementById('checklistItemId').value = '';
    document.getElementById('checklistItemModalTitle').textContent = '➕ Yeni Kontrol Maddesi Ekle';
    
    // Populate building dropdown
    populateChecklistBuildingDropdown();
    
    openModal('checklistItemModal');
}

async function populateChecklistBuildingDropdown() {
    const buildings = await getBuildings();
    const select = document.getElementById('checklistItemBuildingId');
    
    if (select) {
        select.innerHTML = '<option value="">Bina Seçin</option>';
        buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.id;
            option.textContent = `${building.icon} ${building.name}`;
            select.appendChild(option);
        });
    }
}

async function saveChecklistItem(event) {
    event.preventDefault();
    
    const itemId = document.getElementById('checklistItemId').value;
    const buildingId = document.getElementById('checklistItemBuildingId').value;
    const itemText = document.getElementById('checklistItemText').value.trim();
    const itemOrder = document.getElementById('checklistItemOrder').value;
    const isActive = document.getElementById('checklistItemActive').checked;
    
    if (!buildingId || !itemText) {
        showError('Bina ve madde metni zorunludur!');
        return;
    }
    
    showLoading(itemId ? 'Madde güncelleniyor...' : 'Madde ekleniyor...');
    
    const data = {
        building_id: buildingId,
        item_text: itemText,
        item_order: parseInt(itemOrder) || 0,
        is_active: isActive
    };
    
    try {
        let response;
        
        if (itemId) {
            response = await API.put(`/checklist/index.php?id=${itemId}`, data, API.getToken());
        } else {
            response = await API.post('/checklist/index.php', data, API.getToken());
        }
        
        if (response.success) {
            showSuccess(itemId ? 'Madde güncellendi!' : 'Madde eklendi!');
            closeModal('checklistItemModal');
            loadChecklistItems();
        } else {
            showError(response.message || 'İşlem başarısız');
        }
    } catch (error) {
        showError('Sunucu hatası: ' + error.message);
    }
}

async function editChecklistItem(itemId) {
    showLoading('Madde bilgileri yükleniyor...');
    
    try {
        const response = await API.get('/checklist/index.php', API.getToken());
        const item = response.items.find(i => i.id === itemId);
        
        hideLoading();
        
        if (!item) {
            showError('Madde bulunamadı!');
            return;
        }
        
        document.getElementById('checklistItemId').value = item.id;
        document.getElementById('checklistItemBuildingId').value = item.building_id;
        document.getElementById('checklistItemText').value = item.item_text;
        document.getElementById('checklistItemOrder').value = item.item_order;
        document.getElementById('checklistItemActive').checked = item.is_active;
        
        await populateChecklistBuildingDropdown();
        document.getElementById('checklistItemBuildingId').value = item.building_id;
        
        document.getElementById('checklistItemModalTitle').textContent = '✏️ Kontrol Maddesi Düzenle';
        openModal('checklistItemModal');
    } catch (error) {
        hideLoading();
        showError('Madde bilgileri yüklenemedi: ' + error.message);
    }
}

async function deleteChecklistItem(itemId) {
    if (!confirm('Bu kontrol maddesini silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    showLoading('Madde siliniyor...');
    
    try {
        const response = await API.delete(`/checklist/index.php?id=${itemId}`, API.getToken());
        
        if (response.success) {
            showSuccess('Madde başarıyla silindi!');
            loadChecklistItems();
        } else {
            showError(response.message || 'Silme işlemi başarısız');
        }
    } catch (error) {
        showError('Sunucu hatası: ' + error.message);
    }
}

// Toplu seçme/kaldırma
function toggleAllChecklistItems() {
    const masterCheckbox = document.getElementById('checklistMasterCheckbox');
    const checkboxes = document.querySelectorAll('.checklist-item-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = masterCheckbox.checked;
    });
    
    updateBulkDeleteButton();
}

// Toplu silme butonunu güncelle
function updateBulkDeleteButton() {
    const checkedBoxes = document.querySelectorAll('.checklist-item-checkbox:checked');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const masterCheckbox = document.getElementById('checklistMasterCheckbox');
    
    if (bulkDeleteBtn) {
        if (checkedBoxes.length > 0) {
            bulkDeleteBtn.style.display = 'inline-block';
            bulkDeleteBtn.textContent = `🗑️ Seçilileri Sil (${checkedBoxes.length})`;
        } else {
            bulkDeleteBtn.style.display = 'none';
        }
    }
    
    // Master checkbox'ı güncelle
    if (masterCheckbox) {
        const allCheckboxes = document.querySelectorAll('.checklist-item-checkbox');
        masterCheckbox.checked = allCheckboxes.length > 0 && checkedBoxes.length === allCheckboxes.length;
    }
}

// Toplu silme
async function bulkDeleteChecklistItems() {
    const checkedBoxes = document.querySelectorAll('.checklist-item-checkbox:checked');
    const itemIds = Array.from(checkedBoxes).map(cb => cb.dataset.id);
    
    if (itemIds.length === 0) {
        showError('Lütfen silinecek maddeleri seçin!');
        return;
    }
    
    if (!confirm(`${itemIds.length} adet kontrol maddesini silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    showLoading(`${itemIds.length} madde siliniyor...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const itemId of itemIds) {
        try {
            const response = await API.delete(`/checklist/index.php?id=${itemId}`, API.getToken());
            if (response.success) {
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            errorCount++;
        }
    }
    
    hideLoading();
    
    if (errorCount === 0) {
        showSuccess(`${successCount} madde başarıyla silindi!`);
    } else {
        showError(`${successCount} madde silindi, ${errorCount} madde silinemedi.`);
    }
    
    loadChecklistItems();
}

// ============================================
// SAYFA YÜKLENİNCE
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPage);
} else {
    initAdminPage();
}

async function initAdminPage() {
    const path = window.location.pathname;
    
    if (path.includes('admin-login.html')) {
        // Login sayfası - form submit
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (path.includes('admin.html')) {
        // Admin panel - session kontrol
        const user = await checkAdminSession();
        
        if (!user) {
            // Session yoksa veya geçersizse, fonksiyondan çık
            return;
        }
        
        // Dashboard yükle
        loadDashboard();
        
        // Tabloları yükle
        displayUsers();
        displayBuildings();
        
        // Form submit handlers
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', saveUser);
        }
        
        const buildingForm = document.getElementById('buildingForm');
        if (buildingForm) {
            buildingForm.addEventListener('submit', saveBuilding);
        }
        
        // Bina resim önizleme
        const imageInput = document.getElementById('buildingImage');
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Dosya tipi kontrolü
                    if (!file.type.startsWith('image/')) {
                        showError('Lütfen sadece resim dosyası seçin!');
                        e.target.value = '';
                        return;
                    }
                    
                    // Dosya boyutu kontrolü (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showError('Dosya boyutu 5MB\'dan büyük olamaz!');
                        e.target.value = '';
                        return;
                    }
                    
                    // Önizleme göster
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const previewDiv = document.getElementById('buildingImagePreview');
                        const previewImg = document.getElementById('buildingImagePreviewImg');
                        previewImg.src = event.target.result;
                        previewDiv.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
}
