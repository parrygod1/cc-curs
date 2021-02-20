from tornado import ioloop, httpclient
import json
import sys

i = 0

response_list = []

def get_size(obj, seen=None): #returns bytes
    """Recursively finds size of objects"""
    size = sys.getsizeof(obj)
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0

    seen.add(obj_id)
    if isinstance(obj, dict):
        size += sum([get_size(v, seen) for v in obj.values()])
        size += sum([get_size(k, seen) for k in obj.keys()])
    elif hasattr(obj, '__dict__'):
        size += get_size(obj.__dict__, seen)
    elif hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
        size += sum([get_size(i, seen) for i in obj])
    return size

def calc_metrics(response_list):
    mean_response = 0
    max_response = 0
    min_response = 999999
    total_response = 0

    mean_size = 0
    max_size = 0
    min_size = 99999
    total_size = 0

    for r in response_list:
        if r._result.request_time < min_response:
            min_response = r._result.request_time
        if r._result.request_time > max_response:
            max_response = r._result.request_time
        total_response += r._result.request_time

        size = get_size(r._result.body)
        if size < min_size:
            min_size = size
        if size > max_size:
            max_size = size
        total_size += size
    
    mean_response = total_response / len(response_list)
    mean_size = total_size / len(response_list)

    print("min response: ", min_response)
    print("max response: ", max_response)
    print("mean response: ", mean_response)

    print("min size: ", min_size)
    print("max size: ", max_size)
    print("mean size: ", mean_size)

def handle_request(response):
    print(response._result.code, response._result.effective_url)
    global response_list
    response_list.append(response)
    global i
    i -= 1
    if i == 0:
        ioloop.IOLoop.instance().stop()
        calc_metrics(response_list)


http_client = httpclient.AsyncHTTPClient()
for url in open('tool/urls.txt'):
    i += 1
    future = http_client.fetch(url.strip(), method='GET')
    future.add_done_callback(handle_request)
ioloop.IOLoop.instance().start()




