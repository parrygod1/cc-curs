const dbconnection = require('./db.js')
const utilities = require('./utilities.js');

var putfunc;

var actions = {
    'GET': function(request, response) {
      var requestPath = utilities.getRequestPathAPI(request.url);

      if (requestPath.length == 1){ //get all categories
        dbconnection.query('SELECT * FROM categories', (err, rows) => {
          if(!err)
            utilities.sendResponse(response, rows, 200);
        });
      }
      else if(requestPath.length == 2){
        id = requestPath[1];
        query = 'SELECT * FROM categories WHERE ID = ?';
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
          
          if(!data['category_name']){
            utilities.sendResponse(response, utilities.errorResponseJSON, 404);
            return;
          }
      
          query = 'SELECT * FROM categories WHERE CATEGORY_NAME like ?';
          values = [`%${data['category_name']}%`];
          dbconnection.query(query, values, (err, rows) => {
            if (!err) {
              if (rows.length == 0) {
                query = 'INSERT INTO CATEGORIES (CATEGORY_NAME) VALUES (?)';
                values = [`${data['category_name']}`];
                dbconnection.query(query, values, (err, packet) => {
                  if(packet['affectedRows'] == 1){
                    newid = packet['insertId'];
                    host = utilities.getHost();
                    port = String(utilities.getPort());
                    utilities.sendResponse(response, 
                      {"status": "created", "code": 201}, 
                      201, 
                      {'Location':`${host}:${port}/api/categories/${newid}`});
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
    'PUT': putfunc = function(request, response){
      var requestPath = utilities.getRequestPathAPI(request.url);
      if (requestPath.length == 2){
        const chunks = [];
        request.on('data', chunk => chunks.push(chunk));
        request.on('end', () => {
          const data = JSON.parse(Buffer.concat(chunks));
          console.log('Data: ', data);
          
          if(!(data['category_name'])){
            utilities.sendResponse(response, utilities.errorResponseJSON, 404);
            return;
          }

          query = 'SELECT * FROM categories WHERE ID = ?';
          values = [`${requestPath[1]}`];
          dbconnection.query(query, values, (err, rows) => {
            if (!err && rows.length > 0) {
              query = 'UPDATE CATEGORIES SET CATEGORY_NAME = ? WHERE ID = ?';
              values = [`${data['category_name']}`, `${requestPath[1]}`];

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
    'PATCH': putfunc,
    'DELETE': function(request, response){
      var requestPath = utilities.getRequestPathAPI(request.url);
      if (requestPath.length == 2) {
        query = 'SELECT * FROM categories WHERE ID = ?';
        values = [`${requestPath[1]}`];
        dbconnection.query(query, values, (err, rows) => {
          if (!err && rows.length > 0) {
            query = 'DELETE FROM CATEGORIES WHERE ID = ?';
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