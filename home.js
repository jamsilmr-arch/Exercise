window.switchView = function(targetId) {
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    const targetView = document.getElementById(targetId);
    if(targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block';
        window.scrollTo(0, 0);
    }
    
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        if (targetId === 'view-workout' || targetId === 'view-condition' || targetId === 'view-summary') {
            mainNav.style.display = 'none';
        } else {
            mainNav.style.display = 'flex';
        }
    }
};

// ==========================================
// 홈 화면 데이터 바인딩 및 동적 진행도 계산
// ==========================================
function renderHomeData(wizardData) {
    // 1. 선택한 루틴 타이틀
    const frequency = parseInt(wizardData?.question_6?.value) || 6;
    let splitName = '몸통-말단-하체';
    if (frequency === 3) splitName = '상체-하체-전신';
    else if (frequency === 4) splitName = '상체-하체-상체-하체';

    const routineTitleElem = document.getElementById('home-routine-title');
    if (routineTitleElem) {
        routineTitleElem.innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    }
    
    // 2. [신규] 스트렝스/근비대 목표 비율 동적 렌더링
    // 온보딩에서 사용자가 입력한 목표치 (데이터가 없으면 기본값 25:75)
    // 실제 wizardData 구조에 맞춰 question_X 부분을 수정해 사용하시면 됩니다.
    const strengthRatio = parseInt(wizardData?.goal_strength?.value) || 25; 
    const hypertrophyRatio = parseInt(wizardData?.goal_hypertrophy?.value) || 75;
    
    const ratioTextElem = document.getElementById('home-ratio-text');
    if (ratioTextElem) {
        ratioTextElem.innerText = `스트렝스 ${strengthRatio} : 근비대 ${hypertrophyRatio}`;
    }

    // 블록 4개 색상 동적 렌더링 (25%당 블록 1개 할당)
    const strengthBlocksCount = Math.round(strengthRatio / 25);
    const splitBlocksContainer = document.querySelector('.split-blocks');
    if (splitBlocksContainer) {
        let blocksHtml = '';
        for (let i = 0; i < 4; i++) {
            // 스트렝스 비율만큼 민트색(cyan), 나머지는 보라색 할당
            if (i < strengthBlocksCount) {
                blocksHtml += `<div class="s-block cyan"></div>`;
            } else {
                blocksHtml += `<div class="s-block"></div>`;
            }
        }
        splitBlocksContainer.innerHTML = blocksHtml;
    }

    // 3. 완료한 일수 데이터를 로컬스토리지에서 가져옴 (초기값 0)
    let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    
    let currentDay = completedDays + 1;
    if(currentDay > frequency) currentDay = 1;

    const todayDayElem = document.getElementById('home-today-day');
    if(todayDayElem) todayDayElem.innerText = `Day ${currentDay}`;
    
    let weekBlocksHtml = '';
    for (let i = 1; i <= frequency; i++) {
        weekBlocksHtml += `<div class="wb-item ${i === currentDay ? 'active' : ''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    
    const weekBlocksElem = document.getElementById('home-week-blocks');
    if (weekBlocksElem) {
        weekBlocksElem.innerHTML = weekBlocksHtml;
    }

    // 4. 맞춤 코칭 데이터 분석 퍼센티지
    let analyzePercent = Math.round((completedDays / frequency) * 100);
    if(analyzePercent > 100) analyzePercent = 100;
    if(analyzePercent < 0 || isNaN(analyzePercent)) analyzePercent = 0;
    
    const dpFill = document.querySelector('.dp-bar-fill');
    const dpText = document.querySelector('.dp-text');
    
    if(dpFill && dpText) {
        setTimeout(() => {
            dpFill.style.width = `${analyzePercent}%`;
            dpText.innerText = `${analyzePercent}%`;
        }, 100);
    }
}

// 유저 데이터 로드
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().wizardData) {
                renderHomeData(userDoc.data().wizardData);
            }
        } catch(e) { console.error("데이터 로드 실패:", e); }
    } else {
        renderHomeData({ question_6: { value: 6 } });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const btnGoCondition = document.getElementById('btn-go-condition');
    if (btnGoCondition) {
        btnGoCondition.addEventListener('click', () => {
            switchView('view-condition');
        });
    }

    const condSlider = document.getElementById('cond-slider');
    const condScore = document.getElementById('cond-score');
    const condText = document.getElementById('cond-text');
    const condLabels = ['매우 나빠요', '조금 피곤해요', '평소와 같이 무난해요', '컨디션이 좋아요', '날아갈 것 같아요!'];
    
    if (condSlider) {
        condSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (condScore) condScore.innerText = `${val}점`;
            if (condText) condText.innerText = condLabels[val - 1];
        });
    }

    const btnMusclePain = document.getElementById('btn-muscle-pain');
    if (btnMusclePain) {
        btnMusclePain.addEventListener('click', () => {
            btnMusclePain.classList.toggle('active');
        });
    }

    const btnStartWorkout = document.getElementById('btn-start-workout-list');
    if (btnStartWorkout) {
        btnStartWorkout.addEventListener('click', () => {
            if (btnMusclePain && btnMusclePain.classList.contains('active')) {
                openBottomSheet('muscle-pain');
            } else {
                if (typeof renderWorkoutList === 'function') renderWorkoutList();
                switchView('view-workout');
            }
        });
    }
    
    if (new URLSearchParams(window.location.search).get('openCardio') === 'true') {
        if(typeof startCardioWizard === 'function') startCardioWizard();
    }
});
