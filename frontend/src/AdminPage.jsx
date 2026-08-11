// AdminPage.jsx — password-protected dashboard showing chatbot usage stats.

import { useState } from 'react';
import './AdminPage.css';

const API_BASE = 'https://chatbot1-0-698h.onrender.com/api/admin';

function AdminPage() {
    const [password, setPassword] = useState('');
    const [authed, setAuthed] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'x-admin-password': password },
            });

            if (!res.ok) {
                setError('Incorrect password.');
                return;
            }

            setAuthed(true);
            fetchStats();

        } catch (err) {
            setError('Could not reach the server.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchStats() {
        try {
            const res = await fetch(`${API_BASE}/stats`, {
                headers: { 'x-admin-password': password },
            });
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Could not load stats:', err);
        }
    }


    // ---------- Login screen ----------

    if (!authed) {

        return (
        <div className="admin-page">
        <form className="login-card" onSubmit={handleLogin}>
            <h1>Admin Access</h1>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Enter'}
        </button>
        </form>
    </div>
    );
}

  // ---------- Dashboard ----------
    return (
    <div className="admin-page">
        <div className="dashboard">
        <h1>Dashboard</h1>

        {!stats ? (
            <p>Loading stats…</p>
        ) : (
            <div className="stats-grid">
            <div className="stat-card">
                <span className="stat-value">{stats.totalConversations}</span>
                <span className="stat-label">Total Conversations</span>
            </div>
            <div className="stat-card">
                <span className="stat-value">{stats.totalMessages}</span>
                <span className="stat-label">Total Messages</span>
            </div>
            <div className="stat-card">
                <span className="stat-value">{stats.messagesLast24h}</span>
                <span className="stat-label">Messages (Last 24h)</span>
            </div>
            </div>
        )}

        <a href="/" className="back-link">← Back to chat</a>
        </div>
    </div>
);
}

export default AdminPage;