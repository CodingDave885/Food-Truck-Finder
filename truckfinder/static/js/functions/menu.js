// File refactored on 04/07/26 @ 6:58 PM by Andre Nunes da Silva

let currentTotal = 0; // to count money total, to calculate how much you would spend.

// Go look through the HTML and give me the element whose id is equal to menu panel
const menuPanel = document.getElementById("menu-panel");
// Does this with all of it, and then stores it in these variables
const menuContent = document.getElementById("menu-content");
const closeBtn = document.getElementById("close-menu");

// This adds the open class to the panel
function openMenuPanel() {
  menuPanel.classList.add("open");
}

// Removes the open class, goes back to default
function closeMenuPanel() {
  menuPanel.classList.remove("open");
}

// When the user clicks the x, the panel closes
closeBtn.addEventListener("click", closeMenuPanel);

function showMenu(truckId) {
  //Calls the open panel function
  openMenuPanel();
  // This is only temporary text while it is fetching the data
  menuContent.innerHTML = "<p>Loading...</p>";
  // Sends a request to the route number
  fetch(`/api/trucks/${truckId}/menu`)
    // Converts the JSON into JS objects
    .then(res => res.json())
    //Passes menu items to renderer
    .then(data => renderMenu(data));
}

function renderMenu(items) {
  // If we didn't import the menu yet, it will say it isn't available
  // This is better than having blank text
  if (items.length === 0) {
    menuContent.innerHTML = "<p>No menu available.</p>";
    return;
  }
  // Empty String to build
  let html = "";
  // Loops over each menu item
  items.forEach(item => {
    // Builds HTML using menu data
    html += `
    <div class="menu-item" role="button" onclick="addToTotal('${item.price}')">
        <h4>
            <span>${item.name}</span>
            <span class='price'>$${item.price}</span>
            </h4>
      </div>
    `;
  });
  //Adds to the html the bottom of the menu, where the total of all
  //selected options is displayed
  html += `
  </div>
  <div id="receipt-bottom">
  <div class="total-row">
    <span>Estimated Total:</span>
    <span id="grand-total">$0.00</span>
</div>
<button id="clear-calc" onclick="resetTotal()">
<i class="fas fa-trash-alt" style="margin-right: 5px;"></i> Clear Receipt
</button>
</div>
`;
  // Injects HTML into the panel
  menuContent.innerHTML = html;
  currentTotal = 0; // resets when a user refreshes or new time they load website
}