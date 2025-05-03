document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const refreshBtn = document.getElementById("refreshBtn");
  const recommendationsList = document.getElementById("recommendations");
  const backButton = document.getElementById("backButton");
  const themeToggle = document.getElementById("themeToggle");

  // Load initial data
  fetchRecommendations();
  fetchTopBestsellers();

  // Event Listeners
  refreshBtn.addEventListener("click", fetchRecommendations);
  searchInput.addEventListener("input", liveSearch);
  searchButton.addEventListener("click", performSearch);
  backButton.addEventListener("click", () => {
    searchInput.value = "";
    backButton.classList.add("hidden");
    fetchRecommendations();
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
  });

  // Functions
  async function fetchRecommendations() {
    const query = "bestseller";
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items);
    backButton.classList.add("hidden");
  }

  async function fetchTopBestsellers() {
    const list = document.getElementById("bestsellerList");
    const response = await fetch("https://www.googleapis.com/books/v1/volumes?q=subject:bestseller&maxResults=10");
    const data = await response.json();
    list.innerHTML = data.items.map(book => {
      const info = book.volumeInfo;
      return `
        <li>
          <img src="${info.imageLinks?.thumbnail || ''}" alt="Cover" />
          <div>
            <strong>${info.title}</strong><br/>
            <span>${info.authors ? info.authors.join(", ") : "Unknown Author"}</span>
          </div>
        </li>`;
    }).join("");
  }

  async function liveSearch() {
    const query = searchInput.value.trim();
    if (query === "") {
      fetchRecommendations();
      return;
    }

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items || []);
    backButton.classList.remove("hidden");
  }

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items || []);
    backButton.classList.remove("hidden");
  }

  function displayBooks(books) {
    if (!books || books.length === 0) {
      recommendationsList.innerHTML = "<li>No recommendations available.</li>";
      return;
    }

    recommendationsList.innerHTML = books.map(book => {
      const info = book.volumeInfo;
      const rating = info.averageRating ? `⭐ ${info.averageRating}` : "No rating";
      return `
        <li>
          <strong>${info.title}</strong><br/>
          <span class="rating">${rating}</span>
        </li>`;
    }).join("");
  }
});
