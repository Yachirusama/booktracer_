const API_KEY = 'AIzaSyDbodRnX_CoW0P_2ETDwVH2tkX4pTqKGJM';

// === DOM Elements ===
const recommendedSection = document.getElementById('recommended');
const refreshButton = document.getElementById('refreshBtn');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const backButton = document.getElementById('backButton');
const genreSelect = document.getElementById('genreSelect');
const bestsellersList = document.getElementById('bestsellersList');

// === Fetch a Random Recommended Book ===
async function fetchRecommendedBook() {
  const query = 'bestseller fiction';
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&printType=books&maxResults=20&key=${API_KEY}`);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const randomBook = data.items[Math.floor(Math.random() * data.items.length)];
    displayRecommendedBook(randomBook);
  }
}

function displayRecommendedBook(book) {
  const volumeInfo = book.volumeInfo;
  recommendedSection.innerHTML = `
    <h3>Recommended Book</h3>
    <img src="${volumeInfo.imageLinks?.thumbnail || 'default-cover.jpg'}" alt="Book Cover">
    <h4>${volumeInfo.title}</h4>
    <p>${volumeInfo.description ? volumeInfo.description.slice(0, 200) + '...' : 'No description available.'}</p>
    <p><strong>Rating:</strong> ${volumeInfo.averageRating || 'N/A'}</p>
  `;
}

// === Search Functionality ===
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}`);
  const data = await response.json();

  searchResults.innerHTML = '<h3>Search Results</h3>';
  if (data.items) {
    data.items.forEach(book => {
      const info = book.volumeInfo;
      searchResults.innerHTML += `
        <div class="book">
          <img src="${info.imageLinks?.thumbnail || 'default-cover.jpg'}" alt="Book Cover">
          <h4>${info.title}</h4>
          <p>${info.description ? info.description.slice(0, 150) + '...' : 'No description available.'}</p>
          <p><strong>Rating:</strong> ${info.averageRating || 'N/A'}</p>
        </div>
      `;
    });
  } else {
    searchResults.innerHTML += '<p>No results found.</p>';
  }

  backButton.style.display = 'block';
});

// === Back Button Functionality ===
backButton.addEventListener('click', () => {
  searchResults.innerHTML = '';
  backButton.style.display = 'none';
  searchInput.value = '';
});

// === Refresh Recommendation ===
refreshButton.addEventListener('click', fetchRecommendedBook);

// === Sidebar Bestsellers with Genre Filter ===
async function loadGenresAndBestsellers() {
  const genres = ['Fiction', 'Mystery', 'Science', 'History', 'Romance'];
  genreSelect.innerHTML = genres.map(g => `<option value="${g}">${g}</option>`).join('');

  genreSelect.addEventListener('change', () => {
    loadTopBooksByGenre(genreSelect.value);
  });

  loadTopBooksByGenre(genres[0]);
}

async function loadTopBooksByGenre(genre) {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&orderBy=relevance&maxResults=10&key=${API_KEY}`);
  const data = await response.json();

  bestsellersList.innerHTML = '';
  if (data.items) {
    data.items.forEach(book => {
      const info = book.volumeInfo;
      bestsellersList.innerHTML += `
        <li>
          <img src="${info.imageLinks?.thumbnail || 'default-cover.jpg'}" alt="Book">
          <span>${info.title}</span>
        </li>
      `;
    });
  }
}

// === Initialize on Page Load ===
window.addEventListener('DOMContentLoaded', () => {
  fetchRecommendedBook();
  loadGenresAndBestsellers();
});
