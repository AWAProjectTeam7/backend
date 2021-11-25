const mysql = require('mysql');
const fs = require('fs');
var path = require('path');

var certificatePath = path.join(__dirname, "certificate", "DigiCertGlobalRootCA.crt.pem");
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