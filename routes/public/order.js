var express = require('express');
var router = express.Router();
var xres = require('../../managed_scripts/xresponse');
var queries = require('../../models/order_query_models');
//

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

module.exports = router;