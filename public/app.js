const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const refreshBtn = document.getElementById("refresh-btn");
const searchBtn = document.getElementById("search-btn");
const themeToggle = document.getElementById("theme-toggle");
const recommendedSection = document.getElementById("recommended");
const bestsellersList = document.getElementById("bestsellers");
const genreSelect = document.getElementById("genre-select");

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.classList.toggle("dark");
});

// Live search on input
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query === "") {
    searchResults.style.display = "none";
    searchResults.innerHTML = "";
    return;
  }
  searchBooks(query);
});

// Search button click
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") {
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
      const title = book.volumeInfo.title || "No title";
      const author = (book.volumeInfo.authors || ["Unknown"]).join(", ");
      const img = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x193";
      const link = book.volumeInfo.infoLink || "#";

      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <img src="${img}" alt="${title}">
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>
      `;
      div.onclick = () => window.open(link, "_blank");
      searchResults.appendChild(div);
    });
    searchResults.style.display = "flex";
  } else {
    searchResults.style.display = "none";
  }
}

// Load recommended books
async function loadRecommendedBooks() {
  const keywords = ["fiction", "adventure", "fantasy", "history", "science"];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${randomKeyword}&maxResults=6&orderBy=newest`;
  const res = await fetch(url);
  const data = await res.json();
  recommendedSection.innerHTML = "";
  if (data.items) {
    data.items.forEach((book) => {
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
      recommendedSection.appendChild(div);
    });
  }
}
refreshBtn.addEventListener("click", loadRecommendedBooks);

// Load bestsellers based on genre
async function loadBestsellers(genre = "fiction") {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10&orderBy=relevance`;
  const res = await fetch(url);
  const data = await res.json();
  bestsellersList.innerHTML = "";
  if (data.items) {
    data.items.forEach((book) => {
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
      bestsellersList.appendChild(div);
    });
  }
}

// Load all genres to genreSelect
function populateGenres() {
  const genres = [
    "fiction", "nonfiction", "history", "biography", "mystery", "romance", "fantasy",
    "science", "technology", "philosophy", "self-help", "children", "comics", "poetry",
    "religion", "horror", "drama", "adventure", "education"
  ];
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreSelect.appendChild(option);
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
