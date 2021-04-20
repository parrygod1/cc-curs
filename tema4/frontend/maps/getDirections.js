process.env.API_KEY = '';
const maps = require('./deploy/index.js')


//http://localhost:8080/getDirections?origin_loc=47.138170,27.5818303&destinations=kaufland,lidl&radius=1000
async function test(){
    express = require('express');
    app = express();
    port = 8080;

    app.get('/getDirections', (req, res) => {
        //let url = 'https://europe-west2-disco-dispatch-307814.cloudfunctions.net' + req.url;
        //fetch(url).then(async response => res.send(await response.text()));
        maps.getDirections(req, res);
    });
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`)
      });
    //req = {
    //    "origin_loc" : "47.1382619,27.581893",
    //    "radius" : 500,
    //    "destinations": "lidl"
    //}
    //getDirections_exec(req).then(msg => console.log(msg));
}

test();
