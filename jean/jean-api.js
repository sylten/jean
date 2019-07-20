const express = require('express');
const router = express.Router();
var jean = require('./jean-core');

router.get('/:text', (req, res) => {
    res.send({
        in: req.params.text, 
        out: jean.getResponse(req.params.text)
    });
});

module.exports = router;