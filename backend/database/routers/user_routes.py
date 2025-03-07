from database import app
from ..controllers import user_controller

@app.route('/create_user', methods=['POST', 'GET'])
def create_user():
    return user_controller.create_user()

@app.route('/read_users', methods=['GET'])
def read_users():
    return user_controller.read_users()

@app.route('/update_user/<id>', methods=['PUT', 'GET'])
def update_user(id):
    return user_controller.update_user(id)

@app.route('/delete_user/<id>', methods=['DELETE'])
def delete_user(id):
    return user_controller.delete_user(id)