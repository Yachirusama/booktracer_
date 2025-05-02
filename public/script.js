let debounceTimer;

// Normalize to handle special/accented characters
function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Hide recommendation when user interacts
function hideRecommendation() {
    const recBox = document.getElementById("recommendedBook");
    if (recBox) recBox.style.display = "none";
}

// Live search with debounce
document.getElementById("searchInput").addEventListener("input", () => {
    hideRecommendation();
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

// Manual search with Enter
document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        hideRecommendation();
        const query = e.target.value.trim();
        if (query) {
            searchBooks(query);
        } else {
            clearResults();
        }
    }
});

// Manual search button handler
function searchBooksManual() {
    const query = document.getElementById("searchInput").value.trim();
    hideRecommendation();
    if (query) {
        searchBooks(query);
    } else {
        clearResults();
    }
}

// Fetch and display books from multiple APIs
async function searchBooks(query) {
    const normalizedQuery = normalize(query);
    const bookResults = document.getElementById("bookResults");
    bookResults.innerHTML = "<p>🔍 Searching for books...</p>";
    let resultsFound = false;

    try {
        const [itbookData, googleData, openLibraryData] = await Promise.all([
            fetch(`https://api.itbook.store/1.0/search/${encodeURIComponent(normalizedQuery)}`).then(res => res.json()),
            fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(normalizedQuery)}`).then(res => res.json()),
            fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(normalizedQuery)}`).then(res => res.json())
        ]);

        bookResults.innerHTML = "";
        document.querySelector(".back-button").classList.remove("hidden");

        if (itbookData.books?.length) {
            resultsFound = true;
            itbookData.books.forEach(book => {
                const image = book.image || "https://via.placeholder.com/150";
                bookResults.appendChild(createBookCard(image, book.title, book.subtitle, book.url));
            });
        }

        if (googleData.items?.length) {
            resultsFound = true;
            googleData.items.forEach(book => {
                const info = book.volumeInfo;
                const image = info.imageLinks?.thumbnail || "https://via.placeholder.com/150";
                const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
                bookResults.appendChild(createBookCard(image, info.title, authors, info.infoLink));
            });
        }

        if (openLibraryData.docs?.length) {
            const booksToShow = openLibraryData.docs.slice(0, 10);
            if (booksToShow.length) resultsFound = true;
            booksToShow.forEach(book => {
                const image = book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150";
                const authors = book.author_name ? book.author_name.join(", ") : "Unknown Author";
                const link = `https://openlibrary.org${book.key}`;
                bookResults.appendChild(createBookCard(image, book.title, authors, link));
            });
        }

        if (!resultsFound) {
            bookResults.innerHTML = "<p>📭 No books found. Try another search.</p>";
        }

    } catch (error) {
        console.error("Error fetching book data:", error);
        bookResults.innerHTML = "<p>❌ Failed to load books. Please try again.</p>";
    }
}

// Book card generator
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

// Clear all results
function clearResults() {
    document.getElementById("bookResults").innerHTML = "";
    document.querySelector(".back-button").classList.add("hidden");
}

// Reset UI
function goBack() {
    clearResults();
    document.getElementById("searchInput").value = "";
    const recBox = document.getElementById("recommendedBook");
    if (recBox) recBox.style.display = "block";
}
