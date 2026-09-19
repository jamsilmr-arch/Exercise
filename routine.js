window.activeTab = 'routine';

// ==========================================
// 1. 유저 데이터 연동 및 내 루틴 화면 동적 반영
// ==========================================
function loadActiveRoutineUI() {
    const activeId = localStorage.getItem('active_routine_id');
    const activeTitle = localStorage.getItem('active_routine_title');
    const activeChips = JSON.parse(localStorage.getItem('active_routine_chips') || 'null');
    
    const titleElem = document.getElementById('rl-current-title');
    const chipsElem = document.getElementById('rl-current-chips');
    const cardElem = document.getElementById('rl-current-card');

    if (activeId && activeTitle && titleElem && chipsElem && cardElem) {
        titleElem.innerText = activeTitle;
        chipsElem.innerHTML = activeChips.map(c => `<span class="rt-chip">${c}</span>`).join('');
        cardElem.onclick = () => openDetail(activeId);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadActiveRoutineUI();
});

auth.onAuthStateChanged(async (user) => {
    if (!localStorage.getItem('active_routine_id')) {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().wizardData) {
                    const wizardData = userDoc.data().wizardData;
                    const frequency = parseInt(wizardData?.question_6?.value) || 6;
                    let splitName = '몸통-말단-하체';
                    if (frequency === 3) splitName = '상체-하체-전신';
                    else if (frequency === 4) splitName = '상체-하체-상체-하체';
                    const currentTitleElem = document.getElementById('rl-current-title');
                    if(currentTitleElem) currentTitleElem.innerText = `주 ${frequency}회 (${splitName}) 루틴`;
                }
            } catch(e) { console.error("데이터 로드 실패:", e); }
        }
    } else {
        loadActiveRoutineUI();
    }
});

// ==========================================
// 2. [수정됨] 운동 명칭 텍스트 프리셋 확장 (펼침 대비)
// ==========================================
const textPresets = {
    full: ['스쿼트', '벤치\n프레스', '풀업', '오버헤드\n프레스', '바벨 로우', '사이드\n레터럴', '바벨 컬', '삼두\n푸시다운'], 
    upper: ['벤치\n프레스', '풀업', '오버헤드\n프레스', '바벨 로우', '인클라인\n프레스', '랫풀다운', '사이드\n레터럴', '바벨 컬'], 
    lower: ['스쿼트', '루마니안\n데드', '레그\n프레스', '레그 컬', '카프 레이즈', '레그\n익스텐션', '힙\n쓰러스트', '이너 타이'], 
    push: ['벤치\n프레스', '오버헤드\n프레스', '인클라인\n프레스', '삼두\n푸시다운', '펙덱\n플라이', '사이드\n레터럴', '딥스', '프론트\n레이즈'], 
    pull: ['풀업', '바벨 로우', '랫풀다운', '바벨 컬', '시티드\n로우', '페이스 풀', '해머 컬', '리어 델트'], 
    core: ['벤치\n프레스', '풀업', '바벨 로우', '펙덱\n플라이', '인클라인\n프레스', '랫풀다운', '시티드\n로우', '풀오버'], 
    limb: ['오버헤드\n프레스', '사이드\n레터럴', '바벨 컬', '삼두\n푸시다운', '프론트\n레이즈', '해머 컬', '케이블\n푸시다운', '리버스\n펙덱'],
    glutes: ['스쿼트', '힙\n쓰러스트', '런지', '루마니안\n데드', '힙\n어브덕션', '킥백', '와이드\n스쿼트', '브이\n스쿼트'],
    w_upper: ['랫풀다운', '시티드\n로우', '숄더\n프레스', '사이드\n레터럴', '푸시업', '페이스 풀', '암 컬', '트라이셉\n익스텐션']
};

