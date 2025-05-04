const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("search-results");
const backButton = document.getElementById("back-button");
const recommendationList = document.getElementById("recommendation-list");
const spinner = document.getElementById("spinner");
const themeToggle = document.getElementById("theme-toggle");
const genreFilter = document.getElementById("genre-filter");
const bestsellerList = document.getElementById("bestseller-list");
const offlineGame = document.getElementById("offline-game");

let isOffline = !navigator.onLine;

function setLoading(loading) {
  spinner.classList.toggle("hidden", !loading);
}

function displayBooks(books, container) {
  container.innerHTML = "";
  books.forEach(book => {
    const div = document.createElement("div");
    div.className = "book";
    div.innerHTML = `
      <img src="${book.image}" alt="${book.title}" />
      <h4>${book.title}</h4>
      <div class="rating">★ ${book.rating}</div>
    `;
    container.appendChild(div);
  });
}

async function fetchBooksFromAPIs(query) {
  const googleBooks = fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
    .then(res => res.json())
    .then(data => (data.items || []).map(item => ({
      title: item.volumeInfo.title,
      image: item.volumeInfo.imageLinks?.thumbnail || "",
      rating: item.volumeInfo.averageRating || "N/A"
    })));

  const openLibrary = fetch(`https://openlibrary.org/search.json?q=${query}`)
    .then(res => res.json())
    .then(data => (data.docs || []).map(item => ({
      title: item.title,
      image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : "",
      rating: "N/A"
    })));

  const itbook = fetch(`https://api.itbook.store/1.0/search/${query}`)
    .then(res => res.json())
    .then(data => (data.books || []).map(item => ({
      title: item.title,
      image: item.image,
      rating: "N/A"
    })));

  const all = await Promise.all([googleBooks, openLibrary, itbook]);
  return all.flat().filter(book => book.image);
}

async function searchBooks() {
  const query = searchInput.value.trim();
  if (!query) return;
  setLoading(true);
  resultsContainer.innerHTML = "";
  backButton.classList.remove("hidden");

  try {
    const books = await fetchBooksFromAPIs(query);
    displayBooks(books, resultsContainer);
  } catch (e) {
    resultsContainer.innerHTML = "<p>Error loading results. Try again later.</p>";
  }

  setLoading(false);
}

async function loadRecommendations() {
  setLoading(true);
  try {
    const books = await fetchBooksFromAPIs("fiction");
    const limited = books.slice(0, 10);
    displayBooks(limited, recommendationList);
  } catch (e) {
    recommendationList.innerHTML = "<p>Unable to load recommendations.</p>";
  }
  setLoading(false);
}

async function loadGenres() {
  try {
    const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=subject");
    const data = await response.json();
    const genres = [...new Set((data.items || []).flatMap(item => item.volumeInfo.categories || []))].sort();
    genreFilter.innerHTML = `<option value="">All Genres</option>` + genres.map(g => `<option value="${g}">${g}</option>`).join("");
  } catch (e) {
    genreFilter.innerHTML = `<option>Error loading genres</option>`;
  }
}

async function loadBestsellers(genre = "") {
  bestsellerList.innerHTML = "<li>Loading...</li>";
  try {
    const url = genre ? `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}` : `https://www.googleapis.com/books/v1/volumes?q=bestseller`;
    const res = await fetch(url);
    const data = await res.json();
    const books = (data.items || []).slice(0, 10).map(item => ({
      title: item.volumeInfo.title,
      image: item.volumeInfo.imageLinks?.thumbnail || ""
    }));

    bestsellerList.innerHTML = books.map(book => `
      <li>
        <img src="${book.image}" alt="${book.title}" />
        <span>${book.title}</span>
      </li>
    `).join("");
  } catch (e) {
    bestsellerList.innerHTML = "<li>Error loading bestsellers.</li>";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light-theme");
}

function showOfflineGame() {
  offlineGame.classList.remove("hidden");
  offlineGame.innerHTML = `
    <canvas id="game-canvas" width="300" height="200"></canvas>
    <p>You're offline. Enjoy a mini-game!</p>
  `;
  // You can initialize a canvas game here if needed
}

function hideOfflineGame() {
  offlineGame.classList.add("hidden");
}

window.addEventListener("load", () => {
  if (isOffline) showOfflineGame();
  else {
    hideOfflineGame();
    loadRecommendations();
    loadGenres();
    loadBestsellers();
  }
});

window.addEventListener("online", () => {
  isOffline = false;
  hideOfflineGame();
  loadRecommendations();
  loadGenres();
  loadBestsellers();
});

window.addEventListener("offline", () => {
  isOffline = true;
  showOfflineGame();
});

searchInput.addEventListener("input", () => {
  if (searchInput.value.trim()) {
    searchBooks();
  } else {
    resultsContainer.innerHTML = "";
    backButton.classList.add("hidden");
  }
});

backButton.addEventListener("click", () => {
  searchInput.value = "";
  resultsContainer.innerHTML = "";
  backButton.classList.add("hidden");
});

themeToggle.addEventListener("click", toggleTheme);

document.getElementById("refresh-button").addEventListener("click", loadRecommendations);

genreFilter.addEventListener("change", () => {
  const selected = genreFilter.value;
  loadBestsellers(selected);
});
