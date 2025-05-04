const searchInput = document.getElementById('search');
const bookResults = document.getElementById('book-results');
const backBtn = document.getElementById('back');
const refreshBtn = document.getElementById('refresh');
const themeToggle = document.getElementById('theme-toggle');
const genreFilter = document.getElementById('genre-filter');
const bestsellersContainer = document.getElementById('bestsellers');

const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=';

let recommendedBooks = [];

async function fetchBooks(query = 'bestseller') {
  const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.items || [];
}

function displayBooks(books, container) {
  container.innerHTML = '';
  books.forEach(book => {
    const info = book.volumeInfo;
    const card = document.createElement('div');
    card.className = 'book';
    card.innerHTML = `
      <img src="${info.imageLinks?.thumbnail || ''}" alt="cover">
      <h4>${info.title}</h4>
      <p>${info.authors?.join(', ') || 'Unknown'}</p>
      <p>⭐ ${info.averageRating || 'N/A'}</p>
    `;
    container.appendChild(card);
  });
}

async function loadInitialBooks() {
  const books = await fetchBooks('bestseller');
  recommendedBooks = books;
  displayBooks(books.slice(0, 10), bookResults);
  displayBooks(books.slice(10, 20), bestsellersContainer);
}

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) {
    displayBooks(recommendedBooks.slice(0, 10), bookResults);
    backBtn.style.display = 'none';
    return;
  }
  const results = await fetchBooks(query);
  displayBooks(results.slice(0, 10), bookResults);
  backBtn.style.display = 'inline-block';
});

backBtn.addEventListener('click', () => {
  displayBooks(recommendedBooks.slice(0, 10), bookResults);
  searchInput.value = '';
  backBtn.style.display = 'none';
});

refreshBtn.addEventListener('click', loadInitialBooks);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

async function init() {
  document.body.classList.add('light');
  await loadInitialBooks();
}

init();
