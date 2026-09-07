const mockImgs = [
    'https://upload.wikimedia.org/wikipedia/commons/d/d4/Bench_press_animation.gif',
    'https://upload.wikimedia.org/wikipedia/commons/e/e6/Pull_up_animation.gif',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Squat_animation.gif'
];
function getMockImg(i) { return mockImgs[i % mockImgs.length]; }

const routineDB = {
    'rt_2_full': { title: '주 2회 무분할 루틴', chips: ['남성'], desc: '시간 대비 가성비 최고 루틴.', timeline: [{type:'workout',label:'Day 1',count:7}, {type:'rest',days:2}, {type:'workout',label:'Day 2',count:7}, {type:'rest',days:3}] },
    'rt_3_hybrid': { title: '주 3회 (상체-하체-전신)', chips: ['상체-하체-전신', '남성'], desc: '2분할과 무분할의 하이브리드.', timeline: [{type:'workout',label:'Day 1',count:7}, {type:'rest',days:1}, {type:'workout',label:'Day 1a',count:6}, {type:'rest',days:2}] },
    'rt_4_split': { title: '주 4회 (상체-하체)', chips: ['상체-하체', '남성'], desc: '전형적인 2분할 4일.', timeline: [{type:'workout',label:'Day 1',count:7}, {type:'workout',label:'Day 2',count:5}, {type:'rest',days:1}] },
    'rt_6_body_limb_lower': { title: '주 6회 (몸통-말단-하체)', chips: ['몸통-말단-하체', '남성'], desc: '3분할 단점 보완.', timeline: [{type:'workout',label:'Day 1',count:6}, {type:'workout',label:'Day 2',count:7}, {type:'workout',label:'Day 3',count:5}, {type:'rest',days:1}] }
};

window.openDetail = function(rtId) {
    const data = routineDB[rtId];
    let html = `<div class="rd-header"><h1 class="rd-title">${data.title}</h1><div class="rd-chips">${data.chips.map(c=>`<span class="rt-chip">${c}</span>`).join('')}</div><p class="rd-desc">${data.desc}</p></div><div class="rd-preview-title">루틴 미리보기 (1주 기준)</div><div class="rd-timeline">`;
    data.timeline.forEach(item => {
        if(item.type === 'workout') {
            html += `<div class="rd-item"><div class="rd-dot"></div><div class="rd-content"><div class="rd-day-title">${item.label} <span>| 총 ${item.count}개 운동</span></div><div class="rd-thumbnails">${Array(Math.min(item.count,4)).fill(0).map((_,i)=>`<div class="rd-thumb"><img src="${getMockImg(i)}"></div>`).join('')}</div></div></div>`;
        } else {
            html += `<div class="rd-item"><div class="rd-dot rest"></div><div class="rd-content"><div class="rd-day-title" style="color:#aaa;">휴식 <span>| ${item.days}일</span></div></div></div>`;
        }
    });
    html += `</div><div class="rd-footer"><div class="rd-footer-inner"><button class="secondary-btn" onclick="closeDetail()">취소</button><button class="primary-btn" onclick="closeDetail()">루틴 사용</button></div></div>`;
    
    document.getElementById('rd-render-area').innerHTML = html;
    document.getElementById('view-list').classList.remove('active');
    document.getElementById('view-detail').classList.add('active');
    window.scrollTo(0,0);
};

window.closeDetail = function() {
    document.getElementById('view-detail').classList.remove('active');
    document.getElementById('view-list').classList.add('active');
};
