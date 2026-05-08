from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_admin import Admin
from flask_login import LoginManager
from flask_admin.contrib.sqla import ModelView
from flask_babel import Babel

db = SQLAlchemy()
# Makes Login Manager
login_manager = LoginManager()

# import AFTER db/login_manager exist
from truckfinder.admin_views import MyAdminIndexView, SecureModelView

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'

    babel = Babel(app)
    db.init_app(app)
    login_manager.init_app(app)
    Migrate(app, db)

    from truckfinder.models import FoodTruck, MenuItem, FoodTruckHours, SubmittedTruck, User

    admin = Admin(app, name="Admin Dashboard", index_view=MyAdminIndexView())

    # IMPORTANT: use SecureModelView (not ModelView)
    admin.add_view(SecureModelView(FoodTruck, db.session))
    admin.add_view(SecureModelView(MenuItem, db.session))
    admin.add_view(SecureModelView(FoodTruckHours, db.session))
    admin.add_view(SecureModelView(SubmittedTruck, db.session))

    from truckfinder.auth import auth_bp
    app.register_blueprint(auth_bp)

    from truckfinder import routes
    app.register_blueprint(routes.bp)

    return app