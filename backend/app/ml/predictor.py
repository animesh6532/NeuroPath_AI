import joblib
import os

BASE_DIR = os.path.dirname(__file__)

model = joblib.load(os.path.join(BASE_DIR, "models/resume_classifier.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "models/tfidf_vectorizer.pkl"))


def predict_career(text):

    vector = vectorizer.transform([text])

    prediction = model.predict(vector)

    return prediction[0]
