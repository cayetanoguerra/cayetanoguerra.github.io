from flask import Flask, request, Response
import requests
import llm

# NGROK
NGROK_URL = "https://6906267213b0.ngrok-free.app"

TELEGRAM_TOKEN = "8348497260:AAHHV9Svn97B4p7ZkhjftKz0X92jch25JKk"

# Telegram credentials

app = Flask(__name__)

chatbot = llm.LLM()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


#******************************************************************************
#
#     TELEGRAM
#
#******************************************************************************

@app.route("/telegram", methods=['GET', 'POST'])
def reply_telegram():
    if request.method == 'POST':
        
        msg = request.get_json()
        # Check if the message is edited
        if 'message' in msg:
            m = msg['message']['text']
            id = msg['message']['chat']['id']
        else:
            m = msg['edited_message']['text']
            id = msg['edited_message']['chat']['id']

        if m == '/start':
            requests.get(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage?chat_id={id}&text=¡Hola!")
        else:
            response = chatbot.chat(id, m)
            requests.get(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage?chat_id={id}&text={response}")

        return Response('ok', status=200)
    else:
        return "<h1>Bienvenido!</h1>"
    

@app.route("/telegram/setwebhook/")
def setwebhook():
    s = requests.get(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/setWebhook?url={NGROK_URL}/telegram")
    if s.ok:
        return "Success"
    else:
        return "Fail"
    


if __name__ == "__main__":
  app.run()