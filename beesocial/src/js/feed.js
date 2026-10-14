/* feed.js
   Main feed page. Users can write posts, search, like, and delete posts. */

const currentUser = requireLogin();

const postForm = document.getElementById("postForm");
const postText = document.getElementById("postText");
const charCount = document.getElementById("charCount");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const postList = document.getElementById("postList");

const MAX_POST_LENGTH = 200;

// If requireLogin sent the user away, currentUser is null and we do nothing.
if (currentUser !== null) {
  addStarterPosts();
  showSidebar();
  renderPosts();
}

// Fills the left card with the user's own info.
function showSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML =
    '<div class="avatar avatar-big" style="background-color: ' + escapeHtml(currentUser.color) + '">' +
    escapeHtml(getInitial(currentUser.displayName)) + "</div>" +
    "<h3>" + escapeHtml(currentUser.displayName) + "</h3>" +
    '<p class="handle">@' + escapeHtml(currentUser.username) + "</p>" +
    '<a class="btn btn-outline" href="profile.html">View profile</a>' +
    '<div class="tip"><strong>Privacy tip</strong><br>' +
    "Use the anonymous option when you want to share a buzz without your name.</div>";
}

// Draws all posts that match the search box, newest first.
function renderPosts() {
  const posts = getPosts();
  const search = searchInput.value.trim().toLowerCase();

  // Sort by newest or by the most honey. Ties go to the newer buzz.
  posts.sort(function (a, b) {
    if (sortSelect.value === "honey" && b.likes.length !== a.likes.length) {
      return b.likes.length - a.likes.length;
    }
    return b.time - a.time;
  });

  let html = "";
  let shown = 0;

  for (let i = 0; i < posts.length; i++) {
    if (search !== "" && posts[i].text.toLowerCase().includes(search) === false) {
      continue;
    }
    html += buildPostHtml(posts[i], currentUser);
    shown++;
  }

  if (shown === 0) {
    html = '<div class="card empty">No buzzes found. The hive is quiet.</div>';
  }

  postList.innerHTML = html;
  activatePostButtons(currentUser, renderPosts);
}

// Update the character counter while typing.
postText.oninput = function () {
  charCount.textContent = postText.value.length + " / " + MAX_POST_LENGTH;
};

// Search while typing and sort when the choice changes.
searchInput.oninput = renderPosts;
sortSelect.onchange = renderPosts;

postForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearMessage("message");

  const text = postText.value.trim();

  if (text === "") {
    showMessage("message", "Write something before you buzz.", "error");
    return;
  }

  if (text.length > MAX_POST_LENGTH) {
    showMessage("message", "Buzzes can only be " + MAX_POST_LENGTH + " characters long.", "error");
    return;
  }

  const newPost = {
    id: Date.now(),
    author: currentUser.username,
    anonymous: document.getElementById("postAnonymous").checked,
    text: text,
    time: Date.now(),
    likes: [],
    replies: []
  };

  const posts = getPosts();
  posts.push(newPost);
  savePosts(posts);

  postForm.reset();
  charCount.textContent = "0 / " + MAX_POST_LENGTH;
  showMessage("message", "Your buzz is live in the hive.", "success");
  renderPosts();
});
