const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const refreshButton = document.getElementById("refreshButton");
const backButton = document.getElementById("backButton");
const recommendationsContainer = document.getElementById("recommendations");
const searchResultsContainer = document.getElementById("searchResults");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const genreDropdown = document.getElementById("genreDropdown");
const recommendationGenreDropdown = document.getElementById("recommendationGenreDropdown");
const bestsellerList = document.getElementById("bestsellerList");

let isDarkMode = false;
let currentRecommendations = [];

async function fetchBooks(query, maxResults = 20) {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
  const data = await response.json();
  return data.items || [];
}

function createBookCard(book) {
  const info = book.volumeInfo;
  const link = info.infoLink || "#";
  const thumbnail = info.imageLinks?.thumbnail || "https://via.placeholder.com/128x200?text=No+Image";
  const title = info.title || "No Title";
  const rating = info.averageRating ? `⭐ ${info.averageRating}` : "No Rating";

  const card = document.createElement("a");
  card.className = "book-card";
  card.href = link;
  card.target = "_blank";
  card.innerHTML = `
    <img src="${thumbnail}" alt="${title}" />
    <h3>${title}</h3>
    <p>${rating}</p>
  `;
  return card;
}

async function displayRecommendations(genre = "all") {
  recommendationsContainer.innerHTML = "";
  const query = genre === "all" ? "bestseller" : `subject:${genre}`;
  const books = await fetchBooks(query);
  currentRecommendations = books;

  books.slice(0, 8).forEach(book => {
    const card = createBookCard(book);
    recommendationsContainer.appendChild(card);
  });
}

async function displayBestsellers(genre = "all") {
  bestsellerList.innerHTML = "";
  const query = genre === "all" ? "bestseller" : `subject:${genre}`;
  const books = await fetchBooks(query, 10);
  books.forEach(book => {
    const info = book.volumeInfo;
    const thumbnail = info.imageLinks?.thumbnail || "https://via.placeholder.com/50x75?text=No+Image";
    const title = info.title || "No Title";

    const li = document.createElement("li");
    li.className = "sidebar-book";
    li.innerHTML = `
      <img src="${thumbnail}" alt="${title}" />
      <span>${title}</span>
    `;
    bestsellerList.appendChild(li);
  });
}

function performSearch(query) {
  searchResultsContainer.innerHTML = "";
  if (!query.trim()) return;

  fetchBooks(query).then(books => {
    searchResultsContainer.style.display = "flex";
    recommendationsContainer.style.display = "none";
    backButton.style.display = "inline-block";

    books.forEach(book => {
      const card = createBookCard(book);
      searchResultsContainer.appendChild(card);
    });
  });
}

function populateGenreDropdowns() {
  const genres = [
    "all", "fiction", "nonfiction", "fantasy", "romance", "science", "technology", "mystery", "history", "biography", "self-help"
  ];

  genres.forEach(genre => {
    const option1 = document.createElement("option");
    const option2 = document.createElement("option");
    option1.value = option2.value = genre;
    option1.textContent = option2.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreDropdown.appendChild(option1);
    recommendationGenreDropdown.appendChild(option2);
  });
}

// EVENTS
searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  if (query.trim()) {
    performSearch(query);
  } else {
    searchResultsContainer.style.display = "none";
    recommendationsContainer.style.display = "flex";
    backButton.style.display = "none";
  }
});

searchButton.addEventListener("click", () => {
  const query = searchInput.value;
  performSearch(query);
});

refreshButton.addEventListener("click", () => {
  const selectedGenre = recommendationGenreDropdown.value;
  displayRecommendations(selectedGenre);
});

backButton.addEventListener("click", () => {
  searchResultsContainer.style.display = "none";
  recommendationsContainer.style.display = "flex";
  backButton.style.display = "none";
  searchInput.value = "";
});

themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeIcon.textContent = isDarkMode ? "☀️" : "🌙";
});

genreDropdown.addEventListener("change", () => {
  displayBestsellers(genreDropdown.value);
});

recommendationGenreDropdown.addEventListener("change", () => {
  displayRecommendations(recommendationGenreDropdown.value);
});

// INITIAL LOAD
populateGenreDropdowns();
displayRecommendations();
displayBestsellers();
