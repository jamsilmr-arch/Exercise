// 하단 공통 메뉴 렌더링
window.activeTab = 'routine';

// ==========================================
// [신규] 1. 운동 가이드 & 메모 데이터베이스
// ==========================================
const exerciseGuideDB = {
    'day2_ex1': { // 오버헤드 프레스
        badge: '어깨(전/측면) 복합', vid: null,
        guide: '바벨을 쇄골 위쪽 또는 어깨 앞쪽에 올린 상태에서 시작하고, 손목은 과하게 꺾이지 않게 세웁니다. 복부와 엉덩이에 힘을 주어 몸통을 단단히 고정하고, 허리가 뒤로 젖혀지지 않게 합니다. 바를 밀어 올릴 때는 얼굴을 살짝 뒤로 빼 바가 수직에 가깝게 올라가도록 만들고, 바가 이마를 지나면 머리를 다시 앞으로 넣습니다.'
    },
    'day2_ex2': { // 바벨 프리처 컬
        badge: '이두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
        guide: '프리처 벤치에 상완을 패드에 고정하고, 바벨이나 EZ바를 잡은 상태에서 시작합니다. 팔꿈치가 패드에서 뜨지 않게 유지하고, 하단에서 팔을 과하게 잠그지 않도록 주의합니다. 바를 올릴 때는 몸을 뒤로 젖히거나 어깨를 들어 올리지 말고 이두근으로만 말아 올립니다. 내릴 때는 바벨이 갑자기 떨어지지 않게 천천히 버티며 이두를 늘립니다.'
    },
    'day2_ex3': { // 원암 덤벨/케이블 익스텐션
        badge: '삼두근 고립', vid: null,
        guide: '한 팔씩 덤벨이나 케이블을 사용해 팔꿈치를 펴는 운동입니다. 덤벨로 할 경우 머리 위에서 수행하면 삼두 장두가 길게 늘어나고, 케이블로 할 경우 장력이 일정하게 유지되는 장점이 있습니다. 시작 자세에서 팔꿈치를 충분히 접어 삼두가 늘어나게 하고, 팔꿈치 위치가 흔들리지 않게 고정합니다. 올릴 때는 어깨로 밀지 말고 삼두를 수축합니다.'
    },
    'day2_ex4': { // 바벨 바이셉 컬
        badge: '이두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
        guide: '바벨을 어깨너비 정도로 잡고 가슴을 세운 상태에서 똑바로 섭니다. 팔꿈치는 몸통 옆에 고정하고, 바를 들어 올릴 때 몸을 뒤로 젖히거나 엉덩이 반동을 쓰지 않습니다. 상단에서는 이두를 강하게 수축하되 팔꿈치가 앞으로 너무 많이 나가 긴장이 빠지지 않게 합니다. 내릴 때는 팔을 거의 다 펴면서도 무게를 놓지 않고 천천히 컨트롤합니다.'
    },
    'day2_ex5': { // 케이블 트라이셉 푸시다운
        badge: '삼두근 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif',
        guide: '케이블을 높은 위치에 세팅하고 바나 로프를 잡은 뒤 팔꿈치를 몸통 옆에 고정합니다. 시작 자세에서 팔꿈치가 접혀 삼두가 약간 늘어난 상태를 만들고, 손잡이를 아래로 밀어 팔을 펴줍니다. 하단에서는 팔꿈치를 완전히 펴며 삼두를 수축합니다. 상체를 과하게 숙이거나 어깨로 누르면 삼두보다 몸통 반동이 커질 수 있습니다.'
    },
    'day2_ex6': { // 리버스 펙덱 (가상의 데이터)
        badge: '어깨(후면) 고립', vid: null,
        guide: '가슴을 패드에 대고 앉아 손잡이를 잡습니다. 팔꿈치를 살짝 굽힌 상태를 유지하며 팔을 양옆으로 벌려 어깨 후면을 수축합니다. 날개뼈를 과하게 모으면 등 근육이 개입하므로 어깨 후면의 수축에만 집중합니다.'
    },
    'day2_ex7': { // 덤벨 레터럴 레이즈 (가상의 데이터)
        badge: '어깨(측면) 고립', vid: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif',
        guide: '덤벨을 잡고 몸통 옆에 둔 상태에서 팔을 양옆으로 들어 올립니다. 승모근이 과하게 개입하지 않도록 어깨를 누른 상태를 유지하며, 팔꿈치가 손목보다 살짝 높은 위치에 오도록 합니다.'
    }
};

