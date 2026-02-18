from truckfinder import app
from truckfinder.models import FoodTruck, MenuItem
from flask import render_template, url_for
from flask import jsonify



@app.route("/")
def home():
    return render_template("home.html", title="Home")

@app.route('/map')
def map_page():
    return render_template('Map.html', title="Map")

@app.route('/about')
def about():
    return render_template('About.html', title="About")

# This route leads you to Alex's page that he made saying food truck information
@app.route("/helper")
def info():
    return render_template("TruckItemsRaw.html")

# This route is used as a helper route
# This is only called by the JavaScript in the main page
# It uses this rout to basically query all the truck data
@app.route("/api/food_trucks")
def get_food_trucks():
    # This line gets all the trucks in the db
    trucks = FoodTruck.query.all()

    # Makes a list to store this data
    data = []
    # Simple for - loop that goes through
    for truck in trucks:
        # This appends all the data,
        # It puts it into separate dictionaries
        data.append({
            "id": truck.id,
            "name": truck.name,
            "latitude": truck.latitude,
            "longitude": truck.longitude,
            "description": truck.description
        })

    # Jsonify is a function that converts the dictionaries into a separate JSON file
    # This is so the FE can interact with it
    # Jsonify however does not make a new file, and is only made over the browser
    # After it is made the program instantly forgets it after it is used
    return jsonify(data)

# This route works similarly to the food_truck route
@app.route("/api/trucks/<int:truck_id>/menu")
def get_truck_menu(truck_id):
    # This gets the food truck with the specific menu
    # Saves this data into a variable
    items = MenuItem.query.filter_by(
        food_truck_id=truck_id
    ).all()
    # Makes blank list
    data = []
    # Loops through all items belonging to the truck
    for item in items:
        # Appends appropriate data
        data.append({
            "id": item.id,
            "name": item.name,
            "price": item.price,
        })
    # Returns a JSON version of the data
    return jsonify(data)
