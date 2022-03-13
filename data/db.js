let mysql = require('mysql');
require('dotenv').config();
let crypto = require("crypto");

async function isUsernameFree(username){
    let user = await executeQuery("select * from user where username = ?",[username]);
    return user.length == 0;
}

async function registerUser(username, password,token){
    const protectedpassword = crypto.createHash('md5').update(password).digest("hex");
    let res = await executeQuery("insert into user(username, password, token) values(?,?,?)",[username,protectedpassword,token]);
    if(res.affectedRows != 1){
        return false;
    }
    return true;
}

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

module.exports = { isUsernameFree, registerUser }