// ============================================
// SCRIPT.JS - API ENTEGRASYONLU SÜRÜM
// LocalStorage → Backend API Migration
// Oğulcan Durkan - 2025
// ============================================

// Bugünün tarihini al (YYYY-MM-DD formatında)
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Tarih formatla (Okunabilir Türkçe format)
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
}

// Bina kontrolü sayfasına yönlendirme
function goToControl(buildingId) {
    window.location.href = `kontrol.html?bina=${buildingId}`;
}

// Tarih ve saat formatı
function formatDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('tr-TR', options);
}

// ============================================
// LOADING & ERROR STATES
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

function showError(message) {
    hideLoading();
    alert('❌ Hata: ' + message);
}

function showSuccess(message) {
    hideLoading();
    const toast = document.createElement('div');
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px 25px; border-radius: 5px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.2);';
    toast.textContent = '✅ ' + message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// API ENTEGRASYON FONKSİYONLARI
// ============================================

// Kontrol verilerini kaydet (API)
async function saveControlData(buildingId, data) {
    showLoading('Kontrol kaydediliyor...');
    
    try {
        const response = await API.post('/controls/index.php', {
            buildingId: buildingId,
            controlDate: data.date || getTodayDate(),
            checkedItems: data.checkedItems || [],
            notes: data.notes || ''
        }); // No token required
        
        if (response.success) {
            showSuccess('Kontrol başarıyla kaydedildi!');
            return response;
        } else {
            showError(response.message || 'Kayıt başarısız');
            return null;
        }
    } catch (error) {
        showError('Sunucuya bağlanılamadı: ' + error.message);
        return null;
    }
}

// Bugünün kontrol verisini yükle (API)
async function loadControlData(buildingId, date = null) {
    const targetDate = date || getTodayDate();
    
    try {
        const response = await API.get(
            `/controls/index.php?buildingId=${buildingId}&startDate=${targetDate}&endDate=${targetDate}`
        ); // No token required
        
        if (response.success && response.controls && response.controls.length > 0) {
            return response.controls[0];
        }
        return null;
    } catch (error) {
        console.error('Kontrol yüklenemedi:', error);
        return null;
    }
}

// Bugün kontrol yapıldı mı? (API)
async function isTodayControlDone(buildingId) {
    const data = await loadControlData(buildingId);
    return data !== null;
}

// Bir bina için tüm kayıtları getir (API)
async function getAllControls(buildingId) {
    try {
        const response = await API.get(
            `/controls/index.php?buildingId=${buildingId}&limit=100`,
            API.getToken()
        );
        
        if (response.success) {
            return response.controls || [];
        }
        return [];
    } catch (error) {
        console.error('Kayıtlar yüklenemedi:', error);
        return [];
    }
}

// Tüm binalar için bugünün durumunu getir (API)
async function getTodayStatus() {
    try {
        const response = await API.get('/controls/stats.php?period=today', API.getToken());
        
        if (response.success && response.todayControls) {
            // Backend'den gelen veriyi frontend formatına çevir
            const status = {};
            response.todayControls.forEach(control => {
                status[control.building_id] = true;
            });
            return status;
        }
        return {};
    } catch (error) {
        console.error('Bugünün durumu yüklenemedi:', error);
        return {};
    }
}

// Tüm binaları getir (API)
async function getAllBuildings() {
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

// Bina detayını getir (checklist ile birlikte) (API)
async function getBuildingDetail(buildingId) {
    try {
        console.log('Bina detayı isteniyor:', buildingId);
        const response = await API.get(`/buildings/detail.php?id=${buildingId}`);
        console.log('API Response:', response);
        
        if (response.success && response.building) {
            console.log('Bina bulundu:', response.building);
            console.log('Checklist:', response.building.checklist);
            return response.building;
        }
        console.error('Bina bulunamadı veya hata:', response);
        return null;
    } catch (error) {
        console.error('Bina detayı yüklenemedi:', error);
        return null;
    }
}

// Belirli bir tarih aralığındaki kontrolleri getir (API)
async function getControlsByDateRange(buildingId, startDate, endDate) {
    try {
        const response = await API.get(
            `/controls/index.php?buildingId=${buildingId}&startDate=${startDate}&endDate=${endDate}`,
            API.getToken()
        );
        
        if (response.success) {
            return response.controls || [];
        }
        return [];
    } catch (error) {
        console.error('Tarih aralığı kayıtları yüklenemedi:', error);
        return [];
    }
}

// İstatistikleri getir (API)
async function getStatistics() {
    try {
        const response = await API.get('/controls/stats.php', API.getToken());
        
        if (response.success) {
            return response;
        }
        return null;
    } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
        return null;
    }
}

