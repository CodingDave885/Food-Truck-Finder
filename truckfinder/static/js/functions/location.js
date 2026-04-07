// File refactored on 04/07/26 @ 6:58 PM by Andre Nunes da Silva

let userMarker, accuracyCircle;

//Runs when the users location is checked
map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    //Creates a pin for the user if not already there
    if (!userMarker) {
        userMarker = L.marker(e.latlng).addTo(map);
        accuracyCircle = L.circle(e.latlng, radius).addTo(map);
    } else {
        //Updates the user's location if already found
        userMarker.setLatLng(e.latlng);
        accuracyCircle.setLatLng(e.latlng);
        accuracyCircle.setRadius(radius);
        //If routing, check waypoints again and remove unnecessary ones
        if (routingControl) {
            const currentWaypoints = routingControl.getWaypoints();
            routingControl.setWaypoints([
                e.latlng, 
                currentWaypoints[1].latLng
            ]);
        }
    }
    //If routing to a truck, check waypoints again only if
    //far from your last position
    if (routingControl && trackedTruckId !== null) {
        const currentWaypoints = routingControl.getWaypoints();
        const oldPos = currentWaypoints[0].latLng;
        if (oldPos.distanceTo(e.latlng) > 5) {
            routingControl.setWaypoints([
                e.latlng, 
                currentWaypoints[1].latLng
            ]);
        }
    }
});