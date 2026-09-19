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
    const activeTitle = localStorage.getItem('active_routine_title');
    const activeFreq = parseInt(localStorage.getItem('active_routine_freq'));
    
    const frequency = activeFreq || parseInt(wizardData?.question_6?.value) || 6;
    
    const routineTitleElem = document.getElementById('home-routine-title');
    if (routineTitleElem) {
        if (activeTitle) {
            routineTitleElem.innerText = activeTitle;
        } else {
            let splitName = '몸통-말단-하체';
            if (frequency === 3) splitName = '상체-하체-전신';
            else if (frequency === 4) splitName = '상체-하체-상체-하체';
            routineTitleElem.innerText = `주 ${frequency}회 (${splitName}) 루틴`;
        }
    }
    
    const strengthRatio = parseInt(wizardData?.goal_strength?.value) || 25; 
    const hypertrophyRatio = parseInt(wizardData?.goal_hypertrophy?.value) || 75;
    
    const ratioTextElem = document.getElementById('home-ratio-text');
    if (ratioTextElem) {
        ratioTextElem.innerText = `스트렝스 ${strengthRatio} : 근비대 ${hypertrophyRatio}`;
    }

    const strengthBlocksCount = Math.round(strengthRatio / 25);
    const splitBlocksContainer = document.querySelector('.split-blocks');
    if (splitBlocksContainer) {
        let blocksHtml = '';
        for (let i = 0; i < 4; i++) {
            if (i < strengthBlocksCount) {
                blocksHtml += `<div class="s-block cyan"></div>`;
            } else {
                blocksHtml += `<div class="s-block"></div>`;
            }
        }
        splitBlocksContainer.innerHTML = blocksHtml;
    }

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

    // ==========================================
    // [수정됨] 컨디션 + 근육통 복합 강도 조절 알고리즘
    // ==========================================
    function applyConditionAndStart() {
        const score = parseInt(condSlider ? condSlider.value : 3);
        let msg = "";
        
        // 1. 컨디션 점수 기반 기본 메시지
        if (score === 1) {
            msg = "⚠️ 컨디션 1점\n오늘은 무리하지 마세요. 부상 방지를 위해 전체 운동의 세트 수를 1개씩 줄이고 목표 횟수를 하향 조절했습니다.";
        } else if (score === 2) {
            msg = "🔋 컨디션 2점\n피로가 덜 풀렸네요. 전체 운동의 세트 수를 1개씩 줄여 루틴을 가볍게 조절했습니다.";
        } else if (score === 3) {
            msg = "✅ 컨디션 3점\n계획된 정규 루틴 그대로 운동을 시작합니다. 파이팅!";
        } else if (score === 4) {
            msg = "🔥 컨디션 4점\n컨디션이 좋네요! 원래 계획대로 진행하되, 여력이 있다면 마지막 세트에서 횟수를 추가해보세요.";
        } else if (score === 5) {
            msg = "🚀 컨디션 5점\n최상의 컨디션! 점진적 과부하를 위해 오늘 운동의 목표 횟수와 강도를 상향 조절했습니다.";
        }

        // 2. 근육통 여부 파악 및 추가 메시지 병합
        const hasMusclePain = btnMusclePain && btnMusclePain.classList.contains('active');
        let selectedPains = [];

        if (hasMusclePain) {
            // 바텀시트에서 활성화된 근육통 칩을 모두 수집
            const activeChips = document.querySelectorAll('#bs-muscle-pain .pain-chip.active');
            activeChips.forEach(chip => selectedPains.push(chip.innerText));
            
            if (selectedPains.length > 0) {
                msg += `\n\n🩹 근육통 감지 (${selectedPains.join(', ')})\n선택하신 부위의 회복을 고려하여, 해당 부위가 강하게 쓰이는 종목의 중량과 세트 수를 안전하게 하향 조절했습니다.`;
            }
        }

        // 3. 로컬 스토리지에 데이터 저장 (추후 운동 렌더링 시 연동)
        localStorage.setItem('workout_intensity_score', score);
        localStorage.setItem('workout_pain_areas', JSON.stringify(selectedPains));
        
        // 조절 내역 안내 팝업
        alert(msg);

        // 실제 운동 화면으로 전환
        if (typeof renderWorkoutList === 'function') renderWorkoutList();
        switchView('view-workout');
    }

    const btnStartWorkout = document.getElementById('btn-start-workout-list');
    if (btnStartWorkout) {
        btnStartWorkout.addEventListener('click', () => {
            if (btnMusclePain && btnMusclePain.classList.contains('active')) {
                openBottomSheet('muscle-pain');
            } else {
                applyConditionAndStart();
            }
        });
    }
    
    const btnPainStart = document.getElementById('btn-pain-start-workout');
    if (btnPainStart) {
        btnPainStart.onclick = () => {
            if (typeof closeModal === 'function') closeModal();
            applyConditionAndStart();
        };
    }
    
    if (new URLSearchParams(window.location.search).get('openCardio') === 'true') {
        if(typeof startCardioWizard === 'function') startCardioWizard();
    }
});
