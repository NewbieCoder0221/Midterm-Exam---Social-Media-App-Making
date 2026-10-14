/* settings.js
   Lets the user edit their profile, change their password, or delete their account. */

const currentUser = requireLogin();

if (currentUser !== null) {
  fillProfileForm();
}

// Put the saved profile values into the form and build the color options.
function fillProfileForm() {
  document.getElementById("displayName").value = currentUser.displayName;
  document.getElementById("bio").value = currentUser.bio;

  const select = document.getElementById("avatarColor");
  for (let i = 0; i < AVATAR_COLORS.length; i++) {
    const option = document.createElement("option");
    option.value = AVATAR_COLORS[i].value;
    option.textContent = AVATAR_COLORS[i].name;
    if (AVATAR_COLORS[i].value === currentUser.color) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

// EDIT PROFILE
document.getElementById("profileForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const displayName = document.getElementById("displayName").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const color = document.getElementById("avatarColor").value;

  if (displayName.length < 1 || displayName.length > 30) {
    showMessage("profileMessage", "Display name must be 1 to 30 characters.", "error");
    return;
  }

  if (bio.length > 120) {
    showMessage("profileMessage", "Bio can only be 120 characters long.", "error");
    return;
  }

  currentUser.displayName = displayName;
  currentUser.bio = bio;
  currentUser.color = color;
  updateUser(currentUser);

  showMessage("profileMessage", "Profile saved.", "success");
});

// CHANGE PASSWORD
document.getElementById("passwordForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword = document.getElementById("confirmNewPassword").value;

  // First check that the old password is right.
  const oldHash = await hashPassword(currentPassword, currentUser.salt);
  if (oldHash !== currentUser.passwordHash) {
    showMessage("passwordMessage", "Your current password is wrong.", "error");
    return;
  }

  if (newPassword.length < 8 || /[0-9]/.test(newPassword) === false || /[a-zA-Z]/.test(newPassword) === false) {
    showMessage("passwordMessage", "New password must be at least 8 characters with letters and numbers.", "error");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    showMessage("passwordMessage", "New passwords do not match.", "error");
    return;
  }

  // A new salt is created every time the password changes.
  currentUser.salt = generateSalt();
  currentUser.passwordHash = await hashPassword(newPassword, currentUser.salt);
  updateUser(currentUser);

  document.getElementById("passwordForm").reset();
  showMessage("passwordMessage", "Password changed.", "success");
});

// DOWNLOAD MY DATA
// Creates a JSON file with the user's own information. The password is not included.
document.getElementById("exportBtn").onclick = function () {
  const username = currentUser.username;
  const posts = getPosts();
  const myBuzzes = [];
  const myReplies = [];

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].author === username) {
      myBuzzes.push(posts[i]);
    }
    const replies = posts[i].replies || [];
    for (let j = 0; j < replies.length; j++) {
      if (replies[j].author === username) {
        myReplies.push({ buzzId: posts[i].id, reply: replies[j] });
      }
    }
  }

  const data = {
    exportedOn: new Date().toISOString(),
    profile: {
      username: currentUser.username,
      displayName: currentUser.displayName,
      bio: currentUser.bio,
      color: currentUser.color,
      joined: currentUser.joined
    },
    buzzes: myBuzzes,
    replies: myReplies
  };

  // A Blob is a file made in memory. We make a hidden link to it and click it.
  const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "beesocial-data-" + username + ".json";
  link.click();
  URL.revokeObjectURL(link.href);

  showMessage("exportMessage", "Your data file was downloaded.", "success");
};

// DELETE ACCOUNT
// This removes the user, their buzzes, their replies, and their honey on other buzzes.
document.getElementById("deleteBtn").onclick = function () {
  const sure = confirm("This will delete your account, your buzzes, and your replies. This cannot be undone. Continue?");
  if (sure === false) {
    return;
  }

  const username = currentUser.username;
  const posts = getPosts();
  const remaining = [];

  for (let i = 0; i < posts.length; i++) {
    if (posts[i].author === username) {
      continue;
    }
    posts[i].likes = posts[i].likes.filter(function (name) {
      return name !== username;
    });
    posts[i].replies = (posts[i].replies || []).filter(function (reply) {
      return reply.author !== username;
    });
    remaining.push(posts[i]);
  }
  savePosts(remaining);

  const users = getUsers().filter(function (user) {
    return user.username !== username;
  });
  saveUsers(users);

  endSession();
  window.location.href = root + "index.html";
};
