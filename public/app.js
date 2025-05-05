const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const refreshBtn = document.getElementById("refresh-btn");
const themeToggle = document.getElementById("theme-toggle");
const recommendedSection = document.getElementById("recommended");
const bestsellersList = document.getElementById("bestsellers");
const genreSelect = document.getElementById("genre-select");
const searchBtn = document.getElementById("search-btn");

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Search button click
searchBtn.addEventListener("click", () => {
  searchBooks(searchInput.value.trim());
});

// Search input live
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query === "") {
    searchResults.style.display = "none";
    searchResults.innerHTML = "";
  } else {
    searchBooks(query);
  }
});

async function searchBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  const res = await fetch(url);
  const data = await res.json();

  searchResults.innerHTML = "";
  if (data.items) {
    data.items.forEach((book) => {
      const card = createBookCard(book);
      searchResults.appendChild(card);
    });
    searchResults.style.display = "flex";
  } else {
    searchResults.style.display = "none";
  }
}

// Create clickable book card
function createBookCard(book) {
  const title = book.volumeInfo.title || "No title";
  const author = (book.volumeInfo.authors || ["Unknown"]).join(", ");
  const rating = book.volumeInfo.averageRating || "N/A";
  const img = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x193";
  const link = book.volumeInfo.infoLink || "#";

  const div = document.createElement("div");
  div.className = "book-card";
  div.innerHTML = `
    <img src="${img}" alt="${title}">
    <div class="book-title">${title}</div>
    <div class="book-author">${author}</div>
    <div class="book-rating">⭐ ${rating}</div>
  `;
  div.onclick = () => window.open(link, "_blank");
  return div;
}

// Load recommended books
async function loadRecommendedBooks() {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=6&orderBy=newest`);
  const data = await res.json();
  recommendedSection.innerHTML = "";
  data.items.forEach((book) => {
    const card = createBookCard(book);
    recommendedSection.appendChild(card);
  });
}
refreshBtn.addEventListener("click", loadRecommendedBooks);

// Load bestsellers per genre
async function loadBestsellers(genre = "fiction") {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10&orderBy=relevance`;
  const res = await fetch(url);
  const data = await res.json();
  bestsellersList.innerHTML = "";
  data.items.forEach((book) => {
    const card = createBookCard(book);
    bestsellersList.appendChild(card);
  });
}

// Load all genre options
async function populateGenres() {
  const genres = [
    "fiction", "nonfiction", "science", "technology", "romance", "fantasy",
    "history", "mystery", "biography", "comics", "art", "cooking",
    "education", "sports", "travel", "religion", "health", "music"
  ];

  genreSelect.innerHTML = "";
  genres.forEach((genre) => {
    const opt = document.createElement("option");
    opt.value = genre;
    opt.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreSelect.appendChild(opt);
  });
}
genreSelect.addEventListener("change", (e) => {
  loadBestsellers(e.target.value);
});

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
  populateGenres();
  loadRecommendedBooks();
  loadBestsellers();
});
