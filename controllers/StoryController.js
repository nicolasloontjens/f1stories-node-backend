const db = require('../data/db');

async function getStories(req){
    let data =  await db.getStories();
    const page = req.query.page;
    let limit = req.query.limit;
    if(page === undefined){
        return data;
    }
    else if(limit === undefined){
        limit = 5;
    }
    const startIndex = (page-1)*limit;
    const endIndex = page * limit;
    return data.slice(startIndex,endIndex);
}

module.exports = { getStories };