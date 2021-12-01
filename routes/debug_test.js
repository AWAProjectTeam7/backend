var express = require('express');
var router = express.Router();
var uauth = require('../managed_scripts/xuauth');
var xres = require('../managed_scripts/xresponse');
var _debugHandler = require('../managed_scripts/debugFunctionsController');
const database = require('../database');

/* GET users listing. */
router.get('/', _debugHandler.routeHandler, function(req, res, next) {
    /*database.query('SELECT * FROM user WHERE email=?', ["test"], (err, result)=>{
        xres.success.OK(res, result);
    });*/
});

router.post('/register', _debugHandler.routeHandler, uauth.register, function(req, res) {
    xres.success.OK(res);
});

router.get('/verif', _debugHandler.routeHandler, uauth.verify, function(req, res) {
    xres.success.OK(res);
});

router.post('/login', _debugHandler.routeHandler, uauth.login, function(req, res) {
    xres.success.OK(res);
});

router.post('/logout', _debugHandler.routeHandler, uauth.logout, function(req, res) {
    //xres.success.OK(res);
});



module.exports = router;
