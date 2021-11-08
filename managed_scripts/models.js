const database = require('../database');

const queries = {
    findToken: (token, callback) => {
        database.query('SELECT token, token_date, userID FROM user WHERE token=?', [token], callback);
    },
    addToken: (token, callback) => {
        let token_date = Date.now() + token.lifeTime
        database.query('UPDATE user SET token=?, token_date=? WHERE userID=?', [token.value, token_date, token.userID], callback);
    },
    registerUser: (user, callback) => {
        database.query('INSERT INTO user (email, password, salt) VALUES(?,?,?)', [user.email, user.password, user.salt]);
        database.query('SELECT userID FROM user WHERE email=? AND password=?', [user.email, user.password], callback);
    },
    findUser: (username, callback) => {
        database.query('SELECT token, token_date, userID, salt, password FROM user WHERE email=?', [username], callback);
    },
};

module.exports = queries;