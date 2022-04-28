/* eslint-disable no-undef */
const { assert } = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
const url = "http://127.0.0.1:3001/api";
chai.use(chaiHttp);

describe('API TASKS',()=>{
    let usertoken;
    let storyid;
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
            assert.isNotEmpty(res.body.token);
            usertoken = res.body.token;
        })
        it("It should LOGIN the user and MATCH the token", async function(){
            const res = await chai.request(url).post('/users/login').send({username:"Freddie", password:"verysmartpassword"});
            assert.equal(res.status,200);
            assert.equal(res.body.token,usertoken);
        })
    })
    describe('POST /users/:id/race',()=>{
        it('It should POST the race data', async function(){
            const res = await chai.request(url).post('/users/2/race').set('Authorization',usertoken).send({
                'race':'Australian GP'
            });
            assert.equal(res.status, 202);
        })
        it("It should GET all the data of the user and check the races", async function(){
            const res = await chai.request(url).get('/users/2').send();
            assert.equal(res.status,200);
            const user = res.body;
            assert.equal(user.username,'Freddie');
            assert.equal(user.racesvisited,1);
        })
    })
    describe('POST /stories',()=>{
        it("It should CREATE a story", async function(){
            const res = await chai.request(url).post('/stories').set('Authorization',usertoken).send({
                content:"testing",
                country:'Belgium',
                raceid:2,
                'files[]':null
            });
            assert.equal(res.status,201);
            assert.equal(res.body.storyid,2);
            assert.equal(res.body.userid,2);
            storyid = res.body.storyid;
        })
        it("It should be retrievable in GET /stories", async function(){
            const res = await chai.request(url).get('/stories').send();
            assert.equal(res.status,200);
            assert.equal(res.body[1].storyid, storyid);
        })
    })
    describe('POST /stories/:id/comments',()=>{
        it("It should add a comment to a story", async function(){
            const res = await chai.request(url).post(`/stories/${storyid}/comments`).set('Authorization',usertoken).send({
                "content":"a comment about testing"
            });
            assert.equal(res.status,201);
            let comment = res.body[0];
            assert.isArray(res.body);
            assert.equal(comment.storyid, storyid);
            assert.equal(comment.content, 'a comment about testing');
            assert.equal(comment.username,"Freddie");
        })
    })
    describe('POST /stories/:id/interact',()=>{
        it("It should interact with a post", async function(){
            const res = await chai.request(url).post(`/stories/${storyid}/interact`).set('Authorization',usertoken).send({
                'interact':1
            });
            assert.equal(res.status,202);
        })
        it("It should increase the posts score",async function(){
            const res = await chai.request(url).get('/stories').send();
            assert.equal(res.status,200);
            assert.equal(res.body[1].storyid, storyid);
            assert.equal(res.body[1].score,1);
        })
    })
    describe('PUT /stories/:id',()=>{
        it('It should UPDATE the post',async function(){
            const res = await chai.request(url).put(`/stories/${storyid}`).set('Authorization', usertoken).send({
                "content":"test2"
            })
            assert.equal(res.status, 202);
        })
        it('It should have updated the post', async function(){
            const res = await chai.request(url).get('/stories').send();
            assert.equal(res.status,200);
            assert.equal(res.body[1].storyid, storyid);
            assert.equal(res.body[1].content, "test2");            
        })
    })
    describe('PUT /comments/:id',()=>{
        it('It should UPDATE the comment', async function(){
            const res = await chai.request(url).put(`/comments/2`).set('Authorization',usertoken).send({
                "content":"a comment about updating a comment about testing"
            });
            assert.equal(res.status, 200);
        })
        it("It should have updated the comment",async function(){
            const res = await chai.request(url).get(`/stories/${storyid}/comments`).send();
            assert.equal(res.status, 200);
            assert.equal(res.body[0].content, "a comment about updating a comment about testing")
        })
    })
    describe('DELETE /comments/:id',()=>{
        it('It should DELETE the comment', async function(){
            const res = await chai.request(url).delete(`/comments/2`).set('Authorization',usertoken).send();
            assert.equal(res.status, 200);
        })
        it("It should GET all the comments and DELETED the comment",async function(){
            const res = await chai.request(url).get(`/stories/${storyid}/comments`).send();
            assert.equal(res.status, 200);
            assert.equal(res.body.length, 0);
        })
    })
    describe("DELETE /stories/:id",()=>{
        it('It should DELETE the story',async function(){
            const res = await chai.request(url).delete(`/stories/${storyid}`).set('Authorization', usertoken).send();
            assert.equal(res.status,202);
        })
        it("It should GET all the stories and check if it was DELETED", async function(){
            const res = await chai.request(url).get('/stories').send();
            assert.equal(res.status,200);
            assert.isArray(res.body);
            assert.equal(res.body.length,1);
        })
    })
    describe('GET /users/:id/likes',()=>{
        it('It should get the likes of a user', async function(){
            const res = await chai.request(url).get('/users/1/likes').send();
            assert.equal(res.status, 200);
            assert.equal(res.body.length, 1)
        })
    })
});

