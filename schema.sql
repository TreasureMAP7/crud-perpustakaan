CREATE DATABASE db_library;
USE db_library;

CREATE TABLE tb_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tb_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    penulis VARCHAR(150) NOT NULL,
    penerbit VARCHAR(150),
    tahun_terbit YEAR,
    stok INT NOT NUll, 
    category_id INT NOT NULL,
    FOREIGN KEY (category_id)
    REFERENCES tb_categories(id)
);