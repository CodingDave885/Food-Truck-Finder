from flask_admin import AdminIndexView, expose
from flask import redirect, url_for, flash

class MyAdminIndexView(AdminIndexView):
    # Expose is basically the same as a route but for the admin page
    @expose('/')
    def index(self):
        return self.render('admin/index.html')

    @expose('/merge-trucks', methods=['POST'])
    def merge_trucks(self):
        from truckfinder.merge import merge_submitted_trucks
        try:
            result = merge_submitted_trucks()
            flash(f"Merge complete! {result['added']} added, {result['skipped']} skipped.", "success")
        except Exception as e:
            flash(f"Merge failed: {str(e)}", "error")
        return redirect(url_for('admin.index'))