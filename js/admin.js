// Admin Panel JavaScript Functions
// Oğulcan Durkan - 2025

// Session kontrolü
function checkAdminSession() {
    const session = localStorage.getItem('admin_session') || sessionStorage.getItem('admin_session');
    if (!session) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return JSON.parse(session);
}

// Çıkış yap
function adminLogout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('admin_session');
        sessionStorage.removeItem('admin_session');
        window.location.href = 'admin-login.html';
    }
}

// Toast bildirim göster
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Icon seç
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toastIcon.textContent = icons[type] || icons.info;
    toastMessage.textContent = message;
    
    // Class'ları temizle
    toast.className = 'toast';
    toast.classList.add(`toast-${type}`, 'show');
    
    // 4 saniye sonra gizle
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Modal aç
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Modal kapat
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Modal dışına tıklanınca kapat
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// ==================== KULLANICI YÖNETİMİ ====================

// Kullanıcıları getir
function getUsers() {
    return JSON.parse(localStorage.getItem('admin_users') || '[]');
}

// Kullanıcıları kaydet
function saveUsers(users) {
    localStorage.setItem('admin_users', JSON.stringify(users));
}

// Kullanıcı listesini göster
function displayUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;
    
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
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-avatar" style="display: inline-flex; width: 35px; height: 35px; font-size: 1em; margin-right: 10px;">
                    ${user.fullName.charAt(0).toUpperCase()}
                </div>
                <strong>${user.fullName}</strong>
            </td>
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>
                <span class="badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'operator' ? 'badge-info' : 'badge-warning'}">
                    ${user.role === 'admin' ? '👑 Admin' : user.role === 'operator' ? '⚙️ Operatör' : '👁️ Görüntüleyici'}
                </span>
            </td>
            <td style="font-size: 0.85em; color: #666;">
                ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : 'Hiç giriş yapmadı'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editUser('${user.id}')">✏️ Düzenle</button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${user.id}')">🗑️ Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Yeni kullanıcı ekle modal aç
function openAddUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = '➕ Yeni Kullanıcı Ekle';
    openModal('userModal');
}

// Kullanıcı düzenle
function editUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showToast('Kullanıcı bulunamadı!', 'error');
        return;
    }
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userFullName').value = user.fullName;
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
function deleteUser(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    if (user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) {
        showToast('Son admin kullanıcısını silemezsiniz!', 'error');
        return;
    }
    
    if (confirm(`${user.fullName} kullanıcısını silmek istediğinizden emin misiniz?`)) {
        const newUsers = users.filter(u => u.id !== userId);
        saveUsers(newUsers);
        displayUsers();
        showToast('Kullanıcı başarıyla silindi!', 'success');
    }
}

// Kullanıcı formu kaydet
function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const fullName = document.getElementById('userFullName').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = document.getElementById('userPassword').value;
    
    const users = getUsers();
    
    // Kullanıcı adı kontrolü
    const existingUser = users.find(u => u.username === username && u.id !== userId);
    if (existingUser) {
        showToast('Bu kullanıcı adı zaten kullanılıyor!', 'error');
        return;
    }
    
    if (userId) {
        // Güncelle
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].fullName = fullName;
            users[index].username = username;
            users[index].email = email;
            users[index].role = role;
            if (password) {
                users[index].password = btoa(password);
            }
            users[index].updatedAt = new Date().toISOString();
        }
        showToast('Kullanıcı başarıyla güncellendi!', 'success');
    } else {
        // Yeni ekle
        const newUser = {
            id: 'user-' + Date.now(),
            fullName,
            username,
            email,
            role,
            password: btoa(password),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        users.push(newUser);
        showToast('Kullanıcı başarıyla eklendi!', 'success');
    }
    
    saveUsers(users);
    displayUsers();
    closeModal('userModal');
}

// ==================== BİNA YÖNETİMİ ====================

