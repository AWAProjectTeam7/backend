var express = require('express');
var router = express.Router();
var uauth = require('../managed_scripts/xuauth');
var xres = require('../managed_scripts/xresponse');
const database = require('../database');

/* GET users listing. */
router.get('/', function(req, res, next) {
    database.query('SELECT * FROM user WHERE email=?', ["test"], (err, result)=>{
        xres.success.OK(res, result);
    });
});

router.post('/register', uauth.register, function(req, res) {
    xres.success.OK(res);
});

router.get('/verif', uauth.verify, function(req, res) {
    xres.success.OK(res);
});

router.post('/login', uauth.login, function(req, res) {
    xres.success.OK(res);
});

router.post('/logout', uauth.logout, function(req, res) {
    //xres.success.OK(res);
});

module.exports = router;
