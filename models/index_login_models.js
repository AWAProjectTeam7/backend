const database = require('../database');

const queries = {
    registerUser: (user, callback) => {
        database.query('UPDATE user SET name=?, address=?, city=?, phone=?, corporate=? WHERE userID=?', [user.name, user.address, user.city, user.phone, user.corporate, user.userID], callback);
    },
    getUserRealm: (username, callback) => {
        database.query('SELECT corporate FROM user WHERE userID=?', [username], callback);
    }
};

module.exports = queries;