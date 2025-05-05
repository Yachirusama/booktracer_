const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const backBtn = document.getElementById('backBtn');
const themeToggle = document.getElementById('themeToggle');
const recommendationList = document.getElementById('recommendationList');
const bestsellerList = document.getElementById('bestsellerList');
const genreFilter = document.getElementById('genreFilter');
const searchResults = document.getElementById('searchResults');
const html = document.documentElement;

let currentTheme = 'light';
let currentGenre = 'all';

// Toggle Theme
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', currentTheme);
  themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
});

// Live Search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query === '') {
    backBtn.style.display = 'none';
    searchResults.innerHTML = '';
    return;
  }
  backBtn.style.display = 'inline';
  searchBooks(query);
});

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    backBtn.style.display = 'inline';
    searchBooks(query);
  }
});

backBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchResults.innerHTML = '';
  backBtn.style.display = 'none';
});

// Fetch Recommended Books
async function fetchRecommendations() {
  recommendationList.innerHTML = '';
  const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=bestseller');
  const data = await res.json();
  data.items.slice(0, 5).forEach(book => {
    const info = book.volumeInfo;
    const bookEl = createBookCard(info);
    recommendationList.appendChild(bookEl);
  });
}

// Fetch Bestsellers by Genre
async function fetchBestsellers(genre = 'bestseller') {
  bestsellerList.innerHTML = '';
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${genre}`);
  const data = await res.json();
  data.items.slice(0, 10).forEach(book => {
    const info = book.volumeInfo;
    const li = document.createElement('li');
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
}

// Search Books
async function searchBooks(query) {
  searchResults.innerHTML = '';
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
}

// Helper: Create Book Card
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

// Genre Filter
genreFilter.addEventListener('change', (e) => {
  currentGenre = e.target.value;
  fetchBestsellers(currentGenre);
});

// Populate Genre Options
async function loadGenres() {
  const genres = ['all', 'fiction', 'nonfiction', 'romance', 'mystery', 'fantasy', 'history', 'science'];
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
    genreFilter.appendChild(option);
  });
}

// Refresh Button
refreshBtn.addEventListener('click', fetchRecommendations);

// Init
loadGenres();
fetchRecommendations();
fetchBestsellers();