// ==========================================
// 2. Day 2 훈련 리스트 및 렌더링
// ==========================================
function initWorkoutData() {
    window.currentRoutine = [
        { id: 'day2_ex1', name: '오버헤드 프레스', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'저중량',reps:6},{type:'warmup',rir:5,weight:'중간중량',reps:5},{type:'top',rir:1,weight:'고중량',reps:'4-7'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'},{type:'main',rir:1,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex2', name: '바벨 프리처 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex3', name: '원암 덤벨/케이블 익스텐션', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight', hasLR: true, sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex4', name: '바벨 바이셉 컬', img: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'고중량',reps:'4-7'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex5', name: '케이블 트라이셉 푸시다운', img: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'고중량',reps:'4-7'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex6', name: '리버스 펙덱', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] },
        { id: 'day2_ex7', name: '덤벨 레터럴 레이즈', img: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif', type: 'weight', sets: [{type:'warmup',rir:6,weight:'중간중량',reps:6},{type:'top',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'},{type:'main',rir:0,weight:'중간중량',reps:'8-12'}] }
    ];

    window.totalGlobalSets = 0;
    window.currentRoutine.forEach(ex => { window.totalGlobalSets += ex.hasLR ? ex.sets.length * 2 : ex.sets.length; });
}

