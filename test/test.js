/* eslint-disable no-undef */
const { assert } = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
const url = "http://127.0.0.1:3001";
chai.use(chaiHttp);

describe('API TASKS',()=>{
    describe("GET /races", ()=>{
        it("It should GET all the races", async function (){
            const res = await chai.request(url).get('/races').send();
            assert.equal(res.status,200);
            assert.equal(res.body.length, 22);
            assert.isArray(res.body);
        })
    })
    describe("GET /stories", ()=>{
        it("It should GET all the stories", async function(){
            const res = await chai.request(url).get('/stories').send();
            assert.equal(res.status,200);
            assert.isArray(res.body);
            const firstStory = res.body[0];
            assert.equal(firstStory.title,"a test post");
            assert.equal(firstStory.content,"test");
            assert.equal(firstStory.score,1);
            assert.equal(firstStory.userid,1);
        })
    })
    describe("GET /stories/:id/comments", ()=>{
        it("It should GET all the comments of the first story", async function(){
            const res = await chai.request(url).get('/stories/1/comments').send();
            assert.equal(res.status,200);
            assert.isArray(res.body);
            const comment = res.body[0];
            assert.equal(comment.commentid, 1);
            assert.equal(comment.storyid, 1);
            assert.equal(comment.content, 'a test comment');
        })
    })
    describe('GET /users/:id',()=>{
        it("It should GET all the data of user 1", async function(){
            const res = await chai.request(url).get('/users/1').send();
            assert.equal(res.status,200);
            const user = res.body;
            assert.equal(user.username,'test');
            assert.equal(user.racesvisited,1);
            assert.equal(user.stories.length,1);
        })
    })
    describe('POST /users/register',()=>{
        it("It should POST the data and CREATE a user", async function(){
            const res = await chai.request(url).post('/users/register').send({username:"Freddie", password:"verysmartpassword"});
            assert.equal(res.status,200);
            console.log(res.body);
        })
    })
});

