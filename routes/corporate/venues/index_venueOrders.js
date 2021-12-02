var express = require('express');
var router = express.Router();
var xres = require('../../../managed_scripts/xresponse');
var uauth = require('../../../managed_scripts/xuauth');
var queries = require('../../../models/venue_order_models');
//
var debugFunctionsController = require('../../../managed_scripts/debugFunctionsController');
//Permissions enforcer
var userPermissionsHandler = require('../../../managed_scripts/userPermissionsHandler');
var _routerPermissionTag = "corporate";
//

router.get('/:venueID/orders', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.getVenueOrders(req.params.venueID, (err, result)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            xres.success.OK(res, {orders: result});
        }
    });
});

router.get('/:venueID/orders/:orderKey', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.getVenueOrder(req.params.venueID, req.params.orderKey, (err, orderDetails)=>{
        if (err)
        {
            xres.error.database(res, err);
        }
        else
        {
            orderDetails = orderDetails[0];
            let orderDetails_formatted = {
                customer: {
                    name: orderDetails.customerName,
                    address: orderDetails.customerAddress,
                    city: orderDetails.customerCity,
                    contact: orderDetails.customerContact
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
            xres.success.OK(res, {orders: orderDetails_formatted});
        }
    });
});

router.get('/:venueID/orders/:orderKey/setState', debugFunctionsController.routeHandler, uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    //to do
});

module.exports = router;
