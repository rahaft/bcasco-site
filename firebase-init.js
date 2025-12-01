// Shared Firebase initialization for the Patapsco Seniors site.
// Assumes the following scripts are loaded BEFORE this file:
// - https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js
// - https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js
// - https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0b4V6lmWkxJyk7QFjxJTV4RPxMpc0HnU",
  authDomain: "website-18d15.firebaseapp.com",
  projectId: "website-18d15",
  storageBucket: "website-18d15.firebasestorage.app",
  messagingSenderId: "1063694273352",
  appId: "1:1063694273352:web:1ef7beef89baf0a998017d",
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Make commonly-used services available as globals
const auth = firebase.auth();
const db = firebase.firestore();