// ==========================================
// 3. 전체 루틴 데이터베이스
// ==========================================
const routineDB = {
    'rt_2_full': { title: '주 2회 무분할 루틴', chips: ['남성'], desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다. 무분할로 진행되고 전신을 다 골고루 운동합니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.full }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 3 } ] },
    'rt_3_hybrid': { title: '주 3회 (상체-하체-전신) 루틴', chips: ['상체-하체-전신', '남성'], desc: '2분할과 무분할을 섞은 하이브리드입니다. 전신을 골고루 운동합니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.lower }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 1 } ] },
    'rt_3_full': { title: '주 3회 무분할 (전신-전신-전신) 루틴', chips: ['전신-전신-전신', '남성'], desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 8, texts: textPresets.full }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 8, texts: textPresets.full }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.full }, { type: 'rest', days: 1 } ] },
    'rt_4_hybrid': { title: '주 4회 (밀기-당기기-하체-전신) 루틴', chips: ['밀기-당기기-하체-전신', '남성'], desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.lower }, { type: 'workout', label: 'Day 4', count: 7, texts: textPresets.full }, { type: 'rest', days: 2 } ] },
    'rt_4_split': { title: '주 4회 (상체-하체-상체-하체) 루틴', chips: ['상체-하체-상체-하체', '남성'], desc: '가장 기본적이고 효율적인 전형적인 주 4회 2분할 방식입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2a', count: 5, texts: textPresets.lower }, { type: 'rest', days: 2 } ] },
    'rt_5_push_pull': { title: '주 5회 (밀기-당기기-하체-밀기-당기기) 루틴', chips: ['밀기-당기기-하체-밀기-당기기', '남성'], desc: '하체 운동을 주 1회만 함으로써 상체에 더 집중할 수 있는 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'workout', label: 'Day 3', count: 6, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 5, texts: textPresets.push }, { type: 'workout', label: 'Day 2a', count: 6, texts: textPresets.pull }, { type: 'rest', days: 1 } ] },
    'rt_5_hybrid': { title: '주 5회 (상체-하체-상체-하체-상체) 루틴', chips: ['상체-하체-상체-하체-상체', '남성'], desc: '상체에 3일, 하체에 2일 투자하여 상체 운동을 더 여유롭게 분배했습니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 7, texts: textPresets.upper }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.lower }, { type: 'workout', label: 'Day 1a', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2a', count: 4, texts: textPresets.lower }, { type: 'workout', label: 'Day 1b', count: 7, texts: textPresets.upper }, { type: 'rest', days: 1 } ] },
    'rt_6_push_pull': { title: '주 6회 (밀기-당기기-하체) 루틴', chips: ['밀기-당기기-하체', '남성'], desc: '단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 3분할 루틴입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.push }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.pull }, { type: 'workout', label: 'Day 3', count: 4, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 5, texts: textPresets.push }, { type: 'workout', label: 'Day 2a', count: 5, texts: textPresets.pull }, { type: 'workout', label: 'Day 3a', count: 5, texts: textPresets.lower } ] },
    'rt_6_body_limb_lower': { title: '주 6회 (몸통-말단-하체) 루틴', chips: ['몸통-말단-하체', '남성'], desc: '세션 후반부의 피로 누적을 줄이고 안정적인 퍼포먼스를 유지하는 3분할 변형입니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 6, texts: textPresets.core }, { type: 'workout', label: 'Day 2', count: 7, texts: textPresets.limb }, { type: 'workout', label: 'Day 3', count: 5, texts: textPresets.lower }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 6, texts: textPresets.core }, { type: 'workout', label: 'Day 2a', count: 7, texts: textPresets.limb }, { type: 'workout', label: 'Day 3a', count: 5, texts: textPresets.lower } ] },
    'rt_w_fitness': { title: '여성 헬스 루틴', chips: ['여성'], desc: '여성분들의 니즈를 반영해 제작된 루틴입니다. 힙업과 탄력 있는 실루엣을 위해 둔근에 가장 집중하며, 복근과 등은 이차적으로 운동합니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 2', count: 4, texts: textPresets.w_upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 1a', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 2 } ] },
    'rt_w_hipup': { title: '힙업 루틴', chips: ['여성'], desc: '전신을 운동하지만 힙업에 많은 비중을 두는 루틴입니다. 주 4회로 구성되며 전신을 운동하고 싶지만 힙업을 주 목표로 하시는 여성분들께 추천하는 루틴입니다. 상체의 비중이 낮고 하체에 집중합니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 5, texts: textPresets.glutes }, { type: 'workout', label: 'Day 2', count: 5, texts: textPresets.w_upper }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 4', count: 6, texts: textPresets.glutes }, { type: 'workout', label: 'Day 5', count: 5, texts: textPresets.w_upper }, { type: 'rest', days: 2 } ] },
    'rt_w_hiponly': { title: '힙 only 루틴', chips: ['여성', '힙 only'], desc: '다른 신체 부위 말고, 오로지 힙업만 원하는 여성분들을 위한 루틴입니다. 부담스럽지 않게 주 3회로 구성되어 있습니다.', timeline: [ { type: 'workout', label: 'Day 1', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 }, { type: 'workout', label: 'Day 3', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 2 }, { type: 'workout', label: 'Day 6', count: 4, texts: textPresets.glutes }, { type: 'rest', days: 1 } ] }
};

