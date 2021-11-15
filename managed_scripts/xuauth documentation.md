### xuauth.js quick documentation

All of these functions handle errors automatically and send responses to the client without input. Depending on the error type they return with the appropriate HTTP status codes and a message describing the issue.
Example error message returning ``HTTP 400 - BAD REQUEST``
```JS
{
    status: "fail",
    errorMessage: "Bad Request"
}
```
By default the session token generated are valid for 8 hours, and becomes eligible for a refresh after 6 hours, which happens automatically with any request during that time. This destroys the token and sends out a new one as a cookie. This is to block inactive sessions remaining "live" for too long. After the token expired a new one can be acquired byt logging in again.

##### Register user
Registers a new user with the basic information required for this middleware to work. Expects a username and password in req body. Returns a sessionToken in response if successful. Automatically handles errors and detects if the username is already taken and throws a custom error. Note that the error is sent with a ``HTTP 200 - OK`` status despite there being an issue.
```js
router.post('/register', uauth.register, function(req, res) {
    ...
});
```
##### Login user
The main login function. Expects username and plaintext password in the req body. Sets a sessionToken inside a cookie that can be used for further authentication on subsequent requests. Will always return the same token if the current one is still active. Refer here if the user is logged out / their token expired.
```js
router.post('/login', uauth.login, function(req, res) {
    ...
});
```
##### Logout user
Manual logout function. Expects a sessionToken in a cookie along with the username in req body. Destroys the sessionToken stored in the database, but does not updates the client side cookie, however it will not be accepted after this process. Returns generic success message if sucessful.
```js
router.post('/logout', uauth.logout, function(req, res) {
    ...
});
```

##### Verify user
Main authentication function used to grant or block access to API calls based on a sessionToken. Expects a sessionToken in a req cookie. Automatically denies requestes if unauthenticated, and handles errors. If the authentication is successful, it automatically calls the next middleware and continues the app flow, however if the authentication is unsuccessful it blocks the flow and returns ``HTTP 401 - UNAUTHORIZED``.
```js
router.get('/some/protected/api/route', uauth.verify, function(req, res) {
    ...
});

router.post('/some/protected/api/route/but/post', uauth.verify, function(req, res) {
    ...
});
```