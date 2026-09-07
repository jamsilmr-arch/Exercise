// --- Firebase SDK 초기화 ---
const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb",
    storageBucket: "exercise-abddb.firebasestorage.app",
    messagingSenderId: "887574653012",
    appId: "1:887574653012:web:deac9acecc61763d325c1",
    measurementId: "G-05SVZ9QPS9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    const targetView = document.getElementById(targetId);
    if(targetView) {
        targetView.classList.add('active');
        targetView.style.display = '';
        window.scrollTo(0, 0);
    }
}

document.querySelectorAll('.view-container').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
});

let currentRoutine = [];
let totalGlobalSets = 0;

function buildDynamicRoutine(wizardData) {
    const frequency = parseInt(wizardData?.question_6?.value) || 6;
    let splitName = '몸통-말단-하체';
    if (frequency === 3) splitName = '밀기-당기기-하체';
    else if (frequency === 4) splitName = '상하체 2분할';

    document.getElementById('home-routine-title').innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    document.getElementById('rl-current-title').innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    
    let weekBlocksHtml = '';
    for (let i = 1; i <= frequency; i++) {
        weekBlocksHtml += `<div class="wb-item ${i===1?'active':''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    document.getElementById('home-week-blocks').innerHTML = weekBlocksHtml;

    currentRoutine = [
        { id: 'ex1', name: '케이블 로우 (중간-넓은 오버 그립)', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif', warmup: 2, top: 1, main: 3, type: 'weight' },
        { id: 'ex2', name: '해머 스트렝스 체스트 프레스 머신 (Plate-loaded, Lever)', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', warmup: 2, top: 1, main: 2, type: 'weight' },
        { id: 'ex3', name: '풀업 뉴트럴 그립', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif', warmup: 1, top: 1, main: 2, type: 'bodyweight' },
        { id: 'ex4', name: '덤벨 체스트 플라이', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', warmup: 1, top: 0, main: 3, type: 'weight' },
        { id: 'ex5', name: '랫 풀다운 중간 그립', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif', warmup: 2, top: 1, main: 2, type: 'weight' },
        { id: 'ex6', name: '체스트 서포티드 머신 로우 (레버)', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif', warmup: 2, top: 1, main: 3, type: 'weight' }
    ];

    document.getElementById('home-today-count').innerText = `${currentRoutine.length}개 운동`;
    totalGlobalSets = currentRoutine.reduce((acc, ex) => acc + ex.warmup + ex.top + ex.main, 0);
    document.getElementById('home-today-sets').innerText = `${totalGlobalSets}세트`;
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        document.getElementById('set-profile-name').innerText = user.displayName ? `${user.displayName} 님` : '회원 님';
        document.getElementById('set-profile-email').innerText = user.email || '';
    }

    const localCompleted = localStorage.getItem('onboardingCompleted') === 'true';
    if (!localCompleted) {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().onboardingCompleted) {
                    localStorage.setItem('onboardingCompleted', 'true');
                    buildDynamicRoutine(userDoc.data().wizardData);
                    switchView('view-home');
                } else { window.location.replace('index.html'); }
            } catch(e) { window.location.replace('index.html'); }
        } else { window.location.replace('index.html'); }
    } else {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().wizardData) {
                    buildDynamicRoutine(userDoc.data().wizardData);
                }
            } catch(e) { console.error("데이터 로드 실패:", e); }
        } else { buildDynamicRoutine({ question_6: { value: 6 } }); }
        switchView('view-home');
    }
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchView(target);
        }
    });
});

document.getElementById('btn-go-condition').addEventListener('click', () => { switchView('view-condition'); });
document.getElementById('btn-start-workout-list').addEventListener('click', () => {
    renderWorkoutList();
    switchView('view-workout');
});

// 알림 토글
document.getElementById('toggle-rest').addEventListener('click', function() {
    this.style.background = this.style.background === 'transparent' ? 'var(--primary-light)' : 'transparent';
    this.style.borderColor = this.style.borderColor === '#555' ? 'var(--primary)' : '#555';
});

// --- 유산소 설정 마법사 로직 ---
const cardioSteps = [
    { title: '어떤 유산소 기구를<br>쓸 수 있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['트레드밀', '실내 사이클', '일립티컬', '로잉머신', '없음'] },
    { title: '불편한 부위가<br>있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['무릎·발목', '허리', '어깨·팔꿈치', '없음'] },
    { title: '유산소로 무엇을<br>얻고 싶나요?', sub: '', type: 'single', options: ['건강 유지', '심폐 체력', '체지방 감량'] },
    { title: '일주일에 몇 번<br>하실 건가요?', sub: '유산소는 근력 운동을 하는 날에 이어서 해요.', type: 'grid', options: [1,2,3,4,5,6,7], rec: 3 },
    { title: '한 번에 몇 분<br>하실 건가요?', sub: '', type: 'time', chips: ['걷기 (러닝머신)', '사이클링', '인클라인 걷기 (러닝머신)'] }
];

let cardioStepIdx = 0;

window.startCardioWizard = function() {
    cardioStepIdx = 0;
    renderCardioStep();
    switchView('view-cardio-wizard');
};

function renderCardioStep() {
    const data = cardioSteps[cardioStepIdx];
    document.getElementById('cw-step-text').innerText = `질문 ${cardioStepIdx+1}/5`;
    document.getElementById('cw-progress-fill').style.width = `${((cardioStepIdx+1)/5)*100}%`;

    let html = `<div class="cw-q-num">질문 ${cardioStepIdx+1}</div>`;
    html += `<div class="cw-q-title">${data.title}</div>`;
    html += `<div class="cw-q-sub">${data.sub}</div>`;

    if (data.type === 'multi' || data.type === 'single') {
        html += `<div class="cw-options">`;
        data.options.forEach(opt => {
            html += `<div class="cw-opt-btn" onclick="toggleCardioOpt(this, '${data.type}')"><div class="cw-check"></div>${opt}</div>`;
        });
        html += `</div>`;
    } else if (data.type === 'grid') {
        html += `<div class="cw-grid">`;
        data.options.forEach(opt => {
            const isRec = opt === data.rec ? `<div class="cw-rec-badge">추천</div>` : '';
            const isActive = opt === data.rec ? 'active' : '';
            html += `<div class="cw-grid-btn ${isActive}" onclick="selectCardioGrid(this)">${isRec}<span class="cw-g-num">${opt}</span><span class="cw-g-sub">회/주</span></div>`;
        });
        html += `</div>`;
    } else if (data.type === 'time') {
        html += `<div class="cw-time-wrap">`;
        html += `<div class="cw-t-chips">` + data.chips.map((c,i) => `<div class="cw-t-chip ${i===0?'active':''}">${c}</div>`).join('') + `</div>`;
        html += `
            <div class="cw-time-box">
                <button class="cw-t-btn" onclick="changeCardioTime(-5)">-</button>
                <div class="cw-t-val-box"><div class="cw-t-val" id="cw-time-val">60<span>분</span></div><div class="cw-t-badge">추천</div></div>
                <button class="cw-t-btn" onclick="changeCardioTime(5)">+</button>
            </div>
        </div>`;
    }

    document.getElementById('cw-render-area').innerHTML = html;
    document.getElementById('btn-cw-prev').style.display = cardioStepIdx === 0 ? 'none' : 'block';
    document.getElementById('btn-cw-next').innerText = cardioStepIdx === 4 ? '유산소 추가하기' : '다음';
}

window.toggleCardioOpt = function(btn, type) {
    if (type === 'single') {
        btn.parentElement.querySelectorAll('.cw-opt-btn').forEach(b => b.classList.remove('active'));
    }
    btn.classList.toggle('active');
};
window.selectCardioGrid = function(btn) {
    btn.parentElement.querySelectorAll('.cw-grid-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};
window.changeCardioTime = function(amount) {
    const valElem = document.getElementById('cw-time-val');
    let current = parseInt(valElem.innerText);
    current += amount;
    if(current < 5) current = 5;
    valElem.innerHTML = `${current}<span>분</span>`;
};

document.getElementById('btn-cw-prev').addEventListener('click', () => {
    if(cardioStepIdx > 0) { cardioStepIdx--; renderCardioStep(); }
});
document.getElementById('btn-cw-next').addEventListener('click', () => {
    if(cardioStepIdx < 4) { cardioStepIdx++; renderCardioStep(); }
    else { switchView('view-home'); }
});


// --- 공통 팝업 및 바텀시트 제어 로직 ---
const modalOverlay = document.getElementById('common-modal-overlay');

function hideAllModals() {
    modalOverlay.querySelectorAll('.guide-modal, .alert-modal, .feedback-modal, .coach-modal, .bottom-sheet-modal').forEach(m => m.classList.remove('active'));
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


// --- 훈련 세트 리스트 및 타이머 (기존 동일 유지, 공간상 생략) ---
function renderWorkoutList() {
    const listContainer = document.getElementById('workout-exercise-list');
    let html = '';
    currentRoutine.forEach((ex, index) => {
        const totalSets = ex.warmup + ex.top + ex.main;
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        const completedCount = savedData.length;
        const badgeColor = completedCount === totalSets ? '#2e6bdf' : '#2c2c2e';
        const badgeTextColor = completedCount === totalSets ? '#fff' : '#aaa';
        const unitText1 = ex.type === 'bodyweight' ? '체중 (kg)' : '중량 (kg)';
        
        let toggleHtml = ex.type === 'bodyweight' ? `<div class="toggle-switch-group"><div class="toggle-item active">맨몸</div><div class="toggle-item">일반</div></div>` : `<div class="toggle-switch-group"><div class="toggle-item active">kg</div><div class="toggle-item">lbs</div></div>`;
        const formHeader = `<div class="set-header-row"><span>${unitText1}</span><span>횟수</span></div>`;

        let warmupHtml = '';
        if (ex.warmup > 0) {
            warmupHtml += `<div class="set-group"><div class="set-badge">웜업 세트</div>${formHeader}`;
            for (let i=1; i<=ex.warmup; i++) {
                const setId = `w${i}`;
                const isChecked = savedData.includes(setId) ? 'completed' : '';
                warmupHtml += `<div class="set-row"><div class="set-label">${i === ex.warmup ? '5 RIR' : '6 RIR'}</div><div class="set-input-box"><input type="number" class="set-input" placeholder="0"><input type="number" class="set-input" placeholder="0"></div><div class="set-check ${isChecked}" data-id="${setId}" data-time="35" data-ex="${ex.name}">✓</div></div>`;
            }
            warmupHtml += `</div>`;
        }
        let topHtml = '';
        if (ex.top > 0) {
            topHtml += `<div class="set-group"><div class="set-badge">탑 세트</div>${formHeader}`;
            const setId = `t1`;
            const isChecked = savedData.includes(setId) ? 'completed' : '';
            topHtml += `<div class="set-row"><div class="set-label">1 RIR</div><div class="set-input-box"><input type="number" class="set-input" placeholder="고중량"><input type="text" class="set-input" placeholder="4-7"></div><div class="set-check ${isChecked}" data-id="${setId}" data-time="90" data-ex="${ex.name}">✓</div></div>`;
            topHtml += `</div>`;
        }
        let mainHtml = '';
        if (ex.main > 0) {
            mainHtml += `<div class="set-group"><div class="set-badge">본 세트</div>${formHeader}`;
            for (let i=1; i<=ex.main; i++) {
                const setId = `m${i}`;
                const isChecked = savedData.includes(setId) ? 'completed' : '';
                mainHtml += `<div class="set-row"><div class="set-label">1 RIR</div><div class="set-input-box"><input type="number" class="set-input" placeholder="중량"><input type="text" class="set-input" placeholder="8-12"></div><div class="set-check ${isChecked}" data-id="${setId}" data-time="90" data-ex="${ex.name}">✓</div></div>`;
            }
            mainHtml += `</div>`;
        }

        html += `
            <div class="ex-row" id="ex-row-${index}">
                <div class="ex-header" onclick="toggleAccordion(${index})"><div class="ex-thumb"><img src="${ex.img}"></div><div class="ex-info"><div class="ex-name">${ex.name}</div><div class="ex-progress-badge" id="badge-${index}" style="background:${badgeColor}; color:${badgeTextColor};">${completedCount} / ${totalSets} 완료</div></div><div class="ex-drag-icon">⋮⋮</div></div>
                <div class="ex-details"><div class="ex-detail-img"><img src="${ex.img}"><button class="btn-memo">메모</button></div><div class="ex-tools"><button class="btn-superset">+ 슈퍼세트</button>${toggleHtml}</div>${warmupHtml}${topHtml}${mainHtml}<div class="set-add-btns"><button>+ 세트 추가</button><button>- 세트 삭제</button></div></div>
            </div>
        `;
    });
    listContainer.innerHTML = html + `<div style="height:20px;"></div><button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom:20px;">운동 완료</button>`;

    document.querySelectorAll('.set-check').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); this.classList.toggle('completed');
            const exIndex = this.closest('.ex-row').id.split('-')[2];
            const exData = currentRoutine[exIndex];
            const setId = this.getAttribute('data-id');
            let savedData = JSON.parse(localStorage.getItem(`workout_${exData.id}`)) || [];

            if (this.classList.contains('completed')) {
                if (!savedData.includes(setId)) savedData.push(setId);
                startGlobalTimer(parseInt(this.getAttribute('data-time')), this.getAttribute('data-ex'));
            } else { savedData = savedData.filter(id => id !== setId); }
            
            localStorage.setItem(`workout_${exData.id}`, JSON.stringify(savedData));
            const totalSets = exData.warmup + exData.top + exData.main;
            const badge = document.getElementById(`badge-${exIndex}`);
            badge.innerText = `${savedData.length} / ${totalSets} 완료`;
            badge.style.background = savedData.length === totalSets ? '#2e6bdf' : '#2c2c2e';
            badge.style.color = savedData.length === totalSets ? '#fff' : '#aaa';
        });
    });
}