// ==========================================
// 4. [수정됨] 루틴 상세 오픈 및 펼침(Expansion) 로직
// ==========================================
window.openDetail = function(rtId) {
    window.currentViewedRoutineId = rtId; 
    const data = routineDB[rtId] || routineDB['rt_6_body_limb_lower']; 
    
    let html = `
        <div class="rd-header">
            <h1 class="rd-title">${data.title}</h1>
            <div class="rd-chips">${data.chips.map(c => `<span class="rt-chip">${c}</span>`).join('')}</div>
            <p class="rd-desc">${data.desc}</p>
        </div>
        <div class="rd-preview-title">루틴 미리보기 (1주 기준)</div>
        <div class="rd-timeline">
    `;
    
    data.timeline.forEach((item, dayIndex) => {
        if(item.type === 'workout') {
            html += `<div class="rd-item"><div class="rd-dot"></div><div class="rd-content"><div class="rd-day-title">${item.label} <span>| 총 ${item.count}개 운동</span></div>`;
            
            // 1. 접힌 상태 (기본 노출)
            html += `<div class="rd-thumbnails" id="thumb-col-${dayIndex}">`;
            const displayTexts = item.texts.slice(0, 4);
            
            displayTexts.forEach((txt, index) => {
                if (index === 3 && item.count > 4) {
                    // +N 버튼 영역: 클릭 시 접힌 영역을 숨기고 펼쳐진 영역을 보여줌
                    html += `
                        <div class="rd-thumb" style="cursor:pointer;" onclick="document.getElementById('thumb-col-${dayIndex}').style.display='none'; document.getElementById('thumb-exp-${dayIndex}').style.display='grid';">
                            <span class="rd-thumb-text">${txt}</span>
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; color:#fff; font-size:1.1rem; font-weight:bold;">
                                +${item.count - 4}
                            </div>
                        </div>`;
                } else {
                    html += `<div class="rd-thumb"><span class="rd-thumb-text">${txt}</span></div>`;
                }
            });
            html += `</div>`;
            
            // 2. 펼쳐진 상태 (숨김 처리됨)
            if (item.count > 4) {
                html += `<div class="rd-thumbnails" id="thumb-exp-${dayIndex}" style="display:none;">`;
                // count 수만큼 배열에서 슬라이스하여 모두 렌더링
                const expandedTexts = item.texts.slice(0, item.count);
                expandedTexts.forEach((txt) => {
                    html += `<div class="rd-thumb"><span class="rd-thumb-text">${txt}</span></div>`;
                });
                html += `</div>`;
            }

            html += `</div></div>`;
        } else {
            html += `<div class="rd-item"><div class="rd-dot rest"></div><div class="rd-content"><div class="rd-day-title" style="color:#aaa;">휴식 <span>| ${item.days}일</span></div></div></div>`;
        }
    });
    
    html += `</div>
        <div class="rd-footer">
            <div class="rd-footer-inner">
                <button class="secondary-btn" onclick="saveRoutineOnly()">내 루틴에 저장</button>
                <button class="primary-btn" onclick="useRoutineNow()">루틴 바로 사용</button>
            </div>
        </div>
    `;
    
    document.getElementById('rd-render-area').innerHTML = html;
    
    document.getElementById('view-list').classList.remove('active');
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-detail').classList.add('active');
    document.getElementById('view-detail').style.display = 'block';
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'none';
    window.scrollTo(0, 0);
};

window.closeDetail = function() {
    document.getElementById('view-detail').classList.remove('active');
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById('view-list').classList.add('active');
    document.getElementById('view-list').style.display = 'block';
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'flex';
};

window.saveRoutineToLocal = function() {
    const rtId = window.currentViewedRoutineId;
    const data = routineDB[rtId];
    if(!data) return;
    
    const freq = data.timeline.filter(t => t.type === 'workout').length;
    
    localStorage.setItem('active_routine_id', rtId);
    localStorage.setItem('active_routine_title', data.title);
    localStorage.setItem('active_routine_chips', JSON.stringify(data.chips));
    localStorage.setItem('active_routine_freq', freq);
    
    localStorage.setItem('completed_analysis_days', 0); 
};

window.saveRoutineOnly = function() {
    saveRoutineToLocal();
    loadActiveRoutineUI(); 
    closeDetail();
    alert('내 루틴으로 저장되었습니다.');
};

window.useRoutineNow = function() {
    saveRoutineToLocal();
    location.href = 'home.html';
};
