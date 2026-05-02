// Author: David Liberatore, 4/8/2026

// Wait until the DOM is fully loaded before running any code
document.addEventListener("DOMContentLoaded", () => {

    // Get references to important HTML elements
    const panel = document.getElementById("sidePanel"); // sidebar container
    const toggleBtn = document.getElementById("togglePanel"); // button to open/close sidebar
    const sidebarHeader = document.getElementById("sidebar-header"); // wraps toggle + tabs
    const truckList = document.getElementById("truckList"); // container for truck buttons
    const searchInput = document.getElementById("truckSearch"); // search input field 
    const filterLabel = document.getElementById("filter-label"); // "Showing X trucks" status label

    // Toggle the sidebar open/close when the button is clicked
    toggleBtn.addEventListener("click", openPanel); // add/remove 'open' class

    function openPanel() {
        panel.classList.toggle("open");
        toggleBtn.classList.toggle("shifted");  // ← add this line
        if (sidebarHeader) sidebarHeader.classList.toggle("open"); // show/hide the tab buttons
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

    // Author: Maisha Sultana, 5/2/2026 — Added search bar, filter pills, and category filtering

    searchInput.addEventListener("input", () => {
        applyFilters();
    });
    
    window.applyFilters = function() {
        const query = searchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector(".filter-pill.active")?.textContent.toLowerCase().replace(/[^a-z ]/g, "").trim();
        let visibleCount = 0;
        truckList.querySelectorAll(".truck-btn").forEach(btn => {
            const name = btn.querySelector("span").textContent.toLowerCase();
            const category = (btn.dataset.category || "").toLowerCase();
            const matchesSearch = name.includes(query);
            const matchesCategory = activeCategory === "all" || category.includes(activeCategory);
            if (matchesSearch && matchesCategory) {
                btn.style.display = "";
                visibleCount++;
            } else {
                btn.style.display = "none";
            }
        });
        filterLabel.textContent = `✨ Showing ${visibleCount} truck${visibleCount !== 1 ? 's' : ''}`;
    }
    
    window.filterByCategory = function(category, btn) {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        applyFilters();
    }
    
    window.clearSearch = function() {
        searchInput.value = "";
        applyFilters();
    }
    
    window.clearFilters = function() {
        searchInput.value = "";
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        document.querySelector(".filter-pill").classList.add("active");
        applyFilters();
    }

    // Author : Andre Nunes da Silva

    // Switch between All Trucks and Favorites tabs
    window.switchTab = function(tab, btn) {
        // Remove 'active' highlight from all tab buttons, then mark the clicked one
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Pull the saved favorites list from localStorage (default to empty array)
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

        // Show or hide each truck button depending on the selected tab
        truckList.querySelectorAll(".truck-btn").forEach(b => {
            if (tab === "all") {
                b.style.display = ""; // show every truck
            } else {
                // Only show trucks whose ID is in the favorites list
                b.style.display = favorites.map(String).includes(b.dataset.truckId) ? "" : "none";
            }
        });
    };

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
                        btn.dataset.truckId = truck.id; // needed for favorites filtering
                        btn.dataset.category = truck.cuisine || ""; // stores the truck's cuisine type on the button element so filter pills can match against it later
                        // Truck name label — displayed on the left side of the button
                        const nameSpan = document.createElement("span");
                        nameSpan.textContent = truck.name;

                        // Bookmark toggle button — sits on the right side of the truck button
                        const favBtn = document.createElement("button");
                        favBtn.className = "favorite-button";
                        // Use a solid bookmark if already favorited, outline bookmark if not
                        favBtn.innerHTML = `<i class="${isFavorite(truck.id) ? 'fas' : 'far'} fa-bookmark"></i>`;
                        favBtn.addEventListener("click", (e) => {
                            e.stopPropagation(); // don't trigger the truck-btn click
                            toggleFavorite(truck.id, favBtn); // save/remove from localStorage and update icon
                        });

                        // Attach name and bookmark to the truck button, then add it to the sidebar
                        btn.appendChild(nameSpan);
                        btn.appendChild(favBtn);

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
                            px.y -= popupContainer.clientHeight / 2 + 80;

                            // Convert the adjusted pixel coordinates back to lat/lng
                            const centeredLatLng = map.unproject(px, targetZoom);

                            // Pan the map to the new coordinates at the current zoom level
                            // This ensures the popup is fully visible and centered
                            map.flyTo(centeredLatLng, targetZoom, { animate: true });
                        });

                        // Add the truck button to the sidebar container
                        truckList.appendChild(btn);
                        // runs filters once after all trucks are loaded so the "Showing X trucks" label is accurate on first load
                        applyFilters();
                    });
                });
        }
    }, 100); // check every 100ms until markers exist

});
