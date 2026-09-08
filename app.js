// ==========================================
// 1. Firebase 전역 초기화
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 전역 상태 변수
window.currentRoutine = [];
window.totalGlobalSets = 0;

// ==========================================
// 2. DOM 로드 시 공통 UI(네비게이션, 팝업) 자동 주입
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

            <div class="full-bottom-sheet" id="bs-cardio-wizard">
                <div class="bs-header" style="border-bottom:none;"><button class="icon-btn" onclick="closeModal()">✕</button><span class="bs-title">유산소 설정</span><div style="width:24px;"></div></div>
                <div class="cw-progress-area" style="padding: 0 20px 10px;"><div class="cw-p-text"><span id="cw-step-text">질문 1/5</span><span>유산소 처방 준비</span></div><div class="cw-p-bar"><div class="cw-p-fill" id="cw-progress-fill" style="width:20%;"></div></div></div>
                <div id="cw-render-area" style="flex:1; overflow-y:auto; padding-bottom:100px;"></div>
                <div class="cw-footer" style="position:absolute;"><div class="cw-footer-inner"><button class="secondary-btn" id="btn-cw-prev">이전</button><button class="primary-btn" id="btn-cw-next">다음</button></div></div>
            </div>

            <div class="full-bottom-sheet" id="bs-memo" style="height: 85vh; background: #000;">
                <div class="bs-header" style="border-bottom: none; padding-bottom:0;"><span style="width:24px;"></span><span class="bs-title"></span><span class="modal-close" onclick="closeModal()">✕</span></div>
                <div class="bs-content" id="bs-memo-content" style="padding-top:10px; overflow-y:auto; padding-bottom:40px;"></div>
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
                <div class="coach-header"><span class="coach-badge" id="coach-badge-text">과부하 코치</span><div style="font-size: 0.8rem; color: #888; margin-bottom: 5px;" id="coach-sub-text"></div><h2 class="coach-title" id="coach-title-text">첫 번째 운동을 완료했어요!</h2><div style="color:var(--primary); font-size:1.5rem; margin-bottom:10px;">✦</div></div>
                <div class="coach-content" id="coach-content-area"></div>
                <div class="coach-footer"><div class="coach-dots" id="coach-dots-area"></div><button class="primary-btn" id="btn-coach-next" style="width: 100%;">다음</button></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', timerHtml);
    document.body.insertAdjacentHTML('beforeend', navHtml);
    document.body.insertAdjacentHTML('beforeend', modalsHtml);

    attachCommonEvents();
    if(typeof initWorkoutData === 'function') initWorkoutData(); 
});

// ==========================================
// 3. 공통 팝업 및 이벤트 제어 로직
// ==========================================
function attachCommonEvents() {
    const modalOverlay = document.getElementById('common-modal-overlay');
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) window.closeModal();
    });

    document.getElementById('gst-close').addEventListener('click', () => {
        clearInterval(window.globalTimerInterval);
        document.getElementById('global-timer-ui').style.display = 'none';
    });
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

