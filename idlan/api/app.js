const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const infoRoutes = require('./routes/infoRoutes');
const agendaRoutes = require('./routes/agendaRoutes');
const albumRoutes = require('./routes/albumRoutes');
const fotoRoutes = require('./routes/fotoRoutes');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// Logging middleware
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/fotos', fotoRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Field foto tidak sesuai',
        error: err.message
      });
    }
    return res.status(400).json({
      message: 'Error uploading file',
      error: err.message
    });
  }
  res.status(500).json({ 
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ message: `Cannot ${req.method} ${req.url}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
}); 