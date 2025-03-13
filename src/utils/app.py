import random
import pickle
import sys
import os
from flask import Flask, request, jsonify
from preprocessing import clean_text, tokenize_text  
import nltk
nltk.download('punkt')
nltk.download('wordnet')


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)


try:
    with open('C:/Users/21693/Desktop/blasti/backend/src/utils/model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)

    with open('C:/Users/21693/Desktop/blasti/backend/src/utils/vectorizer.pkl', 'rb') as vectorizer_file:
        vectorizer = pickle.load(vectorizer_file)

    with open('C:/Users/21693/Desktop/blasti/backend/src/utils/responses.pkl', 'rb') as responses_file:
        responses = pickle.load(responses_file)

    print("Loaded responses:", responses)  
except FileNotFoundError as e:
    print(f"Error loading files: {e}")
    exit(1)
    

def get_response(intent):
    """Function to get a random response based on the predicted intent"""
    if intent in responses:
        response_list = responses[intent]
        return random.choice(response_list)
    else:
        return "Sorry, I don't understand that."

def predict_intent(user_input):
    """Predict the intent (category) of the user's input"""
    cleaned_input = clean_text(user_input)
    tokenized_input = ' '.join(tokenize_text(cleaned_input))  

    vectorized_input = vectorizer.transform([tokenized_input])

    predicted_intent = model.predict(vectorized_input)[0]
    
    return predicted_intent

@app.route('/predict', methods=['POST'])
def predict():
    user_input = request.json.get('user_input')

    predicted_intent = predict_intent(user_input)

    response = get_response(predicted_intent)

    return jsonify({
        'intent': predicted_intent,
        'response': response
    })

if __name__ == '__main__':
    app.run(debug=True)