// Binaları getir
function getBuildings() {
    const buildings = localStorage.getItem('admin_buildings');
    if (!buildings) {
        // Varsayılan binalar
        const defaultBuildings = [
            { id: 'giris', name: 'Giriş Binası', icon: '🏢', description: 'Ana giriş binası kontrol listesi', active: true },
            { id: 'kum_yag', name: 'Kum ve Yağ Tutucu', icon: '🪨', description: 'Kum ve yağ tutucu kontrol listesi', active: true },
            { id: 'idari', name: 'İdari Bina', icon: '🏗️', description: 'İdari bina kontrol listesi', active: true },
            { id: 'blower', name: 'Blower Odası', icon: '🌬️', description: 'Blower odası kontrol listesi', active: true },
            { id: 'test1', name: 'Test Oda 1', icon: '🧪', description: 'Test odası 1 kontrol listesi', active: true },
            { id: 'test2', name: 'Test Oda 2', icon: '🧪', description: 'Test odası 2 kontrol listesi', active: true },
            { id: 'test3', name: 'Test Oda 3', icon: '🧪', description: 'Test odası 3 kontrol listesi', active: true },
            { id: 'test4', name: 'Test Oda 4', icon: '🧪', description: 'Test odası 4 kontrol listesi', active: true }
        ];
        localStorage.setItem('admin_buildings', JSON.stringify(defaultBuildings));
        return defaultBuildings;
    }
    return JSON.parse(buildings);
}

// Binaları kaydet
function saveBuildings(buildings) {
    localStorage.setItem('admin_buildings', JSON.stringify(buildings));
    // Kontrol sayfasını güncelle
    updateBuildingDataInControlPage();
}

// Bina listesini göster
function displayBuildings() {
    const buildings = getBuildings();
    const tbody = document.getElementById('buildingsTableBody');
    
    if (!tbody) return;
    
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
            <td style="font-size: 2em;">${building.icon}</td>
            <td><strong>${building.name}</strong></td>
            <td style="color: #666;">${building.description}</td>
            <td>
                <span class="badge ${building.active ? 'badge-success' : 'badge-warning'}">
                    ${building.active ? '✅ Aktif' : '⏸️ Pasif'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view" onclick="manageBuildingChecklists('${building.id}')">📋 Kontrol Listesi</button>
                    <button class="action-btn btn-edit" onclick="editBuilding('${building.id}')">✏️ Düzenle</button>
                    <button class="action-btn btn-delete" onclick="deleteBuilding('${building.id}')">🗑️ Sil</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Yeni bina ekle modal aç
function openAddBuildingModal() {
    document.getElementById('buildingForm').reset();
    document.getElementById('buildingId').value = '';
    document.getElementById('buildingIdInput').disabled = false;
    document.getElementById('buildingModalTitle').textContent = '➕ Yeni Bina Ekle';
    openModal('buildingModal');
}

// Bina düzenle
function editBuilding(buildingId) {
    const buildings = getBuildings();
    const building = buildings.find(b => b.id === buildingId);
    
    if (!building) {
        showToast('Bina bulunamadı!', 'error');
        return;
    }
    
    document.getElementById('buildingId').value = building.id;
    document.getElementById('buildingIdInput').value = building.id;
    document.getElementById('buildingIdInput').disabled = true;
    document.getElementById('buildingName').value = building.name;
    document.getElementById('buildingIcon').value = building.icon;
    document.getElementById('buildingDescription').value = building.description;
    document.getElementById('buildingActive').checked = building.active;
    
    document.getElementById('buildingModalTitle').textContent = '✏️ Bina Düzenle';
    openModal('buildingModal');
}

// Bina sil
function deleteBuilding(buildingId) {
    const buildings = getBuildings();
    const building = buildings.find(b => b.id === buildingId);
    
    if (!building) return;
    
    if (confirm(`${building.name} binasını silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve tüm kontrol kayıtları silinecektir!`)) {
        // Binanın tüm verilerini sil
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(`kontrol_${buildingId}_`) || key === `index_${buildingId}`) {
                localStorage.removeItem(key);
            }
        });
        
        const newBuildings = buildings.filter(b => b.id !== buildingId);
        saveBuildings(newBuildings);
        displayBuildings();
        showToast('Bina ve tüm kayıtları başarıyla silindi!', 'success');
    }
}

