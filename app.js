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
const googleProvider = new firebase.auth.GoogleAuthProvider();

// --- 뷰 전환 유틸 ---
const mainNav = document.getElementById('main-nav');
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

// --- [수정됨] 최초 진입 및 자동 로그인 체크 로직 ---
// 1. Firebase 인증 상태 리스너가 유저 상태를 확인합니다.
auth.onAuthStateChanged((user) => {
    const isOnboardingCompleted = localStorage.getItem('onboardingCompleted');

    if (user) {
        // 이미 구글 로그인이 되어 있는 상태
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName || '');
        
        // 온보딩까지 마친 유저라면 바로 홈 대시보드로 이동
        if (isOnboardingCompleted === 'true') {
            mainNav.style.display = 'flex';
            switchView('view-home');
        } else {
            // 로그인만 하고 설정을 안 끝낸 유저라면 마법사로 이동
            mainNav.style.display = 'none';
            startWizard();
        }
    } else {
        // 구글 로그인이 안 된 상태
        if (isOnboardingCompleted === 'true') {
            // '로그인 없이 이용하기'로 진입하여 온보딩을 마친 유저
            mainNav.style.display = 'flex';
            switchView('view-home');
        } else {
            // 완전 첫 방문 유저
            mainNav.style.display = 'none';
            switchView('view-splash');
        }
    }
});

// 스플래시 화면에서 '앱 시작하기' 클릭 시 로그인 화면으로 이동
document.getElementById('btn-start-onboarding').addEventListener('click', () => { 
    switchView('view-login'); 
});

// 구글 로그인 팝업 연동
document.getElementById('btn-login-google').addEventListener('click', () => {
    // 세션 지속성 설정 (브라우저 종료 후에도 로그인 유지)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            return auth.signInWithPopup(googleProvider);
        })
        .then((result) => {
            const user = result.user;
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.displayName || '');
            startWizard();
        })
        .catch((error) => {
            if (error.code === 'auth/unauthorized-domain') {
                alert('현재 접속 중인 도메인이 Firebase에 승인되지 않았습니다. Firebase 콘솔 > Authentication > Settings > Authorized domains에 추가해 주세요.');
            } else if (error.code !== 'auth/popup-closed-by-user') {
                alert('로그인 오류: ' + error.message);
            }
        });
});

// 로그인 없이 이용하기
document.getElementById('btn-skip-login').addEventListener('click', startWizard);

function startWizard() {
    switchView('view-settings');
    renderWizardStep();
}

// 하단 네비게이션 탭 전환
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


// --- 마법사 로직 ---
const wizardSteps = [
    { type: 'input', title: '체중을 알려주세요', desc: '정확한 중량 추천을 위해 필요해요', value: '', placeholder: '70', unit: 'kg', hint: '체중은 알고리즘이 권장 중량을 계산할 때 사용돼요.' },
    { type: 'input', title: '나이를 알려주세요', desc: '회복 속도와 훈련 강도 설계에 참고해요', value: '', placeholder: '20', unit: '세', hint: '연령에 따른 중추신경계 회복 속도를 반영해요.' },
    { type: 'grid-gender', title: '성별을 선택해주세요', desc: '루틴 구성 방식이 달라져요', options: [{icon:'♂', label:'남성'}, {icon:'♀', label:'여성'}], value: null, hint: '성별에 따라 근육 발달 속도와 권장 볼륨이 달라져요.' },
    { type: 'input', title: '현재 체지방을\n알려주세요', desc: '정확하지 않아도 괜찮아요 · 대략적인 수치면 충분해요', value: '', placeholder: '15', unit: '%', hint: '인바디 결과가 있으면 그 수치를 넣어주세요.' },
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
                if (secValues.length >= 3) return alert('해당 영역은 최대 3개까지만 선택 가능합니다.'); 
                step.values = step.values.filter(v => v.val !== val); 
                step.values.push({id: sec, val: val}); 
                renderWizardStep(); 
            }
        }));
    }
    document.getElementById('btn-next-step').innerText = currentWizardStep === wizardSteps.length - 1 ? '루틴 추천받기' : '다음';
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

// --- 로딩 및 분석 화면 ---
function showLoadingScreen() {
    switchView('view-loading');
    setTimeout(() => { startResultExplain(); }, 2500); 
}

