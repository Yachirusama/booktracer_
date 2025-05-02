async function searchBooksManual() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsContainer = document.getElementById("bookResults");
  const backButton = document.querySelector(".back-button");

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  // Show back button
  backButton.classList.remove("hidden");

  try {
    resultsContainer.innerHTML = "<p>🔎 Searching...</p>";
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

      return `
        <div class="book-card">
          <img src="${thumbnail}" alt="Book cover">
          <div class="book-info">
            <h4>${title}</h4>
            <p><strong>Author:</strong> ${authors}</p>
            <a href="${infoLink}" target="_blank">View Book</a>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Search error:", err);
    resultsContainer.innerHTML = "<p>⚠️ An error occurred while searching. Please try again later.</p>";
  }
}
