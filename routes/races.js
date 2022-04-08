let express = require('express');
let router = express.Router();
let raceController = require('../controllers/RaceController')


router.get('/',async function(req, res){
    res.send(await raceController.get());
});

module.exports = router;