document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const refreshButton = document.getElementById("refresh-button");
  const backButton = document.getElementById("back-button");
  const genreSelect = document.getElementById("genre-select");
  const recommendedSection = document.getElementById("recommended");
  const resultsGrid = document.getElementById("results");
  const bestsellersList = document.getElementById("bestsellers-list");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  // ----------------- Theme Toggle -----------------
  themeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    themeToggle.innerHTML = body.classList.contains("dark")
      ? '<img src="moon.svg" alt="Dark" class="icon">'
      : '<img src="sun.svg" alt="Light" class="icon">';
  });

  // ----------------- Search Logic -----------------
  async function searchBooks(query) {
    resultsGrid.innerHTML = "";
    recommendedSection.style.display = "none";
    backButton.style.display = "inline";

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
      const data = await res.json();

      if (!data.items) {
        resultsGrid.innerHTML = "<p>No books found.</p>";
        return;
      }

      data.items.forEach(item => {
        const book = item.volumeInfo;
        const card = createBookCard(book);
        resultsGrid.appendChild(card);
      });
    } catch (err) {
      console.error("Search failed:", err);
      resultsGrid.innerHTML = "<p>Failed to load results.</p>";
    }
  }

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) searchBooks(query);
  });

  backButton.addEventListener("click", () => {
    resultsGrid.innerHTML = "";
    backButton.style.display = "none";
    recommendedSection.style.display = "block";
  });

  // ----------------- Book Card Creator -----------------
  function createBookCard(book) {
    const div = document.createElement("div");
    div.className = "book-card";

    const img = document.createElement("img");
    img.src = book.imageLinks?.thumbnail || "https://via.placeholder.com/128x195?text=No+Cover";
    img.alt = book.title;

    const title = document.createElement("div");
    title.className = "book-title";
    title.textContent = book.title;

    const rating = document.createElement("div");
    rating.className = "book-rating";
    rating.textContent = book.averageRating ? `★ ${book.averageRating}` : "No rating";

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(rating);

    return div;
  }

  // ----------------- Load Recommendations -----------------
  async function loadRecommendations() {
    const container = document.getElementById("recommendations");
    container.innerHTML = "";

    try {
      const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=5&orderBy=relevance");
      const data = await res.json();

      data.items.forEach(item => {
        const card = createBookCard(item.volumeInfo);
        container.appendChild(card);
      });
    } catch (err) {
      container.innerHTML = "<p>Failed to load recommendations.</p>";
    }
  }

  refreshButton.addEventListener("click", loadRecommendations);

  // ----------------- Load Top 10 Bestsellers -----------------
  async function loadBestsellers(genre = "") {
    bestsellersList.innerHTML = "";

    const q = genre ? `subject:${genre}` : "bestsellers";
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10`);
      const data = await res.json();

      data.items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.volumeInfo.title;
        bestsellersList.appendChild(li);
      });
    } catch (err) {
      bestsellersList.innerHTML = "<li>Failed to load bestsellers.</li>";
    }
  }

  genreSelect.addEventListener("change", () => {
    const selectedGenre = genreSelect.value;
    loadBestsellers(selectedGenre);
  });

  // ----------------- Populate Genre Dropdown -----------------
  async function loadGenres() {
    try {
      const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=subject&maxResults=40");
      const data = await res.json();

      const genreSet = new Set();

      data.items.forEach(item => {
        const cats = item.volumeInfo.categories || [];
        cats.forEach(cat => genreSet.add(cat));
      });

      const sortedGenres = Array.from(genreSet).sort();
      sortedGenres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load genres:", err);
    }
  }

  // ----------------- Initialize -----------------
  loadGenres();
  loadRecommendations();
  loadBestsellers();
});
