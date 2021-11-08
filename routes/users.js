var express = require('express');
var router = express.Router();
var uauth = require('../managed_scripts/xuauth');
var xres = require('../managed_scripts/xresponse');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/register', uauth.register, function(req, res) {
    xres.success(res);
});

router.get('/verif', uauth.verify, function(req, res) {
    xres.success(res);
});

router.post('/login', uauth.login, function(req, res) {
    xres.success(res);
});

module.exports = router;
