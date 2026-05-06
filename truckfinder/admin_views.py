"""
David Liberatore
5/5/2026
This code is for the admin page,
It also has authentication to make sure only admins can go to admin page
"""
from flask_admin import AdminIndexView, expose
from flask import redirect, url_for, flash
from flask_admin.contrib.sqla import ModelView
from flask_httpauth import HTTPBasicAuth
import os

auth = HTTPBasicAuth()

# This sets the username and password
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "FoodTruckFinder")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "iHeartFoodTrucks123")

# This function verifies if the user / password entered is correct
@auth.verify_password
def verify_password(username, password):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return username

class MyAdminIndexView(AdminIndexView):
    # Renders template
    @expose('/')
    @auth.login_required
    def index(self):
        return self.render('admin/index.html')
    @expose('/merge-trucks', methods=['POST'])
    def merge_trucks(self):
        from truckfinder.merge import merge_submitted_trucks
        # Flashes how many were added / skipped on admin page
        try:
            result = merge_submitted_trucks()
            flash(f"Merge complete! {result['added']} added, {result['skipped']} skipped.", "success")
        except Exception as e:
            flash(f"Merge failed: {str(e)}", "error")
        return redirect(url_for('admin.index'))

class SecureModelView(ModelView):
    # Login for the admin page
    @auth.login_required
    # kwargs says accept any amount of arguments in the function
    def _handle_view(self, name, **kwargs):
        # _handle takes care of whenever the admin page is called
        return super()._handle_view(name, **kwargs)