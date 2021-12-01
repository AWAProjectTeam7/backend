var queries = require('../models/user_account_models');
var xres = require('./xresponse');

var _expectedPermissionTag = "";

const setExpectedPermissionTag = (_tag="")=>{
    _expectedPermissionTag = _tag;
}

const checkPermission = (req, res, next) => {
    if (res.xuauth.session.userID)
    {
        queries.getUserData(res.xuauth.session.userID, (err, result)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                result = result[0];
                let nameSpace = "";
                if (result.corporate) //if it is true, the user is corporate
                {
                    nameSpace = "corporate";
                }
                else //if false, the user is a consumer
                {
                    nameSpace = "consumer";
                }
                if (nameSpace == _expectedPermissionTag)
                {
                    next();
                }
                else
                {
                    xres.HTTP.fail.forbidden(res);
                }
            }
        });
    }
    else
    {
        xres.HTTP.fail.forbidden(res);
    }
}

module.exports = {
    setExpectedPermissionTag,
    checkPermission
};