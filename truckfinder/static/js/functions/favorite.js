// Author : Andre Nunes da Silva @ 6:39 AM Tue Apr 14th

// Saving a favorite
function addFavorite(truckId) { 

    // looks in the browser's local storage for a key called favorites 
    // "||" means or, so if nothing is found, we make an empty array so there's somewhere to put our cookie called "favorites"
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); // localStorage can only store text, so parsing it converts it back to an array
    if (!favorites.includes(truckId)) { // checks for duplicates
        favorites.push(truckId); // adds to array
        localStorage.setItem('favorites', JSON.stringify(favorites)); // converts array back into text
    }
}

// Removing a favorite
function removeFavorite(truckId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); // localStorage can only store text, so parsing it converts it back to an array
    favorites = favorites.filter(id => id !== truckId); // creates an array keeping every ID except for the one you want to remove, using the filter built-in function,
    // we loop through every item and "id !== truckId" means keep it only if it isnt the one we are removing.
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Check if one is favorited
function isFavorite(truckId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); // localStorage can only store text, so parsing it converts it back to an array
    return favorites.includes(truckId);
}

// Loads the array, well in plain text now because of getting parsed, checks whether all trucks are favorited (true or false) 
function toggleFavorite(truckId, btn) {
    if (isFavorite(truckId)) {
        removeFavorite(truckId);
        btn.querySelector('i').className = 'far fa-bookmark' // switches between the filled bookmark, and non filled
    } else {
        addFavorite(truckId)
        btn.querySelector('i').className = 'fas fa-bookmark'

    }
}