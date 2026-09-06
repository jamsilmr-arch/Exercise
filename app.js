// --- 요소 선택 및 뷰 전환 ---
const mainNav = document.getElementById('main-nav');
function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    window.scrollTo(0, 0);
}

// --- 앱 초기화 (최초 실행 여부 체크) ---
const isFirstVisit = !localStorage.getItem('onboardingCompleted');
if (isFirstVisit) {
    mainNav.style.display = 'none';
    switchView('view-splash');
} else {
    mainNav.style.display = 'flex';
    switchView('view-home');
}

// 네비게이션 이벤트 연결
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
document.getElementById('btn-start-workout').addEventListener('click', () => switchView('view-workout'));
document.getElementById('btn-back').addEventListener('click', () => switchView('view-home'));


// --- [인트로 로직] ---
const introSteps = [
    {
        badge: '★ 과부하 알고리즘', title: '다 알아서 해드립니다', desc: '퍼포먼스와 회복 속도에 맞춰\n루틴을 자동 수정해줍니다',
        html: `<div class="intro-visual"><div class="neon-card" style="transform: rotate(-5deg) scale(0.9); position: absolute; z-index: 1; opacity: 0.5;"><div style="font-size:0.8rem; color:#888;">권장 중량 표시</div></div><div class="neon-card" style="position: relative; z-index: 2;"><div style="font-size:0.8rem; color:#6C5CE7; margin-bottom: 10px;">과부하 코칭</div><div style="font-size:1.2rem; font-weight:bold; margin-bottom: 5px;">세트 수를 줄일게요</div><div style="font-size:0.75rem; color:#888;">일시적 퍼포먼스 감소가 감지되어 회복을 돕습니다.</div></div></div>`
    },
    {
        badge: '★ 100% 맞춤형 코칭을 위한', title: '사용자\n데이터 분석', desc: '',
        html: `<div class="timeline"><div class="timeline-item active"><div class="tl-title">지금 - 1주차</div><div class="tl-desc">사용자에게 적절한 루틴을 파악하기 위한 데이터 수집 기간.</div></div><div class="timeline-item"><div class="tl-title">2주차 (8일)</div><div class="tl-desc">1대1 코칭 시작. 적절 중량, 횟수가 맞춤형으로 권장되기 시작해요.</div></div><div class="timeline-item"><div class="tl-title">2주차 (10-14일)</div><div class="tl-desc">데이터 수집 완료. 피로도에 따른 강도 조절 알고리즘 작동.</div></div></div>`
    },
    {
        badge: '★ 진화하는 루틴', title: '앱을 사용할수록, 알고리즘이 사용자의 운동 데이터를 학습해 점점 더 맞춤형 루틴을 제공합니다', desc: '',
        html: `<div class="intro-visual"><div class="neon-card"><div style="font-size:0.9rem; font-weight:bold; margin-bottom:15px;">블록 완료</div><div style="font-size:0.8rem; color:#888; margin-bottom:5px;">지난 블록 동안</div><div style="font-size:1rem; color:#fff;">가슴, 등 상부 퍼포먼스가 저조했습니다.</div><div style="margin-top:20px; font-size:0.8rem; color:#6C5CE7; background:#222; padding:10px; border-radius:8px;">새로운 머신 궤적으로 교체를 제안합니다.</div></div></div>`
    }
];
let currentIntroStep = 0;
const introArea = document.getElementById('intro-content-area');
const introDots = document.getElementById('intro-pagination');
const btnIntroPrev = document.getElementById('btn-intro-prev');
const btnIntroNext = document.getElementById('btn-intro-next');

document.getElementById('btn-start-onboarding').addEventListener('click', () => {
    switchView('view-intro');
    renderIntroStep();
});

function renderIntroStep() {
    const step = introSteps[currentIntroStep];
    introArea.innerHTML = `<span class="intro-badge">${step.badge}</span><h1 class="intro-title">${step.title}</h1>${step.desc ? `<p class="intro-desc">${step.desc}</p>` : ''}${step.html}`;
    introDots.innerHTML = introSteps.map((_, idx) => `<div class="dot ${idx === currentIntroStep ? 'active' : ''}"></div>`).join('');
    btnIntroPrev.style.opacity = currentIntroStep === 0 ? '0.3' : '1';
    btnIntroNext.innerText = currentIntroStep === introSteps.length - 1 ? '계속' : '다음';
}

