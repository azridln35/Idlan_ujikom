const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');
const verifyToken = require('../middleware/authMiddleware');

// Logging middleware khusus untuk route info
router.use((req, res, next) => {
  console.log('Info route accessed:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Public routes
router.get('/', infoController.getAllInfo);
router.get('/:id', infoController.getInfoById);

// Protected routes (need authentication)
router.post('/', verifyToken, (req, res, next) => {
  console.log('POST /api/info accessed');
  console.log('Request Body:', req.body);
  console.log('Request Headers:', req.headers);
  next();
}, infoController.createInfo);

router.put('/:id', verifyToken, infoController.updateInfo);
router.delete('/:id', verifyToken, infoController.deleteInfo);

module.exports = router; 