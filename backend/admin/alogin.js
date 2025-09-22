const firebaseConfig = {
  apiKey: "AIzaSyCG1HsNqPK20CgZuvDlWu3NCsVihPuEc80",
  authDomain: "gcef-01023.firebaseapp.com",
  projectId: "gcef-01023",
  storageBucket: "gcef-01023.firebasestorage.app",
  messagingSenderId: "796713752559",
  appId: "1:796713752559:web:7cf53d9f7166a5b853c81a"
};


import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('admin-LoginForm');
const idInput = document.getElementById('idInput');
const passwordInput = document.getElementById('passwordInput');
const eyeIcon = document.getElementById('eyeIcon');
const submitBtn = loginForm.querySelector('button[type="submit"]');

let notificationBanner = null;

function showBanner(message, type = 'error') {
  if (notificationBanner) notificationBanner.remove();

  notificationBanner = document.createElement('div');
  notificationBanner.className = `notification-banner ${type}`;
  notificationBanner.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
    <button class="close-btn">&times;</button>
  `;

  notificationBanner.querySelector('.close-btn').addEventListener('click', () => {
    notificationBanner.remove();
  });

  document.body.appendChild(notificationBanner);

  setTimeout(() => {
    if (notificationBanner) notificationBanner.remove();
  }, 5000);
}

window.togglePassword = function() {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  eyeIcon.classList.toggle('fa-eye');
  eyeIcon.classList.toggle('fa-eye-slash');
};

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idNumber = idInput.value.trim();
  const password = passwordInput.value.trim();

  if (!idNumber || idNumber.length !== 9 || !/^\d{9}$/.test(idNumber)) {
    showBanner('Please enter a valid 9-digit ID number.', 'error');
    return;
  }

  if (!password) {
    showBanner('Please enter a password.', 'error');
    return;
  }

  const email = `${idNumber}@gordoncollege.edu.ph`;

  const originalText = submitBtn.textContent;
//submitBtn.textContent = 'LOGGING IN...';
//submitBtn.disabled = true;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Login success
    showBanner('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = 'amain.html';
    }, 3000);

  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this ID.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email format.';
        break;
      default:
        errorMessage = error.message;
    }

    showBanner(errorMessage, 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'amain.html';
  }
});
