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

function renderHomeData(wizardData) {
    const frequency = parseInt(wizardData?.question_6?.value) || 6;
    let splitName = '몸통-말단-하체';
    if (frequency === 3) splitName = '상체-하체-전신';
    else if (frequency === 4) splitName = '상체-하체-상체-하체';

    const routineTitleElem = document.getElementById('home-routine-title');
    if (routineTitleElem) {
        routineTitleElem.innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    }
    
    let weekBlocksHtml = '';
    
    // Day 2라고 가정 (실제로는 로컬스토리지나 DB에서 진행 일수를 가져와야 함)
    // 지금은 스크린샷과 흐름에 맞추기 위해 강제로 2일차로 시뮬레이션 합니다.
    const currentDay = 2; 

    for (let i = 1; i <= frequency; i++) {
        weekBlocksHtml += `<div class="wb-item ${i === currentDay ? 'active' : ''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    
    const weekBlocksElem = document.getElementById('home-week-blocks');
    if (weekBlocksElem) {
        weekBlocksElem.innerHTML = weekBlocksHtml;
    }

    // [신규] 맞춤 코칭 데이터 분석 퍼센티지 동적 계산 (총 7일 기준 현재 일수 비율)
    const totalDaysInWeek = 7;
    // 계산식: (현재까지 완료한 일수 / 일주일) * 100
    // 여기서는 currentDay를 기준으로 보여줍니다.
    let analyzePercent = Math.round((currentDay / totalDaysInWeek) * 100);
    if(analyzePercent > 100) analyzePercent = 100;
    
    const dpFill = document.querySelector('.dp-bar-fill');
    const dpText = document.querySelector('.dp-text');
    
    if(dpFill && dpText) {
        // 애니메이션 효과를 위해 0.1초 뒤에 너비 지정
        setTimeout(() => {
            dpFill.style.width = `${analyzePercent}%`;
            dpText.innerText = `${analyzePercent}%`;
        }, 100);
    }
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().wizardData) {
                renderHomeData(userDoc.data().wizardData);
            }
        } catch(e) { console.error("데이터 로드 실패:", e); }
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
