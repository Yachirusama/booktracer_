const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const recommendationsList = document.getElementById("recommendations");
const refreshBtn = document.getElementById("refreshBtn");
const backButton = document.getElementById("backButton");
const genreFilter = document.getElementById("genreFilter");
const bestsellerList = document.getElementById("bestsellerList");
const loader = document.getElementById("loader");
const miniGame = document.getElementById("miniGame");
const themeToggle = document.getElementById("themeToggle");

let lastSearchResults = [];
let isDarkMode = false;

// Fetch book recommendations
async function fetchRecommendedBooks() {
  loader.style.display = "block";
  recommendationsList.innerHTML = "";

  try {
    const res = await fetch("https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=5");
    const data = await res.json();
    const books = data.items || [];

    books.forEach(book => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const rating = document.createElement("div");

      img.src = book.volumeInfo.imageLinks?.thumbnail || "";
      rating.className = "rating";
      rating.textContent = `★ ${book.volumeInfo.averageRating || "N/A"}`;

      li.appendChild(img);
      li.appendChild(rating);
      recommendationsList.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to fetch recommended books:", err);
  } finally {
    loader.style.display = "none";
  }
}

// Search books across APIs
async function searchBooks(query) {
  loader.style.display = "block";
  recommendationsList.innerHTML = "";

  try {
    const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
    const googleData = await googleRes.json();
    const results = googleData.items || [];

    lastSearchResults = results;
    results.forEach(book => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const rating = document.createElement("div");

      img.src = book.volumeInfo.imageLinks?.thumbnail || "";
      rating.className = "rating";
      rating.textContent = `★ ${book.volumeInfo.averageRating || "N/A"}`;

      li.appendChild(img);
      li.appendChild(rating);
      recommendationsList.appendChild(li);
    });

    if (results.length > 0) backButton.classList.remove("hidden");
  } catch (err) {
    console.error("Search failed:", err);
  } finally {
    loader.style.display = "none";
  }
}

// Genre filter
async function fetchGenresAndPopulate() {
  const genres = ["All", "Fiction", "Mystery", "Romance", "Sci-Fi", "Biography"];
  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.toLowerCase();
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Fetch top 10 bestsellers
async function fetchTop10Books(genre = "all") {
  bestsellerList.innerHTML = "";
  try {
    const genreQuery = genre === "all" ? "" : `+subject:${genre}`;
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=bestsellers${genreQuery}&maxResults=10`);
    const data = await res.json();

    data.items.forEach(book => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      const title = document.createElement("span");

      img.src = book.volumeInfo.imageLinks?.thumbnail || "";
      title.textContent = book.volumeInfo.title;

      li.appendChild(img);
      li.appendChild(title);
      bestsellerList.appendChild(li);
    });
  } catch (err) {
    console.error("Top 10 fetch failed:", err);
  }
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark", isDarkMode);
  themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
});

// Offline mini-game logic
function setupMiniGame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  let x = 150;
  let dx = 2;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(x, 75, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#0077cc";
    ctx.fill();
    ctx.closePath();

    x += dx;
    if (x + 20 > canvas.width || x - 20 < 0) dx *= -1;

    requestAnimationFrame(draw);
  }

  draw();
}

// Handle connectivity
function checkOfflineStatus() {
  if (!navigator.onLine) {
    miniGame.classList.remove("hidden");
    setupMiniGame();
  } else {
    miniGame.classList.add("hidden");
  }
}

// Event Listeners
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchBooks(query);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (!query) {
    recommendationsList.innerHTML = "";
    backButton.classList.add("hidden");
    fetchRecommendedBooks();
  }
});

backButton.addEventListener("click", () => {
  searchInput.value = "";
  backButton.classList.add("hidden");
  fetchRecommendedBooks();
});

refreshBtn.addEventListener("click", fetchRecommendedBooks);

genreFilter.addEventListener("change", () => {
  fetchTop10Books(genreFilter.value);
});

window.addEventListener("load", () => {
  fetchGenresAndPopulate();
  fetchRecommendedBooks();
  fetchTop10Books();
  checkOfflineStatus();
});

window.addEventListener("online", checkOfflineStatus);
window.addEventListener("offline", checkOfflineStatus);
