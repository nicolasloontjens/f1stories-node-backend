const db = require('../data/db');
const jwt = require('jsonwebtoken');

async function getComments(req){
    return await db.getComments(req.params.id);
}

async function addComment(req){
    let storyid = req.params.id;
    let content = req.body.content;
    let uid = jwt.decode(req.get('Authorization')).uid;
    return await db.addComment(storyid, uid, content);
}


module.exports = { getComments, addComment };