const database = require('../database');

const queries = {
    getVenueOrder: (venueID, orderID, callback) => {
        database.query('SELECT user.name AS customerName, user.address AS customerAddress, user.city AS customerCity, user.phone AS customerContact, order.received_date, order.est_date, order.complete_date, order.cost, order.status, orderstatus.status, order.contents FROM mydb.order, user, orderstatus WHERE mydb.order.orderID=? AND mydb.order.restaurantID=? AND mydb.order.userID=user.ID AND orderstatus.ID=mydb.order.status', [orderID, venueID], callback);
    },
    getVenueOrders: (venueID, callback) => {
        database.query('SELECT order.orderID, order.received_date, order.complete_date, order.cost, order.status, user.name AS customerName, user.address AS customerAddress, user.city AS customerCity, user.phone AS customerContact FROM mydb.order, user WHERE mydb.order.restaurantID=? AND mydb.order.userID=user.ID', [venueID], callback);
    },
    addOrder: (order={}, callback) => {
        database.query('INSERT INTO mydb.order (orderID, userID, restaurantID, received_date, status, cost, contents) VALUES(?, ?, ?, ?, ?, ?, ?);', [order.orderID, order.userID, order.restaurantID, order.date, order.status, order.cost, JSON.stringify(order.contents)], callback);
    },
    getVenueOrderState: (venueID, orderID, callback) => {
        database.query('SELECT order.status FROM mydb.order WHERE mydb.order.orderID=? AND mydb.order.restaurantID=?', [orderID, venueID], callback);
    },
    setVenueOrderState: (venueID, orderID, state, callback) => {
        database.query('UPDATE mydb.order SET order.status=? WHERE mydb.order.orderID=? AND mydb.order.restaurantID=?', [state, orderID, venueID], callback);
    },
};

module.exports = queries;