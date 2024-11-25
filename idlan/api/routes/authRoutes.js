const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Contoh protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 