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

// 홈 진입 시 권한 검증 로직 (설정 없이 주소 쳐서 들어온 유저 차단)
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        if (localStorage.getItem('onboardingCompleted') !== 'true') {
            window.location.href = 'index.html'; // 권한 없음 -> 온보딩으로 복귀
        } else {
            switchView('view-home');
        }
    } else {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists || !userDoc.data().onboardingCompleted) {
                window.location.href = 'index.html';
            } else {
                localStorage.setItem('onboardingCompleted', 'true');
                switchView('view-home');
            }
        } catch(e) {
            switchView('view-home');
        }
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

// 설정 및 루틴 수정 시 마법사(index.html)로 복귀
document.getElementById('btn-nav-settings').addEventListener('click', () => {
    window.location.href = 'index.html?edit=true';
});
document.getElementById('btn-edit-routine').addEventListener('click', () => {
    window.location.href = 'index.html?edit=true';
});

document.getElementById('btn-start-workout').addEventListener('click', () => switchView('view-workout'));
document.getElementById('btn-back').addEventListener('click', () => switchView('view-home'));

// --- 홈화면 운동 타이머 로직 ---
const routine = [
    { id: 'bench', name: '플랫 벤치프레스', sets: 4, reps: '10~12회', rest: 60 },
    { id: 'incline', name: '인클라인 프레스', sets: 3, reps: '12회', rest: 60 },
    { id: 'shoulder', name: '시티드 덤벨 프레스', sets: 3, reps: '10~12회', rest: 60 },
    { id: 'sidelateral', name: '사이드 레터럴 레이즈', sets: 4, reps: '15~20회', rest: 45 }
];

let timerInterval = null;
let endTime = 0;
const timerDisplay = document.getElementById('global-timer');

function renderWorkout() {
    const mainContainer = document.getElementById('exercise-list');
    mainContainer.innerHTML = '';
    routine.forEach((ex) => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.innerHTML = `<div class="exercise-header"><span style="font-size: 1.05rem; font-weight: bold;">${ex.name}</span><span style="font-size: 0.85rem; color: #888;">${ex.reps} / 휴식 ${ex.rest}초</span></div>`;
        const setContainer = document.createElement('div');
        setContainer.className = 'set-container';
        const savedData = JSON.parse(localStorage.getItem(`workout_${ex.id}`)) || [];

        for (let i = 1; i <= ex.sets; i++) {
            const btn = document.createElement('div');
            btn.className = `set-btn ${savedData.includes(i) ? 'completed' : ''}`;
            btn.innerText = i;
            btn.addEventListener('click', () => {
                if (savedData.includes(i)) {
                    savedData.splice(savedData.indexOf(i), 1);
                    btn.classList.remove('completed');
                } else {
                    savedData.push(i);
                    btn.classList.add('completed');
                    if (navigator.vibrate) navigator.vibrate(50);
                    startTimer(ex.rest);
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

renderWorkout();
