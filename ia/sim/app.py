from flask import Flask
from flask import render_template


app = Flask(__name__)

@app.route("/")
def app():
    return render_template('app.html')