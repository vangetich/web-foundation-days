# QuickNotes Data Model

## Overview

QuickNotes allows users to create notes and organize them with tags. The data model uses a relational database to support structured data, relationships, and efficient querying.

---

# Entities

## 1. users

Stores account information for application users.

| Column | Type | Key | Description |
|----------|----------|----------|----------|
| id | BIGINT | Primary Key | Unique user identifier |
| username | VARCHAR(50) | Unique | User login name |
| email | VARCHAR(255) | Unique | User email address |
| password_hash | VARCHAR(255) | | Hashed password |
| created_at | TIMESTAMP | | Account creation timestamp |

---

## 2. notes

Stores notes created by users.

| Column | Type | Key | Description |
|----------|----------|----------|----------|
| id | BIGINT | Primary Key | Unique note identifier |
| user_id | BIGINT | Foreign Key | Owner of the note |
| text | TEXT | | Note content |
| category | VARCHAR(100) | | Note category |
| created_at | TIMESTAMP | | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

### Foreign Keys

```text
user_id → users(id)
```

---

## 3. tags

Stores reusable tags.

| Column | Type | Key | Description |
|----------|----------|----------|----------|
| id | BIGINT | Primary Key | Unique tag identifier |
| name | VARCHAR(50) | Unique | Tag name |
| created_at | TIMESTAMP | | Tag creation timestamp |

---

## 4. note_tags

Junction table connecting notes and tags.

| Column | Type | Key | Description |
|----------|----------|----------|----------|
| note_id | BIGINT | Primary Key, Foreign Key | Related note |
| tag_id | BIGINT | Primary Key, Foreign Key | Related tag |

### Foreign Keys

```text
note_id → notes(id)
tag_id  → tags(id)
```

---

# Relationships

## One-to-Many: Users → Notes

A user can create many notes, but each note belongs to exactly one user.

```text
users (1) ------ (*) notes
```

Example*

- User Alice*owns 50 notes.
- Every*note has a single owner.

*--

## Many-to-Many: Notes ↔ Tags
*A note can have*multiple tags, and a tag can be at*ached to multiple*notes.

The relationship is implem*nted using the note_tags junction table.

```text
notes (*) ------ (*) tags
         note_tags
```

Exa*ple*

- A note may have tags: "work*, "important".
* The "work" tag may be used by*thousands of notes.

---

* CREATE TABLE Statements

## users*
```sql
CREATE TABLE users (
    i* BIGINT PRIMARY KEY GENERATED ALWA*S AS IDENTITY,
    username VARCHA*(50) NOT NULL UNIQUE,
    email VA*CHAR(255) NOT NULL UNIQUE,
    pas*word_hash VARCHAR(255) NOT NULL,
 *  created_at TIMESTAMP NOT NULL DE*AULT CURRENT_TIMESTAMP*);
```

---

## notes

```sql
CREA*E TABLE notes (
    id BIGINT PRIM*RY KEY GENERATED ALWAYS AS IDENTIT*,
    user_id BIGINT NOT NULL,
   *text TEXT NOT NULL,
    category V*RCHAR(100),
    created_at TIMESTA*P NOT NULL DEFAULT CURRENT_TIMESTA*P,
    updated_at TIMESTAMP NOT NU*L DEFAULT CURRENT_TIMESTAMP,

    *ONSTRAINT fk_notes_user
        FO*EIGN KEY (user_id)
        REFEREN*ES users(id)
        ON DELETE CAS*ADE
);
```

---

## tags

```sql
C*EATE TABLE tags (
    id BIGINT PR*MARY KEY GENERATED ALWAYS AS IDENT*TY,
    name VARCHAR(50) NOT NULL *NIQUE,
    created_at TIMESTAMP NO* NULL DEFAULT CURRENT_TIMESTAMP
);*```

---

## note_tags

```sql
CRE*TE TABLE note_tags (
    note_id B*GINT NOT NULL,
    tag_id BIGINT N*T NULL,

    PRIMARY KEY (note_id,*tag_id),

    CONSTRAINT fk_note_t*gs_note
        FOREIGN KEY (note_*d)
        REFERENCES notes(id)
  *     ON DELETE CASCADE,

    CONST*AINT fk_note_tags_tag
        FORE*GN KEY (tag_id)
        REFERENCES*tags(id)
        ON DELETE CASCADE*);
```

---

# Example SQL Queries*
## 1. Create a New Note

```sql
I*SERT INTO notes (
    user_id,
   *text,
    category
)
VALUES (
   *1,
    'Finish API documentation',**   'Work'
);
```

---

## 2.*Get All Notes for a User

```sql
S*LECT
*   id,
    text,
    category,
   *created_at
FROM notes
WHERE user_i* = 1
ORDER BY created_at DESC*
```

---

## 3. Get Notes*and Their Tags (JOIN Example)

```*ql
SELECT*    n.id,
    n.text,
   *t.name AS tag_name
FROM notes n
*OIN note_tags nt
    ON n.id = nt.*ote_id
JOIN tags t
    ON*nt.tag_id = t.id
WHERE n.user_id =*1
*RDER BY n.id;
```

---

## 4. Coun* Notes Per Category

```sql
*ELECT
    category,
    COUNT(*) AS note_count
FROM notes
GROUP BY category
ORDER BY note_count DESC;
```

---

# Indexes

## Notes by User

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

### Reason

Most application queries retrieve notes belonging to a specific user. This index speeds up:

```sql
SELECT *
FROM notes
WHERE user_id = ?;
```

and reduces database scan time as the dataset grows.

---

# SQL vs NoSQL Decision

QuickNotes is best implemented using a SQL database such as PostgreSQL or MySQL.

Reasons:

- The data has clear relationships between users, notes, tags, and note_tags.
- Foreign keys help maintain referential integrity.
- Many-to-many relationships are naturally modeled using relational tables.
- SQL provides powerful JOIN operations for querying notes and tags together.
- Transactions ensure consistency when creating notes and assigning tags.

A NoSQL database could support the application, but the structured relationships and need for consistent data make a relational SQL database the simpler and more reliable choice for QuickNotes.