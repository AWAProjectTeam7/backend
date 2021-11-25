var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var xres = require('../managed_scripts/xresponse');
var uauth = require('../managed_scripts/xuauth');
var queries = require('../models/order_query_models');
var utils = require('../managed_scripts/xutils');
//
const { Validator } = require('express-json-validator-middleware')
const validate = new Validator();
//

const get_order_schema = {
    type: "string",
    required: ["orderKey"],
    properties: {
        orderKey: {
            type: "string",
            minLength: 128
        }
    }
};

const set_order_schema = {
    type: "object",
    required: ["restaurantID", "orderContents"],
    properties: {
        restaurantID: {
            type: "number",
        },
        orderContents: {
            type: "array",
            items: {
                type: "object"
            }
        }
    }
};

//validate({ params: get_order_schema })
router.get('/:orderKey', function(req, res, next) {
    if (req.params.orderKey)
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
                    },
                    venue: {
                        name: orderDetails.venuename,
                        address: orderDetails.venueaddress,
                        city: orderDetails.venuecity,
                    },
                    details: {
                        total: orderDetails.cost,
                        date: orderDetails.date,
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

//validate({ body: set_order_schema })
router.post('/', uauth.verify, function(req, res, next) {
    utils.unique.database.loop(()=>{
        return crypto.randomBytes(64).toString('hex');
    }, "matching_orders", queries.checkIfOrderExists, (result, value)=>{
        if (result)
        {
            let productIDs = [];
            req.body.orderContents = JSON.parse(req.body.orderContents);
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
                        let _id = orderContents.findIndex(_element => _element.productID == element.productID);
                        orderContents[_id].name = element.name;
                        orderContents[_id].price = element.price;
                        orderTotal += orderContents[_id].price *  orderContents[_id].quantity;
                    });
                    let orderDetails = {
                        orderID: value,
                        userID: res.xuauth.session.userID,
                        restaurantID: req.body.restaurantID,
                        date: Date.now(),
                        status: 0,
                        cost: orderTotal,
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
});

module.exports = router;