const azure = require('azure-storage');
const uuidv1 = require('uuid').v1;

var azure_blob_service = azure.createBlobService();

const azure_blob_url = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/`;

const AzureBlobStorage = {
    upload: (_container_name, _file, _callback)=>{
        let upload_file = create_new_file(_file);
        azure_blob_service.createBlockBlobFromText(_container_name, upload_file.name, upload_file.content, { contentSettings: { contentType: upload_file.contentType } }, (error, result, response)=>{
            if(error)
            {
                _callback(error, false);
            }
            else
            {
                let container_path = azure_blob_url + _container_name + "/";
                _callback(false, {
                    container_path_URL: container_path,
                    file_URL: container_path+upload_file.name,
                    file_name: upload_file.name,
                    file_extension: upload_file.extension
                });
            }
        });
    },
    replace: (_container_name, _deleteFileName, _newFile, _callback)=>{
        AzureBlobStorage.delete(_container_name, _deleteFileName, (deleteError, deletedFilePath)=>{
            if (deleteError)
            {
                _callback(deleteError, false);
            }
            else
            {
                AzureBlobStorage.upload(_container_name, _newFile, (uploadError, newFile)=>{
                    if (uploadError)
                    {
                        _callback(uploadError, false);
                    }
                    else
                    {
                        _callback(false, {
                            deleted: deletedFilePath,
                            new: newFile
                        });
                    }
                });
            }
        });
    },
    delete: (_container_name, _fileName, _callback)=>{
        azure_blob_service.deleteBlob(_container_name, _fileName, function(error, response){
            if(error)
            {
                _callback(error, false);
            }
            else
            {
                let accessPath = azure_blob_url + _container_name + "/" + _fileName;
                _callback(false, accessPath);
            }
        });
    },
    list: (_container_name, _callback)=>{
        recursiveSearch(_container_name, _callback, false, null);
    }
}

const recursiveSearch = (_container_name, _callback, _resultEntries, _azureContinuationToken)=>{
    azure_blob_service.listBlobsSegmented(_container_name, _azureContinuationToken, (error, result)=>{
        if (error)
        {
            _callback(error, false);
        }
        else
        {
            if (_resultEntries)
            {
                _resultEntries.concat(result.entries);
            }
            else
            {
                _resultEntries = result.entries;
            }
            if (result.continuationToken)
            {
                _azureContinuationToken = result.continuationToken;
                recursiveSearch(_container_name, _callback, _resultEntries, _azureContinuationToken);
            }
            else
            {
                _callback(false, _resultEntries);
            }
        }
    });
};

const _____deprecated_____uploadFileToAzureBlobContainer = (_container_name, _file, _callback)=>{
    /**
     * _file = {
     *      content: buffer or string representing the entire file
     *      contentType: contents of the contentType header; eg: "image/png"
     *      extension: the file's original extension. 
     * }
     * 
     * Expects the following Environment Variables:
     * 
     * AZURE_STORAGE_ACCOUNT=storage_account_name
     * AZURE_STORAGE_ACCESS_KEY=account_key
     */
    let upload_file = create_new_file(_file);
    azure_blob_service.createBlockBlobFromText(_container_name, upload_file.name, upload_file.content, { contentSettings: { contentType: upload_file.contentType } }, (error, result, response)=>{
        if(error)
        {
            _callback(error);
        }
        else
        {
            let container_path = azure_blob_url + _container_name + "/";
            _callback(undefined, {
                container_path_URL: container_path,
                file_URL: container_path+upload_file.name,
                file_name: upload_file.name,
                file_extension: upload_file.extension
            });
        }
    });
};

const create_new_file = (_file)=>{
    let _newFileName = uuidv1();
    _newFileName += ("."+_file.extension);
    return {
        name: _newFileName,
        contentType: _file.contentType.toString(),
        extension: _file.extension,
        content: _file.content
    };
};

module.exports = AzureBlobStorage;