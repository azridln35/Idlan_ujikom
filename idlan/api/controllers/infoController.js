const db = require('../config/database');

const infoController = {
  // Get all informasi
  getAllInfo: async (req, res) => {
    try {
      const [info] = await db.query(
        'SELECT * FROM informasi ORDER BY tgl_post_info DESC'
      );
      res.json(info);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get single informasi by ID
  getInfoById: async (req, res) => {
    try {
      const [info] = await db.query(
        'SELECT * FROM informasi WHERE id = ?',
        [req.params.id]
      );

      if (info.length === 0) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan' });
      }

      res.json(info[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Create new informasi
  createInfo: async (req, res) => {
    try {
      const { judul_info, isi_info, status_info } = req.body;

      // Validasi input
      if (!judul_info || !isi_info) {
        return res.status(400).json({ 
          message: 'judul_info dan isi_info harus diisi' 
        });
      }

      // Validasi status_info
      const validStatus = ['aktif', 'nonaktif'];
      if (status_info && !validStatus.includes(status_info)) {
        return res.status(400).json({ 
          message: 'status_info harus berupa "aktif" atau "nonaktif"' 
        });
      }

      const [result] = await db.query(
        'INSERT INTO informasi (judul_info, isi_info, status_info) VALUES (?, ?, ?)',
        [judul_info, isi_info, status_info || 'aktif']
      );

      res.status(201).json({
        message: 'Informasi berhasil ditambahkan',
        infoId: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Update informasi
  updateInfo: async (req, res) => {
    try {
      const { judul_info, isi_info, status_info } = req.body;
      const infoId = req.params.id;

      const [info] = await db.query(
        'SELECT * FROM informasi WHERE id = ?',
        [infoId]
      );

      if (info.length === 0) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan' });
      }

      await db.query(
        'UPDATE informasi SET judul_info = ?, isi_info = ?, status_info = ? WHERE id = ?',
        [judul_info, isi_info, status_info, infoId]
      );

      res.json({ message: 'Informasi berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Delete informasi
  deleteInfo: async (req, res) => {
    try {
      const [info] = await db.query(
        'SELECT * FROM informasi WHERE id = ?',
        [req.params.id]
      );

      if (info.length === 0) {
        return res.status(404).json({ message: 'Informasi tidak ditemukan' });
      }

      await db.query('DELETE FROM informasi WHERE id = ?', [req.params.id]);

      res.json({ message: 'Informasi berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = infoController; 