//Make the video element draggagle:
console.log("here")
var videoFrame = document.getElementById("mydiv");

if (videoFrame)
{
    dragElement(videoFrame);
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvcmdlMjMyMyIsImEiOiJja2MwZmxjbGYxajF4MnJsZ2pzbjhjdHc2In0.znh7LExrIEsKBB7SWYJ3hg';
const {MapboxLayer, PointCloudLayer} = deck;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    pitch: 60,
    zoom: 17.5,
    center: [ 33.4151176797,35.1452954125]
});

var popup = new mapboxgl.Popup({closeOnClick: false})
    .setLngLat([33.4151176797, 35.1452954125])
    .setHTML('<h3>Drone Test</h3>')
    .addTo(map);

var el = document.createElement('div');
el.className = 'marker';

var marker = new mapboxgl
    .Marker(el)
    .setLngLat([33.4151176797, 35.1452954125])
    .addTo(map)

//Layer that displays the whole trajectory of the drone
var wholeTripCircleLayer =
    {
        id: 'wholeTripCircleLayer',
        type: 'circle',
        source: {
            type: 'geojson',
            data: './pythonLocUpdate_Script\\aidersDatasetTestRTK.geojson'
        },
        paint: {
            'circle-radius': {
                'base': 1.75,
                'stops': [
                    [12, 2], // make circles larger as the user zooms from z12 to z22
                    [22, 180]
                ]
            },
            'circle-color': '#2DC4B2',
            // 'circle-color':
            // [
            // 'interpolate',
            // ['linear'],
            // ['number', ['get', 'batttery']],
            // 73, '#2DC4B2', //Apply this colour if casualty is "0" and so on..
            // 82, '#3BB3C3',
            // 84, '#669EC4',
            // 87, '#8B88B6',
            // 93, '#A2719B'
            // ],
            'circle-opacity': 0.14
        },

    }

//following url contains only one feature which is updated every ~100ms
var url = 'http://localhost:63340/Drone_Live/pythonLocUpdate_Script/aiders.geojson';

//This object is required to display the yellow trail of the drone
var droneTrailObject =
    {
        "name": "NewFeatureType",
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry":
                    {
                        "type": "LineString",
                        "coordinates": []
                    },
                "properties": {}
            }
        ]
    };

var trailLayerStyle =
    {
        "id": "trailLayerStyle",
        "type": "line",
        "source": "trajectory",
        "paint":
            {
                "line-color": "yellow",
                "line-opacity": 0.75,
                "line-width": 5
            }
    };

//This is a mapbox layer that adds height to the buildings
var threeDlayer =
    {
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#ccc',
            'fill-extrusion-height': ["get", "height"]
        }
    };


//Point cloud layer is taken from deck gl. Still not correctly displayed
var pointCloudLayer = new MapboxLayer(
    {
        id: 'deckgl-PointCloudLayer',
        type: PointCloudLayer,
        data: 'ballPointCloud.json',
        getPosition: d => d.position,
        getColor: d => d.color,
        sizeUnits: 'meters',
        pointSize: 0.75,
        opacity: 1
    }
);

map.on('load', function ()
{
    var i = 0;
    var updateInterval = 100; //milliseconds
    var droneTimer = setInterval(droneUpdate, updateInterval)

    function droneUpdate()
    {
        $.getJSON(url, function (geojson)
        {
            var currentCoordinate = geojson.geometry.coordinates;
            var currentBatteryLevel = geojson.properties.batttery
            var currentFeature = geojson;
            droneTrailObject.features[0].geometry.coordinates.push(currentCoordinate)

            if (currentBatteryLevel > 80)
            {
                popup.setHTML('<h2>Drone Testing</h2><h3 style="color: #228e05">Battery over 80!</h3>');
            }
            else
            {
                popup.setHTML('<h2>Drone Testing</h2><h3 style="color: red">Battery under 80!</h3>');
            }

            map.getSource('trajectory').setData(droneTrailObject);
            popup.setLngLat(currentCoordinate);
            marker.setLngLat(currentCoordinate);

            if (i === 120) //Random point to stop
            {
                clearMap(trailLayerStyle, marker, droneTimer, wholeTripCircleLayer)
            }
            i++;
        });
    }

    map.addSource('trajectory', {type: 'geojson', data: droneTrailObject});
    map.addLayer(trailLayerStyle);
    map.addLayer(wholeTripCircleLayer)
    map.addLayer(threeDlayer, 'waterway-label')
    map.addLayer(pointCloudLayer, 'waterway-label')
});

/*
* Clears all the layers from the map
 */
function clearMap(droneTrailLayer, marker, droneTimer, wholeTripCircleLayer)
{
    clearInterval(droneTimer)
    map.removeLayer(droneTrailLayer.id)
    map.removeLayer(wholeTripCircleLayer.id)
}

/* Makes the video element draggable */
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}