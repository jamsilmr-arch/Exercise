const firebaseConfig = {
    apiKey: "AIzaSyAPF1e1n5jS6YALzl0bJDGmDvOH1jhSU_g",
    authDomain: "exercise-abddb.firebaseapp.com",
    projectId: "exercise-abddb"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('set-profile-name').innerText = user.displayName ? `${user.displayName} 님` : '회원 님';
        document.getElementById('set-profile-email').innerText = user.email || '';
    }
});
