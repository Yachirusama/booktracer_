// ✅ Safe image link fallback
function getSafeImageLink(imageLinks) {
  const raw = imageLinks?.thumbnail || imageLinks?.smallThumbnail || "";
  return raw ? raw.replace(/^http:\/\//, "https://") : "https://via.placeholder.com/100x150?text=No+Cover";
}

// 🌍 Load top 10 bestsellers by genre
async function loadTopBooks(genre = "bestsellers") {
  const list = document.getElementById("topBooksList");
  list.innerHTML = "<li>Loading...</li>";
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${genre}&maxResults=10`);
    const data = await res.json();
    const books = data.items || [];

    if (!books.length) throw new Error("No top books");

    list.innerHTML = books.map((book, i) => {
      const info = book.volumeInfo;
      const link = info.infoLink || "#";
      return `
        <li>
          <span class="book-rank">${i + 1}</span>
          <a href="${link}" target="_blank">
            <img src="${getSafeImageLink(info.imageLinks)}" alt="Cover" />
          </a>
          <a href="${link}" target="_blank">${info.title?.slice(0, 30) || "Untitled"}</a>
        </li>
      `;
    }).join("");
  } catch (err) {
    console.error("Top books error:", err);
    list.innerHTML = "<li>⚠️ Could not load top books.</li>";
  }
}

// 📘 Load 3 random recommended books
async function loadRecommendations() {
  const section = document.getElementById("recommended-section");
  section.innerHTML = "<p>Loading recommendations...</p>";

  const keywords = ["fiction", "classic", "history", "science", "mystery", "fantasy"];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&maxResults=20`);
    const data = await res.json();
    const books = data.items || [];

    if (!books.length) throw new Error("No recommended books");

    const selected = books.sort(() => 0.5 - Math.random()).slice(0, 3);

    section.innerHTML = `
      <h3>📘 Recommended Books</h3>
      <div class="book-grid">
        ${selected.map(book => {
          const info = book.volumeInfo;
          const rating = info.averageRating
            ? `<div class="book-rating">⭐ ${info.averageRating} (${info.ratingsCount || 0})</div>`
            : `<div class="book-rating">Not rated</div>`;
          return `
            <div class="book-item">
              <img src="${getSafeImageLink(info.imageLinks)}" alt="Cover" />
              <div class="book-title">${info.title || "No Title"}</div>
              <div class="book-description">${(info.description || "No description").slice(0, 100)}...</div>
              ${rating}
              <a href="${info.infoLink}" target="_blank">More Info</a>
            </div>
          `;
        }).join("")}
      </div>
      <button id="refreshRecommendations">🔄 Refresh Recommendations</button>
    `;

    document.getElementById("refreshRecommendations").onclick = loadRecommendations;
  } catch (err) {
    console.error("Recommendation error:", err);
    section.innerHTML = "<p>⚠️ Could not load recommendations.</p>";
  }
}

// 🔍 Search books manually
async function searchBooksManual() {
  const query = document.getElementById("searchInput").value.trim();
  const section = document.getElementById("search-results");
  const backBtn = document.getElementById("backBtn");
  section.innerHTML = "";
  backBtn.classList.add("hidden");

  if (!query) return;

  section.innerHTML = "<p>🔎 Searching...</p>";
  backBtn.classList.remove("hidden");

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
    const data = await res.json();
    const books = data.items || [];

    if (!books.length) {
      section.innerHTML = "<p>❌ No books found.</p>";
      return;
    }

    section.innerHTML = `
      <h3>📖 Search Results</h3>
      <div class="book-grid">
        ${books.map(book => {
          const info = book.volumeInfo;
          return `
            <div class="book-item">
              <img src="${getSafeImageLink(info.imageLinks)}" alt="Cover" />
              <div class="book-title">${info.title || "No Title"}</div>
              <div class="book-description">${(info.description || "No description").slice(0, 100)}...</div>
              <a href="${info.infoLink}" target="_blank">View Book</a>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } catch (err) {
    console.error("Search error:", err);
    section.innerHTML = "<p>⚠️ An error occurred during search.</p>";
  }
}

// ⬅️ Go back from search
function goBack() {
  document.getElementById("search-results").innerHTML = "";
  document.getElementById("searchInput").value = "";
  document.getElementById("backBtn").classList.add("hidden");
}

// 🎯 Load genre filter options dynamically
async function loadGenres() {
  const genres = ["bestsellers", "fiction", "fantasy", "mystery", "romance", "science", "history"];
  const filter = document.getElementById("genreFilter");
  filter.innerHTML = genres.map(g => `<option value="${g}">${g[0].toUpperCase() + g.slice(1)}</option>`).join("");
  filter.addEventListener("change", () => loadTopBooks(filter.value));
}

// 🚀 Init
window.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadTopBooks();
  loadRecommendations();

  document.getElementById("searchBtn").addEventListener("click", searchBooksManual);
  document.getElementById("backBtn").addEventListener("click", goBack);
});
