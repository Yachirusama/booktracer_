// ✅ Utility: Get safe image URL
function getSafeImageLink(imageLinks) {
  const raw = imageLinks?.thumbnail || imageLinks?.smallThumbnail || "";
  if (!raw) return "https://via.placeholder.com/100";
  return raw.replace(/^http:\/\//i, "https://");
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
    if (toggle.checked) {
      body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
}

// 📘 Load a random recommended book
async function loadRandomRecommendation() {
  const box = document.getElementById("recommendedBook");
  if (!box) return;

  const keywords = ["fiction", "classic", "bestseller", "history", "science", "mystery", "fantasy"];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${randomKeyword}&maxResults=40`);
    const data = await res.json();
    if (!data.items?.length) throw new Error("No books found");

    const random = data.items[Math.floor(Math.random() * data.items.length)];
    const info = random.volumeInfo;

    const plainDesc = info.description?.replace(/<\/?[^>]+(>|$)/g, "");
    const description = plainDesc
      ? plainDesc.slice(0, 100) + (plainDesc.length > 100 ? "..." : "")
      : "No description available.";

    const rating = info.averageRating
      ? `<p><strong>Rating:</strong> ${info.averageRating} ⭐ (${info.ratingsCount || 0} ratings)</p>`
      : "<p><strong>Rating:</strong> Not rated</p>";

    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <div class="recommendation-box-content">
        <img src="${getSafeImageLink(info.imageLinks)}" alt="Book cover" />
        <div class="recommendation-text">
          <p><strong>Title:</strong> ${info.title}</p>
          <p><strong>Author:</strong> ${info.authors?.join(", ") || "Unknown Author"}</p>
          ${rating}
          <p><strong>Description:</strong> ${description}</p>
          <p><a href="${info.infoLink}" target="_blank">More Info</a></p>
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
    if (!data.items?.length) throw new Error("No sidebar books");

    sidebar.innerHTML = data.items.map(book => {
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
  if (!query) {
    query = document.getElementById("searchInput").value.trim();
  }

  const resultsContainer = document.getElementById("bookResults");
  const backButton = document.querySelector(".back-button");

  if (!query) {
    resultsContainer.innerHTML = "";
    backButton.classList.add("hidden");
    return;
  }

  backButton.classList.remove("hidden");
  resultsContainer.innerHTML = "<p>🔎 Searching...</p>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultsContainer.innerHTML = "<p>❌ No results found.</p>";
      return;
    }

    resultsContainer.innerHTML = data.items.map(item => {
      const info = item.volumeInfo;
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
    resultsContainer.innerHTML = "<p>⚠️ An error occurred while searching.</p>";
  }
}

// ⬅️ Go back to initial state
function goBack() {
  document.getElementById("bookResults").innerHTML = "";
  document.querySelector(".back-button").classList.add("hidden");
  document.getElementById("searchInput").value = "";
}

// 👂 Debounced live search
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const searchInputField = document.getElementById("searchInput");
const debouncedSearch = debounce(() => {
  const query = searchInputField.value.trim();
  if (query.length > 0) {
    searchBooksManual(query);
  } else {
    document.getElementById("bookResults").innerHTML = "";
  }
}, 400);

searchInputField.addEventListener("input", debouncedSearch);

// 🚀 Init
window.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  loadRandomRecommendation();
  loadSidebarBooks();
});
