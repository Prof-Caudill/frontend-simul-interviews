import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [studentName, setStudentName] = useState("");
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // ✅ Use environment variable for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // 🔹 Fetch personas from backend
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`);
        if (!res.ok) throw new Error("Failed to fetch personas");
        const data = await res.json();
        setPersonas(data.available_personas || []);
      } catch (err) {
        setError("Error loading personas. Please try again later.");
        console.error("Error fetching personas:", err);
      } finally {
        setLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, [API_BASE_URL]);

  // 🔹 Scroll chat to bottom on update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // 🔹 Send message to backend
  const sendMessage = async () => {
    if (!studentName.trim()) {
      setError("Please enter your name before starting.");
      return;
    }
    if (!persona) {
      setError("Please select a persona.");
      return;
    }
    if (!message.trim()) return;

    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, persona, student_name: studentName }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      setChatHistory((prev) => [
        ...prev,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);

      setMessage("");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <h2>Simulated Interview Practice</h2>
      <p className="instructions">
        Welcome! Please enter your name, select a persona, and begin your simulated interview. 
        Your conversation will be logged for review and feedback.
      </p>

      {/* 🔹 Name Input */}
      <input
        type="text"
        placeholder="Enter your name..."
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        className="name-input"
      />

      {/* 🔹 Persona Dropdown */}
      {loadingPersonas ? (
        <p>Loading personas...</p>
      ) : (
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
      )}

      {/* 🔹 Chat History */}
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 🔹 Message Input */}
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        className="message-input"
      />
      <button onClick={sendMessage}>Send</button>

      {/* 🔹 Error Display */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;
