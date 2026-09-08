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
    initWorkoutData(); // [신규] 훈련 데이터 초기화
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

    document.getElementById('btn-cw-prev').addEventListener('click', () => {
        if(window.cardioStepIdx > 0) { window.cardioStepIdx--; renderCardioStep(); }
    });
    document.getElementById('btn-cw-next').addEventListener('click', () => {
        if(window.cardioStepIdx < 4) { 
            window.cardioStepIdx++; renderCardioStep(); 
        } else { 
            closeModal(); alert('유산소 설정이 저장되었습니다!'); 
        }
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
// [신규] 4. Day 2 훈련 리스트 데이터베이스 초기화
// ==========================================
function initWorkoutData() {
    window.currentRoutine = [
        { 
            id: 'day2_ex1', name: '오버헤드 프레스', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '저중량', reps: 6 },
                { type: 'warmup', rir: 5, weight: '중간중량', reps: 5 },
                { type: 'top', rir: 1, weight: '고중량', reps: '4-7' },
                { type: 'main', rir: 1, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 1, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 1, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex2', name: '바벨 프리처 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex3', name: '원암 덤벨/케이블 익스텐션', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight', hasLR: true,
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex4', name: '바벨 바이셉 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '고중량', reps: '4-7' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex5', name: '케이블 트라이셉 푸시다운', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '고중량', reps: '4-7' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex6', name: '리버스 펙덱', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        },
        { 
            id: 'day2_ex7', name: '덤벨 레터럴 레이즈', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight',
            sets: [
                { type: 'warmup', rir: 6, weight: '중간중량', reps: 6 },
                { type: 'top', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' },
                { type: 'main', rir: 0, weight: '중간중량', reps: '8-12' }
            ]
        }
    ];

    // 전체 세트 수 계산 (좌우 토글이 있는 경우 2배 처리)
    window.totalGlobalSets = 0;
    window.currentRoutine.forEach(ex => {
        window.totalGlobalSets += ex.hasLR ? ex.sets.length * 2 : ex.sets.length;
    });

    // 홈 화면 상단 통계 업데이트
    const todayCount = document.getElementById('home-today-count');
    const todaySets = document.getElementById('home-today-sets');
    const todayDay = document.getElementById('home-today-day');
    const workoutTopTitle = document.getElementById('workout-top-title'); // 훈련화면 타이틀

    if(todayCount) todayCount.innerText = `${window.currentRoutine.length}개 운동`;
    if(todaySets) todaySets.innerText = `${window.totalGlobalSets}세트`;
    if(todayDay) todayDay.innerText = `Day 2`;
    if(workoutTopTitle) workoutTopTitle.innerText = `Day 2`;
}

// ==========================================
// [신규] 5. Day 2 훈련 렌더링 로직 (좌우 토글 대응)
// ==========================================
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
        
        // [특화] 좌우 분리 운동의 경우 토글 추가
        let lrToggleHtml = '';
        if (ex.hasLR) {
            lrToggleHtml = `
            <div style="display:flex; justify-content:center; margin-bottom:15px;">
                <div class="toggle-switch-group" style="background:#333; padding:4px; border-radius:20px;">
                    <div class="toggle-item active" style="padding:6px 20px;" onclick="switchArm(this, 'R', '${ex.id}', ${index})">오른쪽</div>
                    <div class="toggle-item" style="padding:6px 20px;" onclick="switchArm(this, 'L', '${ex.id}', ${index})">왼쪽</div>
                </div>
            </div>`;
        }

        const formHeader = `<div class="set-header-row"><span>중량 (kg)</span><span>횟수</span></div>`;

        let setsHtml = '';
        let lastType = '';
        
        ex.sets.forEach((set, sIdx) => {
            if (lastType !== set.type) {
                if (setsHtml !== '') setsHtml += `</div>`; // 이전 그룹 닫기
                const badgeText = set.type === 'warmup' ? '웜업 세트' : (set.type === 'top' ? '탑 세트' : '본 세트');
                setsHtml += `<div class="set-group"><div class="set-badge">${badgeText}</div>${formHeader}`;
                lastType = set.type;
            }

            // 좌우 분리의 경우 데이터 ID를 다르게 설정
            const defaultSetId = `${set.type}_${sIdx}`;
            const isChecked = savedData.includes(defaultSetId) ? 'completed' : '';
            
            setsHtml += `
            <div class="set-row">
                <div class="set-label">${set.rir} RIR</div>
                <div class="set-input-box">
                    <input type="text" class="set-input" placeholder="${set.weight}">
                    <input type="text" class="set-input" placeholder="${set.reps}">
                </div>
                <div class="set-check ${isChecked}" data-id="${defaultSetId}" data-time="${set.type==='warmup'?35:90}" data-ex="${ex.name}">✓</div>
            </div>`;
        });
        setsHtml += `</div>`; // 마지막 그룹 닫기

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
                    <div class="ex-detail-img"><img src="${ex.img}"><button class="btn-memo">메모</button></div>
                    <div class="ex-tools"><button class="btn-superset">+ 슈퍼세트</button>${toggleHtml}</div>
                    ${lrToggleHtml}
                    <div id="sets-container-${index}">${setsHtml}</div>
                    <div class="set-add-btns"><button>+ 세트 추가</button><button>- 세트 삭제</button></div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html + `<div style="height:20px;"></div><div style="width:100%; display:flex; justify-content:center;"><button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom:20px; width:100%; max-width:600px;">운동 완료</button></div>`;

    bindCheckEvents();
}

window.toggleAccordion = function(index) { document.getElementById(`ex-row-${index}`).classList.toggle('expanded'); };

// 좌우 팔 토글 전환 시 체크박스 상태 리렌더링
window.switchArm = function(btn, side, exId, index) {
    btn.parentElement.querySelectorAll('.toggle-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const exData = window.currentRoutine[index];
    const savedData = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
    
    const container = document.getElementById(`sets-container-${index}`);
    const checks = container.querySelectorAll('.set-check');
    
    checks.forEach((check, sIdx) => {
        // 기존 ID의 앞부분(R_, L_)을 교체하여 새로운 ID 생성
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

function bindCheckEvents() {
    document.querySelectorAll('.set-check').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('completed');
            const exIndex = this.closest('.ex-row').id.split('-')[2];
            const exData = window.currentRoutine[exIndex];
            
            // 좌우 분리 운동의 경우 현재 선택된 탭의 상태를 확인
            let setId = this.getAttribute('data-id');
            if (exData.hasLR && !setId.startsWith('R_') && !setId.startsWith('L_')) {
                // 최초 렌더링 시에는 'R_' (오른쪽)를 기본값으로 부여
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
}


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
document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById('btn-submit-feedback');
    if(submitBtn) {
        submitBtn.addEventListener('click', () => {
            closeModal();
            location.href = 'feedback.html'; // 피드백 화면으로 전환 가정
        });
    }
});


// ==========================================
// 7. 유산소 마법사 로직
// ==========================================
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

    let html = `<div class="cw-q-num" style="margin-top:20px;">질문 ${window.cardioStepIdx+1}</div>`;
    html += `<div class="cw-q-title">${data.title}</div><div class="cw-q-sub">${data.sub}</div>`;

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
