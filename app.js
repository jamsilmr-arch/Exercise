// --- 요소 선택 및 뷰 전환 ---
const mainNav = document.getElementById('main-nav');
function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    window.scrollTo(0, 0);
}

// 최초 진입 체크
const isFirstVisit = !localStorage.getItem('onboardingCompleted');
if (isFirstVisit) {
    mainNav.style.display = 'none';
    switchView('view-splash');
} else {
    mainNav.style.display = 'flex';
    switchView('view-home');
}

// 네비게이션 설정
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

// --- 인트로 로직 (최초 1회 노출) ---
const introSteps = [
    { badge: '★ 점진적 성장 알고리즘', title: '다 알아서 해드립니다', desc: '퍼포먼스와 회복 속도에 맞춰\n루틴을 자동 수정해줍니다', html: `<div class="intro-visual"><div class="neon-card" style="transform: rotate(-5deg) scale(0.9); position: absolute; z-index: 1; opacity: 0.5;"><div style="font-size:0.8rem; color:#888;">권장 중량 표시</div></div><div class="neon-card" style="position: relative; z-index: 2;"><div style="font-size:0.8rem; color:#6C5CE7; margin-bottom: 10px;">성장 코칭</div><div style="font-size:1.2rem; font-weight:bold; margin-bottom: 5px;">세트 수를 줄일게요</div><div style="font-size:0.75rem; color:#888;">일시적 퍼포먼스 감소가 감지되어 회복을 돕습니다.</div></div></div>` },
    { badge: '★ 100% 맞춤형 코칭을 위한', title: '사용자\n데이터 분석', desc: '', html: `<div class="timeline"><div class="timeline-item active"><div class="tl-title">지금 - 1주차</div><div class="tl-desc">사용자에게 적절한 루틴을 파악하기 위한 데이터 수집 기간.</div></div><div class="timeline-item"><div class="tl-title">2주차 (8일)</div><div class="tl-desc">1대1 코칭 시작. 적절 중량, 횟수가 맞춤형으로 권장되기 시작해요.</div></div><div class="timeline-item"><div class="tl-title">2주차 (10-14일)</div><div class="tl-desc">데이터 수집 완료. 피로도에 따른 강도 조절 알고리즘 작동.</div></div></div>` },
    { badge: '★ 진화하는 루틴', title: '앱을 사용할수록, 알고리즘이 사용자의 운동 데이터를 학습해 점점 더 맞춤형 루틴을 제공합니다', desc: '', html: `<div class="intro-visual"><div class="neon-card"><div style="font-size:0.9rem; font-weight:bold; margin-bottom:15px;">블록 완료</div><div style="font-size:0.8rem; color:#888; margin-bottom:5px;">지난 블록 동안</div><div style="font-size:1rem; color:#fff;">가슴, 등 상부 퍼포먼스가 저조했습니다.</div><div style="margin-top:20px; font-size:0.8rem; color:#6C5CE7; background:#222; padding:10px; border-radius:8px;">새로운 머신 궤적으로 교체를 제안합니다.</div></div></div>` }
];
let currentIntroStep = 0;
const introArea = document.getElementById('intro-content-area');
const introDots = document.getElementById('intro-pagination');
document.getElementById('btn-start-onboarding').addEventListener('click', () => { 
    if(!localStorage.getItem('introSeen')){
        switchView('view-intro'); 
        renderIntroStep();
    } else {
        switchView('view-settings');
        renderWizardStep();
    }
});

function renderIntroStep() {
    introArea.innerHTML = `<span class="intro-badge">${introSteps[currentIntroStep].badge}</span><h1 class="intro-title">${introSteps[currentIntroStep].title}</h1>${introSteps[currentIntroStep].desc ? `<p class="intro-desc">${introSteps[currentIntroStep].desc}</p>` : ''}${introSteps[currentIntroStep].html}`;
    introDots.innerHTML = introSteps.map((_, idx) => `<div class="dot ${idx === currentIntroStep ? 'active' : ''}"></div>`).join('');
    document.getElementById('btn-intro-prev').style.opacity = currentIntroStep === 0 ? '0.3' : '1';
    document.getElementById('btn-intro-next').innerText = currentIntroStep === introSteps.length - 1 ? '계속' : '다음';
}

