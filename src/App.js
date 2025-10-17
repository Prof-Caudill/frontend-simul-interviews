import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [studentName, setStudentName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Environment variable for backend
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Load available personas
  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => setPersonas(data.available_personas || []))
      .catch((err) => console.error("Error fetching personas:", err));
  }, [API_BASE_URL]);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle sending messages
  const sendMessage = async () => {
    if (!message || !persona) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          persona,
          student_name: studentName,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error:", err);
      alert("There was a problem connecting to the simulation.");
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  // === First screen: student name entry ===
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
            onKeyDown={(e) => e.key === "Enter" && studentName && setNameSubmitted(true)}
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
        Select a client and begin your conversation. Evidence-based interviewing techinques will produce better quality results.
      </p>

      <select
        onChange={(e) => setPersona(e.target.value)}
        value={persona}
        className="persona-select"
      >
        <option value="">Select Persona</option>
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
          disabled={!persona || loading}
        />
        <button onClick={sendMessage} disabled={!message || loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