// ============================================
// SAYFA YÜKLENİNCE ÇALIŞACAKLAR
// ============================================

// Index.html için - Bina listesini dinamik yükle
async function loadBuildingsOnIndex() {
    const buildingList = document.querySelector('.building-list');
    if (!buildingList) return;
    
    showLoading('Binalar yükleniyor...');
    
    const buildings = await getAllBuildings();
    const todayStatus = await getTodayStatus();
    
    hideLoading();
    
    if (buildings.length === 0) {
        buildingList.innerHTML = '<p style="text-align: center; padding: 40px;">Henüz bina eklenmemiş.</p>';
        return;
    }
    
    buildingList.innerHTML = buildings.map(building => {
        const isDone = todayStatus[building.id] || false;
        return `
            <div class="building-card ${isDone ? 'completed' : ''}" onclick="goToControl('${building.id}')">
                <div class="building-icon">${building.icon}</div>
                <h3>${building.name}</h3>
                <p>${building.description || 'Kontrol için tıklayın'}</p>
                ${isDone ? '<span class="completed-badge">✅ Tamamlandı</span>' : '<span class="pending-badge">⏳ Bekliyor</span>'}
            </div>
        `;
    }).join('');
    
    // İstatistikleri güncelle
    const completedCount = Object.values(todayStatus).filter(v => v).length;
    const totalCount = buildings.length;
    
    const completedCountEl = document.getElementById('completedCount');
    if (completedCountEl) {
        completedCountEl.textContent = `${completedCount}/${totalCount}`;
    }
    
    const todayDateEl = document.getElementById('todayDate');
    if (todayDateEl) {
        todayDateEl.textContent = formatDate(getTodayDate());
    }
}

