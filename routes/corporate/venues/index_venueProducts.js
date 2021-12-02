var express = require('express');
var router = express.Router();
var xres = require('../../../managed_scripts/xresponse');
var uauth = require('../../../managed_scripts/xuauth');
var blobStorage = require('../../../managed_scripts/x-azure-blob');
var queries = require('../../../models/product_data_models');
//Permissions enforcer
var userPermissionsHandler = require('../../../managed_scripts/userPermissionsHandler');
var _routerPermissionTag = "corporate";
//
const multer = require('multer')
const inMemoryStorage = multer.memoryStorage();
const singleFileUpload = multer({ storage: inMemoryStorage });
//Validation
var Ajv = require('ajv');
var _ajv = new Ajv();
//
const set_product_schema = {
    type: "object",
    required: [`categoryID`, `name`, `price`, `description`],
    properties: {
        categoryID: {
            type: "number",
            minimum: 1,
        },
        name: {
            type: "string",
            minLength: 3,
            maxLength: 128
        },
        price: {
            type: "number",
            minimum: 0,
            maximum: 9999.99
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 128
        }
    },
    additionalProperties: false
};
const set_category_schema = {
    type: "object",
    required: [`name`],
    properties: {
        name: {
            type: "string",
            minLength: 3,
            maxLength: 128
        }
    },
    additionalProperties: false
};
const update_product_schema = {
    type: "object",
    //required: [`categoryID`, `name`, `price`, `description`],
    properties: {
        categoryID: {
            type: "number",
            minimum: 1,
        },
        name: {
            type: "string",
            minLength: 3,
            maxLength: 128
        },
        price: {
            type: "number",
            minimum: 0,
            maximum: 9999.99
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 128
        }
    },
    additionalProperties: false
};
//
router.get('/:venueID/products', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.getProducts(req.params.venueID, (err, productsRes)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            xres.success.OK(res, productsRes);
        }
    });
});

router.post('/:venueID/products', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    //check if category ID is valid within the venue's scope
    var valid = _ajv.validate(set_product_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        queries.addNewProduct(req.params.venueID, req.body, (err, result)=>{
            if (err)
            {
                xres.service.database.error(res, err);
            }
            else
            {
                xres.service.database.created(res, {productID: result.insertId});
            }
        });
    }
});

router.delete('/:venueID/products/:productID', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.deleteProduct(req.params.productID, req.params.venueID, (err, result)=>{
        if (err)
        {
            xres.service.database.error(res, err);
        }
        else
        {
            xres.service.database.OK(res, {productID: req.params.productID});
        }
    });
});

router.post('/:venueID/products/:productID/update', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    var valid = _ajv.validate(update_product_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        let bodyFields = {...req.body};
        let productUpdateData_columns = Object.keys(bodyFields);
        let productUpdateData_values = Object.values(bodyFields);
        queries.updateVenueProduct(req.params.venueID, req.params.productID, productUpdateData_columns, productUpdateData_values, (err, result)=>{
            if (err)
            {
                xres.service.database.error(res, err);
            }
            else
            {
                xres.service.database.OK(res, {productID: req.params.productID});
            }
        });
    }
});

router.get('/:venueID/products/categories', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.getCategories(req.params.venueID, (err, result)=>{
        if (err)
        {
            xres.service.database.error(res, err);
        }
        else
        {
            xres.service.database.OK(res, {categories: result});
        }
    });
});

router.post('/:venueID/products/categories', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    var valid = _ajv.validate(set_category_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        queries.addCategory(req.params.venueID, req.body.name, (err, result)=>{
            if (err)
            {
                xres.service.database.error(res, err);
            }
            else
            {
                xres.service.database.created(res, {categoryID: result.insertId});
            }
        });
    }
});

router.delete('/:venueID/products/categories/:categoryID', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    //check if category ID is valid within the venue's scope
    //check if category is in use
    queries.deleteCategory(req.params.venueID, req.params.categoryID, (err, result)=>{
        if (err)
        {
            xres.service.database.error(res, err);
        }
        else
        {
            xres.service.database.OK(res, {category: result});
        }
    });
});

router.get('/:venueID/products/:productID/image-upload', uauth.verify, userPermissionsHandler(_routerPermissionTag), singleFileUpload.single('image'), function(req, res, next) {
    blobStorage("images", {
        content: req.file.buffer,
        contentType: req.file.mimetype,
        extension: req.file.originalname.split(".")[1]
    }, (error, blobresult)=>{
        if (error)
        {
            xres.service.azure.blobStorage.error(res, error);
        }
        else
        {
            queries.addProductImage(blobresult.file_URL, req.params.productID, req.params.venueID, (err, result)=>{
                if (err)
                {
                    xres.service.database.error(res, err);
                }
                else
                {
                    xres.service.database.created(res, {productID: req.params.productID, image: blobresult.file_URL});
                }
            });
        }
    });
});

module.exports = router;
