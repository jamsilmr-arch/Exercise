// [수정됨] 오염된 코드를 정제하고 화면 라우팅 로직 정상화

window.switchView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
    } else {
        console.error("View not found:", viewId);
    }
};

window.openBottomSheet = function(sheetId) {
    const sheet = document.getElementById(sheetId);
    if (sheet) {
        sheet.classList.add('active');
        sheet.style.display = 'block';
    }
};

window.closeBottomSheet = function(sheetId) {
    const sheet = document.getElementById(sheetId);
    if (sheet) {
        sheet.classList.remove('active');
        sheet.style.display = 'none';
    }
};

window.selectCondition = function(score) {
    localStorage.setItem('today_condition', score);
    
    document.querySelectorAll('.condition-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`.condition-btn[data-score="${score}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
};

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetViewId = this.getAttribute('data-target');
            if(targetViewId) {
                window.switchView(targetViewId);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    
    // URL 해시 분기 처리: #condition 진입 시 해당 뷰 즉각 렌더링
    if (window.location.hash === '#condition') {
        window.switchView('view-condition');
    } else {
        window.switchView('view-home');
    }
});
