var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var routeLoader = require('./managed_scripts/routesBuilder');
var app = express();
app.locals.siteURL = "";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// load in debugHandler
var _debugHandler = require('./managed_scripts/debugFunctionsController');
_debugHandler.logAppEnvironmentState(); // log the environment state (production / development / ?)
// ---------- Set up routes here ----------
routeLoader.loadModules(path.join(__dirname, 'routes/'), function(route) {
    app.use(route.URL, require(route.modulePath));
});
// log the final list of loaded routes (pretty) (only if not in production)
_debugHandler.functionHandler(()=>{
    console.log(routeLoader._topLevelRoutes);
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
