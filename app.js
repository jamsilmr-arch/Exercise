// 요소 선택
const viewHome = document.getElementById('view-home');
const viewWorkout = document.getElementById('view-workout');
const btnStartWorkout = document.getElementById('btn-start-workout');
const btnBack = document.getElementById('btn-back');

// 화면 전환 이벤트
btnStartWorkout.addEventListener('click', () => {
    viewHome.classList.remove('active');
    viewWorkout.classList.add('active');
    window.scrollTo(0, 0);
});

btnBack.addEventListener('click', () => {
    viewWorkout.classList.remove('active');
    viewHome.classList.add('active');
});

// Day 1: 밀기 데이 루틴 데이터
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];

let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');
const mainContainer = document.getElementById('exercise-list');

// 훈련 화면 렌더링
function renderWorkout() {
    mainContainer.innerHTML = '';
    let totalCompletedSets = 0;
    let totalSets = 0;

    routine.forEach((ex) => {
        totalSets += ex.sets;
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
        totalCompletedSets += savedData.length;

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

    // 메인 화면 진행률(완료율) 자동 업데이트
    updateProgress(totalCompletedSets, totalSets);
}

function handleSetClick(exercise, setNum, btnElement, savedData) {
    if (savedData.includes(setNum)) {
        savedData = savedData.filter(num => num !== setNum);
        btnElement.classList.remove('completed');
    } else {
        savedData.push(setNum);
        btnElement.classList.add('completed');
        if (navigator.vibrate) navigator.vibrate(50);
        startTimer(exercise.rest); // 휴식 타이머 가동
    }
    localStorage.setItem(`workout_${exercise.id}`, JSON.stringify(savedData));
    renderWorkout(); // 완료율 재계산을 위해 다시 렌더링
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    endTime = Date.now() + (seconds * 1000);
    timerDisplay.classList.add('active');
    timerDisplay.classList.remove('finished');

    timerInterval = setInterval(() => {
        const timeRemaining = Math.ceil((endTime - Date.now()) / 1000);
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.classList.remove('active');
            timerDisplay.classList.add('finished');
            timerDisplay.innerText = "진행!";
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        } else {
            const m = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
            const s = String(timeRemaining % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }
    }, 200);
}

function updateProgress(completed, total) {
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.querySelector('.progress-fill').style.width = `${percent}%`;
    document.querySelector('.progress-percent').innerText = `${percent}%`;
}

// 초기 실행
renderWorkout();
