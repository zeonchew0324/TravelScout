from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired

class TripForm(FlaskForm):
    memory = TextAreaField('Memory', validators=[DataRequired()])
    submit = SubmitField('Create Memory')