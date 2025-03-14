import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer


nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')


stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    """
    Clean input text by converting to lowercase, removing special characters,
    removing stop words, and lemmatizing the words.
    """
    text = text.lower()  
    text = re.sub(r'\W+', ' ', text)  
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words] 
    return " ".join(words)

def tokenize_text(text):
    """
    Tokenizes the input text and removes stopwords.
    """
  
    tokens = word_tokenize(text)
    
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return tokens

def identity_tokenizer(text):
    """
    A dummy tokenizer that returns the input text as-is.
    This is used for custom tokenization in the vectorizer.
    """
    return text.split() 

def vectorize_text(corpus):
    """
    Vectorizes the input corpus using TF-IDF and custom tokenization.
    """
    vectorizer = TfidfVectorizer(tokenizer=tokenize_text)
    X = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()
    return X, feature_names  
