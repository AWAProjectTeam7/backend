const crypto = require('crypto');
const models = require('./models');
const { v5: uuidv5 } = require('uuid');
const xres = require('./xresponse');
const fs = require('fs');

class sessionToken {
    constructor(name, value, lifeTime, userID) {
        this.name = name;
        this.value = value;
        this.lifeTime = lifeTime;
        this.userID = userID;
    }
};

const settings = {
    sessionTokenLenght: 64,
    sessionTokenName: "sessid",
    sessionTokenLifeTimeMS: 28800000,
    sessionTokenRefreshTimeMS: 21600000,
    saltLenght: 32,
    //userTableFields: fs.readFileSync((__dirname+'xuauthUserFields.json')),
};

const sessions = {
    search: (token, callback) => {
        models.findToken(token, (err, result) => {
            if (err)
            {
                console.error(err);
                callback(err, -1);
            }
            else
            {
                if (result.length == 0)
                {
                    callback(err, -1);
                }
                else
                {
                    callback(err, result);
                }
            }
        });
    },
    upload: (sessionToken, callback) => {
        models.addToken(sessionToken, (err, result) => {
            if (err)
            {
                console.error(err);
                callback(err, false);
            }
            else
            {
                callback(err, true);
            }
        });
    },
    create: (userID, callback) => {
        let token = crypto.randomBytes(settings.sessionTokenLenght).toString('base64');
        sessions.search(token, (err, result) => {
            if (err)
            {
                callback(err, result)
            }
            else
            {
                if (result == -1)
                {
                    let newSessionToken = new sessionToken(settings.sessionTokenName, token, settings.sessionTokenLifeTimeMS, userID);
                    sessions.upload(newSessionToken, (err, success) => {
                        if (err)
                        {
                            callback(err, success);
                        }
                        else
                        {
                            callback(err, newSessionToken);
                        }
                    });
                }
                else
                {
                    sessions.create(userID, callback);
                }
            }
        });
    },
    validate: (tokenData, callback, getNewIfExpired=false) => {
        if (Array.isArray(tokenData))
        {
            tokenData = tokenData[0];
        }
        let reqSessionToken = new sessionToken(settings.sessionTokenName, tokenData.token, settings.sessionTokenLifeTimeMS, tokenData.userID);
        let tokenRefreshTimeStart = tokenData.token_date - settings.sessionTokenRefreshTimeMS;
        if ((tokenData.token_date >= Date.now() && tokenRefreshTimeStart <= Date.now()) || (tokenData.token_date <= Date.now() && getNewIfExpired == true))
        {
            sessions.create(tokenData.userID, (err, token)=>{
                if (err)
                {
                    callback(err, token);
                }
                else
                {
                    callback(err, token);
                }
            });
        }
        else if (tokenData.token_date > Date.now())
        {
            callback(false, reqSessionToken);
        }
        else if (tokenData.token_date <= Date.now())
        {
            callback(false, false);
        }
    },
};

function addCookieAndCallNext(req, res, next, sessionToken) {
    let reqCookie = req.cookies[settings.sessionTokenName];
    if (reqCookie == undefined || reqCookie != sessionToken.value)
    {
        res.cookie(sessionToken.name, sessionToken.value, { maxAge: sessionToken.lifeTime });
    }
    res.xuauth.session = sessionToken;
    next();
}

const authenticate = {
    login: (req, res, next) => {
        res.xuauth = {};
        let username = req.body.username;
        models.findUser(username, (err, result) => {
            if (err)
            {
                xres.error.database(res);
            }
            else if (result.length != 0)
            {
                let user = result[0];
                let providedPassword = crypto.pbkdf2Sync(req.body.password.toString().trim(), user.salt, 100000, 64, 'sha256').toString('hex');
                if (user.password == providedPassword)
                {
                    sessions.validate(user, (err, sessionToken) => {
                        if (err)
                        {
                            xres.error.database(res);
                        }
                        else
                        {
                            //res.xuauth.session = result;
                            //next();
                            addCookieAndCallNext(req, res, next, sessionToken);
                        }
                    }, true);
                }
                else
                {
                    xres.fail.unauthorised(res);
                }
            }
            else
            {
                xres.fail.unauthorised(res);
            }
        });
    },
    register: (req, res, next) => {
        res.xuauth = {};
        let username = req.body.username;
        let salt = crypto.randomBytes(settings.saltLenght).toString('hex');
        let password = crypto.pbkdf2Sync(req.body.password.toString().trim(), salt, 100000, 64, 'sha256').toString('hex');
        let userData = {
            email: username,
            password: password,
            salt: salt
        };
        models.registerUser(userData, (err, result)=>{
            if (err)
            {
                xres.error.database(res);
            }
            else
            {
                sessions.create(result[0].userID, (err, sessionToken)=>{
                    if (err)
                    {
                        xres.error.database(res);
                    }
                    else
                    {
                        //.xuauth.session = sessionToken;
                        //next();
                        addCookieAndCallNext(req, res, next, sessionToken);
                    }
                });
            }
        });
    },
    verify: (req, res, next) => {
        res.xuauth = {};
        if (req.cookies[settings.sessionTokenName] != undefined)
        {
            let sessionTokenValue = req.cookies[settings.sessionTokenName];
            sessions.search(sessionTokenValue, (err, result)=>{
                if (err)
                {
                    xres.error.database(res);
                }
                else
                {
                    if (result != -1)
                    {
                        sessions.validate(result, (err, sessionToken) => {
                            if (err)
                            {
                                xres.error.database(res);
                            }
                            else if (sessionToken)
                            {
                                //res.xuauth.session = result;
                                //next();
                                addCookieAndCallNext(req, res, next, sessionToken);
                            }
                            else
                            {
                                xres.fail.unauthorised(res);
                            }
                        });
                    }
                    else
                    {
                        xres.fail.unauthorised(res);
                    }
                }
            });
        }
        else
        {
            xres.fail.unauthorised(res);
        }
    },
    logout: (req, res, next) => {
        //
        next();
    }
};

module.exports = authenticate;