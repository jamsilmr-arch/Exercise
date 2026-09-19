// ==========================================
// 1. Firebase 전역 초기화 (에러 방어 로직 추가)
// ==========================================
try {
    const firebaseConfig = {
        apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
        authDomain: "exercise-abddb.firebaseapp.com",
        projectId: "exercise-abddb"
    };
    
    // firebase 객체가 정상적으로 로드되었는지 확인 후 실행
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        window.auth = firebase.auth();
        window.db = firebase.firestore();
    } else {
        console.warn("Firebase 스크립트가 로드되지 않았습니다. 로컬 기능만 활성화됩니다.");
        window.auth = null;
        window.db = null;
    }
} catch (e) {
    console.error("Firebase 초기화 중 에러 발생 (무시하고 진행):", e);
    window.auth = null;
    window.db = null;
}

window.currentRoutine = [];
window.totalGlobalSets = 0;

// ==========================================
// [추가됨] 유저 스트렝스/근비대 비율 동기화 로직 (에러 방어)
// ==========================================
if (window.auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().wizardData) {
                    const strRatio = parseInt(userDoc.data().wizardData?.goal_strength?.value) || 25;
                    localStorage.setItem('user_strength_ratio', strRatio);
                }
            } catch(e) { console.error("비율 데이터 동기화 실패:", e); }
        }
    });
}
// ==========================================

// ==========================================
// 2. 운동 DB (좌/우 통합 및 교차 분할 루틴)
// ==========================================
const textPresets = {
    full_a: ['스쿼트', '벤치 프레스', '풀업', '바벨 로우', '오버헤드 프레스', '사이드 레터럴 레이즈', '바벨 컬', '삼두 푸시다운'], 
    full_b: ['레그 프레스', '인클라인 스미스 머신 벤치 프레스', '랫 풀다운 중간 그립', '시티드 로우', '머신 숄더 프레스', '케이블 레터럴 레이즈 (높은 케이블)', '덤벨 바이셉 컬', '케이블 트라이셉 푸시다운'],
    full_c: ['머신 핵 스쿼트', '해머 스트렝스 체스트 프레스 머신 (Plate-loaded, Lever)', '원암 랫 풀다운', '케이블 로우 (중간-넓은 오버 그립)', '덤벨 레터럴 레이즈', '리어 델트 플라이', '해머 컬', '오버헤드 트라이셉 익스텐션'],
    
    upper_a: ['벤치 프레스', '풀업', '인클라인 프레스', '바벨 로우', '오버헤드 프레스', '사이드 레터럴 레이즈', '바벨 컬', '삼두 푸시다운'], 
    upper_b: ['인클라인 스미스 머신 벤치 프레스', '랫 풀다운 중간 그립', '해머 스트렝스 체스트 프레스 머신 (Plate-loaded, Lever)', '시티드 로우', '머신 숄더 프레스', '케이블 레터럴 레이즈 (높은 케이블)', '덤벨 바이셉 컬', '케이블 트라이셉 푸시다운'],
    
    lower_a: ['스쿼트', '루마니안 데드리프트', '레그 프레스', '레그 익스텐션', '레그 컬', '힙 쓰러스트', '이너 타이', '카프 레이즈'], 
    lower_b: ['머신 핵 스쿼트', '바벨 데드리프트', '스미스 머신 스쿼트', '시티드 햄스트링 컬', '덤벨 불가리안 스플릿 스쿼트 (상체 숙이고 둔근 포커스)', '힙 어브덕션', '케이블 킥백'],
    
    push_a: ['벤치 프레스', '인클라인 프레스', '오버헤드 프레스', '딥스', '펙덱 플라이', '사이드 레터럴 레이즈', '프론트 레이즈', '삼두 푸시다운'], 
    push_b: ['해머 스트렝스 체스트 프레스 머신 (Plate-loaded, Lever)', '인클라인 스미스 머신 벤치 프레스', '머신 숄더 프레스', '덤벨 체스트 플라이', '케이블 레터럴 레이즈 (높은 케이블)', '케이블 트라이셉 푸시다운', '오버헤드 트라이셉 익스텐션'],
    
    pull_a: ['풀업', '바벨 로우', '랫풀다운', '시티드 로우', '페이스 풀', '리어 델트 플라이', '바벨 컬', '해머 컬'], 
    pull_b: ['랫 풀다운 중간 그립', '체스트 서포티드 티바 로우', '원암 랫 풀다운', '케이블 로우 (중간-넓은 오버 그립)', '케이블 리버스 플라이', '바벨 프리처 컬', '덤벨 바이셉 컬'],
    
    core_a: ['벤치 프레스', '풀업', '인클라인 프레스', '바벨 로우', '랫풀다운', '시티드 로우', '펙덱 플라이', '풀오버'], 
    core_b: ['인클라인 스미스 머신 벤치 프레스', '랫 풀다운 중간 그립', '해머 스트렝스 체스트 프레스 머신 (Plate-loaded, Lever)', '체스트 서포티드 티바 로우', '케이블 로우 (중간-넓은 오버 그립)', '덤벨 체스트 플라이'],
    
    limb_a: ['오버헤드 프레스', '프론트 레이즈', '사이드 레터럴 레이즈', '리어 델트 플라이', '바벨 컬', '해머 컬', '삼두 푸시다운', '오버헤드 트라이셉 익스텐션'],
    limb_b: ['머신 숄더 프레스', '덤벨 레터럴 레이즈', '케이블 리버스 플라이', '덤벨 바이셉 컬', '바벨 프리처 컬', '원암 케이블 푸시다운', '케이블 트라이셉 푸시다운'],
    
    glutes_a: ['스쿼트', '루마니안 데드리프트', '런지', '힙 쓰러스트', '레그 프레스', '힙 어브덕션', '킥백', '이너 타이'],
    glutes_b: ['덤벨 불가리안 스플릿 스쿼트 (상체 숙이고 둔근 포커스)', '바벨 데드리프트', '머신 핵 스쿼트', '시티드 햄스트링 컬', '힙 어브덕션', '케이블 킥백'],
    
    w_upper_a: ['랫풀다운', '시티드 로우', '푸시업', '오버헤드 프레스', '사이드 레터럴 레이즈', '페이스 풀', '바벨 컬', '오버헤드 트라이셉 익스텐션'],
    w_upper_b: ['랫 풀다운 중간 그립', '케이블 로우 (중간-넓은 오버 그립)', '인클라인 스미스 머신 벤치 프레스', '머신 숄더 프레스', '덤벨 레터럴 레이즈', '덤벨 바이셉 컬', '케이블 트라이셉 푸시다운']
};

