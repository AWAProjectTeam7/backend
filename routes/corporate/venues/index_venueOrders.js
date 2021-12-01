var express = require('express');
var router = express.Router();
var xres = require('../../../managed_scripts/xresponse');
var uauth = require('../../../managed_scripts/xuauth');
var blobStorage = require('../../../managed_scripts/x-azure-blob');
//
var debugFunctionsController = require('../../../managed_scripts/debugFunctionsController');
//
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
//

router.get('/:venueID/orders', debugFunctionsController.routeHandler, function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/:venueID/orders/:orderKey', debugFunctionsController.routeHandler, function(req, res, next) {
    res.render('index', { title: 'Express' });
});

//UNUSED
router.get('/image-upload', debugFunctionsController.routeHandler, singleFileUpload.single('image'), function(req, res, next) {
    blobStorage("images", {
        content: req.file.buffer,
        contentType: req.file.mimetype,
        extension: req.file.originalname.split(".")[1]
    }, (error, result)=>{
        if (error)
        {
            xres.custom_response(res, "Azure error", error, 400);
        }
        else
        {
            xres.success.created(res, result);
        }
    });
});

module.exports = router;
