PRAGMA foreign_keys = ON;

-- Entities: students, courses, and enrolments (the student-course relationship).
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    UNIQUE (student_id, course_id)
);

INSERT INTO students (student_id, name, email) VALUES
    (1, 'Amina Otieno', 'amina@example.com'),
    (2, 'Brian Mwangi', 'brian@example.com'),
    (3, 'Chao Wanjiku', 'chao@example.com'),
    (4, 'David Kiptoo', 'david@example.com');

INSERT INTO courses (course_id, course_name) VALUES
    (101, 'Biology'),
    (102, 'Mathematics'),
    (103, 'History');

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1001, 1, 101, 'A'),
    (1002, 1, 102, 'B'),
    (1003, 2, 101, 'B+'),
    (1004, 2, 103, 'A-'),
    (1005, 3, 102, 'A');

-- 1. All courses for one student, selected by name.
SELECT s.name AS student_name, c.course_name
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Amina Otieno'
ORDER BY c.course_name;

-- 2. All students on one course.
SELECT c.course_name, s.name AS student_name
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.course_name = 'Biology'
ORDER BY s.name;

-- 3. Number of students per course, including courses with no enrolments.
SELECT c.course_name, COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_name;

-- 4. Students who have no enrolments.
SELECT s.student_id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL
ORDER BY s.name;

-- 5. Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A-'
WHERE enrolment_id = 1002;
