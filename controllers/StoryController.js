const db = require('../data/db');
const jwt = require('jsonwebtoken');

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

async function addStory(req){
    let uid = jwt.decode(req.get('Authorization')).uid;
    let post = req.body;
    post.userid = uid;
    return await db.addStory(post, req.files)
}

async function updateStory(req){
    let data = req.body;
    if(await db.checkIfPostBelongsToUser(req.params.id, jwt.decode(req.get('Authorization')).uid)){
        return await db.updateStory(req.params.id, data.title, data.content);
    }
    return false;
}

async function deleteStory(req){
    if(await db.checkIfPostBelongsToUser(req.params.id, jwt.decode(req.get('Authorization')).uid)){
        let result = await db.deleteStory(req.params.id);
        return result;
    }
    return false;
}

async function interactWithPost(req){
    let uid = jwt.decode(req.get('Authorization')).uid;
    let value = req.body.interact;
    let storyid = req.params.id;
    return await db.interactWithPost(parseInt(storyid), uid, value);
}

function noToken(req){
    if(req.get('authorization')===undefined){
        return true;
    }
    return false;
}

module.exports = { getStories, addStory, updateStory, deleteStory, interactWithPost, noToken};