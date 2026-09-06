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
    mainNav.style.display = 'none'; // 온보딩 중 하단 네비게이션 숨김
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


// --- [신규] 인트로 (기능 소개) 로직 ---
const introSteps = [
    {
        badge: '★ 과부하 알고리즘',
        title: '다 알아서 해드립니다',
        desc: '퍼포먼스와 회복 속도에 맞춰\n루틴을 자동 수정해줍니다',
        html: `
            <div class="intro-visual">
                <div class="neon-card" style="transform: rotate(-5deg) scale(0.9); position: absolute; z-index: 1; opacity: 0.5;">
                    <div style="font-size:0.8rem; color:#888;">권장 중량 표시</div>
                </div>
                <div class="neon-card" style="position: relative; z-index: 2;">
                    <div style="font-size:0.8rem; color:#6C5CE7; margin-bottom: 10px;">과부하 코칭</div>
                    <div style="font-size:1.2rem; font-weight:bold; margin-bottom: 5px;">세트 수를 줄일게요</div>
                    <div style="font-size:0.75rem; color:#888;">일시적 퍼포먼스 감소가 감지되어 회복을 돕습니다.</div>
                </div>
            </div>`
    },
    {
        badge: '★ 100% 맞춤형 코칭을 위한',
        title: '사용자\n데이터 분석',
        desc: '',
        html: `
            <div class="timeline">
                <div class="timeline-item active">
                    <div class="tl-title">지금 - 1주차</div>
                    <div class="tl-desc">사용자에게 적절한 루틴을 파악하기 위한 데이터 수집 기간.</div>
                </div>
                <div class="timeline-item">
                    <div class="tl-title">2주차 (8일)</div>
                    <div class="tl-desc">1대1 코칭 시작. 적절 중량, 횟수가 맞춤형으로 권장되기 시작해요.</div>
                </div>
                <div class="timeline-item">
                    <div class="tl-title">2주차 (10-14일)</div>
                    <div class="tl-desc">데이터 수집 완료. 피로도에 따른 강도 조절 알고리즘 작동.</div>
                </div>
            </div>`
    },
    {
        badge: '★ 진화하는 루틴',
        title: '앱을 사용할수록, 알고리즘이 사용자의 운동 데이터를 학습해 점점 더 맞춤형 루틴을 제공합니다',
        desc: '',
        html: `
            <div class="intro-visual">
                <div class="neon-card">
                    <div style="font-size:0.9rem; font-weight:bold; margin-bottom:15px;">블록 완료</div>
                    <div style="font-size:0.8rem; color:#888; margin-bottom:5px;">지난 블록 동안</div>
                    <div style="font-size:1rem; color:#fff;">가슴, 등 상부 퍼포먼스가 저조했습니다.</div>
                    <div style="margin-top:20px; font-size:0.8rem; color:#6C5CE7; background:#222; padding:10px; border-radius:8px;">새로운 머신 궤적으로 교체를 제안합니다.</div>
                </div>
            </div>`
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
    introArea.innerHTML = `
        <span class="intro-badge">${step.badge}</span>
        <h1 class="intro-title">${step.title}</h1>
        ${step.desc ? `<p class="intro-desc">${step.desc}</p>` : ''}
        ${step.html}
    `;

    // Dots 업데이트
    introDots.innerHTML = introSteps.map((_, idx) => 
        `<div class="dot ${idx === currentIntroStep ? 'active' : ''}"></div>`
    ).join('');

    btnIntroPrev.style.opacity = currentIntroStep === 0 ? '0.3' : '1';
    btnIntroNext.innerText = currentIntroStep === introSteps.length - 1 ? '계속' : '다음';
}

btnIntroNext.addEventListener('click', () => {
    if (currentIntroStep < introSteps.length - 1) {
        currentIntroStep++;
        renderIntroStep();
    } else {
        // 인트로 종료 -> 마법사(설정) 시작
        switchView('view-settings');
        renderWizardStep();
    }
});
btnIntroPrev.addEventListener('click', () => {
    if (currentIntroStep > 0) {
        currentIntroStep--;
        renderIntroStep();
    }
});


// --- 기존 맞춤형 설정 마법사 (Wizard) 로직 ---
const wizardSteps = [
    { title: '체중을 알려주세요', desc: '정확한 중량 추천을 위해 필요해요', type: 'input', value: 72, unit: 'kg', hint: '체중은 알고리즘이 권장 중량을 계산할 때 사용돼요.' },
    { title: '나이를 알려주세요', desc: '회복 속도와 훈련 강도 설계에 참고해요', type: 'input', value: 29, unit: '세', hint: '연령에 따른 중추신경계 회복 속도를 반영합니다.' },
    { title: '현재 체지방을\n알려주세요', desc: '정확하지 않아도 괜찮아요. 대략적인 수치면 충분해요', type: 'input', value: 18.2, unit: '%', hint: '인바디 결과가 있으면 그 수치를 넣어주세요.' },
    { title: '주당 운동 횟수', desc: '일주일에 몇 번 운동할 수 있나요?', type: 'grid', options: [1, 2, 3, 4, 5, 6], value: 3, hint: '주 3회 (밀기/당기기/하체) 3분할 루틴으로 구성할게요.' },
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
        inputArea.innerHTML = `<div class="input-box"><input type="number" class="input-val" value="${step.value}"><span class="input-unit">${step.unit}</span></div>`;
    } else if (step.type === 'grid') {
        inputArea.innerHTML = `<div class="grid-options">` + step.options.map(opt => `<div class="opt-btn ${opt === step.value ? 'active' : ''}">${opt}<span class="opt-sub">회/주</span></div>`).join('') + `</div>`;
    } else if (step.type === 'slider') {
        inputArea.innerHTML = `<div class="slider-container"><div class="slider-val-text">${step.value}</div><div class="slider-sub-text">스트렝스 0 : 근비대 100</div><input type="range" min="0" max="100" value="0"><div class="slider-labels"><span>← 근비대</span><span>스트렝스 →</span></div></div>`;
    }

    document.getElementById('btn-next-step').innerText = currentWizardStep === wizardSteps.length - 1 ? '완료' : '다음';
    document.getElementById('btn-prev-step').style.opacity = currentWizardStep === 0 ? '0.3' : '1';
}

document.getElementById('btn-next-step').addEventListener('click', () => {
    if (currentWizardStep < wizardSteps.length - 1) {
        currentWizardStep++;
        renderWizardStep();
    } else {
        // 모든 온보딩 완료 시 로컬 스토리지 저장 및 홈으로 진입
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


// --- 기존 훈련 렌더링 및 타이머 로직 (동일하게 유지됨) ---
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];
// (이하 handleSetClick 및 startTimer 로직은 이전 코드와 완전히 동일하게 작동합니다)
