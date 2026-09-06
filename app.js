// DOM 요소 선택
const viewHome = document.getElementById('view-home');
const viewWorkout = document.getElementById('view-workout');
const viewAnalysis = document.getElementById('view-analysis');
const btnStartWorkout = document.getElementById('btn-start-workout');
const btnBack = document.getElementById('btn-back');
const navItems = document.querySelectorAll('.nav-item');

// 뷰 전환 유틸리티
function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    document.getElementById(targetId).classList.add('active');
    window.scrollTo(0, 0);
}

// 하단 네비게이션 탭 전환 이벤트
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchView(target);
        }
    });
});

// 운동 시작 / 뒤로가기 버튼 이벤트
btnStartWorkout.addEventListener('click', () => switchView('view-workout'));
btnBack.addEventListener('click', () => switchView('view-home'));

// Day 1: 밀기 데이 루틴 데이터
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];

let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');
const mainContainer = document.getElementById('exercise-list');

// 훈련 화면 렌더링 로직
function renderWorkout() {
    mainContainer.innerHTML = '';
    
    routine.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `
            <div class="exercise-header">
                <span style="font-size: 1.05rem; font-weight: bold;">${ex.name}</span>
                <span style="font-size: 0.85rem; color: #888;">${ex.reps} / 휴식 ${ex.rest}초</span>
            </div>
        `;

        const setContainer = document.createElement('div');
        setContainer.className = 'set-container';
        
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];

        for (let i = 1; i <= ex.sets; i++) {
            const btn = document.createElement('div');
            btn.className = `set-btn ${savedData.includes(i) ? 'completed' : ''}`;
            btn.innerText = i;
            
            btn.addEventListener('click', () => {
                handleSetClick(ex, i, btn, savedData);
            });
            
            setContainer.appendChild(btn);
        }
        card.appendChild(setContainer);
        mainContainer.appendChild(card);
    });
}

// 세트 터치 시 동작 & 휴식 타이머 가동 로직
function handleSetClick(exercise, setNum, btnElement, savedData) {
    if (savedData.includes(setNum)) {
        savedData = savedData.filter(num => num !== setNum);
        btnElement.classList.remove('completed');
    } else {
        savedData.push(setNum);
        btnElement.classList.add('completed');
        if (navigator.vibrate) navigator.vibrate(50);
        startTimer(exercise.rest);
    }
    localStorage.setItem(`workout_${exercise.id}`, JSON.stringify(savedData));
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    endTime = Date.now() + (seconds * 1000);
    timerDisplay.classList.add('active');
    
    timerInterval = setInterval(() => {
        const timeRemaining = Math.ceil((endTime - Date.now()) / 1000);
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.classList.remove('active');
            timerDisplay.innerText = "진행!";
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } else {
            const m = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
            const s = String(timeRemaining % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }
    }, 200);
}

// 초기화
renderWorkout();
