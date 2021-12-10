var express = require('express');
var router = express.Router();
var uauth = require('../../managed_scripts/xuauth');
var xres = require('../../managed_scripts/xresponse');
var queries = require('../../models/user_account_models');
var Ajv = require('ajv');
var _ajv = new Ajv();

router.post('/login', uauth.login, function(req, res) {
    //Login successful in uauth, continue here.
    //Gets the user's realm; either corporate or consumer, to tell the app which route they can use
    queries.getUserRealm(res.xuauth.session.userID, (err, result)=>{
        if (err)
        {
            xres.error.database(res);
        }
        else
        {
            let nameSpace = "";
            if (result[0].corporate) //if it is true, the user is corporate
            {
                nameSpace = "corporate";
            }
            else //if false, the user is a consumer
            {
                nameSpace = "consumer";
            }
            //send out the realm name
            xres.success.OK(res, { realm: nameSpace });
        }
    });
});

const user_register_schema = {
    type: "object",
    required: ["customerName", "address", "address_city", "phone", "corporate"],
    properties: {
        customerName: {
            type: "string",
            minLength: 2,
            maxLength: 128
        },
        address: {
            type: "string",
            minLength: 1,
            maxLength: 256
        },
        address_city: {
            type: "string",
            minLength: 1,
            maxLength: 128
        },
        phone: {
            type: "string",
            minLength: 8,
            maxLength: 16
        },
        corporate: {
            type: "boolean"
        },
    },
    //additionalProperties: false
};

const preRegisterValidation = (req, res, next) => {
    var valid = _ajv.validate(user_register_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else
    {
        next();
    }
};

//Validation should come before uauth
router.post('/register', preRegisterValidation, uauth.register, function(req, res) {
    let register_userinfo = {
        userID: res.xuauth.session.userID,
        name: req.body.customerName.toString(),
        address: req.body.address.toString(),
        city: req.body.address_city.toString(),
        phone: req.body.phone.toString(),
        corporate: !!req.body.corporate,
    };
    queries.registerUser(register_userinfo, (err, result)=>{
        if (err)
        {
            xres.error.database(res);
        }
        else
        {
            //Registration complete, send back the realm.
            //Auth cookie is set by the uauth middleware automatically!
            let nameSpace = "";
            if (register_userinfo.corporate) //if it is true, the user is corporate
            {
                nameSpace = "corporate";
            }
            else //if false, the user is a consumer
            {
                nameSpace = "consumer";
            }
            xres.success.created(res, { realm: nameSpace });
        }
    });
});

router.post('/logout', uauth.logout, function(req, res) {});

router.get('/continueSession', uauth.verify, function(req, res) {
    let nameSpace = "";
    if (res.xuauth.session.data.corporate) //if it is true, the user is corporate
    {
        nameSpace = "corporate";
    }
    else //if false, the user is a consumer
    {
        nameSpace = "consumer";
    }
    xres.success.OK(res, {realm: nameSpace});
});

module.exports = router;
