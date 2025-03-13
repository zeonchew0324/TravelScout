from llm import LLMClient
import sys
import os
sys.path.append(os.path.abspath("../"))
from database.controllers import trip_controller
from langchain.schema import HumanMessage, SystemMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import json
from datetime import datetime
from app import app
from flask import g, request_started

# Define the prompt template as a raw string
prompt_base = """
You are a travel assistant bot. You assist users with their travel itinerary and maintain a memory of their preferences for personalized responses.

Current Itinerary: 

Memory (up to 15 preferences): 

User Query: 

The itinerary is a JSON object: {"activities": [{"address": "Activity Location", "description": "Brief activity description...", "name": "Activity Name", "price": Price_in_Currency, "time": "HH:MM AM/PM"}], "day": Day_Number, "total_day_cost": Total_Cost_for_the_Day}

The memory is a JSON array of user preferences: [{"type": "preference_type", "value": "preference_value", "timestamp": "YYYY-MM-DDTHH:MM:SS"}] sorted by timestamp (oldest first), e.g., [{"type": "diet", "value": "vegetarian", "timestamp": "2023-08-10T10:00:00"}].

Instructions:
- Analyze the user query using the itinerary and memory. If the query requires an itinerary update (e.g., adding an activity, changing a flight), set update_itinerary_flag to true and provide the updated itinerary in JSON format, keeping the same structure. Otherwise, set update_itinerary_flag to false.
- If the query indicates a new preference (e.g., "I prefer budget hotels" or "Im vegetarian"), update the memory with the new preference, set update_memory_flag to true, and remove the oldest preference if memory has 15 entries. The new entry should be: {"type": "{preference_type}", "value": "{preference_value}", "timestamp": "current timestamp"}.
- If the query is vague (e.g., "Add a restaurant" without details), ask for clarification and set update_itinerary_flag to false.
- If the query needs external data (e.g., flight availability), use a placeholder (e.g., "Requested earlier flight") in the updated itinerary, set update_itinerary_flag to true, and inform the user the change is processing.
- Tailor responses using the user's preferences from memory where relevant (e.g., suggest vegetarian options if "diet": "vegetarian" is in memory).
- Provide clear, concise responses addressing the user's intent in a valid JSON object with fields: "response", "update_itinerary_flag", "updated_itinerary", "update_memory_flag", and "updated_memory".

IMPORTANT: For major changes like changing destination (e.g., "change my trip to Paris"), completely replace the existing itinerary with a new one containing at least 1-2 suggested activities for the new destination. Never return an empty activities list when update_itinerary_flag is true.

Examples:
1. Query: "What time is my flight to London?" 
Output: {"response": "Your flight to London is at 2:00 PM on August 10th.", "update_itinerary_flag": false, "updated_itinerary": {}, "update_memory_flag": false, "updated_memory": []}

2. Query: "I prefer budget hotels." 
Output: {"response": "Noted! I'll prioritize budget hotels for your trip.", "update_itinerary_flag": false, "updated_itinerary": {}, "update_memory_flag": true, "updated_memory": [{"type": "accommodation", "value": "budget", "timestamp": "2025-03-08T12:00:00"}]}

3. Query: "Add a visit to the Louvre on August 12th at 3:00 PM." 
Output: {"response": "I've added a visit to the Louvre on August 12th at 3:00 PM.", "update_itinerary_flag": true, "updated_itinerary": {"activities": [{"address": "Rue de Rivoli, 75001 Paris, France", "description": "Visit to the world-famous Louvre Museum to see the Mona Lisa and other masterpieces", "name": "Louvre Museum Visit", "price": 15.00, "time": "3:00 PM"}], "day": 1, "total_day_cost": 15.00}, "update_memory_flag": false, "updated_memory": []}

4. Query: "I prefer budget hotels. Can you also change my trip to Paris?"
Output: {"response": "Noted! I'll prioritize budget hotels for your trip and have updated your itinerary to Paris with some budget-friendly attractions.", "update_itinerary_flag": true, "updated_itinerary": {"activities": [{"address": "5 Avenue Anatole France, 75007 Paris, France", "description": "Visit the iconic Eiffel Tower, the most famous landmark in Paris", "name": "Eiffel Tower Visit", "price": 25.50, "time": "10:00 AM"}, {"address": "Rue de Rivoli, 75001 Paris, France", "description": "Explore the world's largest art museum housing famous works like the Mona Lisa", "name": "Louvre Museum", "price": 17.00, "time": "2:00 PM"}], "day": 1, "total_day_cost": 42.50}, "update_memory_flag": true, "updated_memory": [{"type": "accommodation", "value": "budget", "timestamp": "2025-03-08T12:00:00"}]}

Output Format: {"response": "Your response", "update_itinerary_flag": true/false, "updated_itinerary": { ... } / {}, "update_memory_flag": true/false, "updated_memory": [{ ... }]}
Important: Respond only in the specified JSON format. Do not include additional text.
"""