document.getElementById('btn-intro-next').addEventListener('click', () => {
    if (currentIntroStep < introSteps.length - 1) { currentIntroStep++; renderIntroStep(); } 
    else { 
        localStorage.setItem('introSeen', 'true');
        switchView('view-settings'); 
        renderWizardStep(); 
    }
});
document.getElementById('btn-intro-prev').addEventListener('click', () => {
    if (currentIntroStep > 0) { currentIntroStep--; renderIntroStep(); }
});

// --- 설정 마법사 로직 ---
const wizardSteps = [
    { type: 'input', title: '체중을 알려주세요', desc: '정확한 중량 추천을 위해 필요해요', value: '', placeholder: '72', unit: 'kg', hint: '체중은 알고리즘이 권장 중량을 계산할 때 사용돼요.' },
    { type: 'input', title: '나이를 알려주세요', desc: '회복 속도와 훈련 강도 설계에 참고해요', value: '', placeholder: '29', unit: '세', hint: '연령에 따른 중추신경계 회복 속도를 반영해요.' },
    { type: 'grid-gender', title: '성별을 선택해주세요', desc: '루틴 구성 방식이 달라져요', options: [{icon:'♂', label:'남성'}, {icon:'♀', label:'여성'}], value: null, hint: '성별에 따라 근육 발달 속도와 권장 볼륨이 달라져요.' },
    { type: 'input', title: '현재 체지방을\n알려주세요', desc: '정확하지 않아도 괜찮아요 · 대략적인 수치면 충분해요', value: '', placeholder: '18', unit: '%', hint: '인바디 결과가 있으면 그 수치를 넣어주세요.' },
    { type: 'list', title: '운동 경력을\n알려주세요', desc: '목표 달성 기간 계산에 사용돼요', options: [{title:'초보자', sub:'운동 1-2년'}, {title:'중급자', sub:'운동 3-6년'}, {title:'상급자', sub:'7년 이상'}], value: null, hint: '운동 구력에 맞춰 점진적 성장 사이클이 조정돼요.' },
    { type: 'list', title: '어떤 기구를\n사용할 수 있나요?', desc: '보유한 기구에 맞춰 루틴의 운동을 교체해드려요', options: [{title:'맨몸 운동만 가능해요', sub:'풀업 바 필요'}, {title:'덤벨과 바벨, 기본적인 프리웨이트만 있어요', sub:''}, {title:'덤벨, 바벨, 그리고 기본적인 머신만 있어요', sub:'전형적인 아파트 헬스장'}, {title:'일반적인 헬스장이에요', sub:'프리웨이트, 머신 케이블 기본적인 요소 다 있음'}, {title:'대형 헬스장이에요', sub:'웬만한 머신은 다 있음'}], value: null, hint: '선택하신 환경에 맞춰 대체 가능한 운동을 추천해드려요.' },
    { type: 'grid-num', title: '주당 운동 횟수', desc: '일주일에 몇 번 운동할 수 있나요?', options: [1, 2, 3, 4, 5, 6], value: null, hint: '선택하신 횟수에 맞춰 최적의 분할 루틴을 구성할게요.' },
    { type: 'grid-bool', title: '신체 불균형이 있나요?', desc: '좌우 발달 차이가 있으면 한쪽 운동으로 보완해드려요', options: ['예, 있어요', '아니오'], value: null, hint: '불균형이 있다면 머신이나 덤벨 위주의 편측 운동을 우선해요.' },
    { type: 'slider', title: '근비대 vs 스트렝스,\n어느쪽이 목표인가요?', desc: '', value: 0, hint: '목표에 따라 세트당 반복 횟수(Reps)와 볼륨이 크게 달라져요.' },
    { type: 'multi', title: '강조/유지할 부위가\n있나요?', desc: '균형 잡힌 루틴을 원하면 선택하지 않아도 돼요 · 강조/유지 각 최대 3개', sections: [{id:'emph', name:'강조', color:'purple'}, {id:'maint', name:'유지', color:'green'}], items: ['가슴','어깨(전/측면)','어깨(후면)','등 중/상부','광배근','이두근','삼두근','전완','대퇴사두','햄스트링','둔근','복근','목','기립근','종아리','내전근'], values: [], hint: '선택하신 부위의 세트 수가 우선적으로 배정돼요.' },
    { type: 'list', title: '선호하는 중량대가 있나요?', desc: '알고리즘이 참고하는 초기 설정이에요', options: [{title:'초고중량', sub:''}, {title:'고중량', sub:''}, {title:'중간 중량', sub:'', badge:'추천'}, {title:'저중량', sub:''}, {title:'초저중량', sub:''}], value: null, hint: '처음 시작할 때 추천되는 기준 중량을 설정해요.' },
    { type: 'grid-bool', title: '유산소 운동도\n하고 싶으신가요?', desc: '근력 운동을 마친 뒤에 이어서 할 수 있어요', options: ['네, 하고 싶어요', '아니요'], value: null, hint: '선택에 따라 점심 40분 외에 별도의 유산소 플랜을 제안해드려요.' }
];

