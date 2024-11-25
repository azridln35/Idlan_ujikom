const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const fotoController = {
  // Get all fotos
  getAllFotos: async (req, res) => {
    try {
      const [fotos] = await db.query(
        `SELECT f.*, a.nama_album 
         FROM fotos f 
         JOIN albums a ON f.album_id = a.id 
         ORDER BY f.tgl_unggah DESC`
      );
      res.json(fotos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get fotos by album ID
  getFotosByAlbum: async (req, res) => {
    try {
      const albumId = req.params.albumId;
      
      // Check if album exists
      const [album] = await db.query(
        'SELECT * FROM albums WHERE id = ?',
        [albumId]
      );

      if (album.length === 0) {
        return res.status(404).json({ message: 'Album tidak ditemukan' });
      }

      const [fotos] = await db.query(
        'SELECT * FROM fotos WHERE album_id = ? ORDER BY tgl_unggah DESC',
        [albumId]
      );

      res.json(fotos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get single foto by ID
  getFotoById: async (req, res) => {
    try {
      const [foto] = await db.query(
        `SELECT f.*, a.nama_album 
         FROM fotos f 
         JOIN albums a ON f.album_id = a.id 
         WHERE f.id = ?`,
        [req.params.id]
      );

      if (foto.length === 0) {
        return res.status(404).json({ message: 'Foto tidak ditemukan' });
      }

      res.json(foto[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Create new foto
  createFoto: async (req, res) => {
    try {
      const { album_id, judul_foto, deskripsi_foto, status_foto } = req.body;

      // Validasi input
      if (!album_id || !judul_foto || !req.file) {
        return res.status(400).json({ 
          message: 'album_id, judul_foto, dan foto harus diisi' 
        });
      }

      // Check if album exists
      const [album] = await db.query(
        'SELECT * FROM albums WHERE id = ?',
        [album_id]
      );

      if (album.length === 0) {
        // Hapus file jika album tidak ditemukan
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(404).json({ message: 'Album tidak ditemukan' });
      }

      // Validasi status
      const validStatus = ['aktif', 'nonaktif'];
      if (status_foto && !validStatus.includes(status_foto)) {
        // Hapus file jika status tidak valid
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({ 
          message: 'status_foto harus berupa "aktif" atau "nonaktif"' 
        });
      }

      // Simpan path file relatif ke database
      const nama_file = path.join('uploads/fotos', req.file.filename);

      const [result] = await db.query(
        'INSERT INTO fotos (album_id, judul_foto, deskripsi_foto, nama_file, status_foto) VALUES (?, ?, ?, ?, ?)',
        [album_id, judul_foto, deskripsi_foto || null, nama_file, status_foto || 'aktif']
      );

      res.status(201).json({
        message: 'Foto berhasil ditambahkan',
        fotoId: result.insertId,
        nama_file: nama_file
      });
    } catch (error) {
      // Hapus file jika terjadi error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Update foto
  updateFoto: async (req, res) => {
    try {
      const { judul_foto, deskripsi_foto, status_foto } = req.body;
      const fotoId = req.params.id;

      // Check if foto exists
      const [foto] = await db.query(
        'SELECT * FROM fotos WHERE id = ?',
        [fotoId]
      );

      if (foto.length === 0) {
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(404).json({ message: 'Foto tidak ditemukan' });
      }

      // Validasi status jika ada
      if (status_foto) {
        const validStatus = ['aktif', 'nonaktif'];
        if (!validStatus.includes(status_foto)) {
          if (req.file) {
            await fs.unlink(req.file.path);
          }
          return res.status(400).json({ 
            message: 'status_foto harus berupa "aktif" atau "nonaktif"' 
          });
        }
      }

      let nama_file = foto[0].nama_file;
      
      // Jika ada file baru
      if (req.file) {
        // Hapus file lama
        const oldFilePath = path.join('public', foto[0].nama_file);
        await fs.unlink(oldFilePath).catch(console.error);
        
        // Update dengan file baru
        nama_file = path.join('uploads/fotos', req.file.filename);
      }

      await db.query(
        'UPDATE fotos SET judul_foto = ?, deskripsi_foto = ?, nama_file = ?, status_foto = ? WHERE id = ?',
        [
          judul_foto || foto[0].judul_foto,
          deskripsi_foto !== undefined ? deskripsi_foto : foto[0].deskripsi_foto,
          nama_file,
          status_foto || foto[0].status_foto,
          fotoId
        ]
      );

      res.json({ 
        message: 'Foto berhasil diperbarui',
        nama_file: nama_file
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Delete foto
  deleteFoto: async (req, res) => {
    try {
      const [foto] = await db.query(
        'SELECT * FROM fotos WHERE id = ?',
        [req.params.id]
      );

      if (foto.length === 0) {
        return res.status(404).json({ message: 'Foto tidak ditemukan' });
      }

      // Hapus file fisik
      const filePath = path.join('public', foto[0].nama_file);
      await fs.unlink(filePath).catch(console.error);

      // Hapus data dari database
      await db.query('DELETE FROM fotos WHERE id = ?', [req.params.id]);

      res.json({ message: 'Foto berhasil dihapus' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Get active fotos
  getActiveFotos: async (req, res) => {
    try {
      const [fotos] = await db.query(
        `SELECT f.*, a.nama_album 
         FROM fotos f 
         JOIN albums a ON f.album_id = a.id 
         WHERE f.status_foto = 'aktif' 
         ORDER BY f.tgl_unggah DESC`
      );
      res.json(fotos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // Create multiple fotos
  createMultipleFotos: async (req, res) => {
    try {
        const { album_id } = req.body; // Only album_id is required in the body

        // Validate input
        if (!album_id || !req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: 'album_id dan fotos harus diisi' 
            });
        }

        // Check if album exists
        const [album] = await db.query(
            'SELECT * FROM albums WHERE id = ?',
            [album_id]
        );

        if (album.length === 0) {
            // Delete all files if album not found
            for (const file of req.files) {
                await fs.unlink(file.path).catch(console.error);
            }
            return res.status(404).json({ message: 'Album tidak ditemukan' });
        }

        const insertedFotos = [];

        // Insert each photo
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const nama_file = path.join('uploads/fotos', file.filename);
            
            // Generate a default title for the photo
            const currentJudulFoto = `Foto ${i + 1}`; // You can customize this as needed
            
            const [result] = await db.query(
                'INSERT INTO fotos (album_id, judul_foto, nama_file) VALUES (?, ?, ?)',
                [
                    album_id,
                    currentJudulFoto,
                    nama_file
                ]
            );

            insertedFotos.push({
                fotoId: result.insertId,
                judul_foto: currentJudulFoto,
                nama_file: nama_file
            });
        }

        res.status(201).json({
            message: `${req.files.length} foto berhasil ditambahkan`,
            fotos: insertedFotos
        });
    } catch (error) {
        // Delete all files if an error occurs
        for (const file of req.files) {
            await fs.unlink(file.path).catch(console.error);
        }
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

module.exports = fotoController; 