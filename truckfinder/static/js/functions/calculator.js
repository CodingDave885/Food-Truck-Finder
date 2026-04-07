// File refactored on 04/07/26 @ 6:58 PM by Andre Nunes da Silva

//Adds the price of a food item to the total price of your order
//and updates the display accordingly
function addToTotal(price) {
    currentTotal += parseFloat(price);
    const totalDisplay = document.getElementById('grand-total');

    // Updates text, rounds to 2nd decimal place
    totalDisplay.innerText = `$${currentTotal.toFixed(2)}`;

    totalDisplay.style.transform = "scale(1.2)";
    totalDisplay.style.color = "#2ecc71"; // Turn green briefly
    setTimeout(() => {
        totalDisplay.style.transform = "scale(1)";
    }, 150);
}

//Sets the total value of items ordered to 0
function resetTotal() {
    currentTotal = 0;
    document.getElementById('grand-total').innerText = "$0.00";
}