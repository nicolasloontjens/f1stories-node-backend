let express = require('express');
let router = express.Router();
let chai = require('chai');
let chaiHttp = require('chai-http');
const url = "http://127.0.0.1:3001/api";
chai.use(chaiHttp);


/* GET home page. */
router.get('/races',async function(req, res) {
  const result = await chai.request(url).get('/races').send();
  let races = result.body;
  console.log(races);
  races = races.map(race => {
    let date = new Date(race.date);
    let currdate = new Date();
    race.date = `Date: ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
    if(currdate > date){
      race.hasHappened = true;
    }else{
      race.hasHappened = false;
    }
    return race;
  })
  console.log(races);
  res.render('index', {'races':races,'title':'Races'});
});

module.exports = router;
