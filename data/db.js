let mysql = require('mysql');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let crypto = require("crypto");

//check if username is available for registration
async function isUsernameFree(username){
    let user = await executeQuery("select * from user where username = ?",[username]);
    return user.length == 0;
}

//register the user and return their token
async function registerUser(username, password,token){
    const protectedpassword = crypto.createHash('md5').update(password).digest("hex");
    let res = await executeQuery("insert into user(username, password, token) values(?,?,?)",[username,protectedpassword,token]);
    console.log(res.insertId);
    if(res.affectedRows != 1){
        return {success:false};
    }
    const tokenwithid = jwt.sign({uid:res.insertId,username:username,password:password},process.env.SECRET);
    await updateToken(res.insertId,tokenwithid);
    return {success:true,token:tokenwithid};
}

//login user, create new token and give them token
async function loginUser(username, password){
    const protectedpassword = crypto.createHash('md5').update(password).digest("hex");
    let user = await executeQuery("select * from user where username = ? and password = ?",[username,protectedpassword]);
    if(user.length == 1){
        return {success:true, id:user[0].id};
    }
    return {success:false};
}

//function to update user token
async function updateToken(id, token){
    await executeQuery("update user set token = ? where id = ?",[token,id]);
}

//promise version to execute query's
async function executeQuery(statement,parameters=undefined){
    let connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
    return new Promise((success, fail)=>{
        connection.connect(function(err){
            if(err) throw err;
            if(parameters != undefined){
                connection.query(statement,parameters,function(err,result){
                    connection.end()
                    if(err){
                        fail(err)
                    }else{
                        success(result);
                    }
                })
            }else{
                connection.query(statement,function(err,result){
                    connection.end()
                    if(err){
                        fail(err)
                    }else{
                        success(result);
                    }
                })
            }
        })
    })
}

async function getStories(){
    return await executeQuery("select * from stories");
}

module.exports = { isUsernameFree, registerUser, loginUser, updateToken, getStories }