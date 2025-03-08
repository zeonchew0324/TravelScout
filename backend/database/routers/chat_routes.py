from flask import Flask, request  # Import request from Flask
from database import app
from ..controllers import chat_controller

@app.route('/chat/create', methods=['POST'])
def create_chat():
    return chat_controller.create_chat()

@app.route('/chat/message/<id>', methods=['POST'])
def send_message(id):
    return chat_controller.send_message(id, request)  # Pass the request object

@app.route('/chat/history/<id>', methods=['GET'])
def get_chat_history(id):  # Fixed parameter name to match the route
    return chat_controller.get_chat_history(id)

@app.route('/chat/delete/<id>', methods=['DELETE'])
def delete_chat(id):  # Fixed parameter name to match the route
    return chat_controller.delete_chat(id)