document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const backBtn = document.getElementById('back-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const recommendationContainer = document.getElementById('recommendation-books');
  const recommendationGenreDropdown = document.getElementById('recommendation-genre');
  const sidebarGenreDropdown = document.getElementById('sidebar-genre');
  const bestsellersList = document.getElementById('bestsellers-list');
  const resultsSection = document.getElementById('results');

  const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=';
  const BESTSELLER_KEYWORDS = ['bestsellers', 'top 10 books', 'best books 2024'];
  const GENRES = ['All Genres', 'Fiction', 'Science', 'History', 'Fantasy', 'Biography', 'Children', 'Horror', 'Romance', 'Mystery'];

  // Toggle dark/light theme
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeIcon.classList.toggle('fa-sun');
    themeIcon.classList.toggle('fa-moon');
  });

  // Fetch genres
  function populateGenres() {
    GENRES.forEach(genre => {
      const option1 = new Option(genre, genre);
      const option2 = new Option(genre, genre);
      if (sidebarGenreDropdown) sidebarGenreDropdown.appendChild(option1);
      if (recommendationGenreDropdown) recommendationGenreDropdown.appendChild(option2);
    });
  }

  // Fetch recommended books
  async function fetchRecommendations(genre = 'Fiction') {
    try {
      const query = genre === 'All Genres' ? 'book' : genre;
      const res = await fetch(`${API_URL}${encodeURIComponent(query)}&maxResults=10`);
      const data = await res.json();
      displayBooks(data.items || [], recommendationContainer);
    } catch (err) {
      console.error('Recommendation error:', err);
    }
  }

  // Fetch bestsellers (mocked by genre keywords)
  async function fetchBestsellers(genre = 'All Genres') {
    try {
      const query = genre === 'All Genres' ? BESTSELLER_KEYWORDS.join('|') : genre;
      const res = await fetch(`${API_URL}${encodeURIComponent(query)}&maxResults=10`);
      const data = await res.json();
      displayBooks(data.items || [], bestsellersList);
    } catch (err) {
      console.error('Bestseller error:', err);
    }
  }

  // Display books in a container
  function displayBooks(books, container) {
    if (!container) return;
    container.innerHTML = '';
    books.forEach(book => {
      const info = book.volumeInfo;
      const cover = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
      const rating = info.averageRating || 'No Rating';
      const title = info.title || 'Untitled';

      const card = document.createElement('div');
      card.className = 'book-card';
      card.innerHTML = `
        <img src="${cover}" alt="${title}">
        <div class="book-info">
          <h4>${title}</h4>
          <p><i class="fa fa-star"></i> ${rating}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Live search
  searchInput?.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (!query) {
      resultsSection.innerHTML = '';
      backBtn?.classList.add('hidden');
      return;
    }

    try {
      const res = await fetch(`${API_URL}${encodeURIComponent(query)}&maxResults=20`);
      const data = await res.json();
      displayBooks(data.items || [], resultsSection);
      backBtn?.classList.remove('hidden');
    } catch (err) {
      console.error('Search error:', err);
    }
  });

  // Refresh recommendations
  refreshBtn?.addEventListener('click', () => {
    const selectedGenre = recommendationGenreDropdown?.value || 'Fiction';
    fetchRecommendations(selectedGenre);
  });

  // Back button
  backBtn?.addEventListener('click', () => {
    resultsSection.innerHTML = '';
    searchInput.value = '';
    backBtn.classList.add('hidden');
  });

  // Genre filter listeners
  sidebarGenreDropdown?.addEventListener('change', () => {
    fetchBestsellers(sidebarGenreDropdown.value);
  });

  recommendationGenreDropdown?.addEventListener('change', () => {
    fetchRecommendations(recommendationGenreDropdown.value);
  });

  // Initial load
  populateGenres();
  fetchRecommendations();
  fetchBestsellers();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered.'))
      .catch(err => console.error('Service Worker failed:', err));
  }
});
