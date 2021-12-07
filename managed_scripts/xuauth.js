const crypto = require('crypto');
//File containing the the queries. It is language and storage agnostic, however should return data in the forats specified in "sessions"
const models = require('./xuauth_models');
//Response handling script
const xres = require('./xresponse');
//Json Web Token utility - npm install jsonwebtoken
const jwt = require('jsonwebtoken');

/* EXPECTED USER TABLE LAYOUT:
These columns must exist for this middleware to work. They should be linked to the user accounts if not already.

+--------------------------------+--------------------------------+-------------------------------+--------------------------------+----------------------------+
|       username (string)        |       password (string)        |         salt (string)         |         token (string)         | token_Date (large integer) |
+--------------------------------+--------------------------------+-------------------------------+--------------------------------+----------------------------+
| Unique user identifier that is | User password.                 | Salt for passwords.           | Authentication token           | UNIX timestamp             |
| easily accessible              | 128 characters long by default | 64 characters long by default | 128 characters long by default | BIGINT in MySQL            |
| (eg. login name/email)         |                                |                               |                                |                            |
+--------------------------------+--------------------------------+-------------------------------+--------------------------------+----------------------------+

*/

//The SessionToken object constructor; creates the format of the tokens with all the data they require
//Mandatory parameters:
//value     -   value of the token (string)
//userID    -   the associated user's ID from the database
//Optional parameters:
//expires   -   unix timestamp when the token loses it's validity. If not provided calculated automatically from settings
class sessionToken {
    constructor(value, userID, expires=undefined, payloadData=undefined) {
        this.name = settings.sessionTokenName;
        this.value = value;
        this.expires = expires || Date.now() + settings.sessionTokenLifeTimeMS;
        this.userID = userID;
        this.data = payloadData;
        this.lifeTime = settings.sessionTokenLifeTimeMS; //Same as the settings; legacy
        //Determines if the token is still valid; true or false
        this.valid = function () {
            if (this.expires >= Date.now())
            {
                return true;
            }
            else
            {
                return false;
            }
        };
        //Determines if the token can be refreshed; true or false
        this.refreshAble = function () {
            if (this.expires-settings.sessionTokenRefreshTimeMS <= Date.now())
            {
                return true;
            }
            else
            {
                return false;
            }
        };
    }
};

const token = {
    verify: (token, callback)=>{
        jwt.verify(token, process.env.XUAUTH_SECRET, (err, decoded)=>{
            if (err)
            {
                callback(err, undefined);
            }
            else
            {
                let _sessToken = new sessionToken(token, decoded.sub, decoded.exp, decoded.data);
                callback(undefined, _sessToken);
            }
        });
    },
    create: (userID, callback)=>{
        sessions.getPayload(userID, (err, payload)=>{
            if (err)
            {
                callback(err, undefined);
            }
            else
            {
                let _tokenPayload = {
                    data: payload
                }
                let _tokenOptions = {
                    expiresIn: (settings.sessionTokenLifeTimeMS.toString()),
                    subject: userID.toString(),
                    jwtid: (0).toString()
                }
                let token = jwt.sign(_tokenPayload, process.env.XUAUTH_SECRET, _tokenOptions);
                let _sessToken = new sessionToken(token, userID, _tokenOptions.expiresIn, payload);
                callback(undefined, _sessToken);
            }
        });
    }
}

const AuthenticationManager = {
    _tokenBlackList: [],
    BlackList: {
        search: (token)=>{
            //placeholder
            return true;
        },
        add: (token)=>{

        },
        _initialise: ()=>{

        }
    }
};

//Internal settings of the middleware
const settings = {
    sessionTokenLength: 64, //returns a 128 long key
    sessionTokenName: "sessid", //the name of the cookie the middleware looks for
    sessionTokenLifeTimeMS: 28800000, //the lifetime of a single token without refreshing; 8 hours (28800000) by default
    sessionTokenRefreshTimeMS: 21600000, //the time after the token can be refreshed; 6 hours (21600000) by default
    saltLength: 32, //returns a 64 long key
    logoutToken: "aaaabbbbccccdddd0000", //default token for logouts
    logoutTokenDate: 1, //default time for logout tokens
    addtionalProperties: ["corporate"]
};

