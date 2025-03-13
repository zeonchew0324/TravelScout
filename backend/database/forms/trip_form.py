from flask_wtf import FlaskForm
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, DateField, SubmitField, HiddenField
from wtforms.validators import DataRequired, Length

class TripForm(FlaskForm):
    # Travel destination (text input)
    destination = StringField(
        'Travel Destination',
        validators=[
            DataRequired(message="Please enter a destination."),
            Length(max=100, message="Destination must be less than 100 characters.")
        ]
    )
    
    from_date = DateField(
        'From Date',
        format='%Y-%m-%d',  # Expect input like "2025-03-10"
        validators=[DataRequired(message="Please select a start date.")]
    )

    to_date = DateField(
        'To Date',
        format='%Y-%m-%d',
        validators=[DataRequired(message="Please select an end date.")]
    )
    
    # Travel companions (dropdown for Solo, Partner, Friends, Family)
    companions = SelectField(
        'Travel Companions',
        choices=[
            ('Alone', 'Solo'),
            ('Partner', 'Partner'),
            ('Friends', 'Friends'),
            ('Family', 'Family')
        ],
        validators=[DataRequired(message="Please select who you’re traveling with.")]
    )
    
    # Budget preference (dropdown with predefined ranges)
    budget_preference = SelectField(
        'Budget Preference ($)',
        choices=[
            ('0-500', '0 - 500'),
            ('500-1000', '500 - 1000'),
            ('1000-2000', '1000 - 2000'),
            ('2000+', '2000+')
        ],
        validators=[DataRequired(message="Please select a budget range.")]
    )

    itinerary = HiddenField(
        'itinerary',
        default=None
    )
    
    # Submit button
    submit = SubmitField('Create Trip')