const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const recommendContainer = document.getElementById("recommendedBooks");
const searchResults = document.getElementById("searchResults");
const themeToggle = document.getElementById("themeToggle");
const genreFilter = document.getElementById("genreFilter");
const bestsellerList = document.getElementById("bestsellerList");

let darkMode = false;

document.addEventListener("DOMContentLoaded", () => {
  loadRecommendedBooks();
  loadBestsellers();
  setupThemeToggle();
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
  document.body.classList.toggle("dark", darkMode);
  themeToggle.textContent = darkMode ? "☀️" : "🌙";
});

// --------------------- Functions ---------------------

function setupThemeToggle() {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
    darkMode = true;
  }
}

async function loadRecommendedBooks() {
  recommendContainer.innerHTML = "";
  const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=12");
  const data = await res.json();
  if (data.items) {
    data.items.forEach(book => {
      recommendContainer.appendChild(createBookCard(book));
    });
  }
}

async function loadBestsellers(genre = "") {
  bestsellerList.innerHTML = "";
  let url = `https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=20`;
  if (genre && genre !== "all") {
    url += `+subject:${genre}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  const genres = new Set();

  data.items?.slice(0, 10).forEach(book => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = book.volumeInfo.infoLink;
    link.target = "_blank";
    link.innerHTML = `
      <img src="${getBookImage(book)}" alt="cover">
      ${book.volumeInfo.title}
    `;
    li.appendChild(link);
    bestsellerList.appendChild(li);

    (book.volumeInfo.categories || []).forEach(cat => genres.add(cat));
  });

  updateGenreFilter(genres);
}

function updateGenreFilter(genres) {
  const current = genreFilter.value;
  genreFilter.innerHTML = '<option value="all">All Genres</option>';
  [...genres].sort().forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    genreFilter.appendChild(option);
  });
  genreFilter.value = current;
}

async function performSearch(query) {
  searchResults.innerHTML = "Loading...";
  const urls = [
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`,
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  ];

  const [googleRes, openLibRes] = await Promise.all(urls.map(url => fetch(url).then(res => res.json())));
  searchResults.innerHTML = "";

  // Google Books
  googleRes.items?.forEach(book => {
    searchResults.appendChild(createBookCard(book));
  });

  // Open Library
  openLibRes.docs?.slice(0, 10).forEach(book => {
    const div = document.createElement("div");
    div.className = "book";
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
}

function createBookCard(book) {
  const div = document.createElement("div");
  div.className = "book";
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
