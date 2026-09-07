renderBottomNav('settings');

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('set-profile-name').innerText = user.displayName ? `${user.displayName} 님` : '회원 님';
        document.getElementById('set-profile-email').innerText = user.email || '';
    }
});

// --- 알림 스위치 토글 이벤트 (좌우 이동 CSS 연동) ---
const toggleRest = document.getElementById('toggle-rest');
window.toggleNotification = function() {
    if(toggleRest) {
        toggleRest.classList.toggle('active');
    }
};

// --- 설정 화면 전용 팝업 바텀 시트 로직 ---
const modalOverlay = document.getElementById('common-modal-overlay');

function hideAllModals() {
    modalOverlay.querySelectorAll('.bottom-sheet-modal').forEach(m => {
        m.classList.remove('active');
    });
}

window.openBottomSheet = function(type) {
    hideAllModals();
    modalOverlay.classList.add('active');
    document.getElementById(`bs-${type}`).classList.add('active');
};

window.closeModal = function() {
    modalOverlay.classList.remove('active');
    hideAllModals();
};

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) window.closeModal();
});
