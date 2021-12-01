const database = require('../database');

const queries = {
    registerUser: (user, callback) => {
        database.query('UPDATE user SET name=?, address=?, city=?, phone=?, corporate=? WHERE ID=?', [user.name, user.address, user.city, user.phone, user.corporate, user.userID], callback);
    },
    getUserRealm: (userID, callback) => {
        database.query('SELECT corporate FROM user WHERE ID=?', [userID], callback);
    },
    getUserData: (userID, callback) => {
        database.query('SELECT ID, name, email, address, city, phone, corporate FROM user WHERE ID=?', [userID], callback);
    },
    updateUserData: (userID, _columns, _values, callback) => {
        _recursiveUpdateLoop_safe([userID, _columns, _values], _columns.length-1, callback);        
    },
};

function _recursiveUpdateLoop_safe (_params, _stateTransfer_index, _callback) {
    let _column = _params[1][_stateTransfer_index];
    let _value = _params[2][_stateTransfer_index];
    database.query('UPDATE user SET ??=? WHERE ID=?', [_column, _value, _params[0]], (err, result)=>{
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