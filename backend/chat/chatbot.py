from llm import LLMClient
from langchain.schema import HumanMessage, SystemMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
import json
from datetime import datetime

# Define the prompt template as a raw string
prompt_base = """
You are a travel assistant bot. You assist users with their travel itinerary and maintain a memory of their preferences for personalized responses.

Current Itinerary: 

Memory (up to 15 preferences): 

User Query: 

The itinerary is a JSON object: {"flights": [{"departure": "City A", "arrival": "City B", "date": "YYYY-MM-DD", "time": "HH:MM"}], "hotels": [{"name": "Hotel Name", "check_in": "YYYY-MM-DD", "check_out": "YYYY-MM-DD"}], "activities": [{"date": "YYYY-MM-DD", "time": "HH:MM", "description": "Activity Description"}]}

The memory is a JSON array of user preferences: [{"type": "preference_type", "value": "preference_value", "timestamp": "YYYY-MM-DDTHH:MM:SS"}] sorted by timestamp (oldest first), e.g., [{"type": "diet", "value": "vegetarian", "timestamp": "2023-08-10T10:00:00"}].

Instructions:
- Analyze the user query using the itinerary and memory. If the query requires an itinerary update (e.g., adding an activity, changing a flight), set update_itinerary_flag to true and provide the updated itinerary in JSON format, keeping the same structure. Otherwise, set update_itinerary_flag to false.
- If the query indicates a new preference (e.g., "I prefer budget hotels" or "Im vegetarian"), update the memory with the new preference, set update_memory_flag to true, and remove the oldest preference if memory has 15 entries. The new entry should be: {"type": "{preference_type}", "value": "{preference_value}", "timestamp": "current timestamp"}.
- If the query is vague (e.g., "Add a restaurant" without details), ask for clarification and set update_itinerary_flag to false.
- If the query needs external data (e.g., flight availability), use a placeholder (e.g., "Requested earlier flight") in the updated itinerary, set update_itinerary_flag to true, and inform the user the change is processing.
- Tailor responses using the user's preferences from memory where relevant (e.g., suggest vegetarian options if "diet": "vegetarian" is in memory).
- Provide clear, concise responses addressing the user's intent in a valid JSON object with fields: "response", "update_itinerary_flag", "updated_itinerary", "update_memory_flag", and "updated_memory".

Examples:
1. Query: "What time is my flight to London?" Output: {"response": "Your flight to London is at 2:00 PM on August 10th.", "update_itinerary_flag": false, "updated_itinerary": {}, "update_memory_flag": false, "updated_memory": []}
2. Query: "I prefer budget hotels." Output: {"response": "Noted! Ill prioritize budget hotels for your trip.", "update_itinerary_flag": false, "updated_itinerary": {}, "update_memory_flag": true, "updated_memory": [{"type": "accommodation", "value": "budget", "timestamp": "2025-03-08T12:00:00"}]}
3. Query: "Add a visit to the Louvre on August 12th at 3:00 PM." Output: {"response": "I've added a visit to the Louvre on August 12th at 3:00 PM.", "update_itinerary_flag": true, "updated_itinerary": {"flights": [], "hotels": [], "activities": [{"date": "2023-08-12", "time": "15:00", "description": "Visit to the Louvre"}]}, "update_memory_flag": false, "updated_memory": []}

Output Format: {"response": "Your response", "update_itinerary_flag": true/false, "updated_itinerary": { ... } / {}, "update_memory_flag": true/false, "updated_memory": [{ ... }]}
Important: Respond only in the specified JSON format. Do not include additional text.
"""

class Chatbot:
    def __init__(self):
        self.llm = LLMClient().get_client()
        self.memory = ChatMessageHistory()

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
            itinerary = prompt.get("itinerary", {"flights": [], "hotels": [], "activities": []})
            memory = prompt.get("memory", [])  # List of preferences
            user_query = prompt.get("user_query", "")

            # Debug: Print formatted prompt before sending to LLM
            formatted_prompt = (
                prompt_base.replace("Current Itinerary: ", f"Current Itinerary: {json.dumps(itinerary)}\n\n")
                .replace("Memory (up to 15 preferences): ", f"Memory (up to 15 preferences): {json.dumps(memory)}\n\n")
                .replace("User Query: ", f"User Query: {user_query}\n\n")
            )

            # Run the chain with the input data
            response = self.chain.invoke({
                "itinerary": itinerary,
                "memory": memory,
                "user_query": user_query
            })

            # Ensure the response is a dictionary
            if not isinstance(response, dict):
                return {"error": "Invalid response format from AI"}

            # Update memory if needed (handled by the LLM per the prompt)
            if response.get("update_memory_flag", False):
                new_memory = response["updated_memory"]
                self.memory.add_message(SystemMessage(content=json.dumps(new_memory)))

            return response

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw response causing error: {response.content if hasattr(response, 'content') else 'No response captured'}")
            return {"error": f"Invalid JSON response from AI: {str(e)}"}
        except Exception as e:
            print(f"General Error: {str(e)}")
            return {"error": f"Error in get_response: {str(e)}"}

# Example usage
if __name__ == "__main__":
    bot = Chatbot()
    prompt_data = {
        "itinerary": {"flights": [{"departure": "New York", "arrival": "London", "date": "2023-08-10", "time": "14:00"}], "hotels": [], "activities": []},
        "memory": [],
        "user_query": "I prefer budget hotels. Can you also change my trip to Paris?"
    }
    response = bot.get_response(prompt_data)
    print(response)