const express = require("express");

const {
    register,
    login,
    logout
} = require("../controllers/auth.controller");

const router = express.Router();

// Register a new student
router.post("/register", register);

// Login a student or admin
router.post("/login", login);

// Logout the logged-in user
router.post("/logout", logout); 

module.exports = router;