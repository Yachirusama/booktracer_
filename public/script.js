document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const refreshBtn = document.getElementById("refreshBtn");
  const recommendationsList = document.getElementById("recommendationList");
  const backButton = document.getElementById("backButton");
  const themeToggle = document.getElementById("themeToggle");
  const genreFilter = document.getElementById("genreFilter");
  const bestsellerList = document.getElementById("bestsellerList");
  const loader = document.getElementById("loader");
  const miniGame = document.getElementById("miniGame");

  // Initial load
  fetchGenres();
  fetchRecommendations();
  fetchTopBestsellers();
  handleOffline();

  // Event listeners
  refreshBtn.addEventListener("click", fetchRecommendations);
  searchInput.addEventListener("input", liveSearch);
  searchButton.addEventListener("click", performSearch);
  backButton.addEventListener("click", () => {
    searchInput.value = "";
    backButton.classList.add("hidden");
    fetchRecommendations();
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
  });

  genreFilter.addEventListener("change", fetchTopBestsellers);

  window.addEventListener("online", handleOffline);
  window.addEventListener("offline", handleOffline);

  function showLoader() {
    loader.style.display = "block";
  }

  function hideLoader() {
    loader.style.display = "none";
  }

  function handleOffline() {
    if (!navigator.onLine) {
      miniGame.classList.remove("hidden");
      startGame();
    } else {
      miniGame.classList.add("hidden");
      stopGame();
    }
  }

  // Genre list
  function fetchGenres() {
    const subjects = ["Fiction", "Science", "History", "Romance", "Mystery", "Fantasy", "Biography"];
    for (const subject of subjects) {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      genreFilter.appendChild(option);
    }
  }

  async function fetchRecommendations() {
    showLoader();
    const query = "bestseller";
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items || []);
    backButton.classList.add("hidden");
    hideLoader();
  }

  async function fetchTopBestsellers() {
    showLoader();
    const genre = genreFilter.value;
    const query = genre === "all" ? "subject:bestseller" : `subject:${genre}`;
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
    const data = await response.json();
    bestsellerList.innerHTML = (data.items || []).map(book => {
      const info = book.volumeInfo;
      return `
        <li>
          <img src="${info.imageLinks?.thumbnail || ''}" alt="Cover" />
          <div>
            <strong>${info.title}</strong><br/>
            <span>${info.authors ? info.authors.join(", ") : "Unknown Author"}</span>
          </div>
        </li>`;
    }).join("");
    hideLoader();
  }

  async function liveSearch() {
    const query = searchInput.value.trim();
    if (query === "") {
      fetchRecommendations();
      return;
    }
    showLoader();
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items || []);
    backButton.classList.remove("hidden");
    hideLoader();
  }

  async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    showLoader();
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
    const data = await response.json();
    displayBooks(data.items || []);
    backButton.classList.remove("hidden");
    hideLoader();
  }

  function displayBooks(books) {
    if (!books || books.length === 0) {
      recommendationsList.innerHTML = "<li>No recommendations available.</li>";
      return;
    }

    recommendationsList.innerHTML = books.map(book => {
      const info = book.volumeInfo;
      const rating = info.averageRating ? `⭐ ${info.averageRating}` : "No rating";
      const thumbnail = info.imageLinks?.thumbnail || "";
      return `
        <li>
          <img src="${thumbnail}" alt="Cover">
          <strong>${info.title}</strong><br/>
          <span class="rating">${rating}</span>
        </li>`;
    }).join("");
  }

  // Mini Game Logic
  let gameInterval;
  let positionX = 0;
  let velocityX = 2;

  function startGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    positionX = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0077cc";
      ctx.fillRect(positionX, canvas.height / 2 - 15, 30, 30);
      positionX += velocityX;
      if (positionX > canvas.width - 30 || positionX < 0) velocityX *= -1;
    }

    if (!gameInterval) {
      gameInterval = setInterval(draw, 20);
    }
  }

  function stopGame() {
    if (gameInterval) {
      clearInterval(gameInterval);
      gameInterval = null;
    }
  }
});
