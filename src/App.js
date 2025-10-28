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

  // Backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Fetch available personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPersonas(data.available_personas || []);
      } catch (err) {
        console.error("Error fetching personas:", err);
        setPersonas([]);
      }
    };

    fetchPersonas();
  }, [API_BASE_URL]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona || !studentName) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          persona_name: persona,
          user_input: message,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Error sending message");
      }

      const data = await response.json();

      setChatHistory((prev) => [
        ...prev,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("There was a problem connecting to the simulation.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  // === Name entry screen ===
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
              e.key === "Enter" && studentName.trim() && setNameSubmitted(true)
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
        Select a client and begin your conversation. The use of
        evidence-based interview practices should produce more useful
        information.
      </p>

      <select
        onChange={(e) => setPersona(e.target.value)}
        value={persona}
        className="persona-select"
      >
        <option value="">Select Persona</option>
        {personas.length > 0 ? (
          personas.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))
        ) : (
          <option disabled>Loading personas...</option>
        )}
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
