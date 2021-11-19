const database = require('../database');

const queries = {
    getCityVenues: (searchCity, callback) => {
        database.query('SELECT restaurant.restaurantID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurant.image, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE city=? AND restaurantCategory.restaurantCategoryID=restaurant.categoryID', [searchCity], callback);
    },
    getCityVenueInfo: (venueID, searchCity, callback) => {
        database.query('SELECT restaurant.restaurantID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE restaurantID=? AND city=? AND restaurantCategory.restaurantCategoryID=restaurant.categoryID', [venueID, searchCity], callback);
    },
    getVenueProducts: (venueID, callback) => {
        database.query('SELECT product.productID, product.name, product.price, product.description, product.image, productCategory.name AS category FROM product, productCategory WHERE product.restaurantID=? AND productCategory.categoryID=product.categoryID', [venueID], callback);
    },
    getCities: (callback) => {
        database.query('SELECT restaurant.city FROM restaurant GROUP BY restaurant.city', callback);
    }
};

module.exports = queries;