var express = require('express');
var router = express.Router();
var xres = require('../../managed_scripts/xresponse');
var uauth = require('../../managed_scripts/xuauth');
var blobStorage = require('../../managed_scripts/x-azure-blob');
//
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
//const azure = require('azure-storage');
//

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//singleFileUpload.single('image')
router.get('/image-upload', singleFileUpload.single('image'), function(req, res, next) {
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
