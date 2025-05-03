// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const bookList = document.getElementById('book-list');
const genreFilter = document.getElementById('genre-filter');
const recommendationContainer = document.getElementById('recommendation-container');
const refreshBtn = document.getElementById('refresh-btn');

// Set default theme from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  loadBestsellers();
  loadRecommendations();
});

// Theme Toggle Handler
themeToggleBtn.addEventListener('click', () => {
  const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '🌞' : '🌙';
}

// Load Bestseller Books (Dummy Data)
function loadBestsellers(genre = 'All') {
  bookList.innerHTML = '';

  // Example dummy data
  const books = [
    { title: 'Masterclass: Write a Bestseller', author: 'Jacq Burns', cover: 'https://covers.openlibrary.org/b/id/9355607-L.jpg', genre: 'Writing' },
    { title: 'The Making of a Bestseller', author: 'Arthur T. Vanderbilt', cover: 'https://covers.openlibrary.org/b/id/8228691-L.jpg', genre: 'Publishing' },
    { title: 'The Bestseller Code', author: 'Jodie Archer', cover: 'https://covers.openlibrary.org/b/id/8079701-L.jpg', genre: 'Analytics' },
    { title: 'Space, Place, and Bestsellers', author: 'Lisa Fletcher', cover: 'https://covers.openlibrary.org/b/id/8098832-L.jpg', genre: 'Academic' }
  ];

  const filteredBooks = genre === 'All' ? books : books.filter(book => book.genre === genre);

  if (filteredBooks.length === 0) {
    bookList.innerHTML = '<p>No books found.</p>';
    return;
  }

  filteredBooks.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div>
        <strong>${book.title}</strong><br>
        <span>${book.author}</span>
      </div>
    `;
    bookList.appendChild(card);
  });
}

// Genre Filter Change
genreFilter.addEventListener('change', (e) => {
  const genre = e.target.value;
  loadBestsellers(genre);
});

// Load Recommendations (Dummy)
function loadRecommendations() {
  recommendationContainer.innerHTML = '';

  // Dummy data
  const recs = [
    {
      title: "On Writing",
      author: "Stephen King",
      description: "A memoir of the craft from one of the most prolific authors of our time.",
      cover: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
      rating: 4.8
    }
  ];

  if (recs.length === 0) {
    recommendationContainer.innerHTML = '<p>No recommendations available.</p>';
    return;
  }

  recs.forEach(book => {
    const rec = document.createElement('div');
    rec.className = 'book-card';
    rec.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div>
        <strong>${book.title}</strong><br>
        <span>${book.author}</span><br>
        <small>${book.description}</small><br>
        <em>⭐ ${book.rating}</em>
      </div>
    `;
    recommendationContainer.appendChild(rec);
  });
}

// Refresh Recommendations
refreshBtn.addEventListener('click', () => {
  loadRecommendations(); // In real case, fetch new data
});
