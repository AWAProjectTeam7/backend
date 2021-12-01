var express = require('express');
var router = express.Router();
var xres = require('../../../managed_scripts/xresponse');
var uauth = require('../../../managed_scripts/xuauth');
var queries = require('../../../models/venue_data_models');
//
var debugFunctionsController = require('../../../managed_scripts/debugFunctionsController');
//Permissions enforcer
var userPermissionsHander = require('../../../managed_scripts/userPermissionsHandler');
userPermissionsHander.setExpectedPermissionTag("corporate");
//Azure Blob Storage wrapper
var blobStorage = require('../../../managed_scripts/x-azure-blob');
//Validation
var Ajv = require('ajv');
var _ajv = new Ajv();
//
const set_restaurant_schema = {
    type: "object",
    required: [`categoryID`, `name`, `address`, `city`, `openHours`, `pricing`],
    properties: {
        categoryID: {
            type: "number",
            minimum: 1,
            maximum: 6
        },
        name: {
            type: "string",
            minLength: 3,
            maxLength: 128
        },
        address: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        city: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        pricing: {
            type: "number",
            minimum: 0,
            maximum: 3,
        },
        openHours: {
            type: "object",
            /*required: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            allOf: [
                { type: "array" },
                { maxItems: 2 },
                { items: {
                    type: "number",
                    minimum: 0,
                    maximum: 86400000
                }},
                { additionalItems: false }
            ],
            additionalProperties: false*/
        }
    },
    additionalProperties: false
};
const update_restaurant_schema = {
    type: "object",
    //required: [`categoryID`, `name`, `address`, `city`, `openHours`, `pricing`, `image`],
    properties: {
        categoryID: {
            type: "number",
            minimum: 1,
            maximum: 6
        },
        name: {
            type: "string",
            minLength: 3,
            maxLength: 128
        },
        address: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        city: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        pricing: {
            type: "number",
            minimum: 0,
            maximum: 3,
        },
        openHours: {
            type: "object",
            /*required: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            allOf: [
                { type: "array" },
                { maxItems: 2 },
                { items: {
                    type: "number",
                    minimum: 0,
                    maximum: 86400000
                }},
                { additionalItems: false }
            ],
            additionalProperties: false*/
        },
        image: { }
    },
    additionalProperties: false
};
//
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
//
router.get('/', debugFunctionsController.routeHandler, uauth.verify, userPermissionsHander.checkPermission, function(req, res, next) {

    queries.getVenues(res.xuauth.session.userID, (err, result)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            let venueList = [];
            if (result.length != 0)
            {
                result.forEach(element => {
                    venueList.push({
                        id: element.ID,
                        name: element.name,
                        city: element.city,
                        address: element.address,
                        pricing: element.pricing,
                        businessHours: JSON.parse(element.openHours),
                        image: element.image,
                        category: element.category
                    });
                });
            }
            xres.success.OK(res, { venues: venueList });
        }
    });
});

router.post('/', debugFunctionsController.routeHandler, uauth.verify, userPermissionsHander.checkPermission, singleFileUpload.single('image'), function(req, res, next) {
    //let _stringBody = JSON.stringify(req.body);
    req.body.pricing = parseInt(req.body.pricing);
    req.body.categoryID = parseInt(req.body.categoryID);
    req.body.openHours = JSON.parse(req.body.openHours);
    var valid = _ajv.validate(set_restaurant_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        req.body.openHours = JSON.stringify(req.body.openHours);
        let venueData = [req.body.categoryID, res.xuauth.session.userID, req.body.name, req.body.address, req.body.city, req.body.openHours, req.body.pricing, ""];
        queries.addNewVenue(venueData, (err, result)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                blobStorage("images", {
                    content: req.file.buffer,
                    contentType: req.file.mimetype,
                    extension: req.file.originalname.split(".")[1]
                }, (error, blobresult)=>{
                    if (error)
                    {
                        xres.error.azure(res, err);
                    }
                    else
                    {
                        queries.addVenueImage(blobresult.file_URL, result.insertId, (err, _dbImageRes)=>{
                            if (err)
                            {
                                xres.error.database(res, err);
                            }
                            else
                            {
                                xres.success.created(res, {venueID: result.insertId});
                            }
                        });
                    }
                });
            }
        });
    }
});

