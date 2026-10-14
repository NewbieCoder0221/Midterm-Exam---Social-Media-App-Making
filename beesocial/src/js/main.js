/* main.js
   Shared code for every page of BEESocial version 2.0.
   Each page loads this file first and then loads its own page script.
   All data is saved in the browser only. Nothing is sent to a server. */

// The root path makes links work from index.html and from the pages folder.
// Each page sets it in the body tag using data-root.
const root = document.body.dataset.root || "";

// Every saved item starts with this prefix.
// It keeps BEESocial data apart from older versions and from other apps.
const KEY_PREFIX = "beesocial_";

// Handles that belong to the starter content. Real users cannot take them.
const STARTER_USERS = ["mika", "jun", "lea", "hive_team"];

// Autumn colors a user can pick for their avatar.
const AVATAR_COLORS = [
  { name: "Maple", value: "#a63d2f" },
  { name: "Pumpkin", value: "#c65d1e" },
  { name: "Honey", value: "#9a6a12" },
  { name: "Olive", value: "#6b6b1f" },
  { name: "Plum", value: "#7a3b5e" },
  { name: "Bark", value: "#5a3a22" }
];

// Ids of the buzzes that currently show their replies.
// This stays in memory only, so it resets when the page reloads.
let openReplies = [];


/* STORAGE HELPERS
   localStorage keeps text only, so we turn objects into JSON text first.
   These small functions add the prefix so the rest of the code stays simple. */

function saveItem(key, value) {
  localStorage.setItem(KEY_PREFIX + key, value);
}

function loadItem(key) {
  return localStorage.getItem(KEY_PREFIX + key);
}

function removeItem(key) {
  localStorage.removeItem(KEY_PREFIX + key);
}

function readData(key, fallback) {
  try {
    const data = JSON.parse(loadItem(key));
    if (data === null) {
      return fallback;
    }
    return data;
  } catch (error) {
    // If the saved text is broken we start fresh instead of crashing.
    return fallback;
  }
}

function getUsers() {
  return readData("users", []);
}

function saveUsers(users) {
  saveItem("users", JSON.stringify(users));
}

function getPosts() {
  return readData("posts", []);
}

function savePosts(posts) {
  saveItem("posts", JSON.stringify(posts));
}

function findUser(username) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return users[i];
    }
  }
  return null;
}

// Replaces the saved copy of a user with the updated one.
function updateUser(updatedUser) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === updatedUser.username) {
      users[i] = updatedUser;
    }
  }
  saveUsers(users);
}


/* SESSION HELPERS
   The login session uses sessionStorage on purpose.
   It is cleared when the tab closes, so a shared computer is safer. */

function startSession(username) {
  sessionStorage.setItem(KEY_PREFIX + "currentUser", username);
}

function endSession() {
  sessionStorage.removeItem(KEY_PREFIX + "currentUser");
}

function getCurrentUser() {
  const username = sessionStorage.getItem(KEY_PREFIX + "currentUser");
  if (username === null) {
    return null;
  }
  return findUser(username);
}

// Used by pages that need a logged in user. Sends guests to the login page.
function requireLogin() {
  const user = getCurrentUser();
  if (user === null) {
    window.location.href = root + "pages/login.html";
  }
  return user;
}

// Used by login and signup so logged in users skip them.
function redirectIfLoggedIn() {
  if (getCurrentUser() !== null) {
    window.location.href = root + "pages/feed.html";
  }
}

function logout() {
  endSession();
  window.location.href = root + "pages/login.html";
}


/* PASSWORD HELPERS
   Passwords are never saved as plain text.
   We add a random salt and then hash the result with SHA-256. */

function generateSalt() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
}

// This function is async because the browser hashing tool returns a promise.
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(buffer));
  return bytes.map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
}

// Connects a checkbox to password fields so the user can show or hide them.
function setupShowPassword(checkboxId, fieldIds) {
  const box = document.getElementById(checkboxId);
  box.onchange = function () {
    for (let i = 0; i < fieldIds.length; i++) {
      document.getElementById(fieldIds[i]).type = box.checked ? "text" : "password";
    }
  };
}


/* SMALL UTILITY FUNCTIONS */

