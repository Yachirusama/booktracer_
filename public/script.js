const apiKey = "AIzaSyDbodRnX_CoW0P_2ETDwVH2tkX4pTqKGJM";

// Elements
const recommendedContainer = document.getElementById("recommended-books");
const refreshBtn = document.getElementById("refresh-btn");
const genreFilter = document.getElementById("genre-filter");
const sidebarBooks = document.getElementById("sidebar-books");
const searchForm = document.querySelector("form");
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// ---------- RECOMMENDATION ----------
async function fetchRandomBook() {
  try {
    const subject = "fiction";
    const startIndex = Math.floor(Math.random() * 30);
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&startIndex=${startIndex}&maxResults=1&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const book = data.items?.[0];

    if (book) {
      const { title, authors, description, averageRating, imageLinks } = book.volumeInfo;
      recommendedContainer.innerHTML = `
        <div class="book-card">
          <img src="${imageLinks?.thumbnail || ''}" alt="Cover" />
          <h3>${title}</h3>
          <p><strong>Author:</strong> ${authors?.join(", ") || "N/A"}</p>
          <p>${description?.substring(0, 200) || "No description available."}</p>
          <p><strong>Rating:</strong> ${averageRating || "Not rated"}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Recommendation fetch failed:", err);
    recommendedContainer.innerHTML = "<p>Failed to load recommendation.</p>";
  }
}

refreshBtn.addEventListener("click", fetchRandomBook);
window.addEventListener("load", fetchRandomBook);

// ---------- SIDEBAR BESTSELLERS ----------
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

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&key=${apiKey}`);
    const data = await res.json();

    recommendedContainer.innerHTML = data.items?.map((book) => {
      const info = book.volumeInfo;
      return `
        <div class="book-card">
          <img src="${info.imageLinks?.thumbnail || ''}" alt="Cover" />
          <h3>${info.title}</h3>
          <p><strong>Author:</strong> ${info.authors?.join(", ") || "N/A"}</p>
          <p>${info.description?.substring(0, 200) || "No description."}</p>
          <p><strong>Rating:</strong> ${info.averageRating || "Not rated"}</p>
        </div>
      `;
    }).join("") || "<p>No results found.</p>";
  } catch (err) {
    console.error("Search failed:", err);
    recommendedContainer.innerHTML = "<p>Search error occurred.</p>";
  }
});

// ---------- THEME TOGGLE ----------
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeIcon.src = isDark ? "icons/sun.svg" : "icons/moon.svg";
});
