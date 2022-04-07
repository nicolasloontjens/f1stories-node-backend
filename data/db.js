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
    let res = await executeQuery("insert into user(username, password, token, userscore) values(?,?,?,?)",[username,protectedpassword,token, 0]);
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

async function addStory(story){
    //filter out emoji' people might put in their post
    let title = story.title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let content = story.content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let result = await executeQuery("insert into stories(title, content, score, country, userid, raceid) values(?,?,0,?,?,?)",[title, content, story.country, story.userid, story.raceid]);
    if(result.affectedRows != 1){
        return {success:false};
    }
    let createdStory = await executeQuery("select * from stories where storyid = ?",result.insertId);
    return {success:true,story:createdStory[0]};
}

async function updateStory(postid, title, content){
    let newtitle = title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let newcontent = content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let result = await executeQuery("update stories set title = ?, content = ? where storyid = ?",[newtitle, newcontent, postid]);
    if(result.changedRows == 1){
        return true;
    }
    return false;
}

async function deleteStory(storyid){
    let result = await executeQuery("delete from stories where storyid = ?",storyid);
    if(result.affectedRows == 1){
        return true;
    }
    return false;
}

async function checkIfPostBelongsToUser(postid, uid){
    let result = await executeQuery("select * from stories where storyid = ? and userid = ?",[postid, uid]);
    if(result.length == 1){
        return true;
    }
}

async function getComments(storyid){
    return await executeQuery("select c.*, u.username from comments c join user u on c.userid = u.id where storyid = ?", storyid);
}

async function addComment(storyid, uid, content){
    try{
        let result = await executeQuery("insert into comments(userid, storyid, content)values(?,?,?)",[uid,parseInt(storyid),content]);
        if(result.affectedRows > 0){
            return {success:true,comment: await executeQuery("select c.*, u.username from comments c join user u on c.userid = u.id where commentid = ?", result.insertId)};
        }
        return {success:false};
    }catch(err){
        return {success:false};
    }
}

module.exports = { isUsernameFree, 
    registerUser, loginUser, updateToken, getStories, 
    addStory, updateStory, deleteStory, checkIfPostBelongsToUser,
    getComments, addComment 
}