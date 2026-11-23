# School database design

This design documents the SQLite schema in [`school.sql`](school.sql).

## Tables

- **`students`** stores one row per student. `student_id` is the primary key; each student has a required name and a required, unique email address.
- **`courses`** stores one row per course. `course_id` is the primary key, and `course_name` is required and unique.
- **`enrolments`** records a student's enrolment in a course. Its primary key identifies each enrolment; `student_id` and `course_id` are required foreign keys, and `grade` records the result when available. The unique pair `(student_id, course_id)` prevents enrolling the same student in the same course twice.

## Relationships

A student can have many enrolments, while each enrolment belongs to one student: this is a one-to-many relationship from `students` to `enrolments`. A course can also have many enrolments, while each enrolment belongs to one course: this is a one-to-many relationship from `courses` to `enrolments`. Taken together, students and courses have a many-to-many relationship: a student may take several courses, and a course may have several students. The `enrolments` table is the join table that resolves this many-to-many relationship into two one-to-many relationships. It also gives the relationship its own data, the grade, and a place to enforce the no-duplicate-enrolment rule.

## Index

Add an index on `enrolments(course_id)`. The sample queries retrieve students on a course and count enrolments per course, so this index can help SQLite find enrolments by course efficiently. The unique constraint on `(student_id, course_id)` already creates an index whose leading column is `student_id`, which helps lookups by student; a separate `course_id` index supports the other direction.

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
```

## SQL or NoSQL?

I would choose a relational SQL database for this system. Students, courses, and enrolments have clear relationships, and enrolments need reliable foreign keys, unique constraints, and accurate counts across joined tables. SQL expresses the requested reports directly with joins and grouping, while the grade naturally belongs to the student-course relationship. A NoSQL database could work, but it would require more application-side coordination to preserve these relationships and constraints; its flexible document structure offers little advantage for this small, structured dataset.
