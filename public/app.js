const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const recommendationContainer = document.getElementById("recommendation-list");
const bestsellerList = document.getElementById("bestsellers-list");
const refreshBtn = document.getElementById("refreshBtn");
const resultsList = document.getElementById("results-list");
const genreFilter = document.getElementById("genreFilter");
let currentTheme = "light";

// Load icons
const sunIcon = "sun-icon.svg";
const moonIcon = "moon-icon.svg";

function setTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${theme}-theme`);
  themeToggle.querySelector("img").src = theme === "light" ? moonIcon : sunIcon;
  currentTheme = theme;
  localStorage.setItem("theme", theme);
}

// Theme toggle logic
themeToggle.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
});

// Load stored theme
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

// Fetch bestsellers based on genre
async function fetchBestsellers(genre = "Fiction") {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&orderBy=relevance&maxResults=10`);
  const data = await res.json();
  bestsellerList.innerHTML = "";
  data.items?.forEach(book => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="book-card" onclick="window.open('${book.volumeInfo.infoLink}', '_blank')">
        <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}" />
        <div class="title">${book.volumeInfo.title}</div>
      </div>
    `;
    bestsellerList.appendChild(li);
  });
}

// Fetch genres dynamically
async function populateGenres() {
  const genres = ["Fiction", "Science", "Fantasy", "Mystery", "Romance", "Horror", "Biography"];
  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Refresh recommendations
async function fetchRecommendations() {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=best+books&orderBy=newest&maxResults=5`);
  const data = await res.json();
  recommendationContainer.innerHTML = "";
  data.items?.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.onclick = () => window.open(book.volumeInfo.infoLink, "_blank");
    card.innerHTML = `
      <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}">
      <div class="title">${book.volumeInfo.title}</div>
      <div class="rating">⭐ ${book.volumeInfo.averageRating || "N/A"}</div>
    `;
    recommendationContainer.appendChild(card);
  });
}

// Search books
async function searchBooks(query) {
  const encoded = encodeURIComponent(query);
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&maxResults=20`);
  const data = await res.json();
  resultsList.innerHTML = "";
  data.items?.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card";
    card.onclick = () => window.open(book.volumeInfo.infoLink, "_blank");
    card.innerHTML = `
      <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}">
      <div class="title">${book.volumeInfo.title}</div>
      <div class="rating">⭐ ${book.volumeInfo.averageRating || "N/A"}</div>
    `;
    resultsList.appendChild(card);
  });
}

// Predictive input
searchInput.addEventListener("input", () => {
  const val = searchInput.value.trim();
  if (val.length > 2) searchBooks(val);
});

// Button search
searchBtn.addEventListener("click", () => {
  const val = searchInput.value.trim();
  if (val) searchBooks(val);
});

// Refresh recommendations
refreshBtn.addEventListener("click", fetchRecommendations);

// Genre filter change
genreFilter.addEventListener("change", (e) => {
  fetchBestsellers(e.target.value);
});

// Initial setup
fetchBestsellers();
fetchRecommendations();
populateGenres();
