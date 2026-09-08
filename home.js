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
        weekBlocksHtml += `<div class="wb-item ${i === 2 ? 'active' : ''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    
    const weekBlocksElem = document.getElementById('home-week-blocks');
    if (weekBlocksElem) {
        weekBlocksElem.innerHTML = weekBlocksHtml;
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

// ==========================================
// 3. 버튼 클릭 및 컨디션 체크 이벤트 바인딩
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

    // [수정됨] 근육통 여부에 따른 동작 분기
    const btnStartWorkout = document.getElementById('btn-start-workout-list');
    if (btnStartWorkout) {
        btnStartWorkout.addEventListener('click', () => {
            // 근육통 버튼이 켜져 있으면 부위 선택 팝업 오픈
            if (btnMusclePain && btnMusclePain.classList.contains('active')) {
                openBottomSheet('muscle-pain');
            } 
            // 꺼져 있으면 바로 훈련 화면으로 이동
            else {
                if (typeof renderWorkoutList === 'function') renderWorkoutList();
                switchView('view-workout');
            }
        });
    }
    
    // URL 파라미터 확인 후 유산소 마법사 자동 실행 (옵션)
    if (new URLSearchParams(window.location.search).get('openCardio') === 'true') {
        if(typeof startCardioWizard === 'function') startCardioWizard();
    }
});