window.routineDB = {
    'rt_2_full': { title: '주 2회 무분할 루틴', chips: ['남성'], desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.full_a }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full_b }, { type: 'rest', days: 3 } ] },
    'rt_3_hybrid': { title: '주 3회 (상체-하체-전신) 루틴', chips: ['상체-하체-전신', '남성'], desc: '2분할과 무분할을 섞은 하이브리드입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.lower_a }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full_a }, { type: 'rest', days: 1 } ] },
    'rt_3_full': { title: '주 3회 무분할 (전신-전신-전신)', chips: ['전신-전신-전신', '남성'], desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 8, texts: textPresets.full_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 8, texts: textPresets.full_b }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full_c }, { type: 'rest', days: 1 } ] },
    'rt_4_hybrid': { title: '주 4회 (밀기-당기기-하체-전신)', chips: ['밀기-당기기-하체-전신', '남성'], desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push_a }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.lower_a }, { type: 'workout', label: 'Day 4', count: 7, texts: textPresets.full_a }, { type: 'rest', days: 2 } ] },
    'rt_4_split': { title: '주 4회 (상체-하체-상체-하체)', chips: ['상체-하체-상체-하체', '남성'], desc: '가장 기본적이고 효율적인 2분할 방식입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper_a }, { type: 'workout', label: 'Day 2', count: 6, texts: textPresets.lower_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper_b }, { type: 'workout', label: 'Day 2a', count: 6, texts: textPresets.lower_b }, { type: 'rest', days: 2 } ] },
    'rt_5_push_pull': { title: '주 5회 (밀-당-하-밀-당)', chips: ['밀기-당기기-하체-밀기-당기기', '남성'], desc: '하체 운동을 주 1회만 함으로써 상체에 더 집중할 수 있는 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push_a }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull_a }, { type: 'workout', label: 'Day 3', count: 6, texts: textPresets.lower_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.push_b }, { type: 'workout', label: 'Day 2a', count: 7, texts: textPresets.pull_b }, { type: 'rest', days: 1 } ] },
    'rt_5_hybrid': { title: '주 5회 (상-하-상-하-상)', chips: ['상체-하체-상체-하체-상체', '남성'], desc: '상체에 3일, 하체에 2일 투자하여 상체 운동을 더 여유롭게 분배했습니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper_a }, { type: 'workout', label: 'Day 2', count: 6, texts: textPresets.lower_a }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper_b }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2a', count: 6, texts: textPresets.lower_b }, { type: 'workout', label: 'Day 1b', count: 7, texts: textPresets.upper_a }, { type: 'rest', days: 1 } ] },
    'rt_6_push_pull': { title: '주 6회 (밀기-당기기-하체)', chips: ['밀기-당기기-하체', '남성'], desc: '단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 3분할 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.push_a }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull_a }, { type: 'workout', label: 'Day 3', count: 6, texts: textPresets.lower_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.push_b }, { type: 'workout', label: 'Day 2a', count: 7, texts: textPresets.pull_b }, { type: 'workout', label: 'Day 3a', count: 6, texts: textPresets.lower_b } ] },
    'rt_6_body_limb_lower': { title: '주 6회 (몸통-말단-하체)', chips: ['몸통-말단-하체', '남성'], desc: '세션 후반부의 피로 누적을 줄이고 안정적인 퍼포먼스를 유지하는 3분할 변형입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.core_a }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.limb_a }, { type: 'workout', label: 'Day 3', count: 6, texts: textPresets.lower_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.core_b }, { type: 'workout', label: 'Day 2a', count: 7, texts: textPresets.limb_b }, { type: 'workout', label: 'Day 3a', count: 6, texts: textPresets.lower_b } ] },
    'rt_w_fitness': { title: '여성 헬스 루틴', chips: ['여성'], desc: '힙업과 탄력 있는 실루엣을 위해 둔근에 가장 집중합니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 5, texts: textPresets.glutes_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.w_upper_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 5, texts: textPresets.glutes_b }, { type: 'rest', days: 2 } ] },
    'rt_w_hipup': { title: '힙업 루틴', chips: ['여성'], desc: '전신을 운동하지만 힙업에 많은 비중을 두는 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.glutes_a }, { type: 'workout', label: 'Day 2', count: 6, texts: textPresets.w_upper_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 4', count: 6, texts: textPresets.glutes_b }, { type: 'workout', label: 'Day 5', count: 6, texts: textPresets.w_upper_b }, { type: 'rest', days: 2 } ] },
    'rt_w_hiponly': { title: '힙 only 루틴', chips: ['여성', '힙 only'], desc: '다른 신체 부위 말고, 오로지 힙업만 원하는 여성분들을 위한 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 5, texts: textPresets.glutes_a }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.glutes_b }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 6', count: 5, texts: textPresets.glutes_a }, { type: 'rest', days: 1 } ] }
};

