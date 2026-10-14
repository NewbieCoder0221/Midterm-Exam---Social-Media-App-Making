/* profile.js
   Shows the logged in user's profile, simple stats, and their own posts. */

const currentUser = requireLogin();

if (currentUser !== null) {
  showProfile();
  renderMyPosts();
}

function showProfile() {
  const header = document.getElementById("profileHeader");
  const joinedDate = new Date(currentUser.joined).toLocaleDateString();

  let bio = currentUser.bio;
  if (bio === "") {
    bio = "No bio yet. You can add one in settings.";
  }

  header.innerHTML =
    '<div class="avatar avatar-big" style="background-color: ' + escapeHtml(currentUser.color) + '">' +
    escapeHtml(getInitial(currentUser.displayName)) + "</div>" +
    "<h1>" + escapeHtml(currentUser.displayName) + "</h1>" +
    '<p class="handle">@' + escapeHtml(currentUser.username) + " | Joined " + joinedDate + "</p>" +
    "<p>" + escapeHtml(bio) + "</p>" +
    '<a class="btn btn-outline" href="settings.html">Edit profile</a>';
}

// Gets only the posts written by this user.
function getMyPosts() {
  const posts = getPosts();
  const mine = [];
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].author === currentUser.username) {
      mine.push(posts[i]);
    }
  }
  mine.sort(function (a, b) {
    return b.time - a.time;
  });
  return mine;
}

function renderMyPosts() {
  const myPosts = getMyPosts();

  // Count likes received and anonymous posts for the stats.
  let totalLikes = 0;
  let anonymousCount = 0;
  for (let i = 0; i < myPosts.length; i++) {
    totalLikes += myPosts[i].likes.length;
    if (myPosts[i].anonymous) {
      anonymousCount++;
    }
  }

  // Count the replies this user wrote on any buzz.
  let replyCount = 0;
  const allPosts = getPosts();
  for (let i = 0; i < allPosts.length; i++) {
    const replies = allPosts[i].replies || [];
    for (let j = 0; j < replies.length; j++) {
      if (replies[j].author === currentUser.username) {
        replyCount++;
      }
    }
  }

  document.getElementById("statPosts").textContent = myPosts.length;
  document.getElementById("statReplies").textContent = replyCount;
  document.getElementById("statLikes").textContent = totalLikes;
  document.getElementById("statAnonymous").textContent = anonymousCount;

  let html = "";
  for (let i = 0; i < myPosts.length; i++) {
    html += buildPostHtml(myPosts[i], currentUser);
  }

  if (myPosts.length === 0) {
    html = '<div class="card empty">You have not buzzed yet. Fly over to the feed and say hello.</div>';
  }

  document.getElementById("postList").innerHTML = html;
  activatePostButtons(currentUser, renderMyPosts);
}
