# School database design

This document describes the schema and sample data in [`school.sql`](school.sql). The script models a QuickNotes-style system with users, notes, and tags.

## Tables

- **`users`** stores one row per user. `id` is the primary key; `name` and `email` are required, and email is unique.
- **`notes`** stores each note's text and creation time. `id` is the primary key. Required `user_id` is a foreign key to `users`, so each note belongs to one user.
- **`tags`** stores reusable labels. `id` is the primary key and each required tag `name` is unique.
- **`note_tags`** links notes and tags. Its composite primary key `(note_id, tag_id)` identifies each link and prevents attaching the same tag to a note twice. Both columns are required foreign keys; `ON DELETE CASCADE` removes links when their note or tag is deleted.

## Relationships

Users and notes have a one-to-many relationship: a user can have many notes, and each note belongs to one user. Notes and tags have a many-to-many relationship: a note can have multiple tags, and each tag can be used on multiple notes. `note_tags` is the join table that turns that relationship into two one-to-many relationships. It also prevents duplicate note/tag pairs.

## Indexes

The script adds two indexes:

- `notes(user_id, created_at DESC)` supports selecting one user's notes in newest-first order.
- `note_tags(tag_id, note_id)` supports finding notes by tag. The composite primary key `(note_id, tag_id)` already supports traversing links starting from a note.

Primary keys and unique constraints also create indexes for table IDs, user emails, and tag names. Indexes make lookups faster, with some extra storage and write work.

## SQL or NoSQL?

I would choose SQL for this system. The data has clear relationships, and foreign keys, unique constraints, and a composite key keep those relationships valid. SQL joins make it straightforward to retrieve a user's newest notes, find notes by tag, and count notes per user. A document database could store tags inside each note, but keeping shared tags and their links consistent would then take more application-side work.