class Chatbot:
    def __init__(self):
        self.llm = LLMClient().get_client()
        self.message_history = ChatMessageHistory()
        self.current_itinerary = {"activities": [], "day": 1, "total_day_cost": 0}
        self.preferences_memory = []

        self.chain = (
            RunnablePassthrough.assign(
                formatted_prompt=RunnableLambda(
                    lambda x: (
                        prompt_base.replace("Current Itinerary: ", f"Current Itinerary: {json.dumps(x['itinerary'])}\n\n")
                        .replace("Memory (up to 15 preferences): ", f"Memory (up to 15 preferences): {json.dumps(x['memory'])}\n\n")
                        .replace("User Query: ", f"User Query: {x['user_query']}\n\n")
                    )
                )
            )
            | RunnableLambda(lambda x: [
                SystemMessage(content=x["formatted_prompt"]),
                HumanMessage(content=x["user_query"])
            ])
            | self.llm
            | RunnableLambda(lambda x: json.loads(x.content))
        )

    def get_response(self, prompt):
        try:
            # Extract input data
            itinerary = prompt.get("itinerary", self.current_itinerary)
            memory = prompt.get("memory", self.preferences_memory)
            user_query = prompt.get("user_query", "")

            # Debug: Print formatted prompt before sending to LLM
            formatted_prompt = (
                prompt_base.replace("Current Itinerary: ", f"Current Itinerary: {json.dumps(itinerary)}\n\n")
                .replace("Memory (up to 15 preferences): ", f"Memory (up to 15 preferences): {json.dumps(memory)}\n\n")
                .replace("User Query: ", f"User Query: {user_query}\n\n")
            )
            
            # Add current time for new memory entries
            current_time = datetime.now().isoformat()

            # Run the chain with the input data
            response = self.chain.invoke({
                "itinerary": itinerary,
                "memory": memory,
                "user_query": user_query,
                "current_time": current_time
            })

            # Ensure the response is a dictionary
            if not isinstance(response, dict):
                return {"error": "Invalid response format from AI"}

            # Update memory if needed
            if response.get("update_memory_flag", False) and response.get("updated_memory"):
                self.preferences_memory = response["updated_memory"]
                
            # Update itinerary if needed - with validation
            if response.get("update_itinerary_flag", False) and response.get("updated_itinerary"):
                # Check if the itinerary has meaningful content
                if "activities" in response["updated_itinerary"] and len(response["updated_itinerary"]["activities"]) > 0:
                    self.current_itinerary = response["updated_itinerary"]
                else:
                    # If it's empty but should be updated, add a note
                    return {
                        "error": "The LLM returned an empty itinerary. Please try again with more specific instructions.",
                        "original_response": response
                    }

            # Store the interaction in message history
            self.message_history.add_user_message(user_query)
            self.message_history.add_ai_message(json.dumps(response))

            return response

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw response causing error: {response.content if hasattr(response, 'content') else 'No response captured'}")
            return {"error": f"Invalid JSON response from AI: {str(e)}"}
        except Exception as e:
            print(f"General Error: {str(e)}")
            return {"error": f"Error in get_response: {str(e)}"}

    def update_trip_itinerary(self, trip_id, user_query):
        """Update a trip's itinerary based on user query"""
        # Get the current trip
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
            
        # Parse the current itinerary
        try:
            trip = trip_data.get("trip", {})
            current_itinerary = trip.get("itinerary", {})
            if not current_itinerary:
                print(f"Error: No itinerary found in trip data for trip ID {trip_id}")
                return f"No itinerary available for trip ID {trip_id}"
        except json.JSONDecodeError:
            current_itinerary = {"activities": [], "day": 1, "total_day_cost": 0}
            
        # Get user preferences from trip data
        preferences = []
            
        # Create prompt data
        prompt_data = {
            "itinerary": current_itinerary,
            "memory": preferences,
            "user_query": user_query
        }
        
        # Get response from LLM
        response = self.get_response(prompt_data)
        
        # Check for errors
        if "error" in response:
            return {"success": False, "message": response["error"]}
            
        # Update the trip if itinerary was updated
        if response.get("update_itinerary_flag", False):
            updated_itinerary = response.get("updated_itinerary", {})
            
            # Update the trip in the database
            updated_itinerary_data = {"itinerary": updated_itinerary}
            updated_trip = trip_controller.update_itinerary(trip_id, updated_itinerary_data)
            
            if updated_trip:
                return {
                    "success": True, 
                    "message": "Itinerary updated successfully",
                    "response": response["response"],
                    "updated_itinerary": updated_itinerary
                }
            else:
                return {"success": False, "message": "Failed to update trip in database"}
        else:
            # No updates needed but response is valid
            return {
                "success": True,
                "message": "No updates to itinerary required",
                "response": response["response"]
            }

# Example usage
if __name__ == "__main__":
    bot = Chatbot()
    trip_id = "67d1d86f77c03467ef41808d"
    user_query = "I prefer budget hotels. Can you also change my trip to Paris?"

    try:
        with app.app_context():
            # Create a test request context
            with app.test_request_context('/'):
                # Signal the request started event to initialize extensions
                request_started.send(app)
                
                # Now run your code that needs request context
                itinerary_text = bot.update_trip_itinerary(trip_id, user_query)
                print(itinerary_text if itinerary_text else "No itinerary returned")
            
    except Exception as e:
        print(f"Error updating itinerary: {e}")

    
