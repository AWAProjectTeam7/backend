const database = require('../database');

const queries = {
    getProducts: (venueID, callback) => {
        database.query('SELECT product.ID, product.name, product.price, product.description, product.image, productCategory.name AS category FROM product, productCategory WHERE product.restaurantID=? AND productCategory.ID=product.categoryID', [venueID], callback);
    },
    addNewProduct: (venueID, productData, callback)=>{
        //`restaurantID`, `categoryID`, `name`, `price`, `description`, `image`
        database.query('INSERT INTO product (restaurantID, categoryID, name, price, description, image) VALUES (?,?,?,?,?,?)', [venueID, productData.categoryID, productData.name, productData.price, productData.description, "https://foodservicestorage.blob.core.windows.net/images/default_image_01.png"], callback);
    },
    addProductImage: (imageURL, productID, venueID, callback) => {
        database.query('UPDATE product SET image=? WHERE ID=? AND restaurantID=?', [imageURL, productID, venueID], callback);
    },
    deleteProduct: (productID, venueID, callback) => {
        database.query('DELETE FROM product WHERE ID=? AND restaurantID=?', [productID, venueID], callback);
    },
    getCategories: (venueID, callback) => {
        database.query('SELECT ID, name FROM productcategory WHERE restaurantID=?', [venueID], callback);
    },
    addCategory: (venueID, categoryName, callback) => {
        database.query('INSERT INTO productCategory (restaurantID, name) VALUES (?,?)', [venueID, categoryName], callback);
    },
    deleteCategory: (venueID, categoryID, callback) => {
        database.query('SELECT * FROM productCategory WHERE restaurantID=? AND ID=?', [venueID, categoryID], (err, checkIfExistsResult)=>{
            if (err)
            {
                callback(err, undefined);
            }
            else 
            {
                if (checkIfExistsResult.length == 0)
                {
                    callback("Category does not exist", undefined);
                }
                else //category exists on the selected venue
                {
                    database.query('SELECT COUNT(ID) AS isCategoryInUse FROM product WHERE restaurantID=? AND categoryID=?', [venueID, categoryID], (err, isCategoryInUseResult)=>{
                        if (err)
                        {
                            callback(err, undefined);
                        }
                        else
                        {
                            isCategoryInUseResult = isCategoryInUseResult[0];
                            if (isCategoryInUseResult.isCategoryInUse == 0) // category is not used for any product
                            {
                                database.query('DELETE FROM productCategory WHERE ID=? AND restaurantID=?', [categoryID, venueID], (error, result)=>{
                                    if (error)
                                    {
                                        callback(err, undefined);
                                    }
                                    else
                                    {
                                        callback(undefined, categoryID);
                                    }
                                });
                            }   
                            else
                            {
                                callback("Can not delete category: key in use", undefined);
                            }
                        }
                    });
                }
            }
        });
    },
    updateVenueProduct: (venueID, productID, _columns, _values, callback) => {
        _recursiveUpdateLoop_safe("product", [venueID, productID, _columns, _values], _columns.length-1, callback);        
    },
};

function _recursiveUpdateLoop_safe (_table, _params, _stateTransfer_index, _callback) {
    let _column = _params[2][_stateTransfer_index];
    let _value = _params[3][_stateTransfer_index];
    database.query('UPDATE ?? SET ??=? WHERE ID=? AND restaurantID=?', [_table, _column, _value, _params[1], _params[0]], (err, result)=>{
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