window.renderWorkoutList = function() {
    const listContainer = document.getElementById('workout-exercise-list');
    if(!listContainer) return;
    let html = '';

    window.currentRoutine.forEach((ex, index) => {
        const totalSets = ex.hasLR ? ex.sets.length * 2 : ex.sets.length;
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];
        const completedCount = savedData.length;
        const badgeColor = completedCount === totalSets ? '#E50914' : '#222';
        const badgeTextColor = completedCount === totalSets ? '#fff' : '#aaa';
        
        let toggleHtml = `<div class="toggle-switch-group"><div class="toggle-item active">kg</div><div class="toggle-item">lbs</div></div>`;
        let lrToggleHtml = ex.hasLR ? `<div style="display:flex; justify-content:center; margin-bottom:15px;"><div class="toggle-switch-group" style="background:#333; padding:4px; border-radius:20px;"><div class="toggle-item active" style="padding:6px 20px;" onclick="switchArm(this, 'R', '${ex.id}', ${index})">오른쪽</div><div class="toggle-item" style="padding:6px 20px;" onclick="switchArm(this, 'L', '${ex.id}', ${index})">왼쪽</div></div></div>` : '';
        const formHeader = `<div class="set-header-row"><span>중량 (kg)</span><span>횟수</span></div>`;

        let setsHtml = '';
        let lastType = '';
        
        ex.sets.forEach((set, sIdx) => {
            if (lastType !== set.type) {
                if (setsHtml !== '') setsHtml += `</div>`; 
                const badgeText = set.type === 'warmup' ? '웜업 세트' : (set.type === 'top' ? '탑 세트' : '본 세트');
                setsHtml += `<div class="set-group"><div class="set-badge">${badgeText}</div>${formHeader}`;
                lastType = set.type;
            }
            const defaultSetId = `${set.type}_${sIdx}`;
            const isChecked = savedData.includes(defaultSetId) ? 'completed' : '';
            setsHtml += `<div class="set-row"><div class="set-label">${set.rir} RIR</div><div class="set-input-box"><input type="text" class="set-input" placeholder="${set.weight}"><input type="text" class="set-input" placeholder="${set.reps}"></div><div class="set-check ${isChecked}" data-id="${defaultSetId}" data-time="${set.type==='warmup'?35:90}" data-ex="${ex.name}">✓</div></div>`;
        });
        setsHtml += `</div>`;

        html += `
            <div class="ex-row" id="ex-row-${index}">
                <div class="ex-header" onclick="toggleAccordion(${index})"><div class="ex-thumb"><img src="${ex.img}"></div><div class="ex-info"><div class="ex-name">${ex.name}</div><div class="ex-progress-badge" id="badge-${index}" style="background:${badgeColor}; color:${badgeTextColor};">${completedCount} / ${totalSets} 완료</div></div><div class="ex-drag-icon">⋮⋮</div></div>
                <div class="ex-details">
                    <div class="ex-detail-img"><img src="${ex.img}">
                        <!-- 메모 오픈 버튼 바인딩 -->
                        <button class="btn-memo" onclick="openMemoModal('${ex.id}', '${ex.name}'); event.stopPropagation();">메모</button>
                    </div>
                    <div class="ex-tools"><button class="btn-superset">+ 슈퍼세트</button>${toggleHtml}</div>
                    ${lrToggleHtml}
                    <div id="sets-container-${index}">${setsHtml}</div>
                    <div class="set-add-btns"><button>+ 세트 추가</button><button>- 세트 삭제</button></div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html + `<div style="height:20px;"></div><div style="width:100%; display:flex; justify-content:center;"><button class="primary-btn" onclick="checkFinishWorkout()" style="margin-bottom:20px; width:100%; max-width:600px;">운동 완료</button></div>`;
    bindCheckEvents();
};

window.toggleAccordion = function(index) { document.getElementById(`ex-row-${index}`).classList.toggle('expanded'); };

// ==========================================
// [신규] 3. 메모장 및 가이드 오픈 로직
// ==========================================
window.openMemoModal = function(exId, exName) {
    const dbData = exerciseGuideDB[exId] || { badge: '전신', guide: '운동을 정확한 자세로 수행하세요.' };
    const savedMemo = localStorage.getItem(`memo_${exId}`) || '';
    
    // 썸네일 비디오/GIF 요소 렌더링
    const vidHtml = dbData.vid ? `<div class="bs-memo-vid"><img src="${dbData.vid}"></div>` : '';

    const html = `
        <div class="bs-memo-header-wrap">
            ${vidHtml}
            <div class="bs-memo-title-wrap">
                <div class="bs-memo-title">${exName}</div>
                <div class="bs-memo-badge">${dbData.badge}</div>
            </div>
        </div>
        
        <div class="bs-memo-section">
            <span class="bs-memo-sec-badge">메모</span>
            <textarea class="bs-memo-textarea" id="memo-input-${exId}" placeholder="이 운동에 대해 기억해 둘 것을 적어보세요">${savedMemo}</textarea>
        </div>

        <div class="bs-memo-section" style="border-color:#333;">
            <span class="bs-memo-sec-badge grey">수행 가이드</span>
            <div class="bs-guide-text">${dbData.guide}</div>
        </div>
    `;

    document.getElementById('bs-memo-content').innerHTML = html;
    
    // 메모 입력 시마다 로컬 스토리지에 자동 저장
    document.getElementById(`memo-input-${exId}`).addEventListener('input', function() {
        localStorage.setItem(`memo_${exId}`, this.value);
    });

    openBottomSheet('memo');
};

function bindCheckEvents() {
    document.querySelectorAll('.set-check').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); 
            this.classList.toggle('completed');
            const exIndex = this.closest('.ex-row').id.split('-')[2];
            const exData = window.currentRoutine[exIndex];
            
            let setId = this.getAttribute('data-id');
            if (exData.hasLR && !setId.startsWith('R_') && !setId.startsWith('L_')) {
                setId = `R_${setId}`;
                this.setAttribute('data-id', setId);
            }

            let savedData = JSON.parse(localStorage.getItem(`workout_${exData.id}`)) || [];

            if (this.classList.contains('completed')) {
                if (!savedData.includes(setId)) savedData.push(setId);
                startGlobalTimer(parseInt(this.getAttribute('data-time')), this.getAttribute('data-ex'));
            } else { 
                savedData = savedData.filter(id => id !== setId); 
            }
            
            localStorage.setItem(`workout_${exData.id}`, JSON.stringify(savedData));
            
            const totalSets = exData.hasLR ? exData.sets.length * 2 : exData.sets.length;
            const badge = document.getElementById(`badge-${exIndex}`);
            badge.innerText = `${savedData.length} / ${totalSets} 완료`;
            badge.style.background = savedData.length === totalSets ? '#E50914' : '#222';
            badge.style.color = savedData.length === totalSets ? '#fff' : '#aaa';
        });
    });
}