// Bina formu kaydet
function saveBuilding(event) {
    event.preventDefault();
    
    const oldId = document.getElementById('buildingId').value;
    const newId = document.getElementById('buildingIdInput').value.trim().toLowerCase().replace(/\s+/g, '_');
    const name = document.getElementById('buildingName').value.trim();
    const icon = document.getElementById('buildingIcon').value.trim();
    const description = document.getElementById('buildingDescription').value.trim();
    const active = document.getElementById('buildingActive').checked;
    
    const buildings = getBuildings();
    
    // ID kontrolü
    const existingBuilding = buildings.find(b => b.id === newId && b.id !== oldId);
    if (existingBuilding) {
        showToast('Bu bina ID zaten kullanılıyor!', 'error');
        return;
    }
    
    if (oldId) {
        // Güncelle
        const index = buildings.findIndex(b => b.id === oldId);
        if (index !== -1) {
            buildings[index].name = name;
            buildings[index].icon = icon;
            buildings[index].description = description;
            buildings[index].active = active;
        }
        showToast('Bina başarıyla güncellendi!', 'success');
    } else {
        // Yeni ekle
        const newBuilding = {
            id: newId,
            name,
            icon,
            description,
            active,
            createdAt: new Date().toISOString()
        };
        buildings.push(newBuilding);
        showToast('Bina başarıyla eklendi!', 'success');
    }
    
    saveBuildings(buildings);
    displayBuildings();
    closeModal('buildingModal');
}

// ==================== KONTROL LİSTESİ YÖNETİMİ ====================

// Kontrol listelerini getir
function getBuildingChecklists(buildingId) {
    const key = `checklist_${buildingId}`;
    const checklists = localStorage.getItem(key);
    return checklists ? JSON.parse(checklists) : [];
}

// Kontrol listelerini kaydet
function saveBuildingChecklists(buildingId, checklists) {
    const key = `checklist_${buildingId}`;
    localStorage.setItem(key, JSON.stringify(checklists));
    updateBuildingDataInControlPage();
}

// Kontrol listesi yönetim sayfasını aç
function manageBuildingChecklists(buildingId) {
    const buildings = getBuildings();
    const building = buildings.find(b => b.id === buildingId);
    
    if (!building) {
        showToast('Bina bulunamadı!', 'error');
        return;
    }
    
    document.getElementById('currentBuildingId').value = buildingId;
    document.getElementById('checklistBuildingName').textContent = `${building.icon} ${building.name}`;
    
    displayBuildingChecklists(buildingId);
    openModal('checklistModal');
}

