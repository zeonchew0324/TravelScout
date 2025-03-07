from database import app
from flask import render_template, request, flash, redirect
from .forms.user_form import UserForm
from database import collection
from datetime import datetime

@app.route('/')
def home():
    return render_template('view_memories.html', title='Home Page')

@app.route('/create_memory', methods=['POST', 'GET'])
def create_memory():
    if request.method == 'POST':
        form = UserForm(request.form)
        memory = form.memory.data

        collection.insert_one({'memory': memory, 'created_at': datetime.now()})
        flash('Memory created successfully!', 'success')
        return redirect('/')    # redirect to home page
    else:
        form = UserForm()
    return render_template('create_memory.html', form=form)

@app.route('/read_memories', methods=['GET'])
def read_memories():
    return "Memories read!"

@app.route('/update_memory', methods=['PUT'])
def update_memory():
    return "Memory updated!"

@app.route('/delete_memory', methods=['DELETE'])
def delete_memory():
    return "Memory deleted!"