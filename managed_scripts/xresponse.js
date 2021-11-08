//SPDX-FileCopyrightText: © 2021 Bars Margetsch <barsmargetsch@outlook.com>
//SPDX-License-Identifier: BSD 3-Clause
const xresponse = {
    success: function(res, contents) {
		//Operation successful, pass Express response object, response contents and an optional token
        let xresponse_content = {
            status: "success",
            data: contents
        }
        /*if (res.xuauth.session != undefined)
        {
            //Legacy sessionStorage:
            //xresponse_content.data.token = token;
            let token = res.xuauth.session;
			res.cookie(token.name, token.value, { maxAge: token.lifeTime });
        }*/
        /*if (contents != null && contents != undefined && contents != "no_content")
        {
            for (const [key, value] of Object.entries(contents)) {
                xresponse_content.data[key] = value;
            }
        }*/
        res.status(200).json(xresponse_content);
    },
    error: {
        database: (res)=>{
            let xresponse_content = {
                status: "fail",
                data: {
                    message: "Could not connect to the database. Try again later."
                }
            }
            res.status(500).json(xresponse_content);
        },
    },
    fail: {
        custom: (res, message)=>{
            let xresponse_content = {
                status: "fail",
                data: {
                    message: message
                }
            }
            res.json(xresponse_content);
        },
        parameters: (res)=>{
            let xresponse_content = {
                status: "fail",
                data: {
                    message: "Bad Request"
                }
            }
            res.status(400).json(xresponse_content);
        },
        unauthorised: (res)=>{
            let xresponse_content = {
                status: "fail",
                data: {
                    message: "Unauthorized"
                }
            }
            res.status(401).json(xresponse_content);
        },
    }
}
module.exports = xresponse;
/* 
This Module follows the sjson response format:
{
    status : "success",
    data : {
        
    },
}
OR
{
    status : "fail",
    data : {
        message : "credentials_taken" 
    },
}
OR
{
    status : "error",
    data : {
        message : "internal_database" 
    },
}

If there is an authorization token added, it is appended into the data:{} object as "token:<token>".
Tokens that are undefined will not be processed, this is to allow for conditional tokens (such as
when the token has been refreshed and it is sent with the next request, otherwise this field is 
omitted).
Response content should be provided in a key - value format in {}, the code will iterate through them
and append each key - value pair directly to data:{}. Providing a named object variable <key>, will append 
the object variable directly as:
data: { 
    <key>:{
        <subkey>:<subvalue>
    }
} 
*/