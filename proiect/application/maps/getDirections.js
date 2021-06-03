/**
*  * Responds to any HTTP request.
*  *
*  * @param {!express:Request} req HTTP request context.
*  * @param {!express:Response} res HTTP response context.
* 
*/
const fetch = require('node-fetch');
const api_key = 
const badRequest = {
    'message' : 'Bad request, invalid parameters'
}

function getIframe(origin_loc, candidates_data){
    var embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${api_key}&origin=${origin_loc}&destination=place_id:${candidates_data[0]['candidates'][0]['place_id']}`;
    let len = Object.keys(candidates_data).length;
    if(len > 1){
        let wp = '&waypoints=place_id:' + candidates_data[1]['candidates'][0]['place_id'];
        for(let i = 2; i < len; i++){
            wp += '|place_id:' + candidates_data[i]['candidates'][0]['place_id']
        }
        embedUrl += wp;
    }
    
    var iframe = `
    <iframe
    width="800"
    height="600"
    frameborder="0" style="border:0"
    src="${embedUrl}"
    allowfullscreen>
    </iframe>`;

    return iframe;
}

async function getDirections_exec(data){
    const search_api = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?";
    let origin_loc = data.origin_loc;
    let radius = data.radius;
    //let destinations = data.destinations;
    let request = new URL(search_api);
    let params = {
    'input': '',
    'inputtype': 'textquery',
    'fields': 'place_id',
    'locationbias': `circle:${radius}@${origin_loc}`,
    'key': api_key
    }
    for(key in params){
        request.searchParams.set(key, params[key]);
    }
    let result = {};
    let destarray = data.destinations.split(',');
    for(let i=0; i < destarray.length; i++){
        request.searchParams.set('input', destarray[i]);
        result[i] = await fetch(request).then(async res => await res.json());
    }
    console.log(result);
    return await getIframe(origin_loc, result);
}

async function getDirections(req, res){
    let data = {
        origin_loc: req.param('origin_loc'),
        destinations: req.param('destinations'),
        radius: req.param('radius')
    };

    if (data.origin_loc != undefined 
         && data.destinations != undefined 
             && data.radius != undefined){
      getDirections_exec(data).then(message => res.status(200).send(message));
    }
    else{
      res.status(400).send(badRequest);
    }
};

exports.getDirections = getDirections;



async function test(){
    express = require('express');
    app = express();
    port = 8080;

    app.get('/getDirections', (req, res) => {
        //let url = 'https://europe-west2-disco-dispatch-307814.cloudfunctions.net' + req.url;
        //fetch(url).then(async response => res.send(await response.text()));
        getDirections(req, res);
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

test()
