# QuickNotes System Design

QuickNotes is a browser-based notes client and a system design package for a service expected to support one million registered users. The front end demonstrates GET, POST, and DELETE requests against the JSONPlaceholder practice API; the `docs/` files describe the production API, relational data model, and scalable architecture.

## Run the API client

Open `index.html` in a modern browser, or serve the project directory with a local static web server. Select **Load Notes** to fetch up to 10 posts. Use the form to create a note or **Delete** to remove one. The browser needs internet access to reach JSONPlaceholder.

JSONPlaceholder simulates successful POST and DELETE requests without persisting changes. Created and deleted notes are reflected in the current page state; reloading notes or refreshing the page returns the server's sample data.

## Design documents

- [API design](docs/api-design.md) — production REST endpoints, examples, and error responses.
- [Data model](docs/data-model.md) — PostgreSQL tables, relationships, indexes, and sample queries.
- [Architecture](docs/architecture.md) — requirements, capacity estimates, architecture diagram, request flows, and trade-offs.

## Project files

```text
quicknotes-system-design/
├── about.html
├── api.js
├── docs/
│   ├── api-design.md
│   ├── architecture.md
│   └── data-model.md
├── index.html
├── README.md
└── style.css
```

## What I learned

- How to structure an asynchronous API client with reusable fetch handling, validation, request states, and user-friendly errors.
- Why SQL constraints, foreign keys, indexes, and transactions help preserve ownership and consistency across related data.
- How a cache, read replica, load-balanced app servers, and durable queue address different performance and availability needs.
- How to make capacity estimates explicit by stating daily activity, peak traffic, payload-size, and storage-overhead assumptions.
