# Clase para almacenar los datos de una conversación de un usuario con un bot vía Telegram.

class User:
    def __init__(self, id):
        self.id = id
        self.messages = [
             {"role": "system", "content": "Eres un asistente virtual que puede responder preguntas y ayudar a los usuarios a encontrar información."}
        ]

    def add_message(self, message):
        self.messages.append(message)

    def __str__(self):
        return f" ({self.id})"
