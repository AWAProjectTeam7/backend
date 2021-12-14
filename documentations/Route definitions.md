## API route definitions
This document contains the documentation for the remote dynamic route definiton `routes.json` file and its contents.

### How it is structured

The file follows the standard JSON format. A mandatory entry is `domain`, which should have the webservice's *public* webaddress, complete with a closing `/`. 

The rest of the entries should have an unique, descriptive name, preferably starting with the used protocol (get, post, or delete), and ending with a list of URL parameters, in order. If the need arises, the descriptive names may be replaced with unique values such as random UUIDs, however it complicated ease of access and readability.

The value of the entires should be section of the URL after the `domain`'s closing `/`, with every URL parameter replaced with a `#`.

### What it is meant for

This file is meant to be static, and not used within the backend system. The contents are meant to be read by a client side application on startup and stored within a dictionary.

Whenever a HTTP request is made, the user should reference the KEY of the desired URL route, and request that through a middleware (presently `xrequest.js`, which is being referenced as "middleware" from now on) which is able to read the dictionary. 

Then a list of parameters should be provided in an array, ordered the same way as they are required in the URL. 

The middleware takes these parameters and replaces them, in order, left-to-right, in the designated spots (`#`). If there is no spot reserved for an URL parameter, only a single value should be privided, which will be appended to the end of the URL. (this value should not be in an array)

The middleware then executes the API call, and returns the response, which can be processed in a callback given after the parameter(s).

### How it should be used

Using `xrequest.js`, the URL pointing to the routes definitions file shoud be downloaded as early as possible via the `xrequest.downloadSource();` function, and saved to an easily accessible global variable:

```js
let routes = xrequest.downloadSource("https://raw.githubusercontent.com/AWAProjectTeam7/backend/main/routes.json");
xrequest.setSource(routes);
```
For this example the loaded `routes.json` file has the following contents:

```json
{
    "domain": "https://team7awa-api.azurewebsites.net/",
    "login": "auth/login",
    "get_venue_and_products_by_venueID": "public/venues/#",
    "delete_corporate_venue_category_by_venueID_categoryID": "corporate/venues/#/products/categories/#",
    "get_corporate_orders_by_venueID_orderID": "corporate/venues/#/orders/#"
}
```

After the source is loaded in, the specific routes can be accessed with their appropriate functions:

#### GET: Takes either a single, or an array of ordered values:

```javascript
let venueID = 11;
xrequest.GET("get_venue_and_products_by_venueID", venueID, (response)=>{
    //process response data
});
```
OR
```javascript
let venueID = 11;
let orderID = "351c4aca5edb37557c6ffbea59ade9c39e378335ce88fdd9198cd85dae5c3e043bbf95da675962a744c3efafb82f81b56a64f740e809282282f08c5b6addff9d"
xrequest.GET("get_corporate_orders_by_venueID_orderID", [venueID, orderID], (response)=>{
    //process response data
});
```

#### POST: Takes a payload, and either a single, or an array of ordered values as parameters:

```javascript
let venueID = 11;
let userCredentials = {username: "example", password: "example1234"};
xrequest.POST("login", userCredentials, (response)=>{
    //process response data
}, venueID);
```

#### DELETE: Takes either a single, or an array of ordered values as URL parameters:

```javascript
let venueID = 11;
let categoryID = 9;
xrequest.DELETE("delete_corporate_venue_category_by_venueID_categoryID", [venueID, productID], (response)=>{
    //process response data
});
```