// ==========================================
// 3. DOM 로드 시 공통 UI 주입
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    let activeTab = 'home';
    if (path.includes('routine')) activeTab = 'routine';
    if (path.includes('analysis')) activeTab = 'analysis';
    if (path.includes('settings')) activeTab = 'settings';

    const navHtml = `
        <nav class="bottom-nav" id="main-nav">
            <div class="nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="location.href='home.html'"><span class="nav-icon">🏠</span><span class="nav-text">홈</span></div>
            <div class="nav-item ${activeTab === 'routine' ? 'active' : ''}" onclick="location.href='routine.html'"><span class="nav-icon">📋</span><span class="nav-text">루틴</span></div>
            <div class="nav-item ${activeTab === 'analysis' ? 'active' : ''}" onclick="location.href='analysis.html'"><span class="nav-icon">📊</span><span class="nav-text">분석</span></div>
            <div class="nav-item ${activeTab === 'settings' ? 'active' : ''}" onclick="location.href='settings.html'"><span class="nav-icon">⚙️</span><span class="nav-text">설정</span></div>
        </nav>
    `;

    const timerHtml = `
        <div class="global-sticky-timer" id="global-timer-ui">
            <div class="gst-top">
                <div class="gst-info">
                    <span class="gst-name" id="gst-ex-name">운동 이름</span>
                    <span class="gst-sub" id="gst-rest-text">권장 휴식 시간 01:30</span>
                    <div class="gst-time" id="gst-time-display">01:30</div>
                </div>
                <div class="gst-controls"><span id="gst-pause">⏸</span><span id="gst-close">✕</span></div>
            </div>
            <div class="gst-progress-bar"><div class="gst-progress-fill" id="gst-progress"></div></div>
        </div>
    `;

    const modalsHtml = `
        <div class="modal-overlay" id="common-modal-overlay">
            
            <div class="bottom-sheet-modal" id="bs-info">
                <div class="bs-header"><span style="width:24px;"></span><span class="bs-title">나의 정보</span><span class="modal-close" onclick="closeModal()">✕</span></div>
                <div class="bs-content">
                    <div class="st-item" style="padding:0; border:none; margin-bottom:15px;" onclick="openBottomSheet('gender')"><div class="st-left" style="font-size:1.1rem; font-weight:normal; color:#fff;">성별</div><div class="st-right" style="font-size:1.1rem;">남성 <span class="st-arrow">></span></div></div>
                    <div class="st-item" style="padding:0; border:none;" onclick="openBottomSheet('weight')"><div class="st-left" style="font-size:1.1rem; font-weight:normal; color:#fff;">몸무게</div><div class="st-right" style="font-size:1.1rem;">72kg <span class="st-arrow">></span></div></div>
                </div>
            </div>

            <div class="bottom-sheet-modal" id="bs-gender">
                <div class="bs-header"><button class="icon-btn" onclick="openBottomSheet('info')">←</button><span class="bs-title">성별</span><span class="modal-close" onclick="closeModal()">✕</span></div>
                <div class="bs-content"><div class="bs-option active">남성</div><div class="bs-option">여성</div></div>
            </div>

            <div class="bottom-sheet-modal" id="bs-weight">
                <div class="bs-header"><button class="icon-btn" onclick="openBottomSheet('info')">←</button><span class="bs-title">몸무게</span><span class="modal-close" onclick="closeModal()">✕</span></div>
                <div class="bs-content"><div class="bs-input-wrap"><input type="number" value="72"><span class="bs-unit">kg</span></div><button class="primary-btn" onclick="openBottomSheet('info')">저장</button></div>
            </div>

            <div class="full-bottom-sheet" id="bs-muscle-pain" style="height: 85vh;">
                <div class="bs-header" style="border-bottom: none;">
                    <span class="bs-title">어디에 근육통이 있나요?</span><span class="modal-close" onclick="closeModal()">✕</span>
                </div>
                <div class="bs-content" style="padding-top:0; overflow-y:auto; padding-bottom:100px;">
                    <div class="pain-section-title">기타</div>
                    <div class="pain-chips-wrap">
                        <div class="pain-chip" onclick="this.classList.toggle('active')">복근</div><div class="pain-chip" onclick="this.classList.toggle('active')">목</div><div class="pain-chip" onclick="this.classList.toggle('active')">기립근</div>
                    </div>
                    <div class="pain-section-title">상체</div>
                    <div class="pain-chips-wrap">
                        <div class="pain-chip" onclick="this.classList.toggle('active')">가슴</div><div class="pain-chip" onclick="this.classList.toggle('active')">어깨(전/측면)</div><div class="pain-chip" onclick="this.classList.toggle('active')">어깨(후면)</div><div class="pain-chip" onclick="this.classList.toggle('active')">등 중/상부</div><div class="pain-chip" onclick="this.classList.toggle('active')">광배근</div><div class="pain-chip" onclick="this.classList.toggle('active')">이두근</div><div class="pain-chip" onclick="this.classList.toggle('active')">삼두근</div><div class="pain-chip" onclick="this.classList.toggle('active')">전완</div>
                    </div>
                    <div class="pain-section-title">하체</div>
                    <div class="pain-chips-wrap">
                        <div class="pain-chip" onclick="this.classList.toggle('active')">대퇴사두</div><div class="pain-chip" onclick="this.classList.toggle('active')">둔근</div><div class="pain-chip" onclick="this.classList.toggle('active')">종아리</div><div class="pain-chip" onclick="this.classList.toggle('active')">내전근</div><div class="pain-chip" onclick="this.classList.toggle('active')">햄스트링</div>
                    </div>
                </div>
                <div class="cw-footer" style="position:absolute;">
                    <div class="cw-footer-inner"><button class="primary-btn" id="btn-pain-start-workout">운동 시작</button></div>
                </div>
            </div>

            <div class="full-bottom-sheet" id="bs-cardio-wizard">
                <div class="bs-header" style="border-bottom:none;"><button class="icon-btn" onclick="closeModal()">✕</button><span class="bs-title">유산소 설정</span><div style="width:24px;"></div></div>
                <div class="cw-progress-area" style="padding: 0 20px 10px;"><div class="cw-p-text"><span id="cw-step-text">질문 1/5</span><span>유산소 처방 준비</span></div><div class="cw-p-bar"><div class="cw-p-fill" id="cw-progress-fill" style="width:20%;"></div></div></div>
                <div id="cw-render-area" style="flex:1; overflow-y:auto; padding-bottom:100px;"></div>
                <div class="cw-footer" style="position:absolute;"><div class="cw-footer-inner"><button class="secondary-btn" id="btn-cw-prev">이전</button><button class="primary-btn" id="btn-cw-next">다음</button></div></div>
            </div>

            <div class="guide-modal" id="modal-guide">
                <div class="modal-header"><span class="modal-badge" id="modal-badge-title">가이드</span><span class="modal-close" onclick="closeModal()">✕</span></div>
                <div class="modal-content" id="modal-content-area"></div>
                <div class="modal-footer"><button class="modal-btn-prev" id="modal-btn-prev">이전</button><button class="modal-btn-next" id="modal-btn-next">다음</button></div>
            </div>

            <div class="alert-modal" id="modal-alert-incomplete">
                <h3 class="am-title">아직 남은 세트가 있어요!</h3><p class="am-sub">정말 운동을 끝낼까요?</p>
                <div class="am-btns"><button class="am-btn-cancel" onclick="closeModal()">취소</button><button class="am-btn-confirm" onclick="forceEndWorkout()">종료</button></div>
            </div>
            
            <div class="feedback-modal" id="modal-daily-feedback">
                <div class="fm-top">오늘 운동 완료!</div><h2 class="fm-title">오늘의 운동 어떠셨어요?</h2>
                <div class="fm-options">
                    <button class="fm-opt-btn" onclick="selectFeedback(this)">가뿐히 해냈고, 운동이 쉽게 느껴졌어요!</button>
                    <button class="fm-opt-btn" onclick="selectFeedback(this)">무리없이 해냈고, 강도가 딱 알맞았어요!</button>
                    <button class="fm-opt-btn" onclick="selectFeedback(this)">운동이 힘들고 벅차게 느껴졌어요!</button>
                </div>
                <button class="primary-btn" id="btn-submit-feedback" disabled style="width: calc(100% - 40px); margin: 0 auto; display:block;">제출</button>
            </div>
            
            <div class="coach-modal" id="modal-coach">
                <div class="coach-header"><span class="coach-badge" id="coach-badge-text">과부하 코치</span><div style="font-size: 0.8rem; color: #888; margin-bottom: 5px;" id="coach-sub-text"></div><h2 class="coach-title" id="coach-title-text">세 번째 운동을 완료했어요!</h2><div style="color:var(--primary); font-size:1.5rem; margin-bottom:10px;">✦</div></div>
                <div class="coach-content" id="coach-content-area"></div>
                <div class="coach-footer"><div class="coach-dots" id="coach-dots-area"></div><button class="primary-btn" id="btn-coach-next" style="width: 100%;">다음</button></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', timerHtml);
    document.body.insertAdjacentHTML('beforeend', navHtml);
    document.body.insertAdjacentHTML('beforeend', modalsHtml);

    attachCommonEvents();
});

// ==========================================
// 4. 운동 리스트 렌더링 (종목별 알맞은 본세트 데이터 배정)
// ==========================================
window.renderWorkoutList = function() {
    const rtId = localStorage.getItem('active_routine_id') || 'rt_6_body_limb_lower';
    const data = window.routineDB[rtId];
    if(!data) return;

    let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    const freq = parseInt(localStorage.getItem('active_routine_freq')) || 6;
    let currentDayIndex = completedDays % freq; 

    const workoutDays = data.timeline.filter(t => t.type === 'workout');
    const todayWorkout = workoutDays[currentDayIndex];
    if(!todayWorkout) return;

    const topBarTitle = document.querySelector('#view-workout .tn-title');
    if(topBarTitle) topBarTitle.innerText = `Day ${currentDayIndex + 1}`;

    let html = '';
    window.currentRoutine = [];
    window.totalGlobalSets = 0;

    const conditionScore = parseInt(localStorage.getItem('workout_intensity_score')) || 3;
    const strengthRatio = parseInt(localStorage.getItem('user_strength_ratio')) || 25; 
    
    // [수정/추가됨] 종목 특성별 키워드 정밀 분류
    const big3Keywords = ['스쿼트', '벤치 프레스', '데드리프트'];
    const isolationKeywords = ['컬', '익스텐션', '레이즈', '플라이', '푸시다운', '킥백', '어브덕션', '이너 타이', '풀오버', '페이스 풀', '카프'];

    todayWorkout.texts.forEach((exName, idx) => {
        let warmupCount = 1, hasTopSet = false, mainCount = 3;

        // [수정됨] 종목별 최적화된 세트 수 배정 로직 (기본 워킹 세트를 3세트로 상향)
        if (big3Keywords.some(keyword => exName.includes(keyword))) {
            // 3대 운동 (고중량): 웜업 2, 탑세트 1, 본세트 2 (총 워킹세트 3)
            warmupCount = 2; hasTopSet = true; mainCount = 2;
        } else if (isolationKeywords.some(keyword => exName.includes(keyword))) {
            // 고립/단관절 운동: 웜업 1, 탑세트 0, 본세트 3 (총 워킹세트 3)
            warmupCount = 1; hasTopSet = false; mainCount = 3;
        } else {
            // 일반 복합 다관절: 웜업 1, 탑세트 1, 본세트 2 (총 워킹세트 3)
            warmupCount = 1; hasTopSet = true; mainCount = 2;
        }
        
        // 컨디션 저조 시 본세트 1개 차감하여 강도 조절
        if (conditionScore < 3 && mainCount > 1) mainCount -= 1;

        // 스트렝스/근비대 비율에 따른 횟수(Reps) 및 증량폭 설정
        let topReps, mainReps, overloadTop, overloadMain;
        const isIsolationForReps = isolationKeywords.some(keyword => exName.includes(keyword));

        if (strengthRatio >= 75) {
            topReps = "3-5"; mainReps = isIsolationForReps ? "8-10" : "5-8";
            overloadTop = 5.0; overloadMain = isIsolationForReps ? 2.0 : 5.0;
        } else if (strengthRatio >= 50) {
            topReps = "5-7"; mainReps = isIsolationForReps ? "10-12" : "8-10";
            overloadTop = 2.5; overloadMain = isIsolationForReps ? 2.0 : 2.5;
        } else {
            topReps = "8-10"; mainReps = isIsolationForReps ? "12-15" : "10-12";
            overloadTop = 2.5; overloadMain = isIsolationForReps ? 1.0 : 2.5;
        }

        if (conditionScore < 3) { overloadTop = 0; overloadMain = 0; }

        const totalSets = warmupCount + (hasTopSet ? 1 : 0) + mainCount;
        window.totalGlobalSets += totalSets;
        window.currentRoutine.push({ id: `ex_${idx}`, name: exName });
        
        const noRecordHtml = `<span style="color:#666; font-size:0.85rem;">기록 없음</span>`;

        html += `
        <div class="we-card" id="we-card-ex_${idx}">
            <div class="we-header" onclick="toggleSets('ex_${idx}')">
                <span class="we-name">${exName}</span>
                <span class="we-arrow" id="arrow-ex_${idx}">▼</span>
            </div>
            <div class="we-sets" id="sets-ex_${idx}" style="display:none; padding:20px;">
        `;
        
        // 1. 웜업 세트
        html += `
            <div class="we-group-badge">웜업 세트</div>
            <div class="we-top-history"><span>지난주 웜업 세트</span>${noRecordHtml}</div>
            <div class="we-labels"><span></span><span>중량 (kg)</span><span>횟수</span><span></span></div>
        `;
        let currentSetNum = 1;
        for(let s=1; s<=warmupCount; s++) {
            let rir = s === 1 ? '6 RIR' : '5 RIR';
            let guideReps = s === 1 ? '6' : '5';
            html += `
            <div class="we-row warmup-set-row" id="row-ex_${idx}-${currentSetNum}">
                <span class="we-rir-label">${rir}</span>
                <input type="number" class="we-val-input" value="" placeholder="빈 바">
                <input type="number" class="we-val-input" value="" placeholder="${guideReps}">
                <div class="we-circle-check" onclick="checkSet(this, 'ex_${idx}', ${currentSetNum}, 'warmup')">✓</div>
            </div>`;
            currentSetNum++;
        }

        // 2. 탑 세트
        if (hasTopSet) {
            const lastTopWeight = 35; // 초기 가상 데이터
            const targetTopWeight = lastTopWeight + overloadTop;
            html += `
                <div style="height:20px;"></div>
                <div class="we-group-badge">탑 세트</div>
                <div class="we-top-history"><span>지난주 탑 세트</span>${noRecordHtml}</div>
                <div class="we-labels"><span></span><span>중량 (kg)</span><span>횟수</span><span></span></div>
                <div class="we-row top-set-row" id="row-ex_${idx}-${currentSetNum}">
                    <span class="we-rir-label">1 RIR</span>
                    <input type="number" class="we-val-input" value="" placeholder="${targetTopWeight}">
                    <input type="number" class="we-val-input" value="" placeholder="${topReps}">
                    <div class="we-circle-check" onclick="checkSet(this, 'ex_${idx}', ${currentSetNum}, 'top')">✓</div>
                </div>
            `;
            currentSetNum++;
        }

        // 3. 본 세트
        if (mainCount > 0) {
            const lastMainWeight = 30; // 초기 가상 데이터
            const targetMainWeight = lastMainWeight + overloadMain;
            html += `
                <div style="height:20px;"></div>
                <div class="we-group-badge">본 세트</div>
                <div class="we-top-history"><span>지난주 본 세트</span>${noRecordHtml}</div>
                <div class="we-labels"><span></span><span>중량 (kg)</span><span>횟수</span><span></span></div>
            `;
            for(let s = 1; s <= mainCount; s++) {
                html += `
                <div class="we-row main-set-row" id="row-ex_${idx}-${currentSetNum}">
                    <span class="we-rir-label">1 RIR</span>
                    <input type="number" class="we-val-input" value="" placeholder="${targetMainWeight}">
                    <input type="number" class="we-val-input" value="" placeholder="${mainReps}">
                    <div class="we-circle-check" onclick="checkSet(this, 'ex_${idx}', ${currentSetNum}, 'main')">✓</div>
                </div>`;
                currentSetNum++;
            }
        }

        html += `
            <div class="we-controls">
                <button class="we-ctrl-btn" onclick="addMainSet('ex_${idx}')">+ 세트 추가</button>
                <button class="we-ctrl-btn" onclick="deleteMainSet('ex_${idx}')">- 세트 삭제</button>
            </div>
        </div></div>`;
    });

    html += `<button class="primary-btn" style="margin-top:20px; width:100%; display:block;" onclick="checkFinishWorkout()">운동 완료</button>`;
    
    let renderArea = document.getElementById('workout-render-area');
    if (!renderArea) {
        renderArea = document.createElement('div');
        renderArea.id = 'workout-render-area';
        renderArea.style.padding = '0 20px 100px 20px'; 
        const viewWorkout = document.getElementById('view-workout');
        if (viewWorkout) viewWorkout.appendChild(renderArea);
    }
    renderArea.innerHTML = html;
};

// ==========================================
// 4-1. 본 세트 동적 추가/삭제 함수 (main 파라미터 연동)
// ==========================================
window.addMainSet = function(exId) {
    const setsContainer = document.getElementById(`sets-${exId}`);
    const controls = setsContainer.querySelector('.we-controls');
    const allRows = setsContainer.querySelectorAll('.we-row');
    const lastRow = allRows[allRows.length - 1];
    let nextSetNum = allRows.length + 1;
    if(lastRow) {
        const idParts = lastRow.id.split('-');
        nextSetNum = parseInt(idParts[idParts.length - 1]) + 1;
    }
    
    const strengthRatio = parseInt(localStorage.getItem('user_strength_ratio')) || 25;
    const isIsolation = ['컬', '익스텐션', '레이즈', '플라이', '푸시다운', '킥백', '어브덕션', '이너 타이', '풀오버', '페이스 풀'].some(keyword => document.querySelector(`#we-card-${exId} .we-name`).innerText.includes(keyword));
    
    let mainReps = "10-12";
    if (strengthRatio >= 75) mainReps = isIsolation ? "8-10" : "5-8";
    else if (strengthRatio >= 50) mainReps = isIsolation ? "10-12" : "8-10";
    else mainReps = isIsolation ? "12-15" : "10-12";

    const newRow = document.createElement('div');
    newRow.className = 'we-row main-set-row';
    newRow.id = `row-${exId}-${nextSetNum}`;
    // onclick 시 'main' 타입 전달
    newRow.innerHTML = `
        <span class="we-rir-label">1 RIR</span>
        <input type="number" class="we-val-input" value="" placeholder="0">
        <input type="number" class="we-val-input" value="" placeholder="${mainReps}">
        <div class="we-circle-check" onclick="checkSet(this, '${exId}', ${nextSetNum}, 'main')">✓</div>
    `;
    
    setsContainer.insertBefore(newRow, controls);
    window.totalGlobalSets += 1;
};

