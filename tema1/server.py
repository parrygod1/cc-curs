import http.server
import socketserver
import re
import json
import requests
import os
import time
from datetime import datetime
import metricscheck
import pricecheck

#https://stackabuse.com/serving-files-with-pythons-simplehttpserver-module/

STARTTIME = time.time_ns() // 1000000

class HTTPHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None):
        if code == 404:
            self.error_message_format = "Does not compute!"
        http.server.SimpleHTTPRequestHandler.send_error(self, code, message)

    def do_GET(self):
        if self.path == '/':
            self.path = 'client/index.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        elif re.search('/api/pricecheck/*', self.path) != None:
            starttime = str(time.time_ns() // 1000000)
            arg = self.path.split('/')[-1]
            response = pricecheck.execute_pricecheck(arg)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(str(response.body), "utf8"))

            temp = dict(self.headers)
            temp.update({'timestamp': starttime})
            log_request(self.path, temp, response.body)
        
        elif re.search('/api/metrics', self.path) != None:
            response = metricscheck.execute_metrics(STARTTIME)

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(str(response.body), "utf8"))
            log_request(self.path, dict(self.headers), response.body)

        return

def log_request(path, request, response):
    newdict = {'path': path ,'request': request, 'response': response}
    #newdict = {'request': 'test'}
    data = None

    with open('logs/requests.json', 'r') as outfile:
        data = json.load(outfile)
        data.append(newdict)
        
    with open('logs/requests.json', 'w') as outfile:
        json.dump(data, outfile)

PORT = 80

if __name__ == "__main__":
    handler_object = HTTPHandler
    my_server = socketserver.TCPServer(("", PORT), handler_object)
    my_server.serve_forever()