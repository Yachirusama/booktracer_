const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const backBtn = document.getElementById("backBtn");
const refreshBtn = document.getElementById("refresh");
const recommendedContainer = document.getElementById("recommended-books");
const bestsellerContainer = document.getElementById("bestseller-books");
const themeToggle = document.getElementById("theme-toggle");
const genreFilter = document.getElementById("genreFilter");
const autocompleteBox = document.getElementById("autocomplete-results");

// Toggle theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Fetch and display recommended books (from Google Books)
async function loadRecommendations() {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=bestsellers`);
  const data = await res.json();
  recommendedContainer.innerHTML = "";
  data.items.slice(0, 10).forEach(book => {
    recommendedContainer.innerHTML += createBookCard(book);
  });
}

// Fetch and display bestsellers (simulate different API or mock data)
async function loadBestsellers(genre = "") {
  const query = genre === "all" ? "bestseller" : `bestseller+subject:${genre}`;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  const data = await res.json();
  bestsellerContainer.innerHTML = "";
  data.items.slice(0, 10).forEach(book => {
    bestsellerContainer.innerHTML += createBookCard(book);
  });
}

// Populate genre filter
async function populateGenres() {
  const genres = ["Fiction", "History", "Science", "Fantasy", "Romance", "Mystery"];
  genreFilter.innerHTML += genres.map(g => `<option value="${g}">${g}</option>`).join("");
  genreFilter.addEventListener("change", () => loadBestsellers(genreFilter.value));
}

// Predictive search with special character support
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    autocompleteBox.innerHTML = "";
    searchResults.innerHTML = "";
    return;
  }

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  // Autocomplete
  autocompleteBox.innerHTML = data.items.slice(0, 5).map(b => {
    return `<div data-title="${b.volumeInfo.title}">${b.volumeInfo.title}</div>`;
  }).join("");

  // Instant results
  searchResults.innerHTML = data.items.map(book => createBookCard(book)).join("");
});

autocompleteBox.addEventListener("click", (e) => {
  if (e.target.dataset.title) {
    searchInput.value = e.target.dataset.title;
    autocompleteBox.innerHTML = "";
    searchInput.dispatchEvent(new Event("input"));
  }
});

backBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchResults.innerHTML = "";
  autocompleteBox.innerHTML = "";
});

refreshBtn.addEventListener("click", loadRecommendations);

function createBookCard(book) {
  const info = book.volumeInfo;
  return `
    <div class="book-card">
      <img src="${info.imageLinks?.thumbnail || ''}" alt="cover"/>
      <h4>${info.title}</h4>
      <p>${info.authors?.join(', ') || 'Unknown'}</p>
      <p>⭐ ${info.averageRating || 'N/A'}</p>
    </div>
  `;
}

// Initial Load
loadRecommendations();
loadBestsellers();
populateGenres();
