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

async function getUserPosts(){
    
}

module.exports = {register,login}