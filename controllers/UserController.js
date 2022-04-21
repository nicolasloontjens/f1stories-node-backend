const jwt = require('jsonwebtoken');
const db = require('../data/db');
require('dotenv').config();


async function register(body){
    const username = body.username;
    const password = body.password;
    let free = await db.isUsernameFree(username);
    if(free){
        const token = jwt.sign({username: username,password: password},process.env.SECRET);
        let res = await db.registerUser(username,password);
        if(res.success){
            return {success: true, token: res.token};
        }else{
            return {success:false}
        }
    }else{
        return {success:false}
    }
}

async function login(body){
    const username = body.username;
    const password = body.password;
    let res = await db.loginUser(username, password);
    const uid = res.id;
    if(res.success){
        const token = jwt.sign({uid: uid, username: username,password: password},process.env.SECRET);
        await db.updateToken(res.id, token);
        return {success:true,token:token};
    }else{
        return {success:false};
    }
}

async function get(uid){
    return db.getUser(uid)
}

async function addRace(req){
    let uid = jwt.decode(req.get('Authorization')).uid;
    if(uid == parseInt(req.params.id)){
        let uid = jwt.decode(req.get('Authorization')).uid;
        let race = req.body.race;
        if(await db.addUserRace(uid, race)){
            return true;
        }
    }
    return false;
}

async function getUserLikes(req){
    return await db.getUserLikes(req.params.id);
}

module.exports = {register, login, get, addRace, getUserLikes}