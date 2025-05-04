const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('search-results');
const recommendationRow = document.getElementById('recommendations');
const refreshButton = document.getElementById('refresh-button');
const genreSelect = document.getElementById('genre-select');
const bestsellersList = document.getElementById('bestsellers-list');
const backButton = document.getElementById('back-button');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// --- Theme Toggle ---
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  sunIcon.style.display = document.body.classList.contains('dark') ? 'none' : 'inline';
  moonIcon.style.display = document.body.classList.contains('dark') ? 'inline' : 'none';
});

// --- Predictive Search ---
searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length === 0) {
    resultsGrid.innerHTML = '';
    backButton.style.display = 'none';
    return;
  }
  const results = await searchBooks(query);
  showResults(results);
  backButton.style.display = 'inline-block';
});

// --- Manual Search Trigger ---
document.getElementById('search-button').addEventListener('click', async () => {
  const query = searchInput.value.trim();
  if (query) {
    const results = await searchBooks(query);
    showResults(results);
    backButton.style.display = 'inline-block';
  }
});

// --- Back Button ---
backButton.addEventListener('click', () => {
  searchInput.value = '';
  resultsGrid.innerHTML = '';
  backButton.style.display = 'none';
});

// --- Refresh Recommendations ---
refreshButton.addEventListener('click', loadRecommendations);

// --- Load Recommendations ---
async function loadRecommendations() {
  const books = await searchBooks('fiction');
  const picks = books.slice(0, 5);
  recommendationRow.innerHTML = picks.map(bookToCard).join('');
}

// --- Search Books ---
async function searchBooks(query) {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();
    return (data.items || []).map(item => ({
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown',
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
      link: item.volumeInfo.infoLink
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
}

// --- Show Search Results ---
function showResults(books) {
  resultsGrid.innerHTML = books.map(bookToCard).join('');
}

// --- Book Card Generator ---
function bookToCard(book) {
  return `
    <div class="book-card" onclick="window.open('${book.link}', '_blank')">
      <img src="${book.thumbnail}" alt="${book.title}">
      <h4>${book.title}</h4>
      <p>${book.author}</p>
    </div>
  `;
}

// --- Genre Select Change (Sidebar) ---
genreSelect.addEventListener('change', async () => {
  const genre = genreSelect.value || 'bestsellers';
  const results = await searchBooks(genre);
  const bestsellers = results.slice(0, 10);
  bestsellersList.innerHTML = bestsellers.map(bookToCard).join('');
});

// --- Initial Setup ---
window.addEventListener('load', () => {
  loadRecommendations();
  genreSelect.dispatchEvent(new Event('change'));
  backButton.style.display = 'none';
  moonIcon.style.display = 'none';
});
