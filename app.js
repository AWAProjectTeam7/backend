var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var routeLoader = require('./managed_scripts/routesBuilder');
var app = express();
var cors = require('cors');
app.locals.siteURL = "";
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
var corsOptions = {
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true
}
app.use(cors(corsOptions));
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'public')));
// load in debugHandler
var _debugHandler = require('./managed_scripts/debugFunctionsController');
_debugHandler.getAppEnvironmentState(); // log the environment state (production / development / ?)
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
    let errorResponse = {
        status: "error",
        errorMessage: "The requested resource could not be found. Make sure you have requested the correct address.",
        errorContents: {
            code: 404,
            message: "NOT FOUND"
        }
    };
    res.status(404).send(errorResponse);
});

module.exports = app;
