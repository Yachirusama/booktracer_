// Toggle Dark Mode
document.getElementById('themeToggle').addEventListener('change', function () {
  document.body.classList.toggle('dark', this.checked);
});

// Fetch Top 10 Bestsellers for Sidebar
async function loadTopBooks() {
  const topBooksList = document.getElementById('topBooksList');
  topBooksList.innerHTML = '<li>Loading...</li>';
  try {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=bestseller&maxResults=10');
    const data = await res.json();
    topBooksList.innerHTML = '';

    data.items.forEach(book => {
      const li = document.createElement('li');
      const info = book.volumeInfo;
      const link = document.createElement('a');
      link.href = info.infoLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const thumbnail = document.createElement('img');
      thumbnail.src = info.imageLinks?.thumbnail || '';
      thumbnail.alt = info.title;

      const title = document.createElement('span');
      title.textContent = info.title;

      link.appendChild(thumbnail);
      link.appendChild(title);
      li.appendChild(link);
      topBooksList.appendChild(li);
    });
  } catch (err) {
    topBooksList.innerHTML = '<li>Failed to load books</li>';
    console.error(err);
  }
}

// Load Recommended Books (3 books)
async function loadRecommendedBooks() {
  const container = document.getElementById('recommendedBook');
  container.innerHTML = '<h3>📘 Recommended Books</h3><div class="recommendation-grid" id="recommendGrid"></div><button class="refresh-btn" onclick="loadRecommendedBooks()">🔄 Refresh Recommendations</button>';

  const grid = document.getElementById('recommendGrid');
  grid.innerHTML = 'Loading...';

  try {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=fantasy&maxResults=40');
    const data = await res.json();

    const selected = [];
    while (selected.length < 3) {
      const rand = data.items[Math.floor(Math.random() * data.items.length)];
      if (!selected.includes(rand)) selected.push(rand);
    }

    grid.innerHTML = '';
    selected.forEach(book => {
      const info = book.volumeInfo;
      const card = document.createElement('div');
      card.className = 'recommendation-card';

      card.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}" />
        <h4>${info.title}</h4>
        <p><em>by ${info.authors?.join(', ') || 'Unknown'}</em></p>
        <p>${info.averageRating ? `⭐ ${info.averageRating}` : 'Not rated'}</p>
        <p>${info.description ? info.description.slice(0, 100) + '…' : 'No description available'}</p>
        <a href="${info.infoLink}" target="_blank">More Info</a>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<p>Failed to load recommendations.</p>';
    console.error(err);
  }
}

// Manual Search Function
async function searchBooksManual() {
  const input = document.getElementById('searchInput').value.trim();
  const resultsContainer = document.getElementById('bookResults');
  const backBtn = document.querySelector('.back-button');

  if (!input) return;

  resultsContainer.innerHTML = 'Searching...';
  backBtn.classList.remove('hidden');

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=20`);
    const data = await res.json();
    resultsContainer.innerHTML = '';

    data.items.forEach(book => {
      const info = book.volumeInfo;
      const card = document.createElement('div');
      card.className = 'book-card';

      card.innerHTML = `
        <img src="${info.imageLinks?.thumbnail || ''}" alt="${info.title}">
        <div class="book-info">
          <h4>${info.title}</h4>
          <p><em>by ${info.authors?.join(', ') || 'Unknown Author'}</em></p>
          <p>${info.description ? info.description.slice(0, 100) + '…' : 'No description'}</p>
          <a href="${info.infoLink}" target="_blank">More Info</a>
        </div>
      `;

      resultsContainer.appendChild(card);
    });
  } catch (err) {
    resultsContainer.innerHTML = '<p>Failed to fetch books</p>';
    console.error(err);
  }
}

function goBack() {
  document.getElementById('bookResults').innerHTML = '';
  document.querySelector('.back-button').classList.add('hidden');
}

// Load all on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  loadTopBooks();
  loadRecommendedBooks();
});
