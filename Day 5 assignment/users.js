// API base path described in library-api.md. Serve this page from the same
// origin as the library API, or change this value to the API server's URL.
const API_URL = "/api/books";

const loadBtn = document.querySelector("#load-books");
const authorFilter = document.querySelector("#author-filter");
const statusText = document.querySelector("#status");
const booksList = document.querySelector("#books-list");

let books = [];

function renderBooks() {
  const query = authorFilter.value.trim().toLowerCase();
  const visibleBooks = books.filter((book) =>
    book.author.toLowerCase().includes(query),
  );

  booksList.replaceChildren();

  visibleBooks.forEach((book) => {
    const item = document.createElement("li");
    const title = document.createElement("h2");
    const author = document.createElement("p");
    const isbn = document.createElement("p");

    title.textContent = book.title;
    author.textContent = `Author: ${book.author}`;
    isbn.textContent = `ISBN: ${book.isbn}`;
    item.append(title, author, isbn);
    booksList.appendChild(item);
  });

  if (books.length > 0) {
    statusText.textContent = query
      ? `Showing ${visibleBooks.length} of ${books.length} books.`
      : `Loaded ${books.length} books.`;
  }
}

async function loadBooks() {
  statusText.textContent = "Loading books...";
  loadBtn.disabled = true;
  booksList.replaceChildren();
  books = [];

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);

    books = await response.json();
    renderBooks();
    if (books.length === 0) statusText.textContent = "No books found.";
  } catch (error) {
    statusText.textContent = "Could not load books. Please try again.";
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener("click", loadBooks);
authorFilter.addEventListener("input", renderBooks);
