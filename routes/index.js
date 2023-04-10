const express = require('express');
const router = express.Router();
//const { authenticateUser } = require('../middleware');

//router.use(authenticateUser)

router.get('/', (req, res) => {
  res.send('restful-climate: a REST API for NSW climate data');
});

module.exports = router;