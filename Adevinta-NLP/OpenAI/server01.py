
from flask import Flask
from flask import request
from flask import Response
import requests

TOKEN = "7081322194:AAE4pXi1gl6w6TAwUPSTa94mKvHqXvyjfa8"

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        msg = request.get_json()
        m = msg['message']['text']
        id = msg['message']['chat']['id']

        if m == '/start':
            requests.get(f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={id}&text=¡Hola!")
        else:
            requests.get(f"https://api.telegram.org/bot{TOKEN}/sendMessage?chat_id={id}&text=Lo siento, aún no estoy conectado a un LLM.")

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