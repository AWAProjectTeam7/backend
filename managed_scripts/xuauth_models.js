const database = require('../database');

const queries = {
    findToken: (token, callback) => {
        database.query('SELECT token, token_date, ID FROM user WHERE token=?', [token], callback);
    },
    addToken: (token, callback) => {
        database.query('UPDATE user SET token=?, token_date=? WHERE ID=?', [token.value, token.expires, token.userID], callback);
    },
    registerUser: (user, callback) => {
        database.query('INSERT INTO user (email, password, salt) VALUES(?,?,?)', [user.email, user.password, user.salt], (err, result)=>{
            if (err)
            {
                callback(err, undefined);
            }
            else
            {
                callback(undefined, result.insertId);
            }
        });
    },
    findUser: (username, callback) => {
        database.query('SELECT ID FROM user WHERE email=?', [username], callback);
    },
    findUserCredentials: (username, callback) => {
        database.query('SELECT ID, salt, password, token_ID FROM user WHERE email=?', [username], callback);
    },
    AdditionalProperties: (userID, propertyNames, callback) => {
        database.query('SELECT ?? FROM user WHERE ID=?', [propertyNames, userID], callback);
    }
};

module.exports = queries;