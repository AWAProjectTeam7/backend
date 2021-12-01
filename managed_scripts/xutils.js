const utils = {
    unique: {
        loop: () => {},
        isUnique: () => {},
        database: {
            loop: (searchValue={}, resultKeyName="", searchFunction={}, callback={}) => {
                let value = searchValue();
                searchFunction(value, (err, result)=>{
                    if (err)
                    {
                        callback(undefined);
                    }
                    else
                    {
                        let isValueUnique = false;
                        if (Array.isArray(result))
                        {
                            if (result[0].length == 0 || result[0][resultKeyName] == 0)
                            {
                                isValueUnique = true;
                            }
                        }
                        else if (result[resultKeyName] == 0)
                        {
                            isValueUnique = true;
                        }
                        if (isValueUnique)
                        {
                            callback(isValueUnique, value);
                        }
                        else
                        {
                            utils.unique.database.loop(searchValue, resultKeyName, searchFunction, callback);
                        }
                    }
                });
            },
            isUnique: () => {},
        }
    }
};

module.exports = utils;