require('dotenv').config()
const http = require('http');
const mysql = require('mysql');

const dbconnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  database: process.env.DB_NAME
});
dbconnection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

const host = 'localhost';
const port = 8080;

const requestListener = function (request, response) {
  if(request.method == 'POST')
  {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
    const data = Buffer.concat(chunks);
    console.log('Data: ', JSON.parse(data));
  })
  }
  response.writeHead(200);

  dbconnection.query('SELECT * FROM products', (err, rows) => {
    if(err) throw err;
    console.log(rows[0]);
  })
  response.end('Hello, World!');
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on port ${port}`);
});