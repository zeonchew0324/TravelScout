import uuid
from flask import request, flash, jsonify
from ..forms.trip_form import TripForm
from database import trip_collection
from datetime import datetime
from bson import ObjectId
from chat import Chat, Message
from database import chat_history_collection

WELCOME_MESSAGE = "Hello! I'm your travel assistant. How can I help you today? (e.g., suggest a destination, plan a trip, or answer travel questions)"

def create_chat():
    session_id = str(uuid.uuid4())
    chat = Chat(session_id=session_id, messages=[Message(sender='bot', content=WELCOME_MESSAGE)])

    chat_history_collection.insert_one(chat.to_database_format())

    return jsonify({
        "status": "success",
        "session_id": session_id,
        "message": "Chat created successfully!"
    }), 200

def send_message(session_id, request):  # Add request as a parameter
    # Step 1: Validate session ID and fetch existing chat
    chat_json = chat_history_collection.find_one({'session_id': session_id})
    if not chat_json:
        return jsonify({"error": "Invalid session ID"}), 404

    # Step 2: Extract the user's message from the request
    if not request.json or 'content' not in request.json:
        return jsonify({"error": "Message content is required"}), 400
    
    user_message_content = request.json['content']

    # Step 3: Reconstruct the Chat object from the database
    messages = [
        Message(sender=msg['sender'], content=msg['content'], timestamp=msg['timestamp'])
        for msg in chat_json['messages']
    ]
    chat = Chat(session_id=chat_json['session_id'], messages=messages)

    # Step 4: Add the user's message to the conversation
    user_message = Message(sender='user', content=user_message_content)
    chat.messages.append(user_message)

    # Step 5: Generate a bot response (placeholder for AI or rule-based logic)
    bot_response_content = "DUMMY"
    bot_message = Message(sender='bot', content=bot_response_content)
    chat.messages.append(bot_message)

    # Step 6: Update the database with the new conversation state
    chat_history_collection.update_one(
        {'session_id': session_id},
        {'$set': chat.to_database_format()}
    )

    # Step 7: Return the bot's response and updated conversation history
    return jsonify({
        "status": "success",
        "response": bot_response_content,
        "history": [
            {"role": msg.sender, "message": msg.content, "timestamp": msg.timestamp}
            for msg in chat.messages
        ]
    }), 200

def get_chat_history(session_id):
    chat_json = chat_history_collection.find_one({'session_id': session_id})
    if not chat_json:
        return jsonify({"error": "Invalid session ID"}), 404

    messages = [
        {"role": msg['sender'], "message": msg['content'], "timestamp": msg['timestamp']}
        for msg in chat_json['messages']
    ]

    return jsonify({
        "status": "success",
        "history": messages
    }), 200

def delete_chat(session_id):
    result = chat_history_collection.delete_one({'session_id': session_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Invalid session ID"}), 404

    return jsonify({
        "status": "success",
        "message": "Chat deleted successfully!"
    }), 200