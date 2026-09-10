const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Chat - Próximamente en Fase 2' });
});

module.exports = router;
