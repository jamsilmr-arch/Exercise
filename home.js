// [수정됨] 운동 시작 버튼 클릭 시 메인 앱의 컨디션 화면으로 즉시 리다이렉트
window.startTodayWorkout = function() {
    window.location.href = 'index.html#condition';
};

window.startWorkout = function() {
    window.location.href = 'index.html#condition';
};

document.addEventListener("DOMContentLoaded", function () {
    const userStrengthRatio = localStorage.getItem('user_strength_ratio') || 25;
    const activeRoutineId = localStorage.getItem('active_routine_id') || 'rt_5_push_pull';
    const completedDays = parseInt(localStorage.getItem('completed_analysis_days')) || 0;
    
    if (typeof updateBlockProgressCard === 'function') {
        updateBlockProgressCard(completedDays);
    }
});
