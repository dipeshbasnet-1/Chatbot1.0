// App.jsx — now with a sidebar showing past conversations (like Claude/ChatGPT)

import { useState, useRef, useEffect } from 'react';
import './ChatPage.css';

const API_BASE = 'http://localhost:5001/api/chat';

// Get an existing sessionId from localStorage, or create + save a new one.
// This is what makes the current conversation survive a page refresh.
function getOrCreateSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sessionId', id);
  }
  return id;
}

function ChatPage() {
  const [sessionId, setSessionId] = useState(getOrCreateSessionId());
  const [sessions, setSessions] = useState([]);       // sidebar list
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hey — I'm here. What's on your mind?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch the sidebar list once when the app first loads
  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Could not load sessions:', err);
    }
  }

  // Load a past conversation's full messages when clicked in the sidebar
  async function loadSession(id) {
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`);
      const data = await res.json();
      setMessages(data.messages);
      setSessionId(id);
      localStorage.setItem('sessionId', id);
    } catch (err) {
      console.error('Could not load conversation:', err);
    }
  }

  async function deleteSession(id, e) {
  e.stopPropagation(); // prevent this click from also triggering loadSession() on the parent button

  const confirmed = window.confirm('Delete this conversation? This cannot be undone.');
  if (!confirmed) return;

  try {
    await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });

    // If we just deleted the conversation we're currently viewing, start fresh
    if (id === sessionId) {
      startNewChat();
    }

    fetchSessions(); // refresh the sidebar list
  } catch (err) {
    console.error('Could not delete conversation:', err);
  }
}

  // Start a fresh conversation
  function startNewChat() {
    const newId = crypto.randomUUID();
    localStorage.setItem('sessionId', newId);
    setSessionId(newId);
    setMessages([{ sender: 'bot', text: "Hey — I'm here. What's on your mind?" }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      fetchSessions(); // refresh sidebar — this message may have created a new conversation, or bumped an existing one to the top

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry, I couldn't reach the server. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="app-shell">

        {/* ---------- Sidebar ---------- */}
        <aside className="sidebar">
          <button className="new-chat-btn" onClick={startNewChat}>
            + New Chat
          </button>
          <div className="session-list">
            {sessions.map((s) => (
              <div
    key={s.sessionId}
    className={`session-item ${s.sessionId === sessionId ? 'active' : ''}`}
    onClick={() => loadSession(s.sessionId)}
  >
    <span className="session-title">{s.title}</span>
    <button
      className="delete-btn"
      onClick={(e) => deleteSession(s.sessionId, e)}
      aria-label="Delete conversation"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  </div>
))}
          </div>
        </aside>

        {/* ---------- Chat ---------- */}
        <div className="chat-card">
          <header className="chat-header">
            <div className={`orb ${loading ? 'orb-thinking' : ''}`} />
            <div className="header-text">
              <h1>Chatbot</h1>
              <span className="status">
                <span className="status-dot" /> Online · by Dipesh
              </span>
            </div>
          </header>

          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                {msg.sender === 'bot' && <div className="mini-orb" />}
                <div className={`bubble ${msg.sender}`}>{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="message-row bot">
                <div className="mini-orb mini-orb-active" />
                <div className="bubble bot typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message the chatbot…"
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12L20 4L13 20L11 13L4 12Z" fill="currentColor" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;