var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var xres = require('../../managed_scripts/xresponse');
var uauth = require('../../managed_scripts/xuauth');
var queries = require('../../models/order_query_models');
var utils = require('../../managed_scripts/xutils');
var userPermissionsHander = require('../../managed_scripts/userPermissionsHandler');
var _routerPermissionTag = "consumer";
var Ajv = require('ajv');
var _ajv = new Ajv();
//
const set_order_schema = {
    type: "object",
    required: ["venueID", "orderContents"],
    properties: {
        venueID: {
            type: "number",
        },
        orderContents: {
            type: "array",
            items: {
                type: "object",
                required: ["productID", "quantity"],
                properties: {
                    productID: {
                        type: "number"
                    },
                    quantity: {
                        type: "number"
                    },
                },
                additionalProperties: false
            }
        }
    },
    additionalProperties: false
};

router.get('/', uauth.verify, userPermissionsHander(_routerPermissionTag), function(req, res, next) {
    queries.getOrders(res.xuauth.session.userID, (err, orderList)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            let orders = [];
            orderList.forEach(element => {
                orders.push({
                    orderID: element.orderID,
                    venue: {
                        name: element.name,
                        image: element.image
                    },
                    details: {
                        total: element.cost,
                        receivedDate: element.received_date,
                        completedDate: element.complete_date,
                        status: element.status
                    }
                });
            });
            let response = {
                orders: orders,
            };
            xres.success.OK(res, response);
        }
    });
});

//not a protected route; the orderKey is a 128char unique secure random string, so it's fine, and makes it easier for users to
//potentially bookmark this info.
router.get('/:orderKey', function(req, res, next) {
    if (req.params.orderKey.length == 128 && req.params.orderKey)
    {
        queries.getOrder(req.params.orderKey, (err, orderDetails)=>{
            if (err)
            {
                xres.error.database(res);
            }
            else if (orderDetails.length != 0)
            {
                orderDetails = orderDetails[0];
                let orderDetails_formatted = {
                    customer: {
                        name: orderDetails.username,
                        address: orderDetails.useraddress,
                        city: orderDetails.usercity,
                        contact: orderDetails.usercontact
                    },
                    venue: {
                        name: orderDetails.venuename,
                        address: orderDetails.venueaddress,
                        city: orderDetails.venuecity,
                    },
                    details: {
                        total: orderDetails.cost,
                        receivedDate: orderDetails.received_date,
                        estimatedDate: orderDetails.est_date,
                        completedDate: orderDetails.complete_date,
                        status: orderDetails.status
                    },
                    contents: JSON.parse(orderDetails.contents),
                };
                xres.success.OK(res, orderDetails_formatted);
            }
            else
            {
                xres.custom_response(res, "success", "No result.", 200);
            }
        });
    }
    else
    {
        xres.fail.parameters(res);
    }
});

router.post('/', uauth.verify, userPermissionsHander(_routerPermissionTag), function(req, res, next) {
    var valid = _ajv.validate(set_order_schema, req.body);
    if (!valid)
    {
        xres.fail.parameters(res, _ajv.errorsText(_ajv.errors));
    }
    else //schema valid
    {
        utils.unique.database.loop(()=>{
            return crypto.randomBytes(64).toString('hex');
        }, "matching_orders", queries.checkIfOrderExists, (result, value)=>{
            if (result)
            {
                let productIDs = [];
                let orderContents = req.body.orderContents;
                req.body.orderContents.forEach(element => {
                    productIDs.push(element.productID);
                });
                queries.retreiveProducts(productIDs, (err, result)=>{
                    if (err)
                    {
                        xres.error.database(res, err);
                    }
                    else
                    {
                        let orderTotal = 0;
                        result.forEach(element => {
                            let _id = orderContents.findIndex(_element => _element.productID == element.ID);
                            orderContents[_id].name = element.name;
                            orderContents[_id].price = element.price;
                            orderTotal += orderContents[_id].price *  orderContents[_id].quantity;
                        });
                        let orderDetails = {
                            orderID: value,
                            userID: res.xuauth.session.userID,
                            restaurantID: req.body.venueID,
                            received_date: Date.now(),
                            status: 1,
                            cost: Math.round((orderTotal + Number.EPSILON) * 100) / 100,
                            contents: orderContents,
                        };
                        queries.addOrder(orderDetails, (err, result)=>{
                            if (err)
                            {
                                xres.error.database(res, err);
                            }
                            else
                            {
                                xres.success.created(res, {orderID: orderDetails.orderID});
                            }
                        });
                    }
                });
            }
            else
            {
                xres.error.database(res);
            }
        });
    }
});

router.get('/events/:orderKey', uauth.verify, userPermissionsHander(_routerPermissionTag), function(req, res, next) {
    if (req.params.orderKey.length == 128 && req.params.orderKey)
    {
        queries.getOrderStatus(req.params.orderKey, (err, result)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                result = result[0];
                let response = {
                    orderStatus: {
                        receivedDate: result.received_date,
                        estimatedDate: result.est_date,
                        completedDate: result.complete_date,
                        status: result.status
                    }
                };
                xres.success.OK(res, response);
            }
        });
    }
    else
    {
        xres.fail.parameters(res);
    }
});

module.exports = router;