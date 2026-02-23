from truckfinder import app
from truckfinder.models import FoodTruck, MenuItem, FoodTruckHours
from flask import render_template, url_for
from flask import jsonify
from datetime import datetime



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
    # This gets the time that it currently is
    now = datetime.now()
    # This gets the day that it is
    # This is important because in the DB you have all days saved as numbers
    today = now.weekday()

    # This line gets all the trucks in the db
    trucks = FoodTruck.query.all()
    # Makes a list to store this data
    data = []

    # Simple for - loop that goes through
    for truck in trucks:
        # This gets the hours for all days that it operates
        all_hours = FoodTruckHours.query.filter_by(
            food_truck_id=truck.id
        # Orders by the days of week so it is in order
        ).order_by(FoodTruckHours.day_of_week).all()

        # This finds teh hours row for today from all the hours for this truck
        # Doesn't stop iterating throughout the hours until it finds today
        # After it finds today, it sets today's hours
        today_hours = next(
            (h for h in all_hours if h.day_of_week == today),
            None
        )
        # This uses the function at the bottom of the page
        # Sees if the truck is actually open
        is_open = is_truck_open(today_hours, now)

        # This appends all the data,
        # It puts it into separate dictionaries
        data.append({
            "id": truck.id,
            "name": truck.name,
            "latitude": truck.latitude,
            "longitude": truck.longitude,
            "description": truck.description,
            "is_open":is_open,
            # This makes a dictionary of each truck's hours
            "hours": [
                {
                    "day_of_week": h.day_of_week,
                    # %I tells the program to convert into the 12 - hour clock
                    # %M is the minutes
                    # %p says either AM or PM
                    "open_time": h.open_time.strftime("%I:%M %p").lstrip("0"),
                    "close_time": h.close_time.strftime("%I:%M %p").lstrip("0"),
                }
                for h in all_hours
            ]
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

def is_truck_open(hours_row, now=None):
    # This handles if the truck has no hours for that day
    if not hours_row:
        return False

    # If not doesn't have a value, just make now = to the date now
    # And now contains the year, month, day, hour, etc
    if not now:
        now = datetime.now()

    # This then gives you the hours of now
    # It doesn't care about the date, it only cares about the hours
    current_time = now.time()

    # These pull from the table row
    # open_time and close_time are both row columns in the DB
    open_time = hours_row.open_time
    close_time = hours_row.close_time

    # Same - day hours
    # This returns a boolean if the truck opens later the same day
    if open_time < close_time:
        return open_time <= current_time <= close_time

    # Overnight hours (ex. 22:00 -> 2:40)
    # This returns a boolean if the truck opens overnight
    return current_time >= open_time or current_time <= close_time