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

async function updateComment(req){
    let commentid = parseInt(req.params.id);
    let uid = jwt.decode(req.get('Authorization')).uid;
    let content = req.body.content;
    if(db.checkIfCommentBelongsToUser(commentid,uid)){
        return db.updateComment(commentid, content);
    }
    return {success:false};
}

async function deleteComment(req){
    let uid = jwt.decode(req.get('Authorization')).uid;
    let commentid = parseInt(req.params.id);
    if(db.checkIfCommentBelongsToUser(commentid,uid)){
        return db.deleteComment(commentid);
    }
    return false;
}

module.exports = { getComments, addComment, updateComment, deleteComment };