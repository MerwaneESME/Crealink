const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateUser, authController.getCurrentUser);

module.exports = router; 