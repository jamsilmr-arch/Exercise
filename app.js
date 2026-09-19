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
// 2. 운동 DB (전역 사용을 위해 app.js로 이동)
// ==========================================
const textPresets = {
    full: ['스쿼트', '벤치 프레스', '풀업', '오버헤드 프레스', '바벨 로우', '사이드 레터럴', '바벨 컬', '삼두 푸시다운'], 
    upper: ['벤치 프레스', '풀업', '오버헤드 프레스', '바벨 로우', '인클라인 프레스', '랫풀다운', '사이드 레터럴', '바벨 컬'], 
    lower: ['스쿼트', '루마니안 데드', '레그 프레스', '레그 컬', '카프 레이즈', '레그 익스텐션', '힙 쓰러스트', '이너 타이'], 
    push: ['벤치 프레스', '오버헤드 프레스', '인클라인 프레스', '삼두 푸시다운', '펙덱 플라이', '사이드 레터럴', '딥스', '프론트 레이즈'], 
    pull: ['풀업', '바벨 로우', '랫풀다운', '바벨 컬', '시티드 로우', '페이스 풀', '해머 컬', '리어 델트'], 
    core: ['벤치 프레스', '풀업', '바벨 로우', '펙덱 플라이', '인클라인 프레스', '랫풀다운', '시티드 로우', '풀오버'], 
    limb: ['오버헤드 프레스', '사이드 레터럴', '바벨 컬', '삼두 푸시다운', '프론트 레이즈', '해머 컬', '케이블 푸시다운', '리버스 펙덱'],
    glutes: ['스쿼트', '힙 쓰러스트', '런지', '루마니안 데드', '힙 어브덕션', '킥백', '와이드 스쿼트', '브이 스쿼트'],
    w_upper: ['랫풀다운', '시티드 로우', '숄더 프레스', '사이드 레터럴', '푸시업', '페이스 풀', '암 컬', '트라이셉 익스텐션']
};

