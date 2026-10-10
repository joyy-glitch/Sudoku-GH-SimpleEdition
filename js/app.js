// All the Adinkra symbols in the game.
// level tells us when the symbol unlocks.

// app.js: shared code loaded on every page.
// Holds the list of symbols, light/dark mode, the menu, saving and loading players
// from localStorage, and helpers for working out the player's level and streak.
let symbols = [
    { name: "Gye Nyame", meaning: "Except God - the supremacy of God", image: "gye_nyame.png", level: 1 },
    { name: "Sankofa", meaning: "Go back and get it - learning from the past", image: "sankofa.png", level: 1 },
    { name: "Dwennimmen", meaning: "Ram's horns - humility and strength", image: "dwennimmen.png", level: 1 },
    { name: "Akoma", meaning: "The heart - patience and tolerance", image: "akoma.png", level: 1 },
    { name: "Adinkrahene", meaning: "Chief of Adinkra symbols - greatness and leadership", image: "adinkrahene.png", level: 2 },
    { name: "Eban", meaning: "Fence - love, safety and security", image: "eban.png", level: 2 },
    { name: "Nkyinkyim", meaning: "Twisting - initiative, dynamism and versatility", image: "nkyinkyim.png", level: 3 },
    { name: "Mate Masie", meaning: "What I hear, I keep - wisdom and knowledge", image: "mate_masie.png", level: 3 },
    { name: "Bese Saka", meaning: "Sack of cola nuts - abundance and togetherness", image: "bese_saka.png", level: 3 }
];

// grid size for each level
let gridSizes = { 1: 4, 2: 6, 3: 9 };

// ---------- light and dark mode ----------

// this runs straight away (app.js is loaded in the <head>) so the page never flashes the wrong colours
if (localStorage.getItem("theme") == "light") {
    document.documentElement.classList.add("light");
}

// toggleTheme: switches between light and dark mode and remembers the choice


function toggleTheme() {
    let html = document.documentElement;
    if (html.classList.contains("light")) {
        html.classList.remove("light");
        localStorage.setItem("theme", "dark");
    } else {
        html.classList.add("light");
        localStorage.setItem("theme", "light");
    }
}

// ---------- symbol images ----------

// if the first image can't load, show the symbol's first letters instead
let testImage = new Image();
testImage.onerror = function () {
    document.documentElement.classList.add("no-images");
};
testImage.src = "images/symbols/" + symbols[0].image;

// returns the html for one symbol picture
// (the black PNG is used as a mask, so CSS can paint it gold, purple or red)

// symbolHtml: returns the HTML for one symbol picture (the image is used as a mask so it can be recoloured)

function symbolHtml(s) {
    let url = "url(images/symbols/" + s.image + ")";
    return '<span class="sym" title="' + s.name + '">' +
        '<span class="sym-img" style="-webkit-mask-image: ' + url + '; mask-image: ' + url + '"></span>' +
        '<span class="sym-alt">' + s.name.slice(0, 2) + '</span></span>';
}

// ---------- icons ----------

let icons = {
    home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 12h16M12 4v16"/></svg>',
    symbols: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>',
    quiz: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg>',
    rules: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>',
    logout: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/></svg>',
    moon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    lock: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>',
    trophy: '<svg width="34" height="34" viewBox="0 0 24 24" fill="#F5B83D"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.4A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.4 12H8a4 4 0 0 1-4-4V5h3V3z"/></svg>',
    flame: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4.5 6 6 6 11.5a6 6 0 0 1-12 0c0-3 1.8-4.3 2.4-6 1.2 1.8 2.4 2.4 3.6 2.4C10.8 6.4 12 4.6 12 2z"/></svg>',
    undo: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    erase: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M16.5 3.5l4 4L10 18H6l-2-2 12.5-12.5z"/></svg>',
    numbers: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/></svg>'
};

// ---------- navigation ----------

// draws the sidebar (desktop) and the tab bar (phone).
// active is the page we are on, e.g. "play"

// drawNav: builds the sidebar (desktop) and bottom tab bar (phone), highlighting the current page

function drawNav(active) {
    let pages = [
        { id: "home", label: "Home", href: "dashboard.html" },
        { id: "play", label: "Play", href: "play.html" },
        { id: "symbols", label: "Symbols", href: "learn.html" },
        { id: "quiz", label: "Quiz", href: "quiz.html" },
        { id: "rules", label: "Rules", href: "rules.html" }
    ];

    let side = '<a class="logo" href="dashboard.html">Adin<span>Kraze</span></a>';
    let tabs = "";

    for (let p of pages) {
        let on = (p.id == active) ? " active" : "";
        side += '<a class="nav-link' + on + '" href="' + p.href + '">' + icons[p.id] + p.label + '</a>';
        tabs += '<a class="tab' + on + '" href="' + p.href + '">' + icons[p.id] + p.label + '</a>';
    }

    side += '<div class="side-bottom">' +
        '<a class="nav-link" href="#" onclick="toggleTheme(); return false;">' + icons.moon + 'Light / dark</a>' +
        '<a class="nav-link" href="#" onclick="logout(); return false;">' + icons.logout + 'Log out</a>' +
        '</div>';

    document.getElementById("sidebar").innerHTML = side;
    document.getElementById("tabbar").innerHTML = tabs;

    // on phones the sidebar is hidden, so show the logo at the top of the page
    document.querySelector(".main").insertAdjacentHTML("afterbegin",
        '<a class="logo mobile-logo" href="dashboard.html">Adin<span>Kraze</span></a>');
}

// ---------- saving and loading users ----------
// getUsers / saveUsers: read and write the list of all players in localStorage

function getUsers() {
    let users = localStorage.getItem("users");
    if (users == null) {
        return [];
    }
    return JSON.parse(users);
}


function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}
// getCurrentUser: finds the player who is logged in right now
function getCurrentUser() {
    let username = localStorage.getItem("currentUser");
    if (username == null) {
        return null;
    }
    let users = getUsers();
    for (let u of users) {
        if (u.username == username) {
            return u;
        }
    }
    return null;
}
// updateUser: saves changes to one player (e.g. after a game or quiz)


function updateUser(user) {
    let users = getUsers();
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == user.username) {
            users[i] = user;
        }
    }
    saveUsers(users);
}

// send people who are not logged in to the login page
// requireLogin: sends anyone who isn't logged in to the login page
function requireLogin() {
    let user = getCurrentUser();
    if (user == null) {
        window.location.href = "login.html";
        throw new Error("Not logged in"); // stops the rest of the page's code
    }
    return user;
}
// logout: forgets who is logged in and goes back to the login page

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// ---------- progress ----------

// the player's level is one more than the highest level they have finished
// getCurrentLevel: the player's level is one more than the highest level they have finished

function getCurrentLevel(user) {
    let maxLevel = 0;
    for (let g of user.games) {
        if (g.level > maxLevel) {
            maxLevel = g.level;
        }
    }
    return maxLevel + 1;
}
// getUnlockedSymbols: the symbols the player can use, based on their level

function getUnlockedSymbols(user) {
    let level = getCurrentLevel(user);
    return symbols.filter(s => s.level <= level);
}

// how many days in a row the player has solved a puzzle (ending today)
// getStreak: counts how many days in a row the player has solved a puzzle
// shuffle: mixes up an array into a random order
function getStreak(user) {
    let days = user.games.map(g => g.date.slice(0, 10));
    let count = 0;
    let d = new Date();
    while (days.includes(d.toISOString().slice(0, 10))) {
        count++;
        d.setDate(d.getDate() - 1);
    }
    return count;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}
