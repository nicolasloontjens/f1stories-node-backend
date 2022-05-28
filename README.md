# F1 Stories: Node

NodeJS backend for my F1 Stories app.

This version is not running online, but the Laravel version is.  
<a href="http://f1stories.herokuapp.com/api/">This</a> is the endpoint

## Details

- The linter used is ESLinter
- The templating engine used is PUG, the races are shown with PUG on the /races link.
- The tests are implemented using Mocha and Chai, to run the tests:
```
- Enter your database credentials in the .env file, the fields required are inside .env.example

- Run the api using node ./app.js
- In another terminal window, run npm test in the root directory
```

## Run locally:

- Copy the .env.example file and call it .env, fill in the required data to connect to a mysql database locally.
- Create the necessary tables and fill the necessary data using npm run db-up
- Run the app with npm start (or node ./app.js)

## Endpoints:

NOTE: all endpoints with POST, PUT and DELETE require a JWT token in the
Authorization header of the request, this token is given when registering as a user, and updated when logging in as a user

- POST /users/register
- POST /users/login  
=> body required for these:
```
{
    "username":"your username",
    "password":"your password"
}
```

- GET /stories
- GET /stories/{storyid}/comments
- GET /users/{uid}
- GET /races
- GET /users/{uid}/likes  
=> get endpoints for basic information the app needs

- POST /stories  
Body => 
```
{
    "title":"a title",
    "content":"your story",
    "country":"Belgium",
    "raceid":1,
    "image1": file,
    "image2": file, 
    "image3": file
}
```
In the app the body is a form data object so the files can be sent to the api, these 3 "images" are optional.

- PUT /stories/{storyid}  
Body => 
```
{
    "content":"your updated post"
}
```
- DELETE /stories/{storyid}  


- POST /stories/{storyid}/comments  
Body =>
- PUT /comments/{commentid}  
Body =>
```
{
    "content":"your comment"
}
```


- DEL /comments/{commentid}


- POST /stories/{storyid}/interact  
Body => 
```
{
    "interact":0 or 1
}
```
like or un-like a post

- POST /users/{uid}/race
Body =>
```
    "race":"Bahrain GP"
```
accepted race values are the titles of races found in the /races endpoint