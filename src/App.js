import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [studentName, setStudentName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const chatEndRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fetch available personas
  useEffect(() => {
    const fetchPersonas = async () => {
      setLoadingPersonas(true);
      try {
        const res = await fetch(`${API_BASE_URL}/`);
        const data = await res.json();
        setPersonas(data.available_personas || []);
      } catch (err) {
        console.error("Error fetching personas:", err);
        alert("Failed to load personas. Check backend connection.");
      } finally {
        setLoadingPersonas(false);
      }
    };
    fetchPersonas();
  }, [API_BASE_URL]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona) return;
    setLoadingMessage(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          persona,
          student_name: studentName,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error:", err);
      alert("There was a problem sending your message.");
    } finally {
      setLoadingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loadingMessage) sendMessage();
  };

  // === Student name entry screen ===
  if (!nameSubmitted) {
    return (
      <div className="name-entry-container">
        <div className="name-entry-card">
          <h2>Welcome to the Simulated Interview</h2>
          <p>Please enter your name to begin.</p>
          <input
            type="text"
            placeholder="Your full name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && studentName && setNameSubmitted(true)
            }
          />
          <button
            onClick={() => setNameSubmitted(true)}
            disabled={!studentName.trim()}
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // === Main chat interface ===
  return (
    <div className="chat-container">
      <h2>Simulated Interview Chat</h2>
      <p className="instructions">
        Select a client and begin your conversation. The use of evidence-based
        interview practices should produce more useful information.
      </p>

      <select
        onChange={(e) => setPersona(e.target.value)}
        value={persona}
        className="persona-select"
      >
        <option value="">
          {loadingPersonas ? "Loading personas..." : "Select Persona"}
        </option>
        {personas.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!persona || loadingMessage}
        />
        <button onClick={sendMessage} disabled={!message || loadingMessage}>
          {loadingMessage ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
