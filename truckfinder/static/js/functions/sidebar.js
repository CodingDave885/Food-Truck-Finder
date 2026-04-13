// Author: David Liberatore, 4/8/2026

// Wait until the DOM is fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {

    // Get references to important HTML elements
    const panel = document.getElementById("sidePanel"); // sidebar container
    const toggleBtn = document.getElementById("togglePanel"); // button to open/close sidebar
    const truckList = document.getElementById("truckList"); // container for truck buttons

    // Toggle the sidebar open/close when the button is clicked
    toggleBtn.addEventListener("click", openPanel); // add/remove 'open' class

    function openPanel() {
        panel.classList.toggle("open");
        if (panel.classList.contains("open")) {
            toggleBtn.classList.add("light");
        }
        else if (document.getElementById("mode-swap").classList.contains("light")) {
            toggleBtn.classList.add("light");
        }
        else {
            toggleBtn.classList.remove("light");
        }
    }

    // Periodically check if the truck markers have been loaded
    const waitForMarkers = setInterval(() => {
        if (window.trucksLoaded) { // flag indicating markers exist
            clearInterval(waitForMarkers); // stop checking once markers are ready

            // Fetch the list of food trucks from your API
            fetch("/api/food_trucks")
                .then(res => res.json()) // convert response to JSON
                .then(trucks => {
                    // Loop through each truck to create a sidebar button
                    trucks.forEach(truck => {
                        const btn = document.createElement("button"); // create button element
                        btn.className = "truck-btn"; // add CSS class for styling
                        btn.textContent = truck.name; // set the button text

                        // Add click event listener to each truck button
                        btn.addEventListener("click", () => {
                            const marker = window.markers[truck.id]; // find corresponding marker
                            if (!marker) return; // if marker not found, do nothing

                            // Open the popup for the marker
                            marker.openPopup();

                            // Get the popup DOM element so we can measure its height
                            const popupContainer = marker.getPopup().getElement();
                            if (!popupContainer) {
                                // Fallback: if popup element isn't ready, fly to marker directly
                                map.flyTo(marker.getLatLng(), 19, { animate: true });
                                return;
                            }

                            const targetZoom = 19;
                            // Convert the marker's lat/lng to pixel coordinates at current zoom
                            const px = map.project(marker.getLatLng(), targetZoom);

                            // Adjust the vertical pixel coordinate by half the popup height
                            // This ensures the popup is centered vertically above the marker
                            px.y -= popupContainer.clientHeight / 2;

                            // Convert the adjusted pixel coordinates back to lat/lng
                            const centeredLatLng = map.unproject(px, targetZoom);

                            // Pan the map to the new coordinates at the current zoom level
                            // This ensures the popup is fully visible and centered
                            map.flyTo(centeredLatLng, targetZoom, { animate: true });
                        });

                        // Add the truck button to the sidebar container
                        truckList.appendChild(btn);
                    });
                });
        }
    }, 100); // check every 100ms until markers exist

});
