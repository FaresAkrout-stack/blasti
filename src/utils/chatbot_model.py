import yaml
import os
import random
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import pickle
from preprocessing import clean_text, tokenize_text, vectorize_text


def get_response(intent, confidence):
    if confidence < 0.5:  
        return "Sorry, I don't understand that."
    if intent in responses:
        response_list = responses[intent]
        return random.choice(response_list)
    else:
        return "Sorry, I don't understand that."


yaml_files = [
    r"C:\Users\21693\Desktop\blasti\backend\src\data\greetings.yaml",
    r"C:\Users\21693\Desktop\blasti\backend\src\data\emotions.yaml",
    r"C:\Users\21693\Desktop\blasti\backend\src\data\politics.yaml",
    r"C:\Users\21693\Desktop\blasti\backend\src\data\conversations.yaml",
]


corpus = []
labels = []
responses = {}


for file_path in yaml_files:
  
    if not os.path.exists(file_path):
        print(f"Error: The file '{file_path}' was not found.")
        continue


    try:
        with open(file_path, 'r') as file:
            data = yaml.safe_load(file)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML file {file_path}: {e}")
        continue

 
    category = os.path.basename(file_path).split('.')[0] 
    print(f"Processing category: {category}")

  
    conversations = data.get('conversations', [])
    if not conversations:
        print(f"Error: No conversations found in the YAML file {file_path}.")
        continue

   
    for conv in conversations:
       
        if isinstance(conv, list) and len(conv) == 2:
            input_text, response_text = conv
            corpus.append(input_text)
            labels.append(category)
            if category not in responses:
                responses[category] = []
            responses[category].append(response_text)  
        else:
            print(f"Skipping invalid conversation in {file_path}: {conv}")

print(f"Corpus length: {len(corpus)}")
print(f"Labels length: {len(labels)}")


if len(corpus) != len(labels):
    print("Error: Corpus and labels have different lengths.")
else:

    corpus_cleaned = [clean_text(text) for text in corpus]
    print(f"Cleaned Corpus: {corpus_cleaned[:5]}") 

    X = vectorize_text(corpus_cleaned)  
    
    
    if isinstance(X, tuple):
        X = X[0]  

    print(f"Vectorized X shape: {X.shape}")  

    y = labels


    print(f"X length: {X.shape[0]}")  
    print(f"y length: {len(y)}")

    if X.shape[0] == len(y):
      
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

   
        model = MultinomialNB()
        model.fit(X_train, y_train)

     
        y_pred = model.predict(X_test)
        print(classification_report(y_test, y_pred))
        print(confusion_matrix(y_test, y_pred))

   
        with open('chatbot_model.pkl', 'wb') as model_file:
            pickle.dump(model, model_file)

      
        with open('responses.pkl', 'wb') as responses_file:
            pickle.dump(responses, responses_file)
    else:
        print("Error: The vectorized data (X) and labels (y) have mismatched lengths.")
