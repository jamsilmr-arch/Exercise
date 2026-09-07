// ==========================================
// 1. 썸네일 이미지 DB 및 프리셋
// ==========================================
const imgDB = {
    chest_bench: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
    chest_fly: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
    back_pullup: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif',
    back_row: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif',
    shoulder_press: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif',
    arm_curl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
    arm_pushdown: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Pushdown_animation.gif',
    leg_squat: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squat_animation.gif',
    leg_deadlift: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Deadlift_animation.gif'
};

const thumbPresets = {
    full: [imgDB.leg_squat, imgDB.chest_bench, imgDB.back_pullup, imgDB.shoulder_press], 
    upper: [imgDB.chest_bench, imgDB.back_pullup, imgDB.shoulder_press, imgDB.arm_curl], 
    lower: [imgDB.leg_squat, imgDB.leg_deadlift, imgDB.leg_squat, imgDB.leg_squat], 
    push: [imgDB.chest_bench, imgDB.chest_fly, imgDB.shoulder_press, imgDB.arm_pushdown], 
    pull: [imgDB.back_pullup, imgDB.back_row, imgDB.arm_curl, imgDB.arm_curl], 
    core: [imgDB.back_pullup, imgDB.chest_bench, imgDB.back_row, imgDB.chest_fly], 
    limb: [imgDB.arm_curl, imgDB.arm_pushdown, imgDB.shoulder_press, imgDB.shoulder_press] 
};

// ==========================================
// 2. 전체 루틴 데이터베이스
// ==========================================
const routineDB = {
    'rt_2_full': {
        title: '주 2회 무분할 루틴',
        chips: ['남성'],
        desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다. 무분할로 진행되고 전신을 다 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: thumbPresets.full },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.full },
            { type: 'rest', days: 3 }
        ]
    },
    'rt_3_hybrid': {
        title: '주 3회 (상체-하체-전신) 루틴',
        chips: ['상체-하체-전신', '남성'],
        desc: '2분할과 무분할을 섞은 하이브리드입니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: thumbPresets.upper },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 6, imgs: thumbPresets.lower },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.full },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_3_full': {
        title: '주 3회 무분할 (전신-전신-전신) 루틴',
        chips: ['전신-전신-전신', '남성'],
        desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 8, imgs: thumbPresets.full },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 8, imgs: thumbPresets.full },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.full },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_4_hybrid': {
        title: '주 4회 (밀기-당기기-하체-전신) 루틴',
        chips: ['밀기-당기기-하체-전신', '남성'],
        desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: thumbPresets.push },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.pull },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 3', count: 5, imgs: thumbPresets.lower },
            { type: 'workout', label: 'Day 4', count: 7, imgs: thumbPresets.full },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_4_split': {
        title: '주 4회 (상체-하체-상체-하체) 루틴',
        chips: ['상체-하체-상체-하체', '남성'],
        desc: '가장 기본적이고 효율적인 전형적인 주 4회 2분할 방식입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: thumbPresets.upper },
            { type: 'workout', label: 'Day 2', count: 5, imgs: thumbPresets.lower },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 7, imgs: thumbPresets.upper },
            { type: 'workout', label: 'Day 2a', count: 5, imgs: thumbPresets.lower },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_5_push_pull': {
        title: '주 5회 (밀기-당기기-하체-밀기-당기기) 루틴',
        chips: ['밀기-당기기-하체-밀기-당기기', '남성'],
        desc: '하체 운동을 주 1회만 함으로써 상체에 더 집중할 수 있는 루틴입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: thumbPresets.push },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.pull },
            { type: 'workout', label: 'Day 3', count: 6, imgs: thumbPresets.lower },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 5, imgs: thumbPresets.push },
            { type: 'workout', label: 'Day 2a', count: 6, imgs: thumbPresets.pull },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_5_hybrid': {
        title: '주 5회 (상체-하체-상체-하체-상체) 루틴',
        chips: ['상체-하체-상체-하체-상체', '남성'],
        desc: '상체에 3일, 하체에 2일 투자하여 상체 운동을 더 여유롭게 분배했습니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: thumbPresets.upper },
            { type: 'workout', label: 'Day 2', count: 5, imgs: thumbPresets.lower },
            { type: 'workout', label: 'Day 1a', count: 7, imgs: thumbPresets.upper },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 2a', count: 4, imgs: thumbPresets.lower },
            { type: 'workout', label: 'Day 1b', count: 7, imgs: thumbPresets.upper },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_6_push_pull': {
        title: '주 6회 (밀기-당기기-하체) 루틴',
        chips: ['밀기-당기기-하체', '남성'],
        desc: '단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 3분할 루틴입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: thumbPresets.push },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.pull },
            { type: 'workout', label: 'Day 3', count: 4, imgs: thumbPresets.lower },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 5, imgs: thumbPresets.push },
            { type: 'workout', label: 'Day 2a', count: 5, imgs: thumbPresets.pull },
            { type: 'workout', label: 'Day 3a', count: 5, imgs: thumbPresets.lower }
        ]
    },
    'rt_6_body_limb_lower': {
        title: '주 6회 (몸통-말단-하체) 루틴',
        chips: ['몸통-말단-하체', '남성'],
        desc: '세션 후반부의 피로 누적을 줄이고 안정적인 퍼포먼스를 유지하는 3분할 변형입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: thumbPresets.core },
            { type: 'workout', label: 'Day 2', count: 7, imgs: thumbPresets.limb },
            { type: 'workout', label: 'Day 3', count: 5, imgs: thumbPresets.lower },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 6, imgs: thumbPresets.core },
            { type: 'workout', label: 'Day 2a', count: 7, imgs: thumbPresets.limb },
            { type: 'workout', label: 'Day 3a', count: 5, imgs: thumbPresets.lower }
        ]
    }
};

// ==========================================
// 3. 루틴 상세 프리뷰 오픈 로직
// ==========================================
window.openDetail = function(rtId) {
    const data = routineDB[rtId] || routineDB['rt_6_body_limb_lower']; 
    
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
                    <div class="rd-thumbnails">`;
            
            const displayImgs = item.imgs.slice(0, 4);
            displayImgs.forEach((imgUrl, index) => {
                if (index === 3 && item.count > 4) {
                    html += `
                        <div class="rd-thumb">
                            <img src="${imgUrl}">
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center; color:#fff; font-size:1.1rem; font-weight:bold;">
                                +${item.count - 4}
                            </div>
                        </div>`;
                } else {
                    html += `<div class="rd-thumb"><img src="${imgUrl}"></div>`;
                }
            });
            
            html += `
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
                <button class="secondary-btn" onclick="closeDetail()">내 루틴에 저장</button>
                <button class="primary-btn" onclick="location.href='home.html'">루틴 바로 사용</button>
            </div>
        </div>
    `;
    
    document.getElementById('rd-render-area').innerHTML = html;
    
    document.getElementById('view-list').classList.remove('active');
    document.getElementById('view-detail').classList.add('active');
    
    // 네비게이션 숨김 처리
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'none';
    
    window.scrollTo(0, 0);
};

window.closeDetail = function() {
    document.getElementById('view-detail').classList.remove('active');
    document.getElementById('view-list').classList.add('active');
    
    // 네비게이션 다시 보이기
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'flex';
};
