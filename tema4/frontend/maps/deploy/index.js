const fetch = require('node-fetch');
const api_key = process.env.MAPS_API_KEY;
const badRequest = {
    'message' : 'Bad request, invalid parameters'
}

async function getDirections(context, req){
    let data = {};
    try {
        data = {
            origin_loc: (req.query.origin_loc || req.body.origin_loc),
            destinations: (req.query.destinations|| req.body.destinations),
            radius: (req.query.radius|| req.body.radius)
        };
    }
    catch(error) {
        context.res.status = 400;
        context.res.body = badRequest;
    }
    
    if (data.origin_loc != undefined 
         && data.destinations != undefined 
             && data.radius != undefined){
        const search_api = "https://atlas.microsoft.com/search/poi/json";
        let origin_loc = data.origin_loc.split(',');
        let lat = parseFloat(origin_loc[0]);
        let lon = parseFloat(origin_loc[1]);
        let radius = parseFloat(data.radius);

        let request = new URL(search_api);
        let params = {
        'subscription-key': api_key,
        'api-version': '1.0',
        //'query': destinations...,
        'lat' : lat,
        'lon' : lon,
        'radius' : radius,
        'countrySet' : 'RO',
        'limit' : 1,
        'minFuzzyLevel' : 1,
        'maxFuzzyLevel' : 2
        }
        for(key in params){
            request.searchParams.set(key, params[key]);
        }

        let result = {};
        let destarray = data.destinations.split(',');
        for(let i=0; i < destarray.length; i++){
            request.searchParams.set('query', destarray[i]);
            result[i] = await fetch(request).then(async res => await res.json());
        }
        context.res.body = await result;
      
    }
    else{
        context.res.status = 400;
        context.res.body = badRequest;
    }
    
};

exports.getDirections = getDirections;
