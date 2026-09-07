// 하단 공통 메뉴 렌더링 (현재 'routine' 탭 활성화)
renderBottomNav('routine');

// 부위별 실제 스크린샷과 유사한 고화질 GIF/이미지 매핑
const imgDB = {
    chest: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
    back: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif',
    legs: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squat_animation.gif',
    shoulders: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Seated_dumbbell_shoulder_press_animation.gif',
    arms: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Biceps_curl_animation.gif',
    full: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Deadlift_animation.gif'
};

// 특정 분할법에 따른 이미지 배열 생성기
function getImagesForDay(type, count) {
    let pool = [];
    if (type === 'upper') pool = [imgDB.chest, imgDB.back, imgDB.shoulders, imgDB.arms, imgDB.chest];
    else if (type === 'lower') pool = [imgDB.legs, imgDB.full, imgDB.legs, imgDB.legs];
    else if (type === 'push') pool = [imgDB.chest, imgDB.shoulders, imgDB.arms, imgDB.chest];
    else if (type === 'pull') pool = [imgDB.back, imgDB.arms, imgDB.back, imgDB.full];
    else if (type === 'full') pool = [imgDB.legs, imgDB.chest, imgDB.back, imgDB.shoulders, imgDB.arms];
    else if (type === 'core') pool = [imgDB.chest, imgDB.back, imgDB.chest, imgDB.back]; // 몸통
    else if (type === 'limb') pool = [imgDB.shoulders, imgDB.arms, imgDB.shoulders, imgDB.arms]; // 말단
    
    // 카운트 수만큼 풀에서 반복해서 가져오기
    let result = [];
    for(let i=0; i<count; i++) {
        result.push(pool[i % pool.length]);
    }
    return result;
}

const routineDB = {
    'rt_2_full': {
        title: '주 2회 무분할 루틴',
        chips: ['남성'],
        desc: '운동 가능 일수가 적은 분들에게 안성맞춤입니다. 주 2회만 운동하기 때문에 최적의 근성장 효과를 누릴 수는 없지만 운동에 투자하는 시간 대비 성과, 즉 가성비는 최고인 루틴입니다. 무분할로 진행되고 전신을 다 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: getImagesForDay('full', 7) },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('full', 7) },
            { type: 'rest', days: 3 }
        ]
    },
    'rt_3_hybrid': {
        title: '주 3회 (상체-하체-전신) 루틴',
        chips: ['상체-하체-전신', '남성'],
        desc: '2분할과 무분할을 섞은 하이브리드입니다. 상체 혹은 하체에 집중할 수 있는 2분할의 장점과 전신을 한꺼번에 운동해 효율적인 무분할의 장점까지 같이 있습니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 6, imgs: getImagesForDay('lower', 6) },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('full', 7) },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_3_full': {
        title: '주 3회 무분할 (전신-전신-전신) 루틴',
        chips: ['전신-전신-전신', '남성'],
        desc: '전신을 주 3회 운동하기 때문에 운동 주기가 아주 높습니다. 최신 메타 분석에 따르면 운동 주기가 증가함에 따라 스트렝스는 강한 상관관계를 보인다고 합니다. 제한적인 스케줄을 통해 스트렝스에 집중하고 싶다면 나쁘지 않은 옵션입니다. 무분할로 진행되고 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 8, imgs: getImagesForDay('full', 8) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 8, imgs: getImagesForDay('full', 8) },
            { type: 'rest', days: 2 },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('full', 7) },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_4_hybrid': {
        title: '주 4회 (밀기-당기기-하체-전신) 루틴',
        chips: ['밀기-당기기-하체-전신', '남성'],
        desc: '전형적인 무분할과 3분할을 결합한 하이브리드입니다. 특정 신체 부위에 집중할 수 있고 전신 날이 추가되기 때문에 운동 주기는 주 2회로 유지됩니다. 전신을 골고루 운동합니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: getImagesForDay('push', 6) },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('pull', 7) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 3', count: 5, imgs: getImagesForDay('lower', 5) },
            { type: 'workout', label: 'Day 4', count: 7, imgs: getImagesForDay('full', 7) },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_4_split': {
        title: '주 4회 (상체-하체-상체-하체) 루틴',
        chips: ['상체-하체-상체-하체', '남성'],
        desc: '전신을 균형 있게 발달시키기 위한 가장 기본적이고 효율적인 루틴으로, 전형적인 주 4회 2분할 방식입니다. 상체와 하체를 분리해 각각 이틀씩 운동하며 체계적인 구성으로 폭넓게 활용할 수 있습니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'workout', label: 'Day 2', count: 5, imgs: getImagesForDay('lower', 5) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'workout', label: 'Day 2a', count: 5, imgs: getImagesForDay('lower', 5) },
            { type: 'rest', days: 2 }
        ]
    },
    'rt_5_hybrid': {
        title: '주 5회 (상체-하체-상체-하체-상체) 루틴',
        chips: ['상체-하체-상체-하체-상체', '남성'],
        desc: '전신을 골고루 운동하는 루틴으로 주 5회 중 상체에 3일, 하체에 2일 투자하여 상체 운동을 더 여유롭게 분배했습니다. 하체보다 상체에 더 집중하는 루틴입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'workout', label: 'Day 2', count: 5, imgs: getImagesForDay('lower', 5) },
            { type: 'workout', label: 'Day 1a', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 2a', count: 4, imgs: getImagesForDay('lower', 4) },
            { type: 'workout', label: 'Day 1b', count: 7, imgs: getImagesForDay('upper', 7) },
            { type: 'rest', days: 1 }
        ]
    },
    'rt_6_push_pull': {
        title: '주 6회 (밀기-당기기-하체) 루틴',
        chips: ['밀기-당기기-하체', '남성'],
        desc: '전형적인 3분할입니다. 비슷한 근육을 모아서 운동하기 때문에 스트렝스 훈련에는 최적화되지 않았습니다. 하지만 단순하고 수행하기 쉽기 때문에 흔하고 인기가 많은 루틴입니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: getImagesForDay('push', 6) },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('pull', 7) },
            { type: 'workout', label: 'Day 3', count: 4, imgs: getImagesForDay('lower', 4) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 5, imgs: getImagesForDay('push', 5) },
            { type: 'workout', label: 'Day 2a', count: 5, imgs: getImagesForDay('pull', 5) },
            { type: 'workout', label: 'Day 3a', count: 5, imgs: getImagesForDay('lower', 5) }
        ]
    },
    'rt_6_body_limb_lower': {
        title: '주 6회 (몸통-말단-하체) 루틴',
        chips: ['몸통-말단-하체', '남성'],
        desc: '전신을 균형 있게 발달시키는 것을 목표로 하면서도, 전형적인 3분할 루틴(밀기-당기기-하체)의 단점을 보완한 프로그램입니다. 피로 누적을 줄이고 보다 안정적인 퍼포먼스를 유지할 수 있습니다.',
        timeline: [
            { type: 'workout', label: 'Day 1', count: 6, imgs: getImagesForDay('core', 6) },
            { type: 'workout', label: 'Day 2', count: 7, imgs: getImagesForDay('limb', 7) },
            { type: 'workout', label: 'Day 3', count: 5, imgs: getImagesForDay('lower', 5) },
            { type: 'rest', days: 1 },
            { type: 'workout', label: 'Day 1a', count: 6, imgs: getImagesForDay('core', 6) },
            { type: 'workout', label: 'Day 2a', count: 7, imgs: getImagesForDay('limb', 7) },
            { type: 'workout', label: 'Day 3a', count: 5, imgs: getImagesForDay('lower', 5) }
        ]
    }
};

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
