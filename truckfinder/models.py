from truckfinder import db

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
    menu_items = db.relationship('MenuItem', backref='truck', lazy=True)


class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Name of Menu Item
    name = db.Column(db.String(100), nullable=False)
    # Price of item
    price = db.Column(db.Float, nullable=False)
    # This links to teh Food Truck database, basically allows you to query all food that belong to truck
    food_truck_id = db.Column(db.Integer, db.ForeignKey('food_truck.id'), nullable=False)