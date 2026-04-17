from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField, SubmitField
from wtforms.validators import DataRequired

class FoodTruckForm(FlaskForm):
    name = StringField('Truck Name', validators=[DataRequired()])
    latitude = HiddenField(validators=[DataRequired()])
    longitude = HiddenField(validators=[DataRequired()])
    submit = SubmitField('Submit')
