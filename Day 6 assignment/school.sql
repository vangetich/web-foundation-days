PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Sample data: INSERT adds rows to the tables.
INSERT INTO users (id, name, email) VALUES
    (1, 'Amina', 'amina@example.com'),
    (2, 'Brian', 'brian@example.com'),
    (3, 'Chao', 'chao@example.com');

INSERT INTO notes (id, user_id, text, created_at) VALUES
    (1, 1, 'Review database joins', '2026-11-22 16:30:00'),
    (2, 1, 'Finish project outline', '2026-11-23 09:15:00'),
    (3, 2, 'Buy lab notebook', '2026-11-21 12:00:00');

INSERT INTO tags (id, name) VALUES
    (1, 'urgent'),
    (2, 'study');

INSERT INTO note_tags (note_id, tag_id) VALUES
    (1, 1), (1, 2), (2, 2), (3, 1);

-- Amina's notes, newest first.
SELECT notes.text, notes.created_at
FROM notes
JOIN users ON users.id = notes.user_id
WHERE users.name = 'Amina'
ORDER BY notes.created_at DESC;

-- All notes tagged urgent.
SELECT notes.text
FROM notes
JOIN note_tags ON note_tags.note_id = notes.id
JOIN tags ON tags.id = note_tags.tag_id
WHERE tags.name = 'urgent';

-- Number of notes for each user, including users with no notes.
SELECT users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON notes.user_id = users.id
GROUP BY users.id, users.name
ORDER BY users.id;

-- Indexes for Amina's newest-first notes and lookup of note links by tag.
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at DESC);
CREATE INDEX idx_note_tags_tag_note ON note_tags(tag_id, note_id);
