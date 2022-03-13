let express = require('express');
let router = express.Router();
let userController = require('../controllers/UserController')


router.post('/register', function(req, res) {
  console.log(req.body);
  userController.register(req.body);
  res.send("hello")
});

module.exports = router;
