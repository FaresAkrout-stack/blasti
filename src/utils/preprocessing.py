import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

# Initialize stopwords and lemmatizer
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    """
    Clean input text by converting to lowercase, removing special characters,
    removing stop words, and lemmatizing the words.
    """
    text = text.lower()  # Lowercase the text
    text = re.sub(r'\W+', ' ', text)  # Remove special characters
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]  # Lemmatization and stop word removal
    return " ".join(words)

def tokenize_text(text):
    """
    Tokenizes the input text and removes stopwords.
    """
    # Tokenize the text
    tokens = word_tokenize(text)
    # Remove stopwords
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return tokens

def identity_tokenizer(text):
    """
    A dummy tokenizer that returns the input text as-is.
    This is used for custom tokenization in the vectorizer.
    """
    return text.split()  # Tokenize by space for simple tokenization

def vectorize_text(corpus):
    """
    Vectorizes the input corpus using TF-IDF and custom tokenization.
    """
    vectorizer = TfidfVectorizer(tokenizer=tokenize_text)
    X = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()
    return X, feature_names  # Return both X and feature names as a tuple
