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
    
    // 훈련 진행 및 컨디션 체크 중에는 하단 메뉴바 숨김
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
        if (targetId === 'view-workout' || targetId === 'view-condition') {
            mainNav.style.display = 'none';
        } else {
            mainNav.style.display = 'flex';
        }
    }
};

// ==========================================
// 2. 홈 화면 데이터 바인딩
// ==========================================
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
    for (let i = 1; i <= frequency; i++) {
        // Day 2 카드가 메인이므로 2번에 active 표시
        weekBlocksHtml += `<div class="wb-item ${i === 2 ? 'active' : ''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    
    const weekBlocksElem = document.getElementById('home-week-blocks');
    if (weekBlocksElem) {
        weekBlocksElem.innerHTML = weekBlocksHtml;
    }
}

// Firebase 데이터 로드
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

// ==========================================
// 3. 버튼 클릭 및 컨디션 체크 이벤트 바인딩
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    // 1) '오늘 운동 시작' 클릭 -> 컨디션 화면으로 이동
    const btnGoCondition = document.getElementById('btn-go-condition');
    if (btnGoCondition) {
        btnGoCondition.addEventListener('click', () => {
            switchView('view-condition');
        });
    }

    // 2) 컨디션 슬라이더 조작
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

    // 3) 근육통 토글 버튼
    const btnMusclePain = document.getElementById('btn-muscle-pain');
    if (btnMusclePain) {
        btnMusclePain.addEventListener('click', () => {
            btnMusclePain.classList.toggle('active');
        });
    }

    // 4) 컨디션 확인 후 '운동 시작' 클릭 -> Day 2 리스트 렌더링 및 화면 전환
    const btnStartWorkout = document.getElementById('btn-start-workout-list');
    if (btnStartWorkout) {
        btnStartWorkout.addEventListener('click', () => {
            if (typeof renderWorkoutList === 'function') {
                renderWorkoutList(); // app.js에 정의된 Day 2 렌더러 호출
            }
            switchView('view-workout');
        });
    }
});
