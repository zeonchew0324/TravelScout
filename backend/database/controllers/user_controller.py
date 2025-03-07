from flask import render_template, request, flash, redirect
from ..forms.user_form import UserForm
from database import user_collection
from datetime import datetime
from bson import ObjectId

def create_user():
    if request.method == 'POST':
        form = UserForm(request.form)
        memory = form.memory.data

        user_collection.insert_one({'memory': memory, 'created_at': datetime.now()})
        flash('User created successfully!', 'success')
        return redirect('/')    # redirect to home page
    else:
        form = UserForm()
    return render_template('create_memory.html', form=form)

def read_users():
    users = []
    for user in user_collection.find().sort("date_created", -1):
        user["_id"] = str(user["_id"])
        user["created_at"] = user["created_at"].strftime("%b %d %Y %H:%M:%S")
        users.append(user)

    return render_template("view_users.html", users = users)

def update_user():
    if request.method == "PUT":
        form = UserForm(request.form)
        user_name = form.name.data
        user_description = form.description.data
        completed = form.completed.data

        user_collection.find_one_and_update({"_id": ObjectId(id)}, {"$set": {
            "name": user_name,
            "description": user_description,
            "completed": completed,
            "date_created": datetime.now()
        }})
        flash("User successfully updated", "success")
        return redirect("/")
    else:
        form = UserForm()

        user = user_collection.find_one_or_404({"_id": ObjectId(id)})
        print(user)
        form.name.data = user.get("name", None)
        form.description.data = user.get("description", None)
        form.completed.data = user.get("completd", None)

    return render_template("add_user.html", form = form)

def delete_user(id):
    user_collection.find_one_and_delete({"_id": ObjectId(id)})
    flash("User successfully deleted", "success")
    return redirect("/")