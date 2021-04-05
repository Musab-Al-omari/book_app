DROP TABLE IF EXISTS books;

CREATE TABLE books(
    id SERIAL PRIMARY KEY NOT NULL,
    author VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    image_url VARCHAR(255),
    description TEXT
);