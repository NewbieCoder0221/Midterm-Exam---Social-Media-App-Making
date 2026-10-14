# BEESocial, a Bee Themed Private Social Media Prototype

BEESocial is a multi page static social media app. It was made for a web development midterm activity. The goal is a lightweight platform that protects privacy and freedom of expression. It uses only HTML, CSS, and vanilla JavaScript. It has no backend, no database, and no API.

## What Is New in Version

1. **Fresh start.** Every saved item now begins with the name beesocial. The first prototype saved data under plain names such as users and posts. Because of that, its old buzzes showed up in the new app.
2. **Replies.** Any buzz can be answered. A reply can use the user's name or be anonymous. A reply can be removed by its writer or by the owner of the buzz.
3. **Night mode.** A button in the menu switches between a day theme and a night theme. The choice is remembered on every page.
4. **Sorting.** The feed can show the newest buzzes or the buzzes with the most honey.
5. **Download my data.** The settings page creates a file with the user's profile, buzzes, and replies. The password is not included.
6. **Show password.** A checkbox on the login and signup forms lets the user check what they typed.
7. **Autumn avatar colors.** The avatar color choices now match the autumn palette.
8. **Better account deletion.** Deleting an account now also removes the user's replies.
9. **More profile stats.** The profile page now shows how many replies the user sent.

## Features

1. Home page that explains the idea of the app
2. Signup page with input validation
3. Login page with a limit on wrong tries
4. Main feed where users can post a buzz, search, sort, send honey (likes), and reply
5. Anonymous buzzes and anonymous replies
6. Profile page with simple stats and the user's own buzzes
7. Settings page to edit the profile, change the password, download data, and delete the account
8. About us page
9. Privacy page that explains what is stored and what the limits are

## Folder Structure

```
.
├── index.html
├── pages/
│   ├── login.html
│   ├── signup.html
│   ├── feed.html
│   ├── profile.html
│   ├── settings.html
│   ├── about.html
│   └── privacy.html
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── login.js
│       ├── signup.js
│       ├── feed.js
│       ├── profile.js
│       └── settings.js
└── assets/
    └── img/
        ├── logo.svg
        ├── bee.svg
        ├── honey.svg
        ├── icon-hex.svg
        ├── icon-comb.svg
        ├── icon-jar.svg
        ├── icon-buzz.svg
        ├── honeycomb-light.svg
        └── honeycomb-dark.svg
```

## How to Run

1. Download or clone the repository.
2. Open `index.html` in any modern browser such as Chrome, Edge, or Firefox.
3. No installation and no internet connection is needed.

For the best results, open the project with a simple local server such as the Live Server extension in VS Code. Opening the file directly also works.

## Design Theme

BEESocial uses a bee and honeycomb theme with warm autumn colors. The goal is a friendly and welcoming feeling that stays the same on every page.

**Color palette**

| Color | Code | Where it is used |
| --- | --- | --- |
| Honey amber | #e8a317 | Buttons, card borders, active menu link, honey icon |
| Burnt orange | #c65d1e | Links, profile numbers, checkbox and radio color |
| Maple rust | #a63d2f | Delete button and error messages |
| Deep brown | #3b2314 | Navigation bar, footer, hero section, day mode text |
| Cream | #fff6e3 | Day mode page background and the logo cell |
| Soft gold | #f3c969 | Brand name and headings on dark backgrounds |

**Bee and honeycomb elements**

1. The logo is a bee inside a honeycomb cell. It is also the browser tab icon.
2. A large bee sits in a floating honeycomb cell on the home page. The motion stops for people who prefer less motion.
3. The page background and the dark sections use a repeating honeycomb pattern made from SVG tiles.
4. A bee stripe bar in amber and brown sits under the navigation bar and above the footer.
5. User avatars are hexagons, like honeycomb cells. The avatar is cut with the CSS clip-path property.
6. Likes are called honey and use a honey drop icon. Posts are called buzzes and the post button says Buzz it.
7. Bullet lists use small honeycomb cells as markers.
8. Buttons are rounded pills with a thick bottom edge. They press down when clicked.

**Day and night mode**

The colors that change between day and night are saved as CSS variables at the top of `style.css`. Night mode adds the class night to the body tag. That class gives the variables new values, so every page changes without extra code for each element.

**Why the images are SVG files**

All images are drawn by hand as SVG. They stay sharp at any size, they are very small files, and they need no outside requests. This keeps the privacy promise of the app.

## How the Code Is Organized

