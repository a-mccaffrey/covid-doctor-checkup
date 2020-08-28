-- Drops the todolist if it exists currently --
DROP DATABASE IF EXISTS docApp_db;
-- Creates the "todolist" database --
CREATE DATABASE docApp_db;
USE docApp_db;
CREATE TABLE doctor (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  doc_name VARCHAR(255) NOT NULL,
--   last_name VARCHAR(255) NOT NULL,
--   gender VARCHAR(255) NOT NULL,
--   province VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   phoneNum  int NOT NULL
);

CREATE TABLE client (
  id INT  NOT NULL PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
--   bday VARCHAR(255) NOT NULL,
--   gender VARCHAR(255) NOT NULL,
--   province VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   phoneNum  int NOT NULL
);

CREATE TABLE appointment (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  client_id  int NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client(id),
  doctor_id  int NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctor(id),
  comments VARCHAR(255) NOT NULL,
  date int NOT NULL
);

-- CREATE TABLE administrator (
--   id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
--   email VARCHAR(255) NOT NULL,
--   passwor int NOT NULL
-- );

INSERT INTO doctor(doc_name)
VALUES ("Dr. Iqbal Sian"), ("Dr. Morne Smit"), ("Dr Nolan Jansen"), ("Dr. Fred Hui"),("Dr. Kevin O`Brien"), ("Dr. Gary Weinstein"), ("Dr Leslie Housefather");

INSERT INTO administrator(email, passwor)
VALUES ("progect2@gmail.com", 123456)

