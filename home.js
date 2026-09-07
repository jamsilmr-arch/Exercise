const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb",
    storageBucket: "exercise-abddb.firebasestorage.app"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function renderHomeData(wizardData) {
    const frequency = parseInt(wizardData?.question_6?.value) || 6;
    let splitName = '몸통-말단-하체';
    if (frequency === 3) splitName = '밀기-당기기-하체';
    else if (frequency === 4) splitName = '상하체 2분할';

    document.getElementById('home-routine-title').innerText = `주 ${frequency}회 (${splitName}) 루틴`;
    
    let weekBlocksHtml = '';
    for (let i = 1; i <= frequency; i++) {
        weekBlocksHtml += `<div class="wb-item ${i===1?'active':''}"><span class="wb-num">${i}</span>Day</div>`;
    }
    weekBlocksHtml += `<div class="wb-item rest">휴식</div>`;
    document.getElementById('home-week-blocks').innerHTML = weekBlocksHtml;
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().wizardData) {
                renderHomeData(userDoc.data().wizardData);
            }
        } catch(e) { console.error(e); }
    }
});
