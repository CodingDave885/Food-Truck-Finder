from truckfinder import db
from sqlalchemy import Time
from datetime import datetime
from flask_login import UserMixin

class FoodTruck(db.Model):
    # This gives each food truck its own primary key
    id = db.Column(db.Integer, primary_key=True)
    # Name of food truck
    name = db.Column(db.String(100), nullable=False)
    # This is cuisine of the truck
    cuisine = db.Column(db.String(100), nullable=True)
    # Lat and Long for the Leaflet map
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    # This makes a relationship with the Menu Item
    # One food truck has many items, this doesn't show up as a column though
    # backref=truck means that you can access the attribute as "truck" from the other schema
    menu_items = db.relationship('MenuItem', backref='truck', lazy=True)
    # This sets a relation between hours and Food Trucks
    # This is done because one truck can have multiple closing times
    hours = db.relationship('FoodTruckHours', backref="truck", lazy=True)
    # Sees if truck is hidden on map
    is_hidden = db.Column(db.Boolean, default=False)

    # David Liberatore
    # 4 / 24 / 2026
    # Adds Str Method BC it uses that method for the admin page
    def __str__(self):
        return f"{self.name}"

# Stores one rating per user per truck in the database
# Each row represents a single user's star rating for a specific food truck
class TruckRating(db.Model):
    __tablename__ = 'truck_ratings'
    id         = db.Column(db.Integer, primary_key=True)
    truck_id   = db.Column(db.Integer, db.ForeignKey('food_truck.id'), nullable=False)
    # Anonymous user ID generated in the browser and stored in localStorage
    user_id    = db.Column(db.String(64), nullable=False)
    stars      = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('truck_id', 'user_id'),)

# New fields, Author: Andre Nunes da Silva @ 04/20/26

class TruckReview(db.Model):
    __tablename__ = "truck_reviews"
    id = db.Column(db.Integer, primary_key=True)
    truck_id = db.Column(db.Integer, db.ForeignKey('food_truck.id'), nullable=False)
    user_id = db.Column(db.String(64), nullable=False)
    review_text = db.Column(db.Text, nullable=False)
    display_name = db.Column(db.String(50), nullable=True)
    # Optional uploaded image attached to the review (relative URL under /static).
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('truck_id', 'user_id'),)

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

    # David Liberatore
    # 4 / 24 / 2026
    # Adds Str Method BC it uses that method
    def __str__(self):
        match self.day_of_week:
            case 0:
                return f"{self.open_time} - {self.close_time} on Monday"
            case 1:
                return f"{self.open_time} - {self.close_time} on Tuesday"
            case 2:
                return f"{self.open_time} - {self.close_time} on Wednesday"
            case 3:
                return f"{self.open_time} - {self.close_time} on Thursday"
            case 4:
                return f"{self.open_time} - {self.close_time} on Friday"
            case 5:
                return f"{self.open_time} - {self.close_time} on Saturday"
            case 6:
                return f"{self.open_time} - {self.close_time} on Sunday"
            case _:
                return "ERROR"


class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Name of Menu Item
    name = db.Column(db.String(100), nullable=False)
    # Price of item
    price = db.Column(db.Float, nullable=False)
    # This links to teh Food Truck database, basically allows you to query all food that belong to truck
    food_truck_id = db.Column(db.Integer, db.ForeignKey('food_truck.id'), nullable=False)

    # David Liberatore
    # 4 / 24 / 2026
    # Adds Str Method BC it uses that method
    def __str__(self):
        return f"{self.name}"

class SubmittedTruck(db.Model):
    __tablename__ = "submitted_trucks"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    is_approved = db.Column(db.Boolean, default=False)
    merged = db.Column(db.Boolean, default=False)

"""
David Liberatore
5/8/2026
This code makes the schema for an admin account
"""
class User(db.Model,UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)


