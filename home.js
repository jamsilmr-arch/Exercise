// --- Firebase SDK 초기화 ---
const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb",
    storageBucket: "exercise-abddb.firebasestorage.app",
    messagingSenderId: "887574653012",
    appId: "1:887574653012:web:deac9acecc61763d325c1",
    measurementId: "G-05SVZ9QPS9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function switchView(targetId) {
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    const targetView = document.getElementById(targetId);
    if(targetView) {
        targetView.classList.add('active');
        targetView.style.display = '';
        window.scrollTo(0, 0);
    }
}

document.querySelectorAll('.view-container').forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active');
});

// --- 맞춤형 루틴 데이터 생성 로직 ---
// 마법사에서 불러온 주당 운동 횟수(frequency)에 맞춰 루틴 이름을 결정합니다.
let currentRoutine = []; 

function buildDynamicRoutine(wizardData) {
    // 마법사 응답 데이터 추출 (배열 인덱스 매칭: 6번이 주당 횟수, 8번이 근비대/스트렝스 등)
    const frequency = parseInt(wizardData.question_6.value) || 3;
    const isCardio = wizardData.question_11.value === '네, 하고 싶어요';
    
    let splitName = '몸통-말단-하체';
    if (frequency === 3) splitName = '밀기-당기기-하체';
    else if (frequency === 4) splitName = '상하체 2분할';

    // 홈 화면 상단 제목 및 목표 업데이트
    document.querySelector('.routine-title').innerText = `주 ${frequency}회 (${splitName}) 맞춤 루틴`;
    document.querySelector('.target-text').innerText = '목표: 사용자 맞춤 린매스업';

    // 임시로 생성할 Day 1 운동 목록
    let day1Targets = [];
    if (frequency >= 5) {
        day1Targets = [
            { id: 'ex1', name: '벤치 프레스', sets: 4, reps: '10회', rest: 90 },
            { id: 'ex2', name: '인클라인 덤벨 프레스', sets: 3, reps: '12회', rest: 60 },
            { id: 'ex3', name: '랫풀다운', sets: 4, reps: '12회', rest: 60 },
            { id: 'ex4', name: '케이블 시티드 로우', sets: 3, reps: '12회', rest: 60 },
            { id: 'ex5', name: '사이드 레터럴 레이즈', sets: 4, reps: '15회', rest: 45 },
            { id: 'ex6', name: '트라이셉스 푸시다운', sets: 3, reps: '15회', rest: 45 }
        ];
        document.querySelector('.card-day').innerText = 'Day 1 (가슴 & 등)';
    } else {
        day1Targets = [
            { id: 'ex1', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
            { id: 'ex2', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
            { id: 'ex3', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
            { id: 'ex4', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
        ];
        document.querySelector('.card-day').innerText = 'Day 1 (밀기)';
    }

    if (isCardio) {
        day1Targets.push({ id: 'cardio', name: '유산소 (트레드밀)', sets: 1, reps: '20분', rest: 0 });
    }

    // 통계 카드 업데이트
    const totalSets = day1Targets.reduce((acc, ex) => acc + ex.sets, 0);
    const estimatedTime = totalSets * 3; // 1세트당 대략 3분 소요(휴식 포함) 예상

    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 2) {
        statValues[0].innerText = `${day1Targets.length}개 종목`;
        statValues[1].innerText = `${totalSets}세트 (약 ${estimatedTime}분)`;
    }

    // 타이머용 전역 변수에 루틴 할당
    currentRoutine = day1Targets;
    
    // 분석 탭 데이터도 동적 업데이트
    const metricValues = document.querySelectorAll('.m-value');
    if (metricValues.length >= 4) {
        metricValues[1].innerText = wizardData.question_8.value >= 3 ? '5' : '12'; // 스트렝스면 5회, 근비대면 12회
        metricValues[2].innerText = totalSets; // 총 세트수
    }
}

// 홈 진입 시 권한 검증 및 데이터 로드
auth.onAuthStateChanged(async (user) => {
    const localCompleted = localStorage.getItem('onboardingCompleted') === 'true';

    if (!localCompleted) {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().onboardingCompleted) {
                    localStorage.setItem('onboardingCompleted', 'true');
                    buildDynamicRoutine(userDoc.data().wizardData);
                    switchView('view-home');
                } else {
                    window.location.replace('index.html');
                }
            } catch(e) {
                window.location.replace('index.html');
            }
        } else {
            window.location.replace('index.html');
        }
    } else {
        if (user) {
            // 로컬에 기록이 있고, 유저도 있다면 최신 데이터를 불러와서 그립니다.
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().wizardData) {
                    buildDynamicRoutine(userDoc.data().wizardData);
                }
            } catch(e) { console.error("데이터 로드 실패:", e); }
        }
        switchView('view-home');
    }
});

// 하단 네비게이션
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchView(target);
        }
    });
});

// 설정 및 루틴 수정 시 마법사로 복귀
document.getElementById('btn-nav-settings').addEventListener('click', () => {
    window.location.href = 'index.html?edit=true';
});
document.getElementById('btn-edit-routine').addEventListener('click', () => {
    window.location.href = 'index.html?edit=true';
});

// 운동 시작 버튼 클릭 시 렌더링 후 화면 전환
document.getElementById('btn-start-workout').addEventListener('click', () => {
    renderWorkout();
    switchView('view-workout');
});

document.getElementById('btn-back').addEventListener('click', () => switchView('view-home'));

// --- 홈화면 운동 타이머 로직 ---
let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');

function renderWorkout() {
    const mainContainer = document.getElementById('exercise-list');
    mainContainer.innerHTML = '';
    
    // 동적으로 생성된 currentRoutine 배열을 순회합니다.
    currentRoutine.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `<div class="exercise-header"><span style="font-size: 1.05rem; font-weight: bold;">${ex.name}</span><span style="font-size: 0.85rem; color: #888;">${ex.reps} / 휴식 ${ex.rest}초</span></div>`;
        const setContainer = document.createElement('div');
        setContainer.className = 'set-container';
        
        // 브라우저 캐시에서 해당 운동의 세트 체크 기록을 가져옵니다.
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];

        for (let i = 1; i <= ex.sets; i++) {
            const btn = document.createElement('div');
            btn.className = `set-btn ${savedData.includes(i) ? 'completed' : ''}`;
            btn.innerText = i;
            
            // 유산소 등 휴식 시간이 0초인 항목은 클릭 색상만 변경하고 타이머 실행 안함
            btn.addEventListener('click', () => {
                if (savedData.includes(i)) {
                    savedData.splice(savedData.indexOf(i), 1);
                    btn.classList.remove('completed');
                } else {
                    savedData.push(i);
                    btn.classList.add('completed');
                    if (navigator.vibrate) navigator.vibrate(50);
                    
                    if (ex.rest > 0) {
                        startTimer(ex.rest);
                    }
                }
                localStorage.setItem(`workout_${ex.id}`, JSON.stringify(savedData));
            });
            setContainer.appendChild(btn);
        }
        card.appendChild(setContainer);
        mainContainer.appendChild(card);
    });
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
