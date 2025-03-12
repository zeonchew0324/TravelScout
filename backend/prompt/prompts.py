from chat import llm
from database.controllers import trip_controller, user_controller
import json

def init_prompt():

    # user = "travel style = packed"
    # trip = "destination: Austria\nduration: 7 days\nbudget: 5000"
    
    user = user_controller.read_users()
    trip = trip_controller.read_trips()
    
    info = "You are a helpful assistant for a travelling app. \nBased on the user info below: \n{} \nAnd the travel details below:\n{}"
    instructions = "Assume budget is official currency of the destination. PLEASE USE UP MY BUDGET BUT DO NOT EXCEED. Do not mention 'maximising budget' in final summary. Taking into consideration distances between different locations, come up with a travel plan following this format and the expected cost:\nTravel Plan for Kuala Lumpur, Malaysia\nDay 1: Adventure and Culture\n10:00 AM Batu Caves\nAddress: Gombak, 68100 Batu Caves, Selangor, Malaysia\nDescription: Kick off your trip with a visit to the iconic Batu Caves, a stunning limestone hill featuring a series of caves and Hindu temples. Climb the 272 vibrant steps to reach the main cave, where you’ll be rewarded with breathtaking views and intricate religious shrines. Don’t miss the towering golden statue of Lord Murugan at the entrance—perfect for photos!\nPrice: xxx\n11:00 AM\nTotal Day 1 Cost: "

    format = "Return it in json format only with the fields 'day', 'activities', 'total_day_cost'. Subfields under activities are 'time','name','address','description','price'"
    return info.format(user, trip) + "\n" + instructions + "\n" + format

def view_prompt():
    trip = json.loads(trip_controller.read_trips())["itinerary"]
    # trip = init_itinerary()

    info = "You are a helpful assistant for a travelling app."
    instructions = "Assume currency is official currency of the destination, also include the total cost of the trip at the end by adding up all total day costs. Only give the itinerary and no other comments."

    format = "\nBased on the itinerary json file, convert it to text following the format below: \n Day X:\n[Time] - [Place]\nAddress:\nDescription:\nPrice:\nTotal Day X Cost:\n"
    return info + "\n" + instructions + "\n" + format + "\n" + trip
    


# Function to query AI API
def init_itinerary(): #make as json
    ai = llm.LLMClient()
    return ai.query(init_prompt())


def view_itinerary(): #change to text
    ai = llm.LLMClient()
    return ai.query(view_prompt())


