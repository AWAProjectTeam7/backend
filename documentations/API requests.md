## API documentation
This document contains the documentation for every API call from the client's perspective, building on the remote dynamic route definiton `routes.json` file's contents.

# User authentication
This section contains the API routes used for user authentication.

Every route that requires authentication will throw a HTTP 401 Unauthorized error if the request contains no authentication keys or they are invalid for the given route. The keys' permission level is confirmed by the server on login by the `realm` property.

### Register new user
URL: `auth/register`

route ID: `register`

URL params: `none`

##### POST
Request:

The `corporate` attribute decides if the account has consumer or corporate priviliges. In a real world scenario this would be very different and not open like this.

The username has to be a unique property; if it has been already registered the system will throw the request back with an "Username already taken." error.
```JSON
{
    "userName": "example@example.com",
    "password": "example1234",
    "customerName": "John Doe", //min 2, max 128 characters
    "address": "Park street 15A 67", //min 1, max 256 characters
    "address_city": "Helsinki", //min 1, max 128 characters
    "phone": "0449394536", //min 8, max 16 characters
    "corporate" : true / false
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "realm": "corporate" / "consumer"
    }
}
```

### Login user
URL: `auth/login`

route ID: `login`

URL params: `none`

##### POST
Request:
```JSON
{
    "userName": "example@example.com",
    "password": "example1234"
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "realm": "corporate" / "consumer"
    }
}
```

### Logout user
URL: `auth/logout`

route ID: `logout`

URL params: `none`

##### POST
Request:

Even though the username is required, it is just a safety measure to prevent randomly guessing and deactivating user session keys.
```JSON
{
    "userName": "example@example.com"
}
```
Response:
```JSON
{
    "status": "success"
}
```

# Public routes
This section contains the API routes used to access publicly available data. These routes do not require authentication of any kind.

### Get list of available cities
URL: `public/cities`

route ID: `get_cities`

URL params: `none`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "supportedCities": [
            "Helsinki",
            "Oulu",
            "Tampere",
            ...
        ]
    }
}
```

### Get venues in a given city
URL: `public/cities/#/venues`

route ID: `get_venues_by_city`

URL params: `venueID`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "venues": [
            {
                "ID": 3,
                "name": "Example restaurant 1",
                "city": "Oulu",
                "address": "Example street 6, 90120",
                "pricing": 0,
                "businessHours": {
                    "fri": [
                        "10",
                        "20"
                    ],
                    "mon": [
                        "10",
                        "20"
                    ],
                    "sat": [
                        "10",
                        "20"
                    ],
                    "sun": [
                        "10",
                        "20"
                    ],
                    "thu": [
                        "10",
                        "20"
                    ],
                    "tue": [
                        "10",
                        "20"
                    ],
                    "wen": [
                        "10",
                        "20"
                    ]
                },
                "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png",
                "category": "Buffet"
            },
            ...
        ]
    }
}
```

### Get venue info and products
URL: `public/venues/#`

route ID: `get_venue_and_products_by_venueID`

URL params: `venueID`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "venue": {
            "ID": 3,
            "name": "Example restaurant 1",
            "city": "Oulu",
            "address": "Example street 6, 90120",
            "pricing": 0,
            "businessHours": {...},
            "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png",
            "category": "Buffet"
        },
        "products": [
            {
                "ID": 1,
                "name": "Example product 1",
                "price": 15.36,
                "description": "Example Product Description",
                "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png",
                "category": "Category 1"
            },  
            ...
        ]
    }
}
```

# Consumer routes
This section contains the API routes used to access consumer data such us accounts and orders.
These routes can be only accessed if authenticated with consumer account, and can not be accessed otherwise.

## Accounts

### Get accound information
URL: `get_consumer_account_data`

route ID: `consumer/account`

URL params: `none`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "user": {
            "ID": 4,
            "name": "Example Customer 02",
            "email": "example02@outlook.com",
            "address": "Example Address 25",
            "city": "Oulu",
            "phone": "0449635662",
            "realm": "consumer"
        }
    }
}
```

### Update account inforation
URL: `consumer/account/update`

route ID: `post_consumer_account_data_change`

URL params: `none`

