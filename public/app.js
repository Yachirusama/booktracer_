const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const themeToggle = document.getElementById('themeToggle');
const recommendationList = document.getElementById('recommendations');
const bestsellerList = document.getElementById('bestsellers');
const genreFilter = document.getElementById('genreSelect');
const searchResults = document.getElementById('searchResults');
const html = document.documentElement;

let currentTheme = 'light';
let currentGenre = 'all';

// Theme toggle
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
  });
}

// Live search
if (searchInput && searchResults) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query === '') {
      searchResults.innerHTML = '';
      return;
    }
    searchBooks(query);
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchBooks(query);
    }
  });
}

// Refresh recommendations
if (refreshBtn) {
  refreshBtn.addEventListener('click', fetchRecommendations);
}

// Genre filter
if (genreFilter) {
  genreFilter.addEventListener('change', (e) => {
    currentGenre = e.target.value;
    fetchBestsellers(currentGenre);
  });
}

// Search Books
async function searchBooks(query) {
  searchResults.innerHTML = '';
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.items) {
      searchResults.innerHTML = '<p>No results found.</p>';
      return;
    }
    data.items.forEach(book => {
      const info = book.volumeInfo;
      const bookEl = createBookCard(info);
      searchResults.appendChild(bookEl);
    });
  } catch (err) {
    searchResults.innerHTML = '<p>Error fetching search results.</p>';
  }
}

// Recommended books
async function fetchRecommendations() {
  recommendationList.innerHTML = '';
  try {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=bestseller');
    const data = await res.json();
    data.items.slice(0, 5).forEach(book => {
      const info = book.volumeInfo;
      const bookEl = createBookCard(info);
      recommendationList.appendChild(bookEl);
    });
  } catch (err) {
    recommendationList.innerHTML = '<p>Error loading recommendations.</p>';
  }
}

// Bestsellers
async function fetchBestsellers(genre = 'bestseller') {
  bestsellerList.innerHTML = '';
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(genre)}`);
    const data = await res.json();
    data.items.slice(0, 10).forEach(book => {
      const info = book.volumeInfo;
      const li = document.createElement('div');
      li.classList.add('book-entry');
      li.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
        <div>
          <strong>${info.title}</strong><br/>
          ${info.authors ? info.authors.join(', ') : 'Unknown Author'}<br/>
          ⭐ ${info.averageRating || 'N/A'}
        </div>
      `;
      li.onclick = () => {
        if (info.infoLink) window.open(info.infoLink, '_blank');
      };
      bestsellerList.appendChild(li);
    });
  } catch (err) {
    bestsellerList.innerHTML = '<p>Error loading bestsellers.</p>';
  }
}

// Helper: Create book card
function createBookCard(info) {
  const div = document.createElement('div');
  div.className = 'book-card';
  div.innerHTML = `
    <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
    <h3>${info.title}</h3>
    <p>${info.authors ? info.authors.join(', ') : 'Unknown Author'}</p>
    <p>⭐ ${info.averageRating || 'N/A'}</p>
  `;
  div.onclick = () => {
    if (info.infoLink) window.open(info.infoLink, '_blank');
  };
  return div;
}

// Load genres
async function loadGenres() {
  const genres = ['all', 'fiction', 'nonfiction', 'romance', 'mystery', 'fantasy', 'history', 'science'];
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreFilter.appendChild(option);
  });
}

// Init
loadGenres();
fetchRecommendations();
fetchBestsellers();
