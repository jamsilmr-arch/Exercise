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
// 2. 네이티브 뒤로가기(History API) 지원 및 상세 화면 로직
// ==========================================
window.openDetail = function(rtId) {
    window.currentViewedRoutineId = rtId; 
    // routineDB는 app.js에서 전역으로 가져옵니다.
    const data = window.routineDB[rtId] || window.routineDB['rt_6_body_limb_lower']; 
    
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
            
            html += `<div class="rd-thumbnails" id="thumb-col-${dayIndex}">`;
            const displayTexts = item.texts.slice(0, 4);
            
            displayTexts.forEach((txt, index) => {
                if (index === 3 && item.count > 4) {
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
            
            if (item.count > 4) {
                html += `<div class="rd-thumbnails" id="thumb-exp-${dayIndex}" style="display:none;">`;
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

    history.pushState({ view: 'detail' }, '', '#detail');
};

window.closeDetail = function(fromPopState = false) {
    document.getElementById('view-detail').classList.remove('active');
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById('view-list').classList.add('active');
    document.getElementById('view-list').style.display = 'block';
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) mainNav.style.display = 'flex';
    
    if (!fromPopState && location.hash === '#detail') {
        history.back();
    }
};

window.addEventListener('popstate', (e) => {
    if (location.hash !== '#detail') {
        window.closeDetail(true);
    }
});

// ==========================================
// 3. 로컬 데이터 연동 함수
// ==========================================
window.saveRoutineToLocal = function() {
    const rtId = window.currentViewedRoutineId;
    const data = window.routineDB[rtId];
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
    window.closeDetail();
    alert('내 루틴으로 저장되었습니다.');
};

window.useRoutineNow = function() {
    saveRoutineToLocal();
    location.href = 'home.html';
};

window.scrollToSection = function(sectionId, btn) {
    document.querySelectorAll('.rt-filter').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    const target = document.getElementById(sectionId);
    if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
};
