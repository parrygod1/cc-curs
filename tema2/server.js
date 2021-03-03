require('dotenv').config()
const http = require('http');
const utilities = require('./utilities.js');

const host = 'localhost';
const port = 8080;

const routes = {
  "/api/categories" : require('./categories-request.js'),
  "/api/products": require('./products-request.js')
}

const requestListener = function (request, response) {
  route = routes[request.url];
  if (route) route(request, response);
  else {
    utilities.sendResponse(response, 'Not Found', 404);
  }

  /* if(request.method == 'POST')
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
  response.end('Hello, World!'); */
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on port ${port}`);
});