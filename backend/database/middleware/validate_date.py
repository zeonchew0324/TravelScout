from wtforms.validators import ValidationError

def validate_to_date(self, field):
  if field.data <= self.from_date.data:
      raise ValidationError("To Date must be after From Date.")
  if (field.data - self.from_date.data).days > 7:
      raise ValidationError("Trip duration cannot exceed 7 days.")
        