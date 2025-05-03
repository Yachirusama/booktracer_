// ✅ Utility: Get secure image URL or fallback
function getSafeImageLink(imageLinks) {
  const raw = imageLinks?.thumbnail || imageLinks?.smallThumbnail || "";
  return raw ? raw.replace(/^http:\/\//i, "https://") : "https://via.placeholder.com/100";
}

// 🌙 Theme Toggle
function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const body = document.body;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark");
    toggle.checked = true;
  }

  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// 📘 Load random recommended book
async function loadRandomRecommendation() {
  const box = document.getElementById("recommendedBook");
  if (!box) return;

  const keywords = ["fiction", "classic", "bestseller", "history", "science", "mystery", "fantasy"];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${keyword}&maxResults=40`);
    const data = await res.json();
    const books = data.items || [];
    if (!books.length) throw new Error("No books found");

    const book = books[Math.floor(Math.random() * books.length)].volumeInfo;
    const description = book.description
      ? book.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 100) + "..."
      : "No description available.";
    const rating = book.averageRating
      ? `<p><strong>Rating:</strong> ${book.averageRating} ⭐ (${book.ratingsCount || 0} ratings)</p>`
      : "<p><strong>Rating:</strong> Not rated</p>";

    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <div class="recommendation-box-content">
        <img src="${getSafeImageLink(book.imageLinks)}" alt="Book cover" />
        <div class="recommendation-text">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.authors?.join(", ") || "Unknown Author"}</p>
          ${rating}
          <p><strong>Description:</strong> ${description}</p>
          <p><a href="${book.infoLink}" target="_blank" rel="noopener noreferrer">More Info</a></p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Recommendation error:", err);
    box.innerHTML = `<h3>📘 Recommended Book</h3><p>⚠️ Could not load recommendation.</p>`;
  }
}

// 📚 Load sidebar books (top 5 from "bestsellers")
async function loadSidebarBooks() {
  const sidebar = document.getElementById("leftSidebar");
  if (!sidebar) return;

  try {
    const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=5");
    const data = await res.json();
    const books = data.items || [];
    if (!books.length) throw new Error("No sidebar books");

    sidebar.innerHTML = books.map(book => {
      const info = book.volumeInfo;
      return `
        <div class="sidebar-book">
          <img src="${getSafeImageLink(info.imageLinks)}" alt="Cover">
          <p>${info.title?.slice(0, 25) || "Untitled"}</p>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Sidebar error:", err);
    sidebar.innerHTML = "<p>⚠️ Could not load sidebar books.</p>";
  }
}

// 🔍 Manual search
async function searchBooksManual(query = null) {
  query ??= document.getElementById("searchInput").value.trim();

  const results = document.getElementById("bookResults");
  const backBtn = document.querySelector(".back-button");

  if (!query) {
    results.innerHTML = "";
    backBtn.classList.add("hidden");
    return;
  }

  backBtn.classList.remove("hidden");
  results.innerHTML = "<p>🔎 Searching...</p>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();
    const books = data.items || [];

    if (!books.length) {
      results.innerHTML = "<p>❌ No results found.</p>";
      return;
    }

    results.innerHTML = books.map(book => {
      const info = book.volumeInfo;
      const title = info.title || "No title";
      const authors = info.authors?.join(", ") || "Unknown author";
      const thumbnail = getSafeImageLink(info.imageLinks);
      const infoLink = info.infoLink || "#";
      const shortDesc = info.description
        ? info.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 100) + "..."
        : "No description available.";

      return `
        <div class="book-card">
          <img src="${thumbnail}" alt="Book cover">
          <div class="book-info">
            <h4>${title}</h4>
            <p><strong>Author:</strong> ${authors}</p>
            <p>${shortDesc}</p>
            <a href="${infoLink}" target="_blank" rel="noopener noreferrer">View Book</a>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Search error:", err);
    results.innerHTML = "<p>⚠️ An error occurred while searching.</p>";
  }
}

// ⬅️ Clear search results
function goBack() {
  document.getElementById("bookResults").innerHTML = "";
  document.querySelector(".back-button").classList.add("hidden");
  document.getElementById("searchInput").value = "";
}

// 🔁 Debounced search helper
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// 🔍 Setup search input event
const searchInput = document.getElementById("searchInput");
const debouncedSearch = debounce(() => {
  const query = searchInput.value.trim();
  if (query) {
    searchBooksManual(query);
  } else {
    document.getElementById("bookResults").innerHTML = "";
  }
}, 400);

searchInput.addEventListener("input", debouncedSearch);

// 🚀 Init all on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  loadRandomRecommendation();
  loadSidebarBooks();
});
