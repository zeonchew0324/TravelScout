from database import app
from ..controllers import trip_controller

@app.route('/create_trip', methods=['POST', 'GET'])
def create_trip():
    return trip_controller.create_trip()

@app.route('/read_trips', methods=['GET'])
def read_trips():
    return trip_controller.read_trips()

@app.route('/update_trip/<id>', methods=['PUT', 'GET'])
def update_trip(id):
    return trip_controller.update_trip(id)

@app.route('/delete_trip/<id>', methods=['DELETE'])
def delete_trip(id):
    return trip_controller.delete_trip(id)