# forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Optional

class UserPreferencesForm(FlaskForm):
    travel_style = SelectField(
        'Travel Style',
        choices=[
            ('Relaxation', 'Relaxation'),
            ('Adventure', 'Adventure'),
            ('Culture', 'Culture'),
            ('Foodie', 'Foodie')
        ],
        validators=[DataRequired(message="Please select a travel style.")]
    )
    dietary_restriction = StringField(
        'Dietary Restriction',
        validators=[
            Optional(),  # Allows empty input
            Length(max=100, message="Dietary restriction must be less than 100 characters.")
        ]
    )
    other_preferences = StringField(
        'Other Preferences',
        validators=[
            Optional(),
            Length(max=500, message="Other preferences must be less than 500 characters.")
        ]
    )
    submit = SubmitField('Save Preferences')