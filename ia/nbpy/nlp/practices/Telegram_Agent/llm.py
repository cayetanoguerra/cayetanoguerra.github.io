import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class LLM:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.active_users = {}

        # Open a text file with the prompt
        with open("prompt.txt", "r") as file:
            self.prompt = file.read()
        

    def chat(self, id, text):
        # Check if user is new
        if id not in self.active_users:
            self.active_users[id] = {"messages": [
                {
                    "role": "system",
                    "content": self.prompt
                }   
            ]}

        # Add user message
        self.active_users[id]["messages"].append({"role": "user", "content": text})

        # Get bot response
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=self.active_users[id]["messages"],
            temperature=1,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        # Add bot message
        bot_response = response.choices[0].message.content
        self.active_users[id]["messages"].append({"role": "assistant", "content": bot_response})

        return bot_response