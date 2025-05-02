// Load a random recommended book with short description and rating
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
        <img src="${info.imageLinks?.thumbnail || "https://via.placeholder.com/100"}" alt="Cover" />
        <div class="recommendation-text">
          <p><strong>Title:</strong> ${info.title}</p>
          <p><strong>Author:</strong> ${info.authors?.join(", ") || "Unknown Author"}</p>
          ${rating}
          <p><strong>Description:</strong> ${description}</p>
          <p><a href="${info.infoLink}" target="_blank">More Info</a></p>
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
