window.activeTab = 'settings';

// 유저 프로필 데이터 바인딩
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('set-profile-name').innerText = user.displayName ? `${user.displayName} 님` : '회원 님';
        document.getElementById('set-profile-email').innerText = user.email || '';
    }
});

// 알림 스위치 토글
window.toggleNotification = function() {
    const toggleRest = document.getElementById('toggle-rest');
    if(toggleRest) {
        toggleRest.classList.toggle('active');
    }
};
