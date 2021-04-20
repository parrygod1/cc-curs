var map, datasource, client;

function GetMap(origin_loc, destinations) {
    var map = new atlas.Map('myMap', {
        view: 'Auto',
        authOptions: {
            //Use Azure Active Directory authentication.
            authType: 'anonymous',
            clientId: "04ec075f-3827-4aed-9975-d56301a2d663", //Your Azure Active Directory client id for accessing your Azure Maps account.
            /*getToken: function (resolve, reject, map) {
                //URL to your authentication service that retrieves an Azure Active Directory Token.
                var tokenServiceUrl = "https://azuremapscodesamples.azurewebsites.net/Common/TokenService.ashx";

                fetch(tokenServiceUrl).then(r => r.text()).then(token => resolve(token));
            }*/
            authType: 'subscriptionKey',
            subscriptionKey: ''
        }
    });
    //origin_loc = '47.13817,27.5818303';
    origin_loc = origin_loc.replace(' ', '');
    //Wait until the map resources are ready.
    map.events.add('ready', function () {
        //Create a data source and add it to the map.
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        //Add a layer for rendering the route lines and have it render under the map labels.
        map.layers.add(new atlas.layer.LineLayer(datasource, null, {
            strokeColor: '#2272B9',
            strokeWidth: 5,
            lineJoin: 'round',
            lineCap: 'round'
        }), 'labels');

        //Add a layer for rendering point data.
        map.layers.add(new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: {
                image: ['get', 'icon'],
                allowOverlap: true
            },
            textOptions: {
                textField: ['get', 'title'],
                offset: [0, 1.2]
            },
            filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
        }));

        let startCoord = origin_loc.split(',');
        startCoord.reverse();
        var coordinates = []; //Start and end point input to the routeURL

        getDirections(origin_loc, destinations).then(function (results) {
            //results = JSON.parse(results);
            console.log(results);
            //Create the GeoJSON objects which represent the start and end points of the route.
            var startPoint = new atlas.data.Feature(new atlas.data.Point(startCoord), {
                title: "Start Location",
                icon: "pin-blue"
            });
            coordinates.push([startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]);
            
            var destinationPoints = [];

            for(let idx in results){
                let name = results[idx]['results'][0]['poi']['name'];
                let coords = results[idx]['results'][0]['position'];
                
                let point = new atlas.data.Feature(new atlas.data.Point([coords['lon'], coords['lat']]), {
                    title: name,
                    icon: "pin-round-blue"
                });

                destinationPoints.push(point);
                coordinates.push([point.geometry.coordinates[0], point.geometry.coordinates[1]])
            }

            //Add the data to the data source.
            datasource.add([startPoint].concat(destinationPoints));

            map.setCamera({
                bounds: atlas.data.BoundingBox.fromData([startPoint].concat(destinationPoints)),
                padding: 80
            });

            //Use MapControlCredential to share authentication between a map control and the service module.
            var pipeline = atlas.service.MapsURL.newPipeline(new atlas.service.MapControlCredential(map));

            //Construct the RouteURL object
            var routeURL = new atlas.service.RouteURL(pipeline);

            
            //Make a search route request
            routeURL.calculateRouteDirections(atlas.service.Aborter.timeout(10000), coordinates).then((directions) => {
                //Get data features from response
                var data = directions.geojson.getFeatures();
                datasource.add(data);
            });
        });
    });
}