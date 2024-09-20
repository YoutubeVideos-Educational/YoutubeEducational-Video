// Your web app's Firebase configuration
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

// Reference to the Firebase Realtime Database
const database = firebase.database();

// Get references to HTML elements
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesList = document.getElementById("messages");

// Get the current user from localStorage
const currentUser = localStorage.getItem('currentUser');

// Send a new message to Firebase
sendButton.addEventListener("click", function () {
    const message = messageInput.value;
    if (message) {
        // Push message to Firebase
        database.ref("messages").push({
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: currentUser
        });
        messageInput.value = ""; // Clear input after sending
    }
});

// Listen for new messages from Firebase
database.ref("messages").on("child_added", function (snapshot) {
    const message = snapshot.val();
    const listItem = document.createElement("li");
    listItem.textContent = `${message.user}: ${message.text}`;
    listItem.dataset.timestamp = message.timestamp;
    
    if (message.user === 'ABC') {
        listItem.classList.add('user-abc');
    } else if (message.user === 'ADMIN') {
        listItem.classList.add('user-admin');
    }
    
    messagesList.appendChild(listItem);
    messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll to bottom
});

// Function to remove messages older than 30 seconds
function removeOldMessages() {
    const currentTime = Date.now();
    const messages = messagesList.getElementsByTagName('li');
    for (let i = messages.length - 1; i >= 0; i--) {
        const messageTime = parseInt(messages[i].dataset.timestamp);
        if (currentTime - messageTime > 30000) { // 30 seconds in milliseconds
            messages[i].remove();
        }
    }
}

// Call removeOldMessages every second
setInterval(removeOldMessages, 0);

// Function to clear all messages from Firebase
function clearAllMessages() {
    database.ref("messages").remove()
        .then(() => {
            console.log("All messages cleared successfully");
            // Clear messages from the UI as well
            messagesList.innerHTML = '';
        })
        .catch((error) => {
            console.error("Error clearing messages: ", error);
        });
}

// Get reference to the danger icon
const dangerIcon = document.getElementById("danger-icon");

// Add click event listener to the danger icon
dangerIcon.addEventListener("click", function() {
    // Clear all messages
    clearAllMessages();
    // Redirect to login.html
    window.location.href = 'login.html';
});
