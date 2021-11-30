var express = require('express');
var router = express.Router();
var xres = require("../../managed_scripts/xresponse");
var queries = require('../../models/public_index_models');

router.get('/cities', function(req, res, next) {
    queries.getCities((err, result)=>{
        if (err)
        {
            xres.error.database(res);
        }
        else
        {
            let supportedCities = [];
            result.forEach(element => {
                supportedCities.push(element.city);
            });
            let response = {
                supportedCities: supportedCities,
            };
            xres.success.OK(res, response);
        }
    });
});

router.get('/cities/:city/venues', function(req, res, next) {
    if (req.params.city)
    {
        let searchCity = req.params.city.toLowerCase();
        queries.getCityVenues(searchCity, (err, result)=>{
            if (err)
            {
                xres.error.database(res);
            }
            else
            {
                let venueList = [];
                if (result.length != 0)
                {
                    result.forEach(element => {
                        venueList.push({
                            id: element.ID,
                            name: element.name,
                            city: element.city,
                            address: element.address,
                            pricing: element.pricing,
                            businessHours: JSON.parse(element.openHours),
                            image: element.image,
                            category: element.category
                        });
                    });
                }
                xres.success.OK(res, { venues: venueList });
            }
        });
    }
    else
    {
        xres.fail.parameters(res);
    }
});

router.get('/venues/:venueID', function(req, res, next) {
    if (req.params.venueID)
    {
        queries.getVenueInfo(req.params.venueID, (err, result)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                if (result.length != 0)
                {
                    let venueData = {
                        id: result[0].ID,
                        name: result[0].name,
                        city: result[0].city,
                        address: result[0].address,
                        pricing: result[0].pricing,
                        businessHours: JSON.parse(result[0].openHours),
                        image: result[0].image,
                        category: result[0].category
                    };
                    queries.getVenueProducts(req.params.venueID, (err, productsRes)=>{
                        if (err)
                        {
                            xres.error.database(res, err);
                        }
                        else
                        {
                            let productList = [];
                            if (productsRes.length != 0)
                            {
                                productsRes.forEach(element => {
                                    productList.push({
                                        id: element.ID,
                                        name: element.name,
                                        price: element.price,
                                        description: element.description,
                                        image: element.image,
                                        category: element.category
                                    });
                                });
                            }
                            let response = {
                                products: productList,
                                venue: venueData, 
                            };
                            xres.success.OK(res, response);
                        }
                    });
                }
                else
                {
                    xres.custom_response(res, "success", "No results.", 200);
                }
            }
        });
    }
    else
    {
        xres.fail.parameters(res);
    }
});

module.exports = router;
