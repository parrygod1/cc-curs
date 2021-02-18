import json
import time
from datetime import datetime
import apirequests

class PricecheckResponse:
    def __init__(self):
        self.body = {
            'timestamp': str(time.time_ns() // 1000000),
            'btc_balance': 0,
            'usd_balance': 0,
            'price_total' : 0,
            'item_list': {},
            'status': ''
        }


def execute_pricecheck(btc_address):
    response = PricecheckResponse()

    btc_val = 0
    usd_val = 0

    btc = apirequests.get_btcaddress_data(btc_address)
    if btc['status'] == 'success':
        response.body['btc_balance'] = btc_val = float(btc['data']['balance']) / 100000000
    else:
        response.body['status'] = 'fail'
        return response
    
    usd = apirequests.get_btcprice()
    if len(usd[0]) > 0:
        response.body['usd_balance'] = usd_val = float(usd[0]['price_usd']) * btc_val
    else:
        response.body['status'] = 'fail'
        return response
    
    item_list = apirequests.get_swapggprices()
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
    response.body['timestamp'] = str(time.time_ns() // 1000000)
    return response


        
