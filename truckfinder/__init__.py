from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from truckfinder.admin_views import MyAdminIndexView, SecureModelView
from flask_babel import Babel

db = SQLAlchemy()  # moved outside so models can still import it

# David Liberatore
# 5 / 1 / 2026
# Creates app in a function instead of letting it float around
def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

    # This is needed for the admin page
    # It doesn't get utilized but is needed to launch the admin page
    babel = Babel(app)
    db.init_app(app)
    # Migrate allows us to easily add rows / columns to the schemas
    Migrate(app, db)

    from truckfinder.models import FoodTruck, MenuItem, FoodTruckHours, SubmittedTruck

    # David Liberatore
    # 4/24/2026
    # Adds different pages for the admin page
    admin = Admin(app, name="Admin Dashboard", index_view=MyAdminIndexView())
    # Adds all the rows to the admin page
    admin.add_view(ModelView(FoodTruck, db.session))
    admin.add_view(ModelView(MenuItem, db.session))
    admin.add_view(ModelView(FoodTruckHours, db.session))
    admin.add_view(ModelView(SubmittedTruck, db.session))

    from truckfinder import routes
    # Creates a blueprint
    app.register_blueprint(routes.bp)

    return app