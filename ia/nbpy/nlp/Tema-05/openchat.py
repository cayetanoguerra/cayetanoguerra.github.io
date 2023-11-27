from transformers import pipeline

generator = pipeline("text-generation", model="openchat/openchat_3.5")
generator("Dime cuánto es dos más dos.")