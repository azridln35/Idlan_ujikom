const db = require('../config/database');

const albumController = {
  // Get all albums
  getAllAlbums: async (req, res) => {
    try {
      const [albums] = await db.query(
        'SELECT * FROM albums ORDER BY tgl_post DESC'
      );
      res.json(albums);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get single album by ID
  getAlbumById: async (req, res) => {
    try {
      const [album] = await db.query(
        'SELECT * FROM albums WHERE id = ?',
        [req.params.id]
      );

      if (album.length === 0) {
        return res.status(404).json({ message: 'Album tidak ditemukan' });
      }

      res.json(album[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Create new album
  createAlbum: async (req, res) => {
    try {
      const { nama_album, deskripsi_album, status_album } = req.body;

      // Validasi input
      if (!nama_album) {
        return res.status(400).json({ 
          message: 'nama_album harus diisi' 
        });
      }

      // Validasi status
      const validStatus = ['aktif', 'nonaktif'];
      if (status_album && !validStatus.includes(status_album)) {
        return res.status(400).json({ 
          message: 'status_album harus berupa "aktif" atau "nonaktif"' 
        });
      }

      const [result] = await db.query(
        'INSERT INTO albums (nama_album, deskripsi_album, status_album) VALUES (?, ?, ?)',
        [nama_album, deskripsi_album || null, status_album || 'aktif']
      );

      res.status(201).json({
        message: 'Album berhasil ditambahkan',
        albumId: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Update album
  updateAlbum: async (req, res) => {
    try {
      const { nama_album, deskripsi_album, status_album } = req.body;
      const albumId = req.params.id;

      // Check if album exists
      const [album] = await db.query(
        'SELECT * FROM albums WHERE id = ?',
        [albumId]
      );

      if (album.length === 0) {
        return res.status(404).json({ message: 'Album tidak ditemukan' });
      }

      // Validasi status jika ada
      if (status_album) {
        const validStatus = ['aktif', 'nonaktif'];
        if (!validStatus.includes(status_album)) {
          return res.status(400).json({ 
            message: 'status_album harus berupa "aktif" atau "nonaktif"' 
          });
        }
      }

      await db.query(
        'UPDATE albums SET nama_album = ?, deskripsi_album = ?, status_album = ? WHERE id = ?',
        [
          nama_album || album[0].nama_album,
          deskripsi_album !== undefined ? deskripsi_album : album[0].deskripsi_album,
          status_album || album[0].status_album,
          albumId
        ]
      );

      res.json({ message: 'Album berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Delete album
  deleteAlbum: async (req, res) => {
    try {
      const [album] = await db.query(
        'SELECT * FROM albums WHERE id = ?',
        [req.params.id]
      );

      if (album.length === 0) {
        return res.status(404).json({ message: 'Album tidak ditemukan' });
      }

      await db.query('DELETE FROM albums WHERE id = ?', [req.params.id]);

      res.json({ message: 'Album berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get active albums
  getActiveAlbums: async (req, res) => {
    try {
      const [albums] = await db.query(
        'SELECT * FROM albums WHERE status_album = "aktif" ORDER BY tgl_post DESC'
      );
      res.json(albums);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = albumController; 