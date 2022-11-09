from flask import Flask
from flask import render_template, url_for

app = Flask(__name__)

@app.route("/")
def nn():
    return render_template('app.html')

@app.route("/render")
def render():
    return render_template('render.html')

@app.route("/inter")
def inter():
    return render_template('inter.html')

@app.route("/canvas")
def canvas():
    return render_template('canvas.html')

@app.route("/image")
def image():
    return render_template('image.html')

@app.route("/panel")
def panel():
    return render_template('canvas.html')

@app.route("/neural")
def neural():
    return render_template('neural.html')