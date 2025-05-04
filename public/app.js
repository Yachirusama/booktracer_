const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const backBtn = document.getElementById('backBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const recommendedBooks = document.getElementById('recommendedBooks');
const searchResults = document.getElementById('searchResults');
const loadingSpinner = document.getElementById('loading');
const genreDropdown = document.getElementById('genreDropdown');
const recRefreshBtn = document.getElementById('recRefreshBtn');
const genreFilter = document.getElementById('genreFilter');
const bestsellerList = document.getElementById('bestsellerList');

let currentTheme = localStorage.getItem('theme') || 'light';

document.body.classList.toggle('dark-theme', currentTheme === 'dark');
themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('dark-theme', currentTheme === 'dark');
  localStorage.setItem('theme', currentTheme);
  themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

function showLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
}

function fetchRecommendedBooks(genre = '') {
  showLoading(true);
  recommendedBooks.innerHTML = '';
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${genre || 'fiction'}&maxResults=5`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      data.items.forEach(book => {
        const div = document.createElement('div');
        div.className = 'book-card';
        div.innerHTML = `
          <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" />
          <p>${book.volumeInfo.title}</p>
          <p>⭐ ${book.volumeInfo.averageRating || 'N/A'}</p>
        `;
        recommendedBooks.appendChild(div);
      });
      showLoading(false);
    })
    .catch(() => showLoading(false));
}

function fetchTopBestsellers(genre = '') {
  const sampleBooks = [
    "Tiny Habits", "The Silent Patient", "The Midnight Library",
    "Wisdom from the Four Agreements", "Summary of Verity by Colleen Hoover",
    "It Ends with Us", "Summary: The Subtle Art of Not Giving a F*ck",
    "Greenlights", "The 48 Laws of Power", "Educated"
  ];
  bestsellerList.innerHTML = '';
  sampleBooks.forEach((title, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<img src="https://covers.openlibrary.org/b/id/${index + 100}-S.jpg" alt="cover" />
                    <span>${title}</span>`;
    bestsellerList.appendChild(li);
  });
}

function performSearch(query) {
  if (!query) return;
  showLoading(true);
  searchResults.innerHTML = '';
  searchResults.style.display = 'grid';
  recommendedBooks.parentElement.style.display = 'none';
  backBtn.style.display = 'inline-block';

  const sources = [
    `https://api.itbook.store/1.0/search/${encodeURIComponent(query)}`,
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`,
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  ];

  Promise.all(sources.map(url => fetch(url).then(res => res.json())))
    .then(([itbook, google, openlib]) => {
      if (itbook.books) {
        itbook.books.forEach(book => {
          addBookToResults(book.title, book.image, book.url);
        });
      }
      if (google.items) {
        google.items.forEach(book => {
          const info = book.volumeInfo;
          addBookToResults(info.title, info.imageLinks?.thumbnail, info.infoLink);
        });
      }
      if (openlib.docs) {
        openlib.docs.forEach(book => {
          const img = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '';
          addBookToResults(book.title, img, `https://openlibrary.org${book.key}`);
        });
      }
    })
    .finally(() => showLoading(false));
}

function addBookToResults(title, image, link) {
  const div = document.createElement('div');
  div.className = 'book-card';
  div.innerHTML = `
    <a href="${link}" target="_blank">
      <img src="${image || ''}" alt="Book Cover">
      <p>${title}</p>
    </a>
  `;
  searchResults.appendChild(div);
}

// Event Listeners
searchBtn.addEventListener('click', () => performSearch(searchInput.value));
searchInput.addEventListener('input', () => {
  if (!searchInput.value) {
    backBtn.click();
  }
});
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') performSearch(searchInput.value);
});

backBtn.addEventListener('click', () => {
  searchResults.style.display = 'none';
  recommendedBooks.parentElement.style.display = 'block';
  backBtn.style.display = 'none';
  searchInput.value = '';
});

refreshBtn.addEventListener('click', () => performSearch(searchInput.value));
recRefreshBtn.addEventListener('click', () => fetchRecommendedBooks(genreDropdown.value));
genreDropdown.addEventListener('change', () => fetchRecommendedBooks(genreDropdown.value));
genreFilter.addEventListener('change', () => fetchTopBestsellers(genreFilter.value));

// Initial Load
fetchRecommendedBooks();
fetchTopBestsellers();
