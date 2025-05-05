const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const backBtn = document.getElementById('backBtn');
const themeToggle = document.getElementById('themeToggle');
const recommendationsContainer = document.querySelector('.recommendations');
const searchResultsContainer = document.querySelector('.search-results');
const genreSelect = document.getElementById('genreSelect');
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
  card.classList.add('book-card');
  card.innerHTML = `
    <img src="${book.image}" alt="${book.title}" />
    <div class="book-info">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p class="rating">⭐ ${book.rating || 'N/A'}</p>
    </div>
  `;
  card.addEventListener('click', () => {
    if (book.link) window.open(book.link, '_blank');
  });
  return card;
}

async function fetchTopBooks(genre = '') {
  bestsellersContainer.innerHTML = 'Loading...';
  // Replace this with your actual API
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

async function fetchRecommendedBooks() {
  recommendationsContainer.innerHTML = 'Loading...';
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=fiction&orderBy=newest&maxResults=5`);
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
  recommendationsContainer.style.display = 'none';
  searchResultsContainer.style.display = 'flex';
  searchResultsContainer.innerHTML = 'Searching...';
  backBtn.style.display = 'inline-block';

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
  const data = await res.json();
  searchResultsContainer.innerHTML = '';

  if (!data.items?.length) {
    searchResultsContainer.textContent = 'No results found.';
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
    searchResultsContainer.appendChild(createBookCard(book));
  });
}

searchBtn.addEventListener('click', () => {
  searchBooks(searchInput.value);
});

searchInput.addEventListener('input', () => {
  if (searchInput.value.trim()) {
    searchBooks(searchInput.value);
  } else {
    backBtn.click();
  }
});

refreshBtn.addEventListener('click', () => {
  fetchRecommendedBooks();
});

backBtn.addEventListener('click', () => {
  searchResultsContainer.innerHTML = '';
  searchResultsContainer.style.display = 'none';
  recommendationsContainer.style.display = 'flex';
  backBtn.style.display = 'none';
  searchInput.value = '';
});

genreSelect.addEventListener('change', () => {
  fetchTopBooks(genreSelect.value);
});

// Initial load
fetchGenres();
fetchRecommendedBooks();
fetchTopBooks();
