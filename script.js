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

// Initialize Firebase Storage
const storage = firebase.storage();

// Get references to HTML elements
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const messagesList = document.getElementById("messages");
const usersList = document.getElementById("users-list");
const logoutIcon = document.getElementById("logout-icon");
const imageInput = document.getElementById("image-input");
const imageUploadButton = document.getElementById("image-upload-button");

// Get the current user from localStorage
const currentUser = localStorage.getItem('currentUser');

// Function to update user's online status
function updateOnlineStatus(status) {
    if (currentUser) {
        database.ref('users/' + currentUser).set({
            online: status,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

// Set user as online when they open the chat
updateOnlineStatus(true);

// Set user as offline when they close the tab/window
window.addEventListener('beforeunload', () => {
    updateOnlineStatus(false);
});

// Listen for online users
database.ref('users').on('value', (snapshot) => {
    console.log('Users data:', snapshot.val());
    usersList.innerHTML = ''; // Clear the list
    snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.key;
        const status = childSnapshot.val().online;
        console.log('User:', user, 'Status:', status);
        if (status) {
            const listItem = document.createElement('li');
            listItem.textContent = user;
            if (user === currentUser) {
                listItem.classList.add('current-user');
            }
            usersList.appendChild(listItem);
            console.log('Added user to list:', user);
        }
    });
    console.log('Final users list HTML:', usersList.innerHTML);
});

// Send a new message to Firebase
sendButton.addEventListener("click", function () {
    const message = messageInput.value;
    if (message) {
        // Push message to Firebase
        database.ref("messages").push({
            text: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: currentUser  // Keep this for backend purposes, but don't display it
        });
        messageInput.value = ""; // Clear input after sending
        scrollToBottom(); // Auto-scroll to bottom after sending
    }
});

// Function to scroll to the bottom of the chat box
function scrollToBottom() {
    // Use setTimeout to ensure this runs after the DOM has updated
    setTimeout(() => {
        messagesList.scrollTop = messagesList.scrollHeight;
        
        // If the above doesn't work, try this alternative
        messagesList.scrollTo({
            top: messagesList.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

// Function to remove messages older than 30 seconds
function removeOldMessages() {
    const currentTime = Date.now();
    const messages = messagesList.getElementsByTagName('li');
    for (let i = messages.length - 1; i >= 0; i--) {
        const messageTime = parseInt(messages[i].dataset.timestamp);
        if (currentTime - messageTime > 3000000) { // 30 seconds in milliseconds
            messages[i].remove();
        }
    }
}

// Call removeOldMessages every second
// setInterval(removeOldMessages, 0); // Commented out to prevent messages from disappearing

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
    clearAllMessages();
    window.location.href = 'index.html'; // Redirects to login page
});

// Modify the logout function to update online status
logoutIcon.addEventListener("click", function() {
    updateOnlineStatus(false);
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// Add event listener for the message input field
messageInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior
        sendButton.click(); // Trigger the send button click event
    }
});

// Function to upload image to Firebase Storage
function uploadImage(file) {
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`images/${file.name}`);
    const uploadTask = imageRef.put(file);

    uploadTask.on('state_changed', 
        (snapshot) => {
            // Optional: Handle progress
        }, 
        (error) => {
            console.error("Error uploading image: ", error);
        }, 
        () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                sendMessage(downloadURL, 'image');
            });
        }
    );
}

// Function to send a message (text or image URL) to Firebase
function sendMessage(content, type = 'text') {
    database.ref("messages").push({
        text: type === 'text' ? content : '',
        imageUrl: type === 'image' ? content : '',
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        user: currentUser
    });
    messageInput.value = ""; // Clear input after sending
    scrollToBottom(); // Auto-scroll to bottom after sending
}

// Add event listener to the image upload button
imageUploadButton.addEventListener("click", function() {
    imageInput.click();
});

// Add event listener to the image input field
imageInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        uploadImage(file);
    }
});

