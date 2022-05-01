const express = require('express');
const router = express.Router();
const getMessages = require("../controllers")

router.use('/messages', function(req, res, next) {
    getMessages()
  res.json('Heard you');
});

module.exports = router;