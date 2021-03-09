const dbconnection = require('./db.js')
const utilities = require('./utilities.js');

var actions = {
  'GET': function(request, response) {
    var requestPath = utilities.getRequestPathAPI(request.url);

    if (requestPath.length == 1){
      dbconnection.query('SELECT * FROM products', (err, rows) => {
        if(!err)
          utilities.sendResponse(response, rows, 200);
      });
    }
    else if(requestPath.length == 2){
      id = requestPath[1];
      query = 'SELECT * FROM products  WHERE ID = ?';
      values = [id];
      dbconnection.query(query, values, (err, rows) => {
        if(!err && rows.length > 0)
          utilities.sendResponse(response, rows, 200);
        else
          utilities.sendResponse(response, utilities.errorResponseJSON, 404);
        
      });
    }
  },
  'POST': function(request, response){
    var requestPath = utilities.getRequestPathAPI(request.url);
    if (requestPath.length == 1){
      const chunks = [];
      request.on('data', chunk => chunks.push(chunk));
      request.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        console.log('Data: ', data);
        
        if(!(data['name'] && data['description'] && data['price'] && data['category_id'])){
          utilities.sendResponse(response, utilities.errorResponseJSON, 404);
          return;
        }
    
        query = 'SELECT * FROM products WHERE NAME like ?';
        values = [`%${data['name']}%`];
        dbconnection.query(query, values, (err, rows) => {
          if (!err) {
            if (rows.length == 0) {
              query = 'INSERT INTO products (NAME, DESCRIPTION, PRICE, CATEGORY_ID) VALUES (?, ?, ?, ?)';
              values = [`${data['name']}`, `${data['description']}`, `${data['price']}`, `${data['category_id']}`];
              dbconnection.query(query, values, (err, packet) => {
                if(packet['affectedRows'] == 1){
                  newid = packet['insertId'];
                  host = utilities.getHost();
                  port = String(utilities.getPort());
                  utilities.sendResponse(response, 
                    {"status": "created", "code": 201}, 
                    201, 
                    {'Location':`${host}:${port}/api/products/${newid}`});
                }
              });
            }
            else //maybe delete this
              utilities.sendResponse(response, utilities.existsResponseJSON, 409);
          }
        });
      });
    }
    else if (requestPath.length == 2){
      utilities.sendResponse(response, utilities.errorResponseJSON, 404);
    }
    else
      utilities.sendResponse(response, utilities.errorResponseJSON, 404);
  },
  'PUT': function(request, response){
    var requestPath = utilities.getRequestPathAPI(request.url);
    if (requestPath.length == 2){
      const chunks = [];
      request.on('data', chunk => chunks.push(chunk));
      request.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        console.log('Data: ', data);
        
        if(!(data['name'] && data['description'] && 'price' in data && data['category_id'])){
          utilities.sendResponse(response, utilities.errorResponseJSON, 404);
          return;
        }

        query = 'SELECT * FROM products WHERE ID = ?';
        values = [`${requestPath[1]}`];
        dbconnection.query(query, values, (err, rows) => {
          if (!err && rows.length > 0) {
            query = 'UPDATE products SET NAME = ?, DESCRIPTION = ?, PRICE = ?, CATEGORY_ID = ? WHERE ID = ?';
            values = [`${data['name']}`, `${data['description']}`, 
            `${data['price']}`, `${data['category_id']}`, `${requestPath[1]}`];

            dbconnection.query(query, values, (err, rows) => {
              if (!err)
                utilities.sendResponse(response, '', 200);
              else
                utilities.sendResponse(response, utilities.errorResponseJSON, 404);
            });
          } 
          else
            utilities.sendResponse(response, utilities.errorResponseJSON, 404);
        });
        

      });
    }
    else
      utilities.sendResponse(response, utilities.notAllowedResponseJSON, 405);
  },
  'PATCH': function(request, response){
    var requestPath = utilities.getRequestPathAPI(request.url);
    if (requestPath.length == 2){
      const chunks = [];
      request.on('data', chunk => chunks.push(chunk));
      request.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks));
        console.log('Data: ', data);
        
        query = 'SELECT * FROM products WHERE ID = ?';
        values = [`${requestPath[1]}`];
        dbconnection.query(query, values, (err, rows) => {
          if (!err && rows.length > 0) {
            str = "";
            for(key in data){
              str += ` ${key} = '${data[key]}' `
            }

            query = 'UPDATE products SET' + str + 'WHERE ID = ?';
            values = [`${requestPath[1]}`];

            dbconnection.query(query, values, (err, rows) => {
              if (!err)
                utilities.sendResponse(response, '', 200);
              else
                utilities.sendResponse(response, utilities.errorResponseJSON, 404);
            });
          } 
          else
            utilities.sendResponse(response, utilities.errorResponseJSON, 404);
        });
        

      });
    }
    else
      utilities.sendResponse(response, utilities.notAllowedResponseJSON, 405);
  },
  'DELETE': function(request, response){
    var requestPath = utilities.getRequestPathAPI(request.url);
    if (requestPath.length == 2) {
      query = 'SELECT * FROM products WHERE ID = ?';
      values = [`${requestPath[1]}`];
      dbconnection.query(query, values, (err, rows) => {
        if (!err && rows.length > 0) {
          query = 'DELETE FROM products WHERE ID = ?';
          values = [`${requestPath[1]}`];

          dbconnection.query(query, values, (err, rows) => {
            if (!err)
              utilities.sendResponse(response, '', 200);
            else
              utilities.sendResponse(response, utilities.errorResponseJSON, 404);
          });
        }
        else
          utilities.sendResponse(response, utilities.errorResponseJSON, 404);
      });
    }
    else
      utilities.sendResponse(response, utilities.notAllowedResponseJSON, 405);
  }
};

module.exports = function(request, response) {
  var action = actions[request.method];
  if (action) action(request, response);
  else utilities.sendResponse(response, 'Not Found', 404);
};