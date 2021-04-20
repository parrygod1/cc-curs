const express = require('express');
const fetch = require('node-fetch');
const { insertProd, getProducts } = require('./utils');

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

app.get('/getDirections', (req, res) => {
  let url = 'https://cct4cloudfunc.azurewebsites.net/api' + req.url;
  fetch(url).then(async response => res.send(await response.text()));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});
