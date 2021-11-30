const database = require('../database');

const queries = {
    getOrder: (orderID, callback) => {
        database.query('SELECT user.name AS username, user.address AS useraddress, user.city AS usercity, order.received_date, order.est_date, order.complete_date, order.cost, order.status, order.contents, restaurant.name AS venuename, restaurant.address AS venueaddress, restaurant.city AS venuecity FROM mydb.order, restaurant, user WHERE mydb.order.orderID=? AND mydb.order.restaurantID=restaurant.ID AND mydb.order.userID=user.ID', [orderID], callback);
    },
    getOrders: (userID, callback) => {
        database.query('SELECT order.orderID, order.received_date, order.complete_date, order.cost, order.status, restaurant.name, restaurant.image FROM mydb.order, restaurant, user WHERE user.ID=? AND mydb.order.restaurantID=restaurant.ID AND mydb.order.userID=user.ID', [userID], callback);
    },
    addOrder: (order={}, callback) => {
        database.query('INSERT INTO mydb.order (orderID, userID, restaurantID, received_date, status, cost, contents) VALUES(?, ?, ?, ?, ?, ?, ?);', [order.orderID, order.userID, order.restaurantID, order.date, order.status, order.cost, JSON.stringify(order.contents)], callback);
    },
    checkIfOrderExists: (orderID, callback) => {
        database.query('SELECT COUNT(orderID) AS matching_orders FROM mydb.order WHERE orderID=?', [orderID], callback);
    },
    retreiveProducts: (productIDs, callback) => {
        database.query('SELECT ID, name, price FROM product WHERE ID in (?)', [productIDs], callback);
    },
    getOrderStatus: (orderID, callback) => {
        database.query('SELECT order.received_date, order.est_date, order.complete_date, order.status FROM mydb.order WHERE mydb.order.orderID=?', [orderID], callback);
    },
};

module.exports = queries;