// Stops user text from being read as HTML code.
// This protects the page from script injection when we use innerHTML.
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return minutes + " min ago";
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + " hr ago";
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return "1 day ago";
  }
  return days + " days ago";
}

// Shows a success or error message inside the element with the given id.
function showMessage(elementId, text, type) {
  const box = document.getElementById(elementId);
  box.textContent = text;
  box.className = "message " + type;
}

function clearMessage(elementId) {
  const box = document.getElementById(elementId);
  box.textContent = "";
  box.className = "message";
}


/* DAY AND NIGHT THEME
   The choice is saved so it stays the same on every page. */

function applyTheme() {
  if (loadItem("theme") === "night") {
    document.body.classList.add("night");
  } else {
    document.body.classList.remove("night");
  }
}

function toggleTheme() {
  const isNight = loadItem("theme") === "night";
  saveItem("theme", isNight ? "day" : "night");
  applyTheme();

  // Update the label on the button.
  document.getElementById("themeBtn").textContent = isNight ? "Night mode" : "Day mode";
}


/* STARTER CONTENT
   A few example buzzes and replies so the feed is not empty on the first visit. */

function addStarterPosts() {
  if (loadItem("starterAdded") === "yes") {
    return;
  }

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  const starterPosts = [
    {
      id: 1,
      author: "hive_team",
      displayName: "BEESocial Team",
      color: "#c65d1e",
      anonymous: false,
      text: "Welcome to the hive. Your buzzes and your account stay inside your own browser. Nobody is watching.",
      time: now - 30 * hour,
      likes: ["mika", "jun"],
      replies: [
        {
          id: 101,
          author: "mika",
          displayName: "Mika",
          color: "#7a3b5e",
          anonymous: false,
          text: "Love the honeycomb look. It feels so warm.",
          time: now - 28 * hour
        }
      ]
    },
    {
      id: 2,
      author: "mika",
      displayName: "Mika",
      color: "#7a3b5e",
      anonymous: false,
      text: "Reminder to myself. A good bee reads the privacy page before trusting any app with her honey.",
      time: now - 8 * hour,
      likes: ["lea"],
      replies: []
    },
    {
      id: 3,
      author: "jun",
      displayName: "Jun",
      color: "#6b6b1f",
      anonymous: true,
      text: "Sometimes I just want to share a thought without my name attached. This anonymous buzz option is nice.",
      time: now - 5 * hour,
      likes: ["mika", "lea", "hive_team"],
      replies: [
        {
          id: 102,
          author: "lea",
          displayName: "Lea",
          color: "#9a6a12",
          anonymous: false,
          text: "Same here. Sometimes a quiet buzz is the best buzz.",
          time: now - 4 * hour
        }
      ]
    },
    {
      id: 4,
      author: "lea",
      displayName: "Lea",
      color: "#9a6a12",
      anonymous: false,
      text: "Finished my first multi page website today. HTML, CSS and JavaScript are starting to make sense. Busy as a bee this week.",
      time: now - 1 * hour,
      likes: [],
      replies: []
    }
  ];

  savePosts(starterPosts);
  saveItem("starterAdded", "yes");
}


/* POST AND REPLY HELPERS
   These are used by both the feed page and the profile page. */

// Works out how to show the author of a buzz or a reply.
// Anonymous items hide the name, the handle, and the avatar letter.
function getAuthorInfo(item) {
  if (item.anonymous === true) {
    return { name: "Anonymous", handle: "", color: "#5a3a22", initial: "?" };
  }

  const author = findUser(item.author);
  let name = item.displayName || item.author;
  let color = item.color || "#5a3a22";
  if (author !== null) {
    name = author.displayName;
    color = author.color;
  }

  return { name: name, handle: "@" + item.author, color: color, initial: getInitial(name) };
}

