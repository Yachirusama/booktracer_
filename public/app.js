const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const recommendationsEl = document.getElementById("recommendations");
const searchResultsSection = document.getElementById("searchResultsSection");
const recommendationsSection = document.getElementById("recommendationsSection");
const searchResultsEl = document.getElementById("searchResults");
const genreFilterSidebar = document.getElementById("genreFilterSidebar");
const genreFilterRecommendation = document.getElementById("genreFilterRecommendation");
const bestsellerList = document.getElementById("bestsellerList");

const themeToggle = document.getElementById("themeToggle");
const sunIcon = themeToggle.querySelector(".sun-icon");
const moonIcon = themeToggle.querySelector(".moon-icon");

const bestsellerTitles = [
  "Atomic Habits", "The Silent Patient", "The Midnight Library",
  "The Four Agreements", "Verity", "It Ends with Us",
  "The Subtle Art of Not Giving a F*ck", "The Alchemist",
  "Where the Crawdads Sing", "Educated"
];

// ----- Theme Toggle -----
function setTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  sunIcon.style.display = isDark ? "none" : "block";
  moonIcon.style.display = isDark ? "block" : "none";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-theme");
  setTheme(isDark);
});

// Apply saved theme
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme === "dark");
  fetchGenres();
  loadRecommendations();
  loadBestsellers();
});

// ----- Search -----
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    performSearch(query);
    backBtn.style.display = "inline-block";
    recommendationsSection.style.display = "none";
    searchResultsSection.style.display = "block";
  } else {
    searchResultsEl.innerHTML = "";
    recommendationsSection.style.display = "block";
    searchResultsSection.style.display = "none";
    backBtn.style.display = "none";
  }
});

searchBtn.addEventListener("click", () => {
  if (searchInput.value.trim()) {
    performSearch(searchInput.value.trim());
  }
});

backBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchResultsEl.innerHTML = "";
  backBtn.style.display = "none";
  recommendationsSection.style.display = "block";
  searchResultsSection.style.display = "none";
});

// ----- Search Books -----
async function performSearch(query) {
  const encodedQuery = encodeURIComponent(query);
  const googleAPI = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}`;
  const res = await fetch(googleAPI);
  const data = await res.json();
  const books = data.items || [];
  displayBooks(books, searchResultsEl);
}

// ----- Load Recommendations -----
refreshBtn.addEventListener("click", loadRecommendations);

async function loadRecommendations() {
  const genre = genreFilterRecommendation.value;
  const query = genre ? `subject:${genre}` : "bestseller";
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
  const data = await res.json();
  const books = data.items || [];
  recommendationsEl.innerHTML = "";
  displayBooks(books, recommendationsEl);
}

// ----- Load Bestsellers with Covers -----
async function loadBestsellers() {
  bestsellerList.innerHTML = "";
  const genre = genreFilterSidebar.value;
  for (const title of bestsellerTitles) {
    const query = genre ? `${title} subject:${genre}` : title;
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
    const data = await res.json();
    const book = data.items?.[0];
    if (book) {
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}">
        <span>${book.volumeInfo.title}</span>
      `;
      li.addEventListener("click", () => {
        window.open(book.volumeInfo.infoLink, "_blank");
      });
      bestsellerList.appendChild(li);
    }
  }
}

// ----- Genre Filters -----
async function fetchGenres() {
  const genres = [
    "Fiction", "Nonfiction", "Fantasy", "Mystery", "Romance",
    "Science", "Technology", "Biography", "History", "Self-help",
    "Business", "Health", "Religion", "Science Fiction", "Horror"
  ];
  for (const genre of genres) {
    const option1 = document.createElement("option");
    option1.value = genre;
    option1.textContent = genre;
    genreFilterSidebar.appendChild(option1);

    const option2 = option1.cloneNode(true);
    genreFilterRecommendation.appendChild(option2);
  }

  genreFilterSidebar.addEventListener("change", loadBestsellers);
  genreFilterRecommendation.addEventListener("change", loadRecommendations);
}

// ----- Display Book Cards -----
function displayBooks(books, container) {
  container.innerHTML = "";
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
      <h3>${info.title}</h3>
      <p>⭐ ${info.averageRating || 'N/A'}</p>
    `;
    card.addEventListener("click", () => {
      window.open(info.infoLink, "_blank");
    });
    container.appendChild(card);
  });
}
