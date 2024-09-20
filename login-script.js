// Add Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyC1AQ9lKFb1XJsW8x5c6gdmBGg3gpnm1dk",
    authDomain: "real-time-chatting-6ac89.firebaseapp.com",
    databaseURL: "https://real-time-chatting-6ac89-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "real-time-chatting-6ac89",
    storageBucket: "real-time-chatting-6ac89.appspot.com",
    messagingSenderId: "34541536225",
    appId: "1:34541536225:web:f2ec679b2d0580e31988a0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');

const USERS = {
    'ABC': 'Pass123',
    'DEF': 'Pass123'
};

loginButton.addEventListener('click', function() {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (USERS[username] && USERS[username] === password) {
        // Successful login
        localStorage.setItem('currentUser', username);
        // Set user as online in Firebase
        firebase.database().ref('users/' + username).set({
            online: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
        window.location.href = 'chat.html';
    } else {
        // Failed login
        errorMessage.classList.remove('hidden');
        passwordInput.value = ''; // Clear password field
    }
});

// Hide error message when user starts typing
usernameInput.addEventListener('input', hideErrorMessage);
passwordInput.addEventListener('input', hideErrorMessage);

function hideErrorMessage() {
    errorMessage.classList.add('hidden');
}
