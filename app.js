// --- 공통 Firebase SDK 초기화 ---
const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb",
    storageBucket: "exercise-abddb.firebasestorage.app",
    messagingSenderId: "887574653012",
    appId: "1:887574653012:web:deac9acecc61763d325c1",
    measurementId: "G-05SVZ9QPS9"
};

// 중복 초기화 방지
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- 하단 네비게이션 바 공통 렌더링 ---
function renderBottomNav(activeTab) {
    const navHtml = `
        <nav class="bottom-nav" id="main-nav">
            <div class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="location.href='home.html'">
                <span class="nav-icon">🏠</span><span class="nav-text">홈</span>
            </div>
            <div class="nav-item ${activeTab === 'routine' ? 'active' : ''}" onclick="location.href='routine.html'">
                <span class="nav-icon">📋</span><span class="nav-text">루틴</span>
            </div>
            <div class="nav-item ${activeTab === 'analysis' ? 'active' : ''}" onclick="location.href='analysis.html'">
                <span class="nav-icon">📊</span><span class="nav-text">분석</span>
            </div>
            <div class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="location.href='settings.html'">
                <span class="nav-icon">⚙️</span><span class="nav-text">설정</span>
            </div>
        </nav>
    `;
    
    // 페이지 하단에 네비게이션 주입
    document.body.insertAdjacentHTML('beforeend', navHtml);
}
