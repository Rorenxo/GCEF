import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// 1️⃣ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCG1HsNqPK20CgZuvDlWu3NCsVihPuEc80",
  authDomain: "gcef-01023.firebaseapp.com",
  projectId: "gcef-01023",
  storageBucket: "gcef-01023.firebasestorage.app",
  messagingSenderId: "796713752559",
  appId: "1:796713752559:web:7cf53d9f7166a5b853c81a"
};

const app = initializeApp(firebaseConfig); // ✅ You need this
const auth = getAuth(app);                // Now auth works

// 2️⃣ Logout button
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', async (e) => {
  e.preventDefault(); // prevent default link navigation
  try {
    await signOut(auth);
    alert('You have been logged out.');
    window.location.href = 'alogin.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout. Please try again.');
  }
});