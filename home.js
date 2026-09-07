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
    
    // 네비게이션 강제 숨김 처리
    const mainNav = document.getElementById('main-nav');
    if (targetId === 'view-cardio-wizard' || targetId === 'view-workout' || targetId === 'view-condition' || targetId === 'view-routine-detail') {
        mainNav.style.display = 'none';
    } else {
        mainNav.style.display = 'flex';
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
        { id: 'ex2', name: '해머 스트렝스 체스트 프레스 머신', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', warmup: 2, top: 1, main: 2, type: 'weight' },
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

const toggleRest = document.getElementById('toggle-rest');
if(toggleRest) {
    toggleRest.addEventListener('click', function() {
        this.style.background = this.style.background === 'transparent' ? 'var(--primary-light)' : 'transparent';
        this.style.borderColor = this.style.borderColor === '#555' ? 'var(--primary)' : '#555';
    });
}

// --- 유산소 설정 마법사 로직 ---
const cardioSteps = [
    { title: '어떤 유산소 기구를<br>쓸 수 있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['트레드밀', '실내 사이클', '일립티컬', '로잉머신', '없음'] },
    { title: '불편한 부위가<br>있나요?', sub: '여러 개 고를 수 있어요.', type: 'multi', options: ['무릎·발목', '허리', '어깨·팔꿈치', '없음'] },
    { title: '유산소로 무엇을<br>얻고 싶나요?', sub: '', type: 'single', options: ['건강 유지', '심폐 체력', '체지방 감량'] },
    { title: '일주일에 몇 번<br>하실 건가요?', sub: '유산소는 근력 운동을 하는 날에 이어서 해요.', type: 'grid', options: [1,2,3,4,5,6,7], rec: 3 },
    { title: '한 번에 몇 분<br>하실 건가요?', sub: '', type: 'time', chips: ['걷기 (러닝머신)', '사이클링', '인클라인 걷기 (러닝머신)'] }
];

let cardioStepIdx = 0;
let currentCardioMins = 60; // 기본값

window.startCardioWizard = function() {
    cardioStepIdx = 0;
    currentCardioMins = 60; 
    renderCardioStep();
    switchView('view-cardio-wizard');
};

function renderCardioStep() {
    const data = cardioSteps[cardioStepIdx];
    document.getElementById('cw-step-text').innerText = `질문 ${cardioStepIdx+1}/5`;
    document.getElementById('cw-progress-fill').style.width = `${((cardioStepIdx+1)/5)*100}%`;

    let html = `<div class="cw-render-area">`;
    html += `<div class="cw-q-num">질문 ${cardioStepIdx+1}</div>`;
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
        html += `<div class="cw-t-chips">` + data.chips.map((c,i) => `<div class="cw-t-chip ${i===0?'active':''}" onclick="changeCardioType(this, '${c}')">${c}</div>`).join('') + `</div>`;
        html += `
            <div class="cw-time-box">
                <button class="cw-t-btn" onclick="changeCardioTime(-5)">-</button>
                <div class="cw-t-val-box"><div class="cw-t-val" id="cw-time-val">${currentCardioMins}<span>분</span></div><div class="cw-t-badge">추천</div></div>
                <button class="cw-t-btn" onclick="changeCardioTime(5)">+</button>
            </div>
        </div>`;
    }
    html += `</div>`;
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

window.changeCardioType = function(btn, type) {
    btn.parentElement.querySelectorAll('.cw-t-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (type.includes('사이클링')) currentCardioMins = 35;
    else if (type.includes('인클라인')) currentCardioMins = 30;
    else currentCardioMins = 60; // 걷기

    document.getElementById('cw-time-val').innerHTML = `${currentCardioMins}<span>분</span>`;
};

window.changeCardioTime = function(amount) {
    const valElem = document.getElementById('cw-time-val');
    currentCardioMins += amount;
    if(currentCardioMins < 5) currentCardioMins = 5;
    valElem.innerHTML = `${currentCardioMins}<span>분</span>`;
};

document.getElementById('btn-cw-prev').addEventListener('click', () => {
    if(cardioStepIdx > 0) { cardioStepIdx--; renderCardioStep(); }
});
document.getElementById('btn-cw-next').addEventListener('click', () => {
    if(cardioStepIdx < 4) { cardioStepIdx++; renderCardioStep(); }
    else { switchView('view-home'); }
});


// --- 공통 팝업 제어 로직 ---
const modalOverlay = document.getElementById('common-modal-overlay');

function hideAllModals() {
    modalOverlay.querySelectorAll('.guide-modal, .alert-modal, .feedback-modal, .coach-modal, .bottom-sheet-modal').forEach(m => {
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


// --- [신규] 루틴 상세 타임라인 데이터베이스 ---
const mockImgs = [
    'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Squat_animation.gif',
    'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif'
];

function getMockImg(index) { return mockImgs[index % mockImgs.length]; }

const routineDB = {
    'rt_2_full': {
        title: '주 2회 무분할 루틴',
        chips: ['남성'],
        desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다. 주 2회만 운동하기 때문에 최적의 근성장 효과를 누릴 수는 없지만 운동에 투자하는 시간 대비 성과, 즉 가성비는 최고인 루틴입니다. 무분할로 진행되고 전신을 다 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7 },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7 },
            { type: 'rest', days: 3 }
        ]
    },
    'rt_3_hybrid': {
        title: '주 3회 (상체-하체-전신) 루틴',
        chips: ['상체-하체-전신', '남성'],
        desc: '2분할과 무분할을 섞은 하이브리드입니다. 상체 혹은 하체에 집중할 수 있는 2분할의 장점과 전신을 한꺼번에 운동해 효율적인 무분할의 장점까지 같이 있습니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7 },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 6 },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7 },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_3_full': {
        title: '주 3회 무분할 (전신-전신-전신) 루틴',
        chips: ['전신-전신-전신', '남성'],
        desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다. 최신 메타 분석에 따르면 운동 주기가 증가함에 따라 스트렝스는 강한 상관관계를 보인다고 합니다. 제한적인 스케줄을 통해 스트렝스에 집중하고 싶다면 나쁘지 않은 옵션입니다. 무분할로 진행되고 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 8 },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 8 },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7 },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_4_hybrid': {
        title: '주 4회 (밀기-당기기-하체-전신) 루틴',
        chips: ['밀기-당기기-하체-전신', '남성'],
        desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다. 특정 신체 부위에 집중할 수 있고 전신 날이 추가되기 때문에 운동 주기는 주 2회로 유지됩니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6 },
            { type: 'workout', label: 'Day 2', count: 7 },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 3', count: 5 },
            { type: 'workout', label: 'Day 4', count: 7 },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_4_split': {
        title: '주 4회 (상체-하체-상체-하체) 루틴',
        chips: ['상체-하체-상체-하체', '남성'],
        desc: '전신을 균형 있게 발달시키기 위한 가장 기본적이고 효율적인 루틴으로, 전형적인 주 4회 2분할 방식입니다. 상체와 하체를 분리해 각각 이틀씩 운동하며 체계적인 구성으로 폭넓게 활용할 수 있습니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7 },
            { type: 'workout', label: 'Day 2', count: 5 },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 7 },
            { type: 'workout', label: 'Day 2a', count: 5 },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_6_push_pull': {
        title: '주 6회 (밀기-당기기-하체) 루틴',
        chips: ['밀기-당기기-하체', '남성'],
        desc: '전형적인 3분할입니다. 비슷한 근육을 모아서 운동하기 때문에 스트렝스 훈련에는 최적화되지 않았습니다. 하지만 단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 루틴입니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6 },
            { type: 'workout', label: 'Day 2', count: 7 },
            { type: 'workout', label: 'Day 3', count: 4 },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 5 },
            { type: 'workout', label: 'Day 2a', count: 5 },
            { type: 'workout', label: 'Day 3a', count: 5 }
        ]
    }
};