const explainData = [
    { icon: '🏋️', title: '운동 종류', desc: "근육을 고르게 키우려면 한 부위도 여러 각도에서 자극해야 해요.\n\n사용자님께 필요한 운동을 부위별로 빠짐없이 배정했어요. 특히 '스트레치'와 '수축'을 강조하는 운동을 골고루 배치해 정체기 없는 성장을 도와요." },
    { icon: '⚖️', title: '중량', desc: "요청하신 <span style='color:#E50914; font-weight:bold;'>중간 중량</span> 기준으로 각 운동의 무게 범위를 잡았어요.\n\n알고리즘이 퍼포먼스 변화에 맞추어 적절히 무게를 변경해줄거예요." },
    { icon: '🔄', title: '횟수', desc: "같은 무게에서 목표 횟수에 도달하면 다음 회차에 무게를 올리는 '더블 프로그레션' 방식으로 횟수와 무게를 함께 늘려가요.\n\n입력하신 체중과 운동 경험을 기반으로 해 <span style='color:#E50914; font-weight:bold;'>가장 적절한 점진적 성장 속도</span>로 코칭해드릴게요." },
    { icon: '⏱️', title: '운동 강도', desc: "사용자님의 특징에 따라 <span style='color:#E50914; font-weight:bold;'>운동 강도 (RPE/RIR)</span>도 적절히 설정했어요.\n\n앱을 사용할 경우 알고리즘이 퍼포먼스 변화와 피로도에 따라 운동 강도를 자동 수정해줍니다." },
    { icon: '📅', title: '운동 주기', desc: `<div class="mock-graph"><svg class="mock-graph-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><defs><linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(229, 9, 20, 0.4)" /><stop offset="100%" stop-color="rgba(229, 9, 20, 0)" /></linearGradient></defs><polygon points="5,30 15,25 75,5 75,30" fill="url(#gradPurple)"/><path d="M 15,25 Q 45,15 75,5" fill="none" stroke="#E50914" stroke-width="1.5" stroke-linecap="round"/><path d="M 75,5 L 95,20" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="2,2" stroke-linecap="round"/><circle cx="75" cy="5" r="2" fill="#E50914"/><circle cx="95" cy="20" r="2" fill="#fff"/></svg><div class="mock-graph-labels"><div class="mgl"><div class="mgl-circ">1</div><span class="mgl-txt">1주</span></div><div class="mgl"><div class="mgl-circ">2</div><span class="mgl-txt">2주</span></div><div class="mgl"><div class="mgl-circ">3</div><span class="mgl-txt">3주</span></div><div class="mgl"><div class="mgl-circ">4</div><span class="mgl-txt">4주</span></div><div class="mgl"><div class="mgl-circ active">5</div><span class="mgl-txt" style="color:#E50914; font-weight:bold;">5주</span></div><div class="mgl"><div class="mgl-circ green">☾</div><span class="mgl-txt green">디로딩</span></div></div></div>최적의 피로 회복과 장기적인 성장을 위해 '5주 운동 + 1주 디로딩'으로 배정했습니다. 체계적인 피로 관리를 통해 정체기 없는 성장을 경험할 수 있습니다.` },
    { icon: '⚖️', title: '근비대 : 스트렝스 비율', desc: "근비대는 볼륨과 자극에 집중, 스트렝스는 중량 증가에 더 집중해요.\n\n사용자님의 목표에 맞춰 <span style='color:#E50914; font-weight:bold;'>근비대 75 · 스트렝스 25</span> 비중으로 프로그램을 설계했어요." }
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
    
    const tapBtn = document.getElementById('explain-tap-text');
    if (currentExplainStep === explainData.length - 1) {
        tapBtn.innerText = '루틴 구조 보기 >';
        tapBtn.style.color = '#ffffff'; 
    } else {
        tapBtn.innerText = '탭하여 계속 >';
        tapBtn.style.color = '#E50914';
    }
}

document.getElementById('explain-tap-text').onclick = function() {
    if (currentExplainStep < explainData.length - 1) { 
        currentExplainStep++; 
        renderExplainStep(); 
    } else { 
        generateRecommendedRoutine(); 
        switchView('view-recommended-routine'); 
    } 
};

