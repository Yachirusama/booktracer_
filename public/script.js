const apiKey = "AIzaSyDbodRnX_CoW0P_2ETDwVH2tkX4pTqKGJM";

// -------------------- SEARCH FUNCTION --------------------
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = document.querySelector("input[name='search']").value.trim();
    if (query) {
        const books = await fetchBooks(query);
        renderBooks(books);
    }
});

// -------------------- FETCH BOOKS --------------------
async function fetchBooks(query) {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`);
    const data = await response.json();
    return data.items || [];
}

// -------------------- RENDER SEARCH RESULTS --------------------
function renderBooks(books) {
    const section = document.getElementById("recommended-books");
    section.innerHTML = "";
    books.forEach(book => {
        const { title, authors, description, imageLinks, averageRating } = book.volumeInfo;
        section.innerHTML += `
            <div class="book">
                <img src="${imageLinks?.thumbnail || ''}" alt="${title}" />
                <h4>${title}</h4>
                <p><strong>Author:</strong> ${authors ? authors.join(", ") : "Unknown"}</p>
                <p>${description ? description.slice(0, 150) + "..." : "No description available"}</p>
                <p><strong>Rating:</strong> ${averageRating || "N/A"}</p>
            </div>
        `;
    });
}

// -------------------- RANDOM RECOMMENDATION --------------------
async function loadRecommendation() {
    const sampleQueries = ["bestsellers", "fiction", "technology", "history", "science"];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const books = await fetchBooks(randomQuery);
    if (books.length > 0) {
        renderBooks([books[Math.floor(Math.random() * books.length)]]);
    }
}

document.getElementById("refresh-btn").addEventListener("click", loadRecommendation);

// -------------------- SIDEBAR GENRE FILTER --------------------
document.getElementById("genre-filter").addEventListener("change", async function () {
    const genre = this.value;
    const query = genre === "All" ? "bestsellers" : genre;
    const books = await fetchBooks(query);
    const sidebar = document.getElementById("sidebar-books");
    sidebar.innerHTML = "";
    books.slice(0, 10).forEach(book => {
        const { title, imageLinks } = book.volumeInfo;
        sidebar.innerHTML += `
            <div class="sidebar-book">
                <img src="${imageLinks?.thumbnail || ''}" alt="${title}" />
                <p>${title}</p>
            </div>
        `;
    });
});

// -------------------- INITIAL LOAD --------------------
window.addEventListener("load", () => {
    loadRecommendation();
    document.getElementById("genre-filter").dispatchEvent(new Event("change"));
});
