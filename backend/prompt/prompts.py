import sys
import os
sys.path.append(os.path.abspath("../"))
from chat import llm 
from database.controllers import trip_controller, user_controller 
import json
from app import app

def init_prompt(trip):

    # user = "travel style = packed"
    # trip = "destination: Austria\nduration: 7 days\nbudget: 5000"
    
    user = user_controller.read_users()
    trip = trip
    
    info = "You are a helpful assistant for a travelling app. \nBased on the user info below: \n{} \nAnd the travel details below:\n{}"
    instructions = "Assume budget is official currency of the destination. PLEASE USE UP MY BUDGET BUT DO NOT EXCEED. Do not mention 'maximising budget' in final summary. Taking into consideration distances between different locations, come up with a travel plan following this format and the expected cost:\nTravel Plan for Kuala Lumpur, Malaysia\nDay 1: Adventure and Culture\n10:00 AM Batu Caves\nAddress: Gombak, 68100 Batu Caves, Selangor, Malaysia\nDescription: Kick off your trip with a visit to the iconic Batu Caves, a stunning limestone hill featuring a series of caves and Hindu temples. Climb the 272 vibrant steps to reach the main cave, where you’ll be rewarded with breathtaking views and intricate religious shrines. Don’t miss the towering golden statue of Lord Murugan at the entrance—perfect for photos!\nPrice: xxx\n11:00 AM\nTotal Day 1 Cost: "

    format = "Return it in json format only with the fields 'day', 'activities', 'total_day_cost'. Subfields under activities are 'time','name','address','description','price'"
    return info.format(user, trip) + "\n" + instructions + "\n" + format


def view_prompt(trip_id):
    # Fetch the trip data from the controller
    trip_response = trip_controller.read_trip(trip_id)
    
    # Check if it's a Response object and extract JSON content
    try:
        if hasattr(trip_response, 'get_json'):  # Flask Response
            trip_data = trip_response.get_json()
        elif hasattr(trip_response, 'json'):  # requests.Response
            trip_data = trip_response.json()
        else:
            # Assume it's a string and parse it
            trip_data = json.loads(trip_response)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"Error: Could not parse trip data - {e}")
        return ""

    # Extract the trip dictionary, then the itinerary
    trip = trip_data.get("trip", {})
    itinerary = trip.get("itinerary", {})
    if not itinerary:
        print(f"Error: No itinerary found in trip data for trip ID {trip_id}")
        return f"No itinerary available for trip ID {trip_id}"

    info = "You are a helpful assistant for a travelling app."
    instructions = "Assume currency is official currency of the destination, also include the total cost of the trip at the end by adding up all total day costs. Only give the itinerary and no other comments."

    format_str = "\nBased on the itinerary json file, convert it to text following the format below: \n Day X:\n[Time] - [Place]\nAddress:\nDescription:\nPrice:\nTotal Day X Cost:\n"
    
    # Convert itinerary to JSON string for the prompt
    itinerary_json = json.dumps(itinerary)
    
    return info + "\n" + instructions + "\n" + format_str + "\n" + itinerary_json
    

# Function to query AI API
def init_itinerary(trip): #make as json
    ai = llm.LLMClient()
    return ai.queryjson(init_prompt(trip))


def view_itinerary(trip_id): #change to text
    ai = llm.LLMClient()
    return ai.query(view_prompt(trip_id))


def main():
    trip_id = "67d1d86f77c03467ef41808d"  # Ensure this is a valid ObjectId
    
    print(f"Fetching itinerary for trip ID: {trip_id}\n")
    
    try:
        with app.app_context():  # Ensure the Flask application context is active
            itinerary_text = view_itinerary(trip_id)
            print(itinerary_text if itinerary_text else "No itinerary returned")
    except Exception as e:
        print(f"Error retrieving itinerary: {e}")

if __name__ == "__main__":
    main()
