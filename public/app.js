const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const recommendContainer = document.getElementById("recommendedBooks");
const searchResults = document.getElementById("searchResults");
const themeToggle = document.getElementById("themeToggle");
const genreFilter = document.getElementById("genreFilter");
const bestsellerList = document.getElementById("bestsellerList");
const loader = document.getElementById("loader");

let darkMode = false;

document.addEventListener("DOMContentLoaded", () => {
  loadRecommendedBooks();
  loadBestsellers();
  setupThemeToggle();
});

// Predictive live search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    performSearch(query);
    backBtn.style.display = "inline-block";
  } else {
    searchResults.innerHTML = "";
    backBtn.style.display = "none";
  }
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    performSearch(query);
    backBtn.style.display = "inline-block";
  }
});

backBtn.addEventListener("click", () => {
  searchResults.innerHTML = "";
  searchInput.value = "";
  backBtn.style.display = "none";
});

refreshBtn.addEventListener("click", () => {
  loadRecommendedBooks();
});

genreFilter.addEventListener("change", () => {
  loadBestsellers(genreFilter.value);
});

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  themeToggle.textContent = darkMode ? "☀️" : "🌙";
  localStorage.setItem("theme", darkMode ? "dark" : "light");
});

function setupThemeToggle() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark") {
    darkMode = true;
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙";
  }
}

function showLoader() {
  loader.style.display = "block";
}

function hideLoader() {
  loader.style.display = "none";
}

async function loadRecommendedBooks() {
  showLoader();
  recommendContainer.innerHTML = "";
  const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=recommended+reading&maxResults=8");
  const data = await res.json();
  if (data.items) {
    data.items.forEach(book => {
      recommendContainer.appendChild(createBookCard(book));
    });
  }
  hideLoader();
}

async function loadBestsellers(genre = "") {
  bestsellerList.innerHTML = "";
  let url = `https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=20`;
  if (genre && genre !== "all") {
    url += `+subject:${encodeURIComponent(genre)}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  const genres = new Set();

  data.items?.slice(0, 10).forEach(book => {
    const info = book.volumeInfo;
    const li = document.createElement("div");
    li.className = "book";
    li.innerHTML = `
      <img src="${getBookImage(book)}" alt="cover" />
      <div>
        <h4>${info.title}</h4>
        <p>${info.authors?.join(", ") || "Unknown"}</p>
      </div>
    `;
    li.addEventListener("click", () => {
      window.open(info.infoLink, "_blank");
    });
    bestsellerList.appendChild(li);

    (info.categories || []).forEach(cat => genres.add(cat));
  });

  updateGenreFilter(genres);
}

function updateGenreFilter(genres) {
  const current = genreFilter.value;
  genreFilter.innerHTML = '<option value="all">All Genres</option>';
  [...genres].sort().forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreFilter.appendChild(opt);
  });
  genreFilter.value = current;
}

async function performSearch(query) {
  showLoader();
  searchResults.innerHTML = "";
  const urls = [
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=15`,
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  ];

  const [gRes, oRes] = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));

  gRes.items?.forEach(book => {
    searchResults.appendChild(createBookCard(book));
  });

  oRes.docs?.slice(0, 10).forEach(book => {
    const div = document.createElement("div");
    div.className = "book-card";
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/128x192?text=No+Cover";
    div.innerHTML = `
      <img src="${cover}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>${book.author_name?.[0] || "Unknown Author"}</p>
    `;
    div.addEventListener("click", () => {
      window.open(`https://openlibrary.org${book.key}`, "_blank");
    });
    searchResults.appendChild(div);
  });

  hideLoader();
}

function createBookCard(book) {
  const div = document.createElement("div");
  div.className = "book-card";
  const info = book.volumeInfo;
  const image = getBookImage(book);
  div.innerHTML = `
    <img src="${image}" alt="${info.title}" />
    <h3>${info.title}</h3>
    <p>${info.authors?.join(", ") || "Unknown Author"}</p>
  `;
  div.addEventListener("click", () => {
    window.open(info.infoLink, "_blank");
  });
  return div;
}

function getBookImage(book) {
  const link = book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x192?text=No+Cover";
  return link.replace(/^http:/, "https:");
}
