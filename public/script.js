document.addEventListener("DOMContentLoaded", () => {
  const genreFilter = document.getElementById("genreFilter");
  const topBooksList = document.getElementById("topBooksList");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const recommendationTitle = document.getElementById("recommendation-title");
  const recommendationImage = document.getElementById("recommendation-image");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  const books = [
    { title: "The Great Adventure", genre: "Adventure" },
    { title: "Deep in the Galaxy", genre: "Sci-Fi" },
    { title: "Hearts of Fire", genre: "Romance" },
    { title: "The Fantasy Realms", genre: "Fantasy" },
    { title: "Mysteries of the Past", genre: "Mystery" },
    { title: "Ocean Wonders", genre: "Adventure" },
    { title: "Legends Untold", genre: "Fantasy" },
    { title: "Time Machine", genre: "Sci-Fi" },
    { title: "Loving Shadows", genre: "Romance" },
    { title: "Historic Wars", genre: "History" }
  ];

  // Generate genre options dynamically
  const genres = [...new Set(books.map(book => book.genre))];
  genreFilter.innerHTML = `<option value="All">All</option>` + genres.map(genre => `<option value="${genre}">${genre}</option>`).join("");

  // Display top 10 bestsellers
  function renderTopBooks(filter = "All") {
    const filtered = filter === "All" ? books : books.filter(book => book.genre === filter);
    topBooksList.innerHTML = filtered.map((book, index) => `
      <li onclick="alert('Clicked: ${book.title}')">
        <span class="book-rank">${index + 1}</span>
        <span>${book.title}</span>
      </li>
    `).join("");
  }

  // Handle genre filter change
  genreFilter.addEventListener("change", () => {
    renderTopBooks(genreFilter.value);
  });

  // Toggle dark mode
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", themeToggle.checked);
    themeIcon.className = themeToggle.checked ? "fas fa-moon" : "fas fa-sun";
  });

  // Render initial content
  renderTopBooks();

  // Show a random book recommendation
  const randomBook = books[Math.floor(Math.random() * books.length)];
  recommendationTitle.textContent = randomBook.title;
  recommendationImage.src = "https://via.placeholder.com/150?text=Book+Cover";

  // Search function (placeholder)
  document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();
    const results = books.filter(book => book.title.toLowerCase().includes(query));
    searchResults.innerHTML = results.length > 0
      ? results.map(book => `<div class="book-item">${book.title}</div>`).join("")
      : `<p>No books found for "${query}".</p>`;
  });
});
