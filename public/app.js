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

// Live Search w/ Dropdown
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
    item.textContent = book.title;
    item.onclick = () => {
      performSearch(book.title);
      searchDropdown.classList.remove('active');
    };
    searchDropdown.appendChild(item);
  });

  searchDropdown.classList.add('active');
}

// Perform search and show results section
async function performSearch(query) {
  const results = await fetchGoogleBooks(query);
  searchResults.innerHTML = '';
  searchDropdown.classList.remove('active');
  recommendationList.parentElement.style.display = 'none';
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
  searchResultsSection.style.display = 'none';
  recommendationList.parentElement.style.display = 'block';
  backButton.style.display = 'none';
});

// Fetch from Google Books API
async function fetchGoogleBooks(query) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
    const data = await response.json();
    return (data.items || []).map(item => ({
      title: item.volumeInfo.title,
      cover: item.volumeInfo.imageLinks?.thumbnail || '',
      link: item.volumeInfo.infoLink || '#'
    }));
  } catch (err) {
    console.error('Error fetching books:', err);
    return [];
  }
}

// Create book card element
function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <a href="${book.link}" target="_blank">
      <img src="${book.cover}" alt="${book.title}" />
      <p>${book.title}</p>
    </a>
  `;
  return card;
}

// Recommendations
async function loadRecommendations() {
  const recBooks = await fetchGoogleBooks('bestsellers fiction');
  recommendationList.innerHTML = '';
  recBooks.forEach(book => recommendationList.appendChild(createBookCard(book)));
}

refreshBtn.addEventListener('click', loadRecommendations);

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Bestseller Sidebar
async function loadGenres() {
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

async function loadBestsellers(genre = 'Fiction') {
  const books = await fetchGoogleBooks(`bestsellers ${genre}`);
  bestsellerList.innerHTML = '';
  books.forEach(book => bestsellerList.appendChild(createBookCard(book)));
}

genreFilter.addEventListener('change', e => {
  loadBestsellers(e.target.value);
});

// Initialize
loadGenres();
loadBestsellers();
loadRecommendations();
