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

// Verileri kaydet (LocalStorage) - Tarih bazlı
function saveControlData(buildingId, data) {
    const today = getTodayDate();
    const key = `kontrol_${buildingId}_${today}`;
    
    // Veriyi kaydet
    data.savedAt = new Date().toISOString();
    data.date = today;
    localStorage.setItem(key, JSON.stringify(data));
    
    // Kayıt indeksini güncelle
    updateControlIndex(buildingId, today);
}

// Bugünün verisini yükle
function loadControlData(buildingId, date = null) {
    const targetDate = date || getTodayDate();
    const key = `kontrol_${buildingId}_${targetDate}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Bugün kontrol yapıldı mı?
function isTodayControlDone(buildingId) {
    const data = loadControlData(buildingId);
    return data !== null && data.completed === true;
}

// Kontrol indeksini güncelle (hangi günlerde kontrol yapıldı)
function updateControlIndex(buildingId, date) {
    const indexKey = `index_${buildingId}`;
    let index = localStorage.getItem(indexKey);
    index = index ? JSON.parse(index) : [];
    
    // Bu tarihi ekle (eğer yoksa)
    if (!index.includes(date)) {
        index.push(date);
        index.sort().reverse(); // Yeniden eskiye sırala
        localStorage.setItem(indexKey, JSON.stringify(index));
    }
}

// Bir bina için tüm kayıtları getir
function getAllControls(buildingId) {
    const indexKey = `index_${buildingId}`;
    let index = localStorage.getItem(indexKey);
    index = index ? JSON.parse(index) : [];
    
    return index.map(date => {
        const data = loadControlData(buildingId, date);
        return { date, data };
    });
}

// Tüm binalar için bugünün durumunu getir
function getTodayStatus() {
    const buildings = ['giris', 'kum_yag', 'idari', 'blower', 'test1', 'test2', 'test3', 'test4'];
    const status = {};
    
    buildings.forEach(buildingId => {
        status[buildingId] = isTodayControlDone(buildingId);
    });
    
    return status;
}

// Toplam kontrol sayısını getir
function getTotalControlCount() {
    const buildings = ['giris', 'pompaj', 'aritma', 'jenerator'];
    let total = 0;
    
    buildings.forEach(buildingId => {
        const indexKey = `index_${buildingId}`;
        let index = localStorage.getItem(indexKey);
        index = index ? JSON.parse(index) : [];
        total += index.length;
    });
    
    return total;
}

// Belirli bir tarih aralığındaki kontrolleri getir
function getControlsByDateRange(buildingId, startDate, endDate) {
    const allControls = getAllControls(buildingId);
    return allControls.filter(control => {
        return control.date >= startDate && control.date <= endDate;
    });
}

// Başarı mesajı göster
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    if (message) {
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }
}

// Eski kayıtları temizle (isteğe bağlı - mesela 90 günden eski kayıtlar)
function cleanOldRecords(daysToKeep = 90) {
    const buildings = ['giris', 'pompaj', 'aritma', 'jenerator'];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    buildings.forEach(buildingId => {
        const indexKey = `index_${buildingId}`;
        let index = localStorage.getItem(indexKey);
        index = index ? JSON.parse(index) : [];
        
        // Eski kayıtları sil
        const validDates = index.filter(date => date >= cutoffDateStr);
        
        // Silinen kayıtları localStorage'dan kaldır
        index.forEach(date => {
            if (date < cutoffDateStr) {
                const key = `kontrol_${buildingId}_${date}`;
                localStorage.removeItem(key);
            }
        });
        
        // İndeksi güncelle
        localStorage.setItem(indexKey, JSON.stringify(validDates));
    });
}
