const host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

function getProductIdFromURL() {
  let url = window.location.href;
  let match = url.match('/product/[0-9]+');
  return url.substring(match.index + 9, url.size);
}

async function getAllProducts(search = '') {
  let url = host + '/products';
  if (search) {
    url += '?search=' + search;
  }
  //console.log(url.toString());
  return await fetch(url).then(async (res) => res.json());
}

async function getDirections(current_loc, stores) {
  let url = new URL(host + '/getDirections');
  let data = {
    origin_loc: current_loc,
    radius: 500,
    destinations: stores,
  };
  for (item in data) {
    url.searchParams.append(item, data[item]);
  }
  return fetch(url).then(async (res) => res.text()); //this will be a html iframe
}

async function insertList(userid, list, name) {
  let url = new URL(host + '/insertList');
  let data = {
    UserId: userid,
    ProductIds: list,
    ListName: name,
  };
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }); //.then(async res => console.log(res.text()))
}

async function updateFavorites(userid, token, productid) {
  let url = new URL(host + '/updateFavorites');
  let data = {
    UserId: userid,
    ProductId: productid,
    Token: token,
  };
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

async function addUser(userid) {
  let url = new URL(host + '/addUser');
  let data = {
    UserId: userid
  };
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

async function getRequest(endpoint, data) {
  let url = new URL(host + endpoint);
  for (item in data) {
    url.searchParams.append(item, data[item]);
  }
  return fetch(url).then(async (res) => res.json());
}

async function getSingleProduct(productid) {
  return getRequest(`/products/${productid}`);
}

async function getFavorites(userid, token) {
  return getRequest('/getFavorites', {
    UserId: userid,
    Token: token,
  });
}

async function getLists(userid, token) {
  return getRequest('/getLists', {
    userid: userid,
    token: token,
  });
}

async function getSingleList(userid, listid) {
  return getRequest('/getSingleList', {
    userid: userid,
    listid: listid,
  });
}

async function checkPremium(userid) {
  return getRequest('/checkPremium', {
    userid: userid,
  });
}
