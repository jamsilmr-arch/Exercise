window.activeTab = 'analysis';

function calculate1RM(weight, reps) {
    if(reps === 1) return weight;
    return Math.round(weight * (1 + (reps / 30)) * 10) / 10;
}

// 화면 전환 및 로컬 파일 에러 방지 처리
window.switchAnalysisView = function(viewName) {
    // 1. 모든 뷰 숨기기
    document.querySelectorAll('.view-container').forEach(v => v.style.display = 'none');

    // 2. 요청한 뷰만 표시
    const targetView = document.getElementById(`view-analysis-${viewName}`);
    if(targetView) {
        targetView.style.display = 'block';
        window.scrollTo(0, 0);
    }

    // 3. 하단 네비게이션 제어 및 URL 히스토리 업데이트 (try-catch로 로컬 에러 방어)
    const mainNav = document.getElementById('main-nav');
    if(viewName === 'dash') {
        if(mainNav) mainNav.style.display = 'flex';
        try { history.replaceState({ view: 'dash' }, '', '#dash'); } catch(e) {}
    } else {
        if(mainNav) mainNav.style.display = 'none';
        try { history.pushState({ view: viewName }, '', `#${viewName}`); } catch(e) {}
    }
};

// 뒤로가기 제어
window.addEventListener('popstate', (e) => {
    if (!location.hash || location.hash === '#dash') {
        switchAnalysisView('dash');
    } else if (location.hash === '#list') {
        switchAnalysisView('list');
    } else if (location.hash === '#volume') {
        switchAnalysisView('volume');
    } else if (location.hash === '#growth') {
        switchAnalysisView('growth');
    } else if (location.hash === '#detail') {
        switchAnalysisView('list');
    }
});

let currentChartType = '1RM';
let currentExercise = '';

window.openPerfDetail = function(name) {
    currentExercise = name;
    currentChartType = '1RM'; 
    renderAnalysisDetail();
    switchAnalysisView('detail');
};

window.closePerfDetail = function() {
    switchAnalysisView('list'); // 명시적으로 리스트로 복귀
};

window.switchChartType = function(type) {
    currentChartType = type;
    renderAnalysisDetail();
};

function renderAnalysisDetail() {
    document.getElementById('ad-title').innerText = currentExercise;
    
    let html = `
        <div class="ad-top-summary">
            <div class="ad-sum-box highlight">
                <span class="ad-sum-label">최고 추정 1RM</span>
                <span class="ad-sum-val">0<span>kg</span></span>
            </div>
            <div class="ad-sum-box">
                <span class="ad-sum-label">최대 볼륨</span>
                <span class="ad-sum-val">0<span>kg</span></span>
            </div>
        </div>
        <div class="ad-tabs">
            <button class="ad-tab active">추정 1RM 추이</button>
            <button class="ad-tab">총 볼륨 추이</button>
        </div>
        <div class="ad-chart-container" style="display:flex; justify-content:center; align-items:center; color:#666; font-size:0.9rem; text-align:center;">
            아직 기록된 데이터가 없습니다.<br>운동을 완료하면 분석 그래프가 나타납니다.
        </div>
        <div class="ad-history-title">최근 운동 기록</div>
        <div class="ad-history-list">
            <div class="ad-history-item" style="justify-content:center; color:#555; font-size:0.9rem;">기록 없음</div>
        </div>
    `;
    document.getElementById('ad-render').innerHTML = html;
}

// 초기 화면 로드 시 대시보드 렌더링
document.addEventListener("DOMContentLoaded", () => {
    if (!location.hash || location.hash === '#dash') {
        switchAnalysisView('dash');
    }
});