const sliderMapping = [
    { title: '근비대 집중', sub: '스트렝스 0 : 근비대 100' },
    { title: '근비대 위주', sub: '스트렝스 25 : 근비대 75' },
    { title: '성장 밸런스', sub: '스트렝스 50 : 근비대 50' },
    { title: '스트렝스 위주', sub: '스트렝스 75 : 근비대 25' },
    { title: '스트렝스 집중', sub: '스트렝스 100 : 근비대 0' }
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
    let html = '';

    if (step.type === 'input') {
        html = `<div class="input-box"><input type="number" class="input-val" value="${step.value}" placeholder="${step.placeholder}"><span class="input-unit">${step.unit}</span></div><div style="text-align:center; font-size:0.8rem; color:#666;">입력 후 다음을 눌러주세요</div>`;
        inputArea.innerHTML = html;
    } else if (step.type === 'list') {
        html = `<div class="list-options">` + step.options.map(opt => `<div class="list-btn ${opt.title === step.value ? 'active' : ''}" data-value="${opt.title}"><div class="list-text-area"><div class="list-title">${opt.title} ${opt.badge ? `<span class="list-badge">${opt.badge}</span>` : ''}</div>${opt.sub ? `<div class="list-sub">${opt.sub}</div>` : ''}</div><div class="radio-circle"></div></div>`).join('') + `</div>`;
        inputArea.innerHTML = html;
        inputArea.querySelectorAll('.list-btn').forEach(btn => btn.addEventListener('click', (e) => {
            inputArea.querySelectorAll('.list-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active'); step.value = e.currentTarget.getAttribute('data-value');
        }));
    } else if (step.type.startsWith('grid')) {
        const isCol3 = step.type === 'grid-num' ? 'cols-3' : '';
        html = `<div class="grid-options ${isCol3}">` + step.options.map(opt => {
            const val = opt.label || opt; const iconStr = opt.icon ? `<div class="opt-icon">${opt.icon}</div>` : ''; const subStr = step.type === 'grid-num' ? `<span class="opt-sub">회/주</span>` : '';
            return `<div class="opt-btn ${val == step.value ? 'active' : ''}" data-value="${val}">${iconStr}${val}${subStr}</div>`;
        }).join('') + `</div>`;
        inputArea.innerHTML = html;
        inputArea.querySelectorAll('.opt-btn').forEach(btn => btn.addEventListener('click', (e) => {
            inputArea.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active'); step.value = e.currentTarget.getAttribute('data-value');
        }));
    } else if (step.type === 'slider') {
        const defaultIdx = typeof step.value === 'number' ? step.value : 0; const state = sliderMapping[defaultIdx];
        html = `<div class="slider-container"><div id="slider-display" class="slider-val-text">${state.title}</div><div id="slider-sub" class="slider-sub-text">${state.sub}</div><div class="slider-track-wrap"><div class="slider-track-bg"><div class="dot"></div><div class="dot"><div class="rec-badge">권장</div></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div><input type="range" id="goal-slider" min="0" max="4" step="1" value="${defaultIdx}"></div><div class="slider-labels"><span>← 근비대</span><span>스트렝스 →</span></div></div>`;
        inputArea.innerHTML = html;
        document.getElementById('goal-slider').addEventListener('input', (e) => {
            const idx = parseInt(e.target.value); step.value = idx;
            document.getElementById('slider-display').innerText = sliderMapping[idx].title;
            document.getElementById('slider-sub').innerText = sliderMapping[idx].sub;
        });
    } else if (step.type === 'multi') {
        html = step.sections.map(sec => `<div class="chip-section"><div class="chip-section-title c-${sec.color}">${sec.name}</div><div class="chip-grid">${step.items.map(item => `<div class="chip-btn ${step.values.some(v => v.id === sec.id && v.val === item) ? `active-${sec.color}` : ''}" data-sec="${sec.id}" data-color="${sec.color}" data-val="${item}">${item}</div>`).join('')}</div></div>`).join('');
        inputArea.innerHTML = html;
        inputArea.querySelectorAll('.chip-btn').forEach(btn => btn.addEventListener('click', (e) => {
            const target = e.currentTarget; const sec = target.getAttribute('data-sec'); const val = target.getAttribute('data-val'); const color = target.getAttribute('data-color');
            const existingIdx = step.values.findIndex(v => v.id === sec && v.val === val);
            
            if (existingIdx > -1) { 
                step.values.splice(existingIdx, 1); 
                target.classList.remove(`active-${color}`); 
            } else { 
                const secValues = step.values.filter(v => v.id === sec);
                if (secValues.length >= 3) return alert('각 항목당 최대 3개까지만 선택 가능합니다.'); 
                step.values = step.values.filter(v => v.val !== val); step.values.push({id: sec, val: val}); renderWizardStep(); 
            }
        }));
    }
    document.getElementById('btn-next-step').innerText = currentWizardStep === wizardSteps.length - 1 ? '루틴 보기' : '다음';
    document.getElementById('btn-prev-step').style.opacity = currentWizardStep === 0 ? '0.3' : '1';
}