const routineDB = {
    'rt_2_full': { title: '주 2회 무분할 루틴', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.full }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 3 } ] },
    'rt_3_hybrid': { title: '주 3회 (상체-하체-전신) 루틴', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.lower }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 1 } ] },
    'rt_3_full': { title: '주 3회 무분할 (전신-전신-전신)', timeline: [ { type: 'workout', label: 'Day 1', count: 8, texts: textPresets.full }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 8, texts: textPresets.full }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 1 } ] },
    'rt_4_hybrid': { title: '주 4회 (밀기-당기기-하체-전신)', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.lower }, { type: 'workout', label: 'Day 4', count: 7, texts: textPresets.full }, { type: 'rest', days: 2 } ] },
    'rt_4_split': { title: '주 4회 (상체-하체-상체-하체)', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2a', count: 5, texts: textPresets.lower }, { type: 'rest', days: 2 } ] },
    'rt_5_push_pull': { title: '주 5회 (밀-당-하-밀-당)', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'workout', label: 'Day 3', count: 6, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 5, texts: textPresets.push }, { type: 'workout', label: 'Day 2a', count: 6, texts: textPresets.pull }, { type: 'rest', days: 1 } ] },
    'rt_5_hybrid': { title: '주 5회 (상-하-상-하-상)', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.lower }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2a', count: 4, texts: textPresets.lower }, { type: 'workout', label: 'Day 1b', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 } ] },
    'rt_6_push_pull': { title: '주 6회 (밀기-당기기-하체)', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'workout', label: 'Day 3', count: 4, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 5, texts: textPresets.push }, { type: 'workout', label: 'Day 2a', count: 5, texts: textPresets.pull }, { type: 'workout', label: 'Day 3a', count: 5, texts: textPresets.lower } ] },
    'rt_6_body_limb_lower': { title: '주 6회 (몸통-말단-하체)', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.core }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.limb }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.core }, { type: 'workout', label: 'Day 2a', count: 7, texts: textPresets.limb }, { type: 'workout', label: 'Day 3a', count: 5, texts: textPresets.lower } ] },
    'rt_w_fitness': { title: '여성 헬스 루틴', timeline: [ { type: 'workout', label: 'Day 1', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2', count: 4, texts: textPresets.w_upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 2 } ] },
    'rt_w_hipup': { title: '힙업 루틴', timeline: [ { type: 'workout', label: 'Day 1', count: 5, texts: textPresets.glutes }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.w_upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 4', count: 6, texts: textPresets.glutes }, { type: 'workout', label: 'Day 5', count: 5, texts: textPresets.w_upper }, { type: 'rest', days: 2 } ] },
    'rt_w_hiponly': { title: '힙 only 루틴', timeline: [ { type: 'workout', label: 'Day 1', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 6', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 } ] }
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
// 4. [신규 복구] 운동 리스트 렌더링 (운동 시작 클릭 시 호출)
// ==========================================
window.renderWorkoutList = function() {
    // 1. 현재 선택된 루틴과 Day 정보 가져오기
    const rtId = localStorage.getItem('active_routine_id') || 'rt_6_body_limb_lower';
    const data = routineDB[rtId];
    if(!data) return;

    let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    const freq = parseInt(localStorage.getItem('active_routine_freq')) || 6;
    let currentDayIndex = completedDays % freq; // 0-based index

    // timeline에서 'workout' 타입만 필터링하여 오늘 할 운동 찾기
    const workoutDays = data.timeline.filter(t => t.type === 'workout');
    const todayWorkout = workoutDays[currentDayIndex];
    if(!todayWorkout) return;

    // 헤더에 Day 표시 업데이트
    const topBarTitle = document.querySelector('#view-workout .tn-title');
    if(topBarTitle) topBarTitle.innerText = `Day ${currentDayIndex + 1}`;

    // 2. 종목 리스트 HTML 렌더링
    let html = '';
    window.currentRoutine = [];
    window.totalGlobalSets = 0;

    // 컨디션 점수 체크 (세트 수 증감 등에 활용 가능)
    const conditionScore = parseInt(localStorage.getItem('workout_intensity_score')) || 3;

    // todayWorkout.texts 배열에 있는 텍스트를 순회하며 렌더링
    // count 프로퍼티가 있으면 그만큼 자르거나 반복
    const exercisesToRender = todayWorkout.texts.slice(0, todayWorkout.count);

    exercisesToRender.forEach((exName, idx) => {
        let sets = conditionScore < 3 ? 3 : 4; // 컨디션 안좋으면 3세트, 기본 4세트
        window.totalGlobalSets += sets;
        
        window.currentRoutine.push({ id: `ex_${idx}`, name: exName });
        
        html += `
        <div class="we-card" id="we-card-ex_${idx}">
            <div class="we-header" onclick="toggleSets('ex_${idx}')">
                <span class="we-name">${exName}</span>
                <span class="we-arrow" id="arrow-ex_${idx}">▼</span>
            </div>
            <div class="we-sets" id="sets-ex_${idx}" style="display:none;">
                <div class="we-set-row header"><span>세트</span><span>kg</span><span>회</span><span>완료</span></div>
        `;
        
        for(let s=1; s<=sets; s++) {
            html += `
            <div class="we-set-row" id="row-ex_${idx}-${s}">
                <span>${s}</span>
                <input type="number" class="we-input" value="20" placeholder="0">
                <input type="number" class="we-input" value="10" placeholder="0">
                <div class="we-check" onclick="checkSet(this, 'ex_${idx}', ${s})"></div>
            </div>
            `;
        }
        
        html += `</div></div>`;
    });

    html += `<button class="secondary-btn" style="margin-top:20px;" onclick="checkFinishWorkout()">운동 완료</button>`;
    
    // 렌더링 영역에 삽입
    const renderArea = document.getElementById('workout-render-area');
    // 만약 home.html 안에 id="workout-render-area" 가 없다면 view-workout 의 content-area를 찾음
    if(renderArea) {
        renderArea.innerHTML = html;
    } else {
        const viewWorkout = document.getElementById('view-workout');
        if(viewWorkout) {
            const contentArea = viewWorkout.querySelector('.content-area');
            if(contentArea) {
                // 기존 가이드 버튼들은 유지하고, 리스트 영역만 새로 생성 (안전장치)
                let listWrap = document.getElementById('workout-dynamic-list');
                if(!listWrap) {
                    listWrap = document.createElement('div');
                    listWrap.id = 'workout-dynamic-list';
                    contentArea.appendChild(listWrap);
                }
                listWrap.innerHTML = html;
            }
        }
    }
};

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

window.checkSet = function(btn, exId, setNum) {
    btn.classList.toggle('active');
    const row = document.getElementById(`row-${exId}-${setNum}`);
    if(btn.classList.contains('active')) {
        row.style.opacity = '0.5';
        let saved = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
        if(!saved.includes(setNum)) saved.push(setNum);
        localStorage.setItem(`workout_${exId}`, JSON.stringify(saved));
        
        // 세트 완료 시 타이머 60초 자동 실행 (팔/어깨 등)
        startGlobalTimer(60, document.querySelector(`#we-card-${exId} .we-name`).innerText);
    } else {
        row.style.opacity = '1';
        let saved = JSON.parse(localStorage.getItem(`workout_${exId}`)) || [];
        saved = saved.filter(s => s !== setNum);
        localStorage.setItem(`workout_${exId}`, JSON.stringify(saved));
    }
};

// ==========================================
// 5. 공통 팝업 및 이벤트 제어 로직
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
        if(window.cardioStepIdx < 4) { window.cardioStepIdx++; renderCardioStep(); } else { closeModal(); alert('유산소 설정이 저장되었습니다!'); }
    });

    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    if(btnSubmitFeedback) {
        btnSubmitFeedback.addEventListener('click', () => {
            closeModal();
            // 운동 완료 시 완료 일수 증가 처리
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

// ==========================================
// 6. 유산소 마법사 로직
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

// ==========================================
// 7. 공통 타이머 로직
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

// ==========================================
// 8. 과부하 코치 로직
// ==========================================
const coachData = [
    { sub: '', title: '세 번째 운동을 완료했어요!', content: '<p class="coach-desc" style="color:#fff;">벌써 세 번째 운동을 완료하셨네요. 조금씩 운동 기록이 쌓이고 있어요.<br><br>지금처럼 각 세트에서 실제로 수행한 중량과 횟수를 그대로 기록해주세요.<br><br><span style="color:var(--primary); font-weight:bold;">다음 운동도 함께 이어가볼게요!</span></p>' },
    { sub: '완료 현황', title: '마치지 못한 운동과 세트가 있어요', content: '<div class="coach-box"><div class="cb-row"><span class="cb-name" style="color:#fff;">루마니안 데드리프트</span><span style="color:#888;">1~3번째 세트 미완료</span></div><div class="cb-row"><span class="cb-name" style="color:#fff;">시시 스쿼트(맨몸)</span><span style="color:#888;">운동 전체 미완료</span></div><div class="cb-row"><span class="cb-name" style="color:#fff;">시티드 햄스트링 컬</span><span style="color:#888;">1번째 세트 미완료</span></div><div class="cb-row"><span style="color:#888;">...</span></div></div><p class="coach-desc" style="margin-top:20px;">컨디션이 좋지 않거나 시간이 부족했다면 억지로 완료할 필요는 없어요.<br><br>다음 운동에서 다시 차근차근 이어가보세요!<br><br>2주차부터는 알고리즘이 박준혁님의 피로도에 따라 루틴을 조절해드리니 걱정하지 않으셔도 됩니다:)</p>' },
    { sub: '세트 퍼포먼스 분석', title: '강도를 조금 더 높여봐요', content: '<div class="coach-box"><span class="cb-name">스미스 머신 스쿼트</span><div class="cb-row"><span>2번째 세트</span><span class="cb-val">10회</span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val">11회</span></div></div><p class="coach-desc" style="margin-top:20px;">보통 세트가 진행될수록 피로로 횟수가 줄어드는데, 뒤 세트에서 오히려 더 많이 수행했어요.<br><br>앞선 세트의 강도가 낮았을 수 있어요. 다음엔 <span style="color:var(--primary); font-weight:bold;">권장 RIR에 맞춰</span> 조금 더 높은 강도로 수행해보세요!</p>' },
    { sub: '권장 횟수 분석', title: '중량이 조금 무거웠어요', content: '<div class="coach-box"><span class="cb-name">루마니안 데드리프트</span><div class="cb-row" style="margin-bottom:12px;"><span>수행</span><span class="cb-val" style="color:#aaa;"><span style="color:var(--primary); font-weight:bold;">30kg × 6회</span></span></div><div class="cb-row" style="margin-bottom:12px;"><span>권장</span><span class="cb-val" style="color:#aaa;">8~12회</span></div><div class="cb-row"><span>차이</span><span class="cb-val" style="color:#aaa;">-2회</span></div></div><p class="coach-desc" style="margin-top:20px;">권장 범위보다 <span style="color:var(--primary); font-weight:bold;">적게</span> 수행하셨어요. 아직 익숙하지 않은 운동이라면 적정 중량을 가늠하기 어려울 수 있어요.<br><br>괜찮아요! 이번 수행 결과를 바탕으로 다음주부터는 더 적절한 중량을 안내해드릴게요.</p>' },
    { sub: '권장 횟수 분석', title: '권장 범위를 조금 벗어났어요', content: '<div class="coach-box"><span class="cb-name">시티드 햄스트링 컬</span><div class="cb-row" style="margin-bottom:8px;"><span>2번째 세트</span><span class="cb-val" style="color:#aaa;"><span style="color:var(--primary); font-weight:bold;">26kg × 15회</span> <span style="color:#666;">· 권장 8~12회</span></span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val" style="color:#aaa;"><span style="color:var(--primary); font-weight:bold;">33kg × 7회</span> <span style="color:#666;">· 권장 8~12회</span></span></div></div><p class="coach-desc" style="margin-top:20px;">적게 수행한 세트는 중량이 무거웠을 수 있고, 많이 수행한 세트는 가벼웠을 수 있어요.<br><br>익숙하지 않은 운동은 적정 중량을 가늠하기 어려우니 걱정하지 않으셔도 됩니다. 다음엔 더 적절한 중량을 안내해드릴게요.</p>' },
    { sub: '권장 횟수 분석', title: '중량이 조금 무거웠어요', content: '<div class="coach-box"><span class="cb-name">덤벨 불가리안 스플릿 스쿼트 (상체 숙이고 둔근 포커스)</span><div class="cb-row" style="margin-bottom:8px;"><span>2번째 세트</span><span class="cb-val" style="color:#aaa;"><span style="color:var(--primary); font-weight:bold;">1kg × 7회</span> <span style="color:#666;">· 권장 8~12회</span></span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val" style="color:#aaa;"><span style="color:var(--primary); font-weight:bold;">1kg × 6회</span> <span style="color:#666;">· 권장 8~12회</span></span></div></div><p class="coach-desc" style="margin-top:20px;">위 세트가 <span style="color:var(--primary); font-weight:bold;">권장 횟수 범위에 도달하지 못했어요.</span> 적정 중량을 아직 가늠하지 못해 조금 무겁게 설정했을 수 있어요.<br><br>괜찮아요! 이번 수행 결과를 바탕으로 다음주부터는 더 적절한 중량을 안내해드릴게요. 😊</p>' }
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
