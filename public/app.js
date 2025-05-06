const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.querySelector('.search-results');
const recommendationsContainer = document.querySelector('.recommendations');
const genreFilter = document.getElementById('genreFilter');
const refreshButton = document.getElementById('refreshButton');
const searchButton = document.getElementById('searchButton');

let allGenres = new Set();
let currentGenre = '';

async function fetchRecommendedBooks() {
  const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=20');
  const data = await res.json();
  const books = data.items || [];

  recommendationsContainer.innerHTML = `<h2>Recommended Books</h2>`;
  books.slice(0, 10).forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/60x90'}" alt="${info.title}" />
      <div class="details">
        <h3>${info.title}</h3>
        <p>${info.authors?.join(', ') || 'Unknown Author'}</p>
      </div>
    `;
    card.onclick = () => window.open(info.infoLink, '_blank');
    recommendationsContainer.appendChild(card);
  });
}

async function fetchGenres() {
  const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40');
  const data = await res.json();
  const genres = new Set();
  (data.items || []).forEach(book => {
    const categories = book.volumeInfo?.categories || [];
    categories.forEach(c => genres.add(c));
  });

  genreFilter.innerHTML = '';
  [...genres].sort().forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.textContent = g;
    genreFilter.appendChild(option);
  });

  allGenres = genres;
}

async function fetchBestsellersByGenre(genre) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&orderBy=relevance&maxResults=10`);
  const data = await res.json();
  const books = data.items || [];

  const list = document.getElementById('bestsellerList');
  list.innerHTML = '';
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/60x90'}" alt="${info.title}" />
      <div class="details">
        <h3>${info.title}</h3>
        <p>${info.authors?.join(', ') || 'Unknown Author'}</p>
      </div>
    `;
    card.onclick = () => window.open(info.infoLink, '_blank');
    list.appendChild(card);
  });
}

function debounce(func, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleSearch = debounce(async () => {
  const query = searchInput.value.trim();
  if (!query) {
    searchResultsContainer.style.display = 'none';
    recommendationsContainer.style.display = 'block';
    return;
  }

  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
  const data = await res.json();
  const books = data.items || [];

  searchResultsContainer.innerHTML = `<h2>Search Results</h2>`;
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || 'https://via.placeholder.com/60x90'}" alt="${info.title}" />
      <div class="details">
        <h3>${info.title}</h3>
        <p>${info.authors?.join(', ') || 'Unknown Author'}</p>
      </div>
    `;
    card.onclick = () => window.open(info.infoLink, '_blank');
    searchResultsContainer.appendChild(card);
  });

  searchResultsContainer.style.display = 'block';
  recommendationsContainer.style.display = 'none';
}, 300);

searchInput.addEventListener('input', handleSearch);
searchButton.addEventListener('click', handleSearch);

refreshButton.addEventListener('click', fetchRecommendedBooks);
genreFilter.addEventListener('change', e => {
  currentGenre = e.target.value;
  fetchBestsellersByGenre(currentGenre);
});

// === Init ===
window.addEventListener('DOMContentLoaded', async () => {
  await fetchGenres();
  const firstGenre = genreFilter.options[0]?.value;
  if (firstGenre) {
    currentGenre = firstGenre;
    fetchBestsellersByGenre(currentGenre);
  }
  fetchRecommendedBooks();
});