// ==========================================
// 4. 운동 가이드 & 메모 데이터베이스 (신규 가이드 추가 반영)
// ==========================================
const exerciseGuideDB = {
    'day2_ex1': { // 오버헤드 프레스
        badge: '어깨(전/측면) 복합', vid: null,
        guide: '바벨을 쇄골 위쪽 또는 어깨 앞쪽에 올린 상태에서 시작하고, 손목은 과하게 꺾이지 않게 세웁니다. 복부와 엉덩이에 힘을 주어 몸통을 단단히 고정하고, 허리가 뒤로 젖혀지지 않게 합니다. 바를 밀어 올릴 때는 얼굴을 살짝 뒤로 빼 바가 수직에 가깝게 올라가도록 만들고, 바가 이마를 지나면 머리를 다시 앞으로 넣습니다. 위쪽에서는 팔을 뻗되 어깨를 과하게 으쓱하지 말고, 전신이 일직선에 가깝게 정렬되도록 합니다. 내려올 때는 바를 통제하면서 다시 쇄골 위쪽으로 천천히 가져옵니다.'
    },
    'day2_ex2': { // 바벨 프리처 컬
        badge: '이두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
        guide: '프리처 벤치에 상완을 패드에 고정하고, 바벨이나 EZ바를 잡은 상태에서 시작합니다. 팔꿈치가 패드에서 뜨지 않게 유지하고, 하단에서 팔을 과하게 잠그지 않도록 주의합니다. 바를 올릴 때는 몸을 뒤로 젖히거나 어깨를 들어 올리지 말고, 이두근으로 팔꿈치를 접어 들어 올립니다. 상단에서는 완전히 말아 올려 긴장이 빠지는 지점까지 가지 말고, 이두에 힘이 남아 있는 위치에서 멈추는 것이 좋습니다. 내려올 때는 바벨이 갑자기 떨어지지 않게 천천히 버티며 이두를 늘립니다.'
    },
    'day2_ex3': { // 원암 덤벨/케이블 익스텐션
        badge: '삼두근 고립', vid: null,
        guide: '한 팔씩 덤벨이나 케이블을 사용해 팔꿈치를 펴는 운동입니다. 덤벨로 할 경우 머리 위에서 수행하면 삼두 장두가 길게 늘어나고, 케이블로 할 경우 장력이 일정하게 유지되는 장점이 있습니다. 시작 자세에서 팔꿈치를 충분히 접어 삼두가 늘어나게 하고, 팔꿈치 위치가 흔들리지 않게 고정합니다. 올릴 때는 어깨로 밀지 말고 팔꿈치를 펴며 삼두를 수축합니다. 한 팔씩 수행하므로 무게를 욕심내기보다 팔꿈치가 편한 궤적과 좌우 균형을 우선합니다.'
    },
    'day2_ex4': { // 바벨 바이셉 컬
        badge: '이두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
        guide: '바벨을 어깨너비 정도로 잡고, 가슴을 세운 상태에서 똑바로 섭니다. 팔꿈치는 몸통 옆에 고정하고, 바를 들어 올릴 때 몸을 뒤로 젖히거나 엉덩이 반동을 쓰지 않습니다. 손목은 과하게 꺾이지 않게 중립에 가깝게 유지하고, 팔꿈치를 접으며 바벨을 위로 올립니다. 상단에서는 이두를 강하게 수축하되, 팔꿈치가 앞으로 너무 많이 나가 긴장이 빠지지 않게 합니다. 내려올 때는 팔을 거의 다 펴면서도 무게를 놓지 않고 천천히 컨트롤합니다.'
    },
    'day2_ex5': { // 케이블 트라이셉 푸시다운
        badge: '삼두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif',
        guide: '케이블을 높은 위치에 세팅하고, 바나 로프를 잡은 뒤 팔꿈치를 몸통 옆에 고정합니다. 시작 자세에서 팔꿈치가 접혀 삼두가 약간 늘어난 상태를 만들고, 손잡이를 아래로 밀어 팔을 펴줍니다. 하단에서는 팔꿈치를 완전히 펴며 삼두를 수축하고, 로프를 사용할 경우 끝에서 살짝 바깥으로 벌려 수축감을 더할 수 있습니다. 올라올 때는 무게에 끌려 팔꿈치가 앞으로 올라가지 않도록 천천히 버팁니다. 상체를 과하게 숙이거나 어깨로 누르면 삼두보다 몸통 반동이 커질 수 있습니다.'
    },
    'day2_ex6': { // 리버스 펙덱
        badge: '어깨 후면 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
        guide: '가슴을 패드에 붙이고 앉아 손잡이가 어깨 높이 정도에 오도록 시트 높이를 조절합니다. 팔꿈치는 살짝 굽힌 상태에서 손잡이를 잡고, 어깨가 앞으로 말리지 않게 가슴을 패드에 안정적으로 고정합니다. 손잡이를 뒤로 벌릴 때는 견갑골을 과하게 모으기보다, 후면 어깨로 팔을 바깥쪽으로 벌린다는 느낌으로 수행합니다. 끝 지점에서 잠깐 수축을 느낀 뒤, 무게가 떨어지지 않게 천천히 앞으로 돌아옵니다. 무게가 너무 무거우면 승모근이나 등으로 당기기 쉬우므로, 컨트롤 가능한 중량을 사용합니다.'
    },
    'day2_ex7': { // 덤벨 레터럴 레이즈
        badge: '어깨(전/측면) 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif',
        guide: '양손에 덤벨을 들고 서서 시작하며, 무릎은 살짝 풀고 몸통은 안정적으로 세웁니다. 팔꿈치를 약간 굽힌 상태로 유지한 채 양팔을 옆으로 들어 올리고, 손목은 자연스럽게 유지합니다. 덤벨은 중력 때문에 하단에서 긴장이 상대적으로 약해질 수 있으므로, 시작할 때 몸통 옆 완전 이완보다 약간 긴장이 남는 위치에서 시작해도 좋습니다. 올릴 때는 어깨를 으쓱하지 말고 팔꿈치를 옆으로 넓게 보낸다는 느낌으로 수행하며, 보통 어깨 높이 전후까지 들어 올리면 충분합니다. 상체를 흔들며 치팅하기보다, 가벼운 중량으로 정확한 반복을 쌓는 것이 측면 삼각근 발달에 더 유리합니다.'
    }
};

