from flask import request, flash, jsonify
from ..forms.user_form import UserPreferencesForm
from database import user_collection
from datetime import datetime
from bson import ObjectId

def create_user():
    if request.method == 'POST':
        form = UserPreferencesForm(request.form)
        travel_style = form.travel_style.data
        dietary_restriction = form.dietary_restriction.data
        other_preferences = form.other_preferences.data

        user_collection.insert_one({
            'travel_style': travel_style,
            'dietary_restriction': dietary_restriction,
            'other_preferences': other_preferences,
            'created_at': datetime.now()
        })
        flash('User created successfully!', 'success')
        return jsonify({"success": True, "message": "User created successfully!"})

    form = UserPreferencesForm()
    return jsonify({"success": True, "message": "User read successfully!"})

def read_users():
    users = []
    for user in user_collection.find().sort("created_at", -1):
        user["_id"] = str(user["_id"])
        user["created_at"] = user["created_at"].strftime("%b %d %Y %H:%M:%S")
        users.append(user)

    return jsonify({"success": True, "message": "User read successfully!", "users": users})

def update_user(id):
    if request.method == "PUT":
        form = UserPreferencesForm(request.form)
        
        update_data = {}
        
        if 'travel_style' in request.form and form.travel_style.data is not None:
            update_data['travel_style'] = form.travel_style.data
        if 'dietary_restriction' in request.form and form.dietary_restriction.data is not None:
            update_data['dietary_restriction'] = form.dietary_restriction.data
        if 'other_preferences' in request.form and form.other_preferences.data is not None:
            update_data['other_preferences'] = form.other_preferences.data
        
        update_data['updated_at'] = datetime.now()

        if update_data:
            user_collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data}
            )
            flash("User successfully updated", "success")
            return jsonify({"success": True, "message": "User updated successfully!"})

    form = UserPreferencesForm()

    user = user_collection.find_one({"_id": ObjectId(id)})
    print(user)
    form.travel_style.data = user.get("travel_style", "")
    form.dietary_restriction.data = user.get("dietary_restriction", None)
    form.other_preferences.data = user.get("other_preferences", None)

    return jsonify({"success": True, "message": "User read successfully!"})

def delete_user(id):
    user_collection.find_one_and_delete({"_id": ObjectId(id)})
    flash("User successfully deleted", "success")
    return jsonify({"success": True, "message": "User deleted successfully!"})