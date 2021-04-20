const fetch = require('node-fetch');
const { dbConnect, insertProd, delProd, delContainer} = require('./utils');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');    

    await dbConnect();
    await delProd();
    //await delContainer();
      
    for(let store of ['lidl', 'profi', 'kaufland']) {
        const response = await fetch(`https://scrap1234.azurewebsites.net/api/scrap123?code=g5rfiNDFycI4nizYVvKw5TCEqynTJzFqvHjsaGmz53Puu5fn4N8zPg==&store=${store}`);
        const prod = await response.json();
        await insertProd(prod, store);
    }
      
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: 'Products updated'
    };

}