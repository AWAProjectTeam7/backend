const database = require('../database');

const queries = {
    getCityVenues: (searchCity, callback) => {
        database.query('SELECT restaurant.ID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurant.image, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE city=? AND restaurantCategory.ID=restaurant.categoryID', [searchCity], callback);
    },
    getVenueInfo: (venueID, callback) => {
        database.query('SELECT restaurant.ID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE restaurant.ID=? AND restaurantCategory.ID=restaurant.categoryID', [venueID], callback);
    },
    getVenueProducts: (venueID, callback) => {
        database.query('SELECT product.ID, product.name, product.price, product.description, product.image, productCategory.name AS category FROM product, productCategory WHERE product.restaurantID=? AND productCategory.ID=product.categoryID', [venueID], callback);
    },
    getCities: (callback) => {
        database.query('SELECT restaurant.city FROM restaurant GROUP BY restaurant.city', callback);
    }
};

module.exports = queries;