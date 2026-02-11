from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

class Truck(db.Model):
    id = db.Column(db.Integer, primary_key=True)

@app.route("/")
def home():
    return render_template("home.html", title="Home")
@app.route("/helper")
def info():
    return render_template("TruckItemsRaw.html")

if __name__ == "__main__":
    app.run(debug=True)
