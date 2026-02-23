from truckfinder import db
from sqlalchemy import Time

class FoodTruck(db.Model):
    # This gives each food truck its own primary key
    id = db.Column(db.Integer, primary_key=True)
    # Name of food truck
    name = db.Column(db.String(100), nullable=False)
    # This is cuisine of the truck
    cuisine = db.Column(db.String(100))
    # Lat and Long for the Leaflet map
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    # This makes a relationship with the Menu Item
    # One food truck has many items, this doesn't show up as a column though
    # backref=truck means that you can access the attribute as "truck" from the other schema
    menu_items = db.relationship('MenuItem', backref='truck', lazy=True)
    # This sets a relation between hours and Food Trucks
    # This is done because one truck can have multiple closing times
    hours = db.relationship('FoodTruckHours', backref="truck", lazy=True)

# This schema is for the hours of the Food Trucks
# Says whether it is open
class FoodTruckHours(db.Model):
    # This makes a primary key for this row
    id = db.Column(db.Integer, primary_key=True)
    # sql alchemy automatically converts camel case to snake case
    food_truck_id = db.Column(db.Integer, db.ForeignKey("food_truck.id"), nullable=False)

    # 0 = Monday, 6 = Sunday
    day_of_week = db.Column(db.Integer, nullable=False)
    open_time = db.Column(Time, nullable=False)
    close_time = db.Column(Time, nullable=False)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Name of Menu Item
    name = db.Column(db.String(100), nullable=False)
    # Price of item
    price = db.Column(db.Float, nullable=False)
    # This links to teh Food Truck database, basically allows you to query all food that belong to truck
    food_truck_id = db.Column(db.Integer, db.ForeignKey('food_truck.id'), nullable=False)