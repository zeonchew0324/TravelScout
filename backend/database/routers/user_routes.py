from database import app
from controllers import user_controller

@app.route('/create_trip', methods=['POST', 'GET'])
def create_user():
    return user_controller.create_user()

@app.route('/read_trips', methods=['GET'])
def read_users():
    return user_controller.read_users()

@app.route('/update_trip', methods=['PUT', 'GET'])
def update_user():
    return user_controller.update_user()

@app.route('/delete_trip', methods=['DELETE'])
def delete_user():
    return user_controller.delete_user()