btnIntroNext.addEventListener('click', () => {
    if (currentIntroStep < introSteps.length - 1) {
        currentIntroStep++; renderIntroStep();
    } else {
        switchView('view-settings'); renderWizardStep();
    }
});
btnIntroPrev.addEventListener('click', () => {
    if (currentIntroStep > 0) { currentIntroStep--; renderIntroStep(); }
});


// --- [수정됨] 설정 마법사 로직 (디폴트 미선택 및 클릭 반응 추가) ---
const wizardSteps = [
    { title: '체중을 알려주세요', desc: '정확한 중량 추천을 위해 필요해요', type: 'input', value: '', placeholder: '72', unit: 'kg', hint: '체중은 알고리즘이 권장 중량을 계산할 때 사용돼요.' },
    { title: '나이를 알려주세요', desc: '회복 속도와 훈련 강도 설계에 참고해요', type: 'input', value: '', placeholder: '29', unit: '세', hint: '연령에 따른 중추신경계 회복 속도를 반영합니다.' },
    { title: '현재 체지방을\n알려주세요', desc: '정확하지 않아도 괜찮아요. 대략적인 수치면 충분해요', type: 'input', value: '', placeholder: '18.2', unit: '%', hint: '인바디 결과가 있으면 그 수치를 넣어주세요.' },
    // value를 null로 세팅하여 최초 아무것도 선택되지 않도록 변경
    { title: '주당 운동 횟수', desc: '일주일에 몇 번 운동할 수 있나요?', type: 'grid', options: [1, 2, 3, 4, 5, 6], value: null, hint: '선택하신 횟수에 맞춰 최적의 분할 루틴을 추천해 드릴게요.' },
    { title: '근비대 vs 스트렝스,\n어느쪽이 목표인가요?', desc: '루틴의 세트 및 볼륨 구성이 달라집니다.', type: 'slider', value: '근비대 집중', hint: '근육 크기와 볼륨을 최대한 키우는 훈련에 집중합니다.' }
];

let currentWizardStep = 0;

function renderWizardStep() {
    const step = wizardSteps[currentWizardStep];
    document.getElementById('q-title').innerText = step.title;
    document.getElementById('q-desc').innerText = step.desc;
    document.getElementById('q-hint').innerText = step.hint;
    document.getElementById('step-counter').innerText = `질문 ${currentWizardStep + 1}/${wizardSteps.length}`;
    document.getElementById('wizard-progress').style.width = `${((currentWizardStep + 1) / wizardSteps.length) * 100}%`;

    const inputArea = document.getElementById('wizard-input-area');
    
    if (step.type === 'input') {
        inputArea.innerHTML = `
            <div class="input-box">
                <input type="number" class="input-val" value="${step.value}" placeholder="${step.placeholder}">
                <span class="input-unit">${step.unit}</span>
            </div>
            <div style="text-align:center; font-size:0.8rem; color:#666; margin-bottom: 20px;">입력 후 다음을 눌러주세요</div>
        `;
    } 
    else if (step.type === 'grid') {
        // data-value 속성을 추가하여 클릭 시 어떤 숫자인지 자바스크립트가 인식하게 함
        inputArea.innerHTML = `<div class="grid-options">` + step.options.map(opt => `
            <div class="opt-btn ${opt === step.value ? 'active' : ''}" data-value="${opt}">
                ${opt}<span class="opt-sub">회/주</span>
            </div>`).join('') + `</div>`;
        
        // [중요] 버튼 클릭 시 활성화 처리 및 데이터 갱신 리스너 추가
        const gridBtns = inputArea.querySelectorAll('.opt-btn');
        gridBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                gridBtns.forEach(b => b.classList.remove('active')); // 기존 보라색 끄기
                const targetBtn = e.currentTarget;
                targetBtn.classList.add('active'); // 누른 버튼 보라색 켜기
                
                const selectedVal = parseInt(targetBtn.getAttribute('data-value'));
                step.value = selectedVal; // 데이터 저장
                
                // 클릭한 횟수에 따라 힌트 텍스트 동적 변경
                const hintEl = document.getElementById('q-hint');
                if(selectedVal === 3) hintEl.innerText = '주 3회 (밀기/당기기/하체) 3분할 루틴으로 구성할게요.';
                else if(selectedVal === 4) hintEl.innerText = '주 4회 2분할(상/하체) 루틴을 추천합니다.';
                else hintEl.innerText = `주 ${selectedVal}회에 맞춘 최적의 루틴으로 구성할게요.`;
            });
        });
    } 
    else if (step.type === 'slider') {
        inputArea.innerHTML = `
            <div class="slider-container">
                <div id="slider-display" class="slider-val-text">${step.value}</div>
                <div class="slider-sub-text">스트렝스 0 : 근비대 100</div>
                <input type="range" id="goal-slider" min="0" max="100" value="0">
                <div class="slider-labels">
                    <span>← 근비대</span>
                    <span>스트렝스 →</span>
                </div>
            </div>
        `;

        // 슬라이더 조작 시 텍스트 실시간 변경 리스너 추가
        const sliderInput = document.getElementById('goal-slider');
        const sliderDisplay = document.getElementById('slider-display');
        sliderInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (val < 33) {
                step.value = '근비대 집중';
                document.getElementById('q-hint').innerText = '근육 크기와 볼륨을 최대한 키우는 훈련에 집중합니다.';
            } else if (val < 66) {
                step.value = '근비대 / 스트렝스 균형';
                document.getElementById('q-hint').innerText = '크기와 근력을 동시에 키우는 밸런스 훈련입니다.';
            } else {
                step.value = '스트렝스 집중';
                document.getElementById('q-hint').innerText = '최대 근력을 끌어올리는 고중량 저반복 훈련입니다.';
            }
            sliderDisplay.innerText = step.value;
        });
    }

    document.getElementById('btn-next-step').innerText = currentWizardStep === wizardSteps.length - 1 ? '완료' : '다음';
    document.getElementById('btn-prev-step').style.opacity = currentWizardStep === 0 ? '0.3' : '1';
}