//The internal query API of the middleware, modes and queries can be switched out to anything as long as they still
//function synchronously and return the specified datatypes
const sessions = {
    search: {
        //Search tokens based on token value. Returns undefined if there is an error / the token is not found.
        //Returns a sessionToken object if it is found.
        token: (token, callback) => {
            models.findToken(token, (err, result) => {
                if (err)
                {
                    console.error(err);
                    callback(err, undefined);
                }
                else
                {
                    if (result.length == 0)
                    {
                        callback(err, undefined);
                    }
                    else
                    {
                        if (Array.isArray(result))
                        {
                            result = result[0];
                        }
                        let searchResult = new sessionToken(result.token, result.ID, result.token_date);
                        callback(err, searchResult);
                    }
                }
            });
        },
        //Search tokens based on userID. Returns undefined if there is an error / the user is not found.
        //Returns a sessionToken object if it is found.
        user: (userName, callback) => {
            models.findUser(userName, (err, result) => {
                if (err)
                {
                    console.error(err);
                    callback(err, undefined);
                }
                else
                {
                    if (result.length == 0)
                    {
                        callback(err, undefined);
                    }
                    else
                    {
                        if (Array.isArray(result))
                        {
                            result = result[0];
                        }
                        let searchResult = new sessionToken(result.token, result.ID, result.token_date);
                        callback(err, searchResult);
                    }
                }
            });
        },
        //Search credentials based on userID. Returns undefined if there is an error / the user is not found.
        //Returns a passwordHash, salt, and sessionToken wrapped into a single object if they are found.
        credentials: (userName, callback) => {
            models.findUserCredentials(userName, (err, result) => {
                if (err)
                {
                    console.error(err);
                    callback(err, undefined);
                }
                else
                {
                    if (result.length == 0)
                    {
                        callback(err, undefined);
                    }
                    else
                    {
                        if (Array.isArray(result))
                        {
                            result = result[0];
                        }
                        let searchResult = {
                            //token: createNewToken(result.ID),
                            credentials: {
                                salt: result.salt,
                                password: result.password,
                                userID: result.ID,
                                tokenID: result.token_ID
                            }
                        };
                        callback(err, searchResult);
                    }
                }
            });
        }
    },
    //Updates the token in the database. Returns true or false depending on success. Expects a sessionToken object as parameter.
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
    //Creates a new token. Returns false if not successful, or a sessionToken if it is. Expects userID.
    //Recursively tries until it has a unique token.
    create: (userID, callback) => {
        let token = createNewToken();
        sessions.search.token(token, (err, result) => {
            if (err)
            {
                callback(err, result)
            }
            else if (!result)
            {
                let newSessionToken = new sessionToken(token, userID);
                sessions.upload(newSessionToken, (err, success) => {
                    if (err)
                    {
                        callback(err, false);
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
        });
    },
    //Validates tokens, refreshes them if they are refreshable. Returns the same sessionToken if valid, a new one if it was refreshed,
    //or false if it expired, the last one ONLY if getNewIfExpired is set to false. If getNewIfExpired is set to true it generates
    //a new token even if the previous one expired. This is only used for logins where this doesn't matter.
    validate: (token, callback, getNewIfExpired=false) => {
        if ((token.valid() && token.refreshAble()) || (!token.valid() && getNewIfExpired))
        {
            sessions.create(token.userID, (err, newToken)=>{
                if (err)
                {
                    callback(err, newToken);
                }
                else
                {
                    callback(err, newToken);
                }
            });
        }
        else if (token.valid())
        {
            callback(false, token);
        }
        else if (!token.valid())
        {
            callback(false, false);
        }
    },
    //Registers a new user with only the basic user data (username, password). Expects an object with username, password and salt.
    //Returns false if unsuccessful, or a sessionToken if successful.
    register: (userData, callback) => {
        models.registerUser(userData, (err, userID)=>{
            if (err)
            {
                callback(err, false);
            }
            else if (userID)
            {
                token.create(userID, (err, sessionToken)=>{
                    if (err)
                    {
                        callback(err, false);
                    }
                    else
                    {
                        callback(err, sessionToken);
                    }
                });
            }
        });
    },
    getPayload: (userID, callback)=>{
        models.AdditionalProperties(userID, settings.addtionalProperties, (err, result)=>{
            if (err)
            {
                callback(err, undefined);
            }
            else
            {
                result = result[0];
                callback(undefined, result);
            }
        });
    }
};

//This is the final function wrapping up this middleware
function addCookieAndCallNext(req, res, next, sessionToken) {
    let reqCookie = req.cookies[settings.sessionTokenName];
    if (reqCookie == undefined || reqCookie != sessionToken.value)
    {
        //Set cookie if it's new or doesn't exist, otherwise ignore it to avoid constant refreshing on the client side
        //let cookieMaxAge = (Date.now() - sessionToken.expires);
        let cookieSettings = {
            httpOnly: true,
            maxAge: sessionToken.lifeTime,
            //secure: true,
            //sameSite: 'none'
        };
        res.cookie(sessionToken.name, sessionToken.value, cookieSettings);
    }
    //Append session token to the response; this makes it accessible for other middewares and the final handler
    res.xuauth.session = sessionToken;
    next();
}

const setAdditionalProperties = (_properties=[])=>{
    if (_properties.length != 0)
    {
        settings.addtionalProperties = _properties;
    }
};

//These functions are exposed as the public middleware functions and can be used in routes
const authenticate = {
    //The main login function. Expects username and plaintext password in the req body. Sets a sessionToken inside a cookie that
    //can be used for further authentication on subsequent requests. Will always return the same token if the current one is still
    //active. Refer here if the user is logged out / their token expired.
    login: (req, res, next) => {
        res.xuauth = {};
        //Validates if the required fields [username, password] are present, and throws a 400 - Bad Request if not.
        if (req.body.username != undefined && req.body.password != undefined)
        {
            let username = req.body.username;
            //Get user information from the database
            sessions.search.credentials(username, (err, result) => {
                if (err)
                {
                    xres.error.database(res);
                }
                else if (result) //Safely assume there is only one user with the username
                {
                    //Generate the hash of the password sent within the request
                    //Notice it is never passed into a variable, but parsed straight from req to ensure it doesn't linger
                    let providedPassword = crypto.pbkdf2Sync(req.body.password.toString().trim(), result.credentials.salt, 100000, 64, 'sha256').toString('hex');
                    //Compare the password hash of the request to the one in the database; throw 401 - Unauthorized if the don't match
                    if (result.credentials.password == providedPassword)
                    {
                        //Generates a new token on every login
                        token.create(result.credentials.userID, (err, token)=>{
                            if (err)
                            {
                                xres.service.database.error(res, err);
                            }
                            else
                            {
                                addCookieAndCallNext(req, res, next, token);
                            }
                        });
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
        }
        else
        {
            xres.fail.parameters(res);
        }
    },
    //Registers a new user with the basic information required for this middleware to work. Expects a username and password in
    //req body. Returns a sessionToken in response if successful. Automatically handles errors and detects if the username is
    //already taken and throws a custom error. Note that the error is sent with a 200 OK HTTP status despite there being an issue.
    register: (req, res, next) => {
        res.xuauth = {};
        //Checks if username and password is set, throws Bad Request if not
        if (req.body.username != undefined && req.body.password != undefined)
        {
            let username = req.body.username;
            //Search for the provided username; check if it already exists or not
            sessions.search.user(username, (err, resultToken)=>{
                if (err)
                {
                    xres.error.database(res);
                }
                else if (!resultToken) //Username doesn't exist
                {
                    //Generate a new random salt
                    let salt = crypto.randomBytes(settings.saltLength).toString('hex');
                    //Hash the provided password with the generated salt
                    let password = crypto.pbkdf2Sync(req.body.password.toString().trim(), salt, 100000, 64, 'sha256').toString('hex');
                    let userData = {
                        email: username,
                        password: password,
                        salt: salt
                    };
                    //Register user with the provided information & generate and raturn a session key
                    sessions.register(userData, (err, sessionToken)=>{
                        if (err)
                        {
                            xres.error.database(res);
                        }
                        else if (sessionToken)
                        {
                            //Successful registration, continue to next middleware in chain
                            addCookieAndCallNext(req, res, next, sessionToken);
                        }
                    });
                }
                else //Username is already taken
                {
                    xres.fail.custom(res, "Username already taken.");
                }
            });
        }
        else
        {
            xres.fail.parameters(res);
        }
    },
    //Main authentication function used to grant or block access to API calls based on a sessionToken. Expects a sessionToken in a
    //req cookie. Automatically denies requestes if unauthenticated, and handles errors. If the authentication is successful, it
    //automatically calls the next middleware and continues the app flow.
    verify: (req, res, next) => {
        res.xuauth = {};
        //Validates if there is a session cookie set; if not throws a 401 - Unauthorized
        if (req.cookies[settings.sessionTokenName] != undefined)
        {
            //Convienent
            let sessionTokenValue = req.cookies[settings.sessionTokenName];
            token.verify(sessionTokenValue, (err, sessionToken)=>{
                if (err)
                {
                    xres.fail.unauthorised(res);
                }
                else
                {
                    addCookieAndCallNext(req, res, next, sessionToken);
                }
            });
        }
        else
        {
            xres.fail.unauthorised(res);
        }
    },
    //Manual logout function. Expects a sessionToken in a cookie along with the username in req body. Destroys the sessionToken
    //stored in the database, but does not updates the client side cookie. Returns generic success message if sucessful.
    //DISABLED UNTIL BLACKLISTING IS UP
    logout: (req, res, next) => {
        xres.HTTP.error.notImplemented(res);
    }
};

module.exports = authenticate;