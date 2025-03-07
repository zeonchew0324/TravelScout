import json
from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from .env file
load_dotenv('C:\\Users\\jeany\\Desktop\\NUS\\Y2S2\\TravelScout\\.env')

class LLMClient:

    def __init__(self):
        self.url = os.getenv("DEEPSEEK_API_URL")
        self.api_key = os.getenv("DEEPSEEK_API_KEY")

        if not self.api_key or not self.url:
            raise ValueError("Missing API key or endpoint in environment variables.")
        
        self.llm = OpenAI(api_key=self.api_key, base_url=self.url)

    def get_client(self):
        return self.llm
    
    def query(self, prompt):
        # ONLY RETURNS RAW RESPONSES, SPECIFIC FUNCTIONALITIES IMPLEMENTED IN chatbot.py

        messages = [
            {"role": "system", "content": "You are a helpful assistant for a traveling app."},
            {"role": "user", "content": prompt}  # Convert to string for OpenAI API
        ]
        
        # Send the request to the LLM 
        try:
            response = self.llm.chat.completions.create(
                model="deepseek-chat",  # Adjust model name based on DeepSeek's API
                messages=messages,
                temperature=0.7         # Adjust for creativity/control
            )

            # Extract the response content (assuming it’s JSON)
            raw_response = response.choices[0].message.content
            return raw_response

        except Exception as e:
            print(f"Error querying LLM: {e}")
            return []  # Return empty list on error (safe fallback)
        

if __name__ == "__main__":
    client = LLMClient()
    print(client.query("I want to travel to Paris."))
    

