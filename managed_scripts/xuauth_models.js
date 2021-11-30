const database = require('../database');

const queries = {
    findToken: (token, callback) => {
        database.query('SELECT token, token_date, ID FROM user WHERE token=?', [token], callback);
    },
    addToken: (token, callback) => {
        database.query('UPDATE user SET token=?, token_date=? WHERE ID=?', [token.value, token.expires, token.userID], callback);
    },
    registerUser: (user, callback) => {
        database.query('INSERT INTO user (email, password, salt) VALUES(?,?,?)', [user.email, user.password, user.salt]);
        database.query('SELECT ID FROM user WHERE email=? AND password=?', [user.email, user.password], callback);
    },
    findUser: (username, callback) => {
        database.query('SELECT token, token_date, ID FROM user WHERE email=?', [username], callback);
    },
    findUserCredentials: (username, callback) => {
        database.query('SELECT token, token_date, ID, salt, password FROM user WHERE email=?', [username], callback);
    },
};

module.exports = queries;