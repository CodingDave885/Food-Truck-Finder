from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField, SubmitField, PasswordField
from wtforms.validators import DataRequired

class FoodTruckForm(FlaskForm):
    name = StringField('Truck Name', validators=[DataRequired()])
    latitude = HiddenField(validators=[DataRequired()])
    longitude = HiddenField(validators=[DataRequired()])
    submit = SubmitField('Submit')
"""
David Liberatore
5/8/2026
This Login Form is used to get the username and password entered by the user
"""
class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password",validators=[DataRequired()])
    submit = SubmitField("Login")
