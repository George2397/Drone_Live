//Make the video element draggagle:
var videoFrame = document.getElementById("mydiv");

if (videoFrame)
{
    dragElement(videoFrame);
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvcmdlMjMyMyIsImEiOiJja2MwZmxjbGYxajF4MnJsZ2pzbjhjdHc2In0.znh7LExrIEsKBB7SWYJ3hg';
const {MapboxLayer, PointCloudLayer, LineLayer} = deck;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    pitch: 60,
    zoom: 17.5,
    center: [ 33.4151176797,35.1452954125]
    // center: [148.9819, -35.39847]
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

//Shows the coordinates of the mouse pointer
map.on('mousemove', function(e) {
    document.getElementById('sidebarStyle').innerHTML =
        "Longitude: " + e.lngLat.lat.toFixed(5) + '<br />' +
        "Latitude: " + e.lngLat.lng.toFixed(5) + '<br />' +
        "Zoom: " + map.getZoom().toFixed(2)
});

var popup = new mapboxgl.Popup({closeOnClick: false})
    .setLngLat([33.4151176797, 35.1452954125])
    .setHTML('<h3>Drone Test</h3>')
    .addTo(map)
    .remove();

var el = document.createElement('div');
el.className = 'marker';

var marker = new mapboxgl
    .Marker(el)
    .setLngLat([33.4151176797, 35.1452954125])
    .addTo(map)

//Layer that displays the whole trajectory of the drone
// with circles
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
// var url = 'http://localhost:63340/Drone_Live/pythonLocUpdate_Script/aiders.geojson'; //Works as well
var url = 'pythonLocUpdate_Script/aiders.geojson';

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

var trailLayerData =
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


//ANTENA 3D MODEL
//=====================================================================================================================
{
    // parameters to ensure the model is georeferenced correctly on the map
    var modelOrigin = [33.4151176797, 35.1452954125];
    var modelAltitude = 0;
    var modelRotate = [Math.PI / 2, 0, 0];

    var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );

// transformation parameters to position, rotate and scale the 3D model onto the map
    var modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since our 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    var THREE = window.THREE;

// configuration of the custom layer for a 3D model per the CustomLayerInterface
    var antena3Dmodel = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function(map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            // use the three.js GLTF loader to add the 3D model to the three.js scene
            var loader = new THREE.GLTFLoader();
            loader.load(
                'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
                // 'models\random_threeD.gltf',
                function(gltf) {
                    this.scene.add(gltf.scene);
                }.bind(this)
            );
            this.map = map;

            // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
        },
        render: function(gl, matrix) {
            var rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            var rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            var rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            var m = new THREE.Matrix4().fromArray(matrix);
            var l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };

}
//=====================================================================================================================

//Mapbox layer that adds height to the buildings
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


//Point cloud layer that is taken from deck gl and is in json format. Still not correctly displayed
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


var scatterPlotData = [];

//3D scatter plot layer from Deck GL
const scatterPlotLayer = new MapboxLayer({
    id: 'my-scatterplot',
    type: ScatterplotLayer,
    data: scatterPlotData,
    getPosition: d => d.position,
    getRadius: d => d.size,
    getColor: [255, 0, 0]
});


var duckInitialPosition = [33.41488, 35.14607];
var destination, line;
var duck;

//3D layer that visualizes a duck
var duckLayer =
    {
        id: 'duck_layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, mbxContext) {

            window.tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true }
            );

            var options = {
                obj: 'models\\Duck.glb',
                type: 'gltf',
                scale: 40,
                units: 'meters',
                rotation: { x: 90, y: 0, z: 0 } //default rotation
            }

            tb.loadObj(options, function (model) {
                duck = model.setCoords(duckInitialPosition);
                tb.add(duck);
            })


        },
        render: function (gl, matrix) {
            tb.update();
        }
    };

var soldierInitialPosition = [ 33.4151176797,35.1452954125]

//3D layer that visualizes a soldier
var soldierLayer =
    {
        id: 'soldier_layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, mbxContext) {

            window.tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true }
            );

            var options = {
                obj: 'models\\Soldier.glb',
                type: 'gltf',
                scale: 10,
                units: 'meters',
                rotation: { x: 90, y: 0, z: 0 } //default rotation
            }

            tb.loadObj(options, function (model) {
                soldier = model.setCoords(soldierInitialPosition);
                tb.add(soldier);
            })


        },
        render: function (gl, matrix) {
            tb.update();
        }
    };


map.on('style.load', function ()
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

            var currentCoordinateObject =
                {
                    position: currentCoordinate,
                    size: 5
                };

            updateScatterPlotLayer(currentCoordinateObject);

            updateTooltip(currentBatteryLevel)
            console.log(scatterPlotData)

            map.getSource('trajectory').setData(droneTrailObject);
            popup.setLngLat(currentCoordinate);
            marker.setLngLat(currentCoordinate);
            soldier.setCoords(currentCoordinate);
            moveThreeDElement(currentCoordinate,i);

            if (i === 100) //Random point to stop
            {
                clearMap(trailLayerData, marker, droneTimer, wholeTripCircleLayer)
            }
            i++;
        });
    }

    map.addSource('trajectory', {type: 'geojson', data: droneTrailObject});
    map.addLayer(trailLayerData);
    map.addLayer(wholeTripCircleLayer)
    map.addLayer(threeDlayer, 'waterway-label')
    map.addLayer(pointCloudLayer, 'waterway-label')
    map.addLayer(scatterPlotLayer, 'waterway-label');
    map.addLayer(antena3Dmodel, 'waterway-label');
    map.addLayer(soldierLayer);
    map.addLayer(duckLayer);

});

/* Clears all the layers from the map*/
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

/*Moves the 3d element to the current position of the drone*/
function moveThreeDElement(currentCoordinate, i)
{
    modelOrigin = [currentCoordinate[0], currentCoordinate[1]];
    // modelOrigin = [ currentCoordinate[1], currentCoordinate[0]];
    modelAltitude = currentCoordinate[2];
    // modelAltitude = i; //Giving the repetition as an altitude to check if it works

    modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
    );

    modelTransform.translateX = modelAsMercatorCoordinate.x;
    modelTransform.translateY = modelAsMercatorCoordinate.y;
    modelTransform.translateZ = modelAsMercatorCoordinate.z;
}

/*Updates the Scatter Plot Layer*/
function updateScatterPlotLayer(currentCoordinateObject)
{
    scatterPlotData = scatterPlotData.concat(currentCoordinateObject)
    scatterPlotLayer.setProps(
        {
            data: scatterPlotData
        }
    );
}

/*Updates the text on the tooltip based on the battery level*/
function updateTooltip(currentBatteryLevel)
{
    if (currentBatteryLevel > 80)
    {
        popup.setHTML('<h2>Drone Testing</h2><h3 style="color: #228e05">Battery over 80!</h3>');
    }
    else
    {
        popup.setHTML('<h2>Drone Testing</h2><h3 style="color: red">Battery under 80!</h3>');
    }
}