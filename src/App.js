import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [downloadSecret, setDownloadSecret] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const chatEndRef = useRef(null);

  // Use environment variable for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Load personas from backend
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => setPersonas(data.available_personas || []))
      .catch((err) => console.error("Error fetching personas:", err));
  }, [API_BASE_URL]);

  useEffect(() => {
    // Auto-scroll to latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona || !studentName) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, persona, student_name: studentName }),
      });
      const data = await response.json();

      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const downloadLogs = async () => {
    if (!downloadSecret) {
      setDownloadMessage("Please enter the secret key to download logs.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/download-logs?secret=${downloadSecret}`);
      if (!res.ok) throw new Error("Failed to fetch logs.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_logs.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadMessage("Logs downloaded successfully.");
    } catch (err) {
      console.error(err);
      setDownloadMessage("Failed to download logs. Check secret key.");
    }
  };

  return (
    <div className="chat-container">
      <h2>Simulated Interview Chat</h2>

      <div className="student-input">
        <label>Enter your name:</label>
        <input
          type="text"
          value={studentName}
          placeholder="Student Name"
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>

      <select onChange={(e) => setPersona(e.target.value)} value={persona}>
        <option value="">Select Persona</option>
        {personas.map((p) => (
          <option key={p} value={p}>{p}</option>
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

      <input
        type="text"
        value={message}
        placeholder="Type your message..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button onClick={sendMessage}>Send</button>

      <hr />
      <div className="instructor-download">
        <h3>Instructor: Download Student Logs</h3>
        <input
          type="password"
          placeholder="Enter secret key"
          value={downloadSecret}
          onChange={(e) => setDownloadSecret(e.target.value)}
        />
        <button onClick={downloadLogs}>Download Logs</button>
        <p>{downloadMessage}</p>
      </div>
    </div>
  );
}

export default App;