window.openMemoModal = function(exId, exName) {
    const dbData = exerciseGuideDB[exId] || { badge: '전신', guide: '운동을 정확한 자세로 수행하세요.' };
    const savedMemo = localStorage.getItem(`memo_${exId}`) || '';
    
    const vidHtml = dbData.vid ? `<div class="bs-memo-vid"><img src="${dbData.vid}"></div>` : '';

    const html = `
        <div class="bs-memo-header-wrap">
            ${vidHtml}
            <div class="bs-memo-title-wrap">
                <div class="bs-memo-title">${exName}</div>
                <div class="bs-memo-badge">${dbData.badge}</div>
            </div>
        </div>
        
        <div class="bs-memo-section">
            <span class="bs-memo-sec-badge">메모</span>
            <textarea class="bs-memo-textarea" id="memo-input-${exId}" placeholder="이 운동에 대해 기억해 둘 것을 적어보세요">${savedMemo}</textarea>
        </div>

        <div class="bs-memo-section" style="border-color:#333;">
            <span class="bs-memo-sec-badge grey">수행 가이드</span>
            <div class="bs-guide-text">${dbData.guide}</div>
        </div>
    `;

    document.getElementById('bs-memo-content').innerHTML = html;
    
    document.getElementById(`memo-input-${exId}`).addEventListener('input', function() {
        localStorage.setItem(`memo_${exId}`, this.value);
    });

    openBottomSheet('memo');
};

