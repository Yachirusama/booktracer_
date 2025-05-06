const recommendationContainer = document.getElementById("recommendations");
const refreshButton = document.getElementById("refresh-btn");
const genreSelect = document.getElementById("genre-filter");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("search-results");
const backButton = document.getElementById("back-btn");

// Random recommendation generator from Google Books API
async function fetchRecommendedBooks(genre = "fiction") {
  const maxResults = 20;
  const startIndex = Math.floor(Math.random() * 30);
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&startIndex=${startIndex}&maxResults=${maxResults}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items || [];

    // Shuffle and pick top 5
    const shuffled = books.sort(() => 0.5 - Math.random()).slice(0, 5);
    displayRecommendedBooks(shuffled);
  } catch (error) {
    console.error("Failed to fetch recommended books:", error);
    recommendationContainer.innerHTML = "<p>Error loading recommendations.</p>";
  }
}

function displayRecommendedBooks(books) {
  recommendationContainer.innerHTML = "";
  books.forEach((book) => {
    const volume = book.volumeInfo;
    const card = document.createElement("div");
    card.className = "book-card";
    card.onclick = () => window.open(volume.infoLink, "_blank");

    const img = document.createElement("img");
    img.src = volume.imageLinks?.thumbnail || "placeholder.png";
    img.alt = volume.title;

    const title = document.createElement("div");
    title.className = "book-card-title";
    title.textContent = volume.title;

    card.appendChild(img);
    card.appendChild(title);
    recommendationContainer.appendChild(card);
  });
}

// Refresh recommendations on click
refreshButton.addEventListener("click", () => {
  const selectedGenre = genreSelect.value || "fiction";
  fetchRecommendedBooks(selectedGenre);
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  fetchRecommendedBooks("fiction");
});

// Optional: Genre filter can change recommendations too
genreSelect.addEventListener("change", () => {
  fetchRecommendedBooks(genreSelect.value);
});

// --- Search functionality (assuming predictive search is required) ---
let searchTimeout = null;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim();
  if (!query) {
    searchResults.style.display = "none";
    backButton.style.display = "none";
    return;
  }

  searchTimeout = setTimeout(() => searchBooks(query), 400);
});

async function searchBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items || [];

    searchResults.innerHTML = "";
    books.forEach((book) => {
      const volume = book.volumeInfo;
      const card = document.createElement("div");
      card.className = "book-card";
      card.onclick = () => window.open(volume.infoLink, "_blank");

      const img = document.createElement("img");
      img.src = volume.imageLinks?.thumbnail || "placeholder.png";
      img.alt = volume.title;

      const title = document.createElement("div");
      title.className = "book-card-title";
      title.textContent = volume.title;

      card.appendChild(img);
      card.appendChild(title);
      searchResults.appendChild(card);
    });

    searchResults.style.display = "flex";
    backButton.style.display = "inline-block";
  } catch (error) {
    console.error("Search failed:", error);
  }
}

// Hide results on back
backButton.addEventListener("click", () => {
  searchInput.value = "";
  searchResults.innerHTML = "";
  searchResults.style.display = "none";
  backButton.style.display = "none";
});
