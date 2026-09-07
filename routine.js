// 하단 공통 메뉴 렌더링 (현재 'routine' 탭 활성화)
renderBottomNav('routine');

// 실제 스크린샷에 등장하는 운동 동작들을 표현할 고화질 GIF URL 맵핑
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

// 분할법에 따른 스크린샷 기반 썸네일 4개 고정 배열 세팅
const thumbPresets = {
    full: [imgDB.leg_squat, imgDB.chest_bench, imgDB.back_pullup, imgDB.shoulder_press], // 전신
    upper: [imgDB.chest_bench, imgDB.back_pullup, imgDB.shoulder_press, imgDB.arm_curl], // 상체
    lower: [imgDB.leg_squat, imgDB.leg_deadlift, imgDB.leg_squat, imgDB.leg_squat], // 하체
    push: [imgDB.chest_bench, imgDB.chest_fly, imgDB.shoulder_press, imgDB.arm_pushdown], // 밀기 (가슴/어깨/삼두)
    pull: [imgDB.back_pullup, imgDB.back_row, imgDB.arm_curl, imgDB.arm_curl], // 당기기 (등/이두)
    core: [imgDB.back_pullup, imgDB.chest_bench, imgDB.back_row, imgDB.chest_fly], // 몸통 (가슴/등)
    limb: [imgDB.arm_curl, imgDB.arm_pushdown, imgDB.shoulder_press, imgDB.shoulder_press] // 말단 (어깨/이두/삼두)
};

// 전체 루틴 데이터베이스 (스크린샷 내용 및 썸네일 구조 완벽 반영)
const routineDB = {
    'rt_2_full': {
        title: '주 2회 무분할 루틴',
        chips: ['남성'],
        desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다. 주 2회만 운동하기 때문에 최적의 근성장 효과를 누릴 수는 없지만 운동에 투자하는 시간 대비 성과, 즉 가성비는 최고인 루틴입니다. 무분할로 진행되고 전신을 다 골고루 운동합니다.',
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
        desc: '2분할과 무분할을 섞은 하이브리드입니다. 상체 혹은 하체에 집중할 수 있는 2분할의 장점과 전신을 한꺼번에 운동해 효율적인 무분할의 장점까지 같이 있습니다. 전신을 골고루 운동합니다.',
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
        desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다. 최신 메타 분석에 따르면 운동 주기가 증가함에 따라 스트렝스는 강한 상관관계를 보인다고 합니다. 제한적인 스케줄을 통해 스트렝스에 집중하고 싶다면 나쁘지 않은 옵션입니다. 무분할로 진행되고 전신을 골고루 운동합니다.',
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
        desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다. 밀기 - 당기기 - 하체 하는 날에 특정 신체 부위에 집중할 수 있고, 전신 날이 추가되기 때문에 운동 주기는 주 2회로 유지됩니다. 전신을 골고루 운동합니다.',
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
        desc: '전신을 균형 있게 발달시키기 위한 가장 기본적이고 효율적인 루틴으로, 전형적인 주 4회 2분할 방식입니다. 상체와 하체를 분리해 각각 이틀씩 운동하며, 단순하면서도 체계적인 구성으로 초보자부터 중급자까지 폭넓게 활용할 수 있습니다.',
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
        desc: '하체 운동을 주 1회만 함으로써 상체에 더 집중할 수 있는 루틴입니다. 3분할을 사용하기 때문에 특정 신체 부위에 집중할 수 있습니다. 하체보다 상체에 더 집중하는 분들에게 권장합니다.',
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
        desc: '전신을 골고루 운동하는 루틴으로 주 5회 중 상체에 3일, 하체에 2일 투자하여, 비교적 운동 종류가 더 많고 많은 시간이 소요되는 상체 운동을 더 여유롭게 분배했습니다.',
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
        desc: '전형적인 3분할입니다. 비슷한 근육을 모아서 운동하기 때문에 스트렝스 훈련에는 최적화되지 않았습니다. 하지만 단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 루틴입니다.',
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
        desc: '전신을 균형 있게 발달시키는 것을 목표로 하면서도, 전형적인 3분할 루틴(밀기-당기기-하체)의 단점을 보완한 프로그램입니다. 유사한 근육군을 한 세션에 몰아넣지 않기 때문에, 세션 후반부의 피로 누적을 줄이고 보다 안정적인 퍼포먼스를 유지할 수 있어 스트렝스 중심의 훈련에 특히 적합합니다.',
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

window.openDetail = function(rtId) {
    // 요청한 루틴 ID가 없으면 기본값으로 6분할 몸통-말단-하체 사용
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
                    <div class="rd-thumbnails">
                        ${item.imgs.slice(0, 4).map(imgUrl => `<div class="rd-thumb"><img src="${imgUrl}"></div>`).join('')}
                        ${item.count > 4 ? `<div class="rd-thumb" style="background:#111; color:#fff; font-size:0.8rem; font-weight:bold;">+${item.count - 4}</div>` : ''}
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
    window.scrollTo(0, 0);
};

window.closeDetail = function() {
    document.getElementById('view-detail').classList.remove('active');
    document.getElementById('view-list').classList.add('active');
};