// Wrap modal-related code inside DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Get the modal elements
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    const closeModal = document.querySelector(".close");

    // Function to open the modal with the clicked image
    function openModal(imageSrc) {
        if (modal && modalImg) {
            modal.style.display = "block";
            modalImg.src = imageSrc;
        } else {
            console.error("Modal elements not found");
        }
    }

    // Add event listener to close the modal
    if (closeModal) {
        closeModal.addEventListener("click", function() {
            modal.style.display = "none";
        });
    } else {
        console.error("Close button not found");
    }

    // Add event listener to close the modal when clicking outside the image
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Function to create message element
    function createMessageElement(message, key) {
        const listItem = document.createElement("li");
        listItem.classList.add('message-container');
        
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        
        const textSpan = document.createElement("span");
        textSpan.className = "message-text";
        textSpan.textContent = message.text;
        messageContent.appendChild(textSpan);

        listItem.appendChild(messageContent);

        if (message.imageUrl) {
            const img = document.createElement("img");
            img.src = message.imageUrl;
            img.style.maxWidth = "100%";
            img.addEventListener("click", function() {
                openModal(message.imageUrl);
            });
            messageContent.appendChild(img);
        }

        listItem.dataset.timestamp = message.timestamp;
        listItem.dataset.key = key;
        
        if (message.user === currentUser) {
            listItem.classList.add('my-message');
        } else {
            listItem.classList.add('other-message');
        }

        return listItem;
    }

    // Function to delete message
    function deleteMessage(key) {
        database.ref("messages/" + key).remove()
            .then(() => {
                console.log("Message deleted successfully");
            })
            .catch((error) => {
                console.error("Error deleting message: ", error);
            });
    }

    // Function to enable inline editing
    function enableInlineEditing(listItem, key, message) {
        const messageContent = listItem.querySelector('.message-content');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = message.text;
        input.className = 'edit-input';

        const saveButton = document.createElement('button');
        saveButton.innerHTML = '&#10003;'; // Tick symbol
        saveButton.className = 'save-button';

        messageContent.innerHTML = '';
        messageContent.appendChild(input);
        messageContent.appendChild(saveButton);

        input.focus();

        const saveChanges = () => {
            const newText = input.value.trim();
            if (newText && newText !== message.text) {
                database.ref("messages/" + key).update({ text: newText })
                    .then(() => {
                        console.log("Message edited successfully");
                        messageContent.innerHTML = '';
                        const textSpan = document.createElement("span");
                        textSpan.className = "message-text";
                        textSpan.textContent = newText;
                        messageContent.appendChild(textSpan);
                    })
                    .catch((error) => {
                        console.error("Error editing message: ", error);
                    });
            } else {
                messageContent.innerHTML = '';
                const textSpan = document.createElement("span");
                textSpan.className = "message-text";
                textSpan.textContent = message.text;
                messageContent.appendChild(textSpan);
            }
        };

        saveButton.addEventListener('click', saveChanges);
        saveButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            saveChanges();
        }); // Ensure touch events are handled
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            }
        });
    }

    // Function to show dropdown menu
    function showDropdownMenu(x, y, key, message) {
        // Remove any existing dropdowns
        const existingDropdown = document.querySelector('.dropdown-menu');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';
        dropdown.innerHTML = `
            <button class="edit-option">Edit</button>
            <button class="delete-option">Delete</button>
        `;
        dropdown.style.left = `${x}px`;
        dropdown.style.top = `${y}px`;
        document.body.appendChild(dropdown);

        dropdown.querySelector('.edit-option').addEventListener('click', (e) => {
            e.stopPropagation();
            const listItem = document.querySelector(`li[data-key="${key}"]`);
            enableInlineEditing(listItem, key, message);
            dropdown.remove();
            document.removeEventListener('click', removeDropdown);
        });

        dropdown.querySelector('.delete-option').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this message?")) {
                deleteMessage(key);
            }
            dropdown.remove();
            document.removeEventListener('click', removeDropdown);
        });

        // Remove dropdown when clicking outside
        function removeDropdown(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', removeDropdown);
            }
        }

        // Add the event listener immediately
        document.addEventListener('click', removeDropdown);
    }

    // Update the long-press functionality
    let longPressTimer;
    const longPressDuration = 500; // milliseconds

    function handleLongPress(event) {
        if (event.target.closest('li')) {
            const messageItem = event.target.closest('li');
            const key = messageItem.dataset.key;
            const messageText = messageItem.querySelector('.message-text').textContent;
            const messageUser = messageItem.querySelector('.user-name').textContent;
            const message = { user: messageUser, text: messageText };
            const rect = messageItem.getBoundingClientRect();
            showDropdownMenu(rect.left, rect.bottom, key, message);
        }
    }

    messagesList.addEventListener('touchstart', function(event) {
        longPressTimer = setTimeout(() => handleLongPress(event), longPressDuration);
    });

    messagesList.addEventListener('touchend', function(event) {
        clearTimeout(longPressTimer);
        // Prevent the click event from firing immediately after touchend
        event.preventDefault();
    });

    messagesList.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });

    // Add swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipeGesture(event, messageItem) {
        const swipeThreshold = 100; // minimum distance for swipe
        const swipeDistance = touchEndX - touchStartX;
        console.log('Swipe distance:', swipeDistance);

        if (swipeDistance > swipeThreshold) {
            console.log('Swipe right detected');
            showReplyOption(messageItem);
        }
    }

    function showReplyOption(messageItem) {
        console.log('Showing reply option');
        const replyButton = document.createElement('button');
        replyButton.textContent = 'Reply';
        replyButton.className = 'reply-button';
        messageItem.appendChild(replyButton);

        console.log('Adding click event listener to reply button');
        replyButton.addEventListener('click', () => {
            console.log('Reply button clicked');
            const messageText = messageItem.querySelector('.message-text').textContent;
            const messageUser = messageItem.querySelector('.user-name').textContent;
            const messageKey = messageItem.dataset.key;
            prepareReply({ text: messageText, user: messageUser }, messageKey);
            replyButton.remove();
        });

        // Remove reply button after 3 seconds
        setTimeout(() => {
            replyButton.remove();
        }, 3000);
    }

    function prepareReply(message, messageKey) {
        console.log('Preparing reply:', message, messageKey);
        const replyPreview = document.createElement('div');
        replyPreview.id = 'reply-preview';
        replyPreview.innerHTML = `
            <p>Replying to: ${message.user}: ${message.text}</p>
            <button id="cancel-reply">Cancel</button>
        `;
        document.getElementById('input-area').prepend(replyPreview);

        document.getElementById('cancel-reply').addEventListener('click', () => {
            replyPreview.remove();
        });

        // Modify send button to include reply information
        const originalSendFunction = sendButton.onclick;
        sendButton.onclick = () => {
            const replyMessage = messageInput.value;
            if (replyMessage) {
                console.log('Sending reply:', replyMessage);
                sendReply(replyMessage, message, messageKey);
                replyPreview.remove();
                sendButton.onclick = originalSendFunction;
            }
        };

        console.log('Send button onclick modified for reply');
    }

    function sendReply(replyMessage, originalMessage, originalMessageKey) {
        console.log('Sending reply to Firebase:', replyMessage, originalMessage, originalMessageKey);
        database.ref("messages").push({
            text: replyMessage,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: currentUser,
            replyTo: {
                text: originalMessage.text,
                user: originalMessage.user,
                key: originalMessageKey
            }
        });
        messageInput.value = "";
        scrollToBottom();
    }

    messagesList.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        console.log('Touch start:', touchStartX);
    });

    messagesList.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        console.log('Touch end:', touchEndX);
        const messageItem = e.target.closest('li');
        if (messageItem) {
            handleSwipeGesture(e, messageItem);
        }
    });

    // Update the existing listener for new messages
    database.ref("messages").on("child_added", function (snapshot) {
        const message = snapshot.val();
        const key = snapshot.key;
        const listItem = createMessageElement(message, key);
        messagesList.appendChild(listItem);
        scrollToBottom();
    });

    // Add listener for updated messages
    database.ref("messages").on("child_changed", function (snapshot) {
        const message = snapshot.val();
        const key = snapshot.key;
        const existingItem = document.querySelector(`li[data-key="${key}"]`);
        if (existingItem) {
            const updatedItem = createMessageElement(message, key);
            existingItem.replaceWith(updatedItem);
        }
    });

    // Add listener for removed messages
    database.ref("messages").on("child_removed", function (snapshot) {
        const key = snapshot.key;
        const itemToRemove = document.querySelector(`li[data-key="${key}"]`);
        if (itemToRemove) {
            itemToRemove.remove();
        }
    });
});