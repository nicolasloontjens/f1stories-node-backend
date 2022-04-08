const db = require('../data/db');

async function get(){
    return db.getRaces();
}

module.exports = {
    get
}