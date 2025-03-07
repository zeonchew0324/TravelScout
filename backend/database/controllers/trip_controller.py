from flask import render_template, request, flash, redirect
from ..forms.trip_form import TripForm
from database import trip_collection
from datetime import datetime
from bson import ObjectId

def create_trip():
    if request.method == 'POST':
        form = TripForm(request.form)
        destination = form.destination.data
        travel_days = form.travel_days.data
        companions = form.companions.data
        budget = form.budget.data

        trip_collection.insert_one({
            'destination': destination,
            'travel_days': travel_days,
            'companions': companions,
            'budget': budget,
            'created_at': datetime.now()
        })
        flash('Trip created successfully!', 'success')
        return redirect('/')    # redirect to home page

    form = TripForm()
    return render_template('create_trip.html', form=form)

def read_trips():
    trips = []
    for trip in trip_collection.find().sort("created_at", -1):
        trip["_id"] = str(trip["_id"])
        trip["created_at"] = trip["created_at"].strftime("%b %d %Y %H:%M:%S")
        trips.append(trip)

    flash("Trip successfully get", "success")
    return render_template("view_trips.html", trips = trips)

def update_trip():
    if request.method == "POST":
        form = TripForm(request.form)
        destination = form.destination.data
        travel_days = form.travel_days.data
        companions = form.companions.data
        budget = form.budget.data

        trip_collection.find_one_and_update({"_id": ObjectId(id)}, {"$set": {
            'destination': destination,
            'travel_days': travel_days,
            'companions': companions,
            'budget': budget,
            'updated_at': datetime.now()
        }})
        flash("Trip successfully updated", "success")
        return redirect("/")

    form = TripForm()

    trip = trip_collection.find_one_or_404({"_id": ObjectId(id)})
    print(trip)
    form.destination.data = trip.get("destination", "")
    form.travel_days.data = trip.get("travel_days", None)
    form.companions.data = trip.get("companions", "")
    form.budget.data = trip.get("budget", 0)

    return render_template("add_trip.html", form = form)

def delete_trip(id):
    trip_collection.find_one_and_delete({"_id": ObjectId(id)})
    flash("Trip successfully deleted", "success")
    return redirect("/")
