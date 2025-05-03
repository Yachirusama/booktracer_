document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const genreFilter = document.getElementById("genreFilter");
  const topBooksList = document.getElementById("topBooksList");

  // 🌙 Theme toggle handler
  themeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", themeToggle.checked);
  });

  // 📚 Dummy genre list (can be replaced with API call)
  const genres = ["All", "Fiction", "Fantasy", "Science", "Romance", "History"];
  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });

  genreFilter.addEventListener("change", () => {
    const selectedGenre = genreFilter.value;
    loadTopBooks(selectedGenre);
  });

  // 🧠 Simulate fetching top 10 books by genre
  function loadTopBooks(genre) {
    // Dummy data
    const allBooks = [
      { title: "The Great Adventure", genre: "Fiction", link: "#" },
      { title: "Deep in the Galaxy", genre: "Science", link: "#" },
      { title: "Hearts of Fire", genre: "Romance", link: "#" },
      { title: "The Fantasy Realms", genre: "Fantasy", link: "#" },
      { title: "Mysteries of the Past", genre: "History", link: "#" },
      { title: "Ocean Wonders", genre: "Science", link: "#" },
      { title: "Legends Untold", genre: "Fantasy", link: "#" },
      { title: "Time Machine", genre: "Fiction", link: "#" },
      { title: "Loving Shadows", genre: "Romance", link: "#" },
      { title: "Historic Wars", genre: "History", link: "#" },
      { title: "Galactic Peace", genre: "Science", link: "#" }
    ];

    const filtered = genre === "All"
      ? allBooks.slice(0, 10)
      : allBooks.filter(book => book.genre === genre).slice(0, 10);

    topBooksList.innerHTML = "";
    filtered.forEach((book, index) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = book.link;
      link.textContent = book.title;
      link.style.textDecoration = "none";
      link.style.color = "inherit";

      const rankSpan = document.createElement("span");
      rankSpan.className = "rank";
      rankSpan.textContent = index + 1;

      li.appendChild(rankSpan);
      li.appendChild(link);
      topBooksList.appendChild(li);
    });
  }

  // Initial load
  loadTopBooks("All");
});

// 🔍 Example search function
function searchBooksManual() {
  const input = document.getElementById("searchInput").value;
  alert(`Searching for: ${input}`);
}

// ⬅️ Back button
function goBack() {
  location.reload();
}
