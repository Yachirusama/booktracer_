const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const refreshBtn = document.getElementById("refresh-btn");
const themeToggle = document.getElementById("theme-toggle");
const recommendedSection = document.getElementById("recommended");
const bestsellersList = document.getElementById("bestsellers");
const genreSelect = document.getElementById("genre-select");
const searchBtn = document.getElementById("search-btn");

// Toggle Theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.classList.toggle("dark");
});

// Live Search (with search button)
async function performSearch(query) {
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

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query === "") {
    searchResults.style.display = "none";
    searchResults.innerHTML = "";
    return;
  }
  performSearch(query);
});

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") {
    performSearch(query);
  }
});

// Load Recommended Books (Changes on every refresh)
async function loadRecommendedBooks() {
  const randomQuery = `bestseller+${Math.floor(Math.random() * 10000)}`;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${randomQuery}&maxResults=6`);
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

// Load Bestsellers by Genre
async function loadBestsellers(genre = "Fiction") {
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&maxResults=10&orderBy=relevance`;
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

genreSelect.addEventListener("change", (e) => {
  loadBestsellers(e.target.value);
});

// Populate Genre List
function populateGenres() {
  const genres = [
    "Fiction", "Nonfiction", "Mystery", "Fantasy", "Science Fiction", "Romance", "Thriller",
    "History", "Biography", "Poetry", "Comics", "Graphic Novels", "Young Adult", "Children",
    "Self-help", "Health", "Travel", "Science", "Religion", "Art", "Business", "Technology", "Education"
  ];
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
}

// Initial Load
window.addEventListener("DOMContentLoaded", () => {
  populateGenres();
  loadRecommendedBooks();
  loadBestsellers();
});
