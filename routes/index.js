const express = require('express');
const router = express.Router();
const getMessages = require("../controllers")

router.get('/messages', function(req, res, next) {
  console.log(req);
    getMessages()
  res.json('Heard you');
});

module.exports = router;
