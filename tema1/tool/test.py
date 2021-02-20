import requests
import json

#url = "https://market-api.swap.gg/v1/pricing/lowest?appId=730"
#res = requests.get(url, headers={"Authorization":"43f46bec-ce3e-49f6-a257-a559ffbceaed"})
#text = json.loads(res.text)
#print(text['time'])

url = "https://chain.api.btc.com/v3/address/15urYnyeJe3gwbGJ74wcX89Tz7ZtsFDVew"
res = requests.get(url)
text = json.loads(res.text)
print(text['data'])

url = "https://api.coinlore.net/api/ticker/?id=90"
res = requests.get(url)
text = json.loads(res.text)
print(text[0]['id'])

