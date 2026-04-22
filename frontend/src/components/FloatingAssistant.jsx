import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { assistantAPI } from "../api/assistantApi";
import "../styles/floatingAssistant.css";

// --- Sub-components for cleaner structure ---

const AI_AVATAR = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);

const PLAY_ICON = (
  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);

const MUTE_ICON = (
  <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
);

const UNMUTE_ICON = (
  <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
);

const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

const SpeakingIndicator = () => (
  <div className="speaking-waves">
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
    <div className="wave"></div>
  </div>
);

const SuggestionChips = ({ onSelect }) => {
  const suggestions = [
    "What is this project about?",
    "Explain the architecture",
    "How does the AI Interview work?",
    "What is the tech stack?",
    "What are future enhancements?",
    "How to debug issues?",
    "How should I explain this in a viva?"
  ];

  return (
    <div className="suggestion-chips">
      {suggestions.map((text, i) => (
        <div key={i} className="chip" onClick={() => onSelect(text)}>
          {text}
        </div>
      ))}
    </div>
  );
};

// --- Main component ---

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatBodyRef = useRef(null);
  const location = useLocation();

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("assistant_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    } else {
      // Intro message
      setMessages([{
        sender: "bot",
        text: "Hi! I am the NeuroPath AI Copilot. Ask me anything about the project's architecture, APIs, or how to explain it in a viva."
      }]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("assistant_chat_history", JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const speakText = (text) => {
    if (isMuted) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good female/professional AI voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.includes("en-") && (v.name.includes("Google") || v.name.includes("Female")));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }
    
    utterance.rate = 1.05; // Slightly faster for natural flow
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleSendMessage = async (textOveride = null) => {
    const text = textOveride || inputText;
    if (!text.trim()) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const userMsg = { sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const data = await assistantAPI.chat(text, location.pathname, "project_assistant");
      const botMsg = { sender: "bot", text: data.answer };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      speakText(botMsg.text);
      
    } catch (err) {
      setIsTyping(false);
      const errorMsg = { sender: "bot", text: "I'm having trouble connecting to my knowledge base." };
      setMessages(prev => [...prev, errorMsg]);
      speakText(errorMsg.text);
    }
  };

  const clearChat = () => {
    localStorage.removeItem("assistant_chat_history");
    const introMsg = { sender: "bot", text: "Chat cleared. What can I help you with?" };
    setMessages([introMsg]);
    speakText(introMsg.text);
  };

  return (
    <div className="floating-assistant-container">
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="header-left">
              <div className="ai-avatar">{AI_AVATAR}</div>
              <div className="chat-title">
                <h3>NeuroPath Copilot</h3>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p>{isSpeaking ? "Speaking..." : "Online"}</p>
                  {isSpeaking && <SpeakingIndicator />}
                </div>
              </div>
            </div>
            
            <div className="header-controls">
              <button 
                title={isMuted ? "Unmute" : "Mute"} 
                className={`icon-btn ${isMuted ? "active" : ""}`} 
                onClick={toggleMute}
              >
                {isMuted ? MUTE_ICON : UNMUTE_ICON}
              </button>
              <button 
                title="Clear Chat"
                className="icon-btn" 
                onClick={clearChat}
              >
                <svg viewBox="0 0 24 24"><path d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z"/></svg>
              </button>
              <button 
                title="Close"
                className="icon-btn" 
                onClick={() => setIsOpen(false)}
              >
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
                {msg.sender === "bot" && (
                  <div className="message-actions">
                    <button 
                      className="action-btn" 
                      title="Replay Answer"
                      onClick={() => speakText(msg.text)}
                    >
                      {PLAY_ICON} Replay
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Chips */}
          <SuggestionChips onSelect={(text) => handleSendMessage(text)} />

          {/* Input Area */}
          <div className="chat-footer">
            <input 
              type="text" 
              className="chat-input"
              placeholder="Ask about the project..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button 
              className="send-btn" 
              onClick={() => handleSendMessage()} 
              disabled={!inputText.trim()}
            >
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <div 
          className="assistant-toggle-btn" 
          onClick={() => setIsOpen(true)}
          title="Ask NeuroPath Copilot"
        >
          {AI_AVATAR}
        </div>
      )}
    </div>
  );
};

export default FloatingAssistant;
