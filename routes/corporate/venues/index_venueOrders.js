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

router.post('/:venueID/orders/:orderKey/setState', uauth.verify, userPermissionsHandler(_routerPermissionTag), function(req, res, next) {
    queries.getVenueOrderState(req.params.venueID, req.params.orderKey, (err, result)=>{
        if (err)
        {
            xres.service.database.error(res, err);
        }
        else
        {
            result = result[0];
            if (result.status <= 5)
            {
                result.status++;
                _response = {
                    next: 0,
                    status: result.status
                };
                if (result.status < 5)
                {
                    queries.setVenueOrderState(req.params.venueID, req.params.orderKey, result.status, (setErr, setResult)=>{
                        if (setErr)
                        {
                            xres.service.database.error(res, setErr);
                        }
                        else
                        {
                            _response.next = _response.status + 1;
                            xres.HTTP.success.OK(res, _response);
                        }
                    });
                    
                }
                else
                {
                    _response.next = 0;
                    xres.HTTP.success.OK(res, _response);
                }
            }
            else
            {
                xres.HTTP.fail.parameters(res, "Order state can not be changed, as it has been delivered.");
            }
        }
    });
});

module.exports = router;