##### POST
Request:

This request *requires* the username and password, and treates the update action as a new login.

However aside the two mandatory fields, any field provided during registration (except username, password, corporate) can be included with a new value that will overwrite the current values. Multiple properties can be included in one request, and they are processed in order.

```JSON
{
    "userName":"example@example.com"
    "password":"example1234"
    "phone":"0449765662"
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "realm": "consumer"
    }
}
```

## Orders

### Get order history
URL: `consumer/orders`

route ID: `get_consumer_order_history`

URL params: `none`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "orders": [
            {
                "orderID": "0967da1c642f0f705c295d0bfd72360e448d229bc10e245245c99b9a9da492cfae29b8cfff77d1495d0f6c5872c1a7d94a3fae5e86897119d5db58f51809f4e7",
                "venue": {
                    "name": "Example restaurant 1",
                    "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png"
                },
                "details": {
                    "total": 49.45,
                    "receivedDate": 1638484389294,
                    "completedDate": null,
                    "status": 1
                }
            }
        ]
    }
}
```

### Submit new order
URL: `consumer/orders`

route ID: `post_consumer_order`

URL params: `none`

##### POST
Request:
```JSON
{
    "venueID":3,
    "orderContents": [
        {
            "productID":2,
            "quantity":5
        },
        {
            "productID":8,
            "quantity":2
        }
    ]
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "orderID": "351c4aca5edb37557c6ffbea59ade9c39e378335ce88fdd9198cd85dae5c3e043bbf95da675962a744c3efafb82f81b56a64f740e809282282f08c5b6addff9d"
    }
}
```

### Get the specified order's information
URL: `consumer/orders/#`

route ID: `get_consumer_order_by_ID`

URL params: `orderKey`

##### GET
Request:

Append the `orderKey` (`orderID`) to the end of the request.

Response:
```JSON
{
    "status": "success",
    "data": {
        "customer": {
            "name": "Example Customer 02",
            "address": "Example Address 25",
            "city": "Oulu",
            "contact": 449635662
        },
        "venue": {
            "name": "Example restaurant 1",
            "address": "Example street 6, 90120",
            "city": "Oulu"
        },
        "details": {
            "total": 49.49,
            "receivedDate": 1638484389294,
            "estimatedDate": null,
            "completedDate": null,
            "status": 1
        },
        "contents": [
            {
                "name": "Example product 2",
                "price": 7.89,
                "quantity": 5,
                "productID": 2
            },
            {
                "name": "Example product 3",
                "price": 5,
                "quantity": 2,
                "productID": 3
            }
        ]
    }
}
```

# Corporate routes
This section contains the API routes used to access corporate data such us accounts, associated venues, and their information such as products, product categories, and order assigned to their venues.
These routes can be only accessed if authenticated with corporate account, and can not be accessed otherwise.

## Accounts

### Get account information
URL: `corporate/account`

route ID: `get_corporate_account_data`

URL params: `none`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "user": {
            "ID": 3,
            "name": "Example Customer 01",
            "email": "example01@outlook.com",
            "address": "Example Address",
            "city": "Oulu",
            "phone": "441234567",
            "realm": "corporate"
        }
    }
}
```

### Update account information
URL: `corporate/account/update`

route ID: `post_corporate_account_data_change`

URL params: `none`

##### POST
Request:

This request *requires* the username and password, and treates the update action as a new login.

However aside the two mandatory fields, any field provided during registration (except username, password, corporate) can be included with a new value that will overwrite the current values. Multiple properties can be included in one request, and they are processed in order.

```JSON
{
    "userName": "example01@outlook.com"
    "password": "example1234"
    "phone": "0449765662"
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "realm": "corporate"
    }
}
```

## Venues

### Get list of venues associated with this account
URL: `corporate/venues`

route ID: `get_corporate_venues`

URL params: `none`

##### GET
Response:
```JSON
{
    "status": "success",
    "data": {
        "venues": [
            {
                "ID": 3,
                "name": "Example restaurant 1",
                "city": "Oulu",
                "address": "Example street 6, 90120",
                "pricing": 0,
                "businessHours": {...},
                "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png",
                "category": "Buffet"
            },
            ...
        ]
    }
}
```

### Create a new venue
URL: `corporate/venues`

route ID: `post_corporate_new_venue`

URL params: `none`

##### POST
Request:

Get `categoryID` and `pricing` value arrays from `get_corporate_service_values`.

```JSON
{
    "categoryID":1,
    "name":"Example documentation restaurant",
    "address":"Example documentation address",
    "city":"Oulu",
    "openHours":{"mon":["10","20"],"tue":["10","20"],"wen":["10","20"],"thu":["10","20"],"fri":["10","20"],"sat":["10","20"],"sun":["10","20"]},
    "pricing":2
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "venueID": 9
    }
}
```

### Get the specified venue's information
URL: `corporate/venues/#`

