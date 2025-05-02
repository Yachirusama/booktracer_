let debounceTimer;

// Normalize a string by removing diacritics and converting to lowercase
function normalize(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Hide the recommendation box
function hideRecommendation() {
  const recBox = document.getElementById("recommendedBook");
  if (recBox) recBox.style.display = "none";
}

// Debounced live search
document.getElementById("searchInput").addEventListener("input", () => {
  hideRecommendation();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(performSearch, 500);
});

// Enter key triggers manual search
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    hideRecommendation();
    performSearch();
  }
});

// Manual search button
function searchBooksManual() {
  hideRecommendation();
  performSearch();
}

// Perform the actual search
function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    searchBooks(query);
  } else {
    clearResults();
  }
}

// Fetch and display results from APIs
async function searchBooks(query) {
  const normalizedQuery = normalize(query);
  const resultsContainer = document.getElementById("bookResults");
  resultsContainer.innerHTML = "<p>🔍 Searching for books...</p>";

  let resultsFound = false;

  try {
    const [itbook, google, openlib] = await Promise.all([
      fetch(`https://api.itbook.store/1.0/search/${encodeURIComponent(normalizedQuery)}`).then(res => res.json()),
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(normalizedQuery)}`).then(res => res.json()),
      fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(normalizedQuery)}`).then(res => res.json())
    ]);

    resultsContainer.innerHTML = "";
    document.querySelector(".back-button").classList.remove("hidden");

    if (itbook.books?.length) {
      resultsFound = true;
      itbook.books.forEach(book => {
        resultsContainer.appendChild(createBookCard(
          book.image || "https://via.placeholder.com/150",
          book.title,
          book.subtitle,
          book.url
        ));
      });
    }

    if (google.items?.length) {
      resultsFound = true;
      google.items.forEach(book => {
        const info = book.volumeInfo;
        resultsContainer.appendChild(createBookCard(
          info.imageLinks?.thumbnail || "https://via.placeholder.com/150",
          info.title,
          info.authors?.join(", ") || "Unknown Author",
          info.infoLink
        ));
      });
    }

    if (openlib.docs?.length) {
      const topBooks = openlib.docs.slice(0, 10);
      if (topBooks.length) resultsFound = true;
      topBooks.forEach(book => {
        resultsContainer.appendChild(createBookCard(
          book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : "https://via.placeholder.com/150",
          book.title,
          book.author_name?.join(", ") || "Unknown Author",
          `https://openlibrary.org${book.key}`
        ));
      });
    }

    if (!resultsFound) {
      resultsContainer.innerHTML = "<p>📭 No books found. Try another search.</p>";
    }
  } catch (err) {
    console.error("Search error:", err);
    resultsContainer.innerHTML = "<p>❌ Failed to load books. Please try again.</p>";
  }
}

// Create a book card element
function createBookCard(image, title, subtitle, link) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.innerHTML = `
    <a href="${link}" target="_blank">
      <img src="${image}" alt="${title}">
    </a>
    <h3>${title}</h3>
    <p>${subtitle || "No description available."}</p>
    <a href="${link}" target="_blank">View Details</a>
  `;
  return card;
}

// Clear book results
function clearResults() {
  document.getElementById("bookResults").innerHTML = "";
  document.querySelector(".back-button").classList.add("hidden");
}

// Reset search UI
function goBack() {
  clearResults();
  document.getElementById("searchInput").value = "";
  const recBox = document.getElementById("recommendedBook");
  if (recBox) recBox.style.display = "block";
}

// Load a random recommended book with short description and rating
async function loadRandomRecommendation() {
  const box = document.getElementById("recommendedBook");
  if (!box) return;

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=40&timestamp=${Date.now()}`);
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
      : "<p><strong>Rating:</strong> Not available</p>";

    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <div class="recommendation-box-content">
        <img src="${info.imageLinks?.thumbnail || "https://via.placeholder.com/100"}" alt="Cover" />
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
    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <p>⚠️ Could not load recommendation.</p>
    `;
  }
}

// Handle offline banner
function createOfflineBanner() {
  let banner = document.getElementById("offlineBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "offlineBanner";
    banner.className = "offline-banner";

    banner.innerHTML = `
      <span>⚠️ You are offline. Some features may not be available.</span>
      <span id="closeBanner" style="margin-left: 15px; cursor: pointer;">❌</span>
    `;
    document.body.appendChild(banner);

    document.getElementById("closeBanner").onclick = () => {
      banner.style.display = "none";
    };
  }
}

function updateOfflineBanner() {
  const banner = document.getElementById("offlineBanner");
  if (banner) {
    banner.style.display = navigator.onLine ? "none" : "flex";
  }
}

// Dark mode handling
function setupDarkMode() {
  const savedTheme = localStorage.getItem("theme");
  const toggle = document.getElementById("darkModeToggle");
  const icon = document.getElementById("themeIcon");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    toggle?.setAttribute("checked", "true");
    if (icon) icon.textContent = "🌙";
  }

  toggle?.addEventListener("change", () => {
    const isDark = toggle.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (icon) icon.textContent = isDark ? "🌙" : "🌞";
  });
}

// Initialize everything on page load
window.addEventListener("DOMContentLoaded", () => {
  createOfflineBanner();
  updateOfflineBanner();
  loadRandomRecommendation();
  setupDarkMode();
});

window.addEventListener("online", updateOfflineBanner);
window.addEventListener("offline", updateOfflineBanner);
