const express = require('express');
const router = express.Router();
var jean = require('./jean-core');

router.get('/response', (req, res) => {
  res.send({
  	text: jean.getResponse('test')
  });
});

module.exports = router;