// 운동 해부학 이미지 맵핑
function getExerciseImage(target) {
    let imgUrl = "";
    let exerciseName = "";

    if (target.includes('가슴')) {
        imgUrl = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400"; 
        exerciseName = "벤치 프레스 & 플라이";
    } else if (target.includes('어깨')) {
        imgUrl = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400";
        exerciseName = "숄더 프레스 & 레이즈";
    } else if (target.includes('팔') || target.includes('이두') || target.includes('삼두')) {
        imgUrl = "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=400";
        exerciseName = "암 컬 & 익스텐션";
    } else if (target.includes('하체') || target.includes('대퇴')) {
        imgUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400";
        exerciseName = "스쿼트 & 런지";
    } else if (target.includes('햄스트링') || target.includes('엉덩이')) {
        imgUrl = "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400";
        exerciseName = "데드리프트 & 컬";
    } else if (target.includes('등') || target.includes('광배')) {
        imgUrl = "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&q=80&w=400";
        exerciseName = "랫풀다운 & 로우";
    } else if (target.includes('삼두 보조') || target.includes('어시스트')) {
        imgUrl = "https://images.unsplash.com/photo-1532029837206-abbe267e56f2?auto=format&fit=crop&q=80&w=400";
        exerciseName = "오버헤드 익스텐션";
    } else {
        imgUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400";
        exerciseName = "프리웨이트 컴파운드";
    }
    
    return { url: imgUrl, name: exerciseName };
}

function generateRecommendedRoutine() {
    const gender = wizardSteps[2].value || '남성';
    const frequency = wizardSteps[6].value || 5; 
    const isCardio = wizardSteps[11].value === '네, 하고 싶어요' || true;

    let splitName = '몸통-말단-하체';
    if(frequency === 3) splitName = '밀기-당기기-하체';
    else if(frequency === 4) splitName = '상하체 2분할';

    document.getElementById('rec-subtitle').innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    document.getElementById('rec-chip-split').innerText = splitName;
    document.getElementById('rec-chip-gender').innerText = gender;

    const timelineArea = document.getElementById('rec-timeline-render');
    let html = '';

    const dayData = [
        { label: 'Day 1', count: 6, hasCardio: true,  targets: ['가슴', '등', '어깨 보조', '삼두 보조'] },
        { label: 'Day 2', count: 7, hasCardio: false, targets: ['팔', '이두', '삼두', '전완'] },
        { label: 'Day 3', count: 5, hasCardio: true,  targets: ['하체', '햄스트링', '대퇴사두'] },
        { label: 'Day 4', count: 6, hasCardio: false, targets: ['가슴', '어깨', '삼두 보조'] },
        { label: 'Day 5', count: 7, hasCardio: true,  targets: ['등', '팔', '이두', '전완'] }
    ];

    const visibleDays = dayData.slice(0, frequency);

    visibleDays.forEach(day => {
        let thumbHtml = day.targets.map(target => {
            const exerciseInfo = getExerciseImage(target);
            return `
                <div class="rtl-thumb">
                    <img src="${exerciseInfo.url}" alt="${exerciseInfo.name}">
                    <div class="target-label">${exerciseInfo.name}</div>
                </div>
            `;
        }).join('');

        if (day.hasCardio) {
            thumbHtml += `
                <div class="rtl-thumb cardio">
                    <svg viewBox="0 0 60 60"><path d="M12 45 L48 45" stroke="#a29bfe" stroke-width="3" stroke-dasharray="3,3"/><circle cx="34" cy="18" r="4" fill="#888"/><path d="M30 24 L38 36 L34 48 M26 32 L20 42" stroke="#a29bfe" stroke-width="3" fill="none"/></svg>
                    <div class="target-label">유산소 (트레드밀)</div>
                </div>
            `;
        }

        html += `
            <div class="rtl-item">
                <div class="rtl-day-title-wrapper">
                    <div class="rtl-circle"></div>
                    <div class="rtl-day-title">${day.label} <span class="rtl-day-sub">| 총 ${day.count}개 운동</span> ${day.hasCardio ? '<span class="badge-cardio">+ 유산소</span>' : ''}</div>
                </div>
                <div class="rtl-thumbnails">${thumbHtml}</div>
            </div>
        `;
    });

    timelineArea.innerHTML = html;
}

document.getElementById('btn-rec-back').addEventListener('click', () => { switchView('view-result-explain'); });
document.getElementById('btn-go-home').addEventListener('click', () => { 
    localStorage.setItem('onboardingCompleted', 'true');
    mainNav.style.display = 'flex';
    switchView('view-home');
});

// --- 홈화면 타이머 로직 ---
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
