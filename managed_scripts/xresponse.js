//SPDX-FileCopyrightText: © 2021 Bars Margetsch <barsmargetsch@outlook.com>
//SPDX-License-Identifier: BSD 3-Clause

const _appInternalErrorHandler = (err)=>{
    if (Object.keys(err).length === 0 || err === null || err == undefined)
    {
        err = undefined;
    }
    if (process.env.NODE_ENV == "production")
    {
        err = undefined;
    }
    return err;
};

const xresponse = {
    HTTP: {
        success: {
            OK: (res={}, contents) => {
                //Operation successful, pass Express response object, response contents and an optional token
                let _response = {
                    status: "success",
                    data: contents
                }
                res.status(200).json(_response);
            },
            created: (res={}, contents) => {
                let _response = {
                    status: "success",
                    data: contents
                }
                res.status(201).json(_response);
            }
        },
        fail: {
            parameters: (res={}, _validationErrors=undefined)=>{
                //The request has incorrect or missing parameters. This is the user's fault; returns 400 BAD REQUEST
                let _response = {
                    status: "fail",
                    errorMessage: "Bad Request",
                    errorContents: _validationErrors
                }
                res.status(400).json(_response);
            },
            unauthorised: (res={})=>{
                //The request requires authentication and there was none provided. This is most likely from direct access to the API
                //without a valid key: user issue
                let _response = {
                    status: "fail",
                    errorMessage: "Unauthorized",
                }
                //res.set('WWW-Authenticate', 'Basic');
                res.status(401).json(_response);
            },
            forbidden: (res={})=>{
                let _response = {
                    status: "fail",
                    errorMessage: "Forbidden",
                }
                res.status(403).json(_response);
            },
        },
    },
    service: {
        database: {
            error: (res={}, err={})=>{
                let _response = {
                    status: "error",
                    errorMessage: "The Database has encountered an error, and could not serve the request. It might be unavailable.",
                    errorContents: _appInternalErrorHandler(err)
                }
                res.status(503).json(_response);
            },
        },
        azure: {
            blobStorage: {
                error: (res={}, err={})=>{
                    let _response = {
                        status: "error",
                        errorMessage: "The Azure Blob Storage service has encountered an error, and could not serve the request. It might be unavailable.",
                        errorContents: _appInternalErrorHandler(err)
                    }
                    res.status(503).json(_response);
                }
            }
        }
    },
    success: {
        OK: (res={}, contents) => {
            //Operation successful, pass Express response object, response contents and an optional token
            let _response = {
                status: "success",
                data: contents
            }
            res.status(200).json(_response);
        },
        created: (res={}, contents) => {
            let _response = {
                status: "success",
                data: contents
            }
            res.status(201).json(_response);
        }
    },
    error: {
        database: (res={}, err={})=>{
            let _response = {
                status: "error",
                errorMessage: "The Database has encountered an error, and could not serve the request. It might be unavailable.",
                errorContents: _appInternalErrorHandler(err)
            }
            res.status(503).json(_response);
        },
        azure: (res={}, err={})=>{
            let _response = {
                status: "error",
                errorMessage: "The Azure service has encountered an error, and could not serve the request. It might be unavailable.",
                errorContents: _appInternalErrorHandler(err)
            }
            res.status(503).json(_response);
        },
    },
    fail: {
        custom: (res={}, message="")=>{
            //Custom fail message for non-uniform fail conditions. Note that this type returns a 200 OK HTTP Status.
            let _response = {
                status: "fail",
                errorMessage: message,
            }
            res.json(_response);
        },
        parameters: (res={}, _validationErrors=undefined)=>{
            //The request has incorrect or missing parameters. This is the user's fault; returns 400 BAD REQUEST
            let _response = {
                status: "fail",
                errorMessage: "Bad Request",
                errorContents: _validationErrors
            }
            res.status(400).json(_response);
        },
        unauthorised: (res={})=>{
            //The request requires authentication and there was none provided. This is most likely from direct access to the API
            //without a valid key: user issue
            let _response = {
                status: "fail",
                errorMessage: "Unauthorized",
            }
            //res.set('WWW-Authenticate', 'Basic');
            res.status(401).json(_response);
        },
    },
    custom_response: (res={}, status="", message={}, HTTP_StatusCode=0)=>{
        let _response = {
            status: status,
            errorMessage: message,
        }
        if (HTTP_StatusCode <= 99  || HTTP_StatusCode == 0)
        {
            res.json(_response);
        }
        else if (HTTP_StatusCode > 100 && HTTP_StatusCode < 600)
        {
            res.status(HTTP_StatusCode).json(_response);
        }
    },
    status_strings_internal: {
        success: "success",
        fail: "fail",
        error: "error"
    },
}
module.exports = xresponse;