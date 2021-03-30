process.env.GOOGLE_APPLICATION_CREDENTIALS = 'credentials/disco-dispatch-307814-603e2dbe8751.json'
const express = require('express');
const fetch = require('node-fetch');
const { insertProd, delProd, getProducts, insertList, delBucket } = require('./utils');

const app = express();
const port = 8080;

app.use(express.static('app', {root: __dirname } ));
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile('/app/index.html', {root: __dirname })
});


//http://localhost:8080/getProducts
app.get('/getProducts', (req, res) => {
    getProducts().then(async list => res.send(await list));
});

app.post('/insertList', (req, res) => {
  insertList(req.body['UserId'], req.body['ProductIds']).then(res.send({'message' : 'OK'}));
});

app.get('/updateProducts', async (req, res) => {
  await delBucket();
  for(let store of ['lidl', 'profi', 'kaufland']) {
    const response = await fetch(`https://europe-west1-disco-dispatch-307814.cloudfunctions.net/scrapProducts?store=${store}`);
    const prod = await response.json();
    await delProd(store);
    await insertProd(prod, store);
  }


  res.status(200).json({msg: 'Products updated'});
});

app.get('/getDirections', (req, res) => {
  let url = 'https://europe-west1-disco-dispatch-307814.cloudfunctions.net' + req.url;
  fetch(url).then(async response => res.send(await response.text()));
});

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  });
