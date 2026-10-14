/* login.js
   Handles the login form. */

// A user who is already logged in does not need this page.
redirectIfLoggedIn();

const loginForm = document.getElementById("loginForm");
setupShowPassword("showPassword", ["password"]);

// Rate limit settings. Five wrong tries locks the form for 30 seconds.
// This slows down anyone who tries to guess passwords.
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

loginForm.addEventListener("submit", async function (event) {
  // Stop the page from reloading.
  event.preventDefault();

  // Check if the form is locked.
  const lockUntil = Number(loadItem("lockUntil")) || 0;
  if (Date.now() < lockUntil) {
    const secondsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
    showMessage("message", "Too many tries. Please wait " + secondsLeft + " seconds.", "error");
    return;
  }

  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  // Hash what the user typed with the saved salt and compare it to the saved hash.
  const user = findUser(username);
  let passwordMatches = false;
  if (user !== null) {
    const typedHash = await hashPassword(password, user.salt);
    passwordMatches = typedHash === user.passwordHash;
  }

  if (passwordMatches === false) {
    let attempts = (Number(loadItem("failedAttempts")) || 0) + 1;

    if (attempts >= MAX_ATTEMPTS) {
      saveItem("lockUntil", Date.now() + LOCK_SECONDS * 1000);
      attempts = 0;
      showMessage("message", "Too many tries. The form is locked for " + LOCK_SECONDS + " seconds.", "error");
    } else {
      // The message does not say which part was wrong. This keeps usernames private.
      showMessage("message", "Wrong username or password. Tries left " + (MAX_ATTEMPTS - attempts) + ".", "error");
    }

    saveItem("failedAttempts", attempts);
    return;
  }

  // Login worked, so we reset the counters and start the session.
  removeItem("failedAttempts");
  removeItem("lockUntil");
  startSession(user.username);
  window.location.href = "feed.html";
});