document.getElementById('btn-next-step').addEventListener('click', () => {
    const activeInput = document.querySelector('.input-val');
    if (activeInput) { wizardSteps[currentWizardStep].value = activeInput.value; }
    if (currentWizardStep < wizardSteps.length - 1) { currentWizardStep++; renderWizardStep(); } 
    else { showLoadingScreen(); }
});
document.getElementById('btn-prev-step').addEventListener('click', () => {
    if (currentWizardStep > 0) { currentWizardStep--; renderWizardStep(); }
});

// --- 로딩 및 분석 단계 (자동 전환) ---
function showLoadingScreen() {
    switchView('view-loading');
    setTimeout(() => { startResultExplain(); }, 2500); 
}

const explainData = [
    { icon: '🏋️', title: '운동 종류', desc: "근육을 고르게 키우려면 한 부위도 여러 각도에서 자극해야 해요.\n\n사용자님께 필요한 운동을 부위별로 빠짐없이 배정했어요. 특히 '스트레치'와 '수축'을 강조하는 운동을 골고루 배치해 정체기 없는 성장을 도와요." },
    { icon: '⚖️', title: '중량', desc: "요청하신 <span style='color:#6C5CE7; font-weight:bold;'>중간 중량</span> 기준으로 각 운동의 무게 범위를 잡았어요.\n\n알고리즘이 퍼포먼스 변화에 맞추어 적절히 무게를 변경해줄거예요." },
    { icon: '🔄', title: '횟수', desc: "같은 무게에서 목표 횟수에 도달하면 다음 회차에 무게를 올리는 '더블 프로그레션' 방식으로 횟수와 무게를 함께 늘려가요.\n\n입력하신 체중과 운동 경험을 기반으로 해 <span style='color:#00b894; font-weight:bold;'>가장 적절한 점진적 성장 속도</span>로 코칭해드릴게요." },
    { icon: '⏱️', title: '운동 강도', desc: "사용자님의 특징에 따라 <span style='color:#00b894; font-weight:bold;'>운동 강도 (RPE/RIR)</span>도 적절히 설정했어요.\n\n앱을 사용할 경우 알고리즘이 퍼포먼스 변화와 피로도에 따라 운동 강도를 자동 수정해줍니다." },
    { icon: '📅', title: '운동 주기', desc: `<div class="mock-graph"><svg viewBox="0 0 100 35" preserveAspectRatio="none" style="width:100%; height:35px; overflow:visible; margin-bottom:10px;"><path d="M 5,30 Q 50,20 80,5" fill="none" stroke="#6C5CE7" stroke-width="2"/><path d="M 80,5 L 95,25" fill="none" stroke="#00b894" stroke-width="2" stroke-dasharray="2,2"/><circle cx="80" cy="5" r="3" fill="#6C5CE7"/><circle cx="95" cy="25" r="3" fill="#00b894"/></svg><div class="mock-graph-labels"><div class="mgl"><div class="mgl-circ">1</div><span class="mgl-txt">1주</span></div><div class="mgl"><div class="mgl-circ">2</div><span class="mgl-txt">2주</span></div><div class="mgl"><div class="mgl-circ">3</div><span class="mgl-txt">3주</span></div><div class="mgl"><div class="mgl-circ">4</div><span class="mgl-txt">4주</span></div><div class="mgl"><div class="mgl-circ">5</div><span class="mgl-txt">5주</span></div><div class="mgl"><div class="mgl-circ green">☾</div><span class="mgl-txt green">디로딩</span></div></div></div>최적의 피로 회복과 장기적인 성장을 위해 '5주 운동 + 1주 디로딩'으로 배정했습니다. 체계적인 피로 관리를 통해 정체기 없는 성장을 경험할 수 있습니다.` },
    { icon: '⚖️', title: '근비대 : 스트렝스 비율', desc: "근비대는 볼륨과 자극에 집중, 스트렝스는 중량 증가에 더 집중해요.\n\n사용자님의 목표에 맞춰 <span style='color:#00b894; font-weight:bold;'>근비대 75 · 스트렝스 25</span> 비중으로 프로그램을 설계했어요." }
];