document.getElementById('btn-next-step').addEventListener('click', () => {
    // 입력창이 있을 경우 임시로 값 저장
    const activeInput = document.querySelector('.input-val');
    if (activeInput) { wizardSteps[currentWizardStep].value = activeInput.value; }

    if (currentWizardStep < wizardSteps.length - 1) {
        currentWizardStep++;
        renderWizardStep();
    } else {
        localStorage.setItem('onboardingCompleted', 'true');
        mainNav.style.display = 'flex';
        switchView('view-home');
    }
});
document.getElementById('btn-prev-step').addEventListener('click', () => {
    if (currentWizardStep > 0) {
        currentWizardStep--;
        renderWizardStep();
    }
});

// --- 기존 훈련 렌더링 및 타이머 로직 ---
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];

let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');
const mainContainer = document.getElementById('exercise-list');

function renderWorkout() {
    mainContainer.innerHTML = '';
    routine.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `<div class="exercise-header"><span style="font-size: 1.05rem; font-weight: bold;">${ex.name}</span><span style="font-size: 0.85rem; color: #888;">${ex.reps} / 휴식 ${ex.rest}초</span></div>`;
        const setContainer = document.createElement('div');
        setContainer.className = 'set-container';
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];

        for (let i = 1; i <= ex.sets; i++) {
            const btn = document.createElement('div');
            btn.className = `set-btn ${savedData.includes(i) ? 'completed' : ''}`;
            btn.innerText = i;
            btn.addEventListener('click', () => handleSetClick(ex, i, btn, savedData));
            setContainer.appendChild(btn);
        }
        card.appendChild(setContainer);
        mainContainer.appendChild(card);
    });
}

function handleSetClick(exercise, setNum, btnElement, savedData) {
    if (savedData.includes(setNum)) {
        savedData = savedData.filter(num => num !== setNum);
        btnElement.classList.remove('completed');
    } else {
        savedData.push(setNum);
        btnElement.classList.add('completed');
        if (navigator.vibrate) navigator.vibrate(50);
        startTimer(exercise.rest);
    }
    localStorage.setItem(`workout_${exercise.id}`, JSON.stringify(savedData));
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    endTime = Date.now() + (seconds * 1000);
    timerDisplay.classList.add('active');
    timerInterval = setInterval(() => {
        const timeRemaining = Math.ceil((endTime - Date.now()) / 1000);
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.classList.remove('active');
            timerDisplay.innerText = "진행!";
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } else {
            const m = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
            const s = String(timeRemaining % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }
    }, 200);
}

renderWorkout();
