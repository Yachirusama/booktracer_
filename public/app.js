const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const backButton = document.getElementById("backButton");
const refreshButton = document.getElementById("refreshButton");
const searchButton = document.getElementById("searchButton");
const recommendedBooks = document.getElementById("recommendedBooks");

async function searchBooks(query) {
  searchResults.innerHTML = "";
  if (!query) return;

  try {
    // Fetch from Google Books
    const googleBooks = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) throw new Error("Google Books API failed");
        return res.json();
      })
      .then(data => (data.items || []).slice(0, 5))
      .catch(err => {
        console.error("Google Books error:", err);
        return [];
      });

    // Fetch from Open Library
    const openLibrary = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Invalid Open Library response");
        }
        return res.json();
      })
      .then(data => (data.docs || []).slice(0, 5))
      .catch(err => {
        console.error("Open Library error:", err);
        return [];
      });

    const results = [];

    googleBooks.forEach(book => {
      results.push({
        title: book.volumeInfo.title,
        link: book.volumeInfo.infoLink,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      });
    });

    openLibrary.forEach(book => {
      results.push({
        title: book.title,
        link: `https://openlibrary.org${book.key}`,
        image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : "",
      });
    });

    if (results.length === 0) {
      searchResults.innerHTML = "<p>No results found.</p>";
    } else {
      results.forEach(book => {
        const div = document.createElement("div");
        div.className = "book-card";
        div.innerHTML = `
          <a href="${book.link}" target="_blank">
            <img src="${book.image}" alt="${book.title}">
            <p>${book.title}</p>
          </a>
        `;
        searchResults.appendChild(div);
      });
    }

    backButton.style.display = "inline-block";
    recommendedBooks.style.display = "none";

  } catch (err) {
    console.error("Unexpected error:", err);
    searchResults.innerHTML = "<p>Something went wrong while searching.</p>";
  }
}

searchInput.addEventListener("input", e => {
  const query = e.target.value.trim();
  if (query) {
    searchBooks(query);
  } else {
    searchResults.innerHTML = "";
    backButton.style.display = "none";
    recommendedBooks.style.display = "grid";
  }
});

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  searchBooks(query);
});

backButton.addEventListener("click", () => {
  searchInput.value = "";
  searchResults.innerHTML = "";
  backButton.style.display = "none";
  recommendedBooks.style.display = "grid";
});
