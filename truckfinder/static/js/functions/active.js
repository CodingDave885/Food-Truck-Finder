// Author : Andre Nunes da Silva
// Edited & Created on 04/09/26 @ 4PM EST

const currentPage = window.location.pathname; // Grabs the relative location and path 

document.querySelectorAll(".nav-links li a").forEach(link => { // Goes through all the class names under ".nav-links li a" and iterates through all (foreach)
    const href = link.getAttribute("href"); // creates a constanant called href which gets the header reference which grabs the method of the element
                                            // and grabs the relative path after the / (ex : /home, /about, /map)
    console.log("Current:", currentPage, "| Link:", href); // Logs into the console so I could see the changes and if the JS code is working, can remove later.
    
    if (href !== null && (href === currentPage || (href !== "/" && currentPage.includes(href)))) {
        link.classList.add("active"); // if the href is not null and its the same current page it adds it to a class called active that gets called upon in css 
                                      // to update the color of the active link.
    }
});