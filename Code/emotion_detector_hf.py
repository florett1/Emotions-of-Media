# very simple local flask server to run the emotion detection model
# needed because I wanted to host the model locally to avoid rate limits/tokens on HF
# model only supported in python, so can't be run directly in p5.js sketch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# load model once
model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

# endpoint to analyze emotion
# uses pre-trained HF model "j-hartmann/emotion-english-distilroberta-base"
@app.route("/emotion", methods=["POST"])
def analyze_emotion():
    data = request.get_json()
    
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    # limit text length to 500 characters, models limit is 512 chars so this is just to be safe
    text = data["text"][:500]
    result = model(text)

    # the model returns an unordered object with the emotions, thanks for that
    return jsonify({"emotion": result})

# run the dang thing
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
