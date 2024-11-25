const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const verifyToken = require('../middleware/authMiddleware');

// Logging middleware
router.use((req, res, next) => {
  console.log('Agenda route accessed:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Public routes
router.get('/', agendaController.getAllAgenda);
router.get('/upcoming', agendaController.getUpcomingAgenda);
router.get('/:id', agendaController.getAgendaById);

// Protected routes (need authentication)
router.post('/', verifyToken, agendaController.createAgenda);
router.put('/:id', verifyToken, agendaController.updateAgenda);
router.delete('/:id', verifyToken, agendaController.deleteAgenda);

module.exports = router; 