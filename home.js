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

    document.getElementById('home-today-day').innerText = `Day 1`;
    document.getElementById('home-today-count').innerText = `${currentRoutine.length}개 운동`;
    totalGlobalSets = currentRoutine.reduce((acc, ex) => acc + ex.warmup + ex.top + ex.main, 0);
    document.getElementById('home-today-sets').innerText = `${totalGlobalSets}세트`;
}

auth.onAuthStateChanged(async (user) => {
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

document.getElementById('btn-nav-settings').addEventListener('click', () => { window.location.href = 'index.html?edit=true'; });
document.getElementById('btn-edit-routine').addEventListener('click', () => { window.location.href = 'index.html?edit=true'; });
document.getElementById('btn-go-condition').addEventListener('click', () => { switchView('view-condition'); });

const condSlider = document.getElementById('cond-slider');
const condScore = document.getElementById('cond-score');
const condText = document.getElementById('cond-text');
const condLabels = ['매우 나빠요', '조금 피곤해요', '평소와 같이 무난해요', '컨디션이 좋아요', '날아갈 것 같아요!'];
condSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    condScore.innerText = `${val}점`;
    condText.innerText = condLabels[val - 1];
});

const btnMusclePain = document.getElementById('btn-muscle-pain');
btnMusclePain.addEventListener('click', () => { btnMusclePain.classList.toggle('active'); });

document.getElementById('btn-start-workout-list').addEventListener('click', () => {
    renderWorkoutList();
    switchView('view-workout');
});

// --- 운동 리스트 렌더링 ---
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
        
        let toggleHtml = '';
        if (ex.type === 'bodyweight') {
            toggleHtml = `<div class="toggle-switch-group"><div class="toggle-item active">맨몸</div><div class="toggle-item">일반</div></div>`;
        } else {
            toggleHtml = `<div class="toggle-switch-group"><div class="toggle-item active">kg</div><div class="toggle-item">lbs</div></div>`;
        }

        const formHeader = `<div class="set-header-row"><span>${unitText1}</span><span>횟수</span></div>`;

        let warmupHtml = '';
        if (ex.warmup > 0) {
            warmupHtml += `<div class="set-group"><div class="set-badge">웜업 세트</div>${formHeader}`;
            for (let i=1; i<=ex.warmup; i++) {
                const setId = `w${i}`;
                const isChecked = savedData.includes(setId) ? 'completed' : '';
                const rirLabel = (i === ex.warmup) ? '5 RIR' : '6 RIR'; 
                warmupHtml += `
                    <div class="set-row">
                        <div class="set-label">${rirLabel}</div>
                        <div class="set-input-box">
                            <input type="number" class="set-input" placeholder="0">
                            <input type="number" class="set-input" placeholder="0">
                        </div>
                        <div class="set-check ${isChecked}" data-id="${setId}" data-time="35" data-ex="${ex.name}">✓</div>
                    </div>
                `;
            }
            warmupHtml += `</div>`;
        }

        let topHtml = '';
        if (ex.top > 0) {
            topHtml += `<div class="set-group"><div class="set-badge">탑 세트</div>${formHeader}`;
            const setId = `t1`;
            const isChecked = savedData.includes(setId) ? 'completed' : '';
            topHtml += `
                <div class="set-row">
                    <div class="set-label">1 RIR</div>
                    <div class="set-input-box">
                        <input type="number" class="set-input" placeholder="고중량">
                        <input type="text" class="set-input" placeholder="4-7">
                    </div>
                    <div class="set-check ${isChecked}" data-id="${setId}" data-time="90" data-ex="${ex.name}">✓</div>
                </div>
            `;
            topHtml += `</div>`;
        }

        let mainHtml = '';
        if (ex.main > 0) {
            mainHtml += `<div class="set-group"><div class="set-badge">본 세트</div>${formHeader}`;
            for (let i=1; i<=ex.main; i++) {
                const setId = `m${i}`;
                const isChecked = savedData.includes(setId) ? 'completed' : '';
                mainHtml += `
                    <div class="set-row">
                        <div class="set-label">1 RIR</div>
                        <div class="set-input-box">
                            <input type="number" class="set-input" placeholder="중량">
                            <input type="text" class="set-input" placeholder="8-12">
                        </div>
                        <div class="set-check ${isChecked}" data-id="${setId}" data-time="90" data-ex="${ex.name}">✓</div>
                    </div>
                `;
            }
            mainHtml += `</div>`;
        }

        html += `
            <div class="ex-row" id="ex-row-${index}">
                <div class="ex-header" onclick="toggleAccordion(${index})">
                    <div class="ex-thumb"><img src="${ex.img}" alt="Exercise"></div>
                    <div class="ex-info">
                        <div class="ex-name">${ex.name}</div>
                        <div class="ex-progress-badge" id="badge-${index}" style="background:${badgeColor}; color:${badgeTextColor};">${completedCount} / ${totalSets} 완료</div>
                    </div>
                    <div class="ex-drag-icon">⋮⋮</div>
                </div>
                <div class="ex-details">
                    <div class="ex-detail-img">
                        <img src="${ex.img}">
                        <button class="btn-memo">메모</button>
                    </div>
                    <div class="ex-tools">
                        <button class="btn-superset">+ 슈퍼세트</button>
                        ${toggleHtml}
                    </div>
                    ${warmupHtml}
                    ${topHtml}
                    ${mainHtml}
                    <div class="set-add-btns">
                        <button>+ 세트 추가</button>
                        <button>- 세트 삭제</button>
                    </div>
                </div>
            </div>
        `;
    });
    listContainer.innerHTML = html;

    listContainer.innerHTML += `
        <div style="height: 20px;"></div>
        <button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom: 20px;">운동 완료</button>
    `;

    document.querySelector('.workout-footer').innerHTML = `
        <button class="floating-edit-btn" onclick="window.location.href='index.html?edit=true'">✏️ 루틴 수정</button>
    `;

    document.querySelectorAll('.set-check').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('completed');
            
            const row = this.closest('.ex-row');
            const exIndex = row.id.split('-')[2];
            const exData = currentRoutine[exIndex];
            const setId = this.getAttribute('data-id');
            let savedData = JSON.parse(localStorage.getItem(`workout_${exData.id}`)) || [];

            if (this.classList.contains('completed')) {
                if (!savedData.includes(setId)) savedData.push(setId);
                const time = parseInt(this.getAttribute('data-time'));
                const exName = this.getAttribute('data-ex');
                startGlobalTimer(time, exName);
            } else {
                savedData = savedData.filter(id => id !== setId);
            }
            
            localStorage.setItem(`workout_${exData.id}`, JSON.stringify(savedData));

            const totalSets = exData.warmup + exData.top + exData.main;
            const badge = document.getElementById(`badge-${exIndex}`);
            badge.innerText = `${savedData.length} / ${totalSets} 완료`;
            
            if (savedData.length === totalSets) {
                badge.style.background = '#2e6bdf';
                badge.style.color = '#fff';
            } else {
                badge.style.background = '#2c2c2e';
                badge.style.color = '#aaa';
            }
        });
    });
}