router.get('/:venueID', debugFunctionsController.routeHandler, uauth.verify, userPermissionsHander.checkPermission, function(req, res, next) {
    queries.getVenueInfo(req.params.venueID, (err, result)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            if (result.length != 0)
            {
                let venueData = {
                    id: result[0].ID,
                    name: result[0].name,
                    city: result[0].city,
                    address: result[0].address,
                    pricing: result[0].pricing,
                    businessHours: JSON.parse(result[0].openHours),
                    image: result[0].image,
                    category: result[0].category
                };
                queries.getVenueProducts(req.params.venueID, (err, productsRes)=>{
                    if (err)
                    {
                        xres.error.database(res, err);
                    }
                    else
                    {
                        let productList = [];
                        if (productsRes.length != 0)
                        {
                            productsRes.forEach(element => {
                                productList.push({
                                    id: element.ID,
                                    name: element.name,
                                    price: element.price,
                                    description: element.description,
                                    image: element.image,
                                    category: element.category
                                });
                            });
                        }
                        let response = {
                            products: productList,
                            venue: venueData, 
                        };
                        xres.success.OK(res, response);
                    }
                });
            }
            else
            {
                xres.custom_response(res, "success", "No results.", 200);
            }
        }
    });
});

router.post('/:venueID/update', debugFunctionsController.routeHandler, uauth.verify, userPermissionsHander.checkPermission, singleFileUpload.single('image'), function(req, res, next) {
    req.body.pricing = parseInt(req.body.pricing);
    req.body.categoryID = parseInt(req.body.categoryID);
    req.body.openHours = JSON.parse(req.body.openHours);
    var valid = _ajv.validate(update_restaurant_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        req.body.openHours = JSON.stringify(req.body.openHours);
        let bodyFields = {...req.body};
        //delete bodyFields.image
        let venueUpdateData_columns = Object.keys(bodyFields);
        let venueUpdateData_values = Object.values(bodyFields);
        if (venueUpdateData_columns.length != 0)
        {
            queries.updateVenueData(req.params.venueID, venueUpdateData_columns, venueUpdateData_values, (err, result)=>{
                if (err)
                {
                    xres.error.database(res, err);
                }
                else
                {
                    if (req.file)
                    {
                        uploadImage(req, (error, blobresult)=>{
                            if (error)
                            {
                                xres.error.azure(res, err);
                            }
                            else
                            {
                                queries.addVenueImage(blobresult.file_URL, req.params.venueID, (err, _dbImageRes)=>{
                                    if (err)
                                    {
                                        xres.error.database(res, err);
                                    }
                                    else
                                    {
                                        xres.success.OK(res, {venueID: req.params.venueID});
                                    }
                                });
                            }
                        });
                    }
                    else
                    {
                        xres.success.OK(res, {venueID: req.params.venueID});
                    }
                }
            });
        }
        else if (req.file)
        {
            uploadImage(req, (error, blobresult)=>{
                if (error)
                {
                    xres.error.azure(res, err);
                }
                else
                {
                    queries.addVenueImage(blobresult.file_URL, req.params.venueID, (err, _dbImageRes)=>{
                        if (err)
                        {
                            xres.error.database(res, err);
                        }
                        else
                        {
                            xres.success.OK(res, {venueID: req.params.venueID, image: blobresult.file_URL});
                        }
                    });
                }
            });
        }
        else
        {
            xres.fail.parameters(res, "No parameters given.");
        }
    }
});

function uploadImage (req, callback) {
    blobStorage("images", {
        content: req.file.buffer,
        contentType: req.file.mimetype,
        extension: req.file.originalname.split(".")[1]
    }, callback);
}

module.exports = router;