// Builds the HTML text for the replies under one buzz.
function buildRepliesHtml(post, viewer) {
  const replies = post.replies || [];
  let html = '<div class="replies">';

  for (let i = 0; i < replies.length; i++) {
    const reply = replies[i];
    const info = getAuthorInfo(reply);

    // A reply can be removed by its writer or by the owner of the buzz.
    const canRemove = reply.author === viewer.username || post.author === viewer.username;

    html += '<div class="reply">';
    html += '<div class="avatar avatar-small" style="background-color: ' + escapeHtml(info.color) + '">' + escapeHtml(info.initial) + "</div>";
    html += '<div class="reply-body">';
    html += "<div><strong>" + escapeHtml(info.name) + '</strong> <span class="handle">' + escapeHtml(info.handle) + '</span> <span class="time">' + timeAgo(reply.time) + "</span></div>";
    html += '<p class="reply-text">' + escapeHtml(reply.text) + "</p>";
    if (canRemove) {
      html += '<button type="button" class="reply-delete" data-post="' + post.id + '" data-reply="' + reply.id + '">Remove</button>';
    }
    html += "</div></div>";
  }

  if (replies.length === 0) {
    html += '<p class="hint">No replies yet. Be the first bee to answer.</p>';
  }

  html += '<form class="reply-form" data-id="' + post.id + '">';
  html += '<input type="text" class="reply-input" maxlength="140" placeholder="Reply to this buzz...">';
  html += '<div class="reply-options"><div class="check-row"><input type="checkbox" class="reply-anon"><label>Anonymous</label></div>';
  html += '<button type="submit" class="btn btn-small">Reply</button></div>';
  html += "</form></div>";
  return html;
}

// Builds the HTML text for one buzz card.
// viewer is the logged in user, so we know if the buzz is theirs.
function buildPostHtml(post, viewer) {
  const info = getAuthorInfo(post);
  const isOwner = post.author === viewer.username;
  const liked = post.likes.includes(viewer.username);
  const replyCount = (post.replies || []).length;
  const repliesOpen = openReplies.includes(post.id);

  let html = '<article class="card post"><div class="post-main">';
  html += '<div class="avatar" style="background-color: ' + escapeHtml(info.color) + '">' + escapeHtml(info.initial) + "</div>";
  html += '<div class="post-body">';
  html += '<div class="post-header"><strong>' + escapeHtml(info.name) + "</strong> ";
  html += '<span class="handle">' + escapeHtml(info.handle) + "</span> ";
  html += '<span class="time">' + timeAgo(post.time) + "</span>";

  // Only the owner can see that an anonymous buzz is theirs.
  if (post.anonymous === true && isOwner) {
    html += ' <span class="badge">Anonymous, only you know it is yours</span>';
  }

  html += "</div>";
  html += '<p class="post-text">' + escapeHtml(post.text) + "</p>";
  html += '<div class="post-actions">';
  html += '<button class="like-btn' + (liked ? " liked" : "") + '" data-id="' + post.id + '">';
  html += '<img src="' + root + 'assets/img/honey.svg" alt="">Honey ' + post.likes.length + "</button>";
  html += '<button class="reply-toggle' + (repliesOpen ? " liked" : "") + '" data-id="' + post.id + '">Replies ' + replyCount + "</button>";

  if (isOwner) {
    html += '<button class="delete-btn" data-id="' + post.id + '">Delete</button>';
  }

  html += "</div></div></div>";

  if (repliesOpen) {
    html += buildRepliesHtml(post, viewer);
  }

  html += "</article>";
  return html;
}

// Adds click actions to every button and form on the post cards.
// The refresh function redraws the post list after a change.
function activatePostButtons(viewer, refresh) {
  const likeButtons = document.getElementsByClassName("like-btn");
  for (let i = 0; i < likeButtons.length; i++) {
    likeButtons[i].onclick = function () {
      toggleLike(Number(this.dataset.id), viewer.username);
      refresh();
    };
  }

  const deleteButtons = document.getElementsByClassName("delete-btn");
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].onclick = function () {
      if (confirm("Delete this buzz for good?")) {
        deletePost(Number(this.dataset.id), viewer.username);
        refresh();
      }
    };
  }

  // Open or close the replies of a buzz.
  const replyToggles = document.getElementsByClassName("reply-toggle");
  for (let i = 0; i < replyToggles.length; i++) {
    replyToggles[i].onclick = function () {
      const id = Number(this.dataset.id);
      const position = openReplies.indexOf(id);
      if (position === -1) {
        openReplies.push(id);
      } else {
        openReplies.splice(position, 1);
      }
      refresh();
    };
  }

  // Send a new reply.
  const replyForms = document.getElementsByClassName("reply-form");
  for (let i = 0; i < replyForms.length; i++) {
    replyForms[i].onsubmit = function (event) {
      event.preventDefault();
      const text = this.getElementsByClassName("reply-input")[0].value.trim();
      const anonymous = this.getElementsByClassName("reply-anon")[0].checked;
      if (text === "" || text.length > 140) {
        return;
      }
      addReply(Number(this.dataset.id), viewer.username, text, anonymous);
      refresh();
    };
  }

  // Remove a reply.
  const replyDeletes = document.getElementsByClassName("reply-delete");
  for (let i = 0; i < replyDeletes.length; i++) {
    replyDeletes[i].onclick = function () {
      deleteReply(Number(this.dataset.post), Number(this.dataset.reply), viewer.username);
      refresh();
    };
  }
}

