import http.server
import socketserver
import re
import json
import requests
#https://stackabuse.com/serving-files-with-pythons-simplehttpserver-module/

def send_request(url, params={}):
    res = requests.get(url, params)
    json_text = json.loads(res.text)
    return json_text

def get_btcaddress_data(address): 
    data = send_request("https://chain.api.btc.com/v3/address/" + address) #test with 15urYnyeJe3gwbGJ74wcX89Tz7ZtsFDVew
    return data

def get_btcprice():
    data = send_request("https://api.coinlore.net/api/ticker/?id=90") #90 = btc
    return data

def get_swapggprices():
    with open("config.json") as json_file:
        key = json.load(json_file)["api_keys"]["swapgg"]
        data = send_request(
            "https://market-api.swap.gg/v1/pricing/lowest?appId=730", #730 = csgo
            {"Authorization": key}
            ) 
    return data

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
            text = self.path.split('/')[-1]
            self.send_response(200)

            self.send_header("Content-type", "text/html")
            self.end_headers()

            self.wfile.write(bytes(text, "utf8"))


        return
            

handler_object = HTTPHandler

PORT = 8000
my_server = socketserver.TCPServer(("", PORT), handler_object)

my_server.serve_forever()