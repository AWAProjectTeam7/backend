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
        database.query('SELECT product.ID, product.name, product.price, product.description, product.image, productCategory.name AS category FROM product, productCategory WHERE product.restaurantID=? AND productCategory.ID=product.categoryID', [venueID], callback);
    },
    updateVenueData: (venueID, _columns, _values, callback) => {
        _recursiveUpdateLoop_safe("restaurant", [venueID, _columns, _values], _columns.length-1, callback);        
    },
};

function _recursiveUpdateLoop_safe (_table, _params, _stateTransfer_index, _callback) {
    let _column = _params[1][_stateTransfer_index];
    let _value = _params[2][_stateTransfer_index];
    database.query('UPDATE ?? SET ??=? WHERE ID=?', [_table, _column, _value, _params[0]], (err, result)=>{
        if (err)
        {
            _callback(err);
        }
        else
        {
            _stateTransfer_index--;
            if (_stateTransfer_index <= 0)
            {
                _callback(undefined);
            }
            else
            {
                _recursiveUpdateLoop_safe(_params, _stateTransfer_index, _callback);
            }
        }
    });
}

module.exports = queries;