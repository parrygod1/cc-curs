require('dotenv').config();
const mysql = require('mysql');

module.exports = dbconnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME
});
dbconnection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});