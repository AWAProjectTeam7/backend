var express = require('express');
var router = express.Router();
var xres = require('../../managed_scripts/xresponse');
var uauth = require('../../managed_scripts/xuauth');
var queries = require('../../models/user_account_models');
var userPermissionsHander = require('../../managed_scripts/userPermissionsHandler');
var _routerPermissionTag = "corporate";
var Ajv = require('ajv');
var _ajv = new Ajv();

router.get('/', uauth.verify, userPermissionsHander(_routerPermissionTag), function(req, res, next) {
    queries.getUserData(res.xuauth.session.userID, (err, result)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            result = result[0];
            if (result.corporate)
            {
                result.corporate = "corporate";
            }
            else
            {
                result.corporate = "consumer";
            }
            let response = {
                user: {
                    ID: result.ID,
                    name: result.name,
                    email: result.email,
                    address: result.address,
                    city: result.city,
                    phone: result.phone,
                    realm: result.corporate
                }
            };
            xres.success.OK(res, response);
        }
    });
});

const update_account_schema = {
    type: "object",
    required: ["password", "username"],
    properties: {
        username: {
            type: "string",
        },
        password: {
            type: "string",
        },
        name: {
            type: "string",
            minLength: 2,
            maxLength: 128
        },
        address: {
            type: "string",
            minLength: 1,
            maxLength: 256
        },
        city: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        phone: {
            type: "string",
            maxLength: 16,
            minLength: 8
        },
    },
    additionalProperties: false
};

/**
 * cutting corners here with using uauth.login, the proper way would be to just check the cookie and password against the 
 * database but this one is way quicker since it's reusing code. Due to the time constraint I am willing to make the trade-off
 * of this route functioning as a valid login point.
 */
router.post('/update', uauth.login, userPermissionsHander(_routerPermissionTag), function(req, res, next) {
    var valid = _ajv.validate(update_account_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        let bodyFields = {...req.body};
        delete bodyFields.password;
        delete bodyFields.username;
        let accountUpdateData_columns = Object.keys(bodyFields);
        let accountUpdateData_values = Object.values(bodyFields);
        queries.updateUserData(res.xuauth.session.userID, accountUpdateData_columns, accountUpdateData_values, (err)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                xres.success.OK(res);
            }
        });
    }
});

module.exports = router;
