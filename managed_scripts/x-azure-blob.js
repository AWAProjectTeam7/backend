const azure = require('azure-storage');
const uuidv1 = require('uuid').v1;

var azure_blob_service = azure.createBlobService();

const azure_blob_url = ".blob.core.windows.net/";

const uploadFileToAzureBlob = (_container_name, _file, _callback)=>{
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
    azure_blob_service.createBlockBlobFromText(_container_name, upload_file.name, _file.content, { contentSettings: { contentType: upload_file.contentType } }, (error, result, response)=>{
        if(error)
        {
            _callback(error);
        }
        else
        {
            let container_path = "https://" + process.env.AZURE_STORAGE_ACCOUNT + azure_blob_url + _container_name + "/";
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
    let _file_extension = _file.extension;
    _newFileName += ("."+_file_extension);
    return {
        name: _newFileName,
        contentType: _file.contentType.toString(),
        extension: _file_extension
    };
};

module.exports = uploadFileToAzureBlob;