window.toggleAccordion = function(index) {
    const row = document.getElementById(`ex-row-${index}`);
    row.classList.toggle('expanded');
};

// --- 상단 드롭다운 글로벌 타이머 ---
let globalTimerInterval = null;
let targetEndTime = 0;
let totalDuration = 0;
const timerUi = document.getElementById('global-timer-ui');
const timerDisplay = document.getElementById('gst-time-display');
const timerProgress = document.getElementById('gst-progress');

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function startGlobalTimer(seconds, exName) {
    clearInterval(globalTimerInterval);
    totalDuration = seconds;
    targetEndTime = Date.now() + (seconds * 1000);
    
    document.getElementById('gst-ex-name').innerText = exName;
    document.getElementById('gst-rest-text').innerText = `권장 휴식 시간 ${formatTime(seconds)}`;
    timerDisplay.innerText = formatTime(seconds);
    timerProgress.style.width = '100%';
    timerUi.style.display = 'flex'; 

    globalTimerInterval = setInterval(() => {
        const remaining = Math.ceil((targetEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(globalTimerInterval);
            timerDisplay.innerText = "진행!";
            timerProgress.style.width = '0%';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setTimeout(() => { timerUi.style.display = 'none'; }, 3000); 
        } else {
            timerDisplay.innerText = formatTime(remaining);
            timerProgress.style.width = `${(remaining / totalDuration) * 100}%`;
        }
    }, 100);
}

document.getElementById('gst-close').addEventListener('click', () => {
    clearInterval(globalTimerInterval);
    timerUi.style.display = 'none';
});


// --- 완료 처리 및 다중 모달 로직 ---
const modalOverlay = document.getElementById('common-modal-overlay');
const mGuide = document.getElementById('modal-guide');
const mAlert = document.getElementById('modal-alert-incomplete');
const mFeedback = document.getElementById('modal-daily-feedback');
const mCoach = document.getElementById('modal-coach');
const btnSubmitFeedback = document.getElementById('btn-submit-feedback');

function showSpecificModal(modalElem) {
    mGuide.classList.remove('active');
    mAlert.classList.remove('active');
    mFeedback.classList.remove('active');
    mCoach.classList.remove('active');
    
    modalOverlay.classList.add('active');
    modalElem.classList.add('active');
}

window.closeModal = function() {
    modalOverlay.classList.remove('active');
    mGuide.classList.remove('active');
    mAlert.classList.remove('active');
    mFeedback.classList.remove('active');
    mCoach.classList.remove('active');
};

const guideData = {
    rir: [
        { sub: 'RiR(Reps In Reserve) 가이드', title: '1. RIR의 정의', icon: '✦', desc: 'RIR은 <span class="green">실패 지점까지 몇 회가 남았는지</span>를 나타내는 지표입니다.', box: '공식 : RIR = 남은 횟수<br><br>예시 : 물리적 한계가 10회일 때<br>9회를 수행하면 -> <span class="green">RIR 1</span><br>8회를 수행하면 -> <span class="green">RIR 2</span>' },
        { sub: 'RiR(Reps In Reserve) 가이드', title: '2. 객관적 판단의 중요성', icon: '✦', desc: '많은 분들이 엄살이나 귀찮음 때문에 자신의 <span class="green">진정한 한계</span>를 과소평가하여 RIR을 잘못 설정하곤 합니다.', box: '주관적인 \'힘듦\'보다는 <span class="green">수행 속도 (Bar Speed)</span>의 변화를 기준으로 객관적으로 판단해야 합니다.' }
    ],
    warmup: [
        { sub: '웜업 가이드', title: '1. 웜업이란?', icon: '✦', desc: '웜업은 본 세트의 수행 능력을 높이기 위해 저중량으로 미리 연습하는 과정입니다.', box: '· 근육과 관절에 혈류 공급<br>· 근신경계 활성화<br>· 퍼포먼스 향상 & 근성장 자극 극대화' }
    ]
};
let currentModalType = '';
let currentModalStep = 0;

window.openModal = function(type) {
    currentModalType = type;
    currentModalStep = 0;
    document.getElementById('modal-badge-title').innerText = type === 'rir' ? 'RIR 가이드' : '웜업 가이드';
    renderGuideStep();
    showSpecificModal(mGuide);
};

function renderGuideStep() {
    const data = guideData[currentModalType][currentModalStep];
    document.getElementById('modal-content-area').innerHTML = `
        <div class="m-sub">${data.sub}</div>
        <div class="m-title">${data.title}</div>
        <div class="m-point"><span class="m-point-icon">${data.icon}</span><div class="m-point-text">${data.desc}</div></div>
        <div class="m-box">${data.box}</div>
    `;
    document.getElementById('modal-btn-prev').style.display = currentModalStep === 0 ? 'none' : 'block';
    document.getElementById('modal-btn-next').innerText = currentModalStep === guideData[currentModalType].length - 1 ? '확인' : '다음';
}

document.getElementById('modal-btn-prev').addEventListener('click', () => {
    if (currentModalStep > 0) { currentModalStep--; renderGuideStep(); }
});
document.getElementById('modal-btn-next').addEventListener('click', () => {
    if (currentModalStep < guideData[currentModalType].length - 1) { 
        currentModalStep++; renderGuideStep(); 
    } else { closeModal(); }
});


window.checkFinishWorkout = function() {
    let completedSets = 0;
    currentRoutine.forEach(ex => {
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        completedSets += savedData.length;
    });

    if (completedSets < totalGlobalSets) {
        showSpecificModal(mAlert);
    } else {
        showSpecificModal(mFeedback);
    }
};

window.forceEndWorkout = function() {
    showSpecificModal(mFeedback);
};

window.selectFeedback = function(btn) {
    document.querySelectorAll('.fm-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    btnSubmitFeedback.disabled = false;
};

// --- [신규] 과부하 코치 슬라이드 로직 ---
const coachData = [
    {
        sub: '',
        title: '첫 번째 운동을 완료했어요!',
        content: '<p class="coach-desc">안녕하세요! 급진적 과부하 코치예요.<br><br>첫 주에는 각 운동에서 어떤 중량과 횟수를 수행하는지 살펴볼 거예요. 처음엔 적정 중량을 가늠하기 어려울 수 있으니, 실제로 수행한 그대로만 기록해주시면 됩니다.<br><br>이번 주 데이터를 바탕으로 <span class="highlight">2주차부터 본격적인 코칭을 시작할게요.</span> 앞으로 함께해봐요!</p>'
    },
    {
        sub: '완료 현황',
        title: '마치지 못한 운동이 있어요',
        content: `
            <div class="coach-box">
                <span class="cb-name">덤벨 체스트 플라이</span>
                <span class="cb-val" style="float:right; font-size:0.85rem;">운동 전체 미완료</span>
            </div>
            <p class="coach-desc" style="margin-top:20px;">시간이 부족했거나 오늘 컨디션이 좋지 않았다면 무리해서 완료할 필요는 없어요.<br><br>다음 운동에서 다시 이어가면 되니 너무 부담 갖지 마세요!<br><br>2주차부터는 알고리즘이 피로도에 따라 루틴을 조절해드리니 걱정하지 않으셔도 됩니다:)</p>
        `
    },
    {
        sub: '세트 퍼포먼스 분석',
        title: '강도를 조금 더 높여봐도 좋아요',
        content: `
            <div class="coach-box">
                <span class="cb-name">풀업 뉴트럴 그립</span>
                <div class="cb-row"><span>2번째 세트</span><span class="cb-val">2회</span></div>
                <div class="cb-row"><span>3번째 세트</span><span class="cb-val">2회</span></div>
            </div>
            <p class="coach-desc" style="margin-top:20px;">일반적으로 세트가 진행될수록 횟수가 감소하는 게 정상이에요.<br><br>아마 <span style="color:#00d8d6; font-weight:bold;">세트 사이 회복이 충분했거나</span> 회복 속도가 빨라 횟수가 유지된 것 같아요. 큰 문제는 아니에요.<br><br>다만 스스로 느끼시기에 강도가 높지 않았다면, 더 좋은 근성장을 위해 다음엔 권장 RIR에 맞춰 조금 더 높은 강도로 수행해보세요.</p>
        `
    },
    {
        sub: '권장 횟수 분석',
        title: '권장 범위를 조금 벗어났어요',
        content: `
            <div class="coach-box">
                <span class="cb-name">케이블 로우 (중간-넓은 오버 그립)</span>
                <div class="cb-row"><span>1번째 세트</span><span class="cb-val">40kg × 6회 · 권장 8~12회</span></div>
                <div class="cb-row"><span>2번째 세트</span><span class="cb-val">30kg × 14회 · 권장 8~12회</span></div>
            </div>
            <p class="coach-desc" style="margin-top:20px;">적게 수행한 세트는 중량이 무거웠을 수 있고, 많이 수행한 세트는 가벼웠을 수 있어요.<br><br>익숙하지 않은 운동은 적정 중량을 가늠하기 어려우니 걱정하지 않으셔도 됩니다. 다음엔 더 적절한 중량을 안내해드릴게요.</p>
        `
    }
];

let coachStep = 0;

btnSubmitFeedback.addEventListener('click', () => {
    coachStep = 0;
    renderCoachStep();
    showSpecificModal(mCoach);
});

function renderCoachStep() {
    const data = coachData[coachStep];
    
    const subText = document.getElementById('coach-sub-text');
    if(data.sub) {
        subText.style.display = 'block';
        subText.innerText = data.sub;
    } else {
        subText.style.display = 'none';
    }

    document.getElementById('coach-title-text').innerText = data.title;
    document.getElementById('coach-content-area').innerHTML = data.content;

    let dotsHtml = '';
    for(let i=0; i<coachData.length; i++) {
        dotsHtml += `<div class="cdot ${i===coachStep?'active':''}"></div>`;
    }
    document.getElementById('coach-dots-area').innerHTML = dotsHtml;
    
    document.getElementById('btn-coach-next').innerText = coachStep === coachData.length - 1 ? '완료' : '다음';
}

document.getElementById('btn-coach-next').addEventListener('click', () => {
    if (coachStep < coachData.length - 1) {
        coachStep++;
        renderCoachStep();
    } else {
        closeModal();
        switchView('view-feedback');
        window.scrollTo(0, 0);
    }
});
