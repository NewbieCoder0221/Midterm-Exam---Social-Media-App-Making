/* signup.js
   Handles the signup form and checks every input before saving. */

redirectIfLoggedIn();

const signupForm = document.getElementById("signupForm");
setupShowPassword("showPassword", ["password", "confirmPassword"]);

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearMessage("message");

  const displayName = document.getElementById("displayName").value.trim();
  const username = document.getElementById("username").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const agreed = document.getElementById("agree").checked;

  // VALIDATION
  // Each check stops the function and shows one clear message.
  if (displayName.length < 1 || displayName.length > 30) {
    showMessage("message", "Display name must be 1 to 30 characters.", "error");
    return;
  }

  // This pattern allows only lowercase letters, numbers, and underscores.
  if (/^[a-z0-9_]{3,15}$/.test(username) === false) {
    showMessage("message", "Username must be 3 to 15 characters. Use letters, numbers, or underscores only.", "error");
    return;
  }

  if (findUser(username) !== null || STARTER_USERS.includes(username)) {
    showMessage("message", "That username is already taken.", "error");
    return;
  }

  if (password.length < 8 || /[0-9]/.test(password) === false || /[a-zA-Z]/.test(password) === false) {
    showMessage("message", "Password must be at least 8 characters with letters and numbers.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("message", "Passwords do not match.", "error");
    return;
  }

  if (agreed === false) {
    showMessage("message", "Please agree to the privacy promise first.", "error");
    return;
  }

  // CREATE THE ACCOUNT
  // We save the salt and the hash. The real password is never saved.
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].value;

  const newUser = {
    username: username,
    displayName: displayName,
    bio: "",
    color: randomColor,
    salt: salt,
    passwordHash: passwordHash,
    joined: Date.now()
  };

  const users = getUsers();
  users.push(newUser);
  saveUsers(users);

  startSession(username);
  window.location.href = "feed.html";
});
