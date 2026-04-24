from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_babel import Babel

app = Flask(__name__)

app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

db = SQLAlchemy(app)

babel = Babel(app)

from truckfinder.models import FoodTruck, MenuItem, FoodTruckHours, SubmittedTruck

# David Liberatore
# 4/24/2026
# Adds different pages for the admin page
admin = Admin(app, name="Admin Dashboard")

admin.add_view(ModelView(FoodTruck, db.session))
admin.add_view(ModelView(MenuItem, db.session))
admin.add_view(ModelView(FoodTruckHours, db.session))
admin.add_view(ModelView(SubmittedTruck, db.session))

from truckfinder import routes
