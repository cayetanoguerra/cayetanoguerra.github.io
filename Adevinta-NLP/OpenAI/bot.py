from openai import OpenAI

class Bot:
    def __init__(self):
        pass

    def chat(self, messages):
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )
        return response.choices[0].message.content