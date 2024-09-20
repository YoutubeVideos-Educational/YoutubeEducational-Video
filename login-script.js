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
        localStorage.setItem('currentUser', username); // Store the username
        window.location.href = 'index.html'; // Redirect to chat page
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