// ==========================================
// 5. Day 2 훈련 리스트 및 렌더링 (팔 운동 타이머 60초 반영)
// ==========================================
function initWorkoutData() {
    window.currentRoutine = [
        { id: 'day2_ex1', name: '오버헤드 프레스', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight', rest: 90, sets: [{type:'warmup',rir:6,weight:'저중량',reps:6},{type:'warmup',rir:5,weight:'중간중량',reps:5},{type:'top',rir:1,weight:'고중량',reps:'4-7'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex2', name: '바벨 프리처 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight', rest: 60, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex3', name: '원암 덤벨/케이블 익스텐션', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight', hasLR: true, rest: 60, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex4', name: '바벨 바이셉 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight', rest: 60, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'고중량',reps:'4-7'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex5', name: '케이블 트라이셉 푸시다운', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight', rest: 60, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'고중량',reps:'4-7'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex6', name: '리버스 펙덱', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', type: 'weight', rest: 90, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex7', name: '덤벨 레터럴 레이즈', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight', rest: 90, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] }
    ];

    window.totalGlobalSets = 0;
    window.currentRoutine.forEach(ex => { window.totalGlobalSets += ex.hasLR ? ex.sets.length * 2 : ex.sets.length; });

    const todayCount = document.getElementById('home-today-count');
    const todaySets = document.getElementById('home-today-sets');
    if(todayCount) todayCount.innerText = `${window.currentRoutine.length}개 운동`;
    if(todaySets) todaySets.innerText = `${window.totalGlobalSets}세트`;
}

window.renderWorkoutList = function() {
    const listContainer = document.getElementById('workout-exercise-list');
    if(!listContainer) return;
    let html = '';

    window.currentRoutine.forEach((ex, index) => {
        const totalSets = ex.hasLR ? ex.sets.length * 2 : ex.sets.length;
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        const completedCount = savedData.length;
        const badgeColor = completedCount === totalSets ? '#E50914' : '#222';
        const badgeTextColor = completedCount === totalSets ? '#fff' : '#aaa';
        
        let toggleHtml = `<div class="toggle-switch-group"><div class="toggle-item active">kg</div><div class="toggle-item">lbs</div></div>`;
        let lrToggleHtml = ex.hasLR ? `<div style="display:flex; justify-content:center; margin-bottom:15px;"><div class="toggle-switch-group" style="background:#333; padding:4px; border-radius:20px;"><div class="toggle-item active" style="padding:6px 20px;" onclick="switchArm(this, 'R', '${ex.id}', ${index})">오른쪽</div><div class="toggle-item" style="padding:6px 20px;" onclick="switchArm(this, 'L', '${ex.id}', ${index})">왼쪽</div></div></div>` : '';
        const formHeader = `<div class="set-header-row"><span>중량 (kg)</span><span>횟수</span></div>`;

        let setsHtml = '';
        let lastType = '';
        
        ex.sets.forEach((set, sIdx) => {
            if (lastType !== set.type) {
                if (setsHtml !== '') setsHtml += `</div>`; 
                const badgeText = set.type === 'warmup' ? '웜업 세트' : (set.type === 'top' ? '탑 세트' : '본 세트');
                setsHtml += `<div class="set-group"><div class="set-badge">${badgeText}</div>${formHeader}`;
                lastType = set.type;
            }
            const defaultSetId = `${set.type}_${sIdx}`;
            const isChecked = savedData.includes(defaultSetId) ? 'completed' : '';
            // 웜업은 35초 고정, 탑/본 세트는 각 운동의 권장 휴식시간(rest) 적용
            const setTimer = set.type === 'warmup' ? 35 : ex.rest; 
            
            setsHtml += `
            <div class="set-row">
                <div class="set-label">${set.rir} RIR</div>
                <div class="set-input-box">
                    <input type="text" class="set-input" placeholder="${set.weight}">
                    <input type="text" class="set-input" placeholder="${set.reps}">
                </div>
                <div class="set-check ${isChecked}" data-id="${defaultSetId}" data-time="${setTimer}" data-ex="${ex.name}">✓</div>
            </div>`;
        });
        setsHtml += `</div>`;

        html += `
            <div class="ex-row" id="ex-row-${index}">
                <div class="ex-header" onclick="toggleAccordion(${index})">
                    <div class="ex-thumb"><img src="${ex.img}"></div>
                    <div class="ex-info">
                        <div class="ex-name">${ex.name}</div>
                        <div class="ex-progress-badge" id="badge-${index}" style="background:${badgeColor}; color:${badgeTextColor};">${completedCount} / ${totalSets} 완료</div>
                    </div>
                    <div class="ex-drag-icon">⋮⋮</div>
                </div>
                <div class="ex-details">
                    <div class="ex-detail-img"><img src="${ex.img}"><button class="btn-memo" onclick="openMemoModal('${ex.id}', '${ex.name}'); event.stopPropagation();">메모</button></div>
                    <div class="ex-tools"><button class="btn-superset">+ 슈퍼세트</button>${toggleHtml}</div>
                    ${lrToggleHtml}
                    <div id="sets-container-${index}">${setsHtml}</div>
                    <div class="set-add-btns"><button>+ 세트 추가</button><button>- 세트 삭제</button></div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html + `<div style="height:20px;"></div><div style="width:100%; display:flex; justify-content:center;"><button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom:20px; width:100%; max-width:600px;">운동 완료</button></div>`;

    document.querySelectorAll('.set-check').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('completed');
            const exIndex = this.closest('.ex-row').id.split('-')[2];
            const exData = window.currentRoutine[exIndex];
            
            let setId = this.getAttribute('data-id');
            if (exData.hasLR && !setId.startsWith('R_') && !setId.startsWith('L_')) {
                setId = `R_${setId}`;
                this.setAttribute('data-id', setId);
            }

            let savedData = JSON.parse(localStorage.getItem(`workout_${exData.id}`)) || [];

            if (this.classList.contains('completed')) {
                if (!savedData.includes(setId)) savedData.push(setId);
                startGlobalTimer(parseInt(this.getAttribute('data-time')), this.getAttribute('data-ex'));
            } else { 
                savedData = savedData.filter(id => id !== setId); 
            }
            
            localStorage.setItem(`workout_${exData.id}`, JSON.stringify(savedData));
            
            const totalSets = exData.hasLR ? exData.sets.length * 2 : exData.sets.length;
            const badge = document.getElementById(`badge-${exIndex}`);
            badge.innerText = `${savedData.length} / ${totalSets} 완료`;
            badge.style.background = savedData.length === totalSets ? '#E50914' : '#222';
            badge.style.color = savedData.length === totalSets ? '#fff' : '#aaa';
        });
    });
};

window.toggleAccordion = function(index) { document.getElementById(`ex-row-${index}`).classList.toggle('expanded'); };

window.switchArm = function(btn, side, exId, index) {
    btn.parentElement.querySelectorAll('.toggle-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const savedData = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
    const container = document.getElementById(`sets-container-${index}`);
    const checks = container.querySelectorAll('.set-check');
    
    checks.forEach((check) => {
        const baseId = check.getAttribute('data-id').replace(/^[RL]_/, '');
        const newId = `${side}_${baseId}`;
        check.setAttribute('data-id', newId);
        
        if (savedData.includes(newId)) {
            check.classList.add('completed');
        } else {
            check.classList.remove('completed');
        }
    });
};


// ==========================================
// 6. 타이머 및 피드백 모달
// ==========================================
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
