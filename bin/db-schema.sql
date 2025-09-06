CREATE TABLE courses (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),
  course_id VARCHAR(255),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE profiles (
  id CHAR(36) PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  course_id VARCHAR(255),
  created_at TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE quizzes (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  time_limit INT,
  course_id VARCHAR(255),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE questions (
  id CHAR(36) PRIMARY KEY,
  quiz_id CHAR(36),
  question_text TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE options (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36),
  option_text TEXT,
  is_correct BOOLEAN,
  FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE submissions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  quiz_id CHAR(36),
  score INT,
  submitted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE answers (
  id CHAR(36) PRIMARY KEY,
  submission_id CHAR(36),
  question_id CHAR(36),
  selected_option_id CHAR(36),
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES options(id)
);