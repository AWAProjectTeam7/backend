const database = require('../database');

const queries = {
    getOrder: (orderID, callback) => {
        database.query('SELECT user.name AS username, user.address AS useraddress, user.city AS usercity, order.date, order.cost, order.status, order.contents, restaurant.name AS venuename, restaurant.address AS venueaddress, restaurant.city AS venuecity FROM mydb.order, restaurant, user WHERE mydb.order.orderID=? AND mydb.order.restaurantID=restaurant.restaurantID AND mydb.order.userID=user.userID', [orderID], callback);
    },
    addOrder: (order={}, callback) => {
        database.query('INSERT INTO mydb.order (orderID, userID, restaurantID, date, status, cost, contents) VALUES(?, ?, ?, ?, ?, ?, ?);', [order.orderID, order.userID, order.restaurantID, order.date, order.status, order.cost, JSON.stringify(order.contents)], callback);
    },
    checkIfOrderExists: (orderID, callback) => {
        database.query('SELECT COUNT(orderID) AS matching_orders FROM mydb.order WHERE orderID=?', [orderID], callback);
    },
    retreiveProducts: (productIDs, callback) => {
        database.query('SELECT productID, name, price FROM product WHERE productID in (?)', [productIDs], callback);
    },
    getOrderStatus: (orderStatus) => {
        let statusArray = ["Received"];
        //not sure if this is needed at all or should be done client side but for now it can stay.
    }
};

module.exports = queries;