import json
import sys
import time
from datetime import datetime

class PricecheckMetricsResponse:
    def __init__(self):
        self.body = {
            'timestamp': str(datetime.now()),
            'uptime' : 0,
            'lowest_responsetime': 999999,
            'highest_responsetime': 0,
            'lowest_size': 999999,
            'highest_size': 0
        }

def execute_metrics(start_time):
    with open('logs/requests.json', 'r') as outfile:
        data = json.load(outfile)
        response = PricecheckMetricsResponse()

        for d in data:
            elapsed_time = int(d['response']['timestamp']) - int(d['request']['timestamp'])
            if elapsed_time > response.body['highest_responsetime']:
                response.body['highest_responsetime'] = elapsed_time
            if elapsed_time < response.body['lowest_responsetime']:
                response.body['lowest_responsetime'] = elapsed_time

            size = get_size(d['response'])
            if size > response.body['highest_size']:
                response.body['highest_size'] = size
            if size < response.body['lowest_size']:
                response.body['lowest_size'] = size

            response.body['uptime'] = time.time_ns() // 1000000 - start_time

        return response
    return None


def get_size(obj, seen=None): #returns bytes
    """Recursively finds size of objects"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    # Important mark as seen *before* entering recursion to gracefully handle
    # self-referential objects
    seen.add(obj_id)
    if isinstance(obj, dict):
        size += sum([get_size(v, seen) for v in obj.values()])
        size += sum([get_size(k, seen) for k in obj.keys()])
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum([get_size(i, seen) for i in obj])
    return size