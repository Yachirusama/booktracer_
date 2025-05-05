const searchInput = document.getElementById('searchInput');
const searchResultsDropdown = document.getElementById('search-results-dropdown');
const searchBtn = document.getElementById('searchButton');
const refreshBtn = document.getElementById('refreshRecommendations');
const backBtn = document.getElementById('backButton');
const themeToggle = document.getElementById('themeToggle');
const recommendationsContainer = document.getElementById('recommendations');
const searchResultsContainer = document.getElementById('search-results-section');
const genreSelect = document.getElementById('genreFilter');
const bestsellersContainer = document.getElementById('bestsellers');

let currentTheme = localStorage.getItem('theme') || 'light';

document.body.classList.toggle('dark', currentTheme === 'dark');
themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '🌞';

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('dark', currentTheme === 'dark');
  localStorage.setItem('theme', currentTheme);
  themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '🌞';
});

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <img src="${book.image}" alt="${book.title}" />
    <h3>${book.title}</h3>
    <p>${book.author}</p>
    <p>⭐ ${book.rating || 'N/A'}</p>
  `;
  card.addEventListener('click', () => {
    if (book.link) window.open(book.link, '_blank');
  });
  return card;
}

async function fetchRecommendedBooks() {
  recommendationsContainer.innerHTML = 'Loading...';
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=fiction&orderBy=newest&maxResults=7`);
  const data = await res.json();
  recommendationsContainer.innerHTML = '';
  data.items.forEach(item => {
    const book = {
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      image: item.volumeInfo.imageLinks?.thumbnail || '',
      rating: item.volumeInfo.averageRating || 'N/A',
      link: item.volumeInfo.infoLink
    };
    recommendationsContainer.appendChild(createBookCard(book));
  });
}

async function fetchTopBooks(genre = '') {
  bestsellersContainer.innerHTML = 'Loading...';
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre || 'bestsellers'}&orderBy=relevance&maxResults=10`);
  const data = await res.json();
  bestsellersContainer.innerHTML = '';
  data.items.forEach(item => {
    const book = {
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      image: item.volumeInfo.imageLinks?.thumbnail || '',
      rating: item.volumeInfo.averageRating || 'N/A',
      link: item.volumeInfo.infoLink
    };
    bestsellersContainer.appendChild(createBookCard(book));
  });
}

async function fetchGenres() {
  const genres = ['Fiction', 'Mystery', 'Fantasy', 'Romance', 'History', 'Biography', 'Science', 'Comics', 'Children', 'Poetry'];
  genres.forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.textContent = g;
    genreSelect.appendChild(option);
  });
}

async function searchBooks(query) {
  if (!query.trim()) return;
  searchResultsDropdown.innerHTML = '';
  searchResultsDropdown.style.display = 'block';

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8`);
  const data = await res.json();

  if (!data.items?.length) {
    searchResultsDropdown.innerHTML = '<div class="search-result-item">No results found.</div>';
    return;
  }

  data.items.forEach(item => {
    const book = {
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', ') || 'Unknown',
      image: item.volumeInfo.imageLinks?.thumbnail || '',
      rating: item.volumeInfo.averageRating || 'N/A',
      link: item.volumeInfo.infoLink
    };

    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <strong>${book.title}</strong><br>
      <small>${book.author}</small>
    `;
    resultItem.addEventListener('click', () => {
      searchResultsDropdown.style.display = 'none';
      searchResultsContainer.innerHTML = '';
      searchResultsContainer.style.display = 'block';
      backBtn.style.display = 'inline-block';
      recommendationsContainer.style.display = 'none';
      searchResultsContainer.appendChild(createBookCard(book));
    });

    searchResultsDropdown.appendChild(resultItem);
  });
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  if (query.trim()) {
    searchBooks(query);
  } else {
    searchResultsDropdown.style.display = 'none';
    backBtn.click();
  }
});

searchBtn.addEventListener('click', () => {
  searchBooks(searchInput.value);
});

refreshBtn.addEventListener('click', () => {
  fetchRecommendedBooks();
});

backBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchResultsDropdown.style.display = 'none';
  searchResultsContainer.innerHTML = '';
  searchResultsContainer.style.display = 'none';
  recommendationsContainer.style.display = 'flex';
  backBtn.style.display = 'none';
});

genreSelect.addEventListener('change', () => {
  fetchTopBooks(genreSelect.value);
});

// Initialize
fetchGenres();
fetchTopBooks();
fetchRecommendedBooks();
