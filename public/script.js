const recommendList = document.getElementById("recommendList");
const bestsellerList = document.getElementById("bestsellerList");
const loader = document.getElementById("loader");
const genreSelect = document.getElementById("genreSelect");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const refreshBtn = document.getElementById("refreshBtn");
const searchResults = document.getElementById("searchResults");
const backButton = document.getElementById("backButton");
const searchGenreFilter = document.getElementById("searchGenreFilter");
const miniGameSection = document.getElementById("miniGame");
const themeToggle = document.getElementById("themeToggle");

async function loadRecommendations() {
  if (!recommendList || !loader) return;
  loader.style.display = "block";
  recommendList.innerHTML = "";

  try {
    const response = await fetch("/api/search?q=bestseller");
    const data = await response.json();

    data.slice(0, 5).forEach(book => {
      recommendList.appendChild(createBookCard(book));
    });
  } catch (error) {
    recommendList.innerHTML = "<p>Failed to load recommendations.</p>";
    console.error(error);
  }

  loader.style.display = "none";
}

async function loadTopBooks(genre = "all") {
  if (!bestsellerList || !loader) return;
  bestsellerList.innerHTML = "";
  loader.style.display = "block";

  try {
    const response = await fetch(`/api/search?q=${genre}`);
    const data = await response.json();

    data.slice(0, 10).forEach(book => {
      bestsellerList.appendChild(createBookCard(book));
    });
  } catch (error) {
    bestsellerList.innerHTML = "<p>Failed to load bestsellers.</p>";
    console.error(error);
  }

  loader.style.display = "none";
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";

  const img = document.createElement("img");
  img.src = book.image || "fallback.jpg";
  img.alt = book.title;

  const title = document.createElement("h3");
  title.textContent = book.title;

  const author = document.createElement("p");
  author.textContent = book.author || "Unknown Author";

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(author);

  return card;
}

async function searchBooks(query) {
  if (!searchResults || !loader) return;

  loader.style.display = "block";
  searchResults.innerHTML = "";

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.length === 0) {
      searchResults.innerHTML = "<p>No books found.</p>";
    } else {
      data.forEach(book => {
        searchResults.appendChild(createBookCard(book));
      });
    }

    document.querySelector(".search-results").classList.remove("hidden");
    backButton.classList.remove("hidden");
  } catch (error) {
    searchResults.innerHTML = "<p>Error fetching search results.</p>";
    console.error(error);
  }

  loader.style.display = "none";
}

searchButton.onclick = () => {
  const query = searchInput.value.trim();
  if (query) searchBooks(query);
};

refreshBtn.onclick = loadRecommendations;

backButton.onclick = () => {
  document.querySelector(".search-results").classList.add("hidden");
  backButton.classList.add("hidden");
};

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

if (genreSelect) {
  genreSelect.onchange = () => {
    loadTopBooks(genreSelect.value);
  };
}

window.addEventListener("load", () => {
  loadRecommendations();
  loadTopBooks();
});
