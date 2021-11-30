const database = require('../database');

const queries = {
    getVenues: (userID, callback) => {
        database.query('SELECT restaurant.ID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurant.image, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE restaurant.ownerID=? AND restaurantCategory.ID=restaurant.categoryID', [userID], callback);
    },
    addNewVenue: (venueData, callback) => {
        database.query('INSERT INTO restaurant (categoryID, ownerID, name, address, city, openHours, pricing, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [...venueData], callback);
    },
    addVenueImage: (imageURL, venueID, callback) => {
        database.query('UPDATE restaurant SET image=? where ID=?', [imageURL, venueID], callback);
    },
    getVenueInfo: (venueID, callback) => {
        database.query('SELECT restaurant.ID, restaurant.name, restaurant.address, restaurant.city, restaurant.openHours, restaurant.pricing, restaurantCategory.name AS category FROM restaurant, restaurantCategory WHERE restaurant.ID=? AND restaurantCategory.ID=restaurant.categoryID', [venueID], callback);
    },
    getVenueProducts: (venueID, callback) => {
        database.query('SELECT product.ID, product.name, product.price, product.description, product.image, productCategory.name AS category FROM product, productCategory WHERE product.restaurantID=? AND productCategory.categoryID=product.categoryID', [venueID], callback);
    }
};

module.exports = queries;