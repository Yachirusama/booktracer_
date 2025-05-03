const themeToggleBtn = document.getElementById("themeToggle");
const body = document.body;
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refreshBtn");
const recommendationsSection = document.getElementById("recommendations");
const bookListContainer = document.getElementById("bookList");
const genreFilter = document.getElementById("genreFilter");

let recommendedBooks = [];
let originalContentHTML = "";

// Toggle theme
themeToggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  themeToggleBtn.src = body.classList.contains("dark")
    ? "icons/moon.svg"
    : "icons/sun.svg";
});

// Fetch book data from Google Books API
async function fetchBooks(query, maxResults = 10) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}`
  );
  const data = await res.json();
  return data.items || [];
}

// Display recommended books
async function showRecommendations() {
  const queries = ["fiction", "history", "science", "mystery"];
  const books = [];

  for (let q of queries) {
    const res = await fetchBooks(q, 3);
    books.push(...res);
  }

  recommendedBooks = books;
  displayBooks(books);
}

// Render books
function displayBooks(books) {
  bookListContainer.innerHTML = "";

  books.forEach((book) => {
    const info = book.volumeInfo;
    const card = document.createElement("div");
    card.className = "book-card";

    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || "icons/book-placeholder.png"}" alt="cover">
      <h4>${info.title || "No Title"}</h4>
      <p>${info.description?.substring(0, 100) || "No description"}...</p>
      <p style="color: orange">${info.averageRating ? `⭐ ${info.averageRating}` : "Not rated"}</p>
      <a href="${info.infoLink}" target="_blank">More Info</a>
    `;

    bookListContainer.appendChild(card);
  });
}

// Search handler
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  const books = await fetchBooks(query, 12);
  originalContentHTML = recommendationsSection.innerHTML;
  displayBooks(books);
  backBtn.style.display = "inline-block";
});

// Back button
backBtn.addEventListener("click", () => {
  showRecommendations();
  backBtn.style.display = "none";
});

// Refresh recommendations
refreshBtn.addEventListener("click", showRecommendations);

// Sidebar genre filter (demo categories)
genreFilter.addEventListener("change", (e) => {
  const genre = e.target.value;
  populateSidebar(genre);
});

// Populate sidebar books
async function populateSidebar(genre = "All") {
  const books = await fetchBooks(genre === "All" ? "bestseller" : genre, 10);
  const sidebarList = document.getElementById("bestsellerList");

  sidebarList.innerHTML = "";
  books.forEach((book, index) => {
    const info = book.volumeInfo;
    const item = document.createElement("div");
    item.className = "bestseller-item";
    item.innerHTML = `
      <div style="margin-right: 0.5rem; background: #007bff; color: #fff; padding: 0.3rem 0.6rem; border-radius: 6px;">
        ${index + 1}
      </div>
      <img src="${info.imageLinks?.thumbnail || "icons/book-placeholder.png"}" alt="cover">
      <span>${info.title}</span>
    `;
    sidebarList.appendChild(item);
  });
}

// Initialize
showRecommendations();
populateSidebar();
