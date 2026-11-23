# Library Books REST API

Base path: `/api/books`

The API returns JSON. A book has this shape:

```json
{
  "id": 1,
  "title": "The Left Hand of Darkness",
  "author": "Ursula K. Le Guin",
  "isbn": "9780441007318"
}
```

## Endpoints

| Method | Path | Description | Example request body | Success |
|---|---|---|---|---|
| GET | `/api/books` | List all books. | — | `200 OK` |
| GET | `/api/books/{id}` | Get one book by its ID. | — | `200 OK` |
| POST | `/api/books` | Create a book. | `{"title":"Kindred","author":"Octavia E. Butler","isbn":"9780807083697"}` | `201 Created` |
| PUT | `/api/books/{id}` | Replace a book's editable fields. | `{"title":"Kindred","author":"Octavia E. Butler","isbn":"9780807083697"}` | `200 OK` |
| DELETE | `/api/books/{id}` | Delete a book by its ID. | — | `204 No Content` |
| GET | `/api/books?author={name}` | List books whose author matches the supplied name (case-insensitive substring match). | — | `200 OK` |

For `POST` and `PUT`, `title`, `author`, and `isbn` are required strings. The server assigns `id` when creating a book.

## Errors

- `400 Bad Request` — the request is invalid, such as a `POST` body missing the required `title` or containing an invalid ISBN.
- `404 Not Found` — the requested book ID does not exist, such as `GET /api/books/9999`.

## Page integration

`index.html` loads `users.js`, which requests `GET /api/books` and renders book titles, authors, and ISBNs. Its author filter narrows the books already loaded in the browser. Serve the page from the same origin as the API, or change `API_URL` in `users.js` to the API server's full URL.
