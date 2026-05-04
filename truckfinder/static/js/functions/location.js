// File refactored on 04/07/26 @ 6:58 PM by Andre Nunes da Silva
var slider = document.getElementById("distance");
var lastDist = 100;
let userMarker, accuracyCircle, userPos;

//Runs when the users location is checked
map.on('locationfound', (e) => {
    const radius = e.accuracy / 2;
    //Creates a pin for the user if not already there
    userPos = [e.latitude, e.longitude]
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
        if (slider.value != lastDist) {
            if (slider.value != 100){
                fetch("api/food_trucks")
                    .then(res => res.json())
                    .then(trucks => {
                        trucks.forEach(truck => {
                            alert("Distance" + str(userMarker.distanceTo([truck.longitude, truck.latitude])))
                            if (userMarker.distanceTo([truck.longitute, truck.latitude]) > radius * 10){
                                window.markers[truck.id].setZIndexOffset(-1000);
                            }
                            else {
                                window.markers[truck.id].setZIndexOffset(500);
                            }
                        })
                    })
            }
        }
        else {

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

var slider = document.getElementById("distance");

slider.oninput = function() {
    if (window.trucksLoaded && userMarker) {
        fetch("/api/food_trucks")
            .then(res => res.json())
            .then(trucks => {
                trucks.forEach(truck => {
                    if ((L.latLng(userPos).distanceTo([truck.latitude, truck.longitude]) < slider.value * 5.3645 || slider.value == 100)){
                        if (window.markers[truck.id].getPopup() == null){
                            window.markers[truck.id].bindPopup(`
                                <div class="popup-header">
                                    <button class='favorite-button' onclick="toggleFavorite(${truck.id}, this)"> 
                                        <i class="${isFavorite(truck.id) ? 'fas' : 'far'} fa-bookmark"></i>
                                    </button>
                                    <h3>${truck.name}</h3>
                                </div>
                                <p>
                                    <strong></strong>
                                    <!--If it is opened, do the first option
                                    If it is closed, do the second option-->
                                    <div class="status-info">
                                    ${truck.is_open 
                                    ? `<span><span class="status-bulb open"></span> <strong>Open now!</strong> </span>`
                                    : `<span><span class="status-bulb closed"></span> <strong>Closed</strong> </span>`
                                    }
                                    </div>
                                </p>
                                <p><strong></strong></p>
                                <ul class='hours-list'>
                                    ${buildHoursList(truck.hours)}
                                </ul>
                                <!--
                                Calls showMenu(), and passes the truck's db
                                -->
                                <div id="rating-anchor-${truck.id}">
                                    <div class="rating-section" style="opacity:0.5;font-size:11px;padding:8px 12px;">Loading rating…</div>
                                </div>
                                <div class="popup-button-row">
                                <button class='menu-button' onclick="showMenu(${truck.id})">
                                    <i class="fas fa-bars"></i> MENU
                                </button>
                                <button class='track-button' onclick="startTracking(${truck.id}, ${truck.latitude}, ${truck.longitude})">
                                    <i class="fas fa-location-arrow"></i> TRACK
                                </button>
                                </div>
                            `, {
                                className: 'pin-popup', // class name to customize the pin's contents
                                maxWidth: 250,
                                maxHeight: 450,
                                autoPan: true
                            }).bindTooltip(`<h3>${truck.name}</h3>`, {direction: 'top', offset: [0, -47], className: 'pin-popup'});
                            window.markers[truck.id].setOpacity(1);
                        }
                    }
                    else{
                        window.markers[truck.id].unbindPopup().unbindTooltip();
                        window.markers[truck.id].setOpacity(0);
                    }
                })
            })
    }
}