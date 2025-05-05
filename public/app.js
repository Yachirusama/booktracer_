window.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const refreshBtn = document.getElementById("refresh-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const recommendedSection = document.getElementById("recommended");
  const bestsellersList = document.getElementById("bestsellers");
  const genreSelect = document.getElementById("genre-select");

  // Theme toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.classList.toggle("dark");
  });

  // Live search (supports special characters, updates per key)
  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query === "") {
      searchResults.style.display = "none";
      searchResults.innerHTML = "";
      return;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
    const res = await fetch(url);
    const data = await res.json();

    searchResults.innerHTML = "";
    if (data.items) {
      data.items.forEach((book) => {
        const title = book.volumeInfo.title || "No title";
        const author = (book.volumeInfo.authors || ["Unknown"]).join(", ");
        const img = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x193";
        const link = book.volumeInfo.infoLink || "#";

        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
          <img src="${img}" alt="${title}">
          <div class="book-title">${title}</div>
          <div class="book-author">${author}</div>
        `;
        div.onclick = () => window.open(link, "_blank");
        searchResults.appendChild(div);
      });
      searchResults.style.display = "flex";
    } else {
      searchResults.style.display = "none";
    }
  });

  // Load recommended books
  async function loadRecommendedBooks() {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=6&orderBy=newest`);
    const data = await res.json();
    recommendedSection.innerHTML = "";
    data.items.forEach((book) => {
      const title = book.volumeInfo.title || "No title";
      const author = (book.volumeInfo.authors || ["Unknown"]).join(", ");
      const rating = book.volumeInfo.averageRating || "N/A";
      const img = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x193";

      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <img src="${img}" alt="${title}">
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>
        <div class="book-rating">⭐ ${rating}</div>
      `;
      recommendedSection.appendChild(div);
    });
  }

  refreshBtn.addEventListener("click", loadRecommendedBooks);

  // Load bestsellers per genre
  async function loadBestsellers(genre = "fiction") {
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10&orderBy=relevance`;
    const res = await fetch(url);
    const data = await res.json();
    bestsellersList.innerHTML = "";

    data.items.forEach((book) => {
      const title = book.volumeInfo.title || "No title";
      const author = (book.volumeInfo.authors || ["Unknown"]).join(", ");
      const rating = book.volumeInfo.averageRating || "N/A";
      const img = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/128x193";

      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <img src="${img}" alt="${title}">
        <div class="book-title">${title}</div>
        <div class="book-author">${author}</div>
        <div class="book-rating">⭐ ${rating}</div>
      `;
      bestsellersList.appendChild(div);
    });
  }

  genreSelect.addEventListener("change", (e) => {
    loadBestsellers(e.target.value);
  });

  // Initial Load
  loadRecommendedBooks();
  loadBestsellers();
});