// Kontrol.html için - Checklist yükle
async function loadChecklistOnControl() {
    const urlParams = new URLSearchParams(window.location.search);
    const buildingId = urlParams.get('bina');
    
    if (!buildingId) {
        showError('Bina ID bulunamadı!');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    showLoading('Kontrol listesi yükleniyor...');
    
    const building = await getBuildingDetail(buildingId);
    
    hideLoading();
    
    if (!building) {
        showError('Bina bulunamadı!');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }
    
    // Başlığı güncelle
    const titleEl = document.querySelector('.control-header h2');
    if (titleEl) {
        titleEl.textContent = `${building.icon} ${building.name}`;
    }
    
    // Tarihi güncelle
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.textContent = formatDateTime();
    }
    
    // Bina bilgisini güncelle
    const infoEl = document.getElementById('buildingInfo');
    if (infoEl && building.description) {
        infoEl.textContent = building.description;
    }
    
    // Checklist oluştur
    const checklistContainer = document.getElementById('checklistItems');
    if (checklistContainer && building.checklist) {
        checklistContainer.innerHTML = building.checklist.map((item, index) => {
            // Item string veya object olabilir
            const itemText = typeof item === 'string' ? item : (item.item_text || item.text || 'Kontrol maddesi');
            return `
            <div class="check-item">
                <input type="checkbox" id="item${index}" name="checklist" value="${index}">
                <label for="item${index}">${itemText}</label>
            </div>
            `;
        }).join('');
    }
    
    // Bugün daha önce kontrol yapıldı mı?
    const existingControl = await loadControlData(buildingId);
    if (existingControl) {
        // Daha önce işaretlenenleri işaretle
        const checkedItems = existingControl.checked_items || [];
        checkedItems.forEach(index => {
            const checkbox = document.getElementById(`item${index}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Not varsa göster
        const notesEl = document.getElementById('controlNotes');
        if (notesEl && existingControl.notes) {
            notesEl.value = existingControl.notes;
        }
        
        showSuccess('Bugünkü kaydınız yüklendi. İsterseniz güncelleyebilirsiniz.');
    }
}

// Geçmiş.html için - Kayıtları yükle
async function loadHistoryRecords() {
    const recordsContainer = document.getElementById('historyRecords');
    if (!recordsContainer) return;
    
    showLoading('Kayıtlar yükleniyor...');
    
    const buildings = await getAllBuildings();
    let allRecords = [];
    
    for (const building of buildings) {
        const controls = await getAllControls(building.id);
        controls.forEach(control => {
            control.buildingName = building.name;
            control.buildingIcon = building.icon;
        });
        allRecords = allRecords.concat(controls);
    }
    
    hideLoading();
    
    // Tarihe göre sırala (yeniden eskiye)
    allRecords.sort((a, b) => new Date(b.control_date) - new Date(a.control_date));
    
    if (allRecords.length === 0) {
        recordsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Henüz kayıt yok.</p>';
        return;
    }
    
    recordsContainer.innerHTML = allRecords.map(record => `
        <div class="history-card">
            <div class="history-header">
                <h3>${record.buildingIcon} ${record.buildingName}</h3>
                <span class="history-date">${formatDate(record.control_date)}</span>
            </div>
            <div class="history-body">
                <p><strong>Tamamlanma:</strong> %${record.completion_rate}</p>
                <p><strong>İşaretli Maddeler:</strong> ${record.checked_count}</p>
                <p><strong>Kontrol Eden:</strong> ${record.user_full_name || 'Bilinmiyor'}</p>
                ${record.notes ? `<p><strong>Notlar:</strong> ${record.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// İstatistikler.html için - İstatistikleri yükle
async function loadStatistics() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    showLoading('İstatistikler yükleniyor...');
    
    const stats = await getStatistics();
    
    hideLoading();
    
    if (!stats) {
        statsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">İstatistikler yüklenemedi.</p>';
        return;
    }
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>📊 Toplam Kontrol</h3>
            <p class="stat-number">${stats.totalControls || 0}</p>
        </div>
        <div class="stat-card">
            <h3>📅 Bu Ay</h3>
            <p class="stat-number">${stats.monthlyControls || 0}</p>
        </div>
        <div class="stat-card">
            <h3>✅ Bugün</h3>
            <p class="stat-number">${stats.todayControls ? stats.todayControls.length : 0}</p>
        </div>
        <div class="stat-card">
            <h3>📈 Ortalama Tamamlanma</h3>
            <p class="stat-number">%${stats.avgCompletionRate ? stats.avgCompletionRate.toFixed(1) : 0}</p>
        </div>
    `;
}

// Sayfa yüklendiğinde otomatik çalıştır
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

function initPage() {
    // Hangi sayfadayız?
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path.endsWith('/')) {
        loadBuildingsOnIndex();
    } else if (path.includes('kontrol.html')) {
        loadChecklistOnControl();
    } else if (path.includes('gecmis.html')) {
        loadHistoryRecords();
    } else if (path.includes('istatistikler.html')) {
        loadStatistics();
    }
}

// Form submit handler (kontrol.html için)
if (document.getElementById('controlForm')) {
    document.getElementById('controlForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const urlParams = new URLSearchParams(window.location.search);
        const buildingId = urlParams.get('bina');
        
        const checkboxes = document.querySelectorAll('input[name="checklist"]:checked');
        const checkedItems = Array.from(checkboxes).map(cb => parseInt(cb.value));
        const notes = document.getElementById('controlNotes').value.trim();
        
        if (checkedItems.length === 0) {
            showError('Lütfen en az bir madde işaretleyin!');
            return;
        }
        
        const result = await saveControlData(buildingId, {
            date: getTodayDate(),
            checkedItems: checkedItems,
            notes: notes
        });
        
        if (result) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}