window.deleteMainSet = function(exId) {
    const setsContainer = document.getElementById(`sets-${exId}`);
    const mainSetRows = setsContainer.querySelectorAll('.we-row.main-set-row');
    
    if (mainSetRows.length > 0) {
        const lastMainSetRow = mainSetRows[mainSetRows.length - 1];
        const idParts = lastMainSetRow.id.split('-');
        const setNum = parseInt(idParts[idParts.length - 1]);
        
        lastMainSetRow.remove();
        window.totalGlobalSets -= 1;
        
        let saved = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
        saved = saved.filter(s => s !== setNum);
        localStorage.setItem(`workout_${exId}`, JSON.stringify(saved));
    } else {
        alert("더 이상 삭제할 본 세트가 없습니다.");
    }
};

// ==========================================
// 5. 공통 팝업 및 타이머 연동 (체크 시 시간 분기 처리)
// ==========================================
window.toggleSets = function(exId) {
    const setsDiv = document.getElementById(`sets-${exId}`);
    const arrow = document.getElementById(`arrow-${exId}`);
    if(setsDiv.style.display === 'none') {
        setsDiv.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        setsDiv.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
};

// [수정됨] 세트 유형(setType) 파라미터 추가
window.checkSet = function(btn, exId, setNum, setType = 'main') {
    btn.classList.toggle('active');
    const row = document.getElementById(`row-${exId}-${setNum}`);
    if(btn.classList.contains('active')) {
        row.style.opacity = '0.5';
        
        // 기록 저장
        let saved = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
        if(!saved.includes(setNum)) saved.push(setNum);
        localStorage.setItem(`workout_${exId}`, JSON.stringify(saved));
        
        // 타이머 로직 분기
        const exName = document.querySelector(`#we-card-${exId} .we-name`).innerText;
        let restTime = 60; // 기본 1분
        
        if (setType === 'warmup') {
            restTime = 35; // 웜업 35초
        } else {
            // 대근육 복합 운동 키워드 (가슴, 등, 하체 메인)
            const largeMuscleKeywords = ['스쿼트', '벤치 프레스', '풀업', '로우', '랫풀다운', '레그 프레스', '데드리프트', '딥스', '힙 쓰러스트', '런지', '레그 익스텐션', '레그 컬'];
            
            // 어깨, 팔, 복근 등은 위 배열에 없으므로 기본 60초 적용
            if (largeMuscleKeywords.some(keyword => exName.includes(keyword))) {
                restTime = 90; // 대근육 본세트는 1분 30초
            } else {
                restTime = 60; // 소근육 본세트는 1분
            }
        }
        
        startGlobalTimer(restTime, exName);
    } else {
        row.style.opacity = '1';
        let saved = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
        saved = saved.filter(s => s !== setNum);
        localStorage.setItem(`workout_${exId}`, JSON.stringify(saved));
    }
};

function attachCommonEvents() {
    const modalOverlay = document.getElementById('common-modal-overlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) window.closeModal();
    });

    document.getElementById('gst-close').addEventListener('click', () => {
        clearInterval(window.globalTimerInterval);
        document.getElementById('global-timer-ui').style.display = 'none';
    });

    document.getElementById('btn-cw-prev').addEventListener('click', () => {
        if(window.cardioStepIdx > 0) { window.cardioStepIdx--; renderCardioStep(); }
    });
    document.getElementById('btn-cw-next').addEventListener('click', () => {
        if(window.cardioStepIdx < 4) { window.cardioStepIdx++; renderCardioStep(); } else { closeModal(); alert('유산소 설정이 저장되었습니다!'); }
    });

    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    if(btnSubmitFeedback) {
        btnSubmitFeedback.addEventListener('click', () => {
            closeModal();
            let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
            localStorage.setItem('completed_analysis_days', completedDays + 1);
            if (typeof switchView === 'function') switchView('view-summary'); 
        });
    }

    const btnCoachNext = document.getElementById('btn-coach-next');
    if(btnCoachNext) {
        btnCoachNext.addEventListener('click', () => {
            if(window.coachStepIdx < coachData.length - 1) {
                window.coachStepIdx++;
                renderCoachStep();
            } else {
                closeModal();
                if (typeof switchView === 'function') switchView('view-feedback'); 
            }
        });
    }
}

