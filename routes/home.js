const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Vidly Project! (Tati & Sheldon)');
});

module.exports = router;
