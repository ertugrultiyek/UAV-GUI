let map;

function initMap() {
	const yunuseli = { lat: 40.23, lng: 29.01 }		// origin point

	// create the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: yunuseli,
    zoom: 17.3,
		mapTypeId: 'satellite',
		streetViewControl: false,
		controlSize: 25,
		mapTypeControl: false,
  });

var route = [];

	// listen for clicks on map
	google.maps.event.addListener(map, 'click', function(event){
		addMarker(event.latLng);

		// for mission planner
		route.push(event.latLng);
		console.log(event.latLng.toString());

		if(route.length > 1){
			const polyLineOpt = {
				map: map,
				path: route,
				strokeWeight: 3,
				strokeColor: "#ff0000",
			};
			var polyLine = new google.maps.Polyline(polyLineOpt);
			//route.shift();
		}
	});

// 	// track the coordinates of mouse movement on map
// 	google.maps.event.addListener(map, 'mousemove', function(event){
// 		document.getElementById("label").innerText = event.latLng.toString();
// 	});

	// create marker
	function addMarker(loc){
		const marker = new google.maps.Marker({
			position:loc,
			map: map,
		});
	}

}
