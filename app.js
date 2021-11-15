var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var routeLoader = require('./managed_scripts/routesBuilder');
var app = express();
var cors = require('cors');
app.locals.siteURL = "";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
var corsOptions = {
    origin: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'public')));
//---------- Set up routes here ----------
app.locals._scriptsPath = path.join(__dirname, 'managed_scripts/');
routeLoader(path.join(__dirname, 'routes/'), function(route) {
    app.use(route.URL, require(route.modulePath));
});

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
  //res.render('error');
});

module.exports = app;
