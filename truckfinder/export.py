"""
David Liberatore
5/8/2026
This file makes functions that allows the csv file to update from the admin page
The admin page information is now the main source of truth when it comes to the data
not the csv files it used to seed from in the early development stages
"""

import csv
from truckfinder import db
from truckfinder.models import FoodTruck, MenuItem, FoodTruckHours
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
EXPORT_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(EXPORT_DIR, exist_ok=True)

# -------------------------
# FOOD TRUCKS
# -------------------------
def export_foodtrucks_to_csv():
    path = os.path.join(EXPORT_DIR, "food_trucks.csv")
    trucks = FoodTruck.query.all()

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["name","cuisine","latitude","longitude","description"])

        for t in trucks:
            writer.writerow([t.name,t.cuisine,t.latitude,t.longitude,t.description])


# -------------------------
# MENU ITEMS
# -------------------------
def export_menuitems_to_csv():
    path = os.path.join(EXPORT_DIR, "menu_items.csv")
    items = MenuItem.query.all()

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "price", "food_truck_id"])

        for i in items:
            writer.writerow([i.name, f"{i.price:.2f}", i.food_truck_id])


# -------------------------
# HOURS
# -------------------------
def export_hours_to_csv():
    path = os.path.join(EXPORT_DIR, "food_truck_hours.csv")
    hours = FoodTruckHours.query.all()

    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["food_truck_id","day_of_week","open_time","close_time"])

        for h in hours:
            writer.writerow([h.food_truck_id,h.day_of_week,h.open_time,h.close_time])