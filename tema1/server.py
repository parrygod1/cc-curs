import http.server
import socketserver
import re
import json
import requests
from datetime import datetime
#https://stackabuse.com/serving-files-with-pythons-simplehttpserver-module/


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
            response = execute_pricecheck(self.path.split('/')[-1])
            
            self.send_response(200)

            self.send_header("Content-type", "text/html")
            self.end_headers()

            self.wfile.write(bytes(str(response.body), "utf8"))

        return

class PricecheckResponse:
    def __init__(self):
        self.body = {
            'timestamp': str(datetime.now()),
            'btc_balance': 0,
            'usd_balance': 0,
            'price_total' : 0,
            'item_list': {},
            'status': ''
        }

def send_request(url, params={}):
    res = requests.get(url, params)
    json_text = json.loads(res.text)
    return json_text

def get_btcaddress_data(address="18aSh4Exkx1xN2h8bZfCUQc44bF7sskzH6"):
    data = send_request("https://chain.api.btc.com/v3/address/" + address) 
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

def execute_pricecheck(btc_address):
    response = PricecheckResponse()

    btc_val = 0
    usd_val = 0

    btc = get_btcaddress_data(btc_address)
    if btc['status'] == 'success':
        response.body['btc_balance'] = btc_val = float(btc['data']['balance']) / 100000000
    else:
        response.body['status'] = 'fail'
        return response
    
    usd = get_btcprice()
    if len(usd[0]) > 0:
        response.body['usd_balance'] = usd_val = float(usd[0]['price_usd']) * btc_val
    else:
        response.body['status'] = 'fail'
        return response
    
    item_list = get_swapggprices()
    if not 'error' in item_list:
        limited_itemlist = dict(sorted(item_list['result'].items(), key = lambda x : x[1]['price']))
        
        total_price = 0.
        selected_items = {}
        for item in limited_itemlist: 
            if total_price + float(limited_itemlist[item]['price']) <= usd_val:
                total_price += float(limited_itemlist[item]['price'])
                selected_items[item] = limited_itemlist[item]

        response.body['item_list'] = selected_items
        response.body['price_total'] = total_price
    else:
        response.body['status'] = 'fail'
        return response

    response.body['status'] = 'success'
    return response




PORT = 8000

if __name__ == "__main__":
    handler_object = HTTPHandler
    my_server = socketserver.TCPServer(("", PORT), handler_object)

    my_server.serve_forever()