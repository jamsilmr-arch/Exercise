// ==========================================
// 1. 화면 전환 핸들러
// ==========================================
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
// 2. 홈 화면 데이터 바인딩 및 동적 진행도 계산
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
    
    // [수정됨] 완료한 일수 데이터를 로컬스토리지에서 가져옴 (초기값 0)
    let completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    
    // 현재 진행해야 할 날짜 계산 (완료한 날짜 + 1)
    let currentDay = completedDays + 1;
    // 설정한 빈도수를 초과하면 1로 초기화 (또는 루틴 완료 처리)
    if(currentDay > frequency) currentDay = 1;

    // 홈 화면 카드 타이틀 업데이트
    const todayDayElem = document.getElementById('home-today-day');
    if(todayDayElem) todayDayElem.innerText = `Day ${currentDay}`;
    
    // 주간 요일 블록 렌더링
    let weekBlocksHtml = '';
    for (let i = 1; i <= frequency; i++) {
        weekBlocksHtml += `<div class="wb-item ${i === currentDay ? 'active' : ''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    
    const weekBlocksElem = document.getElementById('home-week-blocks');
    if (weekBlocksElem) {
        weekBlocksElem.innerHTML = weekBlocksHtml;
    }

    // 맞춤 코칭 데이터 분석 퍼센티지 동적 계산 (총 빈도수 기준)
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
        // 로그인 정보가 없을 경우 기본 렌더링을 위해 더미 호출
        renderHomeData({ question_6: { value: 6 } });
    }
});

// ==========================================
// 3. 버튼 클릭 및 이벤트 바인딩
// ==========================================
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
