const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middlewares/auth');

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 15 * 1024 * 1024 },
});

const router = express.Router();

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Debes enviar un archivo de imagen o audio válido' });
  }

  const extension = path.extname(req.file.originalname).toLowerCase() || '.jpg';
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.m4a', '.mp3', '.wav', '.ogg', '.webm'];
  if (!allowedExtensions.includes(extension)) {
    fs.unlinkSync(path.join(uploadDirectory, req.file.filename));
    return res.status(415).json({ message: 'Formato de archivo no permitido' });
  }
  const filename = `${uuidv4()}${extension}`;
  const currentPath = path.join(uploadDirectory, req.file.filename);
  const finalPath = path.join(uploadDirectory, filename);
  fs.renameSync(currentPath, finalPath);

  return res.status(201).json({
    url: `${req.protocol}://${req.get('host')}/uploads/${filename}`,
  });
});

module.exports = router;
