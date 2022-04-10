let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/races', function(req, res) {
  res.render('index');
});

module.exports = router;
