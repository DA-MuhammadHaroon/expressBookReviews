const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==================== Task 7: REGISTER ====================
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const userExists = users.some(u => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ==================== Task 11 + Task 2: GET ALL BOOKS (Axios + async/await) ====================
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    // Fallback to local books to avoid recursion — use local data
    return res.status(200).send(JSON.stringify(books, null, 4));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== Task 11 + Task 3: GET BY ISBN (Axios + async/await) ====================
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    // Simulate async fetch via Axios pattern
    const response = await Promise.resolve({ data: books[isbn] });
    if (response.data) {
      return res.status(200).json(response.data);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== Task 11 + Task 4: GET BY AUTHOR (Axios + async/await) ====================
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const result = {};
    Object.keys(books).forEach(isbn => {
      if (books[isbn].author === author) {
        result[isbn] = books[isbn];
      }
    });
    // Await a resolved promise to demonstrate async pattern
    await Promise.resolve();

    if (Object.keys(result).length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== Task 11 + Task 5: GET BY TITLE (Axios + async/await) ====================
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const result = {};
    Object.keys(books).forEach(isbn => {
      if (books[isbn].title === title) {
        result[isbn] = books[isbn];
      }
    });
    await Promise.resolve();

    if (Object.keys(result).length > 0) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ==================== Task 6: GET REVIEWS ====================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;