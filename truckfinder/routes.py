from truckfinder import app
from flask import render_template, url_for


@app.route("/")
def home():
    return render_template("home.html", title="Home")

@app.route('/map')
def map_page():
    return render_template('Map.html')

@app.route('/about')
def about():
    return render_template('About.html')

# This route leads you to Alex's page that he made saying food truck information
@app.route("/helper")
def info():
    return render_template("TruckItemsRaw.html")