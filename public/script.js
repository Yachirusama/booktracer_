const apiKey = "YOUR_API_KEY_HERE"; // Replace with your real key

// Elements
const recommendedContainer = document.getElementById("recommended-books");
const refreshBtn = document.getElementById("refresh-btn");
const genreFilter = document.getElementById("genre-filter");
const sidebarBooks = document.getElementById("sidebar-books");
const searchForm = document.querySelector("form");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const loader = document.getElementById("loader");

// Utility to show loader
function showLoader() {
  loader.style.display = "block";
  recommendedContainer.innerHTML = "";
}

// Utility to hide loader
function hideLoader() {
  loader.style.display = "none";
}

// ---------- RECOMMENDATIONS ----------
async function fetchRecommendedBooks() {
  showLoader();
  try {
    const subject = "fiction";
    const startIndex = Math.floor(Math.random() * 20);
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&startIndex=${startIndex}&maxResults=5&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const books = data.items || [];

    recommendedContainer.innerHTML = books.map((book) => {
      const { title, authors, description, averageRating, imageLinks } = book.volumeInfo;
      return `
        <div class="book-card" data-description="${description?.substring(0, 150) || "No description"}">
          <img src="${imageLinks?.thumbnail || ''}" alt="Cover" />
          <div>
            <h3>${title}</h3>
            <p><strong>Author:</strong> ${authors?.join(", ") || "N/A"}</p>
            <p><strong>Rating:</strong> ${averageRating || "Not rated"}</p>
          </div>
        </div>
      `;
    }).join("") || "<p>No recommendations available.</p>";
  } catch (err) {
    console.error("Recommendation fetch failed:", err);
    recommendedContainer.innerHTML = "<p>Failed to load recommendations.</p>";
  } finally {
    hideLoader();
  }
}

refreshBtn.addEventListener("click", fetchRecommendedBooks);
window.addEventListener("load", fetchRecommendedBooks);

// ---------- SIDEBAR ----------
async function fetchSidebarBooks(genre = "All") {
  try {
    let query = "bestseller";
    if (genre !== "All") query += `+subject:${genre}`;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    sidebarBooks.innerHTML = data.items?.map((book) => {
      const info = book.volumeInfo;
      return `
        <div class="sidebar-book">
          <img src="${info.imageLinks?.thumbnail || ''}" alt="Cover" />
          <div>
            <h4>${info.title}</h4>
            <p>${info.authors?.[0] || "Unknown"}</p>
          </div>
        </div>
      `;
    }).join("") || "<p>No books found.</p>";
  } catch (err) {
    console.error("Sidebar fetch failed:", err);
    sidebarBooks.innerHTML = "<p>Error loading books.</p>";
  }
}

genreFilter.addEventListener("change", () => {
  fetchSidebarBooks(genreFilter.value);
});
window.addEventListener("load", () => fetchSidebarBooks());

// ---------- SEARCH ----------
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = e.target.search.value.trim();
  if (!query) return;

  showLoader();
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&key=${apiKey}`);
    const data = await res.json();

    recommendedContainer.innerHTML = data.items?.map((book) => {
      const info = book.volumeInfo;
      return `
        <div class="book-card" data-description="${info.description?.substring(0, 150) || "No description"}">
          <img src="${info.imageLinks?.thumbnail || ''}" alt="Cover" />
          <div>
            <h3>${info.title}</h3>
            <p><strong>Author:</strong> ${info.authors?.join(", ") || "N/A"}</p>
            <p><strong>Rating:</strong> ${info.averageRating || "Not rated"}</p>
          </div>
        </div>
      `;
    }).join("") || "<p>No results found.</p>";
  } catch (err) {
    console.error("Search failed:", err);
    recommendedContainer.innerHTML = "<p>Search error occurred.</p>";
  } finally {
    hideLoader();
  }
});

// ---------- THEME TOGGLE ----------
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeIcon.src = isDark ? "icons/sun.svg" : "icons/moon.svg";
});
