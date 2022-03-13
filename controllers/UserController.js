const jwt = require('jsonwebtoken');
const db = require('../data/db');


function register(body){
    const username = body.username;
    const password = body.password;
    db.test();
}

module.exports = {register}