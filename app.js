// --- 기존 뷰 전환 및 훈련 타이머 로직 (유지) ---
const navItems = document.querySelectorAll('.nav-item');
function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    window.scrollTo(0, 0);
}
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchView(target);
        }
    });
});
document.getElementById('btn-start-workout').addEventListener('click', () => switchView('view-workout'));
document.getElementById('btn-back').addEventListener('click', () => switchView('view-home'));

// 훈련 화면 렌더링 로직 (생략: 기존 코드와 동일하게 유지)

// --- [신규] 설정 마법사 (Wizard) 로직 ---
const wizardSteps = [
    {
        title: '체중을 알려주세요',
        desc: '정확한 중량 추천을 위해 필요해요',
        type: 'input',
        value: 72, // 설정 기본값
        unit: 'kg',
        hint: '체중은 알고리즘이 권장 중량을 계산할 때 사용돼요.'
    },
    {
        title: '나이를 알려주세요',
        desc: '회복 속도와 훈련 강도 설계에 참고해요',
        type: 'input',
        value: 29, // 설정 기본값
        unit: '세',
        hint: '연령에 따른 중추신경계 회복 속도를 반영합니다.'
    },
    {
        title: '현재 체지방을\n알려주세요',
        desc: '정확하지 않아도 괜찮아요. 대략적인 수치면 충분해요',
        type: 'input',
        value: 18.2, // 설정 기본값
        unit: '%',
        hint: '인바디 결과가 있으면 그 수치를 넣어주세요.'
    },
    {
        title: '주당 운동 횟수',
        desc: '일주일에 몇 번 운동할 수 있나요?',
        type: 'grid',
        options: [1, 2, 3, 4, 5, 6],
        value: 3, // 3분할 루틴 기본값
        hint: '주 3회 (밀기/당기기/하체) 3분할 루틴으로 구성할게요.'
    },
    {
        title: '근비대 vs 스트렝스,\n어느쪽이 목표인가요?',
        desc: '루틴의 세트 및 볼륨 구성이 달라집니다.',
        type: 'slider',
        value: '근비대 집중', // 린매스업 기본값
        hint: '근육 크기와 볼륨을 최대한 키우는 훈련에 집중합니다.'
    }
];

let currentStep = 0;

const qTitle = document.getElementById('q-title');
const qDesc = document.getElementById('q-desc');
const qHint = document.getElementById('q-hint');
const inputArea = document.getElementById('wizard-input-area');
const stepCounter = document.getElementById('step-counter');
const progressBar = document.getElementById('wizard-progress');
const btnNext = document.getElementById('btn-next-step');
const btnPrev = document.getElementById('btn-prev-step');

function renderWizardStep() {
    const step = wizardSteps[currentStep];
    
    // 텍스트 및 프로그레스 업데이트
    qTitle.innerText = step.title;
    qDesc.innerText = step.desc;
    qHint.innerText = step.hint;
    stepCounter.innerText = `질문 ${currentStep + 1}/${wizardSteps.length}`;
    progressBar.style.width = `${((currentStep + 1) / wizardSteps.length) * 100}%`;

    // 입력 폼 동적 렌더링
    inputArea.innerHTML = '';
    
    if (step.type === 'input') {
        inputArea.innerHTML = `
            <div class="input-box">
                <input type="number" class="input-val" value="${step.value}">
                <span class="input-unit">${step.unit}</span>
            </div>
            <div style="text-align:center; font-size:0.8rem; color:#666;">입력 후 다음을 눌러주세요</div>
        `;
    } 
    else if (step.type === 'grid') {
        let gridHtml = '<div class="grid-options">';
        step.options.forEach(opt => {
            const isActive = opt === step.value ? 'active' : '';
            gridHtml += `<div class="opt-btn ${isActive}">${opt}<span class="opt-sub">회/주</span></div>`;
        });
        gridHtml += '</div>';
        inputArea.innerHTML = gridHtml;
    }
    else if (step.type === 'slider') {
        inputArea.innerHTML = `
            <div class="slider-container">
                <div class="slider-val-text">${step.value}</div>
                <div class="slider-sub-text">스트렝스 0 : 근비대 100</div>
                <input type="range" min="0" max="100" value="0">
                <div class="slider-labels">
                    <span>← 근비대</span>
                    <span>스트렝스 →</span>
                </div>
            </div>
        `;
    }

    // 버튼 텍스트 변경 (마지막 단계)
    btnNext.innerText = currentStep === wizardSteps.length - 1 ? '완료' : '다음';
    btnPrev.style.opacity = currentStep === 0 ? '0.3' : '1';
}

btnNext.addEventListener('click', () => {
    if (currentStep < wizardSteps.length - 1) {
        currentStep++;
        renderWizardStep();
    } else {
        alert("맞춤형 루틴 세팅이 완료되었습니다!");
        switchView('view-home');
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        renderWizardStep();
    }
});

// 초기화
renderWizardStep();
