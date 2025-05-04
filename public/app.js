const recommendedContainer = document.querySelector(".recommended-books");
const refreshBtn = document.querySelector("#refreshBtn");
const genreDropdown = document.querySelector("#genreDropdown");
const sidebarBooks = document.querySelector(".sidebar");

const genres = ["fiction", "fantasy", "mystery", "science", "romance", "history", "thriller", "biography"];

function getRandomGenre() {
  return genres[Math.floor(Math.random() * genres.length)];
}

// -------------------------
// Recommended Books Section
// -------------------------
function fetchRecommendedBooks() {
  const keyword = getRandomGenre();

  fetch(`https://www.googleapis.com/books/v1/volumes?q=${keyword}`)
    .then((res) => res.json())
    .then((data) => {
      recommendedContainer.innerHTML = ""; // clear previous
      const books = (data.items || []).filter(book => {
        const info = book.volumeInfo;
        return info?.title && info?.imageLinks?.thumbnail;
      }).sort(() => 0.5 - Math.random()).slice(0, 5);

      books.forEach(book => {
        const info = book.volumeInfo;
        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
          <img src="${info.imageLinks.thumbnail}" alt="${info.title}" />
          <div>⭐ ${info.averageRating || 'N/A'}</div>
        `;
        recommendedContainer.appendChild(card);
      });
    })
    .catch((err) => console.error("Recommendation fetch error:", err));
}

// -------------------------
// Sidebar Bestsellers
// -------------------------
function fetchSidebarBooks(genre = "fiction") {
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${genre}+bestseller`)
    .then(res => res.json())
    .then(data => {
      sidebarBooks.innerHTML = ""; // Clear previous
      const books = (data.items || []).filter(book => {
        const info = book.volumeInfo;
        return info?.title && info?.imageLinks?.thumbnail;
      }).slice(0, 10);

      books.forEach(book => {
        const info = book.volumeInfo;
        const div = document.createElement("div");
        div.className = "sidebar-book";
        div.innerHTML = `
          <img src="${info.imageLinks.thumbnail}" alt="${info.title}" />
          <div>${info.title}</div>
        `;
        sidebarBooks.appendChild(div);
      });
    })
    .catch(err => console.error("Sidebar fetch error:", err));
}

// -------------------------
// Event Listeners
// -------------------------
refreshBtn.addEventListener("click", fetchRecommendedBooks);

genreDropdown.addEventListener("change", (e) => {
  fetchSidebarBooks(e.target.value);
});

// -------------------------
// Initial Load
// -------------------------
fetchRecommendedBooks();
fetchSidebarBooks();
