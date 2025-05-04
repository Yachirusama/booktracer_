// DOM references
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const bookResults = document.getElementById("bookResults");
const backButton = document.getElementById("backButton");
const refreshBtn = document.getElementById("refreshBtn");
const themeToggle = document.getElementById("themeToggle");
const loader = document.querySelector(".loader");
const genreSelect = document.getElementById("genreSelect");
const bestsellerList = document.getElementById("bestsellerList");
const recommendations = document.getElementById("recommendations");
const miniGame = document.getElementById("miniGame");

// Helper to create a book card
function createBookCard(image, title, subtitle, url) {
    const li = document.createElement("li");
    li.innerHTML = `
        <img src="${image}" alt="Book cover">
        <div>
            <strong>${title}</strong><br>
            <small>${subtitle}</small>
        </div>
    `;
    li.onclick = () => window.open(url, "_blank");
    return li;
}

// Search books
async function searchBooks(query) {
    bookResults.innerHTML = "";
    loader.style.display = "block";
    recommendations.classList.add("hidden");

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const { itbookData, googleData, openLibraryData } = await res.json();

        bookResults.innerHTML = "";
        backButton.classList.remove("hidden");

        if (itbookData?.books) {
            itbookData.books.forEach(book => {
                const image = book.image || "https://via.placeholder.com/150";
                bookResults.appendChild(createBookCard(image, book.title, book.subtitle, book.url));
            });
        }

        if (googleData?.items) {
            googleData.items.forEach(book => {
                const info = book.volumeInfo;
                const image = info.imageLinks?.thumbnail || "https://via.placeholder.com/150";
                const authors = info.authors?.join(", ") || "Unknown Author";
                bookResults.appendChild(createBookCard(image, info.title, authors, info.infoLink));
            });
        }

        if (openLibraryData?.docs) {
            openLibraryData.docs.slice(0, 10).forEach(book => {
                const image = book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : "https://via.placeholder.com/150";
                const authors = book.author_name?.join(", ") || "Unknown Author";
                const link = `https://openlibrary.org${book.key}`;
                bookResults.appendChild(createBookCard(image, book.title, authors, link));
            });
        }
    } catch (err) {
        bookResults.innerHTML = "<p>❌ Failed to load books. Please try again.</p>";
        console.error(err);
    } finally {
        loader.style.display = "none";
    }
}

// Load recommendations
async function loadRecommendations() {
    const recommendList = document.getElementById("recommendList");
    recommendList.innerHTML = "";
    loader.style.display = "block";

    try {
        const res = await fetch("/api/recommend");
        const books = await res.json();
        books.forEach(book => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${book.image}" alt="Cover">
                <div>
                    <strong>${book.title}</strong>
                    <div class="rating">⭐ ${book.rating || "N/A"}</div>
                </div>
            `;
            li.onclick = () => window.open(book.url, "_blank");
            recommendList.appendChild(li);
        });
    } catch (err) {
        recommendList.innerHTML = "<li>⚠️ Failed to load recommendations.</li>";
    } finally {
        loader.style.display = "none";
    }
}

// Load top 10 bestsellers
async function loadTopBooks(genre = "") {
    bestsellerList.innerHTML = "";
    loader.style.display = "block";

    try {
        const res = await fetch(`/api/bestsellers${genre ? `?genre=${genre}` : ""}`);
        const books = await res.json();
        books.forEach(book => {
            const li = document.createElement("li");
            li.innerHTML = `
                <img src="${book.image}" alt="Cover">
                <div><strong>${book.title}</strong></div>
            `;
            li.onclick = () => window.open(book.url, "_blank");
            bestsellerList.appendChild(li);
        });
    } catch (err) {
        bestsellerList.innerHTML = "<li>⚠️ Error loading bestsellers.</li>";
    } finally {
        loader.style.display = "none";
    }
}

// Load genre options
async function loadGenres() {
    try {
        const res = await fetch("/api/genres");
        const genres = await res.json();
        genreSelect.innerHTML = `<option value="">All Genres</option>`;
        genres.forEach(g => {
            const option = document.createElement("option");
            option.value = g;
            option.textContent = g;
            genreSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Genre load failed", err);
    }
}

// Offline detection
function handleOffline() {
    miniGame.classList.remove("hidden");
    recommendations.classList.add("hidden");
}

// Online detection
function handleOnline() {
    miniGame.classList.add("hidden");
    recommendations.classList.remove("hidden");
}

// Event listeners
searchButton.onclick = () => {
    const query = searchInput.value.trim();
    if (query) searchBooks(query);
};

searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") searchButton.click();
});

backButton.onclick = () => {
    bookResults.innerHTML = "";
    backButton.classList.add("hidden");
    recommendations.classList.remove("hidden");
};

refreshBtn.onclick = () => {
    loadRecommendations();
};

themeToggle.onclick = () => {
    const isDark = document.body.classList.toggle("dark");
    themeToggle.innerHTML = isDark ? "🌙" : "☀️";
    localStorage.setItem("theme", isDark ? "dark" : "light");
};

genreSelect.onchange = () => {
    loadTopBooks(genreSelect.value);
};

// Initial setup
window.addEventListener("load", () => {
    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.innerHTML = "🌙";
    } else {
        themeToggle.innerHTML = "☀️";
    }

    loadRecommendations();
    loadGenres();
    loadTopBooks();

    if (!navigator.onLine) handleOffline();
});

window.addEventListener("offline", handleOffline);
window.addEventListener("online", handleOnline);
