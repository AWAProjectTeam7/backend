//SPDX-FileCopyrightText: © 2021 Bars Margetsch <barsmargetsch@outlook.com>
//SPDX-License-Identifier: BSD 3-Clause
const xresponse = {
    success: function(res={}, contents={}) {
		//Operation successful, pass Express response object, response contents and an optional token
        if (contents = {})
        {
            contents = undefined;
        }
        let xresponse_content = {
            status: "success",
            data: contents
        }
        res.status(200).json(xresponse_content);
    },
    error: {
        database: (res={})=>{
            //The server couldn't connect to the database. This is now the user's fault, but a system distruption.
            let xresponse_content = {
                status: "fail",
                errorMessage: "Could not connect to the database. Try again later.",
            }
            res.status(503).json(xresponse_content);
        },
    },
    fail: {
        custom: (res={}, message="")=>{
            //Custom fail message for non-uniform fail conditions. Note that this type returns a 200 OK HTTP Status.
            let xresponse_content = {
                status: "fail",
                errorMessage: message,
            }
            res.json(xresponse_content);
        },
        parameters: (res={})=>{
            //The request has incorrect or missing parameters. This is the user's fault; returns 400 BAD REQUEST
            let xresponse_content = {
                status: "fail",
                errorMessage: "Bad Request",
            }
            res.status(400).json(xresponse_content);
        },
        unauthorised: (res={})=>{
            //The request requires authentication and there was none provided. This is most likely from direct access to the API
            //without a valid key: user issue
            let xresponse_content = {
                status: "fail",
                errorMessage: "Unauthorized",
            }
            res.set('WWW-Authenticate', 'Basic');
            res.status(401).json(xresponse_content);
        },
    },
    custom_response: (res={}, status="", message={}, HTTP_StatusCode=0)=>{
        let xresponse_content = {
            status: status,
            errorMessage: message,
        }
        if (HTTP_StatusCode <= 99  || HTTP_StatusCode == 0)
        {
            res.json(xresponse_content);
        }
        else if (HTTP_StatusCode > 100 && HTTP_StatusCode < 600)
        {
            res.status(HTTP_StatusCode).json(xresponse_content);
        }
    },
    status_strings_internal: {
        success: "success",
        fail: "fail",
        error: "error"
    },
}
module.exports = xresponse;