const {Datastore} = require('@google-cloud/datastore');
const datastore = new Datastore();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('buuucket0');

const sha256 = require('sha256');

var fs = require('fs'), request = require('request');

module.exports.delBucket = async () => {
  await bucket.deleteFiles();
}

function downloadImg(uri, filename){
  return new Promise(function(resolve, reject){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', () => {resolve(1);});
  });
}

module.exports.insertProd = async(prod, store) => {
    for(i in prod){

      await downloadImg(prod[i].image, 'img.png');
      let fileName = sha256(prod[i].title.concat(' ', i.toString()));      
      const options = {
        destination: fileName,
        metadata: {
          contentType: 'image/jpeg'
        }
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
          Stores: store
        },
      };
    
      await datastore.save(task);
      //console.log(`Saved ${task.data.Name}`);
    }  
};

module.exports.delProd = async(store) => {
    const query = datastore.createQuery('Products');
    query.filter('Stores', store);
    const [entities] = await datastore.runQuery(query);
    for(idx in entities){
      let key = entities[idx][datastore.KEY];
      datastore.delete(key, (err, apiResp) => {});
    }
}

module.exports.getProducts = async() => {
  const query = datastore.createQuery('Products');
  const [products] = await datastore.runQuery(query);
  let list = {};
  products.forEach(product => {
    let key = product[datastore.KEY];
    list[key.id] = product;
    //console.log(key.id, product);
  });
  return list;
}

module.exports.insertList = async(userid, data) => {
  const kind = datastore.key('ProductList');
  const entry = {
    key: kind,
    data: {
      ProductIds: data,
      UserId: userid
    },
  };
  await datastore.save(entry);
}
