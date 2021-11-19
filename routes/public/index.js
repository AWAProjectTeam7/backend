var express = require('express');
var router = express.Router();
var uauth = require("../../managed_scripts/xuauth"); //_scriptsPath + 
var xres = require("../../managed_scripts/xresponse");
var queries = require('../../models/public_index_models'); //_modelsPath + 

router.get('/', function(req, res, next) {
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

router.get('/:city', function(req, res, next) {
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
                if (result.length != 0)
                {
                    let venueList = [];
                    let categories = [];
                    let categories_index = {};
                    result.forEach(element => {
                        if (!categories.includes(element.category))
                        {
                            categories.push(element.category);
                            categories_index[element.category] = [];
                        }
                        venueList.push({
                            id: element.restaurantID,
                            name: element.name,
                            city: element.city,
                            address: element.address,
                            pricing: element.pricing,
                            businessHours: JSON.parse(element.openHours),
                            image: element.image,
                            category: element.category
                        });
                        categories_index[element.category].push(venueList.length-1);
                    });
                    let response = {
                        venues: venueList,
                        categoryIndexes: categories_index
                    };
                    xres.success.OK(res, response);
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

router.get('/:city/venue/:venueID', function(req, res, next) {
    if (req.params.city && req.params.venueID)
    {
        queries.getCityVenueInfo(req.params.venueID, req.params.city, (err, result)=>{
            if (err)
            {
                xres.error.database(res, err);
            }
            else
            {
                if (result.length != 0)
                {
                    let venueData = {
                        id: result[0].restaurantID,
                        name: result[0].name,
                        city: result[0].city,
                        address: result[0].address,
                        pricing: result[0].pricing,
                        businessHours: JSON.parse(result[0].openHours),
                        image: "",
                        category: result[0].category
                    };
                    queries.getVenueProducts(req.params.venueID, (err, productsRes)=>{
                        if (err)
                        {
                            xres.error.database(res, err);
                        }
                        else
                        {
                            if (productsRes.length != 0)
                            {
                                let productList = [];
                                let categories = [];
                                let categories_index = {};
                                productsRes.forEach(element => {
                                    if (!categories.includes(element.category))
                                    {
                                        categories.push(element.category);
                                        categories_index[element.category] = [];
                                    }
                                    productList.push({
                                        id: element.productID,
                                        name: element.name,
                                        price: element.price,
                                        description: element.description,
                                        image: element.image,
                                        category: element.category
                                    });
                                    categories_index[element.category].push(productList.length-1);
                                });
                                let response = {
                                    products: productList,
                                    venue: venueData, 
                                    productCategoryIndexes: categories_index
                                };
                                xres.success.OK(res, response);
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
