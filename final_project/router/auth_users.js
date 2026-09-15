const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// auth_users.js owns the users array
let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validusers.length > 0;
};

// ==================== Task 8: LOGIN ====================
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in: missing credentials" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// ==================== Task 9: ADD/UPDATE REVIEW ====================
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text required" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated",
    reviews: books[isbn].reviews,
  });
});

// ==================== Task 10: DELETE REVIEW ====================
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user for this book" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;