# QuickNotes API Design

## Overview

The QuickNotes API provides endpoints for creating, managing, organizing, and retrieving notes. All endpoints return JSON and require authentication unless stated otherwise.

### Base URL

```text
https://api.quicknotes.com/v1
```

### Authentication

Requests must include a bearer token:

```http
Authorization: Bearer <access-token>
```

---

## Endpoints

| Method | Path | Description | Success Status |
|----------|----------|----------|----------|
| POST | /notes | Create a new note | 201 Created |
| GET | /notes | List all notes for the authenticated user | 200 OK |
| GET | /notes/{id} | Retrieve a single note by ID | 200 OK |
| PUT | /notes/{id} | Update an existing note | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /notes/search?q={term} | Search notes by text | 200 OK |
| GET | /categories | List available categories | 200 OK |
| PATCH | /notes/{id}/archive | Archive or unarchive a note | 200 OK |

---

## Data Model

### Note

```json
{
  "id": "note_123",
  "text": "Buy groceries after work",
  "category": "Personal",
  "createdAt": "2026-11-23T09:00:00Z",
  "archived": false
}
```

---

## Create Note

### Request

**POST /notes**

```json
{
  "text": "Buy groceries after work",
  "category": "Personal"
}
```

### Successful Response

**201 Created**

```json
{
  "id": "note_123",
  "text": "Buy groceries after work",
  "category": "Personal",
  "createdAt": "2026-11-23T09:00:00Z",
  "archived": false
}
```

---

## List Notes

### Request

**GET /notes**

### Successful Response

**200 OK**

```json
[
  {
    "id": "note_123",
    "text": "Buy groceries after work",
    "category": "Personal",
    "createdAt": "2026-11-23T09:00:00Z",
    "archived": false
  },
  {
    "id": "note_124",
    "text": "Finish project documentation",
    "category": "Work",
    "createdAt": "2026-11-23T10:15:00Z",
    "archived": false
  }
]
```

---

## Get Note

### Request

**GET /notes/{id}**

### Successful Response

**200 OK**

```json
{
  "id": "note_123",
  "text": "Buy groceries after work",
  "category": "Personal",
  "createdAt": "2026-11-23T09:00:00Z",
  "archived": false
}
```

---

## Update Note

### Request

**PUT /notes/{id}**

```json
{
  "text": "Buy groceries and cleaning supplies",
  "category": "Personal"
}
```

### Successful Response

**200 OK**

```json
{
  "id": "note_123",
  "text": "Buy groceries and cleaning supplies",
  "category": "Personal",
  "createdAt": "2026-11-23T09:00:00Z",
  "archived": false
}
```

---

## Delete Note

### Request

**DELETE /notes/{id}**

### Successful Response

**204 No Content**

Response body is empty.

---

## Search Notes

### Request

**GET /notes/search?q=groceries**

### Successful Response

**200 OK**

```json
[
  {
    "id": "note_123",
    "text": "Buy groceries after work",
    "category": "Personal",
    "createdAt": "2026-11-23T09:00:00Z",
    "archived": false
  }
]
```

---

## List Categories

### Request

**GET /categories**

### Successful Response

**200 OK**

```json
[
  "Personal",
  "Work",
  "Study",
  "Ideas"
]
```

---

## Archive Note

### Request

**PATCH /notes/{id}/archive**

```json
{
  "archived": true
}
```

### Successful Response

**200 OK**

```json
{
  "id": "note_123",
  "text": "Buy groceries after work",
  "category": "Personal",
  "createdAt": "2026-11-23T09:00:00Z",
  "archived": true
}
```

---

## Error Responses

The API may return the following error status codes.

| Status Code | Meaning |
|------------|----------|
| 400 Bad Request | Request payload is invalid |
| 401 Unauthorized | Missing or invalid authentication token |
| 403 Forbidden | User does not have permission to access the resource |
| 404 Not Found | Requested resource does not exist |
| 500 Internal Server Error | Unexpected server error |

### Error Response Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested note could not be found."
  }
}
```

### Example: 400 Bad Request

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The text field is required."
  }
}
```

### Example: 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

### Example: 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource."
  }
}
```

### Example: 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested note could not be found."
  }
}
```

### Example: 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```