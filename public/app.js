// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
  const isLight = body.getAttribute('data-theme') === 'light';
  body.setAttribute('data-theme', isLight ? 'dark' : 'light');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
});

// Basic search and display mockup (replace with real API logic)
const searchInput = document.getElementById('searchInput');
const bookResults = document.getElementById('bookResults');
const backButton = document.querySelector('.back-button');

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();
  if (!query) return;

  // Replace this mockup with your actual book fetching logic
  bookResults.innerHTML = `
    <div class="book-card">
      <h3>${query} Book Result</h3>
      <p>Author: Example Author</p>
    </div>
  `;
  backButton.classList.remove('hidden');
});

function goBack() {
  searchInput.value = '';
  bookResults.innerHTML = '';
  backButton.classList.add('hidden');
}
