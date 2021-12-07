var queries = require('../models/user_account_models');
var xres = require('./xresponse');

const checkPermission = (_permissionTag) => {
    return (req, res, next)=>{
        if (res.xuauth.session.data.corporate) //if it is true, the user is corporate
        {
            nameSpace = "corporate";
        }
        else //if false, the user is a consumer
        {
            nameSpace = "consumer";
        }
        if (nameSpace == _permissionTag)
        {
            next();
        }
        else
        {
            xres.HTTP.fail.forbidden(res);
        }
    };
}

module.exports = checkPermission;