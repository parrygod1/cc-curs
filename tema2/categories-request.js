const dbconnection = require('./db.js')
const utilities = require('./utilities.js');

var actions = {
    'GET': function(request, response) {
      utilities.sendResponse(response, {"message": "ok"});
}};

module.exports = function(request, response) {
  var action = actions[request.method];
  if (action) action(request, response);
  else utilities.sendResponse(response, 'Not Found', 404);
};