route ID: `get_corporate_venue_by_venueID`

URL params: `venueID`

##### GET
Response:
```JSON
{
    {
        "status": "success",
        "data": {
            "ID": 9,
            "name": "API TEST 1",
            "city": "Oulu",
            "address": "test",
            "pricing": 2,
            "businessHours": {...},
            "category": "Buffet"
        }
    }
}
```

### Update the specified venue's information
URL: `corporate/venues/#/update`

route ID: `post_corporate_venue_data_change_by_venueID`

URL params: `venueID`

##### POST
Request:
`corporate/venues/9/update`
```JSON
{
    "name":"API TEST 1 documentation example"
}
```
Response:
```JSON
{
    "status": "success",
    "data": {
        "venueID": "9"
    }
}
```

### Upload a new banner image to the specified vennue
URL: `corporate/venues/#/update-image`

route ID: `post_corporate_venue_image_by_venueID`

URL params: `venueID`

##### POST

Request:

This should be done from a Form, with type `multipart/form-data`, and should only contain a single field for a single file.

Response:
```JSON
{
    "status": "success",
    "data": {
        "venueID": "9",
        "image": "https://foodservicestorage.blob.core.windows.net/images/2f086490-4e42-11ec-a285-c330597f4b6c.png"
    }
}
```

## Orders

### Get list of orders associated with the specified venue
URL: `auth/register`

route ID: `get_corporate_order_by_venueID`

URL params: `corporate/venues/#/orders`

##### GET
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Get the specified order's information
URL: `corporate/venues/#/orders/#`

route ID: `get_corporate_orders_by_venueID_orderID`

URL params: `venueID`, `orderKey`

##### GET
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

## Products

### Get the list of products associated with the specified venue
URL: `corporate/venues/#/products`

route ID: `get_corporate_venue_products_by_venueID`

URL params: `venueID`

##### GET
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Add new product to the specified venue
URL: `corporate/venues/#/products`

route ID: `post_corporate_venue_product_by_venueID`

URL params: `none`

##### POST
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Upload image to the specified venue's given product
URL: `corporate/venues/#/products/#/image-upload`

route ID: `post_corporate_venue_product_image_by_venueID_productID`

URL params: `venueID`, `productID`

##### POST
Request:

This should be done from a Form, with type `multipart/form-data`, and should only contain a single field for a single file.

Response:
```JSON
{
    
}
```

### Delete a specified venue's given product
URL: `corporate/venues/#/products/#`

route ID: `delete_corporate_venue_product_by_venueID_productID`

URL params: `venueID`, `productID`

##### DELETE
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Update the specified product's information
URL: `corporate/venues/#/products/#/update`

route ID: `post_corporate_venue_product_data_change_by_venueID_productID`

URL params: `venueID`, `productID`

##### POST
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

## Product categories

### List the product categories associated with the specified venue
URL: `corporate/venues/#/products/categories`

route ID: `get_corporate_venue_categories_by_venueID`

URL params: `venueID`

##### GET
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Add a new product category to the specified venue
URL: `corporate/venues/#/products/categories`

route ID: `post_corporate_venue_category_by_venueID`

URL params: `venueID`

##### POST
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```

### Delete a product category from the specified venue
URL: `corporate/venues/#/products/categories/#`

route ID: `delete_corporate_venue_category_by_venueID_categoryID`

URL params: `venueID`

##### DELETE
Request:
```JSON
{
    
}
```
Response:
```JSON
{
    
}
```