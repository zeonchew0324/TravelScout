import sys
import os
from flask import request, flash, jsonify
from ..forms.trip_form import TripForm
from database import trip_collection
from datetime import datetime
from bson import ObjectId
sys.path.append(os.path.abspath("../../"))
from prompt.prompts import init_itinerary
import json 

def create_trip():
    if request.method == 'POST':
        form = TripForm(request.form)
        destination = form.destination.data
        from_date = form.from_date.data
        to_date = form.to_date.data
        companions = form.companions.data
        budget_preference = form.budget_preference.data

        from_datetime = datetime.combine(from_date, datetime.min.time()) if from_date else None
        to_datetime = datetime.combine(to_date, datetime.min.time()) if to_date else None

        trip_data = {
            'destination': destination,
            'from_date': from_datetime,
            'to_date': to_datetime,
            'companions': companions,
            'budget_preference': budget_preference,
            'created_at': datetime.now()
        }

        # Generate itinerary
        itinerary_json = init_itinerary(trip_data)  # AI-generated itinerary
        
        trip_data['itinerary'] = itinerary_json # Store the generated itinerary

        trip_collection.insert_one(trip_data)  # Save trip to DB

        flash('Trip created successfully with AI itinerary!', 'success')
        return jsonify({"success": True, "message": "Trip created successfully!", "itinerary": itinerary_json})

    form = TripForm()
    return jsonify({"success": False, "message": "Invalid request"})

def read_trips():
    trips = []
    for trip in trip_collection.find().sort("created_at", -1):
        trip["_id"] = str(trip["_id"])
        trip["created_at"] = trip["created_at"].strftime("%b %d %Y %H:%M:%S")
        trips.append(trip)

    flash("Trip successfully get", "success")
    return jsonify({"success": True, "message": "Trip read successfully!", "trips": trips})

def update_trip(id):
    if request.method == "PUT":
        form = TripForm(request.form)
        
        update_data = {}
        
        if 'destination' in request.form and form.destination.data is not None:
            update_data['destination'] = form.destination.data
        if 'from_date' in request.form and form.from_date.data is not None:
            from_datetime = datetime.combine(form.from_date.data, datetime.min.time())
            update_data['from_date'] = from_datetime
        if 'to_date' in request.form and form.to_date.data is not None:
            to_datetime = datetime.combine(form.to_date.data, datetime.min.time())
            update_data['to_date'] = to_datetime
        if 'companions' in request.form and form.companions.data is not None:
            update_data['companions'] = form.companions.data
        if 'budget_preference' in request.form and form.budget_preference.data is not None:
            update_data['budget_preference'] = form.budget_preference.data
        if 'itinerary' in request.form and form.itinerary.data is not None:
            update_data['itinerary'] = form.itinerary.data
        
        update_data['updated_at'] = datetime.now()

        if update_data:
            trip_collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_data}
            )
            flash("Trip successfully updated", "success")
            return jsonify({"success": True, "message": "Trip updated successfully!"})

    form = TripForm()

    trip = trip_collection.find_one({"_id": ObjectId(id)})
    if not trip:
        return jsonify({"success": False, "message": "Trip not found"}), 404

    print(trip)
    form.destination.data = trip.get("destination", "")
    form.from_date.data = trip.get("from_date", None)
    form.to_date.data = trip.get("to_date", None)
    form.companions.data = trip.get("companions", "")
    form.budget_preference.data = trip.get("budget_preference", 0)
    form.itinerary.data = trip.get("itinerary", "")

    return jsonify({"success": True, "message": "Trip read successfully!"})

def read_trip(id):
    trip = trip_collection.find_one({"_id": ObjectId(id)})
    if not trip:
        return jsonify({"success": False, "message": "Trip not found"}), 404

    trip["_id"] = str(trip["_id"])
    trip["created_at"] = trip["created_at"].strftime("%b %d %Y %H:%M:%S")
    return jsonify({"success": True, "message": "Trip read successfully!", "trip": trip})

def delete_trip(id):
    trip_collection.find_one_and_delete({"_id": ObjectId(id)})
    flash("Trip successfully deleted", "success")
    return jsonify({"success": True, "message": "Trip deleted successfully!"})

def update_itinerary(id, updated_itinerary_data):
    updated_itinerary = updated_itinerary_data['itinerary']
    trip_collection.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": {"itinerary": updated_itinerary}}
    )
    flash("Trip itinerary successfully updated", "success")
    return jsonify({"success": True, "message": "Trip itinerary updated successfully!"})
