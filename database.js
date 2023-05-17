var mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "pki-projekt.mysql.database.azure.com",
  user: process.env.AZURE_USERNAME,
  password: process.env.AZURE_PASS,
  database: "pki",
});
connection.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});
exports.databaseConnection = connection;
