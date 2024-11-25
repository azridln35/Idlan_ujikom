const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const verifyToken = require('../middleware/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log('Album route accessed:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Public routes
router.get('/', albumController.getAllAlbums);
router.get('/active', albumController.getActiveAlbums);
router.get('/:id', albumController.getAlbumById);

// Protected routes (need authentication)
router.post('/', verifyToken, albumController.createAlbum);
router.put('/:id', verifyToken, albumController.updateAlbum);
router.delete('/:id', verifyToken, albumController.deleteAlbum);

module.exports = router; 