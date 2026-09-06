// 앞서 확정한 Day 1 밀기(Push) 루틴 데이터
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12', rest: 60 },
    { id: 'incline', name: '인클라인 머신 프레스', sets: 3, reps: '12', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20', rest: 45 }
];

let timerInterval = null;
let endTime = 0;

const timerDisplay = document.getElementById('global-timer');
const mainContainer = document.getElementById('exercise-list');

function renderApp() {
    mainContainer.innerHTML = '';
    routine.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';

        const header = document.createElement('div');
        header.className = 'exercise-header';
        header.innerHTML = `
            <span class="exercise-title">${ex.name}</span>
            <span class="exercise-meta">${ex.reps}회 / 휴식 ${ex.rest}초</span>
        `;

        const setContainer = document.createElement('div');
        setContainer.className = 'set-container';

        // LocalStorage에서 오늘 완료한 세트 데이터 불러오기
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

        card.appendChild(header);
        card.appendChild(setContainer);
        mainContainer.appendChild(card);
    });
}

function handleSetClick(exercise, setNum, btnElement, savedData) {
    if (savedData.includes(setNum)) {
        // 이미 누른 세트 취소 기능
        savedData = savedData.filter(num => num !== setNum);
        btnElement.classList.remove('completed');
        localStorage.setItem(`workout_${exercise.id}`, JSON.stringify(savedData));
        return;
    }

    // 세트 완료 처리
    savedData.push(setNum);
    localStorage.setItem(`workout_${exercise.id}`, JSON.stringify(savedData));
    btnElement.classList.add('completed');

    // 스마트폰 햅틱 진동 지원 시 작동
    if (navigator.vibrate) navigator.vibrate(50);

    // 해당 종목의 휴식 시간으로 타이머 즉시 시작
    startTimer(exercise.rest);
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    // JS 백그라운드 스로틀링 방지를 위해 절대 시간(Date.now) 기준 계산
    endTime = Date.now() + (seconds * 1000);
    
    timerDisplay.classList.add('active');
    timerDisplay.classList.remove('finished');

    timerInterval = setInterval(() => {
        const timeRemaining = Math.ceil((endTime - Date.now()) / 1000);
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.classList.remove('active');
            timerDisplay.classList.add('finished');
            timerDisplay.innerText = "운동 시작!";
            // 휴식 종료 시 강한 진동 알림 
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
        } else {
            const m = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
            const s = String(timeRemaining % 60).padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
        }
    }, 200);
}

renderApp();
