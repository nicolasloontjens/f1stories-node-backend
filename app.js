let createError = require('http-errors');
let express = require('express');
let path = require('path');
let logger = require('morgan');
let cors = require('cors');
const port = 3001;
let fileUpload = require("express-fileupload");

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let storiesRouter = require('./routes/stories');
let commentsRouter = require('./routes/comments');
let racesRouter = require('./routes/races');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(cors({"origin":'*',optionsSuccessStatus:200}));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/stories',storiesRouter);
app.use('/api/comments',commentsRouter);
app.use('/api/races', racesRouter);

app.use(express.static('public'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(port, () => {
  console.log(`I'm listening on port: ${port}`)
})
