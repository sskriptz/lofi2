// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwUAqTV07AahyfD55owmyAcxDG3TP_KnI",
    authDomain: "lofi-168cb.firebaseapp.com",
    projectId: "lofi-168cb",
    storageBucket: "lofi-168cb.appspot.com",
    messagingSenderId: "331670095312",
    appId: "1:331670095312:web:7538041673a10b1b4aa5d5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get UI Elements
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const userInfo = document.getElementById("user-info");
const clickerGame = document.getElementById("clicker-game");
const clickButton = document.getElementById("click-button");
const scoreDisplay = document.getElementById("score");
const leaderboardBtn = document.getElementById("leaderboard-btn");
const toggleClickerBtn = document.getElementById("toggle-clicker-btn");

let userScore = 0;
let userId = null;

// Hide sign-in button by default
signInBtn.style.display = "none";

// Initially hide all relevant UI elements for logged-in users
signOutBtn.style.display = "none"; 
leaderboardBtn.style.display = "none"; 
clickerGame.style.display = "none"; 
toggleClickerBtn.style.display = "none"; 

// Sign-in with Google (Manually triggered)
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        userId = user.uid;
        updateUI(user);  // Update UI after successful sign-in
        loadUserScore();  // Load the user's score from Firestore
    }).catch(error => console.error(error));
}

// Sign-out functionality
signOutBtn.onclick = () => {
    auth.signOut().then(() => {
        userInfo.innerHTML = "";  // Clear user info after sign-out
        userId = null;
        userScore = 0;
        scoreDisplay.textContent = userScore;
        signInBtn.style.display = "block";  // Show sign-in button again
        signOutBtn.style.display = "none";  // Hide sign-out button
        leaderboardBtn.style.display = "none"; // Hide leaderboard button
        clickerGame.style.display = "none"; // Hide game panel
        toggleClickerBtn.style.display = "none"; // Hide toggle button
    });
};

// Load user data after sign-in
function loadUserScore() {
    if (userId) {
        db.collection("users").doc(userId).get().then(doc => {
            if (doc.exists) {
                userScore = doc.data().score || 0; // Set score from Firestore or default to 0
                scoreDisplay.textContent = userScore;
            } else {
                // If the document doesn't exist, initialize it with 0 score
                db.collection("users").doc(userId).set({ score: 0 });
            }
        });
    }
}

// Update the user's score in Firestore
function updateUserScore() {
    if (userId) {
        db.collection("users").doc(userId).update({ score: userScore })
            .then(() => {
                scoreDisplay.textContent = userScore;
            }).catch(error => console.error(error));
    }
}

// Click event to increase score
clickButton.onclick = () => {
    userScore++;
    updateUserScore(); // Update Firestore score on click
};

// Update UI after sign-in
function updateUI(user) {
    if (user) {
        userInfo.innerHTML = `<img src="${user.photoURL}" width="50" style="border-radius:50%">
        <p>Welcome, ${user.displayName}</p>`;
        signInBtn.style.display = "none"; // Hide sign-in button after sign-in
        signOutBtn.style.display = "block"; // Show sign-out button after sign-in
        leaderboardBtn.style.display = "block"; // Show leaderboard button after sign-in
        clickerGame.style.display = "block"; // Show game panel after sign-in
        toggleClickerBtn.style.display = "block"; // Show toggle clicker button after sign-in
    }
}

// Check auth state on page load
auth.onAuthStateChanged(user => {
    if (user) {
        updateUI(user);
        userId = user.uid;
        loadUserScore();
    } else {
        // User is not signed in, keep the sign-in button visible
        signInBtn.style.display = "block";
        signOutBtn.style.display = "none"; // Hide sign-out button if not signed in
        leaderboardBtn.style.display = "none"; // Hide leaderboard button if not signed in
        clickerGame.style.display = "none"; // Hide game panel if not signed in
        toggleClickerBtn.style.display = "none"; // Hide toggle button if not signed in
    }
});

// Toggle Clicker Visibility
toggleClickerBtn.onclick = () => {
    if (clickerGame.style.display === "none") {
        clickerGame.style.display = "block";
        toggleClickerBtn.textContent = "Hide Clicker";
    } else {
        clickerGame.style.display = "none";
        toggleClickerBtn.textContent = "Show Clicker";
    }
};

// Add event listener to sign-in button to trigger signInWithGoogle function
signInBtn.addEventListener("click", signInWithGoogle);
