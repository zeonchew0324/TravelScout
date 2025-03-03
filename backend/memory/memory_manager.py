import json
from langchain_core.prompts import ChatPromptTemplate

def get_memory_prompt():
    with open("prompts.json", "r") as f:
        prompts = json.load(f)
        template = ChatPromptTemplate.from_template(prompts["travel_memory_prompt"])
        return template
    
def construct_memory_prompt(memory, input):
    prompt_template = get_memory_prompt()
    prompt_template.format(
            formatted_memories=memory,
            user_input=input
    )
    return prompt_template