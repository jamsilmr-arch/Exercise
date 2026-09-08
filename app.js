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

window.currentRoutine = [];
window.totalGlobalSets = 0;

// ==========================================
// 2. DOM 로드 시 공통 UI 및 팝업 주입
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
                <div class="gst-info"><span class="gst-name" id="gst-ex-name">운동 이름</span><span class="gst-sub" id="gst-rest-text">권장 휴식 시간 01:30</span><div class="gst-time" id="gst-time-display">01:30</div></div>
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

    // 뷰 전환 로직 (화면 넘김 시 하단 메뉴 제어 포함)
    window.switchView = function(targetId) {
        document.querySelectorAll('.view-container').forEach(view => { 
            view.classList.remove('active'); 
            view.style.display = 'none'; 
        });
        const targetView = document.getElementById(targetId);
        if(targetView) { 
            targetView.classList.add('active'); 
            targetView.style.display = 'block'; 
            window.scrollTo(0, 0); 
        }
        
        const mainNav = document.getElementById('main-nav');
        if (mainNav) {
            if (targetId === 'view-workout' || targetId === 'view-condition' || targetId === 'view-summary' || targetId === 'view-routine-detail') {
                mainNav.style.display = 'none';
            } else {
                mainNav.style.display = 'flex';
            }
        }
    };

    attachCommonEvents();
    if(typeof initWorkoutData === 'function') initWorkoutData(); 
});


// ==========================================
// 3. 모달 이벤트 및 글로벌 타이머
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

    // 유산소 마법사
    document.getElementById('btn-cw-prev').addEventListener('click', () => {
        if(window.cardioStepIdx > 0) { window.cardioStepIdx--; renderCardioStep(); }
    });
    document.getElementById('btn-cw-next').addEventListener('click', () => {
        if(window.cardioStepIdx < 4) { window.cardioStepIdx++; renderCardioStep(); }
        else { closeModal(); alert('유산소 설정이 저장되었습니다!'); }
    });

    // 과부하 코치 진입(요약 화면에서 '다음' 클릭 시)
    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    if(btnSubmitFeedback) {
        btnSubmitFeedback.addEventListener('click', () => {
            closeModal();
            switchView('view-summary'); 
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
                switchView('view-feedback'); 
                window.scrollTo(0, 0);
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

// ==========================================
// 4. 유산소 설정 마법사 로직
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
// 5. 과부하 코치 로직 (8단계)
// ==========================================
const coachData = [
    { sub: '', title: '두 번째 운동도 완료했어요!', content: '<p class="coach-desc" style="color:#fff;">두 번째 운동까지 잘 마무리하셨네요.<br><br>지금은 사용자님의 운동 패턴을 알아가는 첫 주예요. 오늘도 실제로 수행한 중량과 횟수를 정확하게 기록해주세요.<br><br>오늘 운동도 수고하셨어요!</p>' },
    { sub: '완료 현황', title: '마치지 못한 세트가 있어요', content: '<div class="coach-box"><div class="cb-row"><span class="cb-name" style="color:#fff;">케이블 트라이셉 푸시다운</span><span style="color:#888;">1번째 세트 미완료</span></div><div class="cb-row"><span class="cb-name" style="color:#fff;">덤벨 레터럴 레이즈</span><span style="color:#888;">1번째 세트 미완료</span></div></div><p class="coach-desc" style="margin-top:20px;">컨디션이 좋지 않거나 시간이 부족했다면 억지로 완료할 필요는 없어요.<br><br>다음 운동에서 다시 차근차근 이어가보세요!<br><br>2주차부터는 알고리즘이 피로도에 따라 루틴을 조절해드리니 걱정하지 않으셔도 됩니다:)</p>' },
    { sub: '세트 퍼포먼스 분석', title: '강도를 조금 더 높여봐도 좋아요', content: '<div class="coach-box"><span class="cb-name">바벨 프리처 컬</span><div class="cb-row"><span>2번째 세트</span><span class="cb-val">9회</span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val">9회</span></div></div><p class="coach-desc" style="margin-top:20px;">일반적으로 세트가 진행될수록 횟수가 감소하는 게 정상이에요.<br><br>아마 <span style="color:var(--primary); font-weight:bold;">세트 사이 회복이 충분했거나</span> 회복 속도가 빨라 횟수가 유지된 것 같아요. 큰 문제는 아니에요.<br><br>다만 스스로 느끼시기에 강도가 높지 않았다면, 더 좋은 근성장을 위해 다음엔 권장 RIR에 맞춰 조금 더 높은 강도로 수행해보세요.</p>' },
    { sub: '세트 퍼포먼스 분석', title: '강도를 조금 더 높여봐요', content: '<div class="coach-box"><span class="cb-name">원암 덤벨 트라이셉 익스텐션</span><div class="cb-row"><span>1번째 세트</span><span class="cb-val">11회</span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val">12회</span></div></div><p class="coach-desc" style="margin-top:20px;">보통 세트가 진행될수록 피로로 횟수가 줄어드는데, 뒤 세트에서 오히려 더 많이 수행했어요.<br><br>앞선 세트의 강도가 낮았을 수 있어요. 다음엔 권장 RIR에 맞춰 조금 더 높은 강도로 수행해보세요!</p>' },
    { sub: '세트 퍼포먼스 분석', title: '강도를 조금 더 높여봐요', content: '<div class="coach-box"><span class="cb-name">바벨 바이셉 컬</span><div class="cb-row"><span>1번째 세트</span><span class="cb-val">6회</span></div><div class="cb-row"><span>2번째 세트</span><span class="cb-val">7회</span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val">10회</span></div></div><p class="coach-desc" style="margin-top:20px;">보통 세트가 진행될수록 피로로 횟수가 줄어드는데, 뒤 세트에서 오히려 더 많이 수행했어요.<br><br>앞선 세트의 강도가 낮았을 수 있어요. 다음엔 권장 RIR에 맞춰 조금 더 높은 강도로 수행해보세요!</p>' },
    { sub: '권장 횟수 분석', title: '중량이 조금 가벼웠어요', content: '<div class="coach-box"><span class="cb-name">오버헤드 프레스</span><div class="cb-row" style="margin-bottom:8px;"><span>1번째 세트</span><span class="cb-val" style="color:#aaa;">60kg × 9회 <span style="color:#666;">· 권장 4~7회</span></span></div><div class="cb-row" style="margin-bottom:8px;"><span>2번째 세트</span><span class="cb-val" style="color:#aaa;">20kg × 25회 <span style="color:#666;">· 권장 8~12회</span></span></div><div class="cb-row"><span>3번째 세트</span><span class="cb-val" style="color:#aaa;">30kg × 20회 <span style="color:#666;">· 권장 8~12회</span></span></div></div><p class="coach-desc" style="margin-top:20px;">위 세트가 <span style="color:var(--primary); font-weight:bold;">권장 횟수 범위</span>를 넘어섰어요. 적정 중량을 아직 가늠하지 못해 조금 가볍게 설정했을 수 있어요.<br><br>괜찮아요! 이번 수행 결과를 바탕으로 다음주부터는 더 적절한 중량을 안내해드릴게요.</p>' },
    { sub: '권장 횟수 분석', title: '중량이 조금 무거웠어요', content: '<div class="coach-box"><span class="cb-name">바벨 프리처 컬</span><div class="cb-row" style="margin-bottom:12px;"><span>수행</span><span class="cb-val" style="color:#aaa;">25kg × 6회</span></div><div class="cb-row" style="margin-bottom:12px;"><span>권장</span><span class="cb-val" style="color:#aaa;">8~12회</span></div><div class="cb-row"><span>차이</span><span class="cb-val" style="color:#aaa;">-2회</span></div></div><p class="coach-desc" style="margin-top:20px;">권장 범위보다 <span style="color:var(--primary); font-weight:bold;">적게</span> 수행하셨어요. 아직 익숙하지 않은 운동이라면 적정 중량을 가늠하기 어려울 수 있어요.<br><br>괜찮아요! 이번 수행 결과를 바탕으로 다음주부터는 더 적절한 중량을 안내해드릴게요.</p>' },
    { sub: '권장 횟수 분석', title: '중량이 조금 가벼웠어요', content: '<div class="coach-box"><span class="cb-name">원암 덤벨 트라이셉 익스텐션</span><div class="cb-row" style="margin-bottom:12px;"><span>수행</span><span class="cb-val" style="color:#aaa;">6kg × 15회</span></div><div class="cb-row" style="margin-bottom:12px;"><span>권장</span><span class="cb-val" style="color:#aaa;">8~12회</span></div><div class="cb-row"><span>차이</span><span class="cb-val" style="color:#aaa;">+3회</span></div></div><p class="coach-desc" style="margin-top:20px;">권장 범위보다 <span style="color:var(--primary); font-weight:bold;">많이</span> 수행하셨어요. 아직 익숙하지 않은 운동이라면 적정 중량을 가늠하기 어려울 수 있어요.<br><br>괜찮아요! 이번 수행 결과를 바탕으로 다음주부터는 더 적절한 중량을 안내해드릴게요.</p>' }
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
    document.getElementById('btn-coach-next').innerText = window.coachStepIdx === coachData.length - 1 ? '완료' : '다음';
};
