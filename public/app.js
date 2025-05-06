document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const refreshButton = document.getElementById('refreshButton');
  const backButton = document.getElementById('backButton');
  const themeToggle = document.getElementById('themeToggle');
  const genreFilter = document.getElementById('genreFilter');
  const recommendationList = document.getElementById('recommendationList');
  const bestsellerList = document.getElementById('bestsellerList');
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  const searchResults = document.getElementById('searchResults');

  function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme', !isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }

  async function fetchRecommendedBooks() {
    recommendationList.innerHTML = 'Loading...';
    try {
      const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=6');
      const data = await res.json();
      renderBooks(data.items, recommendationList);
    } catch (err) {
      recommendationList.innerHTML = 'Failed to load recommendations.';
    }
  }

  async function fetchBestsellersByGenre(genre = 'fiction') {
    bestsellerList.innerHTML = '';
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=10`);
      const data = await res.json();
      renderBooks(data.items, bestsellerList);
    } catch (err) {
      bestsellerList.innerHTML = 'Failed to load bestsellers.';
    }
  }

  function renderBooks(books, container) {
    container.innerHTML = '';
    if (!books || books.length === 0) {
      container.innerHTML = '<p>No books found.</p>';
      return;
    }
    books.forEach(book => {
      const title = book.volumeInfo.title || 'No Title';
      const thumbnail = book.volumeInfo.imageLinks?.thumbnail || '';
      const infoLink = book.volumeInfo.infoLink || '#';
      const rating = book.volumeInfo.averageRating || 'N/A';

      const card = document.createElement('a');
      card.href = infoLink;
      card.target = '_blank';
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${thumbnail}" alt="${title}" />
        <div class="book-info">
          <h4>${title}</h4>
          <p>⭐ ${rating}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  async function searchBooks(query) {
    searchResultsContainer.style.display = 'block';
    recommendationList.style.display = 'none';
    bestsellerList.style.display = 'none';
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=12`);
      const data = await res.json();
      renderBooks(data.items, searchResults);
      backButton.style.display = 'inline-block';
    } catch (err) {
      searchResults.innerHTML = '<p>Search failed.</p>';
    }
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  if (refreshButton) refreshButton.addEventListener('click', () => {
    fetchRecommendedBooks();
  });

  if (searchInput && searchInput.addEventListener) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchBooks(query);
      } else {
        searchResultsContainer.style.display = 'none';
        recommendationList.style.display = 'flex';
        bestsellerList.style.display = 'block';
        backButton.style.display = 'none';
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchBooks(query);
      }
    });
  }

  if (backButton) {
    backButton.addEventListener('click', () => {
      searchInput.value = '';
      searchResultsContainer.style.display = 'none';
      recommendationList.style.display = 'flex';
      bestsellerList.style.display = 'block';
      backButton.style.display = 'none';
    });
  }

  if (genreFilter) {
    genreFilter.addEventListener('change', (e) => {
      fetchBestsellersByGenre(e.target.value);
    });

    const genres = ['Fiction', 'Mystery', 'Romance', 'Fantasy', 'History', 'Science', 'Biography', 'Poetry'];
    genreFilter.innerHTML = genres.map(g => `<option value="${g.toLowerCase()}">${g}</option>`).join('');
  }

  // Initial load
  fetchRecommendedBooks();
  fetchBestsellersByGenre();
});
