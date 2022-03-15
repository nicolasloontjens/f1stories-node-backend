let express = require('express');
let router = express.Router();
let storyController = require("../controllers/StoryController")

router.get("/",async function (req,res){
    let data = await storyController.getStories(req);
    res.send(data);
});

module.exports = router;