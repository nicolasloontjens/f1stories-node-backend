let mysql = require('mysql');
let fs = require('fs');
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
    // eslint-disable-next-line no-undef
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
        //eslint reporting that process is undefined, that's why its disabled here
        // eslint-disable-next-line no-undef
        host: process.env.DB_HOST,
        // eslint-disable-next-line no-undef
        port: process.env.DB_PORT,
        // eslint-disable-next-line no-undef
        user: process.env.DB_USERNAME,
        // eslint-disable-next-line no-undef
        password: process.env.DB_PASSWORD,
        // eslint-disable-next-line no-undef
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

//get all stories + images
async function getStories(){
    return await executeQuery("select s.*, i.image1, i.image2, i.image3 from stories s left join storyimages i on s.storyid = i.storyid");
}

//add a story to stories table + add images to public folder and add the to the storyimages table
async function addStory(story,images){
    //filter out emoji' people might put in their post
    let title = story.title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let content = story.content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let result = await executeQuery("insert into stories(title, content, score, country, userid, raceid) values(?,?,0,?,?,?)",[title, content, story.country, story.userid, story.raceid]);
    if(result.affectedRows == 1){
        const storyid = result.insertId;
        await executeQuery("insert into storyimages(storyid)values(?)",storyid);
        let path = `./public/images/${storyid}`;
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        for(let i = 0; i<images['files[]'].length; i++){
            images['files[]'][i].mv(path + '/' + images['files[]'][i].name);
            await executeQuery(`update storyimages set image${i+1} = ? where storyid = ?`,[`/images/${storyid}/${images['files[]'][i].name}`,storyid]);
        }
        let finalpost = await executeQuery("select s.*, i.image1, i.image2, i.image3 from stories s left join storyimages i on s.storyid = i.storyid where s.storyid = ?", storyid); 
        return {success:true, story:finalpost[0]};
    }
    return {success:false};
}

//update the story of a user
async function updateStory(postid, title, content){
    let newtitle = title.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let newcontent = content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,'');
    let result = await executeQuery("update stories set title = ?, content = ? where storyid = ?",[newtitle, newcontent, postid]);
    return result.affectedRows == 1;
}

//delete story from table + the images
async function deleteStory(storyid){
    let result = await executeQuery("delete from storyimages where storyid = ?", storyid);
    if(result.affectedRows == 1){
        await executeQuery("delete from stories where storyid = ?",storyid);
        fs.rm(`./public/images/${storyid}`, { recursive: true, force: true }, (err)=>{
            return false;
        })
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

//get comments of a story
async function getComments(storyid){
    return await executeQuery("select c.*, u.username from comments c join user u on c.userid = u.id where storyid = ?", storyid);
}

//add a comment to a story
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


async function checkIfCommentBelongsToUser(commentid, uid){
    let result = await executeQuery("select * from comments where commentid = ? and userid = ?",[commentid, uid]);
    if(result.length == 1){
        return true;
    }
}

async function updateComment(commentid, content){
    let result = await executeQuery("update comments set content = ? where commentid = ?",[content, commentid]);
    if(result.affectedRows == 1){
        return {success:true,comment: await executeQuery("select c.*, u.username from comments c join user u on c.userid = u.id where commentid = ?", commentid)};
    }
    return {success:false};
}

async function deleteComment(commentid){
    let result = await executeQuery("delete from comments where commentid = ?", commentid);
    return result.affectedRows == 1;
}

//allow the user to like / dislike a story
async function interactWithPost(storyid, uid, value){
    let getinteract = await executeQuery("select * from userinteracts where userid = ? and storyid = ?",[uid, storyid])
    if(getinteract.length == 1){
        let previousinteract = await executeQuery("select interaction from userinteracts where userid = ? and storyid = ?",[uid, storyid]);
        if(previousinteract[0].interaction == value){
            return {success:false,message:"Can't like / dislike, you already liked / disliked."};
        }
        let query1 =  await executeQuery("update userinteracts set interaction = ? where userid = ? and storyid = ?",[value, uid, storyid]);
        if(value == 1){
            return setStoryScore(storyid, "update stories set score = score + 1 where storyid = ?", query1);
        }
        if(value == 0){
            return setStoryScore(storyid, "update stories set score = score - 1 where storyid = ?", query1);
        }
    }else{
        if(value == 0){
            return {success:false,message:"Can't dislike a post you haven't liked"};
        }
        await executeQuery("insert into userinteracts(userid, storyid, interaction) values(?,?,?)",[uid, storyid, value])
        let res = await executeQuery("update stories set score = score + 1 where storyid = ?",storyid);
        if(res.affectedRows == 1){
            return {success:true,message:"interacted with story!"};
        }else{
            return {success:false,message:"something went wrong"};
        }
    }
}

//helper function for interactWithPost
async function setStoryScore(storyid, query, query1){
    let res = await executeQuery(query,storyid);
    if(query1.affectedRows == 1 && res.affectedRows == 1){
        return {success:true,message:"interacted with story!"};
    }else{
        return {success:false,message:"something went wrong"};
    }
}

//get user info + stories + score
async function getUser(uid){
    let user = await executeQuery("select id, username, userscore from user where id = ?", uid);
    let score = await executeQuery("select sum(score) as score from stories where userid = ?", uid);
    let racesvisited = await executeQuery("select count(*) as count from userraces where userid = ?",uid);
    let stories = await executeQuery("select s.*, i.image1, i.image2, i.image3 from stories s left join storyimages i on s.storyid = i.storyid where userid = ?", uid);
    let res = user[0];
    res.userscore = score[0].score;
    res.stories = stories;
    res.racesvisited = racesvisited[0].count;
    return res;
}

//user can add a race that they have visisted, increasing their count
async function addUserRace(uid, race){
    let data = await executeQuery("select raceid from races where title = ?", race);
    if(data.length > 0){
        let result = await executeQuery("insert into userraces(userid, raceid)values(?,?)",[uid, data[0].raceid]);
        if(result.affectedRows > 0){
            return true;
        }
    }
    return false;
}

async function getRaces(){
    return await executeQuery("select * from races");
}

module.exports = { isUsernameFree, 
    registerUser, loginUser, updateToken, getStories, 
    addStory, updateStory, deleteStory, checkIfPostBelongsToUser,
    getComments, addComment, checkIfCommentBelongsToUser, updateComment,
    deleteComment, interactWithPost, getUser, addUserRace, getRaces
}