window.openRoutineDetail = function(rtId) {
    const data = routineDB[rtId] || routineDB['rt_2_full']; // 매핑 없으면 주2회 기본 노출
    
    let html = `
        <div class="rd-header">
            <h1 class="rd-title">${data.title}</h1>
            <div class="rd-chips">
                ${data.chips.map(c => `<span class="rt-chip">${c}</span>`).join('')}
            </div>
            <p class="rd-desc">${data.desc}</p>
        </div>
        <div class="rd-preview-title">루틴 미리보기 (1주 기준)</div>
        <div class="rd-timeline">
    `;
    
    data.timeline.forEach(item => {
        if(item.type === 'workout') {
            html += `
            <div class="rd-item">
                <div class="rd-dot"></div>
                <div class="rd-content">
                    <div class="rd-day-title">${item.label} <span>| 총 ${item.count}개 운동</span></div>
                    <div class="rd-thumbnails">
                        ${Array(Math.min(item.count, 4)).fill(0).map((_, i) => `<div class="rd-thumb"><img src="${getMockImg(i)}"></div>`).join('')}
                    </div>
                </div>
            </div>`;
        } else {
            html += `
            <div class="rd-item">
                <div class="rd-dot rest"></div>
                <div class="rd-content">
                    <div class="rd-day-title" style="color:#aaa;">휴식 <span>| ${item.days}일</span></div>
                </div>
            </div>`;
        }
    });
    
    html += `</div>
        <div class="rd-footer">
            <div class="rd-footer-inner">
                <button class="secondary-btn" onclick="switchView('view-routine-list')">내 루틴에 저장</button>
                <button class="primary-btn" onclick="switchView('view-home')">루틴 바로 사용</button>
            </div>
        </div>
    `;
    
    document.getElementById('rd-render-area').innerHTML = html;
    switchView('view-routine-detail');
    window.scrollTo(0, 0);
};

