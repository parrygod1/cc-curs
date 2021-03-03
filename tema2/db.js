require('dotenv').config()
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'cctema'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});