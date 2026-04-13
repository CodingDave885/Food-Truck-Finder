// File refactored on 04/07/26 @ 6:58 PM by Andre Nunes da Silva

let routingControl = null; // Set variable to a null state, so it can be updated later.
let trackedTruckId = null; // Set variable to a null state, so it can be updated later.

const instructionBox = document.getElementById('routing-instructions'); // Get's html element (routing instructions) from above.
const stopBtn = document.getElementById("stop-button");
const stopBtnPanel = document.getElementById("stop-button-menu");

function startTracking(truckId, truckLat, truckLng) { // 3 Parameters, takes in id, lat, lng all from DB
    if (!userMarker) { // if there isn't a user marker
        alert("Trying to find your location.");
        return;
    }
    if (trackedTruckId === truckId) { // if tracking, if the ID of the tracked truck and the id of the normal truck is the same
        stopTracking();
        return;
    }
    showStopTrackingBtn();
    trackedTruckId = truckId;

    if (routingControl) { // if routing control is active remove it from map, (first time user comes in)
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({ // L.Routing is a built in leaflet function 
      waypoints: [
          userMarker.getLatLng(), // array consisting of the user's lat and lang
          L.latLng(truckLat, truckLng) // grabs the truck's lat & lang
      ],
      router: L.Routing.osrmv1({ // osrmv1 is a public routing service
        serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1', // the url of the api
        profile: 'foot' // several profiles, {foot, car, public transportation, train, bike} can use for later if user wants to specify what they are using to get the the foodtruck
    }),
      lineOptions: {
          styles: [{ color: '#8cbaee', weight: 6, opacity: 0.8 }] // styles -> just colors, weight is the stroke of the line
      },  
      addWaypoints: false,
      draggableWaypoints: false, // don't want to drag points around so I disabled this flag
      show: false, 
      itinerary: false, // planned route set to false before it's active
      createMarker: function() { return null; } 
    }).addTo(map);

    routingControl.on('routesfound', function(e) {
        const routes = e.routes; // any routes
        const summary = routes[0].summary; // first route [index 0] then .summary just appends
        const instructions = routes[0].instructions;
        
        if (instructions && instructions.length > 0) {
            instructionBox.style.display = 'block';
          
            const metersToMiles = 0.000621371;
            const totalMiles = (summary.totalDistance * metersToMiles).toFixed(2);
          
            const nextStep = instructions[0];
            const nextStepMiles = (nextStep.distance * metersToMiles).toFixed(2); // 2 is rounding to the 2nd decimal after the whole num
            const walkTimeMinutes = Math.round(summary.totalTime / 60); // rounds to nearest mile after converting km to mi

            instructionBox.innerHTML = `
    <small style="color: #888; display: block;">${walkTimeMinutes} min walk</small>
    <strong>${nextStep.text}</strong> 
    <span class="miles-left" style="margin-left: 10px;">${totalMiles} mi left</span>
`;
        }
    });
}

//When the stop button is clicked, run stop tracking
stopBtn.addEventListener("click", stopTracking);

function stopTracking() {
    //if routing, remove the route and stop storing the tracked
    //truck, along with resetting the message in the directions box
    //Hides the stop tracking button after clearing tracking
    if (routingControl) {
        map.removeControl(routingControl);
        trackedTruckId = null;
        routingControl = null;
        instructionBox.innerHTML = `
            Select a truck to start navigating...
        `;
        hideStopTrackingBtn();
    }
    return;
}

//Moves the stop tracking button to the front layer
//by changing its class
function showStopTrackingBtn() {
    stopBtn.classList.add("seen");
    stopBtnPanel.classList.add("seen");
}

//Hides the stop tracking button by moving it to the
//bottom layer, through changing its class
function hideStopTrackingBtn() {
    stopBtn.classList.remove("seen");
    stopBtnPanel.classList.remove("seen");
}