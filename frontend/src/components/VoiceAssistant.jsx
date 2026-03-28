import { useEffect } from "react";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function VoiceInterview({ question, onAnswer }) {

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const answer = event.results[0][0].transcript;
      onAnswer(answer);
    };

    recognition.onerror = (err) => {
      console.error(err);
      alert("Mic error. Please allow microphone.");
    };

    recognition.start();
  };

  useEffect(() => {
    if (question) speak(question);
  }, [question]);

  return (
    <button onClick={startListening}>
      🎤 Speak Answer
    </button>
  );
}

export default VoiceInterview;