function toggleLike(postId, username) {
  const posts = getPosts();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === postId) {
      const position = posts[i].likes.indexOf(username);
      if (position === -1) {
        posts[i].likes.push(username);
      } else {
        posts[i].likes.splice(position, 1);
      }
    }
  }
  savePosts(posts);
}

// Only the owner of a buzz can delete it.
function deletePost(postId, username) {
  const posts = getPosts();
  const remaining = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === postId && posts[i].author === username) {
      continue;
    }
    remaining.push(posts[i]);
  }
  savePosts(remaining);
}

function addReply(postId, username, text, anonymous) {
  const posts = getPosts();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === postId) {
      if (!posts[i].replies) {
        posts[i].replies = [];
      }
      posts[i].replies.push({
        id: Date.now(),
        author: username,
        anonymous: anonymous,
        text: text,
        time: Date.now()
      });
    }
  }
  savePosts(posts);
}

function deleteReply(postId, replyId, username) {
  const posts = getPosts();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === postId) {
      const kept = [];
      const replies = posts[i].replies || [];
      for (let j = 0; j < replies.length; j++) {
        const isTarget = replies[j].id === replyId;
        const allowed = replies[j].author === username || posts[i].author === username;
        if (isTarget && allowed) {
          continue;
        }
        kept.push(replies[j]);
      }
      posts[i].replies = kept;
    }
  }
  savePosts(posts);
}


/* NAVIGATION BAR
   Built with JavaScript so every page shows the same menu.
   The menu changes depending on whether the user is logged in. */

function buildNavbar() {
  const nav = document.getElementById("navbar");
  if (nav === null) {
    return;
  }

  const user = getCurrentUser();

  let links = [
    { text: "Home", file: "index.html" },
    { text: "About", file: "pages/about.html" },
    { text: "Privacy", file: "pages/privacy.html" }
  ];

  if (user !== null) {
    links.push({ text: "Feed", file: "pages/feed.html" });
    links.push({ text: "Profile", file: "pages/profile.html" });
    links.push({ text: "Settings", file: "pages/settings.html" });
  } else {
    links.push({ text: "Log in", file: "pages/login.html" });
    links.push({ text: "Sign up", file: "pages/signup.html" });
  }

  let linksHtml = "";
  for (let i = 0; i < links.length; i++) {
    // The link for the page we are on gets the active class.
    let activeClass = "";
    const path = window.location.pathname;
    if (path.endsWith(links[i].file) || (links[i].file === "index.html" && path.endsWith("/"))) {
      activeClass = ' class="active"';
    }
    linksHtml += '<a href="' + root + links[i].file + '"' + activeClass + ">" + links[i].text + "</a>";
  }

  const themeLabel = loadItem("theme") === "night" ? "Day mode" : "Night mode";
  linksHtml += '<button type="button" id="themeBtn">' + themeLabel + "</button>";

  if (user !== null) {
    linksHtml += '<button type="button" id="logoutBtn">Log out</button>';
  }

  nav.className = "navbar";
  nav.innerHTML =
    '<div class="nav-inner">' +
    '<a class="brand" href="' + root + 'index.html">' +
    '<img src="' + root + 'assets/img/logo.svg" alt="BEESocial bee logo">BEESocial</a>' +
    '<div class="nav-links">' + linksHtml + "</div></div>";

  document.getElementById("themeBtn").onclick = toggleTheme;
  if (user !== null) {
    document.getElementById("logoutBtn").onclick = logout;
  }
}

applyTheme();
buildNavbar();
