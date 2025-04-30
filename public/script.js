let debounceTimer;

// Live search on typing
document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = document.getElementById("searchInput").value.trim();
        if (query) {
            searchBooks(query);
        } else {
            clearResults();
        }
    }, 500);
});

// Manual search on Enter key press
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (query) {
            searchBooks(query);
        } else {
            clearResults();
        }
    }
});

// Fetch and show books from APIs
async function searchBooks(query) {
    const bookResults = document.getElementById("bookResults");
    bookResults.innerHTML = "<p>🔍 Searching for books...</p>";

    try {
        const [itbookData, googleData, openLibraryData] = await Promise.all([
            fetch(`https://api.itbook.store/1.0/search/${query}`).then(res => res.json()),
            fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`).then(res => res.json()),
            fetch(`https://openlibrary.org/search.json?title=${query}`).then(res => res.json())
        ]);

        bookResults.innerHTML = "";
        document.querySelector(".back-button").classList.remove("hidden");

        if (itbookData.books) {
            itbookData.books.forEach(book => {
                const image = book.image || "https://via.placeholder.com/150";
                bookResults.appendChild(createBookCard(image, book.title, book.subtitle, book.url));
            });
        }

        if (googleData.items) {
            googleData.items.forEach(book => {
                const info = book.volumeInfo;
                const image = info.imageLinks?.thumbnail || "https://via.placeholder.com/150";
                const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
                bookResults.appendChild(createBookCard(image, info.title, authors, info.infoLink));
            });
        }

        if (openLibraryData.docs) {
            openLibraryData.docs.slice(0, 10).forEach(book => {
                const image = book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150";
                const authors = book.author_name ? book.author_name.join(", ") : "Unknown Author";
                const link = `https://openlibrary.org${book.key}`;
                bookResults.appendChild(createBookCard(image, book.title, authors, link));
            });
        }

    } catch (error) {
        console.error("Error fetching book data:", error);
        bookResults.innerHTML = "<p>❌ Failed to load books. Please try again.</p>";
    }
}

// Generate book card DOM
function createBookCard(image, title, subtitle, link) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");
    bookCard.innerHTML = `
        <img src="${image}" alt="${title}">
        <h3>${title}</h3>
        <p>${subtitle || "No description available."}</p>
        <a href="${link}" target="_blank">View Details</a>
    `;
    return bookCard;
}

// Clear result area and hide back button
function clearResults() {
    document.getElementById("bookResults").innerHTML = "";
    document.querySelector(".back-button").classList.add("hidden");
}

// Reset UI
function goBack() {
    clearResults();
    document.getElementById("searchInput").value = "";
}