window.hideAllModals = function() {
    const overlay = document.getElementById('common-modal-overlay');
    if(overlay) overlay.querySelectorAll('.guide-modal, .alert-modal, .feedback-modal, .coach-modal, .bottom-sheet-modal, .full-bottom-sheet').forEach(m => m.classList.remove('active'));
};

window.openBottomSheet = function(type) {
    hideAllModals();
    document.getElementById('common-modal-overlay').classList.add('active');
    document.getElementById(`bs-${type}`).classList.add('active');
};

window.closeModal = function() {
    const overlay = document.getElementById('common-modal-overlay');
    if(overlay) overlay.classList.remove('active');
    hideAllModals();
};

const cardioSteps = [
    { title: '어떤 유산소 기구를<br>쓸 수 있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['트레드밀', '실내 사이클', '일립티컬', '로잉머신', '없음'] },
    { title: '불편한 부위가<br>있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['무릎·발목', '허리', '어깨·팔꿈치', '없음'] },
    { title: '유산소로 무엇을<br>얻고 싶나요?', sub: '', type: 'single', options: ['건강 유지', '심폐 체력', '체지방 감량'] },
    { title: '일주일에 몇 번<br>하실 건가요?', sub: '유산소는 근력 운동을 하는 날에 이어서 해요.', type: 'grid', options: [1,2,3,4,5,6,7], rec: 3 },
    { title: '한 번에 몇 분<br>하실 건가요?', sub: '', type: 'time', chips: ['걷기 (러닝머신)', '사이클링', '인클라인 걷기 (러닝머신)'] }
];

window.cardioStepIdx = 0;
window.currentCardioMins = 60;

window.startCardioWizard = function() {
    window.cardioStepIdx = 0;
    window.currentCardioMins = 60; 
    renderCardioStep();
    openBottomSheet('cardio-wizard');
};

window.renderCardioStep = function() {
    const data = cardioSteps[window.cardioStepIdx];
    document.getElementById('cw-step-text').innerText = `질문 ${window.cardioStepIdx+1}/5`;
    document.getElementById('cw-progress-fill').style.width = `${((window.cardioStepIdx+1)/5)*100}%`;

    let html = `<div class="cw-q-num" style="margin-top:20px;">질문 ${window.cardioStepIdx+1}</div><div class="cw-q-title">${data.title}</div><div class="cw-q-sub">${data.sub}</div>`;

    if (data.type === 'multi' || data.type === 'single') {
        html += `<div class="cw-options">`;
        data.options.forEach(opt => { html += `<div class="cw-opt-btn" onclick="toggleCardioOpt(this, '${data.type}')"><div class="cw-check"></div>${opt}</div>`; });
        html += `</div>`;
    } else if (data.type === 'grid') {
        html += `<div class="cw-grid">`;
        data.options.forEach(opt => {
            const isRec = opt === data.rec ? `<div class="cw-rec-badge">추천</div>` : '';
            html += `<div class="cw-grid-btn ${opt===data.rec?'active':''}" onclick="selectCardioGrid(this)">${isRec}<span class="cw-g-num">${opt}</span><span class="cw-g-sub">회/주</span></div>`;
        });
        html += `</div>`;
    } else if (data.type === 'time') {
        html += `<div class="cw-time-wrap"><div class="cw-t-chips">` + data.chips.map((c,i) => `<div class="cw-t-chip ${i===0?'active':''}" onclick="changeCardioType(this, '${c}')">${c}</div>`).join('') + `</div>`;
        html += `<div class="cw-time-box"><button class="cw-t-btn" onclick="changeCardioTime(-5)">-</button><div class="cw-t-val-box"><div class="cw-t-val" id="cw-time-val">${window.currentCardioMins}<span>분</span></div><div class="cw-t-badge">추천</div></div><button class="cw-t-btn" onclick="changeCardioTime(5)">+</button></div></div>`;
    }

    document.getElementById('cw-render-area').innerHTML = html;
    document.getElementById('btn-cw-prev').style.display = window.cardioStepIdx === 0 ? 'none' : 'block';
    document.getElementById('btn-cw-next').innerText = window.cardioStepIdx === 4 ? '유산소 저장하기' : '다음';
};

window.toggleCardioOpt = function(btn, type) {
    if (type === 'single') btn.parentElement.querySelectorAll('.cw-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.toggle('active');
};
window.selectCardioGrid = function(btn) {
    btn.parentElement.querySelectorAll('.cw-grid-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};
window.changeCardioType = function(btn, type) {
    btn.parentElement.querySelectorAll('.cw-t-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (type.includes('사이클링')) window.currentCardioMins = 35;
    else if (type.includes('인클라인')) window.currentCardioMins = 30;
    else window.currentCardioMins = 60;
    document.getElementById('cw-time-val').innerHTML = `${window.currentCardioMins}<span>분</span>`;
};
window.changeCardioTime = function(amount) {
    window.currentCardioMins += amount;
    if(window.currentCardioMins < 5) window.currentCardioMins = 5;
    document.getElementById('cw-time-val').innerHTML = `${window.currentCardioMins}<span>분</span>`;
};

window.globalTimerInterval = null;
window.startGlobalTimer = function(seconds, exName) {
    clearInterval(window.globalTimerInterval);
    let totalDuration = seconds;
    let targetEndTime = Date.now() + (seconds * 1000);
    const timerUi = document.getElementById('global-timer-ui');
    
    document.getElementById('gst-ex-name').innerText = exName;
    document.getElementById('gst-rest-text').innerText = `권장 휴식 시간 ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    document.getElementById('gst-time-display').innerText = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    document.getElementById('gst-progress').style.width = '100%';
    timerUi.style.display = 'flex'; 

    window.globalTimerInterval = setInterval(() => {
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(window.globalTimerInterval);
            document.getElementById('gst-time-display').innerText = "진행!";
            document.getElementById('gst-progress').style.width = '0%';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setTimeout(() => { timerUi.style.display = 'none'; }, 3000); 
        } else {
            document.getElementById('gst-time-display').innerText = `${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
            document.getElementById('gst-progress').style.width = `${(remaining/totalDuration)*100}%`;
        }
    }, 100);
};

window.checkFinishWorkout = function() {
    let completed = 0;
    window.currentRoutine.forEach(ex => completed += (JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || []).length);
    
    if (completed < window.totalGlobalSets) { 
        hideAllModals(); document.getElementById('common-modal-overlay').classList.add('active'); document.getElementById('modal-alert-incomplete').classList.add('active'); 
    } else { 
        hideAllModals(); document.getElementById('common-modal-overlay').classList.add('active'); document.getElementById('modal-daily-feedback').classList.add('active'); 
    }
};

window.forceEndWorkout = function() { 
    hideAllModals(); document.getElementById('common-modal-overlay').classList.add('active'); document.getElementById('modal-daily-feedback').classList.add('active'); 
};

window.selectFeedback = function(btn) {
    document.querySelectorAll('.fm-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('btn-submit-feedback').disabled = false;
};

const coachData = [
    { sub: '', title: '세 번째 운동을 완료했어요!', content: '<p class="coach-desc" style="color:#fff;">벌써 세 번째 운동을 완료하셨네요. 조금씩 운동 기록이 쌓이고 있어요.<br><br>지금처럼 각 세트에서 실제로 수행한 중량과 횟수를 그대로 기록해주세요.<br><br><span style="color:var(--primary); font-weight:bold;">다음 운동도 함께 이어가볼게요!</span></p>' }
];
window.coachStepIdx = 0;

window.startOverloadCoach = function() {
    window.coachStepIdx = 0;
    renderCoachStep();
    openBottomSheet('coach');
};

window.renderCoachStep = function() {
    const data = coachData[window.coachStepIdx];
    const subText = document.getElementById('coach-sub-text');
    if(data.sub) { subText.style.display = 'block'; subText.innerText = data.sub; } else { subText.style.display = 'none'; }
    document.getElementById('coach-title-text').innerText = data.title;
    document.getElementById('coach-content-area').innerHTML = data.content;
    
    let dotsHtml = '';
    for(let i=0; i<coachData.length; i++) {
        dotsHtml += `<div class="cdot ${i===window.coachStepIdx?'active':''}"></div>`;
    }
    document.getElementById('coach-dots-area').innerHTML = dotsHtml;
    document.getElementById('btn-coach-next').innerText = window.coachStepIdx === coachData.length - 1 ? '확인' : '다음';
};

const guideData = {
    rir: [
        {
            title: "1. RIR의 정의",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> RIR은 실패 지점까지 몇 회가 남았는지를 나타내는 지표입니다.</p>
                <div style="background:#222; padding:15px; border-radius:8px; font-size:0.9rem; color:#aaa; line-height:1.6;">
                    <div style="display:flex; margin-bottom:5px;"><span style="width:50px;">공식:</span> <span style="color:#fff;">RIR = 남은 횟수</span></div>
                    <div style="display:flex;"><span style="width:50px;">예시:</span> 
                        <div>물리적 한계가 10회일 때<br>
                        9회를 수행하면 → <span style="color:#00d2a0;">RIR 1</span><br>
                        8회를 수행하면 → <span style="color:#00d2a0;">RIR 2</span><br>
                        7회를 수행하면 → <span style="color:#00d2a0;">RIR 3</span></div>
                    </div>
                </div>
            `
        },
        {
            title: "2. 객관적 판단의 중요성",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 많은 분들이 엄살이나 귀찮음 때문에 자신의 <span style="color:#00d2a0; font-weight:bold;">진정한 한계</span>를 과소평가하여 RIR을 잘못 설정하곤 합니다.</p>
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;">본인은 RIR 2(2회 남음)라고 생각했지만, 실제로는 4회 이상 더 수행할 수 있는 경우가 많습니다.</p>
                <p style="color:#ddd; line-height:1.5;">따라서 주관적인 '힘듦'보다는 <span style="color:#00d2a0; font-weight:bold;">수행 속도</span> (Bar Speed)의 변화를 기준으로 객관적으로 판단해야 합니다.</p>
            `
        },
        {
            title: "3. 단계별 RIR 판단 기준",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 수행 속도, 즉 마지막 횟수를 수행할 때 걸리는 시간이 느려지는 구간으로 RIR을 가늠하세요.</p>
                <p style="color:#aaa; font-size:0.9rem; margin-bottom:15px; line-height:1.5;">예) 벤치 프레스 10RM을 수행할 때 첫 1-6회는 빠르지만, 마지막 7-10회는 많이 느려집니다. 이걸 '수행 속도가 느려졌다'라고 정의합니다.</p>
                <div style="background:#222; padding:15px; border-radius:8px; font-size:0.85rem; color:#ccc; line-height:1.6;">
                    <div style="margin-bottom:10px;"><strong style="color:#fff;">RIR 3 :</strong> 마지막 횟수의 속도가 <span style="color:#00d2a0;">느려지기 시작</span><br><span style="color:#888;">→ "힘들게 들어 올렸다"</span></div>
                    <div style="margin-bottom:10px;"><strong style="color:#fff;">RIR 2 :</strong> 마지막 횟수의 속도가 <span style="color:#00d2a0;">눈에 띄게 느려짐</span><br><span style="color:#888;">→ "꽤 힘들게 들어 올렸다"</span></div>
                    <div style="margin-bottom:10px;"><strong style="color:#fff;">RIR 1 :</strong> 마지막 횟수의 속도가 <span style="color:#00d2a0;">현저히 느려짐 (1~4초 소요)</span><br><span style="color:#888;">→ "간신히 들어 올렸다"</span></div>
                    <div><strong style="color:#fff;">RIR 0 :</strong> 마지막 횟수가 5~8초 이상 걸리거나, 얼굴이 빨개지며 온몸을 쥐어짜면서 간신히 들어 올린 <span style="color:var(--primary);">물리적 한계점</span><br><span style="color:#888; font-size:0.8rem;">누가 총을 겨누고 시켜도 추가 횟수 수행이 불가능하며, 고중량 하체 복합 운동 시 어지러움을 느낌</span><br><span style="color:#888;">→ "정말 간신히 들어 올렸다"</span></div>
                </div>
            `
        },
        {
            title: "4. RIR 정확도 높이기",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 초보자는 RIR을 정확히 예측하기 어렵습니다.</p>
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;">가끔은 의도적으로 실패 지점(RIR 0)까지 수행하여 내 진짜 한계가 어디인지 '영점 조절'을 해보세요.</p>
                <p style="color:#ddd; line-height:1.5;">이 경험이 쌓이면 RIR 예측 능력이 정교해집니다.</p>
            `
        }
    ],
    warmup: [
        {
            title: "1. 웜업이란?",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 웜업은 본 세트의 수행 능력을 높이기 위해 저중량으로 미리 연습하는 과정입니다.</p>
                <div style="background:#222; padding:15px; border-radius:8px; font-size:0.9rem; color:#aaa; line-height:1.8;">
                    • 근육과 관절에 혈류 공급<br>
                    • 근신경계 활성화<br>
                    • 퍼포먼스 향상 & 근성장 자극 극대화
                </div>
            `
        },
        {
            title: "2. RIR 기준",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 앱에서 추천하는 6회, 5회를 엄격하게 지킬 필요는 없습니다.</p>
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;">정확한 횟수보다 중요한 것은 '낮은 강도' 입니다.</p>
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;">낮은 강도란 동작 수행 속도가 느려지지 않는 상태를 의미합니다. 즉, 속도가 줄어들지 않고 빠르게 수행할 수 있는 구간에서 세트를 마치세요.</p>
                <div style="background:#222; padding:15px; border-radius:8px; font-size:0.85rem; color:#ccc; line-height:1.6; display:flex;">
                    <span style="width:40px; color:#fff;">예시:</span>
                    <div>바벨 벤치 프레스 10RM 수행 시,<br>1~6회까지는 빠르지만 7회부터는 속도가 느려집니다.<br>웜업 세트는 속도가 느려지기 전인 4~6회 정도에서 멈추면 됩니다.</div>
                </div>
            `
        },
        {
            title: "3. 생략 가능",
            content: `
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;"><span style="color:var(--primary); font-size:1.2rem;">✦</span> 이미 다른 운동으로 몸이 충분히 풀려 있거나 해당 동작이 완전히 익숙하다면,</p>
                <p style="color:#ddd; margin-bottom:15px; line-height:1.5;">웜업 세트의 일부 또는 전부를 생략해도 괜찮습니다.</p>
                <p style="color:#ddd; line-height:1.5;">모든 웜업 세트를 꼭 수행해야 한다는 강박을 가지지 않아도 됩니다.</p>
            `
        }
    ]
};

window.currentGuideType = '';
window.currentGuideIdx = 0;

window.openGuideModal = function(type) {
    if(type === 'rir' || type === 'warmup') {
        window.currentGuideType = type;
        window.currentGuideIdx = 0;
        const badge = document.getElementById('modal-badge-title');
        if(badge) badge.innerText = type === 'rir' ? 'RIR 가이드' : '웜업 가이드';
        renderGuideStep();
        hideAllModals();
        document.getElementById('common-modal-overlay').classList.add('active');
        document.getElementById('modal-guide').classList.add('active');
    }
};

window.renderGuideStep = function() {
    const dataList = guideData[window.currentGuideType];
    if(!dataList) return;
    const stepData = dataList[window.currentGuideIdx];
    let html = `<div style="color:#fff; font-size:0.85rem; margin-bottom:10px;">${window.currentGuideType === 'rir' ? 'RIR(Reps In Reserve) 가이드' : ''}</div><h2 style="color:#fff; font-size:1.3rem; margin-bottom:20px; font-weight:bold;">${stepData.title}</h2><div>${stepData.content}</div>`;
    document.getElementById('modal-content-area').innerHTML = html;
    
    const btnPrev = document.getElementById('modal-btn-prev');
    const btnNext = document.getElementById('modal-btn-next');
    if(window.currentGuideIdx === 0) { btnPrev.style.visibility = 'hidden'; } else { btnPrev.style.visibility = 'visible'; }
    if(window.currentGuideIdx === dataList.length - 1) { btnNext.innerText = '확인'; } else { btnNext.innerText = '다음'; }
    
    btnPrev.onclick = function() { if(window.currentGuideIdx > 0) { window.currentGuideIdx--; renderGuideStep(); } };
    btnNext.onclick = function() { if(window.currentGuideIdx < dataList.length - 1) { window.currentGuideIdx++; renderGuideStep(); } else { closeModal(); } };
};
window.openModal = window.openGuideModal;
// ==========================================
// 6. 운동 화면 강제 종료 (뒤로가기) 로직
// ==========================================
window.forceExitWorkout = function() {
    if (confirm("진행 중인 운동 기록은 저장되지 않습니다. 운동을 취소하고 메인 화면으로 돌아가시겠습니까?")) {
        // 타이머 및 모달 강제 종료
        clearInterval(window.globalTimerInterval);
        document.getElementById('global-timer-ui').style.display = 'none';
        hideAllModals();

        // 운동 화면 숨기기
        const workoutView = document.getElementById('view-workout');
        if (workoutView) {
            workoutView.classList.remove('active');
            workoutView.style.display = 'none';
        }
        
        // 메인 홈 화면(view-summary) 표시
        const summaryView = document.getElementById('view-summary');
        if (summaryView) {
            summaryView.classList.add('active');
            summaryView.style.display = 'block';
        }
        
        // 하단 네비게이션 바 복구
        const mainNav = document.getElementById('main-nav');
        if (mainNav) mainNav.style.display = 'flex';
        
        window.scrollTo(0, 0);
    }
};
// ==========================================
// 7. 운동 요약 화면 동적 렌더링 로직 (실제 데이터 연동)
// ==========================================
window.generateWorkoutSummary = function() {
    // 실제 완료 날짜 가져오기
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${month}월 ${day}일`;
    
    let totalExercises = 0;
    let totalSets = 0;
    let html = '';
    
    // 피드백 데이터 (사용자가 누른 평가 문구)
    const feedbackBtn = document.querySelector('.fm-opt-btn.active');
    const feedbackText = feedbackBtn ? feedbackBtn.innerText : "무리없이 해냈고, 강도가 딱 알맞았어요!";
    
    // 사용자가 방금 수행한 운동 루틴 순회하며 실제 기록된 중량/횟수 추출
    window.currentRoutine.forEach(ex => {
        const saved = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        if(saved.length > 0) {
            totalExercises++;
            totalSets += saved.length;
            
            html += `
            <div style="background:#1a1a1a; border-radius:10px; padding:20px; margin-bottom:15px; border:1px solid #333;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="color:#fff; font-weight:bold;">${ex.name}</div>
                    <div style="color:#888; font-size:0.85rem;">${saved.length}세트</div>
                </div>
                <div style="display:flex; gap:15px; align-items:center;">
                    <div style="display:flex; flex-direction:column; gap:8px; flex:1;">
                        <div style="display:flex; gap:10px; color:#aaa; font-size:0.85rem;">
                            <span style="width:60px;">중량 (kg)</span>
            `;
            
            let weightsHtml = '';
            let repsHtml = '';
            
            // 각 세트별로 입력한 input 값을 DOM에서 직접 긁어오기
            saved.forEach(setNum => {
                const row = document.getElementById(`row-${ex.id}-${setNum}`);
                if (row) {
                    const inputs = row.querySelectorAll('input');
                    const w = inputs[0].value || inputs[0].placeholder || '-';
                    const r = inputs[1].value || inputs[1].placeholder || '-';
                    weightsHtml += `<span style="color:#fff; font-weight:bold; min-width:25px; text-align:center;">${w}</span>`;
                    repsHtml += `<span style="color:#fff; font-weight:bold; min-width:25px; text-align:center;">${r}</span>`;
                }
            });
            
            html += `${weightsHtml}</div>
                        <div style="display:flex; gap:10px; color:#aaa; font-size:0.85rem;">
                            <span style="width:60px;">횟수 (회)</span>
                            ${repsHtml}
                        </div>
                    </div>
                    <div style="width:40px; height:40px; background:#222; border-radius:8px; display:flex; justify-content:center; align-items:center; border:1px solid #444;">
                        <span style="color:#666; font-size:1.2rem;">✓</span>
                    </div>
                </div>
            </div>`;
        }
    });
    
    // 요약 화면 전체 조립
    const summaryHtml = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:15px;">
            <h2 style="color:#fff; font-size:1.5rem; font-weight:bold;">${dateStr}</h2>
            <span style="color:#888; font-size:0.85rem;">${totalExercises}개 운동 · ${totalSets}세트</span>
        </div>
        <div style="background:rgba(229, 9, 20, 0.1); color:var(--primary, #E50914); padding:15px; border-radius:8px; font-size:0.9rem; font-weight:bold; margin-bottom:30px;">
            ${feedbackText}
        </div>
        ${html}
    `;
    
    const renderArea = document.getElementById('summary-render-area');
    if(renderArea) renderArea.innerHTML = summaryHtml;
};

// 피드백 '제출' 버튼 클릭 시 위 함수가 동작하도록 이벤트 업데이트
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
        if(btnSubmitFeedback) {
            // 기존 이벤트를 덮어쓰기 위해 cloneNode 사용
            const newBtn = btnSubmitFeedback.cloneNode(true);
            btnSubmitFeedback.parentNode.replaceChild(newBtn, btnSubmitFeedback);
            
            newBtn.addEventListener('click', () => {
                closeModal();
                let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
                localStorage.setItem('completed_analysis_days', completedDays + 1);
                
                // 화면 넘어가기 전에 동적 요약 화면 생성!
                generateWorkoutSummary();
                
                if (typeof switchView === 'function') switchView('view-summary'); 
            });
        }
    }, 1000); // UI 주입 대기
});
