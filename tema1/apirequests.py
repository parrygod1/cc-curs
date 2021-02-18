import requests
import json

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
