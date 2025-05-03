// 📘 Load a random recommended book
async function loadRandomRecommendation() {
  const box = document.getElementById("recommendedBook");
  if (!box) return;

  const keywords = ["fiction", "classic", "bestseller", "history", "science", "mystery", "fantasy", "technology"];
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${randomKeyword}&maxResults=40&timestamp=${Date.now()}`);
    const data = await res.json();
    if (!data.items?.length) throw new Error("No books found");

    const random = data.items[Math.floor(Math.random() * data.items.length)];
    const info = random.volumeInfo;

    const plainDesc = info.description?.replace(/<\/?[^>]+(>|$)/g, "");
    const description = plainDesc
      ? plainDesc.slice(0, 100) + (plainDesc.length > 100 ? "..." : "")
      : "No description available.";

    const rating = info.averageRating
      ? `<p><strong>Rating:</strong> ${info.averageRating} ⭐ (${info.ratingsCount || 0} ratings)</p>`
      : "<p><strong>Rating:</strong> Not rated</p>";

    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <div class="recommendation-box-content">
        <img src="${info.imageLinks?.thumbnail || "https://via.placeholder.com/100"}" alt="Book cover" />
        <div class="recommendation-text">
          <p><strong>Title:</strong> ${info.title}</p>
          <p><strong>Author:</strong> ${info.authors?.join(", ") || "Unknown Author"}</p>
          ${rating}
          <p><strong>Description:</strong> ${description}</p>
          <p><a href="${info.infoLink}" target="_blank" rel="noopener noreferrer">More Info</a></p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Recommendation error:", err);
    box.innerHTML = `
      <h3>📘 Recommended Book</h3>
      <p>⚠️ Could not load recommendation.</p>
    `;
  }
}

// 🔍 Search books using Google Books API
async function searchBooksManual() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsContainer = document.getElementById("bookResults");
  const backButton = document.querySelector(".back-button");

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  backButton.classList.remove("hidden");
  resultsContainer.innerHTML = "<p>🔎 Searching...</p>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultsContainer.innerHTML = "<p>❌ No results found.</p>";
      return;
    }

    resultsContainer.innerHTML = data.items.map(item => {
      const info = item.volumeInfo;
      const title = info.title || "No title";
      const authors = info.authors?.join(", ") || "Unknown author";
      const thumbnail = info.imageLinks?.thumbnail || "https://via.placeholder.com/100";
      const infoLink = info.infoLink || "#";
      const shortDesc = info.description
        ? info.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 100) + "..."
        : "No description available.";

      return `
        <div class="book-card">
          <img src="${thumbnail}" alt="Book cover">
          <div class="book-info">
            <h4>${title}</h4>
            <p><strong>Author:</strong> ${authors}</p>
            <p>${shortDesc}</p>
            <a href="${infoLink}" target="_blank" rel="noopener noreferrer">View Book</a>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Search error:", err);
    resultsContainer.innerHTML = "<p>⚠️ An error occurred while searching. Please try again later.</p>";
  }
}

// ⬅️ Go back to initial state
function goBack() {
  document.getElementById("bookResults").innerHTML = "";
  document.querySelector(".back-button").classList.add("hidden");
  document.getElementById("searchInput").value = "";
}

// 🔁 On page load
window.addEventListener("DOMContentLoaded", loadRandomRecommendation);