// 훈련 리스트 및 기타 로직 생략 (공간 관계상 생략, 기존 스크립트 기능 완벽 유지)
// 훈련 리스트 그리기 호출부
function renderWorkoutList() {
    const listContainer = document.getElementById('workout-exercise-list');
    let html = '';
    currentRoutine.forEach((ex, index) => {
        const totalSets = ex.warmup + ex.top + ex.main;
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        const completedCount = savedData.length;
        const badgeColor = completedCount === totalSets ? '#E50914' : '#222';
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
    
    listContainer.innerHTML = html + `<div style="height:20px;"></div><div style="width:100%; display:flex; justify-content:center;"><button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom:20px; width:100%; max-width:600px;">운동 완료</button></div>`;

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
            badge.style.background = savedData.length === totalSets ? '#E50914' : '#222';
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
    if (completed < totalGlobalSets) { 
        hideAllModals(); modalOverlay.classList.add('active'); document.getElementById('modal-alert-incomplete').classList.add('active'); 
    } else { 
        hideAllModals(); modalOverlay.classList.add('active'); document.getElementById('modal-daily-feedback').classList.add('active'); 
    }
};

window.forceEndWorkout = function() { 
    hideAllModals(); modalOverlay.classList.add('active'); document.getElementById('modal-daily-feedback').classList.add('active'); 
};
window.selectFeedback = function(btn) {
    document.querySelectorAll('.fm-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('btn-submit-feedback').disabled = false;
};
document.getElementById('btn-submit-feedback').addEventListener('click', () => {
    closeModal();
    switchView('view-feedback');
    window.scrollTo(0, 0);
});

// 퍼포먼스 리스트 
window.openPerfDetail = function(exId) {
    const exData = currentRoutine.find(x => x.id === exId) || currentRoutine[0];
    document.getElementById('pd-render-area').innerHTML = `
        <div class="pd-img-box"><div class="pd-img-title">${exData.name}</div><div class="pd-img-wrap"><img src="${exData.img}"></div></div>
        <div class="pd-chart-section"><div class="pd-chart-top"><span class="pd-c-badge">고중량 <span style="color:#aaa; font-weight:normal; margin-left:4px;">4~7회</span></span><span class="pd-c-record">최고 기록 <span>25kg · 7회</span></span></div>
        <div class="pd-graph-area"><div class="pd-y-axis"><span>30</span><span>25</span><span>20</span></div><div class="pd-graph-content"><div class="pd-dot-wrapper" style="bottom: 50%;"><div class="pd-dot"></div><span class="pd-dot-date">09. 07.</span></div></div></div></div>
    `;
    switchView('view-perf-detail');
    window.scrollTo(0, 0);
};
