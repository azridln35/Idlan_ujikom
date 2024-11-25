const express = require('express');
const router = express.Router();
const fotoController = require('../controllers/fotoController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', fotoController.getAllFotos);
router.get('/active', fotoController.getActiveFotos);
router.get('/album/:albumId', fotoController.getFotosByAlbum);
router.get('/:id', fotoController.getFotoById);

// Protected routes (need authentication)
// Single upload
router.post('/', 
  verifyToken,
  upload.uploadSingle,
  fotoController.createFoto
);

// Multiple upload
router.post('/multiple', 
  verifyToken,
  upload.uploadMultiple,
  fotoController.createMultipleFotos
);

// Update foto
router.put('/:id', 
  verifyToken,
  upload.uploadSingle,
  fotoController.updateFoto
);

router.delete('/:id', verifyToken, fotoController.deleteFoto);

module.exports = router; 