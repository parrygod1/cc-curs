const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('buuucket0');
const fbauth = require('./firebaseauth');

const sha256 = require('sha256');

var fs = require('fs'),
  request = require('request');

module.exports.delBucket = async () => {
  await bucket.deleteFiles();
};

function downloadImg(uri, filename) {
  return new Promise(function (resolve, reject) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', () => {
        resolve(1);
      });
  });
}

module.exports.insertProd = async (prod, store) => {
  for (i in prod) {
    await downloadImg(prod[i].image, 'img.png');
    let fileName = sha256(prod[i].title.concat(' ', i.toString()));
    const options = {
      destination: fileName,
      metadata: {
        contentType: 'image/jpeg',
      },
    };
    await bucket.upload('img.png', options);

    const taskKey = datastore.key('Products');
    const task = {
      key: taskKey,
      data: {
        Description: prod[i].description,
        ImageLink: fileName,
        Name: prod[i].title,
        Price: prod[i].price,
        Stores: store,
      },
    };

    await datastore.save(task);
    //console.log(`Saved ${task.data.Name}`);
  }
};

module.exports.delProd = async (store) => {
  const query = datastore.createQuery('Products');
  query.filter('Stores', store);
  const [entities] = await datastore.runQuery(query);
  for (idx in entities) {
    let key = entities[idx][datastore.KEY];
    datastore.delete(key, (err, apiResp) => {});
  }
};

module.exports.getProducts = async (search) => {
  let query = datastore.createQuery('Products');

  const [products] = await datastore.runQuery(query);
  let list = {};
  products.forEach((product) => {
    // https://cloud.google.com/datastore/docs/concepts/queries#restrictions_on_queries
    if (search) {
      if (product.Name.toLowerCase().indexOf(search.toLowerCase()) === -1)
        return;
    }
    let key = product[datastore.KEY];
    list[key.id] = product;
    //console.log(key.id, product);
  });
  return list;
};

module.exports.getSingleProduct = async (id) => {
  const key = datastore.key(['Products', parseInt(id)]);
  let ret = await datastore
    .get(key)
    .then((entity) => {
      //console.log(entity);
      return entity;
    })
    .catch((error) => {
      console.log(error);
      return undefined;
    });
  return ret;
};

module.exports.insertList = async (userid, data, name) => {
  const kind = datastore.key('ProductList');
  const entry = {
    key: kind,
    data: {
      ProductIds: data,
      UserId: userid,
      ListName: name,
    },
  };
  await datastore.save(entry);
};

module.exports.updateFavorites = async (userid, productid, token) => {
  productid = parseInt(productid);
  fbauth.verifyUserToken(token, userid).then((tokenOk) => {
    if (tokenOk) {
      const query = datastore
        .createQuery('Favorites')
        .filter('UserId', '=', userid);
      datastore.runQuery(query).then((data) => {
        const kind = datastore.key('Favorites');
        const entry = {
          key: kind,
          data: {
            ProductIds: [],
            UserId: userid,
          },
        };
        if (Array.isArray(data[0]) && data[0].length == 0) {
          entry.data.ProductIds.push(productid);
          datastore.save(entry);
        } else {
          entry.key = data[0][0][Datastore.KEY];
          entry.data.ProductIds = data[0][0].ProductIds;
          if (entry.data.ProductIds.includes(productid)) {
            let index = entry.data.ProductIds.indexOf(productid);
            entry.data.ProductIds.splice(index, 1);
          } else {
            entry.data.ProductIds.push(productid);
          }
          datastore.update(entry);
        }
      });
    }
  });
};

module.exports.getFavorites = async (userid, token) => {
  return fbauth.verifyUserToken(token, userid).then((tokenOk) => {
    if (tokenOk) {
      const query = datastore
        .createQuery('Favorites')
        .filter('UserId', '=', userid);
      return datastore.runQuery(query).then(async (data) => {
        let list = {};
        for (let idx in data[0][0].ProductIds) {
          var product = await this.getSingleProduct(
            parseInt(data[0][0].ProductIds[idx])
          );
          list[product[0][Datastore.KEY].id] = product[0];
        }
        //console.log(list);
        return list;
      });
    } else {
      return { message: 'Invalid token' };
    }
  });
};

module.exports.updatePremiumStatus = async (userid, status) => {
  const query = datastore.createQuery('UserData').filter('UserId', '=', userid);
  datastore.runQuery(query).then((data) => {
    const entry = {
      key: '',
      data: {
        UserId: userid,
        PremiumStatus: status,
      },
    };
    //console.log(data)
    if (Array.isArray(data[0]) && data[0].length == 0) {
      entry['key'] = datastore.key('UserData');
      datastore.save(entry);
    } else {
      entry['key'] = data[0][0][datastore.KEY];
      datastore.update(entry);
    }
  });
};

module.exports.getUserData = async (userid) => {
  const query = datastore.createQuery('UserData').filter('UserId', '=', userid);
  const [data] = await datastore.runQuery(query);
  if (
    (Array.isArray(data[0]) && data[0].length == 0) ||
    (Array.isArray(data) && data.length == 0)
  ) {
    return { message: `Could not find user ${userid}` };
  } else {
    return data[0];
  }
};

module.exports.addUser = async (userid) => {
  const query = datastore.createQuery('UserData').filter('UserId', '=', userid);
  const [data] = await datastore.runQuery(query);
  if (
    (Array.isArray(data[0]) && data[0].length == 0) ||
    (Array.isArray(data) && data.length == 0)
  ) {
    const entry = {
      key: '',
      data: {
        UserId: userid,
        PremiumStatus: 0,
      },
    };
    entry['key'] = datastore.key('UserData');
    datastore.save(entry);
  } 
};

module.exports.getLists = async (userid, token) => {
  const userData = await this.getUserData(userid);
  const tokenCheck = await fbauth.verifyUserToken(token);

  if (tokenCheck == false) {
    return { message: 'Could not verify token' };
  } else if ('message' in userData) {
    return userData;
  } else {
    const query = datastore
      .createQuery('ProductList')
      .filter('UserId', '=', userid);
    const [data] = await datastore.runQuery(query);
    let list = {};
    data.forEach((entry) => {
      let key = entry[datastore.KEY];
      list[key.id] = entry;
      //console.log(key.id, product);
    });
    return list;
  }
};

module.exports.getSingleList = async (userid, listid) => {
  const key = datastore.key(['ProductList', parseInt(listid)]);
  const [entity] = await datastore.get(key);

  if (entity == undefined) {
    return { message: `Could not find list ${listid}` };
  } else {
    const ownerUserData = await this.getUserData(entity['UserId']);
    if ('message' in ownerUserData) {
      return ownerUserData;
    } else if (
      userid != entity['UserId'] &&
      ownerUserData['PremiumStatus'] == 0
    ) {
      return { message: 'This user cannot share his lists' };
    } else {
      var list = {};
      //console.log(entity);
      for (let idx in entity['ProductIds']) {
        let product = await this.getSingleProduct(entity['ProductIds'][idx]);
        if (product != undefined && product[0] != undefined) {
          let key = product[0][datastore.KEY];
          list[key.id] = product[0];
        }
      }
      //console.log(list);
      var data = {
        key: entity[datastore.KEY],
        name: entity['ListName'],
        userid: entity['UserId'],
        products: list,
      };
      return data;
    }
  }
};
