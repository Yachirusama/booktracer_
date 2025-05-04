document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const backBtn = document.getElementById('backBtn');
  const recommendationContainer = document.getElementById('recommendationContainer');
  const refreshBtn = document.getElementById('refreshBtn');
  const genreFilter = document.getElementById('genreFilter');
  const bestsellerList = document.getElementById('bestsellerList');

  async function fetchRecommendedBooks() {
    recommendationContainer.innerHTML = 'Loading...';
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=bestseller');
    const data = await res.json();
    renderBooks(data.items.slice(0, 5), recommendationContainer);
  }

  function renderBooks(books, container) {
    container.innerHTML = '';
    books.forEach(book => {
      const info = book.volumeInfo;
      const div = document.createElement('div');
      div.className = 'book';
      div.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}" />
        <h4>${info.title}</h4>
        <p>${info.authors?.join(', ') || ''}</p>
        <small>⭐ ${info.averageRating || 'N/A'}</small>
      `;
      container.appendChild(div);
    });
  }

  async function searchBooks(query) {
    searchResults.innerHTML = 'Searching...';
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderBooks(data.items || [], searchResults);
  }

  async function loadGenres() {
    const genres = ['Fiction', 'Romance', 'Mystery', 'Science', 'History', 'Fantasy'];
    genres.forEach(g => {
      const option = document.createElement('option');
      option.value = g;
      option.textContent = g;
      genreFilter.appendChild(option);
    });
  }

  async function loadBestsellersByGenre(genre = '') {
    const q = genre ? `subject:${genre}` : 'bestseller';
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}`);
    const data = await res.json();
    renderBooks(data.items.slice(0, 10), bestsellerList);
  }

  refreshBtn.addEventListener('click', fetchRecommendedBooks);

  searchInput.addEventListener('input', e => {
    const val = e.target.value.trim();
    if (val) {
      searchBooks(val);
      backBtn.classList.remove('hidden');
    }
  });

  backBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchResults.innerHTML = '';
    backBtn.classList.add('hidden');
  });

  genreFilter.addEventListener('change', (e) => {
    loadBestsellersByGenre(e.target.value);
  });

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  });

  fetchRecommendedBooks();
  loadGenres();
  loadBestsellersByGenre();

  // Offline Mini Game
  if (!navigator.onLine) {
    document.getElementById('offline-game').classList.remove('hidden');
    startMiniGame();
  }

  function startMiniGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let x = 10, y = 120, vy = 0, gravity = 0.5, jumping = false;
    let obstacleX = 300, speed = 3;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00d9ff';
      ctx.fillRect(x, y, 20, 20);

      ctx.fillStyle = '#ff4757';
      ctx.fillRect(obstacleX, 120, 20, 20);

      if (jumping) {
        vy += gravity;
        y += vy;
        if (y >= 120) {
          y = 120;
          vy = 0;
          jumping = false;
        }
      }

      obstacleX -= speed;
      if (obstacleX < -20) {
        obstacleX = 300 + Math.random() * 100;
      }

      if (x < obstacleX + 20 && x + 20 > obstacleX && y < 140 && y + 20 > 120) {
        alert('Game Over!');
        obstacleX = 300;
      }

      requestAnimationFrame(draw);
    }

    canvas.addEventListener('click', () => {
      if (!jumping) {
        vy = -8;
        jumping = true;
      }
    });

    draw();
  }
});
