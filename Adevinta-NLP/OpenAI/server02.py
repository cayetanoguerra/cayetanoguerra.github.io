
from flask import Flask
from flask import request
from flask import Response
import requests
import users_manager
import bot

TOKEN = "7081322194:AAE4pXi1gl6w6TAwUPSTa94mKvHqXvyjfa8"

app = Flask(__name__)

um = users_manager.UsersManager()
bot = bot.Bot()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        msg = request.get_json()
        m = msg['message']['text']
        id = msg['message']['chat']['id']

        user = um.get_user(id)  # Recogemos el usuario que envía el mensaje. Si no existe, lo creamos.

        if m == '/start':
            welcome_message = "¡Hola! ¿Cómo puedo ayudarte?"
            requests.get(f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={id}&text={welcome_message}")
            user.add_message({"role": "assistant", "content": welcome_message})
        else:
            user.add_message({"role": "user", "content": m})
            response = bot.chat(user.messages)
            user.add_message({"role": "assistant", "content": response})
            requests.get(f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={id}&text={response}")

        return Response('ok', status=200)
    else:
        return "<h1>Bienvenido!</h1>"


@app.route("/setwebhook/")
def setwebhook():
    s = requests.get("https://api.telegram.org/bot7081322194:AAE4pXi1gl6w6TAwUPSTa94mKvHqXvyjfa8/setWebhook?url=https://5648-88-25-81-68.ngrok-free.app")
  
    if s.ok:
        return "Success"
    else:
        return "Fail"
