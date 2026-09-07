renderBottomNav('settings');

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('set-profile-name').innerText = user.displayName ? `${user.displayName} 님` : '회원 님';
        document.getElementById('set-profile-email').innerText = user.email || '';
    }
});

// 알림 스위치 토글 이벤트
const toggleRest = document.getElementById('toggle-rest');
if(toggleRest) {
    toggleRest.addEventListener('click', function() {
        this.style.background = this.style.background === 'transparent' ? 'var(--primary-light)' : 'transparent';
        this.style.borderColor = this.style.borderColor === '#555' ? 'var(--primary)' : '#555';
    });
}
