const fetch = require('node-fetch');

module.exports.getProducts = async() => {
  return await fetch('https://get-products0.azurewebsites.net/api/get-products0').then(async res => res.text());
}

module.exports.insertList = async(userid, data) => {

}
