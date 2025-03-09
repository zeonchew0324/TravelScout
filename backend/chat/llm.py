import json
from dotenv import load_dotenv
import os
from openai import OpenAI
from langchain_deepseek import ChatDeepSeek

# Load environment variables from .env file
load_dotenv('C:\\Users\\jeany\\Desktop\\NUS\\Y2S2\\TravelScout\\.env')

class LLMClient:

    def __init__(self):
        self.url = os.getenv("DEEPSEEK_API_URL")
        self.api_key = os.getenv("DEEPSEEK_API_KEY")

        if not self.api_key or not self.url:
            raise ValueError("Missing API key or endpoint in environment variables.")
        
        self.llm = ChatDeepSeek(
            model="deepseek-chat",
            openai_api_key=self.api_key, 
            openai_api_base=self.url,
        )

    def get_client(self):
        return self.llm
    
    def query(self, prompt):
        # Returns raw responses; specific functionalities implemented in chatbot.py
        messages = [
            {"role": "system", "content": "You are a helpful assistant for a traveling app."},
            {"role": "user", "content": prompt}  # Convert to string for OpenAI API
        ]
        
        try:
            response = self.llm.invoke(messages)  # Use invoke() for Runnable compatibility
            raw_response = response.content
            return raw_response

        except Exception as e:
            print(f"Error querying LLM: {e}")
            return ""  # Return empty string on error (safe fallback)

if __name__ == "__main__":
    client = LLMClient()
    print(client.query("I want to travel to Paris."))
    

