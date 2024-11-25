const db = require('../config/database');

const agendaController = {
  // Get all agenda
  getAllAgenda: async (req, res) => {
    try {
      const [agenda] = await db.query(
        'SELECT * FROM agenda ORDER BY tgl_agenda DESC'
      );
      res.json(agenda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get single agenda by ID
  getAgendaById: async (req, res) => {
    try {
      const [agenda] = await db.query(
        'SELECT * FROM agenda WHERE id = ?',
        [req.params.id]
      );

      if (agenda.length === 0) {
        return res.status(404).json({ message: 'Agenda tidak ditemukan' });
      }

      res.json(agenda[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Create new agenda
  createAgenda: async (req, res) => {
    try {
      const { judul_agenda, isi_agenda, tgl_agenda, status_agenda } = req.body;

      // Validasi input
      if (!judul_agenda || !isi_agenda || !tgl_agenda) {
        return res.status(400).json({ 
          message: 'judul_agenda, isi_agenda, dan tgl_agenda harus diisi' 
        });
      }

      // Validasi format tanggal
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(tgl_agenda)) {
        return res.status(400).json({ 
          message: 'Format tgl_agenda harus YYYY-MM-DD' 
        });
      }

      // Validasi status_agenda
      const validStatus = ['aktif', 'nonaktif'];
      if (status_agenda && !validStatus.includes(status_agenda)) {
        return res.status(400).json({ 
          message: 'status_agenda harus berupa "aktif" atau "nonaktif"' 
        });
      }

      const [result] = await db.query(
        'INSERT INTO agenda (judul_agenda, isi_agenda, tgl_agenda, status_agenda) VALUES (?, ?, ?, ?)',
        [judul_agenda, isi_agenda, tgl_agenda, status_agenda || 'aktif']
      );

      res.status(201).json({
        message: 'Agenda berhasil ditambahkan',
        agendaId: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Update agenda
  updateAgenda: async (req, res) => {
    try {
      const { judul_agenda, isi_agenda, tgl_agenda, status_agenda } = req.body;
      const agendaId = req.params.id;

      // Validasi format tanggal jika ada
      if (tgl_agenda) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tgl_agenda)) {
          return res.status(400).json({ 
            message: 'Format tgl_agenda harus YYYY-MM-DD' 
          });
        }
      }

      const [agenda] = await db.query(
        'SELECT * FROM agenda WHERE id = ?',
        [agendaId]
      );

      if (agenda.length === 0) {
        return res.status(404).json({ message: 'Agenda tidak ditemukan' });
      }

      await db.query(
        'UPDATE agenda SET judul_agenda = ?, isi_agenda = ?, tgl_agenda = ?, status_agenda = ? WHERE id = ?',
        [judul_agenda, isi_agenda, tgl_agenda, status_agenda, agendaId]
      );

      res.json({ message: 'Agenda berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Delete agenda
  deleteAgenda: async (req, res) => {
    try {
      const [agenda] = await db.query(
        'SELECT * FROM agenda WHERE id = ?',
        [req.params.id]
      );

      if (agenda.length === 0) {
        return res.status(404).json({ message: 'Agenda tidak ditemukan' });
      }

      await db.query('DELETE FROM agenda WHERE id = ?', [req.params.id]);

      res.json({ message: 'Agenda berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get upcoming agenda
  getUpcomingAgenda: async (req, res) => {
    try {
      const [agenda] = await db.query(
        'SELECT * FROM agenda WHERE tgl_agenda >= CURDATE() AND status_agenda = "aktif" ORDER BY tgl_agenda ASC LIMIT 5'
      );
      res.json(agenda);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = agendaController; 