import csv
from truckfinder import app, db
from truckfinder.models import FoodTruck

def seed_food_trucks():
    # This is needed to use the db methods
    with app.app_context():
        # Opens the food_truck csv file
        with open("data/food_trucks.csv", newline="", encoding="latin-1") as file:
            reader = csv.DictReader(file)

            #Turns it into a list of items, and then adds it to the DB
            items = [
                FoodTruck(
                    name=row["name"],
                    cuisine=row["cuisine"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    description=row["description"]

            )
                for row in reader
                if row["name"]
            ]

            # Commits to the db so it saves
            db.session.bulk_save_objects(items)
            db.session.commit()

            print("Data imported successfully!")
