body {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  transition: background 0.4s, color 0.4s;
  background: #fafafa;
  color: #111;
}

body.dark {
  background: #121212;
  color: #eee;
}

/* Header & Branding */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  flex-wrap: wrap;
}

.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.branding .logo {
  height: 80px;
  width: auto;
}

.slogan {
  font-size: 1.2rem;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  color: #555;
}

body.dark .slogan {
  color: #ccc;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.search-bar input[type="text"] {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  max-width: 250px;
}

.search-bar button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.search-bar button:hover {
  transform: scale(1.2);
}

/* Book Cards */
.book-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
}

.book-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 0.5rem;
  width: 150px;
  text-align: center;
  transition: transform 0.2s ease;
  cursor: pointer;
}

body.dark .book-card {
  background: #1e1e1e;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-card img {
  width: 100%;
  height: auto;
  border-radius: 5px;
}

.book-title {
  font-weight: bold;
  margin-top: 0.5rem;
}

.book-author {
  font-size: 0.9rem;
  color: #666;
}

body.dark .book-author {
  color: #aaa;
}

.book-rating {
  color: #f39c12;
  font-size: 0.9rem;
}

/* Main Layout */
main {
  display: flex;
  flex-direction: row;
}

.sidebar {
  flex: 0 0 250px;
  padding: 1rem;
}

.content {
  flex: 1;
}

#genre-select {
  margin: 0.5rem 0;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

/* Headings */
h2 {
  padding-left: 1rem;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .search-bar {
    width: 100%;
    justify-content: flex-start;
  }

  main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