// Kontrol listelerini göster
function displayBuildingChecklists(buildingId) {
    const checklists = getBuildingChecklists(buildingId);
    const tbody = document.getElementById('checklistsTableBody');
    
    if (!tbody) return;
    
    if (checklists.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state" style="padding: 40px;">
                    <div class="empty-state-icon" style="font-size: 3em;">📋</div>
                    <h3>Henüz kontrol maddesi yok</h3>
                    <p>Yeni kontrol maddesi eklemek için yukarıdaki butonu kullanın.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = checklists.map((item, index) => `
        <tr>
            <td style="width: 50px; text-align: center; color: #999;">${index + 1}</td>
            <td>${item}</td>
            <td style="width: 150px;">
                <div class="action-buttons">
                    <button class="action-btn btn-edit" onclick="editChecklistItem(${index})">✏️</button>
                    <button class="action-btn btn-delete" onclick="deleteChecklistItem(${index})">🗑️</button>
                    ${index > 0 ? `<button class="action-btn btn-view" onclick="moveChecklistItem(${index}, -1)">⬆️</button>` : ''}
                    ${index < ${checklists.length - 1} ? `<button class="action-btn btn-view" onclick="moveChecklistItem(${index}, 1)">⬇️</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Yeni kontrol maddesi ekle
function addChecklistItem() {
    const buildingId = document.getElementById('currentBuildingId').value;
    const itemText = prompt('Yeni kontrol maddesini girin:');
    
    if (itemText && itemText.trim()) {
        const checklists = getBuildingChecklists(buildingId);
        checklists.push(itemText.trim());
        saveBuildingChecklists(buildingId, checklists);
        displayBuildingChecklists(buildingId);
        showToast('Kontrol maddesi eklendi!', 'success');
    }
}

// Kontrol maddesini düzenle
function editChecklistItem(index) {
    const buildingId = document.getElementById('currentBuildingId').value;
    const checklists = getBuildingChecklists(buildingId);
    
    const newText = prompt('Kontrol maddesini düzenleyin:', checklists[index]);
    
    if (newText && newText.trim()) {
        checklists[index] = newText.trim();
        saveBuildingChecklists(buildingId, checklists);
        displayBuildingChecklists(buildingId);
        showToast('Kontrol maddesi güncellendi!', 'success');
    }
}

// Kontrol maddesini sil
function deleteChecklistItem(index) {
    const buildingId = document.getElementById('currentBuildingId').value;
    const checklists = getBuildingChecklists(buildingId);
    
    if (confirm('Bu kontrol maddesini silmek istediğinizden emin misiniz?')) {
        checklists.splice(index, 1);
        saveBuildingChecklists(buildingId, checklists);
        displayBuildingChecklists(buildingId);
        showToast('Kontrol maddesi silindi!', 'success');
    }
}

// Kontrol maddesini taşı
function moveChecklistItem(index, direction) {
    const buildingId = document.getElementById('currentBuildingId').value;
    const checklists = getBuildingChecklists(buildingId);
    
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < checklists.length) {
        [checklists[index], checklists[newIndex]] = [checklists[newIndex], checklists[index]];
        saveBuildingChecklists(buildingId, checklists);
        displayBuildingChecklists(buildingId);
    }
}

// Kontrol sayfasındaki buildingData'yı güncelle
function updateBuildingDataInControlPage() {
    // Bu fonksiyon kontrol.html sayfasını günceller
    // Gerçek zamanlı senkronizasyon için
    console.log('Building data updated in localStorage');
}

// ==================== Dashboard İstatistikleri ====================

function updateDashboardStats() {
    // Kullanıcı sayısı
    const users = getUsers();
    const userCount = document.getElementById('userCount');
    if (userCount) userCount.textContent = users.length;
    
    // Bina sayısı
    const buildings = getBuildings();
    const buildingCount = document.getElementById('buildingCount');
    if (buildingCount) buildingCount.textContent = buildings.filter(b => b.active).length;
    
    // Toplam kontrol sayısı
    let totalControls = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('kontrol_') && !key.includes('index')) {
            totalControls++;
        }
    });
    const controlCount = document.getElementById('controlCount');
    if (controlCount) controlCount.textContent = totalControls;
    
    // Bugünkü kontroller
    const today = new Date().toISOString().split('T')[0];
    let todayControls = 0;
    keys.forEach(key => {
        if (key.includes(today)) {
            todayControls++;
        }
    });
    const todayControlCount = document.getElementById('todayControlCount');
    if (todayControlCount) todayControlCount.textContent = todayControls;
}

// ==================== EXPORT / IMPORT SİSTEMİ ====================