**main.js** holds the shared code. Every page loads it first. It contains the storage helpers, the session helpers, the password hashing, the theme switch, the buzz and reply builders, and the navigation bar. This avoids copying the same code into every page.

**Page scripts** each handle one page only. For example `login.js` only handles the login form and `feed.js` only handles the feed.

**style.css** is one external stylesheet for the whole site. It uses flexbox for the layout, the box model for spacing, and one media query so the feed works on small screens. It also holds the bee theme such as the stripe bar and the hexagon avatars.

## How Data Is Stored

All data is kept in the browser. The helper functions in `main.js` add the prefix beesocial to every key, so the rest of the code can use short names.

| Key | Storage | What it holds |
| --- | --- | --- |
| beesocial_users | localStorage | List of user objects |
| beesocial_posts | localStorage | List of buzz objects with their replies |
| beesocial_failedAttempts and beesocial_lockUntil | localStorage | Counters for the login limit |
| beesocial_theme | localStorage | Day or night choice |
| beesocial_starterAdded | localStorage | Remembers that the starter buzzes were added |
| beesocial_currentUser | sessionStorage | Username of the logged in user |

A user object looks like this.

```js
{
  username: "juan_dev",
  displayName: "Juan",
  bio: "",
  color: "#c65d1e",
  salt: "a1b2c3d4e5f60708",
  passwordHash: "c0b4c6be...",
  joined: 1760000000000
}
```

A buzz object looks like this.

```js
{
  id: 1760000000000,
  author: "juan_dev",
  anonymous: false,
  text: "Hello BEESocial",
  time: 1760000000000,
  likes: ["mika", "lea"],
  replies: [
    {
      id: 1760000100000,
      author: "mika",
      anonymous: false,
      text: "Welcome to the hive",
      time: 1760000100000
    }
  ]
}
```

## Privacy and Security Decisions

**Password hashing.** The real password is never saved. At signup a random salt is created. The salt and the password are joined and hashed with SHA-256 using the browser's built in crypto tool. At login the typed password is hashed with the saved salt and compared to the saved hash.

**Rate limiting.** Five wrong login tries lock the form for 30 seconds. This slows down password guessing.

**Safe output.** Any text from a user is passed through `escapeHtml` before it is placed on the page. This stops a user from injecting HTML or script code into a buzz or a reply.

**Generic login errors.** The error message does not say if the username or the password was wrong. This stops people from checking which usernames exist.

**Session storage.** The login session is cleared when the tab closes. This is safer on shared computers.

**Anonymous buzzes and replies.** The author is still saved so the owner can delete the item. Other users only see the name Anonymous. Only the owner sees a badge on an anonymous buzz.

**Separate storage.** The prefix on every key keeps this app apart from older versions and from other projects that run on the same address.

**Data ownership.** Users can download a copy of their own data or delete everything at any time.

**No outside requests.** The app loads no outside fonts, scripts, images, or trackers.

## Known Limits

1. Browser storage is not encrypted. Anyone with access to the browser on the same device can read it.
2. Data does not sync between devices because there is no server.
3. Many users on one device share the same local data. This is a prototype for one browser.
4. SHA-256 with a salt is better than plain text. Real platforms should use slower password methods such as bcrypt.
5. The rate limit counts all failed tries together. It is not saved per user.
6. Clearing the browser data erases all accounts and buzzes.
7. Data from the first prototype is still in the browser but the app does not read it. It can be removed by clearing the site data in the browser settings.

## Testing Checklist

These are the checks I did by hand.

1. Opening the feed or profile page without logging in sends me to the login page.
2. Old data saved by the first prototype does not appear in the feed.
3. Signup rejects a bad username, a weak password, a mismatched password, and an unchecked agreement box.
4. Signup rejects a username that already exists.
5. The show password box changes the fields between hidden and visible.
6. A new account can write a buzz with a name and an anonymous buzz.
7. A buzz containing HTML tags is shown as plain text. A reply containing HTML tags is also shown as plain text.
8. Honey can be added and removed.
9. Replies can be opened, added, made anonymous, and removed.
10. A user cannot remove a reply on someone else's buzz unless the reply is their own.
11. The search box filters the feed while typing.
12. Sorting by most honey puts the buzz with the most honey first.
13. Night mode stays on when I move to another page.
14. The profile page shows the correct number of buzzes, honey, replies, and anonymous buzzes.
15. Profile changes and password changes are saved and work on the next login.
16. The downloaded data file has the profile, buzzes, and replies but no password information.
17. Five wrong passwords lock the login form.
18. Deleting the account removes the user, their buzzes, and their replies.
