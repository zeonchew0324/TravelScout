from flask import Flask
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
uri = os.getenv('MONGO_URI')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# setup mongodb
mongodb_client = MongoClient(uri)
db = mongodb_client.travelscout
user_collection = db.users
trip_collection = db.trips

# Test the connection
try:
    mongodb_client.server_info()  # Check if MongoDB is reachable
    print("MongoDB connection successful")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    
from .routers import trip_routes
from .routers import user_routes