window.toggleAccordion = function(index) { document.getElementById(`ex-row-${index}`).classList.toggle('expanded'); };

let globalTimerInterval = null;
let targetEndTime = 0;
let totalDuration = 0;
const timerUi = document.getElementById('global-timer-ui');

function startGlobalTimer(seconds, exName) {
    clearInterval(globalTimerInterval);
    totalDuration = seconds;
    targetEndTime = Date.now() + (seconds * 1000);
    document.getElementById('gst-ex-name').innerText = exName;
    document.getElementById('gst-rest-text').innerText = `권장 휴식 시간 ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    document.getElementById('gst-time-display').innerText = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    document.getElementById('gst-progress').style.width = '100%';
    timerUi.style.display = 'flex'; 

    globalTimerInterval = setInterval(() => {
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(globalTimerInterval);
            document.getElementById('gst-time-display').innerText = "진행!";
            document.getElementById('gst-progress').style.width = '0%';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setTimeout(() => { timerUi.style.display = 'none'; }, 3000); 
        } else {
            document.getElementById('gst-time-display').innerText = `${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
            document.getElementById('gst-progress').style.width = `${(remaining/totalDuration)*100}%`;
        }
    }, 100);
}
document.getElementById('gst-close').addEventListener('click', () => { clearInterval(globalTimerInterval); timerUi.style.display = 'none'; });

window.checkFinishWorkout = function() {
    let completed = 0;
    currentRoutine.forEach(ex => completed += (JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || []).length);
    if (completed < totalGlobalSets) { hideAllModals(); modalOverlay.classList.add('active'); document.getElementById('modal-alert-incomplete').classList.add('active'); } 
    else { hideAllModals(); modalOverlay.classList.add('active'); document.getElementById('modal-daily-feedback').classList.add('active'); }
};
