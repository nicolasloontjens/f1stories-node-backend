let mysql = require('mysql');
require('dotenv').config()

async function getUser(username){
    let user = executeQuery("select * from user where username ")
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

module.exports = { test}