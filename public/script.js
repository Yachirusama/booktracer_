const recommendedBookSection = document.getElementById("recommendedBook");
const bookResults = document.getElementById("bookResults");
const backButton = document.querySelector(".back-button");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const topBooksList = document.getElementById("topBooksList");
const genreSelect = document.getElementById("genreSelect");

document.addEventListener("DOMContentLoaded", () => {
  loadRecommendations();
  loadGenres();
  loadTopBooks("All");
  setupThemeToggle();
});

function setupThemeToggle() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark ? "dark" : "light");
  });
}

function updateThemeIcon(mode) {
  themeIcon.src = mode === "dark" ? "icons/moon.svg" : "icons/sun.svg";
  themeIcon.alt = mode === "dark" ? "Dark Mode" : "Light Mode";
}

function loadRecommendations() {
  recommendedBookSection.innerHTML = "<h3>📘 Recommended Books</h3>";
  fetch(`https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=3`)
    .then(res => res.json())
    .then(data => {
      if (data.items) {
        data.items.forEach(book => {
          const info = book.volumeInfo;
          recommendedBookSection.innerHTML += `
            <div class="book-card">
              <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
              <h4>${info.title}</h4>
              <p>${info.description?.slice(0, 100) || "No description."}</p>
              <div class="rating">Rating: ${info.averageRating || "N/A"}</div>
            </div>
          `;
        });
        recommendedBookSection.innerHTML += `<button onclick="loadRecommendations()">🔄 Refresh</button>`;
      }
    });
}

function searchBooksManual() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`)
    .then(res => res.json())
    .then(data => {
      bookResults.innerHTML = "";
      if (data.items) {
        data.items.forEach(book => {
          const info = book.volumeInfo;
          bookResults.innerHTML += `
            <div class="book-card">
              <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
              <h4>${info.title}</h4>
              <p>${info.description?.slice(0, 100) || "No description."}</p>
              <div class="rating">Rating: ${info.averageRating || "N/A"}</div>
              <a href="${info.previewLink}" target="_blank">Preview</a>
            </div>
          `;
        });
        backButton.classList.remove("hidden");
        recommendedBookSection.style.display = "none";
      } else {
        bookResults.innerHTML = "<p>No results found.</p>";
      }
    });
}

function goBack() {
  bookResults.innerHTML = "";
  recommendedBookSection.style.display = "block";
  backButton.classList.add("hidden");
}

function loadGenres() {
  const genres = ["All", "Fiction", "Romance", "Mystery", "Fantasy", "Science", "History", "Biography"];
  genres.forEach(g => {
    const option = document.createElement("option");
    option.value = g;
    option.textContent = g;
    genreSelect.appendChild(option);
  });
  genreSelect.addEventListener("change", () => loadTopBooks(genreSelect.value));
}

function loadTopBooks(genre) {
  const query = genre === "All" ? "bestseller" : `bestseller+${genre}`;
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`)
    .then(res => res.json())
    .then(data => {
      topBooksList.innerHTML = "";
      if (data.items) {
        data.items.forEach((book, index) => {
          const info = book.volumeInfo;
          const listItem = document.createElement("li");
          listItem.classList.add("book-item");
          listItem.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}" />
            <span>${info.title}</span>
          `;
          listItem.addEventListener("click", () => {
            document.getElementById("searchInput").value = info.title;
            searchBooksManual();
          });
          topBooksList.appendChild(listItem);
        });
      }
    });
}
