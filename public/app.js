const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const refreshBtn = document.getElementById('refresh-btn');
const recommendationContainer = document.getElementById('recommendation-books');
const backBtn = document.getElementById('back-btn');
const genreSelect = document.getElementById('genre-select');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const bestsellerList = document.getElementById('bestseller-list');

const bestsellerTitles = [
  "Atomic Habits", "The Silent Patient", "The Midnight Library", "The Four Agreements",
  "Verity", "It Ends with Us", "The Subtle Art of Not Giving a F*ck", 
  "The Alchemist", "Where the Crawdads Sing", "Educated"
];

// Fetch and display bestsellers
async function displayBestsellers() {
  bestsellerList.innerHTML = '';
  for (const title of bestsellerTitles) {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data.items && data.items[0]) {
      const book = data.items[0].volumeInfo;
      const bookEl = document.createElement('div');
      bookEl.className = 'book-card';
      bookEl.innerHTML = `
        <img src="${book.imageLinks?.thumbnail || 'fallback.jpg'}" alt="${book.title}" />
        <p>${book.title}</p>
      `;
      bookEl.onclick = () => window.open(data.items[0].volumeInfo.infoLink, '_blank');
      bestsellerList.appendChild(bookEl);
    }
  }
}

// Fetch recommended books based on genre
async function fetchRecommendedBooks(genre = '') {
  recommendationContainer.innerHTML = '';
  const query = genre ? `subject:${genre}` : 'fiction';
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`);
  const data = await res.json();

  if (data.items) {
    data.items.forEach(book => {
      const info = book.volumeInfo;
      const bookEl = document.createElement('div');
      bookEl.className = 'book-card';
      bookEl.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || 'fallback.jpg'}" alt="${info.title}" />
        <p>${info.title}</p>
      `;
      bookEl.onclick = () => window.open(info.infoLink, '_blank');
      recommendationContainer.appendChild(bookEl);
    });
  }
}

// Populate genres dynamically
async function loadGenres() {
  const genres = [
    'Fiction', 'Fantasy', 'Science', 'History', 'Biography', 'Romance',
    'Mystery', 'Thriller', 'Self-help', 'Health', 'Travel', 'Art'
  ];
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
}

// Predictive search function
async function searchBooks(query) {
  if (!query.trim()) return;
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`);
  const data = await res.json();
  searchResults.innerHTML = '';
  if (data.items) {
    data.items.forEach(book => {
      const info = book.volumeInfo;
      const bookEl = document.createElement('div');
      bookEl.className = 'book-card';
      bookEl.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || 'fallback.jpg'}" alt="${info.title}" />
        <p>${info.title}</p>
      `;
      bookEl.onclick = () => window.open(info.infoLink, '_blank');
      searchResults.appendChild(bookEl);
    });
    searchResults.style.display = 'grid';
    backBtn.style.display = 'inline-block';
  }
}

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeIcon.src = isDark ? 'assets/moon-icon.svg' : 'assets/sun-icon.svg';
});

// Refresh recommendations
refreshBtn.addEventListener('click', () => {
  fetchRecommendedBooks(genreSelect.value);
});

// Event listeners
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    searchBooks(query);
  } else {
    searchResults.innerHTML = '';
    backBtn.style.display = 'none';
  }
});

backBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchResults.innerHTML = '';
  backBtn.style.display = 'none';
});

genreSelect.addEventListener('change', () => {
  fetchRecommendedBooks(genreSelect.value);
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(() => {
    console.log('Service Worker Registered');
  });
}

// Init
loadGenres();
displayBestsellers();
fetchRecommendedBooks();
