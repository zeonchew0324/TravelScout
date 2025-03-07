from database import app
from controllers import trip_controller

@app.route('/create_trip', methods=['POST', 'GET'])
def create_trip():
    return trip_controller.create_trip()

@app.route('/read_trips', methods=['GET'])
def read_trips():
    return trip_controller.read_trips()

@app.route('/update_trip', methods=['PUT', 'GET'])
def update_trip():
    return trip_controller.update_trip()

@app.route('/delete_trip', methods=['DELETE'])
def delete_trip():
    return trip_controller.delete_trip()