const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchDropdown = document.getElementById('search-results-dropdown');
const searchResultsSection = document.getElementById('search-results-section');
const searchResults = document.getElementById('search-results');
const backButton = document.getElementById('backButton');
const refreshBtn = document.getElementById('refreshRecommendations');
const recommendationList = document.getElementById('recommendation-list');
const themeToggle = document.getElementById('themeToggle');
const genreFilter = document.getElementById('genreFilter');
const bestsellerList = document.getElementById('bestseller-list');

// Live Search with Dropdown
searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    searchDropdown.classList.remove('active');
    searchDropdown.innerHTML = '';
    return;
  }

  const results = await fetchGoogleBooks(query);
  renderDropdown(results);
});

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query) {
    performSearch(query);
  }
});

function renderDropdown(books) {
  searchDropdown.innerHTML = '';
  if (!books.length) {
    searchDropdown.classList.remove('active');
    return;
  }

  books.forEach(book => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = book.title;
    item.onclick = () => {
      performSearch(book.title);
      searchDropdown.classList.remove('active');
    };
    searchDropdown.appendChild(item);
  });

  searchDropdown.classList.add('active');
}

// Perform search and display results
async function performSearch(query) {
  const results = await fetchGoogleBooks(query);
  searchResults.innerHTML = '';
  searchDropdown.classList.remove('active');
  document.querySelector('.recommendations').style.display = 'none';
  searchResultsSection.style.display = 'block';
  backButton.style.display = 'inline-block';

  results.forEach(book => {
    const card = createBookCard(book);
    searchResults.appendChild(card);
  });
}

backButton.addEventListener('click', () => {
  searchResults.innerHTML = '';
  searchInput.value = '';
  searchDropdown.classList.remove('active');
  searchResultsSection.style.display = 'none';
  document.querySelector('.recommendations').style.display = 'block';
  backButton.style.display = 'none';
});

// Google Books API
async function fetchGoogleBooks(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
    const data = await response.json();
    return (data.items || []).map(item => ({
      title: item.volumeInfo.title,
      cover: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/60x90?text=No+Cover',
      link: item.volumeInfo.infoLink || '#'
    }));
  } catch (err) {
    console.error('Book fetch error:', err);
    return [];
  }
}

// Create book card
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <a href="${book.link}" target="_blank">
      <img src="${book.cover}" alt="${book.title}" />
    </a>
    <div class="details">
      <h3>${book.title}</h3>
    </div>
  `;
  return card;
}

// Load Recommendations
async function loadRecommendations() {
  const recBooks = await fetchGoogleBooks('bestsellers fiction');
  recommendationList.innerHTML = '';
  recBooks.forEach(book => {
    recommendationList.appendChild(createBookCard(book));
  });
}

refreshBtn.addEventListener('click', loadRecommendations);

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// Load Genre Options
function loadGenres() {
  const genres = [
    'Fiction', 'Mystery', 'Fantasy', 'Romance', 'Science', 'History', 'Biography'
  ];
  genres.forEach(genre => {
    const opt = document.createElement('option');
    opt.value = genre;
    opt.textContent = genre;
    genreFilter.appendChild(opt);
  });
}

// Load Bestsellers by Genre
async function loadBestsellers(genre = 'Fiction') {
  const books = await fetchGoogleBooks(`bestsellers ${genre}`);
  bestsellerList.innerHTML = '';
  books.forEach(book => bestsellerList.appendChild(createBookCard(book)));
}

genreFilter.addEventListener('change', e => {
  loadBestsellers(e.target.value);
});

// Init
loadGenres();
loadBestsellers();
loadRecommendations();
