var headers = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE',
    'access-control-allow-headers': 'content-type, accept',
    'access-control-max-age': 10,
    'Content-Type': 'application/json'
  };
var hostu;
var portu;

exports.setHost = function(host){
  hostu = host;
};

exports.getHost = function() {return hostu;};

exports.setPort = function(port){
  portu = port;
};

exports.getPort = function() {return portu;};

exports.sendResponse = function(response, data, statusCode, additionalHeaders = {}) {
    statusCode = statusCode || 200;
    for(h in additionalHeaders){
      headers[h] = additionalHeaders[h];
    }
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
  };

exports.getRequestPathAPI = function(url){
  splitUrl = url.split('/');
  index = splitUrl.indexOf('');
  if (index > -1) {
    splitUrl.splice(index, 1);
    index2 = splitUrl.indexOf('api');
    if (index > -1)
      splitUrl.splice(index2, 1);
  }
  return splitUrl
};

exports.errorResponseJSON = {
  "status" : "Not found",
  "code" : 404
}

exports.existsResponseJSON = {
  "status" : "Resource already exists",
  "code" : 409
}