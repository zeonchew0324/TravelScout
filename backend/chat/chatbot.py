from asyncio import Queue
from llm import LLMClient
from ..memory.memory_manager import construct_memory_prompt

class Chatbot():
    def __init__(self):
        self.llm = LLMClient()

    def get_response(self, prompt):
        pass