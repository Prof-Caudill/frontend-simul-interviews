import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [sessionId] = useState(uuidv4());
  const chatEndRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    setLoadingPersonas(true);
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setPersonas(data.available_personas || []);
        setLoadingPersonas(false);
      })
      .catch((err) => {
        console.error("Error fetching personas:", err);
        setBackendError(true);
        setLoadingPersonas(false);
      });
  }, [API_BASE_URL]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona || !studentName || backendError) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, persona, studentName, sessionId }),
      });
      const data = await response.json();
      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message, timestamp: new Date() },
        { sender: "bot", text: data.response || "⚠️ No response from backend.", timestamp: new Date() },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setChatHistory([
        ...chatHistory,
        { sender: "system", text: "🤖 Backend not responding. Try again later.", timestamp: new Date() }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const isSendDisabled = !message || !persona || !studentName || loadingPersonas || backendError;

  return (
    <div className="chat-container">
      <h2>Simulated Interview Chat</h2>

      <div className="instructions">
        <p>Welcome! Enter your name, select a persona, and start the interview.</p>
        <p>Use trauma-informed and professional interviewing techniques.</p>
      </div>

      {backendError && (
        <div className="error-fallback">
          ⚠️ Backend unavailable. Please refresh later.
        </div>
      )}

      <div className="student-name">
        <label htmlFor="studentName">Your Name:</label>
        <input
          id="studentName"
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter your name"
          disabled={loadingPersonas || backendError}
        />
      </div>

      <select
        onChange={(e) => setPersona(e.target.value)}
        value={persona}
        disabled={loadingPersonas || backendError}
      >
        <option value="">
          {loadingPersonas ? "Loading personas..." : "Select Persona"}
        </option>
        {personas.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <div className="chat-history">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <span className="timestamp">[{msg.timestamp.toLocaleTimeString()}]</span>{" "}
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <input
        type="text"
        value={message}
        placeholder="Type your message..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={backendError}
      />
      <button onClick={sendMessage} disabled={isSendDisabled}>Send</button>
    </div>
  );
}

export default App;