// Tüm verileri dışa aktar
function exportData() {
    try {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            facilityName: 'Bulancak Atıksu Arıtma Tesisi',
            data: {}
        };
        
        // LocalStorage'daki tüm verileri topla
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            
            try {
                // JSON parse edilebilir mi kontrol et
                exportData.data[key] = JSON.parse(value);
            } catch (e) {
                // Plain text olarak kaydet
                exportData.data[key] = value;
            }
        }
        
        // JSON dosyası oluştur
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // İndirme linki oluştur
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Dosya adı: bulancak_yedek_2025-12-31_14-30.json
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        link.download = `bulancak_yedek_${dateStr}_${timeStr}.json`;
        
        // İndir
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`✅ Veriler başarıyla dışa aktarıldı! (${Object.keys(exportData.data).length} kayıt)`, 'success');
        
    } catch (error) {
        console.error('Export hatası:', error);
        showToast('❌ Veri dışa aktarma sırasında hata oluştu!', 'error');
    }
}

// Verileri içe aktar
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showToast('❌ Lütfen geçerli bir JSON dosyası seçin!', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Veri yapısını kontrol et
            if (!importedData.data || typeof importedData.data !== 'object') {
                throw new Error('Geçersiz veri formatı');
            }
            
            // Onay iste
            const recordCount = Object.keys(importedData.data).length;
            const confirmed = confirm(
                `${recordCount} kayıt içeren yedek dosyası bulundu.\n\n` +
                `Yedek Tarihi: ${new Date(importedData.exportDate).toLocaleString('tr-TR')}\n` +
                `Tesis: ${importedData.facilityName}\n\n` +
                `⚠️ Mevcut veriler üzerine yazılacak!\n\n` +
                `Devam etmek istiyor musunuz?`
            );
            
            if (!confirmed) {
                showToast('ℹ️ İçe aktarma iptal edildi', 'info');
                return;
            }
            
            // Verileri geri yükle
            let successCount = 0;
            let errorCount = 0;
            
            Object.keys(importedData.data).forEach(key => {
                try {
                    const value = importedData.data[key];
                    const valueStr = typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : value;
                    localStorage.setItem(key, valueStr);
                    successCount++;
                } catch (error) {
                    console.error(`${key} anahtarı yüklenemedi:`, error);
                    errorCount++;
                }
            });
            
            showToast(
                `✅ İçe aktarma tamamlandı!\n` +
                `Başarılı: ${successCount} kayıt\n` +
                `${errorCount > 0 ? `Hata: ${errorCount} kayıt` : ''}`, 
                'success'
            );
            
            // Sayfayı yenile
            setTimeout(() => {
                location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Import hatası:', error);
            showToast('❌ Dosya okunamadı veya geçersiz format!', 'error');
        }
    };
    
    reader.onerror = function() {
        showToast('❌ Dosya okuma hatası!', 'error');
    };
    
    reader.readAsText(file);
    
    // Input'u temizle (aynı dosya tekrar seçilebilsin)
    event.target.value = '';
}

// Tüm verileri temizle
function clearAllData() {
    const confirmed = confirm(
        '⚠️ DİKKAT! TÜM VERİLER SİLİNECEK!\n\n' +
        'Bu işlem geri alınamaz!\n' +
        '• Tüm kullanıcılar\n' +
        '• Tüm binalar\n' +
        '• Tüm kontrol kayıtları\n' +
        '• Tüm ayarlar\n\n' +
        'Devam etmek istediğinizden EMİN MİSİNİZ?'
    );
    
    if (!confirmed) return;
    
    // İkinci onay
    const doubleCheck = confirm('Son kez soruyoruz: TÜM VERİLER SİLİNSİN Mİ?');
    
    if (!doubleCheck) {
        showToast('ℹ️ İşlem iptal edildi', 'info');
        return;
    }
    
    try {
        // LocalStorage'ı temizle
        localStorage.clear();
        sessionStorage.clear();
        
        showToast('✅ Tüm veriler silindi!', 'success');
        
        // Login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1500);
        
    } catch (error) {
        console.error('Temizleme hatası:', error);
        showToast('❌ Veri temizleme sırasında hata oluştu!', 'error');
    }
}