let currentExplainStep = 0;
function startResultExplain() { switchView('view-result-explain'); currentExplainStep = 0; renderExplainStep(); }

function renderExplainStep() {
    document.getElementById('explain-progress-bar').innerHTML = explainData.map((_, i) => `<div class="r-progress-bar ${i <= currentExplainStep ? 'active' : ''}"></div>`).join('') + `<span class="r-progress-text">${currentExplainStep + 1} / 6</span>`;
    let timelineHtml = '';
    for (let i = 0; i <= currentExplainStep; i++) {
        timelineHtml += `<div class="rt-item ${i === currentExplainStep ? 'active' : ''}"><div class="rt-icon-wrap">${explainData[i].icon}</div><div class="rt-text">${explainData[i].title}</div></div>`;
    }
    document.getElementById('explain-timeline').innerHTML = timelineHtml;
    document.getElementById('explain-desc').innerHTML = explainData[currentExplainStep].desc;
    document.getElementById('explain-tap-text').innerText = currentExplainStep === explainData.length - 1 ? '루틴 구조 보기 >' : '탭하여 계속 >';
}

document.getElementById('explain-bottom-card').addEventListener('click', () => {
    if (currentExplainStep < explainData.length - 1) { currentExplainStep++; renderExplainStep(); } 
    else { generateRecommendedRoutine(); switchView('view-recommended-routine'); } 
});

