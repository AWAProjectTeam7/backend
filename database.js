const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();
var certificatePath = "";
if (fs.existsSync("./.env")) {
	certificatePath = "./certificate/DigiCertGlobalRootCA.crt.pem";
	console.log("Environment: development\nCertificatePath: " + certificatePath);
}
else
{
	certificatePath = "D:/home/site/wwwroot/certificate/DigiCertGlobalRootCA.crt.pem";
	console.log("Environment: production\nCertificatePath: " + certificatePath);
}
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER, 
	password: process.env.DB_PASS,
	database:"mydb",
	port:3306,
	ssl:{
		ca: fs.readFileSync(certificatePath)
		}
});
module.exports = connection;