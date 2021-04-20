const host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

async function getAllProducts(){
  let url = host + '/getProducts';
  //console.log(url.toString());
  return await fetch(url).then(async res => res.json());
}

async function getDirections(current_loc, stores){
  let url = new URL(host + '/getDirections');
  let data = {
    'origin_loc' : current_loc,
    'radius' : 1000,
    'destinations' : stores
  }

  for(item in data){
    url.searchParams.append(item, data[item]);
  }
  return fetch(url).then(async res => res.json());
}

async function insertList(userid, list){
  let url = new URL(host + '/insertList');
  let data = {
    "UserId" : userid,
    "ProductIds": list
  }
  fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })//.then(async res => console.log(res.text()))
}