// --- [신규 완결판] 상세 해부도 벡터 그래픽 SVG 생성기 ---
function getExerciseSVG(target) {
    // 붉은색 발광 타겟 근육 (#FF4757), 장비/골격 (#718093)
    switch(target) {
        case '가슴':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="12" r="6" fill="#888"/><path d="M22 20 L38 20 L35 38 L25 38 Z" fill="#444"/><rect x="23" y="21" width="14" height="7" rx="3" fill="#FF4757"/><path d="M12 28 L48 28" stroke="#888" stroke-width="3"/><rect x="8" y="24" width="4" height="8" fill="#aaa"/><rect x="48" y="24" width="4" height="8" fill="#aaa"/></svg>`;
        case '광배근':
        case '등상부':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="12" r="6" fill="#888"/><path d="M20 20 L40 20 L36 38 L24 38 Z" fill="#444"/><path d="M20 22 Q16 28 22 34 Q28 28 24 22 Z" fill="#FF4757"/><path d="M40 22 Q44 28 38 34 Q32 28 36 22 Z" fill="#FF4757"/><path d="M8 8 L52 8" stroke="#666" stroke-width="3"/><path d="M30 8 L30 18" stroke="#666" stroke-width="2"/></svg>`;
        case '어깨':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="14" r="6" fill="#888"/><path d="M22 22 L38 22 L34 40 L26 40 Z" fill="#444"/><circle cx="20" cy="23" r="5" fill="#FF4757"/><circle cx="40" cy="23" r="5" fill="#FF4757"/><path d="M12 18 L12 28 M48 18 L48 28" stroke="#aaa" stroke-width="3"/></svg>`;
        case '이두':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="12" r="6" fill="#888"/><path d="M24 20 L36 20 L34 38 L26 38 Z" fill="#444"/><circle cx="19" cy="27" r="4.5" fill="#FF4757"/><circle cx="41" cy="27" r="4.5" fill="#FF4757"/><path d="M14 32 L46 32" stroke="#aaa" stroke-width="3"/></svg>`;
        case '삼두':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="12" r="6" fill="#888"/><path d="M24 20 L36 20 L34 38 L26 38 Z" fill="#444"/><rect x="18" y="24" width="4" height="9" rx="2" fill="#FF4757"/><rect x="38" y="24" width="4" height="9" rx="2" fill="#FF4757"/><path d="M30 8 L30 26 L22 34 M30 26 L38 34" stroke="#666" stroke-width="2.5"/></svg>`;
        case '대퇴사두':
        case '하체':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="10" r="5" fill="#888"/><path d="M24 17 L36 17 L34 30 L26 30 Z" fill="#444"/><rect x="22" y="31" width="6" height="15" rx="3" fill="#FF4757"/><rect x="32" y="31" width="6" height="15" rx="3" fill="#FF4757"/><path d="M10 12 L50 12" stroke="#aaa" stroke-width="3"/></svg>`;
        case '햄스트링':
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="10" r="5" fill="#888"/><path d="M24 17 L36 17 L34 30 L26 30 Z" fill="#444"/><path d="M23 31 L29 31 L27 46 L21 46 Z" fill="#FF4757"/><path d="M37 31 L31 31 L33 46 L39 46 Z" fill="#FF4757"/><path d="M14 48 L46 48" stroke="#888" stroke-width="2.5"/></svg>`;
        default:
            return `<svg viewBox="0 0 60 60"><circle cx="30" cy="14" r="6" fill="#888"/><path d="M22 22 L38 22 L34 40 L26 40 Z" fill="#FF4757"/></svg>`;
    }
}

// --- [신규 완결판] 추천 루틴 타임라인 (Day 1~3 & Day 1a~3a 구성) ---
function generateRecommendedRoutine() {
    const isCardio = wizardSteps[11].value === '네, 하고 싶어요';
    const timelineArea = document.getElementById('rec-timeline-render');
    let html = '';

    // 레퍼런스 이미지 기반 6일 주기 세부 종목 데이터
    const routineSchedule = [
        {
            dayLabel: 'Day 1', count: 6, hasCardio: isCardio,
            exercises: [
                { name: '시티드 케이블 로우', target: '등상부' },
                { name: '해머 체스트 프레스', target: '가슴' },
                { name: '인클라인 프레스 머신', target: '가슴' },
                { name: '랫풀다운 (와이드)', target: '광배근' },
                { name: '덤벨 플라이', target: '가슴' },
                { name: '시티드 체스트 로우', target: '광배근' }
            ]
        },
        {
            dayLabel: 'Day 2', count: 7, hasCardio: false,
            exercises: [
                { name: '오버헤드 숄더 프레스', target: '어깨' },
                { name: '바벨 프리처 컬', target: '이두' },
                { name: '사이드 레터럴 레이즈', target: '어깨' },
                { name: '인클라인 덤벨 익스텐션', target: '삼두' },
                { name: '스탠딩 바벨 컬', target: '이두' },
                { name: '케이블 트라이셉스 푸시다운', target: '삼두' },
                { name: '페이스 풀 (후면 삼각근)', target: '어깨' }
            ]
        },
        {
            dayLabel: 'Day 3', count: 5, hasCardio: isCardio,
            exercises: [
                { name: '바벨 백스쿼트', target: '대퇴사두' },
                { name: '루마니안 데드리프트', target: '햄스트링' },
                { name: '시티드 레그 프레스', target: '하체' },
                { name: '라잉 레그 컬', target: '햄스트링' },
                { name: '카프 레이즈', target: '하체' }
            ]
        },
        { isRest: true, label: '휴식 | 1일' },
        {
            dayLabel: 'Day 1a', count: 6, hasCardio: false,
            exercises: [
                { name: '인클라인 벤치프레스', target: '가슴' },
                { name: '스미스머신 체스트 프레스', target: '가슴' },
                { name: '풀업 (어시스트 머신)', target: '광배근' },
                { name: '체스트 서포티드 덤벨 로우', target: '등상부' },
                { name: '케이블 크로스오버', target: '가슴' },
                { name: '클로즈그립 랫풀다운', target: '광배근' }
            ]
        },
        {
            dayLabel: 'Day 2a', count: 7, hasCardio: isCardio,
            exercises: [
                { name: '머신 숄더 프레스', target: '어깨' },
                { name: '덤벨 해머 컬', target: '이두' },
                { name: '케이블 레터럴 레이즈', target: '어깨' },
                { name: '오버헤드 케이블 익스텐션', target: '삼두' },
                { name: '이지바 암 컬', target: '이두' },
                { name: '딥스 (머신 어시스트)', target: '삼두' },
                { name: '리버스 펙덱 플라이', target: '어깨' }
            ]
        },
        {
            dayLabel: 'Day 3a', count: 5, hasCardio: false,
            exercises: [
                { name: '핵 스쿼트 머신', target: '대퇴사두' },
                { name: '덤벨 스티프 레그 데드리프트', target: '햄스트링' },
                { name: '워킹 런지', target: '하체' },
                { name: '시티드 레그 익스텐션', target: '대퇴사두' },
                { name: '시티드 레그 컬', target: '햄스트링' }
            ]
        }
    ];

    routineSchedule.forEach(item => {
        if (item.isRest) {
            html += `
                <div class="rtl-item">
                    <div class="rtl-circle" style="background:#444; border-color:#222; box-shadow:none;"></div>
                    <div class="rtl-content"><div class="rtl-rest-node">${item.label}</div></div>
                </div>`;
            return;
        }

        let thumbHtml = item.exercises.map(ex => `
            <div class="rtl-thumb">
                ${getExerciseSVG(ex.target)}
                <div class="target-label">${ex.name}</div>
                <div class="ro-watermark">RO</div>
            </div>
        `).join('');

        if (item.hasCardio) {
            thumbHtml += `
                <div class="rtl-thumb cardio">
                    <svg viewBox="0 0 60 60">
                        <path d="M12 45 L48 45" stroke="#6C5CE7" stroke-width="3" stroke-dasharray="3,3"/>
                        <circle cx="34" cy="14" r="5" fill="#888"/>
                        <path d="M30 20 L38 32 L34 44 M26 28 L20 38" stroke="#FF4757" stroke-width="3" fill="none"/>
                    </svg>
                    <div class="target-label" style="color:#a29bfe;">유산소</div>
                    <div class="ro-watermark">RO</div>
                </div>
            `;
        }

        html += `
            <div class="rtl-item">
                <div class="rtl-circle"></div>
                <div class="rtl-content">
                    <div class="rtl-day-title">
                        ${item.dayLabel} <span class="rtl-day-sub">| 총 ${item.count}개 운동</span>
                        ${item.hasCardio ? '<span class="badge-cardio">+ 유산소</span>' : ''}
                    </div>
                    <div class="rtl-thumbnails">${thumbHtml}</div>
                    ${item.hasCardio ? '<div class="rtl-desc">유산소는 앱을 시작한 뒤 몇 가지만 답하면 종목과 시간이 정해져요.</div>' : ''}
                </div>
            </div>
        `;
    });

    timelineArea.innerHTML = html;
}

// 화면 이동 및 로그인 처리
document.getElementById('btn-rec-back').addEventListener('click', () => { switchView('view-result-explain'); });
document.getElementById('btn-go-login').addEventListener('click', () => { switchView('view-login'); });

document.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        localStorage.setItem('onboardingCompleted', 'true');
        mainNav.style.display = 'flex';
        switchView('view-home');
    });
});

// --- 기존 홈화면 타이머 로직 ---
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];
let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');

function renderWorkout() {
    const mainContainer = document.getElementById('exercise-list');
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
            btn.addEventListener('click', () => {
                if (savedData.includes(i)) {
                    savedData.splice(savedData.indexOf(i), 1);
                    btn.classList.remove('completed');
                } else {
                    savedData.push(i);
                    btn.classList.add('completed');
                    if (navigator.vibrate) navigator.vibrate(50);
                    startTimer(ex.rest);
                }
                localStorage.setItem(`workout_${ex.id}`, JSON.stringify(savedData));
            });
            setContainer.appendChild(btn);
        }
        card.appendChild(setContainer);
        mainContainer.appendChild(card);
    });
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
