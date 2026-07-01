import speech_recognition as sr

def listen():

    r = sr.Recognizer()

    with sr.Microphone() as source:
        print("🎤 Speak...")
        audio = r.listen(source)

    try:
        return r.recognize_google(audio)